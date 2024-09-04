import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {AbstractControl} from "@angular/forms";
import {AnswerOption} from "@shared/models/quan-ly-ngan-hang";
import {MediaService} from "@shared/services/media.service";
import {FileService} from "@core/services/file.service";
import {NotificationService} from "@core/services/notification.service";


@Component({
  selector: 'app-answer-option-group',
  templateUrl: './answer-option-group.component.html',
  styleUrls: ['./answer-option-group.component.css']
})
export class AnswerOptionGroupComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  @Input() _formControl: AbstractControl<AnswerOption[]>;

  @Input() correctAnswerControl: AbstractControl<number[]>;

  options: AnswerOption[] = [];

  correctAnswer: number[] = [];

  constructor(
    private mediaService: MediaService,
    private fileService: FileService,
    private notificationService: NotificationService,
  ) {
  }

  ngOnInit(): void {
    if (this._formControl) {
      this._formControl.valueChanges.subscribe(options => this.options = options && Array.isArray(options) ? options : []);
      this.options = this._formControl.value && Array.isArray(this._formControl.value) ? this._formControl.value.map(m => {
        m['_url_file'] = m.type_input === 1 ? this.fileService.getPreviewLinkLocalFile(m.file) : '';
        return m;
      }) : [];
      if(this.options.length=== 0){
        this.addMoreAnswer()
      }
    }
    if (this.correctAnswerControl) {
      this.correctAnswerControl.valueChanges.subscribe(correctAnswer => this.correctAnswer = correctAnswer && Array.isArray(correctAnswer) ? correctAnswer : []);
      this.correctAnswer = this.correctAnswerControl.value && Array.isArray(this.correctAnswerControl.value) ? this.correctAnswerControl.value : [];
    }

  }

  addMoreAnswer() {

    if (this._formControl){
      const oldValue = Array.isArray(this._formControl.value) ? this._formControl.value : [];
      const _id = oldValue.reduce((max, item) => max < item.id ? item.id : max, 0)
      const value = '';
      const type_input = 0;
      const file = null;
      if (this.options.length > 0){
        oldValue.push({id: _id + 1, value, type_input, file});
        this._formControl.setValue(oldValue);
      }else{
        for (let i = 1; i <= 4; i++) {
          oldValue.push({id: _id + i, value, type_input, file});
        }
        this._formControl.setValue(oldValue);
      }
    }

  }


  deleteItem(id: number) {
    if (id === this.correctAnswer.find(f => f === id)) {
      this.correctAnswerControl.setValue(this.correctAnswer.filter(f => f !== id));
    }
    const u = this._formControl.value.filter(f => f.id !== id);
    this._formControl.setValue(u);
  }

  selectItem(id: number) {
    if (this.correctAnswerControl) {
      const oldValue = Array.isArray(this.correctAnswerControl.value) ? this.correctAnswerControl.value : [];

      const newValue = oldValue.includes(id) ? oldValue.filter(u => u !== id) : [...oldValue, id];
      this.correctAnswerControl.setValue(newValue);
    }
  }

  btnSwitch(id: number, num: 1 | 0) {
    // this.swidthMode =num;
    const swi = num === 1 ? 0 : 1;
    this.options.find(f => f.id === id).type_input = swi;
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


  uploadFile(event: Event) {
    const inputElement = this.fileInput.nativeElement as HTMLInputElement;
    const file = inputElement.files[0];
    const data: string[] =['image/png','image/jpeg','image/jpg'];
    if(data.includes(file.type)){
      // upload file to server
      this.fileService.uploadFile(file, 1).subscribe({
        next: fileUl => {
          this.options.find(f => f.id === this.optionId).file = fileUl;
          this.options.find(f => f.id === this.optionId).value = fileUl? "image" :"text";
          this.options.find(f => f.id === this.optionId)['_url_file'] = this.fileService.getPreviewLinkLocalFileNotToken(fileUl);
        }, error: () => {
          this.notificationService.toastError('Upload file không thành công');
        }
      })
    }else {
      this.notificationService.toastWarning('Định dạng file không phù hợp');
    }

  }


}
