import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "@core/services/auth.service";
import {Shift} from "@shared/models/quan-ly-doi-thi";
import {HelperService} from "@core/services/helper.service";
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";

import {NotificationService} from "@core/services/notification.service";
import {DateTimeServer, ServerTimeService} from "@shared/services/server-time.service";
import {Router} from "@angular/router";
import {DotThiKetQuaService} from "@shared/services/dot-thi-ket-qua.service";
import {forkJoin} from "rxjs";
import {KEY_NAME_SHIFT_ID} from "@shared/utils/syscat";
import {User} from "@core/models/user";


type ShiftState = -1 | 0 | 1; // 0: chưa tới thời gian thi | 1 trong thời gian cho phép thi | -1 : quá hạn thời gian được phép thi

type ButtonShiftState = { state: ShiftState, label: string, class: string, icon: string };

type ListButtonShiftState = { [T in ShiftState]: ButtonShiftState };

interface DotThiKhaDung extends Shift {
  startAt: string;
  closeAt: string;
  totalQuestion: number;
  totalTime: number;
  state: ShiftState;
  button: ButtonShiftState;
}

@Component({
  selector: 'app-shift',
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.css']
})
export class ShiftComponent implements OnInit, OnDestroy {
  @ViewChild('copyRight') copyRight!: ElementRef;
  @ViewChild('copyRightCustom') copyRightCustom!: ElementRef;
  private intervalId: any;

  private _listButton: ListButtonShiftState = {
    '-1': {state: -1, label: 'Bài thi đã kết thúc', icon: 'pi pi-ban', class: 'p-button-secondary'},
    '0': {state: 0, label: 'Chưa đến giờ thi', icon: 'pi pi-times', class: 'p-button-warning'},
    '1': {state: 1, label: 'Vào thi', icon: 'pi pi-check-square', class: 'p-button-success'}
  };

  presentTime: number = new Date().getTime();
  userData: User = this.auth.user;
  dsDotthi: DotThiKhaDung[];
  checkInterval: any;
  checkthisinhState2: any;
  isLoading: boolean = false;
  user: User;
  viewLogout: boolean = false;
  select_id: number = 0;
  state: 'loading' | 'data' = "loading";
  stateSocket: boolean = false;
  isContestant: 'admin' | 'thisinh' = "thisinh";
  totalThisinh: number = 0;

  constructor(
    private helperService: HelperService,
    private dotThiDanhSachService: DotThiDanhSachService,
    private notificationService: NotificationService,
    private auth: AuthService,
    private serverTimeService: ServerTimeService,
    private router: Router,
    private shiftTestsService: DotThiKetQuaService,
  ) {
    this.user = this.auth.user;
    // if (this.auth.user.role_ids.includes('116')) {
    //   this.auth.onSocketResponse().pipe(filter(res => res.name === 'start_shift')).subscribe(({data}) => this.socketParam(data))
    //   this.auth.observerAppSocketStatus.subscribe((connected: boolean) => {
    //     this.stateSocket = connected
    //   });
    // }
  }

  ngOnInit(): void {

    this.isContestant = this.auth.user.role_ids.includes('116') ? 'thisinh' : 'admin';

    if (this.auth.user.role_ids.includes('116')) {
      this.state = "loading";
      void this.router.navigate(['test/panel']);
    } else {
      this.state = "data";
      this.loadData();
    }

  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadData() {
    this.isLoading = true;
    forkJoin<[Shift[], DateTimeServer]>([
      this.dotThiDanhSachService.listActivatedShifts({with: 'bank'}),
      this.serverTimeService.getTime()
    ]).subscribe({
      next: ([shifts, dataTimeServer]) => {
        this.dsDotthi = shifts.map((shift: Shift) => {
          const startAt: string = this.strToTime(shift.time_start);
          const closeAt: string = this.strToTime(shift.time_end);
          const closeAtToTime: number = new Date(shift.time_end).getTime();
          const totalQuestion: number = shift['bank'] ? shift['bank'].number_questions_per_test : 0;
          const totalTime: number = shift['bank'] ? shift['bank'].time_per_test : 0;
          const state: ShiftState = 0;
          const button: ButtonShiftState = this._listButton[state];
          return {...shift, startAt, closeAt, closeAtToTime, totalQuestion, totalTime, state, button};
        }).filter(f => f.closeAtToTime >= this.presentTime);
        this._checkCaThi();
        this.checkInterval = setInterval(() => this._checkCaThi(), 60000);
        this.checkthisinhState2 = setInterval(() => this.checkThisinhInhoidong(), 30000);
        this.isLoading = false;
        this.checkThisinhInhoidong()
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    });
  }

  strToTime(input: string): string {
    const date: Date = input ? this.helperService.dateFormatWithTimeZone(input) : null;
    let result: string = '';
    if (date) {
      result += [date.getDate().toString().padStart(2, '0'), (date.getMonth() + 1).toString().padStart(2, '0'), date.getFullYear().toString()].join('/');
      result += ' ' + [date.getHours().toString().padStart(2, '0'), date.getMinutes().toString().padStart(2, '0')].join(':');
    }
    return result;
  }

  timeConvert(num: number): string {
    const minutes: number = num % 60;
    const second: number = Math.round(num - Math.round(minutes));
    return minutes + 'phút, ' + second + ' giây';
  }

  mode: 'TABLE' | 'EXAM' = 'TABLE';

  btnTest() {
    const dotthi = this.dsDotthi.find(f => f.id === this.select_id);
    if (dotthi) {
      switch (dotthi.state) {
        case -1:
          this.notificationService.toastError('Ca thi đã quá hạn');
          break;
        case 0:
          this.notificationService.toastInfo('Ca thi chưa bắt đầu');
          break;
        case 1:

          this.shiftTestsService.createSocket(dotthi.id).subscribe({
            next: (data) => {

              this.auth.setOption(KEY_NAME_SHIFT_ID, dotthi.id);
              void this.router.navigate(['test/panel']);

            }, error: () => {
              this.notificationService.toastError('Socket create shift test error');
            }
          })
          // this.auth.setOption( KEY_NAME_SHIFT_ID , dotthi.id );
          // void this.router.navigate( [ 'test/panel' ] );
          break;
        default:
          this.notificationService.toastError('Ca thi đã quá hạn');
          break;
      }
    } else {
      this.notificationService.toastWarning('Vui lòng chọn bộ đề ');
    }
  }


  private _checkCaThi() {
    this.isLoading = true;
    this.serverTimeService.getTime().subscribe({
      next: (time) => {
        const timeNow: Date = this.helperService.dateFormatWithTimeZone(time.date);
        this.dsDotthi.map(shift => {
          if (shift.state !== -1) {
            const startTime = this.helperService.dateFormatWithTimeZone(shift.time_start);
            const endTime = this.helperService.dateFormatWithTimeZone(shift.time_end);
            if (startTime && startTime) {
              shift.state = (timeNow > endTime) ? -1 : (timeNow < startTime) ? 0 : 1;
            } else {
              shift.state = -1;
            }
            shift.button = this._listButton[shift.state];
          }
          return shift;
        });
        if (!this.dsDotthi.filter(u => u.state !== -1).length && this.checkInterval) {
          clearInterval(this.checkInterval);
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  async signOut() {
    this.notificationService.isProcessing(true);
    await this.auth.logout();
    this.router.navigate(['login']).then(() => this.notificationService.isProcessing(false), () => this.notificationService.isProcessing(false));
  }

  btnRouterResult() {
    this.router.navigate(['test/result']);
  }

  checkThisinhInhoidong() {
    this.shiftTestsService.getTotalStateBy2().subscribe({
      next: (data) => {
        this.totalThisinh = data
      },
      error: () => {
        this.totalThisinh = 0
      }
    })
  }

  btnViewLogOut(check: boolean) {
    this.viewLogout = check;
  }

  btnSelectId(id) {
    this.select_id = id;
  }

  socketParam(data) {
    this.auth.setOption(KEY_NAME_SHIFT_ID, data.shift_id);
    void this.router.navigate(['test/panel']);
  }


}
