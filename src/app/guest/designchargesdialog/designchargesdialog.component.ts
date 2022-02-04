import { Component, Inject, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { PaypalPaymentComponent } from 'src/app/shared/paypal-payment/paypal-payment.component';
import { Design, User } from "src/app/_models";


export interface DesignChargeFormData {
  finalamount: number;
  isConfirmed: boolean;
  isLater: boolean;
  loggedinUser: User;
  refreshDashboard: boolean;
  isprelim: boolean;
  design: Design;
  requiremnttype: string;
  slabname: string
  designtype: string,
  annulaunits: number,
  propertytype: string,
  jobtype: string
}

@Component({
  selector: "app-designchargesdialog",
  templateUrl: "./designchargesdialog.component.html",
  styleUrls: ["./designchargesdialog.component.scss"],
})
export class DesignchargesdialogComponent implements OnInit {
  amounttopay;
  servicecharge;
  discountamount = 0;
  userdesignscount: number;
  numberoffreedesign;
  servicecharges: AngularFireObject<any>;
  servicechargedata: Observable<any>;
  constructor(
    public dialogRef: MatDialogRef<DesignchargesdialogComponent>,
    public dialog: MatDialog,
    private db: AngularFireDatabase,
    // private genericService : GenericService,
    // private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: DesignChargeFormData
  ) {

    this.servicecharges = this.db.object("service_charges");
    this.servicechargedata = this.servicecharges.valueChanges();
    this.servicechargedata.subscribe(
      (res) => {
        if (this.data.designtype == 'proposal' && this.data.propertytype == 'residential') {
          this.servicecharge = res.proposal_residential.price
        }
        else if (this.data.designtype == 'assessment' && this.data.propertytype == 'residential') {
          this.servicecharge = res.assessment_residential.price
        }
        else if (this.data.designtype == 'proposal' && (this.data.propertytype == 'commercial' || this.data.propertytype == 'detachedbuildingorshop' || this.data.design.projecttype == 'carport')) {
          const solarCapcity = this.data.annulaunits / 1150
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

        else if (this.data.designtype == 'assessment' && (this.data.propertytype == 'commercial' || this.data.propertytype == 'detachedbuildingorshop' || this.data.propertytype == 'carport')) {
          const solarCapcity = this.data.annulaunits / 1150
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



        if (this.data.designtype == 'permit' && this.data.propertytype == 'residential') {
          if (data.jobtype == 'pv') {
            this.servicecharge = res.permit_pv_residential.price
            this.data.slabname = res.permit_pv_residential.turnaroundtime
          }
          else if (this.data.designtype == 'permit' && data.jobtype == 'battery') {
            this.servicecharge = res.permit_battery_residential.price
            this.data.slabname = res.permit_battery_residential.turnaroundtime
          }
          else if (this.data.designtype == 'permit' && data.jobtype == 'pvbattery') {
            this.servicecharge = res.permit_pvbattery_residential.price
            this.data.slabname = res.permit_pvbattery_residential.turnaroundtime
          }
        }
        else if (this.data.designtype == 'permit' && (this.data.propertytype == 'commercial' || this.data.propertytype == 'detachedbuildingorshop' || this.data.propertytype == 'carport')) {
          const solarCapcity = this.data.annulaunits;
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
        this.discountamount = this.servicecharge;
        this.amounttopay = this.servicecharge - this.discountamount;
      }
      // (err) => console.log(err),
      // () => console.log("done!")
    );
  }

  ngOnInit(): void {
    // do nothing.
  }

  ngAfterViewInit(): void {
    // do nothing.
  }

  /*   getDesignCharges(postData){
      this.commonService.getPermitDesignCharge(postData).subscribe(
        response => {
          
          this.genericService.permitdesigncharges = response.servicecharge;
          this.servicecharge=this.genericService.permitdesigncharges;
          if(response.freedesign==true){
            this.discountamount=this.servicecharge;
          }
          else{
            this.discountamount=response.slabdiscount;
          }
          
          this.amounttopay =this.servicecharge-this.discountamount;
        }
      );
    } */
  onConfirmationClick(): void {
    this.data.isConfirmed = true;
    this.dialogRef.close(this.data);
  }

  openAddMoneyUsingPaypal(): void {
    const dialogRef = this.dialog.open(PaypalPaymentComponent, {
      autoFocus: false,
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
        this.amounttopay = this.amounttopay;
        this.data.isConfirmed = true;
        this.dialogRef.close(this.data);
      }
    });
  }
}
