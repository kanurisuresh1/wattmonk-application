import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { ViewportScroller } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import { FormControl, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatSelectionList } from "@angular/material/list";
import { MatRadioChange } from "@angular/material/radio";
import { MatSelectChange } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { CometChat } from "@cometchat-pro/chat";
import { Gallery, GalleryItem, ImageItem } from "@ngx-gallery/core";
import axios from "axios";
import * as moment from "moment";
import { Observable } from "rxjs";
import { ChatdialogComponent } from "src/app/shared/chatdialog/chatdialog.component";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { FIREBASE_DB_CONSTANTS, ROLES } from "src/app/_helpers";
import { Pestamp, User } from "src/app/_models";
import { Company, Peengineer } from "src/app/_models/company";
import { UserSetting } from "src/app/_models/usersettings";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  LoaderService,
  NotificationService,
  PestampService
} from "src/app/_services";
import { ArchiveService } from "src/app/_services/archive.service";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { SurveyService } from "src/app/_services/survey.service";
import { TeamService } from "src/app/_services/team.service";
import { AddpestampdialogComponent } from "../addpestampdialog/addpestampdialog.component";
import { AssignpeengineersComponent } from "../assignpeengineers/assignpeengineers.component";
import { OrderpestampsdialogComponent } from "../orderpestampsdialog/orderpestampsdialog.component";
import { PendingpaymentsdialogComponent } from "../pendingpaymentsdialog/pendingpaymentsdialog.component";
import { ShareprelimdesigndialogComponent } from "../shareprelimdesigndialog/shareprelimdesigndialog.component";
export enum LISTTYPE {
  NEW,
  INDESIGN,
  COMPLETED,
  DELIVERED,
  ONHOLD,
}

@Component({
  selector: "app-design",
  templateUrl: "./pestamp.component.html",
  styleUrls: ["./pestamp.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PestampComponent implements OnInit {
  user = User;
  isWattmonkUser = false;
  activitybarVisible: boolean;
  listtypes = LISTTYPE;
  isFavorite = true;
  loggedInUser: User;
  isClient = false;
  isPeSuperadmin = false;
  scrolling = false;
  permissiontomakedesign =
    this.authService.currentUserValue.user.permissiontomakedesign;
  //Total Count
  allnewpestamp: number = -1;
  allinstamping: number = -1;
  allcompleted: number = -1;
  alldelivered: number = -1;
  allonholdpestamp: number = -1;

  getnewpestamp: Pestamp[] = [];
  getinstampingpestamp: Pestamp[] = [];
  getcompletedpestamp: Pestamp[] = [];
  getdeliveredpestamp: Pestamp[] = [];
  //Prelim Numbers and Lists
  newdesigns: number = -1;
  indesigns: number = -1;
  completeddesigns: number = -1;
  delivereddesigns: number = -1;

  newpestamplist: Pestamp[] = [];
  indesignslist: Pestamp[] = [];
  completeddesignslist: Pestamp[] = [];
  delivereddesignslist: Pestamp[] = [];

  isnewdesignslistloading = true;
  isindesignslistloading = true;
  iscompleteddesignslistloading = true;
  isdelivereddesignslistloading = true;

  // @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  chatusers: User[] = [];
  listactionindex = 0;
  designId: number;
  istabchangeevent = false;
  amounttopay;
  isLoading = false;
  statusfilter;
  statusfilterclear: string;

  newpestamp: Observable<any>;
  newpestampRef: AngularFireObject<any>;
  newpestampcounts = 0;
  wattmonkadmins: User[] = [];
  surveydetails = null;
  prelimDesign = null;
  permitDesign = null;
  peengineers: Peengineer[];
  selectedTabIndex = 0;
  reviwerid;
  isLoader = false;
  activeTab = 0;
  // loadingmessage = "Save data.";
  @ViewChild("newpestamp")
  newpestampscroller: CdkVirtualScrollViewport;

  @ViewChild("instamping")
  instampingscroller: CdkVirtualScrollViewport;

  @ViewChild("completedpestamp")
  completedpestampscroller: CdkVirtualScrollViewport;

  @ViewChild("deliveredpestamp")
  deliveredpestampscroller: CdkVirtualScrollViewport;

  @ViewChild("onholdpestampscroll")
  onholdviewport: CdkVirtualScrollViewport;

  @ViewChild("listDesigner") listDesigner: MatSelectionList;

  limit = 10;
  skip = 0;

  creatorparentid;
  selectedcompanynewpestampsRef: AngularFireObject<any>;
  companies: Company[];
  companyList = [];
  teamheadid = 0;

  isonholdpestamplistloading: boolean;
  onholdpestamps: number;
  getonholdpestamps: Pestamp[] = [];
  onholdpestampslist = [];

  sorting: boolean = false;
  orderbyfilterstatus = null;
  ordertypefilterstatus = null;
  sortingdata: string;
  dynamicName: UserSetting;
  searchTerm: any = { companyname: "" };

  listactionindex1: number[] = [];
  Array: number[] = [];
  counting: number;
  isfrmChecked: any;
  allArchives = [];
  scrollwiseDesigns = [];
  clientadmins: User[] = [];
  loadingmessage = "Please wait";
  downloadmessage = "Preparing download";
  loadingpercentage: number = 0;
  isDownloading = false;
  Allfiles: any = [];
  isOutsourced: boolean;
  Newscrolling: boolean;
  Holdscrolling: boolean;
  Stampingscrolling: boolean;
  Deliveredscrolling: boolean;
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
    private commonservice: CommonService,
    private db: AngularFireDatabase,
    private surveyService: SurveyService,
    public archiveService: ArchiveService,
    private loaderservice: LoaderService,
    private teamservice: TeamService
  ) {
    this.newpestampRef = db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + "newpestamp"
    );
    this.newpestamp = this.newpestampRef.valueChanges();
    this.dynamicName = JSON.parse(localStorage.getItem("usersettings"));
    this.newpestamp.subscribe(
      (res) => {
        this.newpestampcounts = res.count;
      }
      // (err) => console.log(err),
      // () => console.log('done!')
    );
    this.loggedInUser = authService.currentUserValue.user;

    if (
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      (this.loggedInUser.role.id == ROLES.TeamHead &&
        this.loggedInUser.parent.id == 232)
    ) {
      this.isWattmonkUser = true;
    } else {
      this.isWattmonkUser = false;
    }

    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id != 232) ||
      (this.loggedInUser.role.id == ROLES.TeamHead &&
        this.loggedInUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
    if (this.loggedInUser.role.id == ROLES.PESuperAdmin) {
      this.isPeSuperadmin = true;
    }
    this.teamheadid = ROLES.TeamHead;
    this.activitybarVisible = false;
  }

  ngOnInit(): void {
    if (this.isPeSuperadmin) {
      this.fetchPeEngineers();
    }
    this.getWattmonkadmins();
    if (!this.isClient) {
      if (this.genericService.companies == undefined) {
        this.getCompanies();
      } else {
        // this.companies = this.genericService.companies;
        this.companyList = this.genericService.companies;
        this.fetcheachcompanynewdesigncount();
      }
    }
  }

  ngAfterViewInit(): void {
    this.fetchAllPestampsCount();
  }

  activitybarToggle(pestamp: Pestamp, event: Event): void {
    event.stopPropagation();
    this.activitybarOpen(pestamp);
  }

  activitybarOpen(pestamp: Pestamp): void {
    this.eventEmitterService.onActivityBarButtonClick(
      pestamp.id,
      false,
      "Pestamp"
    );
    const $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.add("activitybar-open");
    $activitybar.classList.remove("activitybar-close");
    this.activitybarVisible = true;
  }

  activitybarClose(): void {
    const $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.remove("activitybar-open");
    $activitybar.classList.add("activitybar-close");
  }

  onChatButtonClick(pestamp: Pestamp, event: Event): void {
    event.stopPropagation();
    this.activitybarClose();
    const GUID = pestamp.chatid;
    this.genericService.setSelectedChatGroupID(GUID);
    CometChat.getGroup(pestamp.chatid).then(
      () => {
        this._snackBar.openFromComponent(ChatdialogComponent, {
          panelClass: ["chatdialog"],
          data: "element",
        });
      },
      () => {
        this.getClientsadmins(pestamp);
        //this.createExistingDesignChat(pestamp)
      }
    );
  }
  /*  createExistingDesignChat(pestamp: Pestamp) {
     const GUID = ""+ pestamp.chatid;
 
     const name = pestamp.personname.substring(0, 60);
     const email = pestamp.email.substring(0, 60);
 
     const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
     const groupName = pestamp.type + "_" + name + "_" + email + "_" + currentdatetime;
 
     const groupType = CometChat.GROUP_TYPE.PRIVATE;
     const password = "";
 
     const group = new CometChat.Group(GUID, groupName, groupType, password);
     const adminsid = [];
     adminsid.push(pestamp.createdby.parent)
     this.wattmonkadmins.forEach((element) => {
       adminsid.push(element);
     });
     this.clientadmins.forEach(element => {
       adminsid.push(element)
     });
     adminsid.push(this.loggedInUser.id);
 
     if(pestamp.chatid == null){
       const inputData = {
         chatid : "pestamp" + "_" + new Date().getTime(),
       }
       pestamp.chatid = "pestamp" + "_" + new Date().getTime();
       this.designService.assignDesign(pestamp.id,inputData).subscribe(response => {})
     }
 
     CometChat.createGroup(group).then(
       (group) => {
         const membersList = [
           new CometChat.GroupMember(
             "" + pestamp.createdby.id,
             CometChat.GROUP_MEMBER_SCOPE.ADMIN
           ),
         ];
         adminsid.forEach((element) => {
           membersList.push(
             new CometChat.GroupMember(
               "" + element,
               CometChat.GROUP_MEMBER_SCOPE.ADMIN
             )
           );
         });
         CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
           (response) => {
             const chatgroupusers =adminsid
             chatgroupusers.push(pestamp.createdby.cometchatuid)
             const inputData = {
               title: groupName,
               guid: GUID,
               parentid: pestamp.createdby.parent.id,
               chatgroupusers:chatgroupusers
             }
            this.commonservice.addChatGroup(inputData).subscribe(response=>{
              
            })
             this._snackBar.openFromComponent(ChatdialogComponent, {
               data: "element",
               panelClass:["chatdialog"]
             });
           },
           (error) => {
 
           }
         );
       },
       (error) => {
 
       }
     );
   } */
  gotoSection(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }

  openAllPage(): void {
    // do nothing.
  }


  fetchPeEngineers(): void {
    this.teamservice.getTeamData().subscribe(
      (response: any) => {
        this.peengineers = response;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onPEenggChanged(list): void {
    this.isLoader = true;
    this.newpestamplist = [];
    this.indesignslist = [];
    this.completeddesignslist = [];
    this.delivereddesignslist = [];
    this.onholdpestampslist = [];

    this.skip = 0;
    this.limit = 10;

    const designerid = list.selectedOptions.selected.map((item) => item.value);
    this.reviwerid = designerid[0];
    this.fetchpestampbyPEEnggId();
  }

  fetchpestampbyPEEnggId(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }
    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=assigned";
    } else {
      searchdata =
        searchdata +
        "limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=assigned";
    }

    this.isnewdesignslistloading = true;
    this.allnewpestamp = 0;
    this.allinstamping = 0;
    this.allcompleted = 0;
    this.alldelivered = 0;
    this.allonholdpestamp = 0;
    this.changeDetectorRef.detectChanges();
    this.pestampService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.newdesigns = response.length;
        this.allnewpestamp = this.newdesigns;
        if (response.length > 0) {
          this.getinstampingpestamp = this.fillinDynamicData(response);
          for (
            let i = 0, len = this.getinstampingpestamp.length;
            i < len;
            ++i
          ) {
            this.indesignslist.push(this.getinstampingpestamp[i]);
          }
          this.indesignslist = [...this.indesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isLoader = false;

        this.isnewdesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetcheachcompanynewdesigncount(): void {
    //this.companies.forEach((element) => {
    this.companyList.forEach((element) => {
      var companyitemRef: AngularFireObject<any>;
      companyitemRef = this.db.object(
        FIREBASE_DB_CONSTANTS.KEYWORD + element.companyid
      );
      const companyitem = companyitemRef.valueChanges();
      companyitem.subscribe((res) => {
        element.newdesignscount = res != null ? res.newpestamps : null;
        this.changeDetectorRef.detectChanges();
      });
    });
  }

  onCompanyChanged(list): void {
    this.Array = [];
    this.allArchives = [];
    this.isLoader = true;
    this.newpestamplist = [];
    this.indesignslist = [];
    this.completeddesignslist = [];
    this.delivereddesignslist = [];
    this.onholdpestampslist = [];
    this.skip = 0;

    const companyid = list.selectedOptions.selected.map((item) => item.value);
    this.creatorparentid = companyid[0];
    if (this.reviwerid && [1].includes(this.activeTab)) {
      this.isLoader = true;
      this.newpestamplist = [];
      this.indesignslist = [];
      this.completeddesignslist = [];
      this.delivereddesignslist = [];

      this.skip = 0;
      this.limit = 10;

      // if (this.activeTab == 1) {
      //   this.fetchDesignbyDesignerId();
      // } else {
      //   this.fetchDesignbyReviewerId();
      // }
      return;
    }
    // this.companyitemRef = this.db.object(
    //   FIREBASE_DB_CONSTANTS.KEYWORD + this.creatorparentid
    // );

    this.fetchAllPestampsCount();
    //     let searchdata = "";
    //     if (this.reviwerid) {
    //       searchdata = "id=" + this.reviwerid + "&";
    //     }

    //     if (this.creatorparentid) {
    //       if (this.statusfilter && this.statusfilter == "declined") {
    //         searchdata =
    //           searchdata +
    //           "limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&creatorparentid=" +
    //           this.creatorparentid +
    //           "&status=declined";
    //       } else if (
    //         this.statusfilter &&
    //         this.statusfilter == "isinrevisionstate"
    //       ) {
    //         searchdata =
    //           searchdata +
    //           "isinrevisionstate=true&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&creatorparentid=" +
    //           this.creatorparentid;
    //       } else {
    //         searchdata =
    //           searchdata +
    //           "limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&creatorparentid=" +
    //           this.creatorparentid +
    //           "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
    //       }
    //     } else {
    //       if (this.statusfilter && this.statusfilter == "declined") {
    //         searchdata =
    //           searchdata +
    //           "limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&status=declined";
    //       } else if (
    //         this.statusfilter &&
    //         this.statusfilter == "isinrevisionstate"
    //       ) {
    //         searchdata =
    //           searchdata +
    //           "isinrevisionstate=true&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip;
    //       } else {
    //         searchdata =
    //           searchdata +
    //           "limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
    //       }
    //     }

    this.allfunctions();
  }

  // onCompanyChanged(list) {
  //   // this.isLoader = true;
  //   this.newpestamplist = [];
  //   this.indesignslist = [];
  //   this.completeddesignslist = [];
  //   this.delivereddesignslist = [];

  //   this.skip = 0;
  //   this.limit = 10;

  //   const companyid = list.selectedOptions.selected.map((item) => item.value);
  //   this.creatorparentid = companyid[0];

  //   this.selectedcompanynewpestampsRef = this.db.object(
  //     FIREBASE_DB_CONSTANTS.KEYWORD + this.creatorparentid
  //   );
  //   this.fetchAllPestampsCount();
  // }
  oncompanyScroll(): void {
    console.log("inside company Scroll:");
    this.scrolling = true;
    this.skip += 10;
    this.getCompanies();
  }

  getCompanies(): void {
    this.commonservice.getCompanies1("pestamp").subscribe((response) => {
      this.scrolling = false;
      response.sort((a, b) =>
        a.companyname.toLocaleLowerCase() > b.companyname.toLocaleLowerCase()
          ? 1
          : -1
      );
      this.genericService.companies = response;
      this.companies = response;
      this.companyList = [...this.companyList, ...response]
      this.fetcheachcompanynewdesigncount();
      this.changeDetectorRef.detectChanges();
    },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.scrolling = false;
      });
  }
  radioChange($event: MatRadioChange): void {
    this.statusfilter = "";
    if ($event.source.name === "statusfilter") {
      this.statusfilter = $event.value;

      this.newpestamplist = [];
      this.isnewdesignslistloading = true;
      let searchdata;
      let parentid;
      this.skip = 0;
      this.limit = 10;

      if (this.creatorparentid) {
        if (this.statusfilter && this.statusfilter == "declined") {
          searchdata =
            "limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=declined";
        } else if (
          this.statusfilter &&
          this.statusfilter == "isinrevisionstate"
        ) {
          searchdata =
            "isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
        } else {
          searchdata =
            "limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
        }

        parentid = this.creatorparentid;
      } else {
        if (this.statusfilter && this.statusfilter == "declined") {
          searchdata =
            "limit=" + this.limit + "&skip=" + this.skip + "&status=declined";
        } else if (
          this.statusfilter &&
          this.statusfilter == "isinrevisionstate"
        ) {
          searchdata =
            "isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
        } else {
          searchdata =
            "limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
        }

        parentid = "";
      }

      this.pestampService
        .getPestampCount1(parentid, this.statusfilter)
        .subscribe(
          (response) => {
            this.allnewpestamp = response["newpestamp"];
            this.allinstamping = response["instamping"];
            this.allcompleted = response["completed"];
            this.alldelivered = response["delivered"];
            this.allonholdpestamp = response["onhold"];
            this.changeDetectorRef.detectChanges();
            this.fetchNewPestampsData(searchdata);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    }
  }

  onViewAllChanged(): void {
    this.Array = [];
    this.allArchives = [];
    this.statusfilterclear = null;
    this.statusfilter = "";
    this.reviwerid = null;
    this.creatorparentid = "";
    this.isLoader = true;

    this.newpestamplist = [];
    this.indesignslist = [];
    this.completeddesignslist = [];
    this.onholdpestampslist = [];
    this.delivereddesignslist = [];

    this.limit = 10;

    this.skip = 0;
    this.creatorparentid = undefined;

    // if (this.listDesigner) {
    //   this.listDesigner.options.forEach((opt) => {
    //     opt.selected = false;
    //   });
    // }

    this.fetchAllPestampsCount();
    // const searchdata =
    //   "limit=" +
    //   this.limit +
    //   "&skip=" +
    //   this.skip +
    //   "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
    this.allfunctions();
  }

  removeItemFromList(type: LISTTYPE): void {
    switch (type) {
      case LISTTYPE.NEW:
        this.allnewpestamp -= 1;
        this.newpestamplist.splice(this.listactionindex, 1);
        this.newpestamplist = [...this.newpestamplist];
        break;
      case LISTTYPE.ONHOLD:
        this.allonholdpestamp -= 1;
        this.onholdpestampslist.splice(this.listactionindex, 1);
        this.onholdpestampslist = [...this.onholdpestampslist];
        break;
      case LISTTYPE.INDESIGN:
        this.indesigns -= 1;
        this.indesignslist.splice(this.listactionindex, 1);
        this.indesignslist = [...this.indesignslist];
        break;
      case LISTTYPE.COMPLETED:
        this.completeddesigns -= 1;
        this.completeddesignslist.splice(this.listactionindex, 1);
        this.completeddesignslist = [...this.completeddesignslist];
        break;
      case LISTTYPE.DELIVERED:
        this.delivereddesigns -= 1;
        this.delivereddesignslist.splice(this.listactionindex, 1);
        this.delivereddesignslist = [...this.delivereddesignslist];
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  updateItemInList(type: LISTTYPE, newrecord: Pestamp): void {
    newrecord = this.fillinDynamicDataForSingleRecord(newrecord);
    switch (type) {
      case LISTTYPE.NEW:
        this.newpestamplist.splice(this.listactionindex, 1, newrecord);
        this.newpestamplist = [...this.newpestamplist];
        break;
      case LISTTYPE.ONHOLD:
        this.onholdpestampslist.splice(this.listactionindex, 1, newrecord);
        this.onholdpestampslist = [...this.onholdpestampslist];
        break;
      case LISTTYPE.INDESIGN:
        this.indesignslist.splice(this.listactionindex, 1, newrecord);
        this.indesignslist = [...this.indesignslist];
        break;
      case LISTTYPE.COMPLETED:
        this.completeddesignslist.splice(this.listactionindex, 1, newrecord);
        this.completeddesignslist = [...this.completeddesignslist];
        break;
      case LISTTYPE.DELIVERED:
        this.delivereddesignslist.splice(this.listactionindex, 1, newrecord);
        this.delivereddesignslist = [...this.delivereddesignslist];
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  addItemToList(type: LISTTYPE, newrecord: Pestamp): void {
    newrecord = this.fillinDynamicDataForSingleRecord(newrecord);
    switch (type) {
      case LISTTYPE.NEW:
        this.newpestamplist.splice(0, 0, newrecord);
        this.newpestamplist = [...this.newpestamplist];
        this.newdesigns = this.newpestamplist.length;
        break;
      case LISTTYPE.ONHOLD:
        this.onholdpestampslist.splice(0, 0, newrecord);
        this.onholdpestampslist = [...this.onholdpestampslist];
        this.allonholdpestamp += 1;
        break;
      case LISTTYPE.INDESIGN:
        this.indesignslist.splice(0, 0, newrecord);
        this.indesignslist = [...this.indesignslist];
        this.indesigns = this.indesignslist.length;
        break;
      case LISTTYPE.COMPLETED:
        this.completeddesignslist.splice(0, 0, newrecord);
        this.completeddesignslist = [...this.completeddesignslist];
        this.completeddesigns = this.completeddesignslist.length;
        break;
      case LISTTYPE.DELIVERED:
        this.delivereddesignslist.splice(0, 0, newrecord);
        this.delivereddesignslist = [...this.delivereddesignslist];
        this.delivereddesigns = this.delivereddesignslist.length;
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  openAddPestampDialog(): void {
    this.Array = [];
    this.allArchives = [];
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddpestampdialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, isDataUpdated: false, isPermitmode: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.allnewpestamp = parseInt("" + this.allnewpestamp) + 1;
        this.addItemToList(LISTTYPE.NEW, result.pestamp);
      }
    });
  }

  openEditDesignDialog(type: LISTTYPE, pestamp: Pestamp): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddpestampdialogComponent, {
      disableClose: true,
      width: "80%",
      autoFocus: false,
      data: { isEditMode: true, isDataUpdated: false, pestamp: pestamp },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.updateItemInList(type, result.pestamp);
        //  this.newpestamplist[this.listactionindex]=result.pestamp;
        this.changeDetectorRef.detectChanges();
      }
      if (
        result.pestamp.personname != pestamp.personname &&
        result.pestamp.status != "created"
      ) {
        const guid = "" + pestamp.chatid;
        const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
        const groupName =
          pestamp.type +
          "_" +
          result.pestamp.personname +
          "_" +
          result.pestamp.email +
          "_" +
          currentdatetime;
        this.updategroup(guid, groupName, pestamp.groupchatpassword);
      }
    });
  }

  updategroup(guid, groupname, grouppassword): void {
    const GUID = guid;
    const groupName = groupname;
    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = grouppassword
    const group = new CometChat.Group(GUID, groupName, groupType, password);

    CometChat.updateGroup(group).then(
      () => {
        // do nothing.
      },
      () => {
        // do nothing.
      }
    );
  }
  openPestampDetailDialog(pestamp: Pestamp, type: LISTTYPE, index): void {
    this.activitybarClose();
    this.listactionindex = index;
    this.isLoading = true;
    this.changeDetectorRef.detectChanges();
    this.fetchPestampDetails(pestamp, type);
  }

  fetchDesignsDetail(pestamp: Pestamp, type: LISTTYPE): void {
    if (pestamp.design != null) {
      this.getPermitDetails(pestamp.design.id, pestamp, type);
    } else {
      // this.isLoading = false;
      // this.changeDetectorRef.detectChanges()
      this.openpestampdialog(pestamp, type);
    }
    // if (pestamp.design != null) {
    //   if (pestamp.design.survey != null) {
    //     this.getsurveydetails(pestamp.design.survey, pestamp, type);
    //   } else {
    //     this.isLoading = false;
    //     this.changeDetectorRef.detectChanges()
    //     this.openpestampdialog(pestamp, type);
    //   }
    // }
    // else {
    //   this.isLoading = false;
    //   this.changeDetectorRef.detectChanges()
    //   this.openpestampdialog(pestamp, type);
    // }
  }

  getPermitDetails(permitid, pestamp, type): void {
    this.designService.getDesignDetails(permitid).subscribe((response) => {
      this.permitDesign = response;
      if (response.survey != null) {
        this.getsurveydetails(response.survey.id, pestamp, type);
      } else {
        // this.isLoading = false;
        // this.changeDetectorRef.detectChanges()
        this.openpestampdialog(pestamp, type);
      }
    });
  }

  getsurveydetails(surveyid, pestamp, type): void {
    this.surveyService.getSurveyDetails(surveyid).subscribe((response) => {
      this.surveydetails = response;
      // this.isLoading = false;
      // this.changeDetectorRef.detectChanges()
      if (this.surveydetails.prelimdesignsurvey != null) {
        this.designService
          .getDesignDetails(this.surveydetails.prelimdesignsurvey.id)
          .subscribe((response) => {
            this.prelimDesign = response;
            // this.isLoading = false;
            // this.changeDetectorRef.detectChanges()
            this.openpestampdialog(pestamp, type);
          });
      } else {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.openpestampdialog(pestamp, type);
      }
    });
  }

  openpestampdialog(pestamp: Pestamp, type: LISTTYPE): void {
    this.activitybarClose();
    // this.loaderservice.hide();
    this.isLoading = false;
    this.changeDetectorRef.detectChanges();
    const dialogRef = this.dialog.open(MasterdetailpageComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        pestamp: pestamp,
        triggerPestampEditEvent: false,
        triggerDeleteEvent: false,
        isPermitmode: true,
        permit: this.permitDesign,
        survey: this.surveydetails,
        prelim: this.prelimDesign,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.permitDesign = null;
      this.prelimDesign = null;
      this.surveydetails = null;
      this._snackBar.dismiss();
      if (result.triggerPestampEditEvent) {
        this.openEditDesignDialog(type, pestamp);
      }

      if (result.triggerDeleteEvent) {
        this.removeItemFromList(type);
      }

      if (result.refreshDashboard) {
        this.removeItemFromList(type);
        this.addItemToList(LISTTYPE.DELIVERED, result.pestamp);
        this.fetchAllPestampsCount();
      }
    });
  }

  allfunctions(): void {
    // this.fetchNewDesignsData(searchdata);
    this.fetchInDesigningDesignsData();
    this.fetchCompletedDesignsData();
    this.fetchDeliveredDesignsData();
  }

  getPestampsCharges(pestamp, index): void {
    this.openOrderDesignDialog(pestamp, index);
  }

  openOrderDesignDialog(pestamp, index): void {
    this.listactionindex = index;
    var pestamp = pestamp;
    let amounttopay: any;
    const dialogRef = this.dialog.open(OrderpestampsdialogComponent, {
      width: "30%",
      autoFocus: false,
      panelClass: "white-modalbox",
      disableClose: true,
      data: {
        isConfirmed: false,
        pestampid: pestamp.id,
        pestamp: pestamp,
        amounttopay: amounttopay,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.changeDetectorRef.detectChanges();
        this.amounttopay = result.amounttopay;
        this.updatedesign(pestamp);
      }
    });
  }

  openpendingpayments(event: Event, pestamp: Pestamp, type: LISTTYPE): void {
    this.activitybarClose();
    event.stopPropagation();
    var pestamp = pestamp;
    const dialogRef = this.dialog.open(PendingpaymentsdialogComponent, {
      width: "30%",
      autoFocus: false,
      disableClose: true,
      data: { isConfirmed: false, pestampid: pestamp.id, pestamp: pestamp },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.removeItemFromList(type);
        this.updateItemInList(type, result.pestamp);
        // this.fetchDeliveredDesignsData();
      }
    });
  }

  openAssignDesignerDialog(
    record: Pestamp,
    event: Event,
    index,
    type: LISTTYPE,
    requesttype: string
  ): void {
    if (this.isClient && !this.isPeSuperadmin) {
      this.activitybarClose();
      event.stopPropagation();
      this.getPestampsCharges(record, index);
    } else {
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(AssignpeengineersComponent, {
        width: "50%",
        autoFocus: false,
        disableClose: true,
        data: { isEditMode: false, pestamp: record, requesttype: requesttype },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.refreshDashboard) {
          // this.loaderservice.show();
          if (
            result.pestamp.status == "outsourced" ||
            result.pestamp.status == "pesuperadminassigned"
          ) {
            this.updateItemInList(LISTTYPE.NEW, result.pestamp);
          } else {
            this.removeItemFromList(type);
            this.addItemToList(LISTTYPE.INDESIGN, result.pestamp);
          }
          /*   else if (record.type != "both") {
              this.removeItemFromList(type, record);
              this.addItemToList(LISTTYPE.INDESIGN, result.pestamp);
            }
            else if (record.type == "both") {
              this.updateItemInList(LISTTYPE.NEW, result.pestamp);
            } */
          this.fetchAllPestampsCount();
        }
      });
    }
  }

  pestampSelfAssign(record: Pestamp, event: Event, type: LISTTYPE): void {
    // this.loaderservice.show();
    event.stopPropagation();
    const pestampstarttime = new Date();

    const postData = {
      assignedto: this.loggedInUser.id,
      status: "assigned",
      pestampstarttime: pestampstarttime,
    };

    this.isLoading = true;
    this.loadingmessage = "Assigning";
    this.designService.assignPestamps(record.id, postData).subscribe(
      (response) => {
        // this.data.pestamp = response;
        // this.isLoading = true;

        this.isLoading = false;
        // this.addUserToGroupChat();
        if (type == LISTTYPE.INDESIGN) {
          // this.updateItemInList(type, response);
          this.indesignslist = [];
          this.isindesignslistloading = true;
          this.skip = 0;
          this.fetchInDesigningDesignsData();
        } else {
          this.removeItemFromList(type);
          this.addItemToList(LISTTYPE.INDESIGN, response);
        }
        this.changeDetectorRef.detectChanges();
        this.fetchAllPestampsCount();
        this.notifyService.showSuccess(
          "PE Stamp request has been successfully self assigned.",
          "Success"
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  openReAssignDesignerDialog(record: Pestamp, event: Event, index): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const pestampacceptancestarttime = new Date();
    pestampacceptancestarttime.setMinutes(
      pestampacceptancestarttime.getMinutes() + 15
    );

    let postData = {};
    if (record.declinedbypeengineer == true) {
      postData = {
        isoutsourced: "true",
        status: "assigned",
        declinedbypeengineer: "false",
      };
    } else if (
      record.declinedbystructuralpeengineer == true &&
      record.declinedbyelectricalpeengineer == false
    ) {
      postData = {
        isoutsourced: "true",
        status: "accepted",
        declinedbystructuralpeengineer: "false",
      };
    } else if (
      record.declinedbyelectricalpeengineer == true &&
      record.declinedbystructuralpeengineer == false
    ) {
      postData = {
        isoutsourced: "true",
        status: "accepted",
        declinedbyelectricalpeengineer: "false",
      };
    } else if (
      record.declinedbyelectricalpeengineer == true &&
      record.declinedbystructuralpeengineer == true
    ) {
      postData = {
        isoutsourced: "true",
        status: "assigned",
        declinedbyelectricalpeengineer: "false",
      };
    } else if (record.declinedbypesuperadmin == true) {
      postData = {
        isoutsourced: "true",
        status: "pesuperadminassigned",
        declinedbypesuperadmin: "false",
      };
    } else {
      postData = {
        isoutsourced: "true",
        status: "outsourced",
        pestampacceptancestarttime: pestampacceptancestarttime,
      };
    }
    this.loaderservice.show();
    this.pestampService.assignPestamp(record.id, postData).subscribe(
      (response) => {
        this.notifyService.showSuccess(
          "PE stamp request has been successfully reassigned to WattMonk.",
          "Success"
        );
        this.loaderservice.hide();
        if (response.status == "assigned") {
          this.removeItemFromList(LISTTYPE.NEW);
          this.addItemToList(LISTTYPE.INDESIGN, response);
        } else {
          this.removeItemFromList(LISTTYPE.ONHOLD);
          this.fetchAllPestampsCount();
        }
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  sendPestamptowattmonk(record): void {
    const pestampacceptancestarttime = new Date();
    pestampacceptancestarttime.setMinutes(
      pestampacceptancestarttime.getMinutes() + 15
    );
    this.isOutsourced = true;
    let postData = {};

    postData = {
      outsourcedto: 232,
      isoutsourced: "true",
      status: "outsourced",
      paymenttype: localStorage.getItem("paymenttype"),
      pestampacceptancestarttime: pestampacceptancestarttime,
      paymentstatus: localStorage.getItem("paymentstatus"),
      amount: this.amounttopay,
    };

    this.pestampService.assignPestamp(record.id, postData).subscribe(
      (response) => {
        // this.isLoading = false;
        this.updateItemInList(LISTTYPE.NEW, response);
        // this.notifyService.showSuccess("PE Stamps request has been successfully assigned.","Success");
        // this.changeDetectorRef.detectChanges();
        this.authService.currentUserValue.user.amount =
          response.createdby.amount;
        this.newpestampRef.update({ count: this.newpestampcounts + 1 });
        localStorage.removeItem("paymenttype");
        localStorage.removeItem("paymentstatus");
        this.getClientsadmins(response);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  updatedesign(record): void {
    const paymenttype = localStorage.getItem("paymenttype");

    if (paymenttype == "direct") {
      const inputdata = {
        amount: this.amounttopay,
        pestampid: record.id,
        user: this.loggedInUser.id,
        token: this.genericService.stripepaymenttoken.id,
      };
      this.pestampService.createdirectpayment(inputdata).subscribe(
        () => {
          this.sendPestamptowattmonk(record);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    } else {
      this.sendPestamptowattmonk(record);
    }
  }

  ShareOnWhatsapp(): void {
    this.activitybarClose();
    event.stopPropagation();
  }

  shareDesign(pestamp: Pestamp, event: Event): void {
    this.activitybarClose();
    event.stopPropagation();
    const dialogRef = this.dialog.open(ShareprelimdesigndialogComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      data: { pestamp: pestamp },
    });
    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }

  downloadPestamp(pestamp: Pestamp, event): void {
    this.loaderservice.show();
    event.stopPropagation();
    this.isLoading = true;
    pestamp.stampedfiles.forEach((element) => {
      const fileurl = element.url;
      const filename = "stampedfile" + element.ext;
      axios({
        url: fileurl,
        //url: fileurl,
        method: "GET",
        responseType: "blob",
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        this.loaderservice.hide();
      });
    });
    this.isLoading = false;
  }

  downloadelectricalPestamp(pestamp: Pestamp, event): void {
    event.stopPropagation();
    for (let i = 0; i < pestamp.electricalstampedfiles.length; i++) {
      const fileurl = pestamp.electricalstampedfiles[i].url;
      const filename =
        "electricalstampedfile" + pestamp.electricalstampedfiles[i].ext;
      axios({
        url: fileurl,
        //url: fileurl,
        method: "GET",
        responseType: "blob",
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      });
    }
  }

  downloadstructuralPestamp(pestamp: Pestamp, event): void {
    event.stopPropagation();
    for (let i = 0; i < pestamp.structuralstampedfiles.length; i++) {
      const fileurl = pestamp.structuralstampedfiles[i].url;
      const filename =
        "structuralstampedfile" + pestamp.structuralstampedfiles[i].ext;
      axios({
        url: fileurl,
        //url: fileurl,
        method: "GET",
        responseType: "blob",
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      });
    }
  }

  openPestampDeclineDialog(record: Pestamp, type: LISTTYPE): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(PestampDeclineDialog, {
      width: "50%",
      disableClose: true,
      data: { pestamp: record },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        // this.loaderservice.show();
        this.isnewdesignslistloading = true;
        // this.removeItemFromList(LISTTYPE.ONHOLD,result.design);
        if (type == LISTTYPE.NEW) {
          this.removeItemFromList(LISTTYPE.NEW);
        } else if (type == LISTTYPE.INDESIGN) {
          this.removeItemFromList(LISTTYPE.INDESIGN);
        } else if (type == LISTTYPE.COMPLETED) {
          this.removeItemFromList(LISTTYPE.COMPLETED);
        }
        this.fetchAllPestampsCount();
      }
    });
  }

  openDesignResendDialog(record: Pestamp): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(PestampResendDialog, {
      width: "73%",
      height: "90%",
      disableClose: true,
      data: { pestamp: record, isWattmonkUser: this.isWattmonkUser },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.removeItemFromList(LISTTYPE.DELIVERED);
        this.addItemToList(LISTTYPE.NEW, result.pestamp);
        this.fetchAllPestampsCount();
      }
    });
  }

  maintabchange(tabChangeEvent: MatTabChangeEvent): void {
    this.Array = [];
    this.allArchives = [];
    this.istabchangeevent = true;
    this.activeTab = tabChangeEvent.index;
    this.skip = 0;
    this.limit = 10;
    this.newpestamplist = [];
    this.indesignslist = [];
    this.completeddesignslist = [];
    this.delivereddesignslist = [];
    this.onholdpestampslist = [];
    this.selectedTabIndex = tabChangeEvent.index;
    if (![2].includes(this.selectedTabIndex)) {
      this.reviwerid = null;
    }

    this.fetchAllPestampsCount();

    // const searchdata
    // this.skip = 0;
    // if (this.creatorparentid) {
    //   searchdata =
    //     "limit=" +
    //     this.limit +
    //     "&skip=" +
    //     this.skip +
    //     "&creatorparentid=" +
    //     this.creatorparentid +
    //     "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
    // } else {
    //   searchdata =
    //     "limit=" +
    //     this.limit +
    //     "&skip=" +
    //     this.skip +
    //     "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
    // }

    switch (tabChangeEvent.index) {
      case 0:
        this.isnewdesignslistloading = true;
        //   this.fetchNewPestampsData("status=created&status=outsourced&status=accepted&status=declined");
        break;
      case 1:
        this.onholdpestampslist.length = 0;
        this.isonholdpestamplistloading = true;
        this.fetchOnHoldPestampData();
        break;
      case 2:
        this.indesignslist.length = 0;
        this.isindesignslistloading = true;
        this.fetchInDesigningDesignsData();
        break;
      /*  case 3:
         this.iscompleteddesignslistloading = true;
         this.completeddesignslist.length = 0;
         this.fetchCompletedDesignsData();
         break; */
      case 3:
        this.isdelivereddesignslistloading = true;
        this.delivereddesignslist.length = 0;
        this.fetchDeliveredDesignsData();
        break;

      default:
        break;
    }
  }

  selectedarchive(designId, index, type): void {
    if (type == "single") {
      if (this.allArchives[index]) {
        this.allArchives[index] = false;

        this.Array.filter((item, ind) => {
          if (item == designId) {
            this.Array.splice(ind, 1);
          }
        });

        this.counting = this.Array.length;
      } else {
        this.allArchives[index] = true;
        this.Array.push(designId);
        this.counting = this.Array.length;
      }
    }

    if (type == "all") {
      this.Array = [];
      this.delivereddesignslist.map((item, index) => {
        this.Array[index] = item.id;
        this.allArchives[index] = true;
      });
      this.counting = this.Array.length;
    }
  }

  onarchivebuttonclick(): void {
    this.loaderservice.show();
    this.isLoading = true;
    const postData = {
      type: "pestamp",
      itemids: this.Array,
    };

    this.archiveService.moveselecteditemtoarchive(postData).subscribe(
      (response) => {
        if (response) {
          this.loaderservice.hide();
          this.notifyService.showSuccess(
            "Request data has been Archive successfully.",
            "Success"
          );
          this.isLoading = false;
          this.isdelivereddesignslistloading = true;
          this.fetchAllPestampsCount();
          this.delivereddesignslist = [];
          this.fetchDeliveredDesignsData();
          this.Array = [];
          this.allArchives = [];
          this.changeDetectorRef.detectChanges();
        }
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onScrollNewPestamp(): void {
    const end = this.newpestampscroller.getRenderedRange().end;
    const total = this.newpestampscroller.getDataLength();

    if (end == total && this.allnewpestamp > total) {
      this.Newscrolling = true;

      let searchdata;

      this.skip += 10;

      if (this.creatorparentid) {
        if (this.statusfilter && this.statusfilter == "declined") {
          searchdata =
            "limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=declined";
        } else if (
          this.statusfilter &&
          this.statusfilter == "isinrevisionstate"
        ) {
          searchdata =
            "isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid;
        } else {
          searchdata =
            "limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
        }

      } else {
        if (this.statusfilter && this.statusfilter == "declined") {
          searchdata =
            "limit=" + this.limit + "&skip=" + this.skip + "&status=declined";
        } else if (
          this.statusfilter &&
          this.statusfilter == "isinrevisionstate"
        ) {
          searchdata =
            "isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
        } else {
          searchdata =
            "limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
        }

      }

      this.fetchNewPestampsData(searchdata);
    }
  }

  // onScrollNewPestamp() {
  //   const end = this.newpestampscroller.getRenderedRange().end;
  //   const total = this.newpestampscroller.getDataLength();
  //   if (end == total && this.allnewpestamp > total) {
  //     this.scrolling = true;
  //     this.skip += 10;
  //     this.limit = 10;
  //     this.fetchNewPestampsData("status=created&status=outsourced&status=accepted&status=declined&limit=" +
  //       this.limit + "&skip=" + this.skip);
  //   }
  // }

  onScrollInstampingPestamp(): void {
    const end = this.instampingscroller.getRenderedRange().end;
    const total = this.instampingscroller.getDataLength();
    if (end == total && this.allinstamping > total) {
      this.Stampingscrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchInDesigningDesignsData();
    }
  }

  onScrollCompletedPestamp(): void {
    const end = this.completedpestampscroller.getRenderedRange().end;
    const total = this.completedpestampscroller.getDataLength();
    if (end == total && this.allcompleted > total) {
      this.scrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchCompletedDesignsData();
    }
  }

  onScrollDeliveredPestamp(): void {
    const end = this.deliveredpestampscroller.getRenderedRange().end;
    const total = this.deliveredpestampscroller.getDataLength();
    if (end == total && this.alldelivered > total) {
      this.Deliveredscrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchDeliveredDesignsData();
    }
  }

  onScrollonhold(): void {
    const end = this.onholdviewport.getRenderedRange().end;
    const total = this.onholdviewport.getDataLength();

    if (end == total && this.allonholdpestamp > total) {
      this.Holdscrolling = true;
      this.skip += 10;
      this.fetchOnHoldPestampData();
    }
  }

  fetchAllPestampsCount(): void {
    this.newpestamplist = [];
    this.isnewdesignslistloading = true;
    this.skip = 0;
    let searchdata;
    let parentid;
    const indexlimit = parseInt(localStorage.getItem("index"));
    if (indexlimit < 10) {
      this.limit = 10;
    } else if (indexlimit > 10) {
      this.limit = indexlimit + 10;
    } else {
      this.limit = 10;
    }
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }
    if (this.creatorparentid) {
      if (this.statusfilter && this.statusfilter == "declined") {
        searchdata =
          "limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&creatorparentid=" +
          this.creatorparentid +
          "&status=declined";
      } else if (
        this.statusfilter &&
        this.statusfilter == "isinrevisionstate"
      ) {
        searchdata =
          "isinrevisionstate=true&limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&creatorparentid=" +
          this.creatorparentid;
      } else {
        searchdata =
          "limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&creatorparentid=" +
          this.creatorparentid +
          "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
      }

      parentid = this.creatorparentid;
    } else {
      if (this.statusfilter && this.statusfilter == "declined") {
        searchdata =
          "limit=" + this.limit + "&skip=" + this.skip + "&status=declined";
      } else if (
        this.statusfilter &&
        this.statusfilter == "isinrevisionstate"
      ) {
        searchdata =
          "isinrevisionstate=true&limit=" + this.limit + "&skip=" + this.skip;
      } else {
        searchdata =
          "limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
      }

      parentid = "";
    }

    this.pestampService
      .getPestampCount1(parentid, this.statusfilter, this.reviwerid)
      .subscribe(
        (response) => {
          this.allnewpestamp = response["newpestamp"];
          this.allinstamping = response["instamping"];
          this.allcompleted = response["completed"];
          this.alldelivered = response["delivered"];
          this.allonholdpestamp = response["onhold"];
          this.changeDetectorRef.detectChanges();
          this.fetchNewPestampsData(searchdata);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  // fetchAllPestampsCount() {
  //   const userid
  //   if (this.creatorparentid != undefined) {
  //     userid = this.creatorparentid
  //   }
  //   else {
  //     userid = this.loggedInUser.parent.id
  //   }
  //   this.pestampService.getAllDesignsCount(userid).subscribe(
  //     response => {
  //       console.log(response);
  //       this.allnewpestamp = response["newpestamp"];
  //       this.allinstamping = response["instamping"];
  //       this.allcompleted = response["completed"];
  //       this.alldelivered = response["delivered"];
  //       this.changeDetectorRef.detectChanges();
  //       this.fetchNewPestampsData("status=created&status=outsourced&status=accepted&status=declined&limit=" +
  //         this.limit + "&skip=" + this.skip);
  //     },
  //     error => {
  //       this.notifyService.showError(error, "Error");
  //     }
  //   );
  // }

  //PRELIM LISTS APIS
  fetchPestampDetails(pestamp: Pestamp, type: LISTTYPE): void {
    // this.loaderservice.show();
    this.pestampService.getPestampDetails(pestamp.id).subscribe(
      (response) => {
        this.fetchDesignsDetail(response, type);
        // this.loaderservice.hide();
      },
      (error) => {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.notifyService.showError(error, "Error");
        // this.loaderservice.hide();
      }
    );
  }

  filtervalue(event: MatSelectChange): void {
    this.Array = [];
    this.allArchives = [];
    let searchdata;
    if (
      this.ordertypefilterstatus != null &&
      this.orderbyfilterstatus != "null" &&
      this.orderbyfilterstatus != null
    ) {
      this.newpestamplist = [];
      this.indesignslist = [];
      this.completeddesignslist = [];
      this.delivereddesignslist = [];
      this.onholdpestampslist = [];
      this.sorting = true;

      this.limit = 10;
      this.skip = 0;
      this.sortingdata =
        "&orderby=" +
        this.orderbyfilterstatus +
        "&ordertype=" +
        this.ordertypefilterstatus;
      if (this.activeTab == 0) {
        this.isnewdesignslistloading = true;

        if (this.reviwerid) {
          searchdata = "id=" + this.reviwerid + "&";
        }
        if (this.creatorparentid) {
          if (this.statusfilter && this.statusfilter == "declined") {
            searchdata =
              "limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&creatorparentid=" +
              this.creatorparentid +
              "&status=declined";
          } else if (
            this.statusfilter &&
            this.statusfilter == "isinrevisionstate"
          ) {
            searchdata =
              "isinrevisionstate=true&limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&creatorparentid=" +
              this.creatorparentid;
          } else {
            searchdata =
              "limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&creatorparentid=" +
              this.creatorparentid +
              "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
          }

        } else {
          if (this.statusfilter && this.statusfilter == "declined") {
            searchdata =
              "limit=" + this.limit + "&skip=" + this.skip + "&status=declined";
          } else if (
            this.statusfilter &&
            this.statusfilter == "isinrevisionstate"
          ) {
            searchdata =
              "isinrevisionstate=true&limit=" +
              this.limit +
              "&skip=" +
              this.skip;
          } else {
            searchdata =
              "limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&status=created&status=outsourced&status=accepted&status=pesuperadminassigned";
          }


        }

        this.fetchNewPestampsData(searchdata);
      } else if (this.activeTab == 1) {
        this.onholdpestampslist.length = 0;
        this.isonholdpestamplistloading = true;
        this.fetchOnHoldPestampData();
      } else if (this.activeTab == 2) {
        this.indesignslist.length = 0;
        this.isindesignslistloading = true;
        this.fetchInDesigningDesignsData();
      } else if (this.activeTab == 3) {
        this.iscompleteddesignslistloading = true;
        this.completeddesignslist.length = 0;
        this.fetchCompletedDesignsData();
      } else if (this.activeTab == 4) {
        this.isdelivereddesignslistloading = true;
        this.delivereddesignslist.length = 0;
        this.fetchDeliveredDesignsData();
      }
    } else {
      this.sorting = false;
      if (event.value == "null") {
        this.sortingdata = "";
        this.ordertypefilterstatus = null;
        this.orderbyfilterstatus = null;
        if (this.activeTab == 0) {
          this.isnewdesignslistloading = true;
          this.fetchAllPestampsCount();
        } else if (this.activeTab == 1) {
          this.onholdpestampslist.length = 0;
          this.isonholdpestamplistloading = true;
          this.fetchOnHoldPestampData();
        } else if (this.activeTab == 2) {
          this.indesignslist.length = 0;
          this.isindesignslistloading = true;
          this.fetchInDesigningDesignsData();
        } else if (this.activeTab == 3) {
          this.iscompleteddesignslistloading = true;
          this.completeddesignslist.length = 0;
          this.fetchCompletedDesignsData();
        } else if (this.activeTab == 4) {
          this.isdelivereddesignslistloading = true;
          this.delivereddesignslist.length = 0;
          this.fetchDeliveredDesignsData();
        }
      }
    }

    // this.changeDetectorRef.detectChanges()
  }

  fetchNewPestampsData(search: string): void {
    if (this.sorting) {
      search = search + this.sortingdata;
    }
    this.pestampService.getFilteredDesigns(search).subscribe(
      (response) => {
        this.newdesigns = response.length;
        if (response.length > 0) {
          this.getnewpestamp = this.fillinDynamicData(response);
          for (let i = 0, len = this.getnewpestamp.length; i < len; ++i) {
            this.newpestamplist.push(this.getnewpestamp[i]);
          }
          this.newpestamplist = [...this.newpestamplist];
        }

        this.loaderservice.hide();

        this.isLoader = false;
        // this.scrolling = false;
        this.Newscrolling = false;
        this.isnewdesignslistloading = false;
        this.changeDetectorRef.detectChanges();
        if (!this.isClient) {
          this.newpestampRef.update({ count: 0 });
        }
        if (this.istabchangeevent) {
          this.istabchangeevent = false;
        }
        /*  to check loggedIn user added to group chat or not */
        /*    this.newpestamplist.forEach(element => {
              const groupMembersRequest = new CometChat.GroupMembersRequestBuilder(element.chatid)
                .setLimit(30)
                .build();
              groupMembersRequest.fetchNext().then(
                groupMembers => {
                  element.addedtogroupchat=true;
                },
                error => {
                  // console.log("Group Member list fetching failed with exception:", error);
                }
              );
            }) */
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchOnHoldPestampData(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }

    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=declined";
    } else {
      searchdata =
        searchdata +
        "limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=declined";
    }
    if (this.sorting) {
      searchdata = searchdata + this.sortingdata;
    }
    this.pestampService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.onholdpestamps = response.length;
        if (response.length > 0) {
          this.getonholdpestamps = this.fillinDynamicData(response);

          for (let i = 0, len = this.getonholdpestamps.length; i < len; ++i) {
            this.onholdpestampslist.push(this.getonholdpestamps[i]);
          }
          this.onholdpestampslist = [...this.onholdpestampslist];
          /*  this.permitindesignslist.sort((a,b) =><any> new Date(a.created_at).getTime()- <any>new Date(b.created_at).getTime()) ; */
          this.changeDetectorRef.detectChanges();
        }
        this.isonholdpestamplistloading = false;

        // this.scrolling = false;
        this.Holdscrolling = false;
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

  fetchInDesigningDesignsData(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }

    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=assigned";
    } else {
      searchdata =
        searchdata +
        "limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=assigned";
    }
    if (this.sorting) {
      searchdata = searchdata + this.sortingdata;
    }
    this.pestampService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.indesigns = response.length;
        if (response.length > 0) {
          this.getinstampingpestamp = this.fillinDynamicData(response);
          for (
            let i = 0, len = this.getinstampingpestamp.length;
            i < len;
            ++i
          ) {
            this.indesignslist.push(this.getinstampingpestamp[i]);
          }
          this.indesignslist = [...this.indesignslist];
        }
        this.Stampingscrolling = false;
        this.isindesignslistloading = false;
        this.changeDetectorRef.detectChanges();
        if (this.istabchangeevent) {
          this.istabchangeevent = false;
        }
        /* this.indesignslist.forEach(element => {
          const groupMembersRequest = new CometChat.GroupMembersRequestBuilder(element.chatid)
            .setLimit(30)
            .build();
          groupMembersRequest.fetchNext().then(
            groupMembers => {
              element.addedtogroupchat=true;
            },
            error => {
              // console.log("Group Member list fetching failed with exception:", error);
            }
          );
        }) */
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchCompletedDesignsData(): void {
    let searchdata;
    if (this.creatorparentid) {
      searchdata =
        "limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=completed";
    } else {
      searchdata =
        "limit=" + this.limit + "&skip=" + this.skip + "&status=completed";
    }
    if (this.sorting) {
      searchdata = searchdata + this.sortingdata;
    }

    this.pestampService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.completeddesigns = response.length;
        if (response.length > 0) {
          this.getcompletedpestamp = this.fillinDynamicData(response);
          for (let i = 0, len = this.getcompletedpestamp.length; i < len; ++i) {
            this.completeddesignslist.push(this.getcompletedpestamp[i]);
          }
          this.completeddesignslist = [...this.completeddesignslist];
        }
        this.scrolling = false;
        this.iscompleteddesignslistloading = false;
        this.changeDetectorRef.detectChanges();
        if (this.istabchangeevent) {
          this.istabchangeevent = false;
        }
        /*   this.completeddesignslist.forEach(element => {
            const groupMembersRequest = new CometChat.GroupMembersRequestBuilder(element.chatid)
              .setLimit(30)
              .build();
            groupMembersRequest.fetchNext().then(
              groupMembers => {
                element.addedtogroupchat=true;
              },
              error => {
                console.log("Group Member list fetching failed with exception:", error);
              }
            );
          }) */
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchDeliveredDesignsData(): void {
    let searchdata;

    if (this.creatorparentid) {
      searchdata =
        "limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=delivered";
    } else {
      searchdata =
        "limit=" + this.limit + "&skip=" + this.skip + "&status=delivered";
    }
    if (this.sorting) {
      searchdata = searchdata + this.sortingdata;
    }
    this.pestampService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.delivereddesigns = response.length;
        if (response.length > 0) {
          this.getdeliveredpestamp = this.fillinDynamicData(response);
          for (let i = 0, len = this.getdeliveredpestamp.length; i < len; ++i) {
            this.delivereddesignslist.push(this.getdeliveredpestamp[i]);
            this.allArchives.push(false);
            this.scrollwiseDesigns = this.delivereddesignslist;
          }
          this.delivereddesignslist = [...this.delivereddesignslist];
        }
        this.Deliveredscrolling = false;
        this.isdelivereddesignslistloading = false;
        this.changeDetectorRef.detectChanges();
        if (this.istabchangeevent) {
          this.istabchangeevent = false;
        }
        /* 
        
        this.delivereddesignslist.forEach(element => {
           const groupMembersRequest = new CometChat.GroupMembersRequestBuilder(element.chatid)
             .setLimit(30)
             .build();
           groupMembersRequest.fetchNext().then(
             groupMembers => {
               element.addedtogroupchat=true;
             },
             error => {
               console.log("Group Member list fetching failed with exception:", error);
             }
           );
         }) */
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fillinDynamicData(records: Pestamp[]): Pestamp[] {
    records.forEach((element) => {
      this.fillinDynamicDataForSingleRecord(element);
    });
    this.eventEmitterService.onConversationItemSelected(0);
    return records;
  }

  fillinDynamicDataForSingleRecord(element: Pestamp): Pestamp {
    if (this.isPeSuperadmin) {
      this.peengineers.forEach((result: any) => {
        if (result.peengineertype == element.type || element.type == 'both') {
          element.peengineerexist = true;
        }
      });
    }
    if (element.status == "pesuperadminassigned") {
      element.pestampcurrentstatus = "Assigned";
    } else {
      element.pestampcurrentstatus = this.genericService.getPestampStatusName(
        element.status
      );
    }
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
    element.formattedpestamptype = this.genericService.getPestampTypeName(
      element.type
    );

    if (
      element.email != null &&
      element.hardcopies != null &&
      element.type != null &&
      element.shippingaddress != null &&
      element.roofphotos.length > 0 &&
      element.atticphotos.length > 0 &&
      element.permitplan.length > 0
    ) {
      element.isrecordcomplete = true;
    }

    //Setting acceptance timer
    if (element.status == "outsourced") {
      const acceptancedate = new Date(element.pestampacceptancestarttime);
      element.pestampacceptanceremainingtime =
        this.genericService.getRemainingTime(acceptancedate.toString());
      if (element.pestampacceptanceremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Setting design timer
    if (element.status == "assigned" || element.status == "completed") {
      const acceptancedate = new Date(element.pestampstarttime);
      acceptancedate.setHours(acceptancedate.getHours() + 2);
      element.designremainingtime = this.genericService.getRemainingTime(
        acceptancedate.toString()
      );

      if (element.designremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Code to fetch unread message count
    CometChat.getUnreadMessageCountForGroup("" + element.chatid).then(
      (array) => {
        if (array[element.chatid] != undefined) {
          element.unreadmessagecount = array[element.chatid];
          this.changeDetectorRef.detectChanges();
        } else {
          element.unreadmessagecount = 0;
          this.changeDetectorRef.detectChanges();
        }
      }
    );

    return element;
  }

  resendDesign(design: Pestamp, event: Event): void {
    this.activitybarClose();
    event.stopPropagation();

    this.loaderservice.show();
    //this.openDesignResendDialog(design);
    this.pestampService.getPestampDetails(design.id).subscribe((response) => {
      // console.log("Design getDesignDetails:",response);
      this.openDesignResendDialog(response);
      this.loaderservice.hide();
    });
  }

  declinePestampRequest(
    pestamp: Pestamp,
    event: Event,
    index: number,
    type: LISTTYPE
  ): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openPestampDeclineDialog(pestamp, type);
  }

  acceptDesignRequest(pestamp: Pestamp, event: Event, index: number): void {
    // this.isLoading = true;
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const cdate = Date.now();
    let acceptedbypesuperadmin;
    if (this.loggedInUser.role.id == ROLES.PESuperAdmin) {
      acceptedbypesuperadmin = true;
    } else {
      acceptedbypesuperadmin = false;
    }
    const postData = {
      status: "accepted",
      designacceptanceendtime: cdate,
      acknowledgedby: this.loggedInUser.id,
      declinedbypeengineer: false,
      acceptedbypesuperadmin: acceptedbypesuperadmin,
    };
    this.loaderservice.show();
    this.pestampService.acceptPestamp(pestamp.id, postData).subscribe(
      (response) => {
        this.updateItemInList(LISTTYPE.NEW, response);
        this.notifyService.showSuccess(
          "PE Stamp request has been accepted successfully.",
          "Success"
        );
        this.loaderservice.hide();
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  // declinePermitDesignRequest(design : Pestamp,event : Event, index: number){
  //   this.activitybarClose();
  //   event.stopPropagation();
  //   this.listactionindex = index;
  //   this.openPermitDesignDeclineDialog(design);
  // }

  getWattmonkadmins(): void {
    this.commonservice.getWattmonkAdmins().subscribe(
      (response) => {
        this.wattmonkadmins = response;
        this.commonservice.getWattmonkPEAdmins().subscribe((peeAdmins) => {
          peeAdmins.forEach((element) => {
            this.wattmonkadmins.push(element);
          });
        });
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getClientsadmins(data): void {
    this.commonservice.getClientAdmins(data.creatorparentid).subscribe(
      (response) => {
        this.clientadmins = response;
        this.createNewDesignChatGroup(data);
      },
      (error) => {
        this.createNewDesignChatGroup(data);
        this.notifyService.showError(error, "Error");
      }
    );
  }
  createNewDesignChatGroup(pestamp: Pestamp): void {
    const GUID = pestamp.chatid;

    const name = pestamp.personname.substring(0, 60);
    const email = pestamp.email.substring(0, 60);

    const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
    const groupName =
      pestamp.type + "_" + name + "_" + email + "_" + currentdatetime;

    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = pestamp.groupchatpassword

    const group = new CometChat.Group(GUID, groupName, groupType, password);
    const adminsid = [];
    // adminsid.push(pestamp.createdby.parent)
    this.wattmonkadmins.forEach((element) => {
      adminsid.push(element);
    });

    this.clientadmins.forEach((element) => {
      adminsid.push(element);
    });

    if (this.wattmonkadmins.length == 0) {
      adminsid.push(416);
      adminsid.push(456);
    }
    CometChat.createGroup(group).then(
      (group) => {
        const membersList = [
          new CometChat.GroupMember(
            "" + pestamp.createdby.id,
            CometChat.GROUP_MEMBER_SCOPE.ADMIN
          ),
        ];
        adminsid.forEach((element) => {
          membersList.push(
            new CometChat.GroupMember(
              "" + element,
              CometChat.GROUP_MEMBER_SCOPE.ADMIN
            )
          );
        });
        CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
          () => {
            const chatgroupusers = adminsid;
            chatgroupusers.push(pestamp.createdby.cometchatuid);

            const inputData = {
              title: groupName,
              guid: GUID,
              parentid: pestamp.createdby.parent.id,
              chatgroupusers: chatgroupusers,
            };
            this.commonservice.addChatGroup(inputData).subscribe(() => {
              // do nothing.
            });
            if (this.isOutsourced) {
              this.notifyService.showSuccess(
                "Pe Stamps request has been successfully assigned.",
                "Success"
              );
            }
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          },
          () => {
            if (this.isOutsourced) {
              this.notifyService.showSuccess(
                "Pe Stamps request has been successfully assigned.",
                "Success"
              );
            }
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          }
        );
      },
      () => {
        if (this.isOutsourced) {
          this.notifyService.showSuccess(
            "Pe Stamps request has been successfully assigned.",
            "Success"
          );
        }
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  // updateDesignStatus(designid : number, designstatus : string, message : string){
  //   this.activitybarClose();
  //   event.stopPropagation();
  //   const postData = {
  //     status: designstatus
  //   };

  //   this.pestampService
  //     .editPestamp(
  //       designid,
  //       postData
  //     )
  //     .subscribe(
  //       response => {
  //         this.notifyService.showSuccess(message, "Success");
  //         this.fetchAllPestampsCount();
  //       },
  //       error => {
  //         this.notifyService.showError(
  //           error,
  //           "Error"
  //         );
  //       }
  //     );
  // }

  // addUserToGroupChat(design : Pestamp) {
  //   const GUID = ""+design.id;
  //   const userscope = CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT;
  //   if (design.status == "requestaccepted" || design.status == "outsourced") {
  //     userscope = CometChat.GROUP_MEMBER_SCOPE.ADMIN;
  //   }
  //   const membersList = [
  //     new CometChat.GroupMember("" + this.loggedInUser.id, userscope)
  //   ];
  //   CometChat.addMembersToGroup(GUID, membersList, []).then(
  //     response => {
  //       this.fetchAllPestampsCount();
  //     },
  //     error => {
  //     }
  //   );
  // }
  downloadfile(pestamp: Pestamp, event: Event): void {
    // const self = this;
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
    //   this.commonservice.downloadFile(file.url).subscribe((response: any) => {
    //     const percentage = Math.round((count * 100) / this.Allfiles.length);
    //     this.loadingpercentage = percentage;
    //     this.changeDetectorRef.detectChanges();
    //     zip.file(file.name + file.ext, response.data, {
    //       binary: true,
    //     });

    //     ++count;

    //     if (count == this.Allfiles.length) {
    //       zip
    //         .generateAsync({
    //           type: "blob",
    //         })
    //         .then(function (content) {
    //           self.isDownloading = false;
    //           self.changeDetectorRef.detectChanges();
    //           saveAs(
    //             content,
    //             pestamp.personname + "_" + pestamp.email + ".zip"
    //           );
    //         });
    //     }
    //   })
    // });
    event.stopPropagation();
    this.isLoading = true;
    this.loadingmessage = "Downloading zip file"
    this.pestampService.downloadzipfile(pestamp.id).subscribe((result: any) => {
      this.isLoading = false;
      this.loadingmessage = "Please wait";
      this.changeDetectorRef.detectChanges();
      const link = document.createElement("a");
      link.href = result.data;
      link.download = pestamp.personname + "_" + pestamp.email + ".zip";
      link.click();
    },
      (error) => {
        this.isLoading = false;
        this.notifyService.showError(error, "Error");
      })

  }
}

export interface PestampDeclineDialogData {
  pestamp: Pestamp;
  reason: string;
  issubmitted: boolean;
  declinedbypeengineer: boolean;
}

@Component({
  selector: "pestamp-decline-dialog",
  templateUrl: "pestamp-decline-dialog.html",
  styleUrls: ["./pestamp.component.scss"],
})
export class PestampDeclineDialog implements OnInit {
  declinereason = new FormControl("", [Validators.required]);
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  loggedInUser;
  isLoading = false;
  loadingmessage = "Save data.";
  constructor(
    public dialogRef: MatDialogRef<PestampDeclineDialog>,
    private commonService: CommonService,
    private notifyService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    public pestampService: PestampService,
    private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: PestampDeclineDialogData
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
  }

  onNoClick(): void {
    this.data.issubmitted = false;
    this.dialogRef.close(this.data);
  }

  onSubmit(): void {
    if (this.declinereason.value != "") {
      this.isLoading = true;
      if (this.isAttachmentUploaded) {
        this.uploadAttachmentdeclineDesignFiles();
      } else {
        this.editDesignOnServer();
      }
    } else {
      this.declinereason.markAsTouched();
      this.declinereason.markAsDirty();
    }
  }

  onAttachmentFileSelect(event): void {
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      const type = element.name.split(".");
      // WEB ARCHIVE EXT NOT SUPPORTED CODE
      if (type[1] == "webarchive") {
        this.notifyService.showError(
          "Web archive file format is not supported",
          "Error"
        );
      } else {
        this.isAttachmentUploaded = true;
        element.isImage = false;
        if (element.type.includes("image")) {
          element.isImage = true;
        }
        this.attachmentfiles.push(element);
      }
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onAttachmentFileRemove(event): void {
    this.attachmentfiles.splice(this.attachmentfiles.indexOf(event), 1);
    if (this.attachmentfiles.length == 0) {
      this.isAttachmentUploaded = false;
    }
  }
  uploadAttachmentdeclineDesignFiles(): void {
    this.isLoading = true;
    this.loadingmessage = "Uploading On Hold Attachment.";
    this.commonService
      .uploadFilesWithLoader(
        this.data.pestamp.id,
        "pestamp/" + this.data.pestamp.id,
        this.attachmentfiles,
        "requestdeclineattachment",
        "pestamp"
      )
      .subscribe(
        () => {
          this.editDesignOnServer();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  editDesignOnServer(): void {
    const cdate = Date.now();
    let declinedbypeengineer;
    if (this.loggedInUser.role.id == ROLES.Peengineer) {
      declinedbypeengineer = true;
    } else {
      declinedbypeengineer = false;
    }
    /*  if (this.data.pestamp.type == 'both') {
 
       if (this.loggedInUser.peengineertype == 'electrical') {
         postData = {
           status: "declined",
           isoutsourced: "false",
           requestdeclinereason: this.declinereason.value,
           pestampacceptancestarttime: cdate,
           acknowledgedby: this.loggedInUser.id,
           declinedbyelectricalpeengineer: declinedbypeengineer
         };
       }
       else {
         postData = {
           status: "declined",
           isoutsourced: "false",
           requestdeclinereason: this.declinereason.value,
           pestampacceptancestarttime: cdate,
           acknowledgedby: this.loggedInUser.id,
           declinedbystructuralpeengineer: declinedbypeengineer
         };
       }
     }
     else {
       postData = {
         status: "declined",
         isoutsourced: "false",
         requestdeclinereason: this.declinereason.value,
         pestampacceptancestarttime: cdate,
         acknowledgedby: this.loggedInUser.id,
         declinedbypeengineer: declinedbypeengineer
       };
     } */
    let declinedbypesuperadmin;
    if (this.loggedInUser.role.id == ROLES.PESuperAdmin) {
      declinedbypesuperadmin = true;
    } else {
      declinedbypesuperadmin = false;
    }
    const postData = {
      status: "declined",
      isoutsourced: "false",
      requestdeclinereason: this.declinereason.value,
      pestampacceptancestarttime: cdate,
      acknowledgedby: this.loggedInUser.id,
      declinedbypeengineer: declinedbypeengineer,
      declinedbypesuperadmin: declinedbypesuperadmin,
    };

    this.pestampService.onHoldPestamp(this.data.pestamp.id, postData).subscribe(
      (response) => {
        this.data.pestamp = response;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.data.issubmitted = true;
        this.notifyService.showSuccess(
          "PE Stamp request has been put on hold successfully.",
          "Success"
        );
        this.dialogRef.close(this.data);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  createNewDesignChatGroup(pestamp: Pestamp): void {
    this.isLoading = true;
    this.changeDetectorRef.detectChanges();
    const GUID = "" + pestamp.chatid;

    const name = pestamp.personname.substring(0, 60);
    const email = pestamp.email.substring(0, 60);

    const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
    const groupName =
      pestamp.type + "_" + name + "_" + email + "_" + currentdatetime;

    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = pestamp.groupchatpassword

    const group = new CometChat.Group(GUID, groupName, groupType, password);

    CometChat.getGroup(GUID).then(
      () => {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.data.issubmitted = true;
        this.notifyService.showSuccess(
          "PE Stamp request has been put on hold successfully.",
          "Success"
        );
        this.dialogRef.close(this.data);
      },
      () => {
        CometChat.createGroup(group).then(
          (group) => {
            const membersList = [
              new CometChat.GroupMember(
                "" + pestamp.createdby.cometchatuid,
                CometChat.GROUP_MEMBER_SCOPE.ADMIN
              ),
              new CometChat.GroupMember(
                "" + this.loggedInUser.cometchatuid,
                CometChat.GROUP_MEMBER_SCOPE.ADMIN
              ),
            ];
            CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
              () => {
                const chatgroupusers = [];
                chatgroupusers.push(pestamp.createdby.cometchatuid);
                chatgroupusers.push(pestamp.createdby.cometchatuid);
                const inputData = {
                  title: groupName,
                  guid: GUID,
                  parentid: pestamp.createdby.parent.id,
                  chatgroupusers: chatgroupusers,
                };
                this.commonService.addChatGroup(inputData).subscribe(() => {
                  // do nothing.
                });

                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
                this.data.issubmitted = true;
                this.notifyService.showSuccess(
                  "PE Stamp request has been put on hold successfully.",
                  "Success"
                );
                this.dialogRef.close(this.data);
              },
              () => {
                // do nothing.
              }
            );
          },
          () => {
            // do nothing.
          }
        );
      }
    );
  }

  ngOnInit(): void {
    // do nothing.
  }
}

export interface PestampResendDialogData {
  pestamp: Pestamp;
  resendcomments: string;
  issubmitted: boolean;
  isWattmonkUser: boolean;
}

@Component({
  selector: "pestamp-resend-dialog",
  templateUrl: "pestamp-resend-dialog.html",
})
export class PestampResendDialog implements OnInit {
  displayerror = false;
  amounttopay: number;
  isLoading = false;
  loadingmessage = "Saving data";
  resendcommentscontrol = new FormControl("", [Validators.required]);
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  newpestamp: Observable<any>;
  newpestampRef: AngularFireObject<any>;
  newpestampcounts = 0;
  loggedInUser;
  defaultvalue = "-";
  roofphotos: GalleryItem[];
  atticphotos: GalleryItem[];
  constructor(
    public gallery: Gallery,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<PestampResendDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: PestampResendDialogData,
    private changeDetectorRef: ChangeDetectorRef,
    private commonService: CommonService,
    private notifyService: NotificationService,
    public pestampService: PestampService,
    private db: AngularFireDatabase,
    private authService: AuthenticationService,
    public genericService: GenericService
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
    this.newpestampRef = this.db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + "newpestamp"
    );
    this.newpestamp = this.newpestampRef.valueChanges();
    this.newpestamp.subscribe(
      (res) => {
        this.newpestampcounts = res.count;
      }
      // (err) => console.log(err),
      // () => console.log('done!')
    );
  }
  onNoClick(): void {
    this.data.issubmitted = false;
    this.dialogRef.close(this.data);
  }
  getPestampsCharges(): void {
    /*if (this.resendcommentscontrol.value != '') {
    this.openOrderDesignDialog(this.data.pestamp)
    }
    else {
      this.resendcommentscontrol.markAsTouched();
      this.resendcommentscontrol.markAsDirty();
    }*/
    if (this.data.isWattmonkUser) {
      if (this.resendcommentscontrol.value != "" && this.isAttachmentUploaded) {
        this.openOrderDesignDialog(this.data.pestamp);
      } else {
        this.displayerror = true;
        this.resendcommentscontrol.markAsTouched();
        this.resendcommentscontrol.markAsDirty();
      }
    } else {
      if (this.resendcommentscontrol.value != "") {
        this.openOrderDesignDialog(this.data.pestamp);
      } else {
        this.resendcommentscontrol.markAsTouched();
        this.resendcommentscontrol.markAsDirty();
      }
    }
  }
  openOrderDesignDialog(pestamp): void {
    var pestamp = pestamp;
    let amounttopay: any;
    const dialogRef = this.dialog.open(OrderpestampsdialogComponent, {
      width: "30%",
      autoFocus: false,
      disableClose: true,
      panelClass: "white-modalbox",
      data: {
        isConfirmed: false,
        pestampid: pestamp.id,
        pestamp: pestamp,
        amounttopay: amounttopay,
        designRaisedbyWattmonk: this.data.isWattmonkUser,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.amounttopay = result.amounttopay;
        this.onSubmit();
      } else {
        this.isLoading = false;
        this.dialogRef.close();
      }
    });
  }
  onSubmit(): void {
    if (this.isAttachmentUploaded) {
      this.isLoading = true;
      this.uploadAttachmentresendDesignFiles();
    } else {
      this.editDesignOnServer();
    }
  }
  onAttachmentFileSelect(event): void {
    this.displayerror = false;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      const type = element.name.split(".");
      // WEB ARCHIVE EXT NOT SUPPORTED CODE
      if (type[1] == "webarchive") {
        this.notifyService.showError(
          "Web archive file format is not supported",
          "Error"
        );
      } else {
        this.isAttachmentUploaded = true;
        element.isImage = false;
        if (element.type.includes("image")) {
          element.isImage = true;
        }
        this.attachmentfiles.push(element);
      }
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }
  onAttachmentFileRemove(event): void {
    this.attachmentfiles.splice(this.attachmentfiles.indexOf(event), 1);
    if (this.attachmentfiles.length == 0) {
      this.isAttachmentUploaded = false;
      this.displayerror = true;
    }
  }
  uploadAttachmentresendDesignFiles(): void {
    this.isLoading = true;
    this.loadingmessage = "Uploading Resend file  of ";
    this.commonService
      .uploadFilesWithLoader(
        this.data.pestamp.id,
        "pestamp/" + this.data.pestamp.id,
        this.attachmentfiles,
        "revisionattachments",
        "pestamp"
      )
      .subscribe(
        () => {
          this.editDesignOnServer();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }
  editDesignOnServer(): void {
    const pestampacceptancestarttime = new Date();
    pestampacceptancestarttime.setMinutes(
      pestampacceptancestarttime.getMinutes() + 15
    );
    var status;
    var acceptedbypeengineer;
    var acceptedbypesuperadmin;
    if (this.data.pestamp.assignedtoid != null) {
      status = "assigned";
      acceptedbypeengineer = false;
    } else {
      status = "pesuperadminassigned";
      acceptedbypesuperadmin = false;
    }
    var postData;
    postData = {
      status: status,
      isoutsourced: "true",
      isinrevisionstate: "true",
      revisioncomments: this.resendcommentscontrol.value,
      pestampacceptancestarttime: pestampacceptancestarttime,
      actualdelivereddate: null,
      acceptedbypeengineer: acceptedbypeengineer,
      acceptedbypesuperadmin: acceptedbypesuperadmin,
      declinedbypeengineer: false,
      makerevisionpayment: true,
      paymenttype: localStorage.getItem("paymenttype"),
      amount: this.amounttopay,
    };
    this.pestampService.revisionPestamp(this.data.pestamp.id, postData).subscribe(
      (response) => {
        this.data.pestamp = response;
        this.data.issubmitted = true;
        this.isLoading = false;
        this.newpestampRef.update({ count: this.newpestampcounts + 1 });
        this.notifyService.showSuccess(
          "PE stamp request has been send for revision successfully.",
          "Success"
        );
        localStorage.removeItem("paymenttype");
        this.dialogRef.close(this.data);
      },
      (error) => {
        this.isLoading = false;
        this.dialogRef.close();
        this.notifyService.showError(error, "Error");
      }
    );
  }
  wrapURLs(text) {
    const url_pattern =
      /(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}\-\x{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?/gi;
    return text.replace(url_pattern, function (url) {
      const protocol_pattern = /^(?:(?:https?|ftp):\/\/)/i;
      const href = protocol_pattern.test(url) ? url : "http://" + url;
      return '<a href="' + href + '" target="_blank">' + url + "</a>";
    });
  }
  pestamproofimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("roofphotos");
    lightboxGalleryRef.load(this.roofphotos);
    this.pestampatticimagesGallery();
  }
  pestampatticimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("atticphotos");
    lightboxGalleryRef.load(this.atticphotos);
  }
  ngOnInit(): void {
    if (this.data.pestamp != null) {
      this.roofphotos = this.data.pestamp.roofphotos.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.atticphotos = this.data.pestamp.atticphotos.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.pestamproofimagesGallery();
    }
  }
}
