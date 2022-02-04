import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { ViewportScroller } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import axios from "axios";
import { saveAs } from "file-saver";
import * as JSZip from "jszip";
import { ChatdialogComponent } from "src/app/shared/chatdialog/chatdialog.component";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { ROLES } from "src/app/_helpers";
import { Design, User } from "src/app/_models";
import { Survey } from "src/app/_models/survey";
import { UserSetting } from "src/app/_models/usersettings";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { SurveyService } from "src/app/_services/survey.service";
import { AddminpermitdesigndialogComponent } from "../../permitdesign/addminpermitdesigndialog/addminpermitdesigndialog.component";
import { DetailedpermitComponent } from "../../permitdesign/detailedpermit/detailedpermit.component";
import { AddsurveydialogComponent } from "../addsurveydialog/addsurveydialog.component";
import { AssignsurveydialogComponent } from "../assignsurveydialog/assignsurveydialog.component";

export enum LISTTYPE {
  NEW,
  INPROGRESS,
  COMPLETED,
  INREVIEW,
  DELIVERED,
}

@Component({
  selector: "app-survey",
  templateUrl: "./survey.component.html",
  styleUrls: ["./survey.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyComponent implements OnInit {
  isLoading = false;
  scrolling: boolean;

  listtypes = LISTTYPE;
  panelOpenState = true;
  loggedInUser: User;
  isClient = false;
  israisepermitrequest = false;

  newsurveys: number = -1;
  overdue: number = -1;
  allsurveys: number = -1;
  completed: number = -1;
  inprogress: number = -1;
  listactionindex = 0;

  isunassignedlistloading = true;
  isinprogresslistloading = true;
  iscompletedlistloading = true;

  unassignedsurveyslist: Survey[] = [];
  completedsurveyslist: Survey[] = [];
  inprogresssurveyslist: Survey[] = [];

  unassignedsurveys: Survey[] = [];
  completedsurveys: Survey[] = [];
  inprogresssurveys: Survey[] = [];

  prelimDesign = null;
  skip = 0;
  limit = 10;
  teamheadid = 0;
  masterid = 0;
  Allfiles: any = [];

  isDownloading = false;
  loadingmessage = "Preparing download";
  loadingpercentage: number = 0;

  // @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  @ViewChild("completeddesignscroll")
  completeddesignviewport: CdkVirtualScrollViewport;
  dynamicName: UserSetting;

  constructor(
    public dialog: MatDialog,
    private viewportScroller: ViewportScroller,
    private notifyService: NotificationService,
    public genericService: GenericService,
    private surveyService: SurveyService,
    public authService: AuthenticationService,
    private eventEmitterService: EventEmitterService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private designService: DesignService,
    private changeDetectorRef: ChangeDetectorRef,
    private loaderservice: LoaderService
  ) {
    this.dynamicName = JSON.parse(localStorage.getItem("usersettings"));
    this.loggedInUser = authService.currentUserValue.user;
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id != 232)
    ) {
      this.israisepermitrequest = true;
    } else {
      this.israisepermitrequest = false;
    }
    this.teamheadid = ROLES.TeamHead;
    this.masterid = ROLES.Master;
  }

  ngOnInit(): void {
    this.fetchAllSurveysCount(); //if(!this.isClient)
  }

  activitybarToggle(survey: Survey, event: Event): void {
    event.stopPropagation();
    this.activitybarOpen(survey);
  }

  activitybarOpen(survey: Survey): void {
    this.eventEmitterService.onActivityBarButtonClick(survey.id, false);
    const $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.add("activitybar-open");
    $activitybar.classList.remove("activitybar-close");
  }

  activitybarClose(): void {
    const $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.remove("activitybar-open");
    $activitybar.classList.add("activitybar-close");
  }

  onChatButtonClick(survey: Survey, event: Event): void {
    event.stopPropagation();
    this.activitybarClose();
    const GUID = survey.chatid;
    this.genericService.setSelectedChatGroupID(GUID);
    /*  this.genericService.backroute = "/home/dashboard/overview/survey";
     this.router.navigate(['/home/inbox/messages']);
     this.eventEmitterService.onSidebarRouteChange("Inbox"); */
    this._snackBar.openFromComponent(ChatdialogComponent, {
      data: "element",
      panelClass: ["chatdialog"],
    });
  }

  gotoSection(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }

  removeItemFromList(type: LISTTYPE, record: Survey): void {
    switch (type) {
      case LISTTYPE.NEW:
        this.listactionindex = this.unassignedsurveys.indexOf(record);
        this.newsurveys -= 1;
        this.unassignedsurveys.splice(this.listactionindex, 1);
        this.unassignedsurveys = [...this.unassignedsurveys];
        this.unassignedsurveys = this.fillinDynamicData(this.unassignedsurveys);
        this.unassignedsurveyslist = this.classifySurveysListData(
          this.unassignedsurveys
        );
        break;
      case LISTTYPE.INPROGRESS:
        this.listactionindex = this.inprogresssurveys.indexOf(record);
        this.inprogress -= 1;
        this.inprogresssurveys.splice(this.listactionindex, 1);
        this.inprogresssurveys = [...this.inprogresssurveys];
        this.inprogresssurveys = this.fillinDynamicData(this.inprogresssurveys);
        this.inprogresssurveyslist = this.classifySurveysListData(
          this.inprogresssurveys
        );
        break;
      case LISTTYPE.COMPLETED:
        this.listactionindex = this.completedsurveys.indexOf(record);
        this.completed -= 1;
        this.completedsurveys.splice(this.listactionindex, 1);
        this.completedsurveys = [...this.completedsurveys];
        this.completedsurveys = this.fillinDynamicData(this.completedsurveys);
        this.completedsurveyslist = this.classifySurveysListData(
          this.completedsurveys
        );
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  updateItemInList(type: LISTTYPE, record: Survey, newrecord: Survey): void {
    switch (type) {
      case LISTTYPE.NEW:
        this.listactionindex = this.unassignedsurveys.indexOf(record);
        this.unassignedsurveys.splice(this.listactionindex, 1, newrecord);
        this.unassignedsurveys = [...this.unassignedsurveys];
        this.unassignedsurveys = this.fillinDynamicData(this.unassignedsurveys);
        this.unassignedsurveyslist = this.classifySurveysListData(
          this.unassignedsurveys
        );
        break;
      case LISTTYPE.INPROGRESS:
        this.listactionindex = this.inprogresssurveys.indexOf(record);
        this.inprogresssurveys.splice(this.listactionindex, 1, newrecord);
        this.inprogresssurveys = [...this.inprogresssurveys];
        this.inprogresssurveys = this.fillinDynamicData(this.inprogresssurveys);
        this.inprogresssurveyslist = this.classifySurveysListData(
          this.inprogresssurveys
        );
        break;
      case LISTTYPE.COMPLETED:
        this.listactionindex = this.completedsurveys.indexOf(record);
        this.completedsurveys.splice(this.listactionindex, 1, newrecord);
        this.completedsurveys = [...this.completedsurveys];
        this.completedsurveys = this.fillinDynamicData(this.completedsurveys);
        this.completedsurveyslist = this.classifySurveysListData(
          this.completedsurveys
        );
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  addItemToList(type: LISTTYPE, newrecord: Survey): void {
    switch (type) {
      case LISTTYPE.NEW:
        this.unassignedsurveys.splice(0, 0, newrecord);
        this.unassignedsurveys = [...this.unassignedsurveys];
        this.unassignedsurveys = this.fillinDynamicData(this.unassignedsurveys);
        this.unassignedsurveyslist = this.classifySurveysListData(
          this.unassignedsurveys
        );
        this.newsurveys += 1;
        break;
      case LISTTYPE.INPROGRESS:
        this.inprogresssurveys.splice(0, 0, newrecord);
        this.inprogresssurveys = [...this.inprogresssurveys];
        this.inprogresssurveys = this.fillinDynamicData(this.inprogresssurveys);
        this.inprogresssurveyslist = this.classifySurveysListData(
          this.inprogresssurveys
        );
        this.inprogress = this.inprogresssurveys.length;
        break;
      case LISTTYPE.COMPLETED:
        this.completedsurveys.splice(0, 0, newrecord);
        this.completedsurveys = [...this.completedsurveys];
        this.completedsurveys = this.fillinDynamicData(this.completedsurveys);
        this.completedsurveyslist = this.classifySurveysListData(
          this.completedsurveys
        );
        this.completed += 1;
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  openAddSurveyDialog(): void {
    const dialogRef = this.dialog.open(AddsurveydialogComponent, {
      width: "70%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, isDataUpdated: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.addItemToList(LISTTYPE.NEW, result.survey);
      }
    });
  }

  openEditSurveyDialog(survey: Survey): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddsurveydialogComponent, {
      width: "70%",
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: true, isDataUpdated: false, survey: survey },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        //  this.updateItemInList(type, survey, result.survey);
        this.unassignedsurveyslist[this.listactionindex] = result.survey;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  openAllSurveysPage(): void {
    // do nothing.
  }

  maintabchange(tabChangeEvent: MatTabChangeEvent): void {
    this.unassignedsurveys = [];
    this.completedsurveys = [];
    this.inprogresssurveys = [];
    this.completedsurveyslist = [];

    this.skip = 0;
    this.limit = 10;
    this.fetchAllSurveysCount();

    switch (tabChangeEvent.index) {
      case 0:
        this.isunassignedlistloading = true;
        // this.fetchUserSurveysData("status=created");
        break;
      case 1:
        this.isinprogresslistloading = true;
        this.fetchInProgressSurveysData();
        break;
      case 2:
        this.iscompletedlistloading = true;
        this.fetchCompletedSurveysData();
        break;

      default:
        break;
    }
  }

  downloadSurvey(survey: Survey, event: Event): void {
    event.stopPropagation();

    const fileurl = survey.surveypdf.url;
    const filename =
      "survey" + survey.name + "_" + survey.email + survey.surveypdf.ext;

    axios({
      url: fileurl,
      //url: fileurl,
      method: "GET",
      responseType: "blob",
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
    });
  }
  raisePermitRequest(record: Survey, event): void {
    event.stopPropagation();
    this.loaderservice.show();
    this.surveyService.getSurveyDetails(record.id).subscribe(
      (response) => {
        this.addPermitDesign(response);
        this.loaderservice.hide();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }

  addPermitDesign(record: Survey): void {
    this.activitybarClose();
    if (record.prelimdesignsurvey != null) {
      this.getPrelimDesign(record.prelimdesignsurvey, record);
    } else {
      this.openAddPermitdialog(record, record.prelimdesignsurvey);
    }
  }

  getPrelimDesign(design, record): void {
    this.designService.getDesignDetails(design.id).subscribe((response) => {
      this.openAddPermitdialog(record, response);
    });
  }

  openAddPermitdialog(record: Survey, design: Design): void {
    const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isPermitmode: true, survey: record, prelimDesign: design },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        design.ispermitraised = true;
        this.changeDetectorRef.detectChanges();
        this.router.navigate(["/home/permitdesign/overview"]);
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        design.ispermitraised = true;
        this.changeDetectorRef.detectChanges();
        this.router.navigate(["/home/permitdesign/overview"]);
      }
    });
  }
  generatePDF(survey: Survey, event: Event): void {
    this.isLoading = true;
    event.stopPropagation();
    this.surveyService.generatePDF(survey.id).subscribe(
      (response) => {
        this.isLoading = false;
        //this.notifyService.showSuccess("Survey PDF Generated successfully.", "Success");

        this.surveyService.getSurveyDetails(response.id).subscribe(
          (response2) => {
            const fileurl = response2.surveypdf.url;
            const filename =
              "survey" +
              response2.name +
              "_" +
              response2.email +
              response2.surveypdf.ext;

            axios({
              url: fileurl,
              method: "GET",
              responseType: "blob",
            }).then((response3) => {
              const url = window.URL.createObjectURL(
                new Blob([response3.data])
              );
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", filename);
              document.body.appendChild(link);
              link.click();
            });
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );

        this.changeDetectorRef.detectChanges();
        //this.fetchCompletedSurveysData();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  openSurveyDetailDialog(record: Survey): void {
    this.isLoading = false;
    this.changeDetectorRef.detectChanges();
    const triggerEditEvent = false;
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        survey: record,
        triggerSurveyEditEvent: triggerEditEvent,
        prelim: this.prelimDesign,
      },
    });
    this.isLoading = false;
    dialogRef.afterClosed().subscribe((result) => {
      this.prelimDesign = null;
      if (result.triggerSurveyEditEvent) {
        this.openEditSurveyDialog(record);
        this.fetchAllSurveysCount();
      }

      if (result.refreshDashboard) {
        this.fetchAllSurveysCount();
      }
    });
  }

  openAssignSurveyorDialog(record: Survey, event: Event): void {
    event.stopPropagation();
    this.listactionindex = this.unassignedsurveyslist.indexOf(record);
    const dialogRef = this.dialog.open(AssignsurveydialogComponent, {
      width: "50%",
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: false, survey: record },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        if (result.survey.status == "outsourced") {
          this.updateItemInList(LISTTYPE.NEW, record, result.survey);
        } else {
          this.removeItemFromList(LISTTYPE.NEW, record);
          this.addItemToList(LISTTYPE.INPROGRESS, result.survey);
        }
      }
    });
  }
  selfAssignQC(record: Survey, event: Event, index): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const postData = {
      reviewassignedto: this.loggedInUser.id,
      status: "reviewassigned",
      reviewstarttime: Date.now(),
    };

    this.surveyService.editSurvey(record.id, postData).subscribe(
      (response) => {
        this.notifyService.showSuccess(
          "Quality check process for " +
          record.address +
          "  has been successfully assigned to you.",
          "Success"
        );
        this.removeItemFromList(LISTTYPE.COMPLETED, record);
        this.addItemToList(LISTTYPE.INREVIEW, response);
        this.fetchAllSurveysCount();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  startSurvey(event): void {
    event.stopPropagation();
    this.notifyService.showInfo(
      "Please use our mobile app to perform Survey.",
      "Information"
    );
  }

  fetchAllSurveysCount(): void {
    this.surveyService.getSurveysCount().subscribe(
      (response) => {
        this.newsurveys = response["newsurvey"];
        this.inprogress = response["inprocess"];
        this.completed = response["completed"];
        this.fetchUserSurveysData("status=created");
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchSurveyDetails(record: Survey): void {
    this.isLoading = true;
    this.loaderservice.show();
    this.surveyService.getSurveyDetails(record.id).subscribe(
      (response) => {
        if (response.prelimdesignsurvey != null) {
          this.fetchDesignDetails(response);
        } else {
          this.openSurveyDetailDialog(response);
        }
        this.loaderservice.hide();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }

  fetchDesignDetails(record: Survey): void {
    this.designService
      .getDesignDetails(record.prelimdesignsurvey.id)
      .subscribe((response) => {
        this.prelimDesign = response;
        this.openSurveyDetailDialog(record);
      });
  }
  fetchUserSurveysData(search: string): void {
    this.surveyService.getFilteredSurveys(search).subscribe(
      (response) => {
        this.newsurveys = response.length;
        this.unassignedsurveys = this.fillinDynamicData(response);
        this.unassignedsurveyslist = this.classifySurveysListData(
          this.unassignedsurveys
        );
        /*const date = new Date().toString();
       const formattedDate=this.genericService.formatDateInDisplayFormat(date)
        const selectedIndex = this.unassignedsurveys.findIndex(elem =>  this.genericService.formatDateInDisplayFormat(elem.datetime.split('T')[0]) == formattedDate);
        console.log(selectedIndex,this.unassignedsurveyslist,formattedDate);
        setTimeout(() => {
          this.viewPort.scrollToIndex(selectedIndex,'auto');
        },2000); */
        this.isunassignedlistloading = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchInProgressSurveysData(): void {
    this.surveyService.getFilteredSurveys("status=assigned").subscribe(
      (response) => {
        this.inprogress = response.length;
        this.inprogresssurveys = this.fillinDynamicData(response);
        this.inprogresssurveyslist = this.classifySurveysListData(
          this.inprogresssurveys
        );
        this.isinprogresslistloading = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchCompletedSurveysData(): void {
    let searchdata = "";
    searchdata =
      "limit=" + this.limit + "&skip=" + this.skip + "&status=completed";
    this.surveyService.getFilteredSurveys(searchdata).subscribe(
      (response) => {
        // this.completed = response.length;
        this.completedsurveys = this.fillinDynamicData(response);
        for (let i = 0, len = this.completedsurveys.length; i < len; ++i) {
          this.completedsurveyslist.push(this.completedsurveys[i]);
        }
        this.completedsurveyslist = [...this.completedsurveyslist];
        // this.completedsurveyslist = this.completedsurveys;

        this.iscompletedlistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fillinDynamicData(records: Survey[]): Survey[] {
    records.forEach((element) => {
      element.currentstatus = this.genericService.getSurveyStatusName(
        element.status
      );
      element.isoverdue = this.genericService.isDatePassed(element.datetime);
      element.formattedtime = this.genericService.formatTimeInDisplayFormat(
        element.datetime
      );
      element.formattedupdatedat = this.genericService.formatDateInTimeAgo(
        element.updated_at
      );
      element.formattedjobtype = this.genericService.getJobTypeName(
        element.jobtype
      );
      CometChat.getUnreadMessageCountForGroup(element.chatid).then(
        (array) => {
          if (array[element.chatid] != undefined) {
            element.unreadmessagecount = array[element.chatid];
            this.changeDetectorRef.detectChanges();
          } else {
            element.unreadmessagecount = 0;
            this.changeDetectorRef.detectChanges();
          }
        },
        () => {
          // do nothing.
        }
      );
    });
    return records;
  }

  sendRequestForPermit(record: Survey, event: Event): void {
    event.stopPropagation();
    const design = this.genericService.createdesignoutofsurvey(record);
    this.openAutocadDialog(design);
  }

  openAutocadDialog(design: Design): void {
    const dialogRef = this.dialog.open(DetailedpermitComponent, {
      width: "90%",
      autoFocus: false,
      disableClose: true,
      data: {
        isEditMode: false,
        isDataUpdated: false,
        design: design,
        isRequestFromSurvey: true,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }

  openSurveyDeclineDialog(record: Survey): void {
    const dialogRef = this.dialog.open(SurveyDeclineDialog, {
      width: "50%",
      disableClose: true,
      data: { survey: record },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        const postData = {
          status: "requestdeclined",
          requestdeclinereason: result.reason,
          outsourcedto: null,
          isoutsourced: "false",
        };

        this.surveyService.editSurvey(record.id, postData).subscribe(
          () => {
            this.notifyService.showSuccess(
              "Survey request has been declined successfully.",
              "Success"
            );
            this.removeItemFromList(LISTTYPE.NEW, record);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      }
    });
  }

  declineSurveyRequest(survey: Survey, event: Event): void {
    event.stopPropagation();
    this.openSurveyDeclineDialog(survey);
  }

  acceptSurveyRequest(survey: Survey, event: Event): void {
    event.stopPropagation();
    this.updateSurveyStatus(
      survey.id,
      "requestaccepted",
      "Survey request has been accepted successfully."
    );
  }

  updateSurveyStatus(id: number, status: string, message: string): void {
    event.stopPropagation();
    const postData = {
      status: status,
    };

    this.surveyService.editSurvey(id, postData).subscribe(
      () => {
        this.notifyService.showSuccess(message, "Success");
        this.fetchAllSurveysCount();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  classifySurveysListData(inputlist: Survey[]): any[] {
    // this gives an object with dates as keys
    const groups = inputlist.reduce((groups, record) => {
      const date = record.datetime.split("T")[0];
      const formatteddate = this.genericService.formatDateInDisplayFormat(date);
      if (!groups[formatteddate]) {
        groups[formatteddate] = [];
      }
      groups[formatteddate].push(record);
      return groups;
    }, {});

    // Edit: to add it in the array format instead
    const outputlist = Object.keys(groups).map((date) => {
      return {
        date,
        records: groups[date],
      };
    });
    return outputlist;
  }

  downloadSurveyfile(survey: Survey, event: Event): void {
    const that = this;
    this.loadingpercentage = 0;
    this.isDownloading = true;
    event.stopPropagation();
    if (survey.mspimages.length > 0) {
      survey.mspimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.utilitymeterimages.length > 0) {
      survey.utilitymeterimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }

    if (survey.pvinverterimages.length > 0) {
      survey.pvinverterimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.pvmeterimages.length > 0) {
      survey.pvmeterimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.acdisconnectimages.length > 0) {
      survey.acdisconnectimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.roofimages.length > 0) {
      survey.roofimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.roofdimensionimages.length > 0) {
      survey.roofdimensionimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.obstaclesimages.length > 0) {
      survey.obstaclesimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.obstaclesdimensionsimages.length > 0) {
      survey.obstaclesdimensionsimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.atticimages.length > 0) {
      survey.atticimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.appliancesimages.length > 0) {
      survey.appliancesimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.groundimages.length > 0) {
      survey.groundimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.solarpanelsimages.length > 0) {
      survey.solarpanelsimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.existingsubpanelimages.length > 0) {
      survey.existingsubpanelimages.forEach((element) => {
        this.Allfiles.push(element);
      });
    }
    if (survey.utilitybillfront != null) {
      this.Allfiles.push(survey.utilitybillfront);
    }
    if (survey.utilitybillback != null) {
      this.Allfiles.push(survey.utilitybillback);
    }
    if (survey.surveypdf != null) {
      this.Allfiles.push(survey.surveypdf);
    }

    const zip = new JSZip(); let count = 1;
    this.Allfiles.forEach((file) => {
      axios
        .get(file.url, {
          responseType: "blob",
        })
        .then((response) => {
          const percentage = Math.round((count * 100) / this.Allfiles.length);

          this.loadingpercentage = percentage;
          this.changeDetectorRef.detectChanges();
          zip.file(file.name + file.ext, response.data, {
            binary: true,
          });

          ++count;
          if (count == this.Allfiles.length) {
            zip
              .generateAsync({
                type: "blob",
              })
              .then(function (content) {
                that.isDownloading = false;
                that.changeDetectorRef.detectChanges();
                saveAs(content, survey.name + "_" + survey.email + ".zip");
              });
          }
        })
        .catch(() => {
          // do nothing.
        });
    });
  }
  onScrollcompleted(): void {
    const end = this.completeddesignviewport.getRenderedRange().end;
    const total = this.completeddesignviewport.getDataLength();

    if (end == total && this.completed > total) {
      this.scrolling = true;
      this.skip += 10;
      this.fetchCompletedSurveysData();
    }
  }
}
export interface SurveyDeclineDialogData {
  survey: Survey;
  reason: string;
  issubmitted: boolean;
}

@Component({
  selector: "survey-decline-dialog",
  templateUrl: "survey-decline-dialog.html",
})
export class SurveyDeclineDialog implements OnInit {
  declinereason = new FormControl("", [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<SurveyDeclineDialog>,
    @Inject(MAT_DIALOG_DATA) public data: SurveyDeclineDialogData
  ) { }

  onNoClick(): void {
    this.data.issubmitted = false;
    this.dialogRef.close(this.data);
  }

  onSubmit(): void {
    this.data.issubmitted = true;
    this.dialogRef.close(this.data);
  }

  ngOnInit(): void {
    // do nothing.
  }
}
