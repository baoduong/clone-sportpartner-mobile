export class ConversationListModel {
  conversationId: string;
  conversationName: string;
  conversationType: string;
  conversationPhoto: string;
  referenceId: number;
  referencePublicId: number;
  senderName: string;
  messageBody: string;
  messageType: string;
  messageTick: number;
  sentOn: string;
  sentOnType: string;
  unreadCount: number;
  isStarred: boolean;
  isCurrentUser: boolean;
  hasHighFiveBack: boolean;
  isDisabled: boolean;
  isSenderWasDeleted: boolean;
}
