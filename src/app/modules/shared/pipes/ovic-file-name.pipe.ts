import { Pipe , PipeTransform } from '@angular/core';
import { OvicDriveFile } from '@core/models/file';

@Pipe( {
    name : 'ovicFileName'
} )
export class OvicFileNamePipe implements PipeTransform {

    transform( file : OvicDriveFile ) : string {
        return file.name.replace( '.' + file.fileExtension , '' );
    }

}
