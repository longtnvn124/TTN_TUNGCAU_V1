import {Component, Input, OnInit} from '@angular/core';
import {AnswerOption, NganHangCauHoi, NganHangDe} from "@shared/models/quan-ly-ngan-hang";
import {MODULES_QUILL} from "@shared/utils/syscat";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NotificationService} from "@core/services/notification.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {NganHangCauHoiService} from "@shared/services/ngan-hang-cau-hoi.service";
import {NganHangDeService} from "@shared/services/ngan-hang-de.service";
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-form-question-edit',
  templateUrl: './form-question-edit.component.html',
  styleUrls: ['./form-question-edit.component.css']
})
export class FormQuestionEditComponent implements OnInit {


  @Input() set bankQuestion(bank:NganHangDe){
    console.log(bank)
    this.loadInit(bank);
  }

  @Input() columns       : 1 | 2 | 3 | 4 = 1;
  @Input() verticalMode  : boolean = false;
  @Input() rawHtml       : boolean = false;
  module_quill:any = MODULES_QUILL;
  _bank         : NganHangDe ;
  search        : string = '';
  formSave      : FormGroup;
  dataQuestion  : NganHangCauHoi[]=[];
  // listData      : NganHangDe[]=[];
  contentHeader: string = "Thêm mới câu hỏi";
  constructor(
    private nganHangDeService:NganHangDeService,
    private notificationService: NotificationService,
               private themeSettingsService: ThemeSettingsService,
               private fb: FormBuilder,
               private nganHangCauHoiService: NganHangCauHoiService
  ) {
    this.formSave = this.fb.group({
      title: ['', Validators.required],
      bank_id: [0, Validators.required],
      answer_options: [[], Validators.required],
      correct_answer: [[]],
      options_sty:[1],
      random_question:false
    })
  }

  ngOnInit(): void {
  }

  loadInit(bank:NganHangDe){
    this._bank = bank;
    this.resetForm();
    this.loadQuestion(bank.id);
  }

  loadQuestion(id:number){

    this.notificationService.isProcessing(true);
    this.nganHangCauHoiService.getDataByBankId(id, this.search).subscribe({
      next: (data) => {
        this.dataQuestion = data.map(m => {
          m['state'] = 0; // 1: chọn, 0 :bỏ chọn;
          m['_bank_id'] = id;
          m['_data_answer_questions'] =m.random_question===1 ? this.dataRandomView(m.answer_options) : m.answer_options;
          return m;
        })
        this.notificationService.isProcessing(false);
      }, error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  get f(): { [key: string]: AbstractControl<any> } {
    return this.formSave.controls;
  }


  // loadQuestion(id: number) {
  //   this.notificationService.isProcessing(true);
  //   this.nganHangCauHoiService.getDataByBankId(id, this.searchQuestion).subscribe({
  //     next: (data) => {
  //       this.dataQuestion = data.map(m => {
  //         m['state'] = 0; // 1: chọn, 0 :bỏ chọn;
  //         m['_bank_id'] = id;
  //         m['_data_answer_questions'] =m.random_question===1 ? this.dataRandomView(m.answer_options) : m.answer_options;
  //         return m;
  //       })
  //       this.notificationService.isProcessing(false);
  //     }, error: () => {
  //       this.notificationService.isProcessing(false);
  //       this.notificationService.toastError('Mất kết nối với máy chủ');
  //     }
  //   })
  // }

  onSearchQuestion(text: string) {
    this.search = text;
    if (this._bank) {
      this.loadQuestion(this._bank.id);
    }
  }


  resetForm() {
    this.contentHeader = "Thêm mới câu hỏi";
    this.formSave.reset(
      {
        title: '',
        bank_id: this._bank.id,
        answer_options: [],
        correct_answer: null,
        options_sty:1,
        random_question:false
      }
    )
    this.changeOptionsStyle(1);
  }


//=====================add exam=================================
  saveForm() {
    const options =  this.f['answer_options'].value.map(m=>m.value).some(m=> m==='');

    const formcover = {
      title:this.formSave.value['title'],
      bank_id:this.formSave.value['bank_id'],
      answer_options:this.formSave.value['answer_options'],
      correct_answer:this.formSave.value['correct_answer'],
      options_sty:this.formSave.value['options_sty'],
      random_question:this.formSave.value['random_question'] === true ? 1 : 0
    }
    if (this.formSave.valid) {
      if(this.f['correct_answer'].value.length >0 ) {
        if (options){
          this.notificationService.toastWarning('Câu trả lời không để khoảng trống');
        }else{
          // const index = this.listData.findIndex(u => u.id === this.formSave.get('bank_id').value);
          forkJoin([
            this.nganHangDeService.update(this._bank.id, {total: this.dataQuestion.length + 1}),
            this.nganHangCauHoiService.create(formcover)
          ]).subscribe({
            next: () => {
              this.formSave.reset(
                {
                  title: '',
                  bank_id:this._bank.id,
                  answer_options: [],
                  correct_answer: [],
                  options_sty:1,
                  random_question:false
                }
              )
              this.changeOptionsStyle(1);
              // this.listData[index].total = this.listData[index].total + 1;
              this.loadQuestion(this._bank.id);
              this.notificationService.toastSuccess('Thao tác thành công', 'Thông báo');
            },
            error: () => this.notificationService.toastError('Thao tác thất bại', 'Thông báo')
          })
        }
      }
      else{
        this.notificationService.toastWarning('Chưa chọn câu trả lời đúng')
      }


    } else {
      this.notificationService.toastError('Yêu cầu nhập đủ thông tin');
    }

  }

  btnEdit(item: NganHangCauHoi) {
    this.contentHeader = "Cập nhật câu hỏi";
    this.objectEdit = item;
    this.formSave.reset({
      title: this.objectEdit.title,
      bank_id: this._bank.id,
      answer_options: this.objectEdit.answer_options,
      correct_answer: this.objectEdit.correct_answer,
      multiple: this.objectEdit.correct_answer.length > 1 ? 1 : 0,
      options_sty:this.objectEdit.options_sty,
      random_question: this.objectEdit.random_question === 1 ? true: false
    });
    this.changeOptionsStyle(this.objectEdit.options_sty);
  }

  objectEdit: NganHangCauHoi;

  async btnDelete(item: NganHangCauHoi) {
    const confirm = await this.notificationService.confirmDelete();
    if (confirm) {
      this.nganHangCauHoiService.delete(item.id).subscribe({
        next: () => {
          this.notificationService.isProcessing(false);
          this.notificationService.toastSuccess('Thao tác thành công');
          const count = this.dataQuestion.filter(f => f.id != item.id);
          this.dataQuestion = this.dataQuestion.filter(f => f.id != item.id);
          this.nganHangDeService.update(item.bank_id, {total: count.length}).subscribe();
        }, error: () => {
          this.notificationService.isProcessing(false);
          this.notificationService.toastError('Thao tác không thành công');
        }
      })
    }
  }


  saveEdit() {
    const options =  this.f['answer_options'].value.map(m=>m.value).some(m=> m==='');
    const formcover = {
      title:this.formSave.value['title'],
      bank_id:this.formSave.value['bank_id'],
      answer_options:this.formSave.value['answer_options'],
      correct_answer:this.formSave.value['correct_answer'],
      options_sty:this.formSave.value['options_sty'],
      random_question:this.formSave.value['random_question'] === true ? 1 : 0
    }
    if(this.f['correct_answer'].value.length >0 ) {
      if(options) {
        this.notificationService.toastWarning("Câu trả lời không được để trống");
      }
      else{
        this.notificationService.isProcessing(true);
        this.nganHangCauHoiService.update(this.objectEdit.id, formcover).subscribe({
          next: () => {
            this.loadQuestion(this._bank.id);
            this.notificationService.isProcessing(false);
            this.notificationService.toastSuccess('Thao tác thành công');
          }, error: () => {
            this.notificationService.isProcessing(false);
            this.notificationService.toastError('Thao tác không thành công');
          }
        })
      }
    }else {
      this.notificationService.toastWarning('Chưa chọn câu trả lời đúng');
    }

  }

  optionsStyCr:number=1;// 1:1 cột,2: 2:cột, 3:3 cột
  changeOptionsStyle(type:number){
    if(type ===1){
      this.optionsStyCr= 1;
      this.f['options_sty'].setValue(1);
    }
    if(type ===2){
      this.optionsStyCr= 2;
      this.f['options_sty'].setValue(2);
    }
    if(type ===3){
      this.optionsStyCr= 3;
      this.f['options_sty'].setValue(3);
    }
  }

  dataRandomView(arr: AnswerOption[]){
    const shuffledArray = [...arr];
    shuffledArray.sort(() => Math.random() - 0.5);

    return shuffledArray;
  }


}
