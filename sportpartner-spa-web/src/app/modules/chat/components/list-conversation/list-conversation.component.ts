import { DetectDeviceService } from 'src/app/services/detect-device.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
// import { ToggleNavigationBarService } from 'src/app/services/toggle-navigation-bar.service';
import {
  Component, OnInit, ChangeDetectionStrategy,
  ChangeDetectorRef, Output, OnDestroy, ViewChild, ElementRef, AfterViewInit, Input, EventEmitter
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription, fromEvent, Subject } from 'rxjs';

import { trigger, transition, style, animate, state, query, animateChild, group } from '@angular/animations';
import { Store, select } from '@ngrx/store';
import * as ChatActions from '../../store/chat.actions';
import {
  distinctUntilChanged, map, filter, tap, debounceTime,
  share, takeUntil,
} from 'rxjs/operators';
import { ConversationListModel } from 'src/models/conversation-list.model';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { ChatEffects } from '../../store/chat.effects';
import { ACTION_ON_RECEIVE_MESSAGE_COMPLETELY } from 'src/app/const.actions';
import { MessageReceiveModel } from 'src/models/message-receive.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfig } from 'src/app/app.config';

import { ToggleSidePanelChatDetail } from 'src/app/services/toggle-panel-profile.service';
import { DeviceTypes } from 'src/app/const.enum';

const ITEMS_PER_PAGE = 20;
@Component({
  selector: 'app-list-conversation',
  templateUrl: './list-conversation.component.html',
  styleUrls: ['./list-conversation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationOverlay', [
      transition(':enter', [
        style({ opacity: 0 }), // From
        group([
          animate('0.3s ease', style({ opacity: 1 })), // to
          query('@animationMobileSwitchConversationListType', animateChild(), { optional: true }),
        ])
      ]),
      transition(':leave', [
        style({ opacity: 1 }), // From
        group([
          query('@animationMobileSwitchConversationListType', animateChild(), { optional: true }),
          animate('0.3s ease-out', style({ opacity: 0 })), // to
        ])
      ])
    ]),

    trigger('animationMobileSwitchConversationListType', [
      transition(':enter', [
        style({ transform: 'translateY(100vh)' }), // From
        animate('0.3s ease', style({ transform: 'translateY(0)' })), // to
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)' }), // From
        animate('0.3s ease', style({ transform: 'translateY(100vh)' })), // to
      ])
    ])
  ]
})
export class ListConversationComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('onScrollEventElement') onScrollEventElement: ElementRef;
  @ViewChild('boxTypeOverlay', { static: false }) boxTypeOverlay: ElementRef;

  listConversation$ = new BehaviorSubject<ConversationListModel[]>([]);
  buttonType$ = new BehaviorSubject<string>('Inbox');
  deviceType = this.detectDevice.deviceType$;
  isChangingListBoxType = false;
  @Input() isBackToList$ = new BehaviorSubject<boolean>(false);
  // @Input() reloadDetailConversation;

  selectedMessageItem$ = new BehaviorSubject<ConversationListModel>(undefined);
  // @Output() eventSelectedMessageItem = new EventEmitter<ConversationListModel>(true);
  @Output() listBoxType = new EventEmitter();

  // selectedRoomId$ = new BehaviorSubject<string>('');

  category$ = new BehaviorSubject<string>('Inbox');

  userProfile = new MemberProfileModel();
  store$: Observable<any>;
  receiveMessage$: Subscription;
  destroy = new Subject();
  destroy$ = this.destroy.asObservable();
  showBoxTypeOverlay: OverlayRef;

  ableScollDown = true;
  isOpenMobile = new BehaviorSubject(false);
  positionStrategy: any;
  // isFirstSeleted = false;
  conversationId = '';
  selectConversationNotInListSubcribe$: Subscription;
  // selectedConversation$: BehaviorSubject<ConversationListModel>;

  constructor(
    private detectDevice: DetectDeviceService,
    private overlay: Overlay,
    private appConfig: AppConfig,
    private actRoute: ActivatedRoute,
    private store: Store<{
      chatReducer: any,
      profileReducer: any
    }>,
    chatEffect: ChatEffects,

    private cd: ChangeDetectorRef,
    // private toggleNavigationBarService: ToggleNavigationBarService,
    private router: Router,
    private toggleSidePanel: ToggleSidePanelChatDetail,
  ) {

    this.store$ = this.store.select(state$ => state$.chatReducer);

    this.store$.pipe(
      map(loaded => loaded.selectedConversation),
      filter(loaded => loaded),
      distinctUntilChanged(),
    ).subscribe(conversation => {
      this.selectedMessageItem$.next(conversation);
    });

    store.select(state$ => state$.profileReducer).pipe(
      map(loaded => loaded.myMemberProfile),
      filter(profile => !!profile)
    ).subscribe(myProfile => {
      this.userProfile = myProfile;
    });



    // updating category
    this.store.select(state$ => state$.chatReducer).pipe(
      distinctUntilChanged(),
      filter(loaded => !!loaded.category),
      map(loaded => loaded.category)
    ).subscribe(cat => this.category$.next(cat));

    let isReloadList = false;

    this.store$.pipe(
      takeUntil(this.destroy),
      tap(({ ableLoadMore }) => {
        this.ableScollDown = ableLoadMore ?? true;
      }),
      map(loaded => loaded.channelConversations),
      distinctUntilChanged(),
      filter(conversations => !!conversations),
      tap((conversations: ConversationListModel[]) => {
        // no need dispatch event on Deleted list
        if (this.category$.value !== 'Deleted') {
          const newConversation = conversations.find(data => data.conversationType === 'NONE_EXISTED');
          if (newConversation) {
            isReloadList = true;
            this.store.dispatch(ChatActions.getConversationInfomation({
              conversationId: newConversation.conversationId,
              isAppendToList: true,
              messageType: newConversation.messageType,
              messageBody: newConversation.messageBody,
              isAppendMsgFromWs: true,
            }));
          }
        }
      }),
      share(),
      map(cat => cat.filter(data => data.conversationType !== 'NONE_EXISTED')),
    ).subscribe(conversations => {
      this.listConversation$.next(conversations);
    });


    this.receiveMessage$ = chatEffect.receiveMessage$.pipe(
      filter(type => type.type === ACTION_ON_RECEIVE_MESSAGE_COMPLETELY),
      filter(() => this.category$.value !== 'Deleted'),
      distinctUntilChanged(),
      map(loaded => loaded.payload),
    ).subscribe((message: MessageReceiveModel) => {
      const { isRead, senderId } = message;
      let unread = 1;
      if ((this.selectedMessageItem$.value
        && message.conversationId === this.selectedMessageItem$.value.conversationId
        && !this.isBackToList$.value && this.appConfig.config.myProfile.isPremium) || isRead || (senderId === this.appConfig.config.myProfile.id)) {
        unread = 0;
      }
      this.store.dispatch(ChatActions.updateConversationlist({
        messageComing: message,
        unreadCount: unread,
        isPremium: this.userProfile.isPremium,
        isDisabled: message.messageType === 'LeftConversation' ? true : false,
        sentOn: message.sentOnDate,
      }));
    });
  }

  ngOnInit(): void {
    this.isBackToList$.subscribe(value => {
      if (value) {
        this.selectedMessageItem$.next(undefined);
        document.querySelector('html').className = '';
        this.store.dispatch(ChatActions.selectedConversationCompleted({
          conversation: undefined
        }));
      }
    });
  }

  ngAfterViewInit() {
    const { conversationId } = this.actRoute.snapshot.params;
    if (conversationId) {
      const conversation = this.listConversation$.value.filter(c => c.conversationId === conversationId)[0];
      if (conversation) {
        this.onSelectedConversation(conversation);
      } else {
        this.selectConversationNotInListSubcribe$ = this.store.select(state$ => state$.chatReducer).pipe(
          takeUntil(this.destroy),
          map(loaded => loaded.conversationInfomation),
          filter(loaded => !!loaded),
          distinctUntilChanged()
        ).subscribe((res: ConversationListModel) => {
          if (res) {
            this.onSelectedConversation(res);
          }
        });
        this.store.dispatch(ChatActions.getConversationInfomation({
          conversationId: conversationId,
          isAppendToList: false
        }));

      }
    }

    fromEvent(window, 'scroll')
      .pipe(
        filter(() => this.deviceType.value === DeviceTypes.mobile),
        filter(() => !this.selectedMessageItem$.value),
        filter(() => this.ableScollDown),
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        debounceTime(300),
        map(() => window.scrollY),
        map(downwardScrollTop => document.body.scrollHeight - downwardScrollTop
        ),
        filter(x => x <= window.innerHeight + 100),
      )
      .subscribe(() => {
        this.lazyload();
      });

    const clientHeight = this.onScrollEventElement.nativeElement.clientHeight;
    fromEvent(this.onScrollEventElement.nativeElement, 'scroll').pipe(
      filter(() => this.deviceType.value === DeviceTypes.desktop || this.deviceType.value === DeviceTypes.tablet),
      map(() => this.onScrollEventElement.nativeElement.scrollTop),
      filter(() => this.ableScollDown),
      distinctUntilChanged(),
      map(downwardScrollTop =>
        this.onScrollEventElement.nativeElement.scrollHeight - downwardScrollTop
      ),
      filter(x => x <= clientHeight),
      debounceTime(300),
    ).subscribe(() => {
      this.lazyload();
    });

    this.positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.boxTypeOverlay)
      .withPositions([
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
        }
      ]);
  }

  private lazyload() {
    const lastTick = this.listConversation$.value[this.listConversation$.value.length - 1]
      ? this.listConversation$.value[this.listConversation$.value.length - 1].messageTick : undefined;

    if (lastTick) {
      this.store.dispatch(ChatActions.lazyLoadConversationList({
        tick: this.listConversation$.value[this.listConversation$.value.length - 1].messageTick,
        category: this.buttonType$.value,
        pageSize: ITEMS_PER_PAGE
      }));
    }
  }

  ngOnDestroy() {

    this.receiveMessage$.unsubscribe();
    this.listConversation$.next([]);
    this.destroy.next();
    this.destroy.complete();

    if (this.deviceType.value === DeviceTypes.mobile) {
      document.querySelector('html').className = '';
    }
  }

  toggleChangingListBoxType() {
    console.log('%c⧭', 'color: #7f2200', 'toggleChangingListBoxType');
    if (this.deviceType.value === DeviceTypes.desktop) {
      this.isChangingListBoxType = !this.isChangingListBoxType;
    } else {
      this.isOpenMobile.next(!this.isOpenMobile.value);
    }
  }

  choosedListBoxType(type) {
    this.conversationId = '';
    this.toggleSidePanel.isShowPanel$.next(false);
    this.listBoxType.emit(type);
    this.buttonType$.next(type);

    if (this.selectedMessageItem$.value) {
      this.selectedMessageItem$.next(undefined);
    }

    // this.selectedRoomId$.next('');
    window.history.replaceState({}, 'Chat', `/${this.appConfig.config.culture}/chat`);
    this.store.dispatch(ChatActions.getFirstListConversation({
      category: type,
      pageSize: ITEMS_PER_PAGE
    }));
    this.onScrollEventElement.nativeElement.scrollTop = 0;

    this.store.dispatch(ChatActions.selectedConversationCompleted({
      conversation: undefined
    }));
  }

  closeOverlaySwitchBox() {
    this.isOpenMobile.next(false);
    // this.cd.detectChanges();
  }

  onSelectedConversation(conversation: ConversationListModel) {
    if (conversation && this.deviceType.value === DeviceTypes.mobile) {
      document.querySelector('html').className = 'fixed-body';
    }
    this.isBackToList$.next(false);
    // this.selectedMessageItem$.next(conversation);
    const existed = this.listConversation$.value.find(v => v.conversationId === conversation.conversationId);
    if (existed) {
      this.store.dispatch(ChatActions.selectedConversation({
        conversationId: conversation.conversationId
      }));
    } else {
      this.selectConversationNotInList(conversation);
    }
  }

  selectConversationNotInList(conversation: ConversationListModel) {

    this.store.dispatch(ChatActions.selectedConversationCompleted({
      conversation
    }));
    this.selectConversationNotInListSubcribe$.unsubscribe();
  }

  gotoPayment() {
    window.location.href = `${window.location.origin}/${this.appConfig.config.culture}/payment/options?src=grouppost`;
    // window.location.replace(`${window.location.origin}/${this.appConfig.config.culture}/payment/options?src=grouppost`);
  }
}
