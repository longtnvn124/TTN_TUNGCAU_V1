import { Pipe , PipeTransform } from '@angular/core';

@Pipe( {
	name : 'ovicDate'
} )
export class OvicDatePipe implements PipeTransform {
	transform( value : string ) : string {
		let result = '__/__/____';
		if ( value ) {
			const date = new Date( value );
			const d    = date.getDate() < 10 ? date.getDate().toString().padStart( 2 , '0' ) : date.getDate().toString();
			const m    = ( date.getMonth() + 1 ) < 10 ? ( date.getMonth() + 1 ).toString().padStart( 2 , '0' ) : ( date.getMonth() + 1 ).toString();
			const y    = date.getFullYear().toString();
			result     = [ d , m , y ].join( '/' );
		}
		return result;
	}
}
