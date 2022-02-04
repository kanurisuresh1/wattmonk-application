import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ChatdialogComponent } from 'src/app/shared/chatdialog/chatdialog.component';
import { MasterdetailpageComponent } from 'src/app/shared/masterdetailpage/masterdetailpage.component';
import { ROLES } from 'src/app/_helpers';
import { Design, User } from 'src/app/_models';
import { JobsTiming } from 'src/app/_models/jobtiming';
import { Survey } from 'src/app/_models/survey';
import { AuthenticationService, DesignService, GenericService, LoaderService, NotificationService } from 'src/app/_services';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';
import { SurveyService } from 'src/app/_services/survey.service';
import { DetailedpermitComponent } from '../../permitdesign/detailedpermit/detailedpermit.component';
import { DesigndeclinedialogComponent } from '../designdeclinedialog/designdeclinedialog.component';

export enum LISTTYPE {
  NEW,
  INPROGRESS,
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
  selector: "app-analystoverview",
  templateUrl: "./analystoverview.component.html",
  styleUrls: ["./analystoverview.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalystoverviewComponent implements OnInit {
  listtypes = LISTTYPE;
  surveyplaceholder = true;
  isFavorite = true;
  loggedInUser: User;
  isClient = false;

  allinreviewdesigns: number = -1;
  alldelivereddesigns: number = -1;

  inreviewdesigns: number = 0;
  delivereddesigns: number = 0;

  inreviewdesignslist: Design[] = []
  delivereddesignslist: Design[] = []

  inreview: number = 0;
  delivered: number = 0;

  inreviewsurveyslist: Survey[] = [];
  deliveredsurveyslist: Survey[] = [];
  inreviewsurveys: Survey[] = [];
  deliveredsurveys: Survey[] = [];

  permitinreviewdesigns: number = 0;
  permitdelivereddesigns: number = 0;

  permitinreviewdesignslist: Design[] = []
  permitdelivereddesignslist: Design[] = []

  istabchangeevent = false;
  listactionindex = 0;
  selectedtabindex = 0;

  ispermitdelivereddesignslistloading = true;
  isdelivereddesignslistloading = true;
  ispermitinreviewdesignslistloading = true;
  isinreviewdesignslistloading = true;

  // @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  chatusers: User[] = [];
  requesttype;
  surveydetails: any;
  prelimDesign: any;

  //  timer variables
  timer: number = 0;
  istimerstart: boolean = false;
  intervalId;
  display: string = "0h : 0m : 0s";
  hour: number = 0;
  minutes: number = 0;
  job: JobsTiming = null;
  disablestartbutton: boolean = false;
  joboverduetotaltime: any;
  jobtime: JobsTime;
  totalminutes: number;
  prelimanalyst: number;
  permitanalyst: number;
  seconds: number = 0;

  constructor(public dialog: MatDialog,
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
    private db: AngularFireDatabase
  ) {
    this.loggedInUser = authService.currentUserValue.user;
    if (this.loggedInUser.role.id == ROLES.ContractorSuperAdmin || this.loggedInUser.role.id == ROLES.ContractorAdmin || this.loggedInUser.role.id == ROLES.SuccessManager || this.loggedInUser.role.id == ROLES.Master ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id != 232) || (this.loggedInUser.role.id == ROLES.TeamHead &&
          this.loggedInUser.parent.id != 232)) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }

    this.joboverduetotaltime = this.db.object("tasktimings").valueChanges().subscribe((result: JobsTime) => {
      this.jobtime = result;
      this.prelimanalyst = this.jobtime?.prelim_analyst * 60;
      this.permitanalyst = this.jobtime?.permit_analyst * 60;
    });
  }

  ngOnInit(): void {
    this.requesttype = "";
    // this.getJobTime();
    this.fetchAllDesignsCount();
    this.fetchAllSurveysCount();
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
  surveyactivitybarToggle(survey: Survey, event: Event): void {
    event.stopPropagation();
    this.surveyactivitybarOpen(survey);
  }

  surveyactivitybarOpen(survey: Survey): void {
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

  onChatButtonClick(design: Design, event: Event): void {
    event.stopPropagation();
    this.activitybarClose();
    const GUID = design.chatid;
    this.genericService.setSelectedChatGroupID(GUID);
    /* this.genericService.backroute = "/home/dashboard/overview/analyst";
    this.router.navigate(['/home/inbox/messages']);
    this.eventEmitterService.onSidebarRouteChange("Inbox"); */
    this._snackBar.openFromComponent(ChatdialogComponent, {
      data: "element",
      panelClass: ["chatdialog"]
    });
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
          this.fetchSurveyData(response);
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

  fetchSurveyData(design: Design): void {
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
                });
            } else {
              this.openPermitDesignDetailDialog(design);
            }
          },
          () => {
            // do nothing.
          }
        );
      } else {
        this.surveydetails = null;
      }
    }
  }
  openPrelimDesignDetailDialog(design: Design): void {
    const triggerEditEvent = false;
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
    const triggerEditEvent = false;
    if (design.createdby.minpermitdesignaccess) {
      const dialogRef = this.dialog.open(MasterdetailpageComponent, {
        width: "80%",
        disableClose: true,
        autoFocus: false,
        data: { permit: design, triggerPermitEditEvent: triggerEditEvent, survey: this.surveydetails, prelim: this.prelimDesign, job: this.job }
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.surveydetails = null;
        this.prelimDesign = null;
        this._snackBar.dismiss();
        if (result.refreshDashboard) {
          this.fetchAllDesignsCount();
          // this.getJobTime();
        }
      });
    }
  }

  fetchAllDesignsCount(): void {
    this.designService.getDesignsCount().subscribe(
      (response) => {
        this.allinreviewdesigns = response["inreviewdesign"];
        this.alldelivereddesigns = response["delivered"];
        switch (this.selectedtabindex) {
          case 0:
            this.getJobTime();
            this.fetchInReviewDesignsData();
            break;
          case 1:
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
        this.isinreviewdesignslistloading = true;
        this.ispermitinreviewdesignslistloading = true;
        this.fetchInReviewDesignsData();
        break;
      case 1:
        this.isdelivereddesignslistloading = true;
        this.ispermitdelivereddesignslistloading = true;
        this.fetchDeliveredDesignsData();
        break;

      default:
        break;
    }
  }


  fetchInReviewDesignsData(): void {
    this.designService.getFilteredDesigns
      ("requesttype=prelim&status=reviewassigned&status=reviewfailed&status=reviewpassed").subscribe(
        response => {
          this.inreviewdesigns = response.length;
          this.inreviewdesignslist = this.fillinDynamicData(response);
          this.isinreviewdesignslistloading = false;
          this.changeDetectorRef.detectChanges();
          this.startAllTimers();
          this.fetchInReviewPermitDesignsData();
        },
        error => {
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
          this.fetchDeliveredPermitDesignsData();
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
          this.startAllPermitTimers();
          this.fetchDeliveredPermitDesignsData();
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
          this.changeDetectorRef.detectChanges();
          this.ispermitdelivereddesignslistloading = false;
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
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

  fillinDynamicData(records: Design[]): Design[] {
    records.forEach(element => {
      element.designcurrentstatus = this.genericService.getDesignStatusName(element.status);
      if (element.status != "delivered") {
        element.isoverdue = this.genericService.isDatePassed(element.expecteddeliverydate);
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
           if(array[element.chatid] != undefined){
             element.unreadmessagecount = array[element.chatid];
             this.changeDetectorRef.detectChanges();
           }else{
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

  fillinDynamicSurveyData(records: Survey[]): Survey[] {
    records.forEach(element => {
      element.currentstatus = this.genericService.getSurveyStatusName(element.status);
      if (element.status != "delivered") {
        element.isoverdue = this.genericService.isDatePassed(element.datetime);
      } else {
        element.isoverdue = false;
      }
      element.formattedtime = this.genericService.formatTimeInDisplayFormat(element.datetime);
      element.formattedupdatedat = this.genericService.formatDateInTimeAgo(element.updated_at);
      element.formattedjobtype = this.genericService.getJobTypeName(element.jobtype);
    });

    return records;
  }

  startAllTimers(): void {
    this.inreviewdesignslist.forEach((element) => {
      const reviewdate = new Date(element.reviewstarttime);
      reviewdate.setMinutes(reviewdate.getMinutes() + 15);
      element.reviewremainingtime = this.genericService.getRemainingTime(
        reviewdate.toString()
      );
    });
  }

  startAllPermitTimers(): void {
    this.permitinreviewdesignslist.forEach((element) => {
      const reviewdate = new Date(element.reviewstarttime);
      reviewdate.setHours(reviewdate.getHours() + 2);
      element.reviewremainingtime = this.genericService.getRemainingTime(
        reviewdate.toString()
      );
    });
  }

  fetchAllSurveysCount(): void {
    this.surveyService.getSurveysCount().subscribe(
      (response) => {
        if (response > 0) {
          this.surveyplaceholder = false;
          this.fetchInReviewSurveysData();
        } else {
          this.surveyplaceholder = true;
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchInReviewSurveysData(): void {
    this.surveyService.getFilteredSurveys("status=reviewassigned&status=reviewpassed&status=reviewfailed").subscribe(
      response => {

        this.inreview = response.length;
        this.inreviewsurveys = this.fillinDynamicSurveyData(response);
        this.inreviewsurveyslist = this.classifySurveysListData(this.inreviewsurveys);
        this.changeDetectorRef.detectChanges();
        this.fetchDeliveredSurveysData();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchDeliveredSurveysData(): void {
    this.surveyService.getFilteredSurveys("status=delivered").subscribe(
      (response) => {
        this.delivered = response.length;
        this.deliveredsurveys = this.fillinDynamicSurveyData(response);
        this.deliveredsurveyslist = this.classifySurveysListData(
          this.deliveredsurveys
        );
        this.changeDetectorRef.detectChanges();
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

  declineDesignRequest(design: Design, event: Event, index: number, type: LISTTYPE, action): void {
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
        if (type == LISTTYPE.INREVIEW) {
          this.removeItemFromList(LISTTYPE.INREVIEW);
        }
        // this.addItemToPermitList(LISTTYPE.ONHOLD, result.design)
        this.fetchAllDesignsCount();
      }
    });
  }

  removeItemFromList(type: LISTTYPE): void {
    switch (type) {
      case LISTTYPE.INREVIEW:
        this.inreviewdesigns -= 1;
        this.inreviewdesignslist.splice(this.listactionindex, 1);
        this.inreviewdesignslist = [...this.inreviewdesignslist];
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  declinePermitDesignRequest(design: Design, event: Event, index: number, type: LISTTYPE, action): void {
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
        if (type == LISTTYPE.INREVIEW) {
          this.removeItemFromPermitList(LISTTYPE.INREVIEW);
        }
        // this.addItemToPermitList(LISTTYPE.ONHOLD, result.design)
        this.fetchAllDesignsCount();
      }
    });
  }

  removeItemFromPermitList(type: LISTTYPE): void {
    switch (type) {
      case LISTTYPE.INREVIEW:
        this.permitinreviewdesigns -= 1;
        this.permitinreviewdesignslist.splice(this.listactionindex, 1);
        this.permitinreviewdesignslist = [...this.permitinreviewdesignslist];
        break;
    }
    this.changeDetectorRef.detectChanges();
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
  /*  TIMER   */
  startTimer(ev, design, i) {
    ev.stopPropagation();
    let starttime;
    // this.totalminutes = 0;
    // this.hour = 0;
    // this.minutes = 0;
    // this.timer = 0;
    this.clearTimer();
    starttime = new Date().getTime();
    // this.countDown = timer(0, this.tick).subscribe(() => this.counter++);
    let postdata = {
      starttime: starttime,
      designid: design.id,
      userid: this.loggedInUser.id
    }
    this.designService.startTime(postdata).subscribe((res: JobsTiming) => {
      this.job = res;
      if (design.requesttype == 'prelim') {
        this.inreviewdesignslist[i].newtasktimings = res;
      }
      else if (design.requesttype == 'permit') {
        this.permitinreviewdesignslist[i].newtasktimings = res;
      }
      this.disablestartbutton = true;
      this.istimerstart = true;
      // this.totalminutes = this.minutes + (this.hour * 60);
      // this.totalminutes = (this.totalminutes * 60) + this.timer;
      this.intervalId = setInterval(() => {
        if (this.timer >= 60) {
          this.timer = 0;
        }
        this.timer++;
        this.totalminutes++;
        this.display = this.transform(this.timer);
        this.changeDetectorRef.detectChanges();
      }, 1000);
    },
      (error) => {
        this.notifyService.showError(error, "Error");
      })
  }

  transform(value: number): string {
    let hrs = 0;
    let mins = 0;
    var sec_num = value;
    // hrs = Math.floor(sec_num / 3600);
    mins = Math.floor(sec_num / 60);
    this.minutes += mins;
    hrs = Math.floor(this.minutes / 60);
    this.hour += hrs;
    this.minutes = this.minutes % 60;

    // this.hour += hrs;
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
          // this.totalminutes = this.minutes;
          sec -= this.minutes * 60;
          this.minutes = this.minutes % 60;
          sec = '' + sec;
          sec = ('00' + sec).substring(sec.length);
          this.totalminutes = this.seconds;
          // this.totalminutes = this.minutes + (this.hour * 60);
          // this.totalminutes = (this.totalminutes * 60) + sec;
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
    },
      (error) => {
        this.notifyService.showError(error, "Error");
      })
  }

  applyCardCss(i, design) {
    // let istimeexceed: boolean = false;
    if (design?.requesttype == 'prelim') {
      if (i % 2 == 0) {
        // if ((design?.tasktimings?.isdesignertimeexceeded || design?.tasktimings?.isanalysttimeexceeded || this.totalminutes > this.prelimanalyst) && design?.tasktimings?.designid == design.id) {
        //   istimeexceed = true;
        // }
        // else {
        //   istimeexceed = false;
        // }
        if ((this.totalminutes > this.prelimanalyst && this.job?.designid == design.id) || design?.taskoverdue && !this.isClient) {
          return 'itemcard even jobtime';
        }
        else {
          return 'itemcard even';
        }
      }
      else {
        if ((this.totalminutes > this.prelimanalyst && this.job?.designid == design.id) || design?.taskoverdue && !this.isClient) {
          return 'itemcard odd jobtime';
        }
        else {
          return 'itemcard odd';
        }
      }
    }
    else {
      // if ((design?.tasktimings?.isdesignertimeexceeded || design?.tasktimings?.isanalysttimeexceeded || this.totalminutes > this.permitanalyst) && design?.tasktimings?.designid == design.id) {
      //   istimeexceed = true;
      // }
      // else {
      //   istimeexceed = false;
      // }
      if (i % 2 == 0) {
        if ((this.totalminutes > this.permitanalyst && this.job?.designid == design.id) || design?.taskoverdue && !this.isClient) {
          return 'itemcard even jobtime';
        }
        else {
          return 'itemcard even';
        }
      }
      else {
        if ((this.totalminutes > this.permitanalyst && this.job?.designid == design.id) || design?.taskoverdue && !this.isClient) {
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
