import { Component, Inject, OnInit } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatCheckbox } from "@angular/material/checkbox";
// import { TermsdialogComponent } from '../termsdialog/termsdialog.component';
// import { PrivacydialogComponent } from '../privacydialog/privacydialog.component';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { Router } from "@angular/router";
import { DeviceDetectorService } from "ngx-device-detector";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import {
  COMETCHAT_CONSTANTS,
  FIREBASE_DB_CONSTANTS,
  MAILFORMAT,
  ROLES
} from "src/app/_helpers";
import { User } from "src/app/_models";
import * as countriesjson from "../../_data/countries.json";
import {
  AuthenticationService,
  ContractorService,
  GenericService,
  LoaderService
} from "../../_services";
import { NotificationService } from "../../_services/notification.service";

export interface Country {
  country: string;
  calling_code: string;
}

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  isLoading = false;
  retrycount = 1;

  countries: Country[] = (countriesjson as any).default;
  filteredOptions: Observable<Country[]>;

  firstname = new FormControl("", [
    Validators.required,
    Validators.minLength(1),
    Validators.pattern("^[a-zA-Z]{1,}$"),
  ]);
  lastname = new FormControl("", [
    Validators.required,
    Validators.minLength(1),
    Validators.pattern("^[a-zA-Z]{1,}$"),
  ]);
  workemail = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  company = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9. ]{3,}$"),
  ]);
  countrycontrol = new FormControl("", [Validators.required]);
  phone = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("[0-9]{8,15}$"),
  ]);
  agreement = new FormControl("", [Validators.required]);
  registerForm: FormGroup;

  selectedcountry: any;

  display = false;
  agreedtoterms = false;
  createduser: User;

  isDesktop = false;

  randomPassword = "";

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private notifyService: NotificationService,
    private contractorService: ContractorService,
    private genericService: GenericService,
    private deviceService: DeviceDetectorService,
    private dialog: MatDialog,
    // private location: Location,
    private db: AngularFireDatabase,
    private loaderservice: LoaderService
  ) {
    this.filteredOptions = this.countrycontrol.valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value.name)),
      map((name) => (name ? this._filter(name) : this.countries.slice()))
    );
    this.registerForm = new FormGroup({
      workemail: this.workemail,
      firstname: this.firstname,
      lastname: this.lastname,
      country: this.countrycontrol,
      phone: this.phone,
    });
  }

  // openTermsDialog(event): void {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   const dialogRef = this.dialog.open(TermsdialogComponent, {
  //     width: '60%',
  //     autoFocus: false
  //   });

  //   dialogRef.afterClosed().subscribe(result => {

  //   });
  // }

  // openPrivacyDialog(event): void {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   const dialogRef = this.dialog.open(PrivacydialogComponent, {
  //     width: '60%',
  //     autoFocus: false
  //   });

  //   dialogRef.afterClosed().subscribe(result => {

  //   });
  // }

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

  ngOnInit(): void {
    this.selectedcountry = this.countries.find(
      (c) => c.country == "United States"
    );

    this.countrycontrol.setValue(this.selectedcountry);
    this.setSelectedCountry(this.selectedcountry);

    this.isDesktop = this.deviceService.isDesktop();
    this.genericService.initializeCometChat();
  }

  getErrorMessage(
    control: FormControl
  ): string | string | string | string | string | string | string | string {
    // if (control == this.agreement && control.hasError("required")) {
    //   return "I agree to platforms Terms and privacy policy.";
    // }

    if (control.hasError("required")) {
      if (control == this.agreement) {
        return "Please read the terms of service and privacy policy and agree to proceed";
      } else return "You must enter a value";
    }
    if (control == this.firstname) {
      return this.firstname.hasError("pattern")
        ? "First name should be of min. 1 characters and contain only alphabets."
        : "";
    } else if (control == this.lastname) {
      return this.lastname.hasError("pattern")
        ? "Last name should be of min. 1 characters and contain only alphabets."
        : "";
    } else if (control == this.workemail) {
      return this.workemail.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    } else if (control == this.company) {
      return this.company.hasError("pattern")
        ? "Please enter a valid company name."
        : "";
    } else if (control == this.phone) {
      return this.phone.hasError("pattern")
        ? "Please enter a valid phone number (Min - 8, Max - 15)."
        : "";
    }
  }

  NumbersOnly(event): boolean {
    let charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  OnAgreeTerms(checkbox: MatCheckbox): void {
    if (checkbox.checked) {
      this.display = false;
      this.agreedtoterms = true;
    } else {
      this.display = true;
      this.agreedtoterms = false;
    }
  }

  onRegister(): void {
    this.loaderservice.show();
    if (this.registerForm.valid && this.agreedtoterms) {
      this.randomPassword = this.genericService.randomPass();

      this.authenticationService
        .registerUser(
          this.registerForm.get("workemail").value.toLowerCase(),
          this.randomPassword
        )
        .subscribe(
          (response) => {
            this.genericService.setRequiredHeaders();
            this.isLoading = true;
            this.updateUserDetails(response.user.id, this.randomPassword);
            this.loaderservice.hide();
          },
          (error) => {
            this.loaderservice.hide();
            let errorobj = error[0]["messages"][0];
            this.notifyService.showInfo(errorobj["message"], "Warning");
          }
        );
    } else {
      this.display = true;
      this.registerForm.markAllAsTouched();
      this.loaderservice.hide();
    }
  }

  updateUserDetails(userid: number, password: string): void {
    const country = this.registerForm.get("country").value;
    const postData = {
      firstname: this.registerForm.get("firstname").value,
      lastname: this.registerForm.get("lastname").value,
      country: country.country,
      phone: this.registerForm.get("phone").value,
      source: "web",
      isdefaultpassword: true,
      parent: userid,
      resetPasswordToken: password,
      role: ROLES.ContractorSuperAdmin,
      cometchatuid: userid + COMETCHAT_CONSTANTS.UNIQUE_CODE,
    };

    this.contractorService.editContractor(userid, postData).subscribe(
      (response) => {
        this.createduser = response;
        const regitemRef = this.db.object(
          FIREBASE_DB_CONSTANTS.KEYWORD + this.createduser.id
        );
        regitemRef.set({
          newprelims: 0,
          newpermits: 0,
          checklistupdated: false,
        });
        this.createChatUser(
          this.createduser.id,
          this.createduser.firstname + " " + this.createduser.lastname
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  createChatUser(userid: number, name: string): void {
    this.authenticationService.createChatUser("" + userid, name).subscribe(
      () => {
        this.isLoading = false;
        localStorage.clear();
        const dialogRef = this.dialog.open(RegisterSuccessDialog, {
          width: "30%",
          disableClose: true,
          data: {},
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result.issubmitted) {
            window.location.href = "/auth/login";
            // ("preventBack()");
            window.onunload = function () {
              // null;
            };
          }
        });
        // this.notifyService.showSuccess("Congrats!! Let's get started. We have sent you default login credentials on your registered email.", "Success");
        // this.loginRegisteredUser();
      },
      () => {
        if (this.retrycount > 0) {
          this.retrycount -= 1;
          this.createChatUser(
            this.createduser.id,
            this.createduser.firstname + " " + this.createduser.lastname
          );
        } else {
          this.isLoading = false;
          this.retrycount = 1;
          this.contractorService
            .deleteContractor("" + this.createduser.id)
            .subscribe(
              () => {
                this.notifyService.showInfo(
                  "Something went wrong. Please try again.",
                  "Warning"
                );
              },
              () => {
                this.notifyService.showInfo(
                  "Something went wrong. Please try again.",
                  "Warning"
                );
              }
            );
        }
      }
    );
  }

  loginRegisteredUser(): void {
    this.authenticationService
      .loginUser(this.createduser.email.toLowerCase(), this.randomPassword)
      .subscribe(
        (response) => {
          this.genericService.setRequiredHeaders();

          const isadmin = this.genericService.isUserAdmin(response.user);
          if (isadmin) {
            if (response.user.role.id == ROLES.ContractorSuperAdmin) {
              localStorage.setItem("lastroute", "/home/dashboard/onboarding");
              this.router.navigate(["/home/dashboard/onboarding"]);
            } else {
              localStorage.setItem("lastroute", "/home/dashboard/overview");
              this.router.navigate(["/home/dashboard/overview"]);
            }
          } else {
            if (response.user.role.id == ROLES.Designer) {
              localStorage.setItem(
                "lastroute",
                "/home/dashboard/overview/designer"
              );
              this.router.navigate(["/home/dashboard/overview/designer"]);
            } else if (response.user.role.id == ROLES.Analyst) {
              localStorage.setItem(
                "lastroute",
                "/home/dashboard/overview/analyst"
              );
              this.router.navigate(["/home/dashboard/overview/analyst"]);
            } else if (response.user.role.id == ROLES.Surveyor) {
              localStorage.setItem(
                "lastroute",
                "/home/dashboard/overview/surveyor"
              );
              this.router.navigate(["/home/dashboard/overview/surveyor"]);
            } else if (response.user.role.id == ROLES.BD) {
              localStorage.setItem("lastroute", "/home/dashboard/overview");
              this.router.navigate(["/home/dashboard/overview"]);
            } else if (response.user.role.id == ROLES.Peengineer) {
              localStorage.setItem(
                "lastroute",
                "/home/dashboard/overview/peengineer"
              );
              this.router.navigate(["/home/dashboard/overview/peengineer"]);
            } else if (response.user.role.id == ROLES.Master) {
              localStorage.setItem("lastroute", "/home/dashboard/overview");
              this.router.navigate(["/home/dashboard/overview"]);
            } else if (response.user.role.id == ROLES.TeamHead) {
              localStorage.setItem("lastroute", "/home/dashboard/overview");
              this.router.navigate(["/home/dashboard/overview"]);
            }
          }
        },
        () => {
          /* let errorobj = error[0]["messages"][0];
        this.notifyService.showInfo(errorobj["message"], "Warning"); */
          this.notifyService.showInfo(
            "E-mail address or password is invalid",
            "Warning"
          );
        }
      );
  }
}

export interface RegisterDialogData {
  issubmitted: boolean;
}

@Component({
  selector: "register-success",
  templateUrl: "register-success.html",
})
export class RegisterSuccessDialog {
  constructor(
    public dialogRef: MatDialogRef<RegisterDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: RegisterDialogData
  ) { }

  onSubmit(): void {
    this.data.issubmitted = true;
    this.dialogRef.close(this.data);
  }
}
