import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";


@Component({
  selector: "app-designer-termsdialogog",
  templateUrl: "./designer-termsdialogog.component.html",
  styleUrls: ["./designer-termsdialogog.component.scss"],
})
export class DesignerTermsdialogogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<DesignerTermsdialogogComponent>) { }

  ngOnInit(): void {
    // do nothing.
  }
  onCloseClick(): void {
    this.dialogRef.close();
  }
}
