import {Component, Input, OnInit} from '@angular/core';
import {Ngulieu} from "@shared/models/quan-ly-ngu-lieu";
import {NguLieuDanhSachService} from "@shared/services/ngu-lieu-danh-sach.service";
import {BUTTON_NO, BUTTON_YES} from "@core/models/buttons";
import {NotificationService} from "@core/services/notification.service";
import {Route, Router} from "@angular/router";

@Component({
  selector: 'ovic-media-vr-product',
  templateUrl: './ovic-media-vr-product.component.html',
  styleUrls: ['./ovic-media-vr-product.component.css']
})
export class OvicMediaVrProductComponent implements OnInit {
  @Input() isHome: boolean = false;
  @Input() _ngulieu: Ngulieu;
  @Input() device: string;
  link: string;

  constructor(
    private ngulieu: NguLieuDanhSachService,
    private notificationService: NotificationService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loadProduct();
  }


  loadProduct() {
    const ngulieuId = this._ngulieu.id;
    if (this._ngulieu && this._ngulieu.file_product && this._ngulieu.file_product[0]) {
      this.ngulieu.loadUrlNgulieuById(ngulieuId).subscribe({
        next: (url) => {
          this.link = url['data'];
        }
      })
    }
  }


  async gobackhome() {
      if (this.device ==='mobile'){
        void this.router.navigate(['mobile/']);
      }else{
        void this.router.navigate(['home/']);
      }
  }
}
