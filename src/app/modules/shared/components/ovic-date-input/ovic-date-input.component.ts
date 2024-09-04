import { Component , ElementRef , Input , OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { HelperService } from '@core/services/helper.service';

@Component( {
	selector    : 'ovic-date-input' ,
	templateUrl : './ovic-date-input.component.html' ,
	styleUrls   : [ './ovic-date-input.component.css' ]
} )
export class OvicDateInputComponent implements OnInit {

	@Input() formControlObject : AbstractControl<any>;

	@Input() validate : 'no' | 'yes' = 'no';

	@Input() disabled = false;

	@Input() readonly = false;

	dateModel : string;

	currentMysqlValue : string;

	constructor(
		private helperService : HelperService
	) {}

	ngOnInit() : void {
		if ( this.formControlObject ) {
			this.formControlObject.valueChanges.pipe( debounceTime( 100 ) ).subscribe( value => this.inputData( value ) );
			this.formControlObject.value && this.inputData( this.formControlObject.value );
		}
	}

	private mySqlToDmyFormat( input : string , separator : string = '/' ) : string {
		const date = input ? this.helperService.dateFormatWithTimeZone( input ) : null;
		return date ? [ date.getDate().toString( 10 ).padStart( 2 , '0' ) , ( date.getMonth() + 1 ).toString( 10 ).padStart( 2 , '0' ) , date.getFullYear().toString( 10 ) ].join( separator ) : '';
	}

	private dmyToMySqlFormat( input : string ) : string {
		// input type = dd/mm/yyyy
		const arr    = input ? input.replace( /\/|-/mi , '/' ).split( '/' ) : [];
		const days   = arr.length === 3 ? parseInt( arr[ 0 ] , 10 ) : null;
		const months = arr.length === 3 ? parseInt( arr[ 1 ] , 10 ) : null;
		const years  = arr.length === 3 ? parseInt( arr[ 2 ] , 10 ) : null;
		if ( days && months && years && days <= 31 && days >= 1 && months <= 12 && months >= 1 && years > 999 && years <= 9000 ) {
			// yyyy/mm/dd
			return [ years , months.toString( 10 ).padStart( 2 , '0' ) , days.toString( 10 ).padStart( 2 , '0' ) ].join( '-' );
		}
		return '';
	}

	inputData( mySqlDateFormat : string ) {
		if ( this.currentMysqlValue === mySqlDateFormat ) {
			return;
		}
		if ( typeof mySqlDateFormat !== 'string' ) {
			this.dateModel = '';
		} else {
			// this.dateModel = this.mySqlToDmyFormat( valueOfMySqlFormat );
			this.dateModel = mySqlDateFormat ? mySqlDateFormat.split( '-' ).reverse().join( '/' ) : '';
		}
	}

	changeDate() {
		this.currentMysqlValue = this.dmyToMySqlFormat( this.dateModel );
		if ( this.formControlObject ) {
			if ( this.currentMysqlValue ) {
				this.formControlObject.setValue( this.currentMysqlValue );
			}
		}
	}

	markTouched() {
		if ( this.validate === 'yes' && this.formControlObject ) {
			this.formControlObject.markAsTouched();
		}
	}

}
