import { Pipe , PipeTransform } from '@angular/core';

@Pipe( {
    name : 'ovicDateTime'
} )
export class OvicDateTimePipe implements PipeTransform {
    transform( value : string ) : string {
        let result = '__/__/____:__:__:__';
        if ( value ) {
            const date = new Date( value );
            const d    = date.getDate() < 10 ? date.getDate().toString().padStart( 2 , '0' ) : date.getDate().toString();
            const m    = date.getMonth() < 9 ? ( date.getMonth() + 1 ).toString().padStart( 2 , '0' ) : ( date.getMonth() + 1 ).toString();
            const y    = date.getFullYear().toString();
            const h    = date.getHours() < 10 ? date.getHours().toString().padStart( 2 , '0' ) : date.getHours().toString();
            const min  = date.getMinutes() < 10 ? date.getMinutes().toString().padStart( 2 , '0' ) : date.getMinutes().toString();
            // const s    = date.getSeconds() < 10 ? `0${ date.getSeconds() }` : date.getSeconds().toString();
            // result     = [ h , ':' , min , ':' , s , ' ' , d , '/' , m , '/' , y ].join( '' );
            result = [ d , '/' , m , '/' , y , ' ' , h , ':' , min ].join( '' );
        }
        return result;
    }
}
