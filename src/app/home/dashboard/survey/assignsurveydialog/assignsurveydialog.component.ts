import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CometChat } from '@cometchat-pro/chat';
import { User } from 'src/app/_models';
import { Survey } from 'src/app/_models/survey';
import { GenericService, NotificationService } from 'src/app/_services';
import { SurveyService } from 'src/app/_services/survey.service';

export interface AssignSurveyFormData {
  isEditMode: boolean;
  isDataUpdated: boolean;
  survey: Survey;
  refreshDashboard: boolean;
}

@Component({
  selector: "app-assignsurveydialog",
  templateUrl: "./assignsurveydialog.component.html",
  styleUrls: ["./assignsurveydialog.component.scss"],
})
export class AssignsurveydialogComponent implements OnInit {
  surveyors: User[] = [];
  selectedSurveyor: User;
  isclientassigning = true;
  issurveyorselected = true;
  isLoading = false;
  loadingmessage = "Save data.";

  constructor(public dialogRef: MatDialogRef<AssignsurveydialogComponent>,
    private notifyService: NotificationService,
    private surveyService: SurveyService,
    public genericService: GenericService,
    @Inject(MAT_DIALOG_DATA) public data: AssignSurveyFormData) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.fetchSurveyors();
    });
  }

  onCloseClick(): void {
    this.dialogRef.close(this.data);
  }

  fetchSurveyors(): void {
    this.surveyService.getSurveyors().subscribe(
      (response) => {
        this.surveyors = response;
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  setSelectedAssignee(record: User, index: number): void {
    this.unselectAllSurveyors();
    this.surveyors[index].isDisplayed = true;
    this.selectedSurveyor = record;
  }

  unselectAllSurveyors(): void {
    this.surveyors.forEach((element) => {
      element.isDisplayed = false;
    });
  }

  assignUserToSurvey(): void {
    this.isLoading = true;
    this.loadingmessage = "Assigning.";
    if (this.selectedSurveyor == undefined) {
      this.issurveyorselected = false;
      this.isLoading = false;
      this.notifyService.showInfo("please select a surveyor first", "");
    } else {
      if (
        this.data.survey.assignedto != null &&
        this.data.survey.assignedto.id == this.selectedSurveyor.id
      ) {
        this.isLoading = false;
        this.notifyService.showInfo(
          "This Survey request has already been assigned to " +
          this.selectedSurveyor.firstname +
          " " +
          this.selectedSurveyor.lastname +
          ".",
          "Information"
        );
      } else {
        let postData = {};
        postData = {
          assignedto: this.selectedSurveyor.id,
          isoutsourced: "false",
          status: "assigned",
        };
        // if(this.data.survey.createdby.id == this.authService.currentUserValue.user.id){
        //   if (this.selectedSurveyor.company == this.authService.currentUserValue.user.company){
        //     postData = {
        //       assignedto: this.selectedSurveyor.id,
        //       isoutsourced : "false",
        //       status : "assigned"
        //     };
        //   }else{
        //     postData = {
        //       outsourcedto: this.selectedSurveyor.id,
        //       isoutsourced : "true",
        //       status : "outsourced"
        //     };
        //   }
        // }
        // else{
        //   postData = {
        //     assignedto: this.selectedSurveyor.id,
        //     status : "assigned"
        //   };
        // }
        this.isLoading = true;
        this.surveyService.editSurvey(this.data.survey.id, postData).subscribe(
          (response) => {
            this.data.survey = response;
            this.notifyService.showSuccess(
              "Survey for " +
              this.data.survey.address +
              " has been successfully assigned to " +
              this.selectedSurveyor.firstname +
              " " +
              this.selectedSurveyor.lastname +
              ".",
              "Success"
            );
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
            this.addUserToGroupChat();
            this.isLoading = false;
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      }
    }
  }
  addUserToGroupChat(): void {
    let GUID = this.data.survey.chatid;
    let userscope = CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT;
    if (this.isclientassigning) {
      userscope = CometChat.GROUP_MEMBER_SCOPE.ADMIN;
    }
    let membersList = [
      new CometChat.GroupMember(
        "" + this.selectedSurveyor.cometchatuid,
        userscope
      ),
    ];
    CometChat.addMembersToGroup(GUID, membersList, []).then(
    );
  }
}
