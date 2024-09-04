import { Component , EventEmitter , Input , OnInit , Output } from '@angular/core';
import { OvicFlexibleTableNewHeadButton , OvicFlexibleTableNewHeadSearch , OvicFlexibleTableNewColumn , OvicFlexibleTableNewColumnMenu , OvicFlexibleTableState } from '@shared/models/ovic-flexible-table-new';
import { NgPaginateEvent } from '@shared/models/ovic-models';

interface RowMenuEvent {
	menu : OvicFlexibleTableNewColumnMenu,
	item : any
}

@Component( {
	selector    : 'ovic-flexible-table-new' ,
	templateUrl : './ovic-flexible-table-new.component.html' ,
	styleUrls   : [ './ovic-flexible-table-new.component.css' ]
} )
export class OvicFlexibleTableNewComponent implements OnInit {

	/*Search on top */
	@Input() headSearch : OvicFlexibleTableNewHeadSearch = {
		enable      : false ,
		placeholder : 'nhập từ tìm kiếm' ,
		button      : '<i class="fa fa-search" aria-hidden="true"></i>Tìm kiếm'
	};

	@Input() primaryField = 'id';

	@Input() headButtons : OvicFlexibleTableNewHeadButton[] = [];

	@Input() headLabel = 'table';

	@Input() columns : OvicFlexibleTableNewColumn[];

	@Input() rowActive : number;

	@Input() enableCheckbox = false;

	@Input() data : any[];

	@Input() state : OvicFlexibleTableState;

	@Input() pagination : {
		rows? : number;
		recordsTotal : number;
	};

	@Input() emptyMessage = 'Danh sách trống';

	/*Output events */
	@Output() onHeadButtonClick = new EventEmitter<OvicFlexibleTableNewHeadButton>();

	@Output() onRowMenuClick = new EventEmitter<RowMenuEvent>();

	@Output() onChangeChecked = new EventEmitter<any[]>();

	@Output() onPageChange = new EventEmitter<number>();

	isAllRowsChecked = false;

	rowsChecked : any[] = [];

	constructor() { }

	ngOnInit() : void {
	}

	btnHeaderButtonClick( btn : OvicFlexibleTableNewHeadButton ) {
		this.onHeadButtonClick.emit( btn );
	}

	btnToggleAllRowChecked() {
		if ( this.state && this.data && this.data.length > 0 ) {
			if ( this.rowsChecked.length === this.data.length ) {
				this.rowsChecked = [];
			} else {
				this.rowsChecked = this.data;
			}
			this.isAllRowsChecked = this.checkIsAllRowChecked();
		}
	}

	private checkIsAllRowChecked() : boolean {
		if ( this.data && this.data.length > 0 ) {
			return ( this.rowsChecked.length === this.data.length );
		} else {
			return false;
		}
	}

	btnToggleRowChecked( item : any ) {
		item[ '__oft_row_checked' ] = !item[ '__oft_row_checked' ];
		if ( item[ '__oft_row_checked' ] ) {
			this.rowsChecked.push( item );
		} else {
			this.rowsChecked = this.rowsChecked.filter( elm => elm[ this.primaryField ] !== item[ this.primaryField ] );
		}
		this.onChangeChecked.emit( this.rowsChecked );
		this.isAllRowsChecked = this.checkIsAllRowChecked();
	}

	eventChangePage( { page } : NgPaginateEvent ) {
		this.onPageChange.emit( page + 1 );
	}

	btnMenuCLick( data : RowMenuEvent , condition : boolean = true ) {
		if ( condition ) {
			this.onRowMenuClick.emit( data );
		}
	};

	checkRowMenuCondition( menu : OvicFlexibleTableNewColumnMenu , data : any , type : 'display' | 'hide' ) : boolean {
		let result = true;
		if ( menu[ 'conditions' ] && menu[ 'conditions' ][ type ] ) {
			switch ( menu.conditions[ type ].equal ) {
				case '!':
					result = data[ menu.conditions[ type ].field ] !== menu.conditions[ type ].value;
					break;
				case '<':
					result = data[ menu.conditions[ type ].field ] < menu.conditions[ type ].value;
					break;
				case '<=':
					result = ( data[ menu.conditions[ type ].field ] < menu.conditions[ type ].value ) || ( data[ menu.conditions[ type ].field ] === menu.conditions[ type ].value );
					break;
				case '=':
					result = data[ menu.conditions[ type ].field ] === menu.conditions[ type ].value;
					break;
				case '>':
					result = data[ menu.conditions[ type ].field ] > menu.conditions[ type ].value;
					break;
				case '>=':
					result = ( data[ menu.conditions[ type ].field ] > menu.conditions[ type ].value ) || ( data[ menu.conditions[ type ].field ] === menu.conditions[ type ].value );
					break;
				default:
					result = false;
					break;
			}
		}
		return result;
	}


	btnHeadSearch( text : string ) {
		// console.log( text );
	}

	btnHeadSearchClear( input : HTMLInputElement ) {
		input.value = '';

	}
}
