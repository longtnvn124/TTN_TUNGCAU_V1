import {Injectable} from '@angular/core';
import {getRoute} from '@env';
import {HttpClient, HttpParams} from '@angular/common/http';
import {HttpParamsHeplerService} from '@core/services/http-params-hepler.service';
import {ShiftTests} from '@shared/models/quan-ly-doi-thi';
import {map, Observable} from 'rxjs';
import {Dto, OvicConditionParam, OvicQueryCondition} from '@core/models/dto';
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {DmDiemDiTich} from "@shared/models/danh-muc";

export interface ShiftTestScore {
  number_correct: number;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class DotThiKetQuaService {
  private readonly api = getRoute('shift-tests/');

  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService
    ) {
  }

  getShiftTestById(id: number): Observable<ShiftTests> {
    return this.http.get<Dto>(''.concat(this.api, id.toString(10))).pipe(map(res => res.data));
  }

  getShiftTest(shift_id: number, user_id: number): Observable<ShiftTests> {
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
    const params: HttpParams = this.httpParamsHelper.paramsConditionBuilder(conditions);
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data && res.data[0] ? res.data[0] : null));
  }

  createShiftTest(data: { shift_id: number, thisinh_id: number, question_ids: number[], time_start: string, time: number }): Observable<number> {
    return this.http.post<Dto>(this.api, data).pipe(map(res => res.data));
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<Dto>(''.concat(this.api, id.toString(10)), data);
  }

  // Tính điểm server
  scoreTest(id: number): Observable<ShiftTestScore> {
    return this.http.post<Dto>(''.concat(this.api, id.toString(10), '/point'), null).pipe(map(res => res.data))
  }

  getDataByShiftId(shift_id: number): Observable<ShiftTests[]> {
    const conditions: OvicConditionParam[] = [{
      conditionName: 'shift_id',
      condition: OvicQueryCondition.equal,
      value: shift_id.toString(10)
    }];
    const params: HttpParams = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams().set('with', 'users'));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  getDataByShiftIdAndWidth(shift_id: number): Observable<ShiftTests[]> {
    const conditions: OvicConditionParam[] = [{
      conditionName: 'shift_id',
      condition: OvicQueryCondition.equal,
      value: shift_id.toString(10)
    },
      {
        conditionName: 'state',
        condition: OvicQueryCondition.equal,
        value: '2',
        orWhere:'and'
    }
    ];
    const fromObject = {
      paged: 1,
      limit: 50,
      orderby: 'score',
      order: "DESC"// dieemr giarm dần
    }
    const params: HttpParams = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}).set('with', 'thisinh'));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  getDataByShiftIdAndWidthAndPage(shift_id: number, page:number): Observable<{ recordsTotal: number, data: ShiftTests[] }> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'shift_id',
        condition: OvicQueryCondition.equal,
        value: shift_id.toString(10)
      },
      {
        conditionName: 'state',
        condition: OvicQueryCondition.equal,
        value: '2',
        orWhere:'and'
      },

    ];

    // if (search) {
    //   conditions.push({
    //     conditionName: 'full_name',
    //     condition: OvicQueryCondition.like,
    //     value: `%${search}%`,
    //     orWhere: 'and'
    //   });
    // }
    const fromObject = {
      paged: page,
      limit: this.themeSettingsService.settings.rows,
      orderby: 'score',
      order: "DESC"// dieemr giarm dần
    }

    const params: HttpParams = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}).set('with', 'thisinh'));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => ({ data: res.data,recordsTotal: res.recordsFiltered  })));
  }


  getCountData():Observable<number>{
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'shift_id',
        condition: OvicQueryCondition.equal,
        value: (2).toString(10)
      },
      {
        conditionName: 'state',
        condition: OvicQueryCondition.equal,
        value: '2',
        orWhere:'and'
      },
    ];
    const fromObject = {
      paged: 1,
      limit: 1,
      orderby: 'score',
      order: "DESC",// dieemr giarm dần,
      select:"score"
    }

    const params: HttpParams = this.httpParamsHelper.paramsConditionBuilder(conditions,new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api,{params}).pipe(map(p=>p.recordsTotal));

  }


  getDataByShiftIdAndWidthAndPageAndSearch(shift_id: number, page:number, search?:string): Observable<{ recordsTotal: number, data: ShiftTests[] }> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'shift_id',
        condition: OvicQueryCondition.equal,
        value: shift_id.toString(10)
      },
      {
        conditionName: 'state',
        condition: OvicQueryCondition.equal,
        value: '2',
        orWhere:'and'
      },

    ];
    const fromObject = {
      thisinh_full_name: search && search!==null || search && search !== undefined  ? search : '',
      paged: page,
      limit: this.themeSettingsService.settings.rows,
      orderby: 'score',
      order: "DESC"// dieemr giarm dần
    }
    const params: HttpParams = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}).set('with', 'thisinh'));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => ({ data: res.data,recordsTotal: res.recordsFiltered  })));
  }

  getTotalStateBy2():Observable<number>{
    const conditions: OvicConditionParam[] = [
      {
        conditionName: 'state',
        condition: OvicQueryCondition.equal,
        value: '2'
      },


    ];
    const fromObject = {

      paged: 1,
      limit: -1, // dieemr giarm dần
      select:'id'
    }
    const params: HttpParams = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.recordsTotal));
  }

}
