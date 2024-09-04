import {Component, OnInit} from '@angular/core';
import {DanhMucNhanVatLichSuService} from "@shared/services/danh-muc-nhan-vat-lich-su.service";
import {NguLieuSuKienService} from "@shared/services/ngu-lieu-su-kien.service";
import {NotificationService} from "@core/services/notification.service";
import {FileService} from "@core/services/file.service";
import {DmNhanVatLichSu} from "@shared/models/danh-muc";
import {forkJoin, Subscription} from "rxjs";
import {SuKien} from "@shared/models/quan-ly-ngu-lieu";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";
import {UnsubscribeOnDestroy} from "@core/utils/decorator";


@UnsubscribeOnDestroy()
@Component({
  selector: 'app-mobile-nhan-vat',
  templateUrl: './mobile-nhan-vat.component.html',
  styleUrls: ['./mobile-nhan-vat.component.css']
})
export class MobileNhanVatComponent implements OnInit {
  gioitinh = [{value: 1, label: 'Nam'}, {value: 0, label: 'Nữ'}];

  mode: 'DATA' | 'INFO' = "DATA";

  subscription: Subscription = new Subscription();

  constructor(
    private danhMucNhanVatLichSuService: DanhMucNhanVatLichSuService,
    private sukienService: NguLieuSuKienService,
    private notificationService: NotificationService,
    private fileSerivce: FileService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mobileNavbarService: MobileNavbarService
  ) {
  }

  id_param: number;


  ngOnInit(): void {

    const params: ParamMap = this.activatedRoute.snapshot.queryParamMap;
    const id: number = params.has('param') ? Number(params.get('param')) : NaN;
    if (!Number.isNaN(id)) {
      this.id_param = id;
    }
    this.loadInit();
    this.subscription.add(
      this.mobileNavbarService.onBackClick.subscribe(
        () => {
          if (this.mode === "INFO") {
            this.mode = "DATA";
          } else {
            void this.router.navigate(['mobile']);
          }
        })
    )
  }


  listData: DmNhanVatLichSu[] = [];

  loadInit(text?: number) {
    this.mode = 'DATA';
    this.notificationService.isProcessing(true);
    forkJoin<[DmNhanVatLichSu[], SuKien[]]>(this.danhMucNhanVatLichSuService.getDataUnlimitById(text), this.sukienService.getAllData()).subscribe({
      next: ([data, dataSukien]) => {
        this.listData = data.map(m => {
          m['_img_link'] = m.files ? this.fileSerivce.getPreviewLinkLocalFile(m.files) : '';
          m['_sukien_thamgia'] = dataSukien.filter(f => f.nhanvat_ids.filter(a => a === m.id));
          const sIndex = this.gioitinh.findIndex(i => i.value === m.gioitinh);
          m['__gioitinh_converted'] = sIndex !== -1 ? this.gioitinh[sIndex].label : '';
          m['image_convenrted'] = m.files ? this.fileSerivce.getPreviewLinkLocalFile(m.files) : '';
          return m;
        })
        if (this.id_param && this.listData) {
          const dt = this.listData.find(f => f.id === this.id_param);
          if (dt) {
            this.btnSelectItem(dt);
          }
        }
        this.notificationService.isProcessing(false);
      }, error: () => {
        this.notificationService.isProcessing(false);
      }
    })
  }

  dataSelect: DmNhanVatLichSu;

  btnSelectItem(Dm: DmNhanVatLichSu) {
    this.dataSelect = Dm;
    this.mode = "INFO";

  }

}
