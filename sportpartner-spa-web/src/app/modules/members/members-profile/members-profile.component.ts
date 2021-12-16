import { AppConfig } from 'src/app/app.config';
import { ToggleNavigationBarService } from 'src/app/services/toggle-navigation-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterStateService } from 'src/app/services/router-state.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { WebSocketService } from 'src/app/services/websocket.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { select, Store } from '@ngrx/store';
import * as MemberActions from '../members.actions';
import { filter, map } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';
import { DeviceTypes } from 'src/app/const.enum';

@Component({
  selector: 'app-members-profile',
  templateUrl: './members-profile.component.html',
  styleUrls: ['./members-profile.component.scss'],
  animations: [
    trigger('animationFadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease', style({ opacity: 1 }))
      ]),
    ]),

    trigger('animationSlide', [
      transition(':enter', [
        style({ bottom: '-100vh' }),
        animate('0.5s ease', style({ bottom: 0 }))
      ]),
    ]),

    trigger('animationOverlay', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.3s ease', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class MembersProfileComponent implements OnInit, OnDestroy, AfterViewInit {

  memberProfile$ = new BehaviorSubject<MemberProfileModel>(undefined);

  keyGender: string;

  deviceType = this.appConfig.config.deviceType$;

  isShowInputSendMsg = false;

  isShowOverlayNoticeHighFive$ = new BehaviorSubject<boolean>(false);

  isShowOverlayNoticeMsg$ = new BehaviorSubject<boolean>(false);

  isShowBtnPhotoRequest = false;

  memberProfileStore$: Subscription;

  myProfile: any;

  constructor(
    private appConfig: AppConfig,
    breakpointObserver: BreakpointObserver,
    titleService: Title,
    private translateService: TranslateService,
    private actRoute: ActivatedRoute,
    private render2: Renderer2,
    private routerStateService: RouterStateService,
    private route: Router,
    private toggleNavigationBarService: ToggleNavigationBarService,
    private ws: WebSocketService,
    private store: Store<{ profileReducer: any, chatReducer: any }>,
    private loaderService: LoaderService,
  ) {
    this.actRoute.data.subscribe(dataResolve => {
      console.log('%c%s', 'color: #ff6600', 'dataResolve.data', dataResolve.data);
      this.memberProfile$.next(dataResolve.data);

      if (dataResolve.data.gender === 'M') {
        this.keyGender = 'Generic.GENDER_ABBR.male';
      } else {
        this.keyGender = 'Generic.GENDER_ABBR.female';
      }

      const defaultAvatartString = 'default-match-photo';
      if (dataResolve.data.avatarUrl.includes(defaultAvatartString)) {
        this.isShowBtnPhotoRequest = true;
      }
    });

    this.memberProfileStore$ = this.store.pipe(
      select(state => state.profileReducer),
      map(loaded => loaded.memberProfile),
      filter(loaded => !!loaded),
      filter(loaded => loaded.conversation.conversationId !== null && loaded.conversation.isSentFirstMessage === true))
      .subscribe((profile: MemberProfileModel) => {
        this.memberProfile$.next(profile);

        setTimeout(() => {
          this.translateHighFivedTip();
        }, 500);

        setTimeout(() => {
          this.closeOverlay();
        }, 1500);
      });

    // const title = translateService.instant('Web-Group.VISITING-PROFILE.title');
    // titleService.setTitle(title);

    // this.deviceType = breakpointObserver.isMatched('(max-width: 767px)') ? 'mobile' : 'desktop';
    this.myProfile = this.appConfig.config.myProfile;

    translateService.get('Web-Group.VISITING-PROFILE.title').subscribe(value => {
      titleService.setTitle(value);
    });
    document.getElementById('loaded-content').style.backgroundColor = '#f0ede9';
  }

  ngOnInit(): void {
    this.render2.removeClass(document.body, 'overflow-hidden');
    if (this.deviceType.value === DeviceTypes.mobile) {
      this.toggleNavigationBarService.isShowNavigationBar.next(false);
    }
  }

  ngAfterViewInit(): void {
    this.translateHighFivedTip();
  }

  backClicked() {
    document.getElementById('loaded-content').style.backgroundColor = '';
    // this.location.back();
    this.route.navigate([`${this.routerStateService.getPreviousUrl()}`]);
  }

  onSendMessage($event) {
    if (this.myProfile.memberType === 'S') {
      this.gotoPayment();
    } else {
      this.loaderService.isLoading.next(true);
      const encodeMessage = this.encodeContent($event);
      const encodeSpecialCharacters = this.encodeContent(encodeMessage);
      const message = {
        messageBody: encodeSpecialCharacters,
        conversationType: 'One',
        senderGuid: this.myProfile.publicId,
        senderName: this.myProfile.screenName,
        senderPhoto: this.myProfile.avatarUrl,
        referenceId: this.memberProfile$.value.id,
        source: SourceMessage.inbox,
        senderId: this.myProfile.id
      };
      this.ws.sendFirstMessage(message);

      this.memberProfile$.next({
        ...this.memberProfile$.value,
        conversation: {
          ...this.memberProfile$.value.conversation,
          isSentFirstMessage: true
        }
      });

      setTimeout(() => {
        this.dispatchMemberProfile();
        this.isShowOverlayNoticeMsg$.next(true);
        this.isShowInputSendMsg = false;
      }, 700);
    }
  }

  sendHiveFive() {
    if (this.myProfile.memberType === 'S') {
      this.gotoPayment();
    } else {
      this.loaderService.isLoading.next(true);
      const message = {
        conversationType: 'One',
        referenceId: this.memberProfile$.value.id,
        senderId: this.myProfile.id,
        senderGuid: this.myProfile.publicId,
        senderName: this.myProfile.screenName,
        senderPhoto: this.myProfile.avatarUrl,
        source: 'TPD',
      };
      this.ws.sendHighFive(message);

      this.memberProfile$.next({
        ...this.memberProfile$.value,
        conversation: {
          ...this.memberProfile$.value.conversation,
          isHighFive: true,
          isSentFirstMessage: true
        }
      });

      setTimeout(() => {
        this.dispatchMemberProfile();
        this.isShowOverlayNoticeHighFive$.next(true);
      }, 700);
    }
  }

  sendPhotoRequest() {
    if (this.myProfile.memberType === 'S') {
      this.gotoPayment();
    } else {
      this.loaderService.isLoading.next(true);
      const message = {
        conversationType: 'One',
        referenceId: this.memberProfile$.value.id,
        senderId: this.myProfile.id,
        senderGuid: this.myProfile.publicId,
        senderName: this.myProfile.screenName,
        senderPhoto: this.myProfile.avatarUrl,
        source: 'TPD',
      };
      this.ws.sendPhotoRequest(message);

      this.memberProfile$.next({
        ...this.memberProfile$.value,
        conversation: {
          ...this.memberProfile$.value.conversation,
          isRequestedPhoto: true,
          isSentFirstMessage: true
        }
      });

      setTimeout(() => {
        this.dispatchMemberProfile();
      }, 700);
    }
  }

  showInputSendMessage() {
    if (this.myProfile.memberType === 'S') {
      this.gotoPayment();
    } else {
      this.isShowInputSendMsg = true;
      if (this.deviceType.value === DeviceTypes.mobile) {
        focusInput();
      }
    }
  }

  showConversation() {
    if (this.memberProfile$.value.conversation.conversationId !== null && this.memberProfile$.value.conversation.isSentFirstMessage === true) {
      if (this.myProfile.memberType === 'N') {
        if (this.deviceType.value === DeviceTypes.mobile) {
          this.route.navigate([`${this.appConfig.config.culture}/chat/${this.memberProfile$.value.conversation.conversationId}`]);
        } else {
          this.isShowInputSendMsg = true;
        }
      } else {
        this.route.navigate([`${this.appConfig.config.culture}/chat/${this.memberProfile$.value.conversation.conversationId}`]);
      }
    }
  }

  toggleFavorite() {
    const favorite = !this.memberProfile$.value.isFavorite;
    this.memberProfile$.next({ ...this.memberProfile$.value, isFavorite: favorite });

    this.store.dispatch(MemberActions.toggleFavoriteMember({
      payload: {
        setState: favorite,
        memberId: this.memberProfile$.value.id
      }
    }));
  }

  closeOverlay() {
    this.isShowOverlayNoticeHighFive$.next(false);
    this.isShowOverlayNoticeMsg$.next(false);
  }

  encodeContent(value) {
    const el = document.createElement('div');
    el.innerText = el.textContent = value;
    value = el.innerHTML;
    return value;
  }

  dispatchMemberProfile() {
    this.store.dispatch(MemberActions.getMemberProfile({
      payload: {
        culture: this.appConfig.config.culture,
        userId: this.memberProfile$.value.publicId
      }
    }));
  }

  translateHighFivedTip() {
    const highfiveTipText = this.translateService.instant('Web-Group.VISITING-PROFILE.highfive_button_sent_link');
    const link = `<a href="${window.location.origin}/${this.appConfig.config.culture}/chat/${this.memberProfile$.value.conversation.conversationId}" style="text-decoration:none; color: #FF5533;">${highfiveTipText}</a>`;
    const tipHighfiveDescription = this.translateService.instant('Web-Group.VISITING-PROFILE.highfive_button_sent_description', { highfive_tip_button: link });
    const elementTextHighfive = document.getElementById('highfived-text');
    if (elementTextHighfive) {
      elementTextHighfive.innerHTML = tipHighfiveDescription;
    }
  }

  gotoPayment() {
    window.location.replace(`${window.location.origin}/${this.appConfig.config.culture}/payment/options?src=grouppost`);
  }

  ngOnDestroy() {
    document.getElementById('loaded-content').style.backgroundColor = '';
    if (this.deviceType.value === DeviceTypes.mobile) {
      this.toggleNavigationBarService.isShowNavigationBar.next(true);
    }

    this.memberProfileStore$.unsubscribe();
  }
}

export function focusInput() {
  const fakeInput = document.createElement('textarea');
  fakeInput.setAttribute('type', 'text');
  fakeInput.setAttribute('autocomplete', 'disabled');
  fakeInput.style.position = 'absolute';
  fakeInput.style.opacity = '0';
  fakeInput.style.height = '0';
  fakeInput.style.fontSize = '16px'; // disable auto zoom

  // you may need to append to another element depending on the browser's auto
  // zoom/scroll behavior
  document.body.prepend(fakeInput);

  // focus so that subsequent async focus will work
  fakeInput.focus();
  fakeInput.click();

  setTimeout(() => {
    const targetInput = document.getElementById('txtTextareaMessage');
    // now we can focus on the target input
    targetInput.focus();

    // cleanup
    fakeInput.remove();
  }, 500);
}
