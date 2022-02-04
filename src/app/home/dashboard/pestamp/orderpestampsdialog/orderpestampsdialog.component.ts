import { Component, Inject, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import {
  MatDialog, MatDialogRef, MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { Observable } from "rxjs";
import { PaypalPaymentComponent } from "src/app/shared/paypal-payment/paypal-payment.component";
import { Design, Pestamp, User } from "src/app/_models";
import {
  AuthenticationService, GenericService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { AddcoinsdialogComponent } from "../../profile/addcoinsdialog/addcoinsdialog.component";

export interface OrderPestampsFormData {
  finalamount: number;
  isConfirmed: boolean;
  isLater: boolean;
  loggedinUser: User;
  refreshDashboard: boolean;
  ispestamps: boolean;
  pestampid: string;
  pestamp: Pestamp;
  amounttopay: number;
  isPermitmode: boolean;
  design: Design;
  designRaisedbyWattmonk: boolean;
  permit: Design;
  isForRevision: boolean;
}
@Component({
  selector: "app-orderpestampsdialog",
  templateUrl: "./orderpestampsdialog.component.html",
  styleUrls: ["./orderpestampsdialog.component.scss"],
})
export class OrderpestampsdialogComponent implements OnInit {
  isWattmonkUser: boolean = false;
  amounttopay = 0;
  servicecharge;
  walletamount = 0;
  discountamount = 0;
  // notifyService: any;
  loggedinuser: User;

  isLoading = false;
  ispaymentLoading = false;

  servicecharges: AngularFireObject<any>;
  servicechargedata: Observable<any>;
  printingCharges = 0;
  totalprintingcharges = 0;
  loadingmessage = "Saving data";

  constructor(
    public dialogRef: MatDialogRef<OrderpestampsdialogComponent>,
    public dialog: MatDialog,
    private db: AngularFireDatabase,
    private commonService: CommonService,
    public genericService: GenericService,
    private authService: AuthenticationService,
    private notifyService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: OrderPestampsFormData
  ) {
    this.loggedinuser = this.authService.currentUserValue.user;

    this.isLoading = true;
    this.servicecharges = this.db.object("service_charges");
    this.servicechargedata = this.servicecharges.valueChanges();
    this.servicechargedata.subscribe(
      (res) => {
        this.printingCharges = res.pestamp_printing.price;
        if (this.data.pestamp.type == "both") {
          this.servicecharge = res.pestamp_both_residential.price;
          this.printingCharges = res.pestamp_printing.price * 2;
        } else if (
          this.data.pestamp.type == "electrical" &&
          this.data.pestamp.propertytype == "residential"
        ) {
          this.servicecharge = res.pestamp_electrical_residential.price;
        } else if (
          this.data.pestamp.type == "structural" &&
          this.data.pestamp.propertytype == "residential"
        ) {
          this.servicecharge = res.pestamp_structural_residential.price;
        } else if (this.data.pestamp.propertytype == "commercial") {
          this.servicecharge = 0;
        }

        if (
          this.data.pestamp.modeofstamping == "hardcopy" ||
          this.data.pestamp.modeofstamping == "both"
        ) {
          this.totalprintingcharges =
            this.data.pestamp.hardcopies * this.printingCharges;
          if (this.data.pestamp.propertytype == "commercial") {
            this.amounttopay = this.servicecharge + 0;
          } else {
            this.amounttopay = this.servicecharge + this.totalprintingcharges;
          }
        } else {
          this.amounttopay = this.servicecharge;
        }
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
    // this.isLoading = true;
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    /*if(this.data.designRaisedbyWattmonk){
      this.isWattmonkUser = true;
      if(this.data.permit == undefined){
        id = this.data.pestamp.creatorparentid;
      }
      else{
        id = this.data.permit.creatorparentid;
      }
     
      this.commonService.userData(id).subscribe(
        response => {
          this.loggedinuser=response;
          this.walletamount = response.parent.amount;
          this.isLoading = false;
        },
        error => {
         this.notifyService.showError("Unable to fetch the wallet amount",error)
        }
      );
    }

    else
    {
      this.isWattmonkUser = false;
      id = this.loggedinuser.id;
      this.commonService.userData(id).subscribe(
      response => {
        this.loggedinuser=response;
        this.walletamount = response.parent.amount;
        this.isLoading = false;
      },
      error => {
       this.notifyService.showError("Unable to fetch the wallet amount",error)
      }
    );
    }*/
    this.commonService.userData(this.loggedinuser.id).subscribe(
      (response) => {
        this.loggedinuser = response;
        this.walletamount = response.parent.amount;
        this.isLoading = false;
      },
      (error) => {
        this.notifyService.showError(
          "Unable to fetch the wallet amount",
          error
        );
      }
    );
  }
  onCloseClick(): void {
    this.data.isConfirmed = false;
    this.dialogRef.close(this.data);
  }

  onConfirmationClick(): void {
    // this.loaderservice.show();
    if (this.amounttopay > this.walletamount && this.data.pestamp.propertytype != 'commercial') {
      this.data.isConfirmed = false;
      // this.isLoading=true;
      this.notifyService.showWarning(
        "Warning",
        "It seems you don't have sufficient balance in your wallet. In order to place the request please recharge your wallet or make a direct payment via any of your Debit/Credit Card."
      );
    } else {
      localStorage.setItem("paymenttype", "wallet");
      this.data.isConfirmed = true;
      this.data.amounttopay = this.amounttopay;
      this.dialogRef.close(this.data);
    }
  }

  onProceedClick(): void {
    // this.loaderservice.show();
    // this.isLoading=true;
    this.data.isConfirmed = true;
    this.data.amounttopay = this.amounttopay;
    this.dialogRef.close(this.data);
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
        if (value == 2) {
          this.data.isConfirmed = true;
          this.data.amounttopay = this.amounttopay;
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
      width: "50%",
      disableClose: true,
      data: {
        isdatamodified: false,
        user: User,
        paymenttitle: "Pay via card",
        isdirectpayment: true,
        amounttopay: this.amounttopay.toFixed(2),
      },
      panelClass: "white-modalbox",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdatamodified) {
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
}
