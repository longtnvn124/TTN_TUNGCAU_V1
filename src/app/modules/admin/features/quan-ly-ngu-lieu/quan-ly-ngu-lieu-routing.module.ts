import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  DanhSachSuKienComponent
} from "@modules/admin/features/quan-ly-ngu-lieu/danh-sach-su-kien/danh-sach-su-kien.component";
import {
  NguLieuVideoVrComponent
} from "@modules/admin/features/quan-ly-ngu-lieu/ngu-lieu-video-vr/ngu-lieu-video-vr.component";
import {
  NguLieuImageVrComponent
} from "@modules/admin/features/quan-ly-ngu-lieu/ngu-lieu-image-vr/ngu-lieu-image-vr.component";
import {
  DanhNhanLichSuComponent
} from "@modules/admin/features/quan-ly-ngu-lieu/danh-nhan-lich-su/danh-nhan-lich-su.component";

const routes: Routes = [
  {
    path: 'danh-nhan-lich-su',
    component: DanhNhanLichSuComponent,
    data: {state: 'quan-ly-ngu-lieu--danh-nhan-lich-su'}
  },
  {
    path: 'danh-sach-ngu-lieu-anh-vr',
    component: NguLieuImageVrComponent,
    data: {state: 'quan-ly-ngu-lieu--danh-sach-ngu-lieu-anh-vr'}
  },
  {
    path: 'danh-sach-ngu-lieu-video-vr',
    component:NguLieuVideoVrComponent,
    data: {state: 'quan-ly-ngu-lieu--danh-sach-ngu-lieu-video-vr'}
  },
  {
    path: 'danh-sach-su-kien',
    component: DanhSachSuKienComponent,
    data: {state: 'quan-ly-ngu-lieu--danh-sach-su-kien'}
  },

];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuanLyNguLieuRoutingModule { }
