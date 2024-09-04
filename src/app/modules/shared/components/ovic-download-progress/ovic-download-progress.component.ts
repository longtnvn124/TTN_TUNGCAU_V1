import { Component , EventEmitter , Input , OnInit , Output } from '@angular/core';
import { FileService } from '@core/services/file.service';
import { Download , OvicDriveFile , OvicFile , OvicDocument , OvicMediaSources } from '@core/models/file';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export enum DownloadProcess {
	started   = 'started' ,
	cancel    = 'cancel' ,
	rejected  = 'rejected' ,
	error     = 'error' ,
	completed = 'completed'
}

@Component( {
	selector    : 'ovic-download-progress' ,
	templateUrl : './ovic-download-progress.component.html' ,
	styleUrls   : [ './ovic-download-progress.component.css' ]
} )
export class OvicDownloadProgressComponent implements OnInit {

	@Input() file : OvicFile | OvicDriveFile;

	@Input() fileDocument : OvicDocument;

	@Input() delay = 1000;

	@Output() processing = new EventEmitter<DownloadProcess>();

	download$ : Observable<Download>;

	downloadProcess = DownloadProcess;

	_file : OvicFile | OvicDriveFile | OvicDocument;

	fileName = 'unknown';

	constructor(
		private activeModal : NgbActiveModal ,
		private fileService : FileService
	) { }

	ngOnInit() : void {
		if ( this.file ) {
			this.validateFile( this.file );
		} else if ( this.fileDocument ) {
			this.validateFileDocument( this.fileDocument );
		}
	}

	validateFileDocument( file : OvicDocument ) {
		if ( !file[ 'fileName' ] || !file[ 'path' ] || !file[ 'source' ] || !file[ 'type' ] ) {
			this.processing.emit( DownloadProcess.rejected );
			return;
		}
		this.fileName         = file[ 'fileName' ];
		this._file            = file;
		const idFile : string = typeof file.path === 'number' ? file.path.toString() : file.path;
		if ( OvicMediaSources.serverFile === file.source ) {
			this.download$ = this.fileService.downloadWithProgress( parseInt( idFile , 10 ) , file[ 'fileName' ] ).pipe(
				tap( {
					next  : res => res.state === 'DONE' && this.close( DownloadProcess.completed ) ,
					error : () => this.close( DownloadProcess.error )
				} )
			);
		} else if ( OvicMediaSources.googleDrive === file.source ) {
			this.download$ = this.fileService.gdDownloadWithProgress( idFile , file[ 'fileName' ] ).pipe(
				tap( {
					next  : res => res.state === 'DONE' && this.close( DownloadProcess.completed ) ,
					error : () => this.close( DownloadProcess.error )
				} )
			);
		} else {
			this.processing.emit( DownloadProcess.rejected );
			return;
		}
	}

	validateFile( file : OvicFile | OvicDriveFile ) {
		if ( !file || ( file[ 'mimeType' ] && file[ 'mimeType' ] === 'application/vnd.google-apps.folder' ) ) {
			return this.processing.emit( DownloadProcess.rejected );
		}
		this.fileName = file[ 'title' ] || file[ 'name' ];
		this._file    = file;
		if ( file && typeof file.id === 'number' ) {
			this.download$ = this.fileService.downloadWithProgress( file.id , file[ 'title' ] || file[ 'name' ] ).pipe( tap( {
				next  : res => res.state === 'DONE' && this.close( DownloadProcess.completed ) ,
				error : () => this.close( DownloadProcess.error )
			} ) );
		} else if ( file && typeof file.id === 'string' ) {
			this.download$ = this.fileService.gdDownloadWithProgress( file.id , file.name ).pipe( tap( {
				next  : res => res.state === 'DONE' && this.close( DownloadProcess.completed ) ,
				error : () => this.close( DownloadProcess.error )
			} ) );
		} else {
			this.processing.emit( DownloadProcess.rejected );
		}
	}

	close( process : DownloadProcess ) {
		const delay = process === DownloadProcess.completed ? this.delay : 0;
		setTimeout( () => this.activeModal.close( process ) , delay );
		this.processing.emit( process );
	}
}
