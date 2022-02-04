import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { Announcement } from "src/app/_models/announcement";
import { LoaderService, NotificationService } from "src/app/_services";
import { announcementservice } from "src/app/_services/announcement.service";
import { AddannouncementdialogComponent } from "../addannouncementdialog/addannouncementdialog.component";
@Component({
  selector: "app-announcement",
  templateUrl: "./announcement.component.html",
  styleUrls: ["./announcement.component.scss"],
})
export class AnnouncementComponent implements OnInit {
  displayedColumns: string[] = [
    "Type",
    "Description",
    "status",
    "Colorcode",
    "Text Color",
    "Action",
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  announce: string;
  status: boolean;
  colorcode: any;
  textcolor: any;

  dataSourcenew = [];
  allAnnouncement = [];
  filterstart = 0;
  isLoading = true;
  limit = 10;
  scrolling = false;
  placeholder = false;
  tableColumns = ["Broadcast", "status", "Colorcode", "Text Color", "Action"];
  constructor(
    public dialog: MatDialog,
    public announcement: announcementservice,
    private changeDetectorRef: ChangeDetectorRef,
    private notifyService: NotificationService,
    private loaderservice: LoaderService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getAllannouncement();
  }

  openAddannouncementDialog(): void {
    const dialogRef = this.dialog.open(AddannouncementdialogComponent, {
      width: "60%",
      height: "65%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, status: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.isLoading = true;
        this.filterstart = 0;
        this.limit = 10;
        this.allAnnouncement = [];
        this.dataSourcenew = [];
        this.getAllannouncement();
      }
    });
  }

  openEditAnnouncement(announcement: Announcement): void {
    this._snackBar.dismiss();

    const dialogRef = this.dialog.open(AddannouncementdialogComponent, {
      width: "60%",
      height: "65%",
      autoFocus: false,
      disableClose: true,
      data: {
        isEditMode: true,
        announcement: announcement,
        triggerEditEvent: false,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.isLoading = true;
        this.filterstart = 0;
        this.limit = 10;
        this.allAnnouncement = [];
        this.dataSourcenew = [];
        this.getAllannouncement();
      }
    });
  }

  getAllannouncement(): void {
    // this.loaderservice.show();
    const searchdata =
      "announcements?_limit=" +
      this.limit +
      "&_start=" +
      this.filterstart +
      "&_sort=id:DESC";
    this.announcement.getannouncement(searchdata).subscribe(
      (response) => {
        this.scrolling = false;
        // this.loaderservice.hide();
        this.isLoading = false;

        if (response.length > 0) {
          this.placeholder = false;
          response.map((item) => {
            if (item.status == true) {
              item.status_type = "Active";
            } else {
              item.status_type = "Inactive";
            }
            this.dataSourcenew.push(item);
          });
          this.allAnnouncement = [...this.dataSourcenew];
          this.changeDetectorRef.detectChanges();
        } else {
          if (!this.allAnnouncement.length) {
            this.placeholder = true;
          }
          this.changeDetectorRef.detectChanges();
        }
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onTablescroll(): void {
    this.filterstart += 10;
    this.scrolling = true;
    this.getAllannouncement();
  }

  deleteAnnouncement(element): void {
    // this.loaderservice.show();
    const type = element.type == "alert" ? "Notice" : "Broadcast";
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message: "Are you sure you want to delete this " + type + " ?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.loaderservice.hide();
      this.isLoading = true;
      this.filterstart = 0;
      this.limit = 10;
      this.allAnnouncement = [];
      this.dataSourcenew = [];

      this.announcement.deleteAnnouncement(element.id).subscribe(
        () => {
          this.loaderservice.hide();
          // let type = element.type=='alert' ? 'Notice' : 'Broadcast';
          this.notifyService.showSuccess(
            type + " deleted successfully.",
            "Success"
          );
          this.getAllannouncement();
        },
        (error) => {
          this.loaderservice.hide();
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }
}
