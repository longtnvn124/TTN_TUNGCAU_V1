import { BehaviorSubject , defer , Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NgPaginateEvent } from '@shared/models/ovic-models';

export abstract class BaseTableComponent {

	public recordsTotal = 0;

	public tblIndex = 1;

	public paged = 1;

	public rows = 20;

	protected _loader$ : Observable<{ data : any; recordsTotal : number }>;

	protected data : any;

	protected states$ = new BehaviorSubject<'error' | 'success' | 'loading'>( 'loading' );

	protected observerLoadingState<T>() : ( source : Observable<T> ) => Observable<T> {
		return source => {
			return defer( () => {
				this.states$.next( 'loading' );
				return source.pipe(
					tap( {
						next  : () => this.states$.next( 'success' ) ,
						error : () => this.states$.next( 'error' )
					} )
				);
			} );
		};
	}

	public paginate( { page } : NgPaginateEvent ) {
		this.paged    = page + 1;
		this.tblIndex = ( this.paged * Math.max( this.rows , 1 ) ) - Math.max( this.rows , 1 ) + 1;
		this.loadData( this.paged );
	}

	public loadData( paged : number ) {
		this.loader$.pipe( this.observerLoadingState() ).subscribe( {
			next : ( { data , recordsTotal } ) => {
				this.data         = data;
				this.recordsTotal = recordsTotal;
				this.tblIndex     = ( this.paged * Math.max( this.rows , 1 ) ) - Math.max( this.rows , 1 ) + 1;
			}
		} );
	}

	protected get loader$() : Observable<{ data : any; recordsTotal : number }> {
		return this._loader$;
	}
}
