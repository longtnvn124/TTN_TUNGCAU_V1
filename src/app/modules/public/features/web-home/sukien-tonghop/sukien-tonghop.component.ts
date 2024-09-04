import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {NguLieuSuKienService} from "@shared/services/ngu-lieu-su-kien.service";
import {NotificationService} from "@core/services/notification.service";
import {SuKien} from "@shared/models/quan-ly-ngu-lieu";
import {FileService} from "@core/services/file.service";
import {DanhMucDiemDiTichService} from '@modules/shared/services/danh-muc-diem-di-tich.service';
import {DanhMucNhanVatLichSuService} from '@modules/shared/services/danh-muc-nhan-vat-lich-su.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-sukien-tonghop',
  templateUrl: './sukien-tonghop.component.html',
  styleUrls: ['./sukien-tonghop.component.css']
})
export class SukienTonghopComponent implements OnInit, OnChanges, OnDestroy {

  @Input() device: string = 'DESKTOP';
  @Input() selectItem: boolean = false;
  @Input() viewFull: boolean = false;
  @Input() search: string;

  constructor(
    private nguLieuSuKienService: NguLieuSuKienService,
    private notificationService: NotificationService,
    private fileService: FileService,
    private danhMucDiemDiTichService: DanhMucDiemDiTichService,
    private danhMucNhanVatLichSuService: DanhMucNhanVatLichSuService,
    private router: Router
  ) {


  }

  mode: "DATA" | 'INFO' = "DATA";


  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    if (this.search) {
      this.loadInit(this.search);
    }

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (this.search) {
      this.loadInit(this.search);
    }
  }

  listData: SuKien[] = [];

  loadInit(search?: string) {
    this.notificationService.isProcessing(true);
    this.nguLieuSuKienService.getAllData(search).subscribe({
      next: (data) => {
        this.listData = data.map(m => {
          m['_bg_link'] = m.files ? this.fileService.getPreviewLinkLocalFile(m.files) : "";
          return m;
        })

        this.notificationService.isProcessing(false);
      },

      error: () => {
        this.notificationService.isProcessing(false);
      }
    })
  }

  selectSukien(id: number) {
    if (this.selectItem && this.device === 'DESKTOP') {
      this.router.navigate(['home/su-kien/'], {queryParams: {parram: id}});
    } else if (this.selectItem && this.device === 'MOBILE') {
      this.router.navigate(['mobile/mobile-su-kien/'], {queryParams: {param: id}});

    }
  }


  btn_backInfo() {
    if (this.mode == 'INFO') {
      this.mode = "DATA";
    }
  }

  btnLoadByTextseach(text: string) {
    this.loadInit(text);
  }


}
