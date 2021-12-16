import { WebSocketService } from 'src/app/services/websocket.service';

import { ConversationListModel } from './../../../../../models/conversation-list.model';
import { DetectDeviceService } from './../../../../services/detect-device.service';
import { AppConfig } from './../../../../app.config';
import { ACTION_DELETE_CONVERSATION_COMPLETELY, ACTION_BLOCK_CONVERSATION_COMPLETELY } from './../../../../const.actions';
import { ChatEffects } from './../../store/chat.effects';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { filter, map, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToggleSidePanelChatDetail } from 'src/app/services/toggle-panel-profile.service';
import { MemberProfileModel } from 'src/models/member-profile.model';

import * as ChatActions from '../../store/chat.actions';
import * as MemberActions from '../../../members/members.actions';

@Component({
  selector: 'app-panel-user-profile',
  templateUrl: './panel-user-profile.component.html',
  styleUrls: ['./panel-user-profile.component.scss'],
  animations: [
    /* trigger('togglePanelUserProfile', [
      state('closePanel', style({ transform: 'translateX(100%)' })),
      transition('* => closePanel', [animate('0.3s ease')]),
    ]), */

    trigger('animationToggleDialogConfirm', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.3s ease', style({ opacity: 0 })),
      ])
    ])
  ]
})
export class PanelUserProfileComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

  myProfile: MemberProfileModel;

  constructor(
    private dectectDevice: DetectDeviceService,
    private store: Store<{
      profileReducer,
      chatReducer
    }>,
    private toggleSidePanelChatDetail: ToggleSidePanelChatDetail,
    private route: Router,
    private appConfig: AppConfig,
    private chatEffects: ChatEffects,
    private ws: WebSocketService
  ) {
    this.myProfile = this.appConfig.config.myProfile;

    this.store.pipe(
      takeUntil(this.destroy),
      select(state$ => state$.chatReducer),
      map(loaded => loaded.channelConversations),
      distinctUntilChanged(),
      filter(conversations => !!conversations),
      map(cat => cat.filter(data => data.conversationType !== 'NONE_EXISTED'))
    ).subscribe(conversations => {
      this.listConversation$.next(conversations);
    });

    this.orientation$ = this.dectectDevice.orientation$;

    this.store.pipe(
      select(state$ => state$.profileReducer),
      map(loaded => loaded.memberProfile),
      distinctUntilChanged(),
      filter(loaded => loaded),
    ).subscribe(data => {
      if (data) {
        const { conversation } = data;
        const { isBlocked } = conversation;
        this.isUserBlocked = isBlocked || false;
        this.memberProfile$.next(data);
      }
    });
  }

  @Input() animationPanelUserProfile;
  @Input() conversationSelecting: ConversationListModel;
  @Input() listBoxType;

  memberProfile$ = new BehaviorSubject<MemberProfileModel>(undefined);
  // isShowPanel$ = new BehaviorSubject<boolean>(false);
  isLoadFinishProfile$ = new BehaviorSubject<boolean>(false);

  animationPanel = '';
  isShowDialogBlock$ = new BehaviorSubject<boolean>(false);
  isShowDialogDelete$ = new BehaviorSubject<boolean>(false);

  deviceType = this.appConfig.config.deviceType$;

  orientation$ = new BehaviorSubject<string>('portrait');

  isUserBlocked = false;

  listConversation$ = new BehaviorSubject<ConversationListModel[]>([]);

  destroy = new Subject();

  selectConversationNotInListSubcribe$: Subscription;

  ngOnInit(): void {
    this.chatEffects.deleteConversation$.pipe(
      filter(load => load.type === ACTION_DELETE_CONVERSATION_COMPLETELY),
      distinctUntilChanged(),
      map(loaded => loaded.conversationId)
    ).subscribe(conversationId => {
      this.isShowDialogDelete$.next(false);
      this.closePanelProfile();
    });

    this.chatEffects.blockConversation$.pipe(
      filter(load => load.type === ACTION_BLOCK_CONVERSATION_COMPLETELY),
      distinctUntilChanged(),
      map(loaded => loaded.conversationId)
    ).subscribe(conversationId => {
      this.isShowDialogBlock$.next(false);
      this.closePanelProfile();
    });
  }

  ngOnChanges() {
    // this.closePanelProfile();
  }

  ngAfterViewInit() {
  }

  closePanelProfile() {
    this.animationPanel = 'closePanel';
    this.toggleSidePanelChatDetail.isShowPanel$.next(false);
    setTimeout(() => {
      this.animationPanel = '';
      // this.isShowPanel$.next(false);
    }, 250);
  }

  viewProfile() {
    this.route.navigateByUrl(`${this.appConfig.config.culture}/members/${this.memberProfile$.value.publicId}`);
  }

  toggleDialogBlock(status) {
    this.isShowDialogBlock$.next(status);
  }

  toggleDialogDelete(status) {
    this.isShowDialogDelete$.next(status);
  }

  ngOnDestroy() {
    this.isLoadFinishProfile$.next(false);
    this.destroy.complete();
  }

  deleteConversation() {
    this.store.dispatch(ChatActions.deleteConversation({
      conversationId: this.conversationSelecting.conversationId
    }));
  }

  blockConversation() {
    this.store.dispatch(ChatActions.blockConversation({
      conversationId: this.conversationSelecting.conversationId
    }));
  }

  unblockUser() {
    this.store.dispatch(MemberActions.unblockUser({
      memberProfile: this.memberProfile$.value
    }));
  }

  sendAMessage() {
    const { conversationId } = this.memberProfile$.value.conversation;
    this.toggleSidePanelChatDetail.isShowPanel$.next(false);
    const existed = this.listConversation$.value.find(v => v.conversationId === conversationId);
    if (existed) {
      this.store.dispatch(ChatActions.selectedConversation({
        conversationId: conversationId
      }));
    } else {
      this.selectConversationNotInList(conversationId);
    }
    this.toggleSidePanelChatDetail.panelType$.next('');
    this.store.dispatch(ChatActions.selectedConversation({
      conversationId: this.memberProfile$.value.conversation.conversationId
    }));
  }

  sendHighFive() {
    const message = {
      conversationType: 'One',
      referenceId: this.memberProfile$.value.id,
      senderId: this.myProfile.id,
      senderGuid: this.myProfile.publicId,
      senderName: this.myProfile.screenName,
      senderPhoto: this.myProfile.avatarUrl,
      source: this.conversationSelecting.conversationType === 'Group' ? SourceMessage.groupchat : SourceMessage.inbox,
    };

    this.ws.sendHighFive(message);

    this.store.dispatch(MemberActions.getMemberProfile({
      payload: {
        userId: this.memberProfile$.value.id,
        culture: this.appConfig.config.culture,
      }
    }));
  }

  selectConversationNotInList(conversationId: string) {
    this.selectConversationNotInListSubcribe$ = this.store.select(state$ => state$.chatReducer).pipe(
      takeUntil(this.destroy),
      map(loaded => loaded.conversationInfomation),
      filter(loaded => !!loaded),
      distinctUntilChanged()
    ).subscribe((conversation: ConversationListModel) => {
      // this.selectConversationNotInListSubcribe$.
      this.store.dispatch(ChatActions.selectedConversationCompleted({
        conversation
      }));
    });

    this.store.dispatch(ChatActions.getConversationInfomation({
      conversationId: conversationId,
      isAppendToList: false
    }));
  }
}
