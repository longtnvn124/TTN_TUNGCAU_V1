import { Pipe , PipeTransform } from '@angular/core';
import { DomSanitizer , SafeHtml } from '@angular/platform-browser';

@Pipe( {
    name : 'ovicTimerMmSs'
} )
export class OvicTimerMmSsPipe implements PipeTransform {
    constructor(
        private sanitized : DomSanitizer
    ) {}

    //for MM:SS format
    transform( value : number ) : SafeHtml {
        const minutes : number = Math.floor( value / 60 );
        return this.sanitized.bypassSecurityTrustHtml( '<span class="--t-minutes">' + ( '00' + minutes ).slice( -2 ) + '</span><span class="--t-break">:</span><span class="--t-seconds">' + ( '00' + Math.floor( value - minutes * 60 ) ).slice( -2 ) + '</span>' );
    }
}
