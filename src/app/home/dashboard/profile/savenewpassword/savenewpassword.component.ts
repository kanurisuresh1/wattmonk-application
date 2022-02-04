
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/_models';
import { AuthenticationService, LoaderService, NotificationService } from 'src/app/_services';

@Component({
  selector: "app-savenewpassword",
  templateUrl: "./savenewpassword.component.html",
  styleUrls: ["./savenewpassword.component.scss"],
})
export class SavenewpasswordComponent implements OnInit {

  password = 'newpassword';
  oldpassword = new FormControl('', Validators.required)
  newpassword = new FormControl('', [Validators.required, Validators.minLength(3)]);
  confirmpassword = new FormControl('', [Validators.required, Validators.minLength(3), this.matchValidator(this.password)]);
  changepasswordform: FormGroup;
  oldhide = true;
  newhide = true;
  confirmhide = true;
  passwordmismatch = false;
  code: string;
  isDesktop = false;
  length: any;
  loggedInUser: User
  constructor(public dialogRef: MatDialogRef<SavenewpasswordComponent>,
    private authenticationService: AuthenticationService,
    private notifyService: NotificationService,
    private authService: AuthenticationService,
    private loaderservice: LoaderService) {
    this.loggedInUser = this.authService.currentUserValue.user
    this.changepasswordform = new FormGroup({ newpassword: this.newpassword, confirmpassword: this.confirmpassword, oldpassword: this.oldpassword });
  }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
  getPasswordErrorMessage(): string | string | string {
    if (this.newpassword.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.newpassword.value.length < 3) {
      return "Password must be at least 3 characters";
    }
    return "New password and confirm password should match";
  }

  getOldPasswordErrorMessage(): string {
    if (this.oldpassword.hasError('required')) {
      return 'You must enter a value';
    }
  }

  getconfirmPasswordErrorMessage(): string | string | string | string {
    if (this.confirmpassword.hasError('required')) {
      return 'You must enter a value';
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
        userid: this.loggedInUser.id,
        oldpassword: this.changepasswordform.get("oldpassword").value,
        newpassword: this.changepasswordform.get("newpassword").value,
      };

      this.authenticationService.changepassword(postData).subscribe(
        () => {
          this.loaderservice.hide();
          this.notifyService.showSuccess(
            "Password updated successfully.",
            "success"
          );
          this.dialogRef.close();
        },
        (error) => {
          this.loaderservice.hide();
          this.notifyService.showInfo(error[0].messages[0].message, "Warning");
        }
      );
    } else {
      this.changepasswordform.markAllAsTouched();
      this.loaderservice.hide();
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
