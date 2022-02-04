import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import { GroupMenager } from "./cometchat-manager";

@Component({
  selector: "cometchat-create-group-screen",
  templateUrl: "./create-group-screen.component.html",
  styleUrls: ["./create-group-screen.component.scss"],
})
export class CreateGroupScreenComponent implements OnChanges {
  @Input() showPopUp;
  groupManager: GroupMenager;
  logedInUser;
  groupName;
  guid = this.groupName
    ? this.groupName.replace(/ /g, "") + new Date().getTime()
    : new Date().getTime();
  groupType;
  failedCreation;
  @Input() password?;

  @Output() actionPerformed = new EventEmitter<{
    action: string;
    payload: object;
  }>();
  constructor(private cdRef: ChangeDetectorRef) {}
  ngOnChanges(): void {}

  createGroup = (
    groupName: string,
    guid?: string,
    groupType?: string,
    password?: string
  ): void => {
    if (!groupName) {
    } else {
      const group: CometChat.Group = new CometChat.Group(
        guid,
        groupName,
        groupType,
        password
      );
      CometChat.createGroup(group).then(
        (createdGroup: CometChat.Group) => {
          this.actionPerformed.emit({
            action: "group_created",
            payload: createdGroup,
          });
          this.showPopUp = false;
        },
        (error) => {
          this.failedCreation = error;
          this.actionPerformed.emit({ action: "error", payload: error });
        }
      );
    }
  };

  closePopup = (): void => {
    this.showPopUp = false;
    this.actionPerformed.emit({ action: "close_popup", payload: {} });
  };
  onKeydownOnGroupName(event): void {
    if (event.key.length === 1) {
      this.guid = this.groupName
        ? (this.groupName + event.key).replace(/ /g, "_") + new Date().getTime()
        : new Date().getTime();
    }
  }
  onKeydown(event): void {
    if (event.key === " ") {
      event.preventDefault();
    }
  }
  init(): void {
    this.groupManager.isLoggedIn(this.isChatReady);
  }

  isChatReady = (user?: CometChat.User, error?): void => {
    if (user) {
      this.logedInUser = user;
    } else {
      // TODO handle is chatusr logedin Failes.
    }
  };
}
