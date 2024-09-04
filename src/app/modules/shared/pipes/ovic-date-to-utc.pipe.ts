import { Input , Pipe , PipeTransform } from '@angular/core';

@Pipe( {
	name : 'ovicDateToUtc'
} )

export class OvicDateToUtcPipe implements PipeTransform {

	@Input() timeZone = 'Asia/Ho_Chi_Minh'; // UTC

	transform( value : Date | string ) : string {
		let result = '__/__/____';
		if ( value ) {
			const date = this.preFormatDate( value );
			const d    = date.getDate().toString();
			const m    = ( date.getMonth() + 1 ).toString();
			const y    = date.getFullYear().toString();
			result     = [ d.padStart( 2 , '0' ) , m.padStart( 2 , '0' ) , y ].join( '/' );
		}
		return result;
	}

	private preFormatDate( date : Date | string ) : Date {
		if ( typeof date === 'string' ) {
			return new Date(
				new Date( date ).toLocaleString( 'en-US' , { timeZone : this.timeZone } )
			);
		}
		return new Date(
			date.toLocaleString( 'en-US' , { timeZone : this.timeZone } )
		);
	}
}
