import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  NganHangCauHoiComponent
} from "@modules/admin/features/ngan-hang-cau-hoi/ngan-hang-cau-hoi/ngan-hang-cau-hoi.component";
import {NganHangDeComponent} from "@modules/admin/features/ngan-hang-cau-hoi/ngan-hang-de/ngan-hang-de.component";

const routes: Routes = [
  {
    path: 'ngan-hang-cau-hoi',
    component: NganHangCauHoiComponent,
    data: {state: 'ngan-hang-cau-hoi--ngan-hang-cau-hoi'}
  },
  {
    path: 'ngan-hang-de',
    component: NganHangDeComponent,
    data: {state: 'ngan-hang-cau-hoi--ngan-hang-de'}
  },
  {
    path: '',
    redirectTo: 'ngan-hang-de',
    pathMatch: 'prefix'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NganHangCauHoiRoutingModule { }
