import { Component, OnInit } from '@angular/core';
import {Subject} from "rxjs";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {EmailCheckValidator} from "@core/utils/validators";
import {EmailSender, ThiSinhService} from "@shared/services/thi-sinh.service";
import {Router} from "@angular/router";
import {AuthService} from "@core/services/auth.service";
import {KEY_NAME_SHIFT_ID} from "@shared/utils/syscat";
import {NotificationService} from "@core/services/notification.service";


@Component({
  selector: 'app-check-email',
  templateUrl: './check-email.component.html',
  styleUrls: ['./check-email.component.css']
})
export class CheckEmailComponent implements OnInit {

  formGroup : FormGroup = this.fb.group( {
    email     : [ '' , [Validators.required  , EmailCheckValidator, Validators.maxLength(50), Validators.minLength(2) ] ],
  } );
  type_check_email :1|2|3 =1;//1"check elail 2"trang thái gửi 3"gi thanh cong
  destroy$ : Subject<string> = new Subject<string>();
  isLoading : boolean = false;
  constructor(
    private fb : FormBuilder ,
    private auth : AuthService,
    private router :Router,
    private notifi:NotificationService,
    private thisinhService: ThiSinhService
  ) {

  }

  get f() : { [ key : string ] : AbstractControl } {
    return this.formGroup.controls;
  }


  ngOnInit() : void {
    // if ( this.auth.getOption( KEY_NAME_CONTESTANT_EMAIL) ) {
    //   this.formGroup.get( 'email' ).setValue( this.auth.getOption( KEY_NAME_CONTESTANT_EMAIL ) );
    // }
  }


  ngOnDestroy() : void {
    this.destroy$.next( 'completed' );
    this.destroy$.complete();
  }

  resetText(){
    this.formGroup.reset({email:''});
  }
  linkstart:string;
  sendEmailCheck:boolean =true;
  btnSendFormData(){
    const databinding: {shift_id: number, email_user: string}= {
      shift_id:this.auth.getOption(KEY_NAME_SHIFT_ID),
      email_user:this.f['email'].value
    }
    this.type_check_email =2;


    const code = this.auth.encryptObjectData(databinding);

    // this.router.navigate(['test/contestant/'], { queryParams: { code }});
    const fullUrl: string = `${location.origin}${this.router.serializeUrl(this.router.createUrlTree(['test/contestant/'], { queryParams: { code }}))}`;

    this.linkstart = fullUrl;
    const email = this.f['email'].value;
    const objectdata :EmailSender ={
      name: 'E-mail xác thực tài khoản đăng ký cuộc thi',
      to: email,
      title:'Thông báo E-mail truy cập đợt thi',
      link:this.linkstart
      }
    this.sendEmailCheck=false;

    this.thisinhService.sendEmailContestant(objectdata).subscribe({
      next:(a)=>{
        // this.sendEmailCheck=false;
        this.type_check_email =3;

        this.notifi.toastSuccess('Hệ thống đã gửi email');
      },
      error:(e)=>{
        this.type_check_email =1;

        this.sendEmailCheck=true;
        this.notifi.toastError('Requests không hợp lệ');
      }
    })
  }
}

