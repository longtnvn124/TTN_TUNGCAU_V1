import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {OvicFile, SimpleFileLocal, FileLocalPermission} from '@core/models/file';
import {FileService} from '@core/services/file.service';
import {MediaService} from '@shared/services/media.service';
import {AbstractControl} from '@angular/forms';
import {map} from 'rxjs/operators';
import {AuthService} from '@core/services/auth.service';
import {NotificationService} from '@core/services/notification.service';
import {DownloadProcess} from '@shared/components/ovic-download-progress/ovic-download-progress.component';
import {WAITING_POPUP} from "@shared/utils/syscat";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-file-list-local',
  templateUrl: './file-list-local.component.html',
  styleUrls: ['./file-list-local.component.css']
})
export class FileListLocalComponent implements OnInit, OnChanges {

  @Input() chuyendeId:number;

  @Input() emptyMess = 'Không có file đính kèm';

  @Input() permission: FileLocalPermission;

  @Input() formField: AbstractControl;

  @Input() files: SimpleFileLocal[] | any;

  @Input() accept = []; // only file extension eg. .jpg, .png, .jpeg, .gif, .pdf

  @Input() multiple = true;

  @Input() state = 0;
  @ViewChild('templateWaiting') templateWaiting: ElementRef;

  // @Input() accept = 'all'; // .jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*  accept="audio/*|video/*|image/*|MIME_type"

  fileList: SimpleFileLocal[];

  _accept = '';


  constructor(
    private fileService: FileService,
    private mediaService: MediaService,
    private auth: AuthService,
    private notificationService: NotificationService,
    private modalService :NgbModal
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accept']) {
      if (this.accept && this.accept.length) {
        this._accept = this.accept.join(',');
      }
    }
    if (changes['files']) {
      if (this.files && this.files.length) {
        this.fileList = this.files.map(file => {
          file['file_size'] = file.size ? this.fileService.formatBytes(file.size) : '0b';
          return file;
        });
      } else {
        this.fileList = [];
      }
    }
  }

  ngOnInit(): void {
    if (this.formField) {
      this.formField.valueChanges.pipe(map(t => (t && Array.isArray(t)) ? t : [])).subscribe((files: SimpleFileLocal[]) => {
        this.fileList = files.filter(Boolean).map(file => {
          file['file_size'] = file.size ? this.fileService.formatBytes(file.size) : '0b';
          return file;
        });
      });

      if (this.formField.value && Array.isArray(this.formField.value)) {
        this.fileList = this.formField.value.filter(Boolean).map(file => {
          file['file_size'] = file.size ? this.fileService.formatBytes(file.size) : '0b';
          return file;
        });
      }
    }
    if (this.files && this.files.length) {
      this.fileList = this.files.filter(Boolean).map(file => {
        file['file_size'] = file.size ? this.fileService.formatBytes(file.size) : '0b';
        return file;
      });
    }
    if (this.accept && this.accept.length) {
      this._accept = this.accept.join(',');
    }
  }

  removeFile(file: SimpleFileLocal) {

  }

  async btnDownloadFile(file: SimpleFileLocal) {
    const result = await this.mediaService.tplDownloadFile(file as OvicFile);
    switch (result) {
      case DownloadProcess.rejected:
        this.notificationService.toastInfo('Chưa hỗ trợ tải xuống thư mục');
        break;
      case DownloadProcess.error:
        this.notificationService.toastError('Tải xuống thất bại');
        break;
    }
  }

  btnDeleteFile(file: SimpleFileLocal) {
    if (this.formField) {
      const value = JSON.parse(JSON.stringify(this.formField.value)).filter(f => f.id !== file.id);
      this.formField.setValue(value);
    }

  }

  async addMoreFile() {

  }

  onSelectFiles(event: Event) {
    if (event.target['files'].length) {
      const length = event.target['files'].length;
      let dem = 0;
      const fileUploaded: SimpleFileLocal[] = [];

      for (let i = 0; i < length; i++) {

        const file = event.target['files'][i];
        const tail = file['name'].slice(file['name'].lastIndexOf('.'));
        this.modalService.open(this.templateWaiting, WAITING_POPUP);
        if (this.accept.length >0){
          if (this.accept.includes(tail)){
            setTimeout(() => this.fileService.uploadFile(file, this.state).subscribe({
              next: (f) => {

                fileUploaded.push({
                  id: f.id,
                  name: f.name,
                  title: f.title,
                  ext: f.ext,
                  type: f.type,
                  size: f.size
                });

                if (++dem === length) {
                  this.notificationService.isProcessing(false);
                  if (this.formField.value && Array.isArray(this.formField.value)) {
                    const value = JSON.parse(JSON.stringify(this.formField.value));
                    this.formField.setValue([].concat(value, fileUploaded));
                  } else {
                    this.formField.setValue(fileUploaded);
                  }

                  event.target['value'] = '';

                  this.modalService.dismissAll();
                }
                  // this.modalService.dismissAll();
              },
              error: () => {
                if (++dem === length) {
                  this.notificationService.isProcessing(false);
                  if (this.formField.value && Array.isArray(this.formField.value)) {
                    const value = JSON.parse(JSON.stringify(this.formField.value));
                    this.formField.setValue([].concat(value, fileUploaded));
                  } else {
                    this.formField.setValue(fileUploaded);
                  }
                  event.target['value'] = '';

                  this.modalService.dismissAll();
                };
                // this.modalService.dismissAll();

              }
            }), i * 50);
          }else{
            this.notificationService.isProcessing(false);
            this.notificationService.toastWarning('File tải lên không đúng định dạng');
          }
        }else{
          setTimeout(() => this.fileService.uploadFile(file, this.state).subscribe({
            next: (f) => {
              fileUploaded.push({
                id: f.id,
                name: f.name,
                title: f.title,
                ext: f.ext,
                type: f.type,
                size: f.size
              });

              if (++dem === length) {


                this.notificationService.isProcessing(false);
                if (this.formField.value && Array.isArray(this.formField.value)) {
                  const value = JSON.parse(JSON.stringify(this.formField.value));
                  this.formField.setValue([].concat(value, fileUploaded));
                } else {
                  this.formField.setValue(fileUploaded);
                }
                event.target['value'] = '';

                this.modalService.dismissAll();
              }
            },
            error: () => {
              if (++dem === length) {

                this.notificationService.isProcessing(false);
                if (this.formField.value && Array.isArray(this.formField.value)) {
                  const value = JSON.parse(JSON.stringify(this.formField.value));
                  this.formField.setValue([].concat(value, fileUploaded));
                } else {
                  this.formField.setValue(fileUploaded);
                }
                event.target['value'] = '';

                this.modalService.dismissAll();
              }
            }
          }), i * 50);
        }

      }
    }
  }
}
