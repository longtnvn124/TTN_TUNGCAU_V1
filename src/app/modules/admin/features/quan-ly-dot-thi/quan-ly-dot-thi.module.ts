import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuanLyDotThiRoutingModule } from './quan-ly-dot-thi-routing.module';
import { DotThiDanhSachComponent } from './dot-thi-danh-sach/dot-thi-danh-sach.component';
import { DotThiThiSinhComponent } from './dot-thi-thi-sinh/dot-thi-thi-sinh.component';
import {ButtonModule} from "primeng/button";
import {SharedModule} from "@shared/shared.module";
import {PaginatorModule} from "primeng/paginator";
import {ReactiveFormsModule} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import {RippleModule} from "primeng/ripple";
import {TableModule} from "primeng/table";
import {EditorModule} from "primeng/editor";
import {SplitterModule} from "primeng/splitter";


import {InputTextModule} from "primeng/inputtext";
import {TooltipModule} from "primeng/tooltip";
import {TestV2Module} from "@modules/public/features/test-v2/test-v2.module";
import { DotThiThongKeComponent } from './dot-thi-thi-sinh/dot-thi-thong-ke/dot-thi-thong-ke.component';
import {ChartModule} from "primeng/chart";
import { DotThiThiSinhKetQuaComponent } from './dot-thi-thi-sinh/dot-thi-thi-sinh-ket-qua/dot-thi-thi-sinh-ket-qua.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';
import VideoResize from 'quill-video-resize-module';
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/VideoResize', VideoResize);

@NgModule({
  declarations: [
    DotThiDanhSachComponent,
    DotThiThiSinhComponent,
    DotThiThongKeComponent,
    DotThiThiSinhKetQuaComponent
  ],
    imports: [
        CommonModule,
        QuanLyDotThiRoutingModule,
        ButtonModule,
        SharedModule,
        PaginatorModule,
        ReactiveFormsModule,
        CalendarModule,
        RippleModule,
        TableModule,

        EditorModule,
        SplitterModule,
        InputTextModule,
        TooltipModule,
        TestV2Module,
        ChartModule,
        MatProgressBarModule
    ]
})
export class QuanLyDotThiModule { }
