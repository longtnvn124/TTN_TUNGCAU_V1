import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestV3RoutingModule } from './test-v3-routing.module';
import { ShiftComponent } from './shift/shift.component';
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import { PanelComponent } from '@modules/public/features/test-v3/panel/panel.component';
import {DialogModule} from "primeng/dialog";
import {SharedModule} from "@shared/shared.module";
import {TabViewModule} from "primeng/tabview";
import { PannelByMcComponent } from './pannel-by-mc/pannel-by-mc.component';
import { PannelByContestantComponent } from './pannel-by-contestant/pannel-by-contestant.component';
import {GroupsRadioComponent} from "@modules/public/features/test-v3/panel/groups-radio/groups-radio.component";
import {TableModule} from "primeng/table";
import {TestV2Module} from "@modules/public/features/test-v2/test-v2.module";
import {SplitterModule} from "primeng/splitter";
import { ResultComponent } from './result/result.component';


@NgModule({
  declarations: [
    ShiftComponent,
    PanelComponent,
    PannelByMcComponent,
    PannelByContestantComponent,
    ResultComponent
  ],
  imports: [
    CommonModule,
    TestV3RoutingModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    SharedModule,
    TabViewModule,
    GroupsRadioComponent,
    TableModule,
    TestV2Module,
    SplitterModule,
  ]
})
export class TestV3Module { }
