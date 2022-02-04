import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import { FormControl } from "@angular/forms";
import {
  MatDialog, MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { Observable } from "rxjs";
import { AddcoinsdialogComponent } from "src/app/home/dashboard/profile/addcoinsdialog/addcoinsdialog.component";
import { PaypalPaymentComponent } from "src/app/shared/paypal-payment/paypal-payment.component";
import { Design, User } from "src/app/_models";
import {
  AuthenticationService,
  CouponService, GenericService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { ApplypermitpromocodedialogComponent } from "../applypermitpromocodedialog/applypermitpromocodedialog.component";

//  import { AddcoinsdialogComponent } from './addcoinsdialog/addcoinsdialog.component';

export interface OrderPrelimFormData {
  amounttopay: number;
  isConfirmed: boolean;
  isLater: boolean;
  loggedinUser: User;
  refreshDashboard: boolean;
  isprelim: boolean;
  design: Design;
  appliedcoupan: any;
  slabname: string;
  slabdiscount: number;
  serviceamount: number;
  designRaisedbyWattmonk: boolean;
  prlimDesign: Design;
}

@Component({
  selector: "app-orderpermitdesigndialog",
  templateUrl: "./orderpermitdesigndialog.component.html",
  styleUrls: ["./orderpermitdesigndialog.component.scss"],
})
export class OrderpermitdesigndialogComponent implements OnInit {
  isWattmonkUser: boolean = false;
  amounttopay = 0;
  servicecharge = 0;
  discountamount = 0;
  userdesignscount: number;
  numberoffreedesign;
  walletamount = 0;
  // notifyService: any;
  loggedinuser: User;
  iscoupanapplied = false;
  appliedcoupan = null;
  nocoupanactive = false;
  coupandiscount = 0;
  deliverytime = new FormControl("", []);
  isdisabled = false;
  isLoading = false;
  ispaymentLoading = false;
  servicecharges: AngularFireObject<any>;
  servicechargedata: Observable<any>;
  precopycoupan = null;
  couponid: any;
  invalidcouponmessage: string = null;
  constructor(
    public dialogRef: MatDialogRef<OrderpermitdesigndialogComponent>,
    public dialog: MatDialog,
    private db: AngularFireDatabase,
    private commonService: CommonService,
    public genericService: GenericService,
    private authService: AuthenticationService,
    private notifyService: NotificationService,
    private datepipe: DatePipe,
    private couponservice: CouponService,
    @Inject(MAT_DIALOG_DATA) public data: OrderPrelimFormData
  ) {
    //this.walletamount = parseInt(localStorage.getItem("walletamount"));
    this.loggedinuser = this.authService.currentUserValue.user;
    this.deliverytime.patchValue("6-12");
    this.ispaymentLoading = true;
    this.servicecharges = this.db.object("service_charges");
    this.servicechargedata = this.servicecharges.valueChanges();
    this.servicechargedata.subscribe(
      (res) => {
        if (this.data.design.projecttype == "residential") {
          if (data.design.jobtype == "pv") {
            this.servicecharge = res.permit_pv_residential.price;
            this.data.slabname = res.permit_pv_residential.turnaroundtime;
          } else if (data.design.jobtype == "battery") {
            this.servicecharge = res.permit_battery_residential.price;
            this.data.slabname = res.permit_battery_residential.turnaroundtime;
          } else if (data.design.jobtype == "pvbattery") {
            this.servicecharge = res.permit_pvbattery_residential.price;
            this.data.slabname =
              res.permit_pvbattery_residential.turnaroundtime;
          }
        } else if (
          this.data.design.projecttype == "commercial" ||
          this.data.design.projecttype == "detachedbuildingorshop" ||
          this.data.design.projecttype == "carport"
        ) {
          let solarCapcity;
          if (
            this.data.design.monthlybill &&
            (this.data.design.solarcapacity === null ||
              this.data.design.solarcapacity == undefined)
          ) {
            solarCapcity = this.data.design.monthlybill / 1150;
          } else if (
            this.data.design.solarcapacity &&
            (this.data.design.monthlybill === null ||
              this.data.design.monthlybill == undefined)
          ) {
            solarCapcity = this.data.design.solarcapacity;
          }
          if (solarCapcity > 0 && solarCapcity <= 49) {
            this.servicecharge = res.permit_0_49commercial.price;
            this.data.slabname = res.permit_0_49commercial.turnaroundtime;
          } else if (solarCapcity > 49 && solarCapcity <= 99) {
            this.servicecharge = res.permit_50_99commercial.price;
            this.data.slabname = res.permit_50_99commercial.turnaroundtime;
          } else if (solarCapcity > 99 && solarCapcity <= 199) {
            this.servicecharge = res.permit_100_199commercial.price;
            this.data.slabname = res.permit_100_199commercial.turnaroundtime;
          } else if (solarCapcity > 199 && solarCapcity <= 299) {
            this.servicecharge = res.permit_200_299commercial.price;
            this.data.slabname = res.permit_200_299commercial.turnaroundtime;
          } else if (solarCapcity > 299) {
            this.servicecharge = res.permit_200_299commercial.price;
            this.data.slabname = res.permit_200_299commercial.turnaroundtime;
            for (let i = 300; i <= solarCapcity; i = i + 100) {
              this.servicecharge += res.permit_above_299_commercial.price;
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
    if (this.data.designRaisedbyWattmonk) {
      this.isWattmonkUser = true;
    } else {
      this.isWattmonkUser = false;
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.getUser();
    this.fetchCoupanCode();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.couponid = JSON.parse(localStorage.getItem("copiedcoupan"));
      // let date = new Date()
      if (this.couponid && this.couponid.requesttype == "permit") {
        const newdate = this.datepipe.transform(new Date(), "yyyy-MM-dd");
        // let currentdate;
        // currentdate = newdate.split("-");
        // let currentdatetime = new Date( currentdate[2], currentdate[1] , currentdate[0]);

        const currentdatetime = new Date(newdate);
        const expirydatetime = new Date(this.couponid.expirydate);
        // console.log(currentdatetime);
        // console.log(expirydatetime)
        // if(currentdatetime <= currentdatetime) {
        //     alert("true");
        //     return true;
        // }

        // let expirydate;
        // expirydate = this.couponid.expirydate.split("-");
        // let expirydatetime = new Date( expirydate[2], expirydate[1] , expirydate[0]).getTime();
        // console.log(currentdate[0]);console.log(currentdate[1]);console.log(currentdate[2]);
        // console.log(expirydate[0]);console.log(expirydate[1]);console.log(expirydate[2]);

        if (currentdatetime > expirydatetime) {
          localStorage.removeItem("copiedcoupan");
          this.appliedcoupan = null;
        } else {
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
    }, 1000);
  }

  getUser(): void {
    /* if(this.data.designRaisedbyWattmonk){
      this.isWattmonkUser = true;
      id = this.data.prlimDesign.creatorparentid;
      this.commonService.userData(id).subscribe(
        response => {
         
          this.loggedinuser = response;
          console.log("inside wattmonk Logedin User:",this.loggedinuser)
          this.walletamount = response.parent.amount;
          this.getDesignCount();
          /*if (this.amounttopay > this.walletamount) {
            this.data.isConfirmed = false;
            this.notifyService.showWarning(
              "Warning",
              "It seems you don't have sufficient balance in your wallet. In order to place the request please recharge your wallet or make a direct payment via any of your Debit/Credit Card."
            );
          }
        },
        error => {
  
        }
      );
    }
    else{
      this.isWattmonkUser = false;
      id = this.loggedinuser.id;
      this.commonService.userData(id).subscribe(
        response => {
          this.loggedinuser = response;
          this.walletamount = response.parent.amount;
          this.getDesignCount();
        },
        error => {
  
        }
      );
    }*/
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
  getDesignCount(): void {
    this.commonService
      .getDesignsCountByUser(this.authService.currentUserValue.user.parent.id)
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
      localStorage.setItem("paymenttype", "wallet");
      this.data.isConfirmed = true;

      this.data.amounttopay = this.amounttopay;
      if (this.appliedcoupan) {
        this.data.appliedcoupan = this.appliedcoupan;
        this.data.serviceamount = this.servicecharge;
        this.couponservice
          .validateCoupon(this.appliedcoupan)
          .subscribe((res) => {
            if (res.error) {
              this.invalidcouponmessage = res.message;
            } else {
              this.dialogRef.close(this.data);
            }
          });
      } else {
        this.dialogRef.close(this.data);
      }
    }
  }

  OnRemoveCoupan(): void {
    this.iscoupanapplied = false;
    this.discountamount = 0;
    this.amounttopay = 0;
    this.getDesignCount();
    this.appliedcoupan = null;
    this.invalidcouponmessage = null;
  }

  openapplypromocodedialog(): void {
    let coupandata: any;
    const dialogRef = this.dialog.open(ApplypermitpromocodedialogComponent, {
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
          this.amounttopay = this.amounttopay - this.discountamount;
          this.coupandiscount = result.coupandata.amount;
        } else if (result.coupandata.discounttype == "percentage") {
          this.discountamount =
            (result.coupandata.amount * this.amounttopay) / 100;
          this.amounttopay = this.amounttopay - this.discountamount;
          this.coupandiscount =
            (result.coupandata.amount * this.amounttopay) / 100;
        }
      } else {
        this.appliedcoupan = null;
      }
    });
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
      });
    } else {
      this.dialogRef.close(this.data);
    }
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
        this.data.amounttopay = this.amounttopay;
        this.data.appliedcoupan = this.appliedcoupan;
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
      disableClose: true,
      width: "40%",
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
}
