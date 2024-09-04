import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged, filter, Subject, Subscription, takeUntil} from "rxjs";
import {Shift, statusOptions} from "@shared/models/quan-ly-doi-thi";
import {NganHangCauHoi, NganHangDe} from "@shared/models/quan-ly-ngan-hang";
import {NgPaginateEvent} from "@shared/models/ovic-models";
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {NotificationService} from "@core/services/notification.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";

import {ThiSinhTracking} from "@shared/services/thisinh-tracking.service";

@Component({
  selector: 'app-dot-thi-thi-sinh',
  templateUrl: './dot-thi-thi-sinh.component.html',
  styleUrls: ['./dot-thi-thi-sinh.component.css']
})
export class DotThiThiSinhComponent implements OnInit {

  @ViewChild('testTaker', {static: true}) testTaker: TemplateRef<any>;
  @ViewChild('tracking', { static: true}) tracking :TemplateRef<any>;
  @ViewChild('statistical', { static: true}) statistical :TemplateRef<any>;

  private _SEARCH_DEBOUNCE = new Subject<string>();
  private closeObservers$ = new Subject<string>();
  rows = this.themeSettingsService.settings.rows;
  loadInitFail: false;
  page = 1;
  subscription = new Subscription();
  index: number;
  sizeFullWidth = 1024;
  recordsTotal: number;
  isLoading = true;
  needUpdate = false;
  search: string = '';
  statusOptions = statusOptions;
  menuName = 'DsDotthi';
  listData: Shift[];
  btn_checkAdd: 'Lưu lại' | 'Cập nhật';
  headButtons = [
    {
      label: 'Xuất excel',
      name: 'BUTTON_EXPORT_EXCEL',
      icon: 'pi pi-file-excel',
      class: 'p-button-rounded p-button-success ml-3 mr-2'
    },
  ];

  nganhangCauhoi: NganHangCauHoi[];
  nganHangDe: NganHangDe[];
  columns = ['Stt', 'Tên thí sinh', 'Số điện thoại', 'Email', 'Trường','Lớp','Đơn vị' ,'Thời gian làm bài', 'Số câu trả lời đúng', 'Điểm',];
  shiftIdParram:number;// chuyền data sang thông kê
  constructor(
    private dotThiDanhSachService: DotThiDanhSachService,
    private notificationService: NotificationService,
    private themeSettingsService: ThemeSettingsService,
    private nganHangDeService: NganHangDeService,
  ) {
    const observeProcessCloseForm = this.notificationService.onSideNavigationMenuClosed().pipe(filter(menuName => menuName === this.menuName && this.needUpdate)).subscribe(() => this.loadData(this.page));
    this.subscription.add(observeProcessCloseForm);
    const observerOnResize = this.notificationService.observeScreenSize.subscribe(size => this.sizeFullWidth = size.width)
    this.subscription.add(observerOnResize);
    this._SEARCH_DEBOUNCE.asObservable().pipe( takeUntil( this.closeObservers$ ) , debounceTime( 500 ) , distinctUntilChanged() ).subscribe( search => this.loadData(1, search));
  }

  ngOnInit(): void {
    this.nganHangDeService.getDataUnlimit().subscribe({
      next: (data) => {
        this.nganHangDe = data;

        this.loadInit();
      }, error: () => {
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }
  loadInit() {
    this.loadData(1);
    if(this.dataTracking){
      // this.addTrackingVertical();
    }
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

  loadData(page, search?:string, date?:string) {
    const dataSearch = search ?search: this.search;
    const limit = this.themeSettingsService.settings.rows;
    this.index = (page * limit) - limit + 1;
    let indexTable= 1;
    this.isLoading = true;
    this.dotThiDanhSachService.getDataByStatusAndSearch(page, dataSearch,date).subscribe({
      next: ({data, recordsTotal}) => {
        this.listData = data.map(m => {
          const timeszone = new Date(m.time_end).getTime() < new Date().getTime();
          m['indexTable']= page ===1 ? indexTable++ : page*10 +indexTable++;
          m['__title_converted'] = `<b>${m.title}</b><br>` + m.desc;
          m['__time_converted'] = this.strToTime(m.time_start) + ' - ' + this.strToTime(m.time_end);
          m['__bank_coverted'] = this.nganHangDe && m.bank_id && this.nganHangDe.find(f => f.id === m.bank_id) ? this.nganHangDe.find(f => f.id === m.bank_id).title : '';
          m['__status_converted'] = !timeszone ? this.statusOptions[1].color : this.statusOptions[0].color;
          m['total_time'] =  this.nganHangDe.find(f => f.id === m.bank_id) && this.nganHangDe.find(f => f.id === m.bank_id).time_per_test ? this.nganHangDe.find(f => f.id === m.bank_id).time_per_test:0;
          return m;
        })

        this.recordsTotal = recordsTotal;
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  changeInput(text:string){
    this.search = text;
    this._SEARCH_DEBOUNCE.next( text );
  }
  paginate({page}: NgPaginateEvent) {
    this.page = page + 1;
    this.loadData(this.page);
  }
  loadTestTaker(idShift: number) {
    this.shiftIdParram = idShift;
  }
  closeForm() {
    this.notificationService.closeSideNavigationMenu();
    this.nganhangCauhoi = null;
  }
  btnDataThisinh(item: Shift){
    this.loadTestTaker(item.id);
    this.notificationService.openSideNavigationMenu({
      name: this.menuName,
      template: this.testTaker,
      size: this.sizeFullWidth,
      offsetTop: '0px'
    });
  }
  dataTracking:ThiSinhTracking[];
  btnViewStatistical(item: Shift) {
    this.notificationService.openSideNavigationMenu({
      name: this.menuName,
      template: this.statistical,
      size: this.sizeFullWidth,
      offsetTop: '0px'
    });
    this.shiftIdParram = item.id;
  }
}
