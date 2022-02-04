import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { User } from "src/app/_models";
import { NotificationService } from "src/app/_services";
import { TeamService } from "src/app/_services/team.service";
export interface SalesManagerData {
  salesManager: User;
  isConfirmed: boolean;
  selectedClient: User;
}
@Component({
  selector: "app-assigndesignmanagerdialog",
  templateUrl: "./assigndesignmanagerdialog.component.html",
  styleUrls: ["./assigndesignmanagerdialog.component.scss"],
})
export class AssigndesignmanagerdialogComponent implements OnInit {
  selecteduser = new FormControl("", [Validators.required]);
  displayerror = true;
  assignsalesmanager: FormGroup;
  constructor(
    private teamService: TeamService,
    public dialog: MatDialog,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<AssigndesignmanagerdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SalesManagerData
  ) {
    this.assignsalesmanager = new FormGroup({
      selecteduser: this.selecteduser,
    });
  }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.data.isConfirmed = false;
    this.dialogRef.close(this.data);
  }

  getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "You must select a user";
    }
  }

  assignsalesManager(): void {
    if (this.assignsalesmanager.valid) {
      const postData = {
        addedby: this.selecteduser.value,
      };
      this.teamService
        .editUser(this.data.selectedClient.id, postData)
        .subscribe(() => {
          this.notificationService.showSuccess(
            "sales representative has been successfully added to sales manager team.",
            "success"
          );
          this.data.isConfirmed = true;
          this.dialogRef.close(this.data);
        });
    } else {
      this.displayerror = false;
      this.assignsalesmanager.markAllAsTouched();
    }
  }
}
