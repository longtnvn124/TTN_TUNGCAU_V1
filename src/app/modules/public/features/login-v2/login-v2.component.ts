import { Component , NgZone , OnDestroy , OnInit , TemplateRef } from '@angular/core';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
import { ActivatedRoute , Params , Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { debounceTime , Observable , Subject , Subscription } from 'rxjs';
import { GoogleSignIn , UserSignIn } from '@core/models/auth';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '@core/services/notification.service';
import { Title } from '@angular/platform-browser';
import { AuthService } from '@core/services/auth.service';
import { APP_CONFIGS } from '@env';
import { NORMAL_MODAL_OPTIONS } from '@core/utils/syscat';

interface FieldPasswordState {
	field : 'text' | 'password';
	icon : 'fa fa-eye' | 'fa fa-eye-slash';
	next : 'hide' | 'show';
}

interface FieldPasswordControl {
	hide : FieldPasswordState;
	show : FieldPasswordState;
}

interface LoginButton {
	isLoading : boolean;
	name : 'signIn' | 'googleSignIn';
}

declare var google : any;

@Component( {
	selector    : 'app-login-v2' ,
	templateUrl : './login-v2.component.html' ,
	styleUrls   : [ './login-v2.component.css' ]
} )
export class LoginV2Component implements OnInit , OnDestroy {

	// isRealEmail = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
	isRealEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

	loginForm : FormGroup = this.formBuilder.group( {
		username : [ '' , Validators.required ] ,
		password : [ '' , Validators.required ]
	} );

	resetPasswordForm : FormGroup = this.formBuilder.group(
		{
			email : [ '' , [ Validators.required , Validators.pattern( this.isRealEmail ) ] ]
		}
	);

	params? : Params;

	showEmailInvalid = false;

	resetPasswordLoading = false;

	today = new Date();

	copyRight = `Trung tâm phát triển phần mềm © 2015 - ${ this.today.getFullYear() } - V 2.0.0`;

	fieldPasswordControl : FieldPasswordControl = {
		hide : {
			field : 'password' ,
			icon  : 'fa fa-eye-slash' ,
			next  : 'show'
		} ,
		show : {
			field : 'text' ,
			icon  : 'fa fa-eye' ,
			next  : 'hide'
		}
	};

	formFieldPassword = this.fieldPasswordControl.hide;

	signInButton : LoginButton = { isLoading : false , name : 'signIn' };

	googleSignInButton : LoginButton = { isLoading : false , name : 'googleSignIn' };

	currentLoginButton = this.signInButton;

	isLoading = true;

	modalResetPasswordRef? : NgbModalRef;

	login$ = new Subject<UserSignIn>();

	resetPassword$ = new Subject<string>();

	subscriptions = new Subscription();

	constructor(
		private formBuilder : FormBuilder ,
		private activatedRoute : ActivatedRoute ,
		private modalService : NgbModal ,
		private router : Router ,
		private notificationService : NotificationService ,
		private title : Title ,
		private auth : AuthService ,
		private ngZone : NgZone
	) {
		const observerActiveRouter$  = this.activatedRoute.queryParams.subscribe( params => this.params = params );
		const observerLogin$         = this.login$.pipe( debounceTime( 100 ) ).subscribe( info => this.checkLogin( info ) );
		const observerResetPassword$ = this.resetPassword$.pipe( debounceTime( 100 ) ).subscribe( email => this.requestResetPassword( email ) );
		this.subscriptions.add( observerActiveRouter$ );
		this.subscriptions.add( observerLogin$ );
		this.subscriptions.add( observerResetPassword$ );
	}

	ngOnInit() : void {
		this.isLoading = false;
		this.checkUserLoginStatus();
	}

	ngAfterViewInit() : void {
		google.accounts.id.initialize( {
			client_id   : '973389896263-82pnr0ieien6ud03fkvqfckdoc9673f5.apps.googleusercontent.com' ,
			callback    : ( response : any ) => this.handleGoogleSignIn( response ) ,
			context     : 'signin' ,
			auto_select : false
		} );

		google.accounts.id.renderButton(
			document.getElementById( 'sign-up-form__btn--google-sign-in' ) ,
			{ width : '100%' , size : 'large' , type : 'standard' , shape : 'pill' , text : 'signin_with' , theme : 'filled_blue' }  // customization attributes
		);
	}

	checkUserLoginStatus() {
		if ( this.auth.isLoggedIn() ) {
			const redirect  = this.params && this.params.hasOwnProperty( 'redirect' ) ? this.params[ 'redirect' ] : APP_CONFIGS.defaultRedirect;
			const pageTitle = APP_CONFIGS.pageTitle || 'admin area';
			this.title.setTitle( pageTitle );
			void this.router.navigate( [ redirect ] , { queryParams : this.params } );
		} else {
			this.title.setTitle( 'Login Account' );
		}
	}

	get f() { return this.loginForm.controls; }

	async btnSignIn( button : LoginButton ) {
		if ( this.isLoading || button.isLoading ) {
			return;
		}
		this.currentLoginButton = button;
		if ( button.name === 'signIn' && this.loginForm.valid ) {
			const signInfo = {
				username : this.loginForm.controls[ 'username' ].value ,
				password : this.loginForm.controls[ 'password' ].value
			};
			this.login$.next( signInfo );
		} else if ( button.name === 'googleSignIn' ) {
			// const signInfo = await this.socialAuthService.signIn( GoogleLoginProvider.PROVIDER_ID );
			// this.login$.next( signInfo );
		}
	}

	checkLogin( info : UserSignIn ) {
		this.isLoading                    = true;
		this.currentLoginButton.isLoading = true;
		this.auth.login( info ).subscribe( {
			next  : logged => {
				this.isLoading                    = false;
				this.currentLoginButton.isLoading = false;
				this.checkUserLoginStatus();
			} ,
			error : error => {
				this.isLoading                    = false;
				this.currentLoginButton.isLoading = false;
			}
		} );
	}

	googleLogin( signIn : GoogleSignIn ) {
		this.auth.googleLogin( signIn ).subscribe( {
			next  : logged => {
				this.currentLoginButton.isLoading = false;
				void this.checkUserLoginStatus();
			} ,
			error : error => {
				this.isLoading                    = false;
				this.currentLoginButton.isLoading = false;
			}
		} );
	}

	toggleShowPassword() {
		this.formFieldPassword = this.fieldPasswordControl[ this.formFieldPassword.next ];
	}

	async openResetPasswordPanel( template : TemplateRef<any> ) {
		this.resetPasswordForm.reset( {
			email : ''
		} );
		this.modalResetPasswordRef = this.modalService.open( template , NORMAL_MODAL_OPTIONS );
		try {
			const status = await this.modalResetPasswordRef.result;
			if ( status ) {
				const userEmail   = this.resetPasswordForm.controls[ 'email' ].value;
				const bodyMessage = `<p class="text-muted">Yêu cầu RESET mật khẩu của bạn đã được chấp nhận, Chúng tôi đã gửi đến <b class="text-primary">${ userEmail }</b> một email hướng dẫn khôi phục mật khẩu, nếu bạn không nhận được email vui lòng kiểm tra trong Spam.</p>`;
				this.notificationService.popup( bodyMessage , 'Thao tác thành công' ).then( () => null , () => null );
			}
		} catch ( e ) {

		}
	}

	closeModalResetPassword() {
		this.modalResetPasswordRef?.close( false );
	}

	checkEmailIsValid( email : string ) : Observable<boolean> {
		return new Observable<boolean>( observable => {
			observable.next( email ? this.isRealEmail.test( email.toLowerCase() ) : true );
			return {
				unsubscribe() {}
			};
		} );
	}

	btnClickSendRequestPassword() {
		if ( this.resetPasswordForm.valid ) {
			this.resetPassword$.next( this.resetPasswordForm.controls[ 'email' ].value );
		}
	}

	requestResetPassword( email : string ) {
		if ( !this.resetPasswordLoading ) {
			this.resetPasswordLoading = true;
			this.auth.forgetPassword( email ).subscribe( {
				next  : () => {
					this.resetPasswordLoading = false;
					this.closeModalResetPassword();
				} ,
				error : () => {
					this.resetPasswordLoading = false;
					this.notificationService.toastError( 'Thác tác thất bại' );
				}
			} );
		}
	}

	ngOnDestroy() : void {
		if ( this.subscriptions ) {
			this.subscriptions.unsubscribe();
		}
	}

	async handleGoogleSignIn( response : GoogleSignIn ) {
		// // This next is for decoding the idToken to an object if you want to see the details.
		// const base64Url   = response.credential.split( '.' )[ 1 ];
		// const base64      = base64Url.replace( /-/g , '+' ).replace( /_/g , '/' );
		// const jsonPayload = decodeURIComponent( atob( base64 ).split( '' ).map( function ( c ) {
		// 	return '%' + ( '00' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -2 );
		// } ).join( '' ) );
		// const token       = JSON.parse( jsonPayload );
		// const signInfo    = { id : token.sub , email : token.email , idToken : response.credential };
		await this.ngZone.run( () => this.googleLogin( response ) );
	}

}
