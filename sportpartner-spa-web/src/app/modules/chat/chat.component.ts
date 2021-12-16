import { DetectDeviceService } from './../../services/detect-device.service';
import {
  ACTION_DELETE_CONVERSATION_COMPLETELY,
  ACTION_BLOCK_CONVERSATION_COMPLETELY,
  ACTION_RESTORE_CONVERSATION_COMPLETELY,
} from './../../const.actions';
import { ChatEffects } from './store/chat.effects';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ToggleNavigationBarService } from 'src/app/services/toggle-navigation-bar.service';

import { trigger, transition, style, animate, state, group, query, animateChild } from '@angular/animations';
import { Store } from '@ngrx/store';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { ConversationListModel } from 'src/models/conversation-list.model';
import { filter, map, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { PremiumService } from 'src/app/services/premium.service';
import { Title } from '@angular/platform-browser';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { ToggleSidePanelChatDetail } from 'src/app/services/toggle-panel-profile.service';
import { PanelType, DeviceTypes } from 'src/app/const.enum';

import * as ChatActions from './store/chat.actions';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    trigger('animationShowChatBoxDetail', [
      transition(':enter', [
        style({ opacity: 0, position: '{{ position }}', top: 0, right: 0, left: 0, bottom: 100 }), // From
        animate('0.3s ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1, position: '{{ position }}', top: 0, right: 0, left: 0, bottom: 0 }), // From
        animate('0.3s ease', style({ opacity: 0 }))
      ])
    ]),

    trigger('animationListConversation', [
      state('showPanel', style({ minWidth: '353px' })),
      state('hidePanel', style({ minWidth: '449px' })),
      transition('* <=> *', animate('0.4s ease'))
    ]),

    trigger('animationDetailConversation', [
      state('showPanel', style({ width: 'calc(100% - 706px)' })),
      state('hidePanel', style({ width: '100%' })),
      transition('* <=> *', animate('0.6s ease'))
    ]),

    /* trigger('animationPanelProfile', [
      state('showPanel', style({ width: '353px' })),
      state('hidePanel', style({ width: '0' })),
      transition('* <=> *', animate('0.5s ease'))
    ]), */

    trigger('animationClosingPanelProfile', [
      transition(':leave', [
        style({ transform: 'translateX(0)', position: 'absolute', top: 0, right: 0, left: 0 }), // From
        animate('0.3s 0s ease', style({ transform: 'translateX(-100%)' }))
      ])
    ]),

    trigger('animationOpenningPanelProfile', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', position: 'absolute', top: 0, right: 0, left: 0 }), // From
        animate('0.3s 0s ease', style({ transform: 'translateX(0)' }))
      ])
    ]),

    trigger('animationClosingPanelGroupInfo', [
      transition(':leave', [
        style({ transform: 'translateX(0)', position: 'absolute', top: 0, right: 0, left: 0 }), // From
        animate('0.3s 0s ease', style({ transform: 'translateX(100%)' }))
      ])
    ]),

    trigger('animationOpenningPanelGroupInfo', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', position: 'absolute', top: 0, right: 0, left: 0 }), // From
        animate('0.3s 0s ease', style({ transform: 'translateX(0)' }))
      ])
    ]),
    // overlay popup
    trigger('animationOverlayMobilePopupUserProfile', [
      transition(':enter', [
        group([
          style({ opacity: 0 }), // From
          animate('0.3s ease-out', style({ opacity: 1 })), // to
          query('@animationMobilePopupUserProfile', animateChild())
        ])

      ]),
      transition(':leave', [
        group([
          query('@animationMobilePopupUserProfile', animateChild()),
          style({ opacity: 1 }), // From
          animate('0.3s ease-out', style({ opacity: 0 })), // to
        ])
      ])
    ]),

    // main popup
    trigger('animationMobilePopupUserProfile', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', position: 'absolute' }), // From
        animate('0.3s ease-out', style({ transform: 'translateX(0)' })), // to
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)' }), // From
        animate('0.3s ease-out', style({ transform: 'translateX(100%)' })), // to
      ])
    ])
  ]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {

  panelType$ = new BehaviorSubject<string>(PanelType.GROUP_INFO);

  deviceType = this.appConfig.config.deviceType$;

  // Listen event selecting from child component
  selectingConversation$ = new BehaviorSubject<ConversationListModel>(undefined);

  // confirmed Conversation and sent to <app-detail-conversation>
  selectedConversation$ = new BehaviorSubject<ConversationListModel>(undefined);

  listConversation$: Observable<ConversationListModel[]>;

  backList$ = new BehaviorSubject<boolean>(false);

  mobileScrollPosition: any;

  mobileIsSelectedConversation = false;

  waitingTime = 500;

  // reloadDetailConversation = false;

  // selectingConversationSub: Subscription;

  isShowPanelUserProfile$ = new BehaviorSubject<boolean>(false);

  animationPanel = 'hidePanel';

  orientationDevice$ = this.detectDevice.orientation$;
  listBoxType = 'Inbox';

  destroy = new Subject();

  constructor(
    private chatEffects: ChatEffects,
    titleService: Title,
    translateService: TranslateService,
    private actRoute: ActivatedRoute,
    private appConfig: AppConfig,
    private store: Store<{ chatReducer: any }>,
    private toggleNavigationBarService: ToggleNavigationBarService,
    private cd: ChangeDetectorRef,
    private premiumService: PremiumService,
    gtmService: GoogleTagManagerService,
    private detectDevice: DetectDeviceService,
    private toggleSidePanelChatDetail: ToggleSidePanelChatDetail) {

    /* gtmService.pushTag({
      'pageType': 'matches-details',
      'pageStatusCode': '200',
      'userId': '10ebaa96-5ee0-4c25-94bc-e58d798b6e58',
      'userAge': '99',
      'userGender': 'M',
      'userPhoto': 'Y',
      'userLocation': 'Venlo',
      'userSports': '1',
      'userSportsSelected': 'QC',
      'userSubscription': 'P3a',
      'userApproved': 'Y',
      'userStatus': 'active',
      'userLogins': '21',
      'userFavorites': '0',
      'searchRadius': '20',
      'searchGender': 'M',
      'searchAge': '91-99',
      'searchSingle': 'Y',
      'conversationMessagesSent': '52',
      'conversationMessagesReceived': '15',
      'conversations': '22',
      'countryCode': 'nl',
      'languageCode': 'en',
      'daysOfFree': '2',
      'daysOfPremium': '9'
    }); */
    /* const title = translateService.instant('Conversation.INBOX.title');
    titleService.setTitle(title); */
    translateService.get('Conversation.INBOX.title').subscribe(value => {
      titleService.setTitle(value);
    });

    this.mobileScrollPosition = new ScrollPosition(window);

    this.premiumService.premiumInPage.next(false);

    const { conversationId } = this.actRoute.snapshot.params;
    if (conversationId) {
      this.waitingTime = 0;
    }

    this.listConversation$ = this.store.select(state$ => state$.chatReducer)
      .pipe(
        map(loaded => loaded.channelConversations),
      );

    this.store.select(state$ => state$.chatReducer).pipe(
      takeUntil(this.destroy.asObservable()),
      map(loaded => loaded.selectedConversation),
      distinctUntilChanged(),
      tap(selectedConversation => {
        this.selectedConversation$.next(selectedConversation);
      }),
      filter(selectedConversation => selectedConversation),
    ).subscribe(selectedConversation => {
      this.onSelectingMessage(selectedConversation);
      window.history.replaceState({}, 'Chat', `/${this.appConfig.config.culture}/chat/${selectedConversation.conversationId}`);
      this.mobileScrollPosition.prepareFor('up');
      this.selectedConversation$.next(selectedConversation);
      // this.cd.detectChanges();
    });


    this.toggleSidePanelChatDetail.panelType$.pipe(
      distinctUntilChanged()
    ).subscribe(panelType => {
      this.panelType$.next(panelType);
    });
  }

  ngOnInit(): void {
    this.toggleSidePanelChatDetail.isShowPanel$
      .pipe(distinctUntilChanged())
      .subscribe(status => {
        this.animationPanel = status ? 'showPanel' : 'hidePanel';
        this.cd.detectChanges();
      });
  }

  ngAfterViewInit() {
    this.chatEffects.deleteConversation$.pipe(
      filter(load => load.type === ACTION_DELETE_CONVERSATION_COMPLETELY),
      distinctUntilChanged(),
      map(loaded => loaded.conversationId)
    ).subscribe(conversationId => {
      this.onDeleteOrBlockConversationCompleted(true);
    });

    this.chatEffects.blockConversation$.pipe(
      filter(load => load.type === ACTION_BLOCK_CONVERSATION_COMPLETELY),
      distinctUntilChanged(),
      map(loaded => loaded.conversationId)
    ).subscribe(conversationId => {
      this.onDeleteOrBlockConversationCompleted(true);
    });

    this.chatEffects.restoreConversation$.pipe(
      filter(load => load.type === ACTION_RESTORE_CONVERSATION_COMPLETELY),
      distinctUntilChanged(),
      map(loaded => loaded.conversationId)
    ).subscribe(conversationId => {
      this.onDeleteOrBlockConversationCompleted(true);
    });
  }

  ngOnDestroy() {
    this.toggleSidePanelChatDetail.isShowPanel$.next(false);
    // this.selectedConversation$.next(undefined);
    this.selectedConversation$.next(undefined);
    if (this.deviceType.value === DeviceTypes.mobile) {
      this.toggleNavigationBarService.isShowNavigationBar.next(true);
      this.mobileIsSelectedConversation = false;
    }
    // this.selectingConversationSub.unsubscribe();
    this.store.dispatch(ChatActions.selectedConversation({
      conversationId: undefined
    }));
  }

  onSelectingMessage(conversationRoom: ConversationListModel) {
    // this.reloadDetailConversation = false;
    if (conversationRoom && this.selectingConversation$.value
      && conversationRoom.conversationId === this.selectingConversation$.value.conversationId
      && conversationRoom.isDisabled === this.selectingConversation$.value.isDisabled) {
      return;
    }

    this.selectingConversation$.next(conversationRoom);
    this.selectedConversation$.next(conversationRoom);

    if (conversationRoom) {
      this.toggleSidePanelChatDetail.panelType$.next(conversationRoom.conversationType === 'Group' ? PanelType.GROUP_INFO : PanelType.USER_PROFILE);
    }

    if (this.deviceType.value === DeviceTypes.mobile && conversationRoom) {
      setTimeout(() => {
        this.toggleNavigationBarService.isShowNavigationBar.next(false);
      }, 500);

      setTimeout(() => {
        this.mobileIsSelectedConversation = true;
        this.cd.detectChanges();
        this.waitingTime = 500;
      }, this.waitingTime);
    }

    this.backList$.next(false);

  }

  onBackListClicked(evt) {
    this.selectedConversation$.next(undefined);
    this.selectingConversation$.next(undefined);
    this.backList$.next(true);
    window.history.replaceState({}, 'Chat', `/${this.appConfig.config.culture}/chat`);

    if (this.deviceType.value === DeviceTypes.mobile) {
      this.toggleNavigationBarService.isShowNavigationBar.next(true);
      this.mobileIsSelectedConversation = false;
      setTimeout(() => {
        this.mobileScrollPosition.restore();
      }, 100);
    }
  }

  /* onReloadDetailConversation($event) {
    this.reloadDetailConversation = $event;
  } */

  onDeleteOrBlockConversationCompleted(ev) {
    if (ev) {
      if (this.deviceType.value === DeviceTypes.mobile) {
        this.onBackListClicked(true);
      } else {
        this.selectedConversation$.next(undefined);
      }
    }
  }

  choosedListBoxType($event) {
    this.listBoxType = $event;
  }
}

export function ScrollPosition(node) {

  this.node = node;
  this.previousScrollHeightMinusTop = 0;
  this.readyFor = 'up';
}

ScrollPosition.prototype.restore = function () {

  if (this.readyFor === 'up') {

    window.scrollTo(0, this.previousScrollHeightMinusTop);
  }
};

ScrollPosition.prototype.prepareFor = function (direction) {
  this.readyFor = direction || 'up';
  this.previousScrollHeightMinusTop = window.scrollY;
};
