import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged, filter, forkJoin, Observable, Subject, Subscription, takeUntil} from "rxjs";
import {DmChuyenMuc, DmDiemDiTich, DmLinhVuc, DmLoaiNguLieu} from "@shared/models/danh-muc";
import {FileType, MODULES_QUILL, TYPE_FILE_IMAGE} from "@shared/utils/syscat";
import {FormType, NgPaginateEvent, OvicForm} from "@shared/models/ovic-models";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";
import {Paginator} from "primeng/paginator";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {NguLieuDanhSachService} from "@shared/services/ngu-lieu-danh-sach.service";
import {NotificationService} from "@core/services/notification.service";
import {DanhMucChuyenMucService} from "@shared/services/danh-muc-chuyen-muc.service";
import {DanhMucLoaiNguLieuService} from "@shared/services/danh-muc-loai-ngu-lieu.service";
import {DanhMucLinhVucService} from "@shared/services/danh-muc-linh-vuc.service";
import {DanhMucDiemDiTichService} from "@shared/services/danh-muc-diem-di-tich.service";
import {FileService} from "@core/services/file.service";
import {AuthService} from "@core/services/auth.service";
import {AvatarMakerSetting, MediaService} from "@shared/services/media.service";
import { getLinkDownload } from '@env';
import { HelperService } from '@core/services/helper.service';
interface FormNgulieu extends OvicForm {
  object: Ngulieu;
}
const PinableValidator = (control: AbstractControl): ValidationErrors | null => {
  const fileTypeControl = control.get('file_type');
  if (fileTypeControl.valid) {
    if (fileTypeControl.value === 0) {
      const isInvalid = control.get('file_media').value.length > 0 ;
      return isInvalid ? null : {pinableError: 'File media required'};
    } else {
      const isInvalid = control.get('file_product').value.length > 0;
      return isInvalid ? null : {pinableError: 'File product required'};
    }
  }
  return null;
}

@Component({
  selector: 'app-ngu-lieu-video-vr',
  templateUrl: './ngu-lieu-video-vr.component.html',
  styleUrls: ['./ngu-lieu-video-vr.component.css']
})
export class NguLieuVideoVrComponent implements OnInit {
  @ViewChild('fromUpdate', {static: true}) template: TemplateRef<any>;
  @ViewChild('formMembers', {static: true}) formMembers: TemplateRef<any>;
  @ViewChild(Paginator, {static: true}) paginator: Paginator;
  private OBSERVE_SEARCH_DATA = new Subject<string>();
  formActive: FormNgulieu;
  private OBSERVE_PROCESS_FORM_DATA = new Subject<FormNgulieu>();
  private _SEARCH_DEBOUNCE = new Subject<string>();
  private closeObservers$ = new Subject<string>();
  module_quill:any = MODULES_QUILL;
  subscription = new Subscription();
  listData: Ngulieu[];
  recordsTotal: number;
  loadInitFail = false;
  needUpdate = false;
  rows = this.themeSettingsService.settings.rows;
  isLoading: boolean = false;
  page = 1;
  menuName = 'Ngulieu';
  sizeFullWidth = 1024;
  filePermission = {
    canDelete: true,
    canDownload: true,
    canUpload: true
  };
  listForm = {
    [FormType.ADDITION]: {type: FormType.ADDITION, title: 'Thêm mới ngữ liệu video 360', object: null, data: null},
    [FormType.UPDATE]: {type: FormType.UPDATE, title: 'Cập nhật ngữ liệu video 360', object: null, data: null}
  };
  formSave: FormGroup = this.fb.group({
    title: ['', Validators.required],
    mota: [''],
    chuyenmuc: ['', Validators.required],
    loaingulieu: ['', Validators.required],
    linhvuc: ['', Validators.required],
    diemditich_ids:[[]],
    file_media: [[]],
    file_audio:[[]],
    donvi_id:[null, Validators.required],
    file_thumbnail:{},
    file_product:[[]],
    file_type:[0]
  },{validators:PinableValidator});
  dataChuyemuc: DmChuyenMuc[];
  dataLoaingulieu: DmLoaiNguLieu[];
  dataLinhvuc: DmLinhVuc[];
  dataDiemDiTich:DmDiemDiTich[];
  objectEdit:Ngulieu;
  mode: 'TABLE' | 'MEDIAVR' | 'INFO' = "TABLE";
  objectVR: Ngulieu;
  visible:boolean= false;
  ngulieuInfo:Ngulieu;
  ngulieu_type:0|1;
  filterData: { linhvucid: number, search: string,loaingulieu:string } = {linhvucid: null, search: '',loaingulieu:'video360'};
  loaidoituong:0|1 = 0;//0:bientap// 1 sp dongs goi
  characterAvatar:string = '';
  changeTb:0|1 = 0;//0:list// 1 card
  btnNameCheck:string;
  constructor(
    private themeSettingsService: ThemeSettingsService,
    private nguLieuDanhSachService: NguLieuDanhSachService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private danhMucChuyenMucService: DanhMucChuyenMucService,
    private danhMucLoaiNguLieuService: DanhMucLoaiNguLieuService,
    private danhMucLinhVucService: DanhMucLinhVucService,
    private danhMucDiemDiTichService: DanhMucDiemDiTichService,
    private fileService:FileService,
    private auth:AuthService,
    private mediaService:MediaService,
    private helperService:HelperService
  ) {
    const observeProcessFormData = this.OBSERVE_PROCESS_FORM_DATA.asObservable().pipe(debounceTime(100)).subscribe(form => this.__processFrom(form));
    this.subscription.add(observeProcessFormData);
    const observeProcessCloseForm = this.notificationService.onSideNavigationMenuClosed().pipe(filter(menuName => menuName === this.menuName && this.needUpdate)).subscribe(() => this.loadData(this.page));
    this.subscription.add(observeProcessCloseForm);
    const observerOnResize = this.notificationService.observeScreenSize.subscribe(size => this.sizeFullWidth = size.width)
    this.subscription.add(observerOnResize);
    this._SEARCH_DEBOUNCE.asObservable().pipe( takeUntil( this.closeObservers$ ) , debounceTime( 500 ) , distinctUntilChanged() ).subscribe( search => this.loadData(1, search));

  }

  ngOnInit(): void {
    this.loadInit();
  }

  loadInit() {
    forkJoin<[DmChuyenMuc[], DmLoaiNguLieu[], DmLinhVuc[],DmDiemDiTich[]]>(
      this.danhMucChuyenMucService.getDataUnlimit(),
      this.danhMucLoaiNguLieuService.getDataUnlimit(),
      this.danhMucLinhVucService.getDataUnlimit(),
      this.danhMucDiemDiTichService.getDataUnlimit()
    ).subscribe({
      next: ([dataChuyemuc, dataLoaingulieu, dataLinhvuc,dataDiemDitich]) => {
        this.dataChuyemuc = dataChuyemuc;
        this.dataLoaingulieu = dataLoaingulieu;
        this.dataLinhvuc = dataLinhvuc;
        this.dataDiemDiTich=dataDiemDitich;
        this.loadData(1);
      },
      error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  loadData(page: number, search?:string) {
    const searchData = search ? search: this.filterData.search;
    let i = 1;
    this.isLoading = true;
    this.nguLieuDanhSachService.getDataByLinhvucIdAndSearch(page, this.filterData.linhvucid, searchData, this.filterData.loaingulieu).subscribe({
      next: ({data, recordsTotal}) => {
        this.listData = data.map(m => {
          const linhvuc = this.dataLinhvuc && m.linhvuc ? this.dataLinhvuc.find(f => f.id === m.linhvuc) : null;
          const loaingulieu = this.dataLoaingulieu && m.loaingulieu ? this.dataLoaingulieu.find(f => f.kyhieu === m.loaingulieu) : null;
          m['indexTable'] = (page -1)*10 + i++;
          m['__ten_converted'] = `<b>${m.title}</b><br>`;
          m['linhvuc_converted'] = linhvuc ? linhvuc.ten : '';
          m['loaingulieu_converted'] = loaingulieu ? loaingulieu.ten : '';
          m['fileType'] = m.file_media && m.file_media[0] && FileType.has(m.file_media[0].type) && (FileType.get(m.file_media[0].type)==='img'|| FileType.get(m.file_media[0].type)==='mp4') ? 'mediaVr' : 'info';
          m['__media_link']=m.file_media&& m.file_media[0] ? this.fileService.getPreviewLinkLocalFile(m.file_media[0]) :null;
          m['__file_thumbnail'] = m.file_thumbnail ? this.fileService.getPreviewLinkLocalFile(m.file_thumbnail): '';
          if(m.file_product && m.file_product[0]){
            this.nguLieuDanhSachService.loadUrlNgulieuById(m.id).subscribe({
              next:(link)=>{
                console.log(link);
                m['__url_product'] = link['data'];
              }
            })
          }else{
            m['__url_product'] ='';
          }
          return m;
        });
        this.recordsTotal = this.listData.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  private __processFrom({data, object, type}: FormNgulieu) {
    const observer$: Observable<any> = type === FormType.ADDITION ? this.nguLieuDanhSachService.create(data) : this.nguLieuDanhSachService.update(object.id, data);
    observer$.subscribe({
      next: () => {
        this.needUpdate = true;
        this.notificationService.toastSuccess('Thao tác thành công', 'Thông báo');
        this.loadData(this.page);
      },
      error: () => this.notificationService.toastError('Thao tác thất bại', 'Thông báo')
    });
  }

  get f(): { [key: string]: AbstractControl<any> } {
    return this.formSave.controls;
  }
  paginate({page}: NgPaginateEvent) {
    this.page = page + 1;
    this.loadData(this.page);
  }

  btnAddNew() {
    this.btnNameCheck ="Lưu lại";
    this.formSave.reset({
      title: '',
      mota: '',
      chuyenmuc: '',
      loaingulieu:'video360',
      diemditich_ids: [],
      linhvuc: '',
      file_media: [],
      file_audio: [],
      donvi_id:this.auth.userDonViId,
      file_thumbnail:{},
      file_product:[],
      file_type:0
    });
    this.loaidoituong === 0;
    this.formActive = this.listForm[FormType.ADDITION];
    this.preSetupForm(this.menuName);
  }

  private preSetupForm(name: string) {
    this.notificationService.isProcessing(false);
    this.notificationService.openSideNavigationMenu({
      name,
      template: this.template,
      size: this.sizeFullWidth,
      offsetTop: '0px'
    });
  }

  btnEdit(object: Ngulieu) {
    this.btnNameCheck ="Cập nhật";

    this.objectEdit = object;
    this.formSave.reset({
      title: object.title,
      mota: object.mota,
      chuyenmuc: object.chuyenmuc,
      loaingulieu: object.loaingulieu,
      diemditich_ids: object.diemditich_ids,
      linhvuc: object.linhvuc,
      file_media: object.file_media,
      file_audio: object.file_audio,
      donvi_id:object.donvi_id,
      file_thumbnail:object.file_thumbnail,
      file_product:object.file_product,
      file_type:object.file_type
    });
    this.loaidoituong === object.file_type
    this.formActive = this.listForm[FormType.UPDATE];
    this.characterAvatar = object.file_thumbnail ? getLinkDownload(object.file_thumbnail.id) : '';
    this.formActive.object = object;
    this.preSetupForm(this.menuName);
  };

  async btnDelete(object: Ngulieu) {
    const confirm = await this.notificationService.confirmDelete();
    if (confirm) {
      this.nguLieuDanhSachService.delete(object.id).subscribe({
        next: () => {
          this.page = Math.max(1, this.page - (this.listData.length > 1 ? 0 : 1));
          this.notificationService.isProcessing(false);
          this.notificationService.toastSuccess('Thao tác thành công');
          this.loadData( this.page);
        }, error: () => {
          this.notificationService.isProcessing(false);
          this.notificationService.toastError('Thao tác không thành công');
        }
      })
    }
  };

  saveForm() {
    const titleInput = this.f['title'].value.trim();
    this.f['title'].setValue(titleInput);
    if (this.formSave.valid) {
      if (titleInput !== '') {
        this.formActive.data = this.formSave.value;
        this.OBSERVE_PROCESS_FORM_DATA.next(this.formActive);
      } else {
        this.notificationService.toastWarning('Vui lòng không nhập khoảng trống');
      }
    } else {
      this.formSave.markAllAsTouched();
      this.notificationService.toastWarning('Vui lòng nhập đủ thông tin');
    }
  }

  closeForm() {
    this.loadInit();
    this.mode = "TABLE";
    this.notificationService.closeSideNavigationMenu();
  }

  btnInformation(object: Ngulieu) {
    this.ngulieu_type= object.file_type;
    if (object.loaingulieu=== "video360" || object.loaingulieu === "image360") {
      this.mode = "MEDIAVR";
      this.objectVR = object;
    }
    else if(object.loaingulieu === 'image' ||object.loaingulieu === 'video'){
      this.visible=true;
      this.ngulieuInfo =object;
    }else{
      this.visible=true;
      this.ngulieuInfo =object;
    }
  };

  changeFilter(event) {
    const linhvucid = event.value;
    this.filterData.linhvucid = linhvucid;
    this.loadData(1);
  }

  changeInput(text: string) {
    this.filterData.search = text;
    this._SEARCH_DEBOUNCE.next( text );
  }

  btnExit() {
    this.mode = "TABLE";
  }

  //  ========ảnh thumbnail=========
  changeObjectType(type:0|1){
    if (this.loaidoituong !== type) {
      this.loaidoituong = type;
    }
    if(type ===1){
      this.f['file_type'].setValue(1);
    }else{
      this.f['file_type'].setValue(0);
    }
  }

  async makeCharacterAvatar(file: File, characterName: string): Promise<File> {
    try {
      const options: AvatarMakerSetting = {
        aspectRatio: 3 / 2,
        resizeToWidth: 1000,
        format: 'jpeg',
        cropperMinWidth: 10,
        dirRectImage: {
          enable: true,
          dataUrl: URL.createObjectURL(file)
        }
      };
      const avatar = await this.mediaService.callAvatarMaker(options);
      if (avatar && !avatar.error && avatar.data) {
        const none = new Date().valueOf();
        const fileName = characterName + none + '.jpg';
        return Promise.resolve(this.fileService.base64ToFile(avatar.data.base64, fileName));
      } else {
        return Promise.resolve(null);
      }
    } catch (e) {
      this.notificationService.isProcessing(false);
      this.notificationService.toastError('Quá trình tạo avatar thất bại');
      return Promise.resolve(null);
    }
  }

  typeFileAdd = TYPE_FILE_IMAGE;
  async onInputAvatar(event, fileChooser: HTMLInputElement) {
    if (fileChooser.files && fileChooser.files.length) {
      if (this.typeFileAdd.includes(fileChooser.files[0].type)){
        const file = await this.makeCharacterAvatar(fileChooser.files[0], this.helperService.sanitizeVietnameseTitle(this.f['title'].value));
        // upload file to server
        this.fileService.uploadFile(file, 1).subscribe({
          next: fileUl => {
            this.formSave.get('file_thumbnail').setValue(fileUl);
          }, error: () => {
            this.notificationService.toastError('Upload file không thành công');
          }
        })
        // laasy thoong tin vaf update truongwf
        this.characterAvatar = URL.createObjectURL(file);

      }else{
        this.notificationService.toastWarning("Định dạng file không phù hợp");
      }
    }
  }
  btnCheck(ngulieu:Ngulieu){
    if(ngulieu.root ===1){
      this.nguLieuDanhSachService.update(ngulieu.id, {root:0}).subscribe({
        next:()=>{
          this.listData.find(f=>f.id === ngulieu.id).root =0;
          this.notificationService.isProcessing(false);
          this.notificationService.toastSuccess("Tắt ngữ liệu nổi bật");

        },
        error:()=>{
          this.notificationService.isProcessing(false);
          this.notificationService.toastError("Cập nhật không thành công");
        }
      })
    }else if(ngulieu.root === 0){
      this.nguLieuDanhSachService.update(ngulieu.id, {root:1}).subscribe({
        next:()=>{
          this.listData.find(f=>f.id === ngulieu.id).root =1;
          this.notificationService.isProcessing(false);
          this.notificationService.toastSuccess("Bật ngữ liệu nổi bật");

        },
        error:()=>{
          this.notificationService.isProcessing(false);
          this.notificationService.toastError("Cập nhật không thành công");
        }
      })
    }
  }
  selectChangeTb(select:1|0){
    if (this.changeTb !== select) {
      this.changeTb = select;
    }
  }
}
