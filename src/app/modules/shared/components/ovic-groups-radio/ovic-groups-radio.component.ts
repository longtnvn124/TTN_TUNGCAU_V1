import { Component , OnInit , Input , SimpleChanges , OnChanges , Output , EventEmitter } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component( {
	selector    : 'ovic-groups-radio' ,
	templateUrl : './ovic-groups-radio.component.html' ,
	styleUrls   : [ './ovic-groups-radio.component.css' ]
} )
export class OvicGroupsRadioComponent implements OnInit , OnChanges {

	version : '1.0.1';

	constructor() { }

	@Input() options : any;

	@Input() default : any;

	@Input() correctAnswer : any; // only work with inputType = 'radio' , avoid 0 value pls

	@Input() optionId : string;

	@Input() optionLabel : string;

	@Input() freeze = false; // đóng băng hành động khi đã công bố kết quả

	@Input() formField : AbstractControl;

	@Input() rawHtml = false;

	@Input() verticalMode = false;

	@Input() columns : 1 | 2 | 3 | 4 = 1;

	@Input() inputType = 'radio'; // radio | checkbox

	@Output() onChange = new EventEmitter<any>();

	active : any;

	index : number[];

	_correctAnswer = [];

	ngOnInit() : void {
		if ( this.default && this.options && this.optionId ) {
			if ( this.inputType === 'checkbox' ) {
				if ( this.default ) {
					this.index = [];
					this.default.split( ',' ).forEach( elmDefault => {
						const _i = this.options.findIndex( elm => elm.hasOwnProperty( this.optionId ) && elm[ this.optionId ] === elmDefault );
						if ( _i !== -1 ) {
							this.index.push( _i );
						}
					} );
				}
			} else {
				this.index = [ this.options.findIndex( elm => elm.hasOwnProperty( this.optionId ) && elm[ this.optionId ] === this.default ) ];
			}
		} else {
			this.index = [];
		}
		this._correctAnswer = this.correctAnswer || null;
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'default' ] ) {
			if ( this.default ) {
				this.active = this.default;
				if ( this.options && this.optionId ) {
					if ( this.inputType === 'checkbox' ) {
						this.index = [];
						this.default.split( ',' ).forEach( elmDefault => {
							const _i = this.options.findIndex( elm => elm.hasOwnProperty( this.optionId ) && elm[ this.optionId ] === elmDefault );
							if ( _i !== -1 ) {
								this.index.push( _i );
							}
						} );
					} else {
						this.index = [ this.options.findIndex( elm => elm.hasOwnProperty( this.optionId ) && elm[ this.optionId ] === this.default ) ];
					}
				}
			}
		}
		if ( changes[ 'correctAnswer' ] ) {
			this._correctAnswer = this.correctAnswer || null;
		}
	}

	updateValue( value : any , index : number ) {
		if ( this.freeze ) {
			return;
		}
		if ( this.inputType === 'checkbox' ) {
			if ( this.active ) {
				const _arr = this.active.split( ',' );
				if ( _arr.includes( value.toString() ) ) {
					const _idx = _arr.findIndex( p => p === value.toString() );
					_arr.splice( _idx , 1 );
					this.active = _arr.join( ',' );
					const _idx2 = this.index.findIndex( p => p === index );
					this.index.splice( _idx2 , 1 );
				} else {
					this.active = this.active.concat( ',' , value.toString() );
					this.index.push( index );
				}
			} else {
				this.active = ''.concat( value );
				this.index  = [ index ];
			}
		} else {
			this.index  = [ index ];
			this.active = value;
		}
		if ( this.formField ) {
			this.formField.setValue( this.active );
		}
		this.onChange.emit( this.active );
	}

}
