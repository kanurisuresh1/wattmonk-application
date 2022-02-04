import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-privacydialog",
  templateUrl: "./privacydialog.component.html",
  styleUrls: ["./privacydialog.component.scss"],
})
export class PrivacydialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<PrivacydialogComponent>) { }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.dialogRef.close();

  }
}
