import { Component , Input , OnInit , SimpleChanges , OnChanges , Output , EventEmitter } from '@angular/core';
import { AbstractControl , FormGroup } from '@angular/forms';

@Component( {
	selector    : 'ovic-currency-input' ,
	templateUrl : './ovic-currency-input.component.html' ,
	styleUrls   : [ './ovic-currency-input.component.css' ]
} )
export class OvicCurrencyInputComponent implements OnInit , OnChanges {

	version = '1.0.0';

	@Input() default : number;

	@Input() placeholder : string;

	@Input() formField : AbstractControl;

	@Input() suffix = ' đ';

	value : number;

	constructor() {
	}

	ngOnInit() : void {
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'default' ] ) {
			this.value = this.default;
		}
	}

	process( $event ) {
		if ( this.formField ) {
			this.formField.setValue( this.value );
		}
	}

}
