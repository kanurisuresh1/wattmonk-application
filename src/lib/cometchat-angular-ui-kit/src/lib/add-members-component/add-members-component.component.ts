import {
  ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output
} from "@angular/core";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import { MessagingService } from "src/app/_services/messaging.service";
import { TeamService } from "src/app/_services/team.service";
import { Helper } from "../helpers/helper";
import { ADD_MEMBERES_CONTS } from "./add-members-component-consts";
import { GroupMembersManager } from "./cometchat-manager";
@Component({
  selector: "cometchat-add-members-component",
  templateUrl: "./add-members-component.component.html",
  styleUrls: ["./add-members-component.component.scss"],
})
export class AddMembersComponentComponent implements OnInit {
  groupMembersManager: GroupMembersManager;
  logedInUser;

  @Input() group?;
  @Input() showPopUp;
  searchChats;

  teamids = [];
  JSONParser = JSON;
  teamusers = [];
  usersList: { selected: boolean; user: any }[] = [];

  @Output() actionPerformed = new EventEmitter<{
    action: string;
    payload?: object;
  }>();
  constructor(
    private cdRef: ChangeDetectorRef,
    private teamService: TeamService,
    public router: Router,
    private messagingservice: MessagingService
  ) { }

  ngOnInit(): void {
    this.group = JSON.parse(this.group);
    this.fetchTeamData();
    this.init();
  }

  init(): void {
    this.groupMembersManager = new GroupMembersManager();
    // this.groupMembersManager.isLoggedIn(this.isChatReady);
  }

  onItemClick = (selectedUser): void => {
    this.usersList.map(
      (item: { selected: boolean; user: CometChat.User }, key) => {
        if (item.user.getUid() === selectedUser.getUid()) {
          this.usersList[key] = {
            selected: !item.selected,
            user: selectedUser,
          };
        }
      }
    );
  };

  /*  isChatReady = (user?: CometChat.User, error?) => {
    if (user) {
      this.groupMembersManager.fetchNextUsers().then((users: CometChat.User[]) => {
        const localUsersList: { selected: boolean, user: CometChat.User }[] = [];
        users.map((cometchatUser: CometChat.User) => {
          if (!cometchatUser.getAvatar()) {
            cometchatUser.setAvatar(Helper.getSVGAvatar(cometchatUser.getUid(), cometchatUser.getName().substr(0, 1)));
          }
          localUsersList.push({ selected: false, user: cometchatUser });
        });
        this.usersList = localUsersList;
      });

    } else {
      // TODO handle is chatusr logedin Failes.
    }
  } */

  @HostListener("scroll", ["$event.target"])
  onScroll(elem: any): void {
    if (
      elem.target.offsetHeight + elem.target.scrollTop + 1 >=
      elem.target.scrollHeight
    ) {
      this.groupMembersManager
        .fetchNextUsers()
        .then((users: CometChat.User[]) => {
          const localUsersList: { selected: boolean; user: CometChat.User }[] =
            [];
          users.map((cometchatUser: CometChat.User) => {
            if (!cometchatUser.getAvatar()) {
              cometchatUser.setAvatar(
                Helper.getSVGAvatar(
                  cometchatUser.getUid(),
                  cometchatUser.getName().substr(0, 1)
                )
              );
            }
            localUsersList.push({ selected: false, user: cometchatUser });
          });
          this.usersList = [...this.usersList, ...localUsersList];
        });
    }
  }

  /**
   * Closes popup
   */
  closePopup(): void {
    this.actionPerformed.emit({
      action: ADD_MEMBERES_CONTS.ACTIONS.CLOSE_POPUP,
    });
  }

  /**
   * Adds member to group
   */
  addMemberToGroup(): void {
    const membersList = [];

    this.usersList.map((item) => {
      if (item.selected) {
        membersList.push(
          new CometChat.GroupMember(
            item.user.uid,
            CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT
          )
        );
      }
    });
    CometChat.addMembersToGroup(this.group.guid, membersList, []).then(
      (response) => {
        this.actionPerformed.emit({
          action: ADD_MEMBERES_CONTS.ACTIONS.MEMBERS_ADDED,
          payload: { response },
        });
        this.actionPerformed.emit({
          action: ADD_MEMBERES_CONTS.ACTIONS.CLOSE_POPUP,
        });
      },
      (error) => {
        this.actionPerformed.emit({
          action: ADD_MEMBERES_CONTS.ACTIONS.ERROR_IN_MEMBERS_ADDING,
          payload: { error },
        });
      }
    );
  }
  fetchTeamData(): void {
    this.messagingservice.getTeamDataForChat(this.group.guid).subscribe(
      (response) => {
        if (response.length > 0) {
          response.forEach((element) => {
            try {
              this.teamids.push(element.cometchatuid);
            }
            catch (error) {

            }

          });
          this.fetchCometchatuser();
        } else {
        }
      },
      (error) => { }
    );
  }

  fetchCometchatuser(): void {
    for (let i = 0; i <= this.teamids.length; i++) {
      try {
        CometChat.getUser(this.teamids[i].toString()).then(
          (user) => {
            if (!user.getAvatar()) {
              user.setAvatar(
                Helper.getSVGAvatar(user.getUid(), user.getName().substr(0, 1))
              );
            }
            this.usersList.push({ selected: false, user: user });
            this.cdRef.detectChanges();
          },
          (error) => { }
        );
      }
      catch (error) {

      }
    }

  }
}
