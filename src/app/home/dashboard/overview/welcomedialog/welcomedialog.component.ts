import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: "welcomedialog",
  templateUrl: "./welcomedialog.component.html",
  styleUrls: ["./welcomedialog.component.scss"],
})
export class WelcomedialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<WelcomedialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
