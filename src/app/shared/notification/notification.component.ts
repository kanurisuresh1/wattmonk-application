import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { Location } from "@angular/common";
import { HttpHeaders } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from "@angular/core";
import { AngularFireObject } from "@angular/fire/database";
import { FormControl } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
import { AddminpermitdesigndialogComponent } from "src/app/home/dashboard/permitdesign/addminpermitdesigndialog/addminpermitdesigndialog.component";
import { AddpestampdialogComponent } from "src/app/home/dashboard/pestamp/addpestampdialog/addpestampdialog.component";
import { AdddesigndialogComponent } from "src/app/home/dashboard/prelimdesign/adddesigndialog/adddesigndialog.component";
import { AddprelimproposaldialogComponent } from "src/app/home/dashboard/prelimdesign/addprelimproposaldialog/addprelimproposaldialog.component";
import { AddsurveydialogComponent } from "src/app/home/dashboard/survey/addsurveydialog/addsurveydialog.component";
import { ROLES } from "src/app/_helpers";
import { Design, Pestamp, User } from "src/app/_models";
import { Notification } from "src/app/_models/notification";
import { Survey } from "src/app/_models/survey";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  LoaderService,
  PestampService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { NotificationService } from "src/app/_services/notification.service";
import { SurveyService } from "src/app/_services/survey.service";
import { TeamService } from "src/app/_services/team.service";
import { LoaderComponent } from "../loader/loader.component";
import { MasterdetailpageComponent } from "../masterdetailpage/masterdetailpage.component";
import { NavbarComponent } from "../navbar/navbar.component";

export interface RouteInfo {
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
}

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent implements OnInit {
  notification: Notification[];
  headers: HttpHeaders;
  formheaders: HttpHeaders;
  authenticationService: AuthenticationService;
  listTitles: any[];
  location: Location;
  viewAllButtonVisible = true;
  mobile_menu_visible: any = 0;
  nativeElement: Node;
  toggleButton: any;
  sidebarVisible: boolean;
  _router: Subscription;
  loggedinUser: User;
  userrole: string = "";
  isadmin = true;
  isClient = false;
  userinitials = "";
  all = 0;
  notifications: Notification[] = [];
  notificationId;
  notificationids: any[] = [];
  maintitle = "Dashboard";
  allNotificationfetched = false;
  isnotificationloading = true;
  markAllAsReadbtn = false;
  @Input() markAllAsReadList;

  @ViewChild("app-navbar", { static: false }) button: any;
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  @ViewChild("notificationscroll")
  notificationviewport: CdkVirtualScrollViewport;
  // @ViewChild('searchinputfield') searchfieldref: MatInput;

  color: ThemePalette = "primary";
  notificationPostData;

  getemail = new FormControl("");
  getnotification = new FormControl("");
  requestgeneratednotification = new FormControl("");
  requestacknowledgementnotification = new FormControl("");
  requestindesigningnotification = new FormControl("");
  designcompletednotification = new FormControl("");
  designreviewpassednotification = new FormControl("");
  designonholdnotification = new FormControl("");
  designmovedtoqcnotification = new FormControl("");
  designreviewfailednotification = new FormControl("");
  designdeliverednotification = new FormControl("");
  requestgeneratedemail = new FormControl("");
  requestacknowledgementemail = new FormControl("");
  requestindesigningemail = new FormControl("");
  designcompletedemail = new FormControl("");
  designmovedtoqcemail = new FormControl("");
  designreviewfailedemail = new FormControl("");
  designreviewpassedemail = new FormControl("");
  designdeliveredemail = new FormControl("");
  // private isProfileSecOption: boolean = false

  maintourRef: AngularFireObject<any>;

  isDesigner: boolean;
  getclientsrole = 0;
  dropMenuOptions = false;
  currentUrl: any;
  prelimDesign = null;
  surveyDetails = null;
  permitDetails = null;
  pestampDetails = null;
  dialogRef: any;
  limit = 10;
  skip = 0;
  scrolling: boolean = false;
  allNotifications: number;
  notificationlist: any[] = [];

  constructor(
    // public dialogRef: MatDialogRef<NotificationComponent>,
    location: Location,
    // private http: HttpClient,
    public dialog: MatDialog,
    public designService: DesignService,
    private element: ElementRef,
    private router: Router,
    private _snackBar: MatSnackBar,
    private authService: AuthenticationService,
    public genericService: GenericService,
    private commonService: CommonService,
    private notifyService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private pestampService: PestampService,
    private surveyService: SurveyService,
    private teamService: TeamService,
    // private db: AngularFireDatabase,
    private navbar: NavbarComponent,
    private loader: LoaderComponent,
    private loaderservice: LoaderService // private dialogNoti: MatDialogRef<NotificationComponent>
  ) {
    this.eventEmitterService.notificationrefresh.subscribe(() => {
      // console.log(res);
      this.isnotificationloading = true;
      this.notifications = [];
      this.notificationlist = [];
      this.getAllNotificationsCount();
      this.getNotifications();
    });
    this.authenticationService = authService;
    this.location = location;
    this.nativeElement = this.element.nativeElement;
    this.sidebarVisible = false;
    this.loggedinUser = this.authService.currentUserValue.user;
    this.isadmin = genericService.isUserAdmin(this.loggedinUser);
    this.userinitials = this.genericService.getInitials(
      this.loggedinUser.firstname,
      this.loggedinUser.lastname
    );

    if (
      this.loggedinUser.role.id == ROLES.Designer ||
      this.loggedinUser.role.id == ROLES.Analyst
    ) {
      this.isDesigner = true;
    } else {
      this.isDesigner = false;
    }

    if (
      this.loggedinUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedinUser.role.id == ROLES.ContractorAdmin ||
      this.loggedinUser.role.id == ROLES.SuccessManager ||
      this.loggedinUser.role.id == ROLES.Master ||
      (this.loggedinUser.role.id == ROLES.BD &&
        this.loggedinUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }

    // dialogNoti.disableClose = true;
  }

  async getData() {
    await this.genericService.getUnreadMessageCountForGroupsAsyc();
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    // setInterval(async () => {
    // await this.getData();
    // }, 30000);
    this.getAllNotificationsCount();
    this.getNotifications();

    // this.maintitle = this.getTitle();

    this.eventEmitterService.sidebarRouteChange.subscribe((title) => {
      this.maintitle = title;
      this.changeDetectorRef.detectChanges();
    });
    this.teamService.getClientRole(this.loggedinUser.parent.id).subscribe(
      (response) => {
        this.getclientsrole = response.length;

        if (response.length > 0 && response[0].client.id != 232) {
          let specificclientid;
          if (response[0].id && response[0].client.id != 232) {
            specificclientid = response[0].client.id;
          } else {
            specificclientid = "";
          }

          if (
            this.loggedinUser.role.id == 3 &&
            this.loggedinUser.parent.id == specificclientid
          ) {
            this.userrole = "Sales Manager";
          } else if (
            this.loggedinUser.role.id == 9 &&
            this.loggedinUser.parent.id == specificclientid
          ) {
            this.userrole = "Sales Representative";
          } else if (
            this.loggedinUser.role.id == 15 &&
            this.loggedinUser.parent.id == specificclientid
          ) {
            this.userrole = "Master Electrician";
          } else if (
            this.loggedinUser.role.id == 6 &&
            this.loggedinUser.parent.id == specificclientid
          ) {
            this.userrole = "Super Admin";
          } else if (
            this.loggedinUser.role.id == 7 &&
            this.loggedinUser.parent.id == specificclientid
          ) {
            this.userrole = "Admin";
          } else {
            this.userrole = this.loggedinUser.role.name;
          }
        } else {
          if (this.loggedinUser.role.id == 10) {
            this.userrole = "Analyst";
          } else if (this.loggedinUser.role.id == 9) {
            this.userrole = "Surveyor";
          } else if (
            this.loggedinUser.role.id == 4 ||
            this.loggedinUser.role.id == 6
          ) {
            this.userrole = "Super Admin";
          } else if (
            this.loggedinUser.role.id == 5 ||
            this.loggedinUser.role.id == 7
          ) {
            this.userrole = "Admin";
          } else if (this.loggedinUser.role.id == 3) {
            this.userrole = "Design Manager";
          } else {
            this.userrole = this.loggedinUser.role.name;
          }
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  hasRoute(route: string) {
    return this.router.url.includes(route);
  }

  ngOnDestroy(): void {
    this.notifications = [];
    this.notificationlist = [];
    this.isnotificationloading = true;
    this.skip = 0;
  }

  onCloseClick(): void {
    this._snackBar.dismiss();
    this.notifications = [];
    this.notificationlist = [];
    this.skip = 0;
  }

  goback(): void {
    this.location.back();
  }

  // onMainTourDone() {
  //   this.maintourRef.update({ maintour: true });
  // }

  getAllUnreadNotification(): void {
    this.commonService.getUnreadNotification(1000).subscribe(
      (response) => {
        if (response.length != 0) {
          this.markAllAsReadbtn = true;
        } else {
          this.markAllAsReadbtn = false;
        }
        this.notifications = response;
        this.allNotificationfetched = true;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
    this.viewAllButtonVisible = false;
  }
  markAllAsRead($ev): void {
    // this.markAllAsReadbtn = false;

    const postData = {
      userid: this.loggedinUser.id,
    };
    $ev.stopPropagation();
    /* $ev.preventDefault(); */
    this.loaderservice.show();
    this.commonService.notificationMarkAllAsRead(postData).subscribe(
      (response) => {
        this.loaderservice.hide();
        this.markAllAsReadbtn = false;
        this.markAllAsReadList = true;
        this.navbar.getUnreadNotifications();
        this.notifications = response;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getPath() {
    return this.location.prepareExternalUrl(this.location.path());
  }

  preventBack(): void {
    window.history.forward();
  }

  fetchPestampDetails(pestampid): void {
    console.log("i was in pestamp");
    this.loaderservice.show();
    this.pestampService.getPestampDetails(pestampid).subscribe(
      (response) => {
        this.pestampDetails = response;
        if (response.designid != null) {
          console.log("i was in pestamp 2");
          this.fetchPermitDesignDetails(response.designid);
        } else {
          this.openDetailDialog();
          this.loaderservice.hide();
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }
  fetchPermitDesignDetails(designid): void {
    console.log("i was in permit");
    this.loaderservice.show();
    this.designService.getDesignDetails(designid).subscribe(
      (response) => {
        this.permitDetails = response;
        if (response.surveyid != null) {
          console.log("i was in permit 2 ");
          this.fetchSurveyDetails(response.surveyid);
        } else {
          this.openDetailDialog();
          this.loaderservice.hide();
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }
  fetchSurveyDetails(surveyid): void {
    console.log("i was in survey");
    this.loaderservice.show();
    this.surveyService.getSurveyDetails(surveyid).subscribe(
      (response) => {
        this.surveyDetails = response;
        if (response.designid != null) {
          console.log("i was in survey 2");
          this.fetchDesignDetails(response.designid);
        } else {
          this.openDetailDialog();
          this.loaderservice.hide();
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }
  openDetailDialog(): void {
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        prelim: this.prelimDesign,
        survey: this.surveyDetails,
        permit: this.permitDetails,
        pestamp: this.pestampDetails,
        triggerPrelimEditEvent: false,
        triggerSurveyEditEvent: false,
        triggerPermitEditEvent: false,
        triggerPestampEditEvent: false,
        triggerDeleteEvent: false,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      //this._snackBar.dismiss();
      if (result.triggerPestampEditEvent) {
        this.openEditPetamp(this.pestampDetails);
      } else if (result.triggerPermitEditEvent) {
        this.openEditMinPermitDesignDialog(this.permitDetails);
      } else if (result.triggerSurveyEditEvent) {
        this.openEditSurveyDialog(this.surveyDetails);
      } else if (result.triggerPrelimEditEvent) {
        if (this.prelimDesign.requirementtype == "proposal") {
          this.openEditProposalDesignDialog(this.prelimDesign);
        } else {
          this.openEditDesignDialog(this.prelimDesign);
        }
      }
    });
  }

  openEditMinPermitDesignDialog(design: Design): void {
    const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
      }
    });
  }
  openEditProposalDesignDialog(design: Design): void {
    const dialogRef = this.dialog.open(AddprelimproposaldialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }

  openEditDesignDialog(design: Design): void {
    const dialogRef = this.dialog.open(AdddesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }
  openEditPetamp(pestamp: Pestamp): void {
    const dialogRef = this.dialog.open(AddpestampdialogComponent, {
      disableClose: true,
      width: "80%",
      autoFocus: false,
      data: { isEditMode: true, isDataUpdated: false, pestamp: pestamp },
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }
  openEditSurveyDialog(survey: Survey): void {
    const dialogRef = this.dialog.open(AddsurveydialogComponent, {
      width: "70%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, survey: survey },
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }
  openDesignDetailDialog(data): void {
    this.prelimDesign = null;
    this.permitDetails = null;
    this.surveyDetails = null;
    this.pestampDetails = null;
    console.log("data", data);
    if (data.type == "design") {
      if (data.design.requesttype == "prelim") {
        this.fetchDesignDetails(data.designid);
      } else if (data.design.requesttype == "permit") {
        this.fetchPermitDesignDetails(data.designid);
      }
    } else if (data.type == "pestamp") {
      this.fetchPestampDetails(data.pestampid);
    } else if (data.type == "survey") {
      this.fetchSurveyDetails(data.surveyid);
    }
  }
  fetchDesignDetails(designid): void {
    console.log("i was in prelim");
    this.loaderservice.show();
    this.designService.getDesignDetails(designid).subscribe(
      (response) => {
        this.prelimDesign = response;
        this.openDetailDialog();
        this.loaderservice.hide();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }

  notificationStatusRead($ev, record: Notification): void {
    $ev.preventDefault();
    this.loader.isLoading = new BehaviorSubject<boolean>(true);
    if (record.status == "unread") {
      const postData = {
        status: "read",
      };

      this.commonService.markNotificationRead(record.id, postData).subscribe(
        () => {
          record.status = "read";
          this.changeDetectorRef.detectChanges();
        },
        () => {
          // do nothing.
        }
      );
    }
    this.openDesignDetailDialog(record);
  }

  togglebutton($event: MatSlideToggle, type: string): void {
    if (type == "getemail") {
      this.notificationPostData = {
        getemail: $event.checked,
      };
    } else if (type == "getnotification") {
      this.notificationPostData = {
        getnotification: $event.checked,
      };
    } else if (type == "requestgeneratednotification") {
      this.notificationPostData = {
        requestgeneratednotification: $event.checked,
      };
    } else if (type == "requestacknowledgementnotification") {
      this.notificationPostData = {
        requestacknowledgementnotification: $event.checked,
      };
    } else if (type == "requestindesigningnotification") {
      this.notificationPostData = {
        requestindesigningnotification: $event.checked,
      };
    } else if (type == "designcompletednotification") {
      this.notificationPostData = {
        designcompletednotification: $event.checked,
      };
    } else if (type == "designreviewpassednotification") {
      this.notificationPostData = {
        designreviewpassednotification: $event.checked,
      };
    } else if (type == "designonholdnotification") {
      this.notificationPostData = {
        designonholdnotification: $event.checked,
      };
    } else if (type == "designmovedtoqcnotification") {
      this.notificationPostData = {
        designmovedtoqcnotification: $event.checked,
      };
    } else if (type == "designreviewfailednotification") {
      this.notificationPostData = {
        designreviewfailednotification: $event.checked,
      };
    } else if (type == "designdeliverednotification") {
      this.notificationPostData = {
        designdeliverednotification: $event.checked,
      };
    } else if (type == "requestgeneratedemail") {
      this.notificationPostData = {
        requestgeneratedemail: $event.checked,
      };
    } else if (type == "requestacknowledgementemail") {
      this.notificationPostData = {
        requestacknowledgementemail: $event.checked,
      };
    } else if (type == "requestindesigningemail") {
      this.notificationPostData = {
        requestindesigningemail: $event.checked,
      };
    } else if (type == "designcompletedemail") {
      this.notificationPostData = {
        designcompletedemail: $event.checked,
      };
    } else if (type == "designmovedtoqcemail") {
      this.notificationPostData = {
        designmovedtoqcemail: $event.checked,
      };
    } else if (type == "designreviewfailedemail") {
      this.notificationPostData = {
        designreviewfailedemail: $event.checked,
      };
    } else if (type == "designreviewpassedemail") {
      this.notificationPostData = {
        designreviewpassedemail: $event.checked,
      };
    } else if (type == "designdeliveredemail") {
      this.notificationPostData = {
        designdeliveredemail: $event.checked,
      };
    }

    this.authService.setRequiredHeaders();
    this.authService
      .editUserProfile(
        this.authService.currentUserValue.user.id,
        this.notificationPostData
      )
      .subscribe(
        (response) => {
          this.authService.currentUserValue.user = response;
          this.notifyService.showSuccess(
            "Changes saved successfully",
            "Success"
          );
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  getNotifications(): void {
    this.commonService.getNotifications(this.limit, this.skip).subscribe(
      (response) => {
        // console.log(response);
        this.isnotificationloading = false;

        this.notificationlist = response;
        for (let i = 0, len = this.notificationlist.length; i < len; ++i) {
          this.notifications.push(this.notificationlist[i]);
          if (this.notificationlist[i].status == "unread") {
            this.markAllAsReadbtn = true;
          }
        }
        this.notifications = [...this.notifications];
        // console.log(this.notifications);
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
        this.isnotificationloading = false;
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getAllNotificationsCount(): void {
    this.commonService.getAllNotificationsCount().subscribe((response) => {
      // console.log(response);
      this.allNotifications = response;
    });
  }

  onScroll(): void {
    this.loader.isLoading = new BehaviorSubject<boolean>(false);
    const end = this.notificationviewport.getRenderedRange().end;
    const total = this.notificationviewport.getDataLength();
    if (end == total && this.allNotifications > total) {
      this.scrolling = true;
      this.changeDetectorRef.detectChanges();
      this.skip += 10;
      this.limit = 10;
      this.getNotifications();
    }
  }
}
