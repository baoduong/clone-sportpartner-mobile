import { MessageSendingModel } from './../../../../../models/message-sending.model';
import { TranslateService } from '@ngx-translate/core';

import { Component, OnInit, ChangeDetectionStrategy, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MessageReceiveModel } from 'src/models/message-receive.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { select, Store } from '@ngrx/store';
import { map, filter, distinctUntilChanged, tap } from 'rxjs/operators';
import { MemberProfileModel } from 'src/models/member-profile.model';
import { ConversationListModel } from 'src/models/conversation-list.model';
import { MessageTypeEnum } from './message-type.enum';
import * as ProfileActions from '../../../members/members.actions';
import { WebSocketService } from 'src/app/services/websocket.service';
import { ToggleSidePanelChatDetail } from 'src/app/services/toggle-panel-profile.service';
import { PanelType, DeviceTypes, MessageStatus } from 'src/app/const.enum';
import { AppConfig } from 'src/app/app.config';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-message-detail-item',
  templateUrl: './message-detail-item.component.html',
  styleUrls: ['./message-detail-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('showUpAnimation', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }), // From
        animate('0.1s ease-in', style({ height: '*', opacity: 1 })), // to
      ])
    ]),
    trigger('animationHideAvatar', [
      transition(':leave', [
        style({
          // position: 'absolute',
          bottom: 0,
          // 'z-index': 9,
          opacity: 1,
          overflow: 'hidden'
        }), // From
        animate('0.3s ease-in', style({
          bottom: '*',
          // overflow: 'hidden',
          // height: 0,
          opacity: 0
        })), // to
      ]),
      transition(':enter', [
        style({
          position: 'absolute',
          bottom: '-100px',
          // height: '*',
          'z-index': 9,
          opacity: 0,
          overflow: 'hidden'
        }), // From
        animate('0.1s ease-in', style({
          bottom: 0,
          overflow: 'hidden',
          // height: 0,
          opacity: 1
        })), // to
      ])
    ])
  ]
})
export class MessageDetailItemComponent implements OnInit {

  @ViewChild('btnGiveHFBack') btnGiveHFBack: ElementRef;
  @ViewChild('btnGreet') btnGreet: ElementRef;
  userProfile: MemberProfileModel;

  @Input() message = new BehaviorSubject<MessageReceiveModel>(undefined);
  @Input() conversation = new BehaviorSubject<ConversationListModel>(undefined);
  @Input() isAnimate = new BehaviorSubject(true);
  @Output() isShowAvatar = new BehaviorSubject<boolean>(true);

  @Output() eventClickedAvatar = new EventEmitter(false);

  isMyMessage = false;

  currentTime = (new Date()).toString();

  senderPhoto: string;

  senderProfile$: Observable<MemberProfileModel>;
  senderProfile: MemberProfileModel;

  latestMessage$: Observable<MessageReceiveModel>;

  isFollowing$ = new BehaviorSubject(true);

  deviceType = this.appConfig.config.deviceType$;

  @Input() messageStatus = new BehaviorSubject(MessageStatus.SENT);
  ableClickSayHello = new BehaviorSubject(true);

  minutesCookies = 1440;

  constructor(
    private translateSerice: TranslateService,
    private store: Store<{
      profileReducer,
      chatReducer,
      groupReducer
    }>,
    private ws: WebSocketService,
    private toggleSidePanelChatDetail: ToggleSidePanelChatDetail,
    private appConfig: AppConfig,
    private cookieService: CookieService
  ) {

    this.store.pipe(
      select(state$ => state$.groupReducer),
      map(loaded => loaded.groupDetail),
      distinctUntilChanged(),
      filter(loaded => !!loaded),
      filter(() => this.isFollowing$.value)
    ).subscribe(data => {
      const { isFollowing } = data;
      this.isFollowing$.next(isFollowing);
    });

    this.latestMessage$ =
      store.select(state$ => state$.chatReducer).pipe(
        map(chatDetails => chatDetails.lastestMessageJoin),
        filter(lastestMessageJoin => !!lastestMessageJoin),
        distinctUntilChanged(),
        tap((lastestMessageJoin) => {
          const checkCookies = cookieService.check(`${this.appConfig.config.myProfile.id}-SayHello-${lastestMessageJoin.conversationId}-MEMBER-${lastestMessageJoin.senderId}`);
          this.ableClickSayHello.next(!checkCookies);
          // console.log('%c⧭', 'color: #4d5213', checkCookies);
        })
      );

    store.select(state$ => state$.profileReducer).pipe(
      map(loaded => loaded.myMemberProfile),
      filter(profile => !!profile)
    ).subscribe(myProfile => {
      this.userProfile = myProfile;
    });

    this.senderProfile$ = store.pipe(
      select(state$ => state$.profileReducer),
      map(loaded => loaded.memberProfile),
      filter(profile => profile)
    );

    this.senderProfile$.subscribe(value => {
      this.senderProfile = value;
    });
  }

  ngOnInit(): void {

    this.senderPhoto = this.message.value.senderPhoto;

    if (this.message.value.senderId === this.userProfile.id) {
      this.isMyMessage = true;
      const checkCookies = this.cookieService.check(`${this.appConfig.config.myProfile.id}-SayHelloGroup-${this.message.value.conversationId}`);
      this.ableClickSayHello.next(!checkCookies);
    }

    if (this.message.value.messageType === MessageTypeEnum.HighFive && this.message.value.senderId !== this.userProfile.id) {
      this.store.dispatch(ProfileActions.getMemberProfileFromChat({
        userId: this.message.value.senderId
      }));
    }

    if (this.messageStatus.value === MessageStatus.SENDING) {
      // console.log('%c⧭', 'color: #99adcc', 'Waiting confirm from ws');
      const wsSub = this.ws.messageStatus$
        .pipe(distinctUntilChanged())
        .subscribe(value => {
          this.messageStatus.next(value);
          // console.log('%c⧭', 'color: #f279ca', 'sent', value);
        });

      this.messageStatus.subscribe(value => {
        if (value === MessageStatus.SENT) {
          // console.log('%c⧭', 'color: #7f7700', 'Stop listening ws send successfully');
          wsSub.unsubscribe();
        }
      });
    }

  }

  EpochToDate(epoch) {
    if (epoch < 10000000000) {
      epoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
    }
    const _epoch = epoch + (new Date().getTimezoneOffset() * -1); // for timeZone
    return new Date(_epoch);
  }

  gotoUploadPhotoProfile() {
    const returnUrl = `${window.location.origin}/${this.userProfile.culture}/chat/${this.message.value.conversationId}`;
    window.location.replace(`${window.location.origin}/${this.userProfile.culture}/account/uploadphoto?src=inbox&returnurl=${encodeURIComponent(returnUrl)}`);
  }

  hightFiveBack() {
    const message = {
      conversationType: 'One',
      referenceId: this.message.value.senderId,
      senderId: this.userProfile.id,
      senderGuid: this.userProfile.publicId,
      senderName: this.userProfile.screenName,
      senderPhoto: this.userProfile.avatarUrl,
      source: 'TPD',
    };
    this.ws.sendHighFive(message);
    this.btnGiveHFBack.nativeElement.className = 'd-none';
  }

  clickAvatar() {
    this.toggleSidePanelChatDetail.panelType$.next(PanelType.USER_PROFILE);
    this.eventClickedAvatar.emit(this.message.value.senderId);
  }

  helloMember() {
    const messageWelcome = this.translateSerice.instant('Conversation.CHAT.sayhello_message', {
      member: this.message.value.senderName
    });

    // console.log('%c⧭', 'color: #ff6600', 'messageWelcome', messageWelcome);
    const message: MessageSendingModel = {
      messageBody: messageWelcome,
      conversationId: this.message.value.conversationId,
      conversationType: 'Group',
      senderGuid: this.userProfile.publicId,
      senderName: this.userProfile.screenName,
      senderPhoto: this.userProfile.avatarUrl,
      referenceId: this.message.value.referenceId,
      source: SourceMessage.groupchat,
      senderId: this.userProfile.id,
      messageType: MessageTypeEnum.sayHi
    };

    this.ws.sendMessage(message);

    const now = new Date();

    now.setTime(now.getTime() + (this.minutesCookies * 60 * 1000));

    this.cookieService.set(`${this.appConfig.config.myProfile.id}-SayHello-${this.message.value.conversationId}-MEMBER-${this.message.value.senderId}`, '', now);
    this.ableClickSayHello.next(false);
    this.ableClickSayHello.complete();

    if (this.deviceType.value === DeviceTypes.mobile) {
      this.btnGreet.nativeElement.style.background = null;
      this.btnGreet.nativeElement.style.color = null;

      setTimeout(() => {
        this.btnGreet.nativeElement.style.background = 'transparent';
        this.btnGreet.nativeElement.style.color = '#0d86ff';
      }, 200);
    }
  }

  hiEveryone() {
    const messageWelcome = this.translateSerice.instant('Conversation.CHAT.sayhi_message');
    const message: MessageSendingModel = {
      messageBody: messageWelcome,
      conversationId: this.message.value.conversationId,
      conversationType: 'Group',
      senderGuid: this.userProfile.publicId,
      senderName: this.userProfile.screenName,
      senderPhoto: this.userProfile.avatarUrl,
      referenceId: this.message.value.referenceId,
      source: SourceMessage.groupchat,
      senderId: this.userProfile.id,
      messageType: MessageTypeEnum.helloEveryone
    };

    this.ws.sendMessage(message);
    const now = new Date();
    now.setTime(now.getTime() + (this.minutesCookies * 60 * 1000));
    this.cookieService.set(`${this.appConfig.config.myProfile.id}-SayHelloGroup-${this.message.value.conversationId}`, '', now);
    this.ableClickSayHello.next(false);
    this.ableClickSayHello.complete();

    if (this.deviceType.value === DeviceTypes.mobile) {
      this.btnGreet.nativeElement.style.background = null;
      this.btnGreet.nativeElement.style.color = null;

      setTimeout(() => {
        this.btnGreet.nativeElement.style.background = 'transparent';
        this.btnGreet.nativeElement.style.color = '#0d86ff';
      }, 200);
    }
  }
}

