import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormType, NgPaginateEvent, OvicForm, OvicTableStructure} from "@shared/models/ovic-models";
import {DmDiemDiTich} from "@shared/models/danh-muc";
import {Paginator} from "primeng/paginator";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {debounceTime, filter, Observable, Subject, Subscription} from "rxjs";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {DanhMucDiemDiTichService} from "@shared/services/danh-muc-diem-di-tich.service";
import {NotificationService} from "@core/services/notification.service";
import {OvicButton} from "@core/models/buttons";
import {OvicMapComponent} from "@shared/components/ovic-map/ovic-map.component";
import {MODULES_QUILL} from "@shared/utils/syscat";


interface FormDmDiemDiTich extends OvicForm {
  object: DmDiemDiTich;
}
const PinableValidator = (control: AbstractControl): ValidationErrors | null => {
  if (control.get('ten').valid && control.get('ten').value) {
    return control.get('ten').value.trim().length >0 ? null :{invalid:true };
  } else {
    return {invalid: true};
  }
}

@Component({
  selector: 'app-diem-di-tich',
  templateUrl: './diem-di-tich.component.html',
  styleUrls: ['./diem-di-tich.component.css']
})
export class DiemDiTichComponent implements OnInit {
  @ViewChild('fromUpdate', {static: true}) template: TemplateRef<any>;
  @ViewChild('formMedia') formMedia: TemplateRef<any>;
  @ViewChild(Paginator) paginator: Paginator;
  @ViewChild(OvicMapComponent) ovicMapComp: OvicMapComponent;
  statusList = [
    {
      value: 1,
      label: 'Active',
      color: '<span class="badge badge--size-normal badge-success w-100">Active</span>'
    },
    {
      value: 0,
      label: 'Inactive',
      color: '<span class="badge badge--size-normal badge-danger w-100">Inactive</span>'
    }
  ];

  tblStructure: OvicTableStructure[] = [
    {
      fieldType: 'normal',
      field: ['ten'],
      innerData: true,
      header: 'Tên',
      sortable: false,
    },
    {
      fieldType: 'normal',
      field: ['__status'],
      innerData: true,
      header: 'Trạng thái',
      sortable: false,
      headClass: 'ovic-w-110px text-center',
      rowClass: 'ovic-w-110px text-center'
    },
    {
      tooltip: '',
      fieldType: 'buttons',
      field: [],
      rowClass: 'ovic-w-110px text-center',
      checker: 'fieldName',
      header: 'Thao tác',
      sortable: false,
      headClass: 'ovic-w-180px text-center',
      buttons: [
        {
          tooltip: 'Xem vị trí  ',
          label: '',
          icon: 'pi pi-map',
          name: 'MAP_DECTISION',
          cssClass: 'btn-warning rounded'
        },
        {
          tooltip: 'Thông tin chi tiết ',
          label: '',
          icon: 'pi pi-file',
          name: 'INFORMATION_DECTISION',
          cssClass: 'btn-secondary rounded'
        },
        {
          tooltip: 'Sửa',
          label: '',
          icon: 'pi pi-file-edit',
          name: 'EDIT_DECISION',
          cssClass: 'btn-primary rounded'
        },
        {
          tooltip: 'Xoá',
          label: '',
          icon: 'pi pi-trash',
          name: 'DELETE_DECISION',
          cssClass: 'btn-danger rounded'
        }
      ]
    }
  ];
  module_quill:any = MODULES_QUILL;
  headButtons = [
    {
      label: 'Thêm di tích',
      name: 'BUTTON_ADD_NEW',
      icon: 'pi-plus pi',
      class: 'p-button-rounded p-button-success ml-3 mr-2'
    },
  ];

  listForm = {
    [FormType.ADDITION]: {type: FormType.ADDITION, title: 'Thêm mới di tích', object: null, data: null},
    [FormType.UPDATE]: {type: FormType.UPDATE, title: 'Cập nhật di tích', object: null, data: null}
  };

  formActive: FormDmDiemDiTich;
  formSave: FormGroup;

  private OBSERVE_PROCESS_FORM_DATA = new Subject<FormDmDiemDiTich>();

  listData: DmDiemDiTich[];
  rows = this.themeSettingsService.settings.rows;
  loadInitFail = false;
  subscription = new Subscription();
  sizeFullWidth = 1024;
  isLoading = true;
  needUpdate = false;
  menuName: 'diem-truy-cap';
  btn_checkAdd: 'Lưu lại' | 'Cập nhật';
  page = 1;

  recordsTotal = 0;

  index = 1;
  filter = {
    search: ''
  }

  dataBinding: DmDiemDiTich;

  filePermission = {
    canDelete: true,
    canDownload: true,
    canUpload: true
  };

  onResizeMap: Subject<string> = new Subject<string>();
  visible: boolean = false;

  constructor(
    private themeSettingsService: ThemeSettingsService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private danhMucDiemDiTichService: DanhMucDiemDiTichService,
  ) {
    this.formSave = this.fb.group({
      ten: ['', Validators.required],
      mota: [''],
      status: ['', Validators.required],
      toado: ['']
    },{
      validators: PinableValidator

    });

    const observeProcessFormData = this.OBSERVE_PROCESS_FORM_DATA.asObservable().pipe(debounceTime(100)).subscribe(form => this.__processFrom(form));
    this.subscription.add(observeProcessFormData);
    const observeProcessCloseForm = this.notificationService.onSideNavigationMenuClosed().pipe(filter(menuName => menuName === this.menuName && this.needUpdate)).subscribe(() => this.loadData(this.page));
    this.subscription.add(observeProcessCloseForm);
    const observerOnResize = this.notificationService.observeScreenSize.subscribe(size => this.sizeFullWidth = size.width)
    this.subscription.add(observerOnResize);
  }

  ngOnInit(): void {
    this.loadInit()
  }

  loadInit() {
    this.isLoading = true;
    this.loadData(1);
  }

  dataNameDiTich:string[];
  loadData(page) {
    const limit = this.themeSettingsService.settings.rows;
    this.index = (page * limit) - limit + 1;
    this.danhMucDiemDiTichService.search(page, null, this.filter.search).subscribe({
      next: ({data, recordsTotal}) => {
        this.recordsTotal = recordsTotal;
        this.listData = data.map(m => {
          const sIndex = this.statusList.findIndex(i => i.value === m.status);
          m['__status'] = sIndex !== -1 ? this.statusList[sIndex].color : '';
          return m;
        })
        this.dataNameDiTich = this.listData.map(m=>m.ten);
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  private __processFrom({data, object, type}: FormDmDiemDiTich) {
    const observer$: Observable<any> = type === FormType.ADDITION ? this.danhMucDiemDiTichService.create(data) : this.danhMucDiemDiTichService.update(object.id, data);
    observer$.subscribe({
      next: () => {
        this.needUpdate = true;

        if (type === FormType.ADDITION) {
          this.formSave.reset({
            ten: '',
            mota: '',
            status: '',
            toado: ''
          });
        }
        this.notificationService.toastSuccess('Thao tác thành công', 'Thông báo');
      },
      error: () => this.notificationService.toastError('Thao tác thất bại', 'Thông báo')
    });
  }

  paginate({page}: NgPaginateEvent) {
    this.page = page + 1;
    this.loadData(this.page);
  }

  onSearch(text: string) {
    this.filter.search = text;
    this.paginator.changePage(1);
    this.loadData(1);
  }

  private preSetupForm(name: string) {
    this.notificationService.isProcessing(false);
    this.notificationService.openSideNavigationMenu({
      name: name,
      template: this.template,
      size: 1024,
      offsetTop: '0px'
    });
  }

  closeForm() {
    this.loadInit();
    this.notificationService.closeSideNavigationMenu(this.menuName);
  }

  async handleClickOnTable(button: OvicButton) {
    if (!button) {
      return;
    }
    const decision = button.data && this.listData ? this.listData.find(u => u.id === button.data) : null;
    switch (button.name) {
      case 'BUTTON_ADD_NEW':
        this.btn_checkAdd = "Lưu lại";
        this.formSave.reset({
          ten: '',
          mota: '',
          status: null,
          toado: ''
        });
        // this.characterAvatar = ''
        this.formActive = this.listForm[FormType.ADDITION];
        this.preSetupForm(this.menuName);
        break;
      case 'EDIT_DECISION':
        this.btn_checkAdd = "Cập nhật"
        const object1 = this.listData.find(u => u.id === decision.id);
        this.formSave.reset({
          ten: object1.ten,
          mota: object1.mota,
          status: object1.status,
          toado: object1.toado
        });
        this.formActive = this.listForm[FormType.UPDATE];
        this.formActive.object = object1;
        this.preSetupForm(this.menuName);
        break;
      case 'DELETE_DECISION':
        const confirm = await this.notificationService.confirmDelete();
        if (confirm) {
          this.danhMucDiemDiTichService.delete(decision.id).subscribe({
            next: () => {
              this.page = Math.max(1, this.page - (this.listData.length > 1 ? 0 : 1));
              this.notificationService.isProcessing(false);
              this.notificationService.toastSuccess('Thao tác thành công');
              this.loadData(this.page);

            }, error: () => {
              this.notificationService.isProcessing(false);
              this.notificationService.toastError('Thao tác không thành công');
            }
          })
        }
        break;
      case 'INFORMATION_DECTISION':
        this.dataInformation = this.listData.find(u => u.id === decision.id);
        this.visible = true;
        break;
      case 'MAP_DECTISION':

        const data = this.listData.find(u => u.id === decision.id);
        if (data.toado) {
          this.dataBinding = data;
        } else {
          this.dataBinding = null;
        }
        this.visibleMap = true;


        break
      default:
        break;
    }
  }

  onShow: boolean = false;
  visibleMap: boolean = false;
  dataInformation: DmDiemDiTich;

  get f(): { [key: string]: AbstractControl<any> } {
    return this.formSave.controls;
  }

  saveForm() {
    const titleInput = this.f['ten'].value.trim();
    this.f['ten'].setValue(titleInput);
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

  btnReload() {
    this.ovicMapComp.btnReload();
  }

}
