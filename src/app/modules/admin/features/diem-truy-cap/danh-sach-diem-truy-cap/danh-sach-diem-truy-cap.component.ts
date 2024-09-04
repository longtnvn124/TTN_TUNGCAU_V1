import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Paginator} from "primeng/paginator";

import {FormType, NgPaginateEvent, OvicForm, OvicTableStructure} from "@shared/models/ovic-models";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {debounceTime, filter, forkJoin, Observable, Subject, Subscription} from "rxjs";
import {DmDiemDiTich, DmLoaiNguLieu} from "@shared/models/danh-muc";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {NotificationService} from "@core/services/notification.service";
import {DanhMucDiemDiTichService} from "@shared/services/danh-muc-diem-di-tich.service";
import {AuthService} from "@core/services/auth.service";
import {FileService} from "@core/services/file.service";
import {OvicButton} from "@core/models/buttons";
import {Point} from "@shared/models/point";
import {PointsService} from "@shared/services/points.service";
import {DanhMucLinhVucService} from "@shared/services/danh-muc-linh-vuc.service";
import {DanhMucLoaiNguLieuService} from "@shared/services/danh-muc-loai-ngu-lieu.service";
import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";
import {EmployeesPickerService} from "@shared/services/employees-picker.service";
import {TypeOptions} from "@shared/utils/syscat";
import {OvicFile} from "@core/models/file";
import {DownloadProcess} from "@shared/components/ovic-download-progress/ovic-download-progress.component";
import {MediaService} from "@shared/services/media.service";

interface FormDiemTruyCap extends OvicForm {
  object: Point;
}

const PinableValidator = (control: AbstractControl): ValidationErrors | null => {
  if (control.get('type').valid && control.get('type').value) {
    if (control.get('type').value === 'DIRECT') {
      return control.get('ds_ngulieu').value && Array.isArray(control.get('ds_ngulieu').value) && control.get('ds_ngulieu').value.some(nl => ['image360', 'video360'].includes(nl['loaingulieu'])) ? null : {invalidPinable: true}
    } else {
      return null;
    }
  } else {
    return {invalid: true};
  }
}

@Component({
  selector: 'app-danh-sach-diem-truy-cap',
  templateUrl: './danh-sach-diem-truy-cap.component.html',
  styleUrls: ['./danh-sach-diem-truy-cap.component.css']
})
export class DanhSachDiemTruyCapComponent implements OnInit {

  @ViewChild('fromUpdate', {static: true}) template: TemplateRef<any>;
  @ViewChild('formMedia') formMedia: TemplateRef<any>;
  @ViewChild(Paginator) paginator: Paginator;


  mode: 'TABLE' | 'MEDIAVR' = "TABLE";
  btn_checkAdd:"Lưu lại"|"Xác nhận";
  filePermission = {
    canDelete: true,
    canDownload: true,
    canUpload: true
  };
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
  typeOptions = TypeOptions;

  destination: Ngulieu;

  otherInfo: Ngulieu[];

  tblStructure: OvicTableStructure[] = [
    {
      fieldType: 'normal',
      field: ['__diemditich_converted'],
      innerData: true,
      header: 'Tiêu đề điểm  truy cập',
      sortable: false,

    },
    {
      fieldType: 'normal',
      field: ['__type_converted'],
      innerData: true,
      header: 'loại điểm truy cập',
      sortable: false,
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
          tooltip: 'Tạo điểm bắt đầu',
          label: '',
          icon: 'pi pi-check-square',
          name: 'ADD_POINT_START',
            cssClass: 'btn-secondary rounded',
          conditionField: 'root',
          conditionMultiValues: [0]
        },
        {
          tooltip: 'Xoá Điểm bắt đầu',
          label: '',
          icon: 'pi pi-times-circle',
          name: 'DELETE_POINT_START',
          cssClass: 'btn-success rounded',
          conditionField: 'root',
          conditionMultiValues: [1]
        },
        {
          tooltip: 'Truy cập Vr360',
          label: '',
          icon: 'pi pi-globe',
          name: 'MEDIAVR_DECISION',
          cssClass: 'btn-warning rounded',
          conditionField: 'type',
          conditionValue: 'DIRECT'
        },
        {
          tooltip: 'Truy cập Vr360',
          label: '',
          icon: 'pi pi-globe',
          name: '__no_actions',
          cssClass: 'btn-secondary ovic-button--invisible rounded',
          conditionField: 'type',
          conditionValue: 'INFO'
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

  headButtons = [
    {
      label: 'Thêm điểm truy cập',
      name: 'BUTTON_ADD_NEW',
      icon: 'pi-plus pi',
      class: 'p-button-rounded p-button-success ml-3'
    },
  ];

  listForm = {
    [FormType.ADDITION]: {type: FormType.ADDITION, title: 'Thêm mới điểm truy cập di tích', object: null, data: null},
    [FormType.UPDATE]: {type: FormType.UPDATE, title: 'Cập nhật điểm truy cập di tích', object: null, data: null}
  };

  selectRadio: { value: number, label: string, key: string }[] = [
    {label: 'Điểm bắt đầu', value: 1, key: '1'},
    {label: 'Điểm truy cập', value: 0, key: '2'},

  ]
  formSave: FormGroup;
  private OBSERVE_PROCESS_FORM_DATA = new Subject<FormDiemTruyCap>();
  formActive: FormDiemTruyCap;
  data: Point[];
  rows = this.themeSettingsService.settings.rows;
  subscription = new Subscription();
  sizeFullWidth = 1024;
  isLoading = true;

  error = false;
  needUpdate = false;
  menuName: 'dm_diem-truy-cap';
  page = 1;
  recordsTotal = 0;
  index = 1;
  filter = {
    search: ''
  }

  constructor(
    private themeSettingsService: ThemeSettingsService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private danhMucDiemDiTichService: DanhMucDiemDiTichService,
    private pointsService: PointsService,
    private auth: AuthService,
    private fileService: FileService,
    private danhMucLoaiNguLieuService: DanhMucLoaiNguLieuService,
    private danhMucLinhVucService: DanhMucLinhVucService,
    private employeesPickerService: EmployeesPickerService,
    private mediaService: MediaService
  ) {
    this.formSave = this.fb.group({
      icon: [''],
      title: ['', Validators.required],
      mota: ['',],
      toado_map: [''],
      type: ['', Validators.required],
      ds_ngulieu: [[], Validators.required],
      parent_id: [null],
      donvi_id: [null, Validators.required],
      ditich_id: [null],

    }, {
      validators: PinableValidator
    });

    this.formSave.get('type').valueChanges.subscribe(value => {
      if (this.f['ds_ngulieu'].value && Array.isArray(this.f['ds_ngulieu'].value)) {
        if (value === 'DIRECT') {
          this.destination = this.f['ds_ngulieu'].value.find(n => ['image360', 'video360'].includes(n['loaingulieu']));
          this.otherInfo = this.f['ds_ngulieu'].value.filter(n => !['image360', 'video360'].includes(n['loaingulieu']));
        } else {
          this.destination = null;
          this.otherInfo = this.f['ds_ngulieu'].value;
        }
      } else {
        this.destination = null;
        this.otherInfo = [];
      }
    });


    this.formSave.get('ds_ngulieu').valueChanges.subscribe(value => {
      if (value && Array.isArray(value)) {
        if (this.formSave.get('type').value === 'DIRECT') {
          this.destination = this.f['ds_ngulieu'].value.find(n => ['image360', 'video360'].includes(n['loaingulieu']));
          this.otherInfo = this.f['ds_ngulieu'].value.filter(n => !['image360', 'video360'].includes(n['loaingulieu']));
        } else {
          this.destination = null;
          this.otherInfo = this.f['ds_ngulieu'].value;
        }
      } else {
        this.destination = null;
        this.otherInfo = [];
      }
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

  dataLoaingulieu: DmLoaiNguLieu[];
  dataDiemditich: DmDiemDiTich[];

  loadInit() {
    this.isLoading = true;
    forkJoin<[DmLoaiNguLieu[], DmDiemDiTich[]]>(
      this.danhMucLoaiNguLieuService.getDataUnlimit(),
      this.danhMucDiemDiTichService.getDataUnlimit(),
    ).subscribe({
      next: ([dataLoaingulieu, dataDiemditich]) => {
        this.dataLoaingulieu = dataLoaingulieu;
        this.dataDiemditich = dataDiemditich;
        this.loadData(1);
      },
      error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }
  dataFull :Point[];
  loadData(page) {
    const limit = this.themeSettingsService.settings.rows;
    this.index = (page * limit) - limit + 1;
    this.isLoading = true;
    forkJoin <[{data:Point[],recordsTotal:number}, Point[]]>([
      this.pointsService.loadPage(this.page),
      this.pointsService.load(),
    ]).subscribe({
      next: ([{data, recordsTotal},point]) => {
        this.dataFull = point;
        this.data = data.map(m => {
          m['__child']= point.map(a=>{
            a['__child'] = point.filter(f=>f.parent_id=== m.id);
            return a
          }).filter(f=>f.parent_id === m.id);
          m['__diemditich_converted'] = m.type ? m.title : this.dataDiemditich.find(f => f.id === m.ditich_id).ten;
          m['__type_converted'] = m.type ? this.typeOptions.find(f => f.value === m.type).label : null;
          return m;
        });
        this.recordsTotal = recordsTotal;
        this.isLoading = false;
        this.error = false;
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
        this.notificationService.toastError('Mất kết nối mạng');
      },
    });
  }

  private __processFrom({data, object, type}: FormDiemTruyCap) {
    const observer$: Observable<any> = type === FormType.ADDITION ? this.pointsService.create(data) : this.pointsService.update(object.id, data);
    observer$.subscribe({
      next: () => {
        this.needUpdate = true;
        if (type === FormType.ADDITION) {
          this.formSave.reset({
            icon: '',
            title: '',
            mota: '',
            type: '',
            ds_ngulieu: [],
            parent_id: null,
            donvi_id: this.auth.userDonViId,
            ditich_id: null,
            toado_map:''
          });
        }
        this.notificationService.toastSuccess('Thao tác thành công', 'Thông báo');
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

  onSearch(text: string) {
    this.filter.search = text;
    this.paginator.changePage(1);
    this.loadData(1);
  }

  private preSetupForm(name: string) {
    this.notificationService.isProcessing(false);
    this.notificationService.openSideNavigationMenu({
      name,
      template: this.template,
      size: 700,
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
    const decision = button.data && this.data ? this.data.find(u => u.id === button.data) : null;
    switch (button.name) {
      case 'BUTTON_ADD_NEW':
        this.btn_checkAdd= "Lưu lại";
        this.formSave.reset({
          icon: '',
          title: '',
          mota: '',
          toado_map: '',
          type: '',
          ds_ngulieu: [],
          parent_id: null,
          donvi_id: this.auth.userDonViId,
          ditich_id: null,
        });
        // this.characterAvatar = ''
        this.formActive = this.listForm[FormType.ADDITION];
        this.preSetupForm(this.menuName);
        break;
      case 'EDIT_DECISION':
        this.btn_checkAdd= "Xác nhận";
        const object1 = this.data.find(u => u.id === decision.id);

        this.formSave.reset({
          icon: object1.icon,
          title: object1.title,
          mota: object1.mota,
          toado_map: object1.toado_map,
          type: object1.type,
          donvi_id: object1.donvi_id,
          parent_id: object1.parent_id,
          ds_ngulieu: object1.ds_ngulieu,
          ditich_id: object1.ditich_id,
        });
        // this.characterAvatar = object1.ds_ngulieu ? getLinkDownload(object1.ds_ngulieu['id']) : '';
        this.formActive = this.listForm[FormType.UPDATE];
        this.formActive.object = object1;
        this.preSetupForm(this.menuName);
        break;
      case 'DELETE_DECISION':
        if (decision.root === 0) {
          const confirm = await this.notificationService.confirmDelete();
          if (confirm) {
            this.danhMucDiemDiTichService.delete(decision.id).subscribe({
              next: () => {
                this.page = Math.max(1, this.page - (this.data.length > 1 ? 0 : 1));
                this.notificationService.isProcessing(false);
                this.notificationService.toastSuccess('Thao tác thành công');
                this.loadData(this.page);

              }, error: () => {
                this.notificationService.isProcessing(false);
                this.notificationService.toastError('Thao tác không thành công');
              }
            })
          }
        } else {
          this.notificationService.toastError('Điểm truy cập này đang được gắn điểm bắt đầu')
        }
        break;
      case 'MEDIAVR_DECISION':
        this.mode = "MEDIAVR";
        this.ngulieuView = decision.ds_ngulieu[0];
        this.diemditichPoint = decision;
        break;
      case 'ADD_POINT_START':
        const isRoot = this.data.find(f => f.root === 1);
        if (isRoot) {
          this.notificationService.toastWarning('Điểm bắt đầu đã được xét');
        } else {
          this.notificationService.isProcessing(true);
          this.pointsService.update(decision.id, {root: 1}).subscribe({
            next: () => {
              this.loadData(1);
              this.notificationService.isProcessing(false);
            }, error: () => {
              this.notificationService.isProcessing(false);
              this.notificationService.toastError('Mất kết nối với máy chủ')
            }
          })
        }
        break;
      case 'DELETE_POINT_START':
        const isRoot1 = decision.root === 1;
        if (!isRoot1) {
          this.notificationService.toastWarning('Điểm truy cập này chưa được gắn là điểm bắt đầu');
        } else {
          this.notificationService.isProcessing(true);
          this.pointsService.update(decision.id, {root: 0}).subscribe({
            next: () => {
              this.notificationService.isProcessing(false);
              this.loadData(1);
            }, error: () => {
              this.notificationService.isProcessing(false);
              this.notificationService.toastError('Mất kết nối với máy chủ');
            }
          })
        }
        break
      default:
        break;
    }
  }

  diemditichPoint: Point;

  ngulieuView: Ngulieu;

  saveForm() {
    if (this.formSave.valid) {
      this.formActive.data = this.formSave.value;
      this.OBSERVE_PROCESS_FORM_DATA.next(this.formActive);
    } else {
      this.formSave.markAllAsTouched();
      this.notificationService.toastError('Vui lòng điền đầy đủ thông tin');
    }
  }

  onChangeDitich(event) {
    const value = event.value;
    const ditich = this.dataDiemditich.find(f => f.id === value);
    if (value) {
      this.f['title'].setValue(ditich.ten);
      this.f['mota'].setValue(ditich.mota);
      this.f['toado_map'].setValue(ditich.toado);
    } else {
      this.f['title'].setValue('');
      this.f['mota'].setValue('');
      this.f['toado_mpa'].setValue('');

    }
  }


  dsNgulieu: Ngulieu[];

  async btnAddNgulieu(type) {
    const result = await this.employeesPickerService.pickerNgulieu([], '', type);
    const value = [].concat(this.f['ds_ngulieu'].value, result);
    this.f['ds_ngulieu'].setValue(value);
    this.f['ds_ngulieu'].markAsUntouched();
  }

  deleteNguLieuOnForm(n: Ngulieu) {
    if (this.f['ds_ngulieu'].value && Array.isArray(this.f['ds_ngulieu'].value)) {
      const newValues = this.f['ds_ngulieu'].value.filter(u => u.id !== n.id);
      this.f['ds_ngulieu'].setValue(newValues);
      this.f['ds_ngulieu'].markAsTouched();
    } else {
      this.f['ds_ngulieu'].setValue([]);
      this.f['ds_ngulieu'].markAsTouched();
    }
  }

  btnExit() {
    this.mode = 'TABLE';
  }

  async btnDownloadFIle(n: Ngulieu) {
    const file = n.file_media[0];
    const result = await this.mediaService.tplDownloadFile(file as OvicFile);
    switch (result) {
      case DownloadProcess.rejected:
        this.notificationService.toastInfo('Chưa hỗ trợ tải xuống thư mục');
        break;
      case DownloadProcess.error:
        this.notificationService.toastError('Tải xuống thất bại');
        break;
    }
  }
}
