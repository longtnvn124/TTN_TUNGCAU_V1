import { Injectable } from '@angular/core';
import { getRoute } from '@env';
import { HttpClient , HttpParams } from '@angular/common/http';
import { HttpParamsHeplerService } from '@core/services/http-params-hepler.service';
import { ThemeSettingsService } from '@core/services/theme-settings.service';
import { AuthService } from '@core/services/auth.service';
import { Observable } from 'rxjs';
import { Dto , OvicConditionParam , OvicQueryCondition } from '@core/models/dto';
import { map } from 'rxjs/operators';
import { DataPermission } from '@shared/models/data-permission';

@Injectable( {
	providedIn : 'root'
} )
export class DataPermissionService {

	private readonly api = getRoute( 'data-permissions/' );

	constructor(
		private http : HttpClient ,
		private httpParamsHelper : HttpParamsHeplerService ,
		private themeSettingsService : ThemeSettingsService ,
		private auth : AuthService
	) { }

	create( data : any ) : Observable<number> {
		data[ 'created_by' ] = this.auth.user.id;
		return this.http.post<Dto>( this.api , data ).pipe( map( res => res.data ) );
	}

	update( id : number , data : any ) : Observable<any> {
		return this.http.put<Dto>( ''.concat( this.api , id.toString( 10 ) ) , data );
	}

	delete( id : number ) : Observable<any> {
		return this.http.delete<Dto>( ''.concat( this.api , id.toString( 10 ) ) );
	}

	loadALl( user_donvi_id : number ) : Observable<DataPermission[]> {
		const conditions : OvicConditionParam[] = [
			{
				conditionName : 'user_donvi_id' ,
				condition     : OvicQueryCondition.equal ,
				value         : user_donvi_id.toString( 10 )
			}
		];
		const fromObject                        = { paged : 1 , limit : -1 };
		const params                            = this.httpParamsHelper.paramsConditionBuilder( conditions , new HttpParams( { fromObject } ) );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( res => res.data ) );
	}

	load( user_donvi_id : number , options? : { paged? : number, limit? : number } ) : Observable<{ recordsTotal : number, data : DataPermission[] }> {
		const conditions : OvicConditionParam[] = [
			{
				conditionName : 'user_donvi_id' ,
				condition     : OvicQueryCondition.equal ,
				value         : user_donvi_id.toString( 10 )
			}
		];

		const fromObject = {
			paged : 1 ,
			limit : this.themeSettingsService.settings.rows
		};
		if ( options ) {
			Object.assign( fromObject , options );
		}
		const params = this.httpParamsHelper.paramsConditionBuilder( conditions , new HttpParams( { fromObject } ) );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( res => ( { recordsTotal : res.recordsFiltered , data : res.data } ) ) );
	}


	/**
	 * loadDataFromDonViIds
	 * Load data permission theo đơn vị id
	 * @param user_donvi_id - id của đơn vị chủ quản
	 * @param donvi_id - id của đơn vị trình
	 * @return DataPermission[]
	 * */
	loadDataFromDonViIds( user_donvi_id : number , donvi_id : number[] ) : Observable<DataPermission[]> {
		const conditions : OvicConditionParam[] = [ {
			conditionName : 'user_donvi_id' ,
			condition     : OvicQueryCondition.equal ,
			value         : user_donvi_id.toString( 10 ) ,
			orWhere       : 'and'
		} ];

		const fromObject = { limit : -1 , include : donvi_id.join( ',' ) , include_by : 'donvi_id' };
		const params     = this.httpParamsHelper.paramsConditionBuilder( conditions , new HttpParams( { fromObject } ) );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( res => res.data ) );
	}

}
