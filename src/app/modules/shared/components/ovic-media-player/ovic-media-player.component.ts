import { Component , Input , OnChanges , OnInit , SimpleChanges , ViewChild } from '@angular/core';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { OvicMedia , OvicMediaSources } from '@core/models/file';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component( {
	selector    : 'app-ovic-media-player' ,
	templateUrl : './ovic-media-player.component.html' ,
	styleUrls   : [ './ovic-media-player.component.css' ]
} )
export class OvicMediaPlayerComponent implements OnInit , OnChanges {

	@Input() data : OvicMedia; /* local | serverFile | googleDrive */

	@ViewChild( PlyrComponent ) plyr : PlyrComponent;

	options : Plyr.Options = {
		autoplay           : true ,
		disableContextMenu : true ,
		invertTime         : false ,
		youtube            : {
			start          : 0 ,
			fs             : 1 ,
			playsinline    : 1 ,
			modestbranding : 1 ,
			disablekb      : 0 ,
			controls       : 0 ,
			rel            : 0 ,
			showinfo       : 0
		}
	};

	videoSources : Plyr.Source[];

	ready = false;

	htmlNoScroll = '<style>html {overflow: hidden !important;}</style>';

	constructor(
		private activeModal : NgbActiveModal
	) {}

	ngOnInit() : void {
		this.initVideo();
	}

	ngOnChanges( changes : SimpleChanges ) : void {
		if ( changes[ 'data' ] ) {
			this.initVideo();
		}
	}

	initVideo() {
		this.ready   = false;
		const source = this.data ? this.validateDatasource( this.data ) : null;
		if ( source ) {
			this.videoSources = [ source ];
			this.ready        = true;
		}
	}

	validateDatasource( media : OvicMedia ) : Plyr.Source {
		let source : Plyr.Source = null;
		if ( media.path && media.source ) {
			switch ( media.source ) {
				case OvicMediaSources.vimeo:
					source = { provider : 'vimeo' , src : media.path as string };
					break;
				case OvicMediaSources.youtube:
					source = { provider : 'youtube' , src : media.path as string };
					break;
				case OvicMediaSources.local:
					source = { provider : 'html5' , src : media.path as string };
					break;
				default :
					source = null;
					break;
			}
		}
		return source;
	}

	close() {
		this.activeModal.close( 'close' );
	}

}
