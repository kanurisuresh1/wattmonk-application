import {
  HttpClient,
  HttpHeaders
} from "@angular/common/http";
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseUrl } from 'src/app/_helpers';
import { Design, User } from 'src/app/_models';
import { AuthenticationService } from 'src/app/_services';
import { NotificationService } from 'src/app/_services/notification.service';
import { TeamService } from "src/app/_services/team.service";
export interface ShareDesignFrom {
  isEditMode: boolean;
  design: Design;
  refreshDashboard: boolean;
}
@Component({
  selector: "app-shareprelimdesigndialog",
  templateUrl: "./shareprelimdesigndialog.component.html",
  styleUrls: ["./shareprelimdesigndialog.component.scss"],
})
export class ShareprelimdesigndialogComponent implements OnInit {
  example: any = [];
  teamMember: User[] = [];
  TeamData: any = [];
  headers: HttpHeaders;
  bodyData: any = [];
  selectedEmails: any = [];
  resp: any = [];
  emailArray;
  attachdesignfile = true;
  isLoading = false;
  loadingmessage = "Save data.";
  constructor(
    public dialogRef: MatDialogRef<ShareDesignFrom>,
    @Inject(MAT_DIALOG_DATA) public data: ShareDesignFrom,
    private teamService: TeamService,
    private http: HttpClient,
    private authService: AuthenticationService,
    private notifyService: NotificationService) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + this.authService.currentUserValue.jwt,
    });
  }

  ngOnInit(): void {
    this.teamService.getTeamData().subscribe((response) => {
      this.teamMember = response;
      this.example = response;
      this.example.push(this.data.design);
      this.TeamData = this.example;
    });
  }
  onCloseClick(): void {
    this.dialogRef.close(this.data);
  }
  selectAll(event): void {
    const checked = event.target.checked;
    this.TeamData.forEach((item) => (item.checked = checked));
  }

  SendMail() {
  const emails = (document.getElementById("inputemails") as HTMLInputElement)
      .value;
    this.emailArray = emails.split(",");
    if (emails.length > 0) {
      this.emailArray.forEach((element) => {
        this.selectedEmails.push(element);
      });
    }

    this.bodyData = this.TeamData.filter((item) => item.checked);
    this.bodyData.forEach((element) => {
      this.selectedEmails.push(element.email);
    });
    this.selectedEmails.push();

    let body = {
      emails: this.selectedEmails,
      id: this.data.design.id,
      attachfile: this.attachdesignfile,
    };
    this.isLoading = true;
    this.loadingmessage = "Save data.";
    return this.http.post(BaseUrl + "designs/send-prelim-design",
      body,
      {
        headers: this.headers
      }).subscribe((response) => {
        this.resp = response
        if (this.resp.status == 'success') {
          this.notifyService.showSuccess("Email Sent  Successfully", "Success")
          this.dialogRef.close();
          this.isLoading = false;
        }

      },
        () => {
          this.isLoading = false;
          this.notifyService.showError(
            "Something went wrong. Please try again.",
            "error"
          );
        }
      );
  }
}
