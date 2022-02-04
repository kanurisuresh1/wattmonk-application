import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationsnackbarComponent } from 'src/app/shared/confirmationsnackbar/confirmationsnackbar.component';
import { Groups } from 'src/app/_models/groups';
import { GenericService, NotificationService } from 'src/app/_services';
import { TeamService } from 'src/app/_services/team.service';

export interface TeamMemberFormData {
  user: Groups;
  triggerEditEvent: boolean;
}
@Component({
  selector: "app-groupdetaildialog",
  templateUrl: "./groupdetaildialog.component.html",
  styleUrls: ["./groupdetaildialog.component.scss"],
})
export class GroupdetaildialogComponent implements OnInit {
  userinitials = "";

  constructor(public dialogRef: MatDialogRef<GroupdetaildialogComponent>,
    private notifyService: NotificationService,
    public genericService: GenericService,
    private teamService: TeamService,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: TeamMemberFormData
  ) { }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.data.triggerEditEvent = false;
    this.dialogRef.close(this.data);
  }

  onEditClick(): void {
    this.data.triggerEditEvent = true;
    this.dialogRef.close(this.data);
  }

  onDeleteClick(): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message: "Are you sure you want to remove " + this.data.user.name,
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.teamService.deleteGroup("" + this.data.user.id).subscribe(
        () => {

          this.notifyService.showSuccess(this.data.user.name + " has been removed successfully ", "Success");
          this.data.triggerEditEvent = true;
          this.dialogRef.close(this.data);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }
}
