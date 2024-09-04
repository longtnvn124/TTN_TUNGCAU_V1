import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";
import {Subscription} from "rxjs";
import {UnsubscribeOnDestroy} from "@core/utils/decorator";

@UnsubscribeOnDestroy()
@Component({
  selector: 'app-mobile-gioi-thieu',
  templateUrl: './mobile-gioi-thieu.component.html',
  styleUrls: ['./mobile-gioi-thieu.component.css']
})
export class MobileGioiThieuComponent implements OnInit {

 subcription: Subscription = new Subscription();
  constructor(
    private router :Router,
    private mobileNavbar:MobileNavbarService,
  ) { }

  ngOnInit(): void {
    this.subcription.add(
      this.mobileNavbar.onBackClick.subscribe(()=>{
        this.router.navigate(['mobile/']);
      })
    )
  }



}
