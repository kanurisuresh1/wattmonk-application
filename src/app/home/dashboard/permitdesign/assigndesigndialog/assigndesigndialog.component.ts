import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CometChat } from "@cometchat-pro/chat";
import { BehaviorSubject, Observable } from "rxjs";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { FIREBASE_DB_CONSTANTS, ROLES } from "src/app/_helpers";
import { Design, User } from "src/app/_models";
import {
  AuthenticationService, DesignService,
  GenericService, LoaderService, NotificationService
} from "src/app/_services";

export interface AssignDesignFormData {
  isEditMode: boolean;
  design: Design;
  refreshDashboard: boolean;
}

@Component({
  selector: 'app-assigndesigndialog',
  templateUrl: './assigndesigndialog.component.html',
  styleUrls: ['./assigndesigndialog.component.scss']
})
export class AssigndesigndialogComponent implements OnInit {

  items = Array.from({ length: 100 }).map((_, i) => `Item #${i}`);
  searchTerm: any;

  designers: User[] = [];
  filterDesigner: User[] = [];
  selectedDesigner: User;
  isLoading = false;
  loggedInUser: User;
  isclientassigning = true;

  newpermits: Observable<any>;
  newpermitsRef: AngularFireObject<any>;
  newpermitscount = 0;

  companynewpermits: Observable<any>;
  companynewpermitsRef: AngularFireObject<any>;
  companynewpermitscount = 0;
  isDesignerSelected = true;
  designerjoblist = [];
  revisionJobs = 0;
  otherJobs = 0;
  isdesignerjobsavailable: boolean = false;
  oldselecteddesigner: number;
  loadingmessage = "Save data.";

  constructor(public dialogRef: MatDialogRef<AssigndesigndialogComponent>,
    private notifyService: NotificationService,
    private designService: DesignService,
    public genericService: GenericService,
    private authService: AuthenticationService,
    private db: AngularFireDatabase,
    private loaderservice: LoaderService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: AssignDesignFormData) {
    this.loggedInUser = authService.currentUserValue.user;
    this.newpermitsRef = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + 'newpermitdesigns');
    this.newpermits = this.newpermitsRef.valueChanges();
    this.newpermits.subscribe(
      (res) => {

        this.newpermitscount = res.count;
      },
      // (err) => console.log(err), 
      // () => console.log('done!') 
    )

    this.companynewpermitsRef = db.object(FIREBASE_DB_CONSTANTS.KEYWORD + this.loggedInUser.parent.id);
    this.companynewpermits = this.companynewpermitsRef.valueChanges();
    this.companynewpermits.subscribe(
      (res) => {

        this.companynewpermitscount = res.newpermits;
      },
      // (err) => console.log(err), 
      // () => console.log('done!') 
    )
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.fetchDesigners(this.data.design.creatorparentid);
    });
  }

  onCloseClick(): void {
    this.dialogRef.close(this.data);
  }

  fetchDesigners(clientid): void {
    this.designService.getDesigners(clientid).subscribe(
      (response: any) => {
        this.designers = response;

        this.designers.forEach(element => {
          if (element.id == 232) {
            element.firstname = "WattMonk"
            element.lastname = ""
          }
          //Mark selected designer 
          if (this.data.design.designassignedto != null && this.data.design.designassignedto.id == element.id) {
            this.selectedDesigner = element;
            element.isDisplayed = true;
            this.fetchDesignerJobs();
          }
        });
        this.filterDesigner = this.designers;
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  setSelectedAssignee(record: User, index: number): void {
    this.unselectAllDesigners();
    this.designers[index].isDisplayed = true;
    this.selectedDesigner = record;
    if (this.oldselecteddesigner != this.selectedDesigner.id) {
      this.changeDetectorRef.detectChanges();
      // this.loaderservice.isLoading = new BehaviorSubject<boolean>(false); 
      this.isdesignerjobsavailable = false;
      this.fetchDesignerJobs();
    }
  }

  unselectAllDesigners(): void {
    this.designers.forEach(element => {
      element.isDisplayed = false;
    });
  }

  assignUserToDesign(): void {
    if (this.selectedDesigner == undefined) {
      this.isDesignerSelected = false;
    }
    else if (this.data.design.designassignedto != null && this.data.design.designassignedto.id == this.selectedDesigner.id) {
      this.isLoading = false;
      this.notifyService.showInfo("This design request has already been assigned to " + this.selectedDesigner.firstname + " " + this.selectedDesigner.lastname + ".", "Information");
    } else {
      let designstarttime = new Date();
      let designacceptancestarttime = new Date();
      let additonalhours = 0;
      if (this.data.design.requesttype == "prelim") {
        additonalhours = this.selectedDesigner.jobcount * 2;
        designstarttime.setHours(designstarttime.getHours() + additonalhours);
        designacceptancestarttime.setMinutes(designacceptancestarttime.getMinutes() + 15);
      } else {
        additonalhours = this.selectedDesigner.jobcount * 6;
        designstarttime.setHours(designstarttime.getHours() + additonalhours);
        designacceptancestarttime.setMinutes(designacceptancestarttime.getMinutes() + 30);
      }

      let postData = {};

      if (this.authService.currentUserValue.user.role.id == ROLES.ContractorSuperAdmin || this.authService.currentUserValue.user.role.id == ROLES.ContractorAdmin || this.authService.currentUserValue.user.role.id == ROLES.SuccessManager || (this.authService.currentUserValue.user.role.id == ROLES.BD && this.authService.currentUserValue.user.parent.id != 232) || (this.authService.currentUserValue.user.role.id == ROLES.TeamHead && this.authService.currentUserValue.user.parent.id != 232)) {
        postData = {
          outsourcedto: this.selectedDesigner.id,
          isoutsourced: "true",
          status: "outsourced",
          designacceptancestarttime: designacceptancestarttime
        };
      } else if (this.authService.currentUserValue.user.role.id == ROLES.SuperAdmin || this.authService.currentUserValue.user.role.id == ROLES.Admin || (this.authService.currentUserValue.user.role.id == ROLES.BD && this.authService.currentUserValue.user.parent.id == 232) || (this.authService.currentUserValue.user.role.id == ROLES.TeamHead && this.authService.currentUserValue.user.parent.id == 232)) {
        postData = {
          designassignedto: this.selectedDesigner.id,
          status: "designassigned",
          designstarttime: designstarttime
        };
        this.isclientassigning = false;
      }
      this.isLoading = true;
      this.loadingmessage = "Assigning.";
      this.designService
        .assignTodesigner(
          this.data.design.id,
          postData
        )
        .subscribe(
          response => {
            this.data.design = response;
            if (this.isclientassigning) {
              this.newpermitsRef.update({ count: this.newpermitscount + 1 });
              this.companynewpermitsRef.update({ newpermits: this.companynewpermitscount + 1 });
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

  addUserToGroupChat(): void {
    let GUID = this.data.design.chatid;
    let userscope = CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT;
    if (this.isclientassigning) {
      userscope = CometChat.GROUP_MEMBER_SCOPE.ADMIN;
    }
    let membersList = [
      new CometChat.GroupMember("" + this.selectedDesigner.cometchatuid, userscope)
    ];
    CometChat.addMembersToGroup(GUID, membersList, []).then(
      () => {
        this.isLoading = false;
        this.notifyService.showSuccess("Design request has been successfully assigned.", "Success");
        this.data.refreshDashboard = true;
        this.dialogRef.close(this.data);
      },
      () => {
        this.isLoading = false;
        this.notifyService.showSuccess("Design request has been successfully assigned.", "Success");
        this.data.refreshDashboard = true;
        this.dialogRef.close(this.data);
      }
    );
  }

  search(): void {
    let term = this.searchTerm.toLowerCase();
    this.designers = this.filterDesigner.filter(function (tag) {
      let searchResult;
      let searchByFirstName = tag.firstname.toLowerCase().indexOf(term) >= 0;
      let searchByLastName = tag.lastname.toLowerCase().indexOf(term) >= 0;
      let fullname = tag.firstname + ' ' + tag.lastname;
      let searchByFullName = fullname.toLowerCase().indexOf(term) >= 0;

      if (searchByFirstName) {
        searchResult = searchByFirstName;
      } else if (searchByLastName) {
        searchResult = searchByLastName;
      } else if (searchByFullName) {
        searchResult = searchByFullName;
      }
      return searchResult;
    });
  }

  fetchDesignerJobs(): void {
    this.revisionJobs = 0;
    this.otherJobs = 0;
    this.designerjoblist = [];
    this.oldselecteddesigner = this.selectedDesigner.id;
    this.designService.getDesignerJobs(this.selectedDesigner.id).subscribe((response: any) => {
      this.isdesignerjobsavailable = true;
      this.designerjoblist = response;
      this.designerjoblist.forEach((element) => {
        if (element.isinrevisionstate) {
          ++this.revisionJobs;
        }
        else {
          ++this.otherJobs;
        }
      })
    },
      (error) => {
        this.notifyService.showError(error, "Error");
      })
  }

  openDetailPage(design: Design): void {
    // this.activitybarClose(); 
    // this.listactionindex = index; 
    this.loaderservice.isLoading = new BehaviorSubject<boolean>(true);
    this.fetchDesignDetails(design);
  }

  openDesignDetailDialog(design: Design): void {
    let prelimdata = null;
    let permitdata = null;
    if (design.requesttype == 'permit') {
      permitdata = design;
    }
    else {
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
        triggerActivity: false
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this._snackBar.dismiss();
    },
      (error) => {
        this.notifyService.showError(error, "Error");
      });
  }

  fetchDesignDetails(design: Design): void {
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openDesignDetailDialog(response);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
} 
