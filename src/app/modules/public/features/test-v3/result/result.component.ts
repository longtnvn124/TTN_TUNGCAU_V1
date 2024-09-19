import {Component, OnInit} from '@angular/core';
import {User} from "@core/models/user";
import {Socket} from "socket.io-client";
import {forkJoin, of, Subscription, switchMap} from "rxjs";
import {AuthService} from "@core/services/auth.service";
import {UserService} from "@core/services/user.service";
import {DotThiKetQuaService} from "@shared/services/dot-thi-ket-qua.service";
import {ShiftTestQuestionService} from "@shared/services/shift-test-question.service";
import {Router} from "@angular/router";
import {NotificationService} from "@core/services/notification.service";
import {stringifyTask} from "@angular/compiler-cli/ngcc/src/execution/tasks/utils";

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  presentTime       : number = new Date().getTime();

  checkInterval     : any;
  checkthisinhState2: any;
  isLoading         : boolean = false;
  user              : User;
  viewLogout        : boolean = false;
  select_id         : number = 0;
  state             : 'loading' | 'data' = "loading";
  userList          : User[];
  constructor(
    private auth: AuthService,
    private userService: UserService,
    private shiftTestService: DotThiKetQuaService,
    private shiftTestQuestionSerivce: ShiftTestQuestionService,
    private router:Router,
    private notificationService : NotificationService
  ) {
    this.user = this.auth.user;
  }

  ngOnInit(): void {
    this.loadInit()
  }

  loadInit() {
    this.state = "loading";
    this.userService.getUserListsByRole_ids('116', 'id,avatar,display_name').pipe(switchMap(m=>{
      const ids = m.map(a=>a.id);
      return forkJoin([of(m),this.shiftTestService.getShiftTestByIds(ids).pipe(switchMap(a=>{
        const shift_test_ids = a.map(b=>b.id);
        return forkJoin([of(a), this.shiftTestQuestionSerivce.getDataByShiftTestIdsAndquestion_id(shift_test_ids)])
      }))]);
    })).subscribe({
      next:([user , [shift_test,shiftTestQuestion]])=>{
        this.userList  = user.filter(f=>f.id !==5011607).map(m=>{
          const shifttestUserIds = shift_test.filter(f=>f.thisinh_id === m.id).map(a=>a.id);
          if (shifttestUserIds.length>0){
           

            m['__total'] = shiftTestQuestion.reduce((sum, item) => {
              if (shifttestUserIds.includes(item.shift_test_id)) {
                return sum + item.score;
              }
              return sum;
            }, 0);
          }
          else{
            m['__total'] = 0;

          }
          return m;
        })
        console.log(this.userList);
        this.state = "data";
      },
      error:()=>{
        this.state = "loading";
        this.notificationService.toastError('Load dữ liệu không thành công ');
      }
    })
  }
  btnViewLogOut(check:boolean){
    this.viewLogout = check;
  }
  async signOut() {
    this.notificationService.isProcessing( true );
    await this.auth.logout();
    this.router.navigate( [ 'login' ]).then( () => this.notificationService.isProcessing( false ) , () => this.notificationService.isProcessing( false ) );
  }

  btnExit(){
    this.router.navigate( [ 'test/shift/' ]);
  }
}
