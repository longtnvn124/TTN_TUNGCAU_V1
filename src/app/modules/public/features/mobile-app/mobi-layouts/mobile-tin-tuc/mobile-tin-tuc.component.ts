import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {UnsubscribeOnDestroy} from "@core/utils/decorator";
import {Subscription} from "rxjs";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";

@UnsubscribeOnDestroy()
@Component({
  selector: 'app-mobile-tin-tuc',
  templateUrl: './mobile-tin-tuc.component.html',
  styleUrls: ['./mobile-tin-tuc.component.css']
})
export class MobileTinTucComponent implements OnInit {

  subcsription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private mobileNavbar:MobileNavbarService
  ) {
  }

  ngOnInit(): void {
    this.subcsription.add(
      this.mobileNavbar.onBackClick.subscribe(()=> this.router.navigate(['mobile']))
    )
  }

}
