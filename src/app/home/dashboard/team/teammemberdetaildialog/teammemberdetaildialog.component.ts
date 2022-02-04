import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { User } from "src/app/_models";
import { GenericService, NotificationService } from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { TeamService } from "src/app/_services/team.service";

export interface TeamMemberFormData {
  user: User;
  triggerEditEvent: boolean;
}

@Component({
  selector: "app-teammemberdetaildialog",
  templateUrl: "./teammemberdetaildialog.component.html",
  styleUrls: ["./teammemberdetaildialog.component.scss"],
})
export class TeammemberdetaildialogComponent implements OnInit {
  pdfautogenerationaccess = new FormControl(false);
  userinitials = "";
  userId;
  constructor(
    public dialogRef: MatDialogRef<TeammemberdetaildialogComponent>,
    private notifyService: NotificationService,
    public genericService: GenericService,
    private teamService: TeamService,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: TeamMemberFormData
  ) { }

  ngOnInit(): void {
    // this.userinitials = this.genericService.getInitials(this.data.user.firstname, this.data.user.lastname);
    this.getUserAccess();
  }

  onCloseClick(): void {
    this.data.triggerEditEvent = false;
    this.dialogRef.close(this.data);
  }

  getUserAccess(): void {
    this.commonService
      .getUserRights(this.data.user.id)
      .subscribe((response) => {
        if (response) {
          this.pdfautogenerationaccess.patchValue(
            response[0].pdfautogeneration
          );
          this.userId = response[0].id;
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  onConfirm(): void {
    let postData = {
      pdfautogeneration: this.pdfautogenerationaccess.value,
    };
    this.commonService.saveUserRights(this.data.user.id, postData).subscribe(
      () => {
        this.notifyService.showSuccess("User Access saved ", "Success");
        this.dialogRef.close();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
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
          message:
            "Are you sure you want to remove " +
            this.data.user.firstname +
            " " +
            this.data.user.lastname +
            " from your team?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.teamService.deleteTeamUser("" + this.data.user.id).subscribe(
        () => {
          this.notifyService.showSuccess(
            this.data.user.firstname +
            " " +
            this.data.user.lastname +
            " has been removed successfully from your team.",
            "Success"
          );
          this.dialogRef.close();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }
}
