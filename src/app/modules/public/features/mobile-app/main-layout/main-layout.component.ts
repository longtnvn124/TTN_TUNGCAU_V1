import {Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {debounceTime, of, Subject, takeUntil} from "rxjs";
import {delay, filter, switchMap} from "rxjs/operators";
import {NotificationService, SideNavigationMenu} from "@core/services/notification.service";
import {state, style, trigger} from "@angular/animations";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {MobileSearchService} from "@modules/public/features/mobile-app/services/mobile-search.service";

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  animations: [
    trigger('overlayAnimations', [
      state('open', style({
        opacity: 1,
        visibility: 'visible'
      })),
      state('close', style({
        opacity: 0,
        visibility: 'hidden'
      }))
    ]),
    trigger('navigationMenuEffect', [state('open', style({left: 0}))]),
  ]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('menu', {static: true}) template: TemplateRef<any>;
  private destroy$: Subject<string> = new Subject<string>();

  defaultNavigationOffsetTop = '60px';

  navigationOffsetTop = this.defaultNavigationOffsetTop;

  initLeft = '-310px';

  sideNavigationMenuSettings: SideNavigationMenu;

  navigationMenuState: 'open' | 'close' = 'close';

  menuSize = '300px';

  sideNavigationOffCanvasSize = '0';

  bodyHeight: string = 'calc(100vh - 90px)';

  navbaHeight: string = '90px';

  textSearch: string;

  menuData: { id: number, title: string, icon: string }[] = [
    {id: 1, title: 'Giới thiệu', icon: 'pi pi-info'},
    {id: 2, title: 'Thông báo', icon: 'pi pi-bell'},
    {id: 3, title: 'Tin tức Ban Tuyên Giao', icon: 'pi pi-credit-card'},
    {id: 4, title: 'Nhân vật lịch sử', icon: 'pi pi-users'},
    {id: 5, title: 'Di Tích lịch sử VR360', icon: 'pi pi-globe'},
    {id: 6, title: 'Sự kiện lịch sử', icon: 'pi pi-calendar-minus'},
    {id: 7, title: '31 Chuyên đề LSVH Địa phương', icon: 'pi pi-book'},
    {id: 8, title: 'Trắc nhiệm về LSVH Địa phương', icon: 'pi pi-check-circle'},
  ];

  router_curent;
  navbar_switch_mode: 'DEFAULT' | 'DATA' | 'SEARCH';

  constructor(
    private notificationService: NotificationService,
    private mobileNavbarService: MobileNavbarService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mobileSearchService:MobileSearchService,
  ) {
    router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(
      (e: NavigationEnd) => {
        const cp = this.activatedRoute.routeConfig.children.find(r => r.path === e.url.split("/").pop().split("?")[0]);
        this.router_curent = cp ? cp : null;
        if (cp){
        this.navbar_switch_mode = cp && cp.path && cp.path !== 'mobile-tim-kiem' ? "DATA" : cp.path === 'mobile-tim-kiem' ? "SEARCH" : "DEFAULT";
        }else{
          this.navbar_switch_mode = "DEFAULT";
        }

      }
    )


    this.notificationService.onSideNavigationMenuOpen().pipe(
      takeUntil(this.destroy$),
      debounceTime(100),
      switchMap(settings => {
          this.sideNavigationMenuSettings = settings;
          this.menuSize = settings.size ? `${settings.size}px` : '100%';
          this.initLeft = '-' + (settings.size ? `${settings.size + 10}px` : '110%');
          this.navigationOffsetTop = settings.offsetTop ? settings.offsetTop : this.defaultNavigationOffsetTop;
          this.sideNavigationOffCanvasSize = settings['offCanvas'] ? Math.max(0, (settings.size + 10)) + 'px' : '0';
          return of('');
        }
      ), delay(50)).subscribe(() => this.navigationMenuState = 'open');

    this.notificationService.onSideNavigationMenuClosed().pipe(
      takeUntil(this.destroy$),
      debounceTime(100)
    ).subscribe(() => {
      this.navigationMenuState = 'close';
      this.sideNavigationOffCanvasSize = '0';
    });

    this.notificationService.onSideNavigationMenuClosed().pipe(debounceTime(100)).subscribe(() => {
      this.navigationMenuState = 'close';
      this.sideNavigationOffCanvasSize = '0';
    });

    this.notificationService.observeScreenSize.subscribe(({height}) => {
      const bodyHeight = height - 90;
      this.bodyHeight = bodyHeight + 'px';

    })
  }

  ngOnInit(): void {

  }

  ngOnDestroy()
    :
    void {
    this.destroy$.next('close');
    this.destroy$.complete();
  }


  closePanel(settings: SideNavigationMenu) {
    if (settings && !settings['preventCloseWhenClickOnOverlay']) {
      this.notificationService.closeSideNavigationMenu(settings.name);
    }
  }

  backRoute() {
    this.mobileNavbarService.setBackClick();
  }


  btnOpenMenu() {
    this.notificationService.openSideNavigationMenu({
      template: this.template,
      size: 300,
      offsetTop: '0px'
    });
  }

  btnClose() {
    this.notificationService.closeSideNavigationMenu();
  }

  btnClickMenu(id: number) {
    this.navbar_switch_mode = 'DATA';
    switch (id) {
      case 1:
        this.router.navigate(['mobile/mobile-gioi-thieu']);
        this.btnClose()
        break;
      case 2:
        this.router.navigate(['mobile/mobile-thong-bao']);
        this.btnClose()

        break;
      case 3:
        this.router.navigate(['mobile/mobile-tin-tuc']);
        this.btnClose()
        break;
      case 4:
        this.router.navigate(['mobile/mobile-nhan-vat']);
        this.btnClose()

        break;
      case 5:
        this.router.navigate(['mobile/mobile-vr-360']);
        this.btnClose()

        break;
      case 6:
        this.router.navigate(['mobile/mobile-su-kien']);
        this.btnClose()

        break;
      case 7:
        this.router.navigate(['mobile/mobile-chuyen-de']);
        this.btnClose()

        break;
      case 8:
        this.router.navigate(['test/shift/']);

        break;

    }
  }

  btnLogin() {
    this.btnClose()
  }

  btnSearch() {
    this.btnclearSearch();
    this.router.navigate(['mobile/mobile-tim-kiem']);
    this.navbar_switch_mode = "SEARCH";
  }

  btnMenuGohome() {
    this.navbar_switch_mode = 'DEFAULT';
    this.router.navigate(['home/']);
    this.btnClose();

  }


  selectInput(event) {
    if (event === ''){
      this.mobileSearchService.setSearchData('');
    }else{
      this.mobileSearchService.setSearchData(this.textSearch);
    }
  }

  btnsearchData(){
    this.mobileSearchService.setSearchData(this.textSearch);
  }

  btnclearSearch(){
    this.textSearch = '';
    this.mobileSearchService.setSearchData(this.textSearch);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.mobileSearchService.setSearchData(this.textSearch);
    }
  }
}
