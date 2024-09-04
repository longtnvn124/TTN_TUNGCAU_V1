import { Component , Input , OnInit } from '@angular/core';
import { OvicDriveFile , OvicFile } from '@core/models/file';
import { FileService } from '@core/services/file.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component( {
	selector    : 'ovic-file-detail' ,
	templateUrl : './ovic-file-detail.component.html' ,
	styleUrls   : [ './ovic-file-detail.component.css' ]
} )
export class OvicFileDetailComponent implements OnInit {

	@Input() file : OvicFile | OvicDriveFile;

	constructor(
		private fileService : FileService ,
		private activeModal : NgbActiveModal
	) {}

	title : string;
	uploadAt : string;
	size : string;
	isFolder : boolean;

	ngOnInit() : void {
		if ( this.file ) {
			this.title    = this.file.hasOwnProperty( 'title' ) ? this.file[ 'title' ] : this.file[ 'name' ];
			this.uploadAt = this.fileService.getUploadDate( this.file );
			if ( this.file[ 'mimeType' ] && this.file[ 'mimeType' ] === 'application/vnd.google-apps.folder' ) {
				this.size     = '';
				this.isFolder = true;
			} else {
				this.size     = this.fileService.getFileSize( this.file );
				this.isFolder = false;
			}
		}
	}

	close() {
		this.activeModal.close( 'close' );
	}

}
