import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { ViewportScroller } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
import { Analyst, Company, Designer } from "src/app/_models/company";
import { JobsTiming } from "src/app/_models/jobtiming";
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
import { AddminpermitdesigndialogComponent } from "../../permitdesign/addminpermitdesigndialog/addminpermitdesigndialog.component";
import { AssignreviewerdialogComponent } from "../../qualitycheck/assignreviewerdialog/assignreviewerdialog.component";
import { AddsurveydialogComponent } from "../../survey/addsurveydialog/addsurveydialog.component";
import { AdddesigndialogComponent } from "../adddesigndialog/adddesigndialog.component";
import { AddprelimproposaldialogComponent } from "../addprelimproposaldialog/addprelimproposaldialog.component";
import { AssigndesigndialogComponent } from "../assigndesigndialog/assigndesigndialog.component";
import { OrderprelimdesigndialogComponent } from "../orderprelimdesigndialog/orderprelimdesigndialog.component";
import { ShareprelimdesigndialogComponent } from "../shareprelimdesigndialog/shareprelimdesigndialog.component";


export enum LISTTYPE {
  NEW,
  INDESIGN,
  COMPLETED,
  INREVIEW,
  DELIVERED,
  ONHOLD,
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
  permissiontomakedesign =
    this.authService.currentUserValue.user.permissiontomakedesign;
  //Total Count
  allnewdesigns: number = -1;
  allindesigns: number = -1;
  allcompleteddesigns: number = -1;
  allinreviewdesigns: number = -1;
  alldelivereddesigns: number = -1;
  allonholddesigns: number = -1;

  //Prelim Numbers and Lists
  newdesigns: number = -1;
  indesigns: number = -1;
  completeddesigns: number = -1;
  inreviewdesigns: number = -1;
  delivereddesigns: number = -1;

  getnewdesigns: Design[] = [];
  getIndesign: Design[] = [];
  getCompletedDesign: Design[] = [];
  getInReviewDesign: Design[] = [];
  getDeliveredDesign: Design[] = [];

  newdesignslist = [];
  indesignslist = [];
  completeddesignslist = [];
  inreviewdesignslist = [];
  delivereddesignslist = [];
  designerfilter: string;
  isnewdesignslistloading = true;
  isindesignslistloading = true;
  iscompleteddesignslistloading = true;
  isinreviewdesignslistloading = true;
  isdelivereddesignslistloading = true;

  selectedTabIndex = 0;

  scrolling = false;
  appliedcoupan = null;
  // @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  chatusers: User[] = [];
  listactionindex = 0;
  designId: number;
  istabchangeevent = false;
  companies: Company[];
  companyList = [];
  designers: Designer[];
  analysts: Analyst[];
  creatorparentid;
  reviwerid;
  isLoading = false;
  isLoader = false;
  slabdiscount = 0;
  servicecharge = 0;

  statusfilterclear: string;

  selected = "defaultvalue";

  wattmonkadmins: User[] = [];
  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  @ViewChild("indesignscroll")
  indesignviewport: CdkVirtualScrollViewport;

  @ViewChild("completeddesignscroll")
  completeddesignviewport: CdkVirtualScrollViewport;

  @ViewChild("inreviewdesignscroll")
  inreviewviewport: CdkVirtualScrollViewport;

  @ViewChild("deliverdesignscroll")
  delivereddesignviewport: CdkVirtualScrollViewport;

  @ViewChild("onholddesignscroll")
  onholdviewport: CdkVirtualScrollViewport;

  newprelims: Observable<any>;
  newprelimsRef: AngularFireObject<any>;
  newprelimscount = 0;
  activeTab = 0;

  companynewprelims: Observable<any>;
  companynewprelimsRef: AngularFireObject<any>;
  companynewprelimscount = 0;

  selectedcompanynewprelimsRef: AngularFireObject<any>;

  @ViewChild("newDesignsScroller") newDesignsScroller: ElementRef;
  @ViewChild("listDesigner") listDesigner: MatSelectionList;
  @ViewChild("listAnalyst") listAnalyst: MatSelectionList;

  finalAmountopay: any;
  israisesurveyrequest = false;
  israisepermitrequest = false;
  teamheadid = 0;

  isprelimonholddesignslistloading: boolean;
  prelimonholddesigns: number;
  getprelimonholddesign: Design[] = [];
  prelimonholddesignslist = [];

  permitnewdesignslist = [];
  permitoverduedesignslist = [];
  permitindesignslist = [];
  permitcompleteddesignslist = [];
  permitinreviewdesignslist = [];
  permitdelivereddesignslist = [];

  permitoutsourceddesignslist: Design[] = [];

  limit = 10;
  skip = 0;
  statusfilter;
  prelimFilter: any;

  sorting: boolean = false;
  orderbyfilterstatus = null;
  ordertypefilterstatus = null;
  sortingdata: string;
  isUnhold = false;
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
  copiedcoupon: any;
  isOutsourced: boolean;
  joboverduetotaltime: any;
  jobtime: JobsTime;
  timer: number = 0;
  intervalId: any;
  display: string = "0h : 0m : 0s";
  hour: number = 0;
  minutes: number = 0;
  job: JobsTiming = null;
  disablestartbutton: boolean = false;
  totalminutes: number;
  prelimanalyst: number;
  seconds: number = 0;
  timerstarted: boolean = false;
  Newscrolling: boolean;
  holdscrolling: boolean;
  Designingscrolling: boolean;
  Completedscrolling: boolean;
  Reviewscrolling: boolean;
  Deliveredscrolling: boolean;

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
    private router: Router,
    public archiveService: ArchiveService,
    private loaderservice: LoaderService
  ) {
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
      this.israisesurveyrequest = true;
      this.israisepermitrequest = true;
    } else {
      this.israisesurveyrequest = false;
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

    this.newprelimsRef = db.object("newprelimdesigns");
    this.newprelims = this.newprelimsRef.valueChanges();
    this.newprelims.subscribe(
      (res) => {
        this.newprelimscount = res.count;
        changeDetectorRef.detectChanges();
      }
      // (err) => console.log(err),
      // () => console.log("done!")
    );

    this.companynewprelimsRef = db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + this.loggedInUser.parent.id
    );
    this.companynewprelims = this.companynewprelimsRef.valueChanges();
    this.companynewprelims.subscribe(
      (res) => {
        this.companynewprelimscount = res.newprelims;
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

  ngAfterViewInit(): void {
    this.fetchAllDesignsCount();
  }

  applyClentFilter(): void {
    // do nothing.
  }

  clearClientFilter(): void {
    // do nothing.
  }
  onCompanyChanged(list): void {
    this.Array = [];
    this.allArchives = [];
    this.isLoader = true;
    this.newdesignslist = [];
    this.indesignslist = [];
    this.completeddesignslist = [];
    this.inreviewdesignslist = [];
    this.delivereddesignslist = [];
    this.prelimonholddesignslist = [];

    this.skip = 0;
    this.limit = 10;

    const companyid = list.selectedOptions.selected.map((item) => item.value);
    //const companyid = list.companyid
    this.creatorparentid = companyid;

    if (this.reviwerid && [1, 3].includes(this.activeTab)) {
      this.newdesignslist = [];
      this.indesignslist = [];
      this.completeddesignslist = [];
      this.inreviewdesignslist = [];
      this.delivereddesignslist = [];

      this.skip = 0;
      this.limit = 10;

      if (this.activeTab == 1) {
        this.fetchDesignbyDesignerId();
      } else {
        this.fetchDesignbyReviewerId();
      }
      return;
    }
    this.selectedcompanynewprelimsRef = this.db.object(
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
    //           "requesttype=prelim&limit=" +
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
    //           "requesttype=prelim&isinrevisionstate=true&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&creatorparentid=" +
    //           this.creatorparentid;
    //       } else {
    //         searchdata =
    //           searchdata +
    //           "requesttype=prelim&limit=" +
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
    //           "requesttype=prelim&limit=" +
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
    //           "requesttype=prelim&isinrevisionstate=true&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip;
    //       }  else {
    //         searchdata =
    //           searchdata +
    //           "requesttype=prelim&limit=" +
    //           this.limit +
    //           "&skip=" +
    //           this.skip +
    //           "&status=created&status=outsourced&status=requestaccepted";
    //       }
    //     }
    this.allfunctions();
  }

  onDesignerChanged(list): void {
    this.isLoader = true;
    this.newdesignslist = [];
    this.indesignslist = [];
    this.completeddesignslist = [];
    this.inreviewdesignslist = [];
    this.delivereddesignslist = [];

    this.skip = 0;
    this.limit = 10;

    const designerid = list.selectedOptions.selected.map((item) => item.value);
    this.reviwerid = designerid[0];
    this.fetchDesignbyDesignerId();
  }
  fetchDesignbyDesignerId(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }

    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "requesttype=prelim&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=designassigned";
    } else {
      searchdata =
        searchdata +
        "requesttype=prelim&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=designassigned";
    }

    this.isindesignslistloading = true;
    this.allnewdesigns = 0;
    this.allindesigns = 0;
    this.allcompleteddesigns = 0;
    this.allinreviewdesigns = 0;
    this.alldelivereddesigns = 0;
    this.allonholddesigns = 0;
    this.changeDetectorRef.detectChanges();
    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.indesigns = response.length;
        this.allindesigns = this.indesigns;
        if (response.length > 0) {
          this.getIndesign = this.fillinDynamicData(response);
          for (let i = 0, len = this.getIndesign.length; i < len; ++i) {
            this.indesignslist.push(this.getIndesign[i]);
          }
          this.indesignslist = [...this.indesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isLoader = false;

        this.isindesignslistloading = false;
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
    this.newdesignslist = [];
    this.indesignslist = [];
    this.completeddesignslist = [];
    this.inreviewdesignslist = [];
    this.delivereddesignslist = [];
    this.prelimonholddesignslist = [];

    this.skip = 0;
    this.limit = 10;

    const reviewerid = list.selectedOptions.selected.map((item) => item.value);

    this.reviwerid = reviewerid[0];
    this.fetchDesignbyReviewerId();
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
  fetchDesignbyReviewerId(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }
    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "requesttype=prelim&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=reviewassigned";
    } else {
      searchdata =
        searchdata +
        "requesttype=prelim&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&status=reviewassigned";
    }

    this.isinreviewdesignslistloading = true;
    this.allnewdesigns = 0;
    this.allindesigns = 0;
    this.allcompleteddesigns = 0;
    this.allinreviewdesigns = 0;
    this.alldelivereddesigns = 0;
    this.allonholddesigns = 0;
    this.changeDetectorRef.detectChanges();

    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.inreviewdesigns = response.length;
        this.allinreviewdesigns = this.inreviewdesigns;
        if (response.length > 0) {
          this.getInReviewDesign = this.fillinDynamicData(response);
          for (let i = 0, len = this.getInReviewDesign.length; i < len; ++i) {
            this.inreviewdesignslist.push(this.getInReviewDesign[i]);
          }
          this.inreviewdesignslist = [...this.inreviewdesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isLoader = false;
        this.isLoading = false;

        this.isinreviewdesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  radioChange($event: MatRadioChange): void {
    this.statusfilter = "";
    if ($event.source.name === "statusfilter") {
      this.statusfilter = $event.value;

      this.newdesignslist = [];
      this.isnewdesignslistloading = true;
      let searchdata;
      let parentid;
      this.skip = 0;
      this.limit = 10;

      if (this.creatorparentid) {
        if (this.statusfilter && this.statusfilter == "requestdeclined") {
          searchdata =
            "requesttype=prelim&limit=" +
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
            "requesttype=prelim&isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid +
            "&status=created&status=outsourced&status=requestaccepted";
        } else {
          searchdata =
            "requesttype=prelim&limit=" +
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
            "requesttype=prelim&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=requestdeclined";
        } else if (
          this.statusfilter &&
          this.statusfilter == "isinrevisionstate"
        ) {
          searchdata =
            "requesttype=prelim&isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=requestaccepted";
        } else {
          searchdata =
            "requesttype=prelim&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=requestaccepted";
        }

        parentid = "";
      }

      this.designService
        .getDesignsCount1("prelim", parentid, this.statusfilter)
        .subscribe(
          (response) => {
            this.allnewdesigns = response["newdesign"];
            this.allindesigns = response["indesigning"];
            this.allcompleteddesigns = response["completed"];
            this.allinreviewdesigns = response["inreviewdesign"];
            this.alldelivereddesigns = response["delivered"];
            this.allonholddesigns = response["onholddesign"];
            this.changeDetectorRef.detectChanges();
            this.fetchNewDesignsData(searchdata);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    }
  }

  allfunctions(): void {
    // this.fetchNewDesignsData(searchdata);
    this.fetchInDesigningDesignsData();
    this.fetchCompletedDesignsData();
    this.fetchInReviewDesignsData();
    this.fetchDeliveredDesignsData();
  }

  onViewAllChanged(): void {
    this.Array = [];
    this.allArchives = [];
    this.isLoader = true;
    this.statusfilterclear = null;
    this.statusfilter = "";
    this.designerfilter = "";
    this.prelimFilter = "";
    this.newdesignslist = [];
    this.indesignslist = [];
    this.completeddesignslist = [];
    this.inreviewdesignslist = [];
    this.delivereddesignslist = [];
    this.prelimonholddesignslist = [];
    this.reviwerid = null;
    //this.isLoader = true;
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
    this.limit = 10;

    this.skip = 0;
    this.allfunctions();
  }
  oncompanyScroll(): void {
    console.log("inside company Scroll:");
    this.scrolling = true;
    this.skip += 10;
    this.getCompanies();
  }
  getCompanies(): void {
    this.commonservice.getCompanies1("prelim").subscribe(
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

  getperlimdesigner(): void {
    // this.loader.isLoading = new BehaviorSubject<boolean>(false);
    this.commonservice.getperlimdesigner().subscribe(
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
  getperlimAnalyst(): void {
    // this.loader.isLoading = new BehaviorSubject<boolean>(false);
    this.commonservice.getperlimAnalyst().subscribe(
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
      var companyitemRef: AngularFireObject<any>;
      companyitemRef = this.db.object(
        FIREBASE_DB_CONSTANTS.KEYWORD + element.companyid
      );
      const companyitem = companyitemRef.valueChanges();
      companyitem.subscribe(
        (res) => {
          element.newdesignscount = res.newprelims;
          this.changeDetectorRef.detectChanges();
        },
        () => {
          // do nothing.
        }
      );
    });
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
        // this.createExistingDesignChat(design)
      }
    );
  }
  /* createExistingDesignChat(design: Design) {
    const GUID = ""+ design.chatid;

    const address = design.address.substring(0, 60);

    const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
    const groupName = design.name + "_" + address + "_" + currentdatetime;

    const groupType = CometChat.GROUP_TYPE.PRIVATE;
    const password = "";

    const group = new CometChat.Group(GUID, groupName, groupType, password);
    const adminsid = [];
    adminsid.push(design.createdby.parent)
    this.wattmonkadmins.forEach((element) => {
      adminsid.push(element);
    });
    adminsid.push(this.loggedInUser.id);

    if(design.chatid == null){
      const inputData = {
        chatid : "prelim" + "_" + new Date().getTime(),
      }
      design.chatid = "prelim" + "_" + new Date().getTime();
      this.designService.updateDesign(design.id,inputData).subscribe(response => {},
        (error) => {
          this.notifyService.showError(error, "Error");
        })
    }
    
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
          (response) => {
            const chatgroupusers =adminsid
            chatgroupusers.push(design.createdby.cometchatuid)
            const inputData = {
              title: groupName,
              guid: GUID,
              parentid: design.createrparentid,
              chatgroupusers:chatgroupusers
            }
            this.commonservice.addChatGroup(inputData).subscribe(response => {

            },
            (error) => {
              this.notifyService.showError(error, "Error");
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

  downloadDesign(design: Design, event: Event): void {
    event.stopPropagation();
    this.loaderservice.show();
    const fileurl = design.prelimdesign.url;
    const filename =
      "prelim_" + design.name + "_" + design.email + design.prelimdesign.ext;

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
  removeItemFromList(type: LISTTYPE): void {
    switch (type) {
      case LISTTYPE.NEW:
        this.allnewdesigns -= 1;
        this.newdesignslist.splice(this.listactionindex, 1);
        this.newdesignslist = [...this.newdesignslist];
        break;
      case LISTTYPE.ONHOLD:
        this.allonholddesigns -= 1;
        this.prelimonholddesignslist.splice(this.listactionindex, 1);
        this.prelimonholddesignslist = [...this.prelimonholddesignslist];
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
      case LISTTYPE.INREVIEW:
        this.inreviewdesigns -= 1;
        this.inreviewdesignslist.splice(this.listactionindex, 1);
        this.inreviewdesignslist = [...this.inreviewdesignslist];
        break;
      case LISTTYPE.DELIVERED:
        this.delivereddesigns -= 1;
        this.delivereddesignslist.splice(this.listactionindex, 1);
        this.delivereddesignslist = [...this.delivereddesignslist];
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  updateItemInList(type: LISTTYPE, newrecord: Design): void {
    newrecord = this.fillinDynamicDataForSingleRecord(newrecord);
    switch (type) {
      case LISTTYPE.NEW:
        this.newdesignslist.splice(this.listactionindex, 1, newrecord);
        this.newdesignslist = [...this.newdesignslist];
        break;
      case LISTTYPE.INDESIGN:
        this.indesignslist.splice(this.listactionindex, 1, newrecord);
        this.indesignslist = [...this.indesignslist];
        break;
      case LISTTYPE.ONHOLD:
        this.prelimonholddesignslist.splice(this.listactionindex, 1, newrecord);
        this.prelimonholddesignslist = [...this.prelimonholddesignslist];
        break;
      case LISTTYPE.COMPLETED:
        this.completeddesignslist.splice(this.listactionindex, 1, newrecord);
        this.completeddesignslist = [...this.completeddesignslist];
        break;
      case LISTTYPE.INREVIEW:
        this.inreviewdesignslist.splice(this.listactionindex, 1, newrecord);
        this.inreviewdesignslist = [...this.inreviewdesignslist];
        break;
      case LISTTYPE.DELIVERED:
        this.delivereddesignslist.splice(this.listactionindex, 1, newrecord);
        this.delivereddesignslist = [...this.delivereddesignslist];
        break;
    }
    this.changeDetectorRef.detectChanges();
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
      case LISTTYPE.ONHOLD:
        this.prelimonholddesignslist.splice(0, 0, newrecord);
        this.prelimonholddesignslist = [...this.prelimonholddesignslist];
        this.allonholddesigns += 1;
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

  openAddDesignDialog(): void {
    this.Array = [];
    this.allArchives = [];
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
        this.designService.getlastsolarmake("assessment").subscribe(
          (response) => {
            this.genericService.assessmentpreviousSolarInverterMake =
              response[0];
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      }
    });
  }

  openAddPrelimProposalDialog(): void {
    this.Array = [];
    this.allArchives = [];
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
        this.designService.getlastsolarmake("proposal").subscribe(
          (response) => {
            this.genericService.proposalpreviousSolarInverterMake = response[0];
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      }
    });
  }

  raisesurvey(design, event): void {
    this.activitybarClose();
    event.stopPropagation();
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openAddsurveydialog(response);
        this.loaderservice.hide();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
    //  this.loaderservice.hide();
  }
  openAddsurveydialog(design: Design): void {
    this.Array = [];
    this.allArchives = [];
    const dialogRef = this.dialog.open(AddsurveydialogComponent, {
      width: "80%",
      height: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        isEditMode: false,
        isDataUpdated: false,
        design: design,
        isprelimrequest: true,
        isWattmonkUser: this.isWattmonkUser,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        design.issurveyraised = true;
        this.changeDetectorRef.detectChanges();
        this.router.navigate(["/home/survey/overview"]);
      }
    });
  }

  raisepermit(design, event): void {
    this.activitybarClose();
    event.stopPropagation();
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openAddpermitdialog(response);
        this.loaderservice.hide();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.loaderservice.hide();
      }
    );
  }

  openAddpermitdialog(design: Design): void {
    this.Array = [];
    this.allArchives = [];
    let designRaisedbyWattmonk: boolean;
    if (this.isWattmonkUser) {
      designRaisedbyWattmonk = true;
    } else {
      designRaisedbyWattmonk = false;
    }
    const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
      width: "80%",
      //height: "80%",
      autoFocus: false,
      disableClose: true,
      data: {
        isEditMode: false,
        isDataUpdated: false,
        prelimData: design,
        isprelimmode: true,
        designRaisedbyWattmonk: designRaisedbyWattmonk,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        design.ispermitraised = true;
        this.changeDetectorRef.detectChanges();
        this.router.navigate(["/home/permitdesign/overview"]);
      }
    });
  }

  openEditDesignDialog(type: LISTTYPE, design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AdddesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.updateItemInList(type, result.design);
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

  openEditProposalDesignDialog(type: LISTTYPE, design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddprelimproposaldialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.updateItemInList(type, result.design);
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

  updategroup(guid, groupname, grouppassword): void {
    const GUID = guid;
    const groupName = groupname;
    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = grouppassword
    const group = new CometChat.Group(GUID, groupName, groupType, password);

    CometChat.updateGroup(group)
      .then
      // group => {

      // },
      // error => {

      // }
      ();
  }
  openDesignDetailDialog(
    design: Design,
    type: LISTTYPE,
    event: Event,
    index
  ): void {
    this.activitybarClose();
    this.listactionindex = index;
    this.fetchDesignDetails(design, type, event);
  }

  openPrelimDesignDetailDialog(design: Design, type: LISTTYPE, event): void {
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
        job: this.job
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this._snackBar.dismiss();
      if (result.triggerPrelimEditEvent) {
        if (design.requirementtype == "proposal") {
          this.openEditProposalDesignDialog(type, design);
        } else {
          this.openEditDesignDialog(type, design);
        }
      }

      if (result.triggerDeleteEvent) {
        this.removeItemFromList(type);
      }

      if (result.refreshDashboard) {
        this.fetchAllDesignsCount();
        this.getJobTime();
        this.inreviewdesignslist = [];
        this.fetchInReviewDesignsData();
      }
      if (result.triggerChatEvent) {
        this.onChatButtonClick(design, event);
      }
      if (result.triggerActivity) {
        this.activitybarToggle(design, event);
      }
    });
  }

  openAssignDesignerDialog(
    record: Design,
    event: Event,
    index,
    type: LISTTYPE
  ): void {
    this.getperlimdesigner();
    if (this.isClient) {
      let appliedcoupan: any;
      let amounttopay: any;
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(OrderprelimdesigndialogComponent, {
        width: "30%",
        autoFocus: false,
        disableClose: true,
        panelClass: "white-modalbox",
        data: {
          isConfirmed: false,
          requiremnttype: record.requirementtype,
          design: record,
          appliedcoupan: appliedcoupan,
          amounttopay: amounttopay,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isConfirmed) {
          this.finalAmountopay = result.amounttopay;
          this.servicecharge = result.serviceamount;
          if (result.appliedcoupan != null) {
            this.appliedcoupan = result.appliedcoupan;
          } else {
            this.appliedcoupan = null;
          }
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
            this.updateItemInList(LISTTYPE.NEW, result.design);
          } else {
            this.removeItemFromList(type);
            this.addItemToList(LISTTYPE.INDESIGN, result.design);
          }
          this.fetchAllDesignsCount();
        }
      });
    }
  }

  openReAssignDesignerDialog(record: Design, event: Event, index): void {
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

    this.designService.reassignreview(record.id, postData).subscribe(
      () => {
        this.newprelimsRef.update({ count: this.newprelimscount + 1 });

        this.notifyService.showSuccess(
          "Design request has been successfully reassigned to WattMonk.",
          "Success"
        );
        this.companynewprelimsRef.update({
          newprelims: this.companynewprelimscount + 1,
        });
        this.removeItemFromList(LISTTYPE.ONHOLD);
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
    let postData = {};
    this.isOutsourced = true;
    postData = {
      outsourcedto: 232,
      isoutsourced: "true",
      status: "outsourced",
      paymenttype: localStorage.getItem("paymenttype"),
      couponid: this.appliedcoupan ? this.appliedcoupan.id : null,
      designacceptancestarttime: designacceptancestarttime,
      paymentstatus: localStorage.getItem("paymentstatus"),
      amount: this.finalAmountopay,
      serviceamount: this.servicecharge,
    };
    this.loaderservice.show();
    this.designService.assignDesign(record.id, postData).subscribe(
      (response) => {
        this.getClientsadmins(response);
        this.updateItemInList(LISTTYPE.NEW, response);
        this.authService.currentUserValue.user.amount =
          response.createdby.amount;
        localStorage.setItem("walletamount", "" + response.createdby.amount);
        localStorage.removeItem("paymenttype");
        localStorage.removeItem("paymentstatus");
        this.newprelimsRef.update({ count: this.newprelimscount + 1 });
        this.companynewprelimsRef.update({
          newprelims: this.companynewprelimscount + 1,
        });
        if (
          this.appliedcoupan?.usestype == "single" &&
          this.copiedcoupon?.id == this.appliedcoupan?.id
        ) {
          localStorage.removeItem("copiedcoupan");
        }
        this.loaderservice.hide();
      },
      (error) => {
        this.loaderservice.hide();
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
          this.finalAmountopay,
          paymenttype,
          this.appliedcoupan,
          record.id,
          this.servicecharge
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

  shareDesign(design: Design, event: Event): void {
    this.activitybarClose();
    event.stopPropagation();
    const dialogRef = this.dialog.open(ShareprelimdesigndialogComponent, {
      width: "45vw",
      autoFocus: false,
      disableClose: true,
      data: { design: design },
    });
    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }

  openAssignQCDialog(
    record: Design,
    event: Event,
    index,
    type: LISTTYPE
  ): void {
    this.getperlimAnalyst();
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
        this.removeItemFromList(type);
        this.addItemToList(LISTTYPE.INREVIEW, result.design);
        this.fetchAllDesignsCount();
      }
    });
  }

  selfAssignQC(record: Design, event: Event, index, type: LISTTYPE): void {
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
        this.loaderservice.hide();
        this.removeItemFromList(type);
        this.addItemToList(LISTTYPE.INREVIEW, response);
        this.fetchAllDesignsCount();
        this.isLoading = false;
      },
      (error) => {
        this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  openDesignDeclineDialog(record: Design, type: LISTTYPE, action): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesignDeclineDialog, {
      width: "50%",
      disableClose: true,
      data: { design: record, action: action, istimerstart: this.disablestartbutton },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        if (type == LISTTYPE.NEW) {
          this.removeItemFromList(LISTTYPE.NEW);
        } else if (type == LISTTYPE.INDESIGN) {
          this.removeItemFromList(LISTTYPE.INDESIGN);
        } else if (type == LISTTYPE.COMPLETED) {
          this.removeItemFromList(LISTTYPE.COMPLETED);
        } else if (type == LISTTYPE.INREVIEW) {
          this.removeItemFromList(LISTTYPE.INREVIEW);
        } else if (type == LISTTYPE.ONHOLD) {
          this.removeItemFromList(LISTTYPE.ONHOLD);
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
            this.notifyService.showSuccess(
              "Design request has been delivered successfully.",
              "Success"
            );
            this.loaderservice.hide();
            this.removeItemFromList(LISTTYPE.INREVIEW);
            this.addItemToList(LISTTYPE.DELIVERED, response);
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

  openDesignResendDialog(record: Design, isprelim: boolean, design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesignResendDialog, {
      width: "73%",
      height: "90%",
      disableClose: true,
      data: {
        design: record,
        isprelimmode: isprelim,
        isWattmonkUser: this.isWattmonkUser,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        if (isprelim) {
          this.removeItemFromList(LISTTYPE.DELIVERED);
          this.addItemToList(LISTTYPE.NEW, result.design);
          this.fetchAllDesignsCount();
          // if (this.updatejob(design)) {
          //   this.fetchAllDesignsCount();
          // }
        }
      }
    });
  }

  maintabchange(tabChangeEvent: MatTabChangeEvent): void {
    this.Array = [];
    this.allArchives = [];
    this.activeTab = tabChangeEvent.index;
    this.newdesignslist.length = 0;
    this.indesignslist.length = 0;
    this.completeddesignslist.length = 0;
    this.inreviewdesignslist.length = 0;
    this.delivereddesignslist.length = 0;
    this.prelimonholddesignslist.length = 0;

    this.istabchangeevent = true;
    this.skip = 0;
    this.limit = 10;
    this.fetchAllDesignsCount();

    this.selectedTabIndex = tabChangeEvent.index;
    if (![2, 4].includes(this.selectedTabIndex)) {
      this.reviwerid = null;
    }
    switch (tabChangeEvent.index) {
      case 0:
        // this.fetchNewDesignsData(searchdata);
        break;
      case 1:
        this.isprelimonholddesignslistloading = true;
        this.prelimfetchOnHoldDesignsData();
        break;
      case 2:
        this.isindesignslistloading = true;
        // this.getJobTime();
        this.getperlimdesigner();
        this.fetchInDesigningDesignsData();

        break;
      case 3:
        this.iscompleteddesignslistloading = true;
        this.fetchCompletedDesignsData();
        break;
      case 4:
        this.isinreviewdesignslistloading = true;
        this.getJobTime();
        this.getperlimAnalyst();
        this.fetchInReviewDesignsData();
        break;
      case 5:
        this.isdelivereddesignslistloading = true;
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

    // console.log("xd",this.Array);
    // console.log("dx",this.allArchives);
  }

  onarchivebuttonclick(): void {
    this.loaderservice.show();
    this.isLoading = true;
    const postData = {
      type: "prelim",
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
          this.fetchAllDesignsCount();
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

  onScroll(): void {
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    if (end == total && this.allnewdesigns > total) {
      this.Newscrolling = true;
      let searchdata;

      this.skip += 10;
      this.limit = 10;
      if (this.creatorparentid) {
        if (this.statusfilter && this.statusfilter == "requestdeclined") {
          searchdata =
            "requesttype=prelim&limit=" +
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
            "requesttype=prelim&isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&creatorparentid=" +
            this.creatorparentid;
        } else {
          searchdata =
            "requesttype=prelim&limit=" +
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
            "requesttype=prelim&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=requestdeclined";
        } else if (
          this.statusfilter &&
          this.statusfilter == "isinrevisionstate"
        ) {
          searchdata =
            "requesttype=prelim&isinrevisionstate=true&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=requestaccepted";
        } else {
          searchdata =
            "requesttype=prelim&limit=" +
            this.limit +
            "&skip=" +
            this.skip +
            "&status=created&status=outsourced&status=requestaccepted";
        }

      }
      this.fetchNewDesignsData(searchdata);
    }
  }

  onScrollInDesign(): void {
    const end = this.indesignviewport.getRenderedRange().end;
    const total = this.indesignviewport.getDataLength();
    if (end == total && this.allindesigns > total) {
      this.Designingscrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchInDesigningDesignsData();
    }
  }

  onScrollInDesignCompleted(): void {
    const end = this.completeddesignviewport.getRenderedRange().end;
    const total = this.completeddesignviewport.getDataLength();
    if (end == total && this.allcompleteddesigns > total) {
      this.Completedscrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchCompletedDesignsData();
    }
  }

  onScrollInInReview(): void {
    const end = this.inreviewviewport.getRenderedRange().end;
    const total = this.inreviewviewport.getDataLength();
    if (end == total && this.allinreviewdesigns > total) {
      this.Reviewscrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchInReviewDesignsData();
    }
  }

  onScrollDelivered(): void {
    const end = this.delivereddesignviewport.getRenderedRange().end;
    const total = this.delivereddesignviewport.getDataLength();
    if (end == total && this.alldelivereddesigns > total) {
      this.Deliveredscrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchDeliveredDesignsData();
    }
  }

  onScrollonhold(): void {
    const end = this.onholdviewport.getRenderedRange().end;
    const total = this.onholdviewport.getDataLength();

    if (end == total && this.allonholddesigns > total) {
      this.holdscrolling = true;
      this.skip += 10;
      this.prelimfetchOnHoldDesignsData();
    }
  }

  fetchAllDesignsCount(): void {
    this.newdesignslist = [];
    this.isnewdesignslistloading = true;
    let searchdata = "";
    let parentid;
    this.skip = 0;
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
          searchdata +
          "requesttype=prelim&limit=" +
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
          searchdata +
          "requesttype=prelim&isinrevisionstate=true&limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&creatorparentid=" +
          this.creatorparentid;
      } else {
        searchdata =
          searchdata +
          "requesttype=prelim&limit=" +
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
          searchdata +
          "requesttype=prelim&limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&status=requestdeclined";
      } else if (
        this.statusfilter &&
        this.statusfilter == "isinrevisionstate"
      ) {
        searchdata =
          searchdata +
          "requesttype=prelim&isinrevisionstate=true&limit=" +
          this.limit +
          "&skip=" +
          this.skip;
      } else {
        searchdata =
          searchdata +
          "requesttype=prelim&limit=" +
          this.limit +
          "&skip=" +
          this.skip +
          "&status=created&status=outsourced&status=requestaccepted";
      }

      parentid = "";
    }

    this.designService
      .getDesignsCount1("prelim", parentid, this.statusfilter, this.reviwerid)
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
            this.fetchNewDesignsData(searchdata);
          }
          this.isLoader = false;
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  //PRELIM LISTS APIS
  fetchDesignDetails(design: Design, type: LISTTYPE, event): void {
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe(
      (response) => {
        this.openPrelimDesignDetailDialog(response, type, event);
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
    let searchdata = "";
    if (
      this.ordertypefilterstatus != null &&
      this.orderbyfilterstatus != "null" &&
      this.orderbyfilterstatus != null
    ) {
      this.newdesignslist = [];
      this.indesignslist = [];
      this.completeddesignslist = [];
      this.inreviewdesignslist = [];
      this.delivereddesignslist = [];
      this.prelimonholddesignslist = [];
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
          if (this.statusfilter && this.statusfilter == "requestdeclined") {
            searchdata =
              searchdata +
              "requesttype=prelim&limit=" +
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
              searchdata +
              "requesttype=prelim&isinrevisionstate=true&limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&creatorparentid=" +
              this.creatorparentid;
          } else {
            searchdata =
              searchdata +
              "requesttype=prelim&limit=" +
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
              searchdata +
              "requesttype=prelim&limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&status=requestdeclined";
          } else if (
            this.statusfilter &&
            this.statusfilter == "isinrevisionstate"
          ) {
            searchdata =
              searchdata +
              "requesttype=prelim&isinrevisionstate=true&limit=" +
              this.limit +
              "&skip=" +
              this.skip;
          } else {
            searchdata =
              searchdata +
              "requesttype=prelim&limit=" +
              this.limit +
              "&skip=" +
              this.skip +
              "&status=created&status=outsourced&status=requestaccepted";
          }
        }
        this.fetchNewDesignsData(searchdata);
      } else if (this.activeTab == 1) {
        this.isprelimonholddesignslistloading = true;
        this.prelimfetchOnHoldDesignsData();
      } else if (this.activeTab == 2) {
        this.isindesignslistloading = true;
        this.fetchInDesigningDesignsData();
      } else if (this.activeTab == 3) {
        this.iscompleteddesignslistloading = true;
        this.fetchCompletedDesignsData();
      } else if (this.activeTab == 4) {
        this.isinreviewdesignslistloading = true;
        this.fetchInReviewDesignsData();
      } else if (this.activeTab == 5) {
        this.isdelivereddesignslistloading = true;
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
          this.fetchAllDesignsCount();
        } else if (this.activeTab == 1) {
          this.isprelimonholddesignslistloading = true;
          this.prelimfetchOnHoldDesignsData();
        } else if (this.activeTab == 2) {
          this.isindesignslistloading = true;
          this.fetchInDesigningDesignsData();
        } else if (this.activeTab == 3) {
          this.iscompleteddesignslistloading = true;
          this.fetchCompletedDesignsData();
        } else if (this.activeTab == 4) {
          this.isinreviewdesignslistloading = true;
          this.fetchInReviewDesignsData();
        } else if (this.activeTab == 5) {
          this.isdelivereddesignslistloading = true;
          this.fetchDeliveredDesignsData();
        }
      }
    }

    // this.changeDetectorRef.detectChanges()
  }

  fetchNewDesignsData(search: string): void {
    if (this.sorting) {
      search = search + this.sortingdata;
    }
    this.designService.getFilteredDesigns(search).subscribe(
      (response) => {
        this.newdesigns = response.length;
        if (response.length > 0) {
          this.getnewdesigns = this.fillinDynamicData(response);

          for (let i = 0, len = this.getnewdesigns.length; i < len; ++i) {
            this.newdesignslist.push(this.getnewdesigns[i]);
          }
          this.newdesignslist = [...this.newdesignslist];
          /*  this.newdesignslist.sort((a, b) => <any>new Date(a.created_at).getTime() - <any>new Date(b.created_at ).getTime()

           ); */
          //  console.log("list:",this.newdesignslist);
          this.changeDetectorRef.detectChanges();
        }

        this.isnewdesignslistloading = false;
        this.Newscrolling = false;

        this.changeDetectorRef.detectChanges();
        if (!this.isClient) {
          this.newprelimsRef.update({ count: 0 });
          this.selectedcompanynewprelimsRef.update({ newprelims: 0 });
        }
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
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
        "requesttype=prelim&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=designassigned";
    } else {
      searchdata =
        searchdata +
        "requesttype=prelim&limit=" +
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
        this.indesigns = response.length;
        if (response.length > 0) {
          this.getIndesign = this.fillinDynamicData(response);

          for (let i = 0, len = this.getIndesign.length; i < len; ++i) {
            this.indesignslist.push(this.getIndesign[i]);
          }
          this.indesignslist = [...this.indesignslist];
          /*   this.indesignslist.sort((a, b) => <any>new Date(a.created_at ).getTime() - <any>new Date(b.created_at ).getTime()); */
          this.changeDetectorRef.detectChanges();
        }
        this.Designingscrolling = false;

        this.isindesignslistloading = false;
        this.Designingscrolling = false;
        this.changeDetectorRef.detectChanges();
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
        "requesttype=prelim&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=designcompleted";
    } else {
      searchdata =
        "requesttype=prelim&limit=" +
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
        this.completeddesigns = response.length;
        if (response.length > 0) {
          this.getCompletedDesign = this.fillinDynamicData(response);

          for (let i = 0, len = this.getCompletedDesign.length; i < len; ++i) {
            this.completeddesignslist.push(this.getCompletedDesign[i]);
          }
          this.completeddesignslist = [...this.completeddesignslist];
          /*  this.completeddesignslist.sort((a, b) => <any>new Date(a.created_at ).getTime() - <any>new Date(b.created_at ).getTime()); */
          this.changeDetectorRef.detectChanges();
        }
        this.iscompleteddesignslistloading = false;

        this.isLoading = false;
        this.Completedscrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchInReviewDesignsData(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }

    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "requesttype=prelim&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=reviewassigned&status=reviewfailed&status=reviewpassed";
    } else {
      searchdata =
        searchdata +
        "requesttype=prelim&limit=" +
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
        this.inreviewdesigns = response.length;
        if (response.length > 0) {
          this.getInReviewDesign = this.fillinDynamicData(response);

          for (let i = 0, len = this.getInReviewDesign.length; i < len; ++i) {
            this.inreviewdesignslist.push(this.getInReviewDesign[i]);
          }
          this.inreviewdesignslist = [...this.inreviewdesignslist];
          /*   this.inreviewdesignslist.sort((a, b) => <any>new Date(a.created_at ).getTime() - <any>new Date(b.created_at ).getTime()); */
          this.changeDetectorRef.detectChanges();
        }
        this.isinreviewdesignslistloading = false;

        this.isLoading = false;
        this.Reviewscrolling = false;
        this.changeDetectorRef.detectChanges();
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
        "requesttype=prelim&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=delivered";
    } else {
      searchdata =
        "requesttype=prelim&limit=" +
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
        // this.scrollwiseDesigns = response;
        this.isLoader = false;
        if (response.length > 0) {
          this.getDeliveredDesign = this.fillinDynamicData(response);
          for (let i = 0, len = this.getDeliveredDesign.length; i < len; ++i) {
            this.delivereddesignslist.push(this.getDeliveredDesign[i]);
            this.allArchives.push(false);
            this.scrollwiseDesigns = this.delivereddesignslist;
          }
          this.delivereddesignslist = [...this.delivereddesignslist];
          /*  this.delivereddesignslist.sort((a, b) => <any>new Date(b.created_at ).getTime() - <any>new Date(b.created_at ).getTime()); */
          this.changeDetectorRef.detectChanges();
        }
        this.isdelivereddesignslistloading = false;

        this.isLoading = false;
        this.Deliveredscrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  prelimfetchOnHoldDesignsData(): void {
    let searchdata = "";
    if (this.reviwerid) {
      searchdata = "id=" + this.reviwerid + "&";
    }

    if (this.creatorparentid) {
      searchdata =
        searchdata +
        "requesttype=prelim&limit=" +
        this.limit +
        "&skip=" +
        this.skip +
        "&creatorparentid=" +
        this.creatorparentid +
        "&status=requestdeclined";
    } else {
      searchdata =
        searchdata +
        "requesttype=prelim&limit=" +
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
        this.prelimonholddesigns = response.length;
        if (response.length > 0) {
          this.getprelimonholddesign = this.fillinDynamicData(response);

          for (
            let i = 0, len = this.getprelimonholddesign.length;
            i < len;
            ++i
          ) {
            this.prelimonholddesignslist.push(this.getprelimonholddesign[i]);
          }
          this.prelimonholddesignslist = [...this.prelimonholddesignslist];
          /*  this.permitindesignslist.sort((a,b) =><any> new Date(a.created_at).getTime()- <any>new Date(b.created_at).getTime()) ; */
          this.changeDetectorRef.detectChanges();
        }
        this.isprelimonholddesignslistloading = false;

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
    if (this.selectedTabIndex == 2 && !element?.newtasktimings?.canceled && element?.newtasktimings?.taskstatus == "pending") {

      // let minutes = Math.floor(sec / 60);
      // console.log(minutes * 60)
      let prelimdesigner = this.jobtime.prelim_designer * 60;
      if (sec > prelimdesigner) {
        element.newtasktimings.isjobtimeexceeded = true;
      }
      else {
        element.newtasktimings.isjobtimeexceeded = false;
      }
    }
    else if (this.selectedTabIndex == 4 && !element?.newtasktimings?.canceled && element?.newtasktimings?.taskstatus == "pending") {
      // let currenttime = new Date().getTime();
      // let starttime = new Date(element?.newtasktimings?.starttime).getTime();
      // let newtime = currenttime - starttime;
      // let sec: any = Math.floor(newtime / 1000);
      // let minutes = Math.floor(sec / 60);
      let prelimanalyst = this.jobtime.prelim_analyst * 60;
      if (sec > prelimanalyst) {
        element.newtasktimings.isjobtimeexceeded = true;
      }
      else {
        element.newtasktimings.isjobtimeexceeded = false;
      }
    }

    return element;
  }

  deliverDesign(design: Design, event: Event, index: number): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openDesignDeliveryDialog(design);
  }

  resendDesign(
    design: Design,
    event: Event,
    isprelim: boolean,
    index: number
  ): void {
    this.activitybarClose();
    event.stopPropagation();
    this.loaderservice.show();
    this.listactionindex = index;
    this.loaderservice.show();
    this.designService.getDesignDetails(design.id).subscribe((response) => {
      this.openDesignResendDialog(response, isprelim, design);
      this.loaderservice.hide();
    });
  }

  declineDesignRequest(
    design: Design,
    event: Event,
    index: number,
    type: LISTTYPE,
    action
  ): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openDesignDeclineDialog(design, type, action);
  }

  acceptDesignRequest(design: Design, event: Event, index: number): void {
    this.activitybarClose();
    event.stopPropagation();
    this.isLoading = true;
    this.changeDetectorRef.detectChanges();
    this.listactionindex = index;
    const cdate = Date.now();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const postData = {
      status: "requestaccepted",
      designacceptanceendtime: cdate,
      expecteddeliverydate: tomorrow,
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
        this.updateItemInList(LISTTYPE.NEW, response);
      },
      (error) => {
        this.loaderservice.hide();
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
    const password = design.groupchatpassword

    const group = new CometChat.Group(GUID, groupName, groupType, password);
    const adminsid = [];
    // adminsid.push(this.loggedInUser.parent.cometchatuid)
    this.wattmonkadmins.forEach((element) => {
      adminsid.push(element);
    });
    this.clientadmins.forEach((element) => {
      adminsid.push(element);
    });
    // adminsid.push(this.loggedInUser.parent.cometchatuid);
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
              parentid: design.creatorparentid,
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
            this.changeDetectorRef.detectChanges();
            if (this.isOutsourced) {
              this.notifyService.showSuccess(
                "Design request has been assigned successfully.",
                "Success"
              );
            }
            this.updateItemInList(LISTTYPE.NEW, design);
            this.isLoading = false;
          },
          () => {
            this.changeDetectorRef.detectChanges();
            if (this.isOutsourced) {
              this.notifyService.showSuccess(
                "Design request has been assigned successfully.",
                "Success"
              );
            }
            this.updateItemInList(LISTTYPE.NEW, design);
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          }
        );
      },
      () => {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        if (this.isOutsourced) {
          this.notifyService.showSuccess(
            "Design request has been assigned successfully.",
            "Success"
          );
        }
        this.updateItemInList(LISTTYPE.NEW, design);
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

  addUserToGroupChat(design: Design): void {
    const GUID = design.chatid;
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
    this.prelimanalyst = this.jobtime?.prelim_analyst * 60;
    // this.permitanalyst = this.jobtime?.permit_analyst * 60;
    if (i % 2 == 0) {
      // if ((design?.tasktimings?.isdesignertimeexceeded || design?.tasktimings?.isanalysttimeexceeded || design?.tasktimings?.isjobtimeexceeded) && design?.tasktimings?.designid == design.id && this.isWattmonkUser) {
      if ((design.taskoverdue || design?.newtasktimings?.isjobtimeexceeded || (this.totalminutes > this.prelimanalyst && this.job?.designid == design.id)) && this.isWattmonkUser) {
        return 'itemcard even jobtime';
      }
      else {
        return 'itemcard even';
      }
    }
    else {
      if ((design.taskoverdue || design?.newtasktimings?.isjobtimeexceeded || (this.totalminutes > this.prelimanalyst && this.job?.designid == design.id)) && this.isWattmonkUser) {
        return 'itemcard odd jobtime';
      }
      else {
        return 'itemcard odd';
      }
    }
  }

  cancelTime($ev, design) {
    $ev.stopPropagation();
    this.loaderservice.show();
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
        this.indesignslist = [];
        this.isindesignslistloading = true;
        this.fetchInDesigningDesignsData();
      }
      else {
        this.inreviewdesignslist = [];
        this.isinreviewdesignslistloading = true;
        this.fetchInReviewDesignsData();
      }
      this.minutes = 0;
      this.hour = 0;
      this.display = "";
      this.disablestartbutton = false;
      this.totalminutes = 0;
      clearInterval(this.intervalId);
      this.job = null;
      this.loaderservice.hide;
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
      this.inreviewdesignslist[i].newtasktimings = res;
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
    this.display = "00h : 00m : 00s";
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
    for (const index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      const extension = element.name.substring(element.name.lastIndexOf('.'));

      const mimetype = this.genericService.getMimetype(extension);
      const data = new Blob([element], {
        type: mimetype
      });
      const replacedfile = new File([data], element.name, { type: mimetype });
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
          unhold: false,
          requestdeclinereason: this.declinereason.value,
          designacceptanceendtime: cdate,
          designassignedto: null,
          reviewassignedto: null,
        };
      }

      this.designService.onholdDesign(this.data.design.id, postData).subscribe(
        (response) => {
          if (this.data?.istimerstart) {
            currenttime = new Date().getTime();
            let timepostdata = {
              taskstatus: "onhold",
              endtime: currenttime,
              onholdtime: currenttime
            }
            this.designService.updateJobTime(this.data.design.newtasktimings.id, timepostdata).subscribe(() => {
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
            this.data.onholdtimer = false;
            this.data.design = response;
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.data.issubmitted = true;
            this.notifyService.showSuccess(
              "Design request has been put on hold successfully.",
              "Success"
            );
            this.dialogRef.close(this.data);
          }
        },
        (error) => {
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
        },
        (error) => {
          this.notifyService.showError(error, "Error");
          this.dialogRef.close(this.data);
        }
      );
    }
  }

  /*  createNewDesignChatGroup(design: Design) {
     this.isLoading = true;
     this.changeDetectorRef.detectChanges();
     const GUID = "" + design.chatid;

     const address = design.address.substring(0, 60);
     const groupName = design.name + "_" + address;

     const groupType = CometChat.GROUP_TYPE.PRIVATE;
     const password = "";

     const group = new CometChat.Group(GUID, groupName, groupType, password);
     CometChat.getGroup(GUID).then(
       group => {
         this.isLoading = false;
         this.changeDetectorRef.detectChanges();
         this.data.issubmitted = true;
         this.notifyService.showSuccess("Design request has been put on hold successfully.", "Success");
         this.dialogRef.close(this.data);
       }, error => {
         CometChat.createGroup(group).then(
           group => {
             const membersList = [
               new CometChat.GroupMember("" + design.createdby.id, CometChat.GROUP_MEMBER_SCOPE.ADMIN),
               new CometChat.GroupMember("" + this.loggedInUser.id, CometChat.GROUP_MEMBER_SCOPE.ADMIN)
             ];
             CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
               response => {
                  const inputData ={
                 title: groupName,
                 guid : GUID,
                 parentid: design.createrparentid
              }
              this.commonService.addChatGroup(inputData).subscribe(response=>{
                
              })
                 console.log(response)
                 this.isLoading = false;
                 this.changeDetectorRef.detectChanges();
                 this.data.issubmitted = true;
                 this.notifyService.showSuccess("Design request has been put on hold successfully.", "Success");
                 this.dialogRef.close(this.data);
               },
               error => {
                 console.log(error)

               }
             );
           },
           error => {

           }
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
  isprelimmode: boolean;
  isWattmonkUser: boolean;
}

@Component({
  selector: "design-resend-dialog",
  templateUrl: "design-resend-dialog.html",
})
export class DesignResendDialog implements OnInit {
  newprelims: Observable<any>;
  newprelimsRef: AngularFireObject<any>;
  newprelimscount = 0;
  resendcommentscontrol = new FormControl("", [Validators.required]);
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  isLoader = false;

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
  defaultvalue = "-";
  public prelimAttachments: GalleryItem[];

  constructor(
    public dialogRef: MatDialogRef<DesignResendDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: DesignResendDialogData,
    private changeDetectorRef: ChangeDetectorRef,
    private commonService: CommonService,
    private notifyService: NotificationService,
    private designService: DesignService,
    public genericService: GenericService,
    private authService: AuthenticationService,
    private eventEmitterService: EventEmitterService,
    private db: AngularFireDatabase,
    public gallery: Gallery
  ) {
    this.newprelimsRef = this.db.object("newprelimdesigns");
    this.newprelims = this.newprelimsRef.valueChanges();
    this.loggedInUser = this.authService.currentUserValue.user;
    this.newprelims.subscribe((res) => {
      this.newprelimscount = res.count;
      changeDetectorRef.detectChanges();
    });

    /* if (this.data.isprelimmode && this.data.design.attachments.length > 0) {
       this.prelimAttachments =this.data.design.attachments.map(item => new ImageItem({ src: item.url, thumb: item.url, ext: item.ext }));
       this.prelimAttachmentsGallery();
     }*/
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
    let status;
    if (this.data.isWattmonkUser) {
      status = "requestaccepted";
    } else {
      status = "outsourced";
    }
    const postData = {
      status: status,
      // status: "outsourced",
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

    this.designService.revisiondesign(this.data.design.id, postData).subscribe(
      (response) => {
        this.data.design = response;
        this.data.issubmitted = true;
        this.isLoading = false;
        this.newprelimsRef.update({ count: this.newprelimscount + 1 });
        this.notifyService.showSuccess(
          "Design request has been send for revision successfully.",
          "Success"
        );
        this.dialogRef.close(this.data);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
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

  prelimAttachmentsGallery(): void {
    if (this.data.isprelimmode) {
      this.gallery.ref().load(this.prelimAttachments);
    } else {
      const lightboxGalleryRef = this.gallery.ref("prelimAttachments");
      lightboxGalleryRef.load(this.prelimAttachments);
    }

    //this.gallery.ref().load(this.prelimAttachments);
    //const lightboxGalleryRef = this.gallery.ref('prelimAttachments');
    //lightboxGalleryRef.load(this.prelimAttachments);
  }
  ngOnInit(): void {
    if (this.data.isprelimmode) {
      this.prelimAttachments = this.data.design.attachments.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );
      this.prelimAttachmentsGallery();
    }
  }
}
