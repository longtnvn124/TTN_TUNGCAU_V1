import { Component , EventEmitter , Input , OnInit , Output , SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {SharedModule} from "@shared/shared.module";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {RippleModule} from "primeng/ripple";
import {ButtonModule} from "primeng/button";

interface GroupsRadioQuestion {
	id : number;
	value : string;
}

@Component({
  selector: 'app-groups-radio',
  templateUrl: './groups-radio.component.html',
  styleUrls: ['./groups-radio.component.css'],
  imports: [
    SharedModule,
    NgForOf,
    NgClass,
    RippleModule,
    ButtonModule,
    NgIf
  ],
  standalone: true
})
export class GroupsRadioComponent implements OnInit {

	constructor() {
	}

	private _options : GroupsRadioQuestion[];

	@Input() set options( options : GroupsRadioQuestion[] ) {
		this._options = ( options || [] ).map( o => {
			o.value = o[ '_url_file' ] ? '<img src="' + o[ '_url_file' ] + '" alt="">' : o.value;
			return o;
		} );
	}

	get options() : GroupsRadioQuestion[] {
		return this._options;
	}

	@Input() default : string; //'1,3';

	@Input() correctAnswer : string; // only work with inputType = 'radio' , avoid 0 value pls

	@Input() freeze : boolean = false; // đóng băng hành động khi đã công bố kết quả

	@Input() formField : AbstractControl;

	@Input() inputType : 'radio' | 'checkbox' = 'radio'; // radio | checkbox

	@Output() onChange : EventEmitter<number[]> = new EventEmitter<number[]>();

  @Input() options_sty : number; //1: 1 cột,2:2 cột, 3:3 cột



	selectedSet : Set<number> = new Set<number>();

	correctAnswerSet : Set<number>;

	ngOnInit() : void {

		if ( this.default ) {
			this.selectedSet = new Set( this.default.split( ',' ).map( str => parseInt( str ) ) );
		}
		if ( this.correctAnswer ) {
      // console.log(this.correctAnswer);
			this.correctAnswerSet = new Set( this.correctAnswer.split( ',' ).map( str => parseInt( str ) ) );
		}
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'default' ] ) {
			this.selectedSet = new Set( ( changes[ 'default' ].currentValue || '' ).split( ',' ).map( ( str : string ) => parseInt( str ) ) );
		}
		if ( changes[ 'correctAnswer' ] ) {
      // console.log(this.correctAnswer);
			this.selectedSet = new Set( ( changes[ 'correctAnswer' ].currentValue || '' ).split( ',' ).map( ( str : string ) => parseInt( str ) ) );
		}
	}

	updateValue( { id } : GroupsRadioQuestion ) {
		if ( this.freeze ) {
			return;
		}
		if ( this.inputType === 'checkbox' ) {
			if ( this.selectedSet.has( id ) ) {
				this.selectedSet.delete( id );
			} else {
				this.selectedSet.add( id );
			}
		} else {
			this.selectedSet.clear();
			this.selectedSet.add( id );
		}
		if ( this.formField ) {
			this.formField.setValue( [ ... this.selectedSet ].join( ',' ) );
		}
		this.onChange.emit( [ ... this.selectedSet ].filter( Boolean ) );
	}

}
