import { EventEmitter, Type } from '@angular/core';
import { MessageReceiveModel } from 'src/models/message-receive.model';
import { BehaviorSubject } from 'rxjs';
import { ConversationListModel } from 'src/models/conversation-list.model';


export interface IMessageDetail {
  message: BehaviorSubject<MessageReceiveModel>;
  isAnimate: BehaviorSubject<boolean>;
  isShowAvatar: BehaviorSubject<boolean>;
  conversation: BehaviorSubject<ConversationListModel>;
  eventClickedAvatar: EventEmitter<any>;
  messageStatus: BehaviorSubject<string>;
}

export interface IMessageDetailItem {
  component: Type<any>;
  message: BehaviorSubject<MessageReceiveModel>;
  isAnimate?: BehaviorSubject<boolean>;
  isShowAvatar?: BehaviorSubject<boolean>;
  conversation?: BehaviorSubject<ConversationListModel>;
  eventClickedAvatar?: EventEmitter<any>;
  messageStatus?: BehaviorSubject<string>;
}

export class MessageDetailItem implements IMessageDetailItem {
  constructor(
    public component: Type<any>,
    public message: BehaviorSubject<MessageReceiveModel>,
    public isAnimate?: BehaviorSubject<boolean>,
    public isShowAvatar?: BehaviorSubject<boolean>,
    public conversation?: BehaviorSubject<ConversationListModel>,
    public messageStatus?: BehaviorSubject<string>
  ) {
    this.component = component;
    this.message = message;
    this.isAnimate = isAnimate;
    this.isShowAvatar = isShowAvatar;
    this.conversation = conversation;
    this.messageStatus = messageStatus;
  }
}
