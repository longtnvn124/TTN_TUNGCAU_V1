import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ShiftComponent} from "@modules/public/features/test-v2/shift/shift.component";
import {PanelComponent} from "@modules/public/features/test-v2/panel/panel.component";
import {ContestantComponent} from "@modules/public/features/test-v2/contestant/contestant.component";
import {TestGuard} from "@modules/public/features/test-v2/guards/test.guard";
import {CheckEmailComponent} from "@modules/public/features/test-v2/check-email/check-email.component";


const routes : Routes = [
  {
    path      : 'check-mail' ,
    component : CheckEmailComponent ,
    data      : { state : 'test--checkEmail' }
  } ,
  {
    path      : 'shift' ,
    component : ShiftComponent ,
    data      : { state : 'test--shift' }
  } ,
  {
    path        : 'panel' ,
    component   : PanelComponent ,
    canActivate : [ TestGuard ] ,
    data        : { state : 'test--panel' }
  } ,
  {
    path        : 'contestant' ,
    component   : ContestantComponent ,
    data        : { state : 'test--contestant' }
  } ,
  {
    path       : '**' ,
    redirectTo : 'shift' ,
    pathMatch  : 'prefix'
  }

];

@NgModule( {
  imports : [ RouterModule.forChild( routes ) ] ,
  exports : [ RouterModule ]
} )
export class TestV2RoutingModule { }
