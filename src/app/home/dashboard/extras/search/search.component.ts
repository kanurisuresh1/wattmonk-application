import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatInput } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import axios from "axios";
import * as moment from "moment";
import { ChatdialogComponent } from "src/app/shared/chatdialog/chatdialog.component";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { ROLES } from "src/app/_helpers";
import { Design, Pestamp, User } from "src/app/_models";
import { Analyst, Peengineer } from "src/app/_models/company";
import { JobsTiming } from "src/app/_models/jobtiming";
import { Survey } from "src/app/_models/survey";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  LoaderService,
  NotificationService,
  PestampService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { SurveyService } from "src/app/_services/survey.service";
import { TeamService } from "src/app/_services/team.service";
import { DesigndeclinedialogComponent } from "../../overview/designdeclinedialog/designdeclinedialog.component";
import { AddminpermitdesigndialogComponent } from "../../permitdesign/addminpermitdesigndialog/addminpermitdesigndialog.component";
import { permitDesignResendDialog } from "../../permitdesign/design/design.component";
import { DetailedpermitComponent } from "../../permitdesign/detailedpermit/detailedpermit.component";
import { OrderpermitdesigndialogComponent } from "../../permitdesign/orderpermitdesigndialog/orderpermitdesigndialog.component";
import { SharepermitdesigndialogComponent } from "../../permitdesign/sharepermitdesigndialog/sharepermitdesigndialog.component";
import { AddpestampdialogComponent } from "../../pestamp/addpestampdialog/addpestampdialog.component";
import { AssignpeengineersComponent } from "../../pestamp/assignpeengineers/assignpeengineers.component";
import { OrderpestampsdialogComponent } from "../../pestamp/orderpestampsdialog/orderpestampsdialog.component";
import {
  PestampDeclineDialog,
  PestampResendDialog
} from "../../pestamp/pestamp/pestamp.component";
import { AdddesigndialogComponent } from "../../prelimdesign/adddesigndialog/adddesigndialog.component";
import { AddprelimproposaldialogComponent } from "../../prelimdesign/addprelimproposaldialog/addprelimproposaldialog.component";
import { AssigndesigndialogComponent } from "../../prelimdesign/assigndesigndialog/assigndesigndialog.component";
import {
  DesignDeliverDialog,
  DesignResendDialog
} from "../../prelimdesign/design/design.component";
import { OrderprelimdesigndialogComponent } from "../../prelimdesign/orderprelimdesigndialog/orderprelimdesigndialog.component";
import { ShareprelimdesigndialogComponent } from "../../prelimdesign/shareprelimdesigndialog/shareprelimdesigndialog.component";
import { AssignreviewerdialogComponent } from "../../qualitycheck/assignreviewerdialog/assignreviewerdialog.component";
import { AddsurveydialogComponent } from "../../survey/addsurveydialog/addsurveydialog.component";

export interface JobsTime {
  permit_analyst: number;
  permit_designer: number;
  prelim_analyst: number;
  prelim_designer: number;
}

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  @ViewChild("searchinputfield") searchfieldref: MatInput;
  isWattmonkUser = false;
  activitybarVisible: boolean;
  placeholder = true;
  searchrecords: any;
  searchfield = new FormControl("", [Validators.required]);
  recordsCount = 0;
  prelimDesign: Design;
  isClient = false;
  loggedInUser: User;
  record: number;
  israisepermitrequest = false;
  israisesurveyrequest = false;
  israisepestamprequest = false;
  isrevision = false;
  searchedDesigns: Design[] = [];
  searchedPestamp: Pestamp[] = [];
  searchedSurveys: Survey[] = [];
  listactionindex;
  isLoading = false;
  role = ROLES;
  downloadmessage = "Preparing download";
  loadingpercentage: number = 0;
  isDownloading = false;
  Allfiles: any = [];

  @Input() searchQuery: any;

  appliedcoupan = null;
  finalAmountopay: any;
  servicecharge = 0;
  wattmonkadmins: User[] = [];
  pestampDetails: Pestamp;
  isWattmonkadmins = false;
  isUserDesigner = false;
  isUserAnalyst = false;
  isUserPeengineer = false;
  isUnhold: boolean = false;
  isButtonShow: boolean = false;
  copiedcoupon: any;
  isWattmonkUser1: boolean;
  isPesuperadmin: boolean = false;
  peengineers: Peengineer[];
  loadingmessage = "Please wait";
  analysts: Analyst[];

  //  timer variables
  // timer: number = 0;
  // istimerstart: boolean = false;
  // intervalId: any;
  // display: string = "0h : 0m : 0s";
  // hour: number = 0;
  // minutes: number = 0;
  job: JobsTiming = null;
  // disablestartbutton: boolean = false;
  joboverduetotaltime: any;
  jobtime: JobsTime;
  // totalminutes: number;
  prelimdesigner: number;
  permitdesigner: number;
  prelimanalyst: number;
  permitanalyst: number;

  constructor(
    public commonService: CommonService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private notifyService: NotificationService,
    private dialog: MatDialog,
    public designService: DesignService,
    private surveyService: SurveyService,
    public genericService: GenericService,
    public authService: AuthenticationService,
    private pestampService: PestampService,
    private eventEmitterService: EventEmitterService,
    private changeDetectorRef: ChangeDetectorRef,
    private loaderservice: LoaderService,
    private teamservice: TeamService,
    private db: AngularFireDatabase
  ) {
    this.loggedInUser = authService.currentUserValue.user;

    if (this.loggedInUser.role.id == ROLES.Designer) {
      this.isUserDesigner = true;
    } else {
      this.isUserDesigner = false;
    }

    if (this.loggedInUser.role.id == ROLES.Analyst) {
      this.isUserAnalyst = true;
    } else {
      this.isUserAnalyst = false;
    }

    if (this.loggedInUser.role.id == ROLES.Peengineer) {
      this.isUserPeengineer = true;
    } else {
      this.isUserPeengineer = false;
    }

    if (
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      ((this.loggedInUser.role.id == ROLES.TeamHead || this.loggedInUser.role.id == ROLES.BD) &&
        this.loggedInUser.parent.id == 232)
    ) {
      this.isWattmonkUser = true;
    } else {
      this.isWattmonkUser = false;
    }
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      ((this.loggedInUser.role.id == ROLES.BD ||
        this.loggedInUser.role.id == ROLES.TeamHead) &&
        this.loggedInUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
    if (
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id == 232) ||
      (this.loggedInUser.role.id == ROLES.TeamHead &&
        this.loggedInUser.parent.id == 232)
    ) {
      this.isWattmonkadmins = true;
    } else {
      this.isWattmonkadmins = false;
    }

    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      this.loggedInUser.role.id == ROLES.BD ||
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      (this.loggedInUser.role.id == ROLES.TeamHead &&
        this.loggedInUser.parent.id == 232)
    ) {
      this.israisepermitrequest = true;
      this.israisesurveyrequest = true;
      this.isrevision = true;
      this.israisepestamprequest = true;
    } else {
      this.israisepermitrequest = false;
      this.israisesurveyrequest = false;
      this.isrevision = false;
      this.israisepestamprequest = false;
    }

    if (
      this.loggedInUser.role.id == ROLES.Admin ||
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.TeamHead
    ) {
      this.isUnhold = true;
    } else {
      this.isUnhold = false;
    }

    if (
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      this.loggedInUser.role.id == ROLES.TeamHead
    ) {
      this.isButtonShow = true;
    }
    if (this.loggedInUser.role.id == ROLES.PESuperAdmin) {
      this.isPesuperadmin = true;
    } else {
      this.isPesuperadmin = false;
    }

    this.joboverduetotaltime = this.db.object("tasktimings").valueChanges().subscribe((result: JobsTime) => {
      this.jobtime = result;
      this.prelimdesigner = this.jobtime?.prelim_designer * 60;
      this.permitdesigner = this.jobtime?.permit_designer * 60;
      this.prelimanalyst = this.jobtime?.prelim_analyst * 60;
      this.permitanalyst = this.jobtime?.permit_analyst * 60;
    });

    this.eventEmitterService.onSidebarRouteChange("Search");
  }

  ngOnInit(): void {
    if (this.isPesuperadmin) {
      this.fetchPeEngineers();
    }
    // const dialogRef = this.dialogRef.Open(PrelimdetaildialogComponent);
    this.getWattmonkadmins();
    this.copiedcoupon = JSON.parse(localStorage.getItem("copiedcoupan"));
  }

  ngAfterViewInit(): void {
    this.searchfieldref.focus();
  }

  handleBack(): void {
    this.router.navigate([localStorage.getItem("lastroute")]);
    this.eventEmitterService.onSidebarRouteChange(
      localStorage.getItem("lastroutetitle")
    );
  }

  inputDataSearch(): void {
    // this.loaderservice.show();
    this.isLoading = true;
    // this.getJobTime();
    this.fetchSearchData();
  }

  fetchPeEngineers(): void {
    this.teamservice.getTeamData().subscribe(
      (response: any) => {
        this.peengineers = response;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  fetchSearchData(): void {
    // this.loaderservice.show();
    this.loadingmessage = "Please wait";
    if (this.searchfield.valid) {
      this.commonService.getSearchResults(this.searchfield.value).subscribe(
        (response) => {
          this.placeholder = false;
          this.searchrecords = response;
          this.recordsCount = response.length;
          this.searchedDesigns = this.fillinDynamicData(
            this.searchrecords.design
          );
          this.searchedPestamp = this.fillinDynamicDataPestamp(
            this.searchrecords.pestamp
          );
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          // this.loaderservice.hide();
          this.notifyService.showError(error, "Error");
        }
      );
    }
  }

  clearfield(): void {
    this.searchfield.setValue("");
    this.searchedDesigns = [];
    this.searchrecords.survey = [];
    this.searchedPestamp = [];
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
    this.activitybarVisible = true;
  }

  pestampactivitybarToggle(pestamp: Pestamp, event: Event): void {
    event.stopPropagation();
    this.pestampactivitybarOpen(pestamp);
  }

  pestampactivitybarOpen(pestamp: Pestamp): void {
    this.eventEmitterService.onActivityBarButtonClick(
      pestamp.id,
      false,
      "Pestamp"
    );
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.add("activitybar-open");
    $activitybar.classList.remove("activitybar-close");
    this.activitybarVisible = true;
  }

  surveyactivitybarToggle(survey: Survey, event: Event): void {
    event.stopPropagation();
    this.surveyactivitybarOpen(survey);
  }

  surveyactivitybarOpen(survey: Survey): void {
    this.eventEmitterService.onActivityBarButtonClick(
      survey.id,
      false,
      "Survey"
    );
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.add("activitybar-open");
    $activitybar.classList.remove("activitybar-close");
    this.activitybarVisible = true;
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
    this.genericService.backroute = "/home/extras/search";
    /* this.genericService.backroute = "/home/design/overview";
    this.router.navigate(['/home/inbox/messages']);
    this.eventEmitterService.onSidebarRouteChange("Inbox"); */
    this._snackBar.openFromComponent(ChatdialogComponent, {
      data: "element",
      panelClass: ["chatdialog"],
    });
  }

  pestampChatButtonClick(pestamp: Pestamp, event: Event): void {
    event.stopPropagation();
    this.activitybarClose();
    const GUID = pestamp.chatid;
    this.genericService.setSelectedChatGroupID(GUID);
    this._snackBar.openFromComponent(ChatdialogComponent, {
      data: "element",
      panelClass: ["chatdialog"],
    });
    /*    this.genericService.backroute = "/home/pestamp/overview";
    this.router.navigate(['/home/inbox/messages']);
    this.eventEmitterService.onSidebarRouteChange("Inbox");
    localStorage.setItem("index", i); */
    //localStorage.setItem("activetab", this.activeTab.toString())
  }
  fillinDynamicData(records: Design[]): Design[] {
    records.forEach((element) => {
      this.fillinDynamicDataForSingleRecord(element);
    });
    this.eventEmitterService.onConversationItemSelected(0);
    return records;
  }

  fillinDynamicDataForSingleRecord(element: Design): Design {
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
    if (
      element.requesttype == "permit" &&
      this.loggedInUser.minpermitdesignaccess
    ) {
      element.isrecordcomplete = true;
    } else {
      if (element.requesttype == "permit" && element.jobtype != "battery") {
        if (
          element.designgeneralinformation != null &&
          element.electricalinformation != null &&
          element.electricalslocation != null &&
          element.structuralinformations.length > 0
        ) {
          element.isrecordcomplete = true;
        }
      } else if (
        element.requesttype == "permit" &&
        element.jobtype == "battery"
      ) {
        if (
          element.designgeneralinformation != null &&
          element.electricalinformation != null &&
          element.electricalslocation != null
        ) {
          element.isrecordcomplete = true;
        }
      }
    }

    //Setting acceptance timer
    if (element.status == "outsourced") {
      if (element.requesttype == "permit") {
        const acceptancedate = new Date(element.designacceptancestarttime);
        element.designacceptanceremainingtime =
          this.genericService.getRemainingTime(acceptancedate.toString());
      } else {
        const acceptancedate = new Date(element.designacceptancestarttime);
        element.designacceptanceremainingtime =
          this.genericService.getRemainingTime(acceptancedate.toString());
      }

      if (element.designacceptanceremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Setting design timer
    if (
      element.status == "designassigned" ||
      element.status == "designcompleted"
    ) {
      if (element.requesttype == "permit") {
        const acceptancedate = new Date(element.designstarttime);
        acceptancedate.setHours(acceptancedate.getHours() + 6);
        element.designremainingtime = this.genericService.getRemainingTime(
          acceptancedate.toString()
        );
      } else {
        const acceptancedate = new Date(element.designstarttime);
        acceptancedate.setHours(acceptancedate.getHours() + 2);
        element.designremainingtime = this.genericService.getRemainingTime(
          acceptancedate.toString()
        );
      }
      if (element.designremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Setting review timer
    if (
      element.status == "reviewassigned" ||
      element.status == "reviewpassed" ||
      element.status == "reviewfailed"
    ) {
      if (element.requesttype == "permit") {
        const reviewdate = new Date(element.reviewstarttime);
        reviewdate.setHours(reviewdate.getHours() + 2);
        element.reviewremainingtime = this.genericService.getRemainingTime(
          reviewdate.toString()
        );
      } else {
        const reviewdate = new Date(element.reviewstarttime);
        reviewdate.setMinutes(reviewdate.getMinutes() + 15);
        element.reviewremainingtime = this.genericService.getRemainingTime(
          reviewdate.toString()
        );
      }
      if (element.reviewremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Code to fetch unread message count
    CometChat.getUnreadMessageCountForGroup(element.chatid).then((array) => {
      if (array[element.chatid] != undefined) {
        element.unreadmessagecount = array[element.chatid];
        this.changeDetectorRef.detectChanges();
      } else {
        element.unreadmessagecount = 0;
        this.changeDetectorRef.detectChanges();
      }
    });

    //FOR NEW TIMER
    if (element?.tasktimings && Object.keys(element?.tasktimings).length) {
      this.job = element?.tasktimings;
    }
    else {
      this.job = null;
    }
    let currenttime = new Date().getTime();
    // let starttime = new Date(element.tasktimings.starttime).getTime();
    let starttime = new Date(element?.newtasktimings?.starttime).getTime();
    let newtime = currenttime - starttime;
    let sec: any = Math.floor(newtime / 1000);
    // this.job = element?.newtasktimings;
    if (element?.requesttype == 'prelim') {
      if ((element?.status == 'designassigned' || element?.status == 'reviewfailed') && !element?.newtasktimings?.canceled && element?.newtasktimings?.taskstatus == "pending") {

        // let minutes = Math.floor(sec / 60);
        // console.log(minutes * 60)
        let prelimdesigner = this.jobtime.prelim_designer * 60;
        if (sec > prelimdesigner) {
          element.newtasktimings.isjobtimeexceeded = true;
        }
        else {
          element.newtasktimings.isjobtimeexceeded = false;
        }
      }
      else if (element?.status == 'reviewassigned' && !element?.newtasktimings?.canceled && element?.newtasktimings?.taskstatus == "pending") {
        let prelimanalyst = this.jobtime.prelim_analyst * 60;
        if (sec > prelimanalyst) {
          element.newtasktimings.isjobtimeexceeded = true;
        }
        else {
          element.newtasktimings.isjobtimeexceeded = false;
        }
      }
    }
    else if (element?.requesttype == 'permit') {
      if ((element?.status == 'designassigned' || element?.status == 'reviewfailed') && !element?.newtasktimings?.canceled && element?.newtasktimings?.taskstatus == "pending") {

        // let minutes = Math.floor(sec / 60);
        // console.log(minutes * 60)
        let permitdesigner = this.jobtime.permit_designer * 60;
        if (sec > permitdesigner) {
          element.newtasktimings.isjobtimeexceeded = true;
        }
        else {
          element.newtasktimings.isjobtimeexceeded = false;
        }
      }
      else if (element?.status == 'reviewassigned' && !element?.newtasktimings?.canceled && element?.newtasktimings?.taskstatus == "pending") {
        let permitanalyst = this.jobtime.permit_analyst * 60;
        if (sec > permitanalyst) {
          element.newtasktimings.isjobtimeexceeded = true;
        }
        else {
          element.newtasktimings.isjobtimeexceeded = false;
        }
      }
    }

    return element;
  }

  fillinDynamicDataPestamp(records: Pestamp[]): Pestamp[] {
    records.forEach((element) => {
      this.fillinDynamicDataForSingleRecordPestamp(element);
    });
    this.eventEmitterService.onConversationItemSelected(0);
    return records;
  }

  fillinDynamicDataForSingleRecordPestamp(element: Pestamp): Pestamp {
    if (this.isPesuperadmin) {
      this.peengineers.forEach((result: any) => {
        if (result.peengineertype == element.type || element.type == 'both') {
          element.peengineerexist = true;
        }
      });
    }
    if (element.status == "pesuperadminassigned") {
      element.pestampcurrentstatus = "Assigned";
    } else {
      element.pestampcurrentstatus = this.genericService.getPestampStatusName(
        element.status
      );
    }
    if (element.status != "delivered") {
      element.isoverdue = this.genericService.isDatePassed(
        element.actualdelivereddate
      );
    } else {
      element.isoverdue = false;
    }
    element.lateby = this.genericService.getTheLatebyString(
      element.actualdelivereddate
    );
    element.recordupdatedon = this.genericService.formatDateInTimeAgo(
      element.updated_at
    );
    element.formattedpestamptype = this.genericService.getPestampTypeName(
      element.type
    );

    if (
      element.email != null &&
      element.hardcopies != null &&
      element.type != null &&
      element.shippingaddress != null &&
      element.roofphotos.length > 0 &&
      element.atticphotos.length > 0 &&
      element.permitplan.length > 0
    ) {
      element.isrecordcomplete = true;
    }

    //Setting acceptance timer
    if (element.status == "outsourced") {
      const acceptancedate = new Date(element.pestampacceptancestarttime);
      element.pestampacceptanceremainingtime =
        this.genericService.getRemainingTime(acceptancedate.toString());
      if (element.pestampacceptanceremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Setting design timer
    if (element.status == "assigned" || element.status == "completed") {
      const acceptancedate = new Date(element.pestampstarttime);
      acceptancedate.setHours(acceptancedate.getHours() + 2);
      element.designremainingtime = this.genericService.getRemainingTime(
        acceptancedate.toString()
      );

      if (element.designremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Code to fetch unread message count
    CometChat.getUnreadMessageCountForGroup("" + element.chatid).then(
      (array) => {
        if (array[element.chatid] != undefined) {
          element.unreadmessagecount = array[element.chatid];
          this.changeDetectorRef.detectChanges();
        } else {
          element.unreadmessagecount = 0;
          this.changeDetectorRef.detectChanges();
        }
      }
    );

    return element;
  }

  openAssignDesignerDialog(record: Design, event: Event, index): void {
    if (this.isClient) {
      this.activitybarClose();
      event.stopPropagation();
      if (record.requesttype == "prelim") {
        const dialogRef = this.dialog.open(OrderprelimdesigndialogComponent, {
          width: "30%",
          autoFocus: false,
          disableClose: true,
          data: {
            isConfirmed: false,
            isprelim: true,
            design: record,
            amounttopay: 0,
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          // this.loaderservice.show();
          this.changeDetectorRef.detectChanges();
          if (result.isConfirmed) {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.finalAmountopay = result.amounttopay;
            if (result.appliedcoupan != null) {
              this.appliedcoupan = result.appliedcoupan;
            } else {
              this.appliedcoupan = null;
            }
            this.updatedesign(result.design, 15);
            // this.fetchSearchData();
          }
        });
      } else {
        const dialogRef = this.dialog.open(OrderpermitdesigndialogComponent, {
          width: "30%",
          autoFocus: false,
          disableClose: true,
          panelClass: "white-modalbox",
          data: {
            isConfirmed: false,
            isprelim: true,
            design: record,
            amounttopay: 0,
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.changeDetectorRef.detectChanges();
          if (result.isConfirmed) {
            // this.isLoading = true;
            this.isLoading = true;
            this.finalAmountopay = result.amounttopay;
            if (result.appliedcoupan != null) {
              this.appliedcoupan = result.appliedcoupan;
            } else {
              this.appliedcoupan = null;
            }
            this.updatedesign(result.design, 15);
            // this.fetchSearchData();
          }
        });
      }
    } else {
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(AssigndesigndialogComponent, {
        width: "73%",
        autoFocus: false,
        disableClose: true,
        data: { isEditMode: false, design: record },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.refreshDashboard) {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.fetchSearchData();
          // if (result.design.status == "outsourced") {
          //   this.updateItemInList(LISTTYPE.NEW, result.design);
          // } else {
          //   this.removeItemFromList(type);
          //   this.addItemToList(LISTTYPE.INDESIGN, result.design);
          // }
          // this.fetchAllDesignsCount();
        }
      });
    }
  }

  updatedesign(record, additionalminutes): void {
    const paymenttype = localStorage.getItem("paymenttype");
    if (paymenttype == "direct") {
      this.commonService
        .stripepayment(
          this.genericService.stripepaymenttoken.id,
          this.authService.currentUserValue.user.email,
          this.authService.currentUserValue.user.id,
          this.finalAmountopay,
          paymenttype,
          this.appliedcoupan,
          record.id,
          this.servicecharge
        )
        .subscribe(() => {
          this.isLoading = false;
          this.senddesigntoWattmonk(record, additionalminutes);
        });
    } else {
      this.senddesigntoWattmonk(record, additionalminutes);
    }
  }

  senddesigntoWattmonk(record, additionalminutes): void {
    const designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(
      designacceptancestarttime.getMinutes() + additionalminutes
    );
    const postData = {
      outsourcedto: 232,
      isoutsourced: "true",
      status: "outsourced",
      paymenttype: localStorage.getItem("paymenttype"),
      couponid: this.appliedcoupan ? this.appliedcoupan.id : null,
      designacceptancestarttime: designacceptancestarttime,
      paymentstatus: localStorage.getItem("paymentstatus"),
      amount: this.finalAmountopay,
    };

    this.designService.assignDesign(record.id, postData).subscribe(
      (response) => {
        this.authService.currentUserValue.user.amount =
          response.createdby.amount;
        if (
          this.appliedcoupan?.usestype == "single" &&
          this.copiedcoupon?.id == this.appliedcoupan?.id
        ) {
          localStorage.removeItem("copiedcoupan");
        }
        localStorage.setItem("walletamount", "" + response.createdby.amount);
        localStorage.removeItem("paymenttype");
        localStorage.removeItem("paymentstatus");
        this.createNewDesignChatGroup(response);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  declineDesignRequest(
    design: Design,
    event: Event,
    index: number,
    action: string
  ): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openDesignDeclineDialog(design, action);
  }

  openDesignDeclineDialog(record: Design, action: string): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesigndeclinedialogComponent, {
      width: "50%",
      disableClose: true,
      data: { design: record, action: action },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.fetchSearchData();
      }
    });
  }

  acceptDesignRequest(design: Design, event: Event, index: number): void {
    this.activitybarClose();
    event.stopPropagation();
    this.isLoading = true;
    this.changeDetectorRef.detectChanges();
    this.listactionindex = index;
    const cdate = Date.now();
    const postData = {
      status: "requestaccepted",
      designacceptanceendtime: cdate,
    };
    this.designService.editDesign(design.id, postData).subscribe(
      () => {
        this.fetchSearchData();
        // this.isLoading = false;
        // this.changeDetectorRef.detectChanges();
        this.notifyService.showSuccess(
          "Design request has been accepted successfully.",
          "Success"
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getWattmonkadmins(): void {
    this.commonService.getWattmonkAdmins().subscribe(
      (response) => {
        this.wattmonkadmins = response;
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  createNewDesignChatGroup(design: Design): void {
    const GUID = design.chatid;

    const address = design.address.substring(0, 60);
    const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
    const groupName = design.name + "_" + address + "_" + currentdatetime;

    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = design.groupchatpassword

    const group = new CometChat.Group(GUID, groupName, groupType, password);
    const adminsid = [];
    this.wattmonkadmins.forEach((element) => {
      adminsid.push(element);
    });
    CometChat.createGroup(group).then(
      (group) => {
        const membersList = [
          new CometChat.GroupMember(
            "" + design.createdby.cometchatuid,
            CometChat.GROUP_MEMBER_SCOPE.ADMIN
          ),
        ];
        adminsid.forEach((element) => {
          membersList.push(
            new CometChat.GroupMember(
              "" + element,
              CometChat.GROUP_MEMBER_SCOPE.ADMIN
            )
          );
        });
        CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
          () => {
            const chatgroupusers = [];
            chatgroupusers.push(design.createdby.cometchatuid);
            chatgroupusers.push(design.createdby.cometchatuid);
            const inputData = {
              title: groupName,
              guid: GUID,
              parentid: design.createdby.parent.id,
              chatgroupusers: chatgroupusers,
            };
            this.commonService.addChatGroup(inputData).subscribe(() => {
              // do nothing.
            });
            // this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showSuccess(
              "Design request has been assigned successfully.",
              "Success"
            );
            this.fetchSearchData();
          },
          () => {
            // this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showSuccess(
              "Design request has been assigned successfully.",
              "Success"
            );
            this.fetchSearchData();
          }
        );
      },
      () => {
        // this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.notifyService.showSuccess(
          "Design request has been accepted successfully.",
          "Success"
        );
        this.fetchSearchData();
      }
    );
  }

  // openReAssignDesignerDialog(record: Design, event: Event, index): void {
  //   this.activitybarClose();
  //   event.stopPropagation();
  //   this.listactionindex = index;
  //   let designacceptancestarttime = new Date();
  //   designacceptancestarttime.setMinutes(designacceptancestarttime.getMinutes() + 15);

  //   this.isLoading = true;
  //   this.changeDetectorRef.detectChanges();
  //   let postData = {};

  //   postData = {
  //     isoutsourced: "true",
  //     status: "outsourced",
  //     designacceptancestarttime: designacceptancestarttime
  //   };

  //   this.designService
  //     .assignDesign(
  //       record.id,
  //       postData
  //     )
  //     .subscribe(
  //       response => {
  //         this.isLoading = false;
  //         this.changeDetectorRef.detectChanges();
  //         this.notifyService.showSuccess("Design request has been successfully reassigned to WattMonk.", "Success");
  //         this.fetchSearchData();
  //       },
  //       error => {
  //         this.notifyService.showError(
  //           error,
  //           "Error"
  //         );
  //       }
  //     );
  // }

  openReAssignDesignerDialog(
    design: Design,
    event: Event,
    index: number,
    action
  ): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.unholdDesign(design, action);
  }

  // openReAssignpestamp(record: Pestamp, event: Event, index: number){
  openReAssignpestamp(record: Pestamp, event: Event, index: number): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const pestampacceptancestarttime = new Date();
    pestampacceptancestarttime.setMinutes(
      pestampacceptancestarttime.getMinutes() + 15
    );

    let postData = {};
    if (record.declinedbypeengineer == true) {
      postData = {
        isoutsourced: "true",
        status: "assigned",
        declinedbypeengineer: "false",
      };
    } else if (
      record.declinedbystructuralpeengineer == true &&
      record.declinedbyelectricalpeengineer == false
    ) {
      postData = {
        isoutsourced: "true",
        status: "accepted",
        declinedbystructuralpeengineer: "false",
      };
    } else if (
      record.declinedbyelectricalpeengineer == true &&
      record.declinedbystructuralpeengineer == false
    ) {
      postData = {
        isoutsourced: "true",
        status: "accepted",
        declinedbyelectricalpeengineer: "false",
      };
    } else if (
      record.declinedbyelectricalpeengineer == true &&
      record.declinedbystructuralpeengineer == true
    ) {
      postData = {
        isoutsourced: "true",
        status: "assigned",
        declinedbyelectricalpeengineer: "false",
      };
    } else if (record.declinedbypesuperadmin == true) {
      postData = {
        isoutsourced: "true",
        status: "pesuperadminassigned",
        declinedbypesuperadmin: "false",
      };
    } else {
      postData = {
        isoutsourced: "true",
        status: "outsourced",
        pestampacceptancestarttime: pestampacceptancestarttime,
      };
    }
    this.loaderservice.show();
    this.pestampService.assignPestamp(record.id, postData).subscribe(
      () => {
        this.notifyService.showSuccess(
          "PE stamp request has been successfully reassigned to WattMonk.",
          "Success"
        );
        this.loaderservice.hide();
        this.fetchSearchData();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }
  // }

  unholdDesign(record: Design, action): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesigndeclinedialogComponent, {
      width: "50%",
      disableClose: true,
      data: { design: record, action: action },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.fetchSearchData();
      }
    });
  }

  openDetailDialog(record: any, event: Event, index: number, name?: any): void {
    this.activitybarClose();
    if (name && name != "" && name != "undefined") {
      this.fetchPestampDetails(record);
    } else {
      if (record.requesttype == "prelim") {
        this.fetchDesignDetails(record, index);
      } else if (record.type == "survey") {
        this.fetchSurveyDetails(record);
      } else if (record.requesttype == "permit") {
        this.fetchPermitDesignDetails(record, index);
      }
    }
    event.stopPropagation();
  }

  fetchPestampDetails(pestamp: Pestamp): void {
    this.loaderservice.show();
    this.pestampService.getPestampDetails(pestamp.id).subscribe(
      (response) => {
        this.pestampDetails = response;

        this.openDetailDialog2();
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  openDetailDialog2(): void {
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        pestamp: this.pestampDetails,
        triggerPrelimEditEvent: false,
        triggerSurveyEditEvent: false,
        triggerPermitEditEvent: false,
        triggerPestampEditEvent: false,
        triggerDeleteEvent: false,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerPestampEditEvent) {
        this.openEditPetamp(this.pestampDetails);
      }
      // else if(result.triggerPermitEditEvent){
      //   this.openEditMinPermitDesignDialog(this.permitDetails);
      // }
      // else if(result.triggerSurveyEditEvent){
      //   this.openEditSurveyDialog(this.surveyDetails);
      // }
      // else if (result.triggerPrelimEditEvent){
      //   if (this.prelimDesign.requirementtype == "proposal") {
      //     this.openEditProposalDesignDialog(this.prelimDesign)
      //   }
      //   else {
      //     this.openEditDesignDialog(this.prelimDesign);
      //   }

      // }
    });
  }

  openEditPetamp(pestamp: Pestamp): void {
    const dialogRef = this.dialog.open(AddpestampdialogComponent, {
      disableClose: true,
      width: "80%",
      autoFocus: false,
      data: { isEditMode: true, isDataUpdated: false, pestamp: pestamp },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
      }
    });
  }

  /**Reassign design to Wattmonk fromm client side,
   * When design is in OnHold Section.
   */
  openReAssignPeStampDialog(record: Pestamp, event: Event, index): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    let pestampacceptancestarttime = new Date();
    pestampacceptancestarttime.setMinutes(
      pestampacceptancestarttime.getMinutes() + 15
    );

    let postData = {};
    if (record.declinedbypeengineer == true) {
      postData = {
        isoutsourced: "true",
        status: "assigned",
        declinedbypeengineer: "false",
      };
    } else if (
      record.declinedbystructuralpeengineer == true &&
      record.declinedbyelectricalpeengineer == false
    ) {
      postData = {
        isoutsourced: "true",
        status: "accepted",
        declinedbystructuralpeengineer: "false",
      };
    } else if (
      record.declinedbyelectricalpeengineer == true &&
      record.declinedbystructuralpeengineer == false
    ) {
      postData = {
        isoutsourced: "true",
        status: "accepted",
        declinedbyelectricalpeengineer: "false",
      };
    } else if (
      record.declinedbyelectricalpeengineer == true &&
      record.declinedbystructuralpeengineer == true
    ) {
      postData = {
        isoutsourced: "true",
        status: "assigned",
        declinedbyelectricalpeengineer: "false",
      };
    } else {
      postData = {
        isoutsourced: "true",
        status: "outsourced",
        pestampacceptancestarttime: pestampacceptancestarttime,
      };
    }

    this.isLoading = true;

    this.pestampService.assignPestamp(record.id, postData).subscribe(
      () => {
        this.fetchSearchData();
        this.notifyService.showSuccess(
          "PE stamp request has been successfully reassigned to WattMonk.",
          "Success"
        );
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  /**Sending PE Stamp for Revison from search
   * for clients   */
  openPeStampResendDialog(record: Pestamp, event: Event): void {
    this.activitybarClose();
    event.stopPropagation();
    const dialogRef = this.dialog.open(PestampResendDialog, {
      width: "73%",
      height: "90%",
      disableClose: true,
      data: { pestamp: record, isWattmonkUser: this.isWattmonkUser },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.isLoading = true;
        this.changeDetectorRef.detectChanges();
        this.fetchSearchData();
      }
    });
  }

  fetchPermitDesignDetails(design: Design, index: number): void {
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openPermitDesignDetailDialog(response, index);
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }
  openPermitDesignDetailDialog(design: Design, index: number): void {
    this.activitybarClose();
    const triggerEditEvent = false;
    if (design.createdby.minpermitdesignaccess) {
      const dialogRef = this.dialog.open(MasterdetailpageComponent, {
        width: "80%",
        disableClose: true,
        autoFocus: false,
        data: {
          permit: design,
          triggerEditEvent: triggerEditEvent,
          triggerDeleteEvent: false,
          selectedtab: "permit",
          job: this.job
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.triggerPermitEditEvent) {
          this.openEditMinPermitDesignDialog(design);
        }
        if (result.triggerDeleteEvent) {
          this.searchrecords.splice(index, 1);
        }
      });
    } else {
      const dialogRef = this.dialog.open(MasterdetailpageComponent, {
        width: "80%",
        autoFocus: false,
        disableClose: true,
        data: {
          permit: design,
          triggerEditEvent: triggerEditEvent,
          triggerDeleteEvent: false,
          selectedtab: "permit",
          job: this.job
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.triggerPermitEditEvent) {
          this.openEditPermitDesignDialog(design);
        }
        if (result.triggerDeleteEvent) {
          this.searchrecords.splice(index, 1);
        }
        if (result.refreshDashboard) {
          this.fetchSearchData();
          // this.getJobTime();
        }
      });
    }
  }

  openEditPermitDesignDialog(design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DetailedpermitComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.fetchSearchData();
      }
    });
  }

  openEditMinPermitDesignDialog(design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.fetchSearchData();
      }
    });
  }

  fetchDesignDetails(design: Design, index: number): void {
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openPrelimDesignDetailDialog(response, index);
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  openPrelimDesignDetailDialog(design: Design, index: number): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        prelim: design,
        triggerEditEvent: false,
        triggerDeleteEvent: false,
        selectedtab: "prelim",
        job: this.job
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerPrelimEditEvent) {

        if (design["requirementtype"] == "proposal") {
          this.openEditProposalDialog(design);
        } else {
          this.openEditDesignDialog(design);
        }
      }

      if (result.triggerDeleteEvent) {
        this.searchrecords.splice(index, 1);
      }

      if (result.refreshDashboard) {
        this.fetchSearchData();
        // this.getJobTime();
      }
    });
  }

  openEditDesignDialog(design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AdddesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.fetchSearchData();
      }
    });
  }
  openEditProposalDialog(design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddprelimproposaldialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.fetchSearchData();
      }
    });
  }
  openSurveyDetailDialog(record: Survey): void {
    const triggerEditEvent = false;
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: { survey: record, triggerEditEvent: triggerEditEvent },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerSurveyEditEvent) {
        this.openEditSurveyDialog(record);
      }

      if (result.refreshDashboard) {
        this.fetchSearchData();
      }
    });
  }

  openEditSurveyDialog(survey: Survey): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddsurveydialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, survey: survey },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.fetchSearchData();
      }
    });
  }

  fetchSurveyDetails(survey: Survey): void {
    this.loaderservice.show();
    this.surveyService.getSurveyDetails(survey.id).subscribe(
      (response) => {
        this.openSurveyDetailDialog(response);
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  downloadDesign(design: Design, pestamp: Pestamp, event: Event): void {
    this.loaderservice.show();
    event.stopPropagation();
    const fileurl =
      design != null ? design.permitdesign.url : pestamp.stampedfiles[0].url;
    let filename;
    if (design != null && design.requesttype == "prelim") {
      filename = "prelimdesign" + design.prelimdesign.ext;
    } else if (design != null && design.requesttype == "permit") {
      filename = "permitdesign" + design.permitdesign.ext;
    } else if (design === null && pestamp != null) {
      filename = "stampedfile" + pestamp.stampedfiles[0].ext;
    }
    axios({
      url: fileurl,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        this.loaderservice.hide();
      })
      .catch(() => { this.loaderservice.hide() });
  }

  shareDesign(design: Design, event: Event): void {
    this.activitybarClose();
    event.stopPropagation();
    if (design.requesttype == "prelim") {
      const dialogRef = this.dialog.open(ShareprelimdesigndialogComponent, {
        width: "auto",
        height: "auto",
        autoFocus: false,
        disableClose: true,
        data: { design: design },
      });
      dialogRef.afterClosed().subscribe(() => {
        // do nothing.
      });
    } else if (design.requesttype == "permit") {
      const dialogRef = this.dialog.open(SharepermitdesigndialogComponent, {
        width: "auto",
        height: "auto",
        disableClose: true,
        autoFocus: false,
        data: { design: design },
      });
      dialogRef.afterClosed().subscribe(() => {
        // do nothing.
      });
    }
  }

  resendDesign(design: Design, event: Event): void {
    this.activitybarClose();
    event.stopPropagation();
    this.openDesignResendDialog(design);
  }

  openDesignResendDialog(record: Design): void {
    this.activitybarClose();
    let isPrelim;
    let isPermit;

    isPermit = record.requesttype == "permit" ? true : false;
    isPrelim = record.requesttype == "prelim" ? true : false;
    if (isPermit) {
      const dialogRef = this.dialog.open(permitDesignResendDialog, {
        width: "73%",
        height: "90%",
        disableClose: true,
        data: {
          design: record,
          ispermitmode: isPermit,
          isWattmonkUser: this.isWattmonkUser,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.issubmitted) {
          this.fetchSearchData();
        }
      });
    } else if (isPrelim) {
      const dialogRef = this.dialog.open(DesignResendDialog, {
        width: "73%",
        height: "90%",
        disableClose: true,
        data: {
          design: record,
          isprelimmode: isPrelim,
          isWattmonkUser: this.isWattmonkUser,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.issubmitted) {
          this.fetchSearchData();
        }
      });
    }
  }

  raisesurvey(design, event): void {
    this.activitybarClose();
    event.stopPropagation();
    const dialogRef = this.dialog.open(AddsurveydialogComponent, {
      width: "80%",
      height: "80%",
      disableClose: true,
      autoFocus: false,
      data: {
        isEditMode: false,
        isDataUpdated: false,
        design: design,
        isprelimrequest: true,
        isWattmonkUser: this.isWattmonkUser,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        design.issurveyraised = true;
        this.changeDetectorRef.detectChanges();
        this.router.navigate(["/home/survey/overview"]);
      }
    });
  }

  raisepermit(design: Design, event): void {
    this.activitybarClose();
    event.stopPropagation();
    let designRaisedbyWattmonk: boolean;
    if (this.isWattmonkUser) {
      designRaisedbyWattmonk = true;
    } else {
      designRaisedbyWattmonk = false;
    }
    const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
      width: "80%",
      //height: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        isEditMode: false,
        isDataUpdated: false,
        prelimData: design,
        isprelimmode: true,
        designRaisedbyWattmonk: designRaisedbyWattmonk,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        design.ispermitraised = true;

        this.changeDetectorRef.detectChanges();
        this.router.navigate(["/home/permitdesign/overview"]);
      }
    });
  }

  raisePestampRequest(permit: Design, event): void {
    this.loaderservice.show();
    this.activitybarClose();
    event.stopPropagation();
    if (permit.survey != null) {
      if (permit.survey.prelimdesignsurvey != null) {
        this.getPrelimDesign(permit.survey.prelimdesignsurvey, permit);
      } else {
        this.prelimDesign = null;
        this.openPestampDialog(permit);
      }
    } else {
      this.prelimDesign = null;
      this.openPestampDialog(permit);
    }

    this.loaderservice.hide();
  }

  getPrelimDesign(prelimId: any, permit): void {
    this.designService.getDesignDetails(prelimId).subscribe((response) => {
      this.prelimDesign = response;
      this.openPestampDialog(permit);
      // this.openPermitDialog(permit);
      this.changeDetectorRef.detectChanges();
    });
  }

  openPestampDialog(permit: Design): void {
    const dialogRef = this.dialog.open(AddpestampdialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        isPermitmode: true,
        design: permit,
        survey: permit.survey,
        prelim: this.prelimDesign,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(["home/pestamp/overview"]);
    });
  }
  ShareOnWhatsapp(event): void {
    this.activitybarClose();
    event.stopPropagation();
  }
  selfAssignQC(record: Design, event: Event, index): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const postData = {
      reviewassignedto: this.loggedInUser.id,
      status: "reviewassigned",
      reviewstarttime: Date.now(),
    };
    this.loaderservice.show();
    this.designService.selfassignreview(record.id, postData).subscribe(
      () => {
        this.notifyService.showSuccess(
          "Quality check process for " +
          record.address +
          "  has been successfully assigned to you.",
          "Success"
        );
        this.fetchSearchData();
        // this.removeItemFromList(type);
        // this.addItemToList(LISTTYPE.INREVIEW, response);
        // this.fetchAllDesignsCount();
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }
  getperlimAnalyst(): void {
    // this.loader.isLoading = new BehaviorSubject<boolean>(false);
    this.commonService.getperlimAnalyst().subscribe(
      (response) => {
        this.analysts = response;
        this.analysts.sort((a, b) =>
          a.firstname.toLocaleLowerCase() > b.firstname.toLocaleLowerCase()
            ? 1
            : -1
        );
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  openAssignQCDialog(record: Design, event: Event, index): void {
    this.getperlimAnalyst();
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const dialogRef = this.dialog.open(AssignreviewerdialogComponent, {
      width: "73%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, design: record, isDesign: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.refreshDashboard) {
        this.fetchSearchData();
        // this.removeItemFromList(type);
        // this.addItemToList(LISTTYPE.INREVIEW, result.design);
        // this.fetchAllDesignsCount();
      }
    });
  }
  deliverDesign(design: Design, event: Event, index: number): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openDesignDeliveryDialog(design);
  }

  openDesignDeliveryDialog(record: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesignDeliverDialog, {
      width: "50%",
      data: { design: record },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.isLoading = true;
        this.changeDetectorRef.detectChanges();
        const postData = {
          status: "delivered",
          comments: result.deliverycomments,
        };

        this.designService.editDesign(record.id, postData).subscribe(
          () => {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showSuccess(
              "Design request has been delivered successfully.",
              "Success"
            );
            this.fetchSearchData();
            // this.removeItemFromList(LISTTYPE.INREVIEW);
            // this.addItemToList(LISTTYPE.DELIVERED, response);
            // this.fetchAllDesignsCount();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      }
    });
  }

  getPestampsCharges(pestamp, index): void {
    //   let searchdata;
    //   let bothtypepestampcharges = 0;
    //   if (pestamp.propertytype == 'commercial' && pestamp.type == 'structural') {
    //     searchdata = "structuralcommercialpecharges"
    //   }
    //   else if (pestamp.propertytype == 'commercial' && pestamp.type == 'electrical') {
    //     searchdata = "electricalcommercialpecharges"
    //   }
    //   else if (pestamp.propertytype == 'commercial' && pestamp.type == 'both') {

    //     searchdata = "electricalcommercialpecharges";
    //     let structuralcommercialsearchdata = "structuralcommercialpecharges";

    //     this.commonService.getPestampchargese(structuralcommercialsearchdata).subscribe(
    //       response => {

    //         bothtypepestampcharges = parseInt(response[0].settingvalue);
    //       }
    //     );
    //   }
    //   else if (pestamp.type == 'electrical' && pestamp.jobtype == 'pv') {
    //     searchdata = "electricalpvpecharges"
    //   }
    //   else if (pestamp.type == 'electrical' && pestamp.jobtype == 'pvbattery') {
    //     searchdata = "electricalpvbatterypecharges"
    //   }
    //   else if (pestamp.type == 'electrical' && pestamp.jobtype == 'battery') {
    //     searchdata = "electricalbatterypecharges"
    //   }
    //   else if (pestamp.type == 'structural' && pestamp.mountingtype == 'both') {
    //     searchdata = "structuralbothpecharges"
    //   }
    //   else if (pestamp.type == 'structural' && pestamp.mountingtype == 'ground') {
    //     searchdata = "structuralgroundmountpecharges"
    //   }
    //   else if (pestamp.type == "structural" && pestamp.mountingtype == 'roof') {
    //     searchdata = "structuralroofpecharges"
    //   }
    //   else if (pestamp.propertytype == 'residential' && pestamp.type == "both") {
    //     if (pestamp.jobtype == 'pv') {
    //       searchdata = "electricalpvpecharges";
    //     }
    //     else if (pestamp.jobtype == 'pvbattery') {
    //       searchdata = "electricalpvbatterypecharges";
    //     }
    //     else if (pestamp.jobtype == 'battery') {
    //       searchdata = "electricalbatterypecharges";
    //     }

    //     let structuralsearchdata;
    //     if (pestamp.mountingtype == 'both') {
    //       structuralsearchdata = "structural" + pestamp.mountingtype + "pecharges"
    //     }
    //     else if (pestamp.mountingtype == 'ground') {
    //       structuralsearchdata = "structural" + pestamp.mountingtype + "mountpecharges"
    //     }
    //     else if (pestamp.mountingtype == 'roof') {
    //       structuralsearchdata = "structural" + pestamp.mountingtype + "pecharges"
    //     }

    //     this.commonService.getPestampchargese(structuralsearchdata).subscribe(
    //       response => {

    //         bothtypepestampcharges = parseInt(response[0].settingvalue);
    //       }
    //     );
    //   }
    //   setTimeout(() => {
    //     this.commonService.getPestampchargese(searchdata).subscribe(
    //       response => {

    //         if (pestamp.propertytype == 'commercial') {
    //           this.genericService.pestampscharges = 0
    //           this.genericService.commercialpestampcharges = parseInt(response[0].settingvalue) + bothtypepestampcharges;
    //         }
    //         else {
    //           this.genericService.pestampscharges = parseInt(response[0].settingvalue) + bothtypepestampcharges;
    //         }

    //         this.changeDetectorRef.detectChanges();
    //         this.openOrderDesignDialog($ev, pestamp, index,);
    //       }
    //     );
    //   }, 1000)
    this.openOrderDesignDialog(pestamp, index);
  }

  downloadfile(pestamp: Pestamp, event: Event): void {
    // const that = this;
    // event.stopPropagation();
    // this.loadingpercentage = 0;
    // this.isDownloading = true;
    // if (pestamp.atticphotos.length > 0) {
    //   pestamp.atticphotos.forEach((element) => {
    //     this.Allfiles.push(element);
    //   });
    // }
    // if (pestamp.roofphotos.length > 0) {
    //   pestamp.roofphotos.forEach((element) => {
    //     this.Allfiles.push(element);
    //   });
    // }
    // if (pestamp.permitplan.length > 0) {
    //   pestamp.permitplan.forEach((element) => {
    //     this.Allfiles.push(element);
    //   });
    // }
    // const zip = new JSZip();
    // let count = 0;
    // this.Allfiles.forEach((file) => {
    //   axios
    //     .get(file.url, {
    //       responseType: "blob",
    //     })
    //     .then((response) => {
    //       const percentage = Math.round((count * 100) / this.Allfiles.length);
    //       this.loadingpercentage = percentage;
    //       this.changeDetectorRef.detectChanges();
    //       zip.file(file.name + file.ext, response.data, {
    //         binary: true,
    //       });
    //       ++count;
    //       if (count == this.Allfiles.length) {
    //         zip
    //           .generateAsync({
    //             type: "blob",
    //           })
    //           .then(function (content) {
    //             that.isDownloading = false;
    //             that.changeDetectorRef.detectChanges();
    //             saveAs(
    //               content,
    //               pestamp.personname + "_" + pestamp.email + ".zip"
    //             );
    //           });
    //       }
    //     });
    // });
    event.stopPropagation();
    this.isLoading = true;
    this.loadingmessage = "Downloading zip file"
    this.pestampService.downloadzipfile(pestamp.id).subscribe((result: any) => {
      this.isLoading = false;
      this.loadingmessage = "Please wait";
      this.changeDetectorRef.detectChanges();
      const link = document.createElement("a");
      link.href = result.data;
      link.download = pestamp.personname + "_" + pestamp.email + ".zip";
      link.click();
    },
      (error) => {
        this.isLoading = false;
        this.notifyService.showError(error, "Error");
      })
  }

  openOrderDesignDialog(pestamp, index): void {
    this.listactionindex = index;
    var pestamp = pestamp;
    let amounttopay: any;
    const dialogRef = this.dialog.open(OrderpestampsdialogComponent, {
      width: "30%",
      autoFocus: false,
      disableClose: true,
      panelClass: "white-modalbox",
      data: {
        isConfirmed: false,
        pestampid: pestamp.id,
        pestamp: pestamp,
        amounttopay: amounttopay,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.changeDetectorRef.detectChanges();
        this.finalAmountopay = result.amounttopay;
        this.updatepestamp(pestamp, result.amounttopay);
      }
    });
  }

  updatepestamp(record, amounttopay): void {
    const paymenttype = localStorage.getItem("paymenttype");

    if (paymenttype == "direct") {
      const inputdata = {
        amount: amounttopay,
        pestampid: record.id,
        user: this.loggedInUser.id,
        token: this.genericService.stripepaymenttoken.id,
      };
      this.pestampService.createdirectpayment(inputdata).subscribe(
        () => {
          this.sendPestamptowattmonk(record);
        },
        (error) => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.notifyService.showError(error, "Error");
        }
      );
    } else {
      this.sendPestamptowattmonk(record);
    }
  }

  sendPestamptowattmonk(record): void {
    const pestampacceptancestarttime = new Date();
    pestampacceptancestarttime.setMinutes(
      pestampacceptancestarttime.getMinutes() + 15
    );



    const postData = {
      outsourcedto: 232,
      isoutsourced: "true",
      status: "outsourced",
      paymenttype: localStorage.getItem("paymenttype"),
      pestampacceptancestarttime: pestampacceptancestarttime,
      paymentstatus: localStorage.getItem("paymentstatus"),
      amount: this.finalAmountopay,
    };

    this.pestampService.assignPestamp(record.id, postData).subscribe(
      (response) => {
        this.createNewPestampChatGroup(response);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  openAssignPEengineerDialog(
    record: Pestamp,
    event: Event,
    index,
    requesttype: string
  ): void {
    if (this.isClient) {
      this.activitybarClose();
      event.stopPropagation();
      this.getPestampsCharges(record, index);
    } else {
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(AssignpeengineersComponent, {
        width: "50%",
        disableClose: true,
        autoFocus: false,
        data: { isEditMode: false, pestamp: record, requesttype: requesttype },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.refreshDashboard) {
          this.isLoading = true;
          this.changeDetectorRef.detectChanges();
          this.fetchSearchData();
        }
      });
    }
  }
  declinePestampRequest(pestamp: Pestamp, event: Event, index: number): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openPestampDeclineDialog(pestamp);
  }

  openPestampDeclineDialog(record: Pestamp): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(PestampDeclineDialog, {
      width: "50%",
      disableClose: true,
      data: { pestamp: record },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.fetchSearchData();
      }
    });
  }

  acceptPestampRequest(pestamp: Pestamp, event: Event, index: number): void {
    this.isLoading = true;
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const cdate = Date.now();

    let postData;
    let acceptedbypesuperadmin;
    if (this.loggedInUser.role.id == ROLES.PESuperAdmin) {
      acceptedbypesuperadmin = true;
    } else {
      acceptedbypesuperadmin = false;
    }

    if (this.loggedInUser.role.id == ROLES.Peengineer) {
      postData = {
        acceptedbypeengineer: true,
        declinedbypeengineer: false,
      };
    } else {
      postData = {
        status: "accepted",
        designacceptanceendtime: cdate,
        acknowledgedby: this.loggedInUser.id,
        declinedbypeengineer: false,
        acceptedbypesuperadmin: acceptedbypesuperadmin,
      };
    }

    this.pestampService.editPestamp(pestamp.id, postData).subscribe(
      () => {
        this.fetchSearchData();
        this.notifyService.showSuccess(
          "PE Stamp request has been accepted successfully.",
          "Success"
        );
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

  createNewPestampChatGroup(pestamp: Pestamp): void {
    const GUID = pestamp.chatid;

    const name = pestamp.personname.substring(0, 60);
    const email = pestamp.email.substring(0, 60);
    const groupName = pestamp.type + "_" + name + "_" + email;

    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = pestamp.groupchatpassword

    const group = new CometChat.Group(GUID, groupName, groupType, password);
    const adminsid = [];
    this.wattmonkadmins.forEach((element) => {
      adminsid.push(element);
    });
    if (this.wattmonkadmins.length == 0) {
      adminsid.push(416);
      adminsid.push(456);
    }
    CometChat.createGroup(group).then(
      (group) => {
        const membersList = [
          new CometChat.GroupMember(
            "" + pestamp.createdby.cometchatuid,
            CometChat.GROUP_MEMBER_SCOPE.ADMIN
          ),
        ];
        adminsid.forEach((element) => {
          membersList.push(
            new CometChat.GroupMember(
              "" + element,
              CometChat.GROUP_MEMBER_SCOPE.ADMIN
            )
          );
        });
        CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
          () => {
            const chatgroupusers = [];
            chatgroupusers.push(pestamp.createdby.cometchatuid);
            chatgroupusers.push(pestamp.createdby.cometchatuid);
            const inputData = {
              title: groupName,
              guid: GUID,
              parentid: pestamp.createdby.parent.id,
              chatgroupusers: chatgroupusers,
            };
            this.commonService.addChatGroup(inputData).subscribe(() => {
              // do nothing.
            });
            this.changeDetectorRef.detectChanges();
            this.notifyService.showSuccess(
              "Pe Stamps request has been successfully assigned.",
              "Success"
            );
            this.fetchSearchData();
          },
          () => {
            // do nothing.
          }
        );
      },
      () => {
        // do nothing.
      }
    );
  }
  downloadprelimDesign(design: Design, event: Event): void {
    event.stopPropagation();
    let fileurl;
    let filename;
    if (design.requesttype == "prelim") {
      fileurl = design.prelimdesign.url;
      filename =
        "prelim_" + design.name + "_" + design.email + design.prelimdesign.ext;
    } else {
      fileurl = design.permitdesign.url;
      filename =
        "permit_" + design.name + "_" + design.email + design.permitdesign.ext;
    }

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

  pestampSelfAssign(record: Pestamp, event: Event): void {
    // this.loaderservice.show();
    event.stopPropagation();
    const pestampstarttime = new Date();

    const postData = {
      assignedto: this.loggedInUser.id,
      status: "assigned",
      pestampstarttime: pestampstarttime,
    };

    this.isLoading = true;
    this.loadingmessage = "Assigning";
    this.designService.assignPestamps(record.id, postData).subscribe(
      () => {
        // this.data.pestamp = response;
        // this.isLoading = true;

        this.isLoading = false;
        // this.addUserToGroupChat();
        this.notifyService.showSuccess(
          "PE Stamp request has been successfully self assigned.",
          "Success"
        );
        this.fetchSearchData();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  // /*  TIMER   */
  // startTimer(ev, design) {
  //   ev.stopPropagation();
  //   let starttime;
  //   this.hour = 0;
  //   this.minutes = 0;
  //   this.timer = 0;
  //   this.totalminutes = 0;
  //   starttime = new Date().getTime();
  //   // this.countDown = timer(0, this.tick).subscribe(() => this.counter++);
  //   let postdata = {
  //     starttime: starttime,
  //     designid: design.id,
  //     userid: this.loggedInUser.id
  //   }
  //   this.designService.startTime(postdata).subscribe((res: JobsTiming) => {
  //     this.job = res;
  //     this.disablestartbutton = true;
  //     this.istimerstart = true;
  //     this.intervalId = setInterval(() => {
  //       if (this.timer >= 60) {
  //         this.timer = 0;
  //       }
  //       this.totalminutes = this.minutes + (this.hour * 60);
  //       this.timer++;
  //       this.totalminutes = (this.totalminutes * 60) + this.timer;
  //       this.display = this.transform(this.timer);

  //     }, 1000);
  //   },
  //     (error) => {
  //       this.notifyService.showError(error, "Error");
  //     })
  //   this.changeDetectorRef.detectChanges();
  // }

  // transform(value: number): string {
  //   let hrs = 0;
  //   let mins = 0;
  //   var sec_num = value;
  //   // if (type == 'start') {
  //   //   this.hour = Math.floor(sec_num / 3600);
  //   //   console.log(this.minutes)
  //   //   this.minutes = (Math.floor((sec_num - (this.hour * 3600)) / 60));
  //   //   console.log(this.minutes)
  //   //   sec_num - (this.hour * 3600) - (this.minutes * 60);
  //   // }
  //   // else {
  //   hrs = Math.floor(sec_num / 3600);
  //   mins = Math.floor(sec_num / 60);
  //   this.minutes += mins;

  //   this.hour += hrs;
  //   // sec_num - (this.hour * 3600) - (this.minutes * 60);
  //   // }
  //   if (sec_num >= 60) {
  //     sec_num = 0;
  //   }

  //   return this.hour + 'h' + ' : ' + this.minutes + 'm' + ' : ' + sec_num + 's';
  // }

  // getJobTime() {
  //   let currenttime;
  //   let newtimer;
  //   let starttime;
  //   this.designService.getJobTime().subscribe((res) => {
  //     console.log(res)
  //     if (res.length) {
  //       if (res[0].taskstatus == 'pending' && !res[0].canceled) {
  //         this.disablestartbutton = true;
  //         this.job = res[0];

  //         // else {

  //         starttime = new Date(res[0].starttime).getTime();
  //         currenttime = new Date().getTime();
  //         newtimer = currenttime - starttime;

  //         let sec: any = Math.floor(newtimer / 1000);
  //         this.hour = Math.floor(sec / 3600);
  //         // sec -= this.hour * 3600;
  //         this.minutes = Math.floor(sec / 60);
  //         // this.totalminutes = this.minutes;
  //         sec -= this.minutes * 60;
  //         this.minutes = this.minutes % 60;
  //         sec = '' + sec;
  //         sec = ('00' + sec).substring(sec.length);

  //         this.intervalId = setInterval(() => {
  //           if (sec >= 60) {
  //             sec = 0;
  //           }
  //           this.totalminutes = this.minutes + (this.hour * 60);
  //           sec++;
  //           this.totalminutes = (this.totalminutes * 60) + sec;
  //           this.display = this.transform(sec);
  //           this.changeDetectorRef.detectChanges();
  //         }, 1000);
  //       }
  //     }
  //     else {
  //       this.totalminutes = 0;
  //       this.minutes = 0;
  //       this.hour = 0;
  //       this.disablestartbutton = false;
  //       clearInterval(this.intervalId);
  //       this.timer = 0;
  //       this.job = new JobsTiming();
  //     }
  //   },
  //     (error) => {
  //       this.notifyService.showError(error, "Error");
  //     })
  // }

  applyCardCss(i, record) {
    // let istimeexceed: boolean = false;
    // if (record.requesttype == 'prelim') {
    // if (record?.taskoverdue || (this.totalminutes > this.prelimdesigner && record?.tasktimings?.designid == record.id)) {
    //   istimeexceed = true;
    // }
    // else {
    //   istimeexceed = false;
    // }
    if (i % 2 == 0) {
      if ((record?.newtasktimings?.isjobtimeexceeded || record?.taskoverdue) && (this.isWattmonkUser || this.isUserDesigner || this.isUserAnalyst)) {
        return 'itemcard even jobtime';
      }
      else {
        return 'itemcard even';
      }
    }
    else {
      if ((record?.newtasktimings?.isjobtimeexceeded || record?.taskoverdue) && (this.isWattmonkUser || this.isUserDesigner || this.isUserAnalyst)) {
        return 'itemcard odd jobtime';
      }
      else {
        return 'itemcard odd';
      }
    }
    // }
    // else if (record.requesttype == 'permit') {
    //   // if ((record?.tasktimings?.isdesignertimeexceeded || record?.tasktimings?.isanalysttimeexceeded || this.totalminutes > this.permitdesigner) && record?.tasktimings?.designid == record.id) {
    //   //   istimeexceed = true;
    //   // }
    //   // else {
    //   //   istimeexceed = false;
    //   // }
    //   if (i % 2 == 0) {
    //     if (record?.newtasktimings?.isjobtimeexceeded || record?.taskoverdue) {
    //       return 'itemcard even jobtime';
    //     }
    //     else {
    //       return 'itemcard even';
    //     }
    //   }
    //   else {
    //     if (record?.newtasktimings?.isjobtimeexceeded || record?.taskoverdue) {
    //       return 'itemcard odd jobtime';
    //     }
    //     else {
    //       return 'itemcard odd';
    //     }
    //   }
    // }
  }
}
