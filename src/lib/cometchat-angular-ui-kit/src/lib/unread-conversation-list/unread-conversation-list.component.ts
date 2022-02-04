import {
  ChangeDetectorRef, Component, EventEmitter, HostListener,
  Input, OnChanges, OnInit, Output, SimpleChanges,
  ViewChild
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { CometChat } from "@cometchat-pro/chat";
import { GenericService } from "src/app/_services";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { ConversationListManager } from "../conversations-list/cometchat-manager";
import { Helper } from "../helpers/helper";
import {
  CONVERSATIONS_SCREEN_ACTIONS, CONVERSATION_LIST_ACTIONS, USER_LIST_ACTIONS
} from "../string_constants";

@Component({
  selector: "app-unread-conversation-list",
  templateUrl: "./unread-conversation-list.component.html",
  styleUrls: ["./unread-conversation-list.component.scss"],
})
export class UnreadConversationListComponent implements OnChanges, OnInit {
  searchChats;
  JSONParser = JSON; // * JSON object to be used in `HTML`.

  conversationManager: ConversationListManager; // * contains cometchat related method for the ConversationsListComponent.
  decoratorMessage = "LOADING...";
  /**
   * * currently selected conversation either can be provided by as an attribute (input),
   * * or can be set on click of the conversation list item.
   */
  @Input() selectedConversation?: CometChat.Conversation | any;

  @Input() selectedUser?;
  @Input() selectedGroup?;
  /**
   * * Input  of conversations list component
   * * an updated list of conversation can be provided as an input. component can verify the provided list and update the dom if needed.
   */
  @Input() updatedConversations?: CometChat.Conversation[] | any;

  /**
   * * List of conversations either provided as an attribute (input) or can be set using fetching the list.
   */
  @Input() conversations?: CometChat.Conversation[] | any = [];

  @Input() actionRequired: { action: string; payload?: object | any };
  /**
   * * Event emitter function can triggered on ckick of the conversation list item( conversation ).
   */
  @Output() actionPerformed = new EventEmitter<{
    action: string;
    payload?: object;
  }>();
  @ViewChild("unreadconversationslist")
  convlist: UnreadConversationListComponent;
  searchStarted?;

  array: any[];
  @Input() unreadGroups: CometChat.Conversation[] | any = [];
  backgroundColor = "blue";
  textColor = "white";
  image: any;
  cornerRadius?: any;
  borderWidth?: any;
  borderColor?: any;
  dashboardchatskeleton = true;
  retry = 1;
  constructor(
    private cdRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private changedetector: ChangeDetectorRef,
    public genericService: GenericService,
    private eventEmitterService: EventEmitterService
  ) {
    // this.getunreadmessageid()
  }

  onConversationClick = (conversation: CometChat.Conversation) => {
    this.genericService.mentionbuttonselected = false;
    // this.convlist.selectedConversation = undefined
    this.selectedConversation = conversation; // setting the selected conversation.
    this.selectedConversation.unreadMessageCount = 0;
    this.changedetector.detectChanges();
    if (conversation.getLastMessage()) {
      this.callback(conversation.getLastMessage(), false, false);
    }

    this.actionPerformed.emit({
      action: CONVERSATION_LIST_ACTIONS.CONVERSATION_ITEM_SELECTED,
      payload: {
        group: conversation.getConversationWith(),
      },
    });

    if (conversation.getConversationType() === "user") {
      this.actionPerformed.emit({
        action: CONVERSATION_LIST_ACTIONS.CONVERSATION_ITEM_SELECTED,
        payload: {
          user: conversation.getConversationWith(),
        },
      });
    }
  };

  /**
   * on changes
   * * Replcement for the ngOnInit function all the initialization tasks are perfomed here.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.actionRequired) {
      let event = changes.actionRequired.currentValue;

      if (event) {
        switch (event.action) {
          case CONVERSATIONS_SCREEN_ACTIONS.MESSAGES_COMPOSER_ACTIONS
            .MESSAGE_SENT:
            CometChat.CometChatHelper.getConversationFromMessage(
              event.payload.message
            ).then((updatedConversation: CometChat.Conversation) => {
              let found: boolean = false;
              updatedConversation = this.setProfileImage(updatedConversation);
              this.conversations.map(
                (conversation: CometChat.Conversation, i: number) => {
                  if (
                    conversation.getConversationId() ===
                    updatedConversation.getConversationId()
                  ) {
                    found = true;
                    if (
                      this.selectedConversation &&
                      this.selectedConversation.getConversationId() ===
                      updatedConversation.getConversationId()
                    ) {
                      updatedConversation.setUnreadMessageCount(0);
                    } else {
                      // tslint:disable-next-line: radix
                      updatedConversation.setUnreadMessageCount(
                        conversation.getUnreadMessageCount() + 1
                      );
                    }
                    updatedConversation.setConversationWith(
                      this.conversations[i].getConversationWith()
                    );

                    this.conversations.splice(i, 1);

                    this.conversations = [
                      updatedConversation,
                      ...this.conversations,
                    ];
                  }
                }
              );
              if (!found) {
                this.selectedConversation = updatedConversation;
                this.conversations = [
                  updatedConversation,
                  ...this.conversations,
                ];
              }
              this.cdRef.detectChanges();
            });

            // TODO do something on success of message sending.
            break;
          case CONVERSATIONS_SCREEN_ACTIONS.MEDIA_MESSAGES_COMPOSER_ACTIONS
            .MEDIA_MESSAGE_SENT:
            // TODO do something on success of media message sending.

            CometChat.CometChatHelper.getConversationFromMessage(
              event.payload.message
            ).then((updatedConversation: CometChat.Conversation) => {
              updatedConversation = this.setProfileImage(updatedConversation);
              this.conversations.map(
                (conversation: CometChat.Conversation, i: number) => {
                  if (
                    conversation.getConversationId() ===
                    updatedConversation.getConversationId()
                  ) {
                    if (
                      this.selectedConversation &&
                      this.selectedConversation.getConversationId() ===
                      updatedConversation.getConversationId()
                    ) {
                      updatedConversation.setUnreadMessageCount(0);
                    } else {
                      // tslint:disable-next-line: radix
                      updatedConversation.setUnreadMessageCount(
                        conversation.getUnreadMessageCount() + 1
                      );
                    }

                    this.conversations.splice(i, 1);
                    this.conversations = [
                      updatedConversation,
                      ...this.conversations,
                    ];
                  }
                }
              );
              this.cdRef.detectChanges();
            });
            break;
        }
      }
    }
    if (
      this.updatedConversations &&
      !(this.updatedConversations instanceof Object)
    ) {
      const updatedConversations: CometChat.Conversation[] =
        [] as CometChat.Conversation[];
      const conversationsJsonArray: [] = JSON.parse(this.conversations);
      conversationsJsonArray.map((conversation: CometChat.Conversation) => {
        const conv = new CometChat.Conversation(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        );
        Object.assign(conv, conversation);
        updatedConversations.push(conv);
      });

      this.updatedConversations = updatedConversations;
      this.conversations = [...this.conversations, ...updatedConversations];
    }

    if (this.conversations && !(this.conversations instanceof Object)) {
      const conversations: CometChat.Conversation[] =
        [] as CometChat.Conversation[];
      const conversationsJsonArray: [] = JSON.parse(this.conversations);
      conversationsJsonArray.map((conversation: CometChat.Conversation) => {
        const conv = new CometChat.Conversation(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        );
        Object.assign(conv, conversation);
        conversations.push(conv);
      });

      this.conversations = conversations;
    }

    if (
      this.selectedConversation &&
      !(this.selectedConversation instanceof Object)
    ) {
      const conv = new CometChat.Conversation(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
      Object.assign(conv, JSON.parse(this.selectedConversation));
      this.selectedConversation = conv;
    }
  }

  ngOnInit() {
    if (this.selectedUser) {
      if (
        typeof this.selectedUser === "string" &&
        !(this.selectedUser === "")
      ) {
        let tempUser = new CometChat.User({});
        this.selectedUser = Object.assign(
          tempUser,
          JSON.parse(this.selectedUser) as CometChat.User
        ) as CometChat.User;
      }
    }
    if (this.selectedGroup) {
      if (
        typeof this.selectedGroup === "string" &&
        !(this.selectedGroup === "")
      ) {
        let tempGroup = new CometChat.Group("", "", "");
        this.selectedGroup = Object.assign(
          tempGroup,
          JSON.parse(this.selectedGroup) as CometChat.Group
        ) as CometChat.Group;
      }
    }
    this.conversationManager = new ConversationListManager();
    this.init();
  }

  /**
   * on destroy
   * *Angular lifecycle event.
   * *Cleaning of component is done here.
   */
  // ngOnDestroy(): void {
  //   this.conversationManager.distroyComponent();
  //   this.conversationManager = null;
  //   this.selectedConversation = null;
  //   this.conversations = null;
  //   this.JSONParser = null;
  //   this.callback = null;
  // }

  /**
   * Inits conversations list component
   * checking if the user is loggedIn.
   * Peforms all the functions needed to init or after initing the Component.
   */
  init() {
    this.conversationManager.isLoggedIn(this.isChatReady);
    this.conversationManager.attachListener((message, isReceipt) =>
      this.callback(message, isReceipt)
    );
    this.conversationManager.attachUserListener((event) =>
      this.userListernerCallback(event)
    );
  }

  /**
   * Callback  of conversations list component
   */
  callback(message, isReceipt, makeFirst = true) {
    if (!isReceipt) {
      CometChat.CometChatHelper.getConversationFromMessage(message).then(
        (updatedConversation: CometChat.Conversation) => {
          updatedConversation = this.setProfileImage(updatedConversation);
          if (this.conversations.length > 0) {
            this.conversations.map(
              (conversation: CometChat.Conversation, i: number) => {
                if (
                  conversation.getConversationId() ===
                  updatedConversation.getConversationId()
                ) {
                  var unreadcount = conversation.getUnreadMessageCount();
                  updatedConversation.setConversationWith(
                    conversation.getConversationWith()
                  );
                  if (
                    this.selectedConversation &&
                    this.selectedConversation.getConversationId() ===
                    updatedConversation.getConversationId()
                  ) {
                    updatedConversation.setUnreadMessageCount(0);
                  } else {
                    // tslint:disable-next-line: radix
                    updatedConversation.setUnreadMessageCount(
                      conversation.getUnreadMessageCount() + 1
                    );
                  }
                  if (makeFirst) {
                    this.conversations.splice(i, 1);
                    this.conversations = [
                      updatedConversation,
                      ...this.conversations,
                    ];
                  } else {
                    this.conversations[i] = updatedConversation;
                  }
                  this.eventEmitterService.onConversationItemSelected(
                    unreadcount
                  );
                }
              }
            );
          } else {
            this.conversations = [updatedConversation];
          }
          this.cdRef.detectChanges();
        }
      );
    } else {
    }
  }
  userListernerCallback(event) {
    switch (event.action) {
      case USER_LIST_ACTIONS.USER_STATUS_CHANGED.ONLINE:
        this.conversations.map((conversation, i) => {
          if (conversation.conversationType === "user") {
            let user = conversation.conversationWith;
            if (
              user.uid.toString() === event.payload.onlineUser.uid.toString()
            ) {
              conversation.setConversationWith(event.payload.onlineUser);
              conversation = this.setProfileImage(conversation);
              this.conversations[i] = conversation;
            }
          }
        });
        break;
      case USER_LIST_ACTIONS.USER_STATUS_CHANGED.OFFLINE:
        this.conversations.map((conversation, i) => {
          if (conversation.conversationType === "user") {
            let user = conversation.conversationWith;
            if (
              user.uid.toString() === event.payload.offlineUser.uid.toString()
            ) {
              conversation.setConversationWith(event.payload.offlineUser);
              conversation = this.setProfileImage(conversation);
              this.conversations[i] = conversation;
            }
          }
        });
        break;
    }
    this.cdRef.detectChanges();
  }

  /**
   * Hosts listener
   * @param elem HTML elemet on which scroll action is perfomed.
   * Function will determine if onScroll event scroll top is reached to bottom
   * ,and if yes will try to load next set of conversations if available.
   */
  @HostListener("window:scroll", ["$event"])
  onScroll(elem: any) {
    if (
      elem.target.offsetHeight + elem.target.scrollTop >=
      elem.target.scrollHeight
    ) {
      this.conversationManager.fetchNext().then(
        (conversations: CometChat.Conversation[]) => {
          conversations.map((conversation, i) => {
            conversation = this.setProfileImage(conversation);
            conversations[i] = conversation;
            if (conversation.getConversationType() === "user") {
              if (this.selectedUser)
                if (
                  (
                    conversation.getConversationWith() as CometChat.User
                  ).getUid() === (this.selectedUser as CometChat.User).getUid()
                ) {
                  this.selectedConversation = conversation;
                }
            }
            if (conversation.getConversationType() === "group") {
              if (this.selectedGroup)
                if (
                  (
                    conversation.getConversationWith() as CometChat.Group
                  ).getGuid() ===
                  (this.selectedGroup as CometChat.Group).getGuid()
                ) {
                  this.selectedConversation = conversation;
                }
            }
          });
          this.conversations = [...this.conversations, ...conversations];
        },
        (error) => {
          // TODO error in fetching contact list
        }
      );
    }
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
  /**
   * Determines whether chat ready is
   * *A callback function pass to CometChatManager constructer and if the chat it ready( user is loggenIn ) will be called.
   */
  isChatReady = (user?: CometChat.User, error?) => {
    if (user) {
      this.conversationManager.fetchNext().then(
        (conversations: CometChat.Conversation[]) => {
          if (conversations.length === 0) {
            this.decoratorMessage =
              "Please initiate conversation with a user or group";
          } else {
          }
          conversations.map((conversation, i) => {
            conversation = this.setProfileImage(conversation);
            conversations[i] = conversation;
            if (conversation.getConversationType() === "user") {
              if (this.selectedUser)
                if (
                  (
                    conversation.getConversationWith() as CometChat.User
                  ).getUid() === (this.selectedUser as CometChat.User).getUid()
                ) {
                  this.selectedConversation = conversation;
                }
            }
            if (conversation.getConversationType() === "group") {
              if (this.selectedGroup)
                if (
                  (
                    conversation.getConversationWith() as CometChat.Group
                  ).getGuid() ===
                  (this.selectedGroup as CometChat.Group).getGuid()
                ) {
                  this.selectedConversation = conversation;
                }
            }
          });

          this.conversations = conversations;
        },
        (err) => {
          // TODO handle is chatusr logedin Failes.
        }
      );
    } else {
      // TODO handle is chatusr logedin Failes.
    }
  };

  // onSearchChange($event: any) {
  //   if (this.searchStarted) {
  //     clearTimeout(this.searchStarted);
  //   }
  //   if ($event.target.value.trim() != STRING_CONSTS.STRING_MESSAGES.EMPTY_STRING) {
  //     this.searchStarted = setTimeout(() => {
  //       this.decoratorMessage = STRING_CONSTS.STRING_MESSAGES.SEARCH_LOADING;
  //       this.conversationManager = new ConversationListManager($event.target.value);
  //       this.fetchNext();
  //     }, 400);
  //   } else if ($event.target.value.trim() === STRING_CONSTS.STRING_MESSAGES.EMPTY_STRING && $event.data === null) {
  //     $event.target.value = STRING_CONSTS.STRING_MESSAGES.EMPTY_STRING;
  //     this.searchStarted = setTimeout(() => {
  //       this.conversationManager = new ConversationListManager();
  //       this.fetchNext();
  //     }, 400);
  //     // tslint:disable-next-line: max-line-length
  //   } else if ($event.target.value.trim() === STRING_CONSTS.STRING_MESSAGES.EMPTY_STRING && $event.data === STRING_CONSTS.STRING_MESSAGES.SINGLE_SPACE) {
  //     $event.target.value = STRING_CONSTS.STRING_MESSAGES.EMPTY_STRING;
  //   }
  // }

  // fetchNext() {
  //   this.conversationManager.fetchNext().then((conversations: CometChat.Conversation[]) => {
  //     if (conversations.length === 0) {
  //       this.decoratorMessage = "Please initiate conversation with a user or group"
  //     } else {

  //     }
  //     conversations.map((conversation, i) => {
  //       conversation = this.setProfileImage(conversation);
  //       conversations[i] = conversation;
  //       if (conversation.getConversationType() === 'user') {
  //         if (this.selectedUser)
  //           if ((conversation.getConversationWith() as CometChat.User).getUid() === (this.selectedUser as CometChat.User).getUid()) {
  //             this.selectedConversation = conversation;
  //           }
  //       }
  //       if (conversation.getConversationType() === 'group') {
  //         if (this.selectedGroup)
  //           if ((conversation.getConversationWith() as CometChat.Group).getGuid() === (this.selectedGroup as CometChat.Group).getGuid()) {
  //             this.selectedConversation = conversation;
  //           }
  //       }
  //     });

  //     this.conversations = conversations;
  //   });
  // }

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
      this.array.forEach((element) => {
        var GUID = element;
        CometChat.getConversation(GUID, "group").then(
          (conversation) => {
            //conversation = Object.assign(JSON.parse(JSON.stringify(conversation)) as CometChat.Conversation);
            conversation = this.setProfileImage(conversation);
            this.unreadGroups.push(conversation);
            this.unreadGroups = this.unreadGroups.sort((a, b) => {
              return b.unreadMessageCount - a.unreadMessageCount;
            });
            //console.log('image', this.image);
            this.dashboardchatskeleton = false;
            this.cdRef.detectChanges();
          },
          (error) => { }
        );
      });
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
  removeSelectedConversation() {
    this.selectedConversation = undefined;
  }
}
