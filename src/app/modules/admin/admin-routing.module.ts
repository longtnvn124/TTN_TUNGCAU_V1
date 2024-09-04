import { NgModule } from '@angular/core';
import { RouterModule , Routes } from '@angular/router';
import { ContentNoneComponent } from '@modules/admin/features/content-none/content-none.component';
import { DashboardComponent } from '@modules/admin/dashboard/dashboard.component';
import { AdminGuard } from '@core/guards/admin.guard';
import {HomeComponent} from "@modules/admin/features/home/home.component";

const routes : Routes = [
	{
		path             : '' ,
		component        : DashboardComponent ,
		canActivateChild : [ AdminGuard ] ,
		children         : [
			{
				path       : '' ,
				redirectTo : 'dashboard' ,
				pathMatch  : 'prefix'
			} ,
			{
				path      : 'dashboard' ,
				component : HomeComponent ,
				data      : { state : 'dashboard' }
			} ,
			{
				path      : 'content-none' ,
				component : ContentNoneComponent ,
				data      : { state : 'content-none' }
			} ,
			{
				path         : 'he-thong' ,
				loadChildren : () => import('@modules/admin/features/he-thong/he-thong.module').then( m => m.HeThongModule )
			} ,
			{
				path         : 'danh-muc' ,
				loadChildren : () => import('@modules/admin/features/danh-muc/danh-muc.module').then( m => m.DanhMucModule )
			} ,
			{
				path         : 'message' ,
				loadChildren : () => import('@modules/admin/features/ovic-message/ovic-message.module').then( m => m.OvicMessageModule )
			} ,
			{
				path         : 'quan-ly-ngu-lieu' ,
				loadChildren : () => import('@modules/admin/features/quan-ly-ngu-lieu/quan-ly-ngu-lieu.module').then( m => m.QuanLyNguLieuModule )
			} ,
			{
				path         : 'ngan-hang-cau-hoi' ,
				loadChildren : () => import('@modules/admin/features/ngan-hang-cau-hoi/ngan-hang-cau-hoi.module').then( m => m.NganHangCauHoiModule )
			} ,
			{
				path         : 'quan-ly-dot-thi' ,
				loadChildren : () => import('@modules/admin/features/quan-ly-dot-thi/quan-ly-dot-thi.module').then( m => m.QuanLyDotThiModule )
			} ,
      {
        path         : 'diem-truy-cap' ,
        loadChildren : () => import('@modules/admin/features/diem-truy-cap/diem-truy-cap.module').then( m => m.DiemTruyCapModule )
      } ,
      {
        path         : 'quan-ly-chuyen-de' ,
        loadChildren : () => import('@modules/admin/features/quan-ly-chuyen-de/quan-ly-chuyen-de.module').then( m => m.QuanLyChuyenDeModule )
      } ,
			{
				path         : 'tro-giup' ,
				loadChildren : () => import('@modules/admin/features/tro-giup/tro-giup.module').then( m => m.TroGiupModule )
			} ,
      {
        path         : 'quan-ly-thi-sinh' ,
        loadChildren : () => import('@modules/admin/features/quan-ly-thi-sinh/quan-ly-thi-sinh.module').then( m => m.QuanLyThiSinhModule )
      } ,
			{
				path       : '**' ,
				redirectTo : '/admin/dashboard' ,
				pathMatch  : 'prefix'
			}
		]
	}
];

@NgModule( {
	imports : [ RouterModule.forChild( routes ) ] ,
	exports : [ RouterModule ]
} )
export class AdminRoutingModule {}
