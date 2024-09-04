import { Component , OnInit , Input , Output , EventEmitter , OnDestroy , SimpleChanges , OnChanges , ViewChildren } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';
import { OvicFlexibleColumn , OvicFlexibleTopbarRight , EventAction , OvicFlexibleData , OvicGroupTemplate , OvicFlexibleDataList , OvicMenuItem } from '@shared/models/ovic-flexible-table';
import { state , style , trigger } from '@angular/animations';
import { debounceTime , Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component( {
	selector    : 'ovic-flexible-table' ,
	templateUrl : './ovic-flexible-table.component.html' ,
	styleUrls   : [ './ovic-flexible-table.component.css' ] ,
	animations  : [
		trigger( 'rightSection800' , [
			state( 'open-800' , style( {
				right : '0'
			} ) ) ,
			state( 'close' , style( {
				right : '-810px'
			} ) )
			// transition( 'open-800<=>close' , animate( '350ms' ) )
		] ) ,
		trigger( 'rightSection700' , [
			state( 'open-700' , style( {
				right : '0'
			} ) ) ,
			state( 'close' , style( {
				right : '-710px'
			} ) )
			// transition( 'open-800<=>close' , animate( '350ms' ) )
		] ) ,
		trigger( 'rightSection600' , [
			state( 'open-600' , style( {
				right : '0'
			} ) ) ,
			state( 'close' , style( {
				right : '-610px'
			} ) )
			// transition( 'open-600<=>close' , animate( '350ms' ) )
		] ) ,
		trigger( 'rightSection500' , [
			state( 'open-500' , style( {
				right : '0'
			} ) ) ,
			state( 'close' , style( {
				right : '-510px'
			} ) )
			// transition( 'open-500<=>close' , animate( '350ms' ) )
		] ) ,
		trigger( 'mainLayoutEffect' , [
			state( 'open-500' , style( {
				'max-width' : 'calc(100% + 10px - 500px)'
			} ) ) ,
			state( 'open-600' , style( {
				'max-width' : 'calc(100% + 10px - 600px)'
			} ) ) ,
			state( 'open-700' , style( {
				'max-width' : 'calc(100% + 10px - 700px)'
			} ) ) ,
			state( 'open-800' , style( {
				'max-width' : 'calc(100% + 10px - 800px)'
			} ) ) ,
			state( 'close' , style( {
				'max-width' : 'calc(100% + 10px)'
			} ) )
		] )
	]
} )
export class OvicFlexibleTableComponent implements OnInit , OnDestroy , OnChanges {
	version       = '1.3.1';
	referenceData = {};
	cols : OvicFlexibleColumn[];
	objects : OvicFlexibleDataList[];
	checkedList   = [];

	@Input() enableCheckbox = false;
	@Input() fieldUpdateStatus : string;
	@Input() templates : OvicGroupTemplate[];
	@Input() context : any;
	@Input() data : any;
	@Input() rowActive : any;
	@Input() list : OvicFlexibleData[];

	/*Search on top */
	@Input() headSearch = false;

	@Input() headSearchPlaceholder = 'nhập từ tìm kiếm';

	@Input() headSearchField : string;

	@Input() headSearchButton = '<i class="fa fa-search" aria-hidden="true"></i>Tìm kiếm';
	/*========================================================================================*/

	/*Group label */
	@Input() groupLabel : string;

	/*stucture of table*/

	// @Input() columns : OvicFlexibleColumn[];
	@Input() columns : OvicFlexibleColumn[];

	/*Setting topbar right buttons*/
	@Input() topbarRightActions : OvicFlexibleTopbarRight[];

	/*the title of the table*/
	@Input() tblLabel : string;

	@Input() primaryField : string;

	/*Filter configs */
	@Input() enableFilter = false;

	@Input() filterLabel = 'Lọc';

	@Input() filterIcon = '<i class="fa fa-filter" aria-hidden="true"></i>';

	@Input() errLoading : boolean;

	@Input() rowHint : any;

	@Input() cssClasses : string;

	/*Output events */
	@Output() topbarRightEvent = new EventEmitter<string>();

	@Output() elementEvent = new EventEmitter<EventAction>();

	@Output() refreshList = new EventEmitter<boolean>();

	@Output() itemsChecked = new EventEmitter<any[]>();

	blockOpened : string;
	// legalState       = [ 'close' , 'open-500' , 'open-600' , 'open-800' ];
	layoutState      = 'close';
	openedFilterMode = false;
	checkAllState    = false;

	subscriptions : Subscription;
	_oldActive : any;

	headTitleClass = 'col-4';
	topRightClass  = 'col-4';
	topsearchClass = 'col-4';
	hasError       = false;
	tableOverlay   = false;
	headClass      = [];

	private currentId : any;
	private currentEventName : any;

	@ViewChildren( 'textFilter' ) textFilter;
	searchInfo = [];

	constructor( private notificationService : NotificationService ) {
	}

	ngOnInit() : void {
		this.headClass = this.cssClasses ? [ 'ovic-flexible' , this.version , this.cssClasses ] : [ 'ovic-flexible' , this.version ];
		if ( this.enableCheckbox ) {
			this.headClass.push( 'enable-checkbox' );
		}
		this.tblLabel   = this.tblLabel ? this.tblLabel : 'Danh sách';
		this.groupLabel = this.groupLabel ? this.groupLabel : 'Nhà khoa học';

		const observeCloseTemplates = this.notificationService.onCloseOvicFlexibleTemplates.pipe( debounceTime( 100 ) ).subscribe( message => this.__closeBox( message ) );
		this.subscriptions.add( observeCloseTemplates );

		const observeOpenTemplates = this.notificationService.onOpenOvicFlexibleTemplate.pipe( filter( templateName => !!( templateName ) ) ).subscribe( templateName => this.openBox( templateName ) );
		this.subscriptions.add( observeOpenTemplates );

		if ( !this.headSearch ) {
			this.headTitleClass = this.topRightClass = 'col-6';
		}

		if ( this.columns && this.columns.length ) {
			this.cols = this.passColumns( this.columns );
		}
	}

	ngOnDestroy() {
		if ( this.subscriptions ) {
			this.subscriptions.unsubscribe();
		}
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'errLoading' ] ) {
			this.errLoading = this.hasError;
		}

		if ( changes[ 'data' ] ) {
			this.objects = this.data;
		}

		if ( changes[ 'columns' ] ) {
			if ( this.columns && this.columns.length ) {
				this.cols = this.passColumns( this.columns );
			}
		}

		if ( changes[ 'rowActive' ] ) {
			this.markRowActive( this.rowActive );
		}
	}

	markRowActive( rowActive : any ) {
		if ( rowActive ) {
			const nextActive = this.objects.findIndex( o => o[ this.primaryField ] === rowActive );
			if ( nextActive !== -1 ) {
				this.objects[ nextActive ][ 'isActive' ] = true;
			}
		}
		if ( this._oldActive ) {
			const curentActive = this.objects.findIndex( o => o[ this.primaryField ] === this._oldActive );
			if ( curentActive !== -1 ) {
				this.objects[ curentActive ][ 'isActive' ] = false;
			}
		}
		this._oldActive = rowActive;
	}

	passColumns( columns ) {
		this.referenceData = {};
		if ( columns && columns.length ) {
			for ( let i = 0 ; i < columns.length ; i++ ) {
				if ( columns[ i ].dataType === 'reference' ) {
					if ( Array.isArray( columns[ i ].field ) ) {
						for ( const val of columns[ i ].field ) {
							this.referenceData[ val ] = this.convertReferenceData( columns[ i ].data , columns[ i ].dataIndexField , columns[ i ].dataLabelField );
						}
					}
				}
			}
		}
		return columns;
	}

	convertReferenceData( inputList : any , index : string , label : string ) {
		const result = {};
		for ( let j = 0 ; j < inputList.length ; j++ ) {
			result[ inputList[ j ][ index ] ] = inputList[ j ][ label ];
		}
		return result;
	}

	openBox( templateName : string ) {
		const template = this.templates.find( f => f.name === templateName );
		if ( template ) {
			this.layoutState = 'open-'.concat( template.width.toString() );
			this.blockOpened = template.name;
		}
	}

	getColumnValueFromDifferenceResources( fields , row , separator : string = ' / ' ) : string {
		const result = [];
		if ( Array.isArray( fields ) ) {
			fields.forEach( field => {
				if ( row.hasOwnProperty( field ) && this.referenceData.hasOwnProperty( field ) && this.referenceData[ field ].hasOwnProperty( row[ field ] ) ) {
					result.push( this.referenceData[ field ][ row[ field ] ] );
				}
			} );
		}
		return result.join( ' / ' );
	}

	getColumnValueOnSingleResource( srcName : string , value : any ) {
		const result = [];
		if ( value !== null ) {
			const values = value.toString().split( ',' );
			values.forEach( key => {
				if ( this.referenceData.hasOwnProperty( srcName ) && this.referenceData[ srcName ].hasOwnProperty( key ) ) {
					result.push( this.referenceData[ srcName ][ key ] );
				}
			} );
		}
		return result.join( ' , ' );
	}

	private __closeBox( message : string ) {
		this.layoutState = 'close';
		this.blockOpened = null;
		if ( message ) {
			this.notificationService.toastInfo( message );
		}
	}

	emitterEvent( evenName : string ) {
		this.topbarRightEvent.emit( evenName );
	}

	emitterElementEvent( id : any , eventName : string ) {
		if ( id !== this.currentId || this.currentEventName !== eventName || this.layoutState === 'close' ) {
			this.elementEvent.emit( {
				object : id ,
				action : eventName
			} );
			this.currentEventName = eventName;
			this.currentId        = id;
		}
	}

	headSearchFindData( searchWord : string ) {

	}

	menuIsVisible( field : any , conditions : any ) : boolean {
		if ( field === undefined || !conditions || conditions.length < 1 ) {
			return true;
		}
		return conditions.includes( field.toString() );
	}

	menuIsHide( field : any , conditions : any ) : boolean {
		if ( field === undefined || !conditions || conditions.length < 1 ) {
			return false;
		}
		return conditions.includes( field.toString() );
	}

	menuIsValid( menu : OvicMenuItem , rowData : any ) : boolean {
		if ( menu.isHidden ) {
			return false;
		}
		if ( !rowData ||
			 !menu.hasOwnProperty( 'hiddenConditions' ) ||
			 !menu.hasOwnProperty( 'hiddenConditionsField' )
		) {
			return true;
		}
		return !menu.hiddenConditions.includes( rowData[ menu.hiddenConditionsField ].toString() );
	}

	searchHeadClick( searchWord : string ) {
	}

	dropChangeData( value , field ) {
		this.saveSearchInfo( field , value.toString() , 'equal' );
		this.filterData( this.searchInfo );
	}

	changeTextFilter() {
		const searches = this.textFilter.toArray();
		let change     = false;
		for ( let i = 0 ; i < searches.length ; i++ ) {
			this.saveSearchInfo( searches[ i ].nativeElement.name , searches[ i ].nativeElement.value , 'contain' );
			change = true;
		}
		if ( change ) {
			this.filterData( this.searchInfo );
		}
	}

	filterData( searchInfo ) {
		if ( this.data && searchInfo.length > 0 ) {
			this.objects = this.data.filter( row => {
				let find = true;
				for ( let _index = 0 ; _index < searchInfo.length ; _index++ ) {
					if ( find ) {
						if ( searchInfo[ _index ].type === 'contain' ) {
							find = row[ searchInfo[ _index ].key ].toString().toLowerCase().includes( searchInfo[ _index ].value.toLowerCase() );
						} else {
							/*type === 'equal'*/
							if ( searchInfo[ _index ].key.indexOf( ',' ) > 0 ) {
								const pieces = searchInfo[ _index ].key.split( ',' );
								if ( pieces.length === 2 ) {
									find = row[ pieces[ 0 ] ].toString().toLowerCase() === searchInfo[ _index ].value.toLowerCase() ||
										   row[ pieces[ 1 ] ].toString().toLowerCase() === searchInfo[ _index ].value.toLowerCase();
								}
								if ( pieces.length === 3 ) {
									find = row[ pieces[ 0 ] ].toString().toLowerCase() === searchInfo[ _index ].value.toLowerCase() ||
										   row[ pieces[ 1 ] ].toString().toLowerCase() === searchInfo[ _index ].value.toLowerCase() ||
										   row[ pieces[ 2 ] ].toString().toLowerCase() === searchInfo[ _index ].value.toLowerCase();
								}
								if ( pieces.length === 4 ) {
									find = row[ pieces[ 0 ] ].toString().toLowerCase() === searchInfo[ _index ].value.toLowerCase() ||
										   row[ pieces[ 1 ] ].toString().toLowerCase() === searchInfo[ _index ].value.toLowerCase() ||
										   row[ pieces[ 2 ] ].toString().toLowerCase() === searchInfo[ _index ].value.toLowerCase() ||
										   row[ pieces[ 3 ] ].toString().toLowerCase() === searchInfo[ _index ].value.toLowerCase();
								}
							} else {
								find = row[ searchInfo[ _index ].key ].toString().toLowerCase() === searchInfo[ _index ].value.toLowerCase();
							}
						}
					}
				}
				return find;
			} );
		} else {
			this.objects = this.data;
		}
	}

	private saveSearchInfo( key : string , value : string , _type : 'contain' | 'equal' ) : void {
		if ( !key ) {
			return;
		}
		const _index = this.searchInfo.findIndex( s => s.key === key );
		if ( _index !== -1 ) {
			if ( value && value.length > 0 ) {
				this.searchInfo[ _index ].value = value;
			} else {
				this.searchInfo.splice( _index , 1 );
			}
		} else {
			if ( value && value.length ) {
				this.searchInfo.push( {
					key   : key ,
					value : value ,
					type  : _type
				} );
			}
		}
	}

	searchToggle( status : boolean ) {
		if ( status ) {
			this.searchInfo = [];
			this.filterData( this.searchInfo );
		}
		this.openedFilterMode = status === false;
	}

	emitCheckBox( index : number ) {
		const object = this.objects[ index ];
		if ( object.hasOwnProperty( 'check' ) ) {
			if ( object.check ) {
				this.checkAllState = false;
				object.check       = false;
				const _index       = this.checkedList.findIndex( item => item.toString() === object[ this.primaryField ].toString() );
				this.checkedList.splice( _index , 1 );
			} else {
				object.check = true;
				this.checkedList.push( object[ this.primaryField ] );
			}
		} else {
			object[ 'check' ] = true;
			this.checkedList.push( object[ this.primaryField ] );
		}
		this.itemsChecked.emit( this.checkedList );
	}

	emitCheckBoxAll() {
		this.checkAllState = !this.checkAllState;
		if ( this.objects.length ) {
			this.checkedList = [];
			if ( this.checkAllState ) {
				this.objects.forEach( elm => {
					elm[ 'check' ] = this.checkAllState;
					this.checkedList.push( elm[ this.primaryField ] );
				} );
			} else {
				this.objects.forEach( elm => {
					elm[ 'check' ] = this.checkAllState;
				} );
			}
		}
		this.itemsChecked.emit( this.checkedList );
	}
}
