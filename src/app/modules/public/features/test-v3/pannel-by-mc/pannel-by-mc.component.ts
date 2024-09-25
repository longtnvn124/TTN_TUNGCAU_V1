import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {NotificationService} from "@core/services/notification.service";
import {NganHangCauHoiService} from "@shared/services/ngan-hang-cau-hoi.service";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {DotThiKetQuaService} from "@shared/services/dot-thi-ket-qua.service";
import {ServerTimeService} from "@shared/services/server-time.service";
import {AuthService} from "@core/services/auth.service";

import {

  KEY_NAME_SHIFT_ID,

  SM_MODAL_OPTIONS_CUSTOM
} from "@shared/utils/syscat";
import {debounceTime, forkJoin, interval, merge, Observable, of, Subject, switchMap, takeUntil} from "rxjs";
import {Shift, ShiftTests} from "@shared/models/quan-ly-doi-thi";
import {NganHangCauHoi, NganHangDe} from "@shared/models/quan-ly-ngan-hang";
import {User} from "@core/models/user";
import {ShiftTestQuestion, ShiftTestQuestionService} from "@shared/services/shift-test-question.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-pannel-by-mc',
  templateUrl: './pannel-by-mc.component.html',
  styleUrls: ['./pannel-by-mc.component.css']
})
export class PannelByMcComponent implements OnInit,OnDestroy {
  @ViewChild('notifiTest', {static: true}) notifiTest: TemplateRef<any>;
  private _validInfo: { shift_id: number, contestant: number } = {shift_id: 0, contestant: 0};
  testView             :'loading'|'question'|'data_question'|'data_all' = "question" ;
  shift                : Shift;
  bank                 : NganHangDe;
  bankQuestions        : NganHangCauHoi[];
  questionSelect       : NganHangCauHoi;
  time_clone           : number = 0;
  time_clone_for_end   : number = 0;
  number_questions     : number = 0;
  timeCloser$          : Subject<string> = new Subject<string>();
  destroy$             : Subject<string> = new Subject<string>();
  isSubmitTimeEnd      : boolean = false;
  user                 : User;
  viewAnswer           : boolean = false;
  curentQuestionNumber : number = -1;
  shiftTest            : ShiftTests[] ;
  shiftTestQuestion    : ShiftTestQuestion[];
  table_loading        : boolean=false;
  isLoading            : boolean = false;
  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private nganHangCauHoiService: NganHangCauHoiService,
    private nganHangDeService: NganHangDeService,
    private shiftService: DotThiDanhSachService,
    private shiftTestsService: DotThiKetQuaService,
    private serverTimeService: ServerTimeService,
    private auth: AuthService,
    private shiftTestQuestionService:ShiftTestQuestionService,
    private modalSerivice:NgbModal

  ) {
    this.user  = auth.user;
  }

  ngOnDestroy(): void {
    this.destroy$.next('closed');
    this.destroy$.complete();
    this.timeCloser$.complete();
    this.modalSerivice.dismissAll();
  }

  ngOnInit(): void {
    const shift_id: number = this.auth.getOption(KEY_NAME_SHIFT_ID);

    if (!Number.isNaN(shift_id)) {
      this._validInfo.shift_id = shift_id;
      this._validInfo.contestant = this.auth.user.id;
      this._initTest();
    } else {
      void this.router.navigate(['/test/shift']);
    }
  }

  _initTest(){
    this.isLoading = true;
    this.shiftService.getDataById(this._validInfo.shift_id).pipe( debounceTime(3000),switchMap(m=>{

      return forkJoin([of(m),this.nganHangDeService.getDataById(m.bank_id),this.nganHangCauHoiService.getDataByBankId(m.bank_id)])
    })).subscribe({
      next:([shift,bank,bankQuestions])=>{
        this.shift = shift;
        this.bank = bank;
        this.bankQuestions = bankQuestions.map(m=>{
          m['__answer_coverted'] = m.correct_answer.join(',');
          m['__freeze'] = true;
          return m;
        })
        this.number_questions =this.bankQuestions.length;
        this.isLoading=false;
        if(this.bank && this.bankQuestions){
          this.testView="question";
          this.btnStart()
        }
      },
      error:()=>{
        this.isLoading=false;
        this.notificationService.toastError('Tải xuống dữ liệu không thành công ');
      }
    })
  }

  btnStart(){
    this.time_clone = this.bank.time_per_test_tungcau;
    this.time_clone_for_end =this.time_clone;
    const bank_clone = this.bankQuestions.filter(f=>!f['__used']);
    this.questionSelect = bank_clone[0];
    this.curentQuestionNumber = 0
    this.callSocketStartQuestion();
  }

  btnReturnQuestion(){
    this.viewAnswer=true;
    this.time_clone_for_end = 0;
    this.curentQuestionNumber = this.curentQuestionNumber - 1;

    this.questionSelect = {...this.bankQuestions[this.curentQuestionNumber]};

  }
  btnNextQuestion(){
    this.shiftTestQuestion = [];
    this.viewAnswer=false;
    this.time_clone_for_end =this.time_clone;
    this.bankQuestions.find(f=>f.id === this.questionSelect.id)['__used'] = true;
    const bank_clone = this.bankQuestions.filter(f=>!f['__used']);
    // if(bank_clone.length === 0){
    if(bank_clone.length>0){
      this.questionSelect = {...bank_clone[0]};
      this.curentQuestionNumber = this.bankQuestions.findIndex(f=>f.id === bank_clone[0].id);
      this.callSocketStartQuestion();

    }
    else{
      this.testView ="data_all";
      this.callSocketEndQuestion();
    }
  }

  getFormattedTime(): string {
    const minutes: number = Math.floor(0);
    const seconds: number = this.time_clone_for_end ;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  socketStartTime(){
    this.isLoading=true;
    this.shiftTestQuestionService.callSocketStartTime(this.shift.id).pipe(debounceTime(2000)).subscribe({
      next:()=>{
        this.isLoading=false;
        this.startTimer(this.time_clone_for_end);
      },error:()=>{
        this.isLoading=false;
        this.notificationService.toastError('Bắt đầu thời gian thi không thành công ');
      }
    })
  }
  startTimer(remainingTime: number): void {
    const closer$: Observable<string> = merge(
      this.destroy$,
      this.timeCloser$
    );
    // this.mode = 'PANEL';

    let couter = 0;
    const perious = 20;
    interval(1000).pipe(takeUntil(closer$)).subscribe(() => {
      if (remainingTime > 0) {
        remainingTime--;
        this.time_clone_for_end = Math.max(remainingTime, 0);
      } else {
        this.time_clone_for_end = 0;
        this.viewAnswer= true;
        this.btnViewTemplaceNotifi();
        this.stopTimer();
        this.isSubmitTimeEnd =true;
      }
      if (++couter === perious) {
        // this.updateTimeLeft(this.remainingTimeClone);// tính h sinh viên time giarm theo 20s 1 laamf
        couter = 0;
      }
    });
 }
  stopTimer(): void {
    this.timeCloser$.next('close');
  }

  btnViewTestQuestion(){
    this.testView="data_question";
    this.loadDataShiftTestByShiftIdAndquestionId(this.questionSelect.id)
  }


  loadDataShiftTestByShiftIdAndquestionId(question_id?:number){
    this.testView ="data_all";
    this.stopTimer();
    this.table_loading= true;
    const shift_id = this.shift.id;
    // const question_id = this.questionSelect.id;
    this.shiftTestsService.getDataByShiftId(shift_id).pipe(switchMap(m=>{
      const ids = m.map(m=>m.id);
      return forkJoin([of(m),this.shiftTestQuestionService.getDataByShiftTestIdsAndquestion_id(ids,question_id)])
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
            m['__total_score'] = total;
            m['__answer_convert'] = numberQuestionCorect +'/' + numberQuestion;
            return m;
          }).sort((a,b)=>b['__total_score'] - a['__total_score']) : null;

        this.table_loading= false;
      },
      error:()=>{
        this.table_loading= false;
        this.notificationService.toastError('Load dữ liệu không thành công ');
      }
    })
  }
  btnReturnQuestionView(){
    this.testView = "question";
  }
  btnNextQuestionView(){

    this.testView = "question";
    this.btnNextQuestion()
  }

  btnOutTest() {
    this.auth.setOption(KEY_NAME_SHIFT_ID, 0);
    void this.router.navigate(['/test/shift']);
  }

  btnViewTemplaceNotifi(){
    this.modalSerivice.open(this.notifiTest,SM_MODAL_OPTIONS_CUSTOM);
  }
  btnSubmitTimeEnd(){
    this.isSubmitTimeEnd = false;
    this.viewAnswer= true;
    this.loadKetquaQueStion(this.shift.id,this.questionSelect.id);
    this.modalSerivice.dismissAll();

  }

  callSocketStartQuestion(){
    this.isLoading=true;
    this.shiftTestQuestionService.callSocketStart(this.shift.id,this.questionSelect.id).pipe(switchMap(()=>
    this.shiftTestQuestionService.getDataByShiftIdAndQuestionId(this.shift.id,this.questionSelect.id)
    )).subscribe({
      next:(data)=>{
        this.shiftTestQuestion = data.map(m=>{
          const thisinh =m['users'];
          m['__display_name'] = thisinh ? thisinh['display_name'] :'Đội thi ...';
          m['__avatar'] = thisinh ? thisinh['avatar'] :'assets/images/bandanvan/logo_bandanvan.png';
          const id_answer =m.answer ? m.answer[0]  : null;
          const options =  this.questionSelect.answer_options;
          const index_answer = id_answer ?  options.findIndex(f=>f.id === id_answer) : '-1';
          m['__answer_converted'] = index_answer ===0 ? 'A': index_answer ===1?'B': index_answer === 2 ?'C':index_answer ===3?'D': '-';
          m['_typeView'] = !!m['answer'];
          m['__score'] = m['score']!=0 ;
          return m;
        })
        // this.startTimer(this.time_clone_for_end);
        this.isLoading=false;

      },
      error:()=>{

        this.isLoading=false;
        this.notificationService.toastError('Socket Error');
      }
    })
  }
  callSocketEndQuestion(){
    this.isLoading=true;
    this.shiftTestQuestionService.callSocketEnd(this.shift.id).subscribe({
      next:()=>{
        this.loadDataShiftTestByShiftIdAndquestionId();
        this.isLoading=false;
        this.notificationService.toastSuccess('Bài thi đã kết thúc');
      },
      error:()=>{
        this.isLoading=false;
        this.notificationService.toastError('Kết thúc bài thi không thành công');
      }
    })
  }


  loadKetquaQueStion(shift_id:number,question_id:number){
    this.isLoading=true;

    this.shiftTestQuestionService.getDataByShiftIdAndQuestionId(shift_id,question_id).subscribe({
      next:(data)=>{
        this.shiftTestQuestion = data.map(m=>{
          const thisinh =m['users'];
          m['__display_name'] = thisinh ? thisinh['display_name'] :'Đội thi ...';
          m['__avatar'] = thisinh ? thisinh['avatar'] :'assets/images/bandanvan/logo_bandanvan.png';
          const id_answer =m.answer ? m.answer[0]  : null;
          const options =  this.questionSelect.answer_options;
          const index_answer = id_answer ?  options.findIndex(f=>f.id === id_answer) : '-1';
          m['__answer_converted'] = index_answer ===0 ? 'A': index_answer ===1?'B': index_answer === 2 ?'C':index_answer ===3?'D': '-';
          m['_typeView'] = !!m['answer'];
          m['__score'] = m['score']!=0  ;
          return m;
        })

        this.isLoading=false;


      },error:()=>{
        this.isLoading=false;
        this.notificationService.toastError('Load dữ liệu không thành công');

      }
    })
  }
}
