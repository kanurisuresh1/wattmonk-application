import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { DeviceDetectorService } from "ngx-device-detector";
import { PaypalPaymentComponent } from "src/app/shared/paypal-payment/paypal-payment.component";
import { BaseUrl } from "src/app/_helpers";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { OrderpermitdesigndialogComponent } from "../../permitdesign/orderpermitdesigndialog/orderpermitdesigndialog.component";

export interface ProfileData {
  user: User;
  isdatamodified: boolean;
  paymenttitle: string;
  isdirectpayment: boolean;
  amounttopay: number;
  appliedcoupan: any;
  isConfirmed: boolean;
  loggedinUser: User;
  slabdiscount: number;
  slabname: string;
  serviceamount: number;
  benefitamount: boolean;
}

@Component({
  selector: "app-addcoinsdialog",
  templateUrl: "./addcoinsdialog.component.html",
  styleUrls: ["./addcoinsdialog.component.scss"],
})
export class AddcoinsdialogComponent implements OnInit {
  amounttopay = 0;
  appliedcoupan = null;
  loggedinuser: User;
  servicecharge;
  walletamount = 0;
  addamount = null;
  deliverytime = new FormControl("", []);
  nocoupanactive = false;
  userdesignscount: number;
  discountamount = 0;
  inputText: any;
  headers: HttpHeaders;
  paymentData: any = [];
  formheaders: HttpHeaders;
  loggedInUser: User;
  isdisabled = false;
  private authenticationService: AuthenticationService;
  amount = new FormControl("", [Validators.required]);
  rechargeWalletForm: FormGroup;
  isDesktop = false;

  cardReady = false;
  extraData = {
    name: "",
    address_city: "",
    address_line1: "",
    address_line2: "",
    address_state: "",
    address_zip: "",
  };
  invalidError = {
    message: "",
  };
  paymenttype: string;
  hidestripecard = true;
  errormessage: string;
  buttonId = -1;

  lastRecharge = 0;
  constructor(
    public dialogRef: MatDialogRef<OrderpermitdesigndialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProfileData,
    private http: HttpClient,
    public dialog: MatDialog,
    private authService: AuthenticationService,
    private commonService: CommonService,
    private changeDetectorRef: ChangeDetectorRef,
    private notifyService: NotificationService,
    private deviceService: DeviceDetectorService,
    private genericService: GenericService
  ) {
    this.authenticationService = authService;
    this.loggedInUser = authService.currentUserValue.user;
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization:
        "Bearer " + this.authenticationService.currentUserValue.jwt,
    });
    this.formheaders = new HttpHeaders({
      Authorization:
        "Bearer " + this.authenticationService.currentUserValue.jwt,
    });

    this.rechargeWalletForm = new FormGroup({ amount: this.amount });

    this.amount.setValidators([Validators.min(1), Validators.max(10000)]);
    this.errormessage =
      "Recharge amount should be minimum $1 and maximum $10000.";
  }
  showSuccess: boolean;

  ngOnInit(): void {
    this.getLastRecharge();
    setTimeout(() => {
      this.hidestripecard = false;
    }, 300);

    if (this.data.isdirectpayment) {
      this.amount.clearAsyncValidators();
      this.amount.clearValidators();
      this.paymenttype = "direct";
      this.amount.patchValue(this.data.amounttopay);
    } else {
      this.paymenttype = "wallet";
    }
    this.isDesktop = this.deviceService.isDesktop();

    if (!this.loggedinuser.parent.ispaymentmodeprepay) {
      this.isdisabled = true;
      this.servicecharge =
        this.genericService.permitdesigncharges -
        this.loggedinuser.parent.permitdesigndiscount;
    }
    this.getUser();
    this.fetchCoupanCode();
  }

  getLastRecharge(): void {
    this.commonService.getLastRecharge().subscribe((response) => {
      this.lastRecharge = response[0].amount;
    });
  }
  onCloseClick(): void {
    this.data.isdatamodified = false;
    this.dialogRef.close(this.data);
  }

  getUser(): void {
    this.commonService.userData(this.loggedinuser.id).subscribe(
      (response) => {
        this.loggedinuser = response;
        this.walletamount = response.parent.amount;
        this.getDesignCount();

        if (this.loggedinuser.parent.slabname === null) {
          this.deliverytime.patchValue("6-12");
        } else {
          this.deliverytime.patchValue(this.loggedinuser.parent.slabname);
        }
        if (this.loggedinuser.parent.ispaymentmodeprepay) {
          const postData = {
            userparentid: this.loggedinuser.parent.id,
            timeslab: this.deliverytime.value,
          };
          this.getDesignCharges(postData);
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchCoupanCode(): void {
    this.commonService.getCoupons("permit").subscribe(
      (response) => {
        this.genericService.permitcoupans = response;

        if (response.length == 0) {
          this.nocoupanactive = true;
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getDesignCount(): void {
    this.commonService
      .getDesignsCountByUser(this.authService.currentUserValue.user.parent.id)
      .subscribe((response) => {
        this.userdesignscount = response;
        if (this.userdesignscount < this.genericService.numberoffreedesign) {
          this.discountamount = this.servicecharge;
        }
        this.amounttopay = this.servicecharge - this.discountamount;
      });
  }

  getDesignCharges(postData): void {
    this.commonService.getPermitDesignCharge(postData).subscribe((response) => {
      this.genericService.permitdesigncharges = response.servicecharge;
      this.servicecharge = this.genericService.permitdesigncharges;
      if (response.freedesign == true) {
        this.discountamount = this.servicecharge;
        this.deliverytime.patchValue("6-12");
        this.deliverytime.disable();
      } else {
        this.discountamount = response.slabdiscount;
      }
      this.data.slabdiscount = response.slabdiscount;
      this.amounttopay = this.servicecharge - this.discountamount;
      this.data.slabname = response.slabname;
      this.data.serviceamount = response.paymentamount;
    });
  }

  onConfirmationClick(): void {
    if (this.amounttopay > this.walletamount) {
      this.data.isConfirmed = false;
      this.notifyService.showWarning(
        "Warning",
        "It seems you don't have sufficient balance in your wallet. In order to place the request please recharge your wallet or make a direct payment via any of your Debit/Credit Card."
      );
    } else {
      localStorage.setItem("paymenttype", "wallet");
      this.data.isConfirmed = true;
      this.data.appliedcoupan = this.appliedcoupan;
      this.data.amounttopay = this.amounttopay;
      this.dialogRef.close(this.data);
    }
  }

  onProceedClick(): void {
    this.data.isConfirmed = true;
    this.data.appliedcoupan = this.appliedcoupan;
    this.dialogRef.close(this.data);
  }

  onsomeerror() {
    let date = new Date();
    let milliseconds = date.getTime();
    let data1 = {
      amount: this.inputText,
      datetime: milliseconds,
      type: "failure",
      user: this.authService.currentUserValue.user.id,
    };
    return this.http
      .post(BaseUrl + "recharges", data1, {
        headers: this.headers,
      })
      .subscribe(
        (data) => {
          this.paymentData = data;
          this.data.user = this.paymentData.user;
          this.data.isdatamodified = true;
          this.notifyService.showWarning(
            "Payment transaction failure. Please try initiating payment request again.",
            "Warning"
          );
          this.dialogRef.close(this.data);
        },
        () => {
          this.data.isdatamodified = false;
          this.dialogRef.close(this.data);
          this.notifyService.showInfo(
            "Some error occurred. Please try again.",
            "Warning"
          );
        }
      );
  }

  getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }

    return control.hasError("pattern") ? this.errormessage : this.errormessage;
  }

  /*   async getSessionID() { 
      let inputdata = { 
        email: this.loggedInUser.email, 
        userid: this.loggedInUser.id, 
        amount: this.amount.value 
      } 
    }  */

  openAddMoneyUsingPaypal(): void {
    if (this.rechargeWalletForm.valid) {
      const dialogRef = this.dialog.open(PaypalPaymentComponent, {
        autoFocus: false,
        disableClose: true,
        width: "40%",
        data: {
          isdatamodified: false,
          user: User,
          paymenttitle: "Pay via card",
          isdirectpayment: false,
          amounttopay: this.amount.value.toFixed(2),
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result.isdatamodified) {
          this.setStripeToken();
        }
      });
    }
  }

  setStripeToken(): void {
    let finalamount;
    if (
      this.amount.value > 999 &&
      this.genericService.userWalletfirsttranscition == true &&
      this.data.benefitamount
    ) {
      finalamount = this.amount.value + 100;
    } else {
      finalamount = this.amount.value;
    }
    this.authService
      .rechargerequest(
        "Success",
        this.authenticationService.currentUserValue.user.parent.id,
        finalamount,
        new Date(),
        this.paymenttype,
        this.authenticationService.currentUserValue.user.email
      )
      .subscribe(
        (response) => {
          this.data.user.amount = response.parent.amount;
          this.data.isdatamodified = true;
          localStorage.setItem("paymenttype", "wallet");
          this.dialogRef.close(this.data);
          this.notifyService.showSuccess(
            "Your wallet has been recharged successfully.",
            "Success"
          );
          this.getUserWalletTranscitionCount();
        },
        () => {
          this.notifyService.showInfo(
            "Some error occurred. Please try again.",
            "Warning"
          );
          this.data.isdatamodified = false;
          this.dialogRef.close(this.data);
          this.getUserWalletTranscitionCount();
        }
      );
  }

  getUserWalletTranscitionCount(): void {
    this.commonService.userWalletTranscition().subscribe((response) => {
      if (response > 0) {
        this.genericService.userWalletfirsttranscition = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  onbuttonselect(element): void {
    if (this.buttonId == element) {
      this.addamount = element;
    } else {
      this.addamount = 0;
      this.addamount = element;
    }
    this.buttonId = element;
  }
}
