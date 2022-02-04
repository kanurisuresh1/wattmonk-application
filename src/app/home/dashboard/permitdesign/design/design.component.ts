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
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import { Gallery, GalleryItem, ImageItem } from "@ngx-gallery/core";
import axios from "axios";
import heic2any from "heic2any";
import * as moment from "moment";
import { Observable } from "rxjs";
import { ChatdialogComponent } from "src/app/shared/chatdialog/chatdialog.component";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { FIREBASE_DB_CONSTANTS, ROLES } from "src/app/_helpers";
import { Design, User } from "src/app/_models";
import { Analyst, Designer } from "src/app/_models/company";
import { JobsTiming } from "src/app/_models/jobtiming";
import { Survey } from "src/app/_models/survey";
import { UserSetting } from "src/app/_models/usersettings";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { ArchiveService } from "src/app/_services/archive.service";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { SurveyService } from "src/app/_services/survey.service";
import { AddpestampdialogComponent } from "../../pestamp/addpestampdialog/addpestampdialog.component";
import { AdddesigndialogComponent } from "../../prelimdesign/adddesigndialog/adddesigndialog.component";
import { AddprelimproposaldialogComponent } from "../../prelimdesign/addprelimproposaldialog/addprelimproposaldialog.component";
import { AssignreviewerdialogComponent } from "../../qualitycheck/assignreviewerdialog/assignreviewerdialog.component";
import { AddminpermitdesigndialogComponent } from "../addminpermitdesigndialog/addminpermitdesigndialog.component";
import { AssigndesigndialogComponent } from "../assigndesigndialog/assigndesigndialog.component";
import { DetailedpermitComponent } from "../detailedpermit/detailedpermit.component";
import { OrderpermitdesigndialogComponent } from "../orderpermitdesigndialog/orderpermitdesigndialog.component";
import { SharepermitdesigndialogComponent } from "../sharepermitdesigndialog/sharepermitdesigndialog.component";


export enum LISTTYPE {
  NEW,
  ONHOLD,
  INDESIGN,
  COMPLETED,
  INREVIEW,
  DELIVERED,
}

export interface JobsTime {
  permit_analyst: number;
  permit_designer: number;
  prelim_analyst: number;
  prelim_designer: number;
}

@Component({
  selector: "app-design",
  templateUrl: "./design.component.html",
  styleUrls: ["./design.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignComponent implements OnInit {
  user = User;
  activitybarVisible: boolean;
  listtypes = LISTTYPE;
  isFavorite = true;
  loggedInUser: User;
  isClient = false;
  isWattmonkUser = false;
  israisepermitrequest = false;
  statusfilter;
  statusfilterclear: string;

  selectedTabIndex = 0;
  permissiontomakedesign =
    this.authService.currentUserValue.user.permissiontomakedesign;
  //Total Count
  allnewdesigns: number = -1;
  allindesigns: number = -1;
  allcompleteddesigns: number = -1;
  allinreviewdesigns: number = -1;
  alldelivereddesigns: number = -1;
  allonholddesigns: number = -1;

  //Permit Numbers and Lists
  permitnewdesigns: number = -1;
  permitindesigns: number = -1;
  permitcompleteddesigns: number = -1;
  permitinreviewdesigns: number = -1;
  permitdelivereddesigns: number = -1;
  permitoutsourceddesigns: number = -1;

  getpermitnewdesign: Design[] = [];
  getpermitindesign: Design[] = [];
  getpermitcompleteddesign: Design[] = [];
  getpermitinreviewdesign: Design[] = [];
  getpermitdelivereddesign: Design[] = [];

  permitnewdesignslist = [];
  permitoverduedesignslist = [];
  permitindesignslist = [];
  permitcompleteddesignslist = [];
  permitinreviewdesignslist = [];
  permitdelivereddesignslist = [];

  permitoutsourceddesignslist: Design[] = [];

  ispermitnewdesignslistloading = true;
  ispermitindesignslistloading = true;
  ispermitcompleteddesignslistloading = true;
  ispermitinreviewdesignslistloading = true;
  ispermitdelivereddesignslistloading = true;

  scrolling: boolean;

  designerfilter: any;
  isIndesignActive = false;
  isNew = false;

  @ViewChild("listDesigner") listDesigner: MatSelectionList;
  @ViewChild("listAnalyst") listAnalyst: MatSelectionList;

  // @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  chatusers: User[] = [];
  listactionindex = 0;
  designId: number;
  istabchangeevent = false;
  isLoading = false;
  companies: any;
  companyList = [];
  designer: any;
  designers: Designer[];
  analysts: Analyst[];
  creatorparentid;
  reviwerid;
  isLoader = false;
  appliedcoupan = null;
  skip = 0;
  limit = 10;
  surveydetails = null;

  newpermits: Observable<any>;
  newpermitsRef: AngularFireObject<any>;
  newpermitscount = 0;

  companynewpermits: Observable<any>;
  companynewpermitsRef: AngularFireObject<any>;
  companynewpermitscount = 0;

  selectedcompanynewpermitsRef: AngularFireObject<any>;

  newdesignslist = [];
  indesignslist = [];
  completeddesignslist = [];
  inreviewdesignslist = [];
  delivereddesignslist = [];
  isnewdesignslistloading = true;
  isindesignslistloading = true;
  iscompleteddesignslistloading = true;
  isinreviewdesignslistloading = true;
  isdelivereddesignslistloading = true;

  newdesigns: number = -1;
  indesigns: number = -1;
  completeddesigns: number = -1;
  inreviewdesigns: number = -1;
  delivereddesigns: number = -1;
  prelimFilter: any;
  isUnhold = false;

  @ViewChild("newdesignscroll")
  viewport: CdkVirtualScrollViewport;

  @ViewChild("indesignscroll")
  indesignviewport: CdkVirtualScrollViewport;

  @ViewChild("completeddesignscroll")
  completeddesignviewport: CdkVirtualScrollViewport;

  @ViewChild("inreviewdesignscroll")
  inreviewviewport: CdkVirtualScrollViewport;

  @ViewChild("delivereddesignscroll")
  deliveredviewport: CdkVirtualScrollViewport;

  @ViewChild("onholddesignscroll")
  onholdviewport: CdkVirtualScrollViewport;
  amounttopay: any;
  slabname: any;
  slabdiscount: any;
  serviceamount: number;
  wattmonkadmins: User[] = [];
  activeTab = 0;
  prelimDesign = null;
  teamheadid = 0;
  ispermitonholddesignslistloading: boolean;
  permitonholddesigns: number;
  getpermitonholddesign: Design[] = [];
  permitonholddesignslist = [];

  sorting: boolean = false;
  orderbyfilterstatus = null;
  ordertypefilterstatus = null;
  sortingdata: string;
  dynamicName: UserSetting;
  copiedcoupon: any;
  searchTerm: any = { companyname: "" };
  searchdesigner;
  searchanalyst;
  showOnholdButton: boolean = false;
  Array: number[] = [];
  isfrmChecked: any;
  counting: number;
  isthistab = false;
  listactionindex1: number[] = [];
  allArchives = [];
  scrollwiseDesigns = [];
  clientadmins;
  isOutsourced: boolean = false;
  joboverduetotaltime: any;
  jobtime: JobsTime;

  //Timer Variables
  timer: number = 0;
  intervalId: any;
  display: string = "0h : 0m : 0s";
  hour: number = 0;
  minutes: number = 0;
  job: JobsTiming = null;
  disablestartbutton: boolean = false;
  totalminutes: number;
  permitanalyst: number;
  seconds: number = 0;
  timerstarted: boolean = false;
  Newscrolling: boolean;
  holdscrolling: boolean;
  Designingscrolling: boolean;
  completedscrolling: boolean;
  inreviewscrolling: boolean;
  Dscrolling: boolean;

  constructor(
    public dialog: MatDialog,
    private viewportScroller: ViewportScroller,
    private notifyService: NotificationService,
    public genericService: GenericService,
    public designService: DesignService,
    public authService: AuthenticationService,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private commonservice: CommonService,
    private db: AngularFireDatabase,
    private surveyService: SurveyService,
    private router: Router,
    public archiveService: ArchiveService,
    private loaderservice: LoaderService
  ) {
    this.dynamicName = JSON.parse(localStorage.getItem("usersettings"));
    this.loggedInUser = authService.currentUserValue.user;
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
    if (
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      ((this.loggedInUser.role.id == ROLES.TeamHead || this.loggedInUser.role.id == ROLES.BD) &&
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
      (this.loggedInUser.parent.id != 232 &&
        this.loggedInUser.role.id == ROLES.BD) ||
      this.loggedInUser.role.id == ROLES.TeamHead ||
      this.loggedInUser.role.id == ROLES.Admin ||
      this.loggedInUser.role.id == ROLES.SuperAdmin
    ) {
      this.israisepermitrequest = true;
    } else {
      this.israisepermitrequest = false;
    }
    if (
      this.loggedInUser.role.id == ROLES.Admin ||
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.TeamHead
    ) {
      this.isUnhold = true;
    } else {
      this.isUnhold = false;
    }

    if (
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      (this.loggedInUser.role.id == ROLES.TeamHead &&
        this.loggedInUser.parent.id == 232)
    ) {
      this.showOnholdButton = true;
    } else {
      this.showOnholdButton = false;
    }

    this.activitybarVisible = false;
    this.teamheadid = ROLES.TeamHead;

    this.newpermitsRef = db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + "newpermitdesigns"
    );
    this.newpermits = this.newpermitsRef.valueChanges();
    this.newpermits.subscribe(
      (res) => {
        this.newpermitscount = res.count;
        changeDetectorRef.detectChanges();
      }
      // (err) => console.log(err),
      // () => console.log("done!")
    );

    this.companynewpermitsRef = db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + this.loggedInUser.parent.id
    );
    this.companynewpermits = this.companynewpermitsRef.valueChanges();
    this.companynewpermits.subscribe(
      (res) => {
        this.companynewpermitscount = res.newpermits;
        changeDetectorRef.detectChanges();
      }
      // (err) => console.log(err),
      // () => console.log("done!")
    );

    this.joboverduetotaltime = this.db.object("tasktimings").valueChanges().subscribe((result: JobsTime) => {
      this.jobtime = result;
    });
  }

  ngOnInit(): void {
    if (!this.isClient) {
      if (this.genericService.companies == undefined) {
        this.getCompanies();
      } else {
        // this.companies = this.genericService.companies;
        this.companyList = this.genericService.companies;
        this.fetcheachcompanynewdesigncount();
      }
    }

    this.getWattmonkadmins();
    this.copiedcoupon = JSON.parse(localStorage.getItem("copiedcoupan"));
  }
  oncompanyScroll(): void {
    console.log("inside company Scroll:");
    this.scrolling = true;
    this.skip += 10;
    this.getCompanies();
  }
  getCompanies(): void {
    this.commonservice.getCompanies1("permit").subscribe(
      (response) => {
        this.scrolling = false;
        response.sort((a, b) =>
          a.companyname.toLocaleLowerCase() > b.companyname.toLocaleLowerCase()
            ? 1
            : -1
        );
        this.genericService.companies = response;
        this.companies = response;
        this.companyList = [...this.companyList, ...response];
        this.fetcheachcompanynewdesigncount();
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.scrolling = false;
      }
    );
  }

  onCompanyChanged(list): void {
    this.Array = [];
    this.allArchives = [];
    this.isLoader = true;
    this.permitnewdesignslist = [];
    this.permitindesignslist = [];
    this.permitcompleteddesignslist = [];
    this.permitinreviewdesignslist = [];
    this.permitdelivereddesignslist = [];
    this.permitonholddesignslist = [];
    this.skip = 0;

    const companyid = list.selectedOptions.selected.map((item) => item.value);
    this.creatorparentid = companyid[0];
    if (this.reviwerid && [1, 3].includes(this.activeTab)) {
      this.isLoader = true;
      this.permitnewdesignslist = [];
      this.permitindesignslist = [];
      this.permitcompleteddesignslist = [];
      this.permitinreviewdesignslist = [];
      this.permitdelivereddesignslist = [];

      this.skip = 0;
      this.limit = 10;

      if (this.activeTab == 1) {
        this.fetchDesignbyDesignerId();
      } else {
        this.fetchDesignbyReviewerId();
      }
      return;
    }
    this.selectedcompanynewpermitsRef = this.db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + this.creatorparentid
    );

    this.fetchAllDesignsCount();
    //     let searchdata = "";
    //     if (this.reviwerid) {
    //       searchdata = "id=" + this.reviwerid + "&";
    //     }

    //     if (this.creatorparentid) {
    //       if (this.statusfilter && this.statusfilter == "requestdeclined") {
    //         searchdata =
    //           searchdata +
    //           "requesttype=permit&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&creatorparentid=" +
    //           this.creatorparentid +
    //           "&status=requestdeclined";
    //       } else if (
    //         this.statusfilter &&
    //         this.statusfilter == "isinrevisionstate"
    //       ) {
    //         searchdata =
    //           searchdata +
    //           "requesttype=permit&isinrevisionstate=true&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&creatorparentid=" +
    //           this.creatorparentid;
    //       } else {
    //         searchdata =
    //           searchdata +
    //           "requesttype=permit&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&creatorparentid=" +
    //           this.creatorparentid +
    //           "&status=created&status=outsourced&status=requestaccepted";
    //       }
    //     } else {
    //       if (this.statusfilter && this.statusfilter == "requestdeclined") {
    //         searchdata =
    //           searchdata +
    //           "requesttype=permit&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&status=requestdeclined";
    //       } else if (
    //         this.statusfilter &&
    //         this.statusfilter == "isinrevisionstate"
    //       ) {
    //         searchdata =
    //           searchdata +
    //           "requesttype=permit&isinrevisionstate=true&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip;
    //       } else {
    //         searchdata =
    //           searchdata +
    //           "requesttype=prelpermitim&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&status=created&status=outsourced&status=requestaccepted";
    //       }
    //     }

    this.allfunctions();
  }

  /*   getCompanies() {
      this.commonservice.getCompanies1("permit").subscribe(
        (response) => {
          this.companies = response;
          this.companies.sort((a, b) =>
            a.companyname.toLocaleLowerCase() > b.companyname.toLocaleLowerCase()
              ? 1
              : -1
          );
          this.changeDetectorRef.detectChanges();
          
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    } */

  openAddDesignDialog(): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AdddesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, isDataUpdated: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.allnewdesigns = parseInt("" + this.allnewdesigns) + 1;
        this.addItemToList(LISTTYPE.NEW, result.design);
      }
    });
  }

  getdesigner(): void {
    this.commonservice.getdesigner().subscribe(
      (response) => {
        this.designers = response;
        this.designers.sort((a, b) =>
          a.firstname.toLocaleLowerCase() > b.firstname.toLocaleLowerCase()
            ? 1
            : -1
        );
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onDesignerChanged(list): void {
    this.isLoader = true;
    this.permitnewdesignslist = [];
    this.permitindesignslist = [];
    this.permitcompleteddesignslist = [];
    this.permitinreviewdesignslist = [];
    this.permitdelivereddesignslist = [];

    this.skip = 0;
    this.limit = 10;

    const designerid = list.selectedOptions.selected.map((item) => item.value);
    this.reviwerid = designerid[0];
    this.fetchDesignbyDesignerId();
  }

  onDesignerChangedbyId(designer): void {
    this.isLoader = true;
    this.permitnewdesignslist = [];
    this.permitindesignslist = [];
    this.permitcompleteddesignslist = [];
    this.permitinreviewdesignslist = [];
    this.permitdelivereddesignslist = [];

    this.skip = 0;
    this.limit = 10;

    this.reviwerid = designer.id;
    this.designerfilter = designer.firstname + designer.lastname;
    this.fetchDesignbyDesignerId();
  }

  openAddPrelimProposalDialog(): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddprelimproposaldialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, isDataUpdated: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.allnewdesigns = parseInt("" + this.allnewdesigns) + 1;
        this.addItemToList(LISTTYPE.NEW, result.design);
      }
    });
  }
  addItemToList(type: LISTTYPE, newrecord: Design): void {
    newrecord = this.fillinDynamicDataForSingleRecord(newrecord);
    switch (type) {
      case LISTTYPE.NEW:
        this.newdesignslist.splice(0, 0, newrecord);
        this.newdesignslist = [...this.newdesignslist];
        this.newdesigns = this.newdesignslist.length;
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
      case LISTTYPE.INREVIEW:
        this.inreviewdesignslist.splice(0, 0, newrecord);
        this.inreviewdesignslist = [...this.inreviewdesignslist];
        this.inreviewdesigns = this.inreviewdesignslist.length;
        break;
      case LISTTYPE.DELIVERED:
        this.delivereddesignslist.splice(0, 0, newrecord);
        this.delivereddesignslist = [...this.delivereddesignslist];
        this.delivereddesigns = this.delivereddesignslist.length;
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  fetchDesignbyDesignerId(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }
    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=designassigned";
    } else {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=designassigned";
    }

    this.ispermitindesignslistloading = true;
    this.allnewdesigns = 0;
    this.allindesigns = 0;
    this.allcompleteddesigns = 0;
    this.allinreviewdesigns = 0;
    this.allonholddesigns = 0;
    this.alldelivereddesigns = 0;
    this.changeDetectorRef.detectChanges();
    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.permitindesigns = response.length;
        this.allindesigns = this.permitindesigns;
        if (response.length > 0) {
          this.getpermitindesign = this.fillinDynamicData(response);
          for (let i = 0, len = this.getpermitindesign.length; i < len; ++i) {
            this.permitindesignslist.push(this.getpermitindesign[i]);
          }
          this.permitindesignslist = [...this.permitindesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isLoader = false;

        this.ispermitindesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onReviewerChanged(list): void {
    this.isLoader = true;

    this.permitnewdesignslist = [];
    this.permitindesignslist = [];
    this.permitcompleteddesignslist = [];
    this.permitinreviewdesignslist = [];
    this.permitdelivereddesignslist = [];
    this.permitonholddesignslist = [];

    this.skip = 0;
    this.limit = 10;

    const reviewerid = list.selectedOptions.selected.map((item) => item.value);
    this.reviwerid = reviewerid[0];
    this.fetchDesignbyReviewerId();
  }

  fetchDesignbyReviewerId(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }
    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=reviewassigned";
    } else {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=reviewassigned";
    }

    this.ispermitinreviewdesignslistloading = true;
    this.allnewdesigns = 0;
    this.allindesigns = 0;
    this.allcompleteddesigns = 0;
    this.allinreviewdesigns = 0;
    this.alldelivereddesigns = 0;
    this.allonholddesigns = 0;
    this.changeDetectorRef.detectChanges();

    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.permitinreviewdesigns = response.length;
        this.allinreviewdesigns = this.permitinreviewdesigns;
        if (response.length > 0) {
          this.getpermitinreviewdesign = this.fillinDynamicData(response);
          for (
            let i = 0, len = this.getpermitinreviewdesign.length;
            i < len;
            ++i
          ) {
            this.permitinreviewdesignslist.push(
              this.getpermitinreviewdesign[i]
            );
          }
          this.permitinreviewdesignslist = [...this.permitinreviewdesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isLoader = false;
        this.isLoading = false;
        this.ispermitinreviewdesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getAnalyst(): void {
    this.commonservice.getAnalyst().subscribe(
      (response) => {
        this.analysts = response;
        this.analysts.sort((a, b) =>
          a.firstname.toLocaleLowerCase() > b.firstname.toLocaleLowerCase()
            ? 1
            : -1
        );
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
      this.companyList
      var companyitemRef: AngularFireObject<any>;
      companyitemRef = this.db.object(
        FIREBASE_DB_CONSTANTS.KEYWORD + element.companyid
      );
      const companyitem = companyitemRef.valueChanges();
      companyitem.subscribe((res) => {
        element.newdesignscount = res.newpermits;
        this.changeDetectorRef.detectChanges();
      });
    });
  }
  allfunctions(): void {
    //  this.permitfetchNewDesignsData(searchdata);
    this.permitfetchInDesigningDesignsData();
    this.permitfetchCompletedDesignsData();
    this.permitfetchInReviewDesignsData();
    this.permitfetchDeliveredDesignsData();
  }

  radioChange($event: MatRadioChange): void {
    this.statusfilter = "";
    if ($event.source.name === "statusfilter") {
      this.statusfilter = $event.value;

      this.permitnewdesignslist = [];
      this.ispermitnewdesignslistloading = true;
      let searchdata;
      let parentid;
      this.skip = 0;
      this.limit = 10;

      if (this.creatorparentid) {
        if (this.statusfilter && this.statusfilter == "requestdeclined") {
          searchdata =
            "requesttype=permit&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=requestdeclined";
        } else if (
          this.statusfilter &&
          this.statusfilter == "isinrevisionstate"
        ) {
          searchdata =
            "requesttype=permit&isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=created&status=outsourced&status=requestaccepted";
        } else {
          searchdata =
            "requesttype=permit&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=created&status=outsourced&status=requestaccepted";
        }

        parentid = this.creatorparentid;
      } else {
        if (this.statusfilter && this.statusfilter == "requestdeclined") {
          searchdata =
            "requesttype=permit&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=requestdeclined";
        } else if (
          this.statusfilter &&
          this.statusfilter == "isinrevisionstate"
        ) {
          searchdata =
            "requesttype=permit&isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=requestaccepted";
        } else {
          searchdata =
            "requesttype=permit&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=requestaccepted";
        }

        parentid = "";
      }

      this.designService
        .getDesignsCount1("permit", parentid, this.statusfilter)
        .subscribe(
          (response) => {
            this.allnewdesigns = response["newdesign"];
            this.allindesigns = response["indesigning"];
            this.allcompleteddesigns = response["completed"];
            this.allinreviewdesigns = response["inreviewdesign"];
            this.alldelivereddesigns = response["delivered"];
            this.allonholddesigns = response["onholddesign"];
            this.changeDetectorRef.detectChanges();
            this.permitfetchNewDesignsData(searchdata);
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
    this.prelimFilter = null;
    this.isLoader = true;
    this.isLoader = true;
    this.permitnewdesignslist = [];
    this.permitindesignslist = [];
    this.permitcompleteddesignslist = [];
    this.permitinreviewdesignslist = [];
    this.permitdelivereddesignslist = [];
    this.permitonholddesignslist = [];
    this.skip = 0;
    this.reviwerid = null;
    this.creatorparentid = "";
    // if (this.listDesigner) {
    //   this.listDesigner.options.forEach((opt) => {
    //     opt.selected = false;
    //   });
    // }
    // if (this.listAnalyst) {
    //   this.listAnalyst.options.forEach((opt) => {
    //     opt.selected = false;
    //   });
    // }
    this.fetchAllDesignsCount();
    this.allfunctions();
  }

  ngAfterViewInit(): void {
    this.fetchAllDesignsCount();
  }

  activitybarToggle(design: Design, event: Event): void {
    event.stopPropagation();
    this.activitybarOpen(design);
  }

  activitybarOpen(design: Design): void {
    this.eventEmitterService.onActivityBarButtonClick(design.id, true);
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

  onChatButtonClick(design: Design, event: Event): void {
    event.stopPropagation();
    this.activitybarClose();
    const GUID = design.chatid;
    this.genericService.setSelectedChatGroupID(GUID);
    CometChat.getGroup(design.chatid).then(
      () => {
        this._snackBar.openFromComponent(ChatdialogComponent, {
          data: "element",
          panelClass: ["chatdialog"],
        });
      },
      () => {
        this.getClientsadmins(design);
        //this.createExistingDesignChat(design)
      }
    );
  }
  /*   createExistingDesignChat(design: Design) {
    var GUID = "" + design.chatid;
  
    var address = design.address.substring(0, 60);
  
    var currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
    var groupName = design.name + "_" + address + "_" + currentdatetime;
  
    var groupType = CometChat.GROUP_TYPE.PRIVATE;
    var password = "";
  
    var group = new CometChat.Group(GUID, groupName, groupType, password);
    let adminsid = [];
    adminsid.push(this.loggedInUser.parent.cometchatuid)
    this.wattmonkadmins.forEach((element) => {
      adminsid.push(element);
    });
    this.clientadmins.forEach((element) => {
      adminsid.push(element);
    });
    adminsid.push(this.loggedInUser.cometchatuid);
  
    if (design.chatid == null) {
      let inputData = {
        chatid: "permit" + "_" + new Date().getTime(),
      }
      design.chatid = "permit" + "_" + new Date().getTime();
      this.designService.updateDesign(design.id, inputData).subscribe(response => { }, (error) => {
        this.notifyService.showError(error, "Error");
      })
    }
  
    CometChat.createGroup(group).then(
      (group) => {
        let membersList = [
          new CometChat.GroupMember(
            "" + design.createdby.cometchatuid,
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
            let chatgroupusers = adminsid
            chatgroupusers.push(design.createdby.cometchatuid)
            let inputData = {
              title: groupName,
              guid: GUID,
              parentid: design.createdby.parent.id,
              chatgroupusers: chatgroupusers
            }
            this.commonservice.addChatGroup(inputData).subscribe(response => {
  
            }, (error) => {
              this.notifyService.showError(error, "Error");
            })
            this._snackBar.openFromComponent(ChatdialogComponent, {
              data: "element",
              panelClass: ["chatdialog"]
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

  Scrolltolastdesign() {
    const index = parseInt(localStorage.getItem("index"));
    let lasttab = parseInt(localStorage.getItem("activetab"));
    if (lasttab >= 0) {
      this.activeTab = lasttab
      this.changeDetectorRef.detectChanges();
    }
    setTimeout(() => {
      if (lasttab == 0) {
        this.viewport.scrollToIndex(index - 1);
      }
      else if (lasttab == 1) {
        this.indesignviewport.scrollToIndex(index - 1);
      }
      else if (lasttab == 2) {
        this.completeddesignviewport.scrollToIndex(index - 1);

      }
      else if (lasttab == 3) {
        this.inreviewviewport.scrollToIndex(index);
      }
      else if (lasttab == 4) {
        this.deliveredviewport.scrollToIndex(index - 1);
      }
      this.changeDetectorRef.detectChanges();
      localStorage.removeItem("activetab");
      localStorage.removeItem("index");

    }, 1000)
  }

  openDetailedPermitInputForm(design: Design, type: LISTTYPE, index) {
    this.openDesignDetailDialog(design, type, index);
    /* if (this.isClient || design.status == "reviewassigned" || design.jobtype!='pv') {
      this.openDesignDetailDialog(design, type, index);
    } else {
      this.activitybarClose();
      this.listactionindex = index;
      this.fetchPermitDetails(design, type);
    } */
  }

  fetchPermitDetails(design: Design): void {
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        const record = this.fillinDynamicDataForSingleRecord(response);
        const triggerEditEvent = true;
        const dialogRef = this.dialog.open(DetailedpermitComponent, {
          width: "80%",
          autoFocus: false,
          disableClose: true,
          data: { design: record, isDesignerFillMode: triggerEditEvent },
        });

        dialogRef.afterClosed().subscribe(() => {
          this._snackBar.dismiss();
        });
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  removeItemFromPermitList(type: LISTTYPE): void {
    switch (type) {
      case LISTTYPE.NEW:
        this.allnewdesigns -= 1;
        this.permitnewdesignslist.splice(this.listactionindex, 1);
        this.permitnewdesignslist = [...this.permitnewdesignslist];
        break;
      case LISTTYPE.ONHOLD:
        this.allonholddesigns -= 1;
        this.permitonholddesignslist.splice(this.listactionindex, 1);
        this.permitonholddesignslist = [...this.permitonholddesignslist];
        break;
      case LISTTYPE.INDESIGN:
        this.allindesigns -= 1;
        this.permitindesignslist.splice(this.listactionindex, 1);
        this.permitindesignslist = [...this.permitindesignslist];
        break;
      case LISTTYPE.COMPLETED:
        this.allcompleteddesigns -= 1;
        this.permitcompleteddesignslist.splice(this.listactionindex, 1);
        this.permitcompleteddesignslist = [...this.permitcompleteddesignslist];
        break;
      case LISTTYPE.INREVIEW:
        this.allinreviewdesigns -= 1;
        this.permitinreviewdesignslist.splice(this.listactionindex, 1);
        this.permitinreviewdesignslist = [...this.permitinreviewdesignslist];
        break;
      case LISTTYPE.DELIVERED:
        this.alldelivereddesigns -= 1;
        this.permitdelivereddesignslist.splice(this.listactionindex, 1);
        this.permitdelivereddesignslist = [...this.permitdelivereddesignslist];
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  updateItemInPermitList(type: LISTTYPE, newrecord: Design): void {
    newrecord = this.fillinDynamicDataForSingleRecord(newrecord);
    switch (type) {
      case LISTTYPE.NEW:
        this.permitnewdesignslist.splice(this.listactionindex, 1, newrecord);
        this.permitnewdesignslist = [...this.permitnewdesignslist];
        break;
      case LISTTYPE.INDESIGN:
        this.permitindesignslist.splice(this.listactionindex, 1, newrecord);
        this.permitindesignslist = [...this.permitindesignslist];
        break;
      case LISTTYPE.ONHOLD:
        this.permitonholddesignslist.splice(this.listactionindex, 1, newrecord);
        this.permitonholddesignslist = [...this.permitonholddesignslist];
        break;
      case LISTTYPE.COMPLETED:
        this.permitcompleteddesignslist.splice(
          this.listactionindex,
          1,
          newrecord
        );
        this.permitcompleteddesignslist = [...this.permitcompleteddesignslist];
        break;
      case LISTTYPE.INREVIEW:
        this.permitinreviewdesignslist.splice(
          this.listactionindex,
          1,
          newrecord
        );
        this.permitinreviewdesignslist = [...this.permitinreviewdesignslist];
        break;
      case LISTTYPE.DELIVERED:
        this.permitdelivereddesignslist.splice(
          this.listactionindex,
          1,
          newrecord
        );
        this.permitdelivereddesignslist = [...this.permitdelivereddesignslist];
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  addItemToPermitList(type: LISTTYPE, newrecord: Design): void {
    newrecord = this.fillinDynamicDataForSingleRecord(newrecord);
    switch (type) {
      case LISTTYPE.NEW:
        this.permitnewdesignslist.splice(0, 0, newrecord);
        this.permitnewdesignslist = [...this.permitnewdesignslist];
        this.allnewdesigns = parseInt("" + this.allnewdesigns) + 1;
        break;
      case LISTTYPE.INDESIGN:
        this.permitindesignslist.splice(0, 0, newrecord);
        this.permitindesignslist = [...this.permitindesignslist];
        // this.allindesigns += 1;
        break;
      case LISTTYPE.ONHOLD:
        this.permitonholddesignslist.splice(0, 0, newrecord);
        this.permitonholddesignslist = [...this.permitonholddesignslist];
        // this.allonholddesigns += 1;
        break;
      case LISTTYPE.COMPLETED:
        this.permitcompleteddesignslist.splice(0, 0, newrecord);
        this.permitcompleteddesignslist = [...this.permitcompleteddesignslist];
        // this.allcompleteddesigns += 1;
        break;
      case LISTTYPE.INREVIEW:
        this.permitinreviewdesignslist.splice(0, 0, newrecord);
        this.permitinreviewdesignslist = [...this.permitinreviewdesignslist];
        // this.allinreviewdesigns += 1;
        break;
      case LISTTYPE.DELIVERED:
        this.permitdelivereddesignslist.splice(0, 0, newrecord);
        this.permitdelivereddesignslist = [...this.permitdelivereddesignslist];
        // this.alldelivereddesigns += 1;
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  openAutocadDialog(): void {
    this.Array = [];
    this.allArchives = [];
    this.activitybarClose();
    if (this.loggedInUser.minpermitdesignaccess) {
      const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
        width: "80%",
        autoFocus: false,
        disableClose: true,
        data: { isEditMode: false, isDataUpdated: false },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isDataUpdated) {
          // this.allnewdesigns = parseInt("" + this.allnewdesigns) + 1;
          this.addItemToPermitList(LISTTYPE.NEW, result.design);
          this.designService.getpermitlastsolarmake().subscribe(
            (response) => {
              this.genericService.permitpreviousSolarInverterMake = response[0];
            },
            (error) => {
              this.notifyService.showError(error, "Error");
            }
          );
        }
      });
    } else {
      const dialogRef = this.dialog.open(DetailedpermitComponent, {
        width: "90%",
        autoFocus: false,
        disableClose: true,
        data: { isEditMode: false, isdataupdated: false },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isdataupdated) {
          this.addItemToPermitList(LISTTYPE.NEW, result.design);
        }
      });
    }
  }

  openEditPermitDesignDialog(type: LISTTYPE, design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DetailedpermitComponent, {
      width: "90%",
      autoFocus: false,
      disableClose: true,
      data: { isdataupdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdataupdated) {
        this.updateItemInPermitList(type, result.design);
      }
    });
  }

  updategroup(guid, groupname, grouppassword): void {
    const GUID = guid;
    const groupName = groupname;
    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = grouppassword
    const group = new CometChat.Group(GUID, groupName, groupType, password);

    CometChat.updateGroup(group).then();
  }
  openEditMinPermitDesignDialog(type: LISTTYPE, design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.updateItemInPermitList(type, result.design);
      }
      if (result.design.name != design.name) {
        const guid = "" + design.chatid;
        const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
        const groupName =
          result.design.name +
          "_" +
          result.design.address +
          "_" +
          currentdatetime;
        this.updategroup(guid, groupName, design.groupchatpassword);
      }
    });
  }

  openDesignDetailDialog(design: Design, type: LISTTYPE, index): void {
    this.activitybarClose();
    this.listactionindex = index;
    this.fetchPermitDesignDetails(design, type);
  }

  downloadDesign(design: Design, event: Event): void {
    this.loaderservice.show();
    event.stopPropagation();
    const fileurl = design.permitdesign.url;
    const filename =
      "permit_" + design.name + "_" + design.email + design.permitdesign.ext;

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
  }
  openPermitDesignDetailDialog(design: Design, type: LISTTYPE): void {
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
                    this.openDetaildialog(design, type);
                  },
                  (error) => {
                    this.notifyService.showError(error, "Error");
                  }
                );
            } else {
              this.openDetaildialog(design, type);
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      } else {
        this.openDetaildialog(design, type)
        this.surveydetails = null;
      }

    }
  }

  openDetaildialog(design, type) {
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
        job: this.job
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.surveydetails = null;
      this.prelimDesign = null;
      this._snackBar.dismiss();
      if (result.triggerPermitEditEvent) {
        this.openEditMinPermitDesignDialog(type, design);
      }
      if (result.triggerDeleteEvent) {
        this.removeItemFromPermitList(type);
      }
      if (result.refreshDashboard) {
        this.fetchAllDesignsCount();
        this.getJobTime();
        this.permitinreviewdesignslist = [];
        this.permitfetchInReviewDesignsData();
      }
    });

  }

  openAssignDesignerDialog(
    record: Design,
    event: Event,
    index,
    type: LISTTYPE
  ): void {
    if (this.isClient) {
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(OrderpermitdesigndialogComponent, {
        width: "30%",
        autoFocus: false,
        panelClass: "white-modalbox",
        disableClose: true,
        data: { isConfirmed: false, isprelim: true, design: record },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isConfirmed) {
          this.updatedesign(record, 15);
        }
      });
    } else {
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(AssigndesigndialogComponent, {
        width: "73%",
        height: "90%",
        autoFocus: false,
        disableClose: true,
        data: { isEditMode: false, design: record },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.refreshDashboard) {
          if (result.design.status == "outsourced") {
            this.updateItemInPermitList(LISTTYPE.NEW, result.design);
          } else {
            this.removeItemFromPermitList(type);
            this.addItemToPermitList(LISTTYPE.INDESIGN, result.design);
          }
          this.fetchAllDesignsCount();
        }
      });
    }
  }

  openReAssignDesignerDialog(
    record: Design,
    event: Event,
    index,
    type: LISTTYPE
  ): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(
      designacceptancestarttime.getMinutes() + 15
    );

    let postData = {};

    postData = {
      isoutsourced: "true",
      status: "outsourced",
      designacceptancestarttime: designacceptancestarttime,
    };

    this.designService.assignreview(record.id, postData).subscribe(
      (response) => {
        this.newpermitsRef.update({ count: this.newpermitscount + 1 });
        this.notifyService.showSuccess(
          "Design request has been successfully reassigned to WattMonk.",
          "Success"
        );
        this.companynewpermitsRef.update({
          newpermits: this.companynewpermitscount + 1,
        });
        this.updateItemInPermitList(type, response);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  openReAssignPermitDesignerDialog(record: Design, event: Event, index): void {
    this.getdesigner();
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(
      designacceptancestarttime.getMinutes() + 30
    );

    let postData = {};

    postData = {
      isoutsourced: "true",
      status: "outsourced",
      designacceptancestarttime: designacceptancestarttime,
    };

    this.designService.reassignreview(record.id, postData).subscribe(
      () => {
        this.notifyService.showSuccess(
          "Design request has been successfully reassigned to WattMonk.",
          "Success"
        );
        this.removeItemFromPermitList(LISTTYPE.ONHOLD);
        this.fetchAllDesignsCount();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  senddesigntoWattmonk(record, additionalminutes): void {
    const designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(
      designacceptancestarttime.getMinutes() + additionalminutes
    );
    this.isOutsourced = true;
    let postData = {};

    postData = {
      outsourcedto: 232,
      isoutsourced: "true",
      status: "outsourced",
      couponid: this.appliedcoupan ? this.appliedcoupan.id : null,
      paymenttype: localStorage.getItem("paymenttype"),
      designacceptancestarttime: designacceptancestarttime,
      slabname: String(this.slabname),
      slabdiscount: this.slabdiscount,
      amount: this.amounttopay,
      serviceamount: this.serviceamount,
      paymentstatus: localStorage.getItem("paymentstatus"),
    };
    this.loaderservice.show();
    this.designService.assignDesign(record.id, postData).subscribe(
      (response) => {
        this.updateItemInPermitList(LISTTYPE.NEW, response);
        this.authService.currentUserValue.user.amount =
          response.createdby.amount;
        localStorage.removeItem("paymenttype");
        localStorage.removeItem("paymentstatus");
        this.newpermitsRef.update({ count: this.newpermitscount + 1 });
        this.companynewpermitsRef.update({
          newpermits: this.companynewpermitscount + 1,
        });
        if (
          this.appliedcoupan?.usestype == "single" &&
          this.copiedcoupon?.id == this.appliedcoupan?.id
        ) {
          localStorage.removeItem("copiedcoupan");
        }
        this.getClientsadmins(response);
        this.loaderservice.hide();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  updatedesign(record, additionalminutes): void {
    const paymenttype = localStorage.getItem("paymenttype");
    if (paymenttype == "direct") {
      this.commonservice
        .stripepayment(
          this.genericService.stripepaymenttoken.id,
          this.authService.currentUserValue.user.email,
          this.authService.currentUserValue.user.id,
          this.amounttopay,
          paymenttype,
          this.appliedcoupan,
          record.id,
          this.serviceamount
        )
        .subscribe(
          () => {
            this.senddesigntoWattmonk(record, additionalminutes);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.senddesigntoWattmonk(record, additionalminutes);
    }
  }
  ShareOnWhatsapp(): void {
    this.activitybarClose();
    event.stopPropagation();
  }

  sharePermitDesign(design: Design, event: Event): void {
    this.activitybarClose();
    event.stopPropagation();
    const dialogRef = this.dialog.open(SharepermitdesigndialogComponent, {
      width: "45vw",
      autoFocus: false,
      disableClose: true,
      data: { design: design },
    });
    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }

  userSurveyDetails: Survey;
  raisePestampRequest(permit: Design, event): void {
    this.activitybarClose();
    event.stopPropagation();
    this.loaderservice.show();
    this.designService.getDesignDetails(permit.id).subscribe(
      (response) => {
        permit = response;
        if (permit.survey != null) {
          if (permit.survey.prelimdesignsurvey != null) {
            this.surveyService.getSurveyDetails(permit.survey.id).subscribe(
              (response) => {
                this.userSurveyDetails = response;
                this.getPrelimDesign(
                  permit.survey.prelimdesignsurvey.id,
                  permit
                );
              },
              (error) => {
                this.notifyService.showError(error, "Error");
              }
            );
          } else {
            this.surveyService.getSurveyDetails(permit.survey.id).subscribe(
              (response) => {
                this.userSurveyDetails = response;
                this.prelimDesign = null;
                this.openPestampDialog(permit);
              },
              (error) => {
                this.notifyService.showError(error, "Error");
              }
            );
          }
        } else {
          this.prelimDesign = null;
          this.openPestampDialog(permit);
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
    // this.loaderservice.hide();
  }

  openPestampDialog(permit: Design): void {
    let designRaisedbyWattmonk: boolean;
    if (this.isWattmonkUser) {
      designRaisedbyWattmonk = true;
    } else {
      designRaisedbyWattmonk = false;
    }
    const dialogRef = this.dialog.open(AddpestampdialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        isPermitmode: true,
        design: permit,
        survey: this.userSurveyDetails,
        prelim: this.prelimDesign,
        designRaisedbyWattmonk: designRaisedbyWattmonk,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.router.navigate(["home/pestamp/overview"]);
      }
    });
  }
  getPrelimDesign(prelimId: any, permit): void {
    this.designService.getDesignDetails(prelimId).subscribe(
      (response) => {
        this.prelimDesign = response;
        this.openPestampDialog(permit);
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  openAssignQCDialog(
    record: Design,
    event: Event,
    index,
    type: LISTTYPE
  ): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const dialogRef = this.dialog.open(AssignreviewerdialogComponent, {
      width: "73%",
      height: "90%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, design: record, isDesign: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.refreshDashboard) {
        this.removeItemFromPermitList(type);
        this.addItemToPermitList(LISTTYPE.INREVIEW, result.design);
        this.fetchAllDesignsCount();
      }
    });
  }

  openPermitAssignDesignerDialog(
    record: Design,
    event: Event,
    index,
    type: LISTTYPE
  ): void {
    if (this.isClient) {
      let appliedcoupan: any;
      let amounttopay: any;
      let slabdiscount: any;
      let slabname: any;
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(OrderpermitdesigndialogComponent, {
        width: "30%",
        autoFocus: false,
        disableClose: true,
        panelClass: "white-modalbox",
        data: {
          isConfirmed: false,
          isprelim: false,
          design: record,
          appliedcoupan: appliedcoupan,
          amounttopay: amounttopay,
          slabname: slabname,
          slabdiscount: slabdiscount,
          serviceamount: Number,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isConfirmed) {
          this.amounttopay = result.amounttopay;
          this.slabname = String(result.slabname);
          this.slabdiscount = result.slabdiscount;
          this.serviceamount = result.serviceamount;
          if (result.appliedcoupan != null) {
            this.appliedcoupan = result.appliedcoupan;
          } else {
            this.appliedcoupan = null;
          }
          this.updatedesign(record, 30);
        }
      });
    } else {
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(AssigndesigndialogComponent, {
        width: "73%",
        height: "90%",
        autoFocus: false,
        disableClose: true,
        data: { isEditMode: false, design: record },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.refreshDashboard) {
          this.removeItemFromPermitList(type);
          this.addItemToPermitList(LISTTYPE.INDESIGN, result.design);
          this.fetchAllDesignsCount();
        }
      });
    }
  }

  generatepdf(record: Design, event: Event): void {
    this.activitybarClose();
    event.stopPropagation();
    this.designService.generateDesignPDF(record.id).subscribe(
      () => {
        // do nothing.
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  openPermitAssignQCDialog(
    record: Design,
    event: Event,
    index,
    type: LISTTYPE
  ): void {
    this.getAnalyst();
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const dialogRef = this.dialog.open(AssignreviewerdialogComponent, {
      width: "73%",
      height: "90%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, design: record, isDesign: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.refreshDashboard) {
        this.removeItemFromPermitList(type);
        this.addItemToPermitList(LISTTYPE.INREVIEW, result.design);
        this.fetchAllDesignsCount();
      }
    });
  }

  selfAssignQC(record: Design, event: Event, index, type: LISTTYPE): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const postData = {
      reviewassignedto: this.loggedInUser.id,
      status: "reviewassigned",
      reviewstarttime: Date.now(),
    };

    this.designService.editDesign(record.id, postData).subscribe(
      (response) => {
        this.notifyService.showSuccess(
          "Quality check process for " +
          record.address +
          "  has been successfully assigned to you.",
          "Success"
        );
        this.removeItemFromPermitList(type);
        this.addItemToPermitList(LISTTYPE.INREVIEW, response);
        this.fetchAllDesignsCount();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  selfAssignQCPermit(
    record: Design,
    event: Event,
    index,
    type: LISTTYPE
  ): void {
    this.isLoading = true;
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const postData = {
      reviewassignedto: this.loggedInUser.id,
      status: "reviewassigned",
      reviewstarttime: Date.now(),
    };
    this.loaderservice.show();
    this.designService.selfassignreview(record.id, postData).subscribe(
      (response) => {
        this.notifyService.showSuccess(
          "Quality check process for " +
          record.address +
          "  has been successfully assigned to you.",
          "Success"
        );
        this.removeItemFromPermitList(type);
        this.addItemToPermitList(LISTTYPE.INREVIEW, response);
        this.fetchAllDesignsCount();
        this.isLoading = false;
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  openDesignDeclineDialog(record: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesignDeclineDialog, {
      width: "50%",
      disableClose: true,
      data: { design: record },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.updateItemInPermitList(LISTTYPE.ONHOLD, result.design);
      }
    });
  }

  openPermitDesignDeclineDialog(record: Design, type: LISTTYPE, action): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesignDeclineDialog, {
      width: "50%",
      disableClose: true,
      data: { design: record, action: action, istimerstart: this.disablestartbutton },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        if (type == LISTTYPE.NEW) {
          this.removeItemFromPermitList(LISTTYPE.NEW);
        } else if (type == LISTTYPE.INDESIGN) {
          this.removeItemFromPermitList(LISTTYPE.INDESIGN);
        } else if (type == LISTTYPE.COMPLETED) {
          this.removeItemFromPermitList(LISTTYPE.COMPLETED);
        } else if (type == LISTTYPE.INREVIEW) {
          this.removeItemFromPermitList(LISTTYPE.INREVIEW);
        }
        if (type == LISTTYPE.ONHOLD) {
          this.removeItemFromPermitList(LISTTYPE.ONHOLD);
        }
        // this.addItemToPermitList(LISTTYPE.ONHOLD, result.design)
        this.fetchAllDesignsCount();
        if (result.onholdtimer) {
          this.getJobTime();
        }

      }
    });
  }

  openDesignDeliveryDialog(record: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesignDeliverDialog, {
      width: "50%",
      disableClose: true,
      data: { design: record },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.isLoading = true;
        this.changeDetectorRef.detectChanges();
        const postData = {
          status: "delivered",
          comments: result.deliverycomments,
        };
        this.loaderservice.show();
        this.designService.deliverdesign(record.id, postData).subscribe(
          (response) => {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showSuccess(
              "Design request has been delivered successfully.",
              "Success"
            );
            this.loaderservice.hide();
            this.removeItemFromPermitList(LISTTYPE.INREVIEW);
            this.addItemToPermitList(LISTTYPE.DELIVERED, response);
            this.fetchAllDesignsCount();
          },
          (error) => {
            this.loaderservice.hide();
            this.notifyService.showError(error, "Error");
          }
        );
      }
    });
  }

  openDesignResendDialog(record: Design, ispermit: boolean, design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(permitDesignResendDialog, {
      width: "73%",
      height: "90%",
      disableClose: true,
      data: {
        design: record,
        ispermitmode: ispermit,
        isWattmonkUser: this.isWattmonkUser,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.removeItemFromPermitList(LISTTYPE.DELIVERED);
        this.addItemToPermitList(LISTTYPE.NEW, result.design);
        this.fetchAllDesignsCount();
        // if (this.updatejob(design)) {
        //   this.fetchAllDesignsCount();
        // }
      }
    });
  }

  maintabchange(tabChangeEvent: MatTabChangeEvent): void {
    this.activeTab = tabChangeEvent.index;
    this.Array = [];
    this.allArchives = [];
    this.permitnewdesignslist = [];
    this.permitindesignslist = [];
    this.permitcompleteddesignslist = [];
    this.permitinreviewdesignslist = [];
    this.permitdelivereddesignslist = [];
    this.permitonholddesignslist = [];
    this.skip = 0;
    this.selectedTabIndex = tabChangeEvent.index;
    if (![2, 4].includes(this.selectedTabIndex)) {
      this.reviwerid = null;
    }

    this.istabchangeevent = true;
    this.fetchAllDesignsCount();
    //     let searchdata;
    this.skip = 0;
    //     if (this.creatorparentid) {
    //       searchdata =
    //         "requesttype=permit&limit=" +
    //         this.limit +
    //         "&skip=" +
    //         this.skip +
    //         "&creatorparentid=" +
    //         this.creatorparentid +
    //         "&status=created&status=outsourced&status=requestaccepted&status=requestdeclined";
    //     } else {
    //       searchdata =
    //         "requesttype=permit&limit=" +
    //         this.limit +
    //         "&skip=" +
    //         this.skip +
    //         "&status=created&status=outsourced&status=requestaccepted&status=requestdeclined";
    //     }

    switch (tabChangeEvent.index) {
      case 0:
        this.ispermitnewdesignslistloading = true;
        // this.fetchNewDesignsData("requesttype=permit&status=created&status=outsourced&status=requestaccepted&status=requestdeclined");
        // this.permitfetchNewDesignsData(searchdata);
        break;
      case 1:
        this.ispermitonholddesignslistloading = true;
        this.permitfetchOnHoldDesignsData();
        break;
      case 2:
        this.ispermitindesignslistloading = true;
        this.getdesigner();
        this.permitfetchInDesigningDesignsData();
        break;
      case 3:
        this.ispermitcompleteddesignslistloading = true;
        this.permitfetchCompletedDesignsData();
        break;
      case 4:
        this.ispermitinreviewdesignslistloading = true;
        this.getAnalyst();
        this.getJobTime();
        this.permitfetchInReviewDesignsData();
        break;
      case 5:
        this.ispermitdelivereddesignslistloading = true;
        this.permitfetchDeliveredDesignsData();
        break;

      default:
        break;
    }
  }

  onScroll(): void {
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();

    if (end == total && this.allnewdesigns > total) {
      this.Newscrolling = true;

      let searchdata;

      this.skip += 10;

      if (this.creatorparentid) {
        if (this.statusfilter && this.statusfilter == "requestdeclined") {
          searchdata =
            "requesttype=permit&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=requestdeclined";
        } else if (
          this.statusfilter &&
          this.statusfilter == "isinrevisionstate"
        ) {
          searchdata =
            "requesttype=permit&isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid;
        } else {
          searchdata =
            "requesttype=permit&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=created&status=outsourced&status=requestaccepted";
        }

      } else {
        if (this.statusfilter && this.statusfilter == "requestdeclined") {
          searchdata =
            "requesttype=permit&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=requestdeclined";
        } else if (
          this.statusfilter &&
          this.statusfilter == "isinrevisionstate"
        ) {
          searchdata =
            "requesttype=permit&isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=requestaccepted";
        } else {
          searchdata =
            "requesttype=permit&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=requestaccepted";
        }

      }

      this.permitfetchNewDesignsData(searchdata);
    }
  }
  onScrollindesign(): void {
    const end = this.indesignviewport.getRenderedRange().end;
    const total = this.indesignviewport.getDataLength();

    if (end == total && this.allindesigns > total) {
      this.Designingscrolling = true;
      this.skip += 10;
      this.permitfetchInDesigningDesignsData();
    }
  }

  onScrollcompleteddesign(): void {
    const end = this.completeddesignviewport.getRenderedRange().end;
    const total = this.completeddesignviewport.getDataLength();

    if (end == total && this.allcompleteddesigns > total) {
      this.completedscrolling = true;
      this.skip += 10;
      this.permitfetchCompletedDesignsData();
    }
  }
  onScrollinreview(): void {
    const end = this.inreviewviewport.getRenderedRange().end;
    const total = this.inreviewviewport.getDataLength();

    if (end == total && this.allinreviewdesigns > total) {
      this.inreviewscrolling = true;
      this.skip += 10;
      this.permitfetchInReviewDesignsData();
    }
  }

  onScrolldelivered(): void {
    const end = this.deliveredviewport.getRenderedRange().end;
    const total = this.deliveredviewport.getDataLength();

    if (end == total && this.alldelivereddesigns > total) {
      this.Dscrolling = true;
      this.skip += 10;
      this.permitfetchDeliveredDesignsData();
    }
  }

  onScrollonhold(): void {
    const end = this.onholdviewport.getRenderedRange().end;
    const total = this.onholdviewport.getDataLength();

    if (end == total && this.allonholddesigns > total) {
      this.holdscrolling = true;
      this.skip += 10;
      this.permitfetchOnHoldDesignsData();
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
      this.permitdelivereddesignslist.map((item, index) => {
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
      type: "permit",
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
          this.ispermitdelivereddesignslistloading = true;
          this.fetchAllDesignsCount();
          this.permitdelivereddesignslist = [];
          this.permitfetchDeliveredDesignsData();
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

  fetchAllDesignsCount(): void {
    this.ispermitnewdesignslistloading = true;
    this.permitnewdesignslist = [];
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
      if (this.statusfilter && this.statusfilter == "requestdeclined") {
        searchdata =
          "requesttype=permit&limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&creatorparentid=" +
          this.creatorparentid +
          "&status=requestdeclined";
      } else if (
        this.statusfilter &&
        this.statusfilter == "isinrevisionstate"
      ) {
        searchdata =
          "requesttype=permit&isinrevisionstate=true&limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&creatorparentid=" +
          this.creatorparentid;
      } else {
        searchdata =
          "requesttype=permit&limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&creatorparentid=" +
          this.creatorparentid +
          "&status=created&status=outsourced&status=requestaccepted";
      }

      parentid = this.creatorparentid;
    } else {
      if (this.statusfilter && this.statusfilter == "requestdeclined") {
        searchdata =
          "requesttype=permit&limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&status=requestdeclined";
      } else if (
        this.statusfilter &&
        this.statusfilter == "isinrevisionstate"
      ) {
        searchdata =
          "requesttype=permit&isinrevisionstate=true&limit=" +
          this.limit +
          "&skip=" +
          this.skip;
      } else {
        searchdata =
          "requesttype=permit&limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&status=created&status=outsourced&status=requestaccepted";
      }

      parentid = "";
    }

    this.designService
      .getDesignsCount1("permit", parentid, this.statusfilter, this.reviwerid)
      .subscribe(
        (response) => {
          this.allnewdesigns = response["newdesign"];
          this.allindesigns = response["indesigning"];
          this.allcompleteddesigns = response["completed"];
          this.allinreviewdesigns = response["inreviewdesign"];
          this.alldelivereddesigns = response["delivered"];
          this.allonholddesigns = response["onholddesign"];
          this.changeDetectorRef.detectChanges();
          if (this.activeTab == 0) {
            this.permitfetchNewDesignsData(searchdata);
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchPermitDesignDetails(design: Design, type: LISTTYPE): void {
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        const record = this.fillinDynamicDataForSingleRecord(response);
        this.openPermitDesignDetailDialog(record, type);
        this.loaderservice.hide();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
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
      this.permitnewdesignslist = [];
      this.permitindesignslist = [];
      this.permitcompleteddesignslist = [];
      this.permitinreviewdesignslist = [];
      this.permitdelivereddesignslist = [];
      this.permitonholddesignslist = [];
      this.skip = 0;
      this.sorting = true;

      this.sortingdata =
        "&orderby=" +
        this.orderbyfilterstatus +
        "&ordertype=" +
        this.ordertypefilterstatus;
      if (this.activeTab == 0) {
        this.ispermitnewdesignslistloading = true;

        if (this.reviwerid) {
          searchdata = "id=" + this.reviwerid + "&";
        }
        if (this.creatorparentid) {
          if (this.statusfilter && this.statusfilter == "requestdeclined") {
            searchdata =
              "requesttype=permit&limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&creatorparentid=" +
              this.creatorparentid +
              "&status=requestdeclined";
          } else if (
            this.statusfilter &&
            this.statusfilter == "isinrevisionstate"
          ) {
            searchdata =
              "requesttype=permit&isinrevisionstate=true&limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&creatorparentid=" +
              this.creatorparentid;
          } else {
            searchdata =
              "requesttype=permit&limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&creatorparentid=" +
              this.creatorparentid +
              "&status=created&status=outsourced&status=requestaccepted";
          }

        } else {
          if (this.statusfilter && this.statusfilter == "requestdeclined") {
            searchdata =
              "requesttype=permit&limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&status=requestdeclined";
          } else if (
            this.statusfilter &&
            this.statusfilter == "isinrevisionstate"
          ) {
            searchdata =
              "requesttype=permit&isinrevisionstate=true&limit=" +
              this.limit +
              "&skip=" +
              this.skip;
          } else {
            searchdata =
              "requesttype=permit&limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&status=created&status=outsourced&status=requestaccepted";
          }


        }
        this.permitfetchNewDesignsData(searchdata);
      } else if (this.activeTab == 1) {
        this.ispermitonholddesignslistloading = true;
        this.permitfetchOnHoldDesignsData();
      } else if (this.activeTab == 2) {
        this.ispermitindesignslistloading = true;
        this.permitfetchInDesigningDesignsData();
      } else if (this.activeTab == 3) {
        this.ispermitcompleteddesignslistloading = true;
        this.permitfetchCompletedDesignsData();
      } else if (this.activeTab == 4) {
        this.ispermitinreviewdesignslistloading = true;
        this.permitfetchInReviewDesignsData();
      } else if (this.activeTab == 5) {
        this.ispermitdelivereddesignslistloading = true;
        this.permitfetchDeliveredDesignsData();
      }
    } else {
      this.sorting = false;
      if (event.value == "null") {
        this.sortingdata = "";
        this.ordertypefilterstatus = null;
        this.orderbyfilterstatus = null;
        if (this.activeTab == 0) {
          this.ispermitnewdesignslistloading = true;
          this.fetchAllDesignsCount();
        } else if (this.activeTab == 1) {
          this.ispermitonholddesignslistloading = true;
          this.permitfetchOnHoldDesignsData();
        } else if (this.activeTab == 2) {
          this.ispermitindesignslistloading = true;
          this.permitfetchInDesigningDesignsData();
        } else if (this.activeTab == 3) {
          this.ispermitcompleteddesignslistloading = true;
          this.permitfetchCompletedDesignsData();
        } else if (this.activeTab == 4) {
          this.ispermitinreviewdesignslistloading = true;
          this.permitfetchInReviewDesignsData();
        } else if (this.activeTab == 5) {
          this.ispermitdelivereddesignslistloading = true;
          this.permitfetchDeliveredDesignsData();
        }
      }
    }

    // this.changeDetectorRef.detectChanges()
  }

  fillinDynamicData(records: Design[]): Design[] {
    records.forEach((element) => {
      this.fillinDynamicDataForSingleRecord(element);
    });
    this.eventEmitterService.onConversationItemSelected(0);
    return records;
  }

  fillinDynamicDataForSingleRecord(element: Design): Design {
    element.designcurrentstatus = this.genericService.getDesignStatusName(
      element.status
    );
    if (element.status != "delivered") {
      element.isoverdue = this.genericService.isDatePassed(
        element.expecteddeliverydate
      );
    } else {
      element.isoverdue = false;
    }
    element.lateby = this.genericService.getTheLatebyString(
      element.expecteddeliverydate
    );
    element.recordupdatedon = this.genericService.formatDateInTimeAgo(
      element.updated_at
    );
    element.formattedjobtype = this.genericService.getJobTypeName(
      element.jobtype
    );
    if (
      element.requesttype == "permit" &&
      this.loggedInUser.minpermitdesignaccess
    ) {
      element.isrecordcomplete = true;
    } else {
      if (element.requesttype == "permit" && element.jobtype != "battery") {
        if (
          element.designgeneralinformation != null &&
          element.electricalinformation != null &&
          element.electricalslocation != null &&
          element.structuralinformations.length > 0
        ) {
          element.isrecordcomplete = true;
        }
      } else if (
        element.requesttype == "permit" &&
        element.jobtype == "battery"
      ) {
        if (
          element.designgeneralinformation != null &&
          element.electricalinformation != null &&
          element.electricalslocation != null
        ) {
          element.isrecordcomplete = true;
        }
      }
    }

    //Setting acceptance timer
    if (element.status == "outsourced") {
      if (element.requesttype == "permit") {
        const acceptancedate = new Date(element.designacceptancestarttime);
        element.designacceptanceremainingtime =
          this.genericService.getRemainingTime(acceptancedate.toString());
      } else {
        const acceptancedate = new Date(element.designacceptancestarttime);
        element.designacceptanceremainingtime =
          this.genericService.getRemainingTime(acceptancedate.toString());
      }

      if (element.designacceptanceremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Setting design timer
    if (
      element.status == "designassigned" ||
      element.status == "designcompleted"
    ) {
      if (element.requesttype == "permit") {
        const acceptancedate = new Date(element.designstarttime);
        acceptancedate.setHours(acceptancedate.getHours() + 6);
        element.designremainingtime = this.genericService.getRemainingTime(
          acceptancedate.toString()
        );
      } else {
        const acceptancedate = new Date(element.designstarttime);
        acceptancedate.setHours(acceptancedate.getHours() + 2);
        element.designremainingtime = this.genericService.getRemainingTime(
          acceptancedate.toString()
        );
      }
      if (element.designremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Setting review timer
    if (
      element.status == "reviewassigned" ||
      element.status == "reviewpassed" ||
      element.status == "reviewfailed"
    ) {
      if (element.requesttype == "permit") {
        const reviewdate = new Date(element.reviewstarttime);
        reviewdate.setHours(reviewdate.getHours() + 2);
        element.reviewremainingtime = this.genericService.getRemainingTime(
          reviewdate.toString()
        );
      } else {
        const reviewdate = new Date(element.reviewstarttime);
        reviewdate.setMinutes(reviewdate.getMinutes() + 15);
        element.reviewremainingtime = this.genericService.getRemainingTime(
          reviewdate.toString()
        );
      }
      if (element.reviewremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Code to fetch unread message count
    CometChat.getUnreadMessageCountForGroup(element.chatid).then((array) => {
      if (array[element.chatid] != undefined) {
        element.unreadmessagecount = array[element.chatid];
        this.changeDetectorRef.detectChanges();
      } else {
        element.unreadmessagecount = 0;
        this.changeDetectorRef.detectChanges();
      }
    });

    let currenttime = new Date().getTime();
    // let starttime = new Date(element.tasktimings.starttime).getTime();
    let starttime = new Date(element?.newtasktimings?.starttime).getTime();
    let newtime = currenttime - starttime;
    let sec: any = Math.floor(newtime / 1000);
    // Designer Timer
    if (this.selectedTabIndex == 2 && !element?.newtasktimings?.canceled && element?.newtasktimings?.taskstatus == "pending") {
      // let minutes = Math.floor(sec / 60);
      let permitdesigner = this.jobtime.permit_designer * 60;
      if (sec > permitdesigner) {
        element.newtasktimings.isjobtimeexceeded = true;
      }
      else {
        element.newtasktimings.isjobtimeexceeded = false;
      }
    }
    else if (this.selectedTabIndex == 4 && !element?.newtasktimings?.canceled && element?.newtasktimings?.taskstatus == "pending") {
      // let minutes = Math.floor(sec / 60);
      let permitanalyst = this.jobtime.permit_analyst * 60;
      if (sec > permitanalyst) {
        element.newtasktimings.isjobtimeexceeded = true;
      }
      else {
        element.newtasktimings.isjobtimeexceeded = false;
      }
    }

    return element;
  }

  //PERMIT LISTS APIS
  permitfetchNewDesignsData(search: string): void {
    // const d = new Date();
    // const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    // const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
    // const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

    // let date = `${ye}-${mo}-${da}`;
    if (this.sorting) {
      search = search + this.sortingdata;
    }
    this.designService.getFilteredDesigns(search).subscribe(
      (response) => {
        if (response.length > 0) {
          this.getpermitnewdesign = this.fillinDynamicData(response);

          for (let i = 0, len = this.getpermitnewdesign.length; i < len; ++i) {
            this.permitnewdesignslist.push(this.getpermitnewdesign[i]);
          }
          this.permitnewdesignslist = [...this.permitnewdesignslist];
          /* this.permitnewdesignslist.sort((a,b) =><any> new Date(a.created_at).getTime()- <any>new Date(b.created_at).getTime()) ; */
          this.changeDetectorRef.detectChanges();
        }
        this.isLoading = false;
        this.ispermitnewdesignslistloading = false;
        this.Newscrolling = false;
        this.changeDetectorRef.detectChanges();
        if (this.istabchangeevent) {
          this.istabchangeevent = false;
        }
        if (!this.isClient) {
          this.newpermitsRef.update({ count: 0 });
          this.selectedcompanynewpermitsRef.update({ newpermits: 0 });
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  permitfetchOnHoldDesignsData(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }

    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=requestdeclined";
    } else {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=requestdeclined";
    }
    if (this.sorting) {
      searchdata = searchdata + this.sortingdata;
    }
    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.permitonholddesigns = response.length;
        if (response.length > 0) {
          this.getpermitonholddesign = this.fillinDynamicData(response);

          for (
            let i = 0, len = this.getpermitonholddesign.length;
            i < len;
            ++i
          ) {
            this.permitonholddesignslist.push(this.getpermitonholddesign[i]);
          }
          this.permitonholddesignslist = [...this.permitonholddesignslist];
          /*  this.permitindesignslist.sort((a,b) =><any> new Date(a.created_at).getTime()- <any>new Date(b.created_at).getTime()) ; */
          this.changeDetectorRef.detectChanges();
        }
        this.ispermitonholddesignslistloading = false;

        this.holdscrolling = false;
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

  permitfetchInDesigningDesignsData(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }

    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=designassigned";
    } else {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=designassigned";
    }
    if (this.sorting) {
      searchdata = searchdata + this.sortingdata;
    }
    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.permitindesigns = response.length;
        if (response.length > 0) {
          this.getpermitindesign = this.fillinDynamicData(response);

          for (let i = 0, len = this.getpermitindesign.length; i < len; ++i) {
            this.permitindesignslist.push(this.getpermitindesign[i]);
          }
          this.permitindesignslist = [...this.permitindesignslist];
          /*  this.permitindesignslist.sort((a,b) =><any> new Date(a.created_at).getTime()- <any>new Date(b.created_at).getTime()) ; */
          this.changeDetectorRef.detectChanges();
        }
        this.ispermitindesignslistloading = false;

        this.Designingscrolling = false;
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

  permitfetchCompletedDesignsData(): void {
    let searchdata;
    if (this.creatorparentid) {
      searchdata =
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=designcompleted";
    } else {
      searchdata =
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=designcompleted";
    }
    if (this.sorting) {
      searchdata = searchdata + this.sortingdata;
    }
    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.permitcompleteddesigns = response.length;
        if (response.length > 0) {
          this.getpermitcompleteddesign = this.fillinDynamicData(response);

          for (
            let i = 0, len = this.getpermitcompleteddesign.length;
            i < len;
            ++i
          ) {
            this.permitcompleteddesignslist.push(
              this.getpermitcompleteddesign[i]
            );
          }
          this.permitcompleteddesignslist = [
            ...this.permitcompleteddesignslist,
          ];
          /*  this.permitcompleteddesignslist.sort((a,b) =><any> new Date(a.created_at).getTime()- <any>new Date(b.created_at).getTime()) ; */
          this.changeDetectorRef.detectChanges();
        }
        this.ispermitcompleteddesignslistloading = false;

        this.completedscrolling = false;
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

  permitfetchInReviewDesignsData(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }

    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=reviewassigned&status=reviewfailed&status=reviewpassed";
    } else {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=reviewassigned&status=reviewfailed&status=reviewpassed";
    }
    if (this.sorting) {
      searchdata = searchdata + this.sortingdata;
    }
    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.permitinreviewdesigns = response.length;
        if (response.length > 0) {
          this.getpermitinreviewdesign = this.fillinDynamicData(response);

          for (
            let i = 0, len = this.getpermitinreviewdesign.length;
            i < len;
            ++i
          ) {
            this.permitinreviewdesignslist.push(
              this.getpermitinreviewdesign[i]
            );
          }
          this.permitinreviewdesignslist = [...this.permitinreviewdesignslist];
          /* this.permitinreviewdesignslist.sort((a,b) =><any> new Date(a.created_at).getTime()- <any>new Date(b.created_at).getTime()) ; */
          this.changeDetectorRef.detectChanges();
        }
        this.ispermitinreviewdesignslistloading = false;

        this.inreviewscrolling = false;
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

  permitfetchDeliveredDesignsData(): void {
    let searchdata;

    if (this.creatorparentid) {
      searchdata =
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=delivered";
    } else {
      searchdata =
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=delivered";
    }
    if (this.sorting) {
      searchdata = searchdata + this.sortingdata;
    }
    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.isLoader = false;
        this.permitdelivereddesigns = response.length;
        if (response.length > 0) {
          this.getpermitdelivereddesign = this.fillinDynamicData(response);
          for (
            let i = 0, len = this.getpermitdelivereddesign.length;
            i < len;
            ++i
          ) {
            this.permitdelivereddesignslist.push(
              this.getpermitdelivereddesign[i]
            );
            this.allArchives.push(false);
            this.scrollwiseDesigns = this.permitdelivereddesignslist;
          }
          this.permitdelivereddesignslist = [
            ...this.permitdelivereddesignslist,
          ];
          /*  this.permitdelivereddesignslist.sort((a,b) =><any> new Date(b.created_at).getTime()- <any>new Date(b.created_at).getTime()) ; */
          this.changeDetectorRef.detectChanges();
        }
        this.Dscrolling = false;

        this.ispermitdelivereddesignslistloading = false;
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

  deliverDesign(design: Design, event: Event, index): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openDesignDeliveryDialog(design);
  }

  resendDesign(
    design: Design,
    event: Event,
    ispermit: boolean,
    index: number
  ): void {
    this.activitybarClose();
    event.stopPropagation();
    this.loaderservice.show();
    this.listactionindex = index;
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        var record = this.fillinDynamicDataForSingleRecord(response);
        this.openDesignResendDialog(record, ispermit, design);
        this.loaderservice.hide();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
    /* this.designService.getDesignDetails(design.id).subscribe(response => {
       console.log("REsponse:",response);
       this.openDesignResendDialog(response, ispermit);
     })*/
  }

  declineDesignRequest(design: Design, event: Event, index: number): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openDesignDeclineDialog(design);
  }

  acceptDesignRequest(design: Design, event: Event, index: number): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.isLoading = true;
    this.changeDetectorRef.detectChanges();
    const cdate = Date.now();
    const expecteddeliverydate = new Date();

    expecteddeliverydate.setHours(
      expecteddeliverydate.getHours() + parseInt(design.slabname)
    );

    const postData = {
      status: "requestaccepted",
      designacceptanceendtime: cdate,
      expecteddeliverydate: expecteddeliverydate,
    };
    this.loaderservice.show();
    this.designService.acceptDesign(design.id, postData).subscribe(
      (response) => {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.notifyService.showSuccess(
          "Design request has been accepted successfully.",
          "Success"
        );
        this.loaderservice.hide();
        this.updateItemInPermitList(LISTTYPE.NEW, response);
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  declinePermitDesignRequest(
    design: Design,
    event: Event,
    index: number,
    type: LISTTYPE,
    action
  ): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openPermitDesignDeclineDialog(design, type, action);
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
  createNewDesignChatGroup(design: Design): void {
    const GUID = design.chatid;

    const address = design.address.substring(0, 60);

    const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
    const groupName = design.name + "_" + address + "_" + currentdatetime;

    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = design.groupchatpassword;

    const group = new CometChat.Group(GUID, groupName, groupType, password);
    const adminsid = [];
    //adminsid.push(design.createdby.parent)
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
    // adminsid.push(this.loggedInUser.id);
    CometChat.createGroup(group).then(
      (group) => {
        const membersList = [
          new CometChat.GroupMember(
            "" + design.createdby.cometchatuid,
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
            chatgroupusers.push(design.createdby.cometchatuid);
            const inputData = {
              title: groupName,
              guid: GUID,
              parentid: design.createdby.parent.id,
              chatgroupusers: chatgroupusers,
            };
            this.commonservice.addChatGroup(inputData).subscribe(
              () => {
                // do nothing.
              },
              (error) => {
                this.notifyService.showError(error, "Error");
              }
            );
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            if (this.isOutsourced) {
              this.notifyService.showSuccess(
                "Design request has been successfully assigned.",
                "Success"
              );
            }
            this.updateItemInPermitList(LISTTYPE.NEW, design);
          },
          () => {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            if (this.isOutsourced) {
              this.notifyService.showSuccess(
                "Design request has been successfully assigned.",
                "Success"
              );
            }
            this.updateItemInPermitList(LISTTYPE.NEW, design);
          }
        );
      },
      (error) => {
        console.log(error)
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        if (this.isOutsourced) {
          this.notifyService.showSuccess(
            "Design request has been successfully assigned.",
            "Success"
          );
        }
        this.updateItemInPermitList(LISTTYPE.NEW, design);
      }
    );
  }

  updateDesignStatus(
    designid: number,
    designstatus: string,
    message: string
  ): void {
    this.activitybarClose();
    event.stopPropagation();
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

  getWattmonkadmins(): void {
    this.commonservice.getWattmonkAdmins().subscribe(
      (response) => {
        this.wattmonkadmins = response;
        this.commonservice.getGroupTeamHead().subscribe(
          (response) => {
            response.forEach((element) => {
              this.wattmonkadmins.push(element);
            });
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  addUserToGroupChat(design: Design): void {
    const GUID = design.chatid;
    // let id = [];
    let userscope = CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT;
    if (design.status == "requestaccepted" || design.status == "outsourced") {
      userscope = CometChat.GROUP_MEMBER_SCOPE.ADMIN;
    }
    const membersList = [
      new CometChat.GroupMember("" + this.loggedInUser.cometchatuid, userscope),
    ];
    CometChat.addMembersToGroup(GUID, membersList, []).then(() => {
      this.fetchAllDesignsCount();
    });
  }

  applyCardCss(i, design) {
    this.permitanalyst = this.jobtime?.permit_analyst * 60;
    if (i % 2 == 0) {
      if ((design?.taskoverdue || design?.newtasktimings?.isjobtimeexceeded || (this.totalminutes > this.permitanalyst && this.job?.designid == design.id)) && this.isWattmonkUser) {
        return 'itemcard even jobtime';
      }
      else {
        return 'itemcard even';
      }
    }
    else {
      if ((design?.taskoverdue || design?.newtasktimings?.isjobtimeexceeded || (this.totalminutes > this.permitanalyst && this.job?.designid == design.id)) && this.isWattmonkUser) {
        return 'itemcard odd jobtime';
      }
      else {
        return 'itemcard odd';
      }
    }
  }

  cancelTime($ev, design) {
    this.loaderservice.show();
    $ev.stopPropagation();
    let timingid;
    if (this.timerstarted) {
      timingid = this.job?.id;
    }
    else {
      timingid = design?.newtasktimings?.id;
    }
    let postData = {
      canceled: true
    }
    this.designService.updateJobTime(timingid, postData).subscribe(() => {
      // this.designService.getDesignDetails(design?.id).subscribe((res: Design) => {
      //   if (this.selectedTabIndex == 2) {
      //     this.updateItemInList(LISTTYPE.INDESIGN, res);
      //   }
      //   else {
      //     this.updateItemInList(LISTTYPE.INREVIEW, res);
      //   }
      // })
      if (this.selectedTabIndex == 2) {
        this.permitindesignslist = [];
        this.ispermitindesignslistloading = true;
        this.permitfetchInDesigningDesignsData();
      }
      else {
        this.permitinreviewdesignslist = [];
        this.ispermitinreviewdesignslistloading = true;
        this.permitfetchInReviewDesignsData();
      }
      this.minutes = 0;
      this.hour = 0;
      this.display = "";
      this.disablestartbutton = false;
      this.totalminutes = 0;
      clearInterval(this.intervalId);
      this.job = new JobsTiming;
      this.loaderservice.hide();
    },
      (error) => {
        this.notifyService.showError(error, "Error");
      })
  }

  startTimer(ev, design, i) {
    ev.stopPropagation();
    let starttime;
    // this.hour = 0;
    // this.minutes = 0;
    // this.timer = 0;
    // this.totalminutes = 0;
    this.clearTimer();
    starttime = new Date().getTime();
    // this.countDown = timer(0, this.tick).subscribe(() => this.counter++);
    // let gg = this.genericService.formatDateInBackendFormat(starttime);
    // console.log(gg)
    let postdata = {
      starttime: starttime,
      designid: design.id,
      userid: this.loggedInUser.id
    }
    this.designService.startTime(postdata).subscribe((res: JobsTiming) => {
      this.job = res;
      this.permitinreviewdesignslist[i].newtasktimings = res;
      this.disablestartbutton = true;
      this.timerstarted = true;
      // this.totalminutes = this.minutes + (this.hour * 60);
      // this.totalminutes = (this.totalminutes * 60) + this.timer;
      this.intervalId = setInterval(() => {
        if (this.timer >= 60) {
          this.timer = 0;
        }
        this.timer++;
        this.totalminutes++;
        this.display = this.transform(this.timer);
        this.changeDetectorRef.detectChanges();
      }, 1000);
    }, (error) => {
      this.notifyService.showError(error, "Error");
    })

  }

  transform(value: number): string {
    let hrs = 0;
    let mins = 0;
    var sec_num = value;
    // if (type == 'start') {
    //   this.hour = Math.floor(sec_num / 3600);
    //   console.log(this.minutes)
    //   this.minutes = (Math.floor((sec_num - (this.hour * 3600)) / 60));
    //   console.log(this.minutes)
    //   sec_num - (this.hour * 3600) - (this.minutes * 60);
    // }
    // else {
    mins = Math.floor(sec_num / 60);
    this.minutes += mins;
    hrs = Math.floor(this.minutes / 60);
    this.hour += hrs;
    this.minutes = this.minutes % 60;
    // sec_num - (this.hour * 3600) - (this.minutes * 60);
    // }
    if (sec_num >= 60) {
      sec_num = 0;
    }

    return this.hour + 'h' + ' : ' + this.minutes + 'm' + ' : ' + sec_num + 's';
  }

  getJobTime() {
    let currenttime;
    let newtimer;
    let starttime;
    this.display = "0h : 0m : 0s";
    this.clearTimer();
    this.designService.getJobTime().subscribe((res) => {
      if (res.length) {
        if (res[0].taskstatus == 'pending' && !res[0].canceled) {
          this.disablestartbutton = true;
          this.job = res[0];
          // else {

          starttime = new Date(res[0].starttime).getTime();
          currenttime = new Date().getTime();
          newtimer = currenttime - starttime;
          this.seconds = Math.floor(newtimer / 1000);
          let sec: any = this.seconds;
          this.hour = Math.floor(sec / 3600);
          // sec -= this.hour * 3600;
          this.minutes = Math.floor(sec / 60);
          // this.totalminutes = this.minutes;
          sec -= this.minutes * 60;
          this.minutes = this.minutes % 60;
          sec = '' + sec;
          sec = ('00' + sec).substring(sec.length);
          this.totalminutes = this.seconds;
          // this.totalminutes = this.minutes + (this.hour * 60);
          // this.totalminutes = (this.totalminutes * 60) + sec;
          this.intervalId = setInterval(() => {
            if (sec >= 60) {
              sec = 0;
            }
            sec++;
            this.totalminutes++;
            this.display = this.transform(sec);
            this.changeDetectorRef.detectChanges();
          }, 1000);
        }
        else {
          this.clearTimer();
        }
      }
      else {
        this.clearTimer();
      }
    }, (error) => {
      this.notifyService.showError(error, "Error");
    })

  }

  clearTimer() {
    this.totalminutes = 0;
    this.minutes = 0;
    this.hour = 0;
    this.seconds = 0;
    this.disablestartbutton = false;
    clearInterval(this.intervalId);
    this.timer = 0;
    this.job = null;
  }


  addAdditionalInformation(design, event) {
    event.stopPropagation();
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe((res) => {
      this.openAdditionalInformationDialog(res);
    })
  }
  openAdditionalInformationDialog(design) {
    const dialogRef = this.dialog.open(DetailedpermitComponent, {
      width: "95%",
      maxWidth: "95%",
      autoFocus: false,
      disableClose: true,
      data: {
        design: design,
        disableClose: true,
        triggerEditEvent: false,
        triggerDeleteEvent: false,
      },
    });


    dialogRef.afterClosed().subscribe((result) => {
      this._snackBar.dismiss();
      if (result.triggerEditEvent) {
        this.openEditPermitDesignDialog(this.listtypes.NEW, design);
      }
      if (result.triggerDeleteEvent) {
        this.removeItemFromPermitList(this.listtypes.NEW);
      }
      if (result.isdataupdated) {
        this.updateItemInPermitList(this.listtypes.NEW, result.design);
      }
    });
  }
}
export interface DesignDeclineDialogData {
  design: Design;
  reason: string;
  issubmitted: boolean;
  action: string;
  istimerstart: boolean;
  onholdtimer: boolean;
}

@Component({
  selector: "design-decline-dialog",
  templateUrl: "design-decline-dialog.html",
  styleUrls: ["design.component.scss"],
})
export class DesignDeclineDialog implements OnInit {
  declinereason = new FormControl("", [Validators.required]);
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  loggedInUser;
  isLoading = false;
  loadingmessage = "Save data.";
  constructor(
    public dialogRef: MatDialogRef<DesignDeclineDialog>,
    private commonService: CommonService,
    private notifyService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    private designService: DesignService,
    private dialog: MatDialog,
    private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: DesignDeclineDialogData
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
        this.uploadAttachmentdeclineDesignFiles(this.data.action);
      } else {
        this.editDesignOnServer(this.data.action);
      }
    } else {
      this.declinereason.markAsTouched();
      this.declinereason.markAsDirty();
    }
  }

  /*onAttachmentFileSelect(event) {

    this.isAttachmentUploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      let element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }

      let extension = element.name.substring(element.name.lastIndexOf('.'));

      let mimetype = this.genericService.getMimetype(extension);
      // window.console.log(extension, mimetype);
      let data = new Blob([element], {
        type: mimetype
      });
      
      let replacedfile = new File([data], element.name, { type: mimetype });
      this.attachmentfiles.push(replacedfile);
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }*/
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
        if (type[1] == "heic" || type[1] == "HEIC") {
          element.isImage = true;
          const reader = new FileReader();
          reader.onload = (event: any) => {
            fetch(event.target.result)
              .then((res) => res.blob())
              .then((blob) => heic2any({ blob: blob, toType: "image/jpeg" }))
              .then((jpgBlob: Blob) => {
                let replacedfile;
                if (type[1] == "HEIC") {
                  replacedfile = new File(
                    [jpgBlob],
                    element.name.replace("HEIC", "jpeg"),
                    { type: "image/jpeg" }
                  );
                } else {
                  replacedfile = new File(
                    [jpgBlob],
                    element.name.replace("heic", "jpeg"),
                    { type: "image/jpeg" }
                  );
                }

                this.attachmentfiles.push(replacedfile);
                this.attachmentfiles.forEach(
                  (item) => (item["isImage"] = true)
                );
                setTimeout(() => {
                  this.changeDetectorRef.detectChanges();
                }, 300);
                this.changeDetectorRef.detectChanges();
              })
              .catch(() => {
                // see error handling section
              });
          };
          reader.readAsDataURL(element);
        } else {
          this.attachmentfiles.push(element);
          this.changeDetectorRef.detectChanges();
        }
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
  uploadAttachmentdeclineDesignFiles(action): void {
    this.isLoading = true;
    if (action == "onhold") {
      this.loadingmessage = "Uploading On Hold Attachment.";
      this.commonService
        .uploadFilesWithLoader(
          this.data.design.id,
          "designs/" + this.data.design.id,
          this.attachmentfiles,
          "requestdeclineattachment",
          "design"
        )
        .subscribe(
          () => {
            this.editDesignOnServer(this.data.action);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.loadingmessage = "Uploading Un Hold Attachment.";
      this.commonService
        .uploadFilesWithLoader(
          this.data.design.id,
          "designs/" + this.data.design.id,
          this.attachmentfiles,
          "requestunholdattachment",
          "design"
        )
        .subscribe(
          () => {
            this.editDesignOnServer(this.data.action);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    }
  }

  editDesignOnServer(action): void {
    const cdate = Date.now();
    if (action == "onhold") {
      let currenttime;
      let postData;
      if (this.loggedInUser.role.id == ROLES.Designer) {
        postData = {
          status: "requestdeclined",
          // outsourcedto : null,
          isoutsourced: "false",
          requestdeclinereason: this.declinereason.value,
          designacceptanceendtime: cdate,
          designassignedto: null,
        };
      } else if (this.loggedInUser.role.id == ROLES.Analyst) {
        postData = {
          status: "requestdeclined",
          // outsourcedto : null,
          isoutsourced: "false",
          requestdeclinereason: this.declinereason.value,
          designacceptanceendtime: cdate,
          designassignedto: null,
          reviewassignedto: null,
        };
      } else {
        postData = {
          status: "requestdeclined",
          // outsourcedto : null,
          isoutsourced: "false",
          requestdeclinereason: this.declinereason.value,
          designacceptanceendtime: cdate,
          designassignedto: null,
          reviewassignedto: null,
        };
      }
      // this.loaderservice.show();
      this.designService.onholdDesign(this.data.design.id, postData).subscribe(
        (response) => {
          if (this.data?.istimerstart) {
            currenttime = new Date().getTime();
            let timepostdata = {
              taskstatus: "onhold",
              endtime: currenttime,
              onholdtime: currenttime
            }
            this.designService.updateJobTime(this.data.design?.newtasktimings?.id, timepostdata).subscribe(() => {
              this.data.design = response;
              this.data.onholdtimer = true;
              this.isLoading = false;
              this.changeDetectorRef.detectChanges();
              this.data.issubmitted = true;
              this.notifyService.showSuccess(
                "Design request has been put on hold successfully.",
                "Success"
              );
              this.dialogRef.close(this.data);
            }, (error) => {
              this.notifyService.showError(error, "Error");
            })
          }
          else {
            this.data.design = response;
            this.data.onholdtimer = false;
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.data.issubmitted = true;
            this.notifyService.showSuccess(
              "Design request has been put on hold successfully.",
              "Success"
            );
            this.dialogRef.close(this.data);
          }
          //  this.loaderservice.hide();
        },
        (error) => {
          // this.loaderservice.hide();
          this.notifyService.showError(error, "Error");
          this.dialogRef.close(this.data);
        }
      );
    } else {
      const postData = {
        isoutsourced: "true",
        status: "requestaccepted",
        unhold: true,
        requestunholdreason: this.declinereason.value,
        designacceptanceendtime: cdate,
      };
      // this.loaderservice.show();
      this.designService.unholddesign(this.data.design.id, postData).subscribe(
        (response) => {
          this.data.design = response;
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.data.issubmitted = true;
          this.notifyService.showSuccess(
            "Design request has been Un Hold successfully.",
            "Success"
          );
          this.dialogRef.close(this.data);
          // this.loaderservice.hide();
        },
        (error) => {
          // this.loaderservice.hide();
          this.notifyService.showError(error, "Error");
          this.dialogRef.close(this.data);
        }
      );
    }
  }

  /*  createNewDesignChatGroup(design: Design) {
     let GUID = "" + design.chatid;

     let address = design.address.substring(0, 60);
     let groupName = design.name + "_" + address;

     let groupType = CometChat.GROUP_TYPE.PRIVATE;
     let password = "";

     let group = new CometChat.Group(GUID, groupName, groupType, password);

     CometChat.getGroup(GUID).then(
       (group) => {
         this.isLoading = false;
         this.changeDetectorRef.detectChanges();
         this.data.issubmitted = true;
         this.notifyService.showSuccess(
           "Design request has been put on hold successfully.",
           "Success"
         );
         this.dialogRef.close(this.data);
       },
       (error) => {
         CometChat.createGroup(group).then(
           (group) => {
             let membersList = [
               new CometChat.GroupMember(
                 "" + design.createdby.id,
                 CometChat.GROUP_MEMBER_SCOPE.ADMIN
               ),
               new CometChat.GroupMember(
                 "" + this.loggedInUser.id,
                 CometChat.GROUP_MEMBER_SCOPE.ADMIN
               ),
             ];
             CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
               (response) => {
                  let inputData ={
                 title: groupName,
                 guid : GUID,
                 parentid: design.createrparentid
              }
              this.commonService.addChatGroup(inputData).subscribe(response=>{
                
              })
                 this.isLoading = false;
                 this.changeDetectorRef.detectChanges();
                 this.data.issubmitted = true;
                 this.notifyService.showSuccess(
                   "Design request has been put on hold successfully.",
                   "Success"
                 );
                 this.dialogRef.close(this.data);
               },
               (error) => {}
             );
           },
           (error) => {}
         );
       }
     )

   } */

  ngOnInit(): void {
    // do nothing.
  }
}

export interface DesignDeliverDialogData {
  design: Design;
  deliverycomments: string;
  issubmitted: boolean;
}

@Component({
  selector: "design-deliver-dialog",
  templateUrl: "design-deliver-dialog.html",
})
export class DesignDeliverDialog implements OnInit {
  deliverycommentscontrol = new FormControl("", []);

  constructor(
    public dialogRef: MatDialogRef<DesignDeliverDialogData>,

    @Inject(MAT_DIALOG_DATA) public data: DesignDeliverDialogData
  ) { }

  onNoClick(): void {
    this.data.issubmitted = false;
    this.dialogRef.close(this.data);
  }

  onSubmit(): void {
    this.data.deliverycomments = this.deliverycommentscontrol.value;
    this.data.issubmitted = true;
    this.dialogRef.close(this.data);
  }

  ngOnInit(): void {
    // do nothing.
  }
}

export interface DesignResendDialogData {
  design: Design;
  resendcomments: string;
  issubmitted: boolean;
  ispermitmode: boolean;
  isWattmonkUser: boolean;
}

@Component({
  selector: "design-resend-dialog",
  templateUrl: "design-resend-dialog.html",
})
export class permitDesignResendDialog implements OnInit {
  resendcommentscontrol = new FormControl("", [Validators.required]);
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  newpermits: Observable<any>;
  newpermitsRef: AngularFireObject<any>;
  newpermitscount = 0;

  isLoader = false;
  defaultvalues = "-";

  permitnewdesignslist: any = [];
  permitindesignslist: any = [];
  permitcompleteddesignslist: any = [];
  permitinreviewdesignslist: any = [];
  permitdelivereddesignslist: any = [];
  limit = 10;
  skip = 0;
  statusfilter;
  ispermitnewdesignslistloading = true;
  ispermitindesignslistloading = true;
  ispermitcompleteddesignslistloading = true;
  ispermitinreviewdesignslistloading = true;
  ispermitdelivereddesignslistloading = true;
  allnewdesigns: number = -1;
  allindesigns: number = -1;
  allcompleteddesigns: number = -1;
  allinreviewdesigns: number = -1;
  alldelivereddesigns: number = -1;
  allonholddesigns: number = -1;
  creatorparentid;
  reviwerid;
  isLoading = false;
  slabdiscount = 0;
  servicecharge = 0;
  //Permit Numbers and Lists
  permitnewdesigns: number = -1;
  permitindesigns: number = -1;
  permitcompleteddesigns: number = -1;
  permitinreviewdesigns: number = -1;
  permitdelivereddesigns: number = -1;
  permitoutsourceddesigns: number = -1;
  scrolling: boolean;

  getpermitnewdesign: Design[] = [];
  getpermitindesign: Design[] = [];
  getpermitcompleteddesign: Design[] = [];
  getpermitinreviewdesign: Design[] = [];
  getpermitdelivereddesign: Design[] = [];
  designerfilter: any;
  loggedInUser: any;
  loadingmessage;
  displayerror = false;
  public permitAttachments: GalleryItem[];
  constructor(
    public dialogRef: MatDialogRef<DesignResendDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: DesignResendDialogData,
    private changeDetectorRef: ChangeDetectorRef,
    private commonService: CommonService,
    private notifyService: NotificationService,
    public genericService: GenericService,
    private designService: DesignService,
    private eventEmitterService: EventEmitterService,
    private db: AngularFireDatabase,
    public gallery: Gallery
  ) {
    this.newpermitsRef = this.db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + "newpermitdesigns"
    );
    this.newpermits = this.newpermitsRef.valueChanges();
    this.newpermits.subscribe(
      (res) => {
        this.newpermitscount = res.count;
        changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
      // (err) => console.log(err),
      // () => console.log("done!")
    );
  }

  onNoClick(): void {
    this.data.issubmitted = false;
    this.dialogRef.close(this.data);
  }

  onSubmit(): void {
    /* if (this.resendcommentscontrol.value != "") {
       if (this.isAttachmentUploaded) {
         this.uploadAttachmentresendDesignFiles();
       } else {
         this.editDesignOnServer();
       }
     } else {
       this.resendcommentscontrol.markAsTouched();
       this.resendcommentscontrol.markAsDirty();
     }*/
    if (this.data.isWattmonkUser) {
      if (this.resendcommentscontrol.value != "" && this.isAttachmentUploaded) {
        this.uploadAttachmentresendDesignFiles();
      } else {
        this.displayerror = true;
        this.resendcommentscontrol.markAsTouched();
        this.resendcommentscontrol.markAsDirty();
      }
    } else {
      if (this.resendcommentscontrol.value != "") {
        if (this.isAttachmentUploaded) {
          this.uploadAttachmentresendDesignFiles();
        } else {
          this.editDesignOnServer();
        }
      } else {
        this.resendcommentscontrol.markAsTouched();
        this.resendcommentscontrol.markAsDirty();
      }
    }
  }

  fetchDesignbyDesignerId(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }
    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=designassigned";
    } else {
      searchdata =
        searchdata +
        "requesttype=permit&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=designassigned";
    }

    this.ispermitindesignslistloading = true;
    this.allnewdesigns = 0;
    this.allindesigns = 0;
    this.allcompleteddesigns = 0;
    this.allinreviewdesigns = 0;
    this.alldelivereddesigns = 0;
    this.allonholddesigns = 0;
    this.changeDetectorRef.detectChanges();
    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.permitindesigns = response.length;
        this.allindesigns = this.permitindesigns;
        if (response.length > 0) {
          this.getpermitindesign = this.fillinDynamicData(response);
          for (let i = 0, len = this.getpermitindesign.length; i < len; ++i) {
            this.permitindesignslist.push(this.getpermitindesign[i]);
          }
          this.permitindesignslist = [...this.permitindesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isLoader = false;

        this.ispermitindesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  fillinDynamicData(records: Design[]): Design[] {
    records.forEach((element) => {
      this.fillinDynamicDataForSingleRecord(element);
    });
    this.eventEmitterService.onConversationItemSelected(0);
    return records;
  }

  fillinDynamicDataForSingleRecord(element: Design): Design {
    element.designcurrentstatus = this.genericService.getDesignStatusName(
      element.status
    );
    if (element.status != "delivered") {
      element.isoverdue = this.genericService.isDatePassed(
        element.expecteddeliverydate
      );
    } else {
      element.isoverdue = false;
    }
    element.lateby = this.genericService.getTheLatebyString(
      element.expecteddeliverydate
    );
    element.recordupdatedon = this.genericService.formatDateInTimeAgo(
      element.updated_at
    );
    element.formattedjobtype = this.genericService.getJobTypeName(
      element.jobtype
    );
    if (
      element.requesttype == "permit" &&
      this.loggedInUser.minpermitdesignaccess
    ) {
      element.isrecordcomplete = true;
    } else {
      if (element.requesttype == "permit" && element.jobtype != "battery") {
        if (
          element.designgeneralinformation != null &&
          element.electricalinformation != null &&
          element.electricalslocation != null &&
          element.structuralinformations.length > 0
        ) {
          element.isrecordcomplete = true;
        }
      } else if (
        element.requesttype == "permit" &&
        element.jobtype == "battery"
      ) {
        if (
          element.designgeneralinformation != null &&
          element.electricalinformation != null &&
          element.electricalslocation != null
        ) {
          element.isrecordcomplete = true;
        }
      }
    }

    //Setting acceptance timer
    if (element.status == "outsourced") {
      if (element.requesttype == "permit") {
        const acceptancedate = new Date(element.designacceptancestarttime);
        element.designacceptanceremainingtime =
          this.genericService.getRemainingTime(acceptancedate.toString());
      } else {
        const acceptancedate = new Date(element.designacceptancestarttime);
        element.designacceptanceremainingtime =
          this.genericService.getRemainingTime(acceptancedate.toString());
      }

      if (element.designacceptanceremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Setting design timer
    if (
      element.status == "designassigned" ||
      element.status == "designcompleted"
    ) {
      if (element.requesttype == "permit") {
        const acceptancedate = new Date(element.designstarttime);
        acceptancedate.setHours(acceptancedate.getHours() + 6);
        element.designremainingtime = this.genericService.getRemainingTime(
          acceptancedate.toString()
        );
      } else {
        const acceptancedate = new Date(element.designstarttime);
        acceptancedate.setHours(acceptancedate.getHours() + 2);
        element.designremainingtime = this.genericService.getRemainingTime(
          acceptancedate.toString()
        );
      }
      if (element.designremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Setting review timer
    if (
      element.status == "reviewassigned" ||
      element.status == "reviewpassed" ||
      element.status == "reviewfailed"
    ) {
      if (element.requesttype == "permit") {
        const reviewdate = new Date(element.reviewstarttime);
        reviewdate.setHours(reviewdate.getHours() + 2);
        element.reviewremainingtime = this.genericService.getRemainingTime(
          reviewdate.toString()
        );
      } else {
        const reviewdate = new Date(element.reviewstarttime);
        reviewdate.setMinutes(reviewdate.getMinutes() + 15);
        element.reviewremainingtime = this.genericService.getRemainingTime(
          reviewdate.toString()
        );
      }
      if (element.reviewremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Code to fetch unread message count
    CometChat.getUnreadMessageCountForGroup(element.chatid).then((array) => {
      if (array[element.chatid] != undefined) {
        element.unreadmessagecount = array[element.chatid];
        this.changeDetectorRef.detectChanges();
      } else {
        element.unreadmessagecount = 0;
        this.changeDetectorRef.detectChanges();
      }
    });

    return element;
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
        const extension = element.name.substring(element.name.lastIndexOf("."));

        const mimetype = this.genericService.getMimetype(extension);
        // window.console.log(extension, mimetype);
        const data = new Blob([element], {
          type: mimetype,
        });
        const replacedfile = new File([data], element.name, { type: mimetype });
        this.attachmentfiles.push(replacedfile);
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
    this.loadingmessage = "Uploading revision file";
    this.commonService
      .uploadFilesWithLoader(
        this.data.design.id,
        "designs/" + this.data.design.id,
        this.attachmentfiles,
        "revisionattachments",
        "design"
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
    this.isLoading = true;
    this.loadingmessage = "Sending design for revision";
    const designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(
      designacceptancestarttime.getMinutes() + 15
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    let status = "";
    if (this.data.isWattmonkUser) {
      status = "requestaccepted";
    } else {
      status = "outsourced";
    }
    const postData = {
      status: status,
      isoutsourced: "true",
      isinrevisionstate: "true",
      revisioncomments: this.resendcommentscontrol.value,
      designacceptancestarttime: designacceptancestarttime,
      expecteddeliverydate: tomorrow.toISOString(),
      designassignedto: null,
      reviewassignedto: null,
      acknowledgedby: null,
      istaskoverdue: true,
      taskoverdue: false
    };
    // this.loaderservice.show();
    this.designService.revisiondesign(this.data.design.id, postData).subscribe(
      (response) => {
        this.data.design = response;
        this.data.issubmitted = true;
        this.isLoading = false;
        this.newpermitsRef.update({ count: this.newpermitscount + 1 });
        // this.loaderservice.hide();
        this.notifyService.showSuccess(
          "Design request has been send for revision successfully.",
          "Success"
        );
        this.dialogRef.close(this.data);
      },
      (error) => {
        // this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }
  permitAttachmentsGallery(): void {
    if (this.data.ispermitmode) {
      this.gallery.ref().load(this.permitAttachments);
    } else {
      const lightboxGalleryRef = this.gallery.ref("permitAttachments");
      lightboxGalleryRef.load(this.permitAttachments);
    }
    //this.gallery.ref().load(this.prelimAttachments);
    //const lightboxGalleryRef = this.gallery.ref('prelimAttachments');
    //lightboxGalleryRef.load(this.prelimAttachments);
  }

  ngOnInit(): void {
    if (this.data.ispermitmode) {
      this.permitAttachments = this.data.design.attachments.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );
      this.permitAttachmentsGallery();
    }
  }
}


