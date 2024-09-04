import { Component , EventEmitter , Input , OnChanges , OnInit , Output , SimpleChanges } from '@angular/core';
import { CdkDragDrop , moveItemInArray } from '@angular/cdk/drag-drop';
import { OvicDriveFile , OvicFile , OvicTinyDriveFile } from '@core/models/file';
import { FileService } from '@core/services/file.service';
import { Subject } from 'rxjs';
import { MediaService } from '@shared/services/media.service';
import { APP_CONFIGS } from '@env';

@Component( {
	selector    : 'ovic-file-list' ,
	templateUrl : './ovic-file-list.component.html' ,
	styleUrls   : [ './ovic-file-list.component.css' ]
} )
export class OvicFileListComponent implements OnInit , OnChanges {

	@Input() fileList$ : Subject<OvicDriveFile[] | OvicFile[]>;

	@Input() fileList : OvicDriveFile[] | OvicFile[] | OvicTinyDriveFile[];

	@Input() control : boolean;

	@Input() emptyMess = 'Không có file';

	@Input() multipleMode = true;

	@Input() preview = true;

	@Input() newPreviewer = false;

	@Input() showDetail : boolean;

	@Input() canGetFileDetail = false;

	@Input() canDownload = false;

	@Input() canDeleteFilesOnStore = false; // apply for files on store

	@Input() usePersonalFileExplorer = false;

	@Input() storeLabel = APP_CONFIGS.storeLabels;

	@Input() driveFolder : string; // thư mục gốc dùng để tạo thư mục lưu trữ khi người dùng khởi tạo không gian lưu trứ mới

	@Output() outputFiles = new EventEmitter<any>();

	_fileList : any;

	constructor(
		private fileService : FileService ,
		private mediaService : MediaService
	) {}

	ngOnInit() : void {
		if ( this.fileList$ ) {
			this.fileList$.subscribe(
				files => {
					this._fileList = [];
					if ( files && files.length ) {
						files.forEach( ( file ) => {
							file[ 'upload_at' ] = this.fileService.getUploadDate( file );
							file[ 'file_size' ] = this.fileService.getFileSize( file );
							this._fileList.push( file );
						} );
						this.outputFiles.emit( this._fileList );
					}
				}
			);
		} else {
			this._fileList = [];
			if ( this.fileList && this.fileList.length ) {
				this.fileList.forEach( ( file ) => {
					file[ 'upload_at' ] = this.fileService.getUploadDate( file );
					file[ 'file_size' ] = this.fileService.getFileSize( file );
					this._fileList.push( file );
				} );
				this.outputFiles.emit( this._fileList );
			}
		}
	}

	drop( event : CdkDragDrop<string[]> ) {
		moveItemInArray( this._fileList , event.previousIndex , event.currentIndex );
		this.outputFiles.emit( this._fileList );
	}

	removeFile( file : OvicDriveFile | OvicFile ) {
		this._fileList = this._fileList.filter( f => f.id !== file.id );
		this.outputFiles.emit( this._fileList );
	}

	async fileDetail( file : OvicDriveFile | OvicFile | OvicTinyDriveFile ) {
		if ( this.preview ) {
			await this.mediaService.tplPreviewFiles( [ { id : file.id , file : file } ] , this.canGetFileDetail , this.canDownload , this.multipleMode , this.newPreviewer );
		}
	}

	async addMoreFile() {
		try {
			const settings = {
				newPreviewer : this.newPreviewer ,
				storeLabel   : this.storeLabel ,
				canDelete    : this.canDeleteFilesOnStore
			};
			if ( this.driveFolder ) {
				settings[ 'driveFolder' ] = this.driveFolder;
			}
			const result = this.usePersonalFileExplorer ? await this.mediaService.openPersonalFileManager( settings ) : await this.mediaService.openFileManager();
			if ( result && result.length ) {
				result.forEach( ( file ) => {
					file[ 'upload_at' ] = this.fileService.getUploadDate( file );
					file[ 'file_size' ] = this.fileService.getFileSize( file );
					this._fileList.push( file );
				} );
				this.outputFiles.emit( this._fileList );
			}
		} catch ( e ) {

		}
	}

	ngOnChanges( changes : SimpleChanges ) : void {
		if ( changes[ 'fileList' ] ) {
			this._fileList = [];
			if ( this.fileList && this.fileList.length ) {
				this.fileList.forEach( ( file ) => {
					file[ 'upload_at' ] = this.fileService.getUploadDate( file );
					file[ 'file_size' ] = this.fileService.getFileSize( file );
					this._fileList.push( file );
				} );
				this.outputFiles.emit( this._fileList );
			}
		}
	}
}
