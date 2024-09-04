import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {Answers, Config, MEDIA, Question} from "@shared/models/test-question";

@Component({
  selector: 'ovic-test-checkbox',
  templateUrl: './ovic-test-checkbox.component.html',
  styleUrls: ['./ovic-test-checkbox.component.css']
})
export class OvicTestCheckboxComponent implements OnInit {

  @Input() type_question:string = 'radio' ; // radio // checkbox


  _question : Question ;

  questionClone :Question = {
    question_direction:'',
    question_type:'',
    answer_option:[],
    answer_correct:[],
    group_id:null,
    media:null,
    part:null,
    cdr:null,
    question_number:null,
    code:'',
    config:{ cols: 1,  invertedAnswer: true},
    children:[]
  }

  @Input() set form( question : Question ) {
    this._question = question ? question : this.questionClone ;
    console.log(this._question);
    // this.initData.next( 'loadData' );
  }

  get form() : Question {
    return this._question;
  }

  colsSelect:number = 1;

  configCols = [
    {label:'1',value:1},
    {label:'2',value:2},
    {label:'3',value:3},
    {label:'4',value:4}
  ]
  configRandomQuestion = [
    {label:'Không đảo ', value:false,},
    {label:'Có đảo', value:true,}
  ]

  constructor() { }

  ngOnInit(): void {
  }



  protected readonly console = console;
}
