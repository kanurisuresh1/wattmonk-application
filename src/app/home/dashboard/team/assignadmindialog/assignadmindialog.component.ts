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
export interface ClientAdminData {
  teamHead: User;
  isConfirmed: boolean;
  selectedClient: User;
}
@Component({
  selector: "app-assignadmindialog",
  templateUrl: "./assignadmindialog.component.html",
  styleUrls: ["./assignadmindialog.component.scss"],
})
export class AssignadmindialogComponent implements OnInit {
  selecteduser = new FormControl("", [Validators.required]);
  displayerror = true;
  assignAdminForm: FormGroup;
  constructor(
    private teamService: TeamService,
    public dialog: MatDialog,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<AssignadmindialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientAdminData
  ) {
    this.assignAdminForm = new FormGroup({
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

  assignAdmin(): void {
    if (this.assignAdminForm.valid) {
      let postData = {
        addedby: this.selecteduser.value
      }
      this.teamService.editUser(this.data.selectedClient.id, postData).subscribe(
        () => {
          this.notificationService.showSuccess("sales manager has been successfully added to  team.", "success")
          this.data.isConfirmed = true;
          this.dialogRef.close(this.data)


        }
      )
    }
    else {
      this.displayerror = false;
      this.assignAdminForm.markAllAsTouched();
    }
  }
}
