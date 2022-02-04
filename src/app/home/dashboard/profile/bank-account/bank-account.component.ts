import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { BankDetailsComponent } from "../bank-details/bank-details.component";
@Component({
  selector: "app-bank-account",
  templateUrl: "./bank-account.component.html",
  styleUrls: ["./bank-account.component.scss"],
})
export class BankAccountComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<BankAccountComponent>,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  bankDetails(): void {
    this.dialogRef.close();
    this.dialog.open(BankDetailsComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      panelClass: "white-modalbox",
      data: {
        isEditMode: true,
        isbank: true,
        bankdetail: null,
        triggerEditEvent: false,
      },
    });
  }

  paypaldetails(): void {
    this.dialogRef.close();
    this.dialog.open(BankDetailsComponent, {
      width: "30%",
      height: "41%",
      autoFocus: false,
      disableClose: true,
      panelClass: "white-modalbox",
      data: {
        isEditMode: true,
        isbank: false,
        bankdetail: null,
        triggerEditEvent: false,
      },
    });
  }

  // paypaldetails(): void {
  //   this.dialogRef.close();
  //   const dialogRef = this.dialog.open(PaypalDetailsComponent, {
  //     width: '25%',
  //     autoFocus: false,
  //     panelClass: 'white-modalbox',
  //   });
  // }
}
