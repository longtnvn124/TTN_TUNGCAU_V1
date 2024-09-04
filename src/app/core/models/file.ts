import { Source } from 'plyr';

export interface OvicTree {
	slug : string;
	label : string;
	isOpen : boolean;
	children? : OvicTree[];
}

export interface FileDto {
	draw : number;
	recordsTotal : number;
	recordsFiltered : number;
	data : OvicFile[];
}

export interface OvicFileStore {
	id : number;
	name : string;
	title : string;
	size : number;
	type : string;
	ext : string;
	progress? : number;
}

// export interface OvicFileServer {
// 	id : number;
// 	name : string;
// 	title : string;
// 	size : number;
// 	type : string;
// 	ext : string;
// 	content? : Blob | null; // base 64 file
// 	donvi_id : number;
// 	realm : string;
// 	url : string;
// 	shared? : string; // '-1' => public | '0' => private | '|12|24|25|' => share group
// 	user_id : number;
// 	updated_at : string;
// 	created_at : string;
// }

export interface OvicFileUpload {
	id? : number;
	name : string;
	title? : string;
	type? : string;
	size : number;
	validate? : boolean;
	uploaded? : boolean;
	message? : string;
	file? : File;
}

export interface OvicDriveFolder {
	id : string;
	name : string;
	mimeType : string;
	parents : string[];
	spaces : string[];
	webViewLink? : string;
	createdTime : string;
	modifiedTime : string;
	shared : boolean;
}

export interface OvicDriveFile extends OvicTinyDriveFile {
	parents : string[];
	spaces : string[];
	webContentLink? : string;
	webViewLink? : string;
	thumbnailLink? : string;
	createdTime : string;
	modifiedTime : string;
	originalFilename : string;
	fullFileExtension : string;
}

export class OvicDriveFileObject {
	_file : OvicDriveFile;

	constructor( file : OvicDriveFile ) {
		this._file = file;
	}

	toOvicTinyDriveFile() : OvicTinyDriveFile {
		return {
			id            : this._file.id ,
			name          : this._file.name ,
			fileExtension : this._file.fileExtension ,
			shared        : this._file.shared ,
			size          : this._file.size ,
			mimeType      : this._file.mimeType
		};
	}
}


export const toOvicTinyDriveFile = ( { id , name , fileExtension , shared , size , mimeType } : { id : string; name : string; fileExtension : string; shared : boolean; size : number; mimeType : string } ) : OvicTinyDriveFile => ( { id , name , fileExtension , shared , size : size.toString() , mimeType } );

export interface OvicTinyDriveFile {
	id : string;
	mimeType : string;
	name : string;
	fileExtension : string;
	shared : boolean;
	size : string;
}

export interface OvicUploadFiles {
	files : OvicFileUpload[];
	delete : OvicFileUpload[]; // Files to delete ( these files have been uploaded and are no longer in use )
	upload : File[]; // Files required upload before it can be saved
}

export enum OvicMediaSourceTypes {
	local       = 'local' ,
	serverFile  = 'serverFile' ,
	vimeo       = 'vimeo' ,
	youtube     = 'youtube' ,
	googleDrive = 'googleDrive' ,
	encrypted   = 'encrypted'
}

export const OVIC_MEDIA_SOURCE = {
	local       : 'local' ,
	serverFile  : 'serverFile' ,
	vimeo       : 'vimeo' ,
	youtube     : 'youtube' ,
	googleDrive : 'googleDrive' ,
	encrypted   : 'encrypted'
};

export interface OvicMedia {
	type : string; // only 'audio' and 'video' is accepted
	source : OvicMediaSourceTypes;
	path : string | number;
	replay? : number;
	encryptedSource? : EncryptedSource[]; // Trường hợp source === encrypted thì trường này chứa link video
}

export const OvicMediaSources = {
	local       : 'local' ,
	serverFile  : 'serverFile' ,
	vimeo       : 'vimeo' ,
	youtube     : 'youtube' ,
	googleDrive : 'googleDrive' ,
	encrypted   : 'encrypted'
};

export interface EncryptedSource extends Source {
	src : string;
	approxDurationMs? : string;
}

export interface OvicDocument {
	type : OvicDocumentTypes;
	source : OvicMediaSourceTypes;
	path : string | number;
	fileName? : string;
	preview? : boolean;
	_ext? : string | OvicDocumentTypes;
	download? : boolean;
}

export enum OvicDocumentTypes {
	docx  = 'docx' ,
	pptx  = 'pptx' ,
	ppt   = 'ppt' ,
	pdf   = 'pdf' ,
	xlsx  = 'xlsx' ,
	audio = 'audio' ,
	video = 'video' ,
	image = 'image' ,
	text  = 'text' ,
	zip   = 'zip' ,
}

export interface OvicFileInfoOld {
	id? : number;
	name : string;
	size : number;
	type : string;
	donvi_id? : number;
	ext? : string;
	realm? : string;
	title? : string;
	url? : string;
	user_id? : number;
	updated_at? : string;
	created_at? : string;
}

export interface OvicFile {
	id : number;
	name : string;
	title : string;
	url : string;
	ext : string;
	type : string;
	size : number;
	user_id : number;
	public? : number; // '-1' => public | '0' => private | '|12|24|25|' => share group
	created_at? : string; // mySql DATETIME format: YYYY-MM-DD HH:MI:SS
	updated_at? : string; // mySql DATETIME format: YYYY-MM-DD HH:MI:SS
}

export interface Upload {

  info : OvicFile | null;
	progress : number;
	state : 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED';
}

export interface Download {
	content : Blob | null;
	progress : number;
	state : 'PENDING' | 'IN_PROGRESS' | 'DONE';
}

export interface OvicPreviewFileContent {
	id : string | number;
	file? : OvicFile | OvicDriveFile | OvicTinyDriveFile | SimpleFileLocal;
}

export interface OvicDocumentDownloadResult {
	state : 'REJECTED' | 'ERROR' | 'INVALIDATE' | 'COMPLETED' | 'CANCEL';
	download : Download;
}

export interface SimpleFileLocal {
	id : number,
	name : string,
	title : string,
	ext : string,
	type : string,
	size : number
}

export interface FileLocalPermission {
	canDownload? : boolean,
	canUpload? : boolean,
	canDelete? : boolean
}
