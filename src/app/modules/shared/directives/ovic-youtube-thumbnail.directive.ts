import { Directive , HostBinding , Input , OnInit } from '@angular/core';
import { HelperService } from '@core/services/helper.service';
import { DomSanitizer , SafeStyle } from '@angular/platform-browser';

@Directive( {
	selector : '[ovicYoutubeThumbnail]'
} )
export class OvicYoutubeThumbnailDirective implements OnInit {

	@Input( 'url' ) url : string;

	@HostBinding( 'style.background' ) bg : SafeStyle;

	constructor(
		private helperService : HelperService ,
		private sanitized : DomSanitizer
	) {

	}

	ngOnInit() : void {
		let style = '#f5f5f5';
		if ( this.url ) {
			const video_id = this.helperService.getYoutubeIdFromUrl( this.url );
			style          = video_id ? `#f5f5f5 url(https://img.youtube.com/vi/${ video_id }/0.jpg)` : '#f5f5f5';
		}
		this.bg = this.sanitized.bypassSecurityTrustStyle( style );
	}

}
