import { Directive , Input , OnChanges , SimpleChange , ElementRef } from '@angular/core';

@Directive( {
	selector : '[ovic-editor]'
} )
export class OvicEditorDirective implements OnChanges {

	@Input( 'ovic-editor' ) content : string;

	ngOnChanges( changes : { [ property : string ] : SimpleChange } ) {
		const change       = changes[ 'content' ];
		const elemPosition = this.element.nativeElement.getBoundingClientRect().top + document.body.scrollTop;
		const clientHeight = document.documentElement.clientHeight;
		if ( change.isFirstChange() || elemPosition > clientHeight ) {
			this.element.nativeElement.style.display = 'none';
			setTimeout( () => {
				this.element.nativeElement.style.display = '';
			} );
		}
	}

	constructor( private element : ElementRef ) {
	}

}
