import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CometChat } from "@cometchat-pro/chat";
import { BehaviorSubject } from "rxjs";
import {
  AuthenticationService,
  GenericService,
  LoaderService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { ConversationsScreenComponent } from "src/lib/cometchat-angular-ui-kit/src/lib/conversations-screen/conversations-screen.component";
import { CONVERSATION_LIST_ACTIONS } from "src/lib/cometchat-angular-ui-kit/src/lib/string_constants";

@Component({
  selector: "app-chatdialog",
  templateUrl: "./chatdialog.component.html",
  styleUrls: ["./chatdialog.component.scss"],
})
export class ChatdialogComponent implements OnInit {
  placeholder = false;
  @ViewChild("conversationscreen") convscreen: ConversationsScreenComponent;
  loggedInUser;
  isadmin;
  isLoading = true;
  /**
   * * Event emitter function can triggered on ckick of the conversation list item( conversation ).
   */
  @Output() actionPerformed = new EventEmitter<{
    action: string;
    payload?: object;
  }>();

  searchTerm?;
  searchresult: [] = [];
  isdataLoading = false;
  constructor(
    public genericService: GenericService,
    private authService: AuthenticationService,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private changedetectorref: ChangeDetectorRef,
    private loader: LoaderService
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
    this.isadmin = this.genericService.isUserAdmin(
      this.authService.currentUserValue.user
    );
  }

  ngOnInit(): void {
    this.loadrequireddata();
  }

  loadrequireddata(): void {
    if (this.genericService.getSelectedChatGroupID() != "") {
      this.placeholder = false;
      const GUID = "" + this.genericService.getSelectedChatGroupID();
      this.checkChatInitiatedOrNot(GUID);
    } else {
      this.isLoading = false;
      this.placeholder = true;
      this.changedetectorref.detectChanges();
    }
  }

  onCloseClick(): void {
    this.snackBar.dismiss();
    this.genericService.setSelectedChatGroupID("");
  }
  checkChatInitiatedOrNot(id: string): void {
    CometChat.getConversation(id, "group").then(
      (conversation) => {
        CometChat.getGroup(id).then((group) => {
          this.convscreen.onItemSelected({
            action: CONVERSATION_LIST_ACTIONS.CONVERSATION_ITEM_SELECTED,
            payload: {
              group: group,
            },
          });
          this.isLoading = false;
          this.convscreen.convlist.setProfileImage(conversation);
          this.convscreen.convlist.onConversationClick(conversation);
          this.changedetectorref.detectChanges();
        });
      },
      () => {
        this.isLoading = false;
        this.placeholder = true;

        this.changedetectorref.detectChanges();
      }
    );
  }

  search(): void {
    this.loader.isLoading = new BehaviorSubject<boolean>(false);
    this.searchresult = [];
    this.isdataLoading = true;
    this.commonService.getFilterChats(this.searchTerm).subscribe((response) => {
      this.searchresult = response;
      this.isdataLoading = false;
      this.changedetectorref.detectChanges();
    });
  }

  openchatDialog(data): void {
    let GUID = data.guid;
    this.genericService.setSelectedChatGroupID(GUID);

    this.loadrequireddata();
  }
}
