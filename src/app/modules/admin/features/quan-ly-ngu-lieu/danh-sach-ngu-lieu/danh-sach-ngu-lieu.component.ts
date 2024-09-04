import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Paginator} from "primeng/paginator";
import {FormType, NgPaginateEvent, OvicForm,} from "@shared/models/ovic-models";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {debounceTime, filter, forkJoin, Observable, Subject, Subscription} from "rxjs";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {NotificationService} from "@core/services/notification.service";

import {NguLieuDanhSachService} from "@shared/services/ngu-lieu-danh-sach.service";
import {DanhMucChuyenMucService} from "@shared/services/danh-muc-chuyen-muc.service";
import {DanhMucDiemDiTichService} from "@shared/services/danh-muc-diem-di-tich.service";
import {DanhMucLinhVucService} from "@shared/services/danh-muc-linh-vuc.service";
import {DanhMucLoaiNguLieuService} from "@shared/services/danh-muc-loai-ngu-lieu.service";
import {DmChuyenMuc, DmLinhVuc, DmLoaiNguLieu} from "@shared/models/danh-muc";
import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";
import {FileType} from "@shared/utils/syscat";
import {FileService} from "@core/services/file.service";
import {AuthService} from "@core/services/auth.service";

interface FormNgulieu extends OvicForm {
  object: Ngulieu;
}

@Component({
  selector: 'app-danh-sach-ngu-lieu',
  templateUrl: './danh-sach-ngu-lieu.component.html',
  styleUrls: ['./danh-sach-ngu-lieu.component.css']
})
export class DanhSachNguLieuComponent implements OnInit {
  @ViewChild('fromUpdate', {static: true}) template: TemplateRef<any>;
  @ViewChild('formMembers', {static: true}) formMembers: TemplateRef<any>;
  @ViewChild(Paginator, {static: true}) paginator: Paginator;
  private OBSERVE_SEARCH_DATA = new Subject<string>();
  formActive: FormNgulieu;
  private OBSERVE_PROCESS_FORM_DATA = new Subject<FormNgulieu>();
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
    [FormType.ADDITION]: {type: FormType.ADDITION, title: 'Thêm mới ngữ liệu', object: null, data: null},
    [FormType.UPDATE]: {type: FormType.UPDATE, title: 'Cập nhật ngữ liệu', object: null, data: null}
  };
  formSave: FormGroup = this.fb.group({
    title: ['', Validators.required],
    mota: [''],
    chuyenmuc: ['', Validators.required],
    loaingulieu: ['', Validators.required],
    linhvuc: ['', Validators.required],
    file_media: [null],
    donvi_id:[null, Validators.required]
  });
  dataChuyemuc: DmChuyenMuc[];
  dataLoaingulieu: DmLoaiNguLieu[];
  dataLinhvuc: DmLinhVuc[];
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
    private auth:AuthService
  ) {
    const observeProcessFormData = this.OBSERVE_PROCESS_FORM_DATA.asObservable().pipe(debounceTime(100)).subscribe(form => this.__processFrom(form));
    this.subscription.add(observeProcessFormData);
    const observeProcessCloseForm = this.notificationService.onSideNavigationMenuClosed().pipe(filter(menuName => menuName === this.menuName && this.needUpdate)).subscribe(() => this.loadData(this.page));
    this.subscription.add(observeProcessCloseForm);
    const observerOnResize = this.notificationService.observeScreenSize.subscribe(size => this.sizeFullWidth = size.width)
    this.subscription.add(observerOnResize);
    const observerSearchData = this.OBSERVE_SEARCH_DATA.asObservable().pipe(debounceTime(300)).subscribe(() => {
      this.paginator.changePage(1);
      this.loadData(1);
    });
    this.subscription.add(observerSearchData);
  }

  ngOnInit(): void {
    this.loadInit();
  }

  loadInit() {
    forkJoin<[DmChuyenMuc[], DmLoaiNguLieu[], DmLinhVuc[]]>(
      this.danhMucChuyenMucService.getDataUnlimit(),
      this.danhMucLoaiNguLieuService.getDataUnlimit(),
      this.danhMucLinhVucService.getDataUnlimit(),
    ).subscribe({
      next: ([dataChuyemuc, dataLoaingulieu, dataLinhvuc]) => {
        this.dataChuyemuc = dataChuyemuc;
        this.dataLoaingulieu = dataLoaingulieu;
        this.dataLinhvuc = dataLinhvuc;
        this.loadData(1);
      },
      error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  loadData(page: number) {
    let i = 1;
    this.isLoading = true;
    this.nguLieuDanhSachService.getDataByLinhvucIdAndSearch(page, this.filterData.linhvucid, this.filterData.search, this.filterData.loaingulieu).subscribe({
      next: ({data, recordsTotal}) => {
        this.listData = data.filter(f=>f.loaingulieu !="image360" && f.loaingulieu !=="video360").map(m => {
          const linhvuc = this.dataLinhvuc && m.linhvuc ? this.dataLinhvuc.find(f => f.id === m.linhvuc) : null;
          const loaingulieu = this.dataLoaingulieu && m.loaingulieu ? this.dataLoaingulieu.find(f => f.kyhieu === m.loaingulieu) : null;
          m['indexTable'] = (page -1)*10 + i++;
          m['__ten_converted'] = `<b>${m.title}</b><br>`;
          m['linhvuc_converted'] = linhvuc ? linhvuc.ten : '';
          m['loaingulieu_converted'] = loaingulieu ? loaingulieu.ten : '';
          m['fileType'] = m.file_media && m.file_media[0] && FileType.has(m.file_media[0].type) && (FileType.get(m.file_media[0].type)==='img'|| FileType.get(m.file_media[0].type)==='mp4') ? 'mediaVr' : 'info';
          m['__media_link']=m.file_media&& m.file_media[0] ? this.fileService.getPreviewLinkLocalFile(m.file_media[0]) :null;
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
    this.formSave.reset({
      title: '',
      mota: '',
      chuyenmuc: '',
      loaingulieu: null,
      diemditich_id: null,
      linhvuc: '',
      file_media: null,
      donvi_id:this.auth.userDonViId
    });

    this.formActive = this.listForm[FormType.ADDITION];
    this.preSetupForm(this.menuName);
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

  btnEdit(object: Ngulieu) {
    this.formSave.reset({
      title: object.title,
      mota: object.mota,
      chuyenmuc: object.chuyenmuc,
      loaingulieu: object.loaingulieu,
      diemditich_ids: object.diemditich_ids,
      linhvuc: object.linhvuc,
      file_media: object.file_media,
      donvi_id:object.donvi_id
    });
    this.formActive = this.listForm[FormType.UPDATE];
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
          this.listData.filter(f => f.id != object.id);
          // this.danhMucDiemDiTichService.update(object.diemditich_ids, {total_ngulieu: this.listData.length}).subscribe();
        }, error: () => {
          this.notificationService.isProcessing(false);
          this.notificationService.toastError('Thao tác không thành công');
        }
      })
    }
  };

  mode: 'TABLE' | 'MEDIAVR' | 'INFO' = "TABLE";

  saveForm() {
    if (this.formSave.valid) {
      this.formActive.data = this.formSave.value;
      this.OBSERVE_PROCESS_FORM_DATA.next(this.formActive);
    } else {
      this.formSave.markAllAsTouched();
      this.notificationService.toastError('Vui lòng điền đầy đủ thông tin');
    }
  }

  closeForm() {
    this.loadInit();
    this.mode = "TABLE";
    this.notificationService.closeSideNavigationMenu();
  }

  objectVR: Ngulieu;
  visible:boolean= false;
  ngulieuInfo:Ngulieu;
  btnInformation(object: Ngulieu) {
    if (object.loaingulieu=== "video360" || object.loaingulieu === "image360") {
      this.mode = "MEDIAVR";
      this.objectVR = object;

    }

    else if(object.loaingulieu === 'image' ||object.loaingulieu === 'video'){
      this.visible=true;
      this.ngulieuInfo =object;
    }else{
      // tai lieu || audio || ...
      // this.mode = "INFO";
      this.visible=true;
      this.ngulieuInfo =object;
    }
  };

  changeFilter(event) {
    const linhvucid = event.value;
    this.filterData.linhvucid = linhvucid;
    this.loadData(1);
  }
  changeFilterLoaiNguLieu(event){
    this.filterData.loaingulieu = event.value;
    this.loadData(1);
  }
  changeInput(event: string) {
    setTimeout(()=>{
      this.loadData(1);
    },1000);
  }
  filterData: { linhvucid: number, search: string,loaingulieu:string } = {linhvucid: null, search: '',loaingulieu:''};
  btnExit() {
    this.mode = "TABLE";
  }


}
