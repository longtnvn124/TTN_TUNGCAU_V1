import {ChangeDetectorRef, Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {FileLocalPermission, OvicFile, SimpleFileLocal} from "@core/models/file";
import {AbstractControl} from "@angular/forms";
import {FileService} from "@core/services/file.service";
import {MediaService} from "@shared/services/media.service";
import {AuthService} from "@core/services/auth.service";
import {NotificationService} from "@core/services/notification.service";
import {map} from "rxjs/operators";
import {DownloadProcess} from "@shared/components/ovic-download-progress/ovic-download-progress.component";


@Component({
  selector: 'app-ovic-file-corpus',
  templateUrl: './ovic-file-corpus.component.html',
  styleUrls: ['./ovic-file-corpus.component.css']
})
export class OvicFileCorpusComponent implements OnInit {
  @Input() emptyMess = 'Không có file đính kèm';

  @Input() permission: FileLocalPermission;

  @Input() formField: AbstractControl;

  @Input() files: SimpleFileLocal[] | any;

  @Input() accept = []; // only file extension eg. .jpg, .png, .jpeg, .gif, .pdf

  @Input() multiple = true;


  @Input() state = 0;

  // @Input() accept = 'all'; // .jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*  accept="audio/*|video/*|image/*|MIME_type"

  fileList: SimpleFileLocal[];

  _accept = '';
  constructor(
    private fileService: FileService,
    private mediaService: MediaService,
    private auth: AuthService,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef
  ) { }


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

  onSelectFiles(event: Event) {
    if (event.target['files'].length) {
      const length = event.target['files'].length;
      let dem = 0;
      const fileUploaded: SimpleFileLocal[] = [];
      this.notificationService.isProcessing(true);
      for (let i = 0; i < length; i++) {
        const file = event.target['files'][i];
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
            }
          }
        }), i * 50);
      }
    }
  }
  btnDeleteFile(file: SimpleFileLocal) {
    if (this.formField) {
      const value = JSON.parse(JSON.stringify(this.formField.value)).filter(f => f.id !== file.id);
      this.formField.setValue(value);
    }
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
}
