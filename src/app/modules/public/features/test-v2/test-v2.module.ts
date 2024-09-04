import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GroupsRadioComponent} from "@modules/public/features/test-v2/panel/groups-radio/groups-radio.component";
import {RippleModule} from "primeng/ripple";
import {InputMaskModule} from "primeng/inputmask";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {TestV2RoutingModule} from "@modules/public/features/test-v2/test-v2-routing.module";
import {ContestantComponent} from "@modules/public/features/test-v2/contestant/contestant.component";
import {PanelComponent} from "@modules/public/features/test-v2/panel/panel.component";
import {ShiftComponent} from "@modules/public/features/test-v2/shift/shift.component";
import {SharedModule} from "@shared/shared.module";
import { CheckEmailComponent } from './check-email/check-email.component';
import {DropdownModule} from "primeng/dropdown";
import {TabViewModule} from "primeng/tabview";


@NgModule({
  declarations: [
    ShiftComponent ,
    PanelComponent ,
    GroupsRadioComponent ,
    ContestantComponent,
    CheckEmailComponent
  ],
  exports: [
    GroupsRadioComponent
  ] ,
  imports: [
    CommonModule,
    TestV2RoutingModule,
    RippleModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule,
    InputMaskModule,
    SharedModule,
    DropdownModule,
    TabViewModule
  ]
})
export class TestV2Module { }
