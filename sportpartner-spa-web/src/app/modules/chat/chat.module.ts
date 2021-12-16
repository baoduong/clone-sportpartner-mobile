import { FullscreenOverlayContainer, OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { SharedModule } from '../shared/shared.module';
import { ListConversationComponent } from './components/list-conversation/list-conversation.component';
import { DetailConversationComponent } from './components/detail-conversation/detail-conversation.component';
import { ListConversationItemComponent } from './components/list-conversation-item/list-conversation-item.component';
import { ListChatBoxSuggestionItemComponent } from './components/list-chat-box-suggestion-item/list-chat-box-suggestion-item.component';
import { InputMessageBoxComponent } from './components/input-message-box/input-message-box.component';
import { MessageDetailItemComponent } from './components/message-detail-item/message-detail-item.component';
import { GetFirstListConversationResolver } from './chat.resolver';
import { TypingMessageComponent } from './components/typing-message/typing-message.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ListButtonDetailConversationComponent } from './components/list-button-detail-conversation/list-button-detail-conversation.component';
import { DialogConfirmLeaveGroupComponent } from './components/dialog-confirm-leave-group/dialog-confirm-leave-group.component';
import { PanelUserProfileComponent } from './components/panel-user-profile/panel-user-profile.component';
import { PanelGroupInfoComponent } from './components/panel-group-info/panel-group-info.component';
import { PopupUserProfileComponent } from './components/popup-user-profile/popup-user-profile.component';
import { DialogConfirmDeleteConversationComponent } from './components/dialog-confirm-delete-conversation/dialog-confirm-delete-conversation.component';
import { PanelUserProfileInGroupComponent } from './components/panel-user-profile-in-group/panel-user-profile-in-group.component';

@NgModule({
  declarations: [
    ChatComponent,
    ListConversationComponent,
    DetailConversationComponent,
    ListConversationItemComponent,
    ListChatBoxSuggestionItemComponent,
    InputMessageBoxComponent,
    MessageDetailItemComponent,
    TypingMessageComponent,
    ListButtonDetailConversationComponent,
    DialogConfirmLeaveGroupComponent,
    PanelUserProfileComponent,
    PanelGroupInfoComponent,
    PopupUserProfileComponent,
    DialogConfirmDeleteConversationComponent,
    PanelUserProfileInGroupComponent,
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    SharedModule,
    ScrollingModule,
    OverlayModule
  ],
  providers: [
    GetFirstListConversationResolver,
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer }
  ]
})
export class ChatModule { }
