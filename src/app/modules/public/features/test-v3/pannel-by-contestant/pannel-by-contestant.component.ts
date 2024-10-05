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
  switchMap,
  takeUntil
} from "rxjs";
import {Router} from "@angular/router";
import {NotificationService} from "@core/services/notification.service";
import {NganHangCauHoiService} from "@shared/services/ngan-hang-cau-hoi.service";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {DotThiKetQuaService} from "@shared/services/dot-thi-ket-qua.service";
import {AppSocketEventName, AuthService} from "@core/services/auth.service";

import {KEY_NAME_SHIFT_ID, SM_MODAL_OPTIONS} from "@shared/utils/syscat";
import {User} from "@core/models/user";
import {ShiftTestQuestion, ShiftTestQuestionService} from "@shared/services/shift-test-question.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {io, Socket} from "socket.io-client";
import {APP_CONFIGS, getWsUrl, wsPath} from "@env";



@Component({
  selector: 'app-pannel-by-contestant',
  templateUrl: './pannel-by-contestant.component.html',
  styleUrls: ['./pannel-by-contestant.component.css']
})
export class PannelByContestantComponent implements OnInit, OnDestroy {
  @ViewChild('notifiTest', {static: true}) notifiTest: TemplateRef<any>;


  @HostListener('window:resize', ['$event']) onResize(): void {
    this.isSmallScreen = window.innerWidth <= 500;

  }

  testView: 'loading' | 'question' | 'data_question' | 'data_all' | 'not_author' = "loading";
  isSmallScreen: boolean = window.innerWidth <= 500;
  mode: 'PANEL' | 'TEST_RESULT' | 'LOADING' = 'LOADING';

  bank: NganHangDe;
  bankQuestions: NganHangCauHoi[];

  shift: Shift;
  shiftTest: ShiftTests;
  destroy$: Subject<string> = new Subject<string>();
  questions: NganHangCauHoi[];
  remainingTimeClone: number = 0; // 30 minutes in seconds
  timeClone: number = 0; // 30 minutes in seconds
  timeCloser$: Subject<string> = new Subject<string>();
  user: User;
  questionSelect: NganHangCauHoi;
  curentQuestionNumber: number = -1;
  viewAnswer: boolean = false;
  shiftTestQuestion: ShiftTestQuestion;
  isSubmitTimeEnd: boolean = false;
  private _validInfo: { shift_id: number, contestant: number } = {shift_id: 0, contestant: 0};
  dataShiftTests: ShiftTests[] = [];
  table_loading: boolean = false;
  stateSocket: boolean = false;

  // private eventHandle: Record<AppSocketEventName, (data: any) => void> = {
  //   error: () => {
  //   },
  //   batdauthi: (data) => {
  //
  //     this.shiftTestQuestion = data as ShiftTestQuestion;
  //     this.socketStartQuestion(this.shiftTestQuestion);
  //   },
  //   close: () => {
  //   },
  //   ketthucthi: () => {
  //       this.testView = "data_all";
  //       this.socketEndQuestions()
  //   },
  //   connect: () => {
  //   },
  //   start_shift: () => {
  //   },
  //   start_time: () => {
  //       this.socketStatTime();
  //   },
  // }

  viewLogout:boolean = false;
  socket: Socket;
  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private nganHangCauHoiService: NganHangCauHoiService,
    private nganHangDeService: NganHangDeService,
    private shiftService: DotThiDanhSachService,
    private shiftTestsService: DotThiKetQuaService,
    private authService: AuthService,
    private shiftTestQuestionSercice: ShiftTestQuestionService,
    private modalSerivice: NgbModal,
  ) {
    this.user = this.authService.user;
    this.authService.onSocketResponse().pipe(takeUntil(this.destroy$)).subscribe(({name,data}) => {

      // this.eventHandle[name](data);
      if(name === 'start_shift'){
        this._validInfo.shift_id = data.shift_id;
        this.authService.setOption(KEY_NAME_SHIFT_ID, data.shift_id);
        this.checkInit();
      }

      if(name==='batdauthi'){
        this._validInfo.shift_id = data.shift_id;
        this.shiftTestQuestion = data as ShiftTestQuestion;
        this.socketStartQuestion(this.shiftTestQuestion);
      }
      if(name==='ketthucthi'){
        this.testView = "data_all";
        this.socketEndQuestions()
      }
      if(name==='start_time') {
        this.socketStatTime();

      }
    });
    this.authService.observerAppSocketStatus.subscribe((connected: boolean) => {
      this.stateSocket = connected;
    });
  }

  ngOnInit(): void {
    // this.checkInit();
  }

  ngOnDestroy(): void {
    this.destroy$.next('closed');
    this.destroy$.complete();
    this.timeCloser$.next('closed');
    this.timeCloser$.complete();
    this.modalSerivice.dismissAll();
  }


  checkInit() {

    const shift_id: number = this.authService.getOption(KEY_NAME_SHIFT_ID);
    console.log(shift_id);
    if (!Number.isNaN(shift_id)) {
      this._validInfo.shift_id = shift_id;
      this._initTest();
    } else {
      void this.router.navigate(['/test/shift']);
    }


  }

  private _initTest() {
    this.notificationService.isProcessing(true);

    this.shiftService.getDataById(this._validInfo.shift_id).pipe(switchMap(m => {
      return forkJoin([of(m), this.shiftTestsService.getShiftTest(this._validInfo.shift_id,
        this.authService.user.id), this.nganHangDeService.getDataById(m.bank_id),
        this.nganHangCauHoiService.getDataByBankId(m.bank_id)
      ])
    })).subscribe({
      next: ([shift, shifttest, bank, bankQuestion]) => {
        this.notificationService.isProcessing(false);
        this.bank = bank;
        // this.timeClone = bank.time_per_test_tungcau ? bank.time_per_test_tungcau : 15;
        this.bankQuestions = bankQuestion.map(m => {
          m['__answer_coverted'] = m.correct_answer.join(',');
          m['__freeze'] = false;
          return m;
        })
        this.shift = shift ? shift : null;
        if (shifttest) {
          this.shiftTest = shifttest;

          if (shifttest.state === 2) {
            this.testView = 'data_all';
            this.socketEndQuestions();
          }
        } else {
          this.testView = "not_author";
        }


      }, error: () => {
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
    // this.timeCloser$.next('close');
    interval(1000).pipe(takeUntil(
      merge(
        this.destroy$,
        this.timeCloser$
      )
    )).subscribe(() => {
      if (remainingTime > 0) {
        remainingTime--;
        this.remainingTimeClone = Math.max(remainingTime, 0);
      } else {
        // this.timeCloser$.next('');
        this.remainingTimeClone = 0;
        this.stopTimer();
        this.isSubmitTimeEnd = true;
        console.log('time end');
        this.btnViewTemplaceNotifi();
      }

    });
  }

  socketStartQuestion(data: ShiftTestQuestion) {
    this.notificationService.isProcessing(true);
    this.nganHangCauHoiService.getQuestionById(data.question_id).pipe(debounceTime(2000)).subscribe({
      next: (q) => {
        const q_current = q;
        q_current['__answer_coverted'] = q_current.correct_answer.join(',');
        q_current['__freeze'] = false;
        this.questionSelect = {...q_current};
        this.curentQuestionNumber = (this.curentQuestionNumber + 1);
        this.viewAnswer = false;
        this.testView = "question";
        this.timeClone = this.bank ? this.bank.time_per_test_tungcau : 15;
        this.remainingTimeClone = this.bank ? this.bank.time_per_test_tungcau : 15;
        this.modalSerivice.dismissAll();
        this.notificationService.toastSuccess('Thông báo câu hỏi Mới');
        this.notificationService.isProcessing(false);

      },
      error: () => {
        this.notificationService.toastError('Tải câu hỏi không thành công');
        this.notificationService.isProcessing(false);

      }
    })

    // this.startTimer(this.remainingTimeClone);
  }

  socketStatTime() {
    this.notificationService.toastSuccess('Bắt đầu làm bài ');
    this.startTimer(this.remainingTimeClone);
  }

  onAnswerQuestion(questionId: number, answers: number[]) {

    const bankCurrent = this.bankQuestions.find(f => f.id === questionId) ? this.bankQuestions.find(f => f.id === questionId) : this.questionSelect;
    if (this.remainingTimeClone > 0) {
      if (this.bankQuestions && this.bankQuestions.length>0){
        this.bankQuestions.find(f => f.id === questionId)['__anserByContestant'] = answers;
      }
      this.questionSelect['__anserByContestant'] = answers;
      this.questionSelect['__anserByContestant_convent'] = answers.join(',');
      if (JSON.stringify(answers) === JSON.stringify(bankCurrent.correct_answer)) {
        this.shiftTestQuestionSercice.update(this.shiftTestQuestion.id, {answer: answers, score: 5}).subscribe();
      } else {
        this.shiftTestQuestionSercice.update(this.shiftTestQuestion.id, {answer: answers, score: 0}).subscribe();
      }
    }

  }

  btnViewTemplaceNotifi() {
    this.modalSerivice.open(this.notifiTest, SM_MODAL_OPTIONS);
  }

  btnSubmitTimeEnd() {
    this.isSubmitTimeEnd = false;
    this.viewAnswer = true;
    this.modalSerivice.dismissAll();

  }

  socketEndQuestions() {
    this.modalSerivice.dismissAll();
    this.remainingTimeClone = 0;
    this.table_loading = true;
    this.notificationService.isProcessing(true);
    this.shiftTestQuestionSercice.getDataByShiftTestId(this.shiftTest.id).subscribe({
      next: (data) => {

        let total = 0;
        const total_question = this.bankQuestions ? this.bankQuestions.length : 0;
        const total_question_anser: number = 0
        const question_ids = this.shiftTest.question_ids.map((a, index) => {
          const shiftTestQuestionsmap = data ? data.find(f => f.question_id === a) : null;
          total = total + (shiftTestQuestionsmap ? shiftTestQuestionsmap.score : 0);
          this.shiftTest['__cau_' + (index + 1)] = shiftTestQuestionsmap ? shiftTestQuestionsmap.score : 0;
          return a;
        })
        this.shiftTest['__total_answer'] = data.filter(f => f.score === 5) ? data.filter(f => f.score === 5).length + '/' + total_question : '0/' + total_question;
        ;
        this.shiftTest['__total'] = total;
        this.shiftTest['__name_coverted'] = this.authService.user.display_name;
        // this.dataShiftTests = [].push(this.shiftTest);
        this.dataShiftTests = [].concat(... [this.shiftTest]);

        this.notificationService.isProcessing(false);
        this.table_loading = false;


      },
      error: () => {
        this.table_loading = false;
        this.notificationService.isProcessing(false);

      }
    })
  }

  async btnlogOut(){
    this.notificationService.isProcessing(true);
    await this.authService.logout();
    this.router.navigate(['login']).then(() => this.notificationService.isProcessing(false), () => this.notificationService.isProcessing(false));
  }


  btnViewLogOut(type){
    this.viewLogout = type;
  }
  btnRouterResult(){

  }
}
