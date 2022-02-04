import { Location } from "@angular/common";
import { HttpHeaders } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import { FormControl } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MatDialog } from "@angular/material/dialog";
import { MatInput } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { FIREBASE_DB_CONSTANTS, ROLES } from "src/app/_helpers";
import { CurrentUser, User } from "src/app/_models";
import { Notification } from "src/app/_models/notification";
import {
  AuthenticationService,
  ContractorService,
  DesignService,
  GenericService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { NotificationService } from "src/app/_services/notification.service";
import { TeamService } from "src/app/_services/team.service";
import { AccountUpdateComponent } from "../AccountUpdate/account-update.component";
import { MyaccountComponent } from "../myaccount/myaccount.component";
import { NotificationComponent } from "../notification/notification.component";
import { ROUTES } from "../sidebar/sidebar.component";

const misc: any = {
  navbar_menu_visible: 0,
  active_collapse: true,
  disabled_collapse_init: 0,
};
export interface RouteInfo {
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
}

// declare let $: any;

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  activeNotices = 0;
  clientNotices = [];

  currentUser: CurrentUser;

  notification: Notification[];
  headers: HttpHeaders;
  formheaders: HttpHeaders;
  authenticationService: AuthenticationService;
  private listTitles: any[];
  location: Location;
  viewAllButtonVisible = true;
  mobile_menu_visible: any = 0;
  nativeElement: Node;
  private toggleButton: any;
  private sidebarVisible: boolean;
  loggedinUser: User;
  userrole: string = "";
  isadmin = true;
  isPeEngineer = false;
  isClient = false;

  userinitials = "";
  all = 0;
  notifications: Notification[] = [];
  notificationId;
  notificationids: any[] = [];
  maintitle = "Dashboard";
  allNotificationfetched = false;
  @ViewChild("app-navbar", { static: false }) button: any;
  @ViewChild("searchinputfield") searchfieldref: MatInput;
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

  maintourRef: AngularFireObject<any>;
  clientTypeUpdate: AngularFireObject<any>;

  isDesigner: boolean;
  isClientAdmins: boolean;
  getclientsrole = 0;
  dropMenuOptions = false;
  currentUrl: any;
  prelimDesign = null;
  surveyDetails = null;
  permitDetails = null;
  pestampDetails = null;
  isPrepaidClient = false;
  iscontracterSuperAdmin = ROLES.ContractorSuperAdmin;
  dialogRef: any;
  disblerightIcons: boolean = true;

  unreadnotificationscount: number;
  onNotification = false;
  showSettings: boolean = false;

  allAlertAnnouncment = [];

  constructor(
    location: Location,
    public dialog: MatDialog,
    public designService: DesignService,
    public contractorService: ContractorService,
    private element: ElementRef,
    private router: Router,
    private _snackBar: MatSnackBar,
    private authService: AuthenticationService,
    public genericService: GenericService,
    private commonService: CommonService,
    private notifyService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private teamService: TeamService,
    private db: AngularFireDatabase // private loader: LoaderService
  ) {
    this.authenticationService = authService;
    this.location = location;
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
    this.loggedinUser = this.authService.currentUserValue.user;
    this.currentUser = authService.currentUserValue;
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
      this.loggedinUser.role.id == ROLES.ContractorAdmin ||
      this.loggedinUser.role.id == ROLES.SuccessManager ||
      this.loggedinUser.role.id == ROLES.ContractorSuperAdmin
    ) {
      this.isClientAdmins = true;
    } else {
      this.isClientAdmins = false;
    }

    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + this.authService.currentUserValue.jwt,
    });

    this.eventEmitterService.chatItemSelected.subscribe((count) => {
      this.genericService.totalcountsforallgroups =
        this.genericService.totalcountsforallgroups - count;
    });

    /**Firebase object call if type of user change as Postpaid to Prepaid */
    this.clientTypeUpdate = this.db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + this.loggedinUser.parent.id
    );
    // Avoiding firstime login pop by resetting the variable
    this.clientTypeUpdate.update({ paymentmodechange: false });

    if (this.loggedinUser.paymentmodechangepopvisible) {
      setTimeout(() => {
        this.accountUpdate(this.loggedinUser.ispaymentmodeprepay, false);
      }, 7000);
    }
  }

  async getData() {
    await this.genericService.getUnreadMessageCountForGroupsAsyc();
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    this.getNotices();
    this.getAlertAnnouncement();

    this.eventEmitterService.currentUserDataRefresh.subscribe(() => {
      this.loggedinUser = this.authService.currentUserValue.user;
    });
    if (
      this.loggedinUser.role.name == "SuperAdmin" ||
      this.loggedinUser.role.name == "ContractorSuperAdmin"
    ) {
      this.showSettings = true;
    } else {
      this.showSettings = false;
    }

    setInterval(async () => {
      await this.getData();
    }, 30000);
    this.getUnreadNotifications();
    this.maintourRef = this.db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + this.loggedinUser.parent.id
    );
    this.onMainTourDone();
    if (window.innerWidth < 780) {
      const body = document.getElementsByTagName("body")[0];

      if (misc.sidebar_mini_active === true) {
        body.classList.remove("sidebar-mini");
        misc.sidebar_mini_active = false;
      } else {
        body.classList.add("sidebar-mini");
        misc.sidebar_mini_active = true;
      }
    }

    /**If user using the platform then type of
     * user changes from Prepaid to Postpaid then to logout the user.
     */

    this.clientTypeUpdate.valueChanges().subscribe((res) => {
      if (res?.key) {
        this.accountUpdate(!this.loggedinUser.ispaymentmodeprepay, res.key);
      }
    });

    // this.commonService.getUnreadNotification(8).subscribe(
    //   (response) => {
    //     console.log(response);
    //     this.notifications = response;
    //     this.changeDetectorRef.detectChanges();
    //   },
    //   (error) => {
    //     this.notifyService.showError(error, "Error");
    //   }
    // );

    this.listTitles = ROUTES.filter((listTitle) => listTitle);
    const navbar: HTMLElement = this.element.nativeElement;
    const body = document.getElementsByTagName("body")[0];
    this.toggleButton = navbar.getElementsByClassName("navbar-toggler")[0];
    if (body.classList.contains("sidebar-mini")) {
      misc.sidebar_mini_active = true;
    }
    if (body.classList.contains("hide-sidebar")) {
      misc.hide_sidebar_active = true;
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidebarClose();

        const $layer = document.getElementsByClassName("close-layer")[0];
        if ($layer) {
          $layer.remove();
        }
      });

    this.maintitle =
      localStorage.getItem("lastroutetitle") == undefined
        ? "Dashboard"
        : localStorage.getItem("lastroutetitle");

    this.eventEmitterService.sidebarRouteChange.subscribe((title) => {
      this.maintitle = title;
      this.changeDetectorRef.detectChanges();
    });
    this.eventEmitterService.disableNavbarMenu.subscribe((data) => {
      this.disblerightIcons = data;

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
      () => {
        //this.notifyService.showError(error, "Error");
      }
    );
  }
  hasRoute(route: string) {
    return this.router.url.includes(route);
  }

  goback(): void {
    this.location.back();
  }

  onMainTourDone(): void {
    this.maintourRef.update({ maintour: true });
  }

  getAllUnreadNotification($ev): void {
    $ev.stopPropagation();
    /* $ev.preventDefault(); */
    this.commonService.getUnreadNotification(1000).subscribe(
      (response) => {
        this.notifications = response;
        this.unreadnotificationscount = 0;
        this.allNotificationfetched = true;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
    this.viewAllButtonVisible = false;
  }
  onChatButtonClick(): void {
    if (this.loggedinUser.role.id == ROLES.Designer) {
      this.genericService.backroute = "/home/dashboard/overview/designer";
    } else if (this.loggedinUser.role.id == ROLES.Surveyor) {
      this.genericService.backroute = "/home/dashboard/overview/surveyor";
    } else if (this.loggedinUser.role.id == ROLES.Analyst) {
      this.genericService.backroute = "/home/dashboard/overview/analyst";
    } else if (this.loggedinUser.role.id == ROLES.Peengineer) {
      this.genericService.backroute = "/home/dashboard/overview/peengineer";
    }
    this.router.navigate(["/home/inbox/messages"]);
    this.eventEmitterService.inboxDashboardRefresh.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  minimizeSidebar(): void {
    const body = document.getElementsByTagName("body")[0];

    if (misc.sidebar_mini_active === true) {
      body.classList.remove("sidebar-mini");
      misc.sidebar_mini_active = false;
    } else {
      setTimeout(function () {
        body.classList.add("sidebar-mini");

        misc.sidebar_mini_active = true;
      }, 300);
    }

    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(function () {
      window.dispatchEvent(new Event("resize"));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(function () {
      clearInterval(simulateWindowResize);
    }, 1000);
  }

  hideSidebar(): void {
    const body = document.getElementsByTagName("body")[0];
    const sidebar = document.getElementsByClassName("sidebar")[0];

    if (misc.hide_sidebar_active === true) {
      setTimeout(function () {
        body.classList.remove("hide-sidebar");
        misc.hide_sidebar_active = false;
      }, 300);
      setTimeout(function () {
        sidebar.classList.remove("animation");
      }, 600);
      sidebar.classList.add("animation");
    } else {
      setTimeout(function () {
        body.classList.add("hide-sidebar");
        // $('.sidebar').addClass('animation');
        misc.hide_sidebar_active = true;
      }, 300);
    }

    // we simulate the window Resize so the charts will get updated in realtime.
    const simulateWindowResize = setInterval(function () {
      window.dispatchEvent(new Event("resize"));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(function () {
      clearInterval(simulateWindowResize);
    }, 1000);
  }

  sidebarOpen(): void {
    const $toggle = document.getElementsByClassName("navbar-toggler")[0];
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName("body")[0];
    setTimeout(function () {
      toggleButton.classList.add("toggled");
    }, 500);
    body.classList.add("nav-open");
    setTimeout(function () {
      $toggle.classList.add("toggled");
    }, 430);

    const $layer = document.createElement("div");
    $layer.setAttribute("class", "close-layer");

    if (body.querySelectorAll(".main-panel")) {
      document.getElementsByClassName("main-panel")[0].appendChild($layer);
    } else if (body.classList.contains("off-canvas-sidebar")) {
      document
        .getElementsByClassName("wrapper-full-page")[0]
        .appendChild($layer);
    }

    setTimeout(function () {
      $layer.classList.add("visible");
    }, 100);

    $layer.onclick = function () {
      //asign a function
      body.classList.remove("nav-open");
      this.mobile_menu_visible = 0;
      this.sidebarVisible = false;

      $layer.classList.remove("visible");
      setTimeout(function () {
        $layer.remove();
        $toggle.classList.remove("toggled");
      }, 400);
    }.bind(this);

    body.classList.add("nav-open");
    this.mobile_menu_visible = 1;
    this.sidebarVisible = true;
  }
  sidebarClose(): void {
    // let $toggle = document.getElementsByClassName("navbar-toggler")[0];
    const body = document.getElementsByTagName("body")[0];
    // this.toggleButton.classList.remove("toggled");
    const $layer = document.createElement("div");
    $layer.setAttribute("class", "close-layer");

    this.sidebarVisible = false;
    body.classList.remove("nav-open");
    // $('html').removeClass('nav-open');
    body.classList.remove("nav-open");
    if ($layer) {
      $layer.remove();
    }

    // setTimeout(function() {
    //   $toggle.classList.remove("toggled");
    // }, 400);

    this.mobile_menu_visible = 0;
  }
  sidebarToggle(): void {
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
  }

  getTitle() {
    let titlee = this.location.prepareExternalUrl(this.location.path());

    if (titlee.charAt(0) === "#") {
      titlee = titlee.slice(1);
    }
    for (let i = 0; i < this.listTitles.length; i++) {
      if (
        this.listTitles[i].type === "link" &&
        this.listTitles[i].path === titlee
      ) {
        return this.listTitles[i].title;
      } else if (this.listTitles[i].type === "sub") {
        for (let j = 0; j < this.listTitles[i].children.length; j++) {
          const subtitle =
            this.listTitles[i].path + "/" + this.listTitles[i].children[j].path;
          if (subtitle === titlee) {
            return this.listTitles[i].children[j].title;
          }
        }
      }
    }
    return "Dashboard";
  }
  getPath() {
    return this.location.prepareExternalUrl(this.location.path());
  }

  preventBack(): void {
    window.history.forward();
  }

  handleusersignout(): void {
    localStorage.clear();
    //this.router.navigate(['/auth/login']);

    window.location.href = "/auth/login";
    setTimeout(function () {
      "preventBack()";
    }, 0);
    window.onunload = function () {
      // null;
    };
  }

  gotoSetting(): void {
    this.genericService.backroute = localStorage.getItem("lastroute");
    this.eventEmitterService.onSidebarRouteChange("Setting");
  }
  // get sortData() {
  //   return this.notifications.sort((a, b) => {
  //     return <any>new Date(b.created_at) - <any>new Date(a.created_at);
  //   });
  // }

  gotosetting(): void {
    this.genericService.backroute = localStorage.getItem("lastroute");
  }
  runproductTour(): void {
    // console.log("tour");
    this.genericService.runmaintour = true;
    this.eventEmitterService.onSidebarRefresh();
    this.changeDetectorRef.detectChanges();
    // console.log("product",this.genericService.runmaintour);
  }

  getUnreadNotifications(): void {
    /* $ev.preventDefault(); */
    this.commonService.getUnreadNotifications().subscribe(
      (response) => {
        this.unreadnotificationscount = response;
        this.allNotificationfetched = true;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
    this.viewAllButtonVisible = false;
  }

  turnOnNotification(): void {
    this.onNotification = true;
    this.unreadnotificationscount = 0;
  }

  openNotificationSnackbar(): void {
    let navbarWidth;
    if (
      this.loggedinUser.role.id == ROLES.Designer ||
      this.loggedinUser.role.id == ROLES.Analyst ||
      this.loggedinUser.role.id == ROLES.Peengineer ||
      this.loggedinUser.role.id == ROLES.Surveyor
    ) {
      navbarWidth = "navbar-Designer";
    } else {
      navbarWidth = "navbar-admin";
    }

    this._snackBar.openFromComponent(NotificationComponent, {
      verticalPosition: "top",
      horizontalPosition: "end",
      panelClass: ["notification-navbar", "navbar-options", navbarWidth],
    });
  }
  profileside(): void {
    // this.eventEmitterService.onProfileRefresh();
    // this.loader.isLoading = new BehaviorSubject<boolean>(false);
    let navbarWidth;
    if (
      this.loggedinUser.role.id == ROLES.Designer ||
      this.loggedinUser.role.id == ROLES.Analyst ||
      this.loggedinUser.role.id == ROLES.Peengineer ||
      this.loggedinUser.role.id == ROLES.Surveyor
    ) {
      navbarWidth = "navbar-Designer";
    } else {
      navbarWidth = "navbar-admin";
    }

    this._snackBar.openFromComponent(MyaccountComponent, {
      verticalPosition: "top",
      horizontalPosition: "end",
      panelClass: ["profile-navbar", "navbar-options", navbarWidth],
    });
  }

  hideNotice(notice: any): void {
    notice.active = false;
    this.activeNotices -= 1;
  }

  getNotices(): void {
    this.contractorService
      .getClientNotices(this.loggedinUser.parent.id)
      .subscribe(
        (response) => {
          response.map((item) => {
            if (item.active) {
              this.activeNotices += 1;
            }
          });
          this.clientNotices = response;

          this.clientNotices.slice(0, 2);

          this.changeDetectorRef.detectChanges();
        },
        (err) => {
          this.notifyService.showError(err, "Error");
        }
      );
  }

  accountUpdate(paymentMode, value): void {
    const dialogRef = this.dialog.open(AccountUpdateComponent, {
      width: "60%",
      autoFocus: true,
      backdropClass: "accountUpdateBackdrop",
      hasBackdrop: true,
      data: {
        convertToPrepaid: paymentMode,
        user: this.loggedinUser,
        isModified: value,
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.clientTypeUpdate.update({ key: false });
      this.loggedinUser = result.user;

      this.currentUser.user.paymentmodechangepopvisible = false;
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
      if (result.isDataUpdated) {
        localStorage.clear();
        window.location.href = "/auth/login";
        setTimeout(function () {
          "preventBack()";
        }, 0);
        window.onunload = function () {
          // null;
        };
      }
    });
  }

  getAlertAnnouncement(): void {
    this.commonService.getAlertAnnounce().subscribe(
      (response) => {
        this.allAlertAnnouncment = response.slice(0, 3);
        // this.allAlertAnnouncment = this.allAlertAnnouncment.slice(0,3);
        this.changeDetectorRef.detectChanges();
      },
      (err) => {
        this.notifyService.showError(err, "Error");
      }
    );
  }

  hideAnnouncements(index): void {
    this.allAlertAnnouncment.splice(index, 1);
  }
}
