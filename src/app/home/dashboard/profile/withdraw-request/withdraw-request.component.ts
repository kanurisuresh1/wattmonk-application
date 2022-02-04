import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAILFORMAT } from 'src/app/_helpers';
import { BankdetailService } from 'src/app/_services/bankdetail.service';

@Component({
  selector: "app-withdrow-request",
  templateUrl: "./withdraw-request.component.html",
  styleUrls: ["./withdraw-request.component.scss"],
})
export class WithdrawRequestComponent implements OnInit {
  amount = new FormControl("", [Validators.required]);
  email = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  paymenttype = new FormControl("", [Validators.required]);
  servicetype = new FormControl("", [Validators.required]);
  userid = new FormControl("", [Validators.required]);
  withdrawlrequestform: FormGroup;
  display = false;
  displayerror = true;
  constructor(
    // private http:HttpClient,
    // private reqwithdrow: FormBuilder,
    private bankdetailservice: BankdetailService,
    public dialogRef: MatDialogRef<WithdrawRequestComponent>,
    public dialog: MatDialog
  ) {
    this.withdrawlrequestform = new FormGroup({
      amount: this.amount,
      email: this.email,
      paymenttype: this.paymenttype,
      servicetype: this.servicetype,
      userid: this.userid,
    });
  }

  onsubmit($ev): void {
    $ev.preventDefault();
    this.bankdetailservice
      .addwithdrawrequest(
        this.withdrawlrequestform.get("amount").value,
        this.withdrawlrequestform.get("email").value,
        this.withdrawlrequestform.get("paymenttype").value,
        this.withdrawlrequestform.get("servicetype").value
      )
      .subscribe(() => {
        // do nothing.
      });
  }
  ngOnInit(): void {
    this.servicetype.setValue("design");
  }
  withdrow = {
    available: 200,
  };

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
