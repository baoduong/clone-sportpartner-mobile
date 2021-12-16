import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { ToggleNavigationBarService } from 'src/app/services/toggle-navigation-bar.service';
import { Component, OnInit, Input, ViewChild, AfterViewInit, InjectionToken, Injector, ElementRef, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { Store } from '@ngrx/store';
import { map, filter, distinctUntilChanged, delay } from 'rxjs/operators';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { PremiumService } from 'src/app/services/premium.service';
import { Router } from '@angular/router';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { CONTAINER_DATA } from '../container_data.sidenav';
import { BehaviorSubject } from 'rxjs';

import { AvatarNavigationComponent } from '../avatar-navigation/avatar-navigation.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DeviceTypes } from 'src/app/const.enum';

import * as SharedAction from '../../store/shared.actions';
@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.scss'],
  animations: [
    trigger('toogleNav', [
      state('showNav', style({
        opacity: 1,
        visibility: 'visible',
        height: '*',
        // overflow: 'hidden'
      })),
      state('hideNav', style({
        opacity: 0,
        visibility: 'hidden',
        height: 0,
        overflow: 'hidden'
      })),
      transition('hideNav => showNav', [
        animate('0.3s ease-out'),
      ]),
      transition('showNav => hideNav', [
        animate('0.3s ease-in'),
      ]),
    ])
  ]
})
export class MainNavigationComponent implements OnInit, AfterViewInit {

  userProfile = new MemberProfileModel();
  culture: string;
  showPremium: boolean;
  // premiumInPage: boolean;

  isOpenSideNav = false;
  isOpenAvatarMenu = false;

  sidenavComponent: any; // = new ComponentPortal(SidenavComponent);

  avatarMenuComponent: any;

  onCloseSideNav = new BehaviorSubject<boolean>(false);
  unReadMessage$ = new BehaviorSubject<number>(0);
  notification$ = new BehaviorSubject<number>(0);

  @ViewChild('btnOverlay') btnOverlay: OverlayRef;
  @ViewChild('sectionNav', { read: ElementRef, static: false }) sectionNav: ElementRef;
  @ViewChild('btnOverlayAvatar', { static: false }) btnOverlayAvatar: ElementRef;

  avatarOverlayRef: OverlayRef;

  deviceType = this.appConfig.config.deviceType$;

  isShowNavigation = true;
  constructor(
    private detectDevice: DetectDeviceService,
    cd: ChangeDetectorRef,
    public appConfig: AppConfig,
    private store: Store<{ profileReducer: any, chatReducer: any, sharedReducer: any }>,
    private premiumService: PremiumService,
    private toggleNavigationBarService: ToggleNavigationBarService,
    private overlay: Overlay,
    private _injector: Injector,
  ) {
    toggleNavigationBarService.isShowNavigationBar.pipe(
      delay(800),
      distinctUntilChanged()
    ).subscribe(val => {
      this.isShowNavigation = val;
      cd.detectChanges();
      setTimeout(() => {

        if (this.deviceType.value === DeviceTypes.mobile) {
          if (!val) {
            document.getElementById('layout').style.paddingBottom = '0px';
          } else {
            const nvHeight = this.sectionNav.nativeElement.clientHeight;
            document.getElementById('layout').style.paddingBottom = `${nvHeight}px`;
          }
        }
      }, 600);

    });

    store.select(state$ => state$.profileReducer).pipe(
      map(loaded => loaded.myMemberProfile),
      filter(profile => !!profile)
    ).subscribe(myProfile => {
      this.userProfile = myProfile;
      this.culture = this.userProfile.culture;
    });

    this.onCloseSideNav.subscribe(value => {
      if (this.btnOverlay && value) {
        this.isOpenSideNav = false;
        setTimeout(() => {
          this.btnOverlay.detach();
        }, 400);
      }
    });

    store.select(state$ => state$.chatReducer).pipe(
      map(loaded => loaded.unreadCount),
      distinctUntilChanged()
    ).subscribe(unRead => {
      this.unReadMessage$.next(unRead);
    });

    // get status notification
    store.select(state$ => state$.sharedReducer).pipe(
      map(loaded => loaded.numberStatusNotification),
      filter(loaded => loaded !== undefined),
      distinctUntilChanged(),
    ).subscribe(numberStatus => {
      this.notification$.next(numberStatus);
      if (numberStatus === 0) {
        window.location.replace(`${window.location.origin}/${this.culture}/notification`);
      }
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.premiumService.premiumInPage.pipe(
      distinctUntilChanged()
    ).subscribe(val => {
      if (this.deviceType.value === DeviceTypes.mobile) {
        const nvHeight = this.sectionNav.nativeElement.clientHeight;
        switch (true) {
          case !val && this.toggleNavigationBarService.isShowNavigationBar.value:
            document.getElementById('layout').style.paddingBottom = `71px`;
            break;
          case val && this.toggleNavigationBarService.isShowNavigationBar.value:
            setTimeout(() => {
              const nvHeight$ = this.sectionNav.nativeElement.clientHeight;
              document.getElementById('layout').style.paddingBottom = `${nvHeight$}px`;
            }, 1500);
            break;
          default:
            document.getElementById('layout').style.paddingBottom = `${nvHeight}px`;
            break;
        }

      }
    });
    this.sidenavComponent = new ComponentPortal(SidenavComponent, null, this.createInjector({
      profile: this.userProfile,
      closing: this.onCloseSideNav
    }));

    this.btnOverlay = this.overlay.create({
      hasBackdrop: true,
      panelClass: 'side-nav',
    });

    this.avatarMenuComponent = new ComponentPortal(AvatarNavigationComponent, null, this.createInjector({
      profile: this.userProfile,
    }));

    this.btnOverlay.backdropClick().subscribe(() => {
      this.onCloseSideNav.next(true);
      this.isOpenSideNav = false;
      setTimeout(() => {
        this.btnOverlay.detach();
      }, 400);
    });

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.btnOverlayAvatar)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        }
      ]);

    this.avatarOverlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      panelClass: 'overlay-menu-avatar'

    });

    this.avatarOverlayRef.backdropClick().subscribe(() => {
      this.isOpenAvatarMenu = false;
      this.avatarOverlayRef.detach();
    });
  }

  markReadNotification() {
    if (this.notification$.value > 0) {
      this.store.dispatch(SharedAction.markReadNotification({
        payload: {
          userPublicId: this.appConfig.config.myProfile.publicId
        }
      }));
      return false;
    }
  }

  gotoPayment() {
    window.location.replace(`${window.location.origin}/${this.culture}/payment/options?src=grouppost`);
  }

  toggleOverlaySideNav() {
    this.isOpenSideNav = !this.isOpenSideNav;
    if (this.isOpenSideNav) {
      this.btnOverlay.attach(this.sidenavComponent);
      this.onCloseSideNav.next(false);
    } else {
      this.btnOverlay.detach();
    }

  }

  createInjector(dataToPass): PortalInjector {
    const injectorTokens = new WeakMap();
    injectorTokens.set(CONTAINER_DATA, dataToPass);
    return new PortalInjector(this._injector, injectorTokens);
  }

  toggleShowOverlayAvatar() {
    if (this.deviceType.value === DeviceTypes.desktop) {
      this.isOpenAvatarMenu = !this.isOpenAvatarMenu;
      if (this.isOpenAvatarMenu) {
        this.avatarOverlayRef.attach(this.avatarMenuComponent);
        this.avatarOverlayRef.backdropElement.className = this.avatarOverlayRef.backdropElement.className + ' overlay-transparent';
      } else {
        this.avatarOverlayRef.detach();
      }
    } else {
      this.toggleOverlaySideNav();
    }
  }
}
