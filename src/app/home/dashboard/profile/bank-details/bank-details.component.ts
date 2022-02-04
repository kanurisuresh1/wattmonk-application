import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MAILFORMAT } from "src/app/_helpers";
import { BankDetail } from "src/app/_models/bankdetail";
import { NotificationService } from "src/app/_services";
import { BankdetailService } from "src/app/_services/bankdetail.service";
export interface BankDetailFormData {
  triggerEditEvent: boolean;
  isEditMode: boolean;
  isDataUpdated: boolean;
  bankdetail: BankDetail;
  isbank: boolean;
}
@Component({
  selector: "app-bank-details",
  templateUrl: "./bank-details.component.html",
  styleUrls: ["./bank-details.component.scss"],
})
export class BankDetailsComponent implements OnInit {
  isLoading = false;

  // public get dialogRef(): MatDialogRef<BankDetailsComponent> {
  //   return this._dialogRef;
  // }
  loadingmessage = "Saving data";

  name = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z. ]{3,}$"),
  ]);
  paypalemail = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);

  // IFSCcode = new FormControl("", [
  //   Validators.required,
  // ]);
  accountnumber = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9]{10,20}$"),
  ]);

  bank = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9]{3,20}$"),
  ]);

  phonenumber = new FormControl("", [Validators.pattern("^[0-9]{8,15}$")]);

  branch = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9]{3,20}$"),
  ]);

  swiftcode = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9]{8,20}$"),
  ]);

  typeofaccount = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z]{3,20}$"),
  ]);

  // isprimary = new FormControl("", [
  //   Validators.required
  // ]);

  bankcode = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9]{8,20}$"),
  ]);
  bankdetailform: FormGroup;

  display = false;
  displayerror = true;

  constructor(
    // private bankaccount: FormBuilder,
    public dialog: MatDialog,
    // private _snackBar: MatSnackBar,
    // private changeDetectorRef: ChangeDetectorRef,
    private notifyService: NotificationService,
    private bankdetailservice: BankdetailService,
    public dialogRef: MatDialogRef<BankDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BankDetailFormData //  dipublicalog: MatDialog)
  ) {
    this.bankdetailform = new FormGroup({
      name: this.name,
      // IFSCcode: this.IFSCcode,
      accountnumber: this.accountnumber,
      bank: this.bank,
      phonenumber: this.phonenumber,
      branch: this.branch,
      swiftcode: this.swiftcode,
      bankcode: this.bankcode,
      typeofaccount: this.typeofaccount,
      // isprimary: this.isprimary,
      paypalemail: this.paypalemail,
    });
    // if (true) {
    //   // this.bankdetailform.patchValue({ name: data.bankdetail.name, accountnumber: data.bankdetail.accountnumber, bank: data.bankdetail.bank, phonenumber: data.bankdetail.phonenumber, branch: data.bankdetail.branch, swiftcode: data.bankdetail.swiftcode, bankcode: data.bankdetail.bankcode, typeofaccount: data.bankdetail.typeofaccount });
    // }
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getBankDetails();
    }, 0);
  }

  private getBankDetails() {
    this.bankdetailservice.getBankDetails().subscribe(
      (response) => {
        if (response.length > 0) {
          this.data.bankdetail = response[0];
          this.bankdetailform.patchValue({
            paypalemail: this.data.bankdetail.paypalemail,
            name: this.data.bankdetail.name,
            accountnumber: this.data.bankdetail.accountnumber,
            bank: this.data.bankdetail.bank,
            phonenumber: this.data.bankdetail.phonenumber,
            branch: this.data.bankdetail.branch,
            swiftcode: this.data.bankdetail.swiftcode,
            bankcode: this.data.bankdetail.bankcode,
            typeofaccount: this.data.bankdetail.typeofaccount,
          });
        }
      },
      () => {
        // this.notifyService.showError(
        //   error,
        //   "Error"
        // );
      }
    );
  }

  getErrorMessage(
    control: FormControl
  ):
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    } else if (control == this.name) {
      return this.name.hasError("pattern") ? "Please enter a valid name." : "";
    }
    // else if (control == this.IFSCcode) {
    //   return this.IFSCcode.hasError("pattern")
    //     ? "Please enter a valid IFSC code."
    //     : "";
    // }
    else if (control == this.accountnumber) {
      return this.accountnumber.hasError("pattern")
        ? "Please enter a valid account number(Min - 20,)."
        : "account number should be of min. 20 characters.";
    }
    if (control == this.bank) {
      return this.bank.hasError("pattern")
        ? "Bank Name should be of min. 3 characters and contain only alphabets."
        : "";
    } else if (control == this.phonenumber) {
      return this.phonenumber.hasError("pattern")
        ? "Please enter a valid phone number with only numbers (Min - 8, Max - 15)."
        : "Phone should be of min. 8 and max. 15 characters.";
    } else if (control == this.branch) {
      return this.branch.hasError("pattern")
        ? "please enter a valid  branch name"
        : "please enter a valid  branch name";
    } else if (control == this.swiftcode) {
      return this.swiftcode.hasError("pattern")
        ? "please enter a valid swift code"
        : "please enter a valid swift code";
    } else if (control == this.bankcode) {
      return this.bankcode.hasError("pattern")
        ? "please enter a valid  bank code"
        : "please enter a valid  bank code";
    } else if (control == this.typeofaccount) {
      return this.typeofaccount.hasError("pattern")
        ? "please enter a valid type of account"
        : "please enter a valid type of account";
    } else if (control == this.paypalemail) {
      return this.paypalemail.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    }
    // else if (control == this.isprimary) {
    //   return this.isprimary.hasError("pattern")
    //     ? "please enter valid number of hard copies"
    //     : "please enter valid number of hard copies";
    // }
  }
  onCloseClick(): void {
    this.dialogRef.close();
  }

  onAddBankDetail($ev): void {
    $ev.preventDefault();
    if (this.data.isbank) {
      if (this.bankdetailform.valid && this) {
        this.displayerror = false;
        this.addUpdateBankDetails();
      }
    } else {
      if (this.data.bankdetail.paypalemail) {
        if (this.bankdetailform.valid) {
          this.displayerror = false;
          this.addUpdateBankDetails();
        }
      }
    }
  }
  private addUpdateBankDetails() {
    if (
      this.data.bankdetail &&
      this.data.bankdetail.id &&
      this.data.bankdetail.id > 0
    ) {
      const postData = {
        paypalemail: this.bankdetailform.get("paypalemail").value,
        name: this.bankdetailform.get("name").value,
        accountnumber: this.bankdetailform.get("accountnumber").value,
        bank: this.bankdetailform.get("bank").value,
        branch: this.bankdetailform.get("branch").value,
        phonenumber: this.bankdetailform.get("phonenumber").value,
        swiftcode: this.bankdetailform.get("swiftcode").value,
        bankcode: this.bankdetailform.get("bankcode").value,
        typeofaccount: this.bankdetailform.get("typeofaccount").value,
      };

      this.bankdetailservice
        .editBankDetail(this.data.bankdetail.id, postData)
        .subscribe(
          () => {
            this.notifyService.showSuccess(
              "bankdetail have been updated successfully.",
              "Success"
            );
            this.data.triggerEditEvent = true;
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.bankdetailservice
        .addBankDetail(
          this.bankdetailform.get("paypalemail").value,
          this.bankdetailform.get("name").value,
          this.bankdetailform.get("accountnumber").value,
          this.bankdetailform.get("bank").value,
          this.bankdetailform.get("branch").value,
          this.bankdetailform.get("phonenumber").value,
          this.bankdetailform.get("swiftcode").value,
          this.bankdetailform.get("bankcode").value,
          this.bankdetailform.get("typeofaccount").value
        )
        .subscribe(
          () => {
            this.notifyService.showSuccess(
              "bankdetail has been added successfully.",
              "Success"
            );
          },
          (error) => {
            this.isLoading = false;
            this.notifyService.showError(error, "Error");
          }
        );
    }
  }

  // openConfirmationDialog(bankdetail : BankDetail) {
  //   const snackbarRef = this._snackBar.openFromComponent(ConfirmationsnackbarComponent, {
  //     data: {"message":"Are you sure you want to remove this coupon: " + bankdetail.name + " " + " from list?", "positive" : "Yes", "negative" : "No"}
  //   });

  //   snackbarRef.onAction().subscribe(() => {
  //     this.bankdetailservice.deleteBankDetail(""+bankdetail.id).subscribe(
  //       response => {
  //         this.notifyService.showSuccess(bankdetail.name + " " + " has been removed successfully from coupon list.", "Success");
  //         this.removebankdetail(bankdetail);
  //       },
  //       error => {
  //         this.notifyService.showError(error, "Error");
  //       }
  //     );
  //   });
  // }

  // removebankdetail(): void  {
  //   this.bank

  // }
}
