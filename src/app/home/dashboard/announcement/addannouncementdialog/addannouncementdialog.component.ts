import {
  Component,
  Inject,
  OnInit,
  ViewContainerRef
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { allSserListmodalClass } from "src/app/_models/allUserList";
import { Announcement } from "src/app/_models/announcement";
import { LoaderService, NotificationService } from "src/app/_services";
import { announcementservice } from "src/app/_services/announcement.service";

export interface announcementFormData {
  triggerEditEvent: boolean;
  isEditMode: boolean;
  isDataUpdated: boolean;
  announcement: Announcement;
}

@Component({
  selector: "app-addannouncementdialog",
  templateUrl: "./addannouncementdialog.component.html",
  styleUrls: ["./addannouncementdialog.component.scss"],
})
export class AddannouncementdialogComponent implements OnInit {
  isLoading = false;
  loadingmessage = "Saving data";
  colorcode = "#1a800a";
  textcolor = "#000000";
  displayerror = true;

  userdropdown = false;
  groupdropdown = false;

  usetypeselectdropdwon = [
    { value: "allusers", viewValue: "All Users" },
    { value: "specificusers", viewValue: "Specific Users" },
    { value: "clients", viewValue: "Clients" },
    { value: "clientadmins", viewValue: "Client Admins" },
    { value: "wattmonkadmins", viewValue: "Wattmonk Admins" },
    { value: "teamheads", viewValue: "Team Heads" },
    { value: "masters", viewValue: "Masters" },
    { value: "designmanagers", viewValue: "Design Managers" },
    { value: "designers", viewValue: "Designers" },
    { value: "analyst", viewValue: "Analyst" },
    { value: "surveyors", viewValue: "Surveyors" },
    { value: "peengineers", viewValue: "PE Engineers" },
    { value: "usergroup", viewValue: "User Group" },
  ];

  allUserList: allSserListmodalClass[];
  UsersGroupList = [];

  type = new FormControl("", [Validators.required]);
  announcement = new FormControl("", [
    Validators.required,
    Validators.maxLength(500),
  ]);
  status = new FormControl("", [Validators.required]);
  usertype = new FormControl("", [Validators.required]);
  users = new FormControl("");
  usergroup = new FormControl("");

  addAnnouncementDialogForm: FormGroup;
  getannouncement: any;
  getstatus: any;
  gettype: any;
  getusertype: any;
  getusergroup: any;
  getusers = [];
  getClients: boolean;
  allselectdUser: boolean;
  userError = "This field is required";

  constructor(
    public dialogRef: MatDialogRef<AddannouncementdialogComponent>,
    public vcRef: ViewContainerRef,
    // private cpService: ColorPickerService,
    private notifyService: NotificationService,
    public announcementservice: announcementservice,
    private loaderservice: LoaderService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.addAnnouncementDialogForm = new FormGroup({
      announcement: this.announcement,
      status: this.status,
      type: this.type,
      usertype: this.usertype,
      usergroup: this.usergroup,
      users: this.users,
    });

    this.getstatus = "true";

    if (data.isEditMode) {
      if (data.announcement.type == "announcement") {
        this.getClients = true;
        this.getusertype = "clients";
        this.allselectdUser = false;
      } else if (data.announcement.type == "alert") {
        this.getClients = false;
        this.allselectdUser = true;
      }
      this.getannouncement = data.announcement.announcement;
      this.getstatus = data.announcement.status.toString();
      this.gettype = data.announcement.type;
      this.getusertype = data.announcement.usertype;

      if (
        data.announcement.usergroup != null ||
        data.announcement.usergroup != undefined
      ) {
        this.getusergroup = data.announcement.usergroup.id;
      }
      if (data.announcement.users?.length) {
        let usersdropdown = data.announcement.users;
        usersdropdown.forEach((ele) => {
          this.getusers.push(ele);
        });
      }

      this.colorcode = data.announcement.colorcode;
      this.textcolor = data.announcement.textcolor;
      this.getalluserslist();
      this.getUsersGrouplist();
    }
  }
  ngOnInit(): void {
    if (!this.data.isEditMode) {
      this.getalluserslist();
      this.getUsersGrouplist();
    }
  }

  public onEventLog(data: any): void {
    this.colorcode = data.color;
  }
  public chooseTextColor(data: any): void {
    this.textcolor = data.color;
  }
  saveOrEdit(): string | string {
    if (!this.data.isEditMode) return "Save";
    else return "Update";
  }

  showAnnouncementError(control: FormControl): string | string {
    // console.log(control)
    if (control.hasError("required")) {
      return "This field is required";
    } else if (this.announcement.hasError("maxlength")) {
      return "Should not exceed 500 characters";
    }
  }

  getalluserslist(): void {
    // this.loaderservice.show();
    this.announcementservice.getalluserslist().subscribe(
      (response) => {
        // this.loaderservice.hide();
        this.allUserList = response;
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getUsersGrouplist(): void {
    // this.loaderservice.show();
    this.announcementservice.getUsersGrouplist().subscribe(
      (response) => {
        // this.loaderservice.hide();
        this.UsersGroupList = response;
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  toggleSelection(change: MatCheckboxChange): void {
    if (change.checked) {
      this.users.setValue([...this.allUserList.map((item) => item.id), 0]);
    } else {
      this.users.setValue([]);
    }
  }

  isChecked(): boolean {
    return (
      this.users.value &&
      this.allUserList?.length &&
      this.users.value?.length === this.allUserList?.length
    );
  }

  isIndeterminate(): boolean {
    return (
      this.users?.value &&
      this.allUserList?.length &&
      this.users.value?.length &&
      this.users.value?.length < this.allUserList?.length
    );
  }

  onCloseClick(): void {
    this.data.triggerEditEvent = false;
    this.dialogRef.close(this.data);
  }

  selectChangeType(event): void {
    if (event.source.value == "announcement") {
      this.getClients = true;
      this.getusertype = "clients";
      this.allselectdUser = false;
    } else if (event.source.value == "alert") {
      this.getClients = false;
      this.allselectdUser = true;
    }
  }

  selectChangeUsertype(event): void {
    // this.getusers =[];
    // this.UsersGroupList = [];
    if (event.source.value == "specificusers") {
      // this.loaderservice.show();
      this.groupdropdown = false;
      this.userdropdown = true;
      this.users.setValidators([Validators.required]);
      this.users.updateValueAndValidity();
      this.usergroup.clearValidators();
      this.usergroup.updateValueAndValidity();
      // this.getalluserslist();
      // this.selectAllUsers();
    } else if (event.source.value == "usergroup") {
      // this.loaderservice.show();
      this.userdropdown = false;
      this.groupdropdown = true;
      this.users.clearValidators();
      this.users.updateValueAndValidity();
      this.usergroup.setValidators([Validators.required]);
      this.usergroup.updateValueAndValidity();
      // this.getUsersGrouplist();
    } else {
      this.users.clearValidators();
      this.users.updateValueAndValidity();
      this.usergroup.clearValidators();
      this.usergroup.updateValueAndValidity();
      this.userdropdown = false;
      this.groupdropdown = false;
      this.loaderservice.hide();
    }
  }

  onAddannouncement($ev): void {
    $ev.preventDefault();

    if (this.addAnnouncementDialogForm.valid) {
      let postUsersData;
      if (
        this.addAnnouncementDialogForm.get("usertype").value === "specificusers"
      ) {
        postUsersData = {
          announcement:
            this.addAnnouncementDialogForm.get("announcement").value,
          status: this.addAnnouncementDialogForm.get("status").value,
          type: this.addAnnouncementDialogForm.get("type").value,
          usertype: this.addAnnouncementDialogForm.get("usertype").value,
          users: this.addAnnouncementDialogForm.get("users").value,
          colorcode: this.colorcode,
          textcolor: this.textcolor,
        };
      } else if (
        this.addAnnouncementDialogForm.get("usertype").value === "usergroup"
      ) {
        postUsersData = {
          announcement:
            this.addAnnouncementDialogForm.get("announcement").value,
          status: this.addAnnouncementDialogForm.get("status").value,
          type: this.addAnnouncementDialogForm.get("type").value,
          usertype: this.addAnnouncementDialogForm.get("usertype").value,
          usergroup: this.addAnnouncementDialogForm.get("usergroup").value,
          colorcode: this.colorcode,
          textcolor: this.textcolor,
        };
      } else {
        postUsersData = {
          announcement:
            this.addAnnouncementDialogForm.get("announcement").value,
          status: this.addAnnouncementDialogForm.get("status").value,
          type: this.addAnnouncementDialogForm.get("type").value,
          usertype: this.addAnnouncementDialogForm.get("usertype").value,
          colorcode: this.colorcode,
          textcolor: this.textcolor,
        };
      }

      if (this.data.isEditMode) {
        this.loaderservice.show();
        let announcemettype =
          this.addAnnouncementDialogForm.get("type").value == "alert"
            ? "Notice"
            : this.addAnnouncementDialogForm.get("type").value == "announcement"
              ? "Broadcast"
              : this.addAnnouncementDialogForm.get("type").value;
        this.announcementservice
          .editAnnouncement(this.data.announcement.id, postUsersData)
          .subscribe(
            () => {
              this.notifyService.showSuccess(
                announcemettype.charAt(0).toUpperCase() +
                announcemettype.slice(1) +
                " has been updated successfully.",
                "Success"
              );
              this.isLoading = false;
              this.data.triggerEditEvent = true;
              this.data.isDataUpdated = true;
              this.dialogRef.close(this.data);
            },
            (error) => {
              this.notifyService.showError(error, "Error");
            }
          );
      } else {
        this.loaderservice.show();
        let announcemettype =
          this.addAnnouncementDialogForm.get("type").value == "alert"
            ? "Notice"
            : this.addAnnouncementDialogForm.get("type").value == "announcement"
              ? "Broadcast"
              : this.addAnnouncementDialogForm.get("type").value;

        this.announcementservice.addannouncement(postUsersData).subscribe(
          () => {
            this.loaderservice.hide();
            this.notifyService.showSuccess(
              announcemettype.charAt(0).toUpperCase() +
              announcemettype.slice(1) +
              " has been added successfully.",
              "Success"
            );
            this.data.triggerEditEvent = true;
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      }
    } else {
      this.displayerror = false;
      this.addAnnouncementDialogForm.markAllAsTouched();
      this.addAnnouncementDialogForm.markAsDirty();
    }
  }
}
