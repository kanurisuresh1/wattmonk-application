import {

  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import { BehaviorSubject } from "rxjs";
import { SearchchatdialogComponent } from "src/app/shared/searchchatdialog/searchchatdialog.component";
import { AuthenticationService, GenericService } from "src/app/_services";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { ConversationViewComponent } from "src/lib/cometchat-angular-ui-kit/src/lib/conversation-view/conversation-view.component";
import { ConversationsScreenComponent } from "src/lib/cometchat-angular-ui-kit/src/lib/conversations-screen/conversations-screen.component";
import {
  CONTACT_LIST_ACTIONS,
  CONVERSATION_LIST_ACTIONS
} from "src/lib/cometchat-angular-ui-kit/src/lib/string_constants";



@Component({
  selector: "app-inbox",
  templateUrl: "./inbox.component.html",
  styleUrls: ["./inbox.component.scss"],
})
export class InboxComponent implements OnInit {
  placeholder = false;
  @ViewChild("conversationscreen") convscreen: ConversationsScreenComponent;
  @ViewChild(ConversationViewComponent) conview: ConversationViewComponent;
  loggedInUser;
  isadmin;
  groups: any = [];
  searchgroupkey = "";

  /**
   * * Event emitter function can triggered on ckick of the conversation list item( conversation ).
   */
  @Output() actionPerformed = new EventEmitter<{
    action: string;
    payload?: object;
  }>();

  dataSource = new MatTableDataSource(this.groups);
  columnsToDisplay = ["avatar", "name", "created"];
  dataSubject = new BehaviorSubject<Element[]>([]);
  constructor(
    public dialog: MatDialog,
    public genericService: GenericService,
    private snackBar: MatSnackBar,
    private authService: AuthenticationService,
    private eventEmitterService: EventEmitterService,
    private router: Router,
    private changedetectorref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
    this.isadmin = this.genericService.isUserAdmin(
      this.authService.currentUserValue.user
    );
    let param = this.route.snapshot.paramMap.get('query');
    if (param != null) {
      this.genericService.setSelectedChatGroupID(param);
    }
    else {
      this.genericService.setSelectedChatGroupID("");
    }

  }

  ngOnInit(): void {
    if (this.genericService.getSelectedChatGroupID() != "") {
      const GUID = "" + this.genericService.getSelectedChatGroupID();
      this.checkChatInitiatedOrNot(GUID);
    }
    this.eventEmitterService.inboxDashboardRefresh.subscribe(() => {
      this.changedetectorref.detectChanges();
    });
  }

  handleBack(): void {
    this.router.navigate([localStorage.getItem("lastroute")]);
  }

  searchChatDialog(): void {
    this.snackBar.openFromComponent(SearchchatdialogComponent, {
      data: "element",
      panelClass: ["chatdialog"],
    });
  }
  checkChatInitiatedOrNot(id: string): void {
    CometChat.getConversation(id, "group").then(
      (conversation) => {
        CometChat.getGroup(id).then(
          (group) => {
            this.convscreen.onItemSelected({
              action: CONVERSATION_LIST_ACTIONS.CONVERSATION_ITEM_SELECTED,
              payload: {
                group: group,
              },
            });
            this.convscreen.convlist.setProfileImage(conversation);
            this.convscreen.convlist.onConversationClick(conversation);
          },
          () => {
            // do nothing.
          }
        );
      },
      () => {
        CometChat.getGroup(id).then(
          (group) => {
            this.convscreen.onItemSelected({
              action: CONTACT_LIST_ACTIONS.CONTACT_ITEM_SELECTED,
              payload: {
                group: group,
              },
            });
          },
          () => {
            // do nothing.
          }
        );
      }
    );
  }

  openMentions(): void {
    this.convscreen.showMention();
    this.genericService.mentionbuttonselected = true;

    this.changedetectorref.detectChanges();
    /*   const dialogRef = this.dialog.open(MentionsdialogComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      data: {  },
    });
    dialogRef.afterClosed().subscribe((result) => {
     this.ngOnInit();
    });*/
  }
}
