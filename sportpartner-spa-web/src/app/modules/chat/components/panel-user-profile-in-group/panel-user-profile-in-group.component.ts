import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { delay, distinctUntilChanged, filter, first, map, take, takeUntil, tap } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { ToggleSidePanelChatDetail } from 'src/app/services/toggle-panel-profile.service';
import { WebSocketService } from 'src/app/services/websocket.service';
import { MemberProfileModel } from 'src/models/member-profile.model';
import * as MemberActions from 'src/app/modules/members/members.actions';
import * as ChatActions from '../../store/chat.actions';
import { ConversationListModel } from 'src/models/conversation-list.model';
@Component({
  selector: 'app-panel-user-profile-in-group',
  templateUrl: './panel-user-profile-in-group.component.html',
  styleUrls: ['./panel-user-profile-in-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationSlide', [
      transition(':enter', [
        style({ bottom: '-100vh' }),
        animate('0.5s ease', style({ bottom: 0 }))
      ]),
      transition(':leave', [
        style({ bottom: 0, left: 0, right: 0, position: 'fixed' }),
        animate('0.5s ease', style({ bottom: '-100vh', left: 0, right: 0, position: 'fixed' }))
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
export class PanelUserProfileInGroupComponent implements OnInit, OnDestroy {

  memberProfile$ = new BehaviorSubject<MemberProfileModel>(undefined);
  isShowOverlayNoticeHighFive$ = new BehaviorSubject<boolean>(false);
  isShowOverlayNoticeMsg$ = new BehaviorSubject<boolean>(false);
  destroy$ = new Subject();
  listConversation$ = new BehaviorSubject<ConversationListModel[]>(undefined);

  myProfile: MemberProfileModel;

  isShowBtnPhotoRequest = false;
  keyGender: string;
  isShowInputSendMsg = false;

  constructor(
    private toggleSidePanelChatDetail: ToggleSidePanelChatDetail,
    private route: Router,
    private store: Store<{
      profileReducer,
      chatReducer
    }>,
    private appConfig: AppConfig,
    private ws: WebSocketService
  ) {
    this.myProfile = this.appConfig.config.myProfile;

    this.store.pipe(
      takeUntil(this.destroy$),
      select(state$ => state$.profileReducer),
      map(loaded => loaded.memberProfile),
      distinctUntilChanged(),
      filter(loaded => loaded),
    ).subscribe(data => {
      console.log('%c%s', 'color: #00736b', 'profile', data);
      if (data) {
        this.memberProfile$.next(data);
        if (data.gender === 'M') {
          this.keyGender = 'Generic.GENDER_ABBR.male';
        } else {
          this.keyGender = 'Generic.GENDER_ABBR.female';
        }

        const defaultAvatartString = 'default-match-photo';
        if (data.avatarUrl.includes(defaultAvatartString)) {
          this.isShowBtnPhotoRequest = true;
        }
      }
      setTimeout(() => {
        this.isShowOverlayNoticeHighFive$.next(false);
        this.isShowOverlayNoticeMsg$.next(false);
      }, 1500);
    });

    this.store.pipe(
      takeUntil(this.destroy$),
      select(state$ => state$.chatReducer),
      map(loaded => loaded.channelConversations),
      distinctUntilChanged(),
      filter(loaded => !!loaded),
      map(data => data.filter(val => val.conversationType !== 'NONE_EXISTED'))
    ).subscribe((data: ConversationListModel[]) => {
      this.listConversation$.next(data);
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  backClicked() {
    this.toggleSidePanelChatDetail.isShowPanel$.next(false);
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

  showInputSendMessage() {
    this.isShowInputSendMsg = true;
  }

  showConversation() {
    console.log('%c⧭', 'color: #aa00ff', 'Go to conversation', this.memberProfile$.value.conversation.conversationId);
    if (this.memberProfile$.value.conversation.conversationId !== null && this.memberProfile$.value.conversation.isSentFirstMessage === true) {
      const existed = this.listConversation$.value.find(val => val.conversationId === this.memberProfile$.value.conversation.conversationId);
      if (existed) {
        this.store.dispatch(ChatActions.selectedConversation({
          conversationId: this.memberProfile$.value.conversation.conversationId
        }));

        this.closePanelUerInGroup();
      } else {
        this.selectConversationNotInList(this.memberProfile$.value.conversation.conversationId);
      }
    }
  }

  closePanelUerInGroup() {
    this.store.select(state => state.chatReducer).pipe(
      map(loaded => loaded.selectedConversation),
      take(1)
    ).subscribe(dataConversation => {
      this.backClicked();
    });
  }

  gotoPayment() {
    window.location.replace(`${window.location.origin}/${this.appConfig.config.culture}/payment/options?src=grouppost`);
  }

  sendMessage(ev, type = 'SendMessage') {
    if (this.myProfile.memberType === 'S') {
      this.gotoPayment();
    } else {
      this.isShowOverlayNoticeMsg$.next(true);
      this.memberProfile$.next({
        ...this.memberProfile$.value,
        conversation: {
          ...this.memberProfile$.value.conversation,
          isSentFirstMessage: true
        }
      });
      this.AfterSentSuccess();
      const encodeMessage = encodeContent(ev);
      const encodeSpecialCharacters = encodeContent(encodeMessage);
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
    }
  }

  sendPhotoRequest() {
    if (this.myProfile.memberType === 'S') {
      this.gotoPayment();
    } else {
      this.memberProfile$.next({
        ...this.memberProfile$.value,
        conversation: {
          ...this.memberProfile$.value.conversation,
          isRequestedPhoto: true,
          isSentFirstMessage: true
        }
      });
      this.AfterSentSuccess();
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
    }
  }

  sendHiveFive() {
    if (this.myProfile.memberType === 'S') {
      this.gotoPayment();
    } else {
      this.isShowOverlayNoticeHighFive$.next(true);
      this.memberProfile$.next({
        ...this.memberProfile$.value,
        conversation: {
          ...this.memberProfile$.value.conversation,
          isSentFirstMessage: true,
          isHighFive: true
        }
      });
      this.AfterSentSuccess();
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
    }
  }

  AfterSentSuccess() {
    this.store.select(state => state.chatReducer).pipe(
      map(loaded => loaded.chatDetails),
      take(1),
      delay(700)
    ).subscribe(dataChat => {
      console.log('%cpanel-user-profile-in-group.component.ts line:101 object', 'color: #007acc;', dataChat);
      // Check data-member profile again to get conversationId
      this.store.dispatch(MemberActions.getMemberProfile({
        payload: {
          culture: this.appConfig.config.culture,
          userId: this.memberProfile$.value.publicId
        }
      }));
      this.isShowInputSendMsg = false;
    });
  }

  selectConversationNotInList(conversationId) {
    this.store.select(state$ => state$.chatReducer).pipe(
      map(loaded => loaded.conversationInfomation),
      filter(loaded => !!loaded),
      // first()
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((conversationInfomation: ConversationListModel) => {
      this.store.dispatch(ChatActions.selectedConversationCompleted({
        conversation: conversationInfomation
      }));
      this.closePanelUerInGroup();
    });

    this.store.dispatch(ChatActions.getConversationInfomation({
      conversationId: conversationId,
      isAppendToList: false
    }));
  }

  onSwipeLeft(event, data) {
    this.toggleSidePanelChatDetail.isShowPanel$.next(false);
  }

  unBlockMember() {
    this.store.dispatch(MemberActions.unblockUser({
      memberProfile: this.memberProfile$.value
    }));
  }
}

export function encodeContent(value) {
  const el = document.createElement('div');
  el.innerText = el.textContent = value;
  value = el.innerHTML;
  return value;
}
