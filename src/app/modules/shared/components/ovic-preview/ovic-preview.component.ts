import { Component , EventEmitter , Input , OnInit , Output } from '@angular/core';
import { Download , OvicDriveFile , OvicFile , OvicPreviewFileContent , OvicTinyDriveFile , SimpleFileLocal } from '@core/models/file';
import { NgbActiveModal , NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { tap } from 'rxjs/operators';
import { OvicDownloadProgressComponent } from '../ovic-download-progress/ovic-download-progress.component';
import { Observable } from 'rxjs';
import { FileService } from '@core/services/file.service';
import { FileType } from '../../utils/syscat';
import { OvicFileDetailComponent } from '../ovic-file-detail/ovic-file-detail.component';
import * as Plyr from 'plyr';

@Component( {
	selector    : 'ovic-preview' ,
	templateUrl : './ovic-preview.component.html' ,
	styleUrls   : [ './ovic-preview.component.css' ]
} )
export class OvicPreviewComponent implements OnInit {

	@Input() files : OvicPreviewFileContent[];

	@Output() canDownload : boolean;

	@Output() canGetFileDetail : boolean;

	/*---------------------------------------------------*/

	@Output() state = new EventEmitter<string>();

	isLoading : boolean;

	initLoading : boolean;

	objectType : string;

	mediaType : string;

	rawContent : string;

	validContent : boolean;

	loadingFail : boolean;

	download$ : Observable<Download>;

	textNav = '0/0';

	fileContent : Blob | null;

	fileType = FileType;

	nextIndex : number;

	prevIndex : number;

	currentIndex : number;

	isLoadFileContent : boolean;

	mediaSource : Plyr.Source[] = [];

	constructor(
		private activeModal : NgbActiveModal ,
		private modalService : NgbModal ,
		private fileService : FileService
	) { }

	ngOnInit() : void {
		this.initLoading = true;
		if ( this.files.length ) {
			this.changeSelectedElm( 0 );
		}
	}

	async changeSelectedElm( index : number ) {
		if ( index === null ) {
			return;
		}
		this.currentIndex = index;
		this.nextIndex    = this.files[ index + 1 ] ? index + 1 : null;
		this.prevIndex    = this.files[ index - 1 ] ? index - 1 : null;
		this.textNav      = ''.concat( ( index + 1 ).toString() , '/' , this.files.length.toString() );
		await this.getFileInfo( this.files[ index ] );
	}

	async downloadFile( index : number ) {
		if ( !this.canDownload ) {
			return;
		}
		const popup                  = this.modalService.open( OvicDownloadProgressComponent , { size : 'sm' , backdrop : 'static' , centered : true , windowClass : 'ovic-modal-class ovic-modal-style-02' } );
		popup.componentInstance.file = this.files[ index ].file;
		await popup.result;
	}

	async previewFile( index : number ) {
		if ( !this.canGetFileDetail ) {
			return;
		}
		const popup                  = this.modalService.open( OvicFileDetailComponent , { size : 'sm' , backdrop : 'static' , centered : true , windowClass : 'ovic-modal-class ovic-modal-style-02' } );
		popup.componentInstance.file = this.files[ index ].file;
		await popup.result;
	}

	/*******************************************************
	 * Show file content to view
	 * *****************************************************/
	getFileInfo( elm : OvicPreviewFileContent ) {
		this.loadingFail = false;
		if ( elm.file ) {
			this.loadAndShowFileContent( elm.file );
			return;
		}
		if ( !elm.id ) {
			this.loadingFail = true;
			return;
		}
		const fileId : string = elm.id.toString();
		this.isLoading        = true;
		if ( typeof elm.id === 'number' ) {
			this.fileService.getFileInfo( fileId ).subscribe( {
				next  : res => {
					this.isLoading = false;
					if ( res[ 0 ] ) {
						elm.file = res[ 0 ];
						this.loadAndShowFileContent( elm.file );
					} else {
						this.isLoadFileContent = false;
						this.loadingFail       = true;
					}
				} ,
				error : () => {
					this.isLoading         = false;
					this.isLoadFileContent = false;
					this.loadingFail       = true;
				}
			} );
		} else {
			this.fileService.gdGetFile( fileId ).subscribe( {
				next  : file => {
					this.isLoading = false;
					elm.file       = file;
					this.loadAndShowFileContent( elm.file );
				} ,
				error : () => {
					this.isLoading         = false;
					this.isLoadFileContent = false;
					this.loadingFail       = true;
				}
			} );
		}
	}

	/*******************************************************
	 * Load file content
	 * -loading file content from file info
	 * *****************************************************/
	async loadAndShowFileContent( file : OvicFile | OvicDriveFile | OvicTinyDriveFile | SimpleFileLocal ) {
		this.loadingFail       = false;
		this.isLoadFileContent = false;
		this.download$         = null;
		this.rawContent        = null;
		this.fileContent       = null;
		this.validContent      = false;
		this.mediaSource       = [];
		this.mediaType         = file[ 'type' ] || file[ 'mimeType' ];
		this.objectType        = this.mediaType && this.fileType.has( this.mediaType ) ? this.fileType.get( this.mediaType ) : 'undefined';
		if ( [ 'folder' , 'pdf' , 'xlsx' , 'xls' , 'pptx' , 'ppt' , 'doc' , 'docx' , 'zip' , 'rar' ].includes( this.objectType ) ) {
			this.isLoading = false;
			return;
		}
		this.validContent      = true;
		this.isLoadFileContent = true;
		if ( typeof file.id === 'number' ) {
			this.download$ = this.fileService.downloadWithProgress( file.id ).pipe( tap( {
				next  : res => {
					if ( res.state === 'DONE' ) {
						this.isLoadFileContent = false;
						if ( [ 'mp4' , 'mp3' ].includes( this.objectType ) ) {
							this.mediaSource = new Array( {
								type : res.content.type ,
								src  : URL.createObjectURL( res.content )
							} );
							this.rawContent  = '1';
						} else {
							this.convertData( res.content );
						}
					}
				} ,
				error : () => {
					this.loadingFail       = true;
					this.isLoadFileContent = false;
				}
			} ) );
		} else {
			// if ( [ 'mp4' , 'mp3' ].includes( this.objectType ) ) {
			//     this.isLoadFileContent = false;
			//     this.loadingFail       = false;
			//     this.fileService.gdStreamMedia( file.id ).subscribe(
			//         stream => {
			//             this.rawContent = URL.createObjectURL( stream );
			//         } ,
			//         err => {
			//             this.loadingFail       = true;
			//             this.isLoadFileContent = false;
			//         }
			//     );
			// } else {
			//     this.download$ = this.fileService.gdDownloadWithProgress( file.id ).pipe( tap(
			//         res => {
			//             if ( res.state === 'DONE' ) {
			//                 this.isLoadFileContent = false;
			//                 this.convertData( res.content );
			//             }
			//         } ,
			//         () => {
			//             this.loadingFail       = true;
			//             this.isLoadFileContent = false;
			//         } )
			//     );
			// }

			this.download$ = this.fileService.gdDownloadWithProgress( file.id ).pipe( tap( {
				next  : res => {
					if ( res.state === 'DONE' ) {
						this.isLoadFileContent = false;
						if ( [ 'mp4' , 'mp3' ].includes( this.objectType ) ) {
							this.mediaSource = new Array( {
								type : res.content.type ,
								src  : URL.createObjectURL( res.content )
							} );
							this.rawContent  = '1';
						} else {
							this.convertData( res.content );
						}
					}
				} ,
				error : () => {
					this.loadingFail       = true;
					this.isLoadFileContent = false;
				}
			} ) );
		}
	}

	async convertData( blob : Blob ) {
		if ( blob.type === 'text/plain' ) {
			this.rawContent = await blob.text();
		} else {
			this.rawContent = await this.fileService.blobToBase64( blob );
		}
	}

	close() {
		this.state.emit( 'closed' );
		this.activeModal.close( 'close' );
	}

}
