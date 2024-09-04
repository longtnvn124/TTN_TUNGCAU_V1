import { Attribute , Directive , ElementRef , Input , Renderer2 } from '@angular/core';

@Directive( {
	selector : '[appGetAvatar]'
} )
export class GetAvatarDirective {

	@Input() userId : number;

	constructor(
		@Attribute( 'userEmail' ) public userEmail : string ,
		@Attribute( 'userName' ) public userName : string ,
		private renderer : Renderer2 ,
		private el : ElementRef
	) {
		this.renderer.addClass( this.el , 'loading' );
	}

}
