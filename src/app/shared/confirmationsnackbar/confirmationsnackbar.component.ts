import { Component, Inject, OnInit } from "@angular/core";
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA
} from "@angular/material/snack-bar";
import { LoaderService } from "src/app/_services";

@Component({
  selector: "app-confirmationsnackbar",
  templateUrl: "./confirmationsnackbar.component.html",
  styleUrls: ["./confirmationsnackbar.component.scss"],
})
export class ConfirmationsnackbarComponent implements OnInit {
  message: string;
  positive: string;
  negative: string;

  constructor(
    public loader: LoaderService,
    public snackBarRef: MatSnackBarRef<ConfirmationsnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) { }

  ngOnInit(): void {
    // do nothing.
  }

  actionConfirmed(): void {
    if (this.data.positive) {
      this.loader.show();
    }
    this.snackBarRef.closeWithAction();
  }
}
