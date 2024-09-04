import {Injectable} from '@angular/core';
import {getRoute} from "@env";
import {NganHangDe} from "@shared/models/quan-ly-ngan-hang";
import {map, Observable} from 'rxjs';
import {HttpClient, HttpParams} from "@angular/common/http";
import {HttpParamsHeplerService} from "@core/services/http-params-hepler.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {AuthService} from "@core/services/auth.service";
import {Dto, OvicConditionParam, OvicQueryCondition} from '@core/models/dto';

@Injectable({
  providedIn: 'root'
})
export class NganHangDeService {
  private readonly api = getRoute('bank-questions/');

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService,
    private auth: AuthService
  ) {
  }

  load(page: number, search?: string): Observable<{ recordsTotal: number, data: NganHangDe[] }> {
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
        orWhere: "and"
      })
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
    })))

  }

  create(data: any): Observable<NganHangDe> {
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

  getDataUnlimit(): Observable<NganHangDe[]> {
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
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  getDataById(id: number): Observable<NganHangDe> {
    return this.http.get<Dto>(''.concat(this.api, id.toString(10))).pipe(map(res => res.data));
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
}
