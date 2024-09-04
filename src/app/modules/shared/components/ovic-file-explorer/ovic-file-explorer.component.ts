import {Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {OvicFile, OvicFileStore, OvicTree, OvicDriveFile, OvicFileUpload} from '@core/models/file';
import {FileService} from '@core/services/file.service';
import {NotificationService} from '@core/services/notification.service';
import {MediaService} from '@shared/services/media.service';
import {AuthService} from '@core/services/auth.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup} from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {filter, finalize, map, switchMap, take, throttleTime} from 'rxjs/operators';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {OverlayRef, Overlay} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {DownloadProcess} from '../ovic-download-progress/ovic-download-progress.component';
import {APP_CONFIGS} from '@env';

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

interface SearchInfo {
  title: string;
  url: string;
  parents: string;
  timeMin: string;
  timeMax: string;
  limit: number;
}

@Component({
  selector: 'ovic-file-explorer',
  templateUrl: './ovic-file-explorer.component.html',
  styleUrls: ['./ovic-file-explorer.component.css'],
  animations: [
    trigger('openSubmenu', [
      state('opened', style({'transform': 'scaleY(1)', 'visibility': 'visible', 'opacity': '1'})),
      state('closed', style({'transform': 'scaleY(0)', 'visibility': 'hidden', 'opacity': '0', 'height': '0'})),
      transition('opened<=>closed', animate('350ms 0s ease-in-out'))
    ])
  ]
})

export class OvicFileExplorerComponent implements OnInit {

  @Input() gridMode = false;

  @Input() multipleMode = true;

  @Input() files: OvicFileStore[] = [];

  @Input() state = 0;

  // library : OvicFile[] | OvicDriveFile[];
  library: any[];

  googleCloudFiles: OvicDriveFile[];

  uploadingFiles: OvicFileUpload[] = [];

  selectedFiles: any[];

  selectedFileIds: Set<string | number>;

  menuSelected: string;

  directories: OvicTree[];

  breadcrumb: OvicTree[];

  gdBreadcrumb: GoogleDriverBreadcrumb[];

  searchInfo: SearchInfo = {title: '', url: '', parents: '', limit: 1000, timeMin: null, timeMax: null};

  directoriesLoading = false;

  fileLoading = false;

  showClearSearch = false;

  form: FormGroup;

  reloadingData = null;

  closeAfterFilesUploaded = true;

  acceptList = new Set(APP_CONFIGS.acceptList);

  server = 'serverFile'; // serverFile | googleDrive

  fileChooser: File | null = null;

  @ViewChild('userMenu') userMenu: TemplateRef<any>;

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

  constructor(
    private fileService: FileService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private overlay: Overlay,
    private auth: AuthService,
    private mediaService: MediaService,
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
    this.userId = this.auth.user.id;
  }

  ngOnInit(): void {
    this.form = this.fb.group({search: ['']});
    const dateNow = new Date();
    const dateEnd = [dateNow.getMonth() + 1, dateNow.getFullYear()];
    this.directories = [].concat([{
      label: 'Tất cả',
      slug: 'all',
      isOpen: false,
      children: []
    }], this.createMenu(APP_CONFIGS.dateStart, dateEnd.join('/')));
    const lastYear = this.directories.slice(-1)[0];
    const lastMonth = lastYear.children.length ? lastYear.children.slice(-1)[0] : lastYear;
    lastYear.isOpen = true;
    this.activeMenu(lastMonth, false);
    this.form.get('search').valueChanges.pipe(
      // debounceTime( 500 ) ,
      // distinctUntilChanged() ,
      throttleTime(500),
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
  }

  /*******************************************************
   * changeView
   * *****************************************************/
  changeView(status: boolean) {
    this.gridMode = status;
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
    this.searchInfo.parents = '';
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

  getFilterDate(monthPerYear: string): { timeMin: string, timeMax?: string } {
    const result = {timeMin: null, timeMax: null};
    if (monthPerYear) {
      const arrDate = monthPerYear.split('/');
      const year = parseInt(arrDate[0], 10);
      let firstDay: Date,
        lastDay: Date;
      if (arrDate[1]) {
        const month = parseInt(arrDate[1], 10);
        firstDay = new Date(year, month - 1, 1);
        lastDay = new Date(year, month, 0);
      } else {
        firstDay = new Date(year, 0, 1);
        lastDay = new Date(year, 12, 0);
      }
      firstDay.setHours(0, 0, 0);
      lastDay.setHours(23, 59, 59);
      result.timeMin = firstDay.toISOString().replace('.000Z', '');
      result['timeMax'] = lastDay.toISOString().replace('.000Z', '');
    } else {
      // appConfigs.dateStart like 09/2020
      const _arrDate = APP_CONFIGS.dateStart.split('/');
      const dateStart = new Date(parseInt(_arrDate[1], 10), parseInt(_arrDate[0], 10) - 1, 1);
      dateStart.setHours(0, 0, 0);
      result.timeMin = dateStart.toISOString().replace('.000Z', '');
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
      const filter = this.getFilterDate(this.searchInfo.url);
      this.searchInfo.timeMin = filter.timeMin;
      this.searchInfo.timeMax = filter.timeMax;
    }
    this.getData(this.server, this.searchInfo).subscribe({
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
      }
    );
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
    if (file.hasOwnProperty('mimeType') && file['mimeType'] === 'application/vnd.google-apps.folder') {
      if (file.parents[0] && file.parents[0] !== this.gdBreadcrumb.slice(-1)[0].parents) {
        this.searchInfo.parents = file.parents[0];
        this.gdBreadcrumb.push({id: file.id, label: file.name, parents: file.parents[0]});
        this.loadData();
      } else {
        this.notificationService.toastInfo('Thư mục trống');
      }
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
    if (file || this.selectedFileIds.size) {
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
          requires.forEach((request$, index) => setTimeout(() => request$.subscribe(
            {
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
            }
          ), index * 50));
        }
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
            this.fileService.uploadFileWidthProgress(file.file, this.state).subscribe(
              {
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
              }
            );
          }, 50 * index);
        } else {
          setTimeout(() => {
            // this.fileService.gdUploadFile( file.file ).subscribe(
            this.fileService.googleDriveUploadFileToParents(file.file, this.auth.cloudStore).subscribe(
              {
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
              }
            );
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
      if (!this.acceptList.has(file.type)) {
        file.validate = false;
        file.message = 'Định dạng file chưa được hỗ trợ';
        setTimeout(() => this.removeFileFromUploadingList(null, file.id), 5000 + (i * 100));
      } else if (file.size > APP_CONFIGS.maxUploadSize) {
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
        await this.mediaService.tplPreviewFiles([{id: file.id, file: file}]);
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
    this.fileService.updateFileInfo(fileId, {shared: '|-1|'}).subscribe(
      {
        next: () => {
          this.fileLoading = false;
          this.notificationService.toastSuccess('Thay đổi trạng thái file thành công');
          this.reloadData();
        },
        error: () => {
          this.fileLoading = false;
          this.notificationService.toastError('Thay đổi trạng thái file thất bại');
        }
      }
    );
  }

  /**********************************************
   * action private file
   * *******************************************/
  privateMyFile(fileId: number) {
    if (!fileId) {
      return;
    }
    this.fileLoading = true;
    this.fileService.updateFileInfo(fileId, {shared: '|0|'}).subscribe(
      {
        next: () => {
          this.fileLoading = false;
          this.notificationService.toastSuccess('Thay đổi trạng thái file thành công');
          this.reloadData();
        },
        error: () => {
          this.fileLoading = false;
          this.notificationService.toastError('Thay đổi trạng thái file thất bại');
        }
      }
    );
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
  openContextMenu(event: MouseEvent, file) {
    this.closeContextMenu();
    this._fileRunning = file;
    this._fileRunning['highlight'] = true;
    this.subMenuOpenLeft = document.body.clientWidth - event.pageX < 200;
    const positionStrategy = this.overlay.position().flexibleConnectedTo({
      x: event.clientX,
      y: event.clientY
    }).withPositions([{originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'}]);

    this.overlayRef = this.overlay.create({positionStrategy, scrollStrategy: this.overlay.scrollStrategies.close()});

    this.overlayRef.attach(new TemplatePortal(this.userMenu, this.viewContainerRef, {$implicit: file}));

    this.subscription = fromEvent<MouseEvent>(document, 'click').pipe(
      filter(event => {
        const clickTarget = event.target as HTMLElement;
        return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
      }),
      take(1)
    ).subscribe({
      next: () => this.closeContextMenu()
    });

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
}
