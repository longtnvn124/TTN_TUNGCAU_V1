import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MobileAppRoutingModule } from './mobile-app-routing.module';
import { MobileHomeComponent } from './mobile-home/mobile-home.component';
import {GalleriaModule} from "primeng/galleria";
import { MobileNhanVatComponent } from './mobi-layouts/mobile-nhan-vat/mobile-nhan-vat.component';
import { MobileSuKienComponent } from './mobi-layouts/mobile-su-kien/mobile-su-kien.component';
import { MobileNgulieuVrComponent } from './mobi-layouts/mobile-ngulieu-vr/mobile-ngulieu-vr.component';
import { MobileChuyenMucComponent } from './mobi-layouts/mobile-chuyen-muc/mobile-chuyen-muc.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import {SharedModule} from "@shared/shared.module";
import { MobileChuyenDeComponent } from './mobi-layouts/mobile-chuyen-de/mobile-chuyen-de.component';
import { MobileChuyeDeContentComponent } from './mobi-layouts/mobile-chuyen-de/mobile-chuye-de-content/mobile-chuye-de-content.component';
import { MobileChuyeDeMenuComponent } from './mobi-layouts/mobile-chuyen-de/mobile-chuye-de-menu/mobile-chuye-de-menu.component';
import {TooltipModule} from "primeng/tooltip";
import {PdfViewerModule} from "ng2-pdf-viewer";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import { MobileGioiThieuComponent } from './mobi-layouts/mobile-gioi-thieu/mobile-gioi-thieu.component';
import { MobileTinTucComponent } from './mobi-layouts/mobile-tin-tuc/mobile-tin-tuc.component';
import { MobileThongBaoComponent } from './mobi-layouts/mobile-thong-bao/mobile-thong-bao.component';
import { MobileIfarmeComponent } from './mobi-layouts/mobile-ifarme/mobile-ifarme.component';
import { MobileTimKiemComponent } from './mobi-layouts/mobile-tim-kiem/mobile-tim-kiem.component';
import {InputTextModule} from "primeng/inputtext";
import {PublicModule} from "@modules/public/public.module";
import {FormsModule} from "@angular/forms";
import {SidebarModule} from "primeng/sidebar";
import {HomeModule} from "@modules/public/features/home/home.module";


@NgModule({
  declarations: [
    MobileHomeComponent,
    MobileNhanVatComponent,
    MobileSuKienComponent,
    MobileNgulieuVrComponent,
    MobileChuyenMucComponent,
    MainLayoutComponent,
    MobileChuyenDeComponent,
    MobileChuyeDeContentComponent,
    MobileChuyeDeMenuComponent,
    MobileGioiThieuComponent,
    MobileTinTucComponent,
    MobileThongBaoComponent,
    MobileIfarmeComponent,
    MobileTimKiemComponent
  ],
    imports: [
        CommonModule,
        MobileAppRoutingModule,
        GalleriaModule,
        SharedModule,
        TooltipModule,
        PdfViewerModule,
        ButtonModule,
        RippleModule,
        InputTextModule,
        PublicModule,
        FormsModule,
        SidebarModule,
        HomeModule
    ]
})
export class MobileAppModule { }
