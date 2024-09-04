import { AfterViewInit , Component , ElementRef , Host , HostListener , NgZone , OnDestroy , OnInit , TemplateRef , ViewChild } from '@angular/core';
import { GoogleSignIn } from '@core/models/auth';
import { AuthService } from '@core/services/auth.service';
import { Title } from '@angular/platform-browser';
import { MODAL_SIZE_AUTO , NORMAL_MODAL_OPTIONS } from '@core/utils/syscat';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
import { ActivatedRoute , Params , Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '@core/services/notification.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { debounceTime , Subject , takeUntil } from 'rxjs';
import { APP_CONFIGS } from '@env';

interface windowObject {
	innerWidth : number,
	innerHeight : number
}

declare var google : any;

@Component( {
	selector    : 'app-login-video' ,
	templateUrl : './login-video.component.html' ,
	styleUrls   : [ './login-video.component.css' ]
} )
export class LoginVideoComponent implements OnInit , AfterViewInit , OnDestroy {

	@HostListener( 'window:resize' , [ '$event' ] ) onResize( event ) {
		this.videoSize = event.target;
	};

	videoConfigs = { width : 1902 , height : 1080 };

	ratio = 16 / 9;

	formReset : FormGroup;

	formLogin : FormGroup;

	isRealEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/g;

	noticeEmailInvalid = false;

	formResetLoading = false;

	sendResetPasswordFail = false;

	private observerCloser = new Subject();

	private eventSignIn = new Subject<string>();

	params : Params;

	loading = false;

	password = {
		icon : 'pi pi-eye-slash' ,
		type : 'password'
	};

	@ViewChild( 'video' , { static : true } ) video : ElementRef<HTMLVideoElement>;

	isVideoBackgroundPLaying = false;

	constructor(
		private fb : FormBuilder ,
		private activatedRoute : ActivatedRoute ,
		private modalService : NgbModal ,
		private router : Router ,
		private notification : NotificationService ,
		private title : Title ,
		private auth : AuthService ,
		private ngZone : NgZone
	) {
		this.videoSize = window;
		this.formReset = this.fb.group( { email : [ '' , [ Validators.required , Validators.email ] ] } );
		this.formLogin = this.fb.group( { username : [ '' , Validators.required ] , password : [ '' , Validators.required ] } );
		this.activatedRoute.queryParams.pipe( takeUntil( this.observerCloser ) ).subscribe( params => this.params = params );
		this.eventSignIn.asObservable().pipe( takeUntil( this.observerCloser ) , debounceTime( 100 ) ).subscribe( () => this.__signIn() );
	}

	ngOnInit() : void {
		void this.checkUserLoginStatus();
	}

	set videoSize( { innerWidth , innerHeight } : windowObject ) {
		const videoHeight = innerWidth * 9 / 16;
		if ( videoHeight >= innerHeight ) {
			this.videoConfigs.height = videoHeight;
			this.videoConfigs.width  = innerWidth;
		} else {
			this.videoConfigs.height = innerHeight;
			this.videoConfigs.width  = innerHeight * 16 / 9;
		}
	}

	ngAfterViewInit() : void {
		if ( google ) {
			google.accounts.id.initialize( {
				// client_id : '973389896263-82pnr0ieien6ud03fkvqfckdoc9673f5.apps.googleusercontent.com' ,
				client_id : '196027039836-kjhoo8f8p3i2eldcodouvs94p1gbi4jo.apps.googleusercontent.com' ,
				callback  : ( response : any ) => this.handleGoogleSignIn( response )
			} );
			google.accounts.id.renderButton(
				document.getElementById( 'sign-up-form__btn--google-sign-in' ) ,
				{ width : '100%' , size : 'large' , type : 'standard' , shape : 'square' , logo_alignment : 'left' , text : 'signin_with' , theme : 'filled_blue' }  // customization attributes
			);
		}
		this.video.nativeElement.onplay = () => this.isVideoBackgroundPLaying = true;
	}

	playBackgroundVideo() {
		if ( !this.isVideoBackgroundPLaying && this.video ) {
			void this.video.nativeElement.play();
		}
	}

	async handleGoogleSignIn( response : GoogleSignIn ) {
		await this.ngZone.run( () => this.googleSignIn( response ) );
	}

	btnSignIn( event : Event ) {
		event.preventDefault();
		event.stopPropagation();
		this.eventSignIn.next( '' );
	}

	private __signIn() {
		if ( this.formLogin.valid ) {
			this.loading = true;
			this.auth.login( this.formLogin.value ).subscribe( {
				next  : () => this.checkUserLoginStatus() ,
				error : () => this.loading = false
			} );
		}
	}

	googleSignIn( info : GoogleSignIn ) {
		this.auth.googleLogin( info ).subscribe( {
			next  : () => this.checkUserLoginStatus() ,
			error : () => this.loading = false
		} );
	}

	async openResetPasswordPanel( template : TemplateRef<any> ) {
		this.formReset.reset( { email : '' } );
		try {
			const email = await this.modalService.open( template , MODAL_SIZE_AUTO ).result;
			if ( email ) {
				const bodyMessage = `<p class="text-muted">Yêu cầu RESET mật khẩu của bạn đã được chấp nhận, Chúng tôi đã gửi đến <b class="text-primary">${ email }</b> một email hướng dẫn khôi phục mật khẩu, nếu bạn không nhận được email vui lòng kiểm tra trong Spam.</p>`;
				void this.notification.popup( bodyMessage , 'Thao tác thành công' );
			}
		} catch ( e ) {

		}
	}

	btnSendRequestPassword( modalRef : NgbModalRef ) {
		if ( this.formReset.valid ) {
			const email           = this.formReset.controls[ 'email' ].value;
			this.formResetLoading = true;
			this.auth.forgetPassword( email ).subscribe( {
				next  : () => {
					this.formResetLoading = false;
					modalRef.close( email );
				} ,
				error : () => {
					this.formResetLoading      = false;
					this.sendResetPasswordFail = true;
				}
			} );
		}
	}

	closePanelResetPassword() {}

	ngOnDestroy() : void {
		this.observerCloser.next( 'close' );
		this.observerCloser.complete();
	}

	async checkUserLoginStatus() {
		// if ( this.auth.isLoggedIn() ) {
		// 	const redirect  = this.params && this.params.hasOwnProperty( 'redirect' ) ? this.params[ 'redirect' ] : APP_CONFIGS.defaultRedirect;
		// 	const pageTitle = APP_CONFIGS.pageTitle || 'admin area';
		// 	this.title.setTitle( pageTitle );
		// 	await this.router.navigate( [ redirect ] , { queryParams : this.params } );
		// 	this.loading = false;
		// } else {
		// 	this.title.setTitle( 'Đăng nhập tài khoản' );
		// 	this.loading = false;
		// }
    if(this.auth.isLoggedIn()){

      const roles= this.auth.roles;
      const  checkThisinh = roles.length ===1 && roles.find(f=>f.id === 87);
      if ( this.auth.isLoggedIn() ) {
        if(checkThisinh){
          this.router.navigate(['test']);
          this.loading = false;
        }else{
          const redirect  = this.params && this.params.hasOwnProperty( 'redirect' ) ? this.params[ 'redirect' ] : APP_CONFIGS.defaultRedirect;
          const pageTitle = APP_CONFIGS.pageTitle || 'admin area';
          this.title.setTitle( pageTitle );
          await this.router.navigate( [ redirect ] , { queryParams : this.params } );
          this.loading = false;
        }
      }
      else{
        	this.title.setTitle( 'Đăng nhập tài khoản' );
        	this.loading = false;
          this.notification.toastError("Sai tài khoản hoặc mật khẩu");
      }


    }
	}

	changePasswordMode() {
		if ( this.password.type === 'text' ) {
			this.password.icon = 'pi pi-eye-slash';
			this.password.type = 'password';
		} else {
			this.password.icon = 'pi pi-eye';
			this.password.type = 'text';
		}
	}
}
