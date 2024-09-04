import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MobileNavbarService {

  private _backClick: Subject<string> = new Subject<string>();

  constructor() {
  }

  get onBackClick(): Observable<string> {
    return this._backClick.asObservable();
  }

  setBackClick() {
    this._backClick.next('click');
  }

}
