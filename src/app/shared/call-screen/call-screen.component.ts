import {
  ChangeDetectorRef,
  Component, EventEmitter, Input,
  OnInit,
  Output
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { CometChat } from "@cometchat-pro/chat";
import { GenericService } from "src/app/_services";
import { CallScreenManager } from "src/lib/cometchat-angular-ui-kit/src/lib/calling-screen/CometChatManager";
import { Helper } from "src/lib/cometchat-angular-ui-kit/src/lib/helpers/helper";
import { CALL_SCREEN_ACTIONS } from "src/lib/cometchat-angular-ui-kit/src/lib/string_constants";

@Component({
  selector: "app-call-screen",
  templateUrl: "./call-screen.component.html",
  styleUrls: ["./call-screen.component.scss"],
})
export class CallScreenComponent implements OnInit {
  callingScreenManager: CallScreenManager = new CallScreenManager();

  toUser?: CometChat.User;
  toGroup?: CometChat.Group;
  @Input() inProgressCall;
  name?: string;
  image?: any;
  callInProgress: boolean = false;
  outgoingScreen = false;
  @Input() incomingScreen?;

  @Output() actionPerformed = new EventEmitter<{
    action: string;
    payload?: object | any;
  }>();
  json = JSON;

  constructor(
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
    private genericService: GenericService
  ) { }

  ngOnInit(): void {
    this.callingScreenManager.isLoggedIn(this.isChatReady);
    const tempCall = new CometChat.Call("", "", "");
  }
  ngOnChanges(): void {
    const tempCall = new CometChat.Call("", "", "");
    if (this.inProgressCall && !(typeof this.inProgressCall === "object")) {
      this.inProgressCall = Object.assign(
        tempCall,
        JSON.parse(this.inProgressCall)
      ) as CometChat.Call;
      if (
        (this.inProgressCall as CometChat.Call).getReceiverType() === "group"
      ) {
        const tempGroup = new CometChat.Group("", "", "");
        this.toGroup = Object.assign(
          tempGroup,
          (
            this.inProgressCall as CometChat.Call
          ).getReceiver() as CometChat.Group
        );
        this.name = this.toGroup.getName();
        this.image = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.toGroup.getIcon()
            ? this.toGroup.getIcon()
            : Helper.getSVGAvatar(
              this.toGroup.getGuid(),
              "#" + this.toGroup.getName().substr(0, 1)
            )
        );
      } else {
        const tempUser = new CometChat.User({});

        if (this.incomingScreen) {
          this.toUser = Object.assign(
            tempUser,
            (
              this.inProgressCall as CometChat.Call
            ).getSender() as CometChat.User
          );
          this.name = this.toUser.getName();
          this.image = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.toUser.getAvatar()
              ? this.toUser.getAvatar()
              : Helper.getSVGAvatar(
                this.toUser.getUid(),
                this.toUser.getName().substr(0, 1)
              )
          );
        } else {
          this.toUser = Object.assign(
            tempUser,
            (
              this.inProgressCall as CometChat.Call
            ).getReceiver() as CometChat.User
          );
          this.name = this.toUser.getName();
          this.image = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.toUser.getAvatar()
              ? this.toUser.getAvatar()
              : Helper.getSVGAvatar(
                this.toUser.getUid(),
                this.toUser.getName().substr(0, 1)
              )
          );
        }
      }
      this.callInProgress = true;
      if (this.incomingScreen) {
        this.incomingScreen = true;
      } else {
        this.outgoingScreen = true;
      }
    }
  }
  endIncomingCall($event): void {
    try {
      const sessionID = (this.inProgressCall as CometChat.Call).getSessionId();
      CometChat.rejectCall(sessionID, CometChat.CALL_STATUS.CANCELLED).then(
        () => {
          this.hideCallScreen();
        },
        () => {
          this.hideCallScreen();
        }
      );
      CometChat.rejectCall(sessionID, CometChat.CALL_STATUS.REJECTED).then(
        () => {
          this.hideCallScreen();
        },
        () => {
          this.hideCallScreen();
        }
      );
    } catch (e) {
      this.hideCallScreen();
    }
  }
  acceptIncomingCall($event): void {
    try {
      const sessionID = (this.inProgressCall as CometChat.Call).getSessionId();
      CometChat.acceptCall(sessionID).then(
        (call) => {
          this.genericService.stopOutgoingAudio();
          this.genericService.stopIncomingAudio();
          // start the call using the startCall() method
          const sessionID = call.getSessionId();
          this.outgoingScreen = false;
          this.incomingScreen = false;
          this.cdRef.detectChanges();
          CometChat.startCall(
            sessionID,
            document.getElementById("callScreen"),
            new CometChat.OngoingCallListener({
              onUserJoined: () => {
                /* Notification received here if another user joins the call. */
                /* this method can be use to display message or perform any actions if someone joining the call */
              },
              onUserLeft: () => {
                /* Notification received here if another user left the call. */
                /* this method can be use to display message or perform any actions if someone leaving the call */
              },
              onCallEnded: () => {
                /* Notification received here if current ongoing call is ended. */
                this.endIncomingCall(call);
                /* hiding/closing the call screen can be done here. */
              },
            })
          );
        },
        () => {
          this.hideCallScreen();
        }
      );
    } catch (e) {
      this.hideCallScreen();
    }
  }
  endOutGoingCall($event): void {
    CometChat.rejectCall(
      this.inProgressCall.getSessionId(),
      CometChat.CALL_STATUS.CANCELLED
    ).then(
      (rejectedCall) => {
        this.inProgressCall = rejectedCall;
        this.callInProgress = false;
        this.hideCallScreen();
      },
      () => {
        //TODO handle errr on rejected call
        this.hideCallScreen();
      }
    );
  }

  callback = (event: { action: string; payload?: object | any }): void => {
    switch (event.action) {
      case CALL_SCREEN_ACTIONS.INCOMING_CALL_RECEIVED: {
        this.inProgressCall = event.payload.call;
        this.callInProgress = true;
        const sessionID = (this.inProgressCall as CometChat.Call).getSessionId();

        const tempUser = new CometChat.User({});
        this.toUser = Object.assign(
          tempUser,
          (this.inProgressCall as CometChat.Call).getSender() as CometChat.User
        );
        this.name = this.toUser.getName();
        this.image = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.toUser.getAvatar()
            ? this.toUser.getAvatar()
            : Helper.getSVGAvatar(
              this.toUser.getUid(),
              this.toUser.getName().substr(0, 1)
            )
        );
        this.incomingScreen = true;
        this.outgoingScreen = false;
        this.cdRef.detectChanges();

        break;
      }
      case CALL_SCREEN_ACTIONS.OUTGOING_CALL_REJECTED: {
        this.inProgressCall = event.payload.call;
        this.callInProgress = false;
        this.hideCallScreen();
        break;
      }
      case CALL_SCREEN_ACTIONS.INCOMING_CALL_CANCELLED: {
        this.inProgressCall = event.payload.call;
        this.hideCallScreen();
        break;
      }
      case CALL_SCREEN_ACTIONS.OUTGOING_CALL_ACCEPTED: {
        this.outgoingScreen = false;
        this.incomingScreen = false;
        this.cdRef.detectChanges();
        CometChat.startCall(
          (this.inProgressCall as CometChat.Call).getSessionId(),
          document.getElementById("callScreen"),
          new CometChat.OngoingCallListener({
            onUserJoined: () => {
              /* Notification received here if another user joins the call. */
              /* this method can be use to display message or perform any actions if someone joining the call */
            },
            onUserLeft: () => {
              /* Notification received here if another user left the call. */
              /* this method can be use to display message or perform any actions if someone leaving the call */
            },
            onCallEnded: () => {
              /* Notification received here if current ongoing call is ended. */

              this.hideCallScreen();
              /* hiding/closing the call screen can be done here. */
            },
          })
        );
        break;
      }
    }
  };

  hideCallScreen(): void {
    this.toGroup = undefined;
    this.toUser = undefined;
    this.outgoingScreen = false;
    this.incomingScreen = false;
    this.callInProgress = false;
    this.inProgressCall = undefined;
    this.genericService.stopOutgoingAudio();
    this.genericService.stopIncomingAudio();
    this.cdRef.detectChanges();
    this.actionPerformed.emit({
      action: CALL_SCREEN_ACTIONS.HIDE_SCREEN,
      payload: {},
    });
  }
  isChatReady = (user?: CometChat.User): void => {
    if (user) {
      this.callingScreenManager.attachListener(this.callback);
      // TODO set the current logged in user.
    } else {
      // TODO show error that cometchat user log in is failed.
    }
  };
}
