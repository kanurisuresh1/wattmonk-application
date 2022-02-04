import {
  Component,
  OnInit,
  Input,
  OnChanges,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from "@angular/core";

import { ConversationHeaderManager } from "./cometchat-manager";
import { CometChat } from "@cometchat-pro/chat";
import { CONVERSATION_SCREEN_HEADER_ACTIONS } from "../string_constants";
import {
  DesignService,
  GenericService,
  LoaderService,
  PestampService,
} from "src/app/_services";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { MatDialog } from "@angular/material/dialog";
import { SurveyService } from "src/app/_services/survey.service";
import { AddprelimproposaldialogComponent } from "src/app/home/dashboard/prelimdesign/addprelimproposaldialog/addprelimproposaldialog.component";
import { AdddesigndialogComponent } from "src/app/home/dashboard/prelimdesign/adddesigndialog/adddesigndialog.component";
import { AddminpermitdesigndialogComponent } from "src/app/home/dashboard/permitdesign/addminpermitdesigndialog/addminpermitdesigndialog.component";
import { AddsurveydialogComponent } from "src/app/home/dashboard/survey/addsurveydialog/addsurveydialog.component";
import { AddpestampdialogComponent } from "src/app/home/dashboard/pestamp/addpestampdialog/addpestampdialog.component";

@Component({
  selector: "cometchat-conversation-header",
  templateUrl: "./conversation-header.component.html",
  styleUrls: ["./conversation-header.component.scss"],
})
export class ConversationHeaderComponent implements OnChanges {
  @Input() user?;
  @Input() group?;

  status = undefined;
  showCallingScreen = false;
  inProgressCall;

  @Output() actionPerformed = new EventEmitter<{
    action: String;
    payload: Object;
  }>();

  conversationHeaderManager: ConversationHeaderManager;

  constructor(
    private cdRef: ChangeDetectorRef,
    private genericService: GenericService,
    private designService: DesignService,
    public dialog: MatDialog,
    private surveyService: SurveyService,
    private pestampService: PestampService,
    private loaderservice: LoaderService
  ) {}

  ngOnChanges(): void {
    if (this.user && !(this.user instanceof Object)) {
      this.user = JSON.parse(this.user);
      this.status = this.user.status;
      this.group = undefined;
      this.conversationHeaderManager = new ConversationHeaderManager(
        this.user.uid
      );
      this.conversationHeaderManager.isLoggedIn(this.isChatReady);
      this.conversationHeaderManager.attachListener(this.callback);

      CometChat.getUser(this.user.uid.toString()).then((user) => {
        if ((user.getStatus() as string).toLowerCase() === "online") {
          this.status = user.getStatus();
        } else {
          this.status = undefined;
          this.user.lastActiveAt = user.getLastActiveAt();
        }
      });
    }
    if (this.group && !(this.group instanceof Object)) {
      this.group = JSON.parse(this.group);
      this.user = undefined;
      this.conversationHeaderManager = new ConversationHeaderManager(
        this.group.guid,
        "group"
      );
      this.conversationHeaderManager.isLoggedIn(this.isChatReady);
      this.conversationHeaderManager.attachListener(this.callback);
    }
  }
  makeAudioCall = ($event): void => {
    let receiverID;
    let receiverType;
    if (this.user) {
      receiverID = this.user.uid;
      receiverType = CometChat.RECEIVER_TYPE.USER;
    } else {
      receiverID = this.group.guid;
      receiverType = CometChat.RECEIVER_TYPE.GROUP;
    }

    const callType = CometChat.CALL_TYPE.AUDIO;
    const call = new CometChat.Call(receiverID, callType, receiverType);

    CometChat.initiateCall(call).then(
      (outGoingCall) => {
        this.showCallingScreen = true;
        this.inProgressCall = JSON.stringify(outGoingCall);
        this.genericService.playOutgoingAudio();
        this.actionPerformed.emit({
          action: CONVERSATION_SCREEN_HEADER_ACTIONS.VIDEO_CALL_STARTED,
          payload: { outGoingCall },
        });
      },
      (error) => {
        this.actionPerformed.emit({
          action: CONVERSATION_SCREEN_HEADER_ACTIONS.AUDIO_CALL_STARTED,
          payload: { error },
        });
      }
    );
  };

  makeVideoCall = ($event): void => {
    let receiverID;
    let receiverType;
    if (this.user) {
      receiverID = this.user.uid.toString();
      receiverType = CometChat.RECEIVER_TYPE.USER;
    } else {
      receiverID = this.group.guid.toString();
      receiverType = CometChat.RECEIVER_TYPE.GROUP;
    }

    const callType = CometChat.CALL_TYPE.VIDEO;
    const call = new CometChat.Call(receiverID, callType, receiverType);

    CometChat.initiateCall(call).then(
      (outGoingCall) => {
        this.showCallingScreen = true;
        this.inProgressCall = JSON.stringify(outGoingCall);
        this.genericService.playOutgoingAudio();
        this.actionPerformed.emit({
          action: CONVERSATION_SCREEN_HEADER_ACTIONS.VIDEO_CALL_STARTED,
          payload: { outGoingCall },
        });
      },
      (error) => {
        this.actionPerformed.emit({
          action: CONVERSATION_SCREEN_HEADER_ACTIONS.AUDIO_CALL_STARTED,
          payload: { error },
        });
      }
    );
  };
  clickMenuOption = ($event): void => {
    if (this.user) {
      this.actionPerformed.emit({
        action: CONVERSATION_SCREEN_HEADER_ACTIONS.USER_OPTION_MENU_SELECTED,
        payload: { user: this.user },
      });
    } else if (this.group) {
      this.actionPerformed.emit({
        action: CONVERSATION_SCREEN_HEADER_ACTIONS.GROUP_OPTION_MENU_SELECTED,
        payload: { group: this.group },
      });
    }
  };

  callback = (event: { action: string; payload?: object | any }): void => {
    switch (event.action) {
      case CONVERSATION_SCREEN_HEADER_ACTIONS.USER_STATUS_CHANGED.ONLINE:
        this.user = event.payload.onlineUser;
        this.status = this.user.status;
        this.cdRef.detectChanges();
        break;
      case CONVERSATION_SCREEN_HEADER_ACTIONS.USER_STATUS_CHANGED.OFFLINE:
        this.user = event.payload.offlineUser;
        this.status = this.user.status;
        this.cdRef.detectChanges();
        break;
      case CONVERSATION_SCREEN_HEADER_ACTIONS.TYPING_STATUS_CHANGED
        .TYPING_STARTED: {
        let typingIndicator: CometChat.TypingIndicator = event.payload
          .typingIndicator as CometChat.TypingIndicator;
        if (
          typingIndicator.getReceiverType() === "user" &&
          typingIndicator.getSender().getUid().toString() ===
            this.user.uid.toString()
        ) {
          this.status = "typing...";
        }
        break;
      }
      case CONVERSATION_SCREEN_HEADER_ACTIONS.TYPING_STATUS_CHANGED
        .TYPING_ENDED: {
        let typingIndicator: CometChat.TypingIndicator = event.payload
          .typingIndicator as CometChat.TypingIndicator;
        if (
          typingIndicator.getReceiverType() === "user" &&
          typingIndicator.getSender().getUid().toString() ===
            this.user.uid.toString()
        ) {
          this.status = this.user.status;
        }
        break;
      }
    }

    try {
      this.cdRef.detectChanges();
    } catch (e) {}
  };

  isChatReady = (user?: CometChat.User, error?): void => {
    if (user) {
      // TODO set the current logged in user.
    } else {
      // TODO show error that cometchat user log in is failed.
    }
  };

  opendetailpage(group): void {
    this.loaderservice.show();
    //  console.log(group.guid.split("_")[0])
    if (
      group.guid.split("_")[0] == "prelim" ||
      group.guid.split("_")[0] == "permit"
    ) {
      this.designService.getDesignByChatid(group.guid).subscribe((response) => {
        //  console.log(response)
        this.openDetailDialog(response, group.guid.split("_")[0]);
      });
    } else if (group.guid.split("_")[0] == "survey") {
      this.surveyService.getSurveyByChatid(group.guid).subscribe((response) => {
        // console.log(response)
        this.openDetailDialog(response, group.guid.split("_")[0]);
      });
    } else if (group.guid.split("_")[0] == "pestamp") {
      this.pestampService
        .getPestampByChatid(group.guid)
        .subscribe((response) => {
          // console.log(response)
          this.openDetailDialog(response, group.guid.split("_")[0]);
        });
    }
  }

  openDetailDialog(data, type): void {
    this.loaderservice.hide();
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      /* panelClass: 'white-modalbox',
       height:"98%", */
      data: {
        [type]: data,
        triggerEditEvent: false,
        triggerDeleteEvent: false,
        selectedtab: type,
        triggerChatEvent: false,
        triggerActivity: false,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerPrelimEditEvent) {
        if (data.requirementtype == "proposal") {
          this.openEditProposalDesignDialog(data);
        } else {
          this.openEditDesignDialog(data);
        }
      } else if (result.triggerPermitEditEvent) {
        this.openEditMinPermitDesignDialog(data);
      } else if (result.triggerSurveyEditEvent) {
        this.openEditSurveyDialog(data);
      } else if (result.triggerPestampEditEvent) {
        this.openEditPestampDialog(data);
      }
    });
  }

  openEditDesignDialog(design): void {
    const dialogRef = this.dialog.open(AdddesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  openEditProposalDesignDialog(design): void {
    const dialogRef = this.dialog.open(AddprelimproposaldialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
  openEditMinPermitDesignDialog(design): void {
    const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
  openEditSurveyDialog(survey): void {
    const dialogRef = this.dialog.open(AddsurveydialogComponent, {
      width: "70%",
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: true, isDataUpdated: false, survey: survey },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
  openEditPestampDialog(pestamp): void {
    const dialogRef = this.dialog.open(AddpestampdialogComponent, {
      disableClose: true,
      width: "80%",
      autoFocus: false,
      data: { isEditMode: true, isDataUpdated: false, pestamp: pestamp },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
}
