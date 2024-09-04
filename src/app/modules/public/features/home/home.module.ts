import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HomeRoutingModule} from './home-routing.module';
import {MainLayoutComponent} from './main-layout/main-layout.component';
import {ContentHomeComponent} from './layouts/content-home/content-home.component';
import {ContentChuyenDeComponent} from './layouts/content-chuyen-de/content-chuyen-de.component';
import {ContentSuKienComponent} from './layouts/content-su-kien/content-su-kien.component';
import {GalleriaModule} from "primeng/galleria";
import {ImageModule} from "primeng/image";
import {ContentGioiThieuComponent} from './layouts/content-gioi-thieu/content-gioi-thieu.component';
import {ContentChuyenMucComponent} from './layouts/content-chuyen-muc/content-chuyen-muc.component';
import {ButtonModule} from "primeng/button";
import { ContentNguLieuSoComponent } from './layouts/content-ngu-lieu-so/content-ngu-lieu-so.component';
import {SharedModule} from "@shared/shared.module";
import {PublicModule} from "@modules/public/public.module";
import {TooltipModule} from "primeng/tooltip";
import { ContentNhanVatComponent } from './layouts/content-nhan-vat/content-nhan-vat.component';
import { ContentTimKiemComponent } from './layouts/content-tim-kiem/content-tim-kiem.component';
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {RippleModule} from "primeng/ripple";


@NgModule({
    declarations: [
        MainLayoutComponent,
        ContentHomeComponent,
        ContentChuyenDeComponent,
        ContentSuKienComponent,
        ContentGioiThieuComponent,
        ContentChuyenMucComponent,
        ContentNguLieuSoComponent,
        ContentNhanVatComponent,
        ContentTimKiemComponent
    ],
    imports: [
        CommonModule,
        HomeRoutingModule,
        GalleriaModule,
        ImageModule,
        ButtonModule,
        SharedModule,
        PublicModule,
        TooltipModule,
        DropdownModule,
        FormsModule,
        InputTextModule,
        RippleModule
    ],
    exports: [
        ContentGioiThieuComponent
    ],
    bootstrap: [MainLayoutComponent]
})
export class HomeModule {
}
