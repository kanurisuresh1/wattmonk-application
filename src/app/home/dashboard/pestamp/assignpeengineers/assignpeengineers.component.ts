import { Component, Inject, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CometChat } from '@cometchat-pro/chat';
import { Observable } from 'rxjs';
import { FIREBASE_DB_CONSTANTS, ROLES } from 'src/app/_helpers';
import { Pestamp, User } from 'src/app/_models';
import { AuthenticationService, DesignService, GenericService, NotificationService, PestampService } from 'src/app/_services';
export interface AssignPeEngineersFormData {
  isEditMode: boolean;
  pestamp: Pestamp;
  refreshDashboard: boolean;
  requesttype: string;
}

@Component({
  selector: "app-assignpeengineers",
  templateUrl: "./assignpeengineers.component.html",
  styleUrls: ["./assignpeengineers.component.scss"],
})
export class AssignpeengineersComponent implements OnInit {
  peengineers: User[] = [];
  selectedPeEngineer: User;
  isLoading = false;
  loggedInUser: User;
  isclientassigning = true;
  newpestamp: Observable<any>;
  newpestampRef: AngularFireObject<any>;
  newpestampcounts = 0;
  ispeengineerSelected = true;
  loadingmessage = "Save data.";
  constructor(
    public dialogRef: MatDialogRef<AssignpeengineersComponent>,
    private notifyService: NotificationService,
    private designService: DesignService,
    public genericService: GenericService,
    public pestampservice: PestampService,
    private authService: AuthenticationService,
    private db: AngularFireDatabase,
    @Inject(MAT_DIALOG_DATA) public data: AssignPeEngineersFormData
  ) {
    this.loggedInUser = authService.currentUserValue.user;

    this.newpestampRef = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + 'newpestamp');
    this.newpestamp = this.newpestampRef.valueChanges();
    this.newpestamp.subscribe(
      (res) => {

        this.newpestampcounts = res.count;
      }
      // (err) => console.log(err),
      // () => console.log('done!')
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.loggedInUser.role.id == ROLES.PESuperAdmin) {
        this.fetchPeEngineers();
      }
      else {
        this.fetchPESuperadmin();
      }
    });
  }

  onCloseClick(): void {
    this.dialogRef.close(this.data);
  }
  fetchPeEngineers(): void {
    this.designService.getPeEngineers(this.data.requesttype).subscribe(
      (response: any) => {
        this.peengineers = response;

        this.peengineers.forEach(element => {
          if (element.id == 232) {
            element.firstname = "WattMonk";
            element.lastname = "";
          }

          //Mark selected peengineer
          /*  if (this.data.pestamp.assignedto != null && this.data.pestamp.assignedto.id == element.id) {
              
             this.selectedPeEngineer = element;
             element.isDisplayed = true;
           } */
        });
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchPESuperadmin(): void {
    this.pestampservice.getPeSuperadmin().subscribe(
      (response: any) => {
        this.peengineers = response;

        this.peengineers.forEach(element => {
          if (element.id == 232) {
            element.firstname = "WattMonk";
            element.lastname = "";
          }

          //Mark selected peengineer
          /*  if (this.data.pestamp.assignedto != null && this.data.pestamp.assignedto.id == element.id) {
              
             this.selectedPeEngineer = element;
             element.isDisplayed = true;
           } */
        });
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  setSelectedAssignee(record: User, index: number): void {
    this.unselectAllDesigners();
    this.peengineers[index].isDisplayed = true;
    this.selectedPeEngineer = record;
  }

  unselectAllDesigners(): void {
    this.peengineers.forEach(element => {
      element.isDisplayed = false;
    });
  }

  assignUserToPeRequest(): void {
    if (this.selectedPeEngineer == undefined) {
      this.ispeengineerSelected = false;
    } else if (
      this.data.pestamp.assignedto != null &&
      this.data.pestamp.assignedto.id == this.selectedPeEngineer.id
    ) {
      this.notifyService.showInfo(
        "This PE stamp request has already been assigned to " +
        this.selectedPeEngineer.firstname +
        " " +
        this.selectedPeEngineer.lastname +
        ".",
        "Information"
      );
    } else {
      let pestampstarttime = new Date();
      let pestampacceptancestarttime = new Date();
      let additonalhours = 0;
      additonalhours = this.selectedPeEngineer.jobcount * 2;
      pestampstarttime.setHours(pestampstarttime.getHours() + additonalhours);
      pestampacceptancestarttime.setMinutes(
        pestampacceptancestarttime.getMinutes() + 15
      );

      let postData;

      if (this.authService.currentUserValue.user.role.id == ROLES.ContractorSuperAdmin || this.authService.currentUserValue.user.role.id == ROLES.ContractorAdmin || this.authService.currentUserValue.user.role.id == ROLES.SuccessManager || (this.authService.currentUserValue.user.role.id == ROLES.BD && this.authService.currentUserValue.user.parent.id != 232) || (this.authService.currentUserValue.user.role.id == ROLES.TeamHead && this.authService.currentUserValue.user.parent.id != 232) || this.authService.currentUserValue.user.role.id == ROLES.Master && this.authService.currentUserValue.user.parent.id != 232) {
        postData = {
          outsourcedto: this.selectedPeEngineer.id,
          isoutsourced: "true",
          status: "outsourced",
          pestampacceptancestarttime: pestampacceptancestarttime,
        };
      } else if (
        this.authService.currentUserValue.user.role.id == ROLES.SuperAdmin ||
        this.authService.currentUserValue.user.role.id == ROLES.Admin ||
        (this.authService.currentUserValue.user.role.id == ROLES.BD &&
          this.authService.currentUserValue.user.parent.id == 232) ||
        (this.authService.currentUserValue.user.role.id == ROLES.PeAdmin &&
          this.authService.currentUserValue.user.parent.id == 232) ||
        (this.authService.currentUserValue.user.role.id == ROLES.TeamHead &&
          this.authService.currentUserValue.user.parent.id == 232) ||
        this.loggedInUser.role.id == ROLES.PESuperAdmin
      ) {
        /* if (this.data.pestamp.type == 'both') {
          if (this.data.requesttype == 'electrical') {
            postData = {
              electricalassignedto: this.selectedPeEngineer.id,
              iselectricalassigned: true,
              status: "assigned",
              pestampstarttime: pestampstarttime
            };
          }
          else if (this.data.requesttype == 'structural') {
            postData = {
              structuralassignedto: this.selectedPeEngineer.id,
              isstructuralassigned: true,
              status: "assigned",
              pestampstarttime: pestampstarttime
            };
          }
        }
        else {
          postData = {
            assignedto: this.selectedPeEngineer.id,
            status: "assigned",
            pestampstarttime: pestampstarttime
          };
        } */

        if (this.loggedInUser.role.id == ROLES.PESuperAdmin) {
          postData = {
            assignedto: this.selectedPeEngineer.id,
            status: "assigned",
            pestampstarttime: pestampstarttime
          };
          this.isclientassigning = false;

          this.isLoading = true;
          this.loadingmessage = "Assigning.";
          this.designService
            .assignPestamps(
              this.data.pestamp.id,
              postData
            )
            .subscribe(
              response => {
                this.data.pestamp = response;
                this.isLoading = true;
                if (this.isclientassigning) {
                  this.newpestampRef.update({ count: this.newpestampcounts + 1 });
                  // this.companynewprelimsRef.update({ newprelims: this.companynewprelimscount + 1 });
                }
                this.isLoading = false;
                this.addUserToGroupChat();
              },
              error => {
                this.notifyService.showError(
                  error,
                  "Error"
                );
              }
            );
        }

        else {
          postData = {
            pesuperadminassignedto: this.selectedPeEngineer.id,
            status: "pesuperadminassigned",
            pestampstarttime: pestampstarttime
          };
          this.isclientassigning = false;

          this.isLoading = true;
          this.loadingmessage = "Assigning.";
          this.designService
            .assigntoPesuperadmin(
              this.data.pestamp.id,
              postData
            )
            .subscribe(
              response => {
                this.data.pestamp = response;
                this.isLoading = true;
                if (this.isclientassigning) {
                  this.newpestampRef.update({ count: this.newpestampcounts + 1 });
                  // this.companynewprelimsRef.update({ newprelims: this.companynewprelimscount + 1 });
                }
                this.isLoading = false;
                this.addUserToGroupChat();
              },
              error => {
                this.notifyService.showError(
                  error,
                  "Error"
                );
              }
            );
        }
      }
    }
  }

  addUserToGroupChat(): void {
    let GUID = this.data.pestamp.chatid;
    let userscope
    if (this.loggedInUser.role.id == ROLES.PESuperAdmin) {
      userscope = CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT;
    }
    else {
      userscope = CometChat.GROUP_MEMBER_SCOPE.ADMIN;
    }

    if (this.isclientassigning) {
      userscope = CometChat.GROUP_MEMBER_SCOPE.ADMIN;
    }
    let membersList = [
      new CometChat.GroupMember(
        "" + this.selectedPeEngineer.cometchatuid,
        userscope
      ),
    ];
    CometChat.addMembersToGroup(GUID, membersList, []).then(
      () => {

        this.isLoading = false;
        this.notifyService.showSuccess(
          "PE stamp request has been successfully assigned.",
          "Success"
        );
        this.data.refreshDashboard = true;
        this.dialogRef.close(this.data);
      },
      () => {

        this.isLoading = false;
        this.notifyService.showSuccess(
          "PE stamp request has been successfully assigned.",
          "Success"
        );
        this.data.refreshDashboard = true;
        this.dialogRef.close(this.data);
      }
    );
  }
}
