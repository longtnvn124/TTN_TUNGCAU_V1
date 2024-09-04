import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DiemTruyCapRoutingModule} from './diem-truy-cap-routing.module';
import {DanhSachDiemTruyCapComponent} from './danh-sach-diem-truy-cap/danh-sach-diem-truy-cap.component';
import {SharedModule} from "@shared/shared.module";
import {PaginatorModule} from "primeng/paginator";
import {ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from 'primeng/dropdown';

import {InputMaskModule} from 'primeng/inputmask';
import {DialogModule} from 'primeng/dialog';
import {EditorModule} from 'primeng/editor'
import {ContextMenuModule} from 'primeng/contextmenu';
import {ButtonModule} from "primeng/button";
import {MultiSelectModule} from 'primeng/multiselect';
import {RippleModule} from "primeng/ripple";
import {RadioButtonModule} from "primeng/radiobutton";

@NgModule({
  declarations: [
    DanhSachDiemTruyCapComponent
  ],
    imports: [
        CommonModule,
        DiemTruyCapRoutingModule,
        SharedModule,
        PaginatorModule,
        ReactiveFormsModule,
        DropdownModule,
        InputMaskModule,
        DialogModule,
        EditorModule,
        ContextMenuModule,
        MultiSelectModule,
        ButtonModule,
        RippleModule,
        RadioButtonModule
    ]
})
export class DiemTruyCapModule {
}
