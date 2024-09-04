import { Pipe , PipeTransform } from '@angular/core';
import { OvicDriveFile } from '@core/models/file';

@Pipe( {
	name : 'ovicFileExtension'
} )
export class OvicFileExtensionPipe implements PipeTransform {

	transform( file : OvicDriveFile ) : string {
		return '.' + file.fileExtension;
	}

}
