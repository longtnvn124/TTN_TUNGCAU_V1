import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainLayoutComponent} from "@modules/public/features/home/main-layout/main-layout.component";
import {ContentHomeComponent} from "@modules/public/features/home/layouts/content-home/content-home.component";
import {
  ContentChuyenDeComponent
} from "@modules/public/features/home/layouts/content-chuyen-de/content-chuyen-de.component";
import {ContentSuKienComponent} from "@modules/public/features/home/layouts/content-su-kien/content-su-kien.component";
import {
  ContentChuyenMucComponent
} from "@modules/public/features/home/layouts/content-chuyen-muc/content-chuyen-muc.component";
import {
  ContentNguLieuSoComponent
} from "@modules/public/features/home/layouts/content-ngu-lieu-so/content-ngu-lieu-so.component";
import {
  ContentGioiThieuComponent
} from "@modules/public/features/home/layouts/content-gioi-thieu/content-gioi-thieu.component";
import {
  ContentNhanVatComponent
} from "@modules/public/features/home/layouts/content-nhan-vat/content-nhan-vat.component";
import {
  ContentTimKiemComponent
} from "@modules/public/features/home/layouts/content-tim-kiem/content-tim-kiem.component";

const routes: Routes = [
  {
    path: 'chuyen-de',
    component: ContentChuyenDeComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'su-kien',
        component: ContentSuKienComponent
      },
      {
        path: 'chuyen-muc',
        component: ContentChuyenMucComponent
      },
      {
        path: 'vr-360',
        component: ContentNguLieuSoComponent
      },
      {
        path: 'gioi-thieu',
        component: ContentGioiThieuComponent
      },{
        path: 'nhan-vat',
        component: ContentNhanVatComponent
      },
      {
        path: 'tim-kiem',
        component: ContentTimKiemComponent
      },
      {
        path: '',
        component: ContentHomeComponent
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {
}

