import { Component , Input , OnInit , OnChanges , SimpleChanges } from '@angular/core';
import { OvicDocument , OvicDocumentTypes , OvicMedia , OvicMediaSources } from '@core/models/file';
import { FileService } from '@core/services/file.service';
import { viewerType } from 'ngx-doc-viewer/ngx-doc-viewer';
import { environment , getLinkDownload } from '@env';

@Component( {
	selector    : 'ovic-document-viewer' ,
	templateUrl : './ovic-document-viewer.component.html' ,
	styleUrls   : [ './ovic-document-viewer.component.css' ]
} )
export class OvicDocumentViewerComponent implements OnInit , OnChanges {

	@Input() document : OvicDocument;

	@Input() frameWidth = '100%'; // only working with docx | ppt | xlsx ...

	@Input() frameHeight = '80vh'; // only working with docx | ppt | xlsx ...

	@Input() viewer = 'google'; // 'google' | 'office' | 'mammoth' | 'pdf' | 'url'

	data : OvicDocument;

	ovicMedia : OvicMedia;

	urlObject : string;

	error : boolean;

	errMessage : string;

	_viewer : viewerType;

	isLoading : boolean;

	addClass = 'ovic-document-null';

	constructor( public fileService : FileService ) {
	}

	ngOnInit() : void {
		this.changeDocument( this.document );
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'document' ] || changes[ 'document' ] ) {
			this.changeDocument( this.document );
		}
	}

	changeDocument( input : OvicDocument ) {
		this.isLoading        = true;
		this.data             = input;
		this.urlObject        = '';
		this.error            = false;
		this.errMessage       = '';
		this.addClass         = `ovic-document-${ input.type }`;
		const idFile : string = typeof input.path === 'number' ? input.path.toString() : input.path;
		switch ( this.data.type ) {
			case OvicDocumentTypes.image :
				if ( this.data.source === OvicMediaSources.serverFile ) {
					this.fileService.getImageContent( idFile ).subscribe( {
							next  : url => {
								this.urlObject = url;
								this.isLoading = false;
							} ,
							error : () => {
								this.isLoading  = false;
								this.urlObject  = '';
								this.error      = true;
								this.errMessage = 'Lỗi tải file';
							}
						}
					);
				} else {
					this.error      = true;
					this.errMessage = 'Only internal resource was accepted plz';
				}
				break;
			case OvicDocumentTypes.audio :
				this.isLoading = false;
				this.ovicMedia = {
					type   : 'audio' ,
					source : this.data.source ,
					path   : idFile ,
					replay : 999
				};
				break;
			case OvicDocumentTypes.video :
				this.isLoading = false;
				this.ovicMedia = {
					type   : 'video' ,
					source : this.data.source ,
					path   : idFile ,
					replay : 999
				};
				break;
			default:
				if ( [ 'docx' , 'pptx' , 'ppt' , 'pdf' , 'xlsx' ].includes( this.data.type ) ) {
					if ( this.data.source === OvicMediaSources.serverFile ) {
						this.isLoading = this.viewer === 'google';
						this.urlObject = getLinkDownload( parseInt( idFile , 10 ) );
					} else {
						this.isLoading  = false;
						this.error      = true;
						this.errMessage = 'Only internal resource was accepted plz';
					}
				} else {
					this.isLoading  = false;
					this.error      = true;
					this.errMessage = 'Định dạng file của bạn chưa được hỗ trợ';
				}
				break;
		}
		this._viewer = this.viewer === 'office' ? 'office' : 'google';
	}

	disableLazy() {
		setTimeout( () => this.isLoading = false , 2 );
	}

}
