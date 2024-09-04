import {Injectable} from '@angular/core';
import {getRoute} from "@env";
import {HttpClient, HttpParams} from "@angular/common/http";
import {HttpParamsHeplerService} from "@core/services/http-params-hepler.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {AuthService} from "@core/services/auth.service";
import {map, Observable} from "rxjs";
import {Dto, OvicConditionParam, OvicQueryCondition} from "@core/models/dto";
import {ChuyenDe, ChuyenDeDB} from "@shared/models/quan-ly-chuyen-de";

@Injectable({
  providedIn: 'root'
})
export class ChuyenDeService {
  private readonly api = getRoute('chuyen-de/');

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService,
    private auth: AuthService
  ) {
  }

  load(): Observable<{ recordsTotal: number, data: ChuyenDeDB[] }> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      },
    ];
    const fromObject = {
      paged: 1,
      limit: -1,
      orderby: 'title',
      order: "ASC"
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => ({
      recordsTotal: res.recordsFiltered,
      data: res.data
    })))
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
  loadDataUnlimit(): Observable<ChuyenDeDB[]> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName:'is_deleted',
        condition:OvicQueryCondition.equal,
        value:'0'
      },
    ]
    const fromObject={
      page:1,
      limit:-1,
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  loadDataUnlimitAndActive(): Observable<ChuyenDeDB[]> {
    const conditions: OvicConditionParam[] = [
      {
       conditionName:'is_deleted',
       condition:OvicQueryCondition.equal,
       value:'0'
      },
      {
        conditionName:'status',
        condition:OvicQueryCondition.equal,
        value:'1',
        orWhere:'and'
      }
    ]
    const fromObject={
      page:1,
      limit:-1,
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  loadUrlScormById(id:number):Observable<string>{
    // const url = ''.concat(this.api,'scorm/',id.toString(10));
    // return this.http.get<string>(url);
    return this.http.get<string>(''.concat(this.api,'scorm/',id.toString(10)));
  }

}
