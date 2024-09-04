import {

  Component,
  ElementRef,
  HostListener,
  OnChanges, OnDestroy,
  OnInit,
  SimpleChanges, TemplateRef,
  ViewChild
} from '@angular/core';
import {DotThiDanhSachService} from "@shared/services/dot-thi-danh-sach.service";
import {DotThiKetQuaService} from "@shared/services/dot-thi-ket-qua.service";
import {NotificationService, SideNavigationMenu} from "@core/services/notification.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {state, style, trigger} from "@angular/animations";
import {debounceTime, of, Subject, takeUntil} from "rxjs";
import {delay, filter, switchMap} from "rxjs/operators";
import {MobileNavbarService} from "@modules/public/features/mobile-app/services/mobile-navbar.service";


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
export class MainLayoutComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('menu', {static: true}) template: TemplateRef<any>;
  @ViewChild('slider', {static: true}) slider: ElementRef<HTMLDivElement>;

  @HostListener('window:resize', ['$event']) onResize(event: Event): void {
    this.isSmallScreen = window.innerWidth < 500;
    this.minheight500 = window.innerHeight < 500;
  }

  minheight500: boolean = window.innerHeight < 500;
  isSmallScreen: boolean = window.innerWidth < 500;
  private destroy$: Subject<string> = new Subject<string>();

  defaultNavigationOffsetTop = '60px';

  navigationOffsetTop = this.defaultNavigationOffsetTop;

  initLeft = '-310px';

  sideNavigationMenuSettings: SideNavigationMenu;

  navigationMenuState: 'open' | 'close' = 'close';

  menuSize = '300px';

  sideNavigationOffCanvasSize = '0';
  bodyHeight: string = 'calc(100vh - 60px)';

  navbaHeight: string = '60px';

  unLesson: boolean = false;
  slides = [
    {index: 1, img: '/assets/slide/slide1.jpg'},
    {index: 2, img: '/assets/slide/slide2.jpg',},
    {index: 3, img: '/assets/slide/slide3.jpg',},
    {index: 4, img: '/assets/slide/slide4.jpg',},
  ];

  menuData: { id: number, title: string, icon: string }[] = [
    {id: 1, title: 'Giới thiệu', icon: 'pi pi-info'},
    {id: 2, title: 'Danh mục chuyên mục', icon: 'pi pi-bookmark'},
    {id: 3, title: '31 Chuyên đề LSVH Địa phương', icon: 'pi pi-book'},
    {id: 4, title: 'Di Tích lịch sử VR360', icon: 'pi pi-globe'},
    {id: 5, title: 'Sự kiện lịch sử', icon: 'pi pi-calendar-minus'},
    {id: 6, title: 'Nhân vật lịch sử', icon: 'pi pi-users'},
    {id: 7, title: 'Tìm kiếm', icon: 'pi pi-search'},
  ];
  index = 0;
  mode: "DANNHMUC_NGULIEUSO" | "VR360" | "NHANVAT" | "SUKIEN_TONGHOP" | "SEARCH" | "THONGTIN" | "HOME" | "CHUYENDE" | "GIOITHIEU" = "HOME";

  constructor(
    private dotThiDanhSachService: DotThiDanhSachService,
    private dotthiKetquaService: DotThiKetQuaService,
    private notificationService: NotificationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mobileNavbarService:MobileNavbarService
  ) {

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
      const bodyHeight = height - 60;
      this.bodyHeight = bodyHeight + 'px';
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.unLesson = false;
  }

  ngOnInit() {
    this.unLesson = false;
    const viewMode = this.activatedRoute.snapshot.queryParamMap.has('view-mode') ? this.activatedRoute.snapshot.queryParamMap.get('view-mode') : 'desktop';
    if (viewMode === 'mobile') {
      this.unLesson = true;
    }
  }

  ngOnDestroy(): void {
    this.unLesson = false;
  }

  closePanel(settings: SideNavigationMenu) {
    if (settings && !settings['preventCloseWhenClickOnOverlay']) {
      this.notificationService.closeSideNavigationMenu(settings.name);
    }
  }


  btn_GoHome() {
    void this.router.navigate(['home/']);
    this.unLesson = false;
  }

  btn_shift() {
    void this.router.navigate(['test/shift/']);
    this.unLesson = false;
  }

  btn_sukien() {
    this.mobileNavbarService.setBackClick();
    void this.router.navigate(['/home/su-kien/']);
    this.unLesson = false;
  }

  btn_nhanvat() {
    this.mobileNavbarService.setBackClick();
    void this.router.navigate(['home/nhan-vat/']);
    this.unLesson = false;
  }

  btn_vr360() {

    void this.router.navigate(['home/vr-360/']);
    this.unLesson = false;
  }


  btn_31Chuyende() {

    this.router.navigate(['/home/chuyen-de/']);
    this.unLesson = true;
  }

  btn_search() {
    this.router.navigate(['home/tim-kiem/']);

    this.unLesson = false;
  }


  btn_gioithieu() {
    this.router.navigate(['home/gioi-thieu/']);

    this.unLesson = false;

  }

  btn_login() {
    this.router.navigate(['login']);
  }

  btn_chuyenmuc() {
    this.router.navigate(['home/chuyen-muc/']);
    this.unLesson = false;
  }

  btnOpenMenu() {
    this.notificationService.openSideNavigationMenu({
      template: this.template,
      size: 300,
      offsetTop: '0px'
    })
  }


  btnClose() {
    this.notificationService.closeSideNavigationMenu();
  }

  btnClickMenu(id: number) {
    switch (id) {
      case 1:
        this.router.navigate(['home/gioi-thieu']);
        this.btnClose()
        break;
      case 2:
        this.router.navigate(['home/chuyen-muc']);
        this.btnClose()

        break;
      case 3:
        this.router.navigate(['home/chuyen-de']);
        this.btnClose()
        break;
      case 4:
        this.router.navigate(['home/vr-360']);
        this.btnClose()

        break;
      case 5:
        this.btn_sukien();
        this.btnClose();
        break;
      case 6:
        this.btn_nhanvat();
        this.btnClose()
        break;
      case 7:
        this.router.navigate(['home/tim-kiem']);
        this.btnClose()

        break;
    }
  }
}
