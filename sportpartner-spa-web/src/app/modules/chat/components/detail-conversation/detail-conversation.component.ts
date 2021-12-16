import { MessageStatus } from './../../../../const.enum';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { ToggleNavigationBarService } from 'src/app/services/toggle-navigation-bar.service';
import {
  Component, OnInit, ChangeDetectionStrategy, Output, OnDestroy,
  ViewChild, ViewContainerRef, ComponentFactoryResolver, AfterViewInit,
  ComponentRef, ElementRef, Input,
  ChangeDetectorRef, EventEmitter, TemplateRef, Renderer2
} from '@angular/core';
import { BehaviorSubject, Subscription, Subject, fromEvent } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Store, select } from '@ngrx/store';
import {
  map, filter, distinctUntilChanged,
  debounceTime, takeUntil, tap, first
} from 'rxjs/operators';
import { MessageDetailItemComponent } from '../message-detail-item/message-detail-item.component';
import { MessageDetailItem, IMessageDetail } from '../message-detail-item/message-detail-item';
import { MessageReceiveModel } from 'src/models/message-receive.model';

import * as ChatAction from '../../store/chat.actions';
import * as MemberAction from '../../../members/members.actions';
import * as GroupAction from '../../../groups/store/group.actions';

import { WebSocketService } from 'src/app/services/websocket.service';
import { AppConfig } from 'src/app/app.config';
import { ChatEffects } from '../../store/chat.effects';
import {
  ACTION_GET_MESSAGES_DETAIL_SCROLL_DOWN_COMPLETELY,
  ACTION_GET_MESSAGES_DETAIL_SCROLL_UP_COMPLETELY,
  ACTION_ON_RECEIVE_MESSAGE_COMPLETELY,
  ACTION_GET_MESSAGES_DETAIL_COMPLETELY,
} from 'src/app/const.actions';
import { animate, style, transition, trigger } from '@angular/animations';
import { ConversationListModel } from 'src/models/conversation-list.model';
import { ToggleSidePanelChatDetail } from 'src/app/services/toggle-panel-profile.service';
import { LoaderService } from 'src/app/services/loader.service';
import { DeviceTypes, PanelType } from 'src/app/const.enum';

const waitingTime = 300;

const ITEMS_PER_PAGE = 20;
@Component({
  selector: 'app-detail-conversation',
  templateUrl: './detail-conversation.component.html',
  styleUrls: ['./detail-conversation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toggleLoading', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.1s ease', style({ opacity: 1 })), // to
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.3s ease', style({ opacity: 0 })), // to
      ])
    ]),
    trigger('toggleWaitingTop', [
      transition(':enter', [
        style({ height: '*' }),
        animate('0.2s ease', style({ height: 0 })), // to
      ])
    ])
  ]
})
export class DetailConversationComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private cd: ChangeDetectorRef,
    public translate: TranslateService,
    private store: Store<{
      chatReducer,
      profileReducer,
      groupReducer
    }>,
    private ws: WebSocketService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appConfig: AppConfig,
    private chatEffects: ChatEffects,
    private render: Renderer2,
    private toggleNavigationBarService: ToggleNavigationBarService,
    private toggleSidePanelChatDetail: ToggleSidePanelChatDetail,
    private loaderService: LoaderService,
  ) {

    this.store.select(state$ => state$.chatReducer).pipe(
      takeUntil(this.destroy),
      map(loaded => loaded.selectedConversation),
      filter(loaded => loaded),
      distinctUntilChanged(),
    ).subscribe((selectedConversation: ConversationListModel) => {
      if (selectedConversation.conversationType === 'Group') {
        this.toggleSidePanelChatDetail.setIdPanel = '';
      }
      this.room.next(selectedConversation);
    });

    this.store.select(state$ => state$.profileReducer).subscribe(userProfile => {
      this.userProfile$.next(userProfile);
    });

    this.store.select(state$ => state$.chatReducer).pipe(
      distinctUntilChanged(),
      filter(loaded => !!loaded.category),
      map(loaded => loaded.category)
    ).subscribe(cat => this.category$.next(cat));

    this.messageSettings = this.appConfig.config.messageSettings;

    //#region First loaded message histories
    this.getFirtsMessagesDetail$ = this.chatEffects.getFirtsMessagesDetail$.pipe(
      filter(load => load.type === ACTION_GET_MESSAGES_DETAIL_COMPLETELY),
      distinctUntilChanged(),
      filter(() => !!this.room.value),
      map(loaded => loaded.payload),
      tap(() => {
        switch (true) {
          case this.messageSettings.isReadableGroup && this.room.value.conversationType === 'Group':
          case this.messageSettings.isReadableOne && this.room.value.conversationType === 'One':
            console.log('%c⧭', 'color: #00ff88', 'Mark Read All');
            this.ws.markReadAll(this.room.value.conversationId);
            break;
        }
      })
    ).subscribe(data => {
      const { messageData, ableToLoadDown, ableToLoadUp, unreadTick } = data;
      this.unreadTick = unreadTick;
      this.ableToLoadDown$.next(this.allowRead && ableToLoadDown);
      this.ableToLoadUp$.next(this.allowRead && ableToLoadUp);
      if (messageData && messageData.length > 0) {
        this.smallestTick$.next(messageData[0].tick);
        this.lastTick$.next(messageData[messageData.length - 1].tick);
        // last Message not existed on GUI
        if (!this.cpnMessageDown) {
          if (this.vcrChatDetailContainer) {
            this.loadMessagesScrollDown(messageData).then((components) => {

              this.cpnMessageUp = components[0];
              this.cpnMessageUp.changeDetectorRef.markForCheck();
              this.oldestLabelTime.date = messageData[0].sentOnDate;

              setTimeout(() => {
                if (!ableToLoadDown) {
                  // this.smoothScroll$.next(true);
                  setTimeout(() => {
                    this.scrollContentToBottom();
                    this.isShowLoading$.next(false);
                  }, 500);
                } else {
                  if (messageData.length < ITEMS_PER_PAGE) {
                    this.distpatchScrollDown();
                    this.isShowLoading$.next(false);
                  } else {
                    // const scrollTo = this.bodyMessages.nativeElement.querySelector('.label-message-unread-tick').offsetTop;
                    this.bodyMessages.nativeElement.querySelector('.label-message-unread-tick').scrollIntoView();
                    // this.bodyMessages.nativeElement.scrollTop = scrollTo;
                    this.isShowLoading$.next(false);
                  }
                }

              }, waitingTime);
            });
          }
        }
      } else {
        this.isShowLoading$.next(false);
      }
    });
    //#endregion

    //#region Scroll up
    this.getMessageDetailScrollUp$ = this.chatEffects.getMessageDetailScrollUp$.pipe(
      filter(() => this.userProfile$.value.memberType !== 'N'),
      filter(load => load.type === ACTION_GET_MESSAGES_DETAIL_SCROLL_UP_COMPLETELY),
      map(loaded => loaded.payload),
      distinctUntilChanged()
    ).subscribe(data => {
      this.isRealTime$.next(false);
      const { messageData, ableToLoadUp, unreadTick } = data;

      this.unreadTick = unreadTick;
      this.ableToLoadUp$.next(ableToLoadUp);

      if (messageData && messageData.length > 0) {

        this.scrollPosition.prepareFor('up');
        this.smallestTick$.next(messageData[0].tick);

        this.loadMessagesScrollUp(messageData).then(() => {
          this.cpnMessageUp.changeDetectorRef.markForCheck();

          this.isLoadingHistories = false;

          setTimeout(() => {
            if (messageData.length > 0) {
              this.scrollPosition.restore();
              this.lastPosition = this.deviceType.value === DeviceTypes.desktop ? this.bodyMessages.nativeElement.scrollTop : window.scrollY;
            }

          }, waitingTime);
        });
      } else {
        this.isLoadingHistories = false;

        this.isShowLoading$.next(false);
      }
    });
    //#endregion

    //#region Scroll down
    this.chatEffects.getMessageDetailScrollDown$.pipe(
      filter(() => this.userProfile$.value.memberType !== 'N'),
      filter(load => load.type === ACTION_GET_MESSAGES_DETAIL_SCROLL_DOWN_COMPLETELY),
      map(loaded => loaded.payload),
      distinctUntilChanged(),
    ).subscribe(data => {
      const { messageData, ableToLoadDown, unreadTick } = data;
      this.unreadTick = unreadTick;
      this.ableToLoadDown$.next(ableToLoadDown);

      if (messageData && messageData.length > 0) {
        // this.scrollPosition.prepareFor('down');
        this.lastTick$.next(messageData[messageData.length - 1].tick);

        this.loadMessagesScrollDown(messageData).then((components) => {

          this.cpnMessageDown.changeDetectorRef.markForCheck();
          // this.scrollPosition.restore();
          this.isLoadingHistories = false;
          this.smoothScroll$.next(true);
          setTimeout(() => {
            if (data && data.length > 0) {
              this.lastPosition = this.bodyMessages.nativeElement.scrollTop;
            }
            if (!ableToLoadDown) {
              this.scrollContentToBottom();
            }
            if (this.isShowLoading$.value) {

              this.isShowLoading$.next(false);
            }
          }, waitingTime);
        });
      } else {
        this.isLoadingHistories = false;

        this.isShowLoading$.next(false);
      }
    });
    //#endregion

    //#region  On real time
    this.chatEffects.receiveMessage$.pipe(
      takeUntil(this.destroy),
      // filter(() => this.userProfile$.memberType !== 'N'),
      filter(() => !!this.room.value),
      filter(load => load.type === ACTION_ON_RECEIVE_MESSAGE_COMPLETELY),
      filter(() => !this.ableToLoadDown$.value),
      filter(load => {
        const { conversationId } = load.payload;
        return conversationId === this.room.value.conversationId;
      }),
      filter(loaded => {
        return this.category$.value !== 'Deleted';
      }),
      map(loaded => loaded.payload),
      distinctUntilChanged(),
      tap(({ senderId }) => {
        if (senderId !== this.appConfig.config.myProfile.id) {
          const po = this.bodyMessages.nativeElement.scrollTop + this.bodyMessages.nativeElement.clientHeight + 50;
          this.isAtBottomContent$.next(po >= this.bodyMessages.nativeElement.scrollHeight);
        }
      })
    ).subscribe((data: MessageReceiveModel) => {
      this.isRealTime$.next(true);
      const message: MessageReceiveModel = data;

      let cssClassName = 'row-message';

      this.lastTick$.next(message.tick);

      if (this.lastLabelTime.date.toLowerCase() !== message.sentOnDate.toLowerCase()) {
        let lblDate = message.sentOnDate;

        if (message.sentOnDateType === 'key') {
          lblDate = this.translate.instant(`Web-Account.CONVERSATION.${message.sentOnDate.charAt(0).toUpperCase() + message.sentOnDate.slice(1)}`);
        }
        if (this.vcrChatDetailContainer) {
          this.vcrChatDetailContainer.createEmbeddedView(this.tplLabelTime, { date: lblDate });
        }

        this.lastLabelTime.label = lblDate;
        this.lastLabelTime.date = message.sentOnDate;
      }

      if (this.cpnMessageDown) {
        if (message.senderId === this.cpnMessageDown.instance.message.value.senderId) {

          this.cpnMessageDown.instance.isShowAvatar.next(false);
          // cssClassName = 'same-sender';
          this.cpnMessageDown.changeDetectorRef.detectChanges();
        } else {
          cssClassName = 'diff-sender-down';
        }
      }
      this.cpnMessageDown = this.loadMessageDetailComponent(message, undefined, true, true, cssClassName, message.isMyMessage ? MessageStatus.SENDING : MessageStatus.SENT);

      if (this.cpnMessageDown) {
        this.cpnMessageDown.changeDetectorRef.markForCheck();
      }

      if (this.isAtBottomContent$.value) {
        this.smoothScroll$.next(true);
        setTimeout(() => {
          this.scrollContentToBottom();
        }, 500);
      }
    });
  }
  @ViewChild('chatDetailContainer', { read: ViewContainerRef }) vcrChatDetailContainer: ViewContainerRef;

  @ViewChild('tplLabelTime') tplLabelTime: TemplateRef<any>;

  @ViewChild('tplLabelUnreadTick') tplLabelUnreadTick: TemplateRef<any>;

  @ViewChild('scrollContent') private bodyMessages: ElementRef;

  @ViewChild('scrollAnchor') private scrollAnchor: ElementRef;

  @Output() backToList = new EventEmitter<any>(false);

  // @Output() reloadDetailConversation = new EventEmitter();

  // @Input() room = new BehaviorSubject<ConversationListModel>(undefined);
  room = new BehaviorSubject<ConversationListModel>(undefined);

  deviceType = this.appConfig.config.deviceType$;

  lastTick$ = new BehaviorSubject<number>(0);

  smallestTick$ = new BehaviorSubject<number>(0);

  store$: Subscription;

  cpnMessageDown: ComponentRef<IMessageDetail>;

  cpnMessageUp: ComponentRef<IMessageDetail>;

  isLoadingHistories = false;

  isShowListButton = false;

  messageSettings: any;

  destroy = new Subject();

  destroy$ = this.destroy.asObservable();

  lastLabelTime = {
    date: '',
    label: ''
  };

  oldestLabelTime = {
    date: '',
    label: ''
  };

  lastPosition = 0;

  isRealTime$ = new BehaviorSubject<boolean>(false);

  scrollPosition: any;

  ableToLoadDown$ = new BehaviorSubject<boolean>(false);

  ableToLoadUp$ = new BehaviorSubject<boolean>(true);

  smoothScroll$ = new BehaviorSubject<boolean>(false);

  isShowLoading$ = new BehaviorSubject<boolean>(false);

  unreadTick = -1;
  unreadCount$ = new BehaviorSubject<number>(0);

  countCpn = 0;

  allowRead = true;

  elScrollingEvent: any;

  getMessageDetailScrollUp$ = new Subscription;
  getMessageDetailScrollDown$ = new Subscription;
  getFirtsMessagesDetail$ = new Subscription;
  room$: Subscription;

  userProfile$ = new BehaviorSubject<MemberProfileModel>(undefined);

  isAtBottomContent$ = new BehaviorSubject<boolean>(true);
  category$ = new BehaviorSubject<string>('Inbox');

  isOpenningSidePanel = false;
  isUserDeleted$ = new BehaviorSubject(false);

  isShakeBtn$ = new BehaviorSubject<boolean>(false);

  isDeletedMemberAtGroup: boolean;
  //#endregion

  ngOnInit(): void {
    this.room$ = this.room.pipe(
      takeUntil(this.destroy$),
      filter(data => !!data),
      distinctUntilChanged(),
      tap(() => {
        this.isLoadingHistories = true;
        if (this.room.value === undefined) {
          this.resetAll();
        } else {

          // Pre-load the member profile when conversation type is ONE
          if (this.room.value.conversationType === 'One') {
            this.store.dispatch(MemberAction.getMemberProfile({
              payload: {
                userId: this.room.value.referenceId,
                culture: this.appConfig.config.culture,
              }
            }));
            this.store.pipe(
              select(state$ => state$.profileReducer),
              map(loaded => loaded.memberProfile),
              distinctUntilChanged(),
              filter(loaded => loaded),
            ).subscribe(data => {
              const { isDeletedUser } = data;
              this.isUserDeleted$.next(isDeletedUser);
            });

          } else {
            this.isUserDeleted$.next(false);
            // Pre-load the Group-Info when conversation type is GROUP
            this.store.dispatch(GroupAction.getGroupDetailById({
              payload: {
                groupId: this.room.value.referenceId,
                languageCode: this.appConfig.config.language
              }
            }));
          }
          if (this.deviceType.value !== 'tablet') {
            this.loaderService.isLoading.next(false);
          }
        }
      }),
      filter(conversation => !!conversation)
    ).subscribe((conversation: ConversationListModel) => {

      this.isShowListButton = false;
      this.isShowLoading$.next(true);
      this.resetAll();
      this.unreadCount$.next(conversation.unreadCount);

      this.ws.joinRoom(conversation.conversationId);
      this.cd.markForCheck();

      this.allowRead = (conversation.conversationType === 'Group' && this.messageSettings.isReadableGroup)
        || (conversation.conversationType === 'One' && this.messageSettings.isReadableOne);

      this.cd.detectChanges();

      // if (this.allowRead) {
      this.store
        .dispatch(ChatAction.getMessagesDetail({
          payload: {
            conversationId: conversation.conversationId,
            countryCode: this.appConfig.config.country,
            pageSize: this.allowRead ? ITEMS_PER_PAGE : 3,
            category: this.category$.value,
          }
        }));
      // } else {
      //   this.isShowLoading$.next(false);
      // }
    });

    if (!(this.messageSettings.isReadableGroup || this.messageSettings.isReadableOne)) {
      this.allowRead = false;
      this.cd.detectChanges();
      this.isShowLoading$.next(false);
    }
  }

  ngOnDestroy() {
    if (this.room$) {
      this.room$.unsubscribe();
    }
    this.resetAll();
    this.destroy.next();
    this.destroy.complete();
    this.getFirtsMessagesDetail$.unsubscribe();
    this.getMessageDetailScrollDown$.unsubscribe();
    this.getMessageDetailScrollUp$.unsubscribe();
    this.ws.leaveRoom(this.room.value.conversationId);
  }

  backList() {
    this.toggleNavigationBarService.isShowNavigationBar.next(true);
    this.ableToLoadUp$.next(false);
    this.ws.leaveRoom(this.room.value.conversationId);
    setTimeout(() => {
      this.backToList.emit(true);
    }, 500);

  }

  // First Load message details
  ngAfterViewInit() {
    this.elScrollingEvent = this.bodyMessages.nativeElement; // this.deviceType === 'desktop' ? this.bodyMessages.nativeElement : window;
    this.scrollPosition = new ScrollPosition(this.bodyMessages.nativeElement);
    const b = 30;
    let currentScrollTop = 0;
    let st = 0;
    fromEvent(this.elScrollingEvent, 'scroll').pipe(
      takeUntil(this.destroy$),
      filter(() => !this.isLoadingHistories),
      debounceTime(100),
      distinctUntilChanged(),
      map(() => this.bodyMessages.nativeElement.scrollTop),
    ).subscribe(scrollTop => {
      const a = scrollTop;
      currentScrollTop = scrollTop;
      if (st < currentScrollTop && a > b
        && this.bodyMessages.nativeElement.scrollHeight - scrollTop <= this.bodyMessages.nativeElement.clientHeight + 10) {
        this.distpatchScrollDown();

        const po = this.bodyMessages.nativeElement.scrollTop + this.bodyMessages.nativeElement.clientHeight + 50;
        this.isAtBottomContent$.next((po >= this.bodyMessages.nativeElement.scrollHeight));

      } else if (st > currentScrollTop && (a <= b) && scrollTop <= 50) {
        this.distpatchScrollUp();
      }
      st = currentScrollTop;
    });
  }

  scrollContentToBottom(): void {
    if (this.allowRead) {
      this.isRealTime$.next(true);
      this.bodyMessages.nativeElement.scrollTop = this.bodyMessages.nativeElement.scrollHeight;
      setTimeout(() => {
        this.smoothScroll$.next(false);
        this.isAtBottomContent$.next(true);
      }, 1300);
    }
  }

  loadMessageDetailComponent(message: MessageReceiveModel,
    index?: number, isAnimation: boolean = true, isShowAvatar = true,
    cssClass = 'message',
    messageStatus = MessageStatus.SENT): ComponentRef<IMessageDetail> {
    if (this.vcrChatDetailContainer) {
      const initmessage = new BehaviorSubject<any>([]);

      const cpnMessageDetail = new MessageDetailItem(
        MessageDetailItemComponent, initmessage, undefined, new BehaviorSubject<boolean>(isShowAvatar), new BehaviorSubject<ConversationListModel>(this.room.value)
      );

      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(cpnMessageDetail.component);

      const componentRef = this.vcrChatDetailContainer.createComponent<IMessageDetail>(componentFactory, index);

      this.render.addClass(componentRef.location.nativeElement, cssClass);

      componentRef.instance.message.next(message);


      componentRef.instance.isAnimate.next(isAnimation);
      componentRef.instance.isShowAvatar.next(isShowAvatar);

      componentRef.instance.conversation.next(this.room.value);

      componentRef.instance.messageStatus.next(messageStatus);

      componentRef.changeDetectorRef.detectChanges();

      // Listening event (click) from Avatar <message-item-detail>
      componentRef.instance.eventClickedAvatar
        .subscribe(userId => {
          this.eventClickedAvatar(userId);
        });

      return componentRef;
    }
  }

  eventClickedAvatar(userId) {
    if (this.isDeletedMemberAtGroup && this.toggleSidePanelChatDetail.idPanel === userId) {
      this.toggleDeleteMember(userId);
    } else {
      if (this.toggleSidePanelChatDetail.idPanel !== userId) {
        this.store.dispatch(MemberAction.getMemberProfile({
          payload: {
            userId: userId,
            culture: this.appConfig.config.culture,
          }
        }));
        this.store.pipe(
          select(state$ => state$.profileReducer),
          map(loaded => loaded.memberProfile),
          filter(loaded => !!loaded),
          distinctUntilChanged(),
          first(),
        ).subscribe((data: MemberProfileModel) => {
          if (data) {
            switch (true) {
              case this.deviceType.value === DeviceTypes.mobile && data.isDeletedUser && this.room.value.conversationType === 'Group':
                this.toggleDeleteMember(userId);
                this.isDeletedMemberAtGroup = true;
                break;
              default:
                this.toggleSidePanel(userId, PanelType.USER_PROFILE);
                this.isDeletedMemberAtGroup = false;
                break;
            }
          }
        });
      } else {
        this.toggleSidePanel(userId, PanelType.USER_PROFILE);
      }
    }
  }

  loadMessagesScrollDown(messages: MessageReceiveModel[]) {
    this.countCpn += messages.length;
    const arrPromise = [];

    messages.forEach((message) => {
      const working = new Promise((resolve) => {
        if (message.tick === this.unreadTick) {
          this.vcrChatDetailContainer.createEmbeddedView(this.tplLabelUnreadTick, { number: this.unreadCount$.value });
        }
        let cssClassName = 'row-message';
        if (this.lastLabelTime.date.toLowerCase() !== message.sentOnDate.toLowerCase()) {
          let lblDate = message.sentOnDate;
          if (message.sentOnDateType === 'key') {
            lblDate = this.translate.instant(`Web-Account.CONVERSATION.${message.sentOnDate.charAt(0).toUpperCase() + message.sentOnDate.slice(1)}`);
          }

          this.vcrChatDetailContainer.createEmbeddedView(this.tplLabelTime, { date: lblDate });
          this.lastLabelTime.label = lblDate;
          this.lastLabelTime.date = message.sentOnDate;
        }

        if (this.cpnMessageDown) {
          if (message.senderId === this.cpnMessageDown.instance.message.value.senderId) {

            this.cpnMessageDown.instance.isShowAvatar.next(false);
            // cssClassName = 'same-sender';
            this.render.addClass(this.cpnMessageDown.location.nativeElement, cssClassName);
          } else {
            cssClassName = 'diff-sender-down';
          }
        }

        this.cpnMessageDown = this.loadMessageDetailComponent(message, undefined, false, true, cssClassName, MessageStatus.SENT);
        this.render.addClass(this.cpnMessageDown.location.nativeElement, message.messageType);

        resolve(this.cpnMessageDown);
      });

      arrPromise.push(working);
    });
    return Promise.all(arrPromise);
  }

  loadMessagesScrollUp(messages: MessageReceiveModel[]) {
    this.countCpn += messages.length;
    const revertArrMessage = messages.slice().reverse();

    const arrPromise = [];

    revertArrMessage.forEach((message) => {
      const working = new Promise((resolve) => {

        let cssClassName = 'row-message';

        if (this.oldestLabelTime.date.toLowerCase() !== message.sentOnDate.toLowerCase()) {
          let lblDate = message.sentOnDate;
          if (message.sentOnDateType === 'key') {
            lblDate = this.translate.instant(`Web-Account.CONVERSATION.${message.sentOnDate.charAt(0).toUpperCase() + message.sentOnDate.slice(1)}`);
          }

          this.vcrChatDetailContainer.createEmbeddedView(this.tplLabelTime, { date: lblDate }, 0);
          this.oldestLabelTime.date = message.sentOnDate;
          this.oldestLabelTime.label = lblDate;
        }

        let isShowAvatar = true;
        if (this.cpnMessageUp) {
          isShowAvatar = message.senderId !== this.cpnMessageUp.instance.message.value.senderId;
        }
        if (message.senderId === this.cpnMessageUp.instance.message.value.senderId) {
          // cssClassName = 'same-sender';
          this.render.addClass(this.cpnMessageUp.location.nativeElement, cssClassName);
        } else {
          cssClassName = 'diff-sender-up';
        }

        this.cpnMessageUp = this.loadMessageDetailComponent(message, 1, false, isShowAvatar, cssClassName, MessageStatus.SENT);
        this.render.addClass(this.cpnMessageUp.location.nativeElement, message.messageType);

        resolve(this.cpnMessageUp);

      });

      arrPromise.push(working);
    });

    return Promise.all(arrPromise);
  }

  distpatchScrollUp() {
    if (this.ableToLoadUp$.value) {
      this.isLoadingHistories = true;
      this.store.dispatch(ChatAction.getMessagesDetailScrollUp({
        payload: {
          conversationId: this.room.value.conversationId,
          countryCode: this.appConfig.config.country,
          pageSize: 20,
          isScrollingUp: true,
          tick: this.smallestTick$.value,
          category: this.category$.value,
        }
      }));
    }
  }

  distpatchScrollDown() {

    if (this.ableToLoadDown$.value) {
      this.isLoadingHistories = true;
      this.store.dispatch(ChatAction.getMessagesDetailScrollDown({
        payload: {
          conversationId: this.room.value.conversationId,
          countryCode: this.appConfig.config.country,
          pageSize: 20,
          isScrollingUp: false,
          tick: this.lastTick$.value,
          category: this.category$.value,
        }
      }));
    }
  }
  resetAll() {
    this.unreadCount$.next(0);
    this.unreadTick = -1;
    this.isRealTime$.next(false);
    if (this.vcrChatDetailContainer) {
      this.vcrChatDetailContainer.clear();
    }
    this.cpnMessageDown = undefined;
    this.cpnMessageUp = undefined;

    this.isLoadingHistories = false;
    this.lastLabelTime = {
      date: '',
      label: ''
    };
    this.oldestLabelTime = {
      date: '',
      label: ''
    };
    this.isUserDeleted$.next(false);
    this.ableToLoadUp$.next(false);
    this.ableToLoadDown$.next(false);
  }

  onShowInputMessageBox($event) {
    this.smoothScroll$.next(true);
    // Force user load lastest ITEMS_PER_PAGE messages
    if ($event) {
      if (this.ableToLoadDown$.value) {
        this.isShowLoading$.next(true);
        this.resetAll();
        this.store
          .dispatch(ChatAction.getMessagesDetail({
            payload: {
              conversationId: this.room.value.conversationId,
              countryCode: this.appConfig.config.country,
              pageSize: ITEMS_PER_PAGE,
              category: this.category$.value,
            }
          }));
      } else {

        setTimeout(() => {
          this.scrollContentToBottom();
        }, 500);
      }
    }
  }

  toggleMenuButton() {
    this.isShowListButton = !this.isShowListButton;
  }

  closeMenuButton(value) {
    this.isShowListButton = value;
  }

  jumpToBottomMessage() {
    this.onShowInputMessageBox(true);
  }

  shakeBtn() {
    if (!this.isShakeBtn$.value) {
      this.isShakeBtn$.next(true);
      setTimeout(() => {
        this.isShakeBtn$.next(false);
      }, 1000);
    }
  }

  gotoPayment() {
    window.history.replaceState({}, 'Chat', `/${this.appConfig.config.culture}/chat`);

    setTimeout(() => {
      window.location.href = `${window.location.origin}/${this.appConfig.config.culture}/payment/options?src=grouppost`;
    }, 500);
  }

  /* onReloadDetailConversation($event) {
    this.reloadDetailConversation.emit($event);
  } */

  toggleSidePanel(panelId, panelType) {
    let isOpenning = this.toggleSidePanelChatDetail.isShowPanel$.value;
    this.toggleSidePanelChatDetail.setIdPanel = panelId;

    if (this.toggleSidePanelChatDetail.idPanel !== panelId) {
      isOpenning = false;
    }

    if (!isOpenning) {
      this.toggleSidePanelChatDetail.panelType$.next(panelType);
    }

    this.toggleSidePanelChatDetail.isShowPanel$.next(!isOpenning);
  }

  toggleDeleteMember(panelId) {
    this.toggleSidePanelChatDetail.isShowPanel$.next(false);
    this.toggleSidePanelChatDetail.setIdPanel = panelId;
  }

  clickedTitleToggleSidePanel(panelId, panelType) {
    // temporarry disable click Group
    this.toggleSidePanel(panelId, panelType);
  }
}


export function ScrollPosition(node) {

  this.node = node;
  this.previousScrollHeightMinusTop = 0;
  this.readyFor = 'up';
}

ScrollPosition.prototype.restore = function () {

  if (this.readyFor === 'up') {
    if (this.node && this.node.self === window) {
      window.scrollTo(0, document.body.scrollHeight - this.previousScrollHeightMinusTop);
    } else {
      this.node.scrollTop = this.node.scrollHeight - this.previousScrollHeightMinusTop;
    }
  }
};

ScrollPosition.prototype.prepareFor = function (direction) {
  this.readyFor = direction || 'up';
  if (this.node && this.node.self === window) {
    this.previousScrollHeightMinusTop = document.body.scrollHeight - window.scrollY;
  } else {
    this.previousScrollHeightMinusTop = this.node.scrollHeight - this.node.scrollTop;
  }
};

