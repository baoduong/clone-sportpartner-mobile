import { Router } from '@angular/router';
import { map, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { ToggleSidePanelChatDetail } from './../../../../services/toggle-panel-profile.service';
import { DetectDeviceService } from './../../../../services/detect-device.service';
import { MemberProfileModel } from './../../../../../models/member-profile.model';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Input } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppConfig } from 'src/app/app.config';
import * as ChatActions from '../../store/chat.actions';
import * as MemberActions from '../../../members/members.actions';
import { ConversationListModel } from 'src/models/conversation-list.model';
import { WebSocketService } from 'src/app/services/websocket.service';
import { AutoFocusInputService } from '../../auto-focus-input.service';
@Component({
  selector: 'app-popup-user-profile',
  templateUrl: './popup-user-profile.component.html',
  styleUrls: ['./popup-user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupUserProfileComponent implements OnInit, OnDestroy {

  constructor(
    private route: Router,
    private store: Store<{
      profileReducer,
      chatReducer
    }>,
    private toggleSidePanelChatDetail: ToggleSidePanelChatDetail,
    private appConfig: AppConfig,
    private ws: WebSocketService,
    private autoFocusInputService: AutoFocusInputService,
  ) {
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

  @Input() conversationSelecting: ConversationListModel;

  memberProfile$ = new BehaviorSubject<MemberProfileModel>(undefined);
  deviceType = this.appConfig.config.deviceType$;
  isUserBlocked = false;

  selectConversationNotInListSubcribe$: Subscription;

  destroy = new Subject();

  listConversation$ = new BehaviorSubject<ConversationListModel[]>([]);

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy.complete();
  }

  closePanel() {
    this.toggleSidePanelChatDetail.isShowPanel$.next(false);
  }

  unBlockUser() {
    this.store.dispatch(MemberActions.unblockUser({
      memberProfile: this.memberProfile$.value
    }));
  }

  viewProfile() {
    this.route.navigateByUrl(`${this.appConfig.config.culture}/members/${this.memberProfile$.value.publicId}`);
  }

  sendAMessage() {
    this.autoFocusInputService.isAutoFocusInput.next(true);
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
      senderId: this.memberProfile$.value.id,
      senderGuid: this.memberProfile$.value.publicId,
      senderName: this.memberProfile$.value.screenName,
      senderPhoto: this.memberProfile$.value.avatarUrl,
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
