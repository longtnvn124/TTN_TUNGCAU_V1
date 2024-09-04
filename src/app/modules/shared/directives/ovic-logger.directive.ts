import { Directive , ElementRef , Input , OnDestroy , OnInit } from '@angular/core';
import { debounceTime , fromEvent , Subscription } from 'rxjs';

@Directive( {
	selector : '[ovicLogger]'
} )
export class OvicLoggerDirective implements OnInit , OnDestroy {

	@Input() ovicLogger : string;

	subscription = new Subscription();

	constructor(
		private target : ElementRef<HTMLElement>
	) {

	}

	ngOnDestroy() : void {
		if ( this.subscription ) {
			this.subscription.unsubscribe();
		}
	}

	ngOnInit() : void {
		const observerOnLogger = fromEvent( this.target.nativeElement , 'click' ).pipe( debounceTime( 500 ) ).subscribe( () => console.log( this.ovicLogger ) );
		this.subscription.add( observerOnLogger );
	}

}
