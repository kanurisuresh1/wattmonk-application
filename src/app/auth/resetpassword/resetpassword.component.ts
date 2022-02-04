import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { DeviceDetectorService } from "ngx-device-detector";
import { AuthenticationService } from "../../_services";
import { NotificationService } from "../../_services/notification.service";
import { PrivacydialogComponent } from "../privacydialog/privacydialog.component";
import { TermsdialogComponent } from "../termsdialog/termsdialog.component";

@Component({
  selector: "app-resetpassword",
  templateUrl: "./resetpassword.component.html",
  styleUrls: ["./resetpassword.component.scss"],
})
export class ResetpasswordComponent implements OnInit {
  password = "newpassword";
  newpassword = new FormControl("", [
    Validators.required,
    Validators.minLength(3),
  ]);
  confirmpassword = new FormControl("", [
    Validators.required,
    Validators.minLength(3),
    this.matchValidator(this.password),
  ]);
  resetpasswordForm: FormGroup;
  newhide = true;
  confirmhide = true;
  passwordmismatch = false;
  code: string;
  isDesktop = false;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private notifyService: NotificationService,
    private dialog: MatDialog,
    private deviceService: DeviceDetectorService
  ) {
    this.resetpasswordForm = new FormGroup({
      newpassword: this.newpassword,
      confirmpassword: this.confirmpassword,
    });
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

  ngOnInit(): void {
    this.code = this.route.snapshot.params.code;

    this.isDesktop = this.deviceService.isDesktop();
  }

  getPasswordErrorMessage(): string | string {
    if (this.newpassword.hasError("required")) {
      return "You must enter a value";
    }

    return "Password must be at least 3 characters";
  }

  getConfirmPasswordErrorMessage(): string | string | string {
    if (this.confirmpassword.hasError("required")) {
      return "You must enter a value";
    }

    return this.confirmpassword.hasError("pattern")
      ? "Please enter a valid password."
      : "New and confirm password does not match each other. Please try again.";
  }

  onResetPassword($ev): void {
    $ev.preventDefault();
    if (this.resetpasswordForm.valid) {
      this.authenticationService
        .resetPassword(
          this.resetpasswordForm.get("newpassword").value,
          this.resetpasswordForm.get("confirmpassword").value,
          this.code
        )
        .subscribe(
          () => {
            this.notifyService.showSuccess(
              "Your password has been reset successfully. Please try login using your new credentials.",
              "Success"
            );
            this.router.navigate(["/auth/login"]);
          },
          () => {
            this.notifyService.showInfo(
              "Reset password link is expired or already used. Please try to regenerate a new link.",
              "Warning"
            );
          }
        );
    } else {
      this.resetpasswordForm.markAllAsTouched();
    }
  }

  matchValidator(fieldName: string) {
    let fcfirst: FormControl;
    let fcSecond: FormControl;

    return function matchValidator(control: FormControl) {
      if (!control.parent) {
        return null;
      }

      // INITIALIZING THE VALIDATOR.
      if (!fcfirst) {
        //INITIALIZING FormControl first
        fcfirst = control;
        fcSecond = control.parent.get(fieldName) as FormControl;

        //FormControl Second
        if (!fcSecond) {
          throw new Error(
            "matchValidator(): Second control is not found in the parent group!"
          );
        }

        fcSecond.valueChanges.subscribe(() => {
          fcfirst.updateValueAndValidity();
        });
      }

      if (!fcSecond) {
        return null;
      }

      if (fcSecond.value != fcfirst.value) {
        return {
          matchOther: true,
        };
      }

      return null;
    };
  }
}
