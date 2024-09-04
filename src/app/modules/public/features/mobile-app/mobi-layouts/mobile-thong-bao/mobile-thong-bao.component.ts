import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";
import {Subscription} from "rxjs";
import {UnsubscribeOnDestroy} from "@core/utils/decorator";

@UnsubscribeOnDestroy()
@Component({
  selector: 'app-mobile-thong-bao',
  templateUrl: './mobile-thong-bao.component.html',
  styleUrls: ['./mobile-thong-bao.component.css']
})
export class MobileThongBaoComponent implements OnInit {

  subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private mobileNavbarService: MobileNavbarService
  ) {
  }

  ngOnInit(): void {
    this.subscription.add(
      this.mobileNavbarService.onBackClick.subscribe({
        next: () => {
          this.router.navigate(['home']);
        }
      })
    )
  }

  btn_back_mobile() {
    this.router.navigate(['mobile/']);
  }
}

