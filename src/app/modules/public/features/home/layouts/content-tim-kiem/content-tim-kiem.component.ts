import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NhanvatComponent} from "@modules/public/features/web-home/nhanvat/nhanvat.component";
import {SukienTonghopComponent} from "@modules/public/features/web-home/sukien-tonghop/sukien-tonghop.component";
import {
  DanhmucNgulieusoComponent
} from "@modules/public/features/web-home/danhmuc-ngulieuso/danhmuc-ngulieuso.component";

@Component({
  selector: 'app-content-tim-kiem',
  templateUrl: './content-tim-kiem.component.html',
  styleUrls: ['./content-tim-kiem.component.css']
})
export class ContentTimKiemComponent implements OnInit, AfterViewInit {
  @ViewChild(NhanvatComponent) nhanvatComponent: NhanvatComponent;
  @ViewChild(SukienTonghopComponent) sukienTonghopComponent: SukienTonghopComponent;
  @ViewChild(DanhmucNgulieusoComponent) danhmucNgulieusoComponent: DanhmucNgulieusoComponent;
  loai:{label:string,value:number}[]=[
    {label:'Nhân vật lịch sử',value:1},
    {label:'Sự kiện LSVHDP',value:2},
    {label:'Vr 360',value:3},
  ];
  loaiSelect:number = 0;//chọn từ loại
  textSearch:string;
  constructor() {
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }
  selectInput(event:string){
    this.textSearch = event;
    if(this.textSearch == ''){
      if(this.loaiSelect ===1){

        this.nhanvatComponent.btnLoadByTextseach('');
      }
      if(this.loaiSelect ===2){

        this.sukienTonghopComponent.btnLoadByTextseach('');
      }
      if(this.loaiSelect ===3){

        this.danhmucNgulieusoComponent.btnLoadByTextseach('');
      }
    }
  }
  selectDropdown(event){
    this.loaiSelect = event.value;
  }


  selectSearch(){

    if(this.loaiSelect ===1){

      this.nhanvatComponent.btnLoadByTextseach(this.textSearch);
    }
    if(this.loaiSelect ===2){

      this.sukienTonghopComponent.btnLoadByTextseach(this.textSearch);
    }
    if(this.loaiSelect ===3){

      this.danhmucNgulieusoComponent.btnLoadByTextseach(this.textSearch);
    }
  }

}
