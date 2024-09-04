import { Component , EventEmitter , Input , OnInit , Output , OnChanges , SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataPickerColumn , DataPickerGroup } from '@shared/models/ovic-models';

@Component( {
	selector    : 'ovic-data-picker' ,
	templateUrl : './ovic-data-picker.component.html' ,
	styleUrls   : [ './ovic-data-picker.component.css' ]
} )
export class OvicDataPickerComponent implements OnInit , OnChanges {

	version = '1.0.0';

	@Input() columns : DataPickerColumn[];

	@Input() optiopRef : any;

	@Input() options : any;

	@Input() defaultValue : any;

	@Input() fieldId : string;

	@Input() filters : string[];

	@Input() styleClass : string;

	@Input() placeholder : string;

	@Input() enableSearch = false;

	@Input() fomrTitle = 'Chọn đối tượng';

	@Input() groups : DataPickerGroup[];

	@Output() result = new EventEmitter<any>();

	dataRef : any;
	_default : any;
	popupLayout : any;
	tabActive : string;
	listResult = [];

	constructor(
		private ngbModal : NgbModal
	) {
	}

	ngOnInit() : void {
		this.dataRef  = this.optiopRef ? this.optiopRef : [];
		this._default = this.defaultValue ? this.defaultValue : [];
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'optiopRef' ] ) {
			if ( this.optiopRef ) {
				this.dataRef = this.optiopRef;
			}
		}
		if ( changes[ 'defaultValue' ] ) {
			this._default = this.defaultValue;
		}
	}

	openPicker( template ) {
		this.popupLayout = this.ngbModal.open( template , {
			size        : 'lg' ,
			backdrop    : 'static' ,
			centered    : true ,
			windowClass : 'ovic-modal-class' ,
			scrollable  : true
		} );
		if ( this.groups ) {
			this.tabActive         = this.groups[ 0 ].slug;
			this.listResult.length = 0;
			let selectedElms       = [];
			for ( const grp of this.groups ) {
				if ( this._default && this._default[ grp.slug ] ) {
					this.listResult[ grp.slug ] = this._default[ grp.slug ];
					selectedElms                = [].concat( selectedElms , this._default[ grp.slug ] );
				} else {
					this.listResult[ grp.slug ] = [];
				}
			}
			if ( selectedElms.length ) {
				const selectedName = [];
				for ( const elm of selectedElms ) {
					if ( elm[ this.fieldId ] ) {
						selectedName.push( elm[ this.fieldId ] );
					}
				}
				this.options.map( ( option ) => {
					option.selected = selectedName.includes( option[ this.fieldId ] );
				} );
			}

		}
	}

	process() {
		this.result.emit( this.listResult );
		this.closeForm();
	}

	closeForm() {
		this.popupLayout.dismiss();
		this.options.map( ( elm ) => elm.selected = false );
	}

	clickOnRow( id ) {
		const objIndex = this.options.findIndex( obj => obj[ this.fieldId ] === id );
		if ( objIndex !== -1 && this.tabActive && !this.options[ objIndex ].selected ) {
			const indexTabActive = this.groups.findIndex( t => t.slug === this.tabActive );
			if ( indexTabActive !== -1 && this.groups[ indexTabActive ].limit > this.listResult[ this.tabActive ].length ) {
				this.listResult[ this.tabActive ].push( { ... this.options[ objIndex ] } );
				this.options[ objIndex ].selected = true;
			}
		}
	}

	removeElementFrom( listSlug : string , index : number ) {
		if ( this.listResult[ listSlug ][ index ].id !== 0 ) {
			this.options.map( ( obj ) => {
				if ( obj[ this.fieldId ] === this.listResult[ listSlug ][ index ][ this.fieldId ] ) {
					obj.selected = false;
				}
			} );
		}
		this.listResult[ listSlug ].splice( index , 1 );

		// if ( this.tabActive === listSlug && this.listResult[ listSlug ][ index ] ) {
		//
		// }
	}

	addCustomElementToList( listSlug : string , inputRef ) : void {
		// if ( this.tabActive !== listSlug || inputRef.value.length < 1 ) {
		// 	return false;
		// }
		if ( inputRef.value.trim().length < 1 ) {
			return;
		}
		const newObj           = {};
		newObj[ this.fieldId ] = 0;
		newObj[ 'name' ]       = inputRef.value.replace( /\*/g , '' );
		this.listResult[ listSlug ].push( newObj );
		inputRef.value = '';
	}

	changeTabActive( tabSlug : string ) {
		this.tabActive = tabSlug;
	}

}
