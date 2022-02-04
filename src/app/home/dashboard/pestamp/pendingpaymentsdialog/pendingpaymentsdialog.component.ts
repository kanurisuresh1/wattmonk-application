import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaypalPaymentComponent } from 'src/app/shared/paypal-payment/paypal-payment.component';
import { Pestamp, User } from 'src/app/_models';
import { AuthenticationService, GenericService, NotificationService, PestampService } from 'src/app/_services';
import { CommonService } from 'src/app/_services/common.service';
import { AddcoinsdialogComponent } from '../../profile/addcoinsdialog/addcoinsdialog.component';

export interface PendingpaymentsFormData {
  finalamount: number;
  isConfirmed: boolean;
  isLater: boolean;
  loggedinUser: User;
  pestamp: Pestamp;
}
@Component({
  selector: "app-pendingpaymentsdialog",
  templateUrl: "./pendingpaymentsdialog.component.html",
  styleUrls: ["./pendingpaymentsdialog.component.scss"],
})
export class PendingpaymentsdialogComponent implements OnInit {
  amounttopay = 0;
  walletamount = 0;
  deliverycharges = 0;
  servicecharge;
  // notifyService: any;
  loggedinuser: User;
  workinghours = 0;

  constructor(
    public dialogRef: MatDialogRef<PendingpaymentsdialogComponent>,
    public dialog: MatDialog,
    private commonService: CommonService,
    private genericService: GenericService,
    private authService: AuthenticationService,
    private notifyService: NotificationService,
    private pestampService: PestampService,
    @Inject(MAT_DIALOG_DATA) public data: PendingpaymentsFormData
  ) {
    this.loggedinuser = this.authService.currentUserValue.user;
  }

  ngOnInit(): void {

    this.getWorkinghours()

    this.getCurrentUser();
    /* if(this.data.pestamp.type=='both'){
      this.deliverycharges = this.data.pestamp.electricaldeliverycharges+this.data.pestamp.structuraldeliverycharges
    }
    else{
      this.deliverycharges = this.data.pestamp.deliverycharges
    } */


  }

  getWorkinghours(): void {
    this.pestampService.getPestampworkinghours(this.data.pestamp.id).subscribe(response => {

      response.forEach(element => {
        this.workinghours = this.workinghours + element.workinghours
        this.deliverycharges = this.deliverycharges + element.deliverycharges
      });

      //this.getCommercialCharges();
    });
  }
  // getCommercialCharges() {
  //   if(this.data.pestamp.propertytype=='commercial'){

  //   var searchdata
  //   var bothtypepestampcharges=0
  //   if (this.data.pestamp.propertytype == 'commercial' && this.data.pestamp.type == 'structural') {
  //     searchdata = "structuralcommercialpecharges"
  //   }
  //   else if (this.data.pestamp.propertytype == 'commercial' && this.data.pestamp.type =='electrical') {
  //     searchdata = "electricalcommercialpecharges"
  //   }
  //   else if(this.data.pestamp.propertytype =="commercial" && this.data.pestamp.type=="both"){
  //     searchdata = "electricalcommercialpecharges";
  //     var structuralcommercialsearchdata = "structuralcommercialpecharges";

  //     this.commonService.getPestampchargese(structuralcommercialsearchdata).subscribe(
  //       response => {

  //         bothtypepestampcharges = parseInt(response[0].settingvalue);
  //       }
  //     );
  //   }
  //   setTimeout(() => {
  //   this.commonService.getPestampchargese(searchdata).subscribe(
  //     response => {
  //       this.genericService.pestampscharges = response[0].settingvalue+bothtypepestampcharges
  //       if(this.data.pestamp.type=="both"){
  //         this.servicecharge = (this.genericService.pestampscharges * (this.data.pestamp.structuralworkinghours+this.data.pestamp.electricalworkinghours));
  //       }
  //       else{
  //         this.servicecharge = (this.genericService.pestampscharges * (this.workinghours))
  //       }

  //       this.getAmounttopay();
  //     }
  //   )}, 500)
  //   }
  //   else{
  //     this.getAmounttopay();
  //   }
  // }

  // getAmounttopay() {
  //   if (this.data.pestamp.propertytype == 'commercial' && (this.data.pestamp.modeofstamping == 'hardcopy' || this.data.pestamp.modeofstamping == 'both')) {
  //     this.amounttopay = this.servicecharge + this.deliverycharges;
  //   }
  //   else if (this.data.pestamp.propertytype == 'commercial' && this.data.pestamp.modeofstamping == 'ecopy') {
  //     this.amounttopay = this.servicecharge;
  //   }
  //   else if (this.data.pestamp.propertytype == 'residential' && (this.data.pestamp.modeofstamping == 'hardcopy' || this.data.pestamp.modeofstamping == 'both')) {
  //     this.amounttopay = this.deliverycharges;
  //   }
  // }
  ngAfterViewInit(): void {
    // do nothing.

  }
  getCurrentUser(): void {
    this.commonService.userData(this.loggedinuser.id).subscribe(
      response => {
        this.loggedinuser = response;
        this.walletamount = response.parent.amount;
      }
    );
  }
  onCloseClick(): void {
    this.data.isConfirmed = false;
    this.dialogRef.close(this.data);
  }

  onConfirmationClick(): void {
    if (this.amounttopay > this.walletamount) {
      this.data.isConfirmed = false;
      this.notifyService.showWarning(
        "Warning",
        "It seems you don't have sufficient balance in your wallet. In order to place the request please recharge your wallet or make a direct payment via any of your Debit/Credit Card."
      );
    } else {
      this.data.isConfirmed = true;
      this.dialogRef.close(this.data);
    }
  }

  onProceedClick(): void {
    const inputData = {
      paymenttype: "wallet",
      pestampid: this.data.pestamp.id,
      user: this.loggedinuser.id,
    };
    if (
      this.data.pestamp.propertytype == "commercial" &&
      (this.data.pestamp.modeofstamping == "hardcopy" ||
        this.data.pestamp.modeofstamping == "both")
    ) {
      this.makeCommercialpayment(inputData);
    } else if (
      this.data.pestamp.propertytype == "commercial" &&
      this.data.pestamp.modeofstamping == "ecopy"
    ) {
      this.makeCommercialpayment(inputData);
    } else if (
      this.data.pestamp.propertytype != "commercial" &&
      (this.data.pestamp.modeofstamping == "hardcopy" ||
        this.data.pestamp.modeofstamping == "both")
    ) {
      this.makepayment(inputData);
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
        if (value == 2) {
          const inputData = {
            paymenttype: "direct",
            token: this.genericService.stripepaymenttoken.id,
            pestampid: this.data.pestamp.id,
            email: this.data.pestamp.email,
            amount: this.amounttopay,
            user: this.loggedinuser.id,
          };
          if (
            this.data.pestamp.propertytype == "commercial" &&
            (this.data.pestamp.modeofstamping == "hardcopy" ||
              this.data.pestamp.modeofstamping == "both")
          ) {
            this.makeCommercialpayment(inputData);
          } else if (
            this.data.pestamp.propertytype == "commercial" &&
            this.data.pestamp.modeofstamping == "ecopy"
          ) {
            this.makeCommercialpayment(inputData);
          } else if (
            this.data.pestamp.propertytype != "commercial" &&
            (this.data.pestamp.modeofstamping == "hardcopy" ||
              this.data.pestamp.modeofstamping == "both")
          ) {
            this.makepayment(inputData);
          }
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
      panelClass: "white-modalbox",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdatamodified) {
        const inputData = {
          paymenttype: "direct",
          pestampid: this.data.pestamp.id,
          email: this.data.pestamp.email,
          amount: this.amounttopay,
          user: this.loggedinuser.id,
        };
        if (
          this.data.pestamp.propertytype == "commercial" &&
          (this.data.pestamp.modeofstamping == "hardcopy" ||
            this.data.pestamp.modeofstamping == "both")
        ) {
          this.makeCommercialpayment(inputData);
        } else if (
          this.data.pestamp.propertytype == "commercial" &&
          this.data.pestamp.modeofstamping == "ecopy"
        ) {
          this.makeCommercialpayment(inputData);
        } else if (
          this.data.pestamp.propertytype != "commercial" &&
          (this.data.pestamp.modeofstamping == "hardcopy" ||
            this.data.pestamp.modeofstamping == "both")
        ) {
          this.makepayment(inputData);
        }
      }
    });
  }




  makepayment(inputData): void {
    this.pestampService.createPestamppayment(inputData).subscribe(response => {

      this.data.isConfirmed = true;
      this.data.pestamp = response;
      this.dialogRef.close(this.data);
      this.notifyService.showSuccess("payment successfull", "success");
      localStorage.removeItem("paymenttype");
    },
      error => {

        this.data.isConfirmed = false;
        this.dialogRef.close(this.data);
        this.notifyService.showError("Unable to make payment right now", error);
        localStorage.removeItem("paymenttype");
      }
    );
  }

  makeCommercialpayment(inputData): void {
    this.pestampService.createCommercialPestamppayment(inputData).subscribe(response => {

      this.data.isConfirmed = true;
      this.data.pestamp = response;
      this.dialogRef.close(this.data);
      this.notifyService.showSuccess("payment successfull", "success")
      localStorage.removeItem("paymenttype");
      localStorage.removeItem("paymentstatus");
    },
      error => {
        this.data.isConfirmed = false;
        this.dialogRef.close(this.data);
        this.notifyService.showError("Unable to make payment right now", error);
        localStorage.removeItem("paymenttype");
        localStorage.removeItem("paymentstatus");
      }
    );
  }
  onLaterClick(): void {
    this.data.isLater = true;
    this.dialogRef.close(this.data);
  }
}
