import { NgModule } from '@angular/core';
import { RouterModule , Routes } from '@angular/router';
import { QuanLyTaiKhoanComponent } from './quan-ly-tai-khoan/quan-ly-tai-khoan.component';
import { ThongTinTaiKhoanComponent } from './thong-tin-tai-khoan/thong-tin-tai-khoan.component';
import { ThongTinHeThongComponent } from './thong-tin-he-thong/thong-tin-he-thong.component';
import { PhanQuyenDuLieuComponent } from '@modules/admin/features/he-thong/phan-quyen-du-lieu/phan-quyen-du-lieu.component';

const routes : Routes = [
	{
		path      : 'quan-ly-tai-khoan' ,
		component : QuanLyTaiKhoanComponent ,
		data      : { state : 'he-thong--quan-ly-tai-khoan' }
	} ,
	{
		path      : 'thong-tin-tai-khoan' ,
		component : ThongTinTaiKhoanComponent ,
		data      : { state : 'he-thong--thong-tin-tai-khoan' }
	} ,
	{
		path      : 'thong-tin-he-thong' ,
		component : ThongTinHeThongComponent ,
		data      : { state : 'he-thong--thong-tin-he-thong' }
	} ,
	{
		path      : 'phan-quyen-du-lieu' ,
		component : PhanQuyenDuLieuComponent ,
		data      : { state : 'he-thong--phan-quyen-du-lieu' }
	}
];

@NgModule( {
	imports : [ RouterModule.forChild( routes ) ] ,
	exports : [ RouterModule ]
} )
export class HeThongRoutingModule {}
