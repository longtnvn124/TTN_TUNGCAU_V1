import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OvicDocument , OvicDocumentDownloadResult , OvicDriveFile , OvicFile , OvicPreviewFileContent } from '@core/models/file';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { OvicPreviewComponent } from '@shared/components/ovic-preview/ovic-preview.component';
import { DownloadProcess , OvicDownloadProgressComponent } from '@shared/components/ovic-download-progress/ovic-download-progress.component';
import { OvicFileDetailComponent } from '@shared/components/ovic-file-detail/ovic-file-detail.component';
import { OvicPreviewSingleGoogleDriveFileComponent } from '@shared/components/ovic-preview-single-google-drive-file/ovic-preview-single-google-drive-file.component';
import { OvicDocumentDownloaderComponent } from '@shared/components/ovic-document-downloader/ovic-document-downloader.component';
import { OvicFileExplorerComponent } from '@shared/components/ovic-file-explorer/ovic-file-explorer.component';
import { FULL_SIZE_MODAL_OPTIONS } from '@shared/utils/syscat';
import { OvicPersonalFileExplorerComponent } from '@shared/components/ovic-personal-file-explorer/ovic-personal-file-explorer.component';
import { APP_CONFIGS } from '@env';
import { AvatarMaker } from '@shared/models/avatar-maker';
import { OutputFormat } from 'ngx-image-cropper/lib/interfaces/cropper-options.interface';
import { OvicAvatarMakerComponent } from '@shared/components/ovic-avatar-maker/ovic-avatar-maker.component';

interface FileExploreSettings extends Object {
	newPreviewer? : boolean;
	gridMode? : boolean;
	multipleMode? : boolean;
	canDelete? : boolean;
	storeLabel? : string[];
	acceptFileType? : string[]; // filter file by file's extension. Eg: ['pdf','doc','docx','ppt','pptx']
	driveFolder? : string;
}

export interface AvatarMakerSetting {
	maintainAspectRatio? : boolean;
	aspectRatio : number;
	resizeToWidth : number;
	imageQuality? : number;
	format? : OutputFormat;
	resizeToHeight? : number;
	cropperMinWidth? : number;
	cropperMinHeight? : number;
	cropperMaxHeight? : number;
	cropperMaxWidth? : number;
	cropperStaticWidth? : number;
	cropperStaticHeight? : number;
	dirRectImage? : {
		enable : boolean;
		dataUrl : string
	};
}

@Injectable( {
	providedIn : 'root'
} )
export class MediaService {

	constructor( private modalService : NgbModal ) { }

	tplPreviewFiles( files : OvicPreviewFileContent[] , canGetFileDetail = false , canDownload = false , multipleMode = true , newVersion = false ) : Promise<any> {
		const options : NgbModalOptions          = {
			size     : 'lg' ,
			backdrop : 'static' ,
			centered : true ,
			// windowClass : newVersion ? 'ovic-modal-class ovic-modal-no-background --modal-show-full--true' : 'ovic-modal-class ovic-modal-no-background'
			windowClass : newVersion ? 'ovic-modal-class --modal-show-full--true' : 'ovic-modal-class'
		};
		const popup                              = newVersion ? this.modalService.open( OvicPreviewSingleGoogleDriveFileComponent , options ) : this.modalService.open( OvicPreviewComponent , options );
		popup.componentInstance.files            = files;
		popup.componentInstance.canDownload      = canDownload;
		popup.componentInstance.canGetFileDetail = canGetFileDetail;
		popup.componentInstance.multipleMode     = multipleMode;
		return popup.result;
	}

	tplDownloadFile( file : OvicFile | OvicDriveFile | OvicDocument ) : Promise<DownloadProcess> {
		const popup                  = this.modalService.open( OvicDownloadProgressComponent , { size : 'sm' , backdrop : 'static' , centered : true , windowClass : 'ovic-modal-class ovic-modal-style-02' } );
		popup.componentInstance.file = file;
		return popup.result;
	}

	tplLoadFile( file : OvicFile | OvicDriveFile | OvicDocument ) : Promise<OvicDocumentDownloadResult> {
		const popup                  = this.modalService.open( OvicDocumentDownloaderComponent , { size : 'sm' , backdrop : 'static' , centered : true , windowClass : 'ovic-modal-class ovic-modal-style-02' } );
		popup.componentInstance.file = file;
		return popup.result;
	}

	tplDownloadFileDocument( file : OvicDocument ) : Promise<DownloadProcess> {
		const popup                          = this.modalService.open( OvicDownloadProgressComponent , { size : 'sm' , backdrop : 'static' , centered : true , windowClass : 'ovic-modal-class ovic-modal-style-02' } );
		popup.componentInstance.fileDocument = file;
		return popup.result;
	}

	tplFileDetail( file : OvicFile | OvicDriveFile | OvicDocument ) : Promise<any> {
		const popup                  = this.modalService.open( OvicFileDetailComponent , { size : 'sm' , backdrop : 'static' , centered : true , windowClass : 'ovic-modal-class ovic-modal-style-02' } );
		popup.componentInstance.file = file;
		return popup.result;
	}

	openFileManager( multiple = false ) : Promise<OvicFile[] | OvicDriveFile[]> {
		const panel                          = this.modalService.open( OvicFileExplorerComponent , FULL_SIZE_MODAL_OPTIONS );
		panel.componentInstance.multipleMode = multiple;
		return panel.result;
	}

	openPersonalFileManager( settings? : FileExploreSettings ) : Promise<OvicFile[] | OvicDriveFile[]> {
		const modalOption                      = {
			scrollable  : true ,
			size        : 'xl' ,
			windowClass : 'modal-xxl ovic-modal-class ovic-modal-full-size ovic-modal-full-size--no-padding' ,
			centered    : true
		};
		const panel                            = this.modalService.open( OvicPersonalFileExplorerComponent , modalOption );
		panel.componentInstance.newPreviewer   = settings && settings.hasOwnProperty( 'newPreviewer' ) ? settings.newPreviewer : false;
		panel.componentInstance.multipleMode   = settings && settings.hasOwnProperty( 'multipleMode' ) ? settings.multipleMode : true;
		panel.componentInstance.gridMode       = settings && settings.hasOwnProperty( 'gridMode' ) ? settings.gridMode : false;
		panel.componentInstance.storeLabel     = settings && settings.hasOwnProperty( 'storeLabel' ) ? settings.storeLabel : [];
		panel.componentInstance.acceptFileType = settings && settings.hasOwnProperty( 'acceptFileType' ) ? settings.acceptFileType : [];
		panel.componentInstance.canDelete      = settings && settings.hasOwnProperty( 'canDelete' ) ? settings.canDelete : true;
		panel.componentInstance.driveFolder    = settings && settings.hasOwnProperty( 'driveFolder' ) ? settings.driveFolder : APP_CONFIGS.cloudStorage;
		return panel.result;
	}

	callAvatarMaker( options : AvatarMakerSetting ) : Promise<AvatarMaker> {
		const option : NgbModalOptions = {
			size        : 'lg' ,
			backdrop    : 'static' ,
			centered    : true ,
			windowClass : 'ovic-modal-class ovic-modal-no-background'
		};
		const panel                    = this.modalService.open( OvicAvatarMakerComponent , option );
		Object.keys( options ).forEach( key => panel.componentInstance[ key ] = options[ key ] );
		return panel.result;
	}
}
