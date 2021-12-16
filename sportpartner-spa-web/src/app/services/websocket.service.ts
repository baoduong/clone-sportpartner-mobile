import { MessageStatus } from './../const.enum';
import { MessageSendingModel } from 'src/models/message-sending.model';
import { MessageTypeEnum } from './../modules/chat/components/message-detail-item/message-type.enum';
import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import * as signalR from '@microsoft/signalr';
import { Store } from '@ngrx/store';
import * as chatActions from '../modules/chat/store/chat.actions';
import * as SharedAction from '../modules/shared/store/shared.actions';
import { map } from 'rxjs/operators';
import { MessageReceiveModel } from 'src/models/message-receive.model';
import { BehaviorSubject } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class WebSocketService {

  public connection: signalR.HubConnection;
  connectionId: any;
  public messageStatus$ = new BehaviorSubject(MessageStatus.SENT);

  constructor(private store: Store<{
    chatReducer: any,
    // profileReducer: any
  }>) {
    this.startConnection();
  }

  startConnection() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/ws/v2/messagehub')
      .configureLogging(signalR.LogLevel.Error)
      .build();

    return this.connection.start()
      .then(status => {
        console.log('Connection connected', this.connection.state);
        this.onServerEvents();
      })
      .catch(error => {
        console.log('Error ws', error);
        setTimeout(() => {
          this.connection.start();
        }, 2000);
      }).then(() => {
        console.log('Finished connection');
      });
  }

  sendMessage(message: MessageSendingModel) {
    if (message.messageType === MessageTypeEnum.Normal) {
      this.messageStatus$.next(MessageStatus.SENDING);
      // console.log('%c%s', 'color: #1d5f74', 'Message is sending:', message);
      const tmpMessage = Object.assign(new MessageReceiveModel(), message);
      tmpMessage.sentOnDateType = 'key';
      tmpMessage.sentOnDate = 'today';
      tmpMessage.messageType = message.messageType;
      tmpMessage.isMyMessage = true;
      // console.log('%c⧭', 'color: #408059', 'tmpMessage', tmpMessage);
      // Append the message immediately to UI, no need waiting response from WS
      this.store.dispatch(chatActions.onReceiveMessage({
        payload: tmpMessage
      }));
    }

    return this.connection
      .invoke('sendMessage', message)
      .catch(err => {
        console.error('Cannot send message:', err);
        // this.messageFailed = message;
        console.log('Try to reconnect and send message!');
        this.startConnection().then(() => {
          this.leaveRoom(this.connectionId); // leave and join group again!
          this.joinRoom(this.connectionId).then(() => {
            this.sendMessage(message);
          });
        });
      });
  }

  sendHighFive(message) {
    return this.connection
      .invoke('SendHighfive', message)
      .catch(err => console.log('err send high five', err));
  }

  sendFirstMessage(message) {
    return this.connection
      .invoke('SendFirstMessage', message)
      .catch(err => console.log('error send first message', err));
  }

  sendPhotoRequest(message) {
    return this.connection
      .invoke('SendPhotoRequest', message)
      .catch(err => console.log('error send photo request', err));
  }

  onServerEvents(): void {
    this.connection.on('NewMessage', (message: any) => {
      if (this.messageStatus$.value === MessageStatus.SENT) {
        this.store.dispatch(chatActions.onReceiveMessage({
          payload: message
        }));
      }
      setTimeout(() => {
        this.messageStatus$.next(MessageStatus.SENT);
      }, 300);
    });

    // this.connection.on('MarkRead', (response: any) => {
    //   console.log('%c⧭', 'color: #994d75', 'Response MarkRead', response);
    //   const { conversationId } = response;
    //   if (conversationId) {
    //     this.store.dispatch(chatActions.markReadAll({
    //       conversationId: conversationId
    //     }));
    //   }
    // });

    this.connection.on('UnreadNotificationChanged', (response: any) => {
      // console.log('%c%s', 'color: #00736b', 'unread message count from socket', response);
      this.store.dispatch(chatActions.getUnReadMessageCompleted({ payload: response }));
    });

    this.connection.on('NewNotification', (response: any) => {
      this.store.dispatch(SharedAction.getStatusNotificationCompletely({
        payload: { count: 1 }
      }));
    });
  }

  joinRoom(conversationId) {
    if (this.connectionId) {
      this.leaveRoom(this.connectionId);
    }
    this.connectionId = conversationId;
    return this.connection.invoke('JoinRoom', {
      conversationId: conversationId
    });
  }

  leaveRoom(conversationId) {
    this.connection.invoke('LeaveRoom', {
      conversationId: conversationId
    });
  }

  markReadAll(conversationId) {
    // console.log('%c⧭', 'color: #00258c', 'markReadAll', conversationId);
    this.connection.invoke('MarkRead', {
      conversationId: conversationId
    });

    // Mark read all
    this.store.dispatch(chatActions.markReadAll({
      conversationId: conversationId
    }));
  }
}
