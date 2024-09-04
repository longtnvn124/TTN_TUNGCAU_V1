import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Answers, Question} from "@shared/models/test-question";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {CheckboxModule} from "primeng/checkbox";
import {EditorModule} from "primeng/editor";


@Component({
  selector: 'answer-option-group',
  templateUrl: './answer-option-group.component.html',
  styleUrls: ['./answer-option-group.component.css'],
  imports: [
    ButtonModule,
    RippleModule,
    NgClass,
    FormsModule,
    NgForOf,
    CheckboxModule,
    NgIf,
    EditorModule
  ],
  standalone: true
})
export class AnswerOptionGroupComponent implements OnInit {

  @Input() type_answer: string = "radio";// checkbox,radio

  @ViewChild('fileInput') fileInput: ElementRef;

  @Input() set question(question: Question) {
    this._question = question;
  };

  get question() {
    return this._question;
  }

  _question: Question;

  constructor() {
  }

  ngOnInit(): void {
    // if (this.question) {
    //   this._question = this.question && Array.isArray(this.question) ? this.question : [];
    // }

  }

  addMoreAnswer() {
    const oldValue = Array.isArray(this._question.answer_option) ? this._question.answer_option : [];
    const _id = oldValue.reduce((max, item) => max < item.id ? item.id : max, 0);
    const value = '';
    if (this._question.answer_option.length > 0) {

      for (let i = 1; i <= 2; i++) {
        oldValue.push({id: _id + i, value});
      }
      this._question.answer_option = oldValue;

    } else {
      for (let i = 1; i <= 4; i++) {
        oldValue.push({id: _id + i, value});
      }
      this._question.answer_option = oldValue;
    }

  }


  deleteItem(id: number) {
    // if (this.correctAnswer.find(f => f === id.toString())) {
    //   this._answer_correct = this.correctAnswer.filter(f => f !== id.toString());
    // }
    // this._answerOption = this._answerOption.filter(f => f.id !== id);
    // this.options =  this._answerOption.filter(f => f.id !== id);

    if (this._question.answer_correct.find(f => f === id.toString())) {
      this._question.answer_correct = this._question.answer_correct.filter(f => f !== id.toString());
    }
    this._question.answer_option = this._question.answer_option.filter(f => f.id !== id);
  }

  selectItem(id: number) {
    const oldValue = Array.isArray(this._question.answer_correct) ? this._question.answer_correct : [];
    if (this.type_answer === "checkbox") {
      this._question.answer_correct = oldValue.includes(id.toString()) ? oldValue.filter(u => u !== id.toString()) : [...oldValue, id.toString()];
    }
    if (this.type_answer === "radio") {
      this._question.answer_correct = oldValue.includes(id.toString()) ? oldValue : [id.toString()];
    }
  }

  characterAvatar: string = '';

  optionId: number;

  btnUploadFile(id: number) {
    const inputElement = this.fileInput.nativeElement as HTMLInputElement;
    inputElement.type = 'file';
    inputElement.accept = 'image/png, image/jpeg, image/jpg';
    inputElement.click();
    this.optionId = id;
  }


}
