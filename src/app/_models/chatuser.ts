import { CometChat } from "@cometchat-pro/chat";

export class ChatUser implements CometChat.UserObj {
  uid: string;
  name: string;
  authToken: string;
  avatar: string;
  lastActiveAt: number;
  link: string;
  metadata: string;
  role: string;
  status: string;
  statusMessage: string;
}
