import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatRadioChange } from "@angular/material/radio";
import { CometChat } from "@cometchat-pro/chat";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { COMETCHAT_CONSTANTS, ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  GenericService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { TeamService } from "src/app/_services/team.service";
import * as countriesjson from "../../../../_data/countries.json";


export interface Country {
  country: string;
  calling_code: string;
}

export interface TeamMemberFormData {
  triggerEditEvent: boolean;
  isEditMode: boolean;
  group: any;
}

@Component({
  selector: "app-addgroupdialog",
  templateUrl: "./addgroupdialog.component.html",
  styleUrls: ["./addgroupdialog.component.scss"],
})
export class AddgroupdialogComponent implements OnInit {
  countries: Country[] = (countriesjson as any).default;
  filteredOptions: Observable<Country[]>;
  adminrole = ROLES.ContractorAdmin;

  groupname = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z_ ]{1,}$"),
  ]);
  description = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z_ ]{3,}$"),
  ]);

  clientSearch = new FormControl("");
  memberSearch = new FormControl("");

  clientsctrl = new FormControl("", [Validators.required]);
  membersctrl = new FormControl("", [Validators.required]);
  role = new FormControl("", [Validators.required]);
  permisson = new FormControl(false, []);
  countrycontrol = new FormControl("", [Validators.required]);
  address = new FormControl("", []);
  peengineertype = new FormControl("");
  addteamDialogForm: FormGroup;
  clientcompany: any = [];
  members: any = [];
  companyList: string[] = this.clientcompany;
  membersList: string[] = this.members;
  displayerror = true;
  selectedcountry: any;
  selectedclients: string[] = [];
  selectedclientsId: number[] = [];
  selectedmembers: string[] = [];
  selectedmembersId: number[] = [];
  isLoading = false;
  loggedinUser: User;
  isClient = false;

  selectable = true;
  removable = true;
  disablebutton = false;
  loadingmessage = "Save data.";
  clientArr: any[] = [];
  memberArr: any[] = [];
  clientUnique: any;

  @ViewChild("MemberInput") memberInput: ElementRef<HTMLInputElement>;
  @ViewChild("ClientInput") clientInput: ElementRef<HTMLInputElement>;

  constructor(
    public dialogRef: MatDialogRef<AddgroupdialogComponent>,
    private notifyService: NotificationService,
    private teamService: TeamService,
    public genericService: GenericService,
    private authService: AuthenticationService,
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: TeamMemberFormData
  ) {
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

    this.addteamDialogForm = new FormGroup({
      groupname: this.groupname,
      description: this.description,
      clientsctrl: this.clientsctrl,
      membersctrl: this.membersctrl,
    });
    if (data.isEditMode) {
      this.disablebutton = true;
      this.addteamDialogForm.patchValue({
        groupname: this.data.group.name,
        description: this.data.group.description,
        clientsctrl: " ",
        membersctrl: " ",
      });
      this.data.group.members.forEach((element) => {
        this.selectedmembers.push(element.firstname + element.lastname);
        this.selectedmembersId.push(element.id);
      });
      this.data.group.clients.forEach((element) => {
        if (element.company != null) {
          this.selectedclients.push(element.company);
        } else {
          this.selectedclients.push(element.email);
        }
        this.selectedclientsId.push(element.id);
      });
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
  }

  ngOnInit(): void {
    this.fetchClientSuperamin();
    this.fetchTeamData();

    /**If in add group dialog user search some client
     * name then it will be fetch by checking the name
     * of company with search field value.
     */
    this.clientSearch.valueChanges.pipe().subscribe((value) => {
      this.companyList = [];
      this.clientcompany.filter((item) => {
        if (item.company.toUpperCase().indexOf(value.toUpperCase()) == 0) {
          this.companyList.push(item);
        }
      });
    });

    this.memberSearch.valueChanges.pipe().subscribe((value) => {
      this.membersList = [];
      this.members.filter((item) => {
        if (item.name.toUpperCase().indexOf(value.toUpperCase()) == 0) {
          this.membersList.push(item);
        }
      });
    });
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
    if ($event.source.name === "role") {
      if ($event.value == "11") {
        this.peengineertype.setValidators([Validators.required]);
      } else {
        this.peengineertype.clearValidators();
        this.peengineertype.updateValueAndValidity();
      }
    }
  }

  selectclient(event): void {
    this.clientArr.push(event.value.id);

    if (this.selectedclients.length > 0) {
      if (!this.selectedclientsId.includes(event.value.id)) {
        this.selectedclients.push(event.value.company);
        this.selectedclientsId.push(event.value.id);
        this.clientsctrl.patchValue(" ");
      }
      // this.clientArr.forEach((x) => {
      //   if (!this.selectedclientsId.includes(x)) {
      //     this.selectedclients.push(event.value.company);
      //     this.selectedclientsId.push(event.value.id)
      //     this.clientsctrl.patchValue(' ');
      //   }
      // })
    } else {
      this.selectedclients.push(event.value.company);
      this.selectedclientsId.push(event.value.id);
      this.clientsctrl.patchValue(" ");
    }
  }

  selectmembers(event): void {
    this.memberArr.push(event.value.id);

    if (this.selectedmembers.length > 0) {
      if (!this.selectedmembersId.includes(event.value.id)) {
        this.selectedmembers.push(event.value.name);
        this.selectedmembersId.push(event.value.id);
        this.membersctrl.patchValue(" ");
      }
      //   this.memberArr.forEach((x) => {
      //     console.log("=======",this.selectedmembersId,x);
      //     if (!this.selectedmembersId.includes(x)) {
      //       console.log("++++++++");
      //       this.selectedmembers.push(event.value.name);
      //       this.selectedmembersId.push(event.value.id)
      //       this.membersctrl.patchValue(' ');
      //     }
      //   })
    } else {
      this.selectedmembers.push(event.value.name);
      this.selectedmembersId.push(event.value.id);
      this.membersctrl.patchValue(" ");
    }
  }

  removeclient(index): void {
    this.clientArr.splice(index, 1);
    this.selectedclients.splice(index, 1);
    this.selectedclientsId.splice(index, 1);
    if (this.selectedclientsId.length === 0) {
      this.clientsctrl.patchValue("");
    }
  }

  removemember(index): void {
    this.memberArr.splice(index, 1);
    this.selectedmembers.splice(index, 1);
    this.selectedmembersId.splice(index, 1);
    if (this.selectedmembersId.length === 0) {
      this.membersctrl.patchValue("");
    }
  }
  getErrorMessage(control: FormControl): string | string | string | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    if (control == this.groupname) {
      return this.groupname.hasError("pattern")
        ? "Firstname should be of min. Any characters and contain only alphabets."
        : "";
    } else if (control == this.description) {
      return this.description.hasError("pattern")
        ? "Field can't be empty."
        : "";
    }
  }

  onCloseClick(): void {
    this.data.triggerEditEvent = false;
    this.dialogRef.close(this.data);
  }

  onAddMember($ev): void {
    $ev.preventDefault();
    if (this.addteamDialogForm.valid) {
      if (this.data.isEditMode) {
        const postData = {
          name: this.addteamDialogForm.get("groupname").value,
          description: this.addteamDialogForm.get("description").value,
          members: this.selectedmembersId,
          clients: this.selectedclientsId,
          status: true,
        };
        this.isLoading = true;
        this.loadingmessage = "Save data.";
        this.teamService.editGroup(this.data.group.id, postData).subscribe(
          () => {
            this.notifyService.showSuccess(
              "Team member modified successfully.",
              "Success"
            );
            this.data.triggerEditEvent = true;
            this.dialogRef.close(this.data);
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            this.notifyService.showError(error, "Error");
          }
        );
      } else {
        let postData = {
          name: this.addteamDialogForm.get("groupname").value,
          description: this.addteamDialogForm.get("description").value,
          members: this.selectedmembersId,
          clients: this.selectedclientsId,
          status: true,
        };
        this.isLoading = true;
        this.loadingmessage = "Save data.";
        this.teamService.addGroup(postData).subscribe(
          () => {
            this.isLoading = false;
            this.notifyService.showSuccess(
              "Group created successfully.",
              "Success"
            );
            this.data.triggerEditEvent = true;
            this.dialogRef.close(this.data);
            // this.createachatuser("" + response.id, response.firstname + " " + response.lastname);
            this.isLoading = false;
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

  fetchClientSuperamin(): void {
    this.commonService.getClientSuperadminTeamModule().subscribe(
      (response) => {
        response.forEach((element) => {
          if (element.company != null) {
            this.clientcompany.push({
              id: element.id,
              company: element.company,
            });
          }

          if (element.company === null) {
            this.clientcompany.push({ id: element.id, company: element.email });
          }
        });
      },
      (error) => {
        this.notifyService.showError(error, "Error")
      }
    );
  }

  fetchTeamData(): void {
    this.teamService.getTeamDataMembersForGroup().subscribe(
      (response) => {
        response.forEach((element) => {
          if (element.company != null) {
            this.members.push({
              id: element.id,
              name: element.firstname + element.lastname,
            });
          }
        });
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
    let usernamename = name;

    let user = new CometChat.User(uid);

    user.setName(usernamename);

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
