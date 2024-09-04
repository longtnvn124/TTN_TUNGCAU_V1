import { Component , OnInit , TemplateRef } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { DomSanitizer , SafeHtml } from '@angular/platform-browser';

@Component( {
	selector    : 'app-home' ,
	templateUrl : './home-sample.component.html' ,
	styleUrls   : [ './home-sample.component.css' ]
} )
export class HomeSampleComponent implements OnInit {

	regexTagAs = /<\s*a[^>]*>(.*?)<\s*\/\s*a>/gmi;
	regex      = new RegExp( '<\s*a[^>]*>(.*?)<\s*\/\s*a>' , 'gmi' );
	regexUrl   = new RegExp( `^http[s]?:\/\/(www\.)?(.*)?\/?(.)*` , 'gmi' );
	link       = /(?:(?:https?|ftp):\/\/|\b(?:[a-z\d]+\.))(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))?/gmi;

	text  = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?retiredLocale=vi <a href="/life">life</a> sed consectetur. <a href="/work">Work</a> quis risus eget urna mollis ornare <a href="/about">about</a> leo.';
	text3 = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?retiredLocale=vi  life sed consectetur Work quis risus eget urna mollis ornare about leo';
	text2 = 'http://foo.com http://goo.gl https://foo.com https://www.foo.com https://www.foo.com/ https://www.foo.com/bar http://goo.gl/1 http://goo.gl/2 foo (http://goo.gl/1) http://goo.gl/(2) http://foo.com/. http://foo.com/! http://foo.com/, This url does not have a protocol: goo.gl/1 http://firstround.com/review/thoughts-on-gender-and-radical-candor/?ct=t(How_Does_Your_Leadership_Team_Rate_12_3_2015) https://google.com https:google.com www.cool.com.au http://www.cool.com.au http://www.cool.com.au/ersdfs http://www.cool.com.au/ersdfs?dfd=dfgd@s=1 http://www.cool.com:81/index.html';


	buttonDefer = '<button ovicLogger="child-button" pButton pRipple type="button btn-success" label="Child button" icon="pi pi-time"></button>';

	innerButton : SafeHtml;

	constructor(
		private auth : AuthService ,
		private notificationService : NotificationService ,
		private domSanitizer : DomSanitizer
	) {
		// const result = this.text.match( this.regex );
		// const url    = this.text3.match( this.link );



		// const url = this.text2.replace( this.link , text => {
		// 	return ( text.startsWith( 'www.' ) || text.startsWith( 'http' ) ) ? `<a href="${ text }">${ text }</a>` : text;
		// } );

	}

	ngOnInit() : void {
	}

	async alertError() {
		const btn = await this.notificationService.alertError( 'Sorry...' , 'You lost the match!' , 'OK :(' , true );
		console.log( btn );
	}

	async alertSuccess() {
		const btn = await this.notificationService.alertSuccess( 'Congratulations!' , 'You won the match!' , 'Ok' , true );
		console.log( btn );
	}

	async alertWarning() {
		const btn = await this.notificationService.alertWarning( 'Be careful...' , 'That\'s dangerous!' , 'OMG' , true );
		console.log( btn );
	}

	async alertInfo() {
		const btn = await this.notificationService.alertInfo( 'Quick tip!' , 'Avoid this path...' , 'Ok' , true );
		console.log( btn );
	}

	async alertConfirm() {
		const btn = await this.notificationService.alertConfirm( 'Quick reminder!' , 'Are you sure?' , null , true );
		console.log( btn );
	}

	openMenu( size : number , template : TemplateRef<any> ) {
		this.notificationService.openSideNavigationMenu( { template , size } );
	}

	closeMenu() {
		this.notificationService.closeSideNavigationMenu();
	}

	showChildButton() {
		this.innerButton = this.innerButton ? '' : this.domSanitizer.bypassSecurityTrustHtml( this.buttonDefer );
	}

}
