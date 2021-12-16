import { ACTION_RESTORE_CONVERSATION, ACTION_DELETE_CONVERSATION_COMPLETELY, ACTION_BLOCK_CONVERSATION, ACTION_BLOCK_CONVERSATION_COMPLETELY, ACTION_RESTORE_CONVERSATION_COMPLETELY, SELECTED_CONVERSATION, SELECTED_CONVERSATION_COMPLETED } from './../../../const.actions';
import { createAction, props } from '@ngrx/store';
import {
  ACTION_ON_SEND_MESSAGE,
  ACTION_ON_RECEIVE_MESSAGE,
  GET_FIRST_LIST_CONVERSATION,
  GET_FIRST_LIST_CONVERSATION_COMPLETELY,
  ACTION_GET_MESSAGES_DETAIL_COMPLETELY,
  ACTION_GET_MESSAGES_DETAIL,
  ACTION_ON_SEND_MESSAGE_COMPLETELY,
  UPDATE_CONVERSATION_LIST,
  ACTION_ON_RECEIVE_MESSAGE_COMPLETELY,
  ACTION_LAZY_LOAD_CONVERSATION_LIST,
  ACTION_LAZY_LOAD_CONVERSATION_LIST_COMPLETELY,
  UPDATE_CONVERSATION_LIST_COMPLETELY,
  ACTION_GET_CONVERSATION_INFORMATION,
  ACTION_GET_CONVERSATION_INFORMATION_COMPLETELY,
  ACTION_GET_MESSAGES_DETAIL_SCROLL_UP,
  ACTION_GET_MESSAGES_DETAIL_SCROLL_UP_COMPLETELY,
  ACTION_TOGGLE_FAVOURITE_CONVERSATION,
  ACTION_NONE_RESPONSE,
  ACTION_GET_MESSAGES_DETAIL_SCROLL_DOWN,
  ACTION_GET_MESSAGES_DETAIL_SCROLL_DOWN_COMPLETELY, ACTION_MARK_READ_ALL, ACTION_DELETE_CONVERSATION,
  ACTION_GET_UNREAD_MESSAGE, ACTION_GET_UNREAD_MESSAGE_COMPLETED
} from 'src/app/const.actions';
import { MessageReceiveModel } from 'src/models/message-receive.model';
import { ConversationListModel } from 'src/models/conversation-list.model';

export const onSendMessage = createAction(ACTION_ON_SEND_MESSAGE, props<{ payload: any }>());
export const onSendMessageCompletely = createAction(ACTION_ON_SEND_MESSAGE_COMPLETELY, props<{ payload: any }>());
export const onReceiveMessage = createAction(ACTION_ON_RECEIVE_MESSAGE, props<{ payload: MessageReceiveModel }>());
export const onReceiveMessageCompletely = createAction(ACTION_ON_RECEIVE_MESSAGE_COMPLETELY, props<{ payload: any }>());

export const getFirstListConversation = createAction(GET_FIRST_LIST_CONVERSATION, props<{ category: string, pageSize: any }>());
export const getFirstListConversationCompletely = createAction(GET_FIRST_LIST_CONVERSATION_COMPLETELY, props<{ payload: any }>());
export const lazyLoadConversationList = createAction(ACTION_LAZY_LOAD_CONVERSATION_LIST, props<{ tick: number, category: string, pageSize: any }>());
export const lazyLoadConversationListCompletely = createAction(ACTION_LAZY_LOAD_CONVERSATION_LIST_COMPLETELY, props<{ payload: any }>());

export const getMessagesDetail = createAction(ACTION_GET_MESSAGES_DETAIL, props<{ payload: any }>());
export const getMessagesDetailCompletely = createAction(ACTION_GET_MESSAGES_DETAIL_COMPLETELY, props<{
  payload: any
}>());

export const getMessagesDetailScrollUp = createAction(ACTION_GET_MESSAGES_DETAIL_SCROLL_UP, props<{ payload: any }>());
export const getMessagesDetailScrollUpCompletely = createAction(ACTION_GET_MESSAGES_DETAIL_SCROLL_UP_COMPLETELY, props<{
  payload: any
}>());

export const getMessagesDetailScrollDown = createAction(ACTION_GET_MESSAGES_DETAIL_SCROLL_DOWN, props<{ payload: any }>());
export const getMessagesDetailScrollDownCompletely = createAction(ACTION_GET_MESSAGES_DETAIL_SCROLL_DOWN_COMPLETELY, props<{
  payload: any
}>());

export const updateConversationlist = createAction(UPDATE_CONVERSATION_LIST, props<{
  messageComing: MessageReceiveModel,
  unreadCount: number,
  isPremium: boolean,
  isDisabled: boolean,
  sentOn: string
}>());

export const getConversationInfomation = createAction(ACTION_GET_CONVERSATION_INFORMATION, props<{
  conversationId: string;
  isAppendToList?: boolean,
  messageType?: string,
  messageBody?: string,
  isAppendMsgFromWs?: boolean
}>());

export const getConversationInfomationCompletely = createAction(ACTION_GET_CONVERSATION_INFORMATION_COMPLETELY, props<{
  conversation: ConversationListModel,
  isAppendToList?: boolean
}>());

export const toogleFavourite = createAction(ACTION_TOGGLE_FAVOURITE_CONVERSATION, props<{
  conversationId: string,
  isStarring: boolean
}>());

export const noneResponse = createAction(ACTION_NONE_RESPONSE);

export const markReadAll = createAction(ACTION_MARK_READ_ALL, props<{
  conversationId: string,
  // isStarring: boolean
}>());

export const deleteConversation = createAction(ACTION_DELETE_CONVERSATION, props<{ conversationId: string }>());
export const deleteConversationCompleted = createAction(ACTION_DELETE_CONVERSATION_COMPLETELY, props<{ conversationId: string }>());

export const restoreConversation = createAction(ACTION_RESTORE_CONVERSATION, props<{ conversationId: string }>());
export const restoreConversationCompleted = createAction(ACTION_RESTORE_CONVERSATION_COMPLETELY, props<{ conversationId: string }>());

export const blockConversation = createAction(ACTION_BLOCK_CONVERSATION, props<{ conversationId: string }>());
export const blockConversationCompleted = createAction(ACTION_BLOCK_CONVERSATION_COMPLETELY, props<{ conversationId: string }>());

export const selectedConversation = createAction(SELECTED_CONVERSATION, props<{ conversationId: string }>());

export const selectedConversationCompleted = createAction(SELECTED_CONVERSATION_COMPLETED,
  props<{ conversation: ConversationListModel, }>()
);

export const getUnReadMessage = createAction(ACTION_GET_UNREAD_MESSAGE, props<{ payload: any }>());
export const getUnReadMessageCompleted = createAction(ACTION_GET_UNREAD_MESSAGE_COMPLETED, props<{ payload: any }>());
