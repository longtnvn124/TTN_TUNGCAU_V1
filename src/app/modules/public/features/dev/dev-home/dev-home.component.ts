import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Question} from "@shared/models/test-question";


@Component({
  selector: 'app-dev-home',
  templateUrl: './dev-home.component.html',
  styleUrls: ['./dev-home.component.css']
})
export class DevHomeComponent implements OnInit {

  question:Question= null;
  question1:Question= null;


  constructor(
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
  }

}
