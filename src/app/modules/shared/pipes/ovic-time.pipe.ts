import { Pipe , PipeTransform } from '@angular/core';

@Pipe( {
    name : 'ovicTime'
} )
export class OvicTimePipe implements PipeTransform {

    transform( value : string ) : string {
        let result = '__:__:__';
        if ( value ) {
            const date    = new Date( value );
            const hours   = date.getHours() < 10 ? date.getHours().toString().padStart( 2 , '0' ) : date.getHours().toString();
            const minutes = date.getMinutes() < 10 ? date.getMinutes().toString().padStart( 2 , '0' ) : date.getMinutes().toString();
            const seconds = date.getSeconds() < 10 ? date.getSeconds().toString().padStart( 2 , '0' ) : date.getSeconds().toString();
            result        = [ hours , minutes , seconds ].join( ':' );
        }
        return result;
    }
}
