import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { DeviceDetectorService } from "ngx-device-detector";
import { MAILFORMAT } from "src/app/_helpers";
import { AuthenticationService, LoaderService } from "../../_services";
import { NotificationService } from "../../_services/notification.service";
import { PrivacydialogComponent } from "../privacydialog/privacydialog.component";
import { TermsdialogComponent } from "../termsdialog/termsdialog.component";

@Component({
  selector: "app-forgotpassword",
  templateUrl: "./forgotpassword.component.html",
  styleUrls: ["./forgotpassword.component.scss"],
})
export class ForgotpasswordComponent implements OnInit {
  email = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  forgotpasswordForm: FormGroup;
  isDesktop = false;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private notifyService: NotificationService,
    private dialog: MatDialog,
    private deviceService: DeviceDetectorService,
    // private location: Location,
    private loaderservice: LoaderService
  ) {
    this.forgotpasswordForm = new FormGroup({ email: this.email });
  }

  ngOnInit(): void {
    this.isDesktop = this.deviceService.isDesktop();
  }

  openTermsDialog(): void {
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
    const dialogRef = this.dialog.open(PrivacydialogComponent, {
      width: "60%",
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }

  getEmailErrorMessage(): string | string | string {
    if (this.email.hasError("required")) {
      return "You must enter a value";
    }

    return this.email.hasError("pattern") ? "Please enter a valid email" : "";
  }

  onForgotPasswordSubmit($ev): void {
    this.loaderservice.show();
    $ev.preventDefault();
    if (this.forgotpasswordForm.valid) {
      this.authenticationService
        .forgotPassword(this.forgotpasswordForm.get("email").value)
        .subscribe(
          () => {
            this.notifyService.showSuccess(
              "Reset password link has been sent to your registered email account.",
              "Success"
            );
            this.router.navigate(["/auth/login"]);
          },
          () => {
            this.loaderservice.hide();
            this.notifyService.showInfo(
              "Entered email doesn't match any of our records. Please try again.",
              "Warning"
            );
          }
        );
    } else {
      this.loaderservice.hide();
      this.forgotpasswordForm.markAllAsTouched();
      this.forgotpasswordForm.markAsDirty();
    }
  }

  handleBack(): void {
    this.router.navigate(["/auth/login"]);
  }
}
