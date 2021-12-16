export class MessageSendingModel {
  conversationId: string;
  conversationType: string;
  referenceId: number;
  senderId: number;
  senderGuid: string;
  senderName: string;
  senderPhoto: string;
  messageBody: string;
  source: string;
  messageType?: string;
  isMyMessage?: boolean; // extend
}


