import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';

import { AppConfig } from './app.config';
import { map, distinctUntilChanged, distinct, debounceTime } from 'rxjs/operators';
import { RouterStateService } from './services/router-state.service';
import { ToggleNavigationBarService } from './services/toggle-navigation-bar.service';
import { MessageService } from './services/message.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('fullscreenLayout') fullscreenLayout: any;
  @ViewChild('mainLayout') mainLayout: ElementRef;
  @ViewChild('sectionNav', { read: ElementRef, static: false }) sectionNav: ElementRef;

  deviceType = this.appConfig.config.deviceType$;
  outletName = 'primary';

  orientation$ = new BehaviorSubject<string>('portrait');

  nvHeight: number;
  // userProfile: MemberProfileModel;
  isFullScreen = false;
  // userProfile: MemberProfileModel;
  windownInnerHeight;

  isShowNav$ = new BehaviorSubject<boolean>(true);
  constructor(
    private appConfig: AppConfig,
    translate: TranslateService,
    private detectDevice: DetectDeviceService,
    routerStateService: RouterStateService,
    private toggleNavigationBarService: ToggleNavigationBarService,
    private messageService: MessageService,
    gtmService: GoogleTagManagerService,
    private cd: ChangeDetectorRef
  ) {
    gtmService.addGtmToDom();
    this.toggleNavigationBarService.isShowNavigationBar
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(val => {
        this.isShowNav$.next(val);
      });

    detectDevice.orientation$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((orientation) => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      cd.markForCheck();
      this.orientation$.next(orientation);
    });

    // When user rotate the device portrait <=> landscape, may be from size of desktop adapt tablet: [iPad Pro (12.9-inch)++]
    detectDevice.deviceType$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(device => {
      // this.deviceType = device;
      document.body.classList.value = `${device}--layout`;
      cd.markForCheck();
    });

    this.messageService.getMessageSetting().subscribe(settings => {
      appConfig.config.messageSettings = settings;
    });

    routerStateService.loadRouting();

    appConfig.languages.subscribe(lang => {
      if (lang) {
        translate.setDefaultLang(lang);
      }
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet.activatedRouteData.state;
  }
}
