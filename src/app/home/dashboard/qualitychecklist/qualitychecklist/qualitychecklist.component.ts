import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { FIREBASE_DB_CONSTANTS } from "src/app/_helpers";
import { NotificationService } from "src/app/_services";
import { QualitylistService } from "src/app/_services/qualitylist.service";
import { AddqualitychecklistComponent } from "../addqualitychecklist/addqualitychecklist.component";
import { EditqualitychecklistComponent } from "../editqualitychecklist/editqualitychecklist.component";

@Component({
  selector: "app-qualitychecklist",
  templateUrl: "./qualitychecklist.component.html",
  styleUrls: ["./qualitychecklist.component.scss"],
})
export class QualitychecklistComponent implements OnInit {
  @ViewChild("matselect") matselect;
  searchdata: string;
  isoverviewloading = true;
  placeholder = false;
  regitemRef;
  clientid = 0;
  qualitychecklistdata = [];
  checklistfilterdata = []
  scrolling: boolean = false;
  hidesearchicon: boolean = true;
  isCheckList: boolean = false;
  limit = 15;
  skip = 0;

  links = [{ name: "Permit Checklist", value: "permit", disabled: false },
  { name: "Prelim Checklist", value: "prelim", disabled: false },
  { name: "Guidelines", value: "guidelines", disabled: false }];
  activeLink = this.links[0].value;
  clientList = [];


  constructor(
    private qualityService: QualitylistService,
    private notifyService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private db: AngularFireDatabase,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.skip = 0;
    this.getChecklistData();
    this.getClientList();
  }

  filterusers(value: string): void {
    this.qualitychecklistdata = [];
    this.checklistfilterdata.filter((item) => {
      if (item.clientname.toUpperCase().indexOf(value.toUpperCase()) == 0) {
        this.qualitychecklistdata.push(item);
      }
    });
  }
  getClientList() {
    this.qualityService.getClientlist(this.limit, this.skip).subscribe(
      response => {
        this.clientList = [...this.clientList, ...response];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showInfo(error, "Error");
      });
  }
  openAddChecklistDialog(): void {
    const dialogRef = this.dialog.open(AddqualitychecklistComponent, {
      width: "70%",
      panelClass: 'addqualtiychecklist',
      autoFocus: false,
      data: {
        clientList: this.clientList,
        ChecklistCompany: this.qualitychecklistdata,
        isEditMode: false,
        isDataUpdated: false,
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.clientList = [];
        this.activeLink = result.activeLink;
        this.qualitychecklistdata = [];
        this.isoverviewloading = true;
        this.skip = 0;
        this.getChecklistData();
        this.getClientList();
      }
    });
  }

  getChecklistData() {
    this.qualityService.getCriterialist(this.activeLink, this.limit, this.skip).subscribe((response: any) => {
      if (response.length) {
        this.placeholder = false
        this.isoverviewloading = false;
        response.map(item => {
          this.qualitychecklistdata.push(item);
        })
        this.checklistfilterdata = [...this.qualitychecklistdata];
        // console.log(this.checklistfilterdata);
        // console.log(this.qualitychecklistdata);
        // console.log(response);
      }
      else {
        // this.qualitychecklistdata = response
        if (!this.checklistfilterdata.length) {
          this.isoverviewloading = false
          this.placeholder = true;
        }
        this.changeDetectorRef.detectChanges()
      }
      this.scrolling = false;
    },
      (error) => {
        this.notifyService.showInfo(error, "Error");
      }
    );
  }

  editClientCheckList(user): void {
    const dialogRef = this.dialog.open(EditqualitychecklistComponent, {
      width: "70%",
      data: { user: user, isEditMode: false, isDataUpdated: false, type: this.activeLink },
      disableClose: true
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result.isDataUpdated) {
        this.qualitychecklistdata = [];
        this.clientList = [];
        this.isoverviewloading = true;
        this.skip = 0;
        this.getChecklistData();
        this.getClientList();
      }
    });
  }

  deleteClientCheckList(checklistId, userName, clientid): void {
    this.clientid = clientid;
    const snackbarRef = this.snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message: "Are you sure you want to delete this " + userName,
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.qualityService.deleteChecklist(checklistId).subscribe(
        () => {
          this.regitemRef = this.db.object(
            FIREBASE_DB_CONSTANTS.KEYWORD + this.clientid
          );
          // regitemRef.set({ checklistupdated :false});
          this.regitemRef.update({ checklistupdated: true });
          setTimeout(() => {
            this.regitemRef.update({ checklistupdated: false });
          }, 2000);
          this.clientid = 0;
          //this.notifyService.showSuccess(userName + " has been deleted successfully ", "Success");
          if (this.activeLink == 'permit' || this.activeLink == 'prelim') {
            this.notifyService.showSuccess(this.activeLink + " checklist has been deleted successfully", "Success")
          }
          if (this.activeLink == 'guidelines') {
            this.notifyService.showSuccess(this.activeLink + " has been deleted successfully", "Success")
          }
          this.skip = 0;
          this.qualitychecklistdata = [];
          this.clientList = [];
          this.checklistfilterdata.length = 0;
          this.getChecklistData();
          this.getClientList();
        },
        (error) => {
          this.notifyService.showInfo(error, "Error");
        }
      );
    });
  }

  onTabChange(link) {
    this.skip = 0;
    this.checklistfilterdata.length = 0
    this.qualitychecklistdata = []
    this.activeLink = link.value;
    this.getChecklistData();
    this.isoverviewloading = true;
  }

  onScroll() {
    this.scrolling = true
    this.skip += 15;
    this.getChecklistData();
  }
}
