import { state } from '@angular/animations';
import { MessageTypeEnum } from './../components/message-detail-item/message-type.enum';
import { createReducer, on, Action } from '@ngrx/store';
import * as chatActions from './chat.actions';
import { MessageReceiveModel } from 'src/models/message-receive.model';
import { ConversationListModel } from 'src/models/conversation-list.model';

export interface State {
  chatDetails: {
    messageData: MessageReceiveModel[],
    ableToLoadDown: boolean,
    ableToLoadUp: boolean,
    unreadTick: number
  };
  channelConversations: ConversationListModel[];
  conversationInfomation: ConversationListModel;
  category: string;
  selectedConversation: ConversationListModel;
  lastestMessageJoin: MessageReceiveModel;
  unreadCount: number;
}

const chatReducers = createReducer({
  chatDetails: {
    messageData: [],
    ableToLoadDown: false,
    ableToLoadUp: false,
    unreadTick: -1
  },
  channelConversations: undefined,
  conversationInfomation: undefined,
  category: 'Inbox',
  selectedConversation: undefined,
  lastestMessageJoin: undefined,
  unreadCount: 0
},
  // Chat real time
  on(chatActions.onSendMessage, (state, { payload }) => ({ ...state, payload })),
  on(chatActions.onReceiveMessage, (state, { payload }) => {

    const newChat = {
      messageData: [...state.chatDetails['messageData'], payload],
      ableToLoadDown: false,
      ableToLoadUp: false,
      unreadTick: -1
    };
    let lastestMessageJoin = state.lastestMessageJoin;
    if (payload.messageType === MessageTypeEnum.joinConversation) {
      lastestMessageJoin = payload;
    }
    if (payload.messageType === MessageTypeEnum.leftConversation) {
      lastestMessageJoin = undefined;
    }
    return ({
      ...state,
      chatDetails: newChat,
      lastestMessageJoin
    });
  }),

  // get chat from api
  on(chatActions.getMessagesDetail, (state, { payload }) => ({
    ...state, chatDetails: {
      messageData: [],
      ableToLoadDown: false,
      ableToLoadUp: false,
      unreadTick: -1
    }
  })),

  // First load
  on(chatActions.getMessagesDetailCompletely, (state, { payload }) => {
    const { messageData, ableToLoadDown, ableToLoadUp, unreadTick, currentUser } = payload;
    const newChat = {
      messageData: messageData,
      ableToLoadDown: ableToLoadDown,
      ableToLoadUp: ableToLoadUp,
      unreadTick: unreadTick
    };

    const messageJoins = messageData.filter(message =>
      message.messageType === MessageTypeEnum.joinConversation && currentUser.publicId !== message.senderGuid);

    let lastestMessageJoin = messageJoins[messageJoins.length - 1] || state.lastestMessageJoin;
    if (state.lastestMessageJoin && state.lastestMessageJoin.tick > lastestMessageJoin.tick) {
      lastestMessageJoin = state.lastestMessageJoin;
    }

    return ({
      ...state,
      chatDetails: newChat,
      lastestMessageJoin
    });
  }),

  // Scroll Up
  on(chatActions.getMessagesDetailScrollUpCompletely, (state, { payload }) => {
    const { messageData, currentUser } = payload;

    const messageJoins = messageData.filter(message =>
      message.messageType === MessageTypeEnum.joinConversation && currentUser.publicId !== message.senderGuid);

    let lastestMessageJoin = messageJoins[messageJoins.length - 1] || state.lastestMessageJoin;
    if (state.lastestMessageJoin && state.lastestMessageJoin.tick > lastestMessageJoin.tick) {
      lastestMessageJoin = state.lastestMessageJoin;
    }

    return ({
      ...state,
      lastestMessageJoin
    });
  }),

  // Scroll Down
  on(chatActions.getMessagesDetailScrollDownCompletely, (state, { payload }) => {
    const { messageData, currentUser } = payload;

    const messageJoins = messageData.filter(message =>
      message.messageType === MessageTypeEnum.joinConversation && currentUser.publicId !== message.senderGuid);

    let lastestMessageJoin = messageJoins[messageJoins.length - 1] || state.lastestMessageJoin;
    if (state.lastestMessageJoin && state.lastestMessageJoin.tick > lastestMessageJoin.tick) {
      lastestMessageJoin = state.lastestMessageJoin;
    }

    return ({
      ...state,
      lastestMessageJoin
    });
  }),

  // get list conversation from api
  on(chatActions.getFirstListConversation, (state, { category }) => ({ ...state, channelConversations: undefined, category: category })),
  on(chatActions.getFirstListConversationCompletely, (state, { payload }) => {
    const ableLoadMore = payload.length > 0;
    return ({ ...state, channelConversations: payload, ableLoadMore });
  }),

  on(chatActions.lazyLoadConversationList, (state, { tick, category }) => {
    return ({ ...state, tick, category });
  }),

  on(chatActions.lazyLoadConversationListCompletely, (state, { payload }) => {
    const ableLoadMore = payload.length > 0;
    const newList = [...state.channelConversations, ...payload];
    return ({ ...state, channelConversations: newList, ableLoadMore });
  }),

  // Update Info's conversation List
  on(chatActions.updateConversationlist, (state, {
    messageComing,
    unreadCount,
    isPremium,
    isDisabled,
    sentOn
  }) => {

    const copyList = [...state.channelConversations];

    const updateConversations = copyList.slice().find((data: ConversationListModel) => data.conversationId === messageComing.conversationId);

    if (updateConversations) {
      const index = copyList.slice()
        .findIndex((data: ConversationListModel) => data.conversationId === messageComing.conversationId);

      let { unreadCount: _unreadCount, messageBody } = updateConversations;

      _unreadCount = _unreadCount + unreadCount;
      messageBody = messageComing.messageBody;
      const conversation = Object.assign(
        new ConversationListModel(),
        updateConversations,
        {
          unreadCount: _unreadCount,
          messageBody,
          senderName: messageComing.senderName,
          messageType: messageComing.messageType,
          isDisabled: isDisabled,
          sentOn: sentOn
        }
      );

      const newList = [conversation, ...copyList.slice(0, index), ...copyList.slice(index + 1, copyList.length)];
      return ({
        ...state,
        channelConversations: newList
      });

    } else {
      const newConversation = Object.assign(new ConversationListModel(),
        {
          conversationId: messageComing.conversationId,
          conversationType: 'NONE_EXISTED',
          messageType: messageComing.messageType,
          messageBody: messageComing.messageBody
        });
      return ({
        ...state,
        channelConversations: [newConversation, ...state.channelConversations]
      });
    }
  }),

  on(chatActions.getConversationInfomationCompletely, (state, { conversation, isAppendToList }) => {

    const newConversation = Object.assign(new ConversationListModel(),
      conversation,
      {
        conversationId: conversation.conversationId,
        unreadCount: conversation.unreadCount
      });
    if (isAppendToList === undefined || isAppendToList) {
      if (state.category === 'Starred') {
        if (newConversation.isStarred) {
          return ({
            ...state,
            channelConversations: [newConversation, ...state.channelConversations.slice(1)]
          });
        } else {
          return ({
            ...state,
            channelConversations: state.channelConversations.filter(c => c.conversationType !== 'NONE_EXISTED')
          });
        }
      } else {
        return ({
          ...state,
          channelConversations: [newConversation, ...state.channelConversations.slice(1)]
        });
      }
    } else {
      return ({
        ...state,
        conversationInfomation: conversation
      });
    }
  }),

  on(chatActions.markReadAll, (state, { conversationId }) => {
    const copyList = [...state.channelConversations];
    const updateConversations = copyList.slice()
      .find((data: ConversationListModel) => data.conversationId === conversationId);
    if (updateConversations) {
      const index = copyList.slice().findIndex((data: ConversationListModel) => data.conversationId === conversationId);
      const conversation = Object.assign(
        new ConversationListModel(),
        updateConversations,
        {
          unreadCount: 0
        }
      );
      const newList = [...copyList.slice(0, index), conversation, ...copyList.slice(index + 1, copyList.length)];
      return ({
        ...state,
        channelConversations: newList
      });
    } else {
      return ({
        ...state
      });
    }
  }),

  on(chatActions.toogleFavourite, (state, { conversationId, isStarring }) => {

    console.log('%c⧭', 'color: #e50000', 'test');
    const copyList = state.channelConversations.slice();
    const index = copyList.findIndex((data: ConversationListModel) => data.conversationId === conversationId);
    const updatingConversations = copyList.find((data: ConversationListModel) => data.conversationId === conversationId);

    if (state.category === 'Starred') {
      if (!isStarring) {
        const newList = [...state.channelConversations.slice(0, index), ...state.channelConversations.slice(index + 1, state.channelConversations.length)];
        return ({
          ...state,
          channelConversations: newList
        });
      }
    } else {
      const updatedConversation = Object.assign(new ConversationListModel(), updatingConversations,
        {
          isStarred: isStarring
        });
      return ({
        ...state,
        channelConversations: [...copyList.slice(0, index), updatedConversation, ...copyList.slice(index + 1, copyList.length)]
      });
    }
  }),

  on(chatActions.deleteConversationCompleted, ((state, { conversationId }) => {
    const index = state.channelConversations.findIndex((data: ConversationListModel) =>
      data.conversationId === conversationId);
    const newList = [...state.channelConversations.slice(0, index), ...state.channelConversations.slice(index + 1, state.channelConversations.length)];

    return ({
      ...state,
      channelConversations: newList
    });
  })),

  on(chatActions.blockConversationCompleted, ((state, { conversationId }) => {
    const index = state.channelConversations.findIndex((data: ConversationListModel) =>
      data.conversationId === conversationId);
    const newList = [...state.channelConversations.slice(0, index), ...state.channelConversations.slice(index + 1, state.channelConversations.length)];

    return ({
      ...state,
      channelConversations: newList
    });
  })),

  on(chatActions.restoreConversationCompleted, ((state, { conversationId }) => {
    const index = state.channelConversations.findIndex((data: ConversationListModel) =>
      data.conversationId === conversationId);
    const newList = [...state.channelConversations.slice(0, index), ...state.channelConversations.slice(index + 1, state.channelConversations.length)];

    return ({
      ...state,
      channelConversations: newList
    });
  })),

  on(chatActions.selectedConversation, ((state, { conversationId }) => {
    const conversation = state.channelConversations.find(cv => cv.conversationId === conversationId);
    return ({ ...state, selectedConversation: conversation, lastestMessageJoin: undefined });
  })),

  on(chatActions.selectedConversationCompleted, ((state, { conversation }) => {
    return ({ ...state, selectedConversation: conversation });
  })),

  on(chatActions.getUnReadMessage, (state) => {
    return ({ ...state, unreadCount: 0 });
  }),
  on(chatActions.getUnReadMessageCompleted, (state, { payload }) => {
    const { count } = payload;
    return ({ ...state, unreadCount: count });
  })
);

export function reducer(state: State | undefined, action: Action) {
  return chatReducers(state, action);
}
