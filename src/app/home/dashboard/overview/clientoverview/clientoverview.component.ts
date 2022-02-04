import { SelectionModel } from "@angular/cdk/collections";
import {
  ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatRadioChange } from "@angular/material/radio";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { TeamService } from "src/app/_services/team.service";
import { AddminpermitdesigndialogComponent } from "../../permitdesign/addminpermitdesigndialog/addminpermitdesigndialog.component";
import { AdddesigndialogComponent } from "../../prelimdesign/adddesigndialog/adddesigndialog.component";
import { AddcoinsdialogComponent } from "../../profile/addcoinsdialog/addcoinsdialog.component";
import { AddteammemberdialogComponent } from "../../team/addteammemberdialog/addteammemberdialog.component";
import { TeammemberdetaildialogComponent } from "../../team/teammemberdetaildialog/teammemberdetaildialog.component";
import { WelcomedialogComponent } from "../welcomedialog/welcomedialog.component";

@Component({
  selector: "app-clientoverview",
  templateUrl: "./clientoverview.component.html",
  styleUrls: ["./clientoverview.component.scss"],
})
export class ClientoverviewComponent implements OnInit {
  isLinear = false;
  color: ThemePalette = "primary";
  requiredinformationform: FormGroup;
  usertype = new FormControl("", [Validators.required]);
  billingaddress = new FormControl("");
  company = new FormControl("", []);
  registrationnumber = new FormControl("");
  payment = new FormControl("", [Validators.required]);
  userlogo = new FormControl("");
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
  placeholder = false;
  isLoading = false;
  displayedColumns: string[] = ["name", "role", "email", "phone", "manage"];
  teamMembers: User[] = [];
  loggedInUser: User;
  isClient = false;
  dataSource = new MatTableDataSource<User>(this.teamMembers);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  logo;
  selection = new SelectionModel<User>(true, []);
  admins = 0;
  bds = 0;
  designers = 0;
  surveyors = 0;
  analysts = 0;

  notificationPostData;
  loadingmessage = "Saving data";

  constructor(
    public dialog: MatDialog,
    public fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private authService: AuthenticationService,
    private teamService: TeamService,
    private commonService: CommonService,
    public genericService: GenericService,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private notifyService: NotificationService,
    private router: Router
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;

    this.requiredinformationform = new FormGroup({
      usertype: this.usertype,
      billingaddress: this.billingaddress,
      company: this.company,
      registrationnumber: this.registrationnumber,
      payment: this.payment,
      logo: this.userlogo,
    });

    this.usertype.patchValue(this.loggedInUser.usertype);
    this.billingaddress.patchValue(this.loggedInUser.billingaddress);
    this.company.patchValue(this.loggedInUser.company);
    this.registrationnumber.patchValue(this.loggedInUser.registrationnumber);

    this.getemail.patchValue(this.loggedInUser.getemail);
    this.getnotification.patchValue(this.loggedInUser.getnotification);
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
    this.designonholdnotification.patchValue(
      this.loggedInUser.designonholdnotification
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
    this.requestindesigningemail.patchValue(
      this.loggedInUser.requestindesigningemail
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
    if (this.loggedInUser.ispaymentmodeprepay === null) {
      this.payment.patchValue(false.toString());
    } else {
      this.payment.patchValue(this.loggedInUser.ispaymentmodeprepay.toString());
    }
  }

  registrationForm = this.fb.group({
    file: [null],
  });

  /*########################## File Upload ########################*/
  @ViewChild("fileInput") el: ElementRef;
  imageUrl: any;
  editFile: boolean = true;
  removeUpload: boolean = false;

  uploadFile(event): void {
    const reader = new FileReader(); // HTML5 FileReader API
    const file = event.target.files[0];
    this.logo = event.target.files[0];

    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);

      // When file uploads set it to file formcontrol
      reader.onload = () => {
        this.imageUrl = reader.result;

        this.registrationForm.patchValue({
          file: reader.result,
        });
        this.editFile = false;
        this.removeUpload = true;
      };
      // ChangeDetectorRef since file is loading outside the zone
      this.cd.markForCheck();
    }
  }

  getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
  }

  // Function to remove uploaded file
  removeUploadedFile(): void {
    // let newFileList = Array.from(this.el.nativeElement.files);
    this.editFile = true;
    this.removeUpload = false;
    this.registrationForm.patchValue({
      file: [null],
    });
  }

  // Submit Registration Form
  onSubmit(): boolean {
    if (!this.registrationForm.valid) {
      alert("Please fill all the required fields to create a super hero!");
      return false;
    }
  }

  openWelcomeDialog(): void {
    const dialogRef = this.dialog.open(WelcomedialogComponent, {
      width: "60%",
      disableClose: true,
      data: { name: "Rachna", animal: "Monkey" },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }

  ngOnInit(): void {
    // do nothing.
  }

  radioChange($event: MatRadioChange): void {
    if ($event.value == "company") {
      this.company.setValidators([Validators.required]);
      this.registrationnumber.setValidators([Validators.required]);
      this.billingaddress.setValidators([Validators.required]);
    }
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

  ngAfterViewInit(): void {
    this.fetchTeamData();
    this.dataSource.paginator = this.paginator;
    if (this.authService.currentUserValue.user.logo === null) {
      this.imageUrl =
        "https://getstamped.co.uk/wp-content/uploads/WebsiteAssets/Placeholder.jpg";
    } else {
      this.imageUrl = this.authService.currentUserValue.user.logo.url;
    }
  }

  fetchTeamData(): void {
    this.teamService.getTeamData().subscribe(
      (response) => {
        if (response.length > 0) {
          this.placeholder = false;
          this.teamMembers = this.fillinDynamicData(response);
          this.dataSource.data = this.teamMembers;
          //this.resetOverviewData();
          //this.constructOverviewData();
        } else {
          this.placeholder = true;
        }
      },
      () => {
        //this.notifyService.showError(error, "Error");
      }
    );
  }

  fillinDynamicData(records: User[]): User[] {
    records.forEach((element) => {
      element.rolename = this.genericService.getRoleName(element.role.id);
    });

    return records;
  }

  openConfirmationDialog(user: User): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message:
            "Are you sure you want to remove " +
            user.firstname +
            " " +
            user.lastname +
            " from your team?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.teamService.deleteTeamUser("" + user.id).subscribe(
        () => {
          this.teamService.deleteCometChatUser("" + user.id);
          this.notifyService.showSuccess(
            user.firstname +
            " " +
            user.lastname +
            " has been removed successfully from your team.",
            "Success"
          );
          this.removeUserFromList(user);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }

  removeUserFromList(user: User): void {
    this.teamMembers.forEach((element) => {
      if (element.id == user.id) {
        this.teamMembers.splice(this.teamMembers.indexOf(element), 1);
        this.dataSource.data = this.teamMembers;
        /*  this.resetOverviewData();
         this.constructOverviewData();
         this.changeDetectorRef.detectChanges(); */
      }
    });
  }

  openEditTeamMemberDialog(user: User): void {
    let width = "35%";
    if (!this.isClient) {
      width = "50%";
    }
    const dialogRef = this.dialog.open(AddteammemberdialogComponent, {
      width: width,
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: true, user: user, triggerEditEvent: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.fetchTeamData();
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  overviewFilter(filterValue: string): void {
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  openTeamMemberDetailDialog(element): void {
    const triggerEditEvent = false;
    const dialogRef = this.dialog.open(TeammemberdetaildialogComponent, {
      width: "60%",
      disableClose: true,
      autoFocus: false,
      data: { user: element, triggerEditEvent: triggerEditEvent },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.openEditTeamMemberDialog(element);
      }
    });
  }

  openAddTeamMemberDialog(): void {
    const width = "50%";
    /*  if(!this.isClient){
       width = "50%";
     } */
    const dialogRef = this.dialog.open(AddteammemberdialogComponent, {
      width: width,
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: false, triggerEditEvent: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.isLoading = false;
      if (result.triggerEditEvent) {
        this.fetchTeamData();
      }
    });
  }

  openAddDesignDialog(ev): void {
    this.router.navigate(["/home/prelimdesign/overview"]);
    const interval = setInterval(async () => {
      ev.stopPropagation();
      const dialogRef = this.dialog.open(AdddesigndialogComponent, {
        width: "80%",
        disableClose: true,
        autoFocus: false,
        data: { isEditMode: false, isDataUpdated: false, isOnboarding: true },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isDataUpdated) {
          //this.fetchAllDesignsCount();
          //this.addItemToList(LISTTYPE.NEW, result.design);
        }
      });
      clearInterval(interval);
    }, 3000);
  }

  openAutocadDialog(ev): void {
    ev.stopPropagation();
    this.router.navigate(["/home/permitdesign/overview"]);
    const interval = setInterval(async () => {
      if (this.loggedInUser.minpermitdesignaccess) {
        const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
          width: "80%",
          disableClose: true,
          autoFocus: false,
          data: { isEditMode: false, isDataUpdated: false },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result.isDataUpdated) {
            //this.fetchAllDesignsCount();
            //his.addItemToPermitList(LISTTYPE.NEW, result.design);
          }
        });
      } else {
        // const dialogRef = this.dialog.open(GenerateautocadfiledialogComponent, {
        //   width: "80%",
        //   autoFocus: false,
        //   data: { isEditMode: false, isDataUpdated: false }
        // });
        // dialogRef.afterClosed().subscribe(result => {
        //   if (result.isDataUpdated) {
        //     //this.addItemToPermitList(LISTTYPE.NEW, result.design);
        //   }
        // });
      }
      clearInterval(interval);
    }, 3000);
  }
  onUpdateUserInformation(): void {
    this.authService.setRequiredHeaders();
    if (this.requiredinformationform.valid) {
      this.isLoading = true;
      const postData = {
        usertype: this.requiredinformationform.get("usertype").value,
        company: this.requiredinformationform.get("company").value,
        billingaddress:
          this.requiredinformationform.get("billingaddress").value,
        registrationnumber:
          this.requiredinformationform.get("registrationnumber").value,
        ispaymentmodeprepay: this.requiredinformationform.get("payment").value,
        isonboardingcompleted: true,
      };

      this.authService
        .editUserProfile(this.authService.currentUserValue.user.id, postData)
        .subscribe(
          () => {
            if (this.logo != undefined) {
              this.uploadLogo();
            } else {
              //this.data.user = response;
              //this.data.isdatamodified = true;
              this.isLoading = false;
              this.changeDetectorRef.detectChanges();
              this.notifyService.showSuccess(
                "Client details have been updated successfully.",
                "Success"
              );
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      // this.displayerror = false;
    }
  }

  uploadLogo(): void {
    this.loadingmessage = "Uploading logo";
    this.changeDetectorRef.detectChanges();
    this.commonService
      .uploadLogo(
        this.loggedInUser.id,
        this.loggedInUser.id + "/logo",
        this.logo,
        "logo",
        "user",
        // "users-permissions"
      )
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.updatelogo(response[0]);
          this.changeDetectorRef.detectChanges();
          this.notifyService.showSuccess(
            "Client details have been updated successfully.",
            "Success"
          );
          this.logo.triggerEditEvent = true;
          this.logo.isDataUpdated = true;
          // this.loggedInUser.logo;
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  updatelogo(logo): void {
    this.authService.setRequiredHeaders();
    const postData = {
      logo: logo,
    };

    this.authService
      .editUserProfile(this.authService.currentUserValue.user.id, postData)
      .subscribe(
      );
  }

  openAddMoneyToWalletDialog(): void {
    const dialogRef = this.dialog.open(AddcoinsdialogComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      data: {
        isdatamodified: true,
        user: User,
        paymenttitle: "Add money to wallet",
      },
      panelClass: "white-modalbox",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdatamodified) {
        this.loggedInUser.amount = result.user.amount;
        this.changeDetectorRef.detectChanges();
      }
    });
  }
}
