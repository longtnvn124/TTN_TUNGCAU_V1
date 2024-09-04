import { Directive , HostBinding , Attribute , Renderer2 , ElementRef , HostListener , Input } from '@angular/core';

@Directive( {
	selector : '[getAvatarByUserId]'
} )
export class GetAvatarByUserIdDirective {

	@HostBinding( 'class.media-error' ) error : boolean;

	@HostBinding( 'class.media-loading' ) loading : boolean;

	@HostBinding( 'class.media-loaded' ) loaded : boolean;

	@Input() userId : number;

	constructor(
		@Attribute( 'userEmail' ) public userEmail : string ,
		@Attribute( 'userName' ) public userName : string ,
		private renderer : Renderer2 ,
		private el : ElementRef
	) {

		// this.renderer.setAttribute( this.el.nativeElement , 'src' , this.loader );
	}

	// @HostListener( 'load' ) onLoad() {
	// 	this.renderer.setAttribute( this.el.nativeElement , 'src' , this.el.nativeElement.src );
	// }
	//
	// @HostListener( 'error' ) onError() {
	// 	this.renderer.setAttribute( this.el.nativeElement , 'src' , this.onErrorSrc );
	// }
}
