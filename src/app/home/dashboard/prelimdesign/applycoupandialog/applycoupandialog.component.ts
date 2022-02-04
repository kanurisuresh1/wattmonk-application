import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  AuthenticationService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";

export interface OrderPrelimFormData {
  iscoupanApplied: boolean;
  coupandata: any;
}

@Component({
  selector: "app-applycoupandialog",
  templateUrl: "./applycoupandialog.component.html",
  styleUrls: ["./applycoupandialog.component.scss"],
})
export class ApplycoupandialogComponent implements OnInit {
  coupans;
  loggedInuser;
  couponerror = false;
  couponerrormessage;
  getCouponForm: FormGroup;

  enteredCoupan = new FormControl("", [Validators.required]);
  constructor(
    public dialogRef: MatDialogRef<ApplycoupandialogComponent>,
    private commonService: CommonService,
    private authService: AuthenticationService,
    private genericService: GenericService,
    private notifyService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: OrderPrelimFormData
  ) {
    this.loggedInuser = this.authService.currentUserValue.user;
    this.coupans = this.genericService.prelimcoupans;
    this.getCouponForm = new FormGroup({
      enteredCoupan: this.enteredCoupan,
    });
  }

  ngOnInit(): void {
    // do nothing.
  }

  // getErrorMessage(control: FormControl) {

  //  if (control.hasError("required")) {
  //   return "You must enter a value";
  //  }

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
        requesttype: "prelim",
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
