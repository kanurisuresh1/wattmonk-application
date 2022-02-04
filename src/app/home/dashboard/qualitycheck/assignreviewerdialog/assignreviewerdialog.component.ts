import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CometChat } from "@cometchat-pro/chat";
import { BehaviorSubject } from "rxjs";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { Design, User } from "src/app/_models";
import { Survey } from "src/app/_models/survey";
import {
  DesignService,
  GenericService, LoaderService, NotificationService
} from "src/app/_services";
import { SurveyService } from "src/app/_services/survey.service";

export interface AssignDesignReviewerFormData {
  isEditMode: boolean;
  design: Design;
  refreshDashboard: boolean;
  survey: Survey;
  isDesign: boolean;
}

@Component({
  selector: "app-assignreviewerdialog",
  templateUrl: "./assignreviewerdialog.component.html",
  styleUrls: ["./assignreviewerdialog.component.scss"],
})
export class AssignreviewerdialogComponent implements OnInit {
  analysts: User[] = [];
  filterAnalysts: User[] = [];
  selectedAnalyst: User;
  isLoading = false;
  searchTerm: any;
  analystsjoblist = [];
  revisionJobs = 0;
  otherJobs = 0;
  isanalystsjobsavailable: boolean = false;
  oldselectedanalyst: number;
  isAnalystSelcted = true;
  isAnalystLoad = false;
  loadingmessage = "Save data.";
  constructor(
    public dialogRef: MatDialogRef<AssignreviewerdialogComponent>,
    // private router: Router,
    private notifyService: NotificationService,
    private designService: DesignService,
    private surveyService: SurveyService,
    public genericService: GenericService,
    // private authService: AuthenticationService,
    private loaderservice: LoaderService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: AssignDesignReviewerFormData
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.fetchAnalysts(this.data.design.creatorparentid);
    });
  }

  onCloseClick(): void {
    this.dialogRef.close(this.data);
  }

  fetchAnalysts(clientid): void {
    this.designService.getAnalysts(clientid).subscribe(
      (response) => {
        this.analysts = response;
        this.isAnalystLoad = true;
        this.analysts.forEach((element) => {
          if (element.id == 232) {
            element.firstname = "WattMonk";
            element.lastname = "";
          }
          //Mark selected designer

          if (this.data.isDesign) {
            if (
              this.data.design.reviewassignedto != null &&
              this.data.design.reviewassignedto.id == element.id
            ) {
              this.selectedAnalyst = element;
              element.isDisplayed = true;
              this.fetchAnalystsJobs();
            }
          }
        });
        this.filterAnalysts = this.analysts;
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  setSelectedAssignee(record: User, index: number): void {
    this.unselectAllAnalysts();
    this.analysts[index].isDisplayed = true;
    this.selectedAnalyst = record;
    if (this.oldselectedanalyst != this.selectedAnalyst.id) {
      // this.loaderservice.isLoading = new BehaviorSubject<boolean>(false);
      this.isanalystsjobsavailable = false;
      this.fetchAnalystsJobs();
    }
  }

  unselectAllAnalysts(): void {
    this.analysts.forEach((element) => {
      element.isDisplayed = false;
    });
  }

  assignUser(): void {
    if (this.data.isDesign) {
      if (this.selectedAnalyst == undefined) {
        this.isAnalystSelcted = false;
      } else if (
        this.data.design.reviewassignedto != null &&
        this.data.design.reviewassignedto.id == this.selectedAnalyst.id
      ) {
        this.isLoading = false;
        this.notifyService.showInfo(
          "This design request has already been assigned for review to " +
          this.selectedAnalyst.firstname +
          " " +
          this.selectedAnalyst.lastname +
          ".",
          "Information"
        );
      } else {
        this.isLoading = true;
        const postData = {
          reviewassignedto: this.selectedAnalyst.id,
          status: "reviewassigned",
          reviewstarttime: Date.now(),
        };
        this.isLoading = true;
        this.loadingmessage = "Assigning Review.";
        //  this.loaderservice.show();
        this.designService
          .assignreview(this.data.design.id, postData)
          .subscribe(
            (response) => {
              this.data.design = response;
              // this.notifyService.showSuccess("This design request has already been assigned for review to " + this.selectedAnalyst.firstname + " " + this.selectedAnalyst.lastname + ".", "Success");
              // this.loaderservice.hide();

              this.isLoading = false;
              this.addUserToDesignGroupChat();
            },
            (error) => {
              // this.loaderservice.hide();
              this.notifyService.showError(error, "Error");
            }
          );
      }
    } else {
      const postData = {
        reviewassignedto: this.selectedAnalyst.id,
        status: "reviewassigned",
        reviewstarttime: Date.now(),
      };
      this.loaderservice.show();
      this.surveyService.editSurvey(this.data.survey.id, postData).subscribe(
        (response) => {
          this.data.survey = response;
          this.notifyService.showSuccess(
            "Quality check process for " +
            this.data.survey.address +
            " has been successfully assigned to " +
            this.selectedAnalyst.firstname +
            " " +
            this.selectedAnalyst.lastname +
            ".",
            "Success"
          );
          this.data.refreshDashboard = true;
          this.dialogRef.close(this.data);
          this.loaderservice.hide();
          // this.isLoading = true;
          this.addUserToSurveyGroupChat();
        },
        (error) => {
          this.loaderservice.hide();
          this.notifyService.showError(error, "Error");
        }
      );
    }
  }

  addUserToDesignGroupChat(): void {
    const GUID = this.data.design.chatid;
    let membersList = [
      new CometChat.GroupMember(
        "" + this.selectedAnalyst.cometchatuid,
        CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT
      ),
    ];
    CometChat.addMembersToGroup(GUID, membersList, []).then(
      () => {
        this.isLoading = false;
        this.notifyService.showSuccess(
          "Quality check process for " +
          this.data.design.address +
          "  has been successfully assigned to " +
          this.selectedAnalyst.firstname +
          " " +
          this.selectedAnalyst.lastname +
          ".",
          "Success"
        );
        this.data.refreshDashboard = true;
        this.dialogRef.close(this.data);
      },
      () => {
        this.notifyService.showSuccess(
          "Quality check process  for " +
          this.data.design.address +
          "  has been successfully assigned to " +
          this.selectedAnalyst.firstname +
          " " +
          this.selectedAnalyst.lastname +
          ".",
          "Success"
        );
        this.isLoading = false;
        this.data.refreshDashboard = true;
        this.dialogRef.close(this.data);
      }
    );
  }

  addUserToSurveyGroupChat(): void {
    const GUID = this.data.survey.chatid;
    let membersList = [
      new CometChat.GroupMember(
        "" + this.selectedAnalyst.cometchatuid,
        CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT
      ),
    ];
    CometChat.addMembersToGroup(GUID, membersList, []).then(
      () => {
        this.isLoading = false;
        this.notifyService.showSuccess(
          "Quality check process for " +
          this.data.survey.address +
          " has been successfully assigned to " +
          this.selectedAnalyst.firstname +
          " " +
          this.selectedAnalyst.lastname +
          ".",
          "Success"
        );
        this.data.refreshDashboard = true;
        this.dialogRef.close(this.data);
      },
      () => {
        this.isLoading = false;
        this.data.refreshDashboard = true;
        this.dialogRef.close(this.data);
      }
    );
  }

  search(): void {
    let term = this.searchTerm.toLowerCase();
    this.analysts = this.filterAnalysts.filter(function (tag) {
      let searchResult;
      let searchByFirstName = tag.firstname.toLowerCase().indexOf(term) >= 0;
      let searchByLastName = tag.lastname.toLowerCase().indexOf(term) >= 0;
      let fullname = tag.firstname + " " + tag.lastname;
      let searchByFullName = fullname.toLowerCase().indexOf(term) >= 0;

      if (searchByFirstName) {
        searchResult = searchByFirstName;
      } else if (searchByLastName) {
        searchResult = searchByLastName;
      } else if (searchByFullName) {
        searchResult = searchByFullName;
      }
      return searchResult;
    });
  }

  fetchAnalystsJobs(): void {
    this.revisionJobs = 0;
    this.otherJobs = 0;
    this.analystsjoblist = [];
    this.oldselectedanalyst = this.selectedAnalyst.id;
    this.designService
      .getAnalystJobs(this.selectedAnalyst.id)
      .subscribe((response: any) => {
        this.isanalystsjobsavailable = true;
        this.analystsjoblist = response;
        this.analystsjoblist.forEach((element) => {
          if (element.isinrevisionstate) {
            ++this.revisionJobs;
          } else {
            ++this.otherJobs;
          }
        });
      });
  }

  openDetailPage(design: Design): void {
    // this.activitybarClose();
    // this.listactionindex = index;
    this.loaderservice.isLoading = new BehaviorSubject<boolean>(true);
    this.fetchDesignDetails(design);
  }

  openPrelimDesignDetailDialog(design: Design): void {
    let prelimdata = null;
    let permitdata = null;
    if (design.requesttype == "permit") {
      permitdata = design;
    } else {
      prelimdata = design;
    }

    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      /* panelClass: 'white-modalbox',
       height:"98%", */
      data: {
        permit: permitdata,
        prelim: prelimdata,
        triggerEditEvent: false,
        triggerDeleteEvent: false,
        selectedtab: design.requesttype,
        triggerChatEvent: false,
        triggerActivity: false,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this._snackBar.dismiss();
    });
  }

  fetchDesignDetails(design: Design): void {
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openPrelimDesignDetailDialog(response);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
}
