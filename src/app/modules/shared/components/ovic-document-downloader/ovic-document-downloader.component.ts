import { Component , EventEmitter , Input , OnInit , Output } from '@angular/core';
import { Download , OvicDriveFile , OvicFile , OvicDocumentDownloadResult } from '@core/models/file';
import { Observable } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FileService } from '@core/services/file.service';
import { tap } from 'rxjs/operators';
import { DownloadProcess } from '@shared/components/ovic-download-progress/ovic-download-progress.component';

const STATE_REJECTED : OvicDocumentDownloadResult = {
	state    : 'REJECTED' ,
	download : null
};

const STATE_ERROR : OvicDocumentDownloadResult = {
	state    : 'ERROR' ,
	download : null
};

const STATE_INVALID : OvicDocumentDownloadResult = {
	state    : 'INVALIDATE' ,
	download : null
};

const STATE_CANCEL : OvicDocumentDownloadResult = {
	state    : 'CANCEL' ,
	download : null
};

@Component( {
	selector    : 'app-ovic-document-downloader' ,
	templateUrl : './ovic-document-downloader.component.html' ,
	styleUrls   : [ './ovic-document-downloader.component.css' ]
} )
export class OvicDocumentDownloaderComponent implements OnInit {

	@Input() file : OvicFile | OvicDriveFile;

	@Input() delay = 1000;

	@Output() processing = new EventEmitter<OvicDocumentDownloadResult>();

	download$ : Observable<Download>;

	downloadProcess = DownloadProcess;

	_file : OvicFile | OvicDriveFile;

	fileName = 'unknown';

	STATE_CANCEL = STATE_CANCEL;

	constructor(
		private activeModal : NgbActiveModal ,
		private fileService : FileService
	) { }

	ngOnInit() : void {
		if ( this.file ) {
			this.validateFile( this.file );
		}
	}

	validateFile( file : OvicFile | OvicDriveFile ) {
		if ( !file || ( file[ 'mimeType' ] && file[ 'mimeType' ] === 'application/vnd.google-apps.folder' ) ) {
			return this.processing.emit( STATE_INVALID );
		}
		this.fileName = file[ 'title' ] || file[ 'name' ];
		this._file    = file;
		const state   = 'COMPLETED';
		if ( file && typeof file.id === 'number' ) {
			this.download$ = this.fileService.downloadWithProgress( file.id , null ).pipe( tap( {
				next  : download => download.state === 'DONE' && this.close( { state , download } ) ,
				error : () => this.close( STATE_ERROR )
			} ) );
		} else if ( file && typeof file.id === 'string' ) {
			this.download$ = this.fileService.gdDownloadWithProgress( file.id , null ).pipe( tap( {
				next  : download => download.state === 'DONE' && this.close( { state , download } ) ,
				error : () => this.close( STATE_ERROR )
			} ) );
		} else {
			this.processing.emit( STATE_REJECTED );
		}
	}

	close( process : OvicDocumentDownloadResult ) {
		const delay = process.download && process.download.state === 'DONE' ? this.delay : 0;
		setTimeout( () => this.activeModal.close( process ) , delay );
		this.processing.emit( process );
	}
}
