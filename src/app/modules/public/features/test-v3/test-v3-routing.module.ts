import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ShiftComponent} from "@modules/public/features/test-v3/shift/shift.component";
import {PanelComponent} from "@modules/public/features/test-v3/panel/panel.component";
import {TestV3GuardGuard} from "@modules/public/features/test-v3/test-v3-guard.guard";
import {ResultComponent} from "@modules/public/features/test-v3/result/result.component";

const routes: Routes = [
  {
    path      : 'shift' ,
    canActivate:[TestV3GuardGuard],
    component : ShiftComponent ,
    data      : { state : 'test--shift' }
  } ,
  {
    path      : 'panel' ,
    component : PanelComponent ,
    data      : { state : 'test--panel' }
  } ,
  {
    path      : 'result' ,
    component : ResultComponent ,
    data      : { state : 'test--result' }
  } ,
  {
    path       : '**' ,
    redirectTo : 'shift' ,
    pathMatch  : 'prefix'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestV3RoutingModule { }
