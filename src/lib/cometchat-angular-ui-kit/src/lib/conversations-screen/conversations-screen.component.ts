import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import { SearchchatdialogComponent } from "src/app/shared/searchchatdialog/searchchatdialog.component";
import { AuthenticationService, GenericService } from "src/app/_services";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { CometChatMainManager } from "../cometchat-embedded/cometchat-manager";
import { ConversationsListComponent } from "../conversations-list/conversations-list.component";
import { Helper } from "../helpers/helper";
import {
  CALL_SCREEN_ACTIONS, CONTACT_LIST_ACTIONS, CONVERSATIONS_SCREEN_ACTIONS, CONVERSATION_LIST_ACTIONS
} from "../string_constants";
import { UnreadConversationListComponent } from "../unread-conversation-list/unread-conversation-list.component";

@Component({
  selector: "cometchat-conversations-screen",
  templateUrl: "./conversations-screen.component.html",
  styleUrls: ["./conversations-screen.component.scss"],
})
export class ConversationsScreenComponent implements OnInit {
  user?: object;
  group?: object;
  json = JSON;
  inProgressCall;
  incomingScreen;
  messagesActions;
  loggedInUser;
  isadmin = false;
  cometchatManager: CometChatMainManager = new CometChatMainManager();
  mentions;
  isMentionLoading = true;
  isPlaceholder = false;
  showmentions = false;
  array: any[];
  unreadGroups: CometChat.Conversation[] | any = [];
  backgroundColor = "blue";
  textColor = "white";
  image: any;
  cornerRadius?: any;
  borderWidth?: any;
  borderColor?: any;
  dashboardchatskeleton = true;
  retry = 1;
  isunreadmessage: boolean = false;
  @ViewChild("conversationslist") convlist: ConversationsListComponent;
  @ViewChild("unreadconversationslist")
  unreadconvlist: UnreadConversationListComponent;
  // @ViewChild('conversationslist') mentionsscreen : MentionsdialogComponent;
  constructor(
    private cdRef: ChangeDetectorRef,
    private authService: AuthenticationService,
    public genericService: GenericService,
    private eventService: EventEmitterService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    public router: Router
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
    this.isadmin = this.genericService.isUserAdmin(
      this.authService.currentUserValue.user
    );
    if (this.router.url == '/home/inbox/messages') {
      this.getunreadmessageid();
    }
  }

  ngOnInit(): void {
    this.cometchatManager.isLoggedIn(() => {
      this.cometchatManager.attachListener((event) => {
        switch (event.action) {
          case CALL_SCREEN_ACTIONS.INCOMING_CALL_RECEIVED: {
            this.genericService.playIncomingAudio();
            this.incomingScreen = false;
            setTimeout(() => {
              this.incomingScreen = true;
              this.inProgressCall = JSON.stringify(event.payload.call);
              this.cdRef.detectChanges();
            }, 300);
            this.cdRef.detectChanges();
            this.eventService.onInboxDashboardRefresh();
            break;
          }
          case CALL_SCREEN_ACTIONS.INCOMING_CALL_CANCELLED: {
            this.genericService.stopIncomingAudio();
            this.genericService.stopOutgoingAudio();
            this.incomingScreen = false;
            this.inProgressCall = JSON.stringify(event.payload.call);
            this.cdRef.detectChanges();
            this.eventService.onInboxDashboardRefresh();
            break;
          }
        }
      });
    });
  }

  onItemSelected(event: { action: string; payload?: object | any }): void {
    this.showmentions = false;
    let type;
    let item;
    switch (event.action) {
      case CONTACT_LIST_ACTIONS.CONTACT_ITEM_SELECTED:
        type = "user";
        this.group = undefined;
        item = event.payload.user;
        this.user = event.payload.user;
        break;
      case CONVERSATION_LIST_ACTIONS.CONVERSATION_ITEM_SELECTED:
        if (event.payload.hasOwnProperty("user")) {
          type = "user";
          this.group = undefined;
          item = event.payload.user;
          this.user = event.payload.user;
        } else {
          type = "group";
          this.user = undefined;
          item = event.payload.group;
          this.group = event.payload.group;
        }
        break;
    }
  }

  /**
   * Handles action by conversation screen
   * @param event: {action:string,payload?:any}
   */
  handleActionByConversationScreen = (event: {
    action: string;
    payload?: object | any;
  }): void => {
    this.messagesActions = event;
    switch (event.action) {
      case CONVERSATIONS_SCREEN_ACTIONS.MESSAGES_COMPOSER_ACTIONS
        .MESSAGE_SENT: {
          break;
        }
      case CONVERSATIONS_SCREEN_ACTIONS.MEDIA_MESSAGES_COMPOSER_ACTIONS
        .MEDIA_MESSAGE_SENT: {
          break;
        }
      case CONVERSATIONS_SCREEN_ACTIONS.ADD_MEMBERES_CONTS.ACTIONS
        .MEMBERS_ADDED: {
          break;
        }
      case CONVERSATIONS_SCREEN_ACTIONS.CONVERSATION_SCREEN_HEADER_ACTIONS
        .AUDIO_CALL_STARTED: {
          this.inProgressCall = JSON.stringify(event.payload.outGoingCall);
          break;
        }
      case CONVERSATIONS_SCREEN_ACTIONS.CONVERSATION_SCREEN_HEADER_ACTIONS
        .VIDEO_CALL_STARTED: {
          this.inProgressCall = JSON.stringify(event.payload.outGoingCall);
          break;
        }
    }
    this.cdRef.detectChanges();
    this.eventService.onInboxDashboardRefresh();
  };
  handleCallScreenActions = (event): void => {
    let tempUser = this.user;
    let tempGroup = this.group;
    this.user = undefined;
    this.group = undefined;

    this.user = tempUser;
    this.group = tempGroup;
    this.cdRef.detectChanges();
    this.eventService.onInboxDashboardRefresh();
  };
  showMention(): void {
    this.showmentions = true;
    this.group = undefined;
    this.convlist.selectedConversation = undefined;
    if (this.isunreadmessage) {
      this.unreadconvlist.selectedConversation = undefined;
    }
    this.isMentionLoading = true;
    const URL = "v1/fetch";
    CometChat.callExtension("mentions", "GET", URL, null)
      .then((response: any) => {
        // {messages: []}
        // console.log(response)
        this.mentions = response;
        this.isMentionLoading = false;
        if (response.messages.length == 0) {
          this.isPlaceholder = true;
        }
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        // Error occured
        this.isMentionLoading = false;
        this.isPlaceholder = true;
        this.cdRef.detectChanges();
      });
  }

  onMEntionClick(mention): void {
    var GUID = mention.data.entities.receiver.entity.guid;
    this.genericService.setSelectedChatGroupID(GUID);
    // this.dialogRef.close();
  }

  openMentions(): void {
    this.showMention();
    this.genericService.mentionbuttonselected = true;
    this.cdRef.detectChanges();
  }
  searchChatDialog(): void {
    this.snackBar.openFromComponent(SearchchatdialogComponent, {
      data: "element",
      panelClass: ["chatdialog"],
    });
  }
  getunreadmessageid() {
    setTimeout(() => {
      CometChat.getUnreadMessageCountForAllGroups().then(
        (array) => {
          var totalcount = [];
          var user = array;
          let entries = Object.entries(user);
          for (const [prop, val] of entries) {
            totalcount.push(prop);
          }
          this.array = totalcount;
          this.getUnreadMessage();
        },
        (error) => {
          if (this.retry > 0) {
            this.retry--;
            this.getunreadmessageid();
          } else {
          }
        }
      );
    }, 2000);
  }
  async getUnreadMessage() {
    if (this.array.length > 0) {
      for (let i = 0; i <= 10; i++) {
        var GUID = this.array[i];
        CometChat.getConversation(GUID, "group").then(
          (conversation) => {
            this.isunreadmessage = true;
            conversation = this.setProfileImage(conversation);
            this.unreadGroups.push(conversation);
            this.unreadGroups = this.unreadGroups.sort((a, b) => {
              return b.unreadMessageCount - a.unreadMessageCount;
            });
            this.dashboardchatskeleton = false;
            this.cdRef.detectChanges();
          },
          () => { }
        );
      }
    } else {
      this.dashboardchatskeleton = false;
    }

    this.cdRef.detectChanges();
  }
  getMyStyle = () => {
    return {
      background: this.backgroundColor,
      color: this.textColor,
    };
  };

  getMyAvStyle = () => {
    return {
      border:
        (this.borderWidth ? this.borderWidth : "1px") +
        " solid " +
        (this.borderColor ? this.borderColor : "#AAA"),
      "border-radius": this.cornerRadius ? this.cornerRadius : "50%",
    };
  };

  getimage(conversation: any) {
    if (conversation.getConversationType() == "user") {
      if (!(conversation.getConversationWith() as CometChat.User).getAvatar()) {
        (conversation.getConversationWith() as CometChat.User).setAvatar(
          Helper.getSVGAvatar(
            (conversation.getConversationWith() as CometChat.User).getUid(),
            conversation
              .getConversationWith()
              .getName()
              .substr(0, 1)
              .toUpperCase()
          )
        );
      }
    } else {
      if (!(conversation.getConversationWith() as CometChat.Group).getIcon()) {
        (conversation.getConversationWith() as CometChat.Group).setIcon(
          Helper.getSVGAvatar(
            (conversation.getConversationWith() as CometChat.Group).getGuid(),
            "#" +
            conversation
              .getConversationWith()
              .getName()
              .substr(0, 1)
              .toUpperCase()
          )
        );
        this.cdRef.detectChanges();
      }
    }
    conversation.conversationWith.icon =
      this.sanitizer.bypassSecurityTrustResourceUrl(
        conversation.conversationWith.icon
      );
    return conversation;
  }
  setProfileImage(conversation: CometChat.Conversation) {
    if (conversation.getConversationType() == "user") {
      if (!(conversation.getConversationWith() as CometChat.User).getAvatar()) {
        (conversation.getConversationWith() as CometChat.User).setAvatar(
          Helper.getSVGAvatar(
            (conversation.getConversationWith() as CometChat.User).getUid(),
            conversation
              .getConversationWith()
              .getName()
              .substr(0, 1)
              .toUpperCase()
          )
        );
      }
    } else {
      if (!(conversation.getConversationWith() as CometChat.Group).getIcon()) {
        (conversation.getConversationWith() as CometChat.Group).setIcon(
          Helper.getSVGAvatar(
            (conversation.getConversationWith() as CometChat.Group).getGuid(),
            "#" +
            conversation
              .getConversationWith()
              .getName()
              .substr(0, 1)
              .toUpperCase()
          )
        );
      }
    }
    return conversation;
  }
  unreadClick() {
    this.convlist.selectedConversation = undefined;
  }
  readClick() {
    this.unreadconvlist.selectedConversation = undefined;
  }
}
