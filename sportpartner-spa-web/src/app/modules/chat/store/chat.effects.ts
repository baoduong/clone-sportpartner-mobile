import { MessageTypeEnum } from "./../components/message-detail-item/message-type.enum";
import {
  ACTION_RESTORE_CONVERSATION,
  ACTION_BLOCK_CONVERSATION,
  SELECTED_CONVERSATION,
} from "./../../../const.actions";
import { TranslateService } from "@ngx-translate/core";
import { AppConfig } from "src/app/app.config";
import { Injectable } from "@angular/core";
import { createEffect, Actions, ofType } from "@ngrx/effects";
import {
  ACTION_ON_SEND_MESSAGE,
  GET_FIRST_LIST_CONVERSATION,
  ACTION_GET_MESSAGES_DETAIL_SCROLL_UP,
  ACTION_ON_RECEIVE_MESSAGE,
  ACTION_LAZY_LOAD_CONVERSATION_LIST,
  UPDATE_CONVERSATION_LIST,
  UPDATE_CONVERSATION_LIST_COMPLETELY,
  ACTION_GET_CONVERSATION_INFORMATION,
  ACTION_GET_CONVERSATION_INFORMATION_COMPLETELY,
  ACTION_GET_MESSAGES_DETAIL,
  ACTION_TOGGLE_FAVOURITE_CONVERSATION,
  ACTION_GET_MESSAGES_DETAIL_SCROLL_DOWN,
  ACTION_DELETE_CONVERSATION,
  ACTION_GET_UNREAD_MESSAGE_COMPLETED,
  ACTION_GET_UNREAD_MESSAGE,
} from "src/app/const.actions";
import {
  switchMap,
  mergeMap,
  map,
  catchError,
  distinctUntilChanged,
  exhaustMap,
  share,
} from "rxjs/operators";
import * as chatActions from "./chat.actions";
import { of, from, EMPTY } from "rxjs";
import { WebSocketService } from "src/app/services/websocket.service";
import { MessageService } from "src/app/services/message.service";
import { MessageReceiveModel } from "src/models/message-receive.model";
import { Store } from "@ngrx/store";
import { ConversationListModel } from "src/models/conversation-list.model";

@Injectable()
export class ChatEffects {
  constructor(
    private actions$: Actions,
    private ws: WebSocketService,
    private messageService: MessageService,
    private appcConfig: AppConfig,
    private translate: TranslateService,
    private store: Store<{ chatReducer: any }>
  ) {}

  sendMessage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ACTION_ON_SEND_MESSAGE),
        distinctUntilChanged(),
        switchMap(({ payload }) => {
          const { messages } = payload;
          const ob = from(this.ws.sendMessage(messages));
          return ob.pipe(
            map(() => {
              return chatActions.onSendMessageCompletely({ payload: payload });
            })
          );
        })
      ),
    { dispatch: false }
  );

  receiveMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_ON_RECEIVE_MESSAGE),
      switchMap(({ payload }: any) => {
        // console.log('%cchat.effects.ts line:45 object', 'color: #007acc;', payload);
        const message = {
          messageType: payload.messageType,
          messageBody: payload.messageBody,
        };

        // console.log('%c⧭', 'color: #997326', payload, 'payload');
        if (payload.conversationType === "Group") {
          if (
            this.appcConfig.config.myProfile["memberType"] === "N" ||
            this.appcConfig.config.myProfile["memberType"] === "S"
          ) {
            if (
              payload.senderGuid === this.appcConfig.config.myProfile.publicId
            ) {
              message.messageBody =
                message.messageBody !== null
                  ? this.translate.instant(
                      "Conversation.INBOX.you_send_a_message"
                    )
                  : null; // 'you send a message';
            } else {
              message.messageBody =
                message.messageBody !== null
                  ? this.translate.instant(
                      "Conversation.INBOX.somebody_send_a_message",
                      {
                        member: payload.senderName,
                      }
                    )
                  : null; // 'Member sends a message';
            }
          }
        } else {
          // message.conversationType === 'One'
          if (this.appcConfig.config.myProfile["memberType"] === "N") {
            message.messageType = MessageTypeEnum.Normal;
            message.messageBody = this.translate.instant(
              "Conversation.INBOX.new_message"
            ); // 'NEW_MESSAGE';
          }
        }

        /* switch (true) {
          case this.appcConfig.config.myProfile['memberType'] === 'N':
            message['messageType'] = 'key';
            message['messageBody'] = this.translate.instant('Conversation.INBOX.new_message'); // 'NEW_MESSAGE';
            break;
          case this.appcConfig.config.myProfile['memberType'] === 'S' && payload.conversationType === 'Group':
            message['messageType'] = 'key';
            message['messageBody'] = this.translate.instant('Conversation.INBOX.new_message'); // 'NEW_MESSAGE';
            break;
        } */
        return of(
          chatActions.onReceiveMessageCompletely({
            payload: Object.assign({}, payload, message),
          })
        );
      }),
      share()
    )
  );

  getFirtsMessagesDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_GET_MESSAGES_DETAIL),
      exhaustMap(({ payload }) => {
        return this.messageService.getMessageDetails(payload).pipe(
          map((data: any) => {
            const {
              messageData,
              ableToLoadDown,
              unreadTick,
              ableToLoadUp,
            } = data;
            return chatActions.getMessagesDetailCompletely({
              payload: {
                messageData: messageData,
                ableToLoadDown: ableToLoadDown,
                ableToLoadUp: ableToLoadUp,
                unreadTick: unreadTick,
                currentUser: this.appcConfig.config.myProfile,
              },
            });
          })
        );
      }),
      share()
    )
  );

  getMessageDetailScrollUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_GET_MESSAGES_DETAIL_SCROLL_UP),
      switchMap(({ payload }) => {
        return this.messageService.lazyLoadMessageDetails(payload).pipe(
          map((data: any) => {
            const {
              messageData,
              ableToLoadDown,
              ableToLoadUp,
              unreadTick,
            } = data;
            return chatActions.getMessagesDetailScrollUpCompletely({
              payload: {
                messageData: messageData,
                ableToLoadDown: ableToLoadDown,
                ableToLoadUp: ableToLoadUp,
                unreadTick,
                currentUser: this.appcConfig.config.myProfile,
              },
            });
          })
        );
      }),
      share()
    )
  );

  getMessageDetailScrollDown$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_GET_MESSAGES_DETAIL_SCROLL_DOWN),
      exhaustMap(({ payload }) => {
        return this.messageService.lazyLoadMessageDetails(payload).pipe(
          map((data: any) => {
            const {
              messageData,
              ableToLoadDown,
              ableToLoadUp,
              unreadTick,
            } = data;
            return chatActions.getMessagesDetailScrollDownCompletely({
              payload: {
                messageData: messageData,
                ableToLoadDown: ableToLoadDown,
                ableToLoadUp: ableToLoadUp,
                unreadTick: unreadTick,
                currentUser: this.appcConfig.config.myProfile,
              },
            });
          })
        );
      }),
      share()
    )
  );

  getListConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GET_FIRST_LIST_CONVERSATION),
      mergeMap(({ category, pageSize }) => {
        return this.messageService
          .getListConversation(0, category, pageSize)
          .pipe(
            map((data: any[]) => {
              if (data.length > 0) {
                return data;
              }
              return [];
            }),
            map((res: ConversationListModel[]) => {
              res = res.map((message) => {
                if (message.conversationType === "Group") {
                  if (
                    this.appcConfig.config.myProfile["memberType"] === "N" ||
                    this.appcConfig.config.myProfile["memberType"] === "S"
                  ) {
                    if (message.isCurrentUser) {
                      message.messageBody =
                        message.messageBody !== null
                          ? this.translate.instant(
                              "Conversation.INBOX.you_send_a_message"
                            )
                          : null; // 'Member send a message';
                    } else {
                      message.messageBody =
                        message.messageBody !== null
                          ? this.translate.instant(
                              "Conversation.INBOX.somebody_send_a_message",
                              {
                                member: message.senderName,
                              }
                            )
                          : null; // 'Member send a message';
                    }
                  }
                } else {
                  // message.conversationType === 'One'
                  if (this.appcConfig.config.myProfile["memberType"] === "N") {
                    message.messageType = MessageTypeEnum.Normal;
                    message.messageBody = this.translate.instant(
                      "Conversation.INBOX.new_message"
                    ); // 'NEW_MESSAGE';
                  }
                }
                return message;
              });

              /* switch (true) {
                case this.appcConfig.config.myProfile['memberType'] === 'N':
                  res = res.map(v => {
                    v.messageType = 'key';
                    v.messageBody = this.translate.instant('Conversation.INBOX.new_message'); // 'NEW_MESSAGE';
                    return v;
                  });
                  break;
                case this.appcConfig.config.myProfile['memberType'] === 'S':
                  res = res.map(v => {
                    if (v.conversationType === 'Group') {
                      v.messageType = 'key';
                      v.messageBody = this.translate.instant('Conversation.INBOX.new_message'); // 'NEW_MESSAGE';
                    }
                    return v;
                  });
                  break;
              } */
              return chatActions.getFirstListConversationCompletely({
                payload: res,
              });
            }),
            catchError(() => EMPTY)
          );
      })
    )
  );

  lazyloadConversationList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_LAZY_LOAD_CONVERSATION_LIST),
      switchMap(({ tick, category, pageSize }) => {
        return this.messageService
          .getListConversation(tick, category, pageSize)
          .pipe(
            map((data: any[]) => {
              if (data.length > 0) {
                return data;
              }
              return [];
            }),
            map((res) => {
              res = res.map((message) => {
                if (message.conversationType === "Group") {
                  if (
                    this.appcConfig.config.myProfile["memberType"] === "N" ||
                    this.appcConfig.config.myProfile["memberType"] === "S"
                  ) {
                    if (message.isCurrentUser) {
                      message.messageBody =
                        message.messageBody !== null
                          ? this.translate.instant(
                              "Conversation.INBOX.you_send_a_message"
                            )
                          : null; // 'Member send a message';
                    } else {
                      message.messageBody =
                        message.messageBody !== null
                          ? this.translate.instant(
                              "Conversation.INBOX.somebody_send_a_message",
                              {
                                member: message.senderName,
                              }
                            )
                          : null; // 'Member send a message';
                    }
                  }
                } else {
                  // message.conversationType === 'One'
                  if (this.appcConfig.config.myProfile["memberType"] === "N") {
                    message.messageType = MessageTypeEnum.Normal;
                    message.messageBody = this.translate.instant(
                      "Conversation.INBOX.new_message"
                    ); // 'NEW_MESSAGE';
                  }
                }
                return message;
              });
              /* switch (true) {
              case this.appcConfig.config.myProfile['memberType'] === 'N':
                res.map(v => {
                  v.messageType = 'key';
                  v.messageBody = this.translate.instant('Conversation.INBOX.new_message'); // 'NEW_MESSAGE';
                  return v;
                });
                break;
              case this.appcConfig.config.myProfile['memberType'] === 'S':
                res.map(v => {
                  if (v.conversationType === 'Group') {
                    v.messageType = 'key';
                    v.messageBody = this.translate.instant('Conversation.INBOX.new_message'); // 'NEW_MESSAGE';
                  }
                  return v;
                });
                break;
            } */
              return chatActions.lazyLoadConversationListCompletely({
                payload: res,
              });
            }),
            catchError(() => EMPTY)
          );
      }),
      share()
    )
  );

  getConversationInfomation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_GET_CONVERSATION_INFORMATION),
      switchMap(
        ({ conversationId, isAppendToList, messageType, messageBody, isAppendMsgFromWs }) => {
          return this.messageService
            .getConversationInfomation(conversationId)
            .pipe(
              map((res: ConversationListModel) => {
                // re-check MessageType , MessageBody from BE not yet save data


                if (isAppendMsgFromWs) {
                  res.messageType = messageType;
                  res.messageBody = messageBody;
                }

                if (res.conversationType === "Group") {
                  if (
                    this.appcConfig.config.myProfile["memberType"] === "N" ||
                    this.appcConfig.config.myProfile["memberType"] === "S"
                  ) {
                    if (res.isCurrentUser) {
                      res.messageBody =
                        res.messageBody !== null
                          ? this.translate.instant(
                              "Conversation.INBOX.you_send_a_message"
                            )
                          : null; // 'Member send a message';
                    } else {
                      res.messageBody =
                        res.messageBody !== null
                          ? this.translate.instant(
                              "Conversation.INBOX.somebody_send_a_message",
                              {
                                member: res.senderName,
                              }
                            )
                          : null; // 'Member send a message';
                    }
                  }
                } else {
                  // message.conversationType === 'One'
                  if (this.appcConfig.config.myProfile["memberType"] === "N") {
                    res.messageType = MessageTypeEnum.Normal;
                    res.messageBody = this.translate.instant(
                      "Conversation.INBOX.new_message"
                    ); // 'NEW_MESSAGE';
                  }
                }
                
                return chatActions.getConversationInfomationCompletely({
                  conversation: res,
                  isAppendToList,
                });
              })
            );
        }
      )
    )
  );

  toggleFavouriteConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_TOGGLE_FAVOURITE_CONVERSATION),
      switchMap(({ conversationId, isStarring }) => {
        return this.messageService
          .toggleFavouriteConversation({ conversationId, isStarring })
          .pipe(
            map(() => {
              return chatActions.noneResponse();
            })
          );
      })
    )
  );

  deleteConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_DELETE_CONVERSATION),
      switchMap((conversationId) => {
        return this.messageService.deleteConversation(conversationId).pipe(
          map(() => {
            return chatActions.deleteConversationCompleted(conversationId);
          })
        );
      })
    )
  );

  blockConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_BLOCK_CONVERSATION),
      switchMap(({ conversationId }) => {
        return this.messageService.blockConversation(conversationId).pipe(
          map(() => {
            return chatActions.blockConversationCompleted({ conversationId });
          })
        );
      })
    )
  );

  restoreConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_RESTORE_CONVERSATION),
      switchMap((conversation) => {
        const { conversationId } = conversation;
        return this.messageService.restoreConversation(conversationId).pipe(
          map(() => {
            return chatActions.restoreConversationCompleted({ conversationId });
          })
        );
      })
    )
  );

  getUnReadMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTION_GET_UNREAD_MESSAGE),
      switchMap(({ payload }) => {
        return this.messageService.getUnReadMessage(payload).pipe(
          map((res) => {
            // console.log('%c%s', 'color: #ff6600', 'unread message count from API', res);
            return { type: ACTION_GET_UNREAD_MESSAGE_COMPLETED, payload: res };
          })
        );
      })
    )
  );

  /* selectedConversation$ = createEffect(
    () => this.actions$.pipe(
      ofType(SELECTED_CONVERSATION),
      switchMap((conversation) => {
        const { conversationId } = conversation;
        console.log('%c%s', 'color: #072e07', conversationId);
        return of(conversationId).pipe(
          map(() => {
            return (chatActions.selectedConversationCompleted({
              conversation: undefined
            }));
          })
        );
      })
    )
  ); */
}
