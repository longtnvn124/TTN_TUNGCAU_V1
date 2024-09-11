import { NgModule } from '@angular/core';
import { RouterModule , Routes } from '@angular/router';
import { ModuleGuard } from '@core/guards/module.guard';
import {TestV3GuardGuard} from "@modules/public/features/test-v3/test-v3-guard.guard";

const routes : Routes = [

  {
    path         : 'admin' ,
    canActivate  : [ ModuleGuard ] ,
    loadChildren : () => import('@modules/admin/admin.module').then( m => m.AdminModule )
  } ,
  {
    path         : 'test' ,
    // loadChildren :( )=> import('@modules/public/features/test-v2/test-v2.module').then(m=>m.TestV2Module)
    // canActivate  : [TestV3GuardGuard],
    loadChildren : () => import('@modules/public/features/test-v3/test-v3.module').then( m => m.TestV3Module )
  } ,
  {
    path         : '' ,
    loadChildren : () => import('@modules/public/public.module').then( m => m.PublicModule )
  },
  // {
  //   path         : 'dev' ,
  //   loadChildren : () => import('@modules/public/features/dev/dev.module').then( m => m.DevModule )
  // },
  {
    path       : '**' ,
    redirectTo : 'test' ,
    pathMatch  : 'full'
  }
];

@NgModule( {
  imports : [ RouterModule.forRoot( routes ) ] ,
  exports : [ RouterModule ]
} )
export class AppRoutingModule {}
