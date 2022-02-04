import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AuthenticationService } from "src/app/_services";
import { AppsService } from "src/app/_services/apps.service";
import { AddappsComponent } from "../addapps/addapps.component";
import { AppsdetailpageComponent } from "../appsdetailpage/appsdetailpage.component";

@Component({
  selector: "app-apps",
  templateUrl: "./apps.component.html",
  styleUrls: ["./apps.component.scss"],
})
export class AppsComponent implements OnInit {
  placeholder = true;
  userobjects = [];
  loggedInUser;

  constructor(
    public dialog: MatDialog,
    private appService: AppsService,
    private authService: AuthenticationService
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
  }

  ngOnInit(): void {
    this.getUserApps();
  }

  openAddNewAppDialog(): void {
    const dialogRef = this.dialog.open(AddappsComponent, {
      width: "40%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.getUserApps();
      }
    });
  }

  openAppDetailPageDialog(element, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AppsdetailpageComponent, {
      width: "100%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, user: element },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result.triggerEditEvent) {
        this.getUserApps();
      }
    });
  }

  getUserApps(): void {
    this.appService
      .getappsdetail(this.loggedInUser.id)
      .subscribe((response) => {
        if (response.length) {
          this.userobjects = response;
        } else {
          this.userobjects = [];
        }
        this.placeholder = false;
      });
  }
}
