import { Component , EventEmitter , Input , OnChanges , OnInit , Output , SimpleChanges } from '@angular/core';

@Component( {
	selector    : 'ovic-textarea' ,
	templateUrl : './ovic-textarea.component.html' ,
	styleUrls   : [ './ovic-textarea.component.css' ]
} )
export class OvicTextareaComponent implements OnInit , OnChanges {

	constructor() { }

	@Input() cols : number;

	@Input() rows : number;

	@Input() default : string;

	@Input() fullWidth = true;

	@Output() onChangeData = new EventEmitter<string>();

	value : string;

	ngOnInit() : void {
		this.cols  = this.cols || 30;
		this.rows  = this.rows || 10;
		this.value = this.default || '';
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'default' ] ) {
			this.value = this.default || '';
		}
	}

	emitValue() {
		this.onChangeData.emit( this.value );
	}


}
