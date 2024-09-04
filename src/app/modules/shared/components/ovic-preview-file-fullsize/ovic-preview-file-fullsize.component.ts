import { Component , EventEmitter , Input , OnDestroy , OnInit , Output } from '@angular/core';
import * as Plyr from 'plyr';
import { OvicDocumentTypes } from '@core/models/file';

@Component( {
	selector    : 'ovic-preview-file-fullsize' ,
	templateUrl : './ovic-preview-file-fullsize.component.html' ,
	styleUrls   : [ './ovic-preview-file-fullsize.component.css' ]
} )
export class OvicPreviewFileFullsizeComponent implements OnInit , OnDestroy {

	@Input() mediaType : OvicDocumentTypes;

	@Input() mediaSource : Plyr.Source[];

	@Input() textContent : string;

	@Output() onClose = new EventEmitter<string>();

	isOpen = true;

	timeOut;

	viewerOptions = {
		className    : 'viewer--no-backdrop viewer-toolbar--big-size --preview-single-elem' ,
		backdrop     : false ,
		title        : false ,
		slideOnTouch : false ,
		fullscreen   : false ,
		loop         : false ,
		navbar       : false
	};

	pdfZoom : number;

	pdfPage : number;

	pdfRotation : number;

	pdfShowAll : boolean;

	constructor() { }

	ngOnInit() : void {
		this.resetPdfControl();
	}

	imageObjectReady( img : HTMLElement ) { img.click(); }

	onHide( event ) { if ( this.isOpen ) { this.close(); } }

	close() {
		this.isOpen = false;
		if ( this.timeOut ) {
			clearTimeout( this.timeOut );
		}
		this.timeOut = setTimeout( () => this.onClose.emit( 'closed' ) , 200 );
	}

	ngOnDestroy() : void {
		if ( this.timeOut ) {
			clearTimeout( this.timeOut );
		}
	}

	resetPdfControl() {
		this.pdfZoom     = 1;
		this.pdfPage     = 1;
		this.pdfRotation = 0;
		this.pdfShowAll  = true;
	}

	pdfControlShowAll() {
		this.pdfShowAll = this.pdfShowAll !== true;
	}

	pdfControlNextPage() {
		if ( !isNaN( this.pdfPage ) ) {
			this.pdfPage++;
		} else {
			this.pdfPage = 0;
		}
	}

	pdfControlPrevPage() {
		if ( !isNaN( this.pdfPage ) ) {
			this.pdfPage--;
		} else {
			this.pdfPage = 0;
		}
	}

	pdfControlZoomIn() {
		if ( !isNaN( this.pdfPage ) ) {
			const rate   = ( 10 / 100 );
			this.pdfZoom = ( this.pdfZoom - rate ) > 0 ? this.pdfZoom - rate : 0;
		} else {
			this.pdfPage = 0;
		}
	}

	pdfControlZoomOut() {
		if ( !isNaN( this.pdfPage ) ) {
			this.pdfZoom += ( 10 / 100 );
		} else {
			this.pdfPage = 0;
		}
	}

	pdfControlRotation() {
		if ( this.pdfRotation >= 270 ) {
			this.pdfRotation = 0;
		} else {
			this.pdfRotation += 90;
		}
	}

}
