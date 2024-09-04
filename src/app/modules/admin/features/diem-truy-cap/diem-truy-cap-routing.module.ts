import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {
  DanhSachDiemTruyCapComponent
} from "@modules/admin/features/diem-truy-cap/danh-sach-diem-truy-cap/danh-sach-diem-truy-cap.component";

const routes: Routes = [
  {
    path: 'danh-sach-diem-truy-cap',
    component: DanhSachDiemTruyCapComponent,
    data: {state: 'diem-truy-cap--danh-sach-diem-truy-cap'}
  },
  {
    path: '',
    redirectTo: 'danh-sach-diem-truy-cap',
    pathMatch: 'prefix'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiemTruyCapRoutingModule {
}
