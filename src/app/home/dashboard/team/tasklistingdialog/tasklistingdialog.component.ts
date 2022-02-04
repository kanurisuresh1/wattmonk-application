import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BehaviorSubject } from "rxjs";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { Design, User } from "src/app/_models";
import {
  DesignService,
  GenericService,
  LoaderService,
  NotificationService,
} from "src/app/_services";
import { AssignadmindialogComponent } from "../assignadmindialog/assignadmindialog.component";

export interface ClientAdminData {
  data: User;
  isConfirmed: boolean;
}
@Component({
  selector: "app-tasklistingdialog",
  templateUrl: "./tasklistingdialog.component.html",
  styleUrls: ["./tasklistingdialog.component.scss"],
})
export class TasklistingdialogComponent implements OnInit {
  joblist = [];
  revisionJobs = 0;
  otherJobs = 0;
  isjobsavailable: boolean = false;
  oldselected: number;
  searchTerm: any;
  filterJobs: User[] = [];

  constructor(
    private designService: DesignService,
    private loaderservice: LoaderService,
    private dialog: MatDialog,
    public genericService: GenericService,
    private _snackBar: MatSnackBar,
    private notifyService: NotificationService,
    public dialogRef: MatDialogRef<AssignadmindialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientAdminData
  ) {}

  ngOnInit(): void {
    if (this.data.data.role.id == 8) {
      this.fetchDesignerJobs();
    } else if (this.data.data.role.id == 10) {
      this.fetchAnalystJobs();
    }
  }

  fetchDesignerJobs(): void {
    this.revisionJobs = 0;
    this.otherJobs = 0;
    this.joblist = [];
    // this.oldselecteddesigner = this.selectedDesigner.id
    this.designService
      .getDesignerJobs(this.data.data.id)
      .subscribe((response: any) => {
        this.isjobsavailable = true;
        this.joblist = response;
        this.joblist.forEach((element) => {
          if (element.isinrevisionstate) {
            ++this.revisionJobs;
          } else {
            ++this.otherJobs;
          }
        });
        this.filterJobs = this.joblist;
      });
  }

  fetchAnalystJobs(): void {
    this.revisionJobs = 0;
    this.otherJobs = 0;
    this.joblist = [];
    // this.oldselecteddesigner = this.selectedDesigner.id
    this.designService
      .getAnalystJobs(this.data.data.id)
      .subscribe((response: any) => {
        this.isjobsavailable = true;
        this.joblist = response;
        this.joblist.forEach((element) => {
          if (element.isinrevisionstate) {
            ++this.revisionJobs;
          } else {
            ++this.otherJobs;
          }
        });
        this.filterJobs = this.joblist;
      });
  }

  openDetailPage(design: Design): void {
    // this.activitybarClose();
    // this.listactionindex = index;
    this.loaderservice.isLoading = new BehaviorSubject<boolean>(true);
    this.fetchDesignDetails(design);
  }

  openPrelimDesignDetailDialog(design: Design): void {
    let prelimdata = null;
    let permitdata = null;
    if (design.requesttype == "permit") {
      permitdata = design;
    } else {
      prelimdata = design;
    }

    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      /* panelClass: 'white-modalbox',
       height:"98%", */
      data: {
        permit: permitdata,
        prelim: prelimdata,
        triggerEditEvent: false,
        triggerDeleteEvent: false,
        selectedtab: design.requesttype,
        triggerChatEvent: false,
        triggerActivity: false,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this._snackBar.dismiss();
    });
  }

  fetchDesignDetails(design: Design): void {
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openPrelimDesignDetailDialog(response);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onCloseClick(): void {
    // this.data.isConfirmed = false;
    this.dialogRef.close();
  }

  search(): void {
    this.revisionJobs = 0;
    this.otherJobs = 0;
    let term = this.searchTerm.toLowerCase();
    this.joblist = this.filterJobs.filter(function (tag: any) {
      let searchResult;
      let searchByName = tag.name.toLowerCase().indexOf(term) >= 0;
      // let fullname = tag.firstname + ' ' + tag.lastname;
      // let searchByFullName = fullname.toLowerCase().indexOf(term) >= 0;

      if (searchByName) {
        searchResult = searchByName;
      }
      return searchResult;
    });
    this.joblist.forEach((element) => {
      if (element.isinrevisionstate) {
        ++this.revisionJobs;
      } else {
        ++this.otherJobs;
      }
    });
  }
}
