
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { CometChat } from '@cometchat-pro/chat';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/_services';
import { MessagingService } from 'src/app/_services/messaging.service';
import { MESSAGES_COMPOSER_ACTIONS } from '../string_constants';



@Component({
  selector: "cometchat-message-composer",
  templateUrl: "./message-composer.component.html",
  styleUrls: ["./message-composer.component.scss"],
})
export class MessageComposerComponent implements OnChanges {
  userRole;
  placeHolder = "Message";
  items: any = [];
  // items: any[] = [
  //   {
  //     username: 'noah',
  //     name: 'Noah',
  //     img: '42143138'
  //   },
  //   {
  //     username: 'liam',
  //     name: 'Liam',
  //     img: '42143139'
  //   },
  //   {
  //     username: 'mason',
  //     name: 'Mason',
  //     img: '42143140'
  //   },
  //   {
  //     username: 'jacob',
  //     name: 'Jacob',
  //     img: '42143141'
  //   }
  // ];
  // constants
  TOGLE_EMOJI = MESSAGES_COMPOSER_ACTIONS.CLICK_TOGGLE_EMOJI;
  OPTION_MENU = MESSAGES_COMPOSER_ACTIONS.CLICK_OPTION_MENU;
  RECORD_AUDIO = MESSAGES_COMPOSER_ACTIONS.CLICK_RECORD_AUDIO;
  SEND_MESSAGE = MESSAGES_COMPOSER_ACTIONS.CLICK_SEND_MESSAGE;

  typingStarted: any;
  timer = 0;
  fileOptionsExpanded = false;

  showEmojiKeyboard = false;
  @Input() user?;
  @Input() group?;
  @Input() text = this.placeHolder;

  @Output() actionPerformed = new EventEmitter<{
    action: string;
    payload?: CometChat.BaseMessage;
  }>();
  member: any = [];

  /**
   * Creates an instance of message composer component.
   * @param cdRef  chnage detector provided by core.
   */
  mentions = [];
  mentionsId = [];
  sendemailto: AngularFireObject<any>;
  emailstodata: Observable<any>;
  printingCharges = 0;
  totalprintingcharges = 0;
  tollmembers = false;
  tomentionsmembers = false;
  toinactiveusers = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private db: AngularFireDatabase,
    public authService: AuthenticationService,
    private messagingService: MessagingService
  ) {
    this.sendemailto = db.object("emailsto");
    this.emailstodata = this.sendemailto.valueChanges();
    this.emailstodata.subscribe(
      (res) => {
        this.tollmembers = res.inboxgroupallusers;
        this.tomentionsmembers = res.inboxgroupmentions;
        this.toinactiveusers = res.inboxgroupinactiveusers;
      }
      // (err) => console.log(err),
      // () => console.log("done!")
    );
  }

  ngOnChanges(): void {
    this.init();
    // console.log(this.group)
  }

  /**
   * Inits message composer component
   */
  init(): void {
    this.userRole = this.authService.currentUserValue.user.role.id;
    if (this.user) {
      this.user = JSON.parse(this.user);
    } else {
      this.group = JSON.parse(this.group);
    }
    var GUID = this.group.guid;
    var limit = 30;
    var groupMemberRequest = new CometChat.GroupMembersRequestBuilder(GUID)
      .setLimit(limit)
      .build();
    groupMemberRequest.fetchNext().then(
      (groupMembers) => {
        // console.log("Group Member list fetched successfully:", groupMembers);
        // groupMembers.forEach(element=>{
        //   this.member.push(element);
        // })
        this.member = groupMembers;
        // console.log(this.items);
        this.items = [];
        this.member.forEach((element) => {
          element.role = "{" + element.name + "|" + element.uid + "}";
          this.items.push(element);
          // console.log(this.items)
        });
      },
      (error) => {
        // console.log("Group Member list fetching failed with exception:", error);
      }
    );

    this.cdRef.detectChanges();
  }

  onActive = (event): void => {
    if (event.target.innerText === this.placeHolder) {
      event.target.innerText = "";
    }
  };
  onBlur = (event): void => {
    if (event.target.innerText.trim() === "") {
      event.target.innerText = this.placeHolder;
    }
  };

  /**
   * Determines white option is triggered.
   * @param event default click event triggered.
   * @param action which option is clicked.
   */
  onActionGenerated(event, action): void {
    if (action === this.OPTION_MENU) {
      this.fileOptionsExpanded = !this.fileOptionsExpanded;
    }
    if (action === this.SEND_MESSAGE) {
      document.getElementById("cometchat-message-composer").focus();
      this.showEmojiKeyboard = false;

      let receiverID;
      let receiverType;

      if (this.user) {
        receiverID = this.user.uid;
        receiverType = CometChat.RECEIVER_TYPE.USER;
      } else {
        receiverID = this.group.guid;
        receiverType = CometChat.RECEIVER_TYPE.GROUP;
      }

      let typingNotification = new CometChat.TypingIndicator(
        receiverID,
        receiverType
      );
      CometChat.endTyping(typingNotification);

      var messageText = document
        .getElementById("cometchat-message-composer")
        .innerText.trim();
      //  this.items.forEach(element => {
      //    console.log(messageText)
      //    if(messageText.includes("@" + element.name)){
      //      messageText=messageText.replace("@" + element.name,"@"+"{" + element.name + "|" + element.uid + "}" )
      //      console.log(messageText)
      //    }
      //  });
      const textMessage = new CometChat.TextMessage(
        receiverID,
        messageText,
        receiverType
      );
      document.getElementById("cometchat-message-composer").innerText = "";
      this.cdRef.detectChanges();

      if (this.group) {
        //Code to fetch users of group
        var GUID = receiverID;
        var limit = 10;
        var groupMemberRequest = new CometChat.GroupMembersRequestBuilder(GUID)
          .setLimit(limit)
          .build();

        const currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes() - 10);
        const timestamp = Math.floor(currentDate.getTime() / 1000);
        var unavailableusers = [];
        groupMemberRequest.fetchNext().then(
          (groupMembers) => {
            if (messageText.includes("@{")) {
              this.mentions = this.extract(["@{", "}"])(messageText);
              for (var i = 0; i <= this.mentions.length - 1; i++) {
                this.mentionsId.push(this.mentions[i].split("|").pop());
              }
            }
            groupMembers.forEach((element) => {
              var user: CometChat.GroupMember = element;
              if (this.toinactiveusers) {
                if (
                  user.getLastActiveAt() < timestamp &&
                  parseInt(user.getUid()) !=
                  this.authService.currentUserValue.user.id
                ) {
                  unavailableusers.push(user.getUid());
                }
              } else if (this.tollmembers) {
                unavailableusers.push(user.getUid());
              }
            });

            //Send email to all inactive users
            if (messageText != "" && this.mentionsId.length == 0) {
              this.sendEmailToInactiveUsers(
                unavailableusers,
                this.group.name,
                messageText,
                this.authService.currentUserValue.user.firstname +
                " " +
                this.authService.currentUserValue.user.lastname,
                this.group.name,
                this.group.guid
              );
            }
            if (this.mentionsId.length > 0 && this.tomentionsmembers) {
              //Send email to all mention users
              this.sendEmailToMentionUsers(
                this.mentionsId,
                this.group.name,
                messageText,
                this.authService.currentUserValue.user.firstname +
                " " +
                this.authService.currentUserValue.user.lastname,
                this.group.guid
              );
            }
          },
          (error) => { }
        );
      }

      CometChat.sendMessage(textMessage).then(
        (message: CometChat.BaseMessage) => {
          this.actionPerformed.emit({
            action: MESSAGES_COMPOSER_ACTIONS.MESSAGE_SENT,
            payload: message,
          });
          this.fileOptionsExpanded = !this.fileOptionsExpanded;
        },
        (error) => {
          this.actionPerformed.emit({
            action: MESSAGES_COMPOSER_ACTIONS.ERROR_IN_MESSAGE_SENDING,
            payload: error,
          });
          this.fileOptionsExpanded = !this.fileOptionsExpanded;
        }
      );
      return;
    }
    if (action === this.TOGLE_EMOJI) {
      this.showEmojiKeyboard = !this.showEmojiKeyboard;
    }
    this.actionPerformed.emit({ action });
  }

  sendEmailToInactiveUsers(
    userids,
    group,
    messageText,
    sender,
    projecttitle,
    chatid
  ): void {
    this.messagingService
      .notifyChatMessage(
        userids,
        group,
        messageText,
        sender,
        projecttitle,
        chatid
      )
      .subscribe(
        (response) => {
          this.mentionsId = [];
        },
        (error) => { }
      );
  }

  sendEmailToMentionUsers(userids, group, messageText, sender, chatid): void {
    this.messagingService
      .notifyMentionChatMessage(userids, group, messageText, sender, chatid)
      .subscribe(
        (response) => {
          this.mentionsId = [];
        },
        (error) => { }
      );
  }

  onTypingStarted($event: any): void {
    this.showEmojiKeyboard = false;
    if (this.typingStarted) {
    } else {
      let receiverID;
      let receiverType;

      if (this.user) {
        receiverID = this.user.uid;
        receiverType = CometChat.RECEIVER_TYPE.USER;
      } else {
        receiverID = this.group.guid;
        receiverType = CometChat.RECEIVER_TYPE.GROUP;
      }

      let typingNotification = new CometChat.TypingIndicator(
        receiverID,
        receiverType
      );
      CometChat.startTyping(typingNotification);

      this.typingStarted = setTimeout(() => {
        clearTimeout(this.typingStarted);
        this.typingStarted = undefined;
      }, 5000);
    }
  }

  onMentionSelect(selection): string {
    // console.log(selection);
    return "@" + selection.role;
  }

  /**
   * Onchange detect of message composer component
   * * will detecte the any change in the CometChat massage composer input box and take acction accordigly.
   */
  onchangeDetect = (event): boolean => {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      let receiverID;
      let receiverType;

      if (this.user) {
        receiverID = this.user.uid;
        receiverType = CometChat.RECEIVER_TYPE.USER;
      } else {
        receiverID = this.group.guid;
        receiverType = CometChat.RECEIVER_TYPE.GROUP;
      }
      let typingNotification = new CometChat.TypingIndicator(
        receiverID,
        receiverType
      );
      CometChat.endTyping(typingNotification);

      this.typingStarted = setTimeout(() => {
        clearTimeout(this.typingStarted);
        this.typingStarted = undefined;
      }, 5000);
      const messageText = event.srcElement.innerText.trim();
      const textMessage = new CometChat.TextMessage(
        receiverID,
        messageText,
        receiverType
      );
      event.srcElement.innerText = "";
      this.cdRef.detectChanges();

      if (this.group) {
        //Code to fetch users of group
        var GUID = receiverID;
        var limit = 30;
        var groupMemberRequest = new CometChat.GroupMembersRequestBuilder(GUID)
          .setLimit(limit)
          .build();

        const currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes() - 5);
        const timestamp = Math.floor(currentDate.getTime() / 1000);
        var unavailableusers = [];
        groupMemberRequest.fetchNext().then(
          (groupMembers) => {
            if (messageText.includes("@{")) {
              this.mentions = this.extract(["@{", "}"])(messageText);
              for (var i = 0; i <= this.mentions.length - 1; i++) {
                this.mentionsId.push(this.mentions[i].split("|").pop());
              }
            }
            groupMembers.forEach((element) => {
              var user: CometChat.GroupMember = element;
              if (this.toinactiveusers) {
                if (
                  user.getLastActiveAt() < timestamp &&
                  parseInt(user.getUid()) !=
                  this.authService.currentUserValue.user.id
                ) {
                  unavailableusers.push(user.getUid());
                }
              } else if (this.tollmembers) {
                unavailableusers.push(user.getUid());
              }
            });

            //Send email to all inactive users
            if (messageText != "" && this.mentionsId.length == 0) {
              this.sendEmailToInactiveUsers(
                unavailableusers,
                this.group.name,
                messageText,
                this.authService.currentUserValue.user.firstname +
                " " +
                this.authService.currentUserValue.user.lastname,
                this.group.name,
                this.group.guid
              );
            }

            if (this.mentionsId.length > 0 && this.tomentionsmembers) {
              //Send email to all mention users
              this.sendEmailToMentionUsers(
                this.mentionsId,
                this.group.name,
                messageText,
                this.authService.currentUserValue.user.firstname +
                " " +
                this.authService.currentUserValue.user.lastname,
                this.group.guid
              );
            }
          },
          (error) => { }
        );
      }

      CometChat.sendMessage(textMessage).then(
        (message: CometChat.BaseMessage) => {
          this.actionPerformed.emit({
            action: MESSAGES_COMPOSER_ACTIONS.MESSAGE_SENT,
            payload: message,
          });
          this.fileOptionsExpanded = false;
          this.showEmojiKeyboard = false;
          this.cdRef.detectChanges();
        },
        (error) => {
          this.actionPerformed.emit({
            action: MESSAGES_COMPOSER_ACTIONS.ERROR_IN_MESSAGE_SENDING,
            payload: error,
          });
          this.fileOptionsExpanded = false;
          this.showEmojiKeyboard = false;
          this.cdRef.detectChanges();
        }
      );
      return false;
    } else {
      this.onTypingStarted(event);
    }
  };
  clickOnEmoji(event): void {
    document.getElementById("cometchat-message-composer").focus();
    document.getElementById("cometchat-message-composer").innerText =
      document.getElementById("cometchat-message-composer").innerText +
      event.emoji.native;
    let tag = document.getElementById("cometchat-message-composer");

    var setpos = document.createRange();

    // Creates object for selection
    var set = window.getSelection();

    // Set start position of range
    setpos.setStart(
      tag.childNodes[0],
      document.getElementById("cometchat-message-composer").innerText.length
    );

    // Collapse range within its boundary points
    // Returns boolean
    setpos.collapse(true);

    // Remove all ranges set
    set.removeAllRanges();

    // Add range with respect to range object.
    set.addRange(setpos);
    document.getElementById("cometchat-message-composer").focus();
  }

  extract([beg, end]) {
    const matcher = new RegExp(`${beg}(.*?)${end}`, "gm");
    const normalise = (str) => str.slice(beg.length, end.length * -1);
    return function (str) {
      return str.match(matcher).map(normalise);
    };
  }
}
