import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-termsdialog",
  templateUrl: "./termsdialog.component.html",
  styleUrls: ["./termsdialog.component.scss"],
})
export class TermsdialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<TermsdialogComponent>) { }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
