import { Component , Input , OnInit , SimpleChanges , OnChanges , Output , EventEmitter } from '@angular/core';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component( {
	selector    : 'ovic-input-box' ,
	templateUrl : './ovic-input-box.component.html' ,
	styleUrls   : [ './ovic-input-box.component.css' ]
} )
export class OvicInputBoxComponent implements OnInit , OnChanges {

	@Input() label : string;

	@Input() default : string;

	@Input() placeholder : string;

	@Input() announcedAnswers : string[]; // danh sách đáp án công bố

	@Input() freeze = false; // đóng băng hành động đã công bố kết quả

	@Input() checkAnswerIsCorrect = 0; // chưa check = 0, trả lời đúng = 1, trả lời sai = -1

	@Input() enablePublicCorrectAnswer = false; // Bật chế độ hiển thị đáp án

	@Input() enableShowHint = false; // button showHInt

	@Input() enableShowExplain = false; // button show explain

	@Input() questionOnTop = false; // enable top question style

	_placeholder : string;

	_announcedAnswers : any;

	_freeze : boolean;

	_answerIsCorrect : number; // 0 waiting | correct 1 | incorrect -1

	formGroup : FormGroup;

	_showHint = false;

	_showExplain = false;

	_showControlBox = false;

	@Output() changeValue = new EventEmitter<string>();

	@Output() changeValueDebounceTime = new EventEmitter<string>();

	@Output() showHint = new EventEmitter<boolean>();

	@Output() showExplain = new EventEmitter<boolean>();

	constructor(
		private fb : FormBuilder
	) {
		this.formGroup = this.fb.group( { input : [ '' ] } );
	}

	ngOnInit() : void {
		this.initSettings();
		this.formGroup.get( 'input' ).valueChanges.subscribe( text => this.changeValue.emit( text ) );
		this.formGroup.get( 'input' ).valueChanges.pipe( debounceTime( 500 ) ).subscribe( text => this.changeValueDebounceTime.emit( text ) );
		this.freezeActions( this.freeze );
		this._showControlBox = this.enablePublicCorrectAnswer || this.enableShowExplain || this.enableShowHint;
	}

	ngOnChanges( changes : SimpleChanges ) {
		if ( changes[ 'default' ] ) {
			setTimeout( () => {
				this.initSettings();
			} , 10 );
		}

		if ( changes[ 'freeze' ] ) {
			this.freezeActions( this.freeze );
		}

		if ( changes[ 'announcedAnswers' ] ) {
			this._announcedAnswers = this.announcedAnswers && this.announcedAnswers.length ? this.announcedAnswers.join( ',' ) : null;
		}

		if ( changes[ 'checkAnswerIsCorrect' ] ) {
			this._answerIsCorrect = this.checkAnswerIsCorrect;
		}
	}

	initSettings() {
		this._placeholder = this.placeholder || '';
		if ( this.default && this.default.trim().length ) {
			this.formGroup.get( 'input' ).setValue( this.default.trim() , { emitEvent : false } );
		}
		this._announcedAnswers = this.announcedAnswers && this.announcedAnswers.length ? this.announcedAnswers.join( ',' ) : null;
		this._answerIsCorrect  = this.checkAnswerIsCorrect;
	}

	freezeActions( freeze : boolean ) {
		this._freeze = freeze;
		if ( freeze ) {
			this.formGroup.get( 'input' ).disable();
		}
	}

	evtShowHint() {
		this._showHint = !this._showHint;
		this.showHint.emit( this._showHint );
	}

	evtShowExplain() {
		if ( this._answerIsCorrect ) {
			this._showExplain = !this._showExplain;
			this.showExplain.emit( this._showExplain );
		}
	}

}
