import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevRoutingModule } from './dev-routing.module';
import { DevHomeComponent } from './dev-home/dev-home.component';
import {SharedModule} from "@shared/shared.module";
import { DevChatBotComponent } from './dev-chat-bot/dev-chat-bot.component';
import {InputTextModule} from "primeng/inputtext";
import {RippleModule} from "primeng/ripple";
import {ButtonModule} from "primeng/button";
import {InputTextareaModule} from "primeng/inputtextarea";


@NgModule({
  declarations: [
    DevHomeComponent,
    DevChatBotComponent
  ],
  imports: [
    CommonModule,
    DevRoutingModule,
    SharedModule,
    InputTextModule,
    RippleModule,
    ButtonModule,
    InputTextareaModule
  ]
})
export class DevModule { }
