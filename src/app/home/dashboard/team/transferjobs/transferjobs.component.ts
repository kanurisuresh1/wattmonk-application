import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { User } from "src/app/_models";
import { GenericService } from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";

export interface TransferJobData {
  refreshDashboard: boolean;
  users: User[];
  EditableUser: User;
}
@Component({
  selector: "app-transferjobs",
  templateUrl: "./transferjobs.component.html",
  styleUrls: ["./transferjobs.component.scss"],
})
export class TransferjobsComponent implements OnInit {
  selectedUser: User;
  isLoading = false;
  constructor(
    public dialogRef: MatDialogRef<TransferjobsComponent>,
    public genericService: GenericService,
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: TransferJobData
  ) { }

  ngOnInit(): void {
    this.data.users.forEach((element) => {
      element.isDisplayed = false;
    });
  }

  onCloseClick(): void {
    this.dialogRef.close(this.data);
  }
  setSelectedAssignee(record: User, index: number): void {
    this.unselectAllDesigners();
    this.data.users[index].isDisplayed = true;
    this.selectedUser = record;
  }

  unselectAllDesigners(): void {
    this.data.users.forEach((element) => {
      element.isDisplayed = false;
    });
  }

  onSaveClick(): void {
    let data = {
      role: this.selectedUser.role,
      blocked: false,
    };
    this.commonService
      .transferJobToAnotherUser(
        this.data.EditableUser.id,
        this.selectedUser.id,
        data
      )
      .subscribe(() => {
        this.data.refreshDashboard = true;
        this.dialogRef.close(this.data);
      });
  }
}
