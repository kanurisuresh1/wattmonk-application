import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { ViewportScroller } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { ChatdialogComponent } from "src/app/shared/chatdialog/chatdialog.component";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { ROLES } from "src/app/_helpers";
import { Design, Pestamp, User } from "src/app/_models";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  LoaderService,
  NotificationService,
  PestampService
} from "src/app/_services";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { SurveyService } from "src/app/_services/survey.service";
import { PestampDeclineDialog } from "../../pestamp/pestamp/pestamp.component";

export enum LISTTYPE {
  NEW,
  INSTAMPING,
  COMPLETED,
  DELIVERED,
}

@Component({
  selector: "app-peengineeroverview",
  templateUrl: "./peengineeroverview.component.html",
  styleUrls: ["./peengineeroverview.component.scss"],
})
export class PeengineeroverviewComponent implements OnInit {
  isLoading = false;
  loadingmessage = "";

  listtypes = LISTTYPE;

  placeholder = true;
  isFavorite = true;
  loggedInUser: User;
  isClient = false;
  isvianotification = false;

  isindesignslistloading = true;
  iscompleteddesignslistloading = true;
  isinreviewdesignslistloading = true;
  isdelivereddesignslistloading = true;

  //Total Count
  allindesigns: number = -1;
  allcompleteddesigns: number = -1;
  alldelivereddesigns: number = -1;

  indesigns: number = 0;
  completeddesigns: number = 0;
  inreviewdesigns: number = 0;
  delivereddesigns: number = 0;

  indesignslist: Pestamp[] = [];
  completeddesignslist: Pestamp[] = [];
  delivereddesignslist: Pestamp[] = [];

  getDeliveredPestamp: Pestamp[] = [];
  getCompletedPestamp: Pestamp[] = [];

  //Permit Numbers and Lists

  listactionindex = 0;
  istabchangeevent = false;
  activeTab = 0;

  // @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  chatusers: User[] = [];
  Allfiles: any = [];

  surveydetails = null;
  prelimDesign = null;
  permitDesign = null;

  isDownloading = false;
  downloadmessage = "Preparing download";
  loadingpercentage: number = 0;

  limit = 10;
  skip = 0;
  scrolling = false;

  @ViewChild("completedscroll")
  completedpestampscroller: CdkVirtualScrollViewport;

  @ViewChild("deliveredpestamp")
  deliveredpestampscroller: CdkVirtualScrollViewport;
  constructor(
    public dialog: MatDialog,
    private viewportScroller: ViewportScroller,
    private notifyService: NotificationService,
    public genericService: GenericService,
    public designService: DesignService,
    public pestampService: PestampService,
    public authService: AuthenticationService,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private surveyService: SurveyService,
    private loaderservice: LoaderService
  ) {
    this.loggedInUser = authService.currentUserValue.user;
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
  }

  ngOnInit(): void {
    this.eventEmitterService.newnotificationreceived.subscribe(() => {
      this.isvianotification = true;
    });
    // this.commonservice.userData(this.loggedInUser.id).subscribe(
    //   response1 => {
    //     this.commonservice.getplatformupdate().subscribe(
    //       response => {
    //         if (response.length > 0 && response[0].status && !response1.isplatformupdated) {
    //           const dialogRef = this.dialog.open(UpdatedialogComponent, {
    //             disableClose: true,
    //             width: "50%",
    //             autoFocus: false,
    //             data: { loginrequired: response[0].loginrequired, title: response[0].title, message: response[0].message }
    //           });
    //           dialogRef.afterClosed().subscribe(result => {
    //           });
    //         } else {
    //           this.dialog.closeAll()
    //         }
    //       })
    //   }
    // );
  }

  ngAfterViewInit(): void {
    this.fetchAllDesignsCount();
  }

  gotoSection(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }

  activitybarToggle(design: Design, event: Event): void {
    event.stopPropagation();
    this.activitybarOpen(design);
  }

  activitybarOpen(design: Design): void {
    this.eventEmitterService.onActivityBarButtonClick(
      design.id,
      false,
      "Pestamp"
    );
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.add("activitybar-open");
    $activitybar.classList.remove("activitybar-close");
  }

  activitybarClose(): void {
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.remove("activitybar-open");
    $activitybar.classList.add("activitybar-close");
  }

  onChatButtonClick(design: Design, event: Event): void {
    event.stopPropagation();
    this.activitybarClose();
    const GUID = design.chatid;
    this.genericService.setSelectedChatGroupID(GUID);
    /*  this.genericService.backroute = "/home/dashboard/overview/peengineer";
    this.router.navigate(['/home/inbox/messages']);
    this.eventEmitterService.onSidebarRouteChange("Inbox"); */
    this._snackBar.openFromComponent(ChatdialogComponent, {
      data: "element",
      panelClass: ["chatdialog"],
    });
  }

  removeItemFromList(type: LISTTYPE, record: Pestamp): void {
    switch (type) {
      case LISTTYPE.INSTAMPING:
        this.listactionindex = this.indesignslist.indexOf(record);
        this.indesigns -= 1;
        this.indesignslist.splice(this.listactionindex, 1);
        this.indesignslist = [...this.indesignslist];
        this.indesignslist = this.fillinDynamicData(this.indesignslist);
        break;
      case LISTTYPE.COMPLETED:
        this.listactionindex = this.completeddesignslist.indexOf(record);
        this.allcompleteddesigns -= 1;
        this.completeddesignslist.splice(this.listactionindex, 1);
        this.completeddesignslist = [...this.completeddesignslist];
        this.completeddesignslist = this.fillinDynamicData(
          this.completeddesignslist
        );
        break;
      case LISTTYPE.DELIVERED:
        this.listactionindex = this.delivereddesignslist.indexOf(record);
        this.delivereddesigns -= 1;
        this.delivereddesignslist.splice(this.listactionindex, 1);
        this.delivereddesignslist = [...this.delivereddesignslist];
        this.delivereddesignslist = this.fillinDynamicData(
          this.delivereddesignslist
        );
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  updateItemInList(type: LISTTYPE, newrecord: Pestamp): void {
    switch (type) {
      case LISTTYPE.INSTAMPING:
        // this.listactionindex = this.indesignslist.indexOf(record);
        this.indesignslist.splice(this.listactionindex, 1, newrecord);
        this.indesignslist = [...this.indesignslist];
        // this.indesignslist = this.fillinDynamicData(this.indesignslist);
        break;
      case LISTTYPE.COMPLETED:
        // this.listactionindex = this.completeddesignslist.indexOf(record);
        this.completeddesignslist.splice(this.listactionindex, 1, newrecord);
        this.completeddesignslist = [...this.completeddesignslist];
        // this.completeddesignslist = this.fillinDynamicData(this.completeddesignslist);
        break;
      case LISTTYPE.DELIVERED:
        // this.listactionindex = this.completeddesignslist.indexOf(record);
        this.delivereddesignslist.splice(this.listactionindex, 1, newrecord);
        this.delivereddesignslist = [...this.delivereddesignslist];
        // this.completeddesignslist = this.fillinDynamicData(this.completeddesignslist);
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  onScrollDeliveredPestamp(): void {
    const end = this.deliveredpestampscroller.getRenderedRange().end;
    const total = this.deliveredpestampscroller.getDataLength();
    if (end == total && this.alldelivereddesigns > total) {
      this.scrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchDeliveredDesignsData();
    }
  }

  onScrollCompletedPestamp(): void {
    const end = this.completedpestampscroller.getRenderedRange().end;
    const total = this.completedpestampscroller.getDataLength();
    if (end == total && this.allcompleteddesigns > total) {
      this.scrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchCompletedDesignsData();
    }
  }
  acceptDesignRequest(pestamp: Pestamp, event: Event, index: number): void {
    this.isLoading = true;
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    let postData;
    /*     if (pestamp.type == 'both') {
      if (this.loggedInUser.peengineertype == 'electrical') {
        postData = {
          acceptedbyelectricalpeengineer: true,
          declinedbyelectricalpeengineer: false
        }
      }
      else if (this.loggedInUser.peengineertype == 'structural') {
        postData = {
          acceptedbystructuralpeengineer: true,
          declinedbystructuralpeengineer: false
        }
      }

    }
    else {
      postData = {
        acceptedbypeengineer: true,
        declinedbypeengineer: false
      };
    } */

    postData = {
      acceptedbypeengineer: true,
      declinedbypeengineer: false,
    };
    this.loaderservice.show();
    this.pestampService.acceptPestamp(pestamp.id, postData).subscribe(
      (response) => {
        this.updateItemInList(LISTTYPE.INSTAMPING, response);
        this.notifyService.showSuccess(
          "PE stamp request has been accepted successfully.",
          "Success"
        );
        this.loaderservice.hide();
        this.isLoading = false;
        // this.createNewDesignChatGroup(response);
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  declinePestampRequest(pestamp: Pestamp, event: Event, index: number): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openPestampDeclineDialog(pestamp);
  }
  openPestampDeclineDialog(record: Pestamp): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(PestampDeclineDialog, {
      width: "50%",
      disableClose: true,
      data: { pestamp: record, declinedbypeengineer: true },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.updateItemInList(LISTTYPE.INSTAMPING, result.pestamp);
      }
    });
  }

  addItemToList(type: LISTTYPE, newrecord: Pestamp): void {
    switch (type) {
      case LISTTYPE.INSTAMPING:
        this.indesignslist.splice(0, 0, newrecord);
        this.indesignslist = [...this.indesignslist];
        this.indesigns = this.indesignslist.length;
        this.indesignslist = this.fillinDynamicData(this.indesignslist);
        break;
      case LISTTYPE.COMPLETED:
        this.completeddesignslist.splice(0, 0, newrecord);
        this.completeddesignslist = [...this.completeddesignslist];
        this.completeddesigns = this.completeddesignslist.length;
        this.completeddesignslist = this.fillinDynamicData(
          this.completeddesignslist
        );
        break;
      case LISTTYPE.DELIVERED:
        this.delivereddesignslist.splice(0, 0, newrecord);
        this.delivereddesignslist = [...this.delivereddesignslist];
        this.delivereddesigns = this.delivereddesignslist.length;
        this.alldelivereddesigns = Number(this.alldelivereddesigns) + 1;
        this.delivereddesignslist = this.fillinDynamicData(
          this.delivereddesignslist
        );
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  openDesignDetailDialog(design: Pestamp, index): void {
    this.activitybarClose();
    this.listactionindex = index;
    this.isLoading = true;
    this.fetchDesignDetails(design);
  }

  fetchDesignDetails(design: Pestamp): void {
    this.loaderservice.show();
    this.pestampService.getPestampDetails(design.id).subscribe(
      (response) => {
        if (response.design != null) {
          this.getPermitDetails(response.design.id, response);
        } else {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.openpestampdialog(response);
        }
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getPermitDetails(permitid, pestamp): void {
    this.designService.getDesignDetails(permitid).subscribe((response) => {
      this.permitDesign = response;
      if (response.survey != null) {
        this.getsurveydetails(response.survey.id, pestamp);
      } else {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.openpestampdialog(pestamp);
      }
    });
  }

  getsurveydetails(surveyid, pestamp): void {
    this.surveyService.getSurveyDetails(surveyid).subscribe((response) => {
      this.surveydetails = response;
      this.isLoading = false;
      this.changeDetectorRef.detectChanges();
      if (this.surveydetails.prelimdesignsurvey != null) {
        this.designService
          .getDesignDetails(this.surveydetails.prelimdesignsurvey.id)
          .subscribe((response) => {
            this.prelimDesign = response;
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.openpestampdialog(pestamp);
          });
      } else {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.openpestampdialog(pestamp);
      }
    });
  }
  openpestampdialog(pestamp: Pestamp): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        pestamp: pestamp,
        triggerEditEvent: false,
        triggerDeleteEvent: false,
        isPermitmode: true,
        design: pestamp.design,
        survey: this.surveydetails,
        prelim: this.prelimDesign,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.surveydetails = null;
      this.prelimDesign = null;
      this.permitDesign = null;
      if (result.refreshDashboard) {
        this.fetchAllDesignsCount();
      }
    });
  }

  fetchAllDesignsCount(): void {
    this.pestampService
      .getDesignsCount(
        "status=assigned&declinedbyelectricalpeengineer=true&declinedbystructuralpeengineer=true&acceptedbyelectricalpeengineer=true&acceptedbystructuralpeengineer=true&isstructuralassigned=true&iselectricalassigned=true"
      )
      .subscribe(
        (response) => {
          this.allindesigns = response["instamping"];
          this.allcompleteddesigns = response["completed"];
          this.alldelivereddesigns = response["delivered"];
          this.changeDetectorRef.detectChanges();
          if (this.activeTab == 0) {
            this.fetchInDesigningDesignsData();
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  maintabchange(tabChangeEvent: MatTabChangeEvent): void {
    this.istabchangeevent = true;
    this.activeTab = tabChangeEvent.index;
    this.fetchAllDesignsCount();
    this.skip = 0;
    this.limit = 10;
    this.delivereddesignslist = [];
    this.completeddesignslist = [];
    switch (tabChangeEvent.index) {
      case 0:
        //this.isindesignslistloading = true;
        // this.fetchInDesigningDesignsData();
        break;
      /*   case 1:
        this.iscompleteddesignslistloading = true;
        this.fetchCompletedDesignsData();
        break; */
      case 1:
        this.isdelivereddesignslistloading = true;
        this.fetchDeliveredDesignsData();
        break;
      default:
        break;
    }
  }

  fetchInDesigningDesignsData(): void {
    this.pestampService
      .getFilteredDesigns(
        "status=assigned&declinedbyelectricalpeengineer=true&declinedbystructuralpeengineer=true&acceptedbyelectricalpeengineer=true&acceptedbystructuralpeengineer=true&isstructuralassigned=true&iselectricalassigned=true"
      )
      .subscribe(
        (response) => {
          this.indesigns = response.length;
          this.indesignslist = this.fillinDynamicData(response);
          this.isindesignslistloading = false;
          this.changeDetectorRef.detectChanges();
          // if (!this.isvianotification) {
          //   this.fetchCompletedDesignsData();
          // }
          this.startAllTimers();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchCompletedDesignsData(): void {
    this.pestampService
      .getFilteredDesigns(
        "status=completed&limit=" + this.limit + "&skip=" + this.skip
      )
      .subscribe(
        (response) => {
          this.completeddesigns = response.length;
          if (response.length > 0) {
            this.getCompletedPestamp = this.fillinDynamicData(response);
            for (
              let i = 0, len = this.getCompletedPestamp.length;
              i < len;
              ++i
            ) {
              this.completeddesignslist.push(this.getCompletedPestamp[i]);
            }
            this.completeddesignslist = [...this.completeddesignslist];
            this.changeDetectorRef.detectChanges();
          }
          this.scrolling = false;
          this.iscompleteddesignslistloading = false;
          this.changeDetectorRef.detectChanges();
          // if (!this.isvianotification) {
          //   this.fetchDeliveredDesignsData();
          // }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchDeliveredDesignsData(): void {
    this.pestampService
      .getFilteredDesigns(
        "status=delivered&limit=" + this.limit + "&skip=" + this.skip
      )
      .subscribe(
        (response) => {
          this.delivereddesigns = response.length;
          if (response.length > 0) {
            this.getDeliveredPestamp = this.fillinDynamicData(response);
            for (
              let i = 0, len = this.getDeliveredPestamp.length;
              i < len;
              ++i
            ) {
              this.delivereddesignslist.push(this.getDeliveredPestamp[i]);
            }
            this.delivereddesignslist = [...this.delivereddesignslist];
            this.changeDetectorRef.detectChanges();
          }
          this.isdelivereddesignslistloading = false;
          this.scrolling = false;
          this.changeDetectorRef.detectChanges();
          if (this.istabchangeevent) {
            this.istabchangeevent = false;
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fillinDynamicData(records: Pestamp[]): Pestamp[] {
    records.forEach((element) => {
      element.pestampstarttime = this.genericService.getDesignStatusName(
        element.status
      );
      if (element.status != "delivered") {
        element.isoverdue = this.genericService.isDatePassed(
          element.actualdelivereddate
        );
      } else {
        element.isoverdue = false;
      }
      element.lateby = this.genericService.getTheLatebyString(
        element.actualdelivereddate
      );
      element.recordupdatedon = this.genericService.formatDateInTimeAgo(
        element.updated_at
      );

      //Code to fetch unread message count
      /*  CometChat.getUnreadMessageCountForGroup(element.chatid).then(
        array => {
          if (array[element.chatid] != undefined) {
            element.unreadmessagecount = array[element.chatid];
            this.changeDetectorRef.detectChanges();
          } else {
            element.unreadmessagecount = 0;
            this.changeDetectorRef.detectChanges();
          }
        },
        error => {
        }
      ); */
    });

    return records;
  }

  updateDesignStatus(
    designid: number,
    designstatus: string,
    message: string
  ): void {
    event.stopPropagation();
    this.activitybarClose();
    const postData = {
      status: designstatus,
    };

    this.designService.editDesign(designid, postData).subscribe(
      () => {
        this.notifyService.showSuccess(message, "Success");
        this.fetchAllDesignsCount();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  startAllTimers(): void {
    this.indesignslist.forEach((element) => {
      const reviewdate = new Date(element.pestampstarttime);
      reviewdate.setHours(reviewdate.getHours() + 2);
      element.designremainingtime = this.genericService.getRemainingTime(
        reviewdate.toString()
      );
    });
  }

  downloadfile(pestamp: Pestamp, event: Event): void {
    // const that = this;
    // event.stopPropagation();
    // this.loadingpercentage = 0;
    // this.isDownloading = true;
    // if (pestamp.atticphotos.length > 0) {
    //   pestamp.atticphotos.forEach((element) => {
    //     this.Allfiles.push(element);
    //   });
    // }
    // if (pestamp.roofphotos.length > 0) {
    //   pestamp.roofphotos.forEach((element) => {
    //     this.Allfiles.push(element);
    //   });
    // }
    // if (pestamp.permitplan.length > 0) {
    //   pestamp.permitplan.forEach((element) => {
    //     this.Allfiles.push(element);
    //   });
    // }

    // const zip = new JSZip();
    // let count = 0;
    // this.Allfiles.forEach((file) => {
    //   axios
    //     .get(file.url, {
    //       responseType: "blob",
    //     })
    //     .then((response) => {
    //       const percentage = Math.round((count * 100) / this.Allfiles.length);
    //       this.loadingpercentage = percentage;
    //       this.changeDetectorRef.detectChanges();
    //       zip.file(file.name + file.ext, response.data, {
    //         binary: true,
    //       });

    //       ++count;

    //       if (count == this.Allfiles.length) {
    //         zip
    //           .generateAsync({
    //             type: "blob",
    //           })
    //           .then(function (content) {
    //             that.isDownloading = false;
    //             that.changeDetectorRef.detectChanges();
    //             saveAs(
    //               content,
    //               pestamp.personname + "_" + pestamp.email + ".zip"
    //             );
    //           });
    //       }
    //     })
    //     .catch(() => {
    //       // do nothing.
    //     });
    // });
    event.stopPropagation();
    this.isDownloading = true;
    this.downloadmessage = "Downloading zip file"
    this.pestampService.downloadzipfile(pestamp.id).subscribe((result: any) => {
      this.isDownloading = false;
      this.changeDetectorRef.detectChanges();
      const link = document.createElement("a");
      link.href = result.data;
      link.download = pestamp.personname + "_" + pestamp.email + ".zip";
      link.click();
    },
      (error) => {
        this.isDownloading = false;
        this.notifyService.showError(error, "Error");
      })
  }
}
