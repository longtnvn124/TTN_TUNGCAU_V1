import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CONG_THONG_TIN} from "@shared/utils/syscat";
import {UnsubscribeOnDestroy} from "@core/utils/decorator";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";
import {Subscription} from 'rxjs';

@UnsubscribeOnDestroy()
@Component({
  selector: 'app-mobile-ifarme',
  templateUrl: './mobile-ifarme.component.html',
  styleUrls: ['./mobile-ifarme.component.css']
})
export class MobileIfarmeComponent implements OnInit {

  url: string;

  subcription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mobileNavbar: MobileNavbarService
  ) {
  }

  ngOnInit(): void {
    this.subcription.add(
      this.mobileNavbar.onBackClick.subscribe(() => {
        this.router.navigate(['mobile/']);
      })
    )
    const id: number = this.activatedRoute.snapshot.queryParamMap.has('param') ? parseInt(this.activatedRoute.snapshot.queryParamMap.get('param'), 10) : NaN;
    const congThongTin = !Number.isNaN(id) ? CONG_THONG_TIN.find(t => t.id === id) : null;
    if (congThongTin) {
      this.url = congThongTin.url;
    }
  }

}
