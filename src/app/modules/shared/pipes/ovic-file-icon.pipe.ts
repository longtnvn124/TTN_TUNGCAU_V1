import { Pipe , PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { OvicDriveFile , OvicFile , OvicFileStore , OvicFileUpload , OvicDocument } from '@core/models/file';
import { FileType } from '@shared/utils/syscat';

@Pipe( {
	name : 'ovicFileIcon'
} )
export class OvicFileIconPipe implements PipeTransform {

	// fileIcons = new Map( [
	// 	[ 'folder' , '/assets/images/file-icon/folder.svg' ] ,
	// 	[ 'mpeg' , '/assets/images/file-icon/audio.svg' ] ,
	// 	[ 'mp3' , '/assets/images/file-icon/audio.svg' ] ,
	// 	[ 'x-aac' , '/assets/images/file-icon/audio.svg' ] ,
	// 	[ 'zip' , '/assets/images/file-icon/zip.svg' ] ,
	// 	[ 'rar' , '/assets/images/file-icon/zip.svg' ] ,
	// 	[ 'docx' , '/assets/images/file-icon/docx.svg' ] ,
	// 	[ 'doc' , '/assets/images/file-icon/docx.svg' ] ,
	// 	[ 'pptx' , '/assets/images/file-icon/pptx.svg' ] ,
	// 	[ 'ppt' , '/assets/images/file-icon/pptx.svg' ] ,
	// 	[ 'xlsx' , '/assets/images/file-icon/xlsx.svg' ] ,
	// 	[ 'xls' , '/assets/images/file-icon/xlsx.svg' ] ,
	// 	[ 'pdf' , '/assets/images/file-icon/pdf.svg' ] ,
	// 	[ 'video' , '/assets/images/file-icon/video.svg' ] ,
	// 	[ 'mp4' , '/assets/images/file-icon/video.svg' ] ,
	// 	[ 'img' , '/assets/images/file-icon/image.svg' ] ,
	// 	[ 'text' , '/assets/images/file-icon/text.svg' ] ,
	// 	[ 'default' , '/assets/images/file-icon/text.svg' ]
	// ] );

	fileIcons = new Map( [
		[ 'folder' , 'ovic-file-icon fa fa-folder' ] ,
		[ 'mpeg' , 'ovic-file-icon fa fa-file-audio-o' ] ,
		[ 'mp3' , 'ovic-file-icon fa fa-file-audio-o' ] ,
		[ 'x-aac' , 'ovic-file-icon fa fa-file-audio-o' ] ,
		[ 'zip' , 'ovic-file-icon fa fa-file-archive-o' ] ,
		[ 'rar' , 'ovic-file-icon fa fa-file-archive-o' ] ,
		[ 'docx' , 'ovic-file-icon fa fa-file-word-o' ] ,
		[ 'doc' , 'ovic-file-icon fa fa-file-word-o' ] ,
		[ 'pptx' , 'ovic-file-icon fa fa-file-powerpoint-o' ] ,
		[ 'ppt' , 'ovic-file-icon fa fa-file-powerpoint-o' ] ,
		[ 'xlsx' , 'ovic-file-icon fa fa-file-excel-o' ] ,
		[ 'xls' , 'ovic-file-icon fa fa-file-excel-o' ] ,
		[ 'pdf' , 'ovic-file-icon fa fa-file-pdf-o' ] ,
		[ 'video' , 'ovic-file-icon fa fa-file-video-o' ] ,
		[ 'mp4' , 'ovic-file-icon fa fa-file-video-o' ] ,
		[ 'img' , 'ovic-file-icon fa fa-file-image-o' ] ,
		[ 'text' , 'ovic-file-icon fa fa-file-text-o' ] ,
		[ 'default' , 'ovic-file-icon fa fa-file-code-o' ] ,
		[ 'pdf' , 'ovic-file-icon fa fa-file-pdf-o' ]
	] );

	fileType = FileType;

	constructor(
		private sanitized : DomSanitizer
	) {}

	transform( file : OvicFile | OvicFileStore | OvicDriveFile | OvicFileUpload | File | String | OvicDocument ) : string {
		let type = file[ '_ext' ] || null;
		if ( type === null ) {
			let fileType = null;
			if ( file.hasOwnProperty( 'mimeType' ) ) {
				fileType = file[ 'mimeType' ];
			} else if ( file.hasOwnProperty( 'type' ) ) {
				fileType = file[ 'type' ];
			} else if ( typeof file === 'string' ) {
				fileType = file;
			}
			if ( fileType === '' ) {
				this.fileIcons.get( 'folder' );
			}
			type = this.fileType.has( fileType ) ? this.fileType.get( fileType ) : null;
		}
		return this.fileIcons.has( type ) ? this.fileIcons.get( type ) : 'ovic-file-icon fa fa-file-code-o';
	}

}
