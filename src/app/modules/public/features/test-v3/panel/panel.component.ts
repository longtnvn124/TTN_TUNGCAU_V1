import {Component, HostListener, OnInit} from '@angular/core';
import {Shift, ShiftTests} from "@shared/models/quan-ly-doi-thi";
import {forkJoin, interval, merge, Observable, of, Subject, switchMap, takeUntil} from "rxjs";
import {NganHangCauHoi, NganHangDe} from "@shared/models/quan-ly-ngan-hang";
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
import {KEY_NAME_CONTESTANT_EMAIL, KEY_NAME_CONTESTANT_ID, KEY_NAME_SHIFT_ID} from "@shared/utils/syscat";
import {OvicButton} from "@core/models/buttons";
import {catchError} from "rxjs/operators";

import { io , Socket } from 'socket.io-client';
import {APP_CONFIGS, getWsUrl, wsPath} from "@env";
import {accessToken} from "mapbox-gl";
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
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit {

  pageChange:'admin'| 'contestant'|'loading'  = "loading";

  constructor(
    private auth: AuthService,
  ) {
  }
  private socket : Socket;

  ngOnInit(): void {

    this.checkInit();
  }

  checkInit() {
    console.log(this.auth.roles);
    const rolesUsers = this.auth.roles;
    this.pageChange= rolesUsers.find(f=>f.name === 'thi-sinh') ? 'contestant' : 'admin';
    console.log( this.pageChange);
  }


}
