import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormType, NgPaginateEvent, OvicForm, OvicTableStructure} from "@shared/models/ovic-models";
import {Shift, statusOptions} from "@shared/models/quan-ly-doi-thi";
import {debounceTime, filter, Observable, Subject, Subscription} from "rxjs";
import {AbstractControl, FormBuilder, FormGroup,Validators} from "@angular/forms";
import {NotificationService} from "@core/services/notification.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {OvicButton} from "@core/models/buttons";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {NganHangDe} from "@shared/models/quan-ly-ngan-hang";
import {HelperService} from '@core/services/helper.service';
import {MODULES_QUILL} from "@shared/utils/syscat";
interface FormDotthi extends OvicForm {
  object: Shift;
}

@Component({
  selector: 'app-dot-thi-danh-sach',
  templateUrl: './dot-thi-danh-sach.component.html',
  styleUrls: ['./dot-thi-danh-sach.component.css']
})

export class DotThiDanhSachComponent implements OnInit {
  @ViewChild('fromUpdate', {static: true}) fromUpdate: TemplateRef<any>;
  rows = this.themeSettingsService.settings.rows;
  loadInitFail: false;
  formActive: FormDotthi;
  formSave: FormGroup;
  page = 1;
  subscription = new Subscription();
  index: number;
  sizeFullWidth = 1024;
  recordsTotal: number;
  isLoading = true;
  needUpdate = false;
  search: string;
  statusOptions = statusOptions;
  menuName = 'DsDotthi';
  listData: Shift[];
  nganHangDe: NganHangDe[];
  btn_checkAdd: 'Lưu lại' | 'Cập nhật';
  private OBSERVE_PROCESS_FORM_DATA = new Subject<FormDotthi>();
  tblStructure: OvicTableStructure[] = [
    {
      fieldType: 'normal',
      field: ['__title_converted'],
      innerData: true,
      header: 'Tên đợt thi',
      sortable: false,

    },

    {
      fieldType: 'normal',
      field: ['__time_converted'],
      innerData: true,
      header: 'Thời gian thi',
      sortable: false,
      headClass: 'ovic-w-300px text-center',
      rowClass: 'ovic-w-300px text-center'
    },
    {
      fieldType: 'normal',
      field: ['__bank_coverted'],
      innerData: true,
      header: 'Ngân hàng đề sử dụng',
      sortable: false,
      headClass: 'ovic-w-180px text-center',
      rowClass: 'ovic-w-180px text-center'
    },
    {
      fieldType: 'normal',
      field: ['__status_converted'],
      innerData: true,
      header: 'Trạng thái',
      sortable: false,
      headClass: 'ovic-w-120px text-center',
      rowClass: 'ovic-w-120px text-center'
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
      label: 'Thêm đợt thi',
      name: 'BUTTON_ADD_NEW',
      icon: 'pi-plus pi',
      class: 'p-button-rounded p-button-success ml-3 mr-2'
    },
  ];
  listForm = {
    [FormType.ADDITION]: {type: FormType.ADDITION, title: 'Thêm mới đợt thi ', object: null, data: null},
    [FormType.UPDATE]: {type: FormType.UPDATE, title: 'Cập nhật đợt thi ', object: null, data: null}
  };
  module_quill: any = MODULES_QUILL;

  constructor(
    private dotThiDanhSachService: DotThiDanhSachService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private themeSettingsService: ThemeSettingsService,
    private nganHangDeService: NganHangDeService,
    private helperService: HelperService,

  ) {
    this.formSave = this.fb.group({
      title: ['', Validators.required],
      desc: [''],
      time_start: ['', Validators.required],
      time_end: ['', Validators.required],
      bank_id: ['', Validators.required],
      status: [1],
    },
      // {validators:PinableValidator}
    );
    const observeProcessFormData = this.OBSERVE_PROCESS_FORM_DATA.asObservable().pipe(debounceTime(100)).subscribe(form => this.__processFrom(form));
    this.subscription.add(observeProcessFormData);
    const observeProcessCloseForm = this.notificationService.onSideNavigationMenuClosed().pipe(filter(menuName => menuName === this.menuName && this.needUpdate)).subscribe(() => this.loadData(this.page));
    this.subscription.add(observeProcessCloseForm);
    const observerOnResize = this.notificationService.observeScreenSize.subscribe(size => this.sizeFullWidth = size.width)
    this.subscription.add(observerOnResize);
  }

  ngOnInit(): void {
    this.nganHangDeService.getDataUnlimit().subscribe({
      next: (data) => {
        this.nganHangDe = data.filter(f => f.number_questions_per_test <= f.total);
        this.loadInit();
      }, error: () => {
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  loadInit() {
    this.loadData(1);

  }

  strToTime(input: string): string {
    const date = input ? new Date(input) : null;
    let result = '';
    if (date) {
      result += [date.getDate().toString().padStart(2, '0'), (date.getMonth() + 1).toString().padStart(2, '0'), date.getFullYear().toString()].join('/');
      result += ' ' + [date.getHours().toString().padStart(2, '0'), date.getMinutes().toString().padStart(2, '0')].join(':');
    }
    return result;
  }
  loadData(page) {
    const limit = this.themeSettingsService.settings.rows;
    this.index = (page * limit) - limit + 1;
    this.isLoading = true;
    this.dotThiDanhSachService.load(page, this.search).subscribe({
      next: ({data, recordsTotal}) => {
        this.listData = data.map(m => {
          const timeszone = new Date(m.time_end).getTime() < new Date().getTime();
          m['__title_converted'] = `<b>${m.title}</b><br>`;
          m['__time_converted'] = this.strToTime(m.time_start) + ' - ' + this.strToTime(m.time_end);
          m['__bank_coverted'] = this.nganHangDe && m.bank_id && this.nganHangDe.find(f => f.id === m.bank_id) ? this.nganHangDe.find(f => f.id === m.bank_id).title : '';
          m['__status_converted'] = !timeszone ? this.statusOptions[1].color : this.statusOptions[0].color;
          return m;
        })
        this.recordsTotal = recordsTotal;
        this.isLoading = false
      }, error: () => {
        this.isLoading = false
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  get f(): { [key: string]: AbstractControl<any> } {
    return this.formSave.controls;
  }

  onSearch(text: string) {
    this.search = text;
    this.loadData(1);
  }

  paginate({page}: NgPaginateEvent) {
    this.page = page + 1;
    this.loadData(this.page);
  }

  private __processFrom({data, object, type}: FormDotthi) {
    const observer$: Observable<any> = type === FormType.ADDITION ? this.dotThiDanhSachService.create(data) : this.dotThiDanhSachService.update(object.id, data);
    observer$.subscribe({
      next: () => {
        this.needUpdate = true;
        this.notificationService.toastSuccess('Thao tác thành công', 'Thông báo');
      },
      error: () => this.notificationService.toastError('Thao tác thất bại', 'Thông báo')
    });
  }

  private preSetupForm(name: string) {
    this.notificationService.isProcessing(false);
    this.notificationService.openSideNavigationMenu({
      name,
      template: this.fromUpdate,
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
          title: '',
          desc: '',
          time_start: '',
          time_end: '',
          bank_id: 0,
          status: 1

        });
        this.formActive = this.listForm[FormType.ADDITION];
        this.preSetupForm(this.menuName);
        break;
      case 'EDIT_DECISION':
        this.btn_checkAdd = "Cập nhật";

        const object1 = this.listData.find(u => u.id === decision.id);
        this.formSave.reset({
          title: object1.title,
          desc: object1.desc,
          time_start: object1.time_start ? new Date(object1.time_start) : null,
          time_end: object1.time_end ? new Date(object1.time_end) : null,
          bank_id: object1.bank_id,
          status: object1.status

        })
        this.formActive = this.listForm[FormType.UPDATE];
        this.formActive.object = object1;
        this.preSetupForm(this.menuName);
        break;
      case 'DELETE_DECISION':
        const confirm = await this.notificationService.confirmDelete();
        if (confirm) {
          this.dotThiDanhSachService.delete(decision.id).subscribe({
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


  saveForm() {
    const titleInput = this.f['title'].value.trim();
    this.f['title'].setValue(titleInput);
    const timeszone = this.formatSQLDateTime(new Date(this.formSave.value['time_start'])) <  this.formatSQLDateTime(new Date(this.formSave.value['time_end']));
    if (this.formSave.valid) {
      if (titleInput !== '') {
        if (timeszone){
          this.formSave.value['time_start'] = this.formatSQLDateTime(new Date(this.formSave.value['time_start']));
          this.formSave.value['time_end'] = this.formatSQLDateTime(new Date(this.formSave.value['time_end']));
          this.formActive.data = this.formSave.value;
          this.OBSERVE_PROCESS_FORM_DATA.next(this.formActive);
        }else{
          this.notificationService.toastWarning('Thời gian nhập không hợp lệ');
        }

      } else {
        this.notificationService.toastError('Vui lòng không nhập khoảng trống');
      }
    } else {
      this.formSave.markAllAsTouched();
      this.notificationService.toastError('Vui lòng nhập đủ thông tin');
    }
  }

  formatSQLDateTime(date: Date): string {
    const y = date.getFullYear().toString();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const sec = '00';
    //'YYYY-MM-DD hh:mm:ss' type of sql DATETIME format
    return `${y}-${m}-${d} ${h}:${min}:${sec}`;
  }
}
