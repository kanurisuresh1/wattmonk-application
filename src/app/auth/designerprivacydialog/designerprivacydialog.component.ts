import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
@Component({
  selector: "app-designerprivacydialog",
  templateUrl: "./designerprivacydialog.component.html",
  styleUrls: ["./designerprivacydialog.component.scss"],
})
export class DesignerprivacydialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<DesignerprivacydialogComponent>) { }

  ngOnInit(): void {
    // do nothing.
  }
  onCloseClick(): void {
    this.dialogRef.close();
  }
}
