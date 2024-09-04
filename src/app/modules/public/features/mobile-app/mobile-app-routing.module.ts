import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MobileHomeComponent} from "@modules/public/features/mobile-app/mobile-home/mobile-home.component";
import {MainLayoutComponent} from "@modules/public/features/mobile-app/main-layout/main-layout.component";
import {
  MobileChuyenMucComponent
} from "@modules/public/features/mobile-app/mobi-layouts/mobile-chuyen-muc/mobile-chuyen-muc.component";
import {
  MobileNgulieuVrComponent
} from "@modules/public/features/mobile-app/mobi-layouts/mobile-ngulieu-vr/mobile-ngulieu-vr.component";
import {
  MobileNhanVatComponent
} from "@modules/public/features/mobile-app/mobi-layouts/mobile-nhan-vat/mobile-nhan-vat.component";
import {
  MobileChuyenDeComponent
} from "@modules/public/features/mobile-app/mobi-layouts/mobile-chuyen-de/mobile-chuyen-de.component";
import {
  MobileSuKienComponent
} from "@modules/public/features/mobile-app/mobi-layouts/mobile-su-kien/mobile-su-kien.component";
import {
  MobileGioiThieuComponent
} from "@modules/public/features/mobile-app/mobi-layouts/mobile-gioi-thieu/mobile-gioi-thieu.component";
import {
  MobileTinTucComponent
} from "@modules/public/features/mobile-app/mobi-layouts/mobile-tin-tuc/mobile-tin-tuc.component";
import {
  MobileThongBaoComponent
} from "@modules/public/features/mobile-app/mobi-layouts/mobile-thong-bao/mobile-thong-bao.component";
import {
  MobileIfarmeComponent
} from "@modules/public/features/mobile-app/mobi-layouts/mobile-ifarme/mobile-ifarme.component";
import {
  MobileTimKiemComponent
} from "@modules/public/features/mobile-app/mobi-layouts/mobile-tim-kiem/mobile-tim-kiem.component";

const routes: Routes = [

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'mobile-chuyen-de',
        component: MobileChuyenDeComponent,
        data: {
          title: 'Bài Giảng Chuyên đề'
        }
      },
      {
        path: 'mobile-chuyen-muc',
        component: MobileChuyenMucComponent,
        data: {
          title: 'Chuyên mục'
        }
      },
      {
        path: 'mobile-nhan-vat',
        component: MobileNhanVatComponent,
        data: {
          title: 'Nhân vật lịch sử'
        }
      },
      {
        path: 'mobile-tim-kiem',
        component: MobileTimKiemComponent,
        data:{
          title:'Tìm kiếm'
        }
      },
      {
        path: 'mobile-vr-360',
        component: MobileNgulieuVrComponent,
        data:{
          title:'Di tích lịch sử VR360'
        }
      },
      {
        path: 'mobile-su-kien',
        component: MobileSuKienComponent,
        data:{
          title:'Sự kiện lịch sử'
        }
      },
      {
        path: 'mobile-gioi-thieu',
        component: MobileGioiThieuComponent,
        data:{
          title:'Giới thiệu'
        }
      },
      {
        path: 'mobile-tin-tuc',
        component: MobileTinTucComponent,
        data:{
          title:'Tin Tức'
        }
      },
      {
        path: 'mobile-thong-bao',
        component: MobileThongBaoComponent,
        data:{
          title:'Thông báo'
        }
      },
      {
        path: 'mobile-cong-thong-tin',
        component: MobileIfarmeComponent,
        data:{
          title:'Cổng thông tin'
        }
      },
      {
        path: '',
        component: MobileHomeComponent
      }
    ]
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MobileAppRoutingModule {
}
