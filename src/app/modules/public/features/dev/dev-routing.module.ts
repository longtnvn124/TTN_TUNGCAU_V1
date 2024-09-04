import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ShiftComponent} from "@modules/public/features/test-v2/shift/shift.component";
import {DevHomeComponent} from "@modules/public/features/dev/dev-home/dev-home.component";
import {DevChatBotComponent} from "@modules/public/features/dev/dev-chat-bot/dev-chat-bot.component";

const routes: Routes = [
  {
    path      : 'home' ,
    component : DevHomeComponent ,
    data      : { state : 'dev--home' }
  } ,
  {
    path      : 'chat-bot' ,
    component : DevChatBotComponent ,
    data      : { state : 'dev--chat-bot' }
  } ,
  {
    path       : '**' ,
    redirectTo : 'home' ,
    pathMatch  : 'prefix'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevRoutingModule { }
