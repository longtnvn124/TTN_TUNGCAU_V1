import {Injectable} from '@angular/core';
import {getDateTime} from "@env";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export interface DateTimeServer {
  date: string,
  timestamps: number
}


@Injectable({
  providedIn: 'root'
})
export class ServerTimeService {
  constructor(
    private http: HttpClient
  ) {
  }

  getTime(): Observable<DateTimeServer> {
    return this.http.get<DateTimeServer>(getDateTime());
  }
}
