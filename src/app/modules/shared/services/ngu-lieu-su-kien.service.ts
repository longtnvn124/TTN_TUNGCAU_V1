import { Injectable } from '@angular/core';
import {getRoute} from "@env";
import {HttpClient, HttpParams} from "@angular/common/http";
import {HttpParamsHeplerService} from "@core/services/http-params-hepler.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {AuthService} from "@core/services/auth.service";
import {map, Observable} from "rxjs";
import {SuKien} from "@shared/models/quan-ly-ngu-lieu";
import {Dto, OvicConditionParam, OvicQueryCondition} from "@core/models/dto"

@Injectable({
  providedIn: 'root'
})
export class NguLieuSuKienService {
  private readonly api = getRoute('su-kien/');
  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService,
    private auth: AuthService
  ) {
  }

  load(page:number): Observable<SuKien[]> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      },
    ];
    const fromObject = {
      paged: page,
      limit: this.themeSettingsService.settings.rows,
      orderby: 'diemditich_id',
      order: "ASC"
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  create(data: any): Observable<number> {
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

  searchData(page:number, search?: string, linhvuc?:number): Observable<{ recordsTotal: number, data: SuKien[] }> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      },
    ];
    if (search) {
      const c1: OvicConditionParam = {
        conditionName: 'title',
        condition: OvicQueryCondition.like,
        value: `%${search}%`,
        orWhere: 'and'
      };
      conditions.push(c1);
    }

    if (linhvuc) {
      const c2: OvicConditionParam = {
        conditionName: 'linhvuc',
        condition: OvicQueryCondition.equal,
        value: linhvuc.toString(10),
        orWhere: 'and'
      };
      conditions.push(c2);
    }
    const fromObject = {
      paged: page,
      limit: this.themeSettingsService.settings.rows,
      orderby: 'title',
      order: "ASC"
    }

    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => ({
      recordsTotal: res.recordsFiltered,
      data: res.data
    })));
  }

  countAllItems():Observable<number>{
    const fromObject = {
      paged: 1,
      limit: 1,
      select: 'id'
    }
    const params = new HttpParams({fromObject});
    return this.http.get<Dto>(''.concat(this.api), {params}).pipe(map(res => res.recordsFiltered));
  }
  getAllData(search?:string):Observable<SuKien[]>{
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      },
    ];
    if (search) {
      const c1: OvicConditionParam = {
        conditionName: 'title',
        condition: OvicQueryCondition.like,
        value: `%${search}%`,
        orWhere: 'and'
      };
      conditions.push(c1);
    }


    const fromObject = {
      paged: 1,
      limit: -1,
      orderby: 'title',
      order: "ASC"
    }

    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  getDataBylinhvucAndRoot(linhvuc_id?: number):Observable<SuKien[]>{
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      },
      {
        conditionName: 'root',
        condition: OvicQueryCondition.equal,
        value: '1',
        orWhere:'and'
      },

    ];

    if(linhvuc_id){
      conditions.push({
        conditionName: 'linhvuc',
        condition: OvicQueryCondition.equal,
        value: linhvuc_id.toString(10),
        orWhere:'and'
      })
    }
    const fromObject = {
      paged: 1,
      limit: -1,
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }
}
