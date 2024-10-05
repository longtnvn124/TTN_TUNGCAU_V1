import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Shift, ShiftTests} from "@shared/models/quan-ly-doi-thi";
import {NganHangCauHoi, NganHangDe} from "@shared/models/quan-ly-ngan-hang";

import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {DotThiKetQuaService} from "@shared/services/dot-thi-ket-qua.service";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {forkJoin, of, switchMap} from "rxjs";
import {NotificationService} from "@core/services/notification.service";
import {NgPaginateEvent, OvicTableStructure} from "@shared/models/ovic-models";
import {ThiSinhTracking, ThisinhTrackingService} from "@shared/services/thisinh-tracking.service";
import {TYPE_CONTESTANT_TRACKING, WAITING_POPUP} from "@shared/utils/syscat";
import {OvicButton} from "@core/models/buttons";
import {NganHangCauHoiService} from "@shared/services/ngan-hang-cau-hoi.service";
import {ExportExcelService} from "@shared/services/export-excel.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ShiftTestQuestion, ShiftTestQuestionService} from "@shared/services/shift-test-question.service";


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
  // nganhangCauhoi:ShiftTestQuestion[];

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
      field: ['__name_coverted'],
      innerData: true,
      header: 'Tên đội thi',
      sortable: false,
    },
    {
      fieldType: 'normal',
      field: ['__answer_convert'],
      innerData: true,
      header: 'Kết quả làm bài',
      sortable: false,
      headClass: 'ovic-w-100px text-center',
      rowClass: 'ovic-w-100px text-center'
    },
    {
      fieldType: 'normal',
      field: ['__total_score'],
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
    private ShiftTestQuestionService: ShiftTestQuestionService,
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
          this.viewDetail = "default";
          this.loadInit();
        }
    }

  ngOnInit(): void {
    if (this._shift_id){
      this.viewDetail = "default";
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

        this.bank =this.shift ? nghanhde.find(f=>f.id === this.shift.bank_id): null;
        // this.loadDataThisinh(this._shift_id,this.page);
        this.loadDataShiftTestByShiftIdAndquestionId();

      },
      error:()=>{
        this.notifi.toastError('Mất kết nối với máy chủ');

      }});
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
        const shiftTestQuestion = decision['__shiftTestQuestion'] as ShiftTestQuestion[];
        this.notifi.isProcessing(true);
        this.nganHangCauHoiService.getDataByBankId(this.shift.bank_id,null).subscribe({
          next:(data)=>{
            // this.nganhangCauhoi = quesition_ids.map(m=>{
            //   const item = data.find(f => f.id === m)?  data.find(f => f.id === m):null;
            //   item['__per_select_question'] = details[m] && details[m].join(',').toString() ? details[m].join(',').toString() : '';
            //   item['__correct_answer_coverted'] =item ? item.correct_answer.map(t => item.answer_options.find(f => f.id === t)):null;
            //   item['__correct_answer'] = item.correct_answer.join(',');
            //   return item;
            // });
            this.nganhangCauhoi = shiftTestQuestion.map(m=>{
                const item = data.find(f => f.id === m.question_id)?  data.find(f => f.id === m.question_id):null;
                item['__per_select_question']= m.answer ? m.answer.join(',').toString() : '';
                item['__correct_answer_coverted'] =item ? item.correct_answer.map(t => item.answer_options.find(f => f.id === t)):null;
                item['__correct_answer'] = item.correct_answer.join(',');
                  item['__has_answered']  = m.answer;
              return item;
            })
            this.notifi.isProcessing(false);
          },error:(e)=>{
            this.notifi.isProcessing(false);
            this.notifi.toastError('Load bài làm thất bại');
          }
        })
        break;
      case 'BUTTON_EXPORT_EXCEL':
        break;
      case 'DETAIL-TRACKING':

        break;
      default:
        break;
    }
  }
  loadDataShiftTestByShiftIdAndquestionId(question_id?:number){


    this.notifi.isProcessing(true);
    const shift_id = this.shift.id;
    // const question_id = this.questionSelect.id;
    this.shiftTestService.getDataByShiftId(shift_id).pipe(switchMap(m=>{
      const ids = m.map(m=>m.id);
      return forkJoin([of(m),this.ShiftTestQuestionService.getDataByShiftTestIdsAndquestion_id(ids,question_id)])
    })).subscribe({
      next:([shiftTest,shiftTestQuestion])=>{
        this.shiftTest = shiftTest && shiftTest.length>0 ? shiftTest.map(m=>{
          const thisinh =m['users'];

          m['__avatar'] = thisinh ? thisinh['avatar']:'assets/images/bandanvan/logo_bandanvan.png';
          m['__name_coverted'] = thisinh ? thisinh['display_name'] : '';
          const shiftTestQuestionData = shiftTestQuestion && shiftTestQuestion.length> 0 ? shiftTestQuestion.filter(f=>f.shift_test_id === m.id) : [];
          const numberQuestion = shiftTestQuestionData ? (shiftTestQuestionData.length <5 ? 5: shiftTestQuestionData.length ) : 5;
          const numberQuestionCorect = shiftTestQuestionData ? shiftTestQuestionData.filter(f=>f.score === 5).length:0;
          let total = 0
          shiftTestQuestionData.forEach((a,index)=>{
            total =total + a.score;
          });
          m['__shiftTestQuestion'] = shiftTestQuestionData;
          m['__total_score'] = total;
          m['__answer_convert'] = numberQuestionCorect +'/' + numberQuestion;
          return m;
        }).sort((a,b)=>b['__total_score'] - a['__total_score']) : null;

        this.notifi.isProcessing(false);
        this.viewLazy = false;
      },
      error:()=>{

        this.notifi.toastError('Load dữ liệu không thành công ');
      }
    })
  }

}
