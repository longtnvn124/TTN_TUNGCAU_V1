import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {AuthService} from '@core/services/auth.service';
import {HelperService} from '@core/services/helper.service';
import {NotificationService} from '@core/services/notification.service';
import {ThemeSettingsService} from '@core/services/theme-settings.service';
import {FormType, NgPaginateEvent, OvicForm, OvicTableStructure} from '@modules/shared/models/ovic-models';
import {DmChuyenMuc} from "@shared/models/danh-muc";
import {debounceTime, filter, Observable, Subject, Subscription} from 'rxjs';
import {DanhMucChuyenMucService} from "@shared/services/danh-muc-chuyen-muc.service";
import {Paginator} from 'primeng/paginator';
import {OvicButton} from '@core/models/buttons';

interface FormDmChuyenMuc extends OvicForm {
  object: DmChuyenMuc;
}

const PinableValidator = (control: AbstractControl): ValidationErrors | null => {
  if (control.get('ten').valid && control.get('ten').value) {
    return control.get('ten').value.trim().length >0 ? null :{invalid:true };
  } else {
    return {invalid: true};
  }
}

@Component({
  selector: 'app-chuyen-muc',
  templateUrl: './chuyen-muc.component.html',
  styleUrls: ['./chuyen-muc.component.css']
})
export class ChuyenMucComponent implements OnInit {
  @ViewChild('fromUpdate', {static: true}) template: TemplateRef<any>;
  @ViewChild('formMembers', {static: true}) formMembers: TemplateRef<any>;
  @ViewChild(Paginator) paginator: Paginator;
  listData: DmChuyenMuc[];
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
      field: ['__ten_converted'],
      innerData: true,
      header: 'Tên',
      sortable: false
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
      headClass: 'ovic-w-120px text-center',
      buttons: [
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

  headButtons = [
    {
      label: 'Thêm chuyên mục',
      name: 'BUTTON_ADD_NEW',
      icon: 'pi-plus pi',
      class: 'p-button-rounded p-button-success ml-3 mr-2'
    },
  ];
  listForm = {
    [FormType.ADDITION]: {type: FormType.ADDITION, title: 'Thêm mới chuyên mục', object: null, data: null},
    [FormType.UPDATE]: {type: FormType.UPDATE, title: 'Cập nhật chuyên mục', object: null, data: null}
  };
  formActive: FormDmChuyenMuc;
  formSave: FormGroup;

  private OBSERVE_PROCESS_FORM_DATA = new Subject<FormDmChuyenMuc>();

  rows = this.themeSettingsService.settings.rows;
  loadInitFail = false;
  subscription = new Subscription();
  sizeFullWidth = 1024;
  isLoading = true;
  needUpdate = false;

  menuName: 'dm_chuyenmuc';

  page = 1;
  btn_checkAdd: 'Lưu lại' | 'Cập nhật';
  recordsTotal = 0;

  index = 1;
  filter = {
    search: ''
  }

  constructor(
    private themeSettingsService: ThemeSettingsService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private auth: AuthService,
    private helperService: HelperService,
    private danhMucChuyenMucService: DanhMucChuyenMucService
  ) {
    this.formSave = this.fb.group({
      ten: ['', Validators.required],
      mota: [''],
      status: [null, Validators.required],
    }, {
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

  loadData(page:number, search?:string) {
    const limit = this.themeSettingsService.settings.rows;
    this.index = (page * limit) - limit + 1;
    let newsearch:string = search? search : this.filter.search;
    this.danhMucChuyenMucService.search(page, null, newsearch).subscribe({
      next: ({data, recordsTotal}) => {
        this.recordsTotal = recordsTotal;
        this.listData = data.map(m => {
          const sIndex = this.statusList.findIndex(i => i.value === m.status);
          m['__status'] = sIndex !== -1 ? this.statusList[sIndex].color : '';
          m['__ten_converted'] = `<b>${m.ten}</b><br>` + m.mota;
          return m;
        })
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  private __processFrom({data, object, type}: FormDmChuyenMuc) {
    const observer$: Observable<any> = type === FormType.ADDITION ? this.danhMucChuyenMucService.create(data) : this.danhMucChuyenMucService.update(object.id, data);
    observer$.subscribe({
      next: () => {
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

  onSearch(text: string) {
    this.filter.search = text;
    this.paginator.changePage(1);
    this.loadData(1, text);
  }

  private preSetupForm(name: string) {
    this.notificationService.isProcessing(false);
    this.notificationService.openSideNavigationMenu({
      name,
      template: this.template,
      size: 600,
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
          status: '',

        });
        this.formActive = this.listForm[FormType.ADDITION];
        this.preSetupForm(this.menuName);
        break;
      case 'EDIT_DECISION':
        this.btn_checkAdd = "Cập nhật";

        const object1 = this.listData.find(u => u.id === decision.id);
        this.formSave.reset({
          ten: object1.ten,
          mota: object1.mota,
          status: object1.status,

        })
        this.formActive = this.listForm[FormType.UPDATE];
        this.formActive.object = object1;
        this.preSetupForm(this.menuName);
        break;
      case 'DELETE_DECISION':
        const confirm = await this.notificationService.confirmDelete();
        if (confirm) {
          this.danhMucChuyenMucService.delete(decision.id).subscribe({
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
      default:
        break;
    }
  }

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
        this.notificationService.toastError('Vui lòng không nhập khoảng trống');
      }
    } else {
      this.formSave.markAllAsTouched();
      this.notificationService.toastError('Vui lòng nhập đủ thông tin');
    }
  }


}
