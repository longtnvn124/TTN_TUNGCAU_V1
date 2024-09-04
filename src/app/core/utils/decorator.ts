import { pipe , Subject , Subscription } from 'rxjs';

/**
 * unsubscribe all subscriptions in the component automatically
 * */
export function UnsubscribeOnDestroy() {
	return ( constructor : Function ) => {
		const origin                      = constructor.prototype.ngOnDestroy;
		constructor.prototype.ngOnDestroy = function () {
			for ( const prop in this ) {
				const property = this[ prop ];
				// if ( typeof property.unsubscribe === 'function' ) {
				// 	property.unsubscribe();
				// }
				if ( property instanceof Subscription ) {
					property.unsubscribe();
				} else if ( prop === 'completeObservers$' && property instanceof Subject ) {
					property.next( 'close' );
					property.complete();
				}
			}
			if ( origin ) {
				origin.apply();
			}
		};
	};
}

/**
 * unsubscribe all subscriptions in the component automatically
 * */
export function CompleteObserverOnDestroy() {
	return ( constructor : Function ) => {
		const origin                      = constructor.prototype.ngOnDestroy;
		constructor.prototype.ngOnDestroy = function () {
			for ( const prop in this ) {
				const property = this[ prop ];
				// if ( typeof property.unsubscribe === 'function' ) {
				// 	property.unsubscribe();
				// }
				if ( prop === 'completeObservers' && property instanceof Subject ) {
					property.next( 'close' );
					property.complete();
				}
			}
			if ( origin ) {
				origin.apply();
			}
		};
	};
}

/**
 * measure the time it takes for a method to run
 * */
export function Time( target , name , descriptor ) {
	const orig       = descriptor.value;
	descriptor.value = function ( ... args ) {
		const start = performance.now();
		orig.apply( this , args );
		const stop = performance.now();
		console.log( `Metrics stats:` , ( stop - start ).toFixed( 2 ) );
	};
}
