import { Component , EventEmitter , Input , OnInit , Output , SimpleChanges , OnChanges } from '@angular/core';
import { OvicDocument , OvicMediaSourceTypes } from '@core/models/file';
import { FileService } from '@core/services/file.service';
import { NotificationService } from '@core/services/notification.service';
import { MediaService } from '@shared/services/media.service';

@Component( {
	selector    : 'ovic-document-list' ,
	templateUrl : './ovic-document-list.component.html' ,
	styleUrls   : [ './ovic-document-list.component.css' ]
} )
export class OvicDocumentListComponent implements OnInit , OnChanges {

	@Input() data : OvicDocument[];

	@Input() listTitle : string;

	@Input() cssWrapListClasses = '';

	@Input() animationElementsClass = '';

	@Input() showPrivateFiles = true;

	@Input() disableWhenDataEmpty = false;

	@Input() emptyMess : string;

	@Input() cssClasses : string;

	@Input() noActiveSelected = false;

	@Input() redirectDownloadToFather = false;

	@Input() hintElm : any; // id file to hint

	@Output() chooseFile = new EventEmitter<OvicDocument>();

	@Output() clickOnFile = new EventEmitter<OvicDocument>();

	@Output() redirectDownload = new EventEmitter<OvicDocument>();

	docs : OvicDocument[];

	_emptyMess : string;

	version = '1.0.0';

	activeIndex : number;

	constructor(
		private fileService : FileService ,
		private notificationService : NotificationService ,
		private mediaService : MediaService
	) {
		this.activeIndex = null;
	}

	ngOnInit() : void {
		this.init();
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'data' ] ) {
			this.init();
		}
		if ( changes[ 'hintElm' ] ) {
			this.checkHintElm();
		}
	}

	init() {
		this._emptyMess = this.emptyMess || 'Không có tài liệu nào';
		const docs      = this.data ? ( this.showPrivateFiles ? this.data : this.data.filter( f => !!( f && !!( f.preview || f.download ) ) ) ) : null;
		this.docs       = docs ? docs.map( f => {
			f[ '__elm_hint' ]    = f[ 'path' ] && this.hintElm && f[ 'path' ] === this.hintElm;
			f[ 'active' ]        = false;
			f[ 'downloading' ]   = false;
			f[ 'limitDownload' ] = 9999;
			if ( f[ 'fileName' ] === undefined ) {
				f[ 'fileName' ] = f[ 'title' ];
			}
			if ( f[ 'type' ] === undefined ) {
				f[ 'type' ] = f[ 'fileExtension' ];
			}
			return f;
		} ) : null;
	}

	checkHintElm() {
		if ( this.hintElm && this.docs ) {
			this.data.map( f => {
				f[ '__elm_hint' ] = f[ 'path' ] && this.hintElm && f[ 'path' ] === this.hintElm;
			} );
		}
	}

	changeFile( file : OvicDocument , index : number ) {
		this.clickOnFile.emit( file );
		if ( this.activeIndex === index ) {
			return;
		}
		if ( this.activeIndex !== null && this.data[ this.activeIndex ] ) {
			this.data[ this.activeIndex ][ 'active' ] = false;
		}
		this.activeIndex               = index;
		this.data[ index ][ 'active' ] = true;
		this.chooseFile.emit( this.data[ index ] );
	}

	async downloadDocument( file : OvicDocument ) {
		if ( this.redirectDownloadToFather ) {
			this.redirectDownload.emit( file );
			return;
		}
		if ( file[ 'downloading' ] ) {
			return;
		}
		if ( file[ 'limitDownload' ] < 1 ) {
			this.notificationService.toastInfo( 'Bạn không được download quá 5 lần trên một file' );
			return;
		}
		if ( file.source === OvicMediaSourceTypes.serverFile ) {
			if ( !file.path || !file.fileName ) {
				this.notificationService.toastError( 'Lỗi định dạng file' );
				return;
			}
			file[ 'downloading' ] = true;
			const idFile : string = typeof file.path === 'number' ? file.path.toString() : file.path;
			try {
				await this.fileService.downloadFileByName( idFile , file.fileName );
				file[ 'downloading' ] = false;
				file[ 'limitDownload' ] -= 1;
			} catch ( e ) {
				file[ 'downloading' ] = false;
			}
		} else if ( file.source === OvicMediaSourceTypes.googleDrive ) {
			await this.mediaService.tplDownloadFileDocument( file );
		}
	}

}
