import { Component , OnInit , Input , Output , EventEmitter , OnChanges , SimpleChanges } from '@angular/core';
import { OvicQuestion } from '@shared/models/ovic-models';

@Component( {
	selector    : 'ovic-questions' ,
	templateUrl : './ovic-questions.component.html' ,
	styleUrls   : [ './ovic-questions.component.css' ]
} )
export class OvicQuestionsComponent implements OnInit , OnChanges {

	constructor() {}

	@Input() questions : OvicQuestion[];

	@Input() cssClass = '';

	@Input() answered;

	@Output() onChange = new EventEmitter<any>();

	ngOnInit() : void {
		this.questions = this.questions || [];
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'questions' ] ) {
			this.questions = this.questions || [];
		}
		if ( changes[ 'answered' ] ) {
			this.answered = this.answered || [];
			this.onChange.emit( this.answered );
			const keys = Object.keys( this.answered );
			if ( keys && keys.length ) {
				this.questions.forEach(
					q => {
						if ( q.answers.length ) {
							q.answers.map( answ => answ[ 'check' ] = this.answered[ q.name ] === answ.key );
						}
					}
				);
			}
		}
	}

	buttonClick( questionName : string , answerKey : string ) {
		const question = this.questions.find( elm => elm.name === questionName );
		if ( question && question.answers && question.answers.length ) {
			const index = question.answers.findIndex( asw => asw.key === answerKey );
			if ( index === -1 ) {
				return;
			}
			if ( question.type === 'radio' ) {
				question.answers.map( qt => qt.check = false );
				question.answers[ index ].check = true;
			} else {
				question.answers[ index ].check = !question.answers[ index ].check;
			}
		}
		this.result();
	}

	result() {
		const result = [];
		if ( this.questions && this.questions.length ) {
			this.questions.forEach( q => {
				const answers = [];
				if ( q.answers.length ) {
					q.answers.forEach( anw => {
						if ( anw.check ) {
							answers.push( anw.key );
						}
					} );
				}
				if ( answers.length ) {
					result[ q.name ] = answers.toString();
				}
			} );
		}
		this.onChange.emit( result );
	}
}
