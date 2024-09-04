import { Component , Input , OnInit , TemplateRef } from '@angular/core';
import { debounceTime , Observable , Subject , takeUntil } from 'rxjs';


export interface CardWidgetService {
	countAllItems : () => Observable<number>;
}

/*class CardWidget {
	private _state : 'loading' | 'error' | 'complete';
	private _number : number;
	private _value : string;
	private service : CardWidgetService;

	load() {
		this._state = 'loading';
		this.service.countAllItems().subscribe( {
			next  : number => {
				this.number = number;
				this._state = 'complete';
			} ,
			error : () => this._state = 'error'
		} );
	}

	constructor( service : CardWidgetService ) {
		this.service = service;
		this._state  = 'loading';
		this.number  = 0;
		this.load();
	}

	get value() : string {
		return this._value;
	}

	private set value( value : string ) {
		this._value = value;
	}

	get number() : number {
		return this._number;
	}

	private set number( n : number ) {
		this._number = n;
		this.value   = n.toLocaleString( 'vn' );
	}

	get state() : 'loading' | 'error' | 'complete' {
		return this._state;
	}
}*/

@Component( {
	selector    : 'app-card-widget' ,
	templateUrl : './card-widget.component.html' ,
	styleUrls   : [ './card-widget.component.css' ]
} )
export class CardWidgetComponent implements OnInit {

	private _service : CardWidgetService;

	@Input() set service( service : CardWidgetService ) {
		this._service = service;
		this.initData.next( 'loadData' );
	}

	get service() : CardWidgetService {
		return this._service;
	}

	@Input() title : string;

	@Input() icon : TemplateRef<any>;

	@Input() styleClass : string;

	private observerCloser = new Subject<string>();

	private initData = new Subject<string>();

	state : 'loading' | 'error' | 'complete' = 'loading';

	number = 0;

	value = '0';

	constructor() {
		this.initData.asObservable().pipe( takeUntil( this.observerCloser ) , debounceTime( 100 ) ).subscribe( () => this.loadData() );
	}

	ngOnInit() : void {
	}

	ngOnDestroy() : void {
		this.observerCloser.next( '' );
		this.observerCloser.complete();
	}

	private loadData() {
		if ( this._service ) {
			this.state = 'loading';
			this.service.countAllItems().subscribe( {
				next  : number => {
					this.number = number;
					this.value  = number.toLocaleString( 'vn' );
					this.state  = 'complete';
				} ,
				error : () => this.state = 'error'
			} );
		} else {
			this.number = 0;
			this.value  = '0';
		}
	}

	btnReloadData() {
		this.initData.next( 'reloadData' );
	}

}
