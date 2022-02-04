import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface AddRowField {
  data: number;
  isDataUpdated: boolean;
}

@Component({
  selector: "app-addrowlist",
  templateUrl: "./addrowlist.component.html",
  styleUrls: ["./addrowlist.component.scss"],
})
export class AddrowlistComponent implements OnInit {
  addRowsDialogForm: FormGroup;

  numberItems = new FormControl(null, [
    Validators.pattern("^[0-9]*"),
    Validators.min(1),
    Validators.max(99),
  ]);

  constructor(
    public dialogRef: MatDialogRef<AddrowlistComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddRowField
  ) {
    this.addRowsDialogForm = new FormGroup({
      numberItems: this.numberItems,
    });
  }

  ngOnInit(): void {
    // do nothing.
  }

  getErrorMessage(control: FormControl): string | string | string | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    } else if (control == this.numberItems) {
      if (this.numberItems.hasError("pattern")) {
        return this.numberItems.hasError("pattern")
          ? "Please enter a valid number greater then 0 and less then or equal to 99."
          : "Please enter a valid number greater then 0 and less then or equal to 99.";
      } else if (this.numberItems.hasError("min")) {
        return this.numberItems.hasError("min")
          ? "Please enter minimum 1 number as row"
          : "Please enter minimum 1 number as row";
      } else if (this.numberItems.hasError("max")) {
        return this.numberItems.hasError("max")
          ? "Please enter number of rows less then or equal to 99"
          : "Please enter number of rows less then or equal to 99";
      }
    }

    // if (control == this.numberItems) {
    //   return this.numberItems.hasError("pattern")
    //     ? "Value should contain only numbers."
    //     : "";
    // }
  }

  onCloseClick(): void {
    this.dialogRef.close(this.data);
  }

  onSaveRow(): void {
    if (this.addRowsDialogForm.get("numberItems").value > 0) {
      this.data.isDataUpdated = true;
      this.data.data = this.addRowsDialogForm.get("numberItems").value;
      this.dialogRef.close(this.data);
    }
  }
}
