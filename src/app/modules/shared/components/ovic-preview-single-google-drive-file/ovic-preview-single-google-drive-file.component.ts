import { Component , EventEmitter , Input , OnInit , Output } from '@angular/core';
import { Download , OvicPreviewFileContent , OvicTinyDriveFile } from '@core/models/file';
import { FileService } from '@core/services/file.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface SingleFileDriverPreview {
	id : string;
	url : string;
}

@Component( {
	selector    : 'ovic-preview-single-google-drive-file' ,
	templateUrl : './ovic-preview-single-google-drive-file.component.html' ,
	styleUrls   : [ './ovic-preview-single-google-drive-file.component.css' ]
} )
export class OvicPreviewSingleGoogleDriveFileComponent implements OnInit {

	@Input() files : OvicPreviewFileContent[];

	@Output() state = new EventEmitter<string>();

	_file : OvicTinyDriveFile;

	objectPublic : SingleFileDriverPreview;

	objectIsImage = false; //

	isLoading = true;

	loadingState : 'preload' | 'loading' | 'success' | 'failed' = 'preload';

	download$ : Observable<Download>;

	htmlNoScroll = '<style>html {overflow: hidden !important;}</style>';

	imageSrc : string;

	viewerOptions = {
		className    : 'viewer-toolbar--big-size --preview-single-elem' ,
		title        : false ,
		slideOnTouch : false ,
		fullscreen   : false ,
		loop         : false ,
		navbar       : false
	};

	panelVisible : boolean;

	constructor(
		private activeModal : NgbActiveModal ,
		private fileService : FileService
	) { }

	ngOnInit() : void {
		this.init();
	}

	init() {
		this.panelVisible = true;
		if ( this.files && this.files.length ) {
			this._file = this.files[ 0 ].file as OvicTinyDriveFile;
			this._loadFile( this._file ).then( () => null );
		}
	}

	async _loadFile( file : OvicTinyDriveFile ) {
		if ( [ 'png' , 'jpg' , 'jpeg' ].includes( file.fileExtension ) ) {
			this.objectIsImage = true;
			this.loadImageContent( file );
		} else {
			this.objectIsImage = false;
			try {
				this.objectPublic = await this.publicFile( file );
			} catch ( err ) {
				this.loadingState = 'failed';
			}
		}
		this.isLoading = false;
	}

	publicFile( file : OvicTinyDriveFile ) : Promise<SingleFileDriverPreview> {
		return new Promise<SingleFileDriverPreview>( resolve => {
			const id  = file.id;
			const url = 'https://drive.google.com/file/d/' + file.id + '/preview';
			if ( file.shared ) {
				resolve( { id , url } );
			} else {
				this.fileService.gdShare( id ).subscribe( {
					next  : () => resolve( { id , url } ) ,
					error : () => resolve( null )
				} );
			}
		} );
	}

	close() {
		this.panelVisible = false;
		this.state.emit( 'closed' );
		this.activeModal.close( 'close' );
	}

	/*******************************************************
	 * Show file content to view
	 * *****************************************************/
	loadImageContent( file : OvicTinyDriveFile ) {
		this.loadingState = 'loading';
		this.download$    = this.fileService.gdDownloadWithProgress( file.id ).pipe(
			tap( {
					next  : res => {
						if ( res.state === 'DONE' ) {
							if ( res.content.size ) {
								this.fileService.blobToBase64( res.content ).then(
									src => {
										this.imageSrc     = src;
										this.loadingState = 'success';
										this.download$    = null;
									} ,
									() => {
										this.download$    = null;
										this.loadingState = 'failed';
									}
								);
							} else {
								this.download$    = null;
								this.loadingState = 'failed';
							}
						}
					} ,
					error : () => {
						this.loadingState = 'failed';
						this.download$    = null;
					}
				}
			)
		);
	}

	viewerHide( event ) { if ( this.panelVisible ) { this.close(); } }

	viewerHidden( event ) { if ( this.panelVisible ) { this.close(); } }

	imageObjectReady( img : HTMLElement ) { img.click(); }

}
