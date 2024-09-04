import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Shift, ShiftTests} from "@shared/models/quan-ly-doi-thi";
import {NganHangCauHoi, NganHangDe} from "@shared/models/quan-ly-ngan-hang";

import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {DotThiKetQuaService} from "@shared/services/dot-thi-ket-qua.service";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {forkJoin} from "rxjs";
import {NotificationService} from "@core/services/notification.service";
import {NgPaginateEvent, OvicTableStructure} from "@shared/models/ovic-models";
import {ThiSinhTracking, ThisinhTrackingService} from "@shared/services/thisinh-tracking.service";
import {TYPE_CONTESTANT_TRACKING, WAITING_POPUP} from "@shared/utils/syscat";
import {OvicButton} from "@core/models/buttons";
import {NganHangCauHoiService} from "@shared/services/ngan-hang-cau-hoi.service";
import {ExportExcelService} from "@shared/services/export-excel.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";


// export interface dataThisinhCover extends ShiftTests{
//   index:number;
//   _user_name:string;
//   _sdt_thisinh:string;
//   _email_thisinh:string;
//   _school_thisinh:string;
//   _class_thisinh:string;
//   _units_thisinh:string;
//   _time_loadExam:string;
//   _number_correct_converted:string;
//   _score:string;
// }
@Component({
  selector: 'dot-thi-thi-sinh-ket-qua',
  templateUrl: './dot-thi-thi-sinh-ket-qua.component.html',
  styleUrls: ['./dot-thi-thi-sinh-ket-qua.component.css']
})
export class DotThiThiSinhKetQuaComponent implements OnInit, OnChanges {
  @ViewChild('templateWaiting') templateWaiting: ElementRef;

  @Input() _shift_id: number;
  viewLazy:boolean= true;
  index:number=1;
  shift: Shift;
  shiftTest: ShiftTests[];
  bank: NganHangDe;
  recordsTotal:number;
  rows = this.themeSettingsService.settings.rows;
  viewDetail:"default" | "question"| "tracking" = "default";
  nganhangCauhoi:NganHangCauHoi[];

  headButtons = [
    {
      label: 'Xuất excel',
      name: 'BUTTON_EXPORT_EXCEL',
      icon: 'pi pi-file-excel',
      class: 'p-button-rounded p-button-success ml-3 mr-2'
    },
  ];

  tblStructureShiftTest: OvicTableStructure[] = [
    {
      fieldType: 'normal',
      field: ['_name'],
      innerData: true,
      header: 'Tên thí sinh',
      sortable: false,
    },
    {
      fieldType: 'normal',
      field: ['_school'],
      innerData: true,
      header: 'Tên Trường',
      sortable: false,
    },
    {
      fieldType: 'normal',
      field: ['_units'],
      innerData: true,
      header: 'Đơn vị',
      sortable: false,
    },
    {
      fieldType: 'normal',
      field: ['_time_start_shifttest'],
      innerData: true,
      header: 'Ngày làm bài',
      sortable: false,
      headClass: 'ovic-w-130px text-center',
      rowClass: 'ovic-w-130px text-center'
    },
    {
      fieldType:'normal',
      field:['_time_doit'],
      innerData: true,
      header: 'Thời gian làm bài',
      sortable: false,
      headClass: 'ovic-w-130px text-center',
      rowClass: 'ovic-w-130px text-center'
    },
    {
      fieldType: 'normal',
      field: ['_number_correct_converted'],
      innerData: true,
      header: 'Kết quả làm bài',
      sortable: false,
      headClass: 'ovic-w-100px text-center',
      rowClass: 'ovic-w-100px text-center'
    },
    {
      fieldType: 'normal',
      field: ['_score'],
      innerData: true,
      header: 'Điểm',
      sortable: true,
      headClass: 'ovic-w-100px text-center',
      rowClass: 'ovic-w-100px text-center'
    },
    {
      tooltip: '',
      fieldType: 'buttons',
      field: [],
      rowClass: 'ovic-w-120px text-center',
      checker: 'fieldName',
      header: 'Thao tác',
      sortable: false,
      headClass: 'ovic-w-150px text-center',
      buttons: [
        {
          tooltip: 'Chi tiết bài làm',
          label: '',
          icon: 'pi pi-file',
          name: 'DETAIL-EXAM',
          cssClass: 'btn-warning rounded'
        },
        {
          tooltip: 'Theo dõi bài làm ',
          label: '',
          icon: 'pi pi-stopwatch',
          name: 'DETAIL-TRACKING',
          cssClass: 'btn-secondary rounded'
        },

      ]
    }
  ]
  shiftTestSelect:ShiftTests;

  page:number= 1;
  search:string;
  columns = ['Stt', 'Tên thí sinh','Ngày sinh','Giới tính','Số điện thoại','Email', 'Trường', 'Lớp', 'Đơn vị','Thời gian bắt đầu làm bài','Thời gian làm bài ' ,'Số câu trả lời đúng', 'Điểm'];
  constructor(
    private shiftService: DotThiDanhSachService,
    private shiftTestService: DotThiKetQuaService,
    private bankSerivce: NganHangDeService,
    private notifi: NotificationService,
    private thisinhTrackingService:ThisinhTrackingService,
    private nganHangCauHoiService: NganHangCauHoiService,
    private exportExcelService: ExportExcelService,
    private themeSettingsService: ThemeSettingsService,
    private modalService :NgbModal
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
        if (this._shift_id){
          this.loadInit();
        }
    }

  ngOnInit(): void {
    if (this._shift_id){
      this.loadInit();
    }
  }

  loadInit(){
    forkJoin<[NganHangDe[],Shift[]]>([
      this.bankSerivce.getDataUnlimit(),
      this.shiftService.getdataUnlimit()
    ]).subscribe({
      next:([nghanhde, shift])=>{
        const checkshift= shift.find(f=>f.id === this._shift_id)
        this.shift = checkshift;
        this.shift['_time_per_test'] = this.strToTime(checkshift.time_start) + ' - ' + this.strToTime(checkshift.time_end);
        this.bank =this.shift ? nghanhde.find(f=>f.id === this.shift.bank_id): null;
        this.loadDataThisinh(this._shift_id,this.page);
      },
      error:()=>{
        this.notifi.toastError('Mất kết nối với máy chủ');

      }});
  }

  loadDataThisinh(shift_id:number, page:number, search?:string){
    this.notifi.isProcessing(true);
    const searchdata = search;
    this.shiftTestService.getDataByShiftIdAndWidthAndPageAndSearch(shift_id,page,searchdata).subscribe({
      next:({ recordsTotal,data})=>{
        this.recordsTotal = recordsTotal;
          const ShiftTestData = data.map(m=>{
            const thisinh = m['thisinh'];
            m['_name']= thisinh ? thisinh['full_name'] : '';
            m['_school'] = thisinh ? thisinh['school'] : '';
            m['_units'] = thisinh && thisinh['people_classify'] === 0 ? thisinh['class'] : thisinh && thisinh['people_classify'] === 1 ? thisinh['units'] : '';
            m['_time_start_shifttest'] = m.time_start ? this.getdate(m.time_start) : '';
            m['_score'] = m && m.score ? this.take_decimal_number(m.score, 2) : 0;
            const time_doit = this.bank && this.bank.time_per_test ?  Math.floor(this.bank.time_per_test *60 - m.time) : 0;
            m['_time_doit'] = Math.floor(time_doit / 60) + 'p ' + Math.floor((time_doit % 60) / 10) + 's';
            m['_number_correct_converted'] = m.number_correct + '/' + m.question_ids.length;
            m['_bank_id'] = this.bank.id;
            return m;
          });
        this.viewLazy=false;
        this.shiftTest  = this.sortCandidates(ShiftTestData);

        this.notifi.isProcessing(false);
      },error:(err)=>{
        this.notifi.isProcessing(false);
      }
    })
  }

  dataSearch:ShiftTests[] ;

  onSearch(text: string) {
    this.search = text;
    this.page=1;
    this.loadDataThisinh(this._shift_id,this.page,this.search);
  }
  take_decimal_number(num, n) {
    let base = 10 ** n;
    return Math.round(num * base) / base;
  }
  getdate(time: string, getime?: boolean) {
    const date = new Date(time);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Lưu ý rằng tháng bắt đầu từ 0, nên cần cộng thêm 1.
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    if (!getime) {
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } else {
      return `${day}/${month}/${year}`;
    }
  }

  paginate({page}: NgPaginateEvent) {
    this.page = page + 1;
    this.loadDataThisinh(this._shift_id,this.page);
  }


  dataTracking:ThiSinhTracking[];
  type_tracking =TYPE_CONTESTANT_TRACKING;

  getDataUserTracking(shift_id:number, thisinh_id:number){
    // this.viewDetail="tracking";
    this.notifi.isProcessing(true);
    this.thisinhTrackingService.getdataTracking(shift_id,thisinh_id).subscribe({
      next: (trackings)=>{
        this.dataTracking = trackings.map(m=>
        {
          const iconCheck = this.type_tracking.find(f=>f.value === m.type_check)
          m['_icon'] = iconCheck? iconCheck.icon : 'pi pi-bell';
          m['_class'] = iconCheck ? iconCheck.class : '';
          m['_date_chagnes'] = m['created_at']? this.getdate(m['created_at'], false):'';
          return m;
        }) ;
        this.notifi.isProcessing(false);
      },
      error:(e)=>{
        this.notifi.isProcessing(false);

      }
    })
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
  strToDate(input:string):string{
    const date = input ? new Date(input) : null;
    let result = '';
    if (date) {
      result = [date.getDate().toString().padStart(2, '0'), (date.getMonth() + 1).toString().padStart(2, '0'), date.getFullYear().toString()].join('/');
    }
      return result;
  }
  sortCandidates(candidates: ShiftTests[]): ShiftTests[] {
    return candidates.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.time - a.time ;
    });
  }
  handleClickOnTableShiftTest(button: OvicButton){
    if(!button){
      return;
    }
    const decision = button.data && this.shiftTest ? this.shiftTest.find(u => u.id === button.data) : null;
    this.shiftTestSelect = decision;

    switch (button.name) {
      case 'DETAIL-EXAM':
        this.viewDetail = "question";
        const quesition_ids = decision.question_ids;
        const details = decision.details;
        const bank_id = decision['_bank_id'];
        this.notifi.isProcessing(true);
        this.nganHangCauHoiService.getDataByBankId(bank_id,null).subscribe({
          next:(data)=>{
            this.nganhangCauhoi = quesition_ids.map(m=>{
              const item = data.find(f => f.id === m)?  data.find(f => f.id === m):null;
              item['__per_select_question'] = details[m] && details[m].join(',').toString() ? details[m].join(',').toString() : '';
              item['__correct_answer_coverted'] =item ? item.correct_answer.map(t => item.answer_options.find(f => f.id === t)):null;
              item['__correct_answer'] = item.correct_answer.join(',');
              return item;
            });
            this.notifi.isProcessing(false);
          },error:(e)=>{
            this.notifi.isProcessing(false);
            this.notifi.toastError('Load bài làm thất bại');
          }
        })
        break;
      case 'BUTTON_EXPORT_EXCEL':

        this.exportExcel(this.shift.id);
        break;
      case 'DETAIL-TRACKING':
        this.viewDetail="tracking";
        this.getDataUserTracking(decision.shift_id, decision.thisinh_id);
        break;
      default:
        break;
    }
  }
  exportExcel(shift_id:number){
    this.modalService.open(this.templateWaiting, WAITING_POPUP);

    this.notifi.isProcessing(true)
    let index = 1;
    this.shiftTestService.getDataByShiftIdAndWidth(shift_id).subscribe({
      next:(data)=>{
        const dataaShiftTest = data.map(m => {
          const thisinh = m['thisinh'];
          const _index = index++;
          const _name= thisinh ? thisinh['full_name'] : '';
          const _sex = thisinh && thisinh['sex'] === 'nam'  ? 'Nam': 'Nữ';
          const _dob = thisinh ?  this.strToDate(thisinh['dob']) :'';
          const _phone = thisinh ? thisinh['phone']: '';
          const _email = thisinh ? thisinh['email']:'';
          const _school = thisinh ? thisinh['school'] : '';
          const _class = thisinh && thisinh['people_classify'] === 0 ? thisinh['class'] : '';
          const _units = thisinh && thisinh['people_classify'] === 1 ? thisinh['units'] : '';
          const _time_start_shifttest = m.time_start ? this.getdate(m.time_start) : '';
          const _score = m && m.score ? this.take_decimal_number(m.score, 2) : 0;
          const time_doit = this.bank && this.bank.time_per_test ?  Math.floor(this.bank.time_per_test *60 - m.time) : 0;
          const _time_doit = Math.floor(time_doit / 60) + ' phút ' + Math.floor((time_doit % 60) / 10) + ' giây';
          const _number_correct_converted  = m.number_correct + '/' + m.question_ids.length;
          const _bank_id  = this.bank.id;
          return {_index,_name,_dob,_sex,_phone,_email,_school,_class,_units,_time_start_shifttest,_time_doit,_number_correct_converted,_score};
        });
        this.modalService.dismissAll();
        if (dataaShiftTest){
          this.sendExcel(dataaShiftTest);
        }
        this.notifi.isProcessing(false)

      },error:()=>{
        this.modalService.dismissAll();
        this.notifi.toastSuccess('Lấy dữ liêu không thành công');
        this.notifi.isProcessing(false)

      }
    });
  }
  sendExcel(data ){
    const heading = this.shift ? this.shift.title : 'Đợt thi 01: Cuộc thi tìm hiểu 30 năm xây dụng và phát triển Đại học Thái Nguyên' ;
    const subHeading = this.shift['_time_per_test'];
    this.exportExcelService.exportAsExcelFile(heading, subHeading, this.columns, data, heading, 'sheet1');
  }


}
