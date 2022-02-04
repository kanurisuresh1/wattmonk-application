import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { DeviceDetectorService } from "ngx-device-detector";
import { ROLES } from "src/app/_helpers";
import {
  AuthenticationService,
  ContractorService,
  GenericService,
  LoaderService
} from "../../_services";
import { NotificationService } from "../../_services/notification.service";
import { PrivacydialogComponent } from "../privacydialog/privacydialog.component";
import { TermsdialogComponent } from "../termsdialog/termsdialog.component";

@Component({
  selector: "app-changepassword",

  templateUrl: "./changepassword.component.html",
  styleUrls: ["./changepassword.component.scss"],
})
export class ChangepasswordComponent implements OnInit {
  password = "newpassword";
  // newpassword = new FormControl('', [Validators.required, Validators.pattern('(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!#^~%*?&,.<>"\'\\;:\{\\\}\\\[\\\]\\\|\\\+\\\-\\\=\\\_\\\)\\\(\\\)\\\`\\\/\\\\\\]])[A-Za-z0-9\d$@].{7,}')]);
  newpassword = new FormControl("", [
    Validators.required,
    Validators.minLength(3),
  ]);
  confirmpassword = new FormControl("", [
    Validators.required,
    Validators.minLength(3),
    this.matchValidator(this.password),
  ]);
  changepasswordform: FormGroup;
  newhide = true;
  confirmhide = true;
  passwordmismatch = false;
  code: string;
  isDesktop = false;
  length: any;

  constructor(
    private authenticationService: AuthenticationService,
    //public dialogRef: MatDialogRef<ChangepasswordComponent>,
    //@Inject(MAT_DIALOG_DATA) public dialogData: any,
    private router: Router,
    private route: ActivatedRoute,
    private notifyService: NotificationService,
    private contractorService: ContractorService,
    private deviceService: DeviceDetectorService,
    private dialog: MatDialog,
    private genericService: GenericService,
    private authService: AuthenticationService,
    private loaderservice: LoaderService
  ) {
    this.changepasswordform = new FormGroup({
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
    this.isDesktop = this.deviceService.isDesktop();
    this.route.queryParams.subscribe((params) => {
      this.code = params["code"];
    });
  }

  getPasswordErrorMessage(): string | string | string {
    if (this.newpassword.hasError("required")) {
      return "You must enter a value";
    }
    if (this.newpassword.value.length < 3) {
      return "Password must be at least 3 characters";
    }
    return "New password and confirm password should match";
  }

  getconfirmPasswordErrorMessage(): string | string | string | string {
    if (this.confirmpassword.hasError("required")) {
      return "You must enter a value";
    }
    if (this.confirmpassword.value.length < 3) {
      return "Password must be at least 3 characters";
    }

    return this.confirmpassword.hasError("pattern")
      ? "Please enter a valid password."
      : "New and confirm password does not match each other. Please try again.";
  }

  onChangePassword($ev): void {
    this.loaderservice.show();
    $ev.preventDefault();
    if (this.changepasswordform.valid) {
      const postData = {
        newpassword: this.changepasswordform.get("newpassword").value,
        confirmpassword: this.changepasswordform.get("confirmpassword").value,
        oldpassword: this.code,
      };

      this.authenticationService.updatePassword(postData).subscribe(
        () => {
          this.updateUserDetails(
            this.authenticationService.currentUserValue.user.id
          );
          this.loaderservice.hide();
        },
        () => {
          this.loaderservice.hide();
          this.notifyService.showInfo(
            "Some error occurred. Please try again.",
            "Warning"
          );
        }
      );
    } else {
      this.changepasswordform.markAllAsTouched();
    }
  }

  updateUserDetails(userid: number): void {
    const postData = {
      isdefaultpassword: false,
      resetPasswordToken: "",
    };

    this.contractorService.editContractor(userid, postData).subscribe(
      () => {
        this.notifyService.showSuccess(
          "Your password has been updated successfully.",
          "Success"
        );
        this.navigateToHome();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
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

  navigateToHome(): void {
    const loggedinuser = this.authService.currentUserValue.user;
    const isadmin = this.genericService.isUserAdmin(
      this.authService.currentUserValue.user
    );
    if (isadmin) {
      if (
        loggedinuser.role.id == ROLES.PeAdmin ||
        loggedinuser.role.id == ROLES.PESuperAdmin
      ) {
        localStorage.setItem("lastroute", "/home/pestamp/overview");
        this.router.navigate(["/home/pestamp/overview"]);
      } else {
        localStorage.setItem("lastroute", "/home/dashboard/overview");
        this.router.navigate(["/home/dashboard/overview"]);
      }
    } else {
      if (loggedinuser.role.id == ROLES.Designer) {
        localStorage.setItem("lastroute", "/home/dashboard/overview/designer");
        this.router.navigate(["/home/dashboard/overview/designer"]);
      } else if (loggedinuser.role.id == ROLES.Analyst) {
        localStorage.setItem("lastroute", "/home/dashboard/overview/analyst");
        this.router.navigate(["/home/dashboard/overview/analyst"]);
      } else if (loggedinuser.role.id == ROLES.Surveyor) {
        localStorage.setItem("lastroute", "/home/dashboard/overview/surveyor");
        this.router.navigate(["/home/dashboard/overview/surveyor"]);
      } else if (loggedinuser.role.id == ROLES.BD) {
        localStorage.setItem("lastroute", "/home/dashboard/overview");
        this.router.navigate(["/home/dashboard/overview"]);
      } else if (loggedinuser.role.id == ROLES.Peengineer) {
        localStorage.setItem(
          "lastroute",
          "/home/dashboard/overview/peengineer"
        );
        this.router.navigate(["/home/dashboard/overview/peengineer"]);
      }
    }
  }
}
