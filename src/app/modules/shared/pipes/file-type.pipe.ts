import { Pipe , PipeTransform } from '@angular/core';
import { OvicDriveFile , OvicFile , OvicFileStore , OvicFileUpload , OvicDocument } from '@core/models/file';
import { FileType } from '@shared/utils/syscat';

@Pipe( { name : 'ovicFileType' } )
export class FileTypePipe implements PipeTransform {

	fileType = FileType;

	transform( file : OvicFile | OvicFileStore | OvicDriveFile | OvicFileUpload | File | OvicDocument ) : string {
		if ( file[ '_ext' ] ) {
			return file[ '_ext' ];
		} else {
			return file[ 'type' ] || file[ 'mimeType' ] && this.fileType.has( file[ 'type' ] || file[ 'mimeType' ] ) ? this.fileType.get( file[ 'type' ] || file[ 'mimeType' ] ) : 'undefined';
		}
	}

}
