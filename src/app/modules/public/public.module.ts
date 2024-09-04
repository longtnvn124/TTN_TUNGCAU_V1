import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PublicRoutingModule} from './public-routing.module';
import {LoginComponent} from './features/login/login.component';
import {ResetPasswordComponent} from './features/reset-password/reset-password.component';
import {ContentNoneComponent} from './features/content-none/content-none.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LoginV2Component} from './features/login-v2/login-v2.component';
import {UnauthorizedComponent} from './features/unauthorized/unauthorized.component';
import {ButtonModule} from 'primeng/button';
import {RippleModule} from 'primeng/ripple';
import {ClearComponent} from './features/clear/clear.component';

import {InputMaskModule} from 'primeng/inputmask';
import {LoginVideoComponent} from './features/login-video/login-video.component';
import {VirtualTourComponent} from './features/virtual-tour/virtual-tour.component';
import {SharedModule} from "@shared/shared.module";
import {DialogModule} from "primeng/dialog";
import {TabMenuModule} from "primeng/tabmenu";
import {WebHomeComponent} from './features/web-home/web-home.component';
import {SearchComponent} from './features/web-home/search/search.component';
import {NhanvatComponent} from './features/web-home/nhanvat/nhanvat.component';
import {DanhmucNgulieusoComponent} from './features/web-home/danhmuc-ngulieuso/danhmuc-ngulieuso.component';
import {SukienTonghopComponent} from './features/web-home/sukien-tonghop/sukien-tonghop.component';
import {GalleriaModule} from "primeng/galleria";
import {CarouselModule} from "primeng/carousel";
import {ImageModule} from "primeng/image";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {ChuyenDeMenuComponent} from './features/home/layouts/content-chuyen-de/chuyen-de-menu/chuyen-de-menu.component';
import {
  ChuyenDeContentComponent
} from './features/home/layouts/content-chuyen-de/chuyen-de-content/chuyen-de-content.component';
import {PdfViewerModule} from "ng2-pdf-viewer";
import {HomeDhtnComponent} from "@modules/public/features/home-dhtn/home-dhtn.component";

@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    ContentNoneComponent,
    LoginV2Component,
    UnauthorizedComponent,
    ClearComponent,
    LoginVideoComponent,
    VirtualTourComponent,
    WebHomeComponent,
    SearchComponent,
    NhanvatComponent,
    DanhmucNgulieusoComponent,
    SukienTonghopComponent,
    ChuyenDeMenuComponent,
    ChuyenDeContentComponent,
    HomeDhtnComponent
  ],
  exports: [
    ChuyenDeMenuComponent,
    ChuyenDeContentComponent,
    NhanvatComponent,
    SukienTonghopComponent,
    DanhmucNgulieusoComponent
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    InputMaskModule,
    FormsModule,
    SharedModule,
    DialogModule,
    TabMenuModule,
    GalleriaModule,
    CarouselModule,
    ImageModule,
    InputTextModule,
    DropdownModule,
    PdfViewerModule,
  ]
})
export class PublicModule {
}
