import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ChuyenDeService} from "@shared/services/chuyen-de.service";
import {FileService} from "@core/services/file.service";
import {NotificationService} from "@core/services/notification.service";
import {ChuyenDe, paramChuyenDe} from "@shared/models/quan-ly-chuyen-de";

@Component({
  selector: 'chuyen-de-menu',
  templateUrl: './chuyen-de-menu.component.html',
  styleUrls: ['./chuyen-de-menu.component.css']
})
export class ChuyenDeMenuComponent implements OnInit {

  @Output() dataEvent = new EventEmitter<any>();
  selectedId: number = 0;
  loading: boolean = false;

  constructor(private chuyenDeService: ChuyenDeService,
              private fileService: FileService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.loadData()
  }

  listData: ChuyenDe[];

  loadData() {
    this.notificationService.isProcessing(true)

    this.chuyenDeService.loadDataUnlimitAndActive().subscribe({
      next: (data) => {
        this.notificationService.isProcessing(false)
        const dataconvert = data.map(f => {

          f['children'] = data.filter(m => m.parent_id === f.id);
          f['have_video'] = f.video_type !== -1 ;
          f['_video_link'] = f.video && f.video[0] ? this.fileService.getPreviewLinkLocalFile(f.video[0]) : '';
          f['_documents_link'] = f.documents && f.documents[0] ? f.documents.map(m => this.fileService.getPreviewLinkLocalFile(m)) : [];
          if (f.file_scorm && f.file_scorm[0]) {
            this.chuyenDeService.loadUrlScormById(f.id).subscribe({
              next: (value) => {
                f['_scorm_link'] = value['data'];
              }
            })
          } else {
            f['_scorm_link'] = null;
          }
          return f;
        });
        this.listData = dataconvert.filter(f => f.parent_id === 0);
      },
      error: () => {
        this.notificationService.isProcessing(false)
      }
    })
  }

  activeLesson(item: ChuyenDe) {
    this.selectedId = item.id;

  }

  presentLessonPath(data: paramChuyenDe) {
    // this.chuyenDeContentComponent.viewbyData(item,load);
    this.sendData(data);
  }

  sendData(data: paramChuyenDe) {
    this.dataEvent.emit(data);
  }
}
