import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  DanhSachDiemTruyCapComponent
} from "@modules/admin/features/diem-truy-cap/danh-sach-diem-truy-cap/danh-sach-diem-truy-cap.component";
import {HuongDanSuDungComponent} from "@modules/admin/features/tro-giup/huong-dan-su-dung/huong-dan-su-dung.component";

const routes: Routes = [
  {
    path: 'huong-dan-su-dung',
    component: HuongDanSuDungComponent,
    data: {state: 'tro-giup--huong-dan-su-dung'}
  },
  {
    path: '',
    redirectTo: 'huong-dan-su-dung',
    pathMatch: 'prefix'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TroGiupRoutingModule { }
