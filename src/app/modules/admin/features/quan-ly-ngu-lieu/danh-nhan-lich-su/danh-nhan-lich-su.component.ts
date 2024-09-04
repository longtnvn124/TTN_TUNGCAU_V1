import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {OvicForm} from "@shared/models/ovic-models";
import {DmNhanVatLichSu} from "@shared/models/danh-muc";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {filter, Subscription} from 'rxjs';
import {ThemeSettingsService} from '@core/services/theme-settings.service';
import {DanhMucNhanVatLichSuService} from '@modules/shared/services/danh-muc-nhan-vat-lich-su.service';
import {NotificationService} from '@core/services/notification.service';
import {FileService} from "@core/services/file.service";
import {HelperService} from "@core/services/helper.service";
import {AvatarMakerSetting, MediaService} from "@shared/services/media.service";
import {getLinkDownload} from "@env";
import {TYPE_FILE_IMAGE} from "@shared/utils/syscat";

interface FormDmNhanVatLichSu extends OvicForm {
  object: DmNhanVatLichSu;
}

const PinableValidator = (control: AbstractControl): ValidationErrors | null => {
  if (control.get('bietdanh').valid && control.get('bietdanh').value) {
    return control.get('ten').value.trim().length > 0 ? null : {invalid: true};
  } else {
    return {invalid: true};
  }
}

@Component({
  selector: 'app-danh-nhan-lich-su',
  templateUrl: './danh-nhan-lich-su.component.html',
  styleUrls: ['./danh-nhan-lich-su.component.css']
})
export class DanhNhanLichSuComponent implements OnInit {
  @ViewChild('fromUpdate', {static: true}) fromUpdate: TemplateRef<any>;
  @ViewChild('formInfo', {static: true}) formInfo: TemplateRef<any>;
  gioitinh = [{value: 1, label: 'Nam'}, {value: 0, label: 'Nữ'}];
  formActive: FormDmNhanVatLichSu;
  formSave: FormGroup;
  page = 1;
  subscription = new Subscription();
  sizeFullWidth = 1024;
  isLoading = true;
  needUpdate = false;
  menuName: 'dm_nhanvatlichsu';
  filter = {
    search: ''
  }
  listData: DmNhanVatLichSu[] = [];

  formState: {
    formType: 'add' | 'edit',
    showForm: boolean,
    formTitle: string,
    object: DmNhanVatLichSu | null
  } = {
    formType: 'add',
    showForm: false,
    formTitle: '',
    object: null
  }

  filePermission = {
    canDelete: true,
    canDownload: true,
    canUpload: true
  };
  btn_checkAdd: 'Lưu lại' | 'Cập nhật';
  characterAvatar: string;
  @ViewChild('fileChooser', {static: true}) fileChooser: TemplateRef<any>;

  modules : any = {
    imageResize : {
      displaySize : true ,
      modules     : [ 'Resize' , 'DisplaySize' , 'Toolbar' ]
    }
  };

  constructor(
    private themeSettingsService: ThemeSettingsService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private fileService: FileService,
    private danhMucNhanVatLichSuService: DanhMucNhanVatLichSuService,
    private mediaService: MediaService,
    private helperService: HelperService,
    private fileSerivce: FileService
  ) {
    this.formSave = this.fb.group({
      ten: ['', Validators.required],
      bietdanh: ['', Validators.required],
      mota: [''],
      nam: ['', Validators.required],
      gioitinh: [null, Validators.required],
      files: [],
    }, {validators: PinableValidator});
    const observeProcessCloseForm = this.notificationService.onSideNavigationMenuClosed().pipe(filter(menuName => menuName === this.menuName && this.needUpdate)).subscribe(() => this.loadData(this.page));
    this.subscription.add(observeProcessCloseForm);
    const observerOnResize = this.notificationService.observeScreenSize.subscribe(size => this.sizeFullWidth = size.width)
    this.subscription.add(observerOnResize);
  }

  ngOnInit(): void {
    this.loadInit()
  }

  loadInit() {
    this.loadData(1);
  }

  loadData(page) {
    this.notificationService.isProcessing(true);
    this.danhMucNhanVatLichSuService.search(page, null, this.filter.search).subscribe({
      next: (data) => {
        this.listData = data.map(m => {
          const sIndex = this.gioitinh.findIndex(i => i.value === m.gioitinh);
          m['__gioitinh_converted'] = sIndex !== -1 ? this.gioitinh[sIndex].label : '';
          m['image_convenrted'] = m.files ? this.fileSerivce.getPreviewLinkLocalFile(m.files) : '';

          return m;
        })

        this.notificationService.isProcessing(false);
      }, error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  get f(): { [key: string]: AbstractControl<any> } {
    return this.formSave.controls;
  }

  onSearch(text: string) {
    if (text == '') {
      this.filter.search = '';
      this.loadData(1);
    }
  }

  onkeyDowm(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.loadData(1);
    }
  }

  async btnDelete(id) {
    const xacNhanXoa = await this.notificationService.confirmDelete();
    if (xacNhanXoa) {
      this.notificationService.isProcessing(true);
      this.danhMucNhanVatLichSuService.delete(id).subscribe({
        next: () => {
          this.loadData(1);
          this.notificationService.isProcessing(false);
          this.notificationService.toastSuccess('Thao tác thành công');
        }, error: () => {
          this.notificationService.isProcessing(false);
          this.notificationService.toastError('Thao tác thất bại');
        }
      })
    }
  }

  onOpenFormEdit() {
    setTimeout(() => this.notificationService.openSideNavigationMenu({template: this.fromUpdate, size: 1000}), 100);
  }


  changeInputMode(formType: 'add' | 'edit', object: DmNhanVatLichSu | null = null) {
    this.formState.formTitle = formType === 'add' ? 'Thêm nhân vật lịch sử' : 'Cập nhật nhân vật lịch sử ';
    this.formState.formType = formType;
    if (formType === 'add') {
      this.btn_checkAdd = "Lưu lại";
      this.formSave.reset(
        {
          ten: '',
          bietdanh: '',
          mota: '',
          gioitinh: null,
          nam: '',
          files: null,

        }
      )
      this.characterAvatar = '';
    } else {
      this.formState.object = object;
      this.btn_checkAdd = "Cập nhật"
      this.formSave.reset(
        {
          ten: object.ten,
          bietdanh: object.bietdanh,
          mota: object.mota,
          gioitinh: object.gioitinh,
          nam: object.nam,
          files: object.files,
        }
      );
      this.characterAvatar = object.files ? getLinkDownload(object.files.id) : '';
    }
  }

  btnAdd() {
    this.onOpenFormEdit();
    this.changeInputMode('add');
  }

  btnEdit(object: DmNhanVatLichSu) {
    this.changeInputMode('edit', object);
    this.onOpenFormEdit();
  }

  saveForm() {
    const titleInput = this.f['bietdanh'].value.trim();
    this.f['bietdanh'].setValue(titleInput);
    if (this.formSave.valid) {
      if (titleInput !== '') {
        if (this.formState.formType === "add") {
          this.notificationService.isProcessing(true);
          this.danhMucNhanVatLichSuService.create(this.formSave.value).subscribe({
            next: () => {
              this.notificationService.isProcessing(false);
              this.notificationService.toastSuccess('Thêm mới thành công');
              this.formSave.reset({
                ten: '',
                bietdanh: '',
                mota: '',
                gioitinh: null,
                nam: '',
                files: null,
              });
            }, error: () => {
              this.notificationService.toastError("Thêm mới thất bại");
              this.notificationService.isProcessing(false);
            }
          })
        } else {
          this.notificationService.isProcessing(false);
          const index = this.listData.findIndex(r => r.id === this.formState.object.id);
          this.danhMucNhanVatLichSuService.update(this.listData[index].id, this.formSave.value).subscribe({
            next: () => {
              this.notificationService.isProcessing(false);
              this.notificationService.toastSuccess('Cập nhật thành công');
            }, error: () => {
              this.notificationService.isProcessing(false);
              this.notificationService.toastError("Cập nhật thất bại");
            }

          })
        }
      } else {
        this.notificationService.toastWarning('Vui lòng không nhập khoảng trống');
      }
    } else {
      this.formSave.markAllAsTouched();
      this.notificationService.toastWarning('Vui lòng nhập đủ thông tin');
    }
  }

  async makeCharacterAvatar(file: File, characterName: string): Promise<File> {
    try {
      const options: AvatarMakerSetting = {
        aspectRatio: 2 / 3,
        resizeToWidth: 200,
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
        const file = await this.makeCharacterAvatar(fileChooser.files[0], this.helperService.sanitizeVietnameseTitle(this.f['ten'].value));
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

  infoNhanvalichsu: DmNhanVatLichSu;

  btnShowInfo(object: DmNhanVatLichSu) {
    this.infoNhanvalichsu = null;
    setTimeout(() => this.notificationService.openSideNavigationMenu({
      name: this.menuName,
      template: this.formInfo,
      size: this.sizeFullWidth,
      offsetTop: '0px',
      offCanvas: false
    }), 100);
    this.infoNhanvalichsu = this.listData.find(f => f.id === object.id)
    this.infoNhanvalichsu['image_convenrted'] = this.infoNhanvalichsu.files ? this.fileService.getPreviewLinkLocalFile(this.infoNhanvalichsu.files) : null;
  }

  closeForm() {
    this.notificationService.closeSideNavigationMenu();
    this.loadData(1);
  }

}
