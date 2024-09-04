import {Component,OnInit} from '@angular/core';
import {DmDiemDiTich, DmNhanVatLichSu} from "@shared/models/danh-muc";
import {NguLieuSuKienService} from "@shared/services/ngu-lieu-su-kien.service";
import {NotificationService} from "@core/services/notification.service";
import {FileService} from "@core/services/file.service";
import {DanhMucDiemDiTichService} from "@shared/services/danh-muc-diem-di-tich.service";
import {DanhMucNhanVatLichSuService} from "@shared/services/danh-muc-nhan-vat-lich-su.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {forkJoin, Subscription} from "rxjs";
import {SuKien} from "@shared/models/quan-ly-ngu-lieu";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";
import {UnsubscribeOnDestroy} from "@core/utils/decorator";

@UnsubscribeOnDestroy()
@Component({
  selector: 'app-mobile-su-kien',
  templateUrl: './mobile-su-kien.component.html',
  styleUrls: ['./mobile-su-kien.component.css']
})
export class MobileSuKienComponent implements OnInit {

  dataDiemditich: DmDiemDiTich[];
  dataNhanvatlichsu: DmNhanVatLichSu[];
  stream: HTMLAudioElement;
  subscription: Subscription = new Subscription();
  mode: "DATA" | 'INFO' = "DATA";
  id_param: number;
  listData: SuKien[] = [];
  sukienActive: SuKien;
  constructor(
    private nguLieuSuKienService: NguLieuSuKienService,
    private notificationService: NotificationService,
    private fileService: FileService,
    private danhMucDiemDiTichService: DanhMucDiemDiTichService,
    private danhMucNhanVatLichSuService: DanhMucNhanVatLichSuService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private mobileNavbarService: MobileNavbarService,
  ) {
    this.stream = document.createElement('audio');
    this.stream.setAttribute('playsinline', 'true');
  }

  ngOnInit(): void {
    this.subscription.add(
      this.mobileNavbarService.onBackClick.subscribe(
        () => {
          if (this.mode === "INFO") {
            this.mode = "DATA";
            if(this.stream){
              this.stream.pause();
              this.stream.remove();
            }
          } else {
            if(this.stream){
              this.stream.pause();
              this.stream.remove();
            }
            void this.router.navigate(['mobile']);
          }
        })
    );


    forkJoin<[DmDiemDiTich[], DmNhanVatLichSu[],]>(
      this.danhMucDiemDiTichService.getDataUnlimit(),
      this.danhMucNhanVatLichSuService.getDataUnlimit(null),
    ).subscribe({
      next: ([dataDiemditich, dataNhanvatlichsu,]) => {
        this.dataDiemditich = dataDiemditich;
        this.dataNhanvatlichsu = dataNhanvatlichsu;
        if (this.dataDiemditich && this.dataNhanvatlichsu) {
          this.loadfirst();
        }
        this.notificationService.isProcessing(false);

      },
      error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError('Mất kết nối với máy chủ');
      }
    })
  }

  loadfirst() {
    const params: ParamMap = this.activatedRoute.snapshot.queryParamMap;
    const id: number = params.has('param') ? Number(params.get('param')) : NaN;
    if (!Number.isNaN(id)) {
      this.id_param = id;
      this.loadInit('');
    } else {
      this.loadInit('');
    }
  }

  loadInit(search?: string) {
    this.notificationService.isProcessing(true);
    this.nguLieuSuKienService.getAllData(search).subscribe({
      next: (data) => {
        this.listData = data.map(m => {
          m['_bg_link'] = m.files ? this.fileService.getPreviewLinkLocalFile(m.files) : "";
          m['_audio_link'] = m.file_audio && m.file_audio[0] ? this.fileService.getPreviewLinkLocalFileNotToken(m.file_audio[0]) : "";
          m['_nhanvat_convented'] = m.nhanvat_ids && this.dataNhanvatlichsu ? m.nhanvat_ids.map(f => this.dataNhanvatlichsu.find(c => c.id === f) ? this.dataNhanvatlichsu.find(c => c.id === f).bietdanh : '') : [];
          m['_diemditich_convented'] = m.diemditich_ids ? m.nhanvat_ids.map(f => {
            return this.dataDiemditich.find(c => c.id === f) ? this.dataDiemditich.find(c => c.id === f).ten : '';
          }) : [];
          return m;
        })
        if (this.id_param && this.listData) {
          this.selectSukien(this.id_param);
        }
        this.notificationService.isProcessing(false);
      },

      error: () => {
        this.notificationService.isProcessing(false);
      }
    })
  }

  selectSukien(id: number) {
    this.notificationService.isProcessing(true);
    if (this.listData.find(f => f.id === id)) {
      this.sukienActive = this.listData.find(f => f.id === id);
      this.mode = "INFO";
    }
    this.notificationService.isProcessing(false);
    this.fileService.getFileAsObjectUrl(this.sukienActive.file_audio[0].id.toString(10)).subscribe({
      next: url => {
        const audio = new Audio();
        const source = document.createElement('source')
        source.setAttribute('src', url);
        source.setAttribute('type', this.sukienActive.file_audio[0].type);
        audio.appendChild(source);
        void audio.play();
        if (this.stream) {
          this.stream.remove();
        }
        this.stream = audio;
      }
    });
  }

  playAudio(num: 1 | 0) {
    if (num === 1) {
      this.stream.play();
    }
    if (num === 0) {
      this.stream.pause();
    }
  }

}
