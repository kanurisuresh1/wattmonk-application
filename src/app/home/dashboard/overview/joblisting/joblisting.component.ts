import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CometChat } from '@cometchat-pro/chat';
import { ChatdialogComponent } from 'src/app/shared/chatdialog/chatdialog.component';
import { MasterdetailpageComponent } from 'src/app/shared/masterdetailpage/masterdetailpage.component';
import { Design, User } from 'src/app/_models';
import { AuthenticationService, DesignService, GenericService, LoaderService, NotificationService } from 'src/app/_services';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';
import { SurveyService } from 'src/app/_services/survey.service';
export enum LISTTYPE {
  Assessment,
  SalesProposal,
  Permit
}

@Component({
  selector: 'app-joblisting',
  templateUrl: './joblisting.component.html',
  styleUrls: ['./joblisting.component.scss']
})
export class JoblistingComponent implements OnInit {

  assessment: number = 0;
  loggedInUser: User;
  isassessmentloading = true;
  assessmentlist: Design[] = [];
  filterassessmentlist: Design[] = [];
  salesproposal: number = 0;
  issalesproposalloading = true;
  salesproposallist: Design[] = []
  filtersalesproposallist: Design[] = []
  permit: number = 0;
  ispermitloading = true;
  permitlist: Design[] = []
  filterpermitlist: Design[] = []
  listtypes = LISTTYPE;

  scrolling = false;

  activitybarVisible: boolean;

  listactionindex = 0;

  currentJobListing: string = 'salesproposal';

  selectedJob: Design[] = [];

  searchJob: string = '';
  isjoblistingloading = true;
  placeholder = false;
  searchdata: string;
  surveydetails = null;
  prelimDesign = null;
  constructor(public dialog: MatDialog,
    private notifyService: NotificationService,
    public genericService: GenericService,
    public designService: DesignService,
    public authService: AuthenticationService,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private loaderservice: LoaderService,
    private db: AngularFireDatabase,
    private router: Router,
    private surveyService: SurveyService) {

    this.loggedInUser = authService.currentUserValue.user;

    this.activitybarVisible = false;
  }

  ngOnInit(): void {
    this.fetchAssessmentDesignsData();
    this.fetchSalesProposalDesignsData();
    this.fetchPermitDesignsData();
  }

  fetchAssessmentDesignsData(): void {

    // let searchdata;
    // if (this.loggedInUser.role.id == 8) {
    //   searchdata = "requesttype=prelim&requirementtype=assessment&status=requestaccepted";
    // } else if (this.loggedInUser.role.id == 10) {
    //   searchdata = "requesttype=prelim&requirementtype=assessment&status=designcompleted";
    // }
    // this.loaderservice.show(); 
    this.designService.getsiteassesmentjobs().subscribe(
      response => {
        if (response.length == 0) {
          this.placeholder = true
        }
        this.isjoblistingloading = false
        this.assessment = response.length;
        this.assessmentlist = this.fillinDynamicData(response);
        this.filterassessmentlist = this.fillinDynamicData(response);
        this.isassessmentloading = false;
        this.loaderservice.hide();
      },
      error => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }
  pushSelectedJob(job: Design, event): void {
    event.stopPropagation();
    if (!(this.selectedJob.length > 0 && this.selectedJob.some((f) => {
      if (f.id == job.id)
        return f.id == job.id
    }))) {
      this.selectedJob.push(job);
    }
  }

  removeSelectedJob(job: Design): void {
    this.selectedJob = this.selectedJob.filter((e) => { return e.id != job.id });
  }
  fetchSalesProposalDesignsData(): void {
    // let searchdata;
    // if (this.loggedInUser.role.id == 8) {
    //   searchdata = "requesttype=prelim&requirementtype=proposal&status=requestaccepted";
    // } else if (this.loggedInUser.role.id == 10) {
    //   searchdata = "requesttype=prelim&requirementtype=proposal&status=designcompleted";
    // }
    // this.loaderservice.show(); 
    this.designService.getsalesproposeljobs().subscribe(
      response => {
        if (response.length == 0) {
          this.placeholder = true
        }
        this.isjoblistingloading = false
        this.salesproposal = response.length;
        this.salesproposallist = this.fillinDynamicData(response);
        this.filtersalesproposallist = this.fillinDynamicData(response);
        this.issalesproposalloading = false;
        this.loaderservice.hide();
      },
      error => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }

  fetchPermitDesignsData(): void {
    // let searchdata;
    // if (this.loggedInUser.role.id == 8) {
    //   searchdata = "requesttype=permit&status=requestaccepted";
    // } else if (this.loggedInUser.role.id == 10) {
    //   searchdata = "requesttype=permit&status=designcompleted";
    // }
    // this.loaderservice.show(); 
    this.designService.getpermitjobs().subscribe(
      response => {
        if (response.length == 0) {
          this.placeholder = true
        }
        this.isjoblistingloading = false
        this.permit = response.length;
        this.permitlist = this.fillinDynamicData(response);
        this.filterpermitlist = this.fillinDynamicData(response);
        this.ispermitloading = false;
        this.loaderservice.hide();
      },
      error => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }

  fillinDynamicData(records: Design[]): Design[] {
    records.forEach(element => {
      element.designcurrentstatus = this.genericService.getDesignStatusName(element.status);
      if (element.status != "delivered") {
        element.isoverdue = this.genericService.isDatePassed(element.expecteddeliverydate);
      } else {
        element.isoverdue = false;
      }
      element.lateby = this.genericService.getTheLatebyString(element.expecteddeliverydate)
      element.recordupdatedon = this.genericService.formatDateInTimeAgo(element.updated_at);
      element.formattedjobtype = this.genericService.getJobTypeName(element.jobtype);

      /* if (element.jobtype == 'pv') { 
        element.name = "Unknown Customer"; 
      } */

      //Code to fetch unread message count 
      /*    CometChat.getUnreadMessageCountForGroup(element.chatid).then(
           array => {
             if (array[element.chatid] != undefined) {
               element.unreadmessagecount = array[element.chatid];
               this.changeDetectorRef.detectChanges();
             } else {
               element.unreadmessagecount = 0;
               this.changeDetectorRef.detectChanges();
             }
           }
         ); */
    });

    return records;
  }
  changeJobListing(type): void {
    this.currentJobListing = type;
  }
  onChatButtonClick(design: Design, event: Event): void {
    event.stopPropagation();
    this.activitybarClose();
    let GUID = design.chatid;
    this.genericService.setSelectedChatGroupID(GUID);
    /*   this.genericService.backroute = "/home/dashboard/overview/designer"; 
      this.router.navigate(['/home/inbox/messages']); 
      this.eventEmitterService.onSidebarRouteChange("Inbox"); */
    this._snackBar.openFromComponent(ChatdialogComponent, {
      data: "element",
      panelClass: ["chatdialog"]
    });
  }
  activitybarClose(): void {
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.remove("activitybar-open");
    $activitybar.classList.add("activitybar-close");
  }

  assignUserToDesign(design: Design, event, type: LISTTYPE): void {
    event.stopPropagation()
    let postData;
    if (this.loggedInUser.role.id == 8) {
      postData = {
        designassignedto: this.loggedInUser.id,
        status: "designassigned",
        designstarttime: new Date()
      };
    } else if (this.loggedInUser.role.id == 10) {
      postData = {
        reviewassignedto: this.loggedInUser.id,
        status: "reviewassigned",
        reviewstarttime: new Date()
      };
    }


    this.designService
      .assignDesign(
        design.id,
        postData
      )
      .subscribe(
        () => {
          this.removeItemFromList(type)
          //this.addUserToGroupChat(design);
        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
        }
      );
  }
  applySelectedDesign(): void {
    let selectedDesign = this.selectedJob.map((m) => { return m.id.toString() });
    let selectedDesignChats = this.selectedJob.map((m) => { return { guid: m?.chatid, password: m?.groupchatpassword } });
    let postData = { "type": this.loggedInUser.role.type, "designid": selectedDesign }

    this.loaderservice.show();
    this.designService
      .selfassignDesign(
        this.loggedInUser.id,
        postData
      )
      .subscribe(
        () => {
          this.selectedJob = []
          this.notifyService.showSuccess("Jobs Accepted Successfully", "Success");
          this.loaderservice.hide();
          this.addUserToGroupChat(selectedDesignChats);
          this.fetchSalesProposalDesignsData();
          this.fetchAssessmentDesignsData();
          this.fetchPermitDesignsData();

        },
        error => {
          this.loaderservice.hide();
          this.notifyService.showError(
            error,
            "Error"
          );
        }
      );
  }

  addUserToGroupChat(Guids): void {
    try {
      Guids.forEach(element => {
        var GUID = element.guid.toString();
        var password = element.password;
        var groupType = CometChat.GROUP_TYPE.PASSWORD;

        CometChat.joinGroup(GUID, groupType, password).then(
          () => {
            // console.log("Group joined successfully:", group);
          }, () => {
            // console.log("Group joining failed with exception:", error);
          }
        );
      });
    }
    catch (error) {
      console.log(error);
    }
  }

  removeItemFromList(type: LISTTYPE): void {
    switch (type) {
      case LISTTYPE.Assessment:
        this.assessment -= 1;
        this.assessmentlist.splice(this.listactionindex, 1);
        this.assessmentlist = [...this.assessmentlist];
        break;
      case LISTTYPE.Permit:
        this.permit -= 1;
        this.permitlist.splice(this.listactionindex, 1);
        this.permitlist = [...this.permitlist];
        break;
      case LISTTYPE.SalesProposal:
        this.salesproposal -= 1;
        this.salesproposallist.splice(this.listactionindex, 1);
        this.salesproposallist = [...this.salesproposallist];
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  activitybarToggle(design: Design, event: Event): void {
    event.stopPropagation();
    this.activitybarOpen(design);
  }

  activitybarOpen(design: Design): void {
    this.eventEmitterService.onActivityBarButtonClick(design.id, true);
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.add("activitybar-open");
    $activitybar.classList.remove("activitybar-close");
    this.activitybarVisible = true;
  }

  handleBack(): void {
    this.router.navigate([localStorage.getItem("lastroute")]);
  }

  filterusers(value: string): void {
    let term = value.toLowerCase();
    if (this.currentJobListing == 'salesproposal') {
      this.salesproposallist = []
      this.filtersalesproposallist.filter((item) => {
        let searchByFirstName = item.name.toLowerCase().indexOf(term) >= 0;
        let searchByLastName = item.email.toLowerCase().indexOf(term) >= 0;
        let searchByaddress = item.address.toLowerCase().indexOf(term) >= 0
        if (searchByFirstName) {
          this.salesproposallist.push(item)
        } else if (searchByLastName) {
          this.salesproposallist.push(item)
        } else if (searchByaddress) {
          this.salesproposallist.push(item)
        }
      });
    }
    if (this.currentJobListing == 'siteassessment') {
      this.assessmentlist = []
      this.filterassessmentlist.filter((item) => {
        let searchByFirstName = item.name.toLowerCase().indexOf(term) >= 0;
        let searchByLastName = item.email.toLowerCase().indexOf(term) >= 0;
        let searchByaddress = item.address.toLowerCase().indexOf(term) >= 0
        if (searchByFirstName) {
          this.assessmentlist.push(item)
        } else if (searchByLastName) {
          this.assessmentlist.push(item)
        } else if (searchByaddress) {
          this.assessmentlist.push(item)
        }
      });
    }
    if (this.currentJobListing == 'permitdesign') {
      this.permitlist = []
      this.filterpermitlist.filter(item => {
        let searchByFirstName = item.name.toLowerCase().indexOf(term) >= 0;
        let searchByLastName = item.email.toLowerCase().indexOf(term) >= 0;
        let searchByaddress = item.address.toLowerCase().indexOf(term) >= 0
        if (searchByFirstName) {
          this.permitlist.push(item);
        } else if (searchByLastName) {
          this.permitlist.push(item);
        } else if (searchByaddress) {
          this.permitlist.push(item);
        }
      });
    }
  }

  openPrelimDetail(design): void {
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openPrelimDesignDetailDialog(response);
        this.loaderservice.hide();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }

  openPrelimDesignDetailDialog(design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      /* panelClass: 'white-modalbox',
       height:"98%", */
      data: {
        prelim: design,
        triggerEditEvent: false,
        triggerDeleteEvent: false,
        selectedtab: "prelim",
        triggerChatEvent: false,
        triggerActivity: false,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this._snackBar.dismiss();
    });
  }

  openPermitdetailDialog(design): void {
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openPermitDesignDetailDialog(response);
        this.loaderservice.hide();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }
  openPermitDesignDetailDialog(design: Design): void {
    this.activitybarClose();
    // let triggerEditEvent = false;
    if (design.createdby.minpermitdesignaccess) {
      if (design.issurveycompleted && design.survey != null) {
        this.surveyService.getSurveyDetails(design.survey.id).subscribe(
          (response) => {
            this.surveydetails = response;
            if (this.surveydetails.prelimdesignsurvey != null) {
              this.designService
                .getDesignDetails(this.surveydetails.prelimdesignsurvey.id)
                .subscribe(
                  (response) => {
                    this.prelimDesign = response;
                    this.openDetaildialog(design);
                  },
                  (error) => {
                    this.notifyService.showError(error, "Error");
                  }
                );
            } else {
              this.openDetaildialog(design);
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      } else {
        this.openDetaildialog(design);
        this.surveydetails = null;
      }

    }
  }

  openDetaildialog(design) {
    var triggerEditEvent = false;
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        permit: design,
        triggerPermitEditEvent: triggerEditEvent,
        triggerDeleteEvent: false,
        isPermitmode: false,
        prelim: this.prelimDesign,
        survey: this.surveydetails,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.surveydetails = null;
      this.prelimDesign = null;
      this._snackBar.dismiss();
    });

  }
} 
