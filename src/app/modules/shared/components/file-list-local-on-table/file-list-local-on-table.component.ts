import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {FileLocalPermission, OvicFile, SimpleFileLocal} from '@core/models/file';
import {FileService} from '@core/services/file.service';
import {MediaService} from '@shared/services/media.service';
import {AuthService} from '@core/services/auth.service';
import {NotificationService} from '@core/services/notification.service';
import {MatMenuTrigger} from '@angular/material/menu';
import {DownloadProcess} from '@shared/components/ovic-download-progress/ovic-download-progress.component';

@Component({
  selector: 'app-file-list-local-on-table',
  templateUrl: './file-list-local-on-table.component.html',
  styleUrls: ['./file-list-local-on-table.component.css']
})
export class FileListLocalOnTableComponent implements OnInit, OnChanges {

  @Input() files: SimpleFileLocal[];

  @Input() accept = []; // only file extension eg. .jpg, .png, .jpeg, .gif, .pdf

  @Input() multiple = false;

  @Input() permission: FileLocalPermission = {
    canDownload: true,
    canUpload: true,
    canDelete: true
  };

  @Input() state = 0;

  @Output() changesData = new EventEmitter<SimpleFileLocal[]>();

  @ViewChild('fileChooser') fileChooser: ElementRef;

  @ViewChild(MatMenuTrigger, {static: false}) matMenuTrigger: MatMenuTrigger;

  _fileList: SimpleFileLocal[];

  _accept: string;

  constructor(
    private fileService: FileService,
    private mediaService: MediaService,
    private notificationService: NotificationService,
    private auth: AuthService
  ) {
  }

  ngOnInit(): void {
    if (this.accept && this.accept.length) {
      this._accept = this.accept.join(',');
    }
    this.fileList = this.files || [];
  }

  get fileList(): SimpleFileLocal[] {
    return this._fileList;
  }

  set fileList(files: SimpleFileLocal[]) {
    this._fileList = (files || []).map(file => {
      if (file) {
        file['file_size'] = file.size ? this.fileService.formatBytes(file.size) : '0b';
      }
      return file;
    });
  }

  close() {
  }

  async onChangesFileChooser(event: Event) {
    if (event.target['files'].length) {
      try {
        const uploaded = await this.uploadFiles(event.target['files']);
        if (uploaded.error) {
          this.notificationService.toastError('Đã có lỗi trong quá trình upload');
        }
        if (uploaded.data.length) {
          const data = this.fileList.length ? [].concat(this.fileList, uploaded.data) : uploaded.data;
          this.changesData.emit(data);
        }
        this.fileChooser.nativeElement.value = '';
      } catch (e) {
        this.fileChooser.nativeElement.value = '';
      }
    }
  }

  async uploadFiles(fileList: FileList): Promise<{ error: boolean, data: SimpleFileLocal[] }> {
    return new Promise<{ error: boolean, data: SimpleFileLocal[] }>(resolve => {
      let dem = 0;
      const maxDem = fileList.length;
      const result: { error: boolean, data: SimpleFileLocal[] } = {
        error: false,
        data: []
      };
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setTimeout(() => this.fileService.uploadFile(file, this.state).subscribe({
          next: (f) => {
            result.data.push({
              id: f.id,
              name: f.name,
              title: f.title,
              ext: f.ext,
              type: f.type,
              size: f.size
            });
            if (++dem === maxDem) {
              resolve(result);
            }
          },
          error: () => {
            result.error = true;
            if (++dem === maxDem) {
              resolve(result);
            }
          }
        }), i * 100);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accept']) {
      this._accept = changes['accept'].currentValue.join(',');
    }
    if (changes['files']) {
      this.fileList = changes['files'].currentValue;
      if (!this.fileList || !this.fileList.length) {
        this.__closeMenu();
      }
    }
  }

  btnToggleClick(event: Event) {
    if (!this.fileList.length) {
      event.stopPropagation();
      this.fileChooser.nativeElement.click();
    }
  }

  btnStopPropagation(event: Event) {
    event.stopPropagation();
  }

  btnCloseMenu(event: Event) {
    this.__closeMenu();
  }

  private __closeMenu() {
    if (this.matMenuTrigger) {
      this.matMenuTrigger.closeMenu();
    }
  }

  btnAddMoreFiles(event: Event) {
    event.stopPropagation();
    this.fileChooser.nativeElement.click();
  }

  async btnDeleteFile(event: Event, file: SimpleFileLocal) {
    event.stopPropagation();
    try {
      const confirm = await this.notificationService.confirmDelete();
      if (confirm) {
        const newFileList = JSON.parse(JSON.stringify(this.fileList));
        const data = newFileList.filter(f => f.id !== file.id);
        this.changesData.emit(data);
      }
    } catch (e) {
    }
  }

  async btnDownloadFile(event: Event, file: SimpleFileLocal) {
    event.stopPropagation();
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

  btnOpenFile(event: Event, file: SimpleFileLocal) {
    event.stopPropagation();
    if (this.permission['canDownload']) {
      this.mediaService.tplPreviewFiles([{id: file.id, file}], false, false, false);
    }
  }
}
