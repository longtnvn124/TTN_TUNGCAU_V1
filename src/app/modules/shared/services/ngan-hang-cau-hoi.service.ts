import {Injectable} from '@angular/core';
import {getRoute} from "@env";
import {HttpClient, HttpParams} from "@angular/common/http";
import {HttpParamsHeplerService} from "@core/services/http-params-hepler.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {AuthService} from "@core/services/auth.service";
import {map, Observable} from "rxjs";
import {Dto, OvicConditionParam, OvicQueryCondition} from "@core/models/dto";
import {NganHangCauHoi} from "@shared/models/quan-ly-ngan-hang";

@Injectable({
  providedIn: 'root'
})
export class NganHangCauHoiService {
  private readonly api = getRoute('questions/');

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService,
    private auth: AuthService
  ) {
  }

  load(): Observable<NganHangCauHoi[]> {
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
      orderby: 'id',
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  create(data: any): Observable<NganHangCauHoi> {
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

  getDataByBankId(bank_id: number, search?: string, select: string = null): Observable<NganHangCauHoi[]> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      },
      {
        conditionName: 'bank_id',
        condition: OvicQueryCondition.equal,
        value: bank_id.toString(10),
        orWhere: 'and'
      }
    ];
    if (search) {
      conditions.push({
        conditionName: 'title',
        condition: OvicQueryCondition.like,
        value: `%${search}%`,
        orWhere: 'and'
      })
    }

    const fromObject = {
      paged: 1,
      limit: -1,
      orderby: 'id',
    }
    if (select) {
      fromObject['select'] = select;
    }

    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }


  getdataUnlimit(): Observable<NganHangCauHoi[]> {
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
      orderby: 'id',
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }


  getDataByBankIdString(bank_id: string): Observable<NganHangCauHoi[]> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'is_deleted',
        condition: OvicQueryCondition.equal,
        value: '0'
      },
      {
        conditionName: 'bank_id',
        condition: OvicQueryCondition.equal,
        value: bank_id,
        orWhere: 'and'
      }
    ];

    const fromObject = {
      paged: 1,
      limit: -1,
      order: "ASC"
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }


  getTestQuestions( ids? : string[] , select : string = null ) : Observable<NganHangCauHoi[]> {
    const fromObject = {
      paged      : 1 ,
      limit      : -1 ,
      include    : ids.join( ',' ) ,
      include_by : 'id'
    };
    if ( select ) {
      fromObject[ 'select' ] = select;
    }
    const params : HttpParams = new HttpParams( { fromObject } );
    return this.http.get<Dto>( this.api , { params } ).pipe( map( res => res.data ) );
  }
}
