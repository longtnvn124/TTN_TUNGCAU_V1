import { Component , OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/user.service';
import { DataPermissionService } from '@shared/services/data-permission.service';
import { DataPermission , DataPermissionAdvance , ExpertStaff } from '@shared/models/data-permission';
import { DonViService , QueryChildrenParam } from '@shared/services/don-vi.service';
import { FormBuilder , FormGroup } from '@angular/forms';
import { UnsubscribeOnDestroy } from '@core/utils/decorator';
import { debounceTime , forkJoin , Observable , of , Subject , Subscription , switchMap } from 'rxjs';
import { map , tap } from 'rxjs/operators';
import { ROLES } from '@env';
import { DonVi } from '@shared/models/danh-muc';
import { ThemeSettingsService } from '@core/services/theme-settings.service';
import { NgPaginateEvent } from '@shared/models/ovic-models';
import { MatMenu } from '@angular/material/menu';

type FilterOption = {
	value : number;
	label : string;
}

@UnsubscribeOnDestroy()
@Component( {
	selector    : 'app-phan-quyen-du-lieu' ,
	templateUrl : './phan-quyen-du-lieu.component.html' ,
	styleUrls   : [ './phan-quyen-du-lieu.component.css' ]
} )
export class PhanQuyenDuLieuComponent implements OnInit {

	defaultUserOptions : FilterOption[] = [
		{ value : -1 , label : 'Tất cả đơn vị' } ,
		{ value : 0 , label : 'Chưa có chuyên viên phụ trách' }
	];

	defaultGroupOptions : FilterOption[] = [
		{ value : 0 , label : 'Tất cả khối, cụm' } ,
		{ value : -1 , label : 'Không thuộc khối cụm nào' }
	];

	userOptions : FilterOption[];

	groupOptions : FilterOption[];

	formSearch : FormGroup;

	subscription : Subscription;

	private readonly OBSERVER_DELETE_DATA_PERMISSION$ = new Subject<number>();

	employeeMap : Map<number , ExpertStaff>;

	employeeList : ExpertStaff[] = [];

	isLoading = true;

	error = false;

	recordsTotal = 0;

	rows = 20;

	page = 1;

	tblIndex = 1;

	dataPermission : DataPermission[];

	dataPermissionAdvance : DataPermissionAdvance[];

	agencies : DonVi[];

	selectedAllValues : number[];

	selectedValues : number[];

	defaultFilterParams : QueryChildrenParam = Object.seal( {
		limit   : this.themeSettingsService.settings.rows ,
		orderby : 'title' ,
		order   : 'ASC' ,
		select   : 'id,title,parent_id,status'
	} );

	filterParams : QueryChildrenParam;

	constructor(
		private auth : AuthService ,
		private notificationService : NotificationService ,
		private fb : FormBuilder ,
		private dataPermissionService : DataPermissionService ,
		private donViService : DonViService ,
		private themeSettingsService : ThemeSettingsService ,
		private userService : UserService
	) {
		this.filterParams = this.defaultFilterParams;
		this.subscription = new Subscription();
		this.userOptions  = this.defaultUserOptions;
		this.groupOptions = this.defaultGroupOptions;
		this.formSearch   = this.fb.group( {
			fromGroup : [ 0 ] ,
			fromUser  : [ -1 ]
		} );
		this.formSearch.get( 'fromUser' ).valueChanges.subscribe( ( user_id : number ) => {
			if ( user_id ) {
				if ( user_id === -1 ) {
					// userId = -1 => Lọc theo tất cả cá chuyên viên ( remove all filter)
					this.filterParams = this.defaultFilterParams;
				} else {
					// userId > 0 => Lọc những đơn vị có userId đảm nhiệm
					const ids         = this.dataPermissionAdvance.filter( p => p.user_id === user_id ).map( c => c.donvi_id );
					this.filterParams = Object.assign( {
						include    : ids && ids.length ? ids.join( ',' ) : '0' ,
						include_by : 'id'
					} , this.defaultFilterParams );
				}
			} else {
				// userId = 0 => Lọc những đơn vị chưa có chuyên viên đảm nhiệm
				const ids         = this.dataPermissionAdvance.map( c => c.donvi_id );
				this.filterParams = Object.assign( {
					exclude    : ids && ids.length ? [ ... new Set( ids ) ].join( ',' ) : '0' ,
					exclude_by : 'id'
				} , this.defaultFilterParams );
			}
			this.loadData( 1 );
		} );
		// this.formSearch.get( 'fromGroup' ).valueChanges.subscribe( () => this.loadData( 1 ) );
		this.rows                         = this.themeSettingsService.settings.rows;
		const observeDeleteDataPermission = this.OBSERVER_DELETE_DATA_PERMISSION$.asObservable().pipe( debounceTime( 100 ) ).subscribe( id => this.deleteDataPermission( id ) );
		this.subscription.add( observeDeleteDataPermission );
	}

	ngOnInit() : void {
		this.loadData( 1 );
	}

	get observeLoadNewDataPermissions$() : Observable<DataPermission[]> {
		return this.dataPermissionService.loadALl( this.auth.userDonViId ).pipe( tap( dataPermission => this.dataPermission = dataPermission ) );
	}


	/**
	 * just load once
	 * Chỉ load lần đầu, những thay đổi sau này chỉ ở bảng data_permission
   *
	 * */
	get loadEmployees$() : Observable<Map<number , ExpertStaff>> {
		return this.employeeMap ? of( this.employeeMap ) : this.userService.queryUserByRoleIds( this.auth.userDonViId , [ ROLES.chuyen_vien.id ] , { select : 'id,display_name,avatar,phone' } ).pipe( map( ( employees : ExpertStaff[] ) => {
			this.employeeMap  = employees.reduce( ( collector , staff ) => collector.set( staff.id , staff ) , new Map<number , ExpertStaff> );
			this.userOptions  = [].concat( this.defaultUserOptions , employees.map( ( { id , display_name } ) => ( { value : id , label : display_name } ) ) );
			this.employeeList = employees;
			return this.employeeMap;
		} ) );
	}

	get loadDataPermissions$() : Observable<DataPermission[]> {
		return this.dataPermission ? of( this.dataPermission ) : this.observeLoadNewDataPermissions$;
	}

	get preload() : Observable<DataPermissionAdvance[]> {
		return this.dataPermissionAdvance ? of( this.dataPermissionAdvance ) : this.reBuildDataPermissionAdvance( false );
	}

	reBuildDataPermissionAdvance( forceReload = false ) : Observable<DataPermissionAdvance[]> {
		const loadDataPermissions$ : Observable<DataPermission[]> = forceReload ? this.observeLoadNewDataPermissions$ : this.loadDataPermissions$;
		return forkJoin<[ Map<number , ExpertStaff> , DataPermission[] ]>( [ this.loadEmployees$ , loadDataPermissions$ ] ).pipe( map( ( [ employeesMap , dataPermissions ] ) => {
			this.dataPermissionAdvance = dataPermissions.map( pms => {
				pms[ 'employee' ] = pms.user_id && employeesMap.has( pms.user_id ) ? employeesMap.get( pms.user_id ) : null;
				return pms;
			} );
			return this.dataPermissionAdvance;
		} ) );
	}

	private loadData( paged : number ) {
		this.isLoading = true;
		const options  = Object.assign( { paged } , this.filterParams );
		this.preload.pipe( switchMap( dataPermission => this.__loadAgencies( dataPermission , options ) ) ).subscribe( {
			next  : ( { recordsTotal , data } ) => {
				this.recordsTotal = recordsTotal;
				this.tblIndex     = ( this.page * Math.max( this.rows , 1 ) ) - Math.max( this.rows , 1 ) + 1;
				this.agencies     = data;
				this.isLoading    = false;
				this.error        = false;
			} ,
			error : () => {
				this.isLoading = false;
				this.error     = true;
			}
		} );
	}

	private __loadAgencies( dataPermissionAdvance : DataPermissionAdvance[] , options : QueryChildrenParam ) : Observable<{ recordsTotal : number, data : DonVi[] }> {
		return this.donViService.queryChildren( this.auth.userDonViId , options ).pipe( map( ( { recordsTotal , data } ) => ( { recordsTotal , data : this.__attachDataPermissionToAgencies( dataPermissionAdvance , data ) } ) ) );
	}

	private __attachDataPermissionToAgencies( dataPermission : DataPermissionAdvance[] , data : DonVi[] ) : DonVi[] {
		return data.map( agency => {
			agency[ '__data_permission' ] = dataPermission.filter( p => p.donvi_id === agency.id );
			return agency;
		} );
	}

	reloadData( event : Event ) {
		event.preventDefault();
		this.loadData( this.page );
	}

	paginate( { page } : NgPaginateEvent ) {
		this.page     = page + 1;
		this.tblIndex = ( this.page * Math.max( this.rows , 1 ) ) - Math.max( this.rows , 1 ) + 1;
		this.loadData( this.page );
	}

	eventCheckAll( selected : number[] ) {
		if ( !!( selected.length ) ) {
			this.selectedValues = this.agencies.reduce( ( collector , { id } ) => {
				collector.push( id );
				return collector;
			} , new Array<number>() );
		} else {
			this.selectedValues = [];
		}
	}

	preventCloseMenu( event : Event ) {
		event.preventDefault();
		event.stopPropagation();
	}

	chooseEmployeeRecord( { id } : ExpertStaff , menu : MatMenu ) {
		menu.closed.emit( 'click' );
		if ( this.selectedValues && this.selectedValues.length ) {
			this.isLoading = true;
			this.submitNewDataPermission( id , this.selectedValues ).pipe( switchMap( ( success ) => this.reBuildDataPermissionAdvance( true ).pipe( map( ( dataPermissionAdvance ) => ( { success , agencies : this.__attachDataPermissionToAgencies( dataPermissionAdvance , this.agencies ) } ) ) ) ) ).subscribe( {
				next  : ( { success , agencies } ) => {
					this.agencies          = agencies;
					this.selectedAllValues = [];
					this.selectedValues    = [];
					this.isLoading         = false;
					if ( success ) {
						this.notificationService.toastSuccess( 'Cập nhật thành công' );
					} else {
						this.notificationService.toastError( 'Kết nối với máy chủ không thành công' );
					}
				} ,
				error : () => {
					this.selectedAllValues = [];
					this.selectedValues    = [];
					this.isLoading         = false;
					this.error             = true;
					this.notificationService.toastError( 'Mất kết nối với máy chủ' );
				}
			} );
		}
	}

	submitNewDataPermission( user_id : number , ids : number[] ) : Observable<boolean> {
		const user_donvi_id = this.auth.userDonViId;
		const created_by    = this.auth.user.id;
		const maxLoop       = ids.length;
		let counter         = 0;
		let error           = false;
		return new Observable<any>( subscriber => {
			ids.forEach( ( donvi_id , index ) =>
				setTimeout( () => this.dataPermissionService.create( { user_id , user_donvi_id , created_by , donvi_id } ).subscribe( {
					next  : () => {
						if ( ++counter === maxLoop ) {
							subscriber.next( !error );
						}
					} ,
					error : () => {
						error = true;
						if ( ++counter === maxLoop ) {
							subscriber.next( false );
						}
					}
				} ) , index * 100 )
			);
		} );
	}

	async deleteDataPermission( id : number ) {
		const confirm = await this.notificationService.confirmDelete();
		if ( confirm ) {
			this.isLoading = true;
			this.dataPermissionService.delete( id ).subscribe( {
				next  : () => {
					this.isLoading      = false;
					this.dataPermission = this.dataPermission.filter( u => u.id !== id );
					this.agencies       = this.agencies.map( a => {
						a[ '__data_permission' ] = a[ '__data_permission' ].filter( u => u.id !== id );
						return a;
					} );
					this.notificationService.toastSuccess( 'Thao tác thành công' );
				} ,
				error : () => {
					this.isLoading = false;
					this.notificationService.toastError( 'Mất kết nối với máy chủ' );
				}
			} );
		}
	}

	// prevent dblclick
	needDeleteDataPermission( id : number ) {
		this.OBSERVER_DELETE_DATA_PERMISSION$.next( id );
	}
}
