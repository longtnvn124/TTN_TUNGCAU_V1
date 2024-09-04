import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";
import {Subscription} from "rxjs";
import {MobileSearchService} from "@modules/public/features/mobile-app/services/mobile-search.service";
import {UnsubscribeOnDestroy} from "@core/utils/decorator";

@UnsubscribeOnDestroy()
@Component({
  selector: 'app-mobile-tim-kiem',
  templateUrl: './mobile-tim-kiem.component.html',
  styleUrls: ['./mobile-tim-kiem.component.css']
})
export class MobileTimKiemComponent implements OnInit {


  textSearch: string;
  loaiSelectFilter: number = 0;
  subcription: Subscription = new Subscription();

  phanloaiFilter: { id: number, value: string,icon:string }[] = [
    {id: 1, value: 'Nhân vật lịch sử',icon :'pi pi-users'},
    {id: 2, value: 'Điểm di tích VR360',icon :'pi pi-globe'},
    {id: 3, value: 'Sự kiện lịch sử',icon:'pi pi-calendar-minus'},
  ];
  filterbottom:boolean= false
  constructor(
    private router: Router,
    private mobile: MobileNavbarService,
    private mobileSearchService: MobileSearchService,
  ) {
    this.loaiSelectFilter = 0;
  }
  ngOnInit(): void {
    this.subcription.add(
      this.mobile.onBackClick.subscribe(() => this.router.navigate(['mobile/']))
    );
    this.subcription.add(
      this.mobileSearchService.getSearchData().subscribe((data) => {
        this.textSearch = data;
        if(this.textSearch === ''){
          this.loaiSelectFilter = 0;
        }
      })
    )
  }

  btnFilter() {
    this.filterbottom  = !this.filterbottom;
  }

  btnselectFliter(value: number) {
    this.loaiSelectFilter = value;
    this.filterbottom=false;
  }


}

