import { AfterViewInit , Directive , ElementRef } from '@angular/core';
import { FileService } from '@core/services/file.service';

@Directive( {
	selector : '[ovicMediaLoader]'
} )
export class OvicMediaLoaderDirective implements AfterViewInit {

	constructor(
		private tagElement : ElementRef ,
		private fileService : FileService
	) {}

	ngAfterViewInit() : void {
		const imgTags           = this.tagElement.nativeElement.querySelectorAll( 'img[data-org="serverFile"]' );
		const imgStoredInDriver = this.tagElement.nativeElement.querySelectorAll( 'img[data-org="googleDrive"]' );
		if ( imgTags && imgTags.length ) {
			this.tagElement.nativeElement.classList.add( 'ovic-element--contain-images' );
			this.tagElement.nativeElement.closest( 'ul' ).classList.add( 'ovic-list--contain-images' );
			imgTags.forEach( img => {
				if ( !isNaN( img.getAttribute( 'src' ).toString() ) ) {
					img.className = 'ovic-img-lazy';
					img.setAttribute( 'data-src' , img.getAttribute( 'src' ) );
					img.src = `assets/images/image-loading-3.gif?ovic-src=${ img.getAttribute( 'src' ) }`;
					this.fileService.getFileAsObjectUrl( img.getAttribute( 'data-src' ) ).subscribe(
						{
							next  : src => {
								img.src = src;
								img.className += ' img-loaded';
								// img.closest( 'li' ).classList.add( 'ovic-element--contain-images' );
							} ,
							error : () => img.className += 'img-loaded-failed'
						}
					);
				}
			} );
		}

		if ( imgStoredInDriver && imgStoredInDriver.length ) {
			this.tagElement.nativeElement.classList.add( 'ovic-element--contain-images' );
			this.tagElement.nativeElement.closest( 'ul' ).classList.add( 'ovic-list--contain-images' );
			imgStoredInDriver.forEach( img => {
				if ( img.getAttribute( 'src' ) && !img.classList.contains( 'img-loaded' ) ) {
					img.className = 'ovic-img-lazy';
					const imgId   = img.getAttribute( 'src' );
					img.setAttribute( 'data-src' , img.getAttribute( 'src' ) );
					img.src = 'assets/images/image-loading-3.gif';
					this.fileService.gdGetFileAsObjectUrl( imgId ).subscribe( {
						next  : src => {
							img.src = src;
							img.className += ' img-loaded';
							// img.closest( 'li' ).classList.add( 'ovic-element--contain-images' );
						} ,
						error : () => img.className += 'img-loaded-failed'
					} );
				}
			} );
		}
	}

}
