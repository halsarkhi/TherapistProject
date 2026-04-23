import { MessageType } from './enums';

export interface Message {
  id: string;
  senderId?: string;
  senderUserId?: string;
  senderName: string;
  senderSpecialization?: string;
  receiverId?: string;
  recipientId?: string;
  receiverName?: string;
  subject?: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  readAt?: string;
  isBroadcast?: boolean;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CreateMessageDto {
  receiverId?: string;
  subject: string;
  content: string;
  messageType: MessageType;
  isBroadcast: boolean;
  attachmentUrl?: string;
}
