import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { AppConfig } from 'src/app/app.config';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ChangeDetectionStrategy, Input, Inject, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';

import { NavigationEnd, Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, first, share, shareReplay, take } from 'rxjs/operators';

import { CONTAINER_DATA } from '../container_data.sidenav';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationToggleSideNav', [
      state('open', style({ transform: 'translateX(0)' })),
      state('hide', style({ transform: 'translateX(-100%)' })),
      transition('open => hide', [
        animate('400ms ease'),
      ]),
      transition('hide => open', [
        animate('150ms ease'),
      ]),
      /* transition(':enter', [
        style({ transform: 'translateX(-100%)' }), // From
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(0)' })), // to
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)' }), // From
        animate('0.3s ease-out', style({ transform: 'translateX(-100%)' })), // to
      ]) */
    ])
  ]
})
export class SidenavComponent implements OnInit {

  deviceType = this.appConfig.config.deviceType$;

  @ViewChild('sideNav') sideNav: ElementRef;

  userProfile: any;
  user_type: string;

  isOpen = false;

  closing: BehaviorSubject<boolean>;
  constructor(

    @Inject(CONTAINER_DATA) public componentData: any,
    router: Router,
    translate: TranslateService,
    private cd: ChangeDetectorRef,
    public appConfig: AppConfig,
    detectDevice: DetectDeviceService,
  ) {

    this.userProfile = componentData.profile;
    // @T[(!MetaData.CurrentUser.IsPremium ? "basic_member" : "premium_member"), "MENU"]
    this.user_type = translate.instant(this.userProfile.isPremium ? 'Generic.MENU.premium_member' : 'Generic.MENU.basic_member');

    router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        share()
      )
      .subscribe(() => {
        this.closing = this.componentData.closing;
        this.closing.next(true);
        setTimeout(() => {
          this.isOpen = false;
          this.cd.detectChanges();
        }, 100);
      });

  }

  ngOnInit(): void {
    this.closing = this.componentData.closing;
    this.closing.subscribe(value => {
      setTimeout(() => {
        this.isOpen = !value;
        this.cd.detectChanges();
      }, 100);
    });
  }

  closeSideNav() {
    this.closing.next(true);
  }
}
