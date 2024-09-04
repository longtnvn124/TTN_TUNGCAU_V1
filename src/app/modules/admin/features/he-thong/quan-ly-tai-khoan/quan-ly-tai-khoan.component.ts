import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RoleService} from '@core/services/role.service';
import {UserService} from '@core/services/user.service';
import {NotificationService} from '@core/services/notification.service';
import {AuthService} from '@core/services/auth.service';
import {DEFAULT_MODAL_OPTIONS} from '@shared/utils/syscat';
import {debounceTime, firstValueFrom, forkJoin, Observable, of, Subject, Subscription, switchMap} from 'rxjs';
import {User} from '@core/models/user';
import {Role} from '@core/models/role';
import {OvicRightContextMenu} from '@shared/models/ovic-right-context-menu';
import {ProfileService} from '@core/services/profile.service';
import {UnsubscribeOnDestroy} from '@core/utils/decorator';
import {OvicTableStructure} from '@shared/models/ovic-models';
import {OvicButton} from '@core/models/buttons';
import {SimpleRole} from "@core/models/auth";

@Component({
  selector: 'app-quan-ly-tai-khoan',
  templateUrl: './quan-ly-tai-khoan.component.html',
  styleUrls: ['./quan-ly-tai-khoan.component.css']
})

@UnsubscribeOnDestroy()
export class QuanLyTaiKhoanComponent implements OnInit {

  @ViewChild('tplCreateAccount') tplCreateAccount: ElementRef;

  formSave: FormGroup;

  isUpdateForm: boolean;

  formTitle: string;

  editUserId: number;

  dsNhomQuyen: SimpleRole[] = [];

  data: User[] = [];

  cols: OvicTableStructure[] = [
    {
      fieldType: 'media',
      field: ['avatar'],
      header: 'Media',
      placeholder: true,
      sortable: false,
      headClass: 'ovic-w-90px text-center',
      rowClass: 'ovic-img-minimal text-center img-child-max-width-30',

    },
    {
      fieldType: 'normal',
      field: ['username'],
      header: 'Tên tài khoản',
      sortable: true,
      headClass: 'ovic-w-180px text-center',
      rowClass: 'ovic-w-180px text-center'
    },
    {
      fieldType: 'normal',
      field: ['display_name'],
      header: 'Tên hiển thị',
      sortable: false,
      headClass: 'ovic-w-180px text-center',
      rowClass: 'ovic-w-180px text-center'

    },
    {
      fieldType: 'normal',
      field: ['email'],
      header: 'Email',
      sortable: false,
      headClass: '',
      rowClass: '',
    },
    {
      fieldType: 'normal',
      field: ['u_role'],
      innerData: true,

      header: 'Vai trò',
      sortable: false,
      headClass: 'ovic-w-130px text-center',
      rowClass: 'ovic-w-130px text-center'

    },
    {
      fieldType: 'switch',
      field: ['status'],
      header: 'Active',
      sortable: false,
      headClass: 'ovic-w-110px text-center',
      rowClass: 'ovic-w-110px text-center round'
    },
    {
      tooltip: '',
      fieldType: 'buttons',
      field: [],
      checker: 'fieldName',
      header: 'Thao tác',
      sortable: false,
      rowClass: 'ovic-w-110px text-center',
      headClass: 'ovic-w-110px text-center',
      buttons: [
        {
          tooltip: 'Cập nhật',
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
      label: 'Refresh',
      name: 'REFRESH_LIST',
      icon: 'pi-refresh pi',
      class: 'p-button-rounded p-button-secondary ml-3',
      tooltip: 'Làm mới danh sách',
      tooltipPosition: 'left'
    },
    {
      label: 'Thêm mới',
      name: 'ADD_NEW_ROW',
      icon: 'pi-plus pi',
      class: 'p-button-rounded p-button-primary ml-3 mr-2',
      tooltip: 'Thêm tài khoản mới',
      tooltipPosition: 'left'
    }
  ];

  canEdit: boolean;

  canAdd: boolean;

  canDelete: boolean;

  isAdmin: boolean;

  changPassState: boolean;

  defaultPass: string;

  highestRoleIdUser: any;

  schoolName = '';

  userDonviId: number;

  subscriptions = new Subscription();


  currentRoute = 'he-thong/quan-ly-tai-khoan';


  private _reloadData$ = new Subject<any>();

  constructor(
    private notificationService: NotificationService,
    private roleService: RoleService,
    private userService: UserService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private profileService: ProfileService,
    private auth: AuthService
  ) {
    this.formSave = this.fb.group({
      display_name: ['', Validators.required],
      // username     : [ '' , [ Validators.required , Validators.pattern( '^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$' ) ] ] ,
      username: ['', [Validators.required, Validators.pattern('^\\S*$')]],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      donvi_id: [''],
      role_ids: [[], Validators.required],
      status: [1, Validators.required]
    });
    this.data = [];
    this.isUpdateForm = false;
    this.formTitle = 'Tạo tài khoản';
    const listenReloadData = this._reloadData$.asObservable().pipe(debounceTime(200)).subscribe({next: () => this.loadData()});
    this.subscriptions.add(listenReloadData);
  }

  ngOnInit(): void {


    this.canEdit = this.auth.userCanEdit(this.currentRoute);
    this.canAdd = this.auth.userCanAdd(this.currentRoute);
    this.canDelete = this.auth.userCanDelete(this.currentRoute);
    this.isAdmin = this.auth.userHasRole('admin_ttndhtn');
    this.userDonviId = this.auth.user.donvi_id;
    this.f['donvi_id'].setValue(this.userDonviId);

    this.loadData()

  }


  loadData() {
    this.notificationService.isProcessing(true)
    const userCanLoad: boolean = this.canEdit || this.canAdd || this.canDelete;
    const loader$: Observable<User[]> = userCanLoad ? this.userService.listUsers(this.userDonviId) : of([this.auth.user]);

    loader$.subscribe({
      next: (users) => {

        const roles: SimpleRole[] = this.auth.roles;
        users.map(u => {
          const uRoles = [];
          // const uRoles = roles;
          if (u.role_ids && u.role_ids.length) {
            u.role_ids.forEach(r => {

              const index = r ? roles.findIndex(i => i.id === parseInt(r, 10)) : -1;
              if (index !== -1) {
                uRoles.push('<span class="--user-role-label --role-' + roles[index].name + '">' + roles[index].title + '</span>');
              }
            }, []);
          }
          u.avatar = u.avatar ? u.avatar : 'assets/images/a_none.jpg';
          u['u_role'] = uRoles.join(', ');
          return u;
        });

        this.data = users.filter(f => f.id !== this.auth.user.id);

        this.notificationService.isProcessing(false);

      }, error: (error) => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Load dữ liệu không thành công');
      }
    })
  }


  get f(): { [key: string]: AbstractControl<any> } {
    return this.formSave.controls;
  }

  userActions(button: OvicButton) {
    if (!button) {
      return;
    }
    const decision = button.data && this.data ? this.data.find(f => f.id === button.data) : null;
    switch (button.name) {
      case 'DELETE_DECISION':
        void this.deleteUser(decision.id);
        break;
      case 'EDIT_DECISION':
        this.type_password="password";
        this.editUser(decision);
        break;
      case 'SWITCH':
        this.switchEvent(decision.id);
        break;
      case 'ADD_NEW_ROW':
        this.type_password==="text";
        void this.creatUser(this.tplCreateAccount);
        break;
      case 'ADD_NEW_ROW_FROM_EXCEL':
        break;
      case 'REFRESH_LIST':
        this.triggerReloadData();
        break;
      default :
        break;
    }
  }

  async deleteUser(id: number) {
    const confirm = await this.notificationService.confirmDelete();
    if (confirm) {
      this.userService.deleteUser(id).subscribe(
        {
          next: () => {
            this.notificationService.toastSuccess('Xóa tài khoản thành công');
            this.loadData();
          },
          error: () => this.notificationService.toastError('Xóa tài khoản thất bại')
        }
      );
    }
  }

  editUser(user) {

    if (user) {
      this.f['role_ids'].setValue(user.role_ids);
      this.editUserId = user.id;
      this.isUpdateForm = true;
      this.formTitle = 'Cập nhật tài khoản';
      this.f['display_name'].setValue(user.display_name);
      this.f['username'].setValue(user.username);
      this.f['phone'].setValue(user.phone);
      this.f['email'].setValue(user.email);
      this.f['password'].setValue(user.password);
      this.f['donvi_id'].setValue(user.donvi_id);
      this.f['role_ids'].setValue(user.role_ids.toString());
      this.f['status'].setValue(user.status);
      this.callActionForm(this.tplCreateAccount);
      this.defaultPass = user.password;
    }
  }

  switchEvent(id:number) {
    const index = this.data.findIndex( dt => dt.id === id );
    if ( index !== -1 ) {
      const status   = this.data[ index ].status ? 0 : 1;
      const username = this.data[ index ].username;
      this.userService.updateUserInfo( id , { status , username } ).subscribe( {
        next  : () => {
          this.data[ index ].status = status;
          this.notificationService.toastSuccess( 'Thay đổi trạng thái tài khoản thành công' );
          this.loadData()
        } ,
        error : () => this.notificationService.toastError( 'Thay đổi trạng thái thất bại' )
      } );
    }
  }

  async creatUser(frmTemplate) {
    this.changPassState = true;
    this.isUpdateForm = false;
    this.formTitle = 'Tạo tài khoản';
    // this.resetForm( this.formSave );
    this.formSave.reset({
      display_name: '',
      username: '',
      phone: null,
      email: '',
      password: '',
      role_ids: '',
      status: 0,
    });
    this.f['username'].setValue('');
    try {
      await this.callActionForm(frmTemplate);
    } catch (e) {
    }
  }

  triggerReloadData() {
    this.loadData();
  }

  clickChangedPass() {

    const state = this.changPassState;
    this.changPassState = !state;
    if (!this.changPassState) {
      this.f['password'].setValue(this.defaultPass);
    }
  }

  creatUserChangeActive(value: number) {
    this.f['status'].setValue(value);
  }

  taoTaiKhoan(form: FormGroup) {
    form.get('donvi_id').setValue(this.userDonviId);
    if (form.valid) {
      const data = {...form.value};
      data.role_ids = data.role_ids.split(',').map(elm => parseInt(elm, 10));
      if (data.role_ids.some(r => r === 6)) {
        data.display_name.split(' ');
        this.userService.creatUser(data).subscribe(
          {
            next: () => this.notificationService.toastSuccess('Thêm mới tài khoản thành công'),
            error: () => null
          });
      } else {
        this.userService.creatUser(data).subscribe({
          next: () => this.notificationService.toastSuccess('Thêm mới tài khoản thành công'),
          error: () => null
        });
      }
    } else {
      if (form.get('role_ids').invalid) {
        return this.notificationService.toastInfo('Chọn nhóm quyền cho tài khoản');
      }
      if (form.get('email').invalid) {
        return this.notificationService.toastInfo('Email chưa đúng định dạng');
      }
      form.markAllAsTouched();
      this.notificationService.toastError('Vui lòng kiểm tra lại', 'Lỗi nhập liệu');
    }
  }

  resetForm(form: FormGroup) {
    form.reset({
      display_name: '',
      username: '',
      phone: '',
      email: '',
      password: '',
      role_ids: '',
      status: 0,
    });
  }

  capNhatTaiKhoan(form: FormGroup) {
    if (form.valid) {
      const data = {...form.value};
      if (!this.changPassState) {
        delete data.password;
      }
      data.role_ids = data.role_ids.split(',').map(elm => parseInt(elm, 10));
      const currentUser = this.data.find(u => u.id === this.editUserId);
      if (!currentUser) {
        return;
      }
      this.userService.updateUserInfo(this.editUserId, data).subscribe({
        next: () => {
          this.notificationService.toastSuccess('Cập nhật tài khoản thành công');
          this.modalService.dismissAll('');
          this.loadData();
        },
        error: () => null
      });
    } else if (form.get('role_ids').invalid) {
      return this.notificationService.toastInfo('Chọn nhóm quyền cho tài khoản');
    }
  }

  async callActionForm(template): Promise<any> {
    if (this.dsNhomQuyen.length === 0) {
      if (Array.isArray(this.auth.roles) && this.auth.roles.length > 1) {
        const exceptHightRole = Math.min(...[...this.auth.roles].map(u => u.id));
        this.dsNhomQuyen = [...this.auth.roles].filter(r => r.id !== exceptHightRole);
      } else {
        return Promise.resolve();
      }
    }
    const createUserForm = this.modalService.open(template, DEFAULT_MODAL_OPTIONS);
    return createUserForm.result;
  }

  type_password:'password'|'text' = "text";
  btnShowPassWord(){
    this.type_password = this.type_password ==="password" ? "text": "password";
  }

  passwordSelectItem:boolean = false;
  btnPasswordActive(){
    // this.passwordSelectItem = !this.passwordSelectItem;

    this.changPassState = !this.changPassState;
    console.log(this.changPassState);
  }

}


