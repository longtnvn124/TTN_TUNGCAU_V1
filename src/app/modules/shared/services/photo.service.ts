import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Image} from "primeng/image";

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(private http: HttpClient) { }

  getImages() {
    return this.http.get<any>('assets/showcase/data/photos.json')
      .toPromise()
      .then(res => <Image[]>res.data)
      .then(data => { return data; });
  }
}
