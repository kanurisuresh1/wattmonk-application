import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  AuthenticationService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";

export interface ApplyPermitpromocodedata {
  iscoupanApplied: boolean;
  coupandata: any;
}

@Component({
  selector: "app-applypermitpromocodedialog",
  templateUrl: "./applypermitpromocodedialog.component.html",
  styleUrls: ["./applypermitpromocodedialog.component.scss"],
})
export class ApplypermitpromocodedialogComponent implements OnInit {
  coupans;
  loggedInuser;
  NoActivecoupan = false;
  couponerror = false;
  couponerrormessage;
  getCouponForm: FormGroup;

  enteredCoupan = new FormControl("", [Validators.required]);
  constructor(
    public dialogRef: MatDialogRef<ApplypermitpromocodedialogComponent>,
    private commonService: CommonService,
    private authService: AuthenticationService,
    private genericService: GenericService,
    private notifyService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: ApplyPermitpromocodedata
  ) {
    this.loggedInuser = this.authService.currentUserValue.user;
    this.coupans = this.genericService.permitcoupans;
    this.getCouponForm = new FormGroup({
      enteredCoupan: this.enteredCoupan,
    });
  }

  ngOnInit(): void {
    // do nothing.
  }

  // getErrorMessage(control: FormControl) {

  //   if (control == this.enteredCoupan) {
  //     return this.enteredCoupan.invalid
  //       ? "Please enter a valid Coupan."
  //       : "";
  //   }

  // }

  onCloseClick(): void {
    this.data.iscoupanApplied = false;
    this.dialogRef.close(this.data);
  }

  checkEnteredCoupan(): void {
    if (this.enteredCoupan.status === "INVALID") {
      this.couponerror = true;
      this.couponerrormessage = "You must enter a value";
    } else {
      const inputdata = {
        couponcode: this.enteredCoupan.value,
        userid: this.loggedInuser.id,
        requesttype: "permit",
      };
      this.commonService.checkEnteredCoupan(inputdata).subscribe(
        (response) => {
          if (response.error) {
            this.couponerror = true;
            this.couponerrormessage = response.message;
          } else {
            this.data.coupandata = response;
            this.data.iscoupanApplied = true;
            this.dialogRef.close(this.data);
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    }
  }

  applycoupan(data): void {
    this.data.coupandata = data;
    this.data.iscoupanApplied = true;
    this.dialogRef.close(this.data);
  }
}
