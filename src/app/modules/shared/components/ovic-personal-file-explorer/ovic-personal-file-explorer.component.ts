import {Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {OvicDriveFile, OvicFile, OvicFileStore, OvicFileUpload, OvicTree} from '@core/models/file';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthService} from '@core/services/auth.service';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {APP_CONFIGS} from '@env';
import {FileService} from '@core/services/file.service';
import {NotificationService} from '@core/services/notification.service';
import {UserService} from '@core/services/user.service';
import {MediaService} from '@shared/services/media.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, filter, finalize, map, mergeMap, switchMap, take} from 'rxjs/operators';
import {TemplatePortal} from '@angular/cdk/portal';
import {DownloadProcess} from '../ovic-download-progress/ovic-download-progress.component';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {UserMeta} from '@core/models/user';

interface GoogleDriverBreadcrumb {
  id: string;
  label: string;
  parents: string;
}

enum RightContextMenuFunction {
  preview = 1,
  link = 2,
  detail = 3,
  download = 4,
  public = 5,
  share = 6,
  private = 7,
  delete = 8
}

interface ButtonLabel {
  save: string;
  cancel: string;
}

interface SearchInfo {
  title: string;
  url: string;
  parents: string;
  timeMin: string;
  timeMax: string;
  limit: number;
}

@Component({
  selector: 'ovic-personal-file-explorer',
  templateUrl: './ovic-personal-file-explorer.component.html',
  styleUrls: ['./ovic-personal-file-explorer.component.css'],
  animations: [
    trigger('openSubmenu', [
      state('opened', style({'transform': 'scaleY(1)', 'visibility': 'visible', 'opacity': '1'})),
      state('closed', style({'transform': 'scaleY(0)', 'visibility': 'hidden', 'opacity': '0', 'height': '0'})),
      transition('opened<=>closed', animate('350ms 0s ease-in-out'))
    ])
  ]
})
export class OvicPersonalFileExplorerComponent implements OnInit, OnDestroy {

  @Input() gridMode = false;

  @Input() multipleMode = true;

  @Input() files: OvicFileStore[] = [];

  @Input() storeLabel: string[];

  @Input() acceptFileType: string[]; // filter file by file's extension. Eg: ['pdf','doc','docx','ppt','pptx']

  @Input() buttonLabels: ButtonLabel;

  @Input() useContentMenuOnMobile: boolean;

  @Input() canDelete = true;

  @Input() newPreviewer = false;

  @Input() driveFolder: string;

  @Input() state = 0;

  // library : OvicFile[] | OvicDriveFile[] = [];
  library: any[];

  googleCloudFiles: OvicDriveFile[];

  uploadingFiles: OvicFileUpload[] = [];

  selectedFiles: any[];

  selectedFileIds: Set<string | number>;

  menuSelected: string;

  directories: OvicTree[];

  rootFolder: string;

  breadcrumb: OvicTree[];

  gdBreadcrumb: GoogleDriverBreadcrumb[];

  searchInfo: SearchInfo = {title: '', url: '', parents: '', limit: 1000, timeMin: null, timeMax: null};

  directoriesLoading = false;

  fileLoading = false;

  showClearSearch = false;

  form: FormGroup;

  reloadingData = null;

  acceptList = new Set(APP_CONFIGS.acceptList);

  server = 'googleDrive'; // serverFile | googleDrive

  fileChooser: File | null = null;

  @ViewChild('userMenu') userMenu: TemplateRef<any>;

  @ViewChild('fileChooser') inputFileChooser: ElementRef<HTMLInputElement>;

  overlayRef: OverlayRef | null;

  subscription: Subscription;

  subMenuOpenLeft = false;

  contextMenuFunction = RightContextMenuFunction;

  _fileRunning: OvicFile | OvicDriveFile;

  errorMaxFileUploading = false;

  maxUploadingFiles = APP_CONFIGS.maxFileUploading;

  _f_id = 100;

  userId: number;

  btnLoadMore = '';

  metaKeyStore = APP_CONFIGS.metaKeyStore;

  emptyStore = false;

  isCreatingStore = false;

  createdStoreMessage = false;

  mobileMenuOpened = false;

  userTouched = false;

  saveButton: string;

  cancelButton: string;

  constructor(
    public fileService: FileService,
    private notificationService: NotificationService,
    private mediaService: MediaService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private overlay: Overlay,
    private auth: AuthService,
    private userService: UserService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.menuSelected = null;
    this.directories = [];
    this.uploadingFiles = [];
    this.library = [];
    this.selectedFiles = [];
    this.googleCloudFiles = [];
    this.selectedFileIds = new Set();
    this.gdBreadcrumb = [{id: '0', label: 'Google Driver', parents: ''}];
    this.form = this.fb.group({search: ['']});
  }

  ngOnInit(): void {
    this.form.get('search').valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(searchText => {
        this.showClearSearch = searchText !== null && searchText !== '';
        this.searchInfo.title = searchText;
        this.selectedFiles = [];
        this.library = [];
        this.selectedFileIds.clear();
        return this.getData(this.server, this.searchInfo);
      })
    ).subscribe({
      next: library => this.library = library,
      error: () => this.notificationService.toastError('Không load được data')
    });
    this.storeLabel = this.storeLabel || APP_CONFIGS.storeLabels;
    this.saveButton = this.buttonLabels?.save ? this.buttonLabels.save : '<i class="fa fa-floppy-o" aria-hidden="true"></i>Lưu và đóng';
    this.cancelButton = this.buttonLabels?.cancel ? this.buttonLabels.cancel : '<i class="fa fa-times" aria-hidden="true"></i>Thoát';
    void this.init();
  }

  ngOnDestroy(): void {
    this.closeContextMenu();
  }

  /*******************************************************
   * changeView
   * *****************************************************/
  changeView(status: boolean) {
    this.gridMode = status;
  }

  async init() {
    this.createdStoreMessage = false;
    this.userId = this.auth.user.id;
    this.rootFolder = await this.getRootFolder(this.auth.userMeta);
    if (this.rootFolder) {
      this.emptyStore = false;
      this.directories = [{label: 'Thư mục của tôi', slug: this.rootFolder, isOpen: false, children: []}];
      this.activeMenu(this.directories[0], false);
    } else {
      this.emptyStore = true;
    }
  }

  getRootFolder(userMeta: UserMeta[]): Promise<string> {
    const meta = Array.isArray(userMeta) ? userMeta.find(l => l.meta_key === this.metaKeyStore) : null;
    if (meta && meta.meta_value) {
      return Promise.resolve(meta.meta_value);
    } else {
      const meta = this.auth.getOption(this.metaKeyStore);
      return Promise.resolve(meta || '');
    }
  }

  /*******************************************************
   * activeMenu
   * *****************************************************/
  activeMenu(menu: OvicTree, toggleMenu: boolean) {
    menu.isOpen = toggleMenu ? !menu.isOpen : menu.isOpen;
    if (this.menuSelected && this.menuSelected === menu.slug) {
      return;
    }
    this.menuSelected = menu.slug;
    this.searchInfo.url = menu.slug !== 'all' ? menu.slug : '';
    this.breadcrumb = this.breadcrumbMaker(this.searchInfo.url);
    // this.searchInfo.parents = '';
    this.loadData();
  }

  /*******************************************************
   * createMenu
   * *****************************************************/
  createMenu(startDate: string, endDate: string): OvicTree[] {
    const startArr = startDate.split('/').map(e => parseInt(e, 10));
    const endArr = endDate.split('/').map(e => parseInt(e, 10));
    const monthStart = startArr[0];
    const monthEnd = endArr[0];
    const yearStart = startArr[1];
    const yearEnd = endArr[1];
    const result: OvicTree[] = [];
    if (yearEnd > yearStart) {
      result.push(this.createMenuElement(yearStart, monthStart, 12));
      if (yearEnd > yearStart + 1) {
        for (let year = yearStart + 1; year <= yearEnd - 1; year++) {
          result.push(this.createMenuElement(year, 1, 12));
        }
      }
      result.push(this.createMenuElement(yearEnd, 1, monthEnd));
    } else if (yearEnd === yearStart) {
      result.push(this.createMenuElement(yearEnd, monthStart, monthEnd));
    }
    return result;
  }

  /*******************************************************
   * createMenuElement
   * *****************************************************/
  createMenuElement(year: number, monthStart = 1, monthEnd = 12): OvicTree {
    const yearTxt = year.toString();
    const result: OvicTree = {slug: yearTxt, label: yearTxt, isOpen: false, children: []};
    if (!(monthStart < monthEnd)) {
      const monthTxt = monthStart < 10 ? ''.concat('0', monthStart.toString()) : monthStart.toString();
      result.children.push({slug: ''.concat(yearTxt, '/', monthTxt), label: monthTxt, isOpen: false, children: []});
    } else {
      for (let month = monthStart; month <= monthEnd; month++) {
        const monthTxt = month < 10 ? ''.concat('0', month.toString()) : month.toString();
        result.children.push({slug: ''.concat(yearTxt, '/', monthTxt), label: monthTxt, isOpen: false, children: []});
      }
    }
    return result;
  }

  /*******************************************************
   * evtActiveMenu
   * *****************************************************/
  evtActiveMenu(event: MouseEvent, menu: OvicTree, toggleMenu: boolean = true) {
    event.preventDefault();
    event.stopPropagation();
    this.activeMenu(menu, toggleMenu);
  }

  /*******************************************************
   * Breadcrumb maker
   * *****************************************************/
  breadcrumbMaker(slug: string): OvicTree[] {
    const result = [];
    const arr = slug && slug !== '' ? slug.split('/') : [];
    if (arr.length) {
      const parent = this.directories.find(m => m.slug === arr[0]);
      result.push(parent);
      if (arr[1]) {
        result.push(parent.children.find(m => m.slug === slug));
      }
    }
    return result;
  }

  /*******************************************************
   * Get data
   * load data from a dir
   * *****************************************************/
  private getData(serverName: string, search): Observable<OvicFile[] | OvicDriveFile[]> {
    this.fileLoading = true;
    this.btnLoadMore = null;
    if (serverName === 'googleDrive') {
      const searchInfo = {s: this.searchInfo.title};
      ['parents', 'limit', 'timeMin', 'timeMax'].forEach(key => {
        if (this.searchInfo[key]) {
          searchInfo[key] = this.searchInfo[key];
        }
      });
      return this.fileService.gdSearch(searchInfo).pipe(
        map(res => {
          this.btnLoadMore = res.hasOwnProperty('next') ? res.next : null;
          return this.presetFileGoogleDrive(res.data);
        }),
        finalize(() => this.fileLoading = false)
      );
    } else {
      return this.fileService.getFileList(search).pipe(
        map(data => {
          if (data.length) {
            data.map(f => {
              f['upload_at'] = this.fileService.getUploadDate(f);
              f['file_size'] = this.fileService.getFileSize(f);
            });
          }
          return data;
        }),
        finalize(() => this.fileLoading = false)
      );
    }
  }

  presetFileGoogleDrive(files: OvicDriveFile[]): OvicDriveFile[] {
    const _filtered = files && files.length ? files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder') : [];
    if (_filtered.length) {
      _filtered.map(file => {
        file['title'] = file.name;
        file['upload_at'] = this.fileService.getUploadDate(file);
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          file['file_size'] = '';
          file['is_folder'] = true;
        } else {
          file['file_size'] = this.fileService.getFileSize(file);
          file['is_folder'] = false;
        }
        return file;
      });
    }
    return _filtered;
  }

  /*******************************************************
   * Load data ( main method )
   * *****************************************************/
  loadData() {
    this.closeContextMenu();
    this.selectedFiles = [];
    this.library = [];
    this.selectedFileIds.clear();
    this.fileLoading = true;
    if (this.server === 'googleDrive') {
      this.searchInfo.parents = this.rootFolder;
    }
    let getData$: Observable<OvicFile[] | OvicDriveFile[]> = this.getData(this.server, this.searchInfo);
    if (this.acceptFileType && this.acceptFileType.length) {
      getData$ = getData$.pipe(
        map(res => {
          const result = [];
          for (let i = 0; i < res.length; i++) {
            if ((res[i]['fileExtension'] && this.acceptFileType.includes(res[i]['fileExtension'])) || (res[i]['ext'] && this.acceptFileType.includes(res[i]['ext']))) {
              result.push(res[i]);
            }
          }
          return result;

        })
      );
    }
    getData$.subscribe({
      next: files => this.library = files,
      error: () => this.notificationService.toastError('Không tải được files')
    });
  }

  /*******************************************************
   * Load more elements works on google driver mode
   * *****************************************************/
  loadMoreContent(next: string) {
    this.fileLoading = true;
    this.fileService.gdLoadMore(next).subscribe({
      next: res => {
        this.library = [].concat(this.library, this.presetFileGoogleDrive(res.data));
        this.btnLoadMore = res.hasOwnProperty('next') ? res.next : null;
        this.fileLoading = false;
      },
      error: () => this.fileLoading = false
    });
  }

  /*******************************************************
   * reloadData
   * *****************************************************/
  reloadData(time: number = 300) {
    clearTimeout(this.reloadingData);
    this.reloadingData = setTimeout(() => this.loadData(), time);
  }

  /*******************************************************
   * removeFileFromList
   * *****************************************************/
  removeFileFromList(file: OvicFile | OvicDriveFile) {
    this.selectedFiles = this.selectedFiles.filter(f => f.id !== file.id);
    if (this.selectedFileIds.has(file.id)) {
      this.selectedFileIds.delete(file.id);
    }
  }

  /*******************************************************
   * addFileToList
   * *****************************************************/
  private addFileToList(file: OvicFile | OvicDriveFile) {
    if (!this.multipleMode) {
      this.selectedFileIds.clear();
      this.selectedFiles = [];
    }
    this.selectedFiles.push(file);
    this.selectedFileIds.add(file.id);
  }

  /*******************************************************
   * selectFile
   * *****************************************************/
  selectFile(file: OvicFile | OvicDriveFile) {
    if (file.hasOwnProperty('mimeType') && file['mimeType'] === 'application/vnd.google-apps.folder') {
      return '';
    }
    return this.selectedFileIds.has(file.id) ? this.removeFileFromList(file) : this.addFileToList(file);
  }

  /*******************************************************
   * Open folder when the user double-click on folder
   * *****************************************************/

  validateOpenFolder(file: OvicDriveFile | OvicFile) {
    if (file.hasOwnProperty('mimeType') && file['mimeType'] === 'application/vnd.google-apps.folder') {
      this.openFolder(file as OvicDriveFile);
    }
  }

  openFolder(file: OvicDriveFile) {
    if (file.parents[0] && file.parents[0] !== this.gdBreadcrumb.slice(-1)[0].parents) {
      this.searchInfo.parents = file.parents[0];
      this.gdBreadcrumb.push({id: file.id, label: file.name, parents: file.parents[0]});
      this.loadData();
    } else {
      this.notificationService.toastInfo('Thư mục trống');
    }
  }

  /*******************************************************
   * Close panel and return the results
   * *****************************************************/
  closePanel(data: OvicFileStore[]) {
    this.activeModal.close(data);
  }

  /*******************************************************
   * Delete file not work now
   * *****************************************************/
  async deleteFile(file: OvicFile | OvicDriveFile = null) {
    if (!this.canDelete) {
      return;
      // return this.notificationService.toastWarning( 'Bạn không có quyền xóa file' );
    }
    if (file || this.selectedFileIds.size) {
      try {
        const confirm = await this.notificationService.confirmDelete();
        if (confirm) {
          const requires: Observable<any>[] = [];
          this.fileLoading = true;
          if (file) {
            const _request = typeof file.id === 'string' ? this.fileService.gdDeleteFile(file['id']) : this.fileService.deleteFile(file['id']);
            requires.push(_request);
          } else {
            if (this.server === 'serverFile') {
              const ids = Array.from(this.selectedFileIds).map(i => typeof i === 'string' ? parseInt(i, 10) : i);
              requires.push(this.fileService.deleteFiles(ids));
            } else {
              this.selectedFileIds.forEach(fileId => {
                requires.push(this.fileService.gdDeleteFile(typeof fileId !== 'string' ? fileId.toString() : fileId));
              });
            }
          }
          if (requires.length) {
            const max_request = requires.length;
            let result = 0;
            this.fileLoading = true;
            let fail = false;
            requires.forEach((request$, index) => setTimeout(() => request$.subscribe({
              next: () => {
                if (max_request === ++result) {
                  this.fileLoading = false;
                  if (fail) {
                    this.notificationService.toastSuccess('Thao tác thành công');
                  } else {
                    this.notificationService.toastSuccess('Xóa thành công');
                  }
                  this.reloadData();
                }
              },
              error: () => {
                fail = true;
                if (max_request === ++result) {
                  this.notificationService.toastSuccess('Thao tác thành công');
                  this.fileLoading = false;
                  this.reloadData();
                }
              }
            }), index * 50));
          }
        }
      } catch {
      }
    }
  }

  /*******************************************************
   * Check all list
   * *****************************************************/
  checkAllList() {
    if (!this.library || this.library.length < 1) {
      return;
    }
    if (this.selectedFileIds.size === this.library.length) {
      this.selectedFileIds.clear();
    } else {
      const ids = [];
      this.library.forEach(file => ids.push(file.id));
      this.selectedFileIds = new Set(ids);
    }
  }

  /*******************************************************
   * event clear all selected
   * *****************************************************/
  clearAllSelected(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.selectedFileIds.clear();
  }

  /*******************************************************
   * onFileInput functions
   * *****************************************************/
  async onFileInput($event, fileChooser: HTMLInputElement) {
    this.errorMaxFileUploading = false;
    this.uploadingFiles = [].concat(this.uploadingFiles, this.validateFiles($event));
    fileChooser.value = '';
    const validateFiles = this.uploadingFiles.filter(f => f.validate);
    if (validateFiles.length > this.maxUploadingFiles) {
      this.errorMaxFileUploading = true;
      setTimeout(() => this.uploadingFiles = [], 5000);
    } else {
      validateFiles.forEach((file, index) => {
        if (this.server === 'serverFile') {
          setTimeout(() => {
            this.fileService.uploadFileWidthProgress(file.file, this.state).subscribe({
              next: () => {
                file.uploaded = true;
                file.message = 'Upload thành công';
                setTimeout(() => this.removeFileFromUploadingList(null, file.id), 3000 + (index * 100));
                this.reloadData(1000);
              },
              error: () => {
                file.validate = false;
                file.message = 'Upload thất bại';
              }
            });
          }, 50 * index);
        } else {
          setTimeout(() => {
            this.fileService.googleDriveUploadFileToParents(file.file, this.rootFolder).subscribe({
              next: () => {
                file.uploaded = true;
                file.message = 'Upload thành công';
                setTimeout(() => this.removeFileFromUploadingList(null, file.id), 3000 + (index * 100));
                this.reloadData(1000);
              },
              error: () => {
                file.validate = false;
                file.message = 'Upload thất bại';
              }
            });
          }, 50 * index);
        }
      });
    }
  }

  /**************************************************
   * Validate files input
   * ************************************************/
  validateFiles(files: FileList): OvicFileUpload[] {
    const result: OvicFileUpload[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = {
        id: ++this._f_id,
        name: files[i].name,
        title: files[i].name,
        type: files[i].type,
        size: files[i].size,
        _size: this.fileService.formatBytes(files[i].size),
        uploaded: false,
        validate: true,
        message: '',
        file: files[i]
      };
      if (APP_CONFIGS.limitFileType) {
        const isFileRar = (file.type === '' && file.name.slice(file.name.lastIndexOf('.rar')) !== 'rar');
        if (!isFileRar && !this.acceptList.has(file.type)) {
          file.validate = false;
          file.message = 'Định dạng file chưa được hỗ trợ';
          setTimeout(() => this.removeFileFromUploadingList(null, file.id), 5000 + (i * 100));
        }
      }
      if (file.size > APP_CONFIGS.maxUploadSize) {
        file.validate = false;
        file.message = 'Dung lượng file vượt quá giới hạn';
        setTimeout(() => this.removeFileFromUploadingList(null, file.id), 5000 + (i * 100));
      }
      result.push(file);
    }
    return result;
  }

  /**************************************************
   * removeFileFromUploadingList ( remove file in uploading file list)
   * ************************************************/
  removeFileFromUploadingList(event: Event, fileId: number) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.uploadingFiles = this.uploadingFiles.filter(f => f.id !== fileId);
  }

  /**************************************************
   * gdGetFileContent
   * ************************************************/
  gdGetFileContent(event, item: GoogleDriverBreadcrumb) {
    event.preventDefault();
    event.stopPropagation();
    const pos = this.gdBreadcrumb.findIndex(i => i.id === item.id);
    this.gdBreadcrumb = this.gdBreadcrumb.slice(0, pos !== -1 ? pos + 1 : 1);
    this.clearSearch();
    this.searchInfo.parents = item.parents;
    this.loadData();
  }

  /**************************************************
   * changeSourceStore
   * ************************************************/
  changeSourceStore(server: string) {
    if (server !== this.server) {
      this.selectedFileIds.clear();
      this.server = server;
      this.clearSearch();
      this.loadData();
    }
  }

  /**************************************************
   * clearSearch
   * ************************************************/
  clearSearch() {
    this.searchInfo.title = '';
    this.searchInfo.parents = '';
    this.form.get('search').reset('');
  }

  /**************************************************
   * context menu functions
   * ************************************************/
  async handleClickOnContextMenu(event: Event, file: OvicFile | OvicDriveFile, func: RightContextMenuFunction = null) {
    event.preventDefault();
    event.stopPropagation();
    this.closeContextMenu();
    if (!func) {
      return;
    }
    switch (func) {
      case RightContextMenuFunction.detail:
        await this.mediaService.tplFileDetail(file);
        break;
      case RightContextMenuFunction.delete:
        await this.deleteFile(file);
        break;
      case RightContextMenuFunction.download:
        await this.downloadFile(file);
        break;
      case RightContextMenuFunction.link:
        this.notificationService.toastInfo('Tính năng link đang phát triển');
        break;
      case RightContextMenuFunction.preview:
        await this.mediaService.tplPreviewFiles([{id: file.id, file: file}], false, false, false, this.newPreviewer);
        break;
      case RightContextMenuFunction.private:
        this.privateMyFile(typeof file.id === 'number' ? file.id : null);
        break;
      case RightContextMenuFunction.share:
        await this.changeFilePublicationStatus(file, func);
        break;
      case RightContextMenuFunction.public:
        this.publicMyFile(typeof file.id === 'number' ? file.id : null);
        break;
      default:
        this.notificationService.toastInfo('Tính năng đang phát triển');
        break;
    }
  }

  /**********************************************
   * action public file
   * *******************************************/
  publicMyFile(fileId: number) {
    if (!fileId) {
      return;
    }
    this.fileLoading = true;
    this.fileService.updateFileInfo(fileId, {shared: '|-1|'}).subscribe({
      next: () => {
        this.fileLoading = false;
        this.notificationService.toastSuccess('Thay đổi trạng thái file thành công');
        this.reloadData();
      },
      error: () => {
        this.fileLoading = false;
        this.notificationService.toastError('Thay đổi trạng thái file thất bại');
      }
    });
  }

  /**********************************************
   * action private file
   * *******************************************/
  privateMyFile(fileId: number) {
    if (!fileId) {
      return;
    }
    this.fileLoading = true;
    this.fileService.updateFileInfo(fileId, {shared: '|0|'}).subscribe({
      next: () => {
        this.fileLoading = false;
        this.notificationService.toastSuccess('Thay đổi trạng thái file thành công');
        this.reloadData();
      },
      error: () => {
        this.fileLoading = false;
        this.notificationService.toastError('Thay đổi trạng thái file thất bại');
      }
    });
  }

  /**********************************************
   * change the file publication status
   * *******************************************/
  async changeFilePublicationStatus(file: OvicFile | OvicDriveFile, func: RightContextMenuFunction) {
    if (RightContextMenuFunction.private === func) {

    } else if (RightContextMenuFunction.public === func) {

    } else {

    }
  }

  /**********************************************
   * open context menu
   * *******************************************/
  openContextMenu(event: MouseEvent | TouchEvent, file) {
    this.closeContextMenu();
    this._fileRunning = file;
    this._fileRunning['highlight'] = true;
    const pageX = event.type === 'touchstart' ? event['touches'][0].pageX : event['pageX'];
    const clientX = event.type === 'touchstart' ? event['touches'][0].clientX : event['clientX'];
    const clientY = event.type === 'touchstart' ? event['touches'][0].clientY : event['clientY'];
    this.subMenuOpenLeft = document.body.clientWidth - pageX < 200;
    const positionStrategy = this.overlay.position().flexibleConnectedTo({
      x: clientX,
      y: clientY
    }).withPositions([{originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'}]);
    this.overlayRef = this.overlay.create({positionStrategy, scrollStrategy: this.overlay.scrollStrategies.close()});
    this.overlayRef.attach(new TemplatePortal(this.userMenu, this.viewContainerRef, {$implicit: file}));
    this.subscription = fromEvent<MouseEvent>(document, 'click').pipe(
      filter(event => {
        const clickTarget = event.target as HTMLElement;
        return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
      }),
      take(1)
    ).subscribe({next: () => this.closeContextMenu()});
  }


  /*******************************************************
   * close context menu
   * *****************************************************/
  closeContextMenu() {
    if (this._fileRunning) {
      this._fileRunning['highlight'] = false;
    }
    this.subMenuOpenLeft = false;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  /********************************************************
   * Disable context menu
   * ******************************************************/
  disableContextMenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  /********************************************************
   * Download file act
   * ******************************************************/
  async downloadFile(file: OvicFile | OvicDriveFile) {
    const result = await this.mediaService.tplDownloadFile(file);
    switch (result) {
      case DownloadProcess.rejected:
        this.notificationService.toastInfo('Chưa hỗ trợ tải xuống thư mục');
        break;
      case DownloadProcess.error:
        this.notificationService.toastError('Tải xuống thất bại');
        break;
    }
  }

  /**************************************************
   * context menu functions
   * ************************************************/
  async handleCopyAudioCode(event: Event, file: OvicFile | OvicDriveFile) {
    event.preventDefault();
    event.stopPropagation();
    const clipboard = typeof file.id === 'number' ? `@@[ audio serverFile ${file.id.toString()} 1 ]` : `@@[ audio googleDrive ${file.id} 1 ]`;
    this.copyTextToClipboard(clipboard);
  }

  copyTextToClipboard(text) {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      // Avoid scrolling to bottom
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  isAudioFile(file: OvicFile | OvicDriveFile): boolean {
    const type = file['ext'] ? file['ext'] : file['fileExtension'];
    return ['mp3', 'ogg', 'ogv', 'ogm', 'oga', 'spx', 'ogx', 'opus', 'flac', 'wav'].includes(type);
  }

  /**************************************************
   * context menu functions
   * ************************************************/
  createNewStore() {
    if (!this.driveFolder) {
      return this.notificationService.toastError('Thiếu thư mục drive gốc');
    }
    this.isCreatingStore = true;
    const name = this.auth.user.username;
    const parents = this.driveFolder;
    this.fileService.createPersonalFolder({name, parents}).pipe(
      mergeMap(folderInfo => {
        this.auth.setOption(this.metaKeyStore, folderInfo.id);
        return this.userService.updateMeta({
          user_id: this.auth.user.id,
          meta_key: this.metaKeyStore,
          meta_title: this.storeLabel[1] || 'Google Drive',
          meta_value: folderInfo.id
        });
      })
    ).subscribe({
      next: () => {
        this.createdStoreMessage = true;
        this.isCreatingStore = false;
      },
      error: () => {
        this.createdStoreMessage = false;
        this.isCreatingStore = false;
        this.notificationService.toastError('Khởi tạo không gian lưu trữ thất bại');
      }
    });
  }

  openMobilePanel() {
    this.mobileMenuOpened = !this.mobileMenuOpened;
  }

  closeMobilePanel(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.mobileMenuOpened = false;
  }

  openFileChooser(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.inputFileChooser) {
      this.inputFileChooser.nativeElement.click();
    }
  }

  touchstart(event: TouchEvent, file) {
    if (this.useContentMenuOnMobile) {
      this.userTouched = true;
      setTimeout(() => {
        event.preventDefault();
        event.stopPropagation();
        if (this.userTouched) {
          this.openContextMenu(event, file);
        }
      }, 500);
    }
  }

  touchend() {
    this.userTouched = false;
  }

}
