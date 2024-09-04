import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormType, NgPaginateEvent, OvicForm} from "@shared/models/ovic-models";
import {SuKien} from "@shared/models/quan-ly-ngu-lieu";
import {Paginator} from "primeng/paginator";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {debounceTime, filter, forkJoin, Observable, Subject, Subscription} from "rxjs";
import {DanhMucDiemDiTichService} from "@shared/services/danh-muc-diem-di-tich.service";
import {DanhMucLinhVucService} from "@shared/services/danh-muc-linh-vuc.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {NotificationService} from "@core/services/notification.service";
import {AuthService} from "@core/services/auth.service";
import {HelperService} from "@core/services/helper.service";
import {DmDiemDiTich, DmLinhVuc, DmNhanVatLichSu} from "@shared/models/danh-muc";
import {NguLieuSuKienService} from "@shared/services/ngu-lieu-su-kien.service";
import {DanhMucNhanVatLichSuService} from "@shared/services/danh-muc-nhan-vat-lich-su.service";
import {FileService} from '@core/services/file.service';
import {AvatarMakerSetting, MediaService} from "@shared/services/media.service";
import {getLinkDownload} from "@env";
import {MODULES_QUILL, TYPE_FILE_IMAGE} from "@shared/utils/syscat";

interface FormSuKien extends OvicForm {
  object: SuKien;
}

const PinableValidator = (control: AbstractControl): ValidationErrors | null => {
  if (control.get('title').valid && control.get('title').value) {
    return control.get('title').value.trim().length > 0 ? null : {invalid: true};
  } else {
    return {invalid: true};
  }
}

@Component({
  selector: 'app-danh-sach-su-kien',
  templateUrl: './danh-sach-su-kien.component.html',
  styleUrls: ['./danh-sach-su-kien.component.css']
})
export class DanhSachSuKienComponent implements OnInit {
  @ViewChild('fromUpdate', {static: true}) template: TemplateRef<any>;
  @ViewChild('formInformation', {static: true}) formInformation: TemplateRef<any>;
  @ViewChild(Paginator) paginator: Paginator;

  stream: HTMLAudioElement;

  listData: SuKien[];
  module_quill: any = MODULES_QUILL;
  filePermission = {
    canDelete: true,
    canDownload: true,
    canUpload: true
  };
  headButtons = [
    {
      label: 'Thêm mới',
      name: 'BUTTON_ADD_NEW',
      icon: 'pi-plus pi',
      class: 'p-button-rounded p-button-success ml-3 mr-2'
    },
  ];
  listForm = {
    [FormType.ADDITION]: {type: FormType.ADDITION, title: 'Thêm mới sự kiện ', object: null, data: null},
    [FormType.UPDATE]: {type: FormType.UPDATE, title: 'Cập nhật sự kiện ', object: null, data: null}
  };
  formActive: FormSuKien;
  formSave: FormGroup;

  private OBSERVE_PROCESS_FORM_DATA = new Subject<FormSuKien>();
  rows = this.themeSettingsService.settings.rows;
  loadInitFail = false;
  subscription = new Subscription();
  sizeFullWidth = 1024;
  isLoading = true;
  needUpdate = false;
  menuName: 'ds_sukien';
  page = 1;
  recordsTotal = 0;
  index = 1;
  search: string;
  characterAvatar: string;
  dataDiemditich: DmDiemDiTich[];
  dataNhanvatlichsu: DmNhanVatLichSu[];
  dataLinhvuc:DmLinhVuc[];
  @ViewChild('fileChooser', {static: true}) fileChooser: TemplateRef<any>;
  typeFileAdd = TYPE_FILE_IMAGE;
  dataInfo: SuKien;
  changeTb:0|1 = 0;//0:list// 1 card
  btnNameSave:"Lưu lại"| "Cập nhật";
  descIframeView:any;
  constructor(
    private danhMucDiemDiTichService: DanhMucDiemDiTichService,
    private danhMucLinhVucService: DanhMucLinhVucService,
    private themeSettingsService: ThemeSettingsService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private auth: AuthService,
    private helperService: HelperService,
    private nguLieuSuKienService: NguLieuSuKienService,
    private danhMucNhanVatLichSuService: DanhMucNhanVatLichSuService,
    private fileService: FileService,
    private mediaService: MediaService,
  ) {
    this.formSave = this.fb.group({
      title: ['', Validators.required],
      mota: [''],
      diemditich_ids: [null,],
      thoigian_batdau: ['', Validators.required],
      thoigian_ketthuc: ['', Validators.required],
      files: [null],
      nhanvat_ids: [null],
      ngulieu_ids: [[]],
      donvi_id: [null, Validators.required],
      file_audio: [[]],
      linhvuc: [null, Validators.required]
    }, {
      validators: PinableValidator
    });

    const observeProcessFormData = this.OBSERVE_PROCESS_FORM_DATA.asObservable().pipe(debounceTime(100)).subscribe(form => this.__processFrom(form));
    this.subscription.add(observeProcessFormData);
    const observeProcessCloseForm = this.notificationService.onSideNavigationMenuClosed().pipe(filter(menuName => menuName === this.menuName && this.needUpdate)).subscribe(() => this.loadData(this.page));
    this.subscription.add(observeProcessCloseForm);
    const observerOnResize = this.notificationService.observeScreenSize.subscribe(size => this.sizeFullWidth = size.width)
    this.subscription.add(observerOnResize);
    this.stream = document.createElement('audio');
    this.stream.setAttribute('playsinline', 'true');
  }

  ngOnInit(): void {
    this.notificationService.isProcessing(true);
    forkJoin<[DmDiemDiTich[], DmNhanVatLichSu[],DmLinhVuc[]]>(
      this.danhMucDiemDiTichService.getDataUnlimit(),
      this.danhMucNhanVatLichSuService.getDataUnlimit(null),
      this.danhMucLinhVucService.getDataUnlimit()
    ).subscribe({
      next: ([dataDiemditich, dataNhanvatlichsu,linhvuc]) => {
        this.dataDiemditich = dataDiemditich;
        this.dataNhanvatlichsu = dataNhanvatlichsu;
        this.dataLinhvuc= linhvuc
        if(this.dataDiemditich && this.dataNhanvatlichsu && this.dataLinhvuc){
          this.loadInit();
        }
        this.notificationService.isProcessing(false);

      },
      error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  loadInit() {
    this.isLoading = true;
    this.loadData(1);
  }

  isArray(input: any): boolean {
    return Array.isArray(input);
  }
  loadData(page) {
    this.page = page;
    this.nguLieuSuKienService.searchData(page, this.search).subscribe({
      next: ({data, recordsTotal}) => {
        let index=1;
        this.listData = data.map(m => {
          let nhanvatId = m.nhanvat_ids;
          let nhanvat = [];
          nhanvatId.forEach(f => {
            if(this.dataNhanvatlichsu.find(m => m.id === f)){
              nhanvat.push(this.dataNhanvatlichsu.find(m => m.id === f));
            }
          });
          let ditich = [];
          m.diemditich_ids.forEach(f => {
            if(this.dataDiemditich.find(m => m.id === f)){
              ditich.push(this.dataDiemditich.find(m => m.id === f));
            }
          });
          m['__indexTable']= index++;
          m['__title_converted'] = `<b>${m.title}</b>`;
          m['__time_converted'] = m.thoigian_batdau + ' - ' + m.thoigian_ketthuc;
          m['__nhanvat_converted'] = nhanvat ? nhanvat :'';
          m['__diemditich_ids_coverted'] = ditich? ditich :'';
          m['__decode_mota'] = this.helperService.decodeHTML(m.mota);
          m['__file_thumbnail'] = m.files ? this.fileService.getPreviewLinkLocalFile(m.files): '';
          m['__file_audio'] = m.file_audio && m.file_audio[0] ? this.fileService.getPreviewLinkLocalFileNotToken(m.file_audio[0]): '';
          return m;
        })
        this.recordsTotal = this.listData.length;
        this.isLoading = false;
        this.notificationService.isProcessing(false);
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  private __processFrom({data, object, type}: FormSuKien) {
    const observer$: Observable<any> = type === FormType.ADDITION ? this.nguLieuSuKienService.create(data) : this.nguLieuSuKienService.update(object.id, data);
    observer$.subscribe({
      next: () => {
        if (type === FormType.ADDITION) {
          this.formSave.reset({
            title: '',
            mota: '',
            diemditich_ids: null,
            thoigian_batdau: '',
            thoigian_ketthuc: '',
            files: [],
            nhanvat_id: null,
            donvi_id: null,
            file_audio:[],
            linhvuc:null
          });
          this.characterAvatar = '';
        }
        this.needUpdate = true;
        this.notificationService.toastSuccess('Thao tác thành công', 'Thông báo');
      },
      error: () => this.notificationService.toastError('Thao tác thất bại', 'Thông báo')
    });
  }

  paginate({page}: NgPaginateEvent) {
    this.page = page + 1;
    this.loadData(this.page);
  }

  get f(): { [key: string]: AbstractControl<any> } {
    return this.formSave.controls;
  }

  onSearch(text: string) {
    this.search = text;
    this.paginator.changePage(1);
    this.loadData(1);
  }

  private preSetupForm(name: string, size:number) {
    this.notificationService.isProcessing(false);
    this.notificationService.openSideNavigationMenu({
      name: name,
      template: this.template,
      size:size,
      offsetTop: '0px'
    });
  }

  closeForm() {
    this.loadInit();
    this.stream.pause();
    this.notificationService.closeSideNavigationMenu(this.menuName);
  }
  changeInput(event: string) {
    setTimeout(()=>{
      this.loadData(1);
    },1000);
  }

  btnAdd(){
    this.formSave.reset({
      title: '',
      mota: '',
      diemditich_ids: null,
      thoigian_batdau: '',
      thoigian_ketthuc: '',
      files: [],
      nhanvat_ids: null,
      donvi_id: this.auth.userDonViId,
      file_audio:[],
      linhvuc:null
    });
    this.characterAvatar = '';
    this.formActive = this.listForm[FormType.ADDITION];
    this.preSetupForm(this.menuName,this.sizeFullWidth);
  }

  btnInformation(id:number){
    this.dataInfo = this.listData.find(f => f.id === id);
    this.descIframeView = this.dataInfo?  this.coverIframe(this.dataInfo.mota): [];
    setTimeout(() => this.notificationService.openSideNavigationMenu({
      name: this.menuName,
      template: this.formInformation,
      size: this.sizeFullWidth,
      offsetTop: '0px',
      offCanvas: false
    }), 100);

    const audio = new Audio();
    const source = document.createElement('source')
    source.setAttribute('src', this.dataInfo['__file_audio']);
    source.setAttribute('type', this.dataInfo.file_audio[0].type);
    audio.appendChild(source);
    void audio.play();
    if (this.stream) {
      this.stream.remove();
    }
    this.stream = audio;
  }
  btnEdit(object1:SuKien){

    this.btnNameSave ="Cập nhật";

    // const object1 = this.listData.find(u => u.id === decision.id);
    this.formSave.reset({
      title: object1.title,
      mota: object1.mota,
      diemditich_ids: object1.diemditich_ids,
      thoigian_batdau: object1.thoigian_batdau,
      thoigian_ketthuc: object1.thoigian_ketthuc,
      files: object1.files,
      nhanvat_ids: object1.nhanvat_ids,
      donvi_id: object1.donvi_id,
      ngulieu_ids: object1.ngulieu_ids,
      file_audio:object1.file_audio,
      linhvuc:object1.linhvuc
    })
    this.characterAvatar = object1.files ? getLinkDownload(object1.files.id):'';

    this.formSave.enable();
    this.formActive = this.listForm[FormType.UPDATE];
    this.formActive.object = object1;
    this.preSetupForm(this.menuName,this.sizeFullWidth);


  }
  async btnDelete(id:number){
    const confirm = await this.notificationService.confirmDelete();
    if (confirm) {
      this.nguLieuSuKienService.delete(id).subscribe({
        next: () => {
          this.page = Math.max(1, this.page - (this.listData.length > 1 ? 0 : 1));
          this.listData.filter(f=>f.id != id);
          this.notificationService.isProcessing(false);
          this.notificationService.toastSuccess('Thao tác thành công');
          this.loadData(this.page);
        }, error: () => {
          this.notificationService.isProcessing(false);
          this.notificationService.toastError('Thao tác không thành công');
        }
      })
    }
  }

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

  //su ly ảnh nền
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

  async onInputAvatar(event, fileChooser: HTMLInputElement) {
    if (fileChooser.files && fileChooser.files.length) {
      if (this.typeFileAdd.includes(fileChooser.files[0].type)){
        const file = await this.makeCharacterAvatar(fileChooser.files[0], this.helperService.sanitizeVietnameseTitle(this.f['title'].value));
        // upload file to server
        this.fileService.uploadFile(file, 1).subscribe({
          next: fileUl => {
            this.formSave.get('files').setValue(fileUl);
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

  btnCheck(sukien:SuKien){
    if(sukien.root === 1){
      this.nguLieuSuKienService.update(sukien.id, {root:0}).subscribe();
      this.listData.find(f=>f.id === sukien.id).root =0;
      // this.loadData(this.page);
      this.notificationService.toastSuccess('Thao tác thành công');

    }else if(sukien.root ===0){
      this.nguLieuSuKienService.update(sukien.id, {root:1}).subscribe();
      this.listData.find(f=>f.id === sukien.id).root =1;
      // this.loadData(this.page);
      this.notificationService.toastSuccess('Thao tác thành công');
    }
  }

  selectChangeTb(select:1|0){
    if (this.changeTb !== select) {
      this.changeTb = select;
    }
  }
  playAudio(num:1|0){
    if (num === 1) {
      this.stream.play();
    }
    if (num === 0) {
      this.stream.pause();
    }
  }

  coverIframe(text : string){
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const iframes = doc.querySelectorAll('iframe');
    console.log(iframes)
    return iframes;
  }


}


