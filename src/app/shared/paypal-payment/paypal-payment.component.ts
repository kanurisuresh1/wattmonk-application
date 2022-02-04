import { Component, Inject, Input, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ICreateOrderRequest, IPayPalConfig } from "ngx-paypal";
import { User } from "src/app/_models/user";
import { environment } from "../../../environments/environment";

export interface PaymentData {
  isdatamodified: boolean;
  user: User;
  paymenttitle: string;
  isdirectpayment: boolean;
  amounttopay;
}

@Component({
  selector: "app-paypal-payment",
  templateUrl: "./paypal-payment.component.html",
  styleUrls: ["./paypal-payment.component.scss"],
})
export class PaypalPaymentComponent implements OnInit {
  showSuccess: boolean;
  notifyService: any;
  @Input() paypalAmount;
  finalamount;
  constructor(
    public dialogRef: MatDialogRef<PaypalPaymentComponent>,
    public router: Router,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: PaymentData
  ) {
    this.finalamount = data.amounttopay;
  }

  public payPalConfig?: IPayPalConfig;

  ngOnInit(): void {
    this.initConfig();
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: environment.PAYPAL_CONSTANTS.CURRENCY,
      clientId: environment.PAYPAL_CONSTANTS.CLIENT_ID,
      createOrderOnClient: () =>
        <ICreateOrderRequest>{
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: environment.PAYPAL_CONSTANTS.CURRENCY,
                value: this.data.amounttopay,
                breakdown: {
                  item_total: {
                    currency_code: environment.PAYPAL_CONSTANTS.CURRENCY,
                    value: this.data.amounttopay,
                  },
                },
              },
              items: [
                {
                  name: "WattMonk Services",
                  quantity: "1",
                  category: "DIGITAL_GOODS",
                  unit_amount: {
                    currency_code: environment.PAYPAL_CONSTANTS.CURRENCY,
                    value: this.data.amounttopay,
                  },
                },
              ],
            },
          ],
        },
      advanced: {
        commit: "true",
      },
      style: {
        label: "paypal",
        layout: "vertical",
      },
      onApprove: (data, actions) => {
        // console.log(
        //   "onApprove - transaction was approved, but not authorized",
        //   data,
        //   actions
        // );
        actions.order.get().then(() => {
          // console.log(
          //   "onApprove - you can get full order details inside onApprove: ",
          //   details
          // );
        });
      },
      onClientAuthorization: (data) => {
        // console.log(
        //   "onClientAuthorization - you should probably inform your server about completed transaction at this point",
        //   data
        // );
        this.showSuccess = true;

        this.data.user.amount = parseFloat(data.purchase_units[0].amount.value);
        this.data.isdatamodified = true;
        localStorage.setItem("paymenttype", "paypal");
        localStorage.setItem("paymentstatus", "succeeded");
        this.dialogRef.close(this.data);
      },
      onCancel: () => {
        this.data.isdatamodified = false;
        this.dialogRef.close(this.data);
      },
      onError: () => {
        this.notifyService.showInfo();
        this.data.isdatamodified = false;
        this.dialogRef.close(this.data);
      },
      onClick: () => {
        // console.log("onClick", data, actions);
      },
    };
  }
  onCloseClick(): void {
    this.dialogRef.close(this.data);
  }
}
