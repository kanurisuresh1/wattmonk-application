import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import { ROLES } from "src/app/_helpers";
import { AuthenticationService, GenericService } from "src/app/_services";
import { ConversationHeaderComponent } from "../conversation-header/conversation-header.component";

@Component({
  selector: "cometchat-entity-details-component",
  templateUrl: "./entity-details-component.component.html",
  styleUrls: ["./entity-details-component.component.scss"],
})
export class EntityDetailsComponentComponent implements OnChanges, OnChanges {
  @ViewChild("conversationheaderscreen")
  convheader: ConversationHeaderComponent;
  messageRequest: CometChat.MessagesRequest;
  limit = 100;
  JSON = JSON;

  // as of not it's manupulated localy infutue once the feature is there will be implemened via API
  notificationOption = true;
  canAddMembers = false;
  @Input() user?;
  @Input() group?;
  loggedInUser;

  @Output() actionPerformed = new EventEmitter<{
    action: string;
    payload: object;
  }>();

  imageMessages = [];

  constructor(
    public authService: AuthenticationService,
    public genericService: GenericService,
    private cdRef: ChangeDetectorRef
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
  }

  onNotificationToggeled(event?): void {
    this.notificationOption = !this.notificationOption;
  }

  onAction = ($event): void => {
    switch ($event.target.id) {
      case "report":
        this.actionPerformed.emit({ action: "report", payload: {} });
        break;

      default:
        break;
    }
  };
  addMember = ($event): void => {
    this.actionPerformed.emit({
      action: "click_on_add_members",
      payload: JSON.parse(this.group) as CometChat.Group,
    });
  };
  leaveGroup = (event?): void => {
    JSON.parse(this.group);
    CometChat.leaveGroup(JSON.parse(this.group).guid).then(
      () => {
        this.actionPerformed.emit({
          action: "group_left",
          payload: JSON.parse(this.group) as CometChat.Group,
        });
      },
      (err) => {
        this.actionPerformed.emit({
          action: "err_group_left",
          payload: JSON.parse(this.group) as CometChat.Group,
        });
      }
    );
  };
  onActionPefrmed = ($event): void => {
    // TODO pending task1
  };

  ngOnChanges(_changes): void {
    if (this.user) {
      const user = JSON.parse(this.user);
      const messageRequestBuilder =
        new CometChat.MessagesRequestBuilder().setUID(user.uid);

      messageRequestBuilder.setLimit(30);
      messageRequestBuilder.setCategory("message");
      messageRequestBuilder.setType(CometChat.MESSAGE_TYPE.IMAGE);
      this.messageRequest = messageRequestBuilder.build();
    }
    if (this.group) {
      const group = JSON.parse(this.group);
      if (
        (this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
          this.loggedInUser.role.id == ROLES.ContractorAdmin ||
          this.loggedInUser.role.id == ROLES.SuccessManager ||
          this.loggedInUser.role.id == ROLES.Admin ||
          this.loggedInUser.role.id == ROLES.SuperAdmin) &&
        this.loggedInUser.parent.usertype != "individual"
      ) {
        this.canAddMembers = true;
      } else {
        this.canAddMembers = false;
      }
      const messageRequestBuilder =
        new CometChat.MessagesRequestBuilder().setGUID(group.guid);
      messageRequestBuilder.setLimit(30);
      messageRequestBuilder.setCategory("message");
      messageRequestBuilder.setType(CometChat.MESSAGE_TYPE.IMAGE);
      this.messageRequest = messageRequestBuilder.build();
    }

    this.fetchPrevious().then((messageList) => {
      this.imageMessages = messageList;
    });
  }

  handleImagesScroll = (): void => {
    this.messageRequest.fetchPrevious().then((messageList) => {
      this.imageMessages = [...this.imageMessages, ...messageList];
    });
  };

  fetchPrevious = () => {
    return this.messageRequest.fetchPrevious();
  };
  clickMenuOption = ($event): void => {
    this.genericService.showItemDetails = !this.genericService.showItemDetails;
    this.cdRef.detectChanges();
  };
}
