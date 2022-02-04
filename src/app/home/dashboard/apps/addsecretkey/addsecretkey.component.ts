import { Component, OnInit } from "@angular/core";
import { MatSnackBarRef } from "@angular/material/snack-bar";

@Component({
  selector: "app-addsecretkey",
  templateUrl: "./addsecretkey.component.html",
  styleUrls: ["./addsecretkey.component.scss"],
})
export class AddsecretkeyComponent implements OnInit {
  constructor(public snackbarRef: MatSnackBarRef<AddsecretkeyComponent>) { }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.snackbarRef.dismiss();
  }
}
