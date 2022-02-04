import { Clipboard } from "@angular/cdk/clipboard";
import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { Apps } from "src/app/_models/apps";
import { NotificationService } from "src/app/_services";
import { AppsService } from "src/app/_services/apps.service";
import { AddappsComponent } from "../addapps/addapps.component";
import { AddsecretkeyComponent } from "../addsecretkey/addsecretkey.component";

export interface AppDetailPage {
  triggerEditEvent: boolean;
  user: Apps;
  subscription: string;
}

@Component({
  selector: "app-appsdetailpage",
  templateUrl: "./appsdetailpage.component.html",
  styleUrls: ["./appsdetailpage.component.scss"],
})
export class AppsdetailpageComponent implements OnInit {
  placeholder = true;
  userobjects = [];
  loggedInUser;
  appidcopied = false;
  securitykeycopied = false;

  constructor(
    public dialogRef: MatDialogRef<AppsdetailpageComponent>,
    public clipboard: Clipboard,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private appService: AppsService,
    private notifyService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: AppDetailPage
  ) { }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.data.triggerEditEvent = false;
    this.dialogRef.close(this.data);
  }

  copyInputMessage(inputElement, item): void {
    if (item == "appid") {
      this.appidcopied = true;
      setTimeout(() => (this.appidcopied = false), 2000);
    } else if (item == "securitykey") {
      this.securitykeycopied = true;
      setTimeout(() => (this.securitykeycopied = false), 2000);
    }
    const copyvalue = String(<HTMLSpanElement>inputElement.innerHTML);
    this.clipboard.copy(copyvalue);
    document.execCommand("copy");
    // inputElement.setSelectionRange(0, 0);
  }

  addsecretkey(element): void {
    this.snackBar.openFromComponent(AddsecretkeyComponent, {
      data: element,
    });
  }

  openEditKeyDialog(event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AddappsComponent, {
      width: "35%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, user: this.data.user, triggerEditEvent: false },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.data.user = result.user;
      }
    });
  }

  getUserApps(): void {
    this.appService
      .getappsdetail(this.loggedInUser.id)
      .subscribe((response) => {
        if (response.length > 0) {
          this.userobjects = response;
        }
        this.placeholder = false;
      });
  }

  removeAppFromList(id): void {
    this.userobjects.forEach((element) => {
      if (element.id == id) {
        this.userobjects.splice(this.userobjects.indexOf(element), 1);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  DeleteApp(event: Event): void {
    event.stopPropagation();
    const snackbarRef = this.snackBar.openFromComponent(
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
      this.appService.deleteApp("" + this.data.user.id).subscribe(
        () => {
          this.notifyService.showSuccess(
            this.data.user.name + " has been removed successfully ",
            "Success"
          );
          this.removeAppFromList(this.data.user.id);
          // this.getUserApps();
          this.onCloseClick();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }
}
