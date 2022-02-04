import { HttpHeaders } from "@angular/common/http";
import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import { ClientRole } from "src/app/_models/clientrole";
import {
  AuthenticationService,
  ContractorService, GenericService, LoaderService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { ContractorpricingComponent } from "../contractorpricing/contractorpricing.component";

export interface ContractorDetailData {
  user: User;
  subscription: string;
  triggerEditEvent: boolean;
  userblocked: boolean;
  userUnblocked: boolean;
}

export interface Overview {
  roleName: string;
  roleCount: number;
  active: boolean;
}

@Component({
  selector: "app-contractordetaildialog",
  templateUrl: "./contractordetaildialog.component.html",
  styleUrls: ["./contractordetaildialog.component.scss"],
})
export class ContractordetaildialogComponent implements OnInit {
  isdetailloading = true;
  headers: HttpHeaders;
  formheaders: HttpHeaders;
  isExtend = false;
  initials = "";
  id = "";
  displayexpirydate = "";
  displaynextreminderdate = "";
  jobcount: any = {};
  isloading = false;
  clientDetail: any = [];
  isteamdetailsloading = false;
  teammemberslist = [];
  filteredTeammembers = [];
  clients: User[] = [];
  placeholder = false;
  detailtitle = "All Members";
  selectedoveriewsection = "";
  teamMembers: User[] = [];
  seviceEdited = false;

  admins = 0;
  bds = 0;
  masters = 0;
  designers = 0;
  surveyors = 0;
  analysts = 0;
  peengineer = 0;
  teamheads = 0;

  overviewData: Overview[] = [];

  mytype = "ColumnChart";
  mydata = [
    [" Assessments", 0],
    ["Prelim", 0],
    ["Surveys", 0],
    ["Permit", 0],
    ["PE Stamps", 0],
  ];
  columnNames = ["Browser", "Percentage"];
  options = {
    colors: ["#E0440E"],
    is3D: true,
  };
  width = 650;
  height = 400;

  clientNoticeMessage = { active: 0, data: [] };
  noticeMessageEdit = false;
  selectedNoticeEdit: number;
  selectedStatus: "active" | "inactive" = "inactive";

  subject = new FormControl("", [
    Validators.maxLength(50),
    Validators.required,
    // Validators.pattern("^[a-zA-Z0-9 ]*$")
  ]);
  noticeMessage = new FormControl("", [
    Validators.maxLength(500),
    Validators.required,
    // Validators.pattern("^[a-zA-Z0-9 ]*$")
  ]);
  noticeStatus = new FormControl();
  addNoticeForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ContractordetaildialogComponent>,
    public dialog: MatDialog,
    private notifyService: NotificationService,
    public genericService: GenericService,
    private contractorService: ContractorService,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthenticationService,
    private commonservice: CommonService,
    public loader: LoaderService,
    @Inject(MAT_DIALOG_DATA) public data: ContractorDetailData
  ) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + this.authService.currentUserValue.jwt,
    });

    this.addNoticeForm = new FormGroup({
      subject: this.subject,
      noticeMessage: this.noticeMessage,
      noticeStatus: this.noticeStatus,
    });
  }

  ngOnInit(): void {
    this.getclientdetail(this.data.user.id);
    this.getNotices();
    // this.initials = this.genericService.getCompanyInitials(this.data.user.company);
    // this.displayexpirydate = this.genericService.formatDateInDisplayFormat(this.data.user.contractorsubscription.expirydate);
    // this.displaynextreminderdate = this.genericService.formatDateInDisplayFormat(this.data.user.contractorsubscription.nextreminderdate);

    // this.http.get(BaseUrl+'userdesigns/status-count?id='+this.data.user.id,
    // {
    //   headers:this.headers
    // }).subscribe((data)=>{
    //   this.jobcount=data;
    //   this.isloading = true;
    // })
  }
  /* error messages - Ritik [start] */
  getSubjectErrorMessage(): string | string {
    if (this.subject.hasError("maxlength")) {
      return "Subject can't exceed 50 characters";
    } else if (this.subject.hasError("required")) {
      return "This field is required";
    }
  }
  getMessageErrorMessage(): string | string {
    if (this.noticeMessage.hasError("maxlength")) {
      return "Message can't exceed 500 characters";
    } else if (this.noticeMessage.hasError("required")) {
      return "This field is required";
    }
  }
  /* error messages - Ritik [end] */
  onCloseClick(): void {
    if (this.seviceEdited) {
      this.data.triggerEditEvent = true;
    } else {
      this.data.triggerEditEvent = false;
    }
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
          message:
            "Are you sure you want to remove " +
            this.data.user.firstname +
            " " +
            this.data.user.lastname +
            " as your client?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.contractorService.deleteContractor("" + this.data.user.id).subscribe(
        () => {
          this.notifyService.showSuccess(
            this.data.user.firstname +
            " " +
            this.data.user.lastname +
            " has been removed successfully.",
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

  blockContractor(data: User, event: Event): void {
    event.stopPropagation();
    const blockstatus = !data.blocked;
    let message;

    if (blockstatus == false) {
      message = "Are you sure you want to unblock the user ";
    } else {
      message = "Are you sure you want to block the user ";
    }
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message:
            message +
            this.data.user.firstname.toUpperCase() +
            " " +
            this.data.user.lastname.toUpperCase() +
            " ?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      const postData = {
        blocked: blockstatus,
      };

      this.contractorService
        .editContractor(
          this.data.user.id,
          postData
          // { blocked: true }
        )
        .subscribe(
          () => {
            //  this.blockContractorSubscription();
            if (blockstatus) {
              this.notifyService.showSuccess(
                "Client has been blocked successfully.",
                "Success"
              );
              this.data.userblocked = true;
              this.data.triggerEditEvent = false;
              this.dialogRef.close(this.data);
            } else {
              this.notifyService.showSuccess(
                "Client has been activated successfully.",
                "Success"
              );
              this.data.userUnblocked = true;
              this.data.triggerEditEvent = false;
              this.dialogRef.close(this.data);
            }

            this.changeDetectorRef.detectChanges();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    });
  }
  getclientdetail(userId): void {
    this.contractorService.getClientData(userId).subscribe(
      (response) => {
        this.isdetailloading = false;
        this.clientDetail = response[0];
        this.teammemberslist = this.clientDetail.teammember;
        this.isteamdetailsloading = true;
        this.changeDetectorRef.detectChanges();
        this.mydata = [
          [" Assessments", Number(this.clientDetail.siteassessment)],
          ["Prelim", Number(this.clientDetail.prelimcount)],
          ["Surveys", Number(this.clientDetail.surveycount)],
          ["Permit", Number(this.clientDetail.permitcount)],
          ["PE Stamps", Number(this.clientDetail.pestampcount)],
        ];
        this.getClientRoles();
        this.filteredTeammembers = this.teammemberslist;
      },
      () => {
        // do nothing.
      }
    );
  }

  overviewClient: ClientRole[];

  getClientRoles(): void {
    this.commonservice
      .getClientRoles(this.data.user.id, this.data.user.role.id)
      .subscribe((response) => {
        if (response.length == 0) {
          this.commonservice
            .getDefaultClientRoles(this.data.user.role.id)
            .subscribe((response) => {
              this.overviewClient = response;
              this.constructOverviewData(this.teammemberslist);
            });
        } else {
          this.overviewClient = response;
          this.constructOverviewData(this.teammemberslist);
        }
      });
  }

  constructOverviewData(data): void {
    data.forEach((element) => {
      switch (element.role.id) {
        case ROLES.ContractorAdmin:
          this.admins = this.admins + 1;
          break;
        case ROLES.ContractorSuperAdmin:
          this.admins = this.admins + 1;
          break;
        case ROLES.SuccessManager:
          this.admins = this.admins + 1;
          break;
        case ROLES.Admin:
          this.admins = this.admins + 1;
          break;
        case ROLES.BD:
          this.bds = this.bds + 1;
          break;
        case ROLES.Master:
          this.masters = this.masters + 1;
          break;
        case ROLES.TeamHead:
          this.teamheads = this.teamheads + 1;
          break;
        case ROLES.Designer:
          this.designers = this.designers + 1;
          break;
        case ROLES.Surveyor:
          this.surveyors = this.surveyors + 1;
          break;
        case ROLES.Analyst:
          this.analysts = this.analysts + 1;
          break;
        case ROLES.Peengineer:
          this.peengineer = this.peengineer + 1;
          break;
      }
    });
    this.overviewData = [];
    this.overviewClient.forEach((element) => {
      let roleCount;
      switch (element.displayname) {
        case "Admin":
          roleCount = this.admins;
          break;
        case "Design Manager":
          roleCount = this.bds;
          break;
        case "BD":
          roleCount = this.bds;
          break;
        case "Sales Manager":
          roleCount = this.bds;
          break;
        case "Master":
          roleCount = this.masters;
          break;
        case "Team Head":
          roleCount = this.teamheads;
          break;
        case "Designer":
          roleCount = this.designers;
          break;
        case "Surveyor":
          roleCount = this.surveyors;
          break;
        case "Sales Representative":
          roleCount = this.surveyors;
          break;
        case "Analyst":
          roleCount = this.analysts;
          break;
        case "PE Engineer":
          roleCount = this.peengineer;
          break;
        case "Master Electrician":
          roleCount = this.masters;
          break;
      }
      this.overviewData.push({
        roleName: element.displayname,
        roleCount: roleCount,
        active: false,
      });
    });
    let AllOverviewCount = 0;
    this.overviewData.forEach((element) => {
      AllOverviewCount += element.roleCount;
    });
    this.overviewData.push({
      roleName: "All",
      roleCount: AllOverviewCount,
      active: true,
    });
  }

  overviewFilter(filterValue: string, index): void {
    for (let i = 0; i < this.overviewData.length; i++) {
      if (i === index) {
        this.overviewData[i].active = true;
      } else {
        this.overviewData[i].active = false;
      }
    }
    this.detailtitle = filterValue;
    if (filterValue == "All") {
      filterValue = "";
      this.detailtitle = "All members";
    }

    this.selectedoveriewsection = filterValue;
    filterValue = filterValue.trim().toLowerCase();
    this.teammemberslist = [];
    this.filteredTeammembers.filter((item) => {
      if (item.role.displayname.toLowerCase().indexOf(filterValue) >= 0) {
        this.teammemberslist.push(item);
      }
    });
  }

  openClientpricedialog(element): void {
    const triggerEditEvent = false;
    const dialogRef = this.dialog.open(ContractorpricingComponent, {
      width: "35%",
      autoFocus: false,
      disableClose: true,
      data: { user: element, triggerEditEvent: triggerEditEvent },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.data.user = result.user;
        this.seviceEdited = true;
      }
    });
  }

  blockContractorSubscription(): void {
    // this.contractorService
    //       .editContractorSubscription(
    //         this.data.user.contractorsubscription.id,
    //         {isblocked:true}
    //       )
    //       .subscribe(
    //         response => {
    //           this.notifyService.showSuccess("Client has been blocked successfully.", "Success");
    //           this.dialogRef.close();
    //         },
    //         error => {
    //           this.notifyService.showError(
    //             error,
    //             "Error"
    //           );
    //         }
    //       );
  }

  updateSubscriptionExpiryDate(): void {
    // const snackbarRef = this._snackBar.openFromComponent(ConfirmationsnackbarComponent, {
    //   data: {"message":"Are you sure you want to extend the valid period to " + this.genericService.formatDateInDisplayFormat(this.selectedExpiryDate), "positive" : "Yes", "negative" : "No"}
    // });
    // snackbarRef.onAction().subscribe(() => {
    //   this.contractorService
    //       .editContractorSubscription(
    //         this.data.user.contractorsubscription.id,
    //         {expirydate:this.selectedExpiryDate}
    //       )
    //       .subscribe(
    //         response => {
    //           this.notifyService.showSuccess("Client's subscription plan has been extended successfully.", "Success");
    //           this.dialogRef.close();
    //         },
    //         error => {
    //           this.notifyService.showError(
    //             error,
    //             "Error"
    //           );
    //         }
    //       );
    // });
  }

  // geting the list of all notices for current user
  getNotices(): void {
    this.contractorService
      .getClientNotices(this.data.user.id)
      .subscribe((response) => {
        if (response.length) {
          // checking the active number of notices
          response.map((item) => {
            if (item.active) {
              this.clientNoticeMessage.active += 1;
            }
          });
          this.clientNoticeMessage.data = response;
        }
      });
  }

  /*For adding the notice with subject and Message 
  and status*/
  addNoticeMessage(): void {
    let status = null;
    let postData;
    // checking if subject and message is empty then it show error
    if (
      this.addNoticeForm.valid &&
      this.subject.value.length > 0 &&
      this.noticeMessage.value.length > 0
    ) {
      // if the active notice is more then three then not to proceed
      if (
        this.clientNoticeMessage.active < 3 ||
        this.noticeStatus.value != "active"
      ) {
        // if user not select any value or select inactive then to assign the value of active status
        if (
          this.noticeStatus.value === null ||
          this.noticeStatus.value == "inactive"
        ) {
          status = false;
        } else if (this.noticeStatus.value == "active") {
          status = true;
          this.clientNoticeMessage.active += 1;
        }

        // post data for creating the notice of that particular client
        postData = {
          subject: this.subject.value,
          message: this.noticeMessage.value,
          active: status,
          users: this.data.user.id,
        };

        this.loader.show();
        this.contractorService
          .addClientNotices(postData)
          .subscribe((response) => {
            this.loader.hide();
            this.clientNoticeMessage.data.push(response);
          });

        // reset the input fields values to default one.
        this.clearNoticeMessage();
        this.notifyService.showSuccess(
          "Notice Created successfully!",
          "Success"
        );
      } else {
        this.loader.hide();
        this.notifyService.showError(
          "Only three notice can be active at a time",
          "Error"
        );
      }
    } else {
      // this.notifyService.showError("Subject or Message can not be blank", "Error");
    }
  }

  /**For selecting the particular Notice and to update the value in fields */
  editNoticeMessage(index): void {
    this.noticeMessageEdit = true;
    this.selectedNoticeEdit = index;
    const data = this.clientNoticeMessage.data[index];
    this.subject.setValue(data.subject);
    this.noticeMessage.setValue(data.message);
    this.selectedStatus = data.active ? "active" : "inactive";
  }

  /**Saving the notices data on edit */
  updateNoticeMessage(): void {
    this.loader.show();
    let postData;
    let status;
    const defaultNoticeValue = this.clientNoticeMessage.data[
      this.selectedNoticeEdit
    ].active
      ? "active"
      : "inactive";

    if (
      this.addNoticeForm.valid &&
      (this.clientNoticeMessage.active < 3 ||
        this.noticeStatus.value == "inactive")
    ) {
      if (
        this.noticeStatus.value == "inactive" &&
        this.noticeStatus.value != defaultNoticeValue
      ) {
        status = false;
        this.clientNoticeMessage.active -= 1;
      } else if (
        this.noticeStatus.value == "active" &&
        this.noticeStatus.value != defaultNoticeValue
      ) {
        status = true;
        this.clientNoticeMessage.active += 1;
      }

      postData = {
        subject: this.subject.value,
        message: this.noticeMessage.value,
        active: status,
      };

      this.contractorService
        .updateClientNotices(
          this.clientNoticeMessage.data[this.selectedNoticeEdit].id,
          postData
        )
        .subscribe((response) => {
          this.loader.hide();
          this.clientNoticeMessage.data[this.selectedNoticeEdit] = response;

          //reset all the fields
          this.clearNoticeMessage();
          this.notifyService.showSuccess(
            "Notice Updated successfully!",
            "Success"
          );
        });
    } else {
      this.loader.hide();
      // this.addNoticeForm.valid ? (this.clientNoticeMessage.active < 3 ? this.notifyService.showError("Only three notice can be active at a time", "Error") : null) : null;

      if (this.addNoticeForm.valid && this.clientNoticeMessage.active < 3) {
        this.notifyService.showError(
          "Only three notice can be active at a time",
          "Error"
        );
      }
    }
  }

  deleteNoticeMessage(index): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message: "Are you sure you want to delete this notice? ",
          positive: "Yes",
          negative: "No",
        },
      }
    );
    snackbarRef.onAction().subscribe(() => {
      this.contractorService
        .deleteClientNotices(this.clientNoticeMessage.data[index].id)
        .subscribe(() => {
          if (this.clientNoticeMessage.data[index].active) {
            this.clientNoticeMessage.active -= 1;
          }
          this.clientNoticeMessage.data.splice(index, 1);
          this.clearNoticeMessage();
          this.loader.hide();
          this.notifyService.showSuccess(
            "Notice deleted successfully!",
            "Success"
          );
          // this.dialogRef.close();
        });
    });
  }

  clearNoticeMessage(): void {
    this.noticeMessageEdit = false;
    this.selectedStatus = "inactive";

    this.subject.setValue("");
    this.noticeMessage.setValue("");

    this.subject.setErrors(null);
    this.noticeMessage.setErrors(null);
  }
}
