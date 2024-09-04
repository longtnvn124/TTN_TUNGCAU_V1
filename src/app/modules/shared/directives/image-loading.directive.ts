import { Attribute , Directive , ElementRef , HostListener , Renderer2 } from '@angular/core';

@Directive( {
	selector : '[appImageLoading]'
} )
export class ImageLoadingDirective {

	/*<img uiImageLoader onErrorSrc="/assets/images/no-available-800.png" loader="/assets/images/image-loader.svg" [src]="post.imagePath" [alt]="post.title">*/

	constructor(
		@Attribute( 'loader' ) public loader : string ,
		@Attribute( 'onErrorSrc' ) public onErrorSrc : string ,
		private renderer : Renderer2 ,
		private el : ElementRef
	) {
		this.renderer.setAttribute( this.el.nativeElement , 'src' , this.loader );
		this.renderer.addClass( this.el.nativeElement , 'img-loading' );
	}

	@HostListener( 'load' ) onLoad() {
		this.renderer.removeClass( this.el.nativeElement , 'img-loading' );
		this.renderer.addClass( this.el.nativeElement , 'img-loaded' );
		this.renderer.setAttribute( this.el.nativeElement , 'src' , this.el.nativeElement.src );
	}

	@HostListener( 'error' ) onError() {
		this.renderer.removeClass( this.el.nativeElement , 'img-loading' );
		this.renderer.addClass( this.el.nativeElement , 'img-loaded' );
		this.renderer.addClass( this.el.nativeElement , 'img-load-fail' );
		this.renderer.setAttribute( this.el.nativeElement , 'src' , this.onErrorSrc );
	}
}
