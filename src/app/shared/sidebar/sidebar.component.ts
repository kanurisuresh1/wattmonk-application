import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import { JoyrideService } from "ngx-joyride";
import { Observable } from "rxjs";
import { FIREBASE_DB_CONSTANTS, ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import { AuthenticationService, GenericService } from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { TeamService } from "src/app/_services/team.service";

declare const $: any;

//Metadata
export interface RouteInfo {
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  children?: ChildrenItems[];
}

export interface ChildrenItems {
  path: string;
  title: string;
  ab: string;
  type?: string;
}

//Super Admin Menu Items
export const ROUTES: RouteInfo[] = [
  {
    path: "/home/dashboard/overview",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard.svg",
  },
  {
    path: "/home/prelimdesign/overview",
    title: "Prelim",
    type: "link",
    icontype: "prelim1.svg",
  },
  {
    path: "/home/survey/overview",
    title: "Survey",
    type: "link",
    icontype: "sidebarsurvey.svg",
  },
  {
    path: "/home/permitdesign/overview",
    title: "Permit",
    type: "link",
    icontype: "permit.svg",
  },
  {
    path: "/home/pestamp/overview",
    title: "PE Stamps",
    type: "link",
    icontype: "pe stamps.svg",
  },
  {
    path: "/home/inbox/messages",
    title: "Inbox",
    type: "link",
    icontype: "inbox.svg",
  },
  {
    path: "/home/statistic/designstatistic",
    title: "Statistics",
    type: "link",
    icontype: "statistics.svg",
  },
  {
    path: "/home/team/overview",
    title: "Team",
    type: "link",
    icontype: "teamshine.svg",
  },
  {
    path: "/home/client/overview",
    title: "Clients",
    type: "link",
    icontype: "clients.svg",
  },
  {
    path: "/home/designreport/overview",
    title: "Report",
    type: "link",
    icontype: "report.svg",
  },
  {
    path: "/home/coupon/overview",
    title: "Coupons",
    type: "link",
    icontype: "coupons.svg",
  },
  {
    path: "/home/announcement/overview",
    title: "Broadcast",
    type: "link",
    icontype: "broadcast.svg",
  },

  // {
  //   path: "/home/qualitychecklist/qualitycheck",
  //   title: "Checklist",
  //   type: "link",
  //   icontype: "checklist.svg",
  // },
];

//Contractor Admin Menu Items
export const CONTRACTOR_ROUTES: RouteInfo[] = [
  {
    path: "/home/dashboard/overview",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard.svg",
  },
  {
    path: "/home/prelimdesign/overview",
    title: "Prelim",
    type: "link",
    icontype: "prelim1.svg",
  },
  {
    path: "/home/survey/overview",
    title: "Survey",
    type: "link",
    icontype: "sidebarsurvey.svg",
  },
  {
    path: "/home/permitdesign/overview",
    title: "Permit",
    type: "link",
    icontype: "permit.svg",
  },
  {
    path: "/home/pestamp/overview",
    title: "PE Stamps",
    type: "link",
    icontype: "pe stamps.svg",
  },
  {
    path: "/home/inbox/messages",
    title: "Inbox",
    type: "link",
    icontype: "inbox.svg",
  },
  {
    path: "/home/team/overview",
    title: "Team",
    type: "link",
    icontype: "teamshine.svg",
  },
  {
    path: "/home/apps/overview",
    title: "Apps",
    type: "link",
    icontype: "apps.svg",
  },
  // {
  //   path: "/home/archive/overview",
  //   title: "Archive",
  //   type: "link",
  //   icontype: "report.svg",
  // }
];
//BD Menu Items
export const BD_ROUTES: RouteInfo[] = [
  {
    path: "/home/dashboard/overview",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard.svg",
  },
  {
    path: "/home/prelimdesign/overview",
    title: "Prelim",
    type: "link",
    icontype: "prelim1.svg",
  },
  {
    path: "/home/survey/overview",
    title: "Survey",
    type: "link",
    icontype: "sidebarsurvey.svg",
  },
  {
    path: "/home/permitdesign/overview",
    title: "Permit",
    type: "link",
    icontype: "permit.svg",
  },
  {
    path: "/home/pestamp/overview",
    title: "PE Stamps",
    type: "link",
    icontype: "pe stamps.svg",
  },
  {
    path: "/home/inbox/messages",
    title: "Inbox",
    type: "link",
    icontype: "inbox.svg",
  },
];

//Designer Menu Items
export const DESIGNER_ROUTES: RouteInfo[] = [
  {
    path: "/home/dashboard/overview/designer",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard.svg",
  },
  {
    path: "/home/design/overview",
    title: "Designs",
    type: "link",
    icontype: "prelim1.svg",
  },
  {
    path: "/home/prelimdesign/overview",
    title: "Prelim Designs",
    type: "link",
    icontype: "prelim1.svg",
  },
  {
    path: "/home/permitdesign/overview",
    title: "Permit Designs",
    type: "link",
    icontype: "permit.svg",
  },
  {
    path: "/home/inbox/messages",
    title: "Inbox",
    type: "link",
    icontype: "inbox.svg",
  },
];

//Surveyor Menu Items
export const SURVEYOR_ROUTES: RouteInfo[] = [
  {
    path: "/home/dashboard/overview/surveyor",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard.svg",
  },
  {
    path: "/home/survey/overview",
    title: "Survey",
    type: "link",
    icontype: "sidebarsurvey.svg",
  },
  {
    path: "/home/inbox/messages",
    title: "Inbox",
    type: "link",
    icontype: "inbox.svg",
  },
];

//Analyst Menu Items
export const ANALYST_ROUTES: RouteInfo[] = [
  {
    path: "/home/dashboard/overview/analyst",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard.svg",
  },
  {
    path: "/home/qualitycheck/overview",
    title: "Quality Check",
    type: "link",
    icontype: "qualitycheck.svg",
  },
  {
    path: "/home/inbox/messages",
    title: "Inbox",
    type: "link",
    icontype: "inbox.svg",
  },
];

//Team Head Menu Items
export const TEAMHEAD_ROUTES: RouteInfo[] = [
  {
    path: "/home/dashboard/overview",
    title: "Dashboard",
    type: "link",
    icontype: "dashboard.svg",
  },
  {
    path: "/home/prelimdesign/overview",
    title: "Prelim",
    type: "link",
    icontype: "prelim1.svg",
  },
  {
    path: "/home/survey/overview",
    title: "Survey",
    type: "link",
    icontype: "sidebarsurvey.svg",
  },
  {
    path: "/home/permitdesign/overview",
    title: "Permit",
    type: "link",
    icontype: "permit.svg",
  },
  {
    path: "/home/pestamp/overview",
    title: "PE Stamps",
    type: "link",
    icontype: "pe stamps.svg",
  },
  {
    path: "/home/inbox/messages",
    title: "Inbox",
    type: "link",
    icontype: "inbox.svg",
  },
  {
    path: "/home/team/overview",
    title: "Team",
    type: "link",
    icontype: "teamshine.svg",
  },
  // {
  //   path: "/home/qualitychecklist/qualitycheck",
  //   title: "Checklist",
  //   type: "link",
  //   icontype: "checklist.svg",
  // },
];
// PE Admin Routes
export const PE_ADMIN: RouteInfo[] = [
  {
    path: "/home/pestamp/overview",
    title: "PE Stamps",
    type: "link",
    icontype: "pe stamps.svg",
  },
  {
    path: "/home/inbox/messages",
    title: "Inbox",
    type: "link",
    icontype: "inbox.svg",
  },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  roles = ROLES;
  count = 0;
  public menuItems: any[] = [];
  loggedinUser: User;
  userrole: string = "";
  userinitials: string = "";
  hidden = false;
  newprelims: Observable<any>;
  newprelimsRef: AngularFireObject<any>;
  newprelimscounts = 0;
  newpermits: Observable<any>;
  newpermitsRef: AngularFireObject<any>;
  newpermitscounts = 0;
  newpestamp: Observable<any>;
  newpestampRef: AngularFireObject<any>;
  newpestampcounts = 0;
  teamheadroleid = 0;
  pesuperadminroleid = 0;
  successmanagerroleid = 0;
  isClient = false;
  appsItem;
  couponsItem;
  withrawalItem;
  pestampItem;
  teamItem;
  transactionItem;
  checklistItem;
  maintour: Observable<any>;
  maintourRef: AngularFireObject<any>;
  runmaintour = false;
  lastroute;
  getclientsrole = 0;
  issidebarloading = true;
  specificclientid;
  isMobileMenu(): boolean {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }
  joyrideTitle = "Permit";
  joyridetext =
    "Consolidated dashboard for all your premit design requests with real-time status tracking.";
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    public genericService: GenericService,
    public teamService: TeamService,
    private eventEmitterService: EventEmitterService,
    private changeDetectorRef: ChangeDetectorRef,
    private db: AngularFireDatabase,
    private readonly joyrideService: JoyrideService,
    private commonService: CommonService // private loader: LoaderService
  ) {
    this.couponsItem = {
      path: "/home/coupon/overview",
      title: "Coupons",
      type: "link",
      icontype: "coupons.svg",
    };
    // this.pestampItem = {
    //   path: "/home/pestamp/overview",
    //   title: "PE Stamps",
    //   type: "link",
    //   icontype: "pe stamps.svg",
    // };
    this.transactionItem = {
      path: "/home/transaction/overview",
      title: "Transaction",
      type: "link",
      icontype: "transaction.svg",
    };
    this.withrawalItem = {
      path: "/home/withdrawals/overview",
      title: "Withdrawals",
      type: "link",
      icontype: "withdrawals.svg",
    };

    // this.teamItem = {
    //   path: "/home/team/overview",
    //   title: "Team",
    //   type: "link",
    //   icontype: "teamshine.svg",
    // };

    this.checklistItem = {
      path: "/home/qualitychecklist/qualitycheck",
      title: "QualityCheck",
      type: "link",
      icontype: "checklist.svg",
    };

    this.newprelimsRef = db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + "newprelimdesigns"
    );
    this.newprelims = this.newprelimsRef.valueChanges();
    this.newprelims.subscribe(
      (res) => {
        this.newprelimscounts = res.count;
        changeDetectorRef.detectChanges();
      }
      // (err) => console.log(err),
      // () => console.log("done!")
    );
    this.newpermitsRef = db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + "newpermitdesigns"
    );
    this.newpermits = this.newpermitsRef.valueChanges();
    this.newpermits.subscribe(
      (res) => {
        this.newpermitscounts = res.count;
        changeDetectorRef.detectChanges();
      }
      // (err) => console.log(err),
      // () => console.log('done!')
    );
    this.newpestampRef = db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + "newpestamps"
    );
    this.newpestamp = this.newpestampRef.valueChanges();
    this.newpestamp.subscribe(
      (res) => {
        this.newpestampcounts = res.count;
        changeDetectorRef.detectChanges();
      }
      // (err) => console.log(err),
      // () => console.log('done!')
    );
  }

  async getData() {
    await this.genericService.getUnreadMessageCountForGroupsAsyc();
  }

  ngOnInit(): void {
    this.setrequiredvalues();
  }

  setrequiredvalues(): void {
    setInterval(async () => {
      await this.getData();
    }, 30000);
    this.eventEmitterService.sidebarRefresh.subscribe(() => {
      this.changeDetectorRef.detectChanges();
      // console.log("Product Tour");
      this.setrequiredvalues();
    });
    this.loggedinUser = this.authService.currentUserValue.user;
    if (
      this.loggedinUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedinUser.role.id == ROLES.ContractorAdmin ||
      this.loggedinUser.role.id == ROLES.SuccessManager ||
      this.loggedinUser.role.id == ROLES.Master ||
      this.loggedinUser.role.id == ROLES.TeamHead ||
      (this.loggedinUser.role.id == ROLES.BD &&
        this.loggedinUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
    //this.userrole = this.loggedinUser.role.displayname;

    this.teamheadroleid = ROLES.TeamHead;
    this.pesuperadminroleid = ROLES.PESuperAdmin;
    this.successmanagerroleid = ROLES.SuccessManager;

    this.userinitials = this.genericService.getInitials(
      this.loggedinUser.firstname,
      this.loggedinUser.lastname
    );

    this.dynamicContent();

    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      <HTMLElement>document.querySelector(".sidebar .sidebar-wrapper");
    }

    this.teamService.getClientRole(this.loggedinUser.parent.id).subscribe(
      (response) => {
        this.getclientsrole = response.length;

        if (response.length > 0 && response[0].client.id != 232) {
          if (response[0].id && response[0].client.id != 232) {
            this.specificclientid = response[0].client.id;
            this.genericService.specificclient = true;
            // let Newpermit = this.menuItems.find(c => c.path == ("/home/permitdesign/overview"))
            // Newpermit.title = "Design"
            this.joyrideTitle = "Design";
            this.joyridetext =
              "Consolidated dashboard for all your design requests with real-time status tracking.";
            this.changeDetectorRef.detectChanges();
          } else {
            this.genericService.specificclient = false;
            this.specificclientid = "";
          }

          if (
            this.loggedinUser.role.id == 3 &&
            this.loggedinUser.parent.id == this.specificclientid
          ) {
            this.userrole = "Sales Manager";
          } else if (
            this.loggedinUser.role.id == 9 &&
            this.loggedinUser.parent.id == this.specificclientid
          ) {
            this.userrole = "Sales Representative";
          } else if (
            this.loggedinUser.role.id == ROLES.Master &&
            this.loggedinUser.parent.id == this.specificclientid
          ) {
            this.userrole = "Master Electrician";
          } else if (
            this.loggedinUser.role.id == 6 &&
            this.loggedinUser.parent.id == this.specificclientid
          ) {
            this.userrole = "Super Admin";
          } else if (
            this.loggedinUser.role.id == 7 &&
            this.loggedinUser.parent.id == this.specificclientid
          ) {
            this.userrole = "Admin";
          } else if (
            this.loggedinUser.role.id == ROLES.TeamHead &&
            this.loggedinUser.parent.id == this.specificclientid
          ) {
            this.userrole = "Team Head";
          } else {
            this.userrole = this.loggedinUser.role.name;
          }
        } else {
          this.genericService.specificclient = false;
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
          } else if (this.loggedinUser.role.id == ROLES.TeamHead) {
            this.userrole = "Team Head";
          } else if (this.loggedinUser.role.id == ROLES.PeAdmin) {
            this.userrole = "PE Admin";
          } else {
            this.userrole = this.loggedinUser.role.name;
          }
        }
      },
      () => {
        //this.notifyService.showError(error, "Error");
      }
    );
    this.eventEmitterService.chatItemSelected.subscribe((count) => {
      this.genericService.totalcountsforallgroups =
        this.genericService.totalcountsforallgroups - count;
      this.changeDetectorRef.detectChanges();
    });

    if (this.isClient) {
      //Code to check person has completed main product tour or not
      this.maintourRef = this.db.object(
        FIREBASE_DB_CONSTANTS.KEYWORD + this.loggedinUser.parent.id
      );
      this.maintour = this.maintourRef.valueChanges();
      this.maintour.subscribe(
        (res) => {
          if (
            res.maintour === null ||
            res.maintour == undefined ||
            !res.maintour
          ) {
            this.runmaintour = true;
            if (this.runmaintour) {
              if (this.loggedinUser.role.type == "clientsuperadmin") {
                if (this.loggedinUser.usertype == "company") {
                  this.joyrideService.startTour({
                    steps: [
                      "dashboardhighlight",
                      "prelimhighlight",
                      "surveyhighlight",
                      "permithighlight",
                      "pestamphighlight",
                      "inboxhighlight",
                      "teamhighlight",
                      "apphighlight",
                      "searchhighlight@home/dashboard/overview",
                      "notificationhighlight@home/dashboard/overview",
                      "settinghighlight@home/dashboard/overview",
                      "couponshighlight",
                      "0highlight",
                    ],
                  });
                } else {
                  this.joyrideService.startTour({
                    steps: [
                      "dashboardhighlight",
                      "prelimhighlight",
                      "surveyhighlight",
                      "permithighlight",
                      "pestamphighlight",
                      "inboxhighlight",
                      "searchhighlight@home/dashboard/overview",
                      "notificationhighlight@home/dashboard/overview",
                      "settinghighlight@home/dashboard/overview",
                    ],
                  });
                }
              } else if (this.loggedinUser.role.type == "clientadmin") {
                this.joyrideService.startTour({
                  steps: [
                    "dashboardhighlight",
                    "prelimhighlight",
                    "surveyhighlight",
                    "permithighlight",
                    "pestamphighlight",
                    "inboxhighlight",
                    "teamhighlight",
                    "apphighlight",
                    "searchhighlight@home/dashboard/overview",
                    "notificationhighlight@home/dashboard/overview",
                    "settinghighlight@home/dashboard/overview",
                  ],
                });
              } else if (
                this.loggedinUser.role.type == "bd" ||
                this.loggedinUser.role.type == "team_head"
              ) {
                this.joyrideService.startTour({
                  steps: [
                    "dashboardhighlight",
                    "prelimhighlight",
                    "surveyhighlight",
                    "permithighlight",
                    "pestamphighlight",
                    "inboxhighlight",
                    "searchhighlight@home/dashboard/overview",
                    "notificationhighlight@home/dashboard/overview",
                    "settinghighlight@home/dashboard/overview",
                    "couponshighlight",
                    "checklisthighlight",
                  ],
                });
              } else {
                this.joyrideService.startTour({
                  steps: [
                    "dashboardhighlight",
                    "prelimhighlight",
                    "surveyhighlight",
                    "permithighlight",
                    "pestamphighlight",
                    "inboxhighlight",
                    "teamhighlight",
                    "apphighlight",
                    "statisticshiglight",
                    "clienthighlight",
                    "reporthighlight",
                    "announcementhighlight",
                    "couponshighlight",
                    "searchhighlight@home/dashboard/overview",
                    "notificationhighlight@home/dashboard/overview",
                    "settinghighlight@home/dashboard/overview",
                  ],
                });
              }
            }
          }
        }
        // (err) => console.log(err),
        // () => console.log('done!')
      );
    }
    let lastpath;
    this.lastroute = localStorage.getItem("lastroute");
    if (
      this.lastroute != "/home/withdrawals/overview" &&
      this.lastroute != "/home/coupon/overview" &&
      this.lastroute != "/home/team/overview" &&
      this.lastroute != "/home/transaction/overview"
    ) {
      lastpath = this.menuItems.find(
        (c) => c.path == localStorage.getItem("lastroute")
      );
    } else if (this.lastroute == "/home/withdrawals/overview") {
      lastpath = this.withrawalItem;
    } else if (this.lastroute == "/home/coupon/overview") {
      lastpath = this.couponsItem;
    } else if (this.lastroute == "/home/team/overview") {
      if (this.isClient) {
        lastpath = this.teamItem;
      } else {
        lastpath = this.menuItems.find((c) => c.path == this.lastroute);
      }
    } else if (this.lastroute == "/home/transaction/overview") {
      lastpath = this.transactionItem;
    } else if (this.lastroute == "/home/qualitychecklist/qualitycheck") {
      lastpath = this.checklistItem;
    }
    lastpath.icontype = lastpath?.title.toLowerCase() + "shine.svg";
  }

  isMac(): boolean {
    let bool = false;
    if (
      navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
      navigator.platform.toUpperCase().indexOf("IPAD") >= 0
    ) {
      bool = true;
    }
    return bool;
  }

  handleSidebarRouteClick(menuitem: any): void {
    // this.loader.isLoading = new BehaviorSubject<boolean>(false);
    // menuitem.icontype = menuitem.title.toLowerCase() + "shine.svg"
    if (localStorage.getItem("lastroute") != menuitem.path) {
      // this.setSelecetdIcon();
    }
    localStorage.setItem("lastroute", menuitem.path);
    localStorage.setItem("lastroutetitle", menuitem.title);
    this.eventEmitterService.onSidebarRouteChange(menuitem.title);
  }

  toggleBadgeVisibility(): void {
    this.hidden = !this.hidden;
  }

  preventBack(): void {
    window.history.forward();
  }

  handleusersignout(): void {
    localStorage.clear();
    CometChat.logout();
    //this.router.navigate(['/auth/login']);
    setTimeout(function () {
      "preventBack()";
    }, 0);
    window.onunload = function () {
      // null;
    };
    window.location.href = "/auth/login";
  }

  setSelecetdIcon(): void {
    let lastpath;
    this.lastroute = localStorage.getItem("lastroute");
    if (
      this.lastroute != "/home/withdrawals/overview" &&
      this.lastroute != "/home/coupon/overview" &&
      this.lastroute != "/home/team/overview" &&
      this.lastroute != "/home/transaction/overview"
    ) {
      lastpath = this.menuItems.find(
        (c) => c.path == localStorage.getItem("lastroute")
      );
    } else if (this.lastroute == "/home/withdrawals/overview") {
      lastpath = this.withrawalItem;
    } else if (this.lastroute == "/home/coupon/overview") {
      lastpath = this.couponsItem;
    } else if (this.lastroute == "/home/team/overview") {
      if (this.isClient) {
        lastpath = this.teamItem;
      } else {
        lastpath = this.menuItems.find((c) => c.path == this.lastroute);
      }
    } else if (this.lastroute == "/home/transaction/overview") {
      lastpath = this.transactionItem;
    } else if (this.lastroute == "home/qualitychecklist/qualitycheck") {
      lastpath = this.checklistItem;
    }
    lastpath.icontype = lastpath.title.toLowerCase() + ".svg";
  }
  gotoprofile(): void {
    this.eventEmitterService.onSidebarRouteChange("Profile");
    this.router.navigate(["/home/profile/details"]);
    this.setSelecetdIcon();
  }

  displayDasboardMenu(menuitem) {
    if (menuitem.type === 'link' && menuitem.title !== 'Inbox' && menuitem.title !== 'Prelim' && (menuitem.title !== 'Permit' && menuitem.title !== 'Design') && menuitem.title !== 'Broadcast' && menuitem.title !== 'PEStamp' && menuitem.title !== 'Survey' && menuitem.title !== 'Team' && menuitem.title !== 'Apps' && menuitem.title !== 'Coupons' && menuitem.title !== 'Report' && menuitem.title !== 'Clients' && menuitem.title !== 'Statistics' && menuitem.title !== 'qualitycheck' && menuitem.title !== 'Checklist / Guidelines' && menuitem.title !== 'Archive' && menuitem.title !== 'Orders' && menuitem.title !== 'Customer' && menuitem.title !== 'Entries') {
      return true;
    }
  }

  dynamicContent(): void {
    this.commonService
      .getDynamicSideBar(this.loggedinUser.id)
      .subscribe((response) => {
        // console.log("getUserSetting", response);
        this.issidebarloading = false;
        this.menuItems = [];
        localStorage.setItem("usersettings", JSON.stringify(response));
        if (
          this.loggedinUser.role.id === ROLES.SuperAdmin ||
          this.loggedinUser.role.id === ROLES.Admin
        ) {
          this.menuItems.push({
            path: "/home/dashboard/overview",
            title: response.namedashboard,
            type: "link",
            icontype: "dashboard.svg",
          });

          if (response.visibilityprelim) {
            this.menuItems.push({
              path: "/home/prelimdesign/overview",
              title: response.nameprelim,
              type: "link",
              icontype: "prelim1.svg",
            });
          }
          if (response.visibilitysurvey) {
            this.menuItems.push({
              path: "/home/survey/overview",
              title: response.namesurvey,
              type: "link",
              icontype: "sidebarsurvey.svg",
            });
          }
          if (response.visibilitypermit) {
            this.menuItems.push({
              path: "/home/permitdesign/overview",
              title: response.namepermit,
              type: "link",
              icontype: "permit.svg",
            });
          }
          if (response.visibilitypestamp) {
            this.menuItems.push({
              path: "/home/pestamp/overview",
              title: response.namepestamp,
              type: "link",
              icontype: "pe stamps.svg",
            });
          }

          this.menuItems.push({
            path: "/home/inbox/messages",
            title: response.nameinbox,
            type: "link",
            icontype: "inbox.svg",
          });

          if (response.visibilitystatistics) {
            this.menuItems.push({
              path: "/home/statistic/designstatistic",
              title: response.namestatistics,
              type: "link",
              icontype: "statistics.svg",
            });
          }

          if (response.visibilityteam) {
            this.menuItems.push({
              path: "/home/team/overview",
              title: response.nameteam,
              type: "link",
              icontype: "teamshine.svg",
            });
          }

          if (response.visibilityclients) {
            this.menuItems.push({
              path: "/home/client/overview",
              title: response.nameclients,
              type: "link",
              icontype: "clients.svg",
            });
          }

          if (response.visibilityreport) {
            this.menuItems.push({
              path: "/home/designreport/overview",
              title: response.namereport,
              type: "link",
              icontype: "report.svg",
            });
          }
          if (response.visibilityqualitycheck) {
            this.menuItems.push({
              path: "/home/qualitychecklist/qualitycheck",
              title: "Checklist / Guidelines",
              type: "link",
              icontype: "checklist.svg",
            });
          }

          if (response.visibilitycoupons) {
            this.menuItems.push({
              path: "/home/coupon/overview",
              title: response.namecoupons,
              type: "link",
              icontype: "coupons.svg",
            });
          }

          if (response.visibilityarchive) {
            this.menuItems.push({
              path: "/home/archive/overview",
              title: response.namearchive,
              type: "link",
              icontype: "archive.svg",
            });
          }

          if (response.visibilityannouncement) {
            this.menuItems.push({
              path: "/home/announcement/overview",
              title: response.nameannouncement,
              type: "link",
              icontype: "broadcast.svg",
            });
          }

          this.menuItems.push({
            path: "/home/dataentry/overview",
            title: "Entries",
            type: "link",
            icontype: "data entry.svg",
          });
        }
        // else if(this.loggedinUser.role.id === ROLES.Admin){
        //   this.menuItems.push({
        //     path: "/home/dashboard/overview",
        //     title:  response.namedashboard,
        //     type: "link",
        //     icontype: "dashboard.svg",
        //   })

        // if(response.visibilityprelim){
        //   this.menuItems.push({ path: "/home/prelimdesign/overview",
        //   title: response.nameprelim,
        //   type: "link",
        //   icontype: "prelim1.svg",})
        // }
        // if(response.visibilitysurvey){
        //   this.menuItems.push({  path: "/home/survey/overview",
        //   title: response.namesurvey,
        //   type: "link",
        //   icontype: "sidebarsurvey.svg",})
        // }
        //  if(response.visibilitypermit){
        //    this.menuItems.push({ path: "/home/permitdesign/overview",
        //    title: response.namepermit,
        //    type: "link",
        //    icontype: "permit.svg",})
        //  }
        //  if(response.visibilitypestamp){
        //   this.menuItems.push({ path: "/home/pestamp/overview",
        //   title: response.namepestamp,
        //   type: "link",
        //   icontype: "pe stamps.svg",})
        // }

        // this.menuItems.push({ path: "/home/inbox/messages",
        // title: response.nameinbox,
        // type: "link",
        // icontype: "inbox.svg",})

        // if(response.visibilityteam){
        //   this.menuItems.push({ path: "/home/team/overview",
        //   title: response.nameteam,
        //   type: "link",
        //   icontype: "teamshine.svg",})
        // }
        // if(response.visibilityqualitycheck){
        //   this.menuItems.push(
        //     {
        //       path: "/home/qualitychecklist/qualitycheck",
        //       title: response.namequalitycheck,
        //       type: "link",
        //       icontype: "checklist.svg",
        //     }
        //   )
        // }
        // }
        else if (this.loggedinUser.role.id === ROLES.PESuperAdmin) {
          this.menuItems.push({
            path: "/home/pestamp/overview",
            title: response.namepestamp,
            type: "link",
            icontype: "pe stamps.svg",
          });

          this.menuItems.push({
            path: "/home/inbox/messages",
            title: response.nameinbox,
            type: "link",
            icontype: "inbox.svg",
          });

          this.menuItems.push({
            path: "/home/team/overview",
            title: response.nameteam,
            type: "link",
            icontype: "teamshine.svg",
          });
        } else if (
          this.loggedinUser.role.id === ROLES.ContractorSuperAdmin ||
          this.loggedinUser.role.id === ROLES.ContractorAdmin ||
          this.loggedinUser.role.id === ROLES.SuccessManager ||
          this.loggedinUser.role.id === ROLES.BD
        ) {
          this.menuItems.push({
            path: "/home/dashboard/overview",
            title: response.namedashboard,
            type: "link",
            icontype: "dashboard.svg",
          });
          if (
            (this.loggedinUser.role.id === ROLES.ContractorSuperAdmin ||
              this.loggedinUser.role.id === ROLES.ContractorAdmin ||
              this.loggedinUser.role.id === ROLES.SuccessManager ||
              this.loggedinUser.role.id == ROLES.BD) &&
            this.loggedinUser.parent.id != 232 &&
            response.visibilitycustomer
          ) {
            this.menuItems.push({
              path: "/home/customerdesign/overview",
              title: response.namecustomer,
              type: "link",
              icontype: "customermenuicon.svg",
            });
          }
          if (response.visibilityprelim) {
            this.menuItems.push({
              path: "/home/prelimdesign/overview",
              title: response.nameprelim,
              type: "link",
              icontype: "prelim1.svg",
            });
          }
          if (response.visibilitysurvey) {
            this.menuItems.push({
              path: "/home/survey/overview",
              title: response.namesurvey,
              type: "link",
              icontype: "sidebarsurvey.svg",
            });
          }
          if (
            response.visibilitypermit &&
            this.loggedinUser.parent.id == this.specificclientid
          ) {
            this.menuItems.push({
              path: "/home/permitdesign/overview",
              title:
                response.namepermit == "permit"
                  ? "Design"
                  : response.namepermit,
              type: "link",
              icontype: "permit.svg",
            });
          }

          if (
            response.visibilitypermit &&
            this.loggedinUser.parent.id != this.specificclientid
          ) {
            this.menuItems.push({
              path: "/home/permitdesign/overview",
              title: response.namepermit,
              type: "link",
              icontype: "permit.svg",
            });
          }
          if (response.visibilitypestamp) {
            this.menuItems.push({
              path: "/home/pestamp/overview",
              title: response.namepestamp,
              type: "link",
              icontype: "pe stamps.svg",
            });
          }

          this.menuItems.push({
            path: "/home/inbox/messages",
            title: response.nameinbox,
            type: "link",
            icontype: "inbox.svg",
          });
          if (this.loggedinUser.role.id != ROLES.BD) {
            this.menuItems.push({
              path: "/home/transaction/overview",
              title: "Orders",
              type: "link",
              icontype: "transactionshine.svg",
            });
          }

          if (
            response.visibilityteam &&
            this.loggedinUser.role.id != ROLES.BD
          ) {
            this.menuItems.push({
              path: "/home/team/overview",
              title: response.nameteam,
              type: "link",
              icontype: "teamshine.svg",
            });
          }
          if (
            response.visibilityapp &&
            this.loggedinUser.role.id != ROLES.ContractorAdmin ||
            this.loggedinUser.role.id != ROLES.SuccessManager
          ) {
            this.menuItems.push({
              path: "/home/apps/overview",
              title: response.nameapp,
              type: "link",
              icontype: "apps.svg",
            });
          }
          if (response.visibilityarchive) {
            this.menuItems.push({
              path: "/home/archive/overview",
              title: response.namearchive,
              type: "link",
              icontype: "archive.svg",
            });
          }
        } else if (this.loggedinUser.role.id === ROLES.Designer) {
          this.menuItems.push({
            path: "/home/dashboard/overview/designer",
            title: response.namedashboard,
            type: "link",
            icontype: "dashboard.svg",
          });

          if (response.visibilityprelim) {
            this.menuItems.push({
              path: "/home/prelimdesign/overview",
              title: response.nameprelim,
              type: "link",
              icontype: "prelim1.svg",
            });
          }
          if (response.visibilitypermit) {
            this.menuItems.push({
              path: "/home/permitdesign/overview",
              title: response.namepermit,
              type: "link",
              icontype: "permit.svg",
            });
          }
          if (response.visibilitypestamp) {
            this.menuItems.push({
              path: "/home/pestamp/overview",
              title: response.namepestamp,
              type: "link",
              icontype: "pe stamps.svg",
            });
          }

          this.menuItems.push({
            path: "/home/inbox/messages",
            title: response.nameinbox,
            type: "link",
            icontype: "inbox.svg",
          });

          if (response.visibilityteam) {
            this.menuItems.push({
              path: "/home/team/overview",
              title: response.nameteam,
              type: "link",
              icontype: "teamshine.svg",
            });
          }
        } else if (this.loggedinUser.role.id === ROLES.Surveyor) {
          this.menuItems.push({
            path: "/home/dashboard/overview/surveyor",
            title: response.namedashboard,
            type: "link",
            icontype: "dashboard.svg",
          });
          if (response.visibilitysurvey) {
            this.menuItems.push({
              path: "/home/survey/overview",
              title: response.namesurvey,
              type: "link",
              icontype: "sidebarsurvey.svg",
            });

            this.menuItems.push({
              path: "/home/inbox/messages",
              title: response.nameinbox,
              type: "link",
              icontype: "inbox.svg",
            });
          }
        } else if (this.loggedinUser.role.id === ROLES.Analyst) {
          this.menuItems.push({
            path: "/home/dashboard/overview/analyst",
            title: response.namedashboard,
            type: "link",
            icontype: "dashboard.svg",
          });
          this.menuItems.push({
            path: "/home/inbox/messages",
            title: response.nameinbox,
            type: "link",
            icontype: "inbox.svg",
          });
        } else if (this.loggedinUser.role.id === ROLES.TeamHead) {
          this.menuItems.push({
            path: "/home/dashboard/overview",
            title: response.namedashboard,
            type: "link",
            icontype: "dashboard.svg",
          });

          if (
            this.loggedinUser.parent.id != 232 &&
            response.visibilitycustomer
          ) {
            this.menuItems.push({
              path: "/home/customerdesign/overview",
              title: response.namecustomer,
              type: "link",
              icontype: "customermenuicon.svg",
            });
          }

          if (response.visibilityprelim) {
            this.menuItems.push({
              path: "/home/prelimdesign/overview",
              title: response.nameprelim,
              type: "link",
              icontype: "prelim1.svg",
            });
          }
          if (response.visibilitysurvey) {
            this.menuItems.push({
              path: "/home/survey/overview",
              title: response.namesurvey,
              type: "link",
              icontype: "sidebarsurvey.svg",
            });
          }
          if (
            response.visibilitypermit &&
            this.loggedinUser.parent.id == this.specificclientid
          ) {
            this.menuItems.push({
              path: "/home/permitdesign/overview",
              title:
                response.namepermit == "permit"
                  ? "Design"
                  : response.namepermit,
              type: "link",
              icontype: "permit.svg",
            });
          }

          if (
            response.visibilitypermit &&
            this.loggedinUser.parent.id != this.specificclientid
          ) {
            this.menuItems.push({
              path: "/home/permitdesign/overview",
              title: response.namepermit,
              type: "link",
              icontype: "permit.svg",
            });
          }
          if (response.visibilitypestamp) {
            this.menuItems.push({
              path: "/home/pestamp/overview",
              title: response.namepestamp,
              type: "link",
              icontype: "pe stamps.svg",
            });
          }
          if (response.visibilityqualitycheck) {
            this.menuItems.push({
              path: "/home/qualitychecklist/qualitycheck",
              title: this.loggedinUser.parent.id !== 232 ? response.namequalitycheck : 'Checklist / Guidelines',
              type: "link",
              icontype: "checklist.svg",
            });
          }

          this.menuItems.push({
            path: "/home/inbox/messages",
            title: response.nameinbox,
            type: "link",
            icontype: "inbox.svg",
          });

          if (response.visibilityarchive) {
            this.menuItems.push({
              path: "/home/archive/overview",
              title: response.namearchive,
              type: "link",
              icontype: "archive.svg",
            });
          }
        } else if (this.loggedinUser.role.id === ROLES.PeAdmin) {
          if (response.visibilitypestamp) {
            this.menuItems.push({
              path: "/home/pestamp/overview",
              title: response.namepestamp,
              type: "link",
              icontype: "pe stamps.svg",
            });
          }
          this.menuItems.push({
            path: "/home/inbox/messages",
            title: response.nameinbox,
            type: "link",
            icontype: "inbox.svg",
          });
        } else {
          this.menuItems.push({
            path: "/home/dashboard/overview",
            title: response.namedashboard,
            type: "link",
            icontype: "dashboard.svg",
          });

          if (response.visibilityprelim) {
            this.menuItems.push({
              path: "/home/prelimdesign/overview",
              title: response.nameprelim,
              type: "link",
              icontype: "prelim1.svg",
            });
          }
          if (response.visibilitysurvey) {
            this.menuItems.push({
              path: "/home/survey/overview",
              title: response.namesurvey,
              type: "link",
              icontype: "sidebarsurvey.svg",
            });
          }
          if (response.visibilitypermit) {
            this.menuItems.push({
              path: "/home/permitdesign/overview",
              title: response.namepermit,
              type: "link",
              icontype: "permit.svg",
            });
          }
          if (response.visibilitypestamp) {
            this.menuItems.push({
              path: "/home/pestamp/overview",
              title: response.namepestamp,
              type: "link",
              icontype: "pe stamps.svg",
            });
          }
          this.menuItems.push({
            path: "/home/inbox/messages",
            title: response.nameinbox,
            type: "link",
            icontype: "inbox.svg",
          });
          if (response.visibilityarchive) {
            this.menuItems.push({
              path: "/home/archive/overview",
              title: response.namearchive,
              type: "link",
              icontype: "archive.svg",
            });
          }
        }
      });
  }
}
