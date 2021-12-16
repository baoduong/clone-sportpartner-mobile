import { PremiumService } from 'src/app/services/premium.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AppConfig } from '../app.config';

@Component({
  selector: 'app-start-groups',
  templateUrl: './start-group.component.html',
  styleUrls: ['./start-group.component.scss'],
  animations: [
    trigger('changeStepWelcome', [
      state('initFirstState', style({ display: 'none' })),
      state('finishedFirstState', style({ display: 'block' })),
      state('hide', style({
        opacity: 0,
        position: 'absolute'
      })),
      state('step1', style({
        opacity: 1,
        position: 'absolute'
      })),
      state('step2', style({
        opacity: 1,
        position: 'absolute'
      })),
      state('step3', style({
        opacity: 1,
        position: 'absolute'
      })),
      transition('* => hide', [
        style({ opacity: 1 }),
        animate('1000ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition('hide => *', [
        style({ opacity: 0 }),
        animate('1000ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
    ])
  ]
})
export class StartGroupComponent implements OnInit {

  initState = 'step1';
  labelButton = 'Web-Group.INTRODUCTION.next_button';
  isFirtPageLoaded = 'initFirstState';

  returnUrl = this.route.snapshot.queryParams.returnUrl || `${this.appConfig.config.culture}/group`;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private appConfig: AppConfig,
    titleService: Title,
    translateService: TranslateService,
    premiumService: PremiumService
  ) {

    translateService.get('Web-Group.INTRODUCTION.title').subscribe(value => {
      titleService.setTitle(value);
    });

    setTimeout(() => {
      premiumService.premiumInPage.next(false);
    }, 500);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isFirtPageLoaded = 'finishedFirstState';
    }, 510);
  }

  changeStep() {
    switch (this.initState) {
      case 'step1':
        this.initState = 'step2';
        break;
      case 'step2':
        this.initState = 'step3';
        this.labelButton = 'Web-Group.INTRODUCTION.last_button';
        break;
      case 'step3':
        this.cookieService.set('ACCEPTED_COOKIE_START_GROUP', 'ACCEPTED', 3600, '/', '', false, 'Strict');
        // const url = this.stateSnapShot.url;
        this.router.navigate([this.returnUrl]);
        break;

    }
  }

}
