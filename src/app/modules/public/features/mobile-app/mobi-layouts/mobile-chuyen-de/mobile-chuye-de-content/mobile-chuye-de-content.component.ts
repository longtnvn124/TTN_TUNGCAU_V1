import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ChuyenDe, Loai, paramChuyenDe} from "@shared/models/quan-ly-chuyen-de";
import {FileService} from "@core/services/file.service";
import {MediaService} from "@shared/services/media.service";
import {NotificationService} from "@core/services/notification.service";
import {OvicFile} from "@core/models/file";
import {DownloadProcess} from "@shared/components/ovic-download-progress/ovic-download-progress.component";

@Component({
  selector: 'app-mobile-chuye-de-content',
  templateUrl: './mobile-chuye-de-content.component.html',
  styleUrls: ['./mobile-chuye-de-content.component.css']
})
export class MobileChuyeDeContentComponent implements OnInit {

  mode: Loai = "default";
  video_link: string;
  documents: string[];
  scorm: string;
  chuyendeSelect: ChuyenDe;
  selectpdf: boolean = false;
  documentSelect: string;
  @ViewChild('scormIframe') scormIframe: HTMLIFrameElement;
  private _data: paramChuyenDe;

  @Input() set params(value: paramChuyenDe) {
    this._data = value;
    if (value) {
      this.video_link = null;
      this.documents = null;
      this.scorm = null;
      this.chuyendeSelect = null;
      this.selectpdf = false;
      this.documentSelect = null;

      this.mode = this._data.type ? this._data.type : 'default';
      this.chuyendeSelect = this._data.chuyende;
      if (this._data.type === "video") {
        this.video_link = this._data.chuyende['_video_link'] ? this._data.chuyende['_video_link'] : null;
      }
      if (this._data.type === "documents") {
        this.documents = this._data.chuyende['_documents_link'] && this._data.chuyende['_documents_link'][0] ? this._data.chuyende['_documents_link'] : null;
      }
      if (this._data.type === "scorm") {
        this.scorm = this._data.chuyende['_scorm_link'] ? this._data.chuyende['_scorm_link'] : null;
      }
    }
  }

  get params(): paramChuyenDe {
    return this._data;
  }

  constructor(
    private fileService: FileService,
    private mediaService: MediaService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
  }



  btnviewpdf(select: OvicFile) {
    this.documentSelect = this._data.chuyende.documents.find(f => f.id === select.id) ? this.fileService.getPreviewLinkLocalFile(select) : null;
    this.selectpdf = true;

  }

  backPDF() {
    this.selectpdf = false;
  }

  async downloadDocument(file: OvicFile) {
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
