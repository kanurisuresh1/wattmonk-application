import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatDialog } from "@angular/material/dialog";
import { DeviceDetectorService } from "ngx-device-detector";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MAILFORMAT, ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  ContractorService,
  GenericService,
  NotificationService
} from "src/app/_services";
import * as countriesjson from "../../_data/countries.json";
import { } from "../../_services/register.service";
import { DesignerTermsdialogogComponent } from "../designer-termsdialogog/designer-termsdialogog.component";
import { DesignerprivacydialogComponent } from "../designerprivacydialog/designerprivacydialog.component";

export interface Country {
  country: string;
  calling_code: string;
}

@Component({
  selector: "app-designer-registration",
  templateUrl: "./designer-registration.component.html",
  styleUrls: ["./designer-registration.component.scss"],
})
export class DesignerRegistrationComponent implements OnInit {
  [x: string]: any;
  isLoading = false;
  isDesktop = false;
  countries: Country[] = (countriesjson as any).default;
  filteredOptions: Observable<Country[]>;

  firstname = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z.]{1,}$"),
  ]);
  lastname = new FormControl("", [
    Validators.required,
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
  agreedtoterms = false;
  selectedcountry: any;
  createduser: User;
  constructor(
    private deviceService: DeviceDetectorService,
    // private router: Router,
    private notifyService: NotificationService,
    private authenticationService: AuthenticationService,
    private genericService: GenericService,
    private contractorService: ContractorService,
    // private location: Location,
    private dialog: MatDialog
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
    });
  }
  openTermsDialog(): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DesignerTermsdialogogComponent, {
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
    const dialogRef = this.dialog.open(DesignerprivacydialogComponent, {
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
    this.selectedcountry = this.countries.find(
      (c) => c.country == "United States"
    );

    this.countrycontrol.setValue(this.selectedcountry);
    this.setSelectedCountry(this.selectedcountry.country);

    this.isDesktop = this.deviceService.isDesktop();
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
        ? "Firstname should be of min. 3 characters and contain only alphabets."
        : "";
    } else if (control == this.lastname) {
      return this.lastname.hasError("pattern")
        ? "Lastname should be of min. 3 characters and contain only alphabets."
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
    if (this.registerForm.valid && this.agreedtoterms) {
      const randomPassword = this.genericService.randomPass();

      this.authenticationService
        .registerNewUser(
          this.registerForm.get("workemail").value,
          randomPassword
        )
        .subscribe(
          (response) => {
            this.genericService.setRequiredHeaders();
            this.isLoading = true;
            this.updateUserDetails(response.user.id, randomPassword);
          },
          (error) => {
            const errorobj = error[0]["messages"][0];
            this.notifyService.showInfo(errorobj["message"], "Warning");
          }
        );
    } else {
      this.display = true;
    }
  }

  updateUserDetails(userid: number, password: string): void {
    const country = this.registerForm.get("country").value;
    const postData = {
      firstname: this.registerForm.get("firstname").value,
      lastname: this.registerForm.get("lastname").value,
      country: country.country,
      source: "web",
      isdefaultpassword: true,
      parent: 232,
      resetPasswordToken: password,
      role: ROLES.Designer,
      usertype: "designer",
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
        this.notifyService.showSuccess(
          "Registration Success. Please login using default password shared via email to continue.",
          "Success"
        );
        window.location.href = "/auth/login";
        setTimeout(function () {
          "preventBack()";
        }, 0);
        window.onunload = function () {
          // null;
        };
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
