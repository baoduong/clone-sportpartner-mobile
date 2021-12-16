import { BehaviorSubject } from 'rxjs';
import { PremiumService } from './../../../../services/premium.service';
import { AppConfig } from './../../../../app.config';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-upgrade-premium-banner',
  templateUrl: './upgrade-premium-banner.component.html',
  styleUrls: ['./upgrade-premium-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toggleBanner', [
      state('show', style({
        opacity: 1,
        visibility: 'visible',
        height: '*',
        // overflow: 'hidden'
      })),
      state('hide', style({
        opacity: 0,
        visibility: 'hidden',
        height: 0,
        overflow: 'hidden'
      })),
      transition('hide => show', [
        animate('0.3s ease-out'),
      ]),
      transition('show => hide', [
        animate('0.3s ease-in'),
      ]),
    ])
  ]
})
export class UpgradePremiumBannerComponent implements OnInit {
  userProfile: MemberProfileModel;
  premiumInPage$ = new BehaviorSubject<boolean>(true);

  constructor(private appConfig: AppConfig, premiumService: PremiumService) {
    this.userProfile = appConfig.config.myProfile;

    premiumService.premiumInPage.subscribe(value => {
      this.premiumInPage$.next(value);
    });
  }

  ngOnInit(): void {
  }

  gotoPayment() {
    window.location.replace(`${window.location.origin}/${this.appConfig.config.culture}/payment/options?src=grouppost`);
  }
}
