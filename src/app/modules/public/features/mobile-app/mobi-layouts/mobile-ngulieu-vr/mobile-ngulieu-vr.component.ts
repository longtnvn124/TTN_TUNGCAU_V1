import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NguLieuDanhSachService} from "@shared/services/ngu-lieu-danh-sach.service";
import {NotificationService} from "@core/services/notification.service";
import {FileService} from "@core/services/file.service";
import {AuthService} from "@core/services/auth.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";
import {UnsubscribeOnDestroy} from "@core/utils/decorator";
import {Subscription} from "rxjs";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";

@UnsubscribeOnDestroy()
@Component({
  selector: 'app-mobile-ngulieu-vr',
  templateUrl: './mobile-ngulieu-vr.component.html',
  styleUrls: ['./mobile-ngulieu-vr.component.css']
})
export class MobileNgulieuVrComponent implements OnInit {
  @Input() search: string;
  subscription: Subscription = new Subscription();

  constructor(
    private nguLieuDanhSachService: NguLieuDanhSachService,
    private notificationService: NotificationService,
    private fileService: FileService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mobileNavbarService: MobileNavbarService,
  ) {
  }

  id_param: number;

  ngOnInit() {
    const params: ParamMap = this.activatedRoute.snapshot.queryParamMap;
    const id: number = params.has('id') ? Number(params.get('id')) : NaN;
    if (!Number.isNaN(id)) {
      this.id_param = id;
      this.loadInit('');
    } else {
      this.loadInit('');
    }
    this.subscription.add(
      this.mobileNavbarService.onBackClick.subscribe(
        () => {
          void this.router.navigate(['mobile']);
        })
    )
  }


  ngulieuImage360: Ngulieu[] = [];
  ngulieuVideo360: Ngulieu[] = [];

  loadInit(search?: string) {
    this.notificationService.isProcessing(true);
    this.nguLieuDanhSachService.getDataUnlimit(search).subscribe({
      next: (data) => {
        const dataNguLieu = data.map(m => {
          m['__file_thumbnail'] = m.file_thumbnail ? this.fileService.getPreviewLinkLocalFile(m.file_thumbnail) : '';
          return m;
        })
        this.ngulieuImage360 = dataNguLieu.filter(f => f.loaingulieu === "image360") ? dataNguLieu.filter(f => f.loaingulieu === "image360") : [];
        this.ngulieuVideo360 = dataNguLieu.filter(f => f.loaingulieu === "video360") ? dataNguLieu.filter(f => f.loaingulieu === "video360") : [];
        this.notificationService.isProcessing(false);
        this.notificationService.isProcessing(false);
      },
      error: () => {
        this.notificationService.isProcessing(false);
      }

    })
  }

  btnSelectNgulieu(item: Ngulieu) {

    const code = this.authService.encryptData(JSON.stringify({ngulieu_id: item.id}));
    void this.router.navigate(['virtual-tour'], {queryParams: {code, tag: 'mobile'}});
  }


}
