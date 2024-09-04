import { Injectable } from '@angular/core';
import { getRoute } from '@env';
import { HttpClient , HttpParams } from '@angular/common/http';
import { HttpParamsHeplerService } from '@core/services/http-params-hepler.service';
import { Observable } from 'rxjs';
import {Dto, OrWhereCondition, OvicConditionParam, OvicQueryCondition} from '@core/models/dto';
import { map } from 'rxjs/operators';
import { IctuQueryParams } from '@core/models/ictu-query-params';

export interface TypeChart{
  canbo:[{school:string,total:number}],
  sinhvien:[{school:string,total:number}]
}
export interface NewContestant {
  id: number;
  full_name : string,
  name : string,
  phone : string,//ddien thoai
  email: string,// query chính // email
  dob : string, // ngày sinh
  sex : string,// giới tính
  school : string,// trường tham gia
  people_classify:number,//1: cán bộ,0: sinh vien
  class:string,//lớp họ(đối với sinh viên)
  units:string,// đơn vị làm việc đối với cán bộ
}

export interface EmailSender{
  name: string;//Mail xác tực tài khoản đăng ký cuộc thi.
  title:string;
  to: string;// email nhận mail
  link:string;// đường dân vaof thi
}
//content:
//Chào bạn,
// Bạn vừa đăng ký tham gia Cuoocj thi tìm hiểu 30 năm xây dun và phát triển đại học Thái Nguen .
//Ban vui lòng xác thujw email trước khi thưc hiện các bước tiếp theo, bằng cash click vào link xác thực dưới đây:
//Link xa thực:{{Link}}
// Đây là Email Tuj đông vui lòng không trả lời email này

@Injectable( {
  providedIn : 'root'
} )
export class ThiSinhService {

  private readonly api : string = getRoute( 'thisinh/' );

  constructor(
    private http : HttpClient ,
    private httpParamsHelper : HttpParamsHeplerService
  ) {
  }

  assignNewContestant( info : NewContestant ) : Observable<any> {
    return this.http.post( this.api , info );
  }

  validatePhoneContestant( phoneNumber : string ) : Observable<number> {
    const fromObject : IctuQueryParams = { paged : 1 , limit : 1 };
    const params : HttpParams          = this.httpParamsHelper.paramsConditionBuilder( [ {
      conditionName : 'phone' ,
      condition     : OvicQueryCondition.like ,
      value         : phoneNumber
    } ] , new HttpParams( { fromObject } ) );
    return this.http.get<Dto>( this.api , { params } ).pipe( map( res => res.data[ 0 ] ? res.data[ 0 ].id : 0 ) );
  }

  validateEmailcheckContestant( email : string ) : Observable<number> {
    const fromObject : IctuQueryParams = { paged : 1 , limit : 1 };
    const params : HttpParams          = this.httpParamsHelper.paramsConditionBuilder( [ {
      conditionName : 'email' ,
      condition     : OvicQueryCondition.like ,
      value         : email
    } ] , new HttpParams( { fromObject } ) );
    return this.http.get<Dto>( this.api , { params } ).pipe( map( res => res.data[ 0 ] ? res.data[ 0 ].id : 0 ) );
  }

  getDataByShiftest(id: number[]): Observable<NewContestant[]> {
    const fromObject = {
      paged: 1,
      limit:-1,
      orderby: 'name',
      order: 'ASC',
      include : id && id.length === 0?'0': id.join( ',' ) ,
      include_by : 'id'
    };
    const params: HttpParams = new HttpParams({fromObject});
    return this.http.get<Dto>(this.api, {params}).pipe(map(res => res.data));
  }
  sendEmailContestant(obj:EmailSender):Observable<any>{
    return this.http.post<Dto>( getRoute( 'thisinh/ma-xac-minh' ), obj);
  }
  getPeopleClasify():Observable<any>{
    return this.http.get<Dto>(getRoute( 'thisinh/statistic' ));
  }

  getCountDaTA():Observable<number>{
    return this.http.get<Dto>(this.api).pipe(map(res=> res.recordsTotal));
  }

  getCountData():Observable<number>{
    const conditions: OvicConditionParam[] = [

    ];
    const fromObject = {
      paged: 1,
      limit: 1,
      select:"id"
    }

    const params: HttpParams = this.httpParamsHelper.paramsConditionBuilder(conditions,new HttpParams({fromObject}));
    return this.http.get<Dto>(this.api,{params}).pipe(map(p=>p.recordsTotal));

  }
}
