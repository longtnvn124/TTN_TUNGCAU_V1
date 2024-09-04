import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowSvgComponent } from './show-svg/show-svg.component';
import { SvgLoaderDirective } from './directives/svg-loader.directive';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule( {
	declarations : [
		ShowSvgComponent ,
		SvgLoaderDirective
	] ,
	exports : [
		ShowSvgComponent ,
		SvgLoaderDirective
	] ,
	imports : [
		CommonModule ,
		SharedModule ,
		ReactiveFormsModule
	]
} )
export class OvicSvgModule {}
