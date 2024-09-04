import { Directive , ElementRef , Input , OnChanges , OnDestroy } from '@angular/core';
import { Subject , Subscription } from 'rxjs';
import { debounceTime , distinctUntilChanged , filter } from 'rxjs/operators';

@Directive( {
	selector : '[bindCssVariables]'
} )
export class BindCssVariablesDirective implements OnChanges , OnDestroy {

	@Input() bindCssVariables : string; // name1:value1;name2:value2

	subscriptions = new Subscription();

	private readonly CHANGE_VALUES = new Subject<string>();

	constructor( private host : ElementRef<HTMLElement> ) {
		const observerChangeValues = this.CHANGE_VALUES.asObservable().pipe( filter( value => ( !!( value ) && value.length > 0 ) ) , distinctUntilChanged() , debounceTime( 100 ) ).subscribe( values => this.__updateValues( values ) );
		this.subscriptions.add( observerChangeValues );
	}

	private __updateValues( value : string ) {
		const rows = value ? value.split( ';' ) : [];
		if ( rows.length ) {
			rows.filter( value => ( !!( value ) && value.length > 0 ) ).forEach( row => {
				const code = row.split( ':' );
				if ( code.length === 2 ) {
					this.host.nativeElement.style.setProperty( code[ 0 ] , code[ 1 ] );
				}
			} );
		}
	}

	private changeValues( value : string ) {
		this.CHANGE_VALUES.next( value );
	}

	ngOnChanges( changes ) {
		this.changeValues( changes.bindCssVariables.currentValue );
	}

	ngOnDestroy() : void {
		if ( this.subscriptions ) {
			this.subscriptions.unsubscribe();
		}
	}

}
