import { ToggleSidePanelChatDetail } from './../../../../services/toggle-panel-profile.service';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { DecodeHTMLPipe } from './../../../shared/decodeHTML.pipe';
import { ToggleNavigationBarService } from 'src/app/services/toggle-navigation-bar.service';
import {
  Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef,
  Output, EventEmitter, OnDestroy
} from '@angular/core';
import { ConversationListModel } from 'src/models/conversation-list.model';
import { BehaviorSubject } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { Store } from '@ngrx/store';
import * as ChatActions from '../../store/chat.actions';
import { DeviceTypes } from 'src/app/const.enum';
import { MessageTypeEnum } from '../message-detail-item/message-type.enum';

@Component({
  selector: 'app-list-conversation-item',
  templateUrl: './list-conversation-item.component.html',
  styleUrls: ['./list-conversation-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListConversationItemComponent implements OnInit, OnDestroy {
  messageBody: string;
  @Input() conversation: ConversationListModel;
  deviceType = this.appConfig.config.deviceType$;
  @Input() isSelected;
  // @Input() reloadDetailConversation;

  selectedConversation$ = new BehaviorSubject<ConversationListModel>(undefined);

  isCurrentUser$ = new BehaviorSubject<boolean>(false);
  isStarred$ = new BehaviorSubject<boolean>(false);

  isPremium$ = new BehaviorSubject(true);
  constructor(
    private decodeHTMLPipe: DecodeHTMLPipe,
    private toggleNavigationBarService: ToggleNavigationBarService,
    private appConfig: AppConfig,
    private store: Store<{ chatReducer: any }>,
    private toggleSidePanel: ToggleSidePanelChatDetail,
  ) {
    this.store.select(state$ => state$.chatReducer).pipe(
      map(loaded => loaded.selectedConversation),
      distinctUntilChanged(),
    ).subscribe(selectedConversation => {
      this.selectedConversation$.next(selectedConversation);
    });
  }

  ngOnInit(): void {
    this.messageBody = this.conversation.messageType !== MessageTypeEnum.welcomeGroup ? this.decodeHTMLPipe.transform(this.conversation.messageBody).replace(/<br>/g, ' ') : null;
    const isCurrentUser = this.appConfig.config.myProfile.screenName === this.conversation.senderName;
    this.isPremium$.next(this.appConfig.config.myProfile.isPremium);
    this.isCurrentUser$.next(isCurrentUser);
    this.isStarred$.next(this.conversation.isStarred);
  }

  ngOnDestroy() {
    // this.selectingConversation.complete();
  }

  selectedThisConversation() {
    let isOpenning = this.toggleSidePanel.isShowPanel$.value;
    if (this.selectedConversation$.value && this.selectedConversation$.value.conversationId === this.conversation.conversationId) {
      if (this.deviceType.value === DeviceTypes.desktop || this.deviceType.value === DeviceTypes.tablet) {
        isOpenning = !isOpenning;
        this.toggleSidePanel.isShowPanel$.next(isOpenning);
        if (isOpenning) {
          this.toggleSidePanel.setIdPanel = this.conversation.conversationId;
        }
      }
      return;
    }
    if (this.deviceType.value === DeviceTypes.mobile) {
      this.toggleNavigationBarService.isShowNavigationBar.next(false);
      setTimeout(() => {
        // this.selectingConversation.emit(this.conversation);
        this.store.dispatch(ChatActions.selectedConversation({
          conversationId: this.conversation.conversationId
        }));
      }, 500);
    } else {
      // this.selectingConversation.emit(this.conversation);
      this.store.dispatch(ChatActions.selectedConversation({
        conversationId: this.conversation.conversationId
      }));
    }
  }


  toggleFavourite() {
    this.store.dispatch(ChatActions.toogleFavourite({
      conversationId: this.conversation.conversationId,
      isStarring: !this.isStarred$.value
    }));
    this.isStarred$.next(!this.isStarred$.value);
    // this.conversation.isStarred = this.isStarred;
  }
}
