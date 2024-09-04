import {state, style, transition, trigger, useAnimation} from '@angular/animations';
import {Component, OnInit} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {NavigationEnd, Router} from '@angular/router';
import {AuthService} from '@core/services/auth.service';
import {HelperService} from '@core/services/helper.service';
import {NotificationService, SideNavigationMenu} from '@core/services/notification.service';
import {delay, filter, switchMap, tap} from 'rxjs/operators';
import {APP_CONFIGS, HIDDEN_MENUS} from '@env';
import {debounceTime, of, Subscription} from 'rxjs';
import {Ucase} from '@core/models/ucase';
import {UnsubscribeOnDestroy} from '@core/utils/decorator';
import {ThemeSettingsService} from '@core/services/theme-settings.service';
import {LangChangeEvent} from '@ngx-translate/core/lib/translate.service';
import {
  moveFromLeft,
  moveFromRight,
  moveFromTop,
  moveFromBottom,
  moveFromLeftFade,
  moveFromRightFade,
  moveFromTopFade,
  moveFromBottomFade,
  fromLeftEasing,
  fromRightEasing,
  fromTopEasing,
  fromBottomEasing,
  scaleDownFromLeft,
  scaleDownFromRight,
  scaleDownFromTop,
  scaleDownFromBottom,
  scaleDownScaleDown,
  rotateGlueFromLeft,
  rotateGlueFromRight,
  rotateGlueFromTop,
  rotateGlueFromBottom,
  rotateFlipToLeft,
  rotateFlipToRight,
  rotateFlipToTop,
  rotateFlipToBottom,
  rotateNewsPaper,
  rotateRoomToLeft,
  rotateRoomToRight,
  rotateRoomToTop,
  rotateRoomToBottom,
  rotateCubeToLeft,
  rotateCubeToRight,
  rotateCubeToTop,
  rotateCubeToBottom,
  rotateCarouselToLeft,
  rotateCarouselToRight,
  rotateCarouselToTop,
  rotateCarouselToBottom,
  rotateSides,
  slide
} from '@shared/animations/router-animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
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
    trigger('dropdown', [
      state('open', style({
        top: '100%',
        opacity: 1,
        visibility: 'visible'
      })),
      state('close', style({
        top: 'calc(100% + 13px)',
        opacity: 0,
        visibility: 'hidden'
      }))
    ]),
    trigger('navigationMenuEffect', [state('open', style({right: 0}))]),
    trigger('moveFromLeft', [transition('* => *', useAnimation(moveFromLeft))]),
    trigger('moveFromRight', [transition('* => *', useAnimation(moveFromRight))]),
    trigger('moveFromTop', [transition('* => *', useAnimation(moveFromTop))]),
    trigger('moveFromBottom', [transition('* => *', useAnimation(moveFromBottom))]),
    trigger('moveFromLeftFade', [transition('* => *', useAnimation(moveFromLeftFade))]),
    trigger('moveFromRightFade', [transition('* => *', useAnimation(moveFromRightFade))]),
    trigger('moveFromTopFade', [transition('* => *', useAnimation(moveFromTopFade))]),
    trigger('moveFromBottomFade', [transition('* => *', useAnimation(moveFromBottomFade))]),
    trigger('fromLeftEasing', [transition('* => *', useAnimation(fromLeftEasing))]),
    trigger('fromRightEasing', [transition('* => *', useAnimation(fromRightEasing))]),
    trigger('fromTopEasing', [transition('* => *', useAnimation(fromTopEasing))]),
    trigger('fromBottomEasing', [transition('* => *', useAnimation(fromBottomEasing))]),
    trigger('scaleDownFromLeft', [transition('* => *', useAnimation(scaleDownFromLeft))]),
    trigger('scaleDownFromRight', [transition('* => *', useAnimation(scaleDownFromRight))]),
    trigger('scaleDownFromTop', [transition('* => *', useAnimation(scaleDownFromTop))]),
    trigger('scaleDownFromBottom', [transition('* => *', useAnimation(scaleDownFromBottom))]),
    trigger('scaleDownScaleDown', [transition('* => *', useAnimation(scaleDownScaleDown))]),
    trigger('rotateGlueFromLeft', [transition('* => *', useAnimation(rotateGlueFromLeft))]),
    trigger('rotateGlueFromRight', [transition('* => *', useAnimation(rotateGlueFromRight))]),
    trigger('rotateGlueFromTop', [transition('* => *', useAnimation(rotateGlueFromTop))]),
    trigger('rotateGlueFromBottom', [transition('* => *', useAnimation(rotateGlueFromBottom))]),
    trigger('rotateFlipToLeft', [transition('* => *', useAnimation(rotateFlipToLeft))]),
    trigger('rotateFlipToRight', [transition('* => *', useAnimation(rotateFlipToRight))]),
    trigger('rotateFlipToTop', [transition('* => *', useAnimation(rotateFlipToTop))]),
    trigger('rotateFlipToBottom', [transition('* => *', useAnimation(rotateFlipToBottom))]),
    trigger('rotateNewsPaper', [transition('* => *', useAnimation(rotateNewsPaper))]),
    trigger('rotateRoomToLeft', [transition('* => *', useAnimation(rotateRoomToLeft))]),
    trigger('rotateRoomToRight', [transition('* => *', useAnimation(rotateRoomToRight))]),
    trigger('rotateRoomToTop', [transition('* => *', useAnimation(rotateRoomToTop))]),
    trigger('rotateRoomToBottom', [transition('* => *', useAnimation(rotateRoomToBottom))]),
    trigger('rotateCubeToLeft', [transition('* => *', useAnimation(rotateCubeToLeft))]),
    trigger('rotateCubeToRight', [transition('* => *', useAnimation(rotateCubeToRight))]),
    trigger('rotateCubeToTop', [transition('* => *', useAnimation(rotateCubeToTop))]),
    trigger('rotateCubeToBottom', [transition('* => *', useAnimation(rotateCubeToBottom))]),
    trigger('rotateCarouselToLeft', [transition('* => *', useAnimation(rotateCarouselToLeft))]),
    trigger('rotateCarouselToRight', [transition('* => *', useAnimation(rotateCarouselToRight))]),
    trigger('rotateCarouselToTop', [transition('* => *', useAnimation(rotateCarouselToTop))]),
    trigger('rotateCarouselToBottom', [transition('* => *', useAnimation(rotateCarouselToBottom))]),
    trigger('rotateSides', [transition('* => *', useAnimation(rotateSides))]),
    trigger('slide', [transition('* => *', useAnimation(slide))])
  ]
})
@UnsubscribeOnDestroy()
export class DashboardComponent implements OnInit {

  // animationType = 'noAnimations';
  animationType = 'scaleDownScaleDown';

  isLoading = false;

  menuCollapse = false;

  mobileMenuOpen = false;

  menuActive: MenuItem = {label: 'Bảng điều khiển', icon: 'fi-rr-dashboard', styleClass: ''};

  menuDropdownState = 'close';

  langDropdownState = 'close';

  verticalMenu: MenuItem[] = [];

  subscriptions = new Subscription();

  menuSize = '300px';

  defaultNavigationOffsetTop = '60px';

  navigationOffsetTop = this.defaultNavigationOffsetTop;

  initRight = '-310px';

  sideNavigationMenuSettings: SideNavigationMenu;

  navigationMenuState: 'open' | 'close' = 'close';

  bodyNoScroll = '<style>body {overflow: hidden !important; padding-right: 16.5px;}</style>';

  overflowWrapper = 'visible';

  // overflowXInnerWrapper = 'auto';
  overflowXInnerWrapper = 'hidden';

  showRoutingProgressBar = false;

  sideNavigationOffCanvasSize = '0';

  timeOut: any;

  constructor(
    private helperService: HelperService,
    private router: Router,
    private notificationService: NotificationService,
    private themeSettingsService: ThemeSettingsService,
    private auth: AuthService
  ) {
    const observerRouterEvents = router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      const activeLink = e.url.substring(7).split('?')[0];
      const useCase = this.auth.getUseCase(activeLink);
      this.menuActive = useCase ? {
        label: useCase.title,
        icon: useCase.icon,
        styleClass: useCase.id ? useCase.id.replace(/\//gmi, '__') : ''
      } : {label: 'Bảng điều khiển', icon: 'fi-rr-dashboard', styleClass: ''};
      if (this.timeOut) {
        clearTimeout(this.timeOut);
      }
      this.timeOut = setTimeout(() => {
        const elmActive = document.querySelector('.--admin-dashboard-menu-parent-active');
        if (elmActive) {
          elmActive.classList.remove('--admin-dashboard-menu-parent-active');
        }
        const parentMenuActive = this.menuActive.styleClass ? document.querySelector('.' + this.menuActive.styleClass) : null;
        if (parentMenuActive) {
          parentMenuActive.classList.add('--admin-dashboard-menu-parent-active');
        }
      }, 200);
    });
    this.subscriptions.add(observerRouterEvents);

    const observerChangeLanguage = this.auth.appLanguageSettings().pipe(filter(value => value !== undefined && value !== null)).subscribe(
      (settings) => {
        const lang = APP_CONFIGS.multiLanguage ? settings : null;
        this.verticalMenu = this.useCase2ToMenuItem(this.auth.useCases, lang);
      }
    );
    this.subscriptions.add(observerChangeLanguage);

    const observerOpenSideNavigation = this.notificationService.onSideNavigationMenuOpen().pipe(
      debounceTime(100),
      switchMap(settings => {
          this.sideNavigationMenuSettings = settings;
          this.menuSize = settings.size ? `${settings.size}px` : '100%';
          this.initRight = '-' + (settings.size ? `${settings.size + 10}px` : '110%');
          this.navigationOffsetTop = settings.offsetTop ? settings.offsetTop : this.defaultNavigationOffsetTop;
          this.sideNavigationOffCanvasSize = settings['offCanvas'] ? Math.max(0, (settings.size + 10)) + 'px' : '0';
          return of('');
        }
      ), delay(50)).subscribe(() => this.navigationMenuState = 'open');
    this.subscriptions.add(observerOpenSideNavigation);

    const observerCloseSideNavigation = this.notificationService.onSideNavigationMenuClosed().pipe(debounceTime(100)).subscribe(() => {
      this.navigationMenuState = 'close';
      this.sideNavigationOffCanvasSize = '0';
    });
    this.subscriptions.add(observerCloseSideNavigation);

    const observerThemeSettingsChange = this.themeSettingsService.onThemeSettingsChange.pipe(debounceTime(100)).subscribe(settings => this.animationType = settings.routingAnimation);
    this.subscriptions.add(observerThemeSettingsChange);
  }

  ngOnInit(): void {
    this.themeSettingsService.settingInit(this.auth.userMeta);
    this.menuCollapse = this.themeSettingsService.getSetting('menuCollapse');
  }

  useCase2ToMenuItem(data: Ucase[], lang: LangChangeEvent = null): MenuItem[] {
    const translated = lang ? lang.translations.route : null;
    let result: MenuItem[] = [];
    if (data.length) {
      data.filter(u => u.position === 'left').forEach(({child, title, icon, id}) => {
        if (!HIDDEN_MENUS.has(id)) {
          const menu: MenuItem = {
            label: translated && translated.hasOwnProperty(id) ? translated[id] : title,
            icon: icon
          };
          if (child && child.length) {
            menu['items'] = [];
            const styleClass = [id ? id.replace(/\//gmi, '__') : ''];
            child.filter(u => u.position === 'left').forEach(nodeChild => {
              if (!HIDDEN_MENUS.has(nodeChild.id)) {
                menu['items'].push({
                  label: translated && translated.hasOwnProperty(nodeChild.id) ? translated[nodeChild.id] : nodeChild.title,
                  icon: nodeChild.icon,
                  routerLink: nodeChild.id
                });
                styleClass.push(nodeChild.id ? nodeChild.id.replace(/\//gmi, '__') : '');
              }
            });
            menu['styleClass'] = styleClass.join(' ');
          } else {
            menu['routerLink'] = id;
          }
          result.push(menu);
        }
      });
    }
    return result;
  }

  toggleMenu() {
    this.menuCollapse = !this.menuCollapse;
    this.themeSettingsService.changeThemeSettings([{
      item: 'menuCollapse',
      value: this.menuCollapse
    }], false).pipe(tap(() => this.auth.syncUserMeta())).subscribe();
  }

  toggleMenuForMobile(event: Event | null) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  reloadPage() {
    this.notificationService.isProcessing(true);
    window.location.reload();
  }

  closePanel(settings: SideNavigationMenu) {
    if (settings && !settings['preventCloseWhenClickOnOverlay']) {
      this.notificationService.closeSideNavigationMenu(settings.name);
    }
  }

  getState(outlet, name: string) {
    if (name !== this.animationType) {
      return;
    }
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['state'];
  }

  animationStart() {
    this.overflowWrapper = 'hidden';
    this.overflowXInnerWrapper = 'hidden';
    this.showRoutingProgressBar = true;
  }

  animationDoneStart() {
    setTimeout(() => {
      this.overflowWrapper = 'visible';
      // this.overflowXInnerWrapper  = 'auto';
      this.overflowXInnerWrapper = 'hidden';
      this.showRoutingProgressBar = false;
    }, 100);
  }
}
