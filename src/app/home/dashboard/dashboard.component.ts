import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import { Observable, Subscription } from "rxjs";
import { UpdatedialogComponent } from "src/app/shared/updatedialog/updatedialog.component";
import { FIREBASE_DB_CONSTANTS, ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  ContractorService,
  DesignService,
  GenericService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { DashboardService } from "src/app/_services/dashboard.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { MessagingService } from "src/app/_services/messaging.service";
import { CometChatMainManager } from "src/lib/cometchat-angular-ui-kit/src/lib/cometchat-embedded/cometchat-manager";
import { CALL_SCREEN_ACTIONS } from "src/lib/cometchat-angular-ui-kit/src/lib/string_constants";
// declare function HelpCrunch(firstArgs: string, thirdArgs?: object): void;
// declare function HelpCrunch(
//   firstArgs: string,
//   secondArgs?: string,
//   thirdArgs?: object
// ): void;

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  user?: {};
  group?: {};
  loggedinUser: User;
  isadmin = true;
  message: any;
  message$: Observable<any>;
  cometchatManager: CometChatMainManager = new CometChatMainManager();
  inProgressCall;
  incomingScreen;

  helpCrunchOrganization: string;
  helpCrunchApplicationId: number;
  helpCrunchApplicationSecret: string;
  helpCrunchWidget: string;
  isonboardingcompleted: any;
  clientSuperAdmin = false;
  deactivateEvent: Subscription;
  parentid;
  logoutusers: Observable<any>;
  logoutusersRef: AngularFireObject<any>;

  completeteamlogoutRef: AngularFireObject<any>;
  completeteamlogout: Observable<any>;

  constructor(
    private authService: AuthenticationService,
    private genericService: GenericService,
    private messagingService: MessagingService,
    private commonservice: CommonService,
    public dialog: MatDialog,
    private eventEmitterService: EventEmitterService,
    private changeDetectorRef: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private changeDetRef: ChangeDetectorRef,
    private designService: DesignService,
    private contractorService: ContractorService,
    private router: Router,
    private db: AngularFireDatabase
  ) {
    this.loggedinUser = this.authService.currentUserValue.user;
    if (this.loggedinUser.role.id == ROLES.ContractorSuperAdmin) {
      this.clientSuperAdmin = true;
    }
    this.isadmin = genericService.isUserAdmin(this.loggedinUser);

    this.logoutusersRef = this.db.object("hard_logout");
    this.logoutusers = this.logoutusersRef.valueChanges();
    this.logoutusers.subscribe(
      (res) => {
        this.commonservice
          .userData(this.loggedinUser.id)
          .subscribe((response) => {
            //  console.log(response.hard_logout,res)
            if (response.hard_logout && res) {
              const postData = {
                hard_logout: false,
              };

              this.contractorService
                .editContractor(
                  this.authService.currentUserValue.user.id,
                  postData
                )
                .subscribe(() => {
                  // do nothing.
                });
              sessionStorage.clear();
              localStorage.clear();
              CometChat.logout();
              this.router.navigate(["/auth/login"]);
            }
          });
      },

      () => {
        // do nothing.
      }
    );

    this.completeteamlogoutRef = this.db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + this.loggedinUser.parent.id
    );
    this.completeteamlogout = this.completeteamlogoutRef.valueChanges();
    this.completeteamlogout.subscribe((res) => {
      if (res && res.userblocked) {
        sessionStorage.clear();
        localStorage.clear();
        CometChat.logout();
        this.router.navigate(["/auth/login"]);
      }
    });
  }

  ngAfterContentChecked(): void {
    this.isonboardingcompleted = JSON.parse(
      localStorage.getItem("currentUser")
    ).user.isonboardingcompleted;
  }
  ngOnInit(): void {
    this.loggedInUserTime();
    this.deactivateEvent = this.eventEmitterService.disableNavbarMenu.subscribe(
      () => {
        this.changeDetectorRef.detectChanges();
      }
    );

    this.eventEmitterService.onOnboardingComplete(true);

    this.isonboardingcompleted = JSON.parse(
      localStorage.getItem("currentUser")
    ).user.isonboardingcompleted;

    if (!this.genericService.ispermissiongranted) {
      this.messagingService.requestPermission();
      this.message = this.messagingService.currentMessage;
    } else {
      this.messagingService.listen();
    }
    this.genericService.initializeCometChat();
    this.genericService.setRequiredHeaders();

    this.commonservice.userData(this.loggedinUser.id).subscribe((response1) => {
      this.parentid = Number(response1.parent.role);

      this.commonservice.getplatformupdate().subscribe((response) => {
        if (
          response.length > 0 &&
          response[0].status &&
          !response1.isplatformupdated
        ) {
          if (response[0].updatesfor == "specificusers") {
            for (let i = 0; i < response[0].userids.length; i++) {
              if (response[0].userids[i] === this.loggedinUser.id) {
                this.openPlatformupdateDialog(response);
              }
            }
          } else {
            this.openPlatformupdateDialog(response);
          }
        } else {
          this.dialog.closeAll();
        }
      });
    });

    // this.commonservice.getCompanies1("permit").subscribe(
    //   (response) => {
    //     response.sort((a, b) =>
    //       a.companyname.toLocaleLowerCase() > b.companyname.toLocaleLowerCase()
    //         ? 1
    //         : -1
    //     );
    //     this.genericService.companies = response;
    //     this.changeDetRef.detectChanges();
    //   },
    //   (error) => {
    //   }
    // );
    //API call to fetch charges of Prelim and Permit design request
    // this.commonservice.getCommonSettings().subscribe(
    //   response => {
    //     this.genericService.prelimdesigncharges = response[0].settingvalue;
    //     this.genericService.permitdesigncharges = response[1].settingvalue;
    //     this.genericService.numberoffreedesign = response[2].settingvalue;
    //     this.genericService.siteproposalcharges = response[3].settingvalue
    //   }
    // );

    // const postData = {
    //   userparentid: this.loggedinUser.parent.id,
    //   timeslab: "4-6"
    // }
    // this.commonservice.getPermitDesignCharge(postData).subscribe(
    //   response => {
    //     this.genericService.permitdesigncharges = response.servicecharge;
    //   }
    // );

    if (
      this.loggedinUser.role.id == ROLES.ContractorAdmin ||
      this.loggedinUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedinUser.role.id == ROLES.SuccessManager ||
      this.loggedinUser.role.id == ROLES.Admin ||
      this.loggedinUser.role.id == ROLES.SuperAdmin ||
      this.loggedinUser.role.id == ROLES.TeamHead ||
      this.loggedinUser.role.id == ROLES.BD ||
      this.loggedinUser.role.id == ROLES.Master
    ) {
      this.designService.getpermitlastsolarmake().subscribe((response) => {
        this.genericService.permitpreviousSolarInverterMake = response[0];
      });
      this.designService
        .getlastsolarmake("assessment")
        .subscribe((response) => {
          this.genericService.assessmentpreviousSolarInverterMake = response[0];
        });
      this.designService.getlastsolarmake("proposal").subscribe((response) => {
        this.genericService.proposalpreviousSolarInverterMake = response[0];
      });
    }

    this.cometchatManager.isLoggedIn(() => {
      this.cometchatManager.attachListener((event) => {
        switch (event.action) {
          case CALL_SCREEN_ACTIONS.INCOMING_CALL_RECEIVED: {
            void this.genericService.playIncomingAudio();
            this.incomingScreen = false;
            setTimeout(() => {
              this.incomingScreen = true;
              this.inProgressCall = JSON.stringify(event.payload.call);
              this.changeDetRef.detectChanges();
            }, 300);
            this.changeDetRef.detectChanges();
            break;
          }
          case CALL_SCREEN_ACTIONS.INCOMING_CALL_CANCELLED: {
            this.genericService.stopIncomingAudio();
            this.genericService.stopOutgoingAudio();
            this.incomingScreen = false;
            this.inProgressCall = JSON.stringify(event.payload.call);
            this.changeDetRef.detectChanges();
            break;
          }
        }
      });
    });

    //API call to fetch client roles
    this.commonservice
      .getClientRoles(this.loggedinUser.parent.id, this.loggedinUser.role.id)
      .subscribe((response) => {
        if (response.length == 0) {
          this.commonservice
            .getDefaultClientRoles(this.loggedinUser.role.id)
            .subscribe((response) => {
              this.genericService.clientroles = response;
            });
        } else {
          response.forEach((element, i) => {
            if (element.role.id == ROLES.PeAdmin) {
              response.splice(i, 1);
            }
          });
          this.genericService.clientroles = response;
        }
      });

    //User wallet transaction

    if (
      this.loggedinUser.role.id == ROLES.ContractorAdmin ||
      this.loggedinUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedinUser.role.id == ROLES.SuccessManager ||
      this.loggedinUser.role.id == ROLES.Admin ||
      this.loggedinUser.role.id == ROLES.SuperAdmin ||
      this.loggedinUser.role.id == ROLES.TeamHead ||
      this.loggedinUser.role.id == ROLES.BD ||
      this.loggedinUser.role.id == ROLES.Master
    ) {
      this.commonservice.userWalletTranscition().subscribe((response) => {
        if (response > 0) {
          this.genericService.userWalletfirsttranscition = false;
          this.changeDetRef.detectChanges();
        }
      });
    }

    //API to fetch users rights

    this.commonservice
      .getUserRights(this.loggedinUser.id)
      .subscribe((response) => {
        // console.log(response);
        if (response) {
          this.genericService.isPDFAutogenerationAccess =
            response[0]?.pdfautogeneration;
        }
      });
  }
  openPlatformupdateDialog(response): void {
    if (
      this.parentid == 6 &&
      (response[0].usertype == "external" || response[0].usertype == "both")
    ) {
      const dialogRef = this.dialog.open(UpdatedialogComponent, {
        disableClose: true,
        width: "50%",
        autoFocus: false,
        data: {
          loginrequired: response[0].loginrequired,
          title: response[0].title,
          message: response[0].message,
        },
      });
      dialogRef.afterClosed().subscribe(() => {
        // do nothing.
      });
    }

    if (
      this.parentid == 4 &&
      (response[0].usertype == "internal" || response[0].usertype == "both")
    ) {
      const dialogRef = this.dialog.open(UpdatedialogComponent, {
        disableClose: true,
        width: "50%",
        autoFocus: false,
        data: {
          loginrequired: response[0].loginrequired,
          title: response[0].title,
          message: response[0].message,
        },
      });
      dialogRef.afterClosed().subscribe(() => {
        // do nothing.
      });
    }
  }
  handleCallScreenActions = (): void => {
    this.user = undefined;
    this.group = undefined;
    this.changeDetRef.detectChanges();
  };

  loggedInUserTime(): void {
    const date = new Date();
    const currentdate = date.toISOString();
    this.dashboardService
      .lastLoginTime(this.loggedinUser.id, currentdate)
      .subscribe(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        }
      );
  }
}
