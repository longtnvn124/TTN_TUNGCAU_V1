import {Component, OnInit, Input, SimpleChanges, OnChanges} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {HelperService} from '@core/services/helper.service';
import {DmDiemDiTich} from "@shared/models/danh-muc";
import {MODULES_QUILL} from "@shared/utils/syscat";

@Component({
  selector: 'ovic-editor',
  templateUrl: './ovic-editor.component.html',
  styleUrls: ['./ovic-editor.component.css']
})
export class OvicEditorComponent implements OnInit, OnChanges {
  @Input() placeholder:string;
  @Input() height = '320px';

  @Input() set formField(field: AbstractControl) {
    this.textContents = '';
    this.setData(field.value);

    field.valueChanges.subscribe(value => this.setData(field.value));
  }

  get formField(): AbstractControl {
    return this.textContents
  };


  @Input() readonly = false;

  @Input() set default(text: string) {

    this.textContents = '';
    this.setData(text);
  }

  textContents: any;

  constructor(
    private helperService: HelperService
  ) {
  }

  ngOnInit(): void {
    // this.setData(this.default);
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes['default']) {
    //
    // }
  }

  setData(data: string) {
    this.textContents = data ? this.helperService.decodeHTML(data) : '';
  }


  onTextChange(event) {

    if (this.formField) {
      // this.formField.setValue(this.helperService.encodeHTML(event.htmlValue));
      this.textContents = event ? this.helperService.decodeHTML(event.htmlValue):'';

    }

  }

  protected readonly module_quill = MODULES_QUILL;
}
