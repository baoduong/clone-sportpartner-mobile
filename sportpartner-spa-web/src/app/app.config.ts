import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { Inject, Injectable, PLATFORM_ID, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
// import { Request } from 'express';
// import { REQUEST } from '@nguniversal/express-engine/tokens';
import { environment } from '../environments/environment';
import { AccessTokenService } from './services/access-token.service';
import { CookieService } from 'ngx-cookie-service';
import { ConfigurationService } from './services/configuration.service';
import { Store } from '@ngrx/store';
import { ACTION_GET_MY_MEMBER_PROFILE, ACTION_GET_UNREAD_MESSAGE, ACTION_GET_STATUS_NOTIFICATION } from './const.actions';
import { filter, map, tap, first } from 'rxjs/operators';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AppConfig {

  config = {
    accessToken: '',
    culture: '',
    language: '',
    country: '',
    ApiGatewayUrl: 'https://api.sportpartner-staging.test.infodation.vn',
    messageSettings: {},
    myProfile: new MemberProfileModel(),
    isShowGroupFeature: true,
    enableGroupFeature: true,
    deviceType$: new BehaviorSubject<string>('mobile')
  };

  public languages = new BehaviorSubject<string>(null);

  constructor(
    private accessTokenservice: AccessTokenService,
    private detectDevice: DetectDeviceService,
    private configurationService: ConfigurationService,
    private store: Store<{ profileReducer: any }>
    // @Optional() @Inject(REQUEST) protected request: Request,
    //  @Inject(PLATFORM_ID) private platformId: any
  ) {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  public getAllConfig() {
    return this.config;
  }

  public getConfig(key: any) {
    return this.config[key];
  }

  public getApiUrls() {
    return this.config.ApiGatewayUrl;
  }

  public load() {
    /*  console.log('Load app config'); */
    const cultureUrl = window.location.pathname.split('/').filter(value => value !== '')[0];
    const isValidUrl = /^([a-z]{2})\W?([a-z]{2})?$/.test(cultureUrl);

    return new Promise<void>((resolve, reject) => {
      /* resolve();
      return; */
      this.configurationService.getAppSettings().toPromise()
        .then(
          value => {
            const { apiGatewayUrl, groupFeatureSettings, currentCountryCode } = value as any;
            if (apiGatewayUrl) {
              this.config.ApiGatewayUrl = apiGatewayUrl; // environment.apiGateway;
              environment.apiGateway = apiGatewayUrl;
            }

            if (groupFeatureSettings) {
              this.config.isShowGroupFeature = groupFeatureSettings.filter(_value => _value.countryCode === currentCountryCode)[0].showGroupFeature;
              this.config.enableGroupFeature = groupFeatureSettings.filter(_value => _value.countryCode === currentCountryCode)[0].enableGroupFeature;
            }

            if (!this.config.enableGroupFeature) {
              window.location.href = window.location.origin + '/currentCountryCode/matches';
            }

            this.accessTokenservice.accessToken()
              .then(
                accessToken => {
                  this.config.accessToken = accessToken;

                  this.store.select(state$ => state$.profileReducer).pipe(
                    map(loaded => loaded.myMemberProfile),
                    tap(loaded => {
                      if (!loaded) {
                        this.store.dispatch({ type: ACTION_GET_MY_MEMBER_PROFILE });
                      }
                    }),
                    filter(myProfile => myProfile),
                    first()
                  ).subscribe((myProfile: MemberProfileModel) => {
                    if (!isValidUrl) {
                      window.location.href = `${window.location.origin}/${myProfile.culture}/group`;
                      return;
                    }
                    this.config.culture = myProfile.culture;
                    this.config.language = myProfile.languageCode;
                    this.config.country = myProfile.countryCode;
                    this.languages.next(myProfile.languageCode);
                    this.config.myProfile = myProfile;

                    this.config.deviceType$ = this.detectDevice.deviceType$;

                    document.body.classList.add(`${this.detectDevice.deviceType}--layout`);
                    this.getStatusUnreadMessage(myProfile.countryCode);
                    this.getStatusNotification(myProfile.publicId);
                    resolve();
                  });
                }
              ).catch(error => {
                console.log('Get accesstoken failed');
                window.location.href = window.location.origin + '/nl/account/login';
                reject();
              });
          },
          error => {

            console.log('%c%s', 'color: #00a3cc', 'Get access token Error', error);
            window.location.href = window.location.origin + '/nl/account/login';
            reject();
          }
        );
    });
  }

  getStatusUnreadMessage(countryCode) {
    this.store.dispatch({ type: ACTION_GET_UNREAD_MESSAGE, payload: {
      countryCode: countryCode
    }});
  }

  getStatusNotification(userPublicId) {
    this.store.dispatch({ type: ACTION_GET_STATUS_NOTIFICATION, payload: {
      userPublicId: userPublicId
    }});
  }
}
