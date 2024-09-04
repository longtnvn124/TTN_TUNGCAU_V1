import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuanLyThiSinhRoutingModule } from './quan-ly-thi-sinh-routing.module';
import { DanhSachThiSinhComponent } from './danh-sach-thi-sinh/danh-sach-thi-sinh.component';


@NgModule({
  declarations: [
    DanhSachThiSinhComponent
  ],
  imports: [
    CommonModule,
    QuanLyThiSinhRoutingModule
  ]
})
export class QuanLyThiSinhModule { }
