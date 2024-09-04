import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NguLieuDanhSachService} from "@shared/services/ngu-lieu-danh-sach.service";
import {NotificationService} from "@core/services/notification.service";
import {FileService} from "@core/services/file.service";
import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";
import {AuthService} from "@core/services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'danhmuc-ngulieuso',
  templateUrl: './danhmuc-ngulieuso.component.html',
  styleUrls: ['./danhmuc-ngulieuso.component.css']
})
export class DanhmucNgulieusoComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() selectItem: boolean;
  @Input() search: string;
  @Input() device: string = "DESKTOP";

  constructor(
    private nguLieuDanhSachService: NguLieuDanhSachService,
    private notificationService: NotificationService,
    private fileService: FileService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (this.search) {
      this.loadInit(this.search);
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.search) {
      this.loadInit(this.search);
    }
  }

  ngAfterViewInit() {
  }

  listData: Ngulieu[];
  ngulieuImage360: Ngulieu[] = [];
  ngulieuVideo360: Ngulieu[] = [];

  loadInit(search?: string) {
    this.notificationService.isProcessing(true);
    this.nguLieuDanhSachService.getDataUnlimit(search).subscribe({
      next: (data) => {
        const dataNguLieu = data.map(m => {
          m['__file_thumbnail'] = m.file_thumbnail ? this.fileService.getPreviewLinkLocalFile(m.file_thumbnail) : '';
          m['tags'] = ['VR360', m.loaingulieu === "image360" ? 'Hình ảnh Vr 360' : 'Video Vr 360'];
          return m;
        })
        this.ngulieuImage360 = dataNguLieu.filter(f => f.loaingulieu === "image360") ? dataNguLieu.filter(f => f.loaingulieu === "image360") : [];
        this.ngulieuVideo360 = dataNguLieu.filter(f => f.loaingulieu === "video360") ? dataNguLieu.filter(f => f.loaingulieu === "video360") : [];
        this.listData = [].concat(this.ngulieuImage360, this.ngulieuVideo360);

        this.notificationService.isProcessing(false);
      },
      error: () => {
        this.notificationService.isProcessing(false);
      }

    })
  }

  btnSelectNgulieu(item: Ngulieu) {
    if (this.selectItem) {
      const code = this.authService.encryptData(JSON.stringify({ngulieu_id: item.id}));
      void this.router.navigate(['virtual-tour'], {queryParams: {code}});

    }
  }

  btnLoadByTextseach(text: string) {
    this.loadInit(text);
  }

}
