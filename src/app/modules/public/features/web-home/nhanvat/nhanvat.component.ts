import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {DmNhanVatLichSu} from "@shared/models/danh-muc";
import {DanhMucNhanVatLichSuService} from "@shared/services/danh-muc-nhan-vat-lich-su.service";
import {NguLieuSuKienService} from "@shared/services/ngu-lieu-su-kien.service";
import {NotificationService} from "@core/services/notification.service";
import {forkJoin} from "rxjs";
import {SuKien} from "@shared/models/quan-ly-ngu-lieu";
import {FileService} from "@core/services/file.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-nhanvat',
  templateUrl: './nhanvat.component.html',
  styleUrls: ['./nhanvat.component.css']
})
export class NhanvatComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() device:string= 'DESKTOP';
  @Input() selectItem: boolean = false;
  @Input() search:string;
  gioitinh = [{value: 1, label: 'Nam'}, {value: 0, label: 'Nữ'}];
  mode:'DATA'|'INFO' ="DATA";
  constructor(
    private DanhMucNhanVatLichSuService: DanhMucNhanVatLichSuService,
    private sukienService: NguLieuSuKienService,
    private notificationService: NotificationService,
    private fileSerivce: FileService,
    private route:Router
  ) {
  }
  textSearch:string = '';
  ngAfterViewInit(): void {


  }

  ngOnInit(): void {
    // this.loadInit()
    this.loadInit(this.search);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.search){

      this.loadInit(this.search);
    }
    else{
      this.loadInit();

    }
  }

  listData: DmNhanVatLichSu[]= [];

  loadInit(text?:string) {
    // this.notificationService.isProcessing(true);
    forkJoin<[DmNhanVatLichSu[], SuKien[]]>(this.DanhMucNhanVatLichSuService.getDataUnlimit(text), this.sukienService.getAllData()).subscribe({
      next: ([data, dataSukien]) => {
        this.listData = data.map(m => {
          // m['_img_link'] = m.files ? this.fileSerivce.getPreviewLinkLocalFile(m.files) : '';
          const participation_event = dataSukien.filter(f => f.nhanvat_ids.filter(a => a === m.id));
          m['_sukien_thamgia'] = participation_event;
          const sIndex = this.gioitinh.findIndex(i => i.value === m.gioitinh);
          m['__gioitinh_converted'] = sIndex !== -1 ? this.gioitinh[sIndex].label : '';
          m['image_convenrted'] =   m.files ? this.fileSerivce.getPreviewLinkLocalFile(m.files) : '';
          return m;
        })
        // this.notificationService.isProcessing(false);
      }, error: () => {
        // this.notificationService.isProcessing(false);
      }
    })
  }

  dataSelect: DmNhanVatLichSu;

  btnSelectItem(Dm: DmNhanVatLichSu) {
    if(this.selectItem && this.device=== 'DESKTOP'){
      this.route.navigate(['/home/nhan-vat/'], {queryParams: {param: Dm.id}});
    }else if (this.selectItem && this.device=== 'MOBILE'){
      this.route.navigate(['/mobile/mobile-nhan-vat/'], {queryParams: {param: Dm.id}});
    }
  }
  btnExit(){
    if(this.mode == "INFO"){
      this.mode = "DATA";
    }
  }
  btnLoadByTextseach(text:string){
    this.loadInit(text);
  }



}
