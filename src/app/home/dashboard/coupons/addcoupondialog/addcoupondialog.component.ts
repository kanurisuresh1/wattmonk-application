import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import * as moment from "moment";
import { Coupon } from "src/app/_models";
import { CouponService, NotificationService } from "src/app/_services";

export interface CouponFormData {
  triggerEditEvent: boolean;
  isEditMode: boolean;
  isDataUpdated: boolean;
  coupon: Coupon;
}

@Component({
  selector: "app-addcoupondialog",
  templateUrl: "./addcoupondialog.component.html",
  styleUrls: ["./addcoupondialog.component.scss"],
})
export class AddcoupondialogComponent implements OnInit {
  isLoading = false;
  minToDate: Date;
  maxToDate: Date;
  maxFromDate: Date;

  loadingmessage = "Saving data";

  title = new FormControl("", [
    Validators.required,
    Validators.pattern("^[A-Za-z0-9_-]{2,}$"),
  ]);
  description = new FormControl("", [Validators.required]);
  code = new FormControl("", [
    Validators.required,
    Validators.pattern("^[A-Za-z0-9_-]{2,}$"),
  ]);

  expirydate = new FormControl("", [Validators.required]);
  amount = new FormControl("", [
    Validators.required,
    Validators.max(99),
    Validators.min(1),
  ]);
  usestype = new FormControl("", [Validators.required]);
  discounttype = new FormControl("", [Validators.required]);
  requesttype = new FormControl("", [Validators.required]);

  addCouponDialogForm: FormGroup;

  display = false;
  displayerror = true;
  constructor(
    public dialogRef: MatDialogRef<AddcoupondialogComponent>,
    private notifyService: NotificationService,
    private couponService: CouponService,
    @Inject(MAT_DIALOG_DATA) public data: CouponFormData
  ) {
    this.addCouponDialogForm = new FormGroup({
      title: this.title,
      description: this.description,
      code: this.code,
      expirydate: this.expirydate,
      amount: this.amount,
      usestype: this.usestype,
      discounttype: this.discounttype,
      requesttype: this.requesttype,
    });
    this.usestype.setValue("multiple");
    this.discounttype.setValue("percentage");
    this.requesttype.setValue("permit");

    if (data.isEditMode) {
      this.addCouponDialogForm.patchValue({
        title: data.coupon.title,
        description: data.coupon.description,
        code: data.coupon.code,
        expirydate: data.coupon.expirydate,
        amount: data.coupon.amount,
        usestype: data.coupon.usestype,
        discounttype: data.coupon.discounttype,
        requesttype: data.coupon.requesttype,
      });
    }
  }

  ngOnInit(): void {
    const mindate = new Date();
    mindate.setDate(mindate.getDate());
    this.minToDate = new Date(mindate);

    window.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
    });
  }

  getErrorMessage(
    control: FormControl
  ): string | string | string | string | string | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    } else if (control == this.amount) {
      return this.amount.hasError("max") || this.amount.hasError("min")
        ? "value should be minimum 1 and maximum 99."
        : "";
    } else if (control == this.title) {
      return this.title.hasError("pattern")
        ? "please enter a valid title."
        : "";
    } else if (control == this.code) {
      return this.code.hasError("pattern") ? "please enter a valid code." : "";
    } else if (control == this.description) {
      return this.description.hasError("pattern")
        ? "please enter a valid description."
        : "";
    }
  }

  onCloseClick(): void {
    this.data.triggerEditEvent = false;
    this.dialogRef.close(this.data);
  }

  onAddCoupon($ev): void {
    $ev.preventDefault();
    if (this.addCouponDialogForm.valid) {
      let expirydate = moment(
        this.addCouponDialogForm.get("expirydate").value
      ).format("YYYY-MM-DD");

      this.displayerror = false;
      if (this.data.isEditMode) {
        const postData = {
          title: this.addCouponDialogForm.get("title").value,
          description: this.addCouponDialogForm.get("description").value,
          code: this.addCouponDialogForm.get("code").value,
          expirydate: expirydate,
          amount: this.addCouponDialogForm.get("amount").value,
          usestype: this.addCouponDialogForm.get("usestype").value,
          discounttype: this.addCouponDialogForm.get("discounttype").value,
          requesttype: this.addCouponDialogForm.get("requesttype").value,
        };
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        this.couponService.editCoupon(this.data.coupon.id, postData).subscribe(
          () => {
            this.notifyService.showSuccess(
              "Coupon details have been updated successfully.",
              "Success"
            );
            this.isLoading = false;
            this.data.triggerEditEvent = true;
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      } else {
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        this.couponService
          .addCoupon(
            this.addCouponDialogForm.get("title").value,
            this.addCouponDialogForm.get("description").value,
            this.addCouponDialogForm.get("code").value,
            expirydate,
            this.addCouponDialogForm.get("amount").value,
            this.addCouponDialogForm.get("usestype").value,
            this.addCouponDialogForm.get("discounttype").value,
            this.addCouponDialogForm.get("requesttype").value
          )
          .subscribe(
            () => {
              this.notifyService.showSuccess(
                "Coupon has been added successfully.",
                "Success"
              );
              this.isLoading = false;
              this.data.triggerEditEvent = true;
              this.data.isDataUpdated = true;
              this.dialogRef.close(this.data);
            },
            (error) => {
              this.notifyService.showError(error, "Error");
            }
          );
      }
    } else {
      this.displayerror = false;
      this.addCouponDialogForm.markAllAsTouched();
      this.addCouponDialogForm.markAsDirty();
    }
  }
}
