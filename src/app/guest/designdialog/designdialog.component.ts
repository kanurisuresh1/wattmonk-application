import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AddguestdesigndialogComponent } from "../addguestdesigndialog/addguestdesigndialog.component";
import { AddguestpermitdesigndialogComponent } from "../addguestpermitdesigndialog/addguestpermitdesigndialog.component";
import { AddguestproposaldialogComponent } from "../addguestproposaldialog/addguestproposaldialog.component";

@Component({
  selector: "app-designdialog",
  templateUrl: "./designdialog.component.html",
  styleUrls: ["./designdialog.component.scss"],
})
export class DesigndialogComponent implements OnInit {
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    // do nothing.
  }

  openAddDesignDialog(): void {
    const dialogRef = this.dialog.open(AddguestdesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, isDataUpdated: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }

  openAddPrelimProposalDialog(): void {
    const dialogRef = this.dialog.open(AddguestproposaldialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, isDataUpdated: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
      }
    });
  }
  openAutocadDialog(): void {
    const dialogRef = this.dialog.open(AddguestpermitdesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, isDataUpdated: false },
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }
}
