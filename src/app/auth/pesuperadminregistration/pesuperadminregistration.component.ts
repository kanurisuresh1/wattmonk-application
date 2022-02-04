import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatCheckbox } from "@angular/material/checkbox";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { DeviceDetectorService } from "ngx-device-detector";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { COMETCHAT_CONSTANTS, MAILFORMAT, ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  ContractorService,
  GenericService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import * as countriesjson from "../../_data/countries.json";
import { } from "../../_services/register.service";
import { PrivacydialogComponent } from "../privacydialog/privacydialog.component";
import { TermsdialogComponent } from "../termsdialog/termsdialog.component";
export interface Country {
  country: string;
  calling_code: string;
}
@Component({
  selector: "app-pesuperadminregistration",
  templateUrl: "./pesuperadminregistration.component.html",
  styleUrls: ["./pesuperadminregistration.component.scss"],
})
export class PesuperadminregistrationComponent implements OnInit {
  [x: string]: any;
  isLoading = false;
  isDesktop = false;
  countries: Country[] = (countriesjson as any).default;
  filteredOptions: Observable<Country[]>;
  firstname = new FormControl("", [
    Validators.required,
    Validators.minLength(1),
    Validators.pattern("^[a-zA-Z.]{1,}$"),
  ]);
  lastname = new FormControl("", [
    Validators.required,
    Validators.minLength(1),
    Validators.pattern("^[a-zA-Z.]{1,}$"),
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
  display = false;
  selectedcountry: any;
  createduser: User;
  constructor(
    private deviceService: DeviceDetectorService,
    // private router: ActivatedRoute,
    private notifyService: NotificationService,
    private authenticationService: AuthenticationService,
    private genericService: GenericService,
    private contractorService: ContractorService,
    // private location: Location,
    private dialog: MatDialog,
    private loaderservice: LoaderService
  ) {
    this.filteredOptions = this.countrycontrol.valueChanges.pipe(
      startWith(""),
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
  openTermsDialog(): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(TermsdialogComponent, {
      width: "60%",
      disableClose: true,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }
  openPrivacyDialog(): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(PrivacydialogComponent, {
      width: "60%",
      disableClose: true,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
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
  ngOnInit(): void {
    this.isDesktop = this.deviceService.isDesktop();
    this.selectedcountry = this.countries.find(
      (c) => c.country == "United States"
    );
    this.countrycontrol.setValue(this.selectedcountry);
    this.setSelectedCountry(this.selectedcountry.country);
    this.genericService.initializeCometChat();
  }

  getErrorMessage(
    control: FormControl
  ): string | string | string | string | string | string | string | string {
    if (control == this.agreement && control.hasError("required")) {
      return "Please read the terms of service and privacy policy and agree to proceed.";
    }
    if (control.hasError("required")) {
      return "You must enter a value";
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
        ? "Please enter a valid phone number."
        : "";
    }
  }

  NumbersOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
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
      const randomPassword = this.genericService.randomPass();
      this.authenticationService
        .registerPESuperadmin(
          this.registerForm.get("workemail").value,
          randomPassword
        )
        .subscribe(
          (response) => {
            this.genericService.setRequiredHeaders();
            this.isLoading = true;
            this.updateUserDetails(response.user.id, randomPassword);
            this.loaderservice.hide();
          },
          (error) => {
            this.loaderservice.hide();
            const errorobj = error[0]["messages"][0];
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
      role: ROLES.PESuperAdmin,
      cometchatuid: userid + COMETCHAT_CONSTANTS.UNIQUE_CODE,
    };

    this.contractorService.editContractor(userid, postData).subscribe(
      (response) => {
        this.createduser = response;
        this.createChatUser(
          this.createduser.id,
          this.createduser.firstname + " " + this.createduser.lastname
        );
        // this.changeDetectorRef.detectChanges();
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
            window.onunload = function () {
              // do nothing.
            };
          }
        });
        // this.notifyService.showSuccess(" Congrats!! You have been Successfully Register . Please login using default password shared via email to continue.", "Success");
        // setTimeout(() => {
        //   window.location.href = '/auth/login';
        //   "preventBack()"
        //   window.onunload = function () { null };
        // }, 2000)
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
