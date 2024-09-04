import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MobileSearchService {

  private textsearch = new BehaviorSubject<string>('');
  constructor() { }

  setSearchData(data:string){
    this.textsearch.next(data);
  }
  getSearchData():Observable<string>{
    return this.textsearch.asObservable();
  }
}
