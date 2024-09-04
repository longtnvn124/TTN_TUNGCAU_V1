import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ChuyenDeComponent} from "@modules/admin/features/quan-ly-chuyen-de/chuyen-de/chuyen-de.component";
const routes: Routes = [
  {
    path: 'chuyen-de',
    component: ChuyenDeComponent,
    data: {state: 'quan-ly-chuyen-de--chuyen-de'}
  },
  {
    path: '',
    redirectTo: 'chuyen-de',
    pathMatch: 'prefix'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuanLyChuyenDeRoutingModule { }
