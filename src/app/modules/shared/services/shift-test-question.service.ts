import {Injectable} from '@angular/core';
import {getRoute} from "@env";
import {HttpClient, HttpParams} from "@angular/common/http";
import {HttpParamsHeplerService} from "@core/services/http-params-hepler.service";
import {ThemeSettingsService} from "@core/services/theme-settings.service";
import {AuthService} from "@core/services/auth.service";
import {map, Observable} from "rxjs";
import {Dto, OvicConditionParam, OvicQueryCondition} from "@core/models/dto";

export interface ShiftTestQuestion{
  id?           : number;
  shift_test_id : number;
  shift_id      ?: number;
  bank_id       : number;
  question_id   : number;
  score         : number;
  answer        : number[];
  thisinh_id    : number;
}
@Injectable({
  providedIn: 'root'
})
export class ShiftTestQuestionService {
  private readonly api = getRoute('shift-test-question/');


  constructor(
    private http: HttpClient,
    private httpParamsHelper: HttpParamsHeplerService,
    private themeSettingsService: ThemeSettingsService,
    private auth: AuthService
  ) {
  }

  load(): Observable<ShiftTestQuestion[]> {
    const conditions: OvicConditionParam[] = [];
    const fromObject = {
      paged: 1,
      limit: -1,
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  create(data: any): Observable<ShiftTestQuestion> {
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

  loaddataByShiftTestIdAndUserIdAndQuetionId(shifttest_id:number,question_id:number,user_id:number): Observable<ShiftTestQuestion[]> {
    const conditions: OvicConditionParam[] = [
      {
        conditionName:'shifttest_id',
        condition:OvicQueryCondition.equal,
        value:shifttest_id.toString(10)
      },
      {
        conditionName:'question_id',
        condition:OvicQueryCondition.equal,
        value:question_id.toString(10)
      },
      {
        conditionName:'thisinh_id',
        condition:OvicQueryCondition.equal,
        value:user_id.toString(10)
      },
    ];
    const fromObject = {
      paged: 1,
      limit: -1,
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }

  getDataByShiftTestIdsAndquestion_id(shiftTest_ids:number[],question_id?:number,thisinh_id?:number):Observable<ShiftTestQuestion[]>
  {
    const conditions: OvicConditionParam[] = [

    ];
    if (question_id || question_id != null)
    {
      conditions.push({
        conditionName:'question_id',
        condition:OvicQueryCondition.equal,
        value:question_id.toString()
      })
    }
    if (thisinh_id)
    {
      conditions.push({
        conditionName:'thisinh_id',
        condition:OvicQueryCondition.equal,
        value:thisinh_id.toString()
      })
    }

    const fromObject = {
      paged: 1,
      limit: -1,
      include:shiftTest_ids.join(','),
      include_by:'shift_test_id',
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res ? res.data : []));
  }
  getDataByShiftTestId(shiftTest_id:number,question_id?:number):Observable<ShiftTestQuestion[]>
  {
    const conditions: OvicConditionParam[] = [
      {
        conditionName:'shift_test_id',
        condition:OvicQueryCondition.equal,
        value:shiftTest_id.toString()
      }
    ];
    if(question_id){
      conditions.push({
        conditionName:'question_id',
        condition:OvicQueryCondition.equal,
        value:question_id.toString()
      })
    }


    const fromObject = {
      paged: 1,
      limit: -1,
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}).set('with', 'users'));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res ? res.data : []));
  }

  getDataByShiftIdAndQuestionId(shiftTest_id:number,question_id?:number,user_list?:number[]):Observable<ShiftTestQuestion[]>
  {
    const conditions: OvicConditionParam[] = [
      {
        conditionName:'shift_id',
        condition:OvicQueryCondition.equal,
        value:shiftTest_id.toString()
      }
    ];
    if(question_id){
      conditions.push({
        conditionName:'question_id',
        condition:OvicQueryCondition.equal,
        value:question_id.toString()
      })
    }


    const fromObject = {
      paged: 1,
      limit: -1,
      include: user_list.join(','),
      include_by: 'thisinh_id'
    }
    const params = this.httpParamsHelper.paramsConditionBuilder(conditions, new HttpParams({fromObject}).set('with', 'users'));
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res ? res.data : []));
  }

  callSocketStart(shift_id:number,question_id:number):Observable<any>{
    const fromObject = {
      shift_id:shift_id.toString(10),
      question_id:question_id.toString(10)
    }
    // const params =this.httpParamsHelper.paramsConditionBuilder([],new HttpParams({fromObject})) ;
    // const params =new HttpParams({fromObject})
    return this.http.post<Dto>(this.api +'start-test/', fromObject);
  }
  callSocketEnd(shift_id:number):Observable<any> {
    const fromObject = {
      shift_id: shift_id.toString(10),
    }
    const params =this.httpParamsHelper.paramsConditionBuilder([],new HttpParams({fromObject})) ;
    return this.http.post<Dto>(this.api + 'end-test/', fromObject);
  }

  callSocketStartTime(shift_id:number):Observable<any>{
    const fromObject = {
      shift_id: shift_id.toString(10),
    }
    return this.http.post<Dto>(this.api + 'start-time/',fromObject);
  }

}
