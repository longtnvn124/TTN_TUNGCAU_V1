import { animate , keyframes , state , style , transition , trigger } from '@angular/animations';
import { Component , Output , EventEmitter , OnInit , HostListener } from '@angular/core';

interface SideNavToggle {
	screenWidth : number;
	collapsed : boolean;
}

interface NavbarData {
	routeLink : string,
	icon : string,
	label : string;
	state? : 'expanded' | 'collapse';
	children? : NavbarData[];
}

const navbarData : NavbarData[] = [
	{
		routeLink : 'dashboard' ,
		icon      : 'fa fa-home' ,
		label     : 'Dashboard'
	} ,
	{
		routeLink : 'content-none' ,
		icon      : 'fa fa-camera' ,
		label     : 'Content none'
	} ,
	{
		routeLink : '' ,
		icon      : 'fa fa-camera' ,
		label     : 'Ui Elements' ,
		children  : [
			{
				routeLink : 'ui-components/show-case' ,
				icon      : 'fa fa-angle-right' ,
				label     : 'Show case'
			} ,
			{
				routeLink : 'ui-components/area-charts' ,
				icon      : 'fa fa-angle-right' ,
				label     : 'area-charts'
			} ,
			{
				routeLink : 'ui-components/buttons' ,
				icon      : 'fa fa-angle-right' ,
				label     : 'buttons'
			}
		]
	} ,
	{
		routeLink : '' ,
		icon      : 'fa fa-cog' ,
		label     : 'Hệ thống' ,
		// state     : 'collapse' ,
		children : [
			{
				routeLink : 'he-thong/thong-tin-he-thong' ,
				icon      : 'fa fa-angle-right' ,
				label     : 'Thông tin'
			} ,
			{
				routeLink : 'he-thong/quan-ly-tai-khoan' ,
				icon      : 'fa fa-angle-right' ,
				label     : 'Tài khoản'
			} ,
			{
				routeLink : 'he-thong/quan-ly-nhom-quyen' ,
				icon      : 'fa fa-angle-right' ,
				label     : 'Nhóm quyền'
			} ,
			{
				routeLink : 'he-thong/thong-tin-tai-khoan' ,
				icon      : 'fa fa-angle-right' ,
				label     : 'My account'
			}
		]
	}
];

@Component( {
	selector    : 'app-sidenav' ,
	templateUrl : './sidenav.component.html' ,
	styleUrls   : [ './sidenav.component.css' ] ,
	animations  : [
		trigger( 'fadeInOut' , [
			transition( ':enter' , [
				style( { opacity : 0 } ) ,
				animate( '350ms' ,
					style( { opacity : 1 } )
				)
			] ) ,
			transition( ':leave' , [
				style( { opacity : 1 } ) ,
				animate( '350ms' ,
					style( { opacity : 0 } )
				)
			] )
		] ) ,
		trigger( 'rotate' , [
			transition( ':enter' , [
				animate( '1000ms' ,
					keyframes( [
						style( { transform : 'rotate(0deg)' , offset : '0' } ) ,
						style( { transform : 'rotate(2turn)' , offset : '1' } )
					] )
				)
			] )
		] ) ,
		trigger( 'menuState' , [
			state( 'collapse' , style( {
				'height'     : '0' ,
				'opacity'    : '0' ,
				'visibility' : 'hidden'
			} ) )
		] ) ,
		trigger( 'caretMenu' , [
			state( 'collapse' , style( {
				'transform' : 'rotate(-90deg)'
			} ) ) ,
			state( 'expanded' , style( {
				'transform' : 'rotate(0)'
			} ) )
		] )
	]
} )
export class SidenavComponent implements OnInit {

	@Output() onToggleSideNav : EventEmitter<SideNavToggle> = new EventEmitter();

	collapsed = true;

	screenWidth = 0;

	navData = navbarData;

	@HostListener( 'window:resize' , [ '$event' ] ) onResize( event : any ) {
		this.screenWidth = window.innerWidth;
		if ( this.screenWidth <= 768 ) {
			this.collapsed = false;
			this.onToggleSideNav.emit( { collapsed : this.collapsed , screenWidth : this.screenWidth } );
		}
	}

	ngOnInit() : void {
		this.screenWidth = window.innerWidth;
		console.log( this.collapsed );
	}


	toggleCollapse() : void {
		this.collapsed = !this.collapsed;
		this.onToggleSideNav.emit( { collapsed : this.collapsed , screenWidth : this.screenWidth } );
	}

	closeSidenav() : void {
		this.collapsed = false;
		this.onToggleSideNav.emit( { collapsed : this.collapsed , screenWidth : this.screenWidth } );
	}

	expandedChild( node : NavbarData ) {
		node.state = node.state && node.state === 'collapse' ? 'expanded' : 'collapse';
	}

}
