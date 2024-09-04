import { Directive , HostBinding , HostListener } from '@angular/core';
import { WindowRef } from '@core/services/window-ref.service';

@Directive( {
    selector : '[ovicVideoAspectRatio16x9]'
} )
export class OvicVideoAspectRatio16x9Directive {

    @HostBinding( 'style.width.px' ) width : number;

    @HostBinding( 'style.height.px' ) height : number;

    @HostListener( 'window:resize' , [ '$event' ] ) onResize( event : Event ) {
        this.setAspectRatio( event.target[ 'innerWidth' ] , event.target[ 'innerHeight' ] );
    }

    constructor( private window : WindowRef ) {
        this.setAspectRatio( window.nativeWindow.innerWidth , window.nativeWindow.innerHeight );
    }

    setAspectRatio( width : number , height : number ) {
        const h = ( width * 9 ) / 16;
        if ( h <= height ) {
            this.width  = width;
            this.height = h;
        } else {
            this.height = height;
            this.width  = ( height * 16 ) / 9;
        }
    }

}
