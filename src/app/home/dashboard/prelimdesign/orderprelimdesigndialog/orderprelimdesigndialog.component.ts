import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import {
  MatDialog, MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { Observable } from "rxjs";
import { AddcoinsdialogComponent } from "src/app/home/dashboard/profile/addcoinsdialog/addcoinsdialog.component";
import { Design, User } from "src/app/_models";
import {
  AuthenticationService, CouponService, GenericService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
//  import { AddcoinsdialogComponent } from './addcoinsdialog/addcoinsdialog.component';
import { PaypalPaymentComponent } from "../../../../shared/paypal-payment/paypal-payment.component";
import { ApplycoupandialogComponent } from "../applycoupandialog/applycoupandialog.component";


export interface OrderPrelimFormData {
  amounttopay: number;
  isConfirmed: boolean;
  isLater: boolean;
  loggedinUser: User;
  refreshDashboard: boolean;
  requiremnttype: string;
  design: Design;
  appliedcoupan: any;
  serviceamount: number;
}
@Component({
  selector: "app-orderprelimdesigndialog",
  templateUrl: "./orderprelimdesigndialog.component.html",
  styleUrls: ["./orderprelimdesigndialog.component.scss"],
})
export class OrderprelimdesigndialogComponent implements OnInit {
  amounttopay = 0;
  servicecharge;
  discountamount = 0;
  userdesignscount: number;
  numberoffreedesign;
  walletamount = 0;
  // notifyService: any;
  loggedinuser: User;
  iscoupanapplied = false;
  appliedcoupan = null;
  NoActivecoupan = false;
  isLoading = false;
  ispaymentLoading = false;
  servicecharges: AngularFireObject<any>;
  servicechargedata: Observable<any>;
  couponid: any;
  invalidcouponmessage: string = null
  constructor(
    public dialogRef: MatDialogRef<OrderprelimdesigndialogComponent>,
    public dialog: MatDialog,
    private commonService: CommonService,
    public genericService: GenericService,
    private db: AngularFireDatabase,
    private authService: AuthenticationService,
    private notifyService: NotificationService,
    private datepipe: DatePipe,
    private couponservice: CouponService,
    @Inject(MAT_DIALOG_DATA) public data: OrderPrelimFormData
  ) {

    this.ispaymentLoading = true;
    this.servicecharges = this.db.object("service_charges");
    this.servicechargedata = this.servicecharges.valueChanges();
    this.servicechargedata.subscribe(
      (res) => {
        if (this.data.design.requirementtype == 'proposal' && this.data.design.projecttype == 'residential') {
          this.servicecharge = res.proposal_residential.price
        }
        else if (this.data.design.requirementtype == 'assessment' && this.data.design.projecttype == 'residential') {
          this.servicecharge = res.assessment_residential.price
        }
        else if (this.data.design.requirementtype == 'proposal' && (this.data.design.projecttype == 'commercial' || this.data.design.projecttype == 'detachedbuildingorshop' || this.data.design.projecttype == 'carport')) {
          const solarCapcity = this.data.design.monthlybill / 1150
          if (solarCapcity > 0 && solarCapcity <= 49) {
            this.servicecharge = res.proposal_0_49commercial.price
          }
          else if (solarCapcity > 49 && solarCapcity <= 99) {
            this.servicecharge = res.proposal_50_99commercial.price
          }
          else if (solarCapcity > 99 && solarCapcity <= 199) {
            this.servicecharge = res.proposal_100_199commercial.price
          }
          else if (solarCapcity > 199 && solarCapcity <= 299) {
            this.servicecharge = res.proposal_200_299commercial.price
          }
          else if (solarCapcity > 299) {
            this.servicecharge = res.proposal_200_299commercial.price
            for (let i = 300; i <= solarCapcity; i = i + 100) {
              this.servicecharge += res.proposal_above_299_commercial.price
            }

          }
        }

        else if (this.data.design.requirementtype == 'assessment' && (this.data.design.projecttype == 'commercial' || this.data.design.projecttype == 'detachedbuildingorshop' || this.data.design.projecttype == 'carport')) {
          const solarCapcity = this.data.design.monthlybill / 1150
          if (solarCapcity > 0 && solarCapcity <= 49) {
            this.servicecharge = res.assessment_0_49commercial.price
          }
          else if (solarCapcity > 49 && solarCapcity <= 99) {
            this.servicecharge = res.assessment_50_99commercial.price
          }
          else if (solarCapcity > 99 && solarCapcity <= 199) {
            this.servicecharge = res.assessment_100_199commercial.price
          }
          else if (solarCapcity > 199 && solarCapcity <= 299) {
            this.servicecharge = res.assessment_200_299commercial.price
          }
          else if (solarCapcity > 299) {
            this.servicecharge = res.assessment_200_299commercial.price
            for (let i = 300; i <= solarCapcity; i = i + 100) {
              this.servicecharge += res.assessment_above_299_commercial.price
            }

          }
        }
        this.amounttopay = this.servicecharge;
        this.ispaymentLoading = false;
        this.genericService.numberoffreedesign = res.freedesigns;
      }
      // (err) => console.log(err),
      // () => console.log("done!")
    );
    // this.walletamount = parseInt(localStorage.getItem("walletamount"));
    this.loggedinuser = this.authService.currentUserValue.user;
    // this.walletamount = parseFloat(localStorage.getItem("walletamount"));
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.getCurrentUser();
    /* if (this.data.requiremnttype === 'proposal') {
      this.servicecharge = this.genericService.siteproposalcharges;
    } else {
      this.servicecharge = this.genericService.prelimdesigncharges;
    }
     */
    this.fetchCoupanCode();
  }

  getDesignCount(): void {
    this.commonService
      .getDesignsCountByUser(this.loggedinuser.parent.id)
      .subscribe(
        (response) => {
          this.userdesignscount = response;
          if (this.userdesignscount < this.genericService.numberoffreedesign) {
            this.discountamount = this.servicecharge;
          }
          this.amounttopay = this.servicecharge - this.discountamount;
          this.isLoading = false;
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {

      this.couponid = JSON.parse(localStorage.getItem("copiedcoupan"));


      if (this.couponid && this.couponid.requesttype == 'prelim') {
        let newdate = this.datepipe.transform(new Date(), "yyyy-MM-dd");
        let currentdatetime = new Date(newdate);
        let expirydatetime = new Date(this.couponid.expirydate);
        //   let newdate = this.datepipe.transform(new Date(),"yyyy-MM-dd");
        //   let currentdate;
        //   currentdate = newdate.split("-");
        //   var currentdatetime = new Date( currentdate[2], currentdate[1] - 1, currentdate[0]).getTime();

        //  // var myDate = "26-02-2012";
        //   let expirydate;
        //   expirydate = this.couponid.expirydate.split("-");
        //   var expirydatetime = new Date( expirydate[2], expirydate[1] - 1, expirydate[0]).getTime();
        if (currentdatetime > expirydatetime) {
          localStorage.removeItem("copiedcoupan");
          this.appliedcoupan = null;
        }
        else {
          this.iscoupanapplied = true;
          this.appliedcoupan = this.couponid;
          if (this.couponid.discounttype == "amount") {
            this.discountamount = this.couponid.amount;
            this.amounttopay = this.servicecharge - this.discountamount;
          } else if (this.couponid.discounttype == "percentage") {
            this.discountamount =
              (this.couponid.amount * this.servicecharge) / 100;
            this.amounttopay = this.servicecharge - this.discountamount;
          }
        }
      } else {
        this.iscoupanapplied = false;
        this.appliedcoupan = null;
      }
    }, 1000)
  }

  getCurrentUser(): void {
    this.commonService.userData(this.loggedinuser.id).subscribe(
      (response) => {
        this.loggedinuser = response;
        this.walletamount = response.parent.amount;
        this.getDesignCount();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onCloseClick(): void {
    this.data.isConfirmed = false;
    this.dialogRef.close(this.data);
  }

  onConfirmationClick(): void {
    // this.loaderservice.show();
    if (this.amounttopay > this.walletamount) {
      this.data.isConfirmed = false;
      this.notifyService.showWarning(
        "Warning",
        "It seems you don't have sufficient balance in your wallet. In order to place the request please recharge your wallet or make a direct payment via any of your Debit/Credit Card."
      );
    } else {
      this.data.isConfirmed = true;

      this.data.amounttopay = this.amounttopay;
      this.data.serviceamount = this.servicecharge;
      if (this.appliedcoupan) {
        this.data.appliedcoupan = this.appliedcoupan;
        this.couponservice.validateCoupon(this.appliedcoupan).subscribe((res) => {

          if (res.error) {
            this.invalidcouponmessage = res.message;
          } else {
            this.dialogRef.close(this.data);
          }
        })
      }
      else {
        this.dialogRef.close(this.data);
      }
    }
  }

  onProceedClick(): void {
    this.data.isConfirmed = true;

    this.data.amounttopay = this.amounttopay;
    this.data.serviceamount = this.servicecharge;
    if (this.appliedcoupan) {
      this.data.appliedcoupan = this.appliedcoupan;

      this.couponservice.validateCoupon(this.appliedcoupan).subscribe((res) => {
        if (res.error) {
          this.invalidcouponmessage = res.message;
        } else {
          this.dialogRef.close(this.data);
        }
      })
    }
    else {
      this.dialogRef.close(this.data);
    }
  }

  OnRemoveCoupan(): void {
    this.iscoupanapplied = false;
    this.invalidcouponmessage = null;
    this.discountamount = 0;
    this.amounttopay = 0;
    this.getDesignCount();
    this.appliedcoupan = null;
  }
  openapplypromocodedialog(): void {
    let coupandata: any;
    const dialogRef = this.dialog.open(ApplycoupandialogComponent, {
      width: "35%",
      autoFocus: false,
      disableClose: true,
      data: { iscoupanApplied: false, coupandata: coupandata },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.iscoupanApplied) {
        this.iscoupanapplied = true;
        this.appliedcoupan = result.coupandata;
        this.couponid = result.coupandata;
        if (result.coupandata.discounttype == "amount") {
          this.discountamount = result.coupandata.amount;
          this.amounttopay = this.servicecharge - this.discountamount;
        } else if (result.coupandata.discounttype == "percentage") {
          this.discountamount =
            (result.coupandata.amount * this.servicecharge) / 100;
          this.amounttopay = this.servicecharge - this.discountamount;
        }
      } else {
        this.appliedcoupan = null;
      }
    });
  }
  openAddMoneyToWalletDialog(value: number): void {
    const dialogRef = this.dialog.open(AddcoinsdialogComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      data: {
        isdatamodified: false,
        user: User,
        paymenttitle: value == 1 ? "Add money to wallet" : "Pay via card",
        isdirectpayment: value == 1 ? false : true,
        amounttopay: this.amounttopay,
      },
      panelClass: "white-modalbox",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdatamodified) {
        this.data.appliedcoupan = this.appliedcoupan;
        this.data.amounttopay = this.amounttopay;
        if (value == 2) {
          this.data.isConfirmed = true;
          this.dialogRef.close(this.data);
        } else {
          this.walletamount = result.user.amount;
          this.authService.currentUserValue.user.amount = result.user.amount;
        }
      }
    });
  }

  openAddMoneyToWalletDialogpaypal(value: number): void {
    const dialogRef = this.dialog.open(AddcoinsdialogComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      data: {
        isdatamodified: false,
        user: User,
        paymenttitle: value == 1 ? "Add money to wallet" : "Pay via card",
        isdirectpayment: value == 1 ? false : true,
        data: { amounttopay: this.amounttopay },
      },
      panelClass: "white-modalbox",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdatamodified) {
        this.data.appliedcoupan = this.appliedcoupan;
        this.data.amounttopay = this.amounttopay;
        if (value == 2) {
          this.data.isConfirmed = true;
          this.dialogRef.close(this.data);
        } else {
          this.walletamount = result.user.amount;
          this.authService.currentUserValue.user.amount = result.user.amount;
        }
      }
    });
  }

  openAddMoneyUsingPaypal(): void {
    const dialogRef = this.dialog.open(PaypalPaymentComponent, {
      autoFocus: false,
      width: "40%",
      disableClose: true,
      data: {
        isdatamodified: false,
        user: User,
        paymenttitle: "Pay via card",
        isdirectpayment: true,
        amounttopay: this.amounttopay.toFixed(2),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdatamodified) {
        this.data.appliedcoupan = this.appliedcoupan;
        this.data.amounttopay = this.amounttopay;

        this.data.isConfirmed = true;
        this.dialogRef.close(this.data);
      }
    });
  }

  onLaterClick(): void {
    this.data.isLater = true;
    this.dialogRef.close(this.data);
  }
  fetchCoupanCode(): void {
    this.commonService.getCoupons("prelim").subscribe(
      (response) => {
        this.genericService.prelimcoupans = response;

        if (response.length == 0) {
          this.NoActivecoupan = true;
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
}
