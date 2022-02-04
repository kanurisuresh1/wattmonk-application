import { ViewportScroller } from "@angular/common";
import {
  ChangeDetectorRef, Component,
  OnInit, ViewEncapsulation
} from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTabChangeEvent } from "@angular/material/tabs";
import axios from "axios";
import { ChatdialogComponent } from "src/app/shared/chatdialog/chatdialog.component";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { ROLES } from "src/app/_helpers";
import { Design, User } from "src/app/_models";
import { JobsTiming } from "src/app/_models/jobtiming";
import {
  AuthenticationService, DesignService, GenericService, LoaderService, NotificationService
} from "src/app/_services";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { SurveyService } from "src/app/_services/survey.service";
import { DetailedpermitComponent } from "../../permitdesign/detailedpermit/detailedpermit.component";
import { DesigndeclinedialogComponent } from "../designdeclinedialog/designdeclinedialog.component";

export enum LISTTYPE {
  NEW,
  INDESIGN,
  COMPLETED,
  INREVIEW,
  DELIVERED,
}

export interface JobsTime {
  permit_analyst: number;
  permit_designer: number;
  prelim_analyst: number;
  prelim_designer: number;
}

@Component({
  selector: "app-designeroverview",
  templateUrl: "./designeroverview.component.html",
  styleUrls: ["./designeroverview.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class DesigneroverviewComponent implements OnInit {
  listtypes = LISTTYPE;

  placeholder = true;
  isFavorite = true;
  loggedInUser: User;
  isClient = false;
  isvianotification = false;

  isindesignslistloading = true;
  iscompleteddesignslistloading = true;
  isinreviewdesignslistloading = true;
  isdelivereddesignslistloading = true;

  ispermitindesignslistloading = true;
  ispermitcompleteddesignslistloading = true;
  ispermitinreviewdesignslistloading = true;
  ispermitdelivereddesignslistloading = true;

  //Total Count
  allindesigns: number = -1;
  allcompleteddesigns: number = -1;
  allinreviewdesigns: number = -1;
  alldelivereddesigns: number = -1;

  indesigns: number = 0;
  completeddesigns: number = 0;
  inreviewdesigns: number = 0;
  delivereddesigns: number = 0;

  indesignslist: Design[] = [];
  completeddesignslist: Design[] = [];
  inreviewdesignslist: Design[] = [];
  delivereddesignslist: Design[] = [];

  //Permit Numbers and Lists
  permitindesigns: number = 0;
  permitcompleteddesigns: number = 0;
  permitinreviewdesigns: number = 0;
  permitdelivereddesigns: number = 0;

  permitindesignslist: Design[] = [];
  permitcompleteddesignslist: Design[] = [];
  permitinreviewdesignslist: Design[] = [];
  permitdelivereddesignslist: Design[] = [];

  listactionindex = 0;
  istabchangeevent = false;
  selectedtabindex = 0;

  // @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  chatusers: User[] = [];
  requesttype;
  surveydetails: any;
  prelimDesign: any;

  timer: number = 0;
  intervalId: any;
  display: string = "0h : 0m : 0s";
  hour: number = 0;
  minutes: number = 0;
  job: JobsTiming = null;
  disablestartbutton: boolean = false;
  joboverduetotaltime: any;
  jobtime: JobsTime;
  totalminutes: number;
  prelimdesigner: number;
  permitdesigner: number;
  seconds: number = 0;

  constructor(
    public dialog: MatDialog,
    private viewportScroller: ViewportScroller,
    private notifyService: NotificationService,
    public genericService: GenericService,
    public designService: DesignService,
    public authService: AuthenticationService,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private surveyService: SurveyService,
    private loaderservice: LoaderService,
    private db: AngularFireDatabase,
  ) {
    this.loggedInUser = authService.currentUserValue.user;
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id != 232) ||
      (this.loggedInUser.role.id == ROLES.TeamHead &&
        this.loggedInUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }

    this.joboverduetotaltime = this.db.object("tasktimings").valueChanges().subscribe((result: JobsTime) => {
      this.jobtime = result;
      console.log(this.jobtime)
    });
    // this.jobtime = this.joboverduetotaltime.valueChanges();
    // this.jobtime.subscribe(
    //   (res) => {
    //     console.log(res);
    //     // this.newpermitscount = res.count;
    //     changeDetectorRef.detectChanges();
    //   }
    //   // (err) => console.log(err),
    //   // () => console.log("done!")
    // );
  }

  ngOnInit(): void {
    this.eventEmitterService.newnotificationreceived.subscribe(() => {
      this.isvianotification = true;
      this.fetchInDesigningDesignsData();
    });
    // this.getJobTime();
    // this.startTimer();
  }

  ngAfterViewInit(): void {
    this.fetchAllDesignsCount();
  }

  gotoSection(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }

  activitybarToggle(design: Design, event: Event): void {
    event.stopPropagation();
    this.activitybarOpen(design);
  }

  activitybarOpen(design: Design): void {
    this.eventEmitterService.onActivityBarButtonClick(design.id, true);
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.add("activitybar-open");
    $activitybar.classList.remove("activitybar-close");
  }

  activitybarClose(): void {
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.remove("activitybar-open");
    $activitybar.classList.add("activitybar-close");
  }

  onChatButtonClick(design: Design, event: Event): void {
    event.stopPropagation();
    this.activitybarClose();
    let GUID = design.chatid;
    this.genericService.setSelectedChatGroupID(GUID);
    /*  this.genericService.backroute = "/home/dashboard/overview/designer";
    this.router.navigate(['/home/inbox/messages']);
    this.eventEmitterService.onSidebarRouteChange("Inbox"); */
    this._snackBar.openFromComponent(ChatdialogComponent, {
      data: "element",
      panelClass: ["chatdialog"],
    });
  }

  removeItemFromList(type: LISTTYPE, record: Design): void {
    switch (type) {
      case LISTTYPE.INDESIGN:
        this.listactionindex = this.indesignslist.indexOf(record);
        this.indesigns -= 1;
        this.indesignslist.splice(this.listactionindex, 1);
        this.indesignslist = [...this.indesignslist];
        this.indesignslist = this.fillinDynamicData(this.indesignslist);
        break;
      case LISTTYPE.COMPLETED:
        this.listactionindex = this.completeddesignslist.indexOf(record);
        this.completeddesigns -= 1;
        this.completeddesignslist.splice(this.listactionindex, 1);
        this.completeddesignslist = [...this.completeddesignslist];
        this.completeddesignslist = this.fillinDynamicData(
          this.completeddesignslist
        );
        break;
      case LISTTYPE.INREVIEW:
        this.listactionindex = this.inreviewdesignslist.indexOf(record);
        this.inreviewdesigns -= 1;
        this.inreviewdesignslist.splice(this.listactionindex, 1);
        this.inreviewdesignslist = [...this.inreviewdesignslist];
        this.inreviewdesignslist = this.fillinDynamicData(
          this.inreviewdesignslist
        );
        break;
      case LISTTYPE.DELIVERED:
        this.listactionindex = this.delivereddesignslist.indexOf(record);
        this.delivereddesigns -= 1;
        this.delivereddesignslist.splice(this.listactionindex, 1);
        this.delivereddesignslist = [...this.delivereddesignslist];
        this.delivereddesignslist = this.fillinDynamicData(
          this.delivereddesignslist
        );
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  removeItemFromPermitList(type: LISTTYPE, record: Design): void {
    switch (type) {
      case LISTTYPE.INDESIGN:
        this.listactionindex = this.permitindesignslist.indexOf(record);
        this.permitindesigns -= 1;
        this.permitindesignslist.splice(this.listactionindex, 1);
        this.permitindesignslist = [...this.permitindesignslist];
        this.permitindesignslist = this.fillinDynamicData(
          this.permitindesignslist
        );
        break;
      case LISTTYPE.COMPLETED:
        this.listactionindex = this.permitcompleteddesignslist.indexOf(record);
        this.permitcompleteddesigns -= 1;
        this.permitcompleteddesignslist.splice(this.listactionindex, 1);
        this.permitcompleteddesignslist = [...this.permitcompleteddesignslist];
        this.permitcompleteddesignslist = this.fillinDynamicData(
          this.permitcompleteddesignslist
        );
        break;
      case LISTTYPE.INREVIEW:
        this.listactionindex = this.permitinreviewdesignslist.indexOf(record);
        this.permitinreviewdesigns -= 1;
        this.permitinreviewdesignslist.splice(this.listactionindex, 1);
        this.permitinreviewdesignslist = [...this.permitinreviewdesignslist];
        this.permitinreviewdesignslist = this.fillinDynamicData(
          this.permitinreviewdesignslist
        );
        break;
      case LISTTYPE.DELIVERED:
        this.listactionindex = this.permitdelivereddesignslist.indexOf(record);
        this.permitdelivereddesigns -= 1;
        this.permitdelivereddesignslist.splice(this.listactionindex, 1);
        this.permitdelivereddesignslist = [...this.permitdelivereddesignslist];
        this.permitdelivereddesignslist = this.fillinDynamicData(
          this.permitdelivereddesignslist
        );
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  updateItemInList(type: LISTTYPE, record: Design, newrecord: Design): void {
    switch (type) {
      case LISTTYPE.INDESIGN:
        this.listactionindex = this.indesignslist.indexOf(record);
        this.indesignslist.splice(this.listactionindex, 1, newrecord);
        this.indesignslist = [...this.indesignslist];
        this.indesignslist = this.fillinDynamicData(this.indesignslist);
        break;
      case LISTTYPE.COMPLETED:
        this.listactionindex = this.completeddesignslist.indexOf(record);
        this.completeddesignslist.splice(this.listactionindex, 1, newrecord);
        this.completeddesignslist = [...this.completeddesignslist];
        this.completeddesignslist = this.fillinDynamicData(
          this.completeddesignslist
        );
        break;
      case LISTTYPE.INREVIEW:
        this.listactionindex = this.inreviewdesignslist.indexOf(record);
        this.inreviewdesignslist.splice(this.listactionindex, 1, newrecord);
        this.inreviewdesignslist = [...this.inreviewdesignslist];
        this.inreviewdesignslist = this.fillinDynamicData(
          this.inreviewdesignslist
        );
        break;
      case LISTTYPE.DELIVERED:
        this.listactionindex = this.delivereddesignslist.indexOf(record);
        this.delivereddesignslist.splice(this.listactionindex, 1, newrecord);
        this.delivereddesignslist = [...this.delivereddesignslist];
        this.delivereddesignslist = this.fillinDynamicData(
          this.delivereddesignslist
        );
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  updateItemInPermitList(
    type: LISTTYPE,
    record: Design,
    newrecord: Design
  ): void {
    switch (type) {
      case LISTTYPE.INDESIGN:
        this.listactionindex = this.permitindesignslist.indexOf(record);
        this.permitindesignslist.splice(this.listactionindex, 1, newrecord);
        this.permitindesignslist = [...this.permitindesignslist];
        this.permitindesignslist = this.fillinDynamicData(
          this.permitindesignslist
        );
        break;
      case LISTTYPE.COMPLETED:
        this.listactionindex = this.permitcompleteddesignslist.indexOf(record);
        this.permitcompleteddesignslist.splice(
          this.listactionindex,
          1,
          newrecord
        );
        this.permitcompleteddesignslist = [...this.permitcompleteddesignslist];
        this.permitcompleteddesignslist = this.fillinDynamicData(
          this.permitcompleteddesignslist
        );
        break;
      case LISTTYPE.INREVIEW:
        this.listactionindex = this.permitinreviewdesignslist.indexOf(record);
        this.permitinreviewdesignslist.splice(
          this.listactionindex,
          1,
          newrecord
        );
        this.permitinreviewdesignslist = [...this.permitinreviewdesignslist];
        this.permitinreviewdesignslist = this.fillinDynamicData(
          this.permitinreviewdesignslist
        );
        break;
      case LISTTYPE.DELIVERED:
        this.listactionindex = this.permitdelivereddesignslist.indexOf(record);
        this.permitdelivereddesignslist.splice(
          this.listactionindex,
          1,
          newrecord
        );
        this.permitdelivereddesignslist = [...this.permitdelivereddesignslist];
        this.permitdelivereddesignslist = this.fillinDynamicData(
          this.permitdelivereddesignslist
        );
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  addItemToList(type: LISTTYPE, newrecord: Design): void {
    switch (type) {
      case LISTTYPE.INDESIGN:
        this.indesignslist.splice(0, 0, newrecord);
        this.indesignslist = [...this.indesignslist];
        this.indesigns = this.indesignslist.length;
        this.indesignslist = this.fillinDynamicData(this.indesignslist);
        break;
      case LISTTYPE.COMPLETED:
        this.completeddesignslist.splice(0, 0, newrecord);
        this.completeddesignslist = [...this.completeddesignslist];
        this.completeddesigns = this.completeddesignslist.length;
        this.completeddesignslist = this.fillinDynamicData(
          this.completeddesignslist
        );
        break;
      case LISTTYPE.INREVIEW:
        this.inreviewdesignslist.splice(0, 0, newrecord);
        this.inreviewdesignslist = [...this.inreviewdesignslist];
        this.inreviewdesigns = this.inreviewdesignslist.length;
        this.inreviewdesignslist = this.fillinDynamicData(
          this.inreviewdesignslist
        );
        break;
      case LISTTYPE.DELIVERED:
        this.delivereddesignslist.splice(0, 0, newrecord);
        this.delivereddesignslist = [...this.delivereddesignslist];
        this.delivereddesigns = this.delivereddesignslist.length;
        this.delivereddesignslist = this.fillinDynamicData(
          this.delivereddesignslist
        );
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  addItemToPermitList(type: LISTTYPE, newrecord: Design): void {
    switch (type) {
      case LISTTYPE.INDESIGN:
        this.permitindesignslist.splice(0, 0, newrecord);
        this.permitindesignslist = [...this.permitindesignslist];
        this.permitindesigns = this.permitindesignslist.length;
        this.permitindesignslist = this.fillinDynamicData(
          this.permitindesignslist
        );
        break;
      case LISTTYPE.COMPLETED:
        this.permitcompleteddesignslist.splice(0, 0, newrecord);
        this.permitcompleteddesignslist = [...this.permitcompleteddesignslist];
        this.permitcompleteddesigns = this.permitcompleteddesignslist.length;
        this.permitcompleteddesignslist = this.fillinDynamicData(
          this.permitcompleteddesignslist
        );
        break;
      case LISTTYPE.INREVIEW:
        this.permitinreviewdesignslist.splice(0, 0, newrecord);
        this.permitinreviewdesignslist = [...this.permitinreviewdesignslist];
        this.permitinreviewdesigns = this.permitinreviewdesignslist.length;
        this.permitinreviewdesignslist = this.fillinDynamicData(
          this.permitinreviewdesignslist
        );
        break;
      case LISTTYPE.DELIVERED:
        this.permitdelivereddesignslist.splice(0, 0, newrecord);
        this.permitdelivereddesignslist = [...this.permitdelivereddesignslist];
        this.permitdelivereddesigns = this.permitdelivereddesignslist.length;
        this.permitdelivereddesignslist = this.fillinDynamicData(
          this.permitdelivereddesignslist
        );
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  openDesignDetailDialog(design: Design, index): void {
    this.activitybarClose();
    this.listactionindex = index;
    if (design.requesttype == "prelim") {
      this.fetchDesignDetails(design);
    } else {
      this.fetchPermitDesignDetails(design);
    }
  }

  fetchDesignDetails(design: Design): void {
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openPrelimDesignDetailDialog(response);
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchPermitDesignDetails(design: Design): void {
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        if (response.survey != null) {
          this.fetchSurveyDetails(response);
        } else {
          this.openPermitDesignDetailDialog(response);
        }
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchSurveyDetails(design: Design): void {
    this.activitybarClose();
    // let triggerEditEvent = false;

    if (design.createdby.minpermitdesignaccess) {
      if (design.issurveycompleted && design.survey != null) {
        this.surveyService.getSurveyDetails(design.survey.id).subscribe(
          (response) => {
            this.surveydetails = response;
            if (this.surveydetails.prelimdesignsurvey != null) {
              this.designService
                .getDesignDetails(this.surveydetails.prelimdesignsurvey.id)
                .subscribe((response) => {
                  this.prelimDesign = response;
                  this.openPermitDesignDetailDialog(design);
                });
            } else {
              this.openPermitDesignDetailDialog(design);
            }
          }
        );
      } else {
        this.surveydetails = null;
        this.openPermitDesignDetailDialog(design);
      }
    }
  }

  openPrelimDesignDetailDialog(design: Design): void {
    let triggerEditEvent = false;
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: { prelim: design, triggerEditEvent: triggerEditEvent, job: this.job },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.refreshDashboard) {
        this.fetchAllDesignsCount();
        // this.getJobTime();
      }
    });
  }

  openPermitDesignDetailDialog(design: Design): void {
    this.activitybarClose();
    var triggerEditEvent = false;
    /*   if(design.jobtype=='pv'){
        this.openDetailedPermitDesignDetailDialog(design,type)
      } */
    if (design.createdby.minpermitdesignaccess) {
      const dialogRef = this.dialog.open(MasterdetailpageComponent, {
        width: "80%",
        disableClose: true,
        autoFocus: false,
        data: {
          permit: design,
          triggerPermitEditEvent: triggerEditEvent,
          triggerDeleteEvent: false,
          survey: this.surveydetails,
          prelim: this.prelimDesign,
          job: this.job
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.prelimDesign = null;
        this.surveydetails = null;
        this._snackBar.dismiss();
        if (result.refreshDashboard) {
          this.fetchAllDesignsCount();
          // this.getJobTime();
        }
      });
    }
  }

  // openDetailedPermitDesignDetailDialog(design: Design): void {
  //   this.activitybarClose();
  //   let triggerEditEvent = true;
  //   const dialogRef = this.dialog.open(DetailedpermitComponent, {
  //     width: "95%",
  //     maxWidth: "95%",
  //     autoFocus: false,
  //     disableClose: true,
  //     data: { design: design, isDesignerFillMode: triggerEditEvent },
  //   });

  //   dialogRef.afterClosed().subscribe(() => {
  //     this._snackBar.dismiss();
  //     // if (result.refreshDashboard) {

  //     // }
  //   });
  // }

  fetchAllDesignsCount(): void {
    this.genericService.setRequiredHeaders();
    this.designService.getDesignsCount().subscribe(
      (response) => {
        this.allindesigns = response["indesigning"];
        this.allcompleteddesigns = response["completed"];
        this.allinreviewdesigns = response["inreviewdesign"];
        this.alldelivereddesigns = response["delivered"];
        this.changeDetectorRef.detectChanges();
        switch (this.selectedtabindex) {
          case 0:
            this.getJobTime();
            this.fetchInDesigningDesignsData();
            this.fetchInDesigningPermitDesignsData();
            break;
          case 1:
            this.fetchCompletedDesignsData();
            break;
          case 2:
            this.getJobTime();
            this.fetchInReviewDesignsData();
            break;
          case 3:
            this.fetchDeliveredDesignsData();
            break;

          default:
            break;
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  maintabchange(tabChangeEvent: MatTabChangeEvent): void {
    this.istabchangeevent = true;
    this.selectedtabindex = tabChangeEvent.index;
    this.fetchAllDesignsCount();
    switch (tabChangeEvent.index) {
      case 0:
        this.isindesignslistloading = true;
        this.ispermitindesignslistloading = true;
        this.fetchInDesigningDesignsData();
        break;
      case 1:
        this.iscompleteddesignslistloading = true;
        this.ispermitcompleteddesignslistloading = true;
        this.fetchCompletedDesignsData();
        break;
      case 2:
        this.isinreviewdesignslistloading = true;
        this.ispermitinreviewdesignslistloading = true;
        this.fetchInReviewDesignsData();
        break;
      case 3:
        this.isdelivereddesignslistloading = true;
        this.ispermitdelivereddesignslistloading = true;
        this.fetchDeliveredDesignsData();
        break;

      default:
        break;
    }
  }

  fetchInDesigningDesignsData(): void {
    this.designService
      .getFilteredDesigns("requesttype=prelim&status=designassigned")
      .subscribe(
        (response) => {
          this.indesigns = response.length;
          this.indesignslist = this.fillinDynamicData(response);
          this.isindesignslistloading = false;
          this.changeDetectorRef.detectChanges();
          if (!this.isvianotification) {
            this.fetchCompletedDesignsData();
          }
          this.startAllTimers();
          if (this.istabchangeevent) {
            this.fetchInDesigningPermitDesignsData();
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchCompletedDesignsData(): void {
    this.designService
      .getFilteredDesigns("requesttype=prelim&status=designcompleted")
      .subscribe(
        (response) => {
          this.completeddesigns = response.length;
          this.completeddesignslist = this.fillinDynamicData(response);
          this.iscompleteddesignslistloading = false;
          this.changeDetectorRef.detectChanges();
          if (this.istabchangeevent) {
            this.fetchCompletedPermitDesignsData();
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchInReviewDesignsData(): void {
    this.designService
      .getFilteredDesigns(
        "requesttype=prelim&status=reviewassigned&status=reviewfailed&status=reviewpassed"
      )
      .subscribe(
        (response) => {
          this.inreviewdesigns = response.length;
          this.inreviewdesignslist = this.fillinDynamicData(response);
          this.isinreviewdesignslistloading = false;
          this.changeDetectorRef.detectChanges();
          if (this.istabchangeevent) {
            this.fetchInReviewPermitDesignsData();
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchDeliveredDesignsData(): void {
    this.designService
      .getFilteredDesigns("requesttype=prelim&status=delivered")
      .subscribe(
        (response) => {
          this.delivereddesigns = response.length;
          this.delivereddesignslist = this.fillinDynamicData(response);
          this.isdelivereddesignslistloading = false;
          this.changeDetectorRef.detectChanges();
          if (this.istabchangeevent) {
            this.fetchDeliveredPermitDesignsData();
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchInDesigningPermitDesignsData(): void {
    this.designService
      .getFilteredDesigns("requesttype=permit&status=designassigned")
      .subscribe(
        (response) => {
          this.permitindesigns = response.length;
          this.permitindesignslist = this.fillinDynamicData(response);
          this.ispermitindesignslistloading = false;
          this.changeDetectorRef.detectChanges();
          this.startAllPermitTimers();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchCompletedPermitDesignsData(): void {
    this.designService
      .getFilteredDesigns("requesttype=permit&status=designcompleted")
      .subscribe(
        (response) => {
          this.permitcompleteddesigns = response.length;
          this.permitcompleteddesignslist = this.fillinDynamicData(response);
          this.ispermitcompleteddesignslistloading = false;
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchInReviewPermitDesignsData(): void {
    this.designService
      .getFilteredDesigns(
        "requesttype=permit&status=reviewassigned&status=reviewfailed&status=reviewpassed"
      )
      .subscribe(
        (response) => {
          this.permitinreviewdesigns = response.length;
          this.permitinreviewdesignslist = this.fillinDynamicData(response);
          this.ispermitinreviewdesignslistloading = false;
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchDeliveredPermitDesignsData(): void {
    this.designService
      .getFilteredDesigns("requesttype=permit&status=delivered")
      .subscribe(
        (response) => {
          this.permitdelivereddesigns = response.length;
          this.permitdelivereddesignslist = this.fillinDynamicData(response);
          this.ispermitdelivereddesignslistloading = false;
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fillinDynamicData(records: Design[]): Design[] {
    records.forEach((element) => {
      element.designcurrentstatus = this.genericService.getDesignStatusName(
        element.status
      );
      if (element.status != "delivered") {
        element.isoverdue = this.genericService.isDatePassed(
          element.expecteddeliverydate
        );
      } else {
        element.isoverdue = false;
      }
      element.lateby = this.genericService.getTheLatebyString(
        element.expecteddeliverydate
      );
      element.recordupdatedon = this.genericService.formatDateInTimeAgo(
        element.updated_at
      );
      element.formattedjobtype = this.genericService.getJobTypeName(
        element.jobtype
      );

      //Code to fetch unread message count
      /*  CometChat.getUnreadMessageCountForGroup(element.chatid).then(
        array => {
          if (array[element.chatid] != undefined) {
            element.unreadmessagecount = array[element.chatid];
            this.changeDetectorRef.detectChanges();
          } else {
            element.unreadmessagecount = 0;
            this.changeDetectorRef.detectChanges();
          }
        },
        error => {
        }
      ); */
    });

    return records;
  }

  updateDesignStatus(
    designid: number,
    designstatus: string,
    message: string
  ): void {
    event.stopPropagation();
    this.activitybarClose();
    const postData = {
      status: designstatus,
    };

    this.designService.editDesign(designid, postData).subscribe(
      () => {
        this.notifyService.showSuccess(message, "Success");
        this.fetchAllDesignsCount();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  startAllTimers(): void {
    this.indesignslist.forEach((element) => {
      let reviewdate = new Date(element.designstarttime);
      reviewdate.setHours(reviewdate.getHours() + 2);
      element.designremainingtime = this.genericService.getRemainingTime(
        reviewdate.toString()
      );
    });
  }

  startAllPermitTimers(): void {
    this.permitindesignslist.forEach((element) => {
      let reviewdate = new Date(element.designstarttime);
      reviewdate.setHours(reviewdate.getHours() + 6);
      element.designremainingtime = this.genericService.getRemainingTime(
        reviewdate.toString()
      );
    });
  }

  downloadPermitDesign(design: Design, event: Event) {
    event.stopPropagation();
    this.designService.downloadPermitDesign(design.id).subscribe(response => {
      console.log(response)
      this.downloadPermitPdf(response);
    })
  }

  downloadPermitPdf(value) {
    console.log(value);
    var fileurl = value.message.url;
    var filename = value.message.hash + value.message.ext;
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
    // const url = value.data;
    // return FileSaver.saveAs(url);
  }
  declineDesignRequest(design: Design, event: Event, index: number, type: LISTTYPE, action) {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openDesignDeclineDialog(design, type, action);
  }

  openDesignDeclineDialog(record: Design, type: LISTTYPE, action): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesigndeclinedialogComponent, {
      width: "50%",
      disableClose: true,
      data: { design: record, action: action, istimerstart: this.disablestartbutton },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        if (type == LISTTYPE.INDESIGN) {
          this.removeItemFromList(LISTTYPE.INDESIGN, record)
        }
        else if (type == LISTTYPE.COMPLETED) {
          this.removeItemFromList(LISTTYPE.COMPLETED, record);
        }
        else if (type == LISTTYPE.INREVIEW) {
          this.removeItemFromList(LISTTYPE.INREVIEW, record);
        }
        // this.addItemToPermitList(LISTTYPE.ONHOLD, result.design)
        this.fetchAllDesignsCount();
      }
    });
  }

  declinePermitDesignRequest(design: Design, event: Event, index: number, type: LISTTYPE, action) {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openPermitDesignDeclineDialog(design, type, action);
  }

  openPermitDesignDeclineDialog(record: Design, type: LISTTYPE, action): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesigndeclinedialogComponent, {
      width: "50%",
      disableClose: true,
      data: { design: record, action: action, istimerstart: this.disablestartbutton },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        if (type == LISTTYPE.INDESIGN) {
          this.removeItemFromPermitList(LISTTYPE.INDESIGN, record);
        } else if (type == LISTTYPE.COMPLETED) {
          this.removeItemFromPermitList(LISTTYPE.COMPLETED, record);
        } else if (type == LISTTYPE.INREVIEW) {
          this.removeItemFromPermitList(LISTTYPE.INREVIEW, record);
        }
        // this.addItemToPermitList(LISTTYPE.ONHOLD, result.design)
        this.fetchAllDesignsCount();
      }
    });
  }

  addAdditionalInformation(design, event) {
    this.loaderservice.show();
    event.stopPropagation();
    this.designService.getDesignDetails(design.id).subscribe((res) => {
      this.openAdditionalInformationDialog(res);
    })
  }
  openAdditionalInformationDialog(design) {
    const dialogRef = this.dialog.open(DetailedpermitComponent, {
      width: "95%",
      maxWidth: "95%",
      autoFocus: false,
      disableClose: true,
      data: {
        design: design,
        disableClose: true,
        triggerEditEvent: false,
        triggerDeleteEvent: false,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this._snackBar.dismiss();
      if (result.triggerEditEvent) {
        // this.openEditPermitDesignDialog(this.listtypes.NEW, design);
      }
      if (result.triggerDeleteEvent) {
        // this.removeItemFromPermitList(this.listtypes.NEW);
      }
      if (result.isdataupdated) {
        // this.updateItemInPermitList(this.listtypes.NEW, result.design);
      }
    });
  }


  startTimer(ev, design, i, value) {
    ev.stopPropagation();
    let starttime;
    // this.hour = 0;
    // this.minutes = 0;
    // this.timer = 0;
    // this.totalminutes = 0;
    this.clearTimer();
    starttime = new Date().getTime();
    // this.countDown = timer(0, this.tick).subscribe(() => this.counter++);
    // let gg = this.genericService.formatDateInBackendFormat(starttime);
    // console.log(gg)
    let postdata = {
      starttime: starttime,
      designid: design.id,
      userid: this.loggedInUser.id
    }
    this.designService.startTime(postdata).subscribe((res: JobsTiming) => {
      this.job = res;
      switch (value) {
        case "prelimindesign":
          this.indesignslist[i].newtasktimings = res;
          break;

        case "permitindesign":
          this.permitindesignslist[i].newtasktimings = res;
          break;

        case "preliminreview":
          this.inreviewdesignslist[i].newtasktimings = res;
          break;

        case "permitinreview":
          this.permitinreviewdesignslist[i].newtasktimings = res;
          break;
      }
      this.disablestartbutton = true;
      // this.totalminutes = this.minutes + (this.hour * 60);
      // this.totalminutes = this.totalminutes * 60;
      this.intervalId = setInterval(() => {
        if (this.timer >= 60) {
          this.timer = 0;
        }
        this.timer++;
        this.totalminutes++;
        // this.totalminutes = (this.totalminutes * 60) + this.timer;
        this.display = this.transform(this.timer);
        this.changeDetectorRef.detectChanges();
      }, 1000);
    }, (error) => {
      this.notifyService.showError(error, "Error");
    })
  }

  transform(value: number): string {
    let hrs = 0;
    let mins = 0;
    var sec_num = value;
    // if (type == 'start') {
    //   this.hour = Math.floor(sec_num / 3600);
    //   console.log(this.minutes)
    //   this.minutes = (Math.floor((sec_num - (this.hour * 3600)) / 60));
    //   console.log(this.minutes)
    //   sec_num - (this.hour * 3600) - (this.minutes * 60);
    // }
    // else {
    mins = Math.floor(sec_num / 60);
    this.minutes += mins;
    hrs = Math.floor(this.minutes / 60);
    this.hour += hrs;
    this.minutes = this.minutes % 60;


    // sec_num - (this.hour * 3600) - (this.minutes * 60);
    // }
    if (sec_num >= 60) {
      sec_num = 0;
    }

    return this.hour + 'h' + ' : ' + this.minutes + 'm' + ' : ' + sec_num + 's';
  }

  getJobTime() {
    let currenttime;
    let newtimer;
    let starttime;
    this.display = "0h : 0m : 0s";
    this.clearTimer();
    this.designService.getJobTime().subscribe((res) => {
      if (res.length) {
        if (res[0].taskstatus == 'pending' && !res[0].canceled) {
          this.disablestartbutton = true;
          this.job = res[0];
          // else {

          starttime = new Date(res[0].starttime).getTime();
          currenttime = new Date().getTime();
          newtimer = currenttime - starttime;
          this.seconds = Math.floor(newtimer / 1000);
          let sec: any = this.seconds;
          this.hour = Math.floor(sec / 3600);
          // sec -= this.hour * 3600;
          this.minutes = Math.floor(sec / 60);
          sec -= this.minutes * 60;
          this.minutes = this.minutes % 60;
          // sec = '' + sec;
          // sec = ('00' + sec).substring(sec.length);     
          this.totalminutes = this.seconds;
          this.intervalId = setInterval(() => {
            if (sec >= 60) {
              sec = 0;
            }
            sec++;
            this.totalminutes++;
            this.display = this.transform(sec);
            this.changeDetectorRef.detectChanges();
          }, 1000);
        }
        else {
          this.clearTimer();
        }
      }
      else {
        this.clearTimer();
      }
    }, (error) => {
      this.notifyService.showError(error, "Error");
    })
  }

  applyCardCss(i, design) {
    // let istimeexceed: boolean = false;
    this.prelimdesigner = this.jobtime?.prelim_designer * 60;
    this.permitdesigner = this.jobtime?.permit_designer * 60;
    if (design.requesttype == 'prelim') {
      // if ((design?.tasktimings?.isdesignertimeexceeded || design?.tasktimings?.isanalysttimeexceeded || this.totalminutes > this.prelimdesigner) && design?.tasktimings?.designid == design.id) {
      // if (design?.taskoverdue || (this.totalminutes > this.prelimdesigner && this.job?.designid == design.id)) {
      //   istimeexceed = true;
      // }
      // else {
      //   istimeexceed = false;
      // }
      if (i % 2 == 0) {
        if ((this.totalminutes > this.prelimdesigner && this.job?.designid == design.id) || design?.taskoverdue && !this.isClient) {
          return 'itemcard even jobtime';
        }
        else {
          return 'itemcard even';
        }
      }
      else {
        if ((this.totalminutes > this.prelimdesigner && this.job?.designid == design.id) || design?.taskoverdue && !this.isClient) {
          return 'itemcard odd jobtime';
        }
        else {
          return 'itemcard odd';
        }
      }
    }
    else {
      // if ((design?.tasktimings?.isdesignertimeexceeded || design?.tasktimings?.isanalysttimeexceeded || this.totalminutes > this.permitdesigner) && design?.tasktimings?.designid == design.id) {
      //   istimeexceed = true;
      // }
      // else {
      //   istimeexceed = false;
      // }
      if (i % 2 == 0) {
        if ((this.totalminutes > this.permitdesigner && this.job?.designid == design.id) || design?.taskoverdue && !this.isClient) {
          return 'itemcard even jobtime';
        }
        else {
          return 'itemcard even';
        }
      }
      else {
        if ((this.totalminutes > this.permitdesigner && this.job?.designid == design.id) || design?.taskoverdue && !this.isClient) {
          return 'itemcard odd jobtime';
        }
        else {
          return 'itemcard odd';
        }
      }
    }
  }

  clearTimer() {
    this.totalminutes = 0;
    this.minutes = 0;
    this.hour = 0;
    this.seconds = 0;
    this.disablestartbutton = false;
    clearInterval(this.intervalId);
    this.timer = 0;
    // this.job = new JobsTiming();
    this.job = null;
  }
}
