import { Pipe , PipeTransform } from '@angular/core';

@Pipe( {
	name : 'removeHtmlTags'
} )
export class RemoveHtmlTagsPipe implements PipeTransform {

	transform( html : string ) : string {
		if ( html ) {
			const arrString = html.replace( /(<([^>]+)>)/ig , '[caps]' ).split( '[caps]' ).filter( x => x != '' );
			if ( arrString && arrString.length ) {
				return arrString.join( ' ' );
			} else {
				return '';
			}
		} else {
			return '';
		}
	}

}
