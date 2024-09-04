import { Component , Input , OnInit , SimpleChanges , OnChanges } from '@angular/core';
import { OvicRateOption } from '@shared/models/ovic-models';
import { AbstractControl } from '@angular/forms';

@Component( {
	selector    : 'ovic-rating' ,
	templateUrl : './ovic-rating.component.html' ,
	styleUrls   : [ './ovic-rating.component.css' ]
} )
export class OvicRatingComponent implements OnInit , OnChanges {

	@Input() settings : OvicRateOption[];

	@Input() formField : AbstractControl;

	@Input() default : string;

	_activeElm = '';

	constructor() {
	}

	ngOnInit() : void {
		if ( !this.settings ) {
			this.settings = [
				{
					value : '1' ,
					label : 'Rất thấp' ,
					color : '#ef3a10'
				} ,
				{
					value : '2' ,
					label : 'Thấp' ,
					color : '#f7a521'
				} ,
				{
					value : '3' ,
					label : 'Trung bình' ,
					color : '#f7e632'
				} ,
				{
					value : '4' ,
					label : 'Cao' ,
					color : '#a5d631'
				} ,
				{
					value : '5' ,
					label : 'Rất cao' ,
					color : '#4aa54a'
				}
			];
		}
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'default' ] ) {
			this._activeElm = this.default.toString();
		}
	}

	active( option : OvicRateOption ) {
		this._activeElm = option.value;
		if ( this.formField ) {
			this.formField.setValue( option.value );
		}
	}

}
