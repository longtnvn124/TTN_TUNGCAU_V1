import { Pipe , PipeTransform } from '@angular/core';
import { OvicDriveFile , OvicFile , OvicFileStore } from '@core/models/file';

@Pipe( { name : 'ovicFileShareState' } )
export class OvicFileShareStatePipe implements PipeTransform {

	stateIcons = new Map( [
		[ '|-1|' , 'fa fa-globe' ] ,
		[ '|0|' , 'fa fa-lock' ] ,
		[ '*' , 'fa fa-users' ]
	] );

	transform( file : OvicFile | OvicFileStore | OvicDriveFile ) : string {
		let icon = this.stateIcons.get( '|-1|' );
		if ( typeof file.id === 'number' && file.hasOwnProperty( 'shared' ) ) {
			icon = this.stateIcons.has( file['shared'] ) ? this.stateIcons.get( file['shared'] ) : this.stateIcons.get( '*' );
		}
		return icon;
	}

}
