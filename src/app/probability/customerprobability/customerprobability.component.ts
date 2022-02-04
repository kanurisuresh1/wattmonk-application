import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CustomerprobabilityformComponent } from "../customerprobabilityform/customerprobabilityform.component";
import { ProbabilitydetaildialogComponent } from "../probabilitydetaildialog/probabilitydetaildialog.component";

@Component({
  selector: "app-customerprobability",
  templateUrl: "./customerprobability.component.html",
  styleUrls: ["./customerprobability.component.scss"],
})
export class CustomerprobabilityComponent implements OnInit {
  exceedlimit: boolean = false;
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.openCustomerProbabilityForm();
  }

  openCustomerProbabilityForm(): void {
    const dialogRef = this.dialog.open(CustomerprobabilityformComponent, {
      width: "40%",
      autoFocus: false,
      disableClose: true,
      height: "90%",
      // panelClass: 'white-modalbox',
      backdropClass: "blur-effect-form",
      data: {
        customer: null,
        devicecount: null,
        isEditMode: false,
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        if (res.devicecount.length > 3) {
          this.exceedlimit = true;
        } else {
          this.exceedlimit = false;
        }
        this.openProbabilityDetailDialog();
      }
    });
  }

  openProbabilityDetailDialog(): void {
    this.dialog.open(ProbabilitydetaildialogComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      panelClass: "white-modalbox",
      backdropClass: "blur-effect",
      data: {
        exceedlimit: this.exceedlimit,
      },
    });
  }
}
