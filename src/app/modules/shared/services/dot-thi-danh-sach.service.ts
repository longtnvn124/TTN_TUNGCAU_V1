import {Injectable} from '@angular/core';
import {getRoute} from '@env';
import {HttpClient, HttpParams} from '@angular/common/http';
import {HttpParamsHeplerService} from '@core/services/http-params-hepler.service';
import {ThemeSettingsService} from '@core/services/theme-settings.service';
import {AuthService} from '@core/services/auth.service';
import {map, Observable} from 'rxjs';

import {Dto, OvicConditionParam, OvicQueryCondition} from '@core/models/dto';
import {Shift} from '@shared/models/quan-ly-doi-thi';
import {IctuQueryParams} from '@core/models/ictu-query-params';

@Injectable({
  providedIn: 'root'
})
export class DotThiDanhSachService {

  private readonly api = getRoute('shift/');

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService,
    private auth: AuthService
  ) {
  }

  load(page: number, search?: string): Observable<{ recordsTotal: number, data: Shift[] }> {

    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      }
    ];
    if (search) {
      conditions.push({
        conditionName: 'title',
        condition: OvicQueryCondition.like,
        value: `%${search}%`,
        orWhere: 'and'
      });
    }
    const fromObject = {
      paged: page,
      limit: this.themeSettingsService.settings.rows,
      orderby: 'title',
      order: 'ASC'
    };
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => ({
      recordsTotal: res.recordsFiltered,
      data: res.data
    })));
  }

  create(data: any): Observable<Shift> {
    data['created_by'] = this.auth.user.id;
    return this.http.post<Dto>(this.api, data).pipe(map(res => res.data));
  }

  update(id: number, data: any): Observable<any> {
    data['updated_by'] = this.auth.user.id;
    return this.http.put<Dto>(''.concat(this.api, id.toString(10)), data);
  }

  delete(id: number): Observable<any> {
    const is_deleted = 1;
    const deleted_by = this.auth.user.id;
    return this.update(id, {is_deleted, deleted_by});
  }

  getDotthiByStatusActive(): Observable<Shift[]> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      },
      {
        conditionName: 'status',
        condition: OvicQueryCondition.equal,
        value: '1',
        orWhere: 'and'
      }
    ];
    const fromObject = {
      paged: 1,
      limit: -1,
      orderby: 'title',
      order: 'ASC'
    };
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  listActivatedShifts(configs: { with?: string, orderby?: string, order?: string } = null): Observable<Shift[]> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      },
      {
        conditionName: 'status',
        condition: OvicQueryCondition.equal,
        value: '1',
        orWhere: 'and'
      }
    ];
    const fromObject: IctuQueryParams = {paged: 1, limit: -1, orderby: 'time_start', order: 'ASC'};

    if (configs) {
      Object.assign(fromObject, configs);
    }
    const params: HttpParams = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  getDataById(id: number): Observable<Shift> {
    return this.http.get<Dto>(''.concat(this.api, id.toString(10))).pipe(map(res => res.data));
  }

  countAllItems(): Observable<number> {
    const fromObject = {
      paged: 1,
      limit: 1,
      select: 'id'
    };
    const params = new HttpParams({fromObject});
    return this.http.get<Dto>(''.concat(this.api), {params}).pipe(map(res => res.recordsFiltered));
  }

  getdataUnlimit(): Observable<Shift[]> {
    const fromObject = {
      paged: 1,
      limit: -1,
      orderby: 'title',
      order: 'ASC'
    };
    const params = new HttpParams({fromObject});
    return this.http.get<Dto>(''.concat(this.api), {params}).pipe(map(res => res.data));
  }

  getDataByStatusAndSearch(page: number, search?:string, date?:string): Observable<{ recordsTotal: number, data: Shift[] }> {

    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      },
    ];
    if (search) {
      conditions.push({
        conditionName: 'title',
        condition: OvicQueryCondition.like,
        value: `%${search}%`,
        orWhere: 'and'
      });
    }
    if (date) {
      let time = new Date(date);
      conditions.push({
        conditionName: 'time_end',
        condition: OvicQueryCondition.lessThanOrEqualsTo,
        value: date,
        orWhere: 'and'
      });
    }
    const fromObject = {
      paged: page,
      limit: this.themeSettingsService.settings.rows,
      orderby: 'title',
      order: 'ASC'
    };
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => ({
      recordsTotal: res.recordsFiltered,
      data: res.data
    })));
  }
  getDataByBankId(bankid:number):Observable<Shift[]>{
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'bank_id',
        condition: OvicQueryCondition.equal,
        value: bankid.toString(10),
      },
    ];
    const fromObject = {
      paged: 1,
      limit: -1,
      orderby: 'title',
      order: 'ASC'
    };
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

}
