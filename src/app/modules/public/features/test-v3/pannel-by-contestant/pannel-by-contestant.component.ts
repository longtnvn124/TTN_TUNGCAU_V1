import {Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NganHangCauHoi, NganHangDe} from "@shared/models/quan-ly-ngan-hang";
import {Shift, ShiftTests} from "@shared/models/quan-ly-doi-thi";
import {
  debounceTime,
  forkJoin,
  interval,
  merge,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil
} from "rxjs";
import {Router} from "@angular/router";
import {NotificationService} from "@core/services/notification.service";
import {NganHangCauHoiService} from "@shared/services/ngan-hang-cau-hoi.service";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {DotThiKetQuaService} from "@shared/services/dot-thi-ket-qua.service";
import {ServerTimeService} from "@shared/services/server-time.service";
import {AuthService} from "@core/services/auth.service";
import {HelperService} from "@core/services/helper.service";
import {ThisinhTrackingService} from "@shared/services/thisinh-tracking.service";
import {io, Socket} from "socket.io-client";
import {APP_CONFIGS, getWsUrl, wsPath} from "@env";
import {KEY_NAME_SHIFT_ID, SM_MODAL_OPTIONS} from "@shared/utils/syscat";
import {User} from "@core/models/user";
import {ShiftTestQuestion, ShiftTestQuestionService} from "@shared/services/shift-test-question.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {distinctUntilChanged, filter} from "rxjs/operators";


@Component({
  selector: 'app-pannel-by-contestant',
  templateUrl: './pannel-by-contestant.component.html',
  styleUrls: ['./pannel-by-contestant.component.css']
})
export class PannelByContestantComponent implements OnInit,OnDestroy {
  @ViewChild('notifiTest', {static: true}) notifiTest: TemplateRef<any>;


  @HostListener('window:resize', ['$event']) onResize(): void {
    this.isSmallScreen = window.innerWidth <= 500;

  }
  testView                : 'loading'|'question'|'data_question'|'data_all'|'not_author' = "loading" ;
  isSmallScreen           : boolean = window.innerWidth <= 500;
  mode                    : 'PANEL' | 'TEST_RESULT' | 'LOADING' = 'LOADING';

  bank                    : NganHangDe;
  bankQuestions           :NganHangCauHoi[];

  shift                   : Shift;
  shiftTest               : ShiftTests;
  destroy$                : Subject<string> = new Subject<string>();
  questions               : NganHangCauHoi[];
  remainingTimeClone      : number = 0; // 30 minutes in seconds
  timeClone               : number = 0; // 30 minutes in seconds
  timeCloser$             : Subject<string> = new Subject<string>();
  user                    : User;
  questionSelect          : NganHangCauHoi;
  curentQuestionNumber    : number = -1;
  viewAnswer              : boolean = false;
  shiftTestQuestion       : ShiftTestQuestion;
  isSubmitTimeEnd         : boolean=false;
  private _validInfo      : { shift_id: number, contestant: number } = {shift_id: 0, contestant: 0};
  dataShiftTests          : ShiftTests[]= [];
  table_loading           : boolean=false;
  private socket          : Socket;
  stateSocket             : boolean = false;
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private nganHangCauHoiService: NganHangCauHoiService,
    private nganHangDeService: NganHangDeService,
    private shiftService: DotThiDanhSachService,
    private shiftTestsService: DotThiKetQuaService,
    private authService: AuthService,
    private shiftTestQuestionSercice:ShiftTestQuestionService,
    private modalSerivice : NgbModal
  ) {
    this.user = this.authService.user;
    const observerSignIn   = this.authService.onSignIn.pipe( debounceTime( 100 ) , filter( t => t !== null ) , distinctUntilChanged() ).subscribe( {
        next : accessToken => {
          if (this.authService.user.role_ids.includes('116')){
            if ( this.socket ) {
              this.socket.disconnect();
              this.socket.close();
            }
            this.socket = io( getWsUrl() , {
              path : wsPath ,
              auth : {
                token : accessToken ,
                realm : APP_CONFIGS.realm
              },
              transports: ['websocket', 'polling'],
            } );
            // this.socket.connect();
            this.socket.on( 'connect' , () => {
              const engine = this.socket.io.engine;
              this.stateSocket = true;
              console.log( 'socket connected' );

              engine.on( 'close' , ( reason ) => {
                console.log( 'socket close' );
              } );

              engine.on( 'error' , ( reason ) => {
                console.log( 'socket error' );
                this.stateSocket=false;
              } );
            })
            this.socket.on('close',()=>{console.log('log close');});

          }
          this.socket.on( 'batdauthi' , (data) => {
            console.log( 'socket batdauthi' );
            this.shiftTestQuestion =data as ShiftTestQuestion;

            this.socketStartQuestion(this.shiftTestQuestion);
          })

          this.socket.on( 'ketthucthi' , () => {
            console.log('socket ketthucthi')
            this.testView="data_all";
            this.socketEndQuestions()
          })
          this.socket.on('start_time', ()=>{
            this.socketStatTime();
          })

        }
      }
    );
    const observerSignOut  = this.authService.onSignOut.pipe( debounceTime( 100 ) , filter( t => t !== null ) ).subscribe( {
      next : reason => {
        if ( this.socket ) {
          this.socket.disconnect();
          this.socket.close();
        }
      }
    } );

    this.subscriptions.add( observerSignIn );
    this.subscriptions.add( observerSignOut );


  }
  ngOnInit(): void {
    this.checkInit();
  }

  ngOnDestroy(): void {
    this.destroy$.next('closed');
    this.destroy$.complete();
    this.timeCloser$.complete();
    if (this.socket){
      this.subscriptions.unsubscribe();
    }
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

    this.shiftService.getDataById(this._validInfo.shift_id).pipe(switchMap(m=>{
      return forkJoin([of(m),this.shiftTestsService.getShiftTest(this._validInfo.shift_id,
        this.authService.user.id),this.nganHangDeService.getDataById(m.bank_id),
        this.nganHangCauHoiService.getDataByBankId(m.bank_id)
      ])
    })).subscribe({
      next:([shift,shifttest, bank,bankQuestion])=>{
        this.notificationService.isProcessing(false);
        this.bank = bank;
        this.timeClone = bank.time_per_test_tungcau;
        this.bankQuestions = bankQuestion.map(m=>{
          m['__answer_coverted'] = m.correct_answer.join(',');
          m['__freeze'] = false;
          return m;
        })
        this.shift = shift ?shift : null;
        if(shifttest){
          this.shiftTest = shifttest;

          if(shifttest.state === 2){
            this.testView = 'data_all';
            this.socketEndQuestions();
          }
        }else{
          this.testView = "not_author";
        }


      },error:()=>{
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Load dữ liệu không thành công');
      }
    })

  }



  getFormattedTime(): string {
    const minutes: number = Math.floor(this.remainingTimeClone / 60);
    const seconds: number = this.remainingTimeClone % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  stopTimer(): void {
    this.timeCloser$.next('close');
  }

  btnOutTest() {
    this.authService.setOption(KEY_NAME_SHIFT_ID, 0);
    void this.router.navigate(['/test/shift']);
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
        this.isSubmitTimeEnd= true;
        this.btnViewTemplaceNotifi();
      }
      if (++couter === perious) {
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

    // this.startTimer(this.remainingTimeClone);
  }
  socketStatTime(){
    this.notificationService.toastSuccess('Bắt đầu làm bài ');
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



  socketEndQuestions(){
    this.table_loading=true;
    this.notificationService.isProcessing(true);
    this.shiftTestQuestionSercice.getDataByShiftTestId(this.shiftTest.id).subscribe({
      next:(data)=>{
        console.log(data);
        let total = 0;
        const total_question = this.bankQuestions ? this.bankQuestions.length : 0;
        const total_question_anser:number = 0
        const question_ids = this.shiftTest.question_ids.map((a,index)=>{
            const shiftTestQuestionsmap = data ? data.find(f=>f.question_id === a): null;
            total = total +(shiftTestQuestionsmap ? shiftTestQuestionsmap.score : 0);
            this.shiftTest['__cau_'+ (index + 1)] = shiftTestQuestionsmap ? shiftTestQuestionsmap.score : 0;
          return a;
        })
        this.shiftTest['__total_answer']= data.filter(f=>f.score === 5) ? data.filter(f=>f.score === 5).length + '/' + total_question : '0/'+ total_question;   ;
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
