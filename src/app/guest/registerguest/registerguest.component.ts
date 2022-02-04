import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { COMETCHAT_CONSTANTS } from 'src/app/_helpers';
import { User } from 'src/app/_models';
import { AuthenticationService, ContractorService, GenericService, NotificationService } from 'src/app/_services';



export interface OrderPrelimFormData {
  isConfirmed: boolean;
  isLater: boolean;
  createdby: number;
  useremail: string;
  isalreadyregistered: boolean;
}
@Component({
  selector: "app-registerguest",
  templateUrl: "./registerguest.component.html",
  styleUrls: ["./registerguest.component.scss"],
})
export class RegisterguestComponent implements OnInit {
  isLoading = false;
  createduser: User;
  retrycount = 1;
  // createdacc: any = [];
  guestUserId;
  firstname = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z]{3,}$"),
  ]);
  lastname = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z]{3,}$"),
  ]);
  workemail = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$"),
  ]);
  phone = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("[0-9]{8,15}$"),
  ]);

  registerguest: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<RegisterguestComponent>,
    private notifyService: NotificationService,
    private genericService: GenericService,
    private authenticationService: AuthenticationService,
    private contractorService: ContractorService,
    // private changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: OrderPrelimFormData
  ) {
    this.registerguest = new FormGroup({
      workemail: this.workemail,
      firstname: this.firstname,
      lastname: this.lastname,
      phone: this.phone,
    });
  }

  ngOnInit(): void {
    // do nothing.
  }

  getErrorMessage(
    control: FormControl
  ): string | string | string | string | string | string {
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
    } else if (control == this.phone) {
      return this.phone.hasError("pattern")
        ? "Please enter a valid phone number (Min - 8, Max - 15)."
        : "";
    }
  }

  onCloseClick(): void {
    this.data.isConfirmed = false;
    this.dialogRef.close(this.data);
  }

  onAddMember(): void {
    if (this.registerguest.valid) {
      const randomPassword = this.genericService.randomPass();
      this.authenticationService
        .registerUser(this.workemail.value, randomPassword)
        .subscribe(
          (response) => {
            this.genericService.setRequiredHeaders();
            this.isLoading = true;
            this.updateUserDetails(response.user.id, randomPassword);
          },
          (error) => {
            const errorobj = error[0]["messages"][0];
            if (
              errorobj["id"] == "Auth.form.error.email.taken" ||
              errorobj["id"] == "Auth.form.error.username.taken"
            ) {
              this.notifyService.showInfo(
                "It seems you are already registered on the platform. So this design request will be saved to your account for later use.",
                "Already exist"
              );
              this.isLoading = false;
              this.data.isalreadyregistered = true;
              this.data.useremail = this.workemail.value;
              this.dialogRef.close(this.data);
            } else {
              this.notifyService.showError(errorobj["message"], "Error");
            }
          }
        );
    } else {
      this.registerguest.markAllAsTouched();
    }
  }

  updateUserDetails(userid: number, password: string): void {
    this.isLoading = true;
    const postData = {
      firstname: this.firstname.value,
      lastname: this.lastname.value,
      email: this.workemail.value,
      source: "web",
      isdefaultpassword: true,
      parent: userid,
      resetPasswordToken: password,
      phone: this.phone.value,
      cometchatuid: userid + COMETCHAT_CONSTANTS.UNIQUE_CODE,
    };

    this.contractorService.editContractor(userid, postData).subscribe(
      (response) => {
        this.createduser = response;
        this.data.createdby = this.createduser.id;
        this.guestUserId = this.createduser.id;

        localStorage.setItem("guestUserId", this.guestUserId);
        localStorage.setItem("guestemail", this.createduser.email);
        localStorage.setItem("guestpassword", password);

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
    this.isLoading = true;
    this.authenticationService.createChatUser("" + userid, name).subscribe(
      () => {
        this.isLoading = false;
        this.data.isConfirmed = true;
        this.dialogRef.close(this.data);
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
