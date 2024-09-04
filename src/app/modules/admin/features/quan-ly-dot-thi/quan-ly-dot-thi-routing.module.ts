import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  NganHangCauHoiComponent
} from "@modules/admin/features/ngan-hang-cau-hoi/ngan-hang-cau-hoi/ngan-hang-cau-hoi.component";
import {NganHangDeComponent} from "@modules/admin/features/ngan-hang-cau-hoi/ngan-hang-de/ngan-hang-de.component";
import {
  DotThiThiSinhComponent
} from "@modules/admin/features/quan-ly-dot-thi/dot-thi-thi-sinh/dot-thi-thi-sinh.component";
import {
  DotThiDanhSachComponent
} from "@modules/admin/features/quan-ly-dot-thi/dot-thi-danh-sach/dot-thi-danh-sach.component";

const routes: Routes = [
  {
    path: 'danh-sach-dot-thi',
    component: DotThiDanhSachComponent,
    data: {state: 'quan-ly-dot-thi--danh-sach-dot-thi'}
  },
  {
    path: 'danh-sach-thi-sinh',
    component: DotThiThiSinhComponent,
    data: {state: 'quan-ly-dot-thi--danh-sach-thi-sinh'}
  },
  {
    path: '',
    redirectTo: 'danh-sach-doi-thi',
    pathMatch: 'prefix'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuanLyDotThiRoutingModule { }
