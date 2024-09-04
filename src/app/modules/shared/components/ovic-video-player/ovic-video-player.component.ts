import { Component , Input , OnChanges , OnInit , SimpleChanges } from '@angular/core';
import { OvicMedia , OvicMediaSources } from '@core/models/file';
import { FileService } from '@core/services/file.service';
import { NotificationService } from '@core/services/notification.service';

@Component( {
	selector    : 'ovic-video-player' ,
	templateUrl : './ovic-video-player.component.html' ,
	styleUrls   : [ './ovic-video-player.component.css' ]
} )
export class OvicVideoPlayerComponent implements OnInit , OnChanges {

	constructor(
		private fileService : FileService ,
		private notificationService : NotificationService
	) { }

	@Input() data : OvicMedia; /* local | serverFile | googleDrive */

	@Input() original : string; /* local | serverFile | vimeo | youtube | googleDrive */

	@Input() videoId : string;

	@Input() autoResponsive = false;

	@Input() allowFUllScreen = false;

	@Input() width = 519;

	@Input() height = 292;

	@Input() videoType = 'video/mp4'; // only available with serverFile or local original

	_original : string;

	_videoId : string;

	videoLoaded = false;

	urlObject : string;

	_videoSources = OvicMediaSources;

	ngOnInit() : void {
		void this.initSettings();
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'data' ] ) {
			void this.initSettings();
		}
	}

	async initSettings() {
		this.videoLoaded = false;
		this._original   = this.data && this.data.source ? this.data.source : null;
		this._videoId    = this.data && this.data.path ? this.data.path as string : null;

		if ( !this._original || !this._videoId ) {
			return;
		}

		switch ( this._original ) {
			case OvicMediaSources.local:
				this.urlObject   = await this.loadFileFromLocal( this._videoId );
				this.videoLoaded = true;
				break;
			case OvicMediaSources.serverFile:
				this.urlObject   = await this.loadFileFromServerFile( this._videoId );
				this.videoLoaded = true;
				break;
			case OvicMediaSources.vimeo:
				this.urlObject   = 'https://player.vimeo.com/video/'.concat( this._videoId , '?color=ffffff&title=0&byline=0&portrait=0' );
				this.videoLoaded = true;
				break;
			case OvicMediaSources.youtube:
				this.urlObject   = 'https://www.youtube.com/embed/'.concat( this._videoId , '?modestbranding=1' );
				this.videoLoaded = true;
				break;
			case OvicMediaSources.googleDrive:
				this.urlObject   = this._videoId;
				this.videoLoaded = true;
				break;
			default :
				this.videoLoaded = false;
		}

	}

	loadFileFromLocal( fileName : string ) : Promise<string> {
		return new Promise<string>( resolve => {
			this.fileService.getImageContentFromLocalAssesFile( fileName ).subscribe( {
				next  : urlSrc => resolve( urlSrc ) ,
				error : () => {
					resolve( null );
					this.notificationService.toastError( 'Lỗi không load được file content' );
				}
			} );
		} );
	}

	loadFileFromServerFile( name_or_id : string ) : Promise<string> {
		return new Promise<string>( resolve => {
			this.fileService.getImageContent( name_or_id ).subscribe( {
				next  : urlSrc => resolve( urlSrc ) ,
				error : () => {
					resolve( null );
					this.notificationService.toastError( 'Lỗi không load được file content' );
				}
			} );
		} );
	}
}
