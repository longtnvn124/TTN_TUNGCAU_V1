import {Component, HostListener, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NganHangCauHoi, NganHangDe} from "@shared/models/quan-ly-ngan-hang";
import {Shift, ShiftTests} from "@shared/models/quan-ly-doi-thi";
import {forkJoin, interval, merge, Observable, of, Subject, switchMap, takeUntil} from "rxjs";
import {Router} from "@angular/router";
import {NotificationService} from "@core/services/notification.service";
import {NganHangCauHoiService} from "@shared/services/ngan-hang-cau-hoi.service";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {DotThiKetQuaService, ShiftTestScore} from "@shared/services/dot-thi-ket-qua.service";
import {DateTimeServer, ServerTimeService} from "@shared/services/server-time.service";
import {AuthService} from "@core/services/auth.service";
import {HelperService} from "@core/services/helper.service";
import {ThiSinhTracking, ThisinhTrackingService} from "@shared/services/thisinh-tracking.service";
import {io, Socket} from "socket.io-client";
import {APP_CONFIGS, getWsUrl, wsPath} from "@env";
import {KEY_NAME_SHIFT_ID, SM_MODAL_OPTIONS} from "@shared/utils/syscat";
import {OvicButton} from "@core/models/buttons";
import {User} from "@core/models/user";
import {Question} from "@shared/models/test-question";
import {ShiftTestQuestion, ShiftTestQuestionService} from "@shared/services/shift-test-question.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {map} from "rxjs/operators";

interface ContestantInfo {
  phone: string;
  testName: string;
  name: string;
  score: string;
  number_correct: number;
  strokeDasharray: string;
  totalQuestion: number;
  answered: number;
  timeOfTheTest?:string;
}

type ClientAnswer = { [T: number]: number[] };

interface details {
  question_id : number,
  answer_ids  : number[],
  time_end    : number
}

@Component({
  selector: 'app-pannel-by-contestant',
  templateUrl: './pannel-by-contestant.component.html',
  styleUrls: ['./pannel-by-contestant.component.css']
})
export class PannelByContestantComponent implements OnInit {
  @ViewChild('notifiTest', {static: true}) notifiTest: TemplateRef<any>;


  @HostListener('window:resize', ['$event']) onResize(): void {
    this.isSmallScreen = window.innerWidth <= 500;

  }
  @HostListener('document:visibilitychange', ['$event']) beforeUnloadHandler(): void {
    if (document.hidden && this.checkStartExam){
      this.thisinhTrackingService.createTracking({shift_id:this.shiftTest.shift_id, thisinh_id:this.shiftTest.thisinh_id,content_changes:"Thí sinh đã rời khỏi phòng thi",type_check:-3}).subscribe();

    }
    if(!document.hidden && this.checkStartExam){
      this.thisinhTrackingService.createTracking({shift_id:this.shiftTest.shift_id, thisinh_id:this.shiftTest.thisinh_id,content_changes:"Thí sinh đã trở lại phòng thi",type_check:3}).subscribe();

    }

  }
  testView             :'loading'|'question'|'data_question'|'data_all' = "loading" ;

  checkStartExam:boolean= false;
  isSmallScreen: boolean = window.innerWidth <= 500;


  mode: 'PANEL' | 'TEST_RESULT' | 'LOADING' = 'LOADING';
  contestantInfo: ContestantInfo = {
    name: '',
    phone: '',
    testName: '',
    score: '',
    number_correct: 0,
    strokeDasharray: '0 200',
    totalQuestion: 0,
    answered: 0,
    timeOfTheTest: ''
  };
  bank:NganHangDe;
  bankQuestions:NganHangCauHoi[];

  shift                   : Shift;
  shiftTest               : ShiftTests;
  answerQuestions         : ClientAnswer = {};
  openStartTheTestDialog  : boolean = false;
  destroy$                : Subject<string> = new Subject<string>();
  questions               : NganHangCauHoi[];
  remainingTimeClone      : number = 0; // 30 minutes in seconds
  isTimeOver              : boolean = false;
  timeCloser$             : Subject<string> = new Subject<string>();

  user:User;
  questionSelect        : NganHangCauHoi;
  curentQuestionNumber  : number = -1;
  viewAnswer            : boolean = false;
  shiftTestQuestion     : ShiftTestQuestion;
  isSubmitTimeEnd       : boolean=false;

  private _validInfo: { shift_id: number, contestant: number } = {shift_id: 0, contestant: 0};

  protected btnSaveMyAnswers: { session: number, enable: boolean } = {session: 1, enable: false};

  protected enableSubmitButton: boolean = false;

  protected strokeDasharray: string = '0 200';

  content_tracking: string; // Khởi tạo user ,Bắt đầu thi, kết thúc thi,(re nhanh: vào thi lại, thoát ra khỏi trình thi)

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private nganHangCauHoiService: NganHangCauHoiService,
    private nganHangDeService: NganHangDeService,
    private shiftService: DotThiDanhSachService,
    private shiftTestsService: DotThiKetQuaService,
    private serverTimeService: ServerTimeService,
    private authService: AuthService,
    private helperService: HelperService,
    private thisinhTrackingService:ThisinhTrackingService,
    private shiftTestQuestionSercice:ShiftTestQuestionService,
    private modalSerivice : NgbModal
  ) {
    this.user = this.authService.user;
  }
  private socket : Socket;
  ngOnInit(): void {

    this.socket = io( getWsUrl() , {
      path : wsPath ,
      auth : {
        token : this.authService.accessToken ,
        realm : APP_CONFIGS.realm
      }
    } );
    // this.socket.connect();
    this.socket.on( 'connect' , () => {
      console.log('connent');
    })

    this.socket.on( 'batdauthi' , (data) => {
      console.log(data);
      this.shiftTestQuestion =data as ShiftTestQuestion;
      console.log( this.shiftTestQuestion);
      this.socketStartQuestion(this.shiftTestQuestion);
    })

    this.socket.on( 'ketthucthi' , () => {
      console.log('ketthucthi');
      this.socketEndQuestions()
    })

    this.checkInit();
  }

  checkInit() {
    const shift_id: number = this.authService.getOption(KEY_NAME_SHIFT_ID);

    if (!Number.isNaN(shift_id)) {
      this._validInfo.shift_id = shift_id;
      this._initTest();
    } else {
      void this.router.navigate(['/test/shift']);
    }
  }

  private _initTest() {
    this.notificationService.isProcessing(true);
    this._recheckData(this._validInfo.shift_id, this.authService.user.id).pipe(switchMap(m=>{
      const bank_id = m[1].bank_id;
      return forkJoin([
        of(m[0]),
        of(m[1]),
        this.nganHangDeService.getDataById(bank_id),
        this.nganHangCauHoiService.getDataByBankId(bank_id)
      ])
    })).subscribe({
      next: ([shiftTest, shift,bank,bankQuestion]) => {
        this.bank = bank;
        this.bankQuestions = bankQuestion.map(m=>{
          m['__answer_coverted'] = m.correct_answer.join(',');
          m['__freeze'] = false;
          return m;
        })
        if(shiftTest.state === 0){
          this.shiftTestsService.update(shiftTest.id ,{state:1}).subscribe();
        }

        if (shiftTest && shift) {
          this.shift = shift;
          this.shiftTest = shiftTest;
          if (shiftTest.state === 2) {
            this.socketEndQuestions()
            this.testView = 'data_all';
          } else {
            this.testView = "loading";
          }
        }
        this.notificationService.isProcessing(false);
      },
      error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    });
  }

  private _recheckData(shift_id: number, contestant: number): Observable<[ShiftTests, Shift]> {
    return forkJoin<[Shift, DateTimeServer]>([
      this.shiftService.getDataById(shift_id),
      this.serverTimeService.getTime()
    ]).pipe(switchMap(([shift, dateTime]): Observable<[ShiftTests, Shift]> => {
      const currentTime: Date = this.helperService.dateFormatWithTimeZone(dateTime.date);
      const startTime: Date = this.helperService.dateFormatWithTimeZone(shift.time_start);
      const expiredTime: Date = this.helperService.dateFormatWithTimeZone(shift.time_end);
      return this.helperService.isBeforeDate(currentTime, expiredTime) && this.helperService.isAfterDate(currentTime, startTime) ? forkJoin<[ShiftTests, Shift]>([
        this._getContestantShiftTest(shift, contestant),
        of(shift)
      ]) : of([null, null]);
    }));
  }

  private _getContestantShiftTest(shift: Shift, contestant: number): Observable<ShiftTests> {
    return this.shiftTestsService.getShiftTest(shift.id, contestant).pipe(switchMap(shiftTest => {
      if (shiftTest) {
        if(shiftTest.state !==2){
          this.thisinhTrackingService.createTracking({shift_id:shift.id,thisinh_id:contestant,content_changes:"Thí sinh Đã Vào lại trình thi ",type_check:-1}).subscribe();
        }
        return of(shiftTest);
      } else {
        this.content_tracking="Thí sinh bắt đầu vào thi";

        this.thisinhTrackingService.createTracking({shift_id:shift.id,thisinh_id:contestant,content_changes:"Thí sinh bắt đầu bài thi",type_check:1}).subscribe();
        return this.createNewShiftTest(shift, contestant).pipe(switchMap(shiftTest => this._updateSomething(shiftTest)))
      }
    }));
  }

  private createNewShiftTest(shift: Shift, contestant: number): Observable<ShiftTests> {
    return forkJoin<[NganHangDe, NganHangCauHoi[], DateTimeServer]>([
      this.nganHangDeService.getDataById(shift.bank_id),
      this.nganHangCauHoiService.getDataByBankId(shift.bank_id, null, ),
      this.serverTimeService.getTime()
    ]).pipe(switchMap(([nganHangDe, questions, dateTime]) => {
      return this.shiftTestsService.createShiftTest({
        shift_id: shift.id,
        state:1,
        thisinh_id: contestant,
        question_ids:nganHangDe.random_question  === 1 ?  this.randomQuestions(questions.map(u => u.id), nganHangDe.number_questions_per_test) : questions.map(u => u.id),
        time_start: this.helperService.formatSQLDateTime(this.helperService.dateFormatWithTimeZone(dateTime.date)),

        // time: Math.max(nganHangDe.time_per_test, 1) * 60
      }).pipe(switchMap(id => this.shiftTestsService.getShiftTestById(id)));
    }));
  }

  private _updateSomething(newShiftTests: ShiftTests): Observable<ShiftTests> {

    return of(newShiftTests);
  }
  randomQuestions(questions: number[], length: number): number[] {
    const shuffledArray = questions.sort(() => Math.random() - 0.5);
    shuffledArray.length = Math.min(length, shuffledArray.length);
    return shuffledArray;
  }

  getFormattedTime(): string {
    const minutes: number = Math.floor(this.remainingTimeClone / 60);
    const seconds: number = this.remainingTimeClone % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  startTheTest() {
    this.checkStartExam = true;
    this.openStartTheTestDialog = false;
    this.loadQuestion();
  }

  loadQuestion() {
    this.notificationService.isProcessing(true);
    this.nganHangCauHoiService.getTestQuestions(this.shiftTest.question_ids, 'id,bank_id,title,answer_options,options_sty').subscribe({
      next: (questions) => {
        this.questions = questions.map(item => {
          const answered: number[] = this.answerQuestions[item.id];
          item['__answered'] = answered && Array.isArray(answered) ? answered.join() : null;
          return item;
        });
        this.startTimer(this.shiftTest.time);
        this.notificationService.isProcessing(false);
      },
      error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    });
  }




  stopTimer(): void {
    this.timeCloser$.next('close');
  }

  private completeTheTest(): Observable<ShiftTestScore> {
    const trackingData = {
      shift_id: this.shiftTest.shift_id,
      thisinh_id:this.shiftTest.thisinh_id,
      content_changes:"Thí sinh đã nộp bài",
      type_check:2
    };
    this.userTrackingData(trackingData);
    return this.shiftTestsService.update(this.shiftTest.id, {
      state: 2,
      details: this.answerQuestions,
      time: this.remainingTimeClone
    }).pipe(switchMap(() => this.shiftTestsService.scoreTest(this.shiftTest.id)));
  }


  btnOutTest() {
    this.authService.setOption(KEY_NAME_SHIFT_ID, 0);
    void this.router.navigate(['/test/shift']);
  }

  // updateTimeLeft(time: number) {
  //   this.shiftTestsService.update(this.shiftTest.id, {time}).subscribe();
  // }

  ngOnDestroy(): void {
    if (this.mode === 'PANEL') {
      const time: number = this.remainingTimeClone;
      const details: ClientAnswer = this.answerQuestions;
      if (time && details) {
        this.shiftTestsService.update(this.shiftTest.id, {time, details}).subscribe();
      }
    }
    this.destroy$.next('closed');
    this.destroy$.complete();
    this.timeCloser$.complete();
  }


  userTrackingData(data:ThiSinhTracking ) {
    return this.thisinhTrackingService.createTracking(data).subscribe();
  }

  startTimer(remainingTime: number): void {
    const closer$: Observable<string> = merge(
      this.destroy$,
      this.timeCloser$
    );

    let couter = 0;
    const perious = 20;
    interval(1000).pipe(takeUntil(closer$)).subscribe(() => {
      if (remainingTime > 0) {
        remainingTime--;
        this.remainingTimeClone = Math.max(remainingTime, 0);
      } else {
        this.remainingTimeClone = 0;
        this.stopTimer();
        // this.isTimeOver = true;
        // this.updateTimeLeft(0);
        this.isSubmitTimeEnd= true;
        this.btnViewTemplaceNotifi();

        // this.updateTestQuestion(this.shiftTestQuestion,this.questionSelect.id);
      }
      if (++couter === perious) {
        // this.updateTimeLeft(this.remainingTimeClone);// tính h sinh viên time giarm theo 20s 1 laamf
        couter = 0;
      }
    });
  }
  socketStartQuestion(data:ShiftTestQuestion){
    this.modalSerivice.dismissAll()
    this.viewAnswer= false;
    this.curentQuestionNumber = this.bankQuestions.findIndex(f=>f.id == data.question_id);
    this.questionSelect = {...this.bankQuestions.find(f=>f.id === data.question_id)};
    this.testView = "question";
    this.remainingTimeClone = this.bank.time_per_test_tungcau;
    this.startTimer(this.remainingTimeClone);
  }

  onAnswerQuestion(questionId: number, answers: number[]) {
    console.log(questionId)
    console.log(answers);
    console.log(this.bankQuestions.find(f=>f.id === questionId ))
    const bankCurrent = this.bankQuestions.find(f=>f.id === questionId )
    if(this.remainingTimeClone>0){
      this.bankQuestions.find(f=>f.id === questionId)['__anserByContestant'] = answers;
      this.questionSelect['__anserByContestant'] = answers;
      this.questionSelect['__anserByContestant_convent'] = answers.join(',');
      // console.log(answers === bankCurrent.correct_answer);
      if (JSON.stringify(answers) === JSON.stringify(bankCurrent.correct_answer)){
        this.shiftTestQuestionSercice.update(this.shiftTestQuestion.id, {answer:answers,score:5}).subscribe();
      }else{
        this.shiftTestQuestionSercice.update(this.shiftTestQuestion.id, {answer:answers,score:0}).subscribe();
      }
    }

    // if (Array.isArray(answers)) {
    //   if (answers.length) {
    //     this.answerQuestions[questionId] = answers;
    //     this.triggerSaveMyAnswers();
    //   } else {
    //     delete this.answerQuestions[questionId];
    //     this.triggerSaveMyAnswers();
    //   }
    // }
    // this.contestantInfo.answered = Object.keys(this.answerQuestions).length;
    // this.enableSubmitButton = this.contestantInfo.answered === this.contestantInfo.totalQuestion;
    // this.contestantInfo.strokeDasharray = [Math.floor(((this.contestantInfo.answered * 113) / this.contestantInfo.totalQuestion)), 200].join(' ');
  }

  btnViewTemplaceNotifi(){
    this.modalSerivice.open(this.notifiTest,SM_MODAL_OPTIONS);
  }
  btnSubmitTimeEnd(){
    this.isSubmitTimeEnd = false;
    this.viewAnswer= true;
    this.modalSerivice.dismissAll();

  }
  updateTestQuestion(data :ShiftTestQuestion,question_id:number){


    const bankCurrent =  this.bankQuestions.find(f=>f.id === question_id);

    if (JSON.stringify(bankCurrent['__anserByContestant']) === JSON.stringify(bankCurrent.correct_answer)){
      this.shiftTestQuestionSercice.update(this.shiftTestQuestion.id, {answer:bankCurrent['__anserByContestant'],score:5}).subscribe();
    }else{
      this.shiftTestQuestionSercice.update(this.shiftTestQuestion.id, {answer:bankCurrent['__anserByContestant'],score:0}).subscribe();
    }
  }


  dataShiftTests:ShiftTests[]= [];
  table_loading:boolean=false;
  socketEndQuestions(){
    this.table_loading=true;
    this.notificationService.isProcessing(true);
    this.shiftTestQuestionSercice.getDataByShiftTestId(this.shiftTest.id).subscribe({
      next:(data)=>{
        console.log(data);
        let total = 0;
        const question_ids = this.shiftTest.question_ids.map((a,index)=>{
            const shiftTestQuestionsmap = data ? data.find(f=>f.question_id === a): null;

            total = total +(shiftTestQuestionsmap ? shiftTestQuestionsmap.score : 0);
            this.shiftTest['__cau_'+ (index + 1)] = shiftTestQuestionsmap ? shiftTestQuestionsmap.score : 0;

          return a;
        })
        this.shiftTest['__total']= total;
        this.shiftTest['__name_coverted'] = this.authService.user.display_name;
        this.dataShiftTests.push(this.shiftTest);
        console.log(this.dataShiftTests);
        this.notificationService.isProcessing(false);
        this.table_loading=false;


      },
      error:()=>{
        this.table_loading=false;
        this.notificationService.isProcessing(false);

      }
    })
  }

}
