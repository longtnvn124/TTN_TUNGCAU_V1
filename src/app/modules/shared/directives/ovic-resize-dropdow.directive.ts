import {Directive, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Editor} from "primeng/editor";
import {FileService} from "@core/services/file.service";
import {NotificationService} from "@core/services/notification.service";
import Quill from 'Quill';
import {AbstractControl} from "@angular/forms";

@Directive({selector: '[Resize_img]'})
export class OvicResizeDropdowDirective implements OnInit {

  @Input() Resize_img: boolean;

  @Input() curentFormControl: AbstractControl;


  @Input() set editor(comp: Editor) {
    comp.onInit.subscribe(({editor}: { editor: any }) => {
      this.handleUploadImage(editor);
    });
  }

  @Output() changeImgSettings: EventEmitter<any> = new EventEmitter<any>();

  url_image: string = '';

  constructor(
    private fileService: FileService,
    private notification: NotificationService,
  ) {
  }

  ngOnInit(): void {
  }


  handleUploadImage(quill: Quill) {
    const toolbar = quill.getModule('toolbar');

    toolbar.addHandler('image', () => this.uploadFilebyHandler(quill))
  }

  uploadFilebyHandler(quill: Quill) {
    const range = quill.getSelection();
    const inputElemenet = document.createElement('input');
    inputElemenet.style.display = 'none';
    inputElemenet.type = 'file';
    inputElemenet.accept = 'image/png, image/jpeg, image/jpg,';
    inputElemenet.click();

    inputElemenet.addEventListener('change', () => {
      if (inputElemenet.files) {
        const file = inputElemenet.files[0];
        if (file['type'] && ['image/png', 'image/jpg', 'image/jpeg',].includes(file['type'])) {
          this.notification.isProcessing(true);

          this.fileService.uploadFile(file, 1).subscribe({
            next: (info) => {

              this.url_image = this.fileService.getPreviewLinkLocalFileNotToken(info);
              if (this.url_image) {
                quill.insertEmbed(range.index, 'image', this.url_image);

                if (this.curentFormControl) {
                  this.curentFormControl.setValue(quill.container.querySelector('.ql-editor').innerHTML);
                }
                // this.changeImgSettings.emit(this.url_image);
              }
              this.notification.isProcessing(false);
            },
            error: () => {
              this.notification.isProcessing(false);
            },
          })
        }else{
          this.notification.toastWarning('Định dạng file không phù hợp');
        }

      }
    });
  }

}


