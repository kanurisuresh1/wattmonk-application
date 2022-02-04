import { ViewportScroller } from "@angular/common";
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  OnInit, ViewEncapsulation
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { CometChat } from "@cometchat-pro/chat";
import { ChatdialogComponent } from "src/app/shared/chatdialog/chatdialog.component";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import { Survey } from "src/app/_models/survey";
import {
  AuthenticationService,
  DesignService, GenericService, LoaderService, NotificationService
} from "src/app/_services";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { SurveyService } from "src/app/_services/survey.service";
import { AddsurveydialogComponent } from "../../survey/addsurveydialog/addsurveydialog.component";

export enum LISTTYPE {
  INPROGRESS,
  COMPLETED,
}

@Component({
  selector: "app-surveyoroverview",
  templateUrl: "./surveyoroverview.component.html",
  styleUrls: ["./surveyoroverview.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyoroverviewComponent implements OnInit {
  isLoading = false;
  listtypes = LISTTYPE;
  placeholder = true;
  panelOpenState = true;
  loggedInUser: User;
  isClient = false;
  isvianotification = false;

  newsurveys: number = 0;
  overdue: number = 0;
  allsurveys: number = 0;
  completed: number = 0;
  inprogress: number = 0;

  istabchangeevent = false;
  listactionindex = 0;
  selectedtabindex = 0;

  dateclassifiedsurveyslist = [];
  overduesurveyslist: Survey[] = [];
  completedsurveyslist: Survey[] = [];
  inprogresssurveyslist: Survey[] = [];

  completedsurveys: Survey[] = [];
  inprogresssurveys: Survey[] = [];
  isinprogresssurveyslistloading = true;
  iscompletedsurveyslistloading = true;
  prelimDesign = null;
  constructor(
    public dialog: MatDialog,
    private viewportScroller: ViewportScroller,
    private notifyService: NotificationService,
    public genericService: GenericService,
    private surveyService: SurveyService,
    public authService: AuthenticationService,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private designService: DesignService,
    private eventEmitterService: EventEmitterService,
    private loaderservice: LoaderService
  ) {
    this.loggedInUser = authService.currentUserValue.user;
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
  }

  ngOnInit(): void {
    this.fetchAllSurveysCount();
    this.eventEmitterService.newnotificationreceived.subscribe(() => {
      this.isvianotification = true;
      this.fetchInProgressSurveysData();
    });
  }

  gotoSection(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }
  activitybarToggle(survey: Survey, event: Event): void {
    event.stopPropagation();
    this.activitybarOpen(survey);
  }

  activitybarOpen(survey: Survey): void {
    this.eventEmitterService.onActivityBarButtonClick(survey.id, false);
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.add("activitybar-open");
    $activitybar.classList.remove("activitybar-close");
  }

  activitybarClose(): void {
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.remove("activitybar-open");
    $activitybar.classList.add("activitybar-close");
  }

  addItemToList(type: LISTTYPE, newrecord: Survey): void {
    switch (type) {
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
  maintabchange(tabChangeEvent: MatTabChangeEvent): void {
    this.istabchangeevent = true;
    this.selectedtabindex = tabChangeEvent.index;
    this.fetchAllSurveysCount();
    switch (tabChangeEvent.index) {
      case 0:
        this.fetchInProgressSurveysData();
        break;
      case 1:
        this.fetchCompletedSurveysData();
        break;

      default:
        break;
    }
  }

  startSurvey(event): void {
    event.stopPropagation();
    this.notifyService.showInfo(
      "Please use our mobile app to perform Survey.",
      "Information"
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
        triggerEditEvent: triggerEditEvent,
        prelim: this.prelimDesign,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.prelimDesign = null;
      if (result.triggerSurveyEditEvent) {
        this.openEditSurveyDialog(record);
      }

      if (result.refreshDashboard) {
        this.fetchAllSurveysCount();
      }
    });
  }

  openEditSurveyDialog(survey: Survey): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddsurveydialogComponent, {
      width: "70%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, survey: survey },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.fetchInProgressSurveysData();
      }
    });
  }
  fetchSurveyDetails(record: Survey): void {
    this.isLoading = true;
    this.loaderservice.show();
    this.surveyService.getSurveyDetails(record.id).subscribe(
      (response) => {
        if (response.prelimdesignsurvey != null) {
          this.fetchDesignDetails(response);
        } else {
          this.isLoading = false;
          this.openSurveyDetailDialog(response);
        }
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchDesignDetails(record: Survey): void {
    this.designService
      .getDesignDetails(record.prelimdesignsurvey.id)
      .subscribe((response) => {
        this.prelimDesign = response;
        this.isLoading = false;
        this.openSurveyDetailDialog(record);
      });
  }
  fetchAllSurveysCount(): void {
    this.surveyService.getSurveysCount().subscribe(
      (response) => {
        this.inprogress = response["inprocess"];
        this.completed = response["completed"];
        this.fetchInProgressSurveysData();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onChatButtonClick(survey: Survey, event: Event): void {
    event.stopPropagation();
    this.activitybarClose();
    const GUID = survey.chatid;
    this.genericService.setSelectedChatGroupID(GUID);
    /*    this.genericService.backroute = "/home/dashboard/overview/surveyor";
    this.router.navigate(['/home/inbox/messages']);
    this.eventEmitterService.onSidebarRouteChange("Inbox"); */
    this._snackBar.openFromComponent(ChatdialogComponent, {
      data: "element",
      panelClass: ["chatdialog"],
    });
  }

  fetchInProgressSurveysData(): void {
    this.surveyService.getFilteredSurveys("status=assigned").subscribe(
      (response) => {
        this.inprogresssurveys = this.fillinDynamicData(response);
        this.inprogresssurveyslist = this.classifySurveysListData(
          this.inprogresssurveys
        );
        this.isinprogresssurveyslistloading = false;
        this.changeDetectorRef.detectChanges();
        if (!this.isvianotification) {
          this.fetchCompletedSurveysData();
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchCompletedSurveysData(): void {
    this.surveyService.getFilteredSurveys("status=completed").subscribe(
      (response) => {
        this.completedsurveys = this.fillinDynamicData(response);
        this.completedsurveyslist = this.classifySurveysListData(
          this.completedsurveys
        );
        this.iscompletedsurveyslistloading = false;
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

  openAddSurveyDialog(): void {
    const dialogRef = this.dialog.open(AddsurveydialogComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, isDataUpdated: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.addItemToList(LISTTYPE.INPROGRESS, result.survey);
      }
    });
  }
}
