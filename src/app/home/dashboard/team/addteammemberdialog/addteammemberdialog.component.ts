import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatRadioChange } from "@angular/material/radio";
import { CometChat } from "@cometchat-pro/chat";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { COMETCHAT_CONSTANTS, MAILFORMAT, ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import { ClientRole } from "src/app/_models/clientrole";
import { UserSetting } from "src/app/_models/usersettings";
import {
  AuthenticationService,
  GenericService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { TeamService } from "src/app/_services/team.service";
import * as countriesjson from "../../../../_data/countries.json";
import { TransferjobsComponent } from "../transferjobs/transferjobs.component";


export interface Country {
  country: string;
  calling_code: string;
}

export interface TeamMemberFormData {
  triggerEditEvent: boolean;
  isEditMode: boolean;
  user: User;
  userSetting: any;
}

@Component({
  selector: "app-addteammemberdialog",
  templateUrl: "./addteammemberdialog.component.html",
  styleUrls: ["./addteammemberdialog.component.scss"],
})
export class AddteammemberdialogComponent implements OnInit {
  petype: string = "";
  pevalues = [
    {
      id: 1,
      name: 'Electrical',
      role: 'electrical'
    },
    {
      id: 2,
      name: 'Structural',
      role: 'structural'
    }
  ]
  countries: Country[] = (countriesjson as any).default;
  filteredOptions: Observable<Country[]>;
  adminrole = ROLES.ContractorAdmin;

  firstname = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z]{1,}$"),
  ]);
  lastname = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z]{1,}$"),
  ]);
  workemail = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  phone = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("[0-9]{8,15}$"),
  ]);
  role = new FormControl("", [Validators.required]);
  access = new FormControl("", Validators.required);
  permisson = new FormControl(false, []);
  countrycontrol = new FormControl("", [Validators.required]);
  address = new FormControl("", []);
  peengineertype = new FormControl(this.petype);
  prelimaccess: any = new FormControl(false);
  surveyaccess: any = new FormControl(false);
  permitccess: any = new FormControl(false);
  pestampaccess: any = new FormControl(false);
  teamaccess: any = new FormControl(false);
  addteamDialogForm: FormGroup;

  displayerror = true;
  selectedcountry: any;

  isLoading = false;
  loggedinUser: User;
  usersettings: UserSetting;
  isClient = false;

  submitted: boolean = false;
  roleid;
  pesuperadminroleid = 0;

  disablebutton = false;
  loadingmessage = "Save data.";

  sidebardacess: string[] = [];
  clientroles: ClientRole[];
  isPesuperadmin = false;
  constructor(
    public dialogRef: MatDialogRef<AddteammemberdialogComponent>,
    public dialog: MatDialog,
    private notifyService: NotificationService,
    private teamService: TeamService,
    public genericService: GenericService,
    private authService: AuthenticationService,
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: TeamMemberFormData
  ) {
    this.pesuperadminroleid = ROLES.PESuperAdmin;
    this.loggedinUser = this.authService.currentUserValue.user;
    if (
      this.loggedinUser.role.id == ROLES.SuperAdmin ||
      this.loggedinUser.role.id == ROLES.Admin
    ) {
      this.adminrole = ROLES.Admin;
      this.isClient = false;
    } else if (
      this.loggedinUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedinUser.role.id == ROLES.ContractorAdmin ||
      this.loggedinUser.role.id == ROLES.SuccessManager
    ) {
      this.adminrole = ROLES.ContractorAdmin;
      this.isClient = true;
    }
    if (this.loggedinUser.role.id == ROLES.PESuperAdmin) {
      this.isPesuperadmin = true;
    }
    this.addteamDialogForm = new FormGroup({
      firstname: this.firstname,
      lastname: this.lastname,
      workemail: this.workemail,
      role: this.role,
      permisson: this.permisson,
      peengineertype: this.peengineertype,
      prelimaccess: this.prelimaccess,
      surveyaccess: this.surveyaccess,
      permitaccess: this.permitccess,
      pestampaccess: this.pestampaccess,
      teamaccess: this.teamaccess,
    });

    if (data.isEditMode) {
      if (data.user.role.id == undefined) {
        this.roleid = data.user.role;
      } else {
        this.roleid = data.user.role.id;
      }

      this.disablebutton = true;
      this.addteamDialogForm.patchValue({
        firstname: data.user.firstname,
        lastname: data.user.lastname,
        workemail: data.user.email,
        phone: data.user.phone,
        role: "" + this.roleid,
        permisson: data.user.permissiontomakedesign,
        peengineertype: data.user.peengineertype,
        prelimaccess: data.userSetting?.visibilityprelim,
        surveyaccess: data.userSetting?.visibilitysurvey,
        permitaccess: data.userSetting?.visibilitypermit,
        pestampaccess: data.userSetting?.visibilitypestamp,
        teamaccess: data.userSetting?.visibilityteam,
      });

      this.role.setValue(this.roleid);
    }
    this.filteredOptions = this.countrycontrol.valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value.name)),
      map((name) => (name ? this._filter(name) : this.countries.slice()))
    );

    //Pre select if only one role found
    if (genericService.clientroles && genericService.clientroles.length == 1) {
      this.role.setValue("" + genericService.clientroles[0].id);
    }
    this.usersettings = JSON.parse(localStorage.getItem("usersettings"));
    this.clientroles = genericService.clientroles;
    if (!this.usersettings.visibilitysurvey) {
      this.clientroles.forEach((element, i) => {
        if (element.role.id == ROLES.Surveyor) {
          this.clientroles.splice(i, 1);
        }
      });
      // this.clientroles.splice(2,1);
    } else {
      this.clientroles = genericService.clientroles;
    }
    if (this.loggedinUser.parent.ispaymentmodeprepay) {
      this.clientroles.forEach((element, i) => {
        if (element.role.id == ROLES.SuccessManager) {
          this.clientroles.splice(i, 1);
        }
      });
    }
  }

  ngOnInit(): void {
    this.usersettings = JSON.parse(localStorage.getItem("usersettings"));
  }

  ngAfterViewInit(): void {
    if (this.loggedinUser.role.id == ROLES.PESuperAdmin) {
      const toSelect = this.clientroles.find(
        (c) => c.role.id == ROLES.Peengineer
      );
      this.role.setValue(toSelect.role.id);
    }
  }

  displayFn(country: Country): string {
    return country && country.country ? country.country : "";
  }

  private _filter(name: string): Country[] {
    const filterValue = name.toLowerCase();

    return this.countries.filter(
      (country) => country.country.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedCountry(item: Country): void {
    this.selectedcountry = item;
  }

  radioChange($event: MatRadioChange): void {
    // console.log(this.usersettings);
    this.prelimaccess.patchValue(false);
    this.permitccess.patchValue(false);
    this.surveyaccess.patchValue(false);
    this.pestampaccess.patchValue(false);
    this.teamaccess.patchValue(false);
    if ($event.source.name === "role") {
      if ($event.value == ROLES.Peengineer) {
        if (this.usersettings.visibilitypestamp) {
          this.pestampaccess.patchValue(true);
          this.peengineertype.setValidators([Validators.required]);
        }
      } else {
        this.peengineertype.clearValidators();
        this.peengineertype.updateValueAndValidity();
      }
      if ($event.value == ROLES.Designer) {
        if (this.usersettings.visibilityprelim) {
          this.prelimaccess.patchValue(true);
        }
        if (this.usersettings.visibilitypermit) {
          this.permitccess.patchValue(true);
        }
      }
      if ($event.value == ROLES.Surveyor) {
        if (this.usersettings.visibilitysurvey) {
          this.surveyaccess.patchValue(true);
        }
      }
      if ($event.value == ROLES.Analyst) {
        if (this.usersettings.visibilityprelim) {
          this.prelimaccess.patchValue(true);
        }
        if (this.usersettings.visibilitypermit) {
          this.permitccess.patchValue(true);
        }
      }

      if (
        $event.value == ROLES.BD ||
        $event.value == ROLES.SuperAdmin ||
        $event.value == ROLES.Admin ||
        $event.value == ROLES.ContractorSuperAdmin ||
        $event.value == ROLES.ContractorAdmin ||
        $event.value == ROLES.SuccessManager ||
        $event.value == ROLES.Master ||
        $event.value == ROLES.TeamHead
      ) {
        if (this.usersettings.visibilityprelim) {
          this.prelimaccess.patchValue(true);
        }
        if (this.usersettings.visibilitypermit) {
          this.permitccess.patchValue(true);
        }
        if (this.usersettings.visibilitysurvey) {
          this.surveyaccess.patchValue(true);
        }
        if (this.usersettings.visibilitypestamp) {
          this.pestampaccess.patchValue(true);
        }
      }
      if (
        $event.value == ROLES.ContractorAdmin ||
        $event.value == ROLES.SuccessManager ||
        $event.value == ROLES.Admin
      ) {
        this.teamaccess.patchValue(true);
      }
    }
  }

  getErrorMessage(
    control: FormControl
  ): string | string | string | string | string | string | string {
    if (control.hasError("required")) {
      if (control == this.role || control == this.peengineertype) {
        return "you must select a value.";
      } else {
        return "You must enter a value.";
      }
    }
    if (control == this.firstname) {
      return this.firstname.hasError("pattern")
        ? "Firstname should be of min.1 characters and contain only alphabets."
        : "";
    } else if (control == this.lastname) {
      return this.lastname.hasError("pattern")
        ? "Lastname should be of min.1 characters and contain only alphabets."
        : "";
    } else if (control == this.workemail) {
      return this.workemail.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    } else if (control == this.phone) {
      return this.phone.hasError("pattern")
        ? "Please enter a valid phone number."
        : "";
    }
  }

  onCloseClick(): void {
    this.data.triggerEditEvent = false;
    this.dialogRef.close(this.data);
  }

  onAddMember($ev): void {

    this.submitted = true;
    let typeofpeengineer;
    if (this.role.value == "11") {
      typeofpeengineer = this.petype;
    } else {
      typeofpeengineer = null;
    }
    $ev.preventDefault();
    if (this.addteamDialogForm.valid) {
      if (this.data.isEditMode) {
        if (this.role.value != this.data.user.role.id) {
          this.commonService
            .getUserSetting(this.data.user.id)
            .subscribe((response) => {
              if (response) {
                if (this.data.user.role.id == ROLES.Surveyor) {
                  this.notifyService.showWarning(
                    "User is having active jobs currently. You can try again later once the assigned jobs are completed.",
                    "Warning"
                  );
                } else {
                  this.commonService
                    .getSpecificRolesUsers(
                      this.data.user.parent.id,
                      this.data.user.role.id
                    )
                    .subscribe((response) => {
                      response.forEach((element, i) => {
                        if (element.id == this.data.user.id) {
                          response.splice(i, 1);
                        }
                      });
                      const dialogRef = this.dialog.open(
                        TransferjobsComponent,
                        {
                          width: "60%",
                          autoFocus: false,
                          disableClose: true,
                          data: {
                            refreshDashboard: false,
                            users: response,
                            EditableUser: this.data.user,
                          },
                        }
                      );

                      dialogRef.afterClosed().subscribe((result) => {
                        if (result.refreshDashboard) {
                          this.EditUser();
                        }
                      });
                    });
                }
              } else {
                this.EditUser();
              }
            });
        } else {
          this.EditUser();
        }
      } else {
        let rolesel = parseInt(this.addteamDialogForm.get("role").value);
        let senddesignrequestpermission = false;
        if (
          rolesel == ROLES.ContractorAdmin ||
          rolesel == ROLES.SuccessManager ||
          rolesel == ROLES.Admin ||
          rolesel == ROLES.BD
        ) {
          senddesignrequestpermission = true;
        }

        this.isLoading = true;
        this.teamService
          .addUser(
            this.addteamDialogForm.get("workemail").value,
            this.addteamDialogForm.get("firstname").value,
            this.addteamDialogForm.get("lastname").value,
            senddesignrequestpermission,
            parseInt(this.addteamDialogForm.get("role").value),
            this.loggedinUser.parent.minpermitdesignaccess,
            typeofpeengineer,
            true,
            this.prelimaccess.value,
            this.permitccess.value,
            this.surveyaccess.value,
            this.pestampaccess.value,
            this.teamaccess.value
          )
          .subscribe(
            (response) => {
              this.updateuserdetails(response.id);
            },
            (error) => {
              this.isLoading = false;
              this.notifyService.showError(error, "Error");
            }
          );
      }
    } else {
      this.displayerror = false;
    }
  }

  updateuserdetails(userid): void {
    const postData = {
      cometchatuid: userid + COMETCHAT_CONSTANTS.UNIQUE_CODE,
    };

    this.teamService.editUser(userid, postData).subscribe(
      (response) => {
        this.createachatuser(
          "" + response.id,
          response.firstname + " " + response.lastname
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  EditUser(): void {
    let typeofpeengineer;
    if (this.role.value == "11") {
      typeofpeengineer = this.petype;
    } else {
      typeofpeengineer = null;
    }
    const postData = {
      email: this.addteamDialogForm.get("workemail").value,
      firstname: this.addteamDialogForm.get("firstname").value,
      lastname: this.addteamDialogForm.get("lastname").value,
      role: parseInt(this.addteamDialogForm.get("role").value),
      permissiontomakedesign: this.permisson.value,
      peengineertype: typeofpeengineer,
      visibilityprelim: this.prelimaccess.value,
      visibilitypermit: this.permitccess.value,
      visibilitysurvey: this.surveyaccess.value,
      visibilitypestamp: this.pestampaccess.value,
      visibilityteam: this.teamaccess.value,
    };
    this.isLoading = true;
    this.teamService.editUser(this.data.user.id, postData).subscribe(
      () => {
        this.userSetting();
        this.notifyService.showSuccess(
          "Team member modified successfully.",
          "Success"
        );
        this.data.triggerEditEvent = true;
        this.dialogRef.close(this.data);
        this.isLoading = false;
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  userSetting(): void {
    const postData = {
      visibilityprelim: this.prelimaccess.value,
      visibilitypermit: this.permitccess.value,
      visibilitysurvey: this.surveyaccess.value,
      visibilitypestamp: this.pestampaccess.value,
      visibilityteam: this.teamaccess.value,
      userid: this.data.user.id,
    };
    this.teamService.updatesettinguser(postData).subscribe(
      () => {
        this.data.triggerEditEvent = true;
        this.dialogRef.close(this.data);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  createachatuser(userid: string, name: string): void {
    let apiKey = COMETCHAT_CONSTANTS.API_KEY;
    //let currenttime = new Date().getTime();
    //let uid = userid + "_" + currenttime;
    let uid = userid;
    let username = name;

    let user = new CometChat.User(uid + COMETCHAT_CONSTANTS.UNIQUE_CODE);

    user.setName(username);

    CometChat.createUser(user, apiKey).then(
      () => {
        this.isLoading = false;
        this.notifyService.showSuccess(
          "Team member added successfully.",
          "Success"
        );
        this.data.triggerEditEvent = true;
        this.dialogRef.close(this.data);
      },
      () => {
        this.isLoading = false;
        this.notifyService.showError(
          "The cometchat uid has already been taken.",
          "Error"
        );
      }
    );
  }
}
