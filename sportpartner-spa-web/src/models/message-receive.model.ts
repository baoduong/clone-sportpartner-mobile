export class MessageReceiveModel {
  conversationId: string;
  conversationType: string;
  referenceId: number;
  senderId: number;
  senderGuid: string;
  senderName: string;
  senderPhoto: string;
  messageBody: string;
  messageType: string;
  sentOnTime: number;
  sentOnDate: string;
  sentOnDateType: string;
  source: string;
  tick: number;
  countryId: number;
  isSenderWasDeleted: boolean;
  isRead: boolean;
  isMyMessage?: boolean; // extend
}
