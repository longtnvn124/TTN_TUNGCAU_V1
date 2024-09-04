import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {NganHangCauHoiRoutingModule} from './ngan-hang-cau-hoi-routing.module';
import {NganHangCauHoiComponent} from './ngan-hang-cau-hoi/ngan-hang-cau-hoi.component';
import {NganHangDeComponent} from './ngan-hang-de/ngan-hang-de.component';
import {SharedModule} from "@shared/shared.module";
import {PaginatorModule} from "primeng/paginator";
import {ReactiveFormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {AnswerOptionGroupComponent} from './answer-option-group/answer-option-group.component';
import {CheckboxModule} from "primeng/checkbox";
import {RadioButtonModule} from "primeng/radiobutton";
import {InputTextModule} from "primeng/inputtext";
import {EditorModule} from "primeng/editor";
import {SplitterModule} from "primeng/splitter";
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module';
import VideoResize from 'quill-video-resize-module';
import { FormQuestionEditComponent } from './form-question-edit/form-question-edit.component';
import {TooltipModule} from "primeng/tooltip";

Quill.register('modules/VideoResize', VideoResize);
Quill.register('modules/imageResize', ImageResize);

@NgModule({
    declarations: [
        NganHangCauHoiComponent,
        NganHangDeComponent,
        AnswerOptionGroupComponent,
        FormQuestionEditComponent,
    ],
    exports: [
        AnswerOptionGroupComponent
    ],
  imports: [
    CommonModule,
    NganHangCauHoiRoutingModule,
    SharedModule,
    PaginatorModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    CheckboxModule,
    RadioButtonModule,
    InputTextModule,
    EditorModule,
    SplitterModule,
    TooltipModule,
  ]
})
export class NganHangCauHoiModule {
}
