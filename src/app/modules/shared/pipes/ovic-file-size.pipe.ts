import { Pipe , PipeTransform } from '@angular/core';
import { OvicDriveFile , OvicFile , OvicFileStore  } from '@core/models/file';
import { FileService } from '@core/services/file.service';

@Pipe( {
	name : 'ovicFileSize'
} )
export class OvicFileSizePipe implements PipeTransform {

	constructor( private fileService : FileService ) {}

	transform( file : OvicFile | OvicFileStore | OvicDriveFile | File | any ) : string {
		return this.fileService.getFileSize( file );
	}

}
