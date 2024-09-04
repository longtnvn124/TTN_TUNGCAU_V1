import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  DanhSachThiSinhComponent
} from "@modules/admin/features/quan-ly-thi-sinh/danh-sach-thi-sinh/danh-sach-thi-sinh.component";

const routes: Routes = [
  {
    path:'',
    component:DanhSachThiSinhComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuanLyThiSinhRoutingModule { }
