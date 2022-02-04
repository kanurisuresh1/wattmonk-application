import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { CurrentUser, User } from 'src/app/_models';
import { UserSetting } from 'src/app/_models/usersettings';
import { AuthenticationService, GenericService, NotificationService } from 'src/app/_services';
import { CommonService } from 'src/app/_services/common.service';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';

@Component({
  selector: "app-setting",
  templateUrl: "./setting.component.html",
  styleUrls: ["./setting.component.scss"],
})
export class SettingComponent implements OnInit, AfterViewInit {
  loggedInUser: User;
  notificationPostData;
  color: ThemePalette = 'primary';
  public show: boolean = false;
  public buttonName: any = 'Show';

  accountsettingform: FormGroup;
  userSettingVisibilityPrelim = new FormControl(true);
  userSettingVisiblitySurvey = new FormControl(true);
  userSettingVisiblityPermit = new FormControl(true);
  userSettingVisiblityPeStamp = new FormControl(true);
  userSettingnameprelim = new FormControl("");
  userSettingnamesurvey = new FormControl("");
  userSettingnameDashboard = new FormControl("");
  userSettingnameTeam = new FormControl("");
  userSettingnameInbox = new FormControl("");
  userSettingnamePermit = new FormControl("");
  userSettingnamePEStamp = new FormControl("");
  designcompletedemail = new FormControl("");
  requestgeneratedemail = new FormControl("");
  requestgeneratednotification = new FormControl("");
  requestacknowledgementemail = new FormControl("");
  requestacknowledgementnotification = new FormControl("");
  requestindesigningemail = new FormControl("");
  requestindesigningnotification = new FormControl("");
  designcompletednotification = new FormControl("");
  designmovedtoqcemail = new FormControl("");
  designmovedtoqcnotification = new FormControl("");
  designreviewpassedemail = new FormControl("");
  designreviewpassednotification = new FormControl("");
  designreviewfailedemail = new FormControl("");
  designreviewfailednotification = new FormControl("");
  designdeliveredemail = new FormControl("");
  designdeliverednotification = new FormControl("");

  rolesetting = {
    visibilityprelim: "true",
    visibilitypermit: "true",
    visibilitysurvey: "true",
    visibilitypestamp: "true",
    nameprelim: "Sales Proposal",
    namesurvey: "Survey",
    namedashboard: "Dashboard",
    nameteam: "Team",
    nameinbox: "Inbox",
    namepermit: "Permit",
    namepestamp: "Pestamp",
  };
  userSettings: UserSetting;
  currentUser: CurrentUser;
  public hideprelim: boolean = true;
  public hidesurvey: boolean = true;
  public hidepermit: boolean = true;
  public hidepestamp: boolean = true;
  /* getemail = new FormControl("");
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
   restapidevelopermode = new FormControl("");*/
  constructor(
    private router: Router,
    public authService: AuthenticationService,
    public genericService: GenericService,
    private notifyService: NotificationService,
    private eventEmitterService: EventEmitterService,
    public formBuilder: FormBuilder,
    private commonservice: CommonService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.loggedInUser = authService.currentUserValue.user;
    //this.loggedInUser = JSON.parse(localStorage.getItem('currentUser')).user;
    this.currentUser = authService.currentUserValue;
    this.userSettings = JSON.parse(localStorage.getItem("usersettings"));
    this.accountsettingform = new FormGroup({
      userSettingVisibilityPrelim: this.userSettingVisibilityPrelim,
      userSettingVisiblityPeStamp: this.userSettingVisiblityPeStamp,
      userSettingVisiblityPermit: this.userSettingVisiblityPermit,
      userSettingVisiblitySurvey: this.userSettingVisiblitySurvey,
      userSettingnameprelim: this.userSettingnameprelim,
      userSettingnamesurvey: this.userSettingnamesurvey,
      userSettingnameDashboard: this.userSettingnameDashboard,
      userSettingnameTeam: this.userSettingnameTeam,
      userSettingnameInbox: this.userSettingnameInbox,
      userSettingnamePermit: this.userSettingnamePermit,
      userSettingnamePEStamp: this.userSettingnamePEStamp
    })
    //  if(this.genericService.specificclient){
    //   this.userSettings.namepermit = 'Design';
    // }
    this.userSettingnameprelim.patchValue(this.userSettings.nameprelim);
    this.userSettingnamesurvey.patchValue(this.userSettings.namesurvey);
    this.userSettingnamePermit.patchValue(this.userSettings.namepermit);
    this.userSettingnameTeam.patchValue(this.userSettings.nameteam);
    this.userSettingnameInbox.patchValue(this.userSettings.nameinbox);
    this.userSettingnameDashboard.patchValue(this.userSettings.namedashboard);
    this.userSettingnamePEStamp.patchValue(this.userSettings.namepestamp);

    this.userSettingVisiblityPermit.patchValue(
      this.userSettings.visibilitypermit
    );
    this.userSettingVisibilityPrelim.patchValue(
      this.userSettings.visibilityprelim
    );
    this.userSettingVisiblitySurvey.patchValue(
      this.userSettings.visibilitysurvey
    );
    this.userSettingVisiblityPeStamp.patchValue(
      this.userSettings.visibilitypestamp
    );

    this.requestgeneratednotification.patchValue(
      this.loggedInUser.requestgeneratednotification
    );
    this.requestacknowledgementnotification.patchValue(
      this.loggedInUser.requestacknowledgementnotification
    );
    this.requestindesigningnotification.patchValue(
      this.loggedInUser.requestindesigningnotification
    );
    this.designcompletednotification.patchValue(
      this.loggedInUser.designcompletednotification
    );
    this.designreviewpassednotification.patchValue(
      this.loggedInUser.designreviewpassednotification
    );
    this.designmovedtoqcnotification.patchValue(
      this.loggedInUser.designmovedtoqcnotification
    );
    this.designreviewfailednotification.patchValue(
      this.loggedInUser.designreviewfailednotification
    );
    this.designdeliverednotification.patchValue(
      this.loggedInUser.designdeliverednotification
    );
    this.requestgeneratedemail.patchValue(
      this.loggedInUser.requestgeneratedemail
    );
    this.requestacknowledgementemail.patchValue(
      this.loggedInUser.requestacknowledgementemail
    );
    this.requestindesigningemail.patchValue(
      this.loggedInUser.requestindesigningemail
    );
    this.designcompletedemail.patchValue(
      this.loggedInUser.designcompletedemail
    );
    this.designmovedtoqcemail.patchValue(
      this.loggedInUser.designmovedtoqcemail
    );
    this.designreviewfailedemail.patchValue(
      this.loggedInUser.designreviewfailedemail
    );
    this.designreviewpassedemail.patchValue(
      this.loggedInUser.designreviewpassedemail
    );
    this.designdeliveredemail.patchValue(
      this.loggedInUser.designdeliveredemail
    );

    this.requestgeneratednotification.patchValue(this.loggedInUser.requestgeneratednotification);
    this.requestacknowledgementnotification.patchValue(this.loggedInUser.requestacknowledgementnotification);
    this.requestindesigningnotification.patchValue(this.loggedInUser.requestindesigningnotification);
    this.designcompletednotification.patchValue(this.loggedInUser.designcompletednotification);
    this.designreviewpassednotification.patchValue(this.loggedInUser.designreviewpassednotification);
    this.designmovedtoqcnotification.patchValue(this.loggedInUser.designmovedtoqcnotification);
    this.designreviewfailednotification.patchValue(this.loggedInUser.designreviewfailednotification);
    this.designdeliverednotification.patchValue(this.loggedInUser.designdeliverednotification);
    this.requestgeneratedemail.patchValue(this.loggedInUser.requestgeneratedemail);
    this.requestacknowledgementemail.patchValue(this.loggedInUser.requestacknowledgementemail)
    this.requestindesigningemail.patchValue(this.loggedInUser.requestindesigningemail);
    this.designcompletedemail.patchValue(this.loggedInUser.designcompletedemail);
    this.designmovedtoqcemail.patchValue(this.loggedInUser.designmovedtoqcemail);
    this.designreviewfailedemail.patchValue(this.loggedInUser.designreviewfailedemail);
    this.designreviewpassedemail.patchValue(this.loggedInUser.designreviewpassedemail);
    this.designdeliveredemail.patchValue(this.loggedInUser.designdeliveredemail);


    this.hidepermit = this.userSettings.visibilitypermit;
    this.hideprelim = this.userSettings.visibilityprelim;
    this.hidepestamp = this.userSettings.visibilitypestamp;
    this.hidesurvey = this.userSettings.visibilitysurvey;
    this.eventEmitterService.onSidebarRouteChange("Settings");
    // console.log(this.loggedInUser)
    // this.restapidevelopermode.patchValue(this.loggedInUser.restapidevelopermode)

  }

  ngOnInit(): void {
    // do nothing.
  }
  ngAfterViewInit(): void {
    // do nothing.
  }
  saveData(): void {
    if (this.userSettingnameprelim.value == "" || this.userSettingnameprelim.value === null) {
      this.accountsettingform.get("userSettingnameprelim").setValue(this.rolesetting.nameprelim);
    }
    if (this.userSettingnamesurvey.value == "" || this.userSettingnamesurvey.value === null) {
      this.accountsettingform.get("userSettingnamesurvey").setValue(this.rolesetting.namesurvey);
    }
    if (this.userSettingnameDashboard.value == "" || this.userSettingnameDashboard.value === null) {
      this.accountsettingform.get("userSettingnameDashboard").setValue(this.rolesetting.namedashboard);
    }
    if (this.userSettingnameTeam.value == "" || this.userSettingnameTeam.value === null) {
      this.accountsettingform.get("userSettingnameTeam").setValue(this.rolesetting.nameteam);
    }
    if (this.userSettingnameInbox.value == "" || this.userSettingnameInbox.value === null) {
      this.accountsettingform.get("userSettingnameInbox").setValue(this.rolesetting.nameinbox);
    }
    if (this.userSettingnamePermit.value == "" || this.userSettingnamePermit.value === null) {
      this.accountsettingform.get("userSettingnamePermit").setValue(this.rolesetting.namepermit);
    }
    if (this.userSettingnamePEStamp.value == "" || this.userSettingnamePEStamp.value === null) {
      this.accountsettingform.get("userSettingnamePEStamp").setValue(this.rolesetting.namepestamp);
    }
    this.onUpdateAccountSetting();
  }
  onUpdateAccountSetting(): void {

    if (this.accountsettingform.valid) {
      const accountSetting = {

        //---------VisibilitySetting--------
        visibilityprelim: this.userSettingVisibilityPrelim.value,
        visibilitypermit: this.userSettingVisiblityPermit.value,
        visibilitysurvey: this.userSettingVisiblitySurvey.value,
        visibilitypestamp: this.userSettingVisiblityPeStamp.value,

        //-------NameSetting-------------

        nameprelim: this.accountsettingform.get("userSettingnameprelim").value,
        namesurvey: this.userSettingnamesurvey.value,
        namedashboard: this.userSettingnameDashboard.value,
        nameinbox: this.userSettingnameInbox.value,
        nameteam: this.userSettingnameTeam.value,
        namepermit: this.userSettingnamePermit.value,
        namepestamp: this.userSettingnamePEStamp.value,
        isonboardingcompleted: true,
      }
      if (!accountSetting.visibilitypermit && !accountSetting.visibilitypestamp && !accountSetting.visibilityprelim && !accountSetting.visibilitysurvey) {
        this.notifyService.showError("Atleast one preferred service should be enable.", "Error");
      }
      else {
        this.authService.setRequiredHeaders();
        this.authService
          .editUserSetting(
            this.authService.currentUserValue.user.id,
            accountSetting,
          )
          .subscribe(
            (res) => {
              localStorage.setItem("usersettings", JSON.stringify(res.body));
              this.eventEmitterService.onSidebarRefresh();
              this.eventEmitterService.onSettingsUpdate(res.body);
              this.notifyService.showSuccess("User Settings have been updated successfully.", "Success");
              this.handleBack();
              this.commonservice.userData(this.authService.currentUserValue.user.id)
                .subscribe(() => {

                  // console.log("usersettingSaved");

                  this.authService.broadCastCurrentUserSetting(true);
                }, error => {
                  this.notifyService.showError(
                    error,
                    "Error"
                  );
                });
            }, error => {
              this.notifyService.showError(
                error,
                "Error"
              );
            }
            /*
             () => {
               // console.log("userSetting");
               this.notifyService.showSuccess("Client details have been updated successfully.", "Success");
               this.currentUser.user.isonboardingcompleted = true;
               localStorage.setItem("currentUser",JSON.stringify(this.currentUser))
               this.commonservice
                 .userData(this.authService.currentUserValue.user.id)
                 .subscribe(() => {
                   // console.log("usersettingSaved");
                   this.authService.broadCastCurrentUserSetting(true);
                 });
             }*/
          );
        // this.handleBack();
      }
    }
    this.changeDetectorRef.detectChanges();
  }
  handleBack(): void {
    // this.router.navigate([localStorage.getItem("lastroute")]);
    this.router.navigate(['/home/dashboard/overview']);
    this.eventEmitterService.onSidebarRouteChange("Dashboard");
  }
  toggle($event: MatSlideToggle): void {
    this.show = $event.checked;
    if (this.show)
      this.buttonName = "Show";
    else
      this.buttonName = "Hide";
  }
  togglebutton($event: MatSlideToggle, type: string): void {


    if (type == 'getemail') {
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
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }
  changeState(data): void {
    //  console.log("event:",event);
    if (data == 'Sales Proposal') {
      this.hideprelim = !this.hideprelim;
      this.userSettingVisibilityPrelim.setValue(this.hideprelim)
    }
    else if (data == 'Survey') {
      this.hidesurvey = !this.hidesurvey;
      this.userSettingVisiblitySurvey.setValue(this.hidesurvey);
    }
    else if (data == 'Permit') {
      this.hidepermit = !this.hidepermit;
      this.userSettingVisiblityPermit.setValue(this.hidepermit);
    }
    else if (data == 'PeStamp') {
      this.hidepestamp = !this.hidepestamp;
      this.userSettingVisiblityPeStamp.setValue(this.hidepestamp);
    }
  }
  /*togglebutton($event: MatSlideToggle, type: string) {
    // console.log($event)

    if (type == 'getemail') {
      this.notificationPostData = {
        getemail: $event.checked
      }
    }
    else if (type == 'getnotification') {
      this.notificationPostData = {
        getnotification: $event.checked
      }
    }
    else if (type == 'requestgeneratednotification') {
      this.notificationPostData = {
        requestgeneratednotification: $event.checked
      }
    }
    else if (type == 'requestacknowledgementnotification') {
      this.notificationPostData = {
        requestacknowledgementnotification: $event.checked
      }
    }
    else if (type == 'requestindesigningnotification') {
      this.notificationPostData = {
        requestindesigningnotification: $event.checked
      }
    }
    else if (type == 'designcompletednotification') {
      this.notificationPostData = {
        designcompletednotification: $event.checked
      }
    }
    else if (type == 'designreviewpassednotification') {
      this.notificationPostData = {
        designreviewpassednotification: $event.checked
      }
    }
    else if (type == 'designonholdnotification') {
      this.notificationPostData = {
        designonholdnotification: $event.checked
      }
    }
    else if (type == 'designmovedtoqcnotification') {
      this.notificationPostData = {
        designmovedtoqcnotification: $event.checked
      }
    }
    else if (type == 'designreviewfailednotification') {
      this.notificationPostData = {
        designreviewfailednotification: $event.checked
      }
    }
    else if (type == 'designdeliverednotification') {
      this.notificationPostData = {
        designdeliverednotification: $event.checked
      }
    }



    else if (type == 'requestgeneratedemail') {
      this.notificationPostData = {
        requestgeneratedemail: $event.checked
      }
    }
    else if (type == 'requestacknowledgementemail') {
      this.notificationPostData = {
        requestacknowledgementemail: $event.checked
      }
    }
    else if (type == 'requestindesigningemail') {
      this.notificationPostData = {
        requestindesigningemail: $event.checked
      }
    }
    else if (type == 'designcompletedemail') {
      this.notificationPostData = {
        designcompletedemail: $event.checked
      }
    }

    else if (type == 'designmovedtoqcemail') {
      this.notificationPostData = {
        designmovedtoqcemail: $event.checked
      }
    }
    else if (type == 'designreviewfailedemail') {
      this.notificationPostData = {
        designreviewfailedemail: $event.checked
      }
    }
    else if (type == 'designreviewpassedemail') {
      this.notificationPostData = {
        designreviewpassedemail: $event.checked
      }
    }
    else if (type == 'designdeliveredemail') {
      this.notificationPostData = {
        designdeliveredemail: $event.checked
      }
    }
    else if (type == 'restapidevelopermode') {
      this.notificationPostData = {
        restapidevelopermode: $event.checked
      }
    }

    this.authService.setRequiredHeaders()
    this.authService.editUserProfile(
      this.authService.currentUserValue.user.id,
      this.notificationPostData
    ).subscribe(
      response => {
        this.authService.currentUserValue.user = response;
      }, error => {
        this.notifyService.showError(
          error,
          "Error"
        );
      }
    )
  }*/
}
