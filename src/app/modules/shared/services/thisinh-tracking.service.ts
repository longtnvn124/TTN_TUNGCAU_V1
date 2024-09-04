import { Injectable } from '@angular/core';
import {getRoute} from "@env";
import {HttpClient, HttpParams} from "@angular/common/http";
import {HttpParamsHeplerService} from "@core/services/http-params-hepler.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {AuthService} from "@core/services/auth.service";
import {map, Observable} from "rxjs";
import {Dto, OvicConditionParam, OvicQueryCondition} from "@core/models/dto";

export interface ThiSinhTracking{
  thisinh_id:number,
  shift_id:number,
  content_changes:string,
  type_check:number
}
@Injectable({
  providedIn: 'root'
})
export class ThisinhTrackingService {
  private readonly api = getRoute('thisinh-tracking/');

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
  ) {}

  getdataTracking(shift_id:number, user_id:number):Observable<ThiSinhTracking[]>{
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'thisinh_id',
        condition: OvicQueryCondition.equal,
        value: user_id.toString(10)
      },
      {
        conditionName: 'shift_id',
        condition: OvicQueryCondition.equal,
        value: shift_id.toString(10),
        orWhere: 'and'
      }
    ];
    const fromObject = {
      paged: 1,
      limit: -1,
      orderby: 'id',
      // order: 'ASC'
    };
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data ));
  }

  createTracking(data:ThiSinhTracking):Observable<number>{
    return this.http.post<Dto>(this.api,data).pipe(map(res=>res.data));
  }


}
