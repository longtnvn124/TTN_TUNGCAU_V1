import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {NotificationService} from "@core/services/notification.service";
import {NganHangDe} from "@shared/models/quan-ly-ngan-hang";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {FormType, NgPaginateEvent, OvicForm, OvicTableStructure} from "@shared/models/ovic-models";
import {debounceTime, filter, forkJoin, Subject, Subscription} from "rxjs";
import {OvicButton} from "@core/models/buttons";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {DateTimeServer, ServerTimeService} from "@shared/services/server-time.service";
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {Shift} from "@shared/models/quan-ly-doi-thi";
import {Auth} from "@core/models/auth";
import {AuthService} from "@core/services/auth.service";


interface FormNganHangDe extends OvicForm {
  object: NganHangDe;
}

const PinableValidator = (control: AbstractControl): ValidationErrors | null => {
  const typeControl = control.get('type_test');
  if (typeControl.valid) {
    if (typeControl.value === 'cabai') {
      const isInvalid = control.get('time_per_test').value > 0;
      return isInvalid ? null : {pinableError: 'Time is valid'};
    } else {
      const isInvalid = control.get('time_per_test_tungcau').value > 0;
      return isInvalid ? null : {pinableError: 'Time is valid'};
    }
  }
  return null;
}


@Component({
  selector: 'app-ngan-hang-de',
  templateUrl: './ngan-hang-de.component.html',
  styleUrls: ['./ngan-hang-de.component.css']
})
export class NganHangDeComponent implements OnInit {
  @ViewChild('fromUpdate', {static: true}) fromUpdate: TemplateRef<any>;
  @ViewChild('formAddQuestion', {static: true}) formAddQuestion: TemplateRef<any>;
  rows                : number = this.themeSettingsService.settings.rows;
  loadInitFail        : boolean = false;
  formActive          : FormNganHangDe;
  formSave            : FormGroup;
  page                : number = 1;
  subscription        : Subscription = new Subscription();
  index               : number;
  sizeFullWidth       : number = 1024;
  isLoading           : boolean = true;
  needUpdate          : boolean = false;
  menuName            : string = 'nganhangde';
  search              : string = '';
  listData            : NganHangDe[];
  recordsTotal        : number;
  bankQuestionSelect  : NganHangDe = null;
  dataTitle           :string[];
  btn_checkAdd        : 'Lưu lại' | 'Cập nhật';
  filePermission = {
    canDelete: true,
    canDownload: true,
    canUpload: true
  };
  private OBSERVE_PROCESS_FORM_DATA = new Subject<FormNganHangDe>();
  tblStructure: OvicTableStructure[] = [
    {
      fieldType: 'normal',
      field: ['__ten_converted'],
      innerData: true,
      header: 'Tên Ngân hàng',
      sortable: false,

    },

    {
      fieldType: 'normal',
      field: ['__type_converted'],
      innerData: true,
      header: 'Hình thức thi ',
      sortable: false,
      headClass: 'ovic-w-150px text-center',
      rowClass: 'ovic-w-150px text-center'
    },
    {
      fieldType: 'normal',
      field: ['total'],
      innerData: true,
      header: 'Tổng số câu hỏi',
      sortable: false,
      headClass: 'ovic-w-150px text-center',
      rowClass: 'ovic-w-150px text-center'
    },
    {
      fieldType: 'normal',
      field: ['number_questions_per_test'],
      innerData: true,
      header: 'Số câu hỏi trong 1 đề',
      sortable: false,
      headClass: 'ovic-w-160px text-center',
      rowClass: 'ovic-w-160px text-center'
    },
    {
      fieldType: 'normal',
      field: ['__time_exam'],
      innerData: true,
      header: 'Thời gian thi',
      sortable: false,
      headClass: 'ovic-w-110px text-center',
      rowClass: 'ovic-w-110px text-center'
    },
    {
      fieldType: 'normal',
      field: ['__status_exam'],
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
          tooltip: 'Thêm câu hỏi',
          label: '',
          icon: 'pi pi-server',
          name: 'EDIT_QUESTION_DECISION',
          cssClass: 'btn-warning rounded'
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
      label: 'Thêm ngân hàng',
      name: 'BUTTON_ADD_NEW',
      icon: 'pi-plus pi',
      class: 'p-button-rounded p-button-success ml-3 mr-2'
    },
  ];
  listForm = {
    [FormType.ADDITION]: {type: FormType.ADDITION, title: 'Thêm mới ngân hành đề', object: null, data: null},
    [FormType.UPDATE]: {type: FormType.UPDATE, title: 'Cập nhật ngân hành đề', object: null, data: null}
  };

  statusList = [
    {
      value: 1,
      label: 'Hợp lệ',
      color: '<span class="badge badge--size-normal badge-success w-100">Hợp lệ</span>'
    },
    {
      value: 0,
      label: 'Không hợp lệ',
      color: '<span class="badge badge--size-normal badge-danger w-100">Không hợp lệ</span>'
    }
  ];

  randomQuestion = [
    {label:'Đảo vị trí câu hỏi',value:1},
    {label:'Không vị trí câu hỏi',value:0},
  ];


  changeTb : string = 'cabai';// 'cabai' | 'tungcau'
  constructor(
    private nganHangDeService: NganHangDeService,
    private notificationService: NotificationService,
    private themeSettingsService: ThemeSettingsService,
    private serverTimeService : ServerTimeService ,
    private danhsachdoithiServicer:DotThiDanhSachService,
    private auth: AuthService,
    private fb: FormBuilder,
  ) {
    this.formSave = this.fb.group({
      title: ['', Validators.required],
      desc: [''],
      number_questions_per_test: [null,Validators.required],
      time_per_test: [0],
      time_per_test_tungcau: [0],
      type_test: ['cabai', Validators.required],
      random_question: [0, Validators.required],
    },{ validators: PinableValidator});

    const observeProcessFormData = this.OBSERVE_PROCESS_FORM_DATA.asObservable().pipe(debounceTime(100)).subscribe(form => this.__processFrom(form));
    this.subscription.add(observeProcessFormData);
    const observeProcessCloseForm = this.notificationService.onSideNavigationMenuClosed().pipe(filter(menuName => menuName === this.menuName && this.needUpdate)).subscribe(() => this.loadData(this.page));
    this.subscription.add(observeProcessCloseForm);
    const observerOnResize = this.notificationService.observeScreenSize.subscribe(size => this.sizeFullWidth = size.width)
    this.subscription.add(observerOnResize);
  }

  ngOnInit(): void {
    console.log(this.auth.roles);
    this.loadInit();
  }

  loadInit() {
    this.loadData(1);
  }

  loadData(page:number, search?: string) {
    let dataSearch = search || this.search;
    const limit = this.themeSettingsService.settings.rows;
    this.index = (page * limit) - limit + 1;
    this.isLoading = true
    this.nganHangDeService.load(page,dataSearch).subscribe({
      next: ({data, recordsTotal}) => {
        this.listData = data.map(m => {
          m['__ten_converted'] = `<b>${m.title}</b><br>` + m.desc;
          // m['__time_exam'] = (m.time_per_test/60) + ' phút';
          m['__time_exam'] = m.type_test === 'cabai' ?(m.time_per_test + ' phút') : (m.time_per_test_tungcau + 's / 1 câu') ;
          m['__status_exam'] = m.total >= m.number_questions_per_test ?  this.statusList[0].color: this.statusList[1].color;
          m['__type_converted'] = m.type_test  === 'cabai' ? 'Cả bài':'Từng câu';
          return m;
        });
        this.dataTitle = this.listData ? this.listData.map(m=>m.title):null;
        this.recordsTotal = recordsTotal;
        this.isLoading = false;
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
    this.loadData(1, text);
  }

  paginate({page}: NgPaginateEvent) {
    this.page = page + 1;
    this.loadData(this.page);
  }

  private __processFrom({data, object, type}: FormNganHangDe) {

    // if (this.f['time_per_test'].value>0 && this.f['number_questions_per_test'].value>0){
      if(type === FormType.ADDITION){
        if (this.dataTitle.includes(this.f['title'].value)){
          this.notificationService.toastWarning('Tên ngân hàng đề đã tồn tại');
        }else{
          this.nganHangDeService.create(data).subscribe({
            next: () => {
              this.needUpdate = true;
              this.loadData(this.page);
              this.formSave.reset({
                title: '',
                desc: '',
                number_questions_per_test: 0,
                time_per_test: 0,
              });
              this.notificationService.toastSuccess('Thao tác thành công', 'Thông báo');
            },
            error: () => this.notificationService.toastError('Thao tác thất bại', 'Thông báo')
          })
        }

      }else{
        this.nganHangDeService.update(object.id, data).subscribe({
          next: () => {
            this.needUpdate = true;
            this.loadData(this.page);
            this.notificationService.toastSuccess('Thao tác thành công', 'Thông báo');
          },
          error: () => this.notificationService.toastError('Thao tác thất bại', 'Thông báo')
        })
      }
    // }else if(this.f['time_per_test'].value<=0){
    //   this.f['time_per_test'].setValue(null);
    //   this.notificationService.toastWarning("Vui Lòng nhập đúng định dạng");
    // }
    // else if(this.f['number_questions_per_test'].value<=0){
    //   this.f['number_questions_per_test'].setValue(null);
    //   this.notificationService.toastWarning("Vui Lòng nhập đúng định dạng");
    // }else{
    //   this.f['time_per_test'].setValue(null);
    //   this.f['number_questions_per_test'].setValue(null);
    //   this.notificationService.toastWarning("Vui Lòng nhập đúng định dạng");
    // }

  }

  private preSetupForm(name: string) {
    this.notificationService.isProcessing(false);
    this.notificationService.openSideNavigationMenu({
      name,
      template: this.fromUpdate,
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
        this.changeTb = 'cabai';

        this.btn_checkAdd = "Lưu lại";
        this.formActive = this.listForm[FormType.ADDITION];
        this.preSetupForm(this.menuName);
        this.formSave.reset({
          title: '',
          desc: '',
          number_questions_per_test: 0,
          time_per_test: 0,
          random_question:0,
          type_test:'cabai',
          time_per_test_tungcau:0,


        });
        break;
      case 'EDIT_DECISION':
        this.selectChangeTb(decision.type_test);
        this.btn_checkAdd = "Cập nhật";
        const object1 = this.listData.find(u => u.id === decision.id);
        this.formSave.reset({
          title: object1.title,
          desc: object1.desc,
          number_questions_per_test: object1.number_questions_per_test,
          time_per_test: object1.time_per_test,
          random_question:object1.random_question,
          type_test:object1.type_test,
          time_per_test_tungcau:object1.time_per_test_tungcau,
        })
        this.formActive = this.listForm[FormType.UPDATE];
        this.formActive.object = object1;
        this.preSetupForm(this.menuName);

        break;

      case 'DELETE_DECISION':
        this.checkdotthi(decision.id);
        break;
      case 'EDIT_QUESTION_DECISION':
        this.bankQuestionSelect = {...decision};
        this.notificationService.openSideNavigationMenu({
          name:this.menuName,
          template: this.formAddQuestion,
          size: this.sizeFullWidth,
          offsetTop: '0px'
        })

        break;
      default:
        break;
    }
  }

  saveForm() {
    const titleInput = this.f['title'].value.trim();
    this.f['title'].setValue(titleInput);
    console.log(this.formSave.value);
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

  async checkdotthi(bank_id:number){
    const confirm = await this.notificationService.confirmDelete();

    if (confirm) {
      this.notificationService.isProcessing(true);
    forkJoin<[ Shift[] , DateTimeServer ]>( [
      this.danhsachdoithiServicer.getDataByBankId( bank_id) ,
      this.serverTimeService.getTime()
    ] ).subscribe( {
      next:([shift,time])=>{
        const dataTime = shift.map(m=>{
          m['time_end_convented']= new Date(m.time_end).getTime();
          return m['time_end_convented'];
        })
        const timeCurrent =new Date(time.date).getTime();
        if (dataTime.some(so=>so>timeCurrent)){
          this.notificationService.isProcessing(false);
          this.notificationService.toastWarning("Đợt thi chưa kết thúc vui lòng không xoá");
        }else{
            this.nganHangDeService.delete(bank_id).subscribe({
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
      }
    })
    ;
  }
  }
  selectChangeTb(type:string){
    console.log(type)
    this.changeTb = type;
    this.f['type_test'].setValue(type);

    if(type === 'cabai'){
      this.f['time_per_test_tungcau'].setValue(0);
    }else{
      this.f['time_per_test'].setValue(0);
    }
  }
  //------------------------------------------------

}
