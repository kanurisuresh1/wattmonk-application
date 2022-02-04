import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";

@Component({
  selector: "app-transaction-filter-component",
  templateUrl: "./transaction-filter-component.component.html",
  styleUrls: ["./transaction-filter-component.component.scss"],
})
export class TransactionFilterComponentComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TransactionFilterComponentComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TransactionFilterComponentComponent
  ) { }

  ngOnInit(): void {
    // do nothing.
  }
}
