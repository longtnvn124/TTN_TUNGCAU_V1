import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PointsService} from "@shared/services/points.service";
import {NotificationService} from "@core/services/notification.service";
import {FileService} from "@core/services/file.service";
import {Point} from '@modules/shared/models/point';
import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {forkJoin} from "rxjs"
import {NguLieuDanhSachService} from "@shared/services/ngu-lieu-danh-sach.service";
import {AuthService} from "@core/services/auth.service";
import {UnsubscribeOnDestroy} from "@core/utils/decorator";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";
@UnsubscribeOnDestroy()
@Component({
  selector: 'app-virtual-tour',
  templateUrl: './virtual-tour.component.html',
  styleUrls: ['./virtual-tour.component.css']
})
export class VirtualTourComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() showOnly: boolean = false;
  @Input() rotate: boolean = false;
  @ViewChild('container', {static: true}) container: ElementRef<HTMLDivElement>;
  @ViewChild('tooltip', {static: true}) tooltip: ElementRef<HTMLDivElement>;
  @ViewChild('imgtooltip', {static: true}) imgtooltip: ElementRef<HTMLImageElement>;
  @ViewChild('titletooltip', {static: true}) titletooltip: ElementRef<HTMLDivElement>;

  @HostListener('window:resize', ['$event']) onResize1(event: Event): void {
    this.isSmallScreen = window.innerWidth < 500;
  }

  isSmallScreen: boolean = window.innerWidth < 500;
  device: string;
  mode: "BTNPLAY" | "MEDIAVR" = "BTNPLAY";
  ngulieu_type: 0 | 1;


  constructor(
    private notificationService: NotificationService,
    private auth: AuthService,
    private fileService: FileService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private pointsService: PointsService,
    private ngulieuService: NguLieuDanhSachService,
    private navbarService:MobileNavbarService,
  ) {

  }

  private _ngulieu_id: number;
  ngulieuStart: Ngulieu;
  dataPoints: Point[];
  dataPointsChild: Point[];

  ngOnDestroy(): void {

  }

  ngAfterViewInit(): void {
    const params: ParamMap = this.activatedRoute.snapshot.queryParamMap;

    if (params.has('code')) {
      const raw = params.get('code');
      const s1 = this.auth.decryptData(raw);
      const info = s1 ? JSON.parse(s1) : null;
      this._ngulieu_id = info.ngulieu_id;
      this.LoadNgulieu(this._ngulieu_id);
    }
    const tag: string = params.has('tag') ? params.get('tag') : '';
    if (tag) {
      this.device = tag;
    }
  }

  ngOnInit(): void {
  }

  LoadNgulieu(id: number) {
    this.notificationService.isProcessing(true);
    forkJoin<[Ngulieu, Point[]]>(
      this.ngulieuService.getdataById(id),
      this.pointsService.getAllData()
    ).subscribe({
      next: ([ngulieu, dataPoint]) => {
        this.notificationService.isProcessing(false);
        this.dataPoints = dataPoint.map(m => {
          m['_child'] = dataPoint.filter(f => f.parent_id === m.id);
          m['_file_media'] = m.file_media && m.file_media[0] ? this.fileService.getPreviewLinkLocalFile(m.file_media[0]) : '';
          m['_file_audio'] = m.file_audio && m.file_audio[0] ? this.fileService.getPreviewLinkLocalFile(m.file_audio[0]) : '';
          return m;
        });
        this.ngulieuStart = ngulieu ? ngulieu[0] : {};
        this.ngulieuStart['_file_media'] = this.ngulieuStart.file_media && this.ngulieuStart.file_media[0] ? this.fileService.getPreviewLinkLocalFile(this.ngulieuStart.file_media[0]) : '';
        this.ngulieuStart['_file_audio'] = this.ngulieuStart.file_audio && this.ngulieuStart.file_audio[0] ? this.fileService.getPreviewLinkLocalFile(this.ngulieuStart.file_audio[0]) : '';
        this.ngulieuStart['_points_child'] = this.dataPoints.filter(f => f.ngulieu_id === this.ngulieuStart.id && f.parent_id === 0);
        this.dataPointsChild = this.dataPoints.filter(f => f.ngulieu_id === this.ngulieuStart.id);
        this.ngulieu_type = this.ngulieuStart.file_type;


        this.notificationService.isProcessing(false);
      }, error: () => {
        this.notificationService.isProcessing(false);
        this.notificationService.toastError("Mất kết nối với máy chủ");
      }
    });
  }
}
