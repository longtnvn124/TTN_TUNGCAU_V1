import { Component , EventEmitter , Input , OnChanges , OnInit , Output , SimpleChanges } from '@angular/core';
import { OvicPercentageElement , OvicPercentagesDataTable } from '@shared/models/ovic-models';
import { NotificationService } from '@core/services/notification.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';

@Component( {
	selector    : 'ovic-percentages-table' ,
	templateUrl : './ovic-percentages-table.component.html' ,
	styleUrls   : [ './ovic-percentages-table.component.css' ]
} )
export class OvicPercentagesTableComponent implements OnInit , OnChanges {

	version = '1.0.0';

	@Input() columns : any;

	@Input() settings : OvicPercentagesDataTable; //Settings for panel popup

	@Input() default : any;

	@Input() fieldId : string;

	@Input() label : string;

	@Input() filters : any;

	@Input() styleClass : string;

	@Input() fomrTitle = 'Chọn đối tượng';

	@Output() result = new EventEmitter<any>();

	selected : any;
	_data : OvicPercentageElement[];
	private popupLayout : NgbModalRef;
	tabActive : string;

	constructor(
		private ngbModal : NgbModal ,
		private notificationService : NotificationService
	) {
	}

	ngOnInit() : void {
		this.tabActive = this.settings.tabs[ 0 ] ? this.settings.tabs[ 0 ].slug : '';
		this.loadData( this.tabActive );
		this.setDefaultValue( this.default );
	}

	loadData( slug : string ) {
		this._data = this.settings.stores.filter( s => s.slug === slug );
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'default' ] ) {
			this.settings.stores.map( eml => {
				eml.selected = false;
				eml.percent  = 0;
			} );
			this.setDefaultValue( this.default );
		}
	}

	private setDefaultValue( input : any ) {
		this.selected = [];
		if ( input && input.length ) {
			input.forEach( person => {
				if ( person.id === 0 ) {
					this.selected.push( person );
				} else {
					const index = this.settings.stores.findIndex( s => s.slug === person.slug && s.id === person.id );
					if ( index !== -1 ) {
						this.settings.stores[ index ].selected = true;
						this.settings.stores[ index ].percent  = person.percent;
						this.selected.push( this.settings.stores[ index ] );
					} else {
						this.selected.push( person );
					}
				}
			} );
		}
	}

	openPanel( template ) {
		this.popupLayout = this.ngbModal.open( template , {
			size        : 'lg' ,
			backdrop    : 'static' ,
			centered    : true ,
			windowClass : 'ovic-modal-class' ,
			scrollable  : true
		} );
	}

	changeTabActive( tabSlug : string ) {
		this.tabActive = tabSlug;
		this.loadData( this.tabActive );
	}

	updatePercent( id : number , slug : string , input : any ) {
		const index = this.selected.findIndex( s => s.id === id && s.slug === slug );
		if ( index !== -1 ) {
			this.selected[ index ].percent = parseFloat( input.value );
		}
	}

	process() : void {
		const result = [];
		if ( this.selected && this.selected.length ) {
			const total = this.selected.reduce( ( total , elm ) => total + elm.percent , 0 );
			if ( total !== 100 ) {
				// return this.notificationService.showError( 'Tổng tỉ lệ sở hữu phải = 100 % ' , 'Lỗi tỉ lệ sở hữu' );
				this.notificationService.alertError( 'Lỗi tỉ lệ sở hữu' , 'Tổng tỉ lệ sở hữu phải = 100 % ' );
				return;
			}
			this.selected.forEach( row => result.push( {
				id      : row.id ,
				name    : row.name ,
				percent : row.percent ,
				slug    : row.slug
			} ) );
		}
		this.result.emit( result );
		this.popupLayout.dismiss();
	}

	exitForm() {
		if ( this.default && this.default.length ) {
			this.selected = this.default;
		} else {
			this.selected = [];
		}
		this.settings.stores.map( eml => {
			eml.selected = false;
			eml.percent  = 0;
		} );
		this.popupLayout.dismiss();
	}

	chooseValue( objectId : number ) {
		const index = this._data.findIndex( d => d.id === objectId );
		if ( index !== -1 && !this._data[ index ].selected ) {
			this._data[ index ].selected = true;
			this.selected.push( this._data[ index ] );
		}
	}

	removeElementFromList( index : number ) {
		this.selected[ index ].percent  = 0;
		this.selected[ index ].selected = false;
		this.selected.splice( index , 1 );
	}

	addCustomElementToList( inputRef : any ) {
		const value = inputRef.value ? inputRef.value.trim() : '';
		if ( value.length ) {
			this.selected.push( {
				selected : true ,
				percent  : 0 ,
				name     : value ,
				id       : 0 ,
				slug     : 'organization'
			} );
		}
		inputRef.value = '';
	}

}
