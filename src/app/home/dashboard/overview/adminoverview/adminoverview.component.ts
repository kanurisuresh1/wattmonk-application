import { SelectionModel } from "@angular/cdk/collections";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatRadioChange } from "@angular/material/radio";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatStepper } from "@angular/material/stepper";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import { ChartDataSets, ChartOptions, ChartType } from "chart.js";
import { BaseChartDirective, Color, Label } from "ng2-charts";
import { ChatdialogComponent } from "src/app/shared/chatdialog/chatdialog.component";
// import { PrelimdetaildialogComponent } from '../prelimdetaildialog/prelimdetaildialog.component';
import { ADDRESSFORMAT, ROLES } from "src/app/_helpers";
import { Coupon, CurrentUser, Design, User } from "src/app/_models";
import { UserSetting } from "src/app/_models/usersettings";
import {
  AuthenticationService, DesignService, GenericService, LoaderService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { CouponService } from "src/app/_services/coupon.service";
import { DashboardService } from "src/app/_services/dashboard.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";

export enum LISTTYPE {
  NEW,
  INDESIGN,
  COMPLETED,
  INREVIEW,
  DELIVERED,
}
@Component({
  selector: "app-adminoverview",
  templateUrl: "./adminoverview.component.html",
  styleUrls: ["./adminoverview.component.scss"],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminoverviewComponent implements OnInit {
  isLinear = false;
  color: ThemePalette = "primary";
  requiredinformationform: FormGroup;
  usertype = new FormControl("", [Validators.required]);
  billingaddress = new FormControl("", [
    Validators.required,
    Validators.pattern(ADDRESSFORMAT),
    Validators.maxLength(250),
  ]);
  companyaddress = new FormControl("");
  phone = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("^[0-9]{8,15}$"),
  ]);
  company = new FormControl("");
  registrationnumber = new FormControl("");
  payment = new FormControl("");
  userlogo = new FormControl("");
  getemail = new FormControl("");
  getnotification = new FormControl("");
  requestgeneratednotification = new FormControl("");
  requestacknowledgementnotification = new FormControl("");
  requestindesigningnotification = new FormControl("");
  designcompletednotification = new FormControl("");
  designreviewpassednotification = new FormControl("");
  designonholdnotification = new FormControl("");
  designmovedtoqcnotification = new FormControl("");
  designreviewfailednotification = new FormControl("");
  designdeliverednotification = new FormControl("");
  requestgeneratedemail = new FormControl("");
  requestacknowledgementemail = new FormControl("");
  requestindesigningemail = new FormControl("");
  designcompletedemail = new FormControl("");
  designmovedtoqcemail = new FormControl("");
  designreviewfailedemail = new FormControl("");
  designreviewpassedemail = new FormControl("");
  designdeliveredemail = new FormControl("");
  companyaddresssameasbilling = new FormControl("");
  placeholder = false;
  isLoading = true;
  displayedColumns: string[] = ["name", "role", "email", "phone", "manage"];
  teamMembers: User[] = [];
  loggedInUser: User;
  currentUser: CurrentUser;
  isClient = false;
  clientSuperAdmin = false;
  dataSource = new MatTableDataSource<User>(this.teamMembers);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  logo: Blob;
  selection = new SelectionModel<User>(true, []);
  admins = 0;
  bds = 0;
  designers = 0;
  surveyors = 0;
  analysts = 0;

  notificationPostData;
  loadingmessage = "Saving data";

  user = User;
  activitybarVisible: boolean;
  listtypes = LISTTYPE;
  isFavorite = true;
  permissiontomakedesign =
    this.authService.currentUserValue.user.permissiontomakedesign;
  //Total Count
  allonholddesigns: number = -1;
  allrevisiondesigns: number = -1;
  allwaitingforacceptancedesigns: number = -1;
  allunassigneddesigns: number = -1;
  alldelayeddesigns: number = -1;
  allactivitydesigns: number = -1;

  //Prelim Numbers and Lists
  onholddesigns: number = -1;
  revisiondesigns: number = -1;
  waitingforacceptancedesigns: number = -1;
  unassigneddesigns: number = -1;
  delayeddesigns: number = 0;
  activitydesigns: number = 0;

  getOnholddesigns: Design[] = [];
  getRevisiondesign: Design[] = [];
  getWaitingforacceptancedesign: Design[] = [];
  getUnassigneddesigns: Design[] = [];
  getDelayeddesign: Design[] = [];
  getActivitydesigns: Design[] = [];

  onholddesignslist = [];
  revisiondesignslist = [];
  waitingforacceptancedesignslist = [];
  unassigneddesignslist = [];
  delayeddesignslist = [];
  activitydesignslist = [];

  isonholddesignslistloading = true;
  isrevisiondesignslistloading = true;
  iswaitingforacceptancedesignslistloading = true;
  isunassigneddesignslistloading = true;
  isdelayeddesignslistloading = true;
  isacitivitydesignsloading = true;
  scrolling: boolean;
  appliedcoupan = null;
  // @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  chatusers: User[] = [];
  listactionindex = 0;
  designId: number;
  istabchangeevent = false;
  creatorparentid;

  isLoader = true;

  limit = 10;
  skip = 0;
  activity_start = 0;

  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  @ViewChild("indesignscroll")
  revisiondesignviewport: CdkVirtualScrollViewport;
  waitingforacceptancedesignviewport: CdkVirtualScrollViewport;
  unassigneddesignviewport: CdkVirtualScrollViewport;
  delayeddesignsviewport: CdkVirtualScrollViewport;
  activitydesignsvieport: CdkVirtualScrollViewport;

  @ViewChild("stepper") stepper: MatStepper;
  @ViewChild("baseChart")
  chart: BaseChartDirective;

  @ViewChild("newDesignsScroller") newDesignsScroller: ElementRef;
  finalAmountopay: any;
  amounttopay: any;
  logoUploaded = false;

  displayPlaceholder = false;
  fetchingOverviewData = true;
  slabdiscount: number;
  servicecharge: number;
  imageChangedEvent: any = " ";
  croppedImage: any = "";

  // Key to open the form again
  userClickedDoitnow = false;
  isonboarding = true;
  slabname: any;
  imageError: string;
  isImageSaved: boolean;
  public tabData = [];
  public countyData = [];
  barChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      display: false,
      position: "bottom",
      labels: {
        usePointStyle: true,
      },
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItems) {
          //Return value for titles
          return tooltipItems[0].xLabel
            .toString()
            .replace(/[(]/g, ":")
            .replace(/[)]/g, "");
        },
        label: () => null,
      },
    },

    scales: {
      yAxes: [
        {
          display: true,
          ticks: {
            beginAtZero: true,
            min: 0,
            // max: 200,
            // stepSize: 20,
          },
        },
      ],
    },
  };
  //barChartLabels: Label[] = ['New(45)', 'On Hold(50)', 'In Designing(70)', 'Completed(90)', 'In Review(45)', 'Deliverd(70)',];
  barChartLabels: Label[] = [];
  barChartType: ChartType = "bar";
  barChartLegend: {
    display: true;
  };
  barChartPlugins = [];
  todayChartData = [];
  overallChartData = [];
  barChartData: ChartDataSets[] = [
    /*{
    label: "Revise",
    backgroundColor: "Red",
    data: [25,46,80,44,45,30],
},
{
    label: "Overall",
    backgroundColor: "orange",
    data: [68,90,60,90,60,100]
},
{
    label: "Today",
    backgroundColor: "#ffeb3b",
   data: [70,89,66,70,74,91]
},
{
    label: "This Week",
    backgroundColor: "yellow",
   data: [39,40,84,88,90,46]
},
{
    label: "This Month",
    backgroundColor: "green",
   data: [28,47,60,77,86,72]
}*/
  ];
  barChartColors: Color[] = [
    {
      backgroundColor: "#EDC773",
    },
  ];

  @Input() users?;
  @Input() group?;
  @Input() conversation?: CometChat.Conversation | any;
  messageRequest: CometChat.MessagesRequest;
  announcementData = [];
  couponsData: Coupon[] = [];
  activitiesData = [];

  @ViewChild("activityscroll")
  activityviewport: CdkVirtualScrollViewport;
  today = new Date();
  iscoupancopied = false;
  public totalCount = [];
  totalPrelim: number = 0;
  totalPermit: number = 0;
  totalPestamp: number = 0;
  array = [];
  unreadGroups: any = [];
  image?: string;
  userinitials: string = "";
  selected: string = "overall";
  todaylabels = [];
  overalllabels = [];
  iscopied = [];
  couponid: any;
  userSettings: UserSetting;
  loginUserName: string = "";
  textcolor1: string;
  // NDdashboard start
  clientSearch = new FormControl("");
  @ViewChild('matselect') matselect;
  matselectvalue = '';
  clientcompany: any = [];
  companyList = [];
  selectedClient = '';
  //NDdashoard end


  constructor(
    public dialog: MatDialog,
    private notifyService: NotificationService,
    public genericService: GenericService,
    public designService: DesignService,
    public authService: AuthenticationService,
    private snackBar: MatSnackBar,
    public fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private commonservice: CommonService,
    private router: Router,
    private CouponService: CouponService,
    public datepipe: DatePipe,
    private loaderService: LoaderService,
    private dashboardService: DashboardService
  ) {
    this.loggedInUser = JSON.parse(localStorage.getItem("currentUser")).user;
    this.currentUser = authService.currentUserValue;
    if (this.loggedInUser.role.id == ROLES.ContractorSuperAdmin) {
      this.clientSuperAdmin = true;
    }
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      ((this.loggedInUser.role.id == ROLES.BD ||
        this.loggedInUser.role.id == ROLES.TeamHead) &&
        this.loggedInUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
    this.activitybarVisible = false;

    this.requiredinformationform = new FormGroup({
      usertype: this.usertype,
      billingaddress: this.billingaddress,
      // phone: this.phone,
      company: this.company,
      registrationnumber: this.registrationnumber,
      payment: this.payment,
      logo: this.userlogo,
    });

    this.loginUserName =
      this.loggedInUser.firstname + " " + this.loggedInUser.lastname;
    /* this.usertype.patchValue(this.loggedInUser.usertype);
    this.billingaddress.patchValue(this.loggedInUser.billingaddress);
    // this.phone.patchValue(this.loggedInUser.phone);
    this.company.patchValue(this.loggedInUser.company);
    this.registrationnumber.patchValue(this.loggedInUser.registrationnumber);

    this.getemail.patchValue(this.loggedInUser.getemail);
    this.getnotification.patchValue(this.loggedInUser.getnotification);
    this.requestgeneratednotification.patchValue(this.loggedInUser.requestgeneratednotification);
    this.requestacknowledgementnotification.patchValue(this.loggedInUser.requestacknowledgementnotification);
    this.requestindesigningnotification.patchValue(this.loggedInUser.requestindesigningnotification);
    this.designcompletednotification.patchValue(this.loggedInUser.designcompletednotification);
    this.designreviewpassednotification.patchValue(this.loggedInUser.designreviewpassednotification);
    this.designonholdnotification.patchValue(this.loggedInUser.designonholdnotification);
    this.designmovedtoqcnotification.patchValue(this.loggedInUser.designmovedtoqcnotification);
    this.designreviewfailednotification.patchValue(this.loggedInUser.designreviewfailednotification);
    this.designdeliverednotification.patchValue(this.loggedInUser.designdeliverednotification);
    this.requestgeneratedemail.patchValue(this.loggedInUser.requestgeneratedemail);
    this.requestacknowledgementemail.patchValue(this.loggedInUser.requestacknowledgementemail)
    this.requestindesigningemail.patchValue(this.loggedInUser.requestindesigningemail);
    this.designcompletedemail.patchValue(this.loggedInUser.designcompletedemail);
    this.designmovedtoqcemail.patchValue(this.loggedInUser.designmovedtoqcemail);
    this.designreviewfailedemail.patchValue(this.loggedInUser.designreviewfailedemail);
    this.designreviewpassedemail.patchValue(this.loggedInUser.designreviewpassedemail);
    this.designdeliveredemail.patchValue(this.loggedInUser.designdeliveredemail);
    if (this.loggedInUser.ispaymentmodeprepay == null) {
      this.payment.patchValue((false).toString())
    } else {
      this.payment.patchValue((this.loggedInUser.ispaymentmodeprepay).toString())
    }*/

    /*this.countyData.push({ state: "Texas", count: 60});
    this.countyData.push({ state: "Indiana", count: 45});
    this.countyData.push({ state: "Alabama", count: 74});
    this.countyData.push({ state: "Massachusetts", count: 43});
    this.countyData.push({ state: "Oregon", count: 13 });
    this.countyData.push({ state: "West Virginia", count: 95});
    this.countyData.push({ state: "Ultah", count: 87});
    this.countyData.push({ state: "Tennessee", count: 50});*/
    /*this.userSettings = this.currentUser.user.usersetting;
  this.tabData.push({ name: this.userSettings.nameprelim, active: true});
  this.tabData.push({ name: this.userSettings.namepermit, active: false});
  this.tabData.push({ name: this.userSettings.namepestamp, active: false});*/
  }
  /*registrationForm = this.fb.group({
    file: [null]
  })

  @ViewChild('fileInput') el: ElementRef;
  imageUrl: any
  editFile: boolean = true;
  removeUpload: boolean = false;*/

  ngOnInit(): void {

    this.getAnnouncements();
    this.isClient ? '' : this.getwattmonkDashboardDesignCounts('prelim'), this.fetchClientSuperadmin(), this.searchClientSuperAdmin();
    /*document.getElementsByClassName('mat-tab-header-pagination-before')[0].remove();
    document.getElementsByClassName('mat-tab-header-pagination-after')[0].remove();

    */
    // this.userSettings = JSON.parse(localStorage.getItem("usersettings"));
    //
    this.eventEmitterService.dashboardRefresh.subscribe((data) => {
      this.loginUserName = data;
      this.changeDetectorRef.detectChanges();
      // console.log("Product Tour");
    });
    this.eventEmitterService.userSettingsRefresh.subscribe((data) => {
      this.userSettings = data;
      this.currentUser.user.usersetting = data;
      this.tabData = [];
      this.tabData.push({ name: this.userSettings.nameprelim, active: true });
      this.tabData.push({ name: this.userSettings.namepermit, active: false });
      this.tabData.push({ name: this.userSettings.namepestamp, active: false });
      this.getGraphData("prelim");
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
      this.changeDetectorRef.detectChanges();
    });


    this.tabData = [];
    this.userSettings = this.currentUser.user.usersetting;
    this.tabData.push({ name: this.userSettings.nameprelim, active: true });
    this.tabData.push({ name: this.userSettings.namepermit, active: false });
    this.tabData.push({ name: this.userSettings.namepestamp, active: false });
    this.getActivities();

  }

  activeButton(index): void {
    let activeTab = "";
    this.selected = "overall";
    if (index != null) {
      for (let i = 0; i < this.tabData.length; i++) {
        if (i === index) {
          this.tabData[i].active = true;
          if (this.tabData[i].name == this.userSettings.nameprelim) {
            activeTab = "prelim";
          }
          if (this.tabData[i].name == this.userSettings.namepermit) {
            activeTab = "permit";
          }
          if (this.tabData[i].name == this.userSettings.namepestamp) {
            activeTab = "pestamp";
          }
          this.isClient ? this.getGraphData(activeTab) : this.getwattmonkDashboardDesignCounts(activeTab);


        } else {
          this.tabData[i].active = false;
        }
      }
    }
  }
  ngAfterViewInit(): void {
    if (this.isClient) {
      this.getCoupons();
      this.getUnreadMessage();
      this.getGraphData("prelim");
      this.couponid = JSON.parse(localStorage.getItem("copiedcoupan"));
      if (this.couponid != null) {
        this.copyCoupan(this.couponid);
      }
    }
    /* this.eventEmitterService.
    dashboardRefresh.subscribe(() => {
      this.changeDetectorRef.detectChanges();
      // console.log("Product Tour");
    });
    this.eventEmitterService.
    userSettingsRefresh.subscribe(() => {
      this.changeDetectorRef.detectChanges();
      // console.log("Product Tour");
    });
  
   /* this.fetchAllDesignsCount();
    if(!this.loggedInUser.isonboardingcompleted){
      // this.getUserWalletTranscitionCount();
      this.fetchTeamData();
    }
    this.dataSource.paginator = this.paginator;
    if (this.authService.currentUserValue.user.logo == null) {
      this.imageUrl = "../../../../../assets/logoplaceholder.jpg";
    } else {
      this.imageUrl = this.loggedInUser.logo.url;
    }*/
  }
  //------------New Dashboard Code
  getAnnouncements(): void {
    this.commonservice.getannouncements().subscribe(
      (response) => {
        this.announcementData = response;
        this.changeDetectorRef.detectChanges();
        this.isLoading = false;
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getGraphData(tabname): void {

    const searchdata = this.loggedInUser.id + "&requesttype=" + tabname;
    this.commonservice.getGraphData(searchdata).subscribe(
      (response) => {
        this.barChartData = [];
        this.countyData = [];
        this.barChartLabels = [];
        this.todayChartData = [];
        this.overallChartData = [];
        this.todaylabels = [];
        this.overalllabels = [];
        const todaychart = [];
        const overallchart = [];
        this.isLoading = false;
        this.tabData[0]["totalPrelim"] = response.totalrecords.totalprelim;
        this.tabData[1]["totalPermit"] = response.totalrecords.totalpermit;
        this.tabData[2]["totalPestamp"] = response.totalrecords.totalpestamp;

        for (let [key, val] of Object.entries(response.statewise)) {
          if (key == "") {
            key = "Across State";
          }
          this.countyData.push({ state: key, count: val });
        }

        const todaykeys = Object.keys(response.today);

        todaykeys.forEach((key) => {
          const label = response.today[key].label + "(" + response.today[key].total + ")";
          this.todaylabels.push(label);
          response.today[key].data.forEach((element) => {
            todaychart.push(element);
          });
        });

        const overAllkeys = Object.keys(response.overall);

        overAllkeys.forEach((key) => {
          const label = response.overall[key].label + "(" + response.overall[key].total + ")";
          this.overalllabels.push(label);
          response.overall[key].data.forEach((element) => {
            overallchart.push(element);
          });
        });

        this.barChartLabels = this.overalllabels;
        this.todayChartData.push({
          data: todaychart,
          backgroundColor: "#edc773",
          barThickness: 30,
        });
        this.overallChartData.push({
          data: overallchart,
          backgroundColor: "#edc773",
          barThickness: 30,
        });

        this.barChartData = this.overallChartData;
        this.changeDetectorRef.detectChanges();
      },

      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  // wattmonk dahboard start
  getwattmonkDashboardDesignCounts(tabname, loader?) {
    let searchdata = "requesttype=" + tabname;

    if (this.selectedClient != '') {
      searchdata = searchdata + "&creatorparentid=" + this.selectedClient;
    }
    loader == 'true' && this.loaderService.show();
    this.dashboardService.getwattmonkDashboardDesignCounts(searchdata).subscribe(
      (response) => {
        this.barChartData = [];
        this.countyData = [];
        this.barChartLabels = [];
        this.todayChartData = [];
        this.overallChartData = [];
        this.todaylabels = [];
        this.overalllabels = [];
        let todaychart = [];
        let overallchart = [];
        this.isLoading = false;
        this.tabData[0]["totalPrelim"] = response.totalrecords.totalprelim;
        this.tabData[1]["totalPermit"] = response.totalrecords.totalpermit;
        this.tabData[2]["totalPestamp"] = response.totalrecords.totalpestamp;

        for (let [key, val] of Object.entries(response.statewise)) {
          if (key == "") {
            key = "Across State"
          }
          this.countyData.push({ state: key, count: val });
        }

        for (let [key, val] of Object.entries(response.today)) {
          let label = val['label'] + "(" + val['total'] + ")";
          this.todaylabels.push(label);
          val['data'].forEach(element => {
            todaychart.push(element);
          });
        }
        for (let [key, val] of Object.entries(response.overall)) {
          let label = val['label'] + "(" + val['total'] + ")";
          this.overalllabels.push(label);
          val['data'].forEach(element => {
            overallchart.push(element);
          });
        }
        this.barChartLabels = this.overalllabels;
        this.todayChartData.push({ data: todaychart, backgroundColor: '#edc773', barThickness: 30, })
        this.overallChartData.push({ data: overallchart, backgroundColor: '#edc773', barThickness: 30, })

        this.barChartData = this.overallChartData;
        this.announcementData = response;
        this.changeDetectorRef.detectChanges();
        this.loaderService.hide();

        this.matselect.close();
        this.loaderService.hide();

      },
      (error) => {
        this.loaderService.hide();
        this.notifyService.showError(error, "Error");
      }

    );
  }


  selectedClientDesign(id) {
    this.selectedClient = id
    this.clientcompany.map(item => {
      if (item.id == id) {
        item.checked = true;
      }
      else {
        item.checked = false;
      }
    })
    this.matselect.open();
  }

  clearclientfilter() {
    this.loaderService.show();
    this.clientcompany.map(item => {
      item.checked = false;
      this.matselectvalue = '';
    })
    this.selectedClient = '';
    this.getwattmonkDashboardDesignCounts("prelim");

  }

  searchClientSuperAdmin() {
    this.clientSearch.valueChanges.pipe().subscribe(
      value => {
        this.companyList = [];
        this.clientcompany.filter(item => {
          let name = item.firstname + " " + item.lastname;
          if (item.company && item.company.toUpperCase().indexOf(value.toUpperCase().trim()) == 0) {
            this.companyList.push(item)
          } else if (name.toUpperCase().indexOf(value.toUpperCase().trim()) == 0) {
            this.companyList.push(item)
          } else if (item.lastname.toUpperCase().indexOf(value.toUpperCase().trim()) == 0) {
            this.companyList.push(item)
          }

          // item.company ? (item.company.toUpperCase().indexOf(value.toUpperCase()) == 0 ? this.companyList.push(item) : null) : item.firstname ? (item.firstname.toUpperCase().indexOf(value.toUpperCase()) == 0 ? this.companyList.push(item) : null) : null;
        })
      })
  }

  fetchClientSuperadmin() {
    this.commonservice.getClientSuperadminTeamModule().subscribe(
      (response) => {

        this.clientcompany = response;
        this.clientcompany.map(item => {
          item.checked = false;
        })
        this.companyList = this.clientcompany;
        console.log(this.companyList)
        this.changeDetectorRef.detectChanges();
      },
      () => { }
    );
  }

  searchcompany(item) {
    if (item.company) {
      return item.company;
    }
    else {
      return item.firstname + "" + item.lastname;
    }

  }
  //wattmonk dashboard end


  getActivities(): void {
    this.commonservice
      .getActivities(this.loggedInUser.id, this.limit, this.activity_start)
      .subscribe(
        (response) => {
          response.data.forEach((element) => {
            element.createdondate =
              this.genericService.formatDateInDisplayFormat(element.created_at);
            element.name =
              element.performer.firstname + " " + element.performer.lastname;
            if (element.performer.logo != null) {
              element.photo = element.performer.logo.url;
            } else {
              element.photo = "../../../../../assets/wattmonklogo.png";
            }
            this.activitiesData.push(element);
          });
          this.scrolling = false;
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }
  onRecentActivityScroll(): void {
    this.scrolling = true;
    this.activity_start += 10;
    this.getActivities();
  }
  getCoupons(): void {
    // const newDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    this.CouponService.getDashboardCoupons().subscribe(
      (response) => {
        this.isLoading = false;
        const data = response;
        this.couponsData = data;
        this.changeDetectorRef.detectChanges();

        // response.forEach(element=>{
        //   console.log(element);

        //   this.couponsData.push(element);
        //   console.log(this.countyData);

        //   // element.iscopied = false;
        // })
        //this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  activitybarClose(): void {
    const $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.remove("activitybar-open");
    $activitybar.classList.add("activitybar-close");
  }
  radioChange($event: MatRadioChange): void {
    this.barChartData = [];
    this.barChartLabels = [];
    if ($event.value == "overall") {
      this.barChartLabels = this.overalllabels;
      this.barChartData = this.overallChartData;
    }
    if ($event.value == "today") {
      this.barChartLabels = this.todaylabels;
      this.barChartData = this.todayChartData;
    }
  }
  onMessageClick(data, event: Event): void {
    event.stopPropagation();
    this.activitybarClose();
    const GUID = data.conversationWith.guid;
    this.genericService.setSelectedChatGroupID(GUID);
    CometChat.getGroup(GUID).then(
      () => {
        this.snackBar.openFromComponent(ChatdialogComponent, {
          data: "element",
          panelClass: ["chatdialog"],
        });
      },
      () => {
        // do nothing.
      }
    );
  }

  getUnreadMessage(): void {
    this.array.forEach((element) => {
      const GUID = element;
      CometChat.getConversation(GUID, "group").then(
        (conversation) => {
          //conversation = Object.assign(JSON.parse(JSON.stringify(conversation)) as CometChat.Conversation);

          this.unreadGroups.push(conversation);
          //console.log('image', this.image);
        },
        () => {
          // console.log('error while fetching a conversation', error);
        }
      );
    });
    /*
        CometChat.getGroup(GUID).then(
        group => {
          console.log("Group details fetched successfully:", group);
          this.unreadGroups.push(group);
          console.log("unreadGroups",this.unreadGroups,this.unreadGroups.length)
        }, error => {
          console.log("Group details fetching failed with exception:", error);
        }
      );
     */

    //     const UID = this.loggedInUser.cometchatuid.toString();
    //   console.log("UID:",this.loggedInUser.cometchatuid);
    // const limit = 30;
    // const latestId = await CometChat.getLastDeliveredMessageId();
    // const messagesRequest = new CometChat.MessagesRequestBuilder()
    // 												.setUID(UID)
    // 												.setMessageId(latestId)
    // 												.setLimit(limit)
    // 												.build();
    // messagesRequest.fetchNext().then(
    //   messages => {
    //     console.log("Message list fetched:", messages);
    //   }, error => {
    //     console.log("Message fetching failed with error:", error);
    //   }
    // );
    /*const UID = this.loggedInUser.cometchatuid.toString();
const limit = 30;
const categories = ["message", "custom"];
const messagesRequest = new CometChat.MessagesRequestBuilder()
                        .setUID(UID)
                        .setUnread(true)
                        .setLimit(limit)
                        .build();
   /* 
   .setCategories(categories)
   const limit = 30;
    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setUnread(true)
      .setLimit(limit)
      .build();*/
    //console.log("common Chat:",messagesRequest.fetchNext());

    /*if (typeof (this.conversation) === 'string') {
    this.conversation = Object.assign(JSON.parse(this.conversation) as CometChat.Conversation);
    this.name = this.conversation.conversationWith.name;
    this.count = this.conversation.unreadMessageCount;
    this.conversationType = this.conversation.conversationType;
    this.status = this.conversation.conversationWith.status;
    switch (this.conversation.conversationType) {
      case 'user': {
        this.image = this.conversation.conversationWith.avatar;
        break;
      }
      case 'group': {
        this.image = this.conversation.conversationWith.icon;
        break;
      }
    }
    console.log("Name:",this.name);
    console.log("conversation:",this.conversation);
    console.log("conversationType:",this.conversationType);
    console.log("status:",this.status);
  }*/
  }
  //------------------------
  /*  uploadFile(event) {

    const reader = new FileReader(); // HTML5 FileReader API
    const file = event.target.files[0];
    this.logo = event.target.files[0]
    

    if (event.target.files.length > 0) {
      this.logoUploaded = true
    }
    if (event.target.files && event.target.files[0]) {
      this.imageError = null;
      const allowed_types = ['image/png', 'image/jpeg'];
      if (allowed_types.indexOf(event.target.files[0].type) != -1) {
        this.imageChangedEvent = event;
        reader.readAsDataURL(file);
        // When file uploads set it to file formcontrol
        reader.onload = () => {
          
          this.imageUrl = reader.result;
          this.changeDetectorRef.detectChanges();
          this.editFile = false;
          this.removeUpload = true;
        }
      }
      else {
        this.logoUploaded = false;
        this.imageError = 'Only Images are allowed ( JPEG | PNG )';
        return false;
      }
      // ChangeDetectorRef since file is loading outside the zone
    }

  }
  getErrorMessage(control: FormControl) {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    else if (control == this.company) {
      return this.company.hasError("pattern")
        ? "Please enter a valid company name."
        : "";
    }
    else if (control == this.billingaddress) {
      return this.billingaddress.hasError("pattern")
        ? "Please enter a valid address."
        : "";
    }
    else if (control == this.companyaddress) {
      return this.companyaddress.hasError("pattern")
        ? "Please enter a valid address."
        : "";
    }

    else if (control == this.phone) {
      return this.phone.hasError("pattern")
        ? "Please enter a valid phone number (Min - 8, Max - 15)."
        : "Phone should be of min. 8 and max. 15 characters.";
    } else if (control == this.registrationnumber) {
      return this.registrationnumber.hasError("pattern")
        ? "Please enter only numbers.(Min 3 and max. 20 characters)."
        : "Lic No. should be of min. 3 and max. 20 characters.";
    }
  }



  openWelcomeDialog(): void {
    const dialogRef = this.dialog.open(WelcomedialogComponent, {
      width: '60%',
      disableClose: true,
      data: { name: "Rachna", animal: "Monkey" },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  activitybarToggle(design: Design, event: Event) {
    event.stopPropagation();
    this.activitybarOpen(design);
  }

  activitybarOpen(design: Design) {
    this.eventEmitterService.onActivityBarButtonClick(design.id, true);
    const $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.add("activitybar-open");
    $activitybar.classList.remove("activitybar-close");
    this.activitybarVisible = true;
  }

  activitybarClose() {
    const $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.remove("activitybar-open");
    $activitybar.classList.add("activitybar-close");
  }

  onChatButtonClick(design: Design, event: Event) {
    event.stopPropagation();
    this.activitybarClose();
    const GUID = design.chatid;
    this.genericService.setSelectedChatGroupID(GUID);
   /*  this.genericService.backroute = "/home/design/overview";
    this.router.navigate(['/home/inbox/messages']);
    this.eventEmitterService.onSidebarRouteChange("Inbox"); 
    this.snackBar.openFromComponent(ChatdialogComponent, {
      data: "element",
      panelClass:["chatdialog"]
    });
  }

  gotoSection(elementId: string) {
    this.viewportScroller.scrollToAnchor(elementId);
  }

  removeItemFromList(type: LISTTYPE) {
    
    switch (type) {
      case LISTTYPE.NEW:
        this.onholddesigns -= 1;
        this.onholddesignslist.splice(this.listactionindex, 1);
        this.onholddesignslist = [...this.onholddesignslist];
        break;
      case LISTTYPE.INDESIGN:
        this.revisiondesigns -= 1;
        this.revisiondesignslist.splice(this.listactionindex, 1);
        this.revisiondesignslist = [...this.revisiondesignslist];
        break;
      case LISTTYPE.COMPLETED:
        this.waitingforacceptancedesigns -= 1;
        this.waitingforacceptancedesignslist.splice(this.listactionindex, 1);
        this.waitingforacceptancedesignslist = [...this.waitingforacceptancedesignslist];
        break;
      case LISTTYPE.INREVIEW:
        this.unassigneddesigns -= 1;
        this.unassigneddesignslist.splice(this.listactionindex, 1);
        this.unassigneddesignslist = [...this.unassigneddesignslist];
        break;
      case LISTTYPE.DELIVERED:
        this.delayeddesigns -= 1;
        this.delayeddesignslist.splice(this.listactionindex, 1);
        this.delayeddesignslist = [...this.delayeddesignslist];
        break;

         break;

    }
    this.changeDetectorRef.detectChanges();
  }

  updateItemInList(type: LISTTYPE, newrecord: Design) {
    newrecord = this.fillinDynamicDataForSingleRecord(newrecord);
    switch (type) {
      case LISTTYPE.NEW:
        this.onholddesignslist.splice(this.listactionindex, 1, newrecord);
        this.onholddesignslist = [...this.onholddesignslist];
        break;
      case LISTTYPE.INDESIGN:
        this.revisiondesignslist.splice(this.listactionindex, 1, newrecord);
        this.revisiondesignslist = [...this.revisiondesignslist];
        break;
      case LISTTYPE.COMPLETED:
        this.waitingforacceptancedesignslist.splice(this.listactionindex, 1, newrecord);
        this.waitingforacceptancedesignslist = [...this.waitingforacceptancedesignslist];
        break;
      case LISTTYPE.INREVIEW:
        this.unassigneddesignslist.splice(this.listactionindex, 1, newrecord);
        this.unassigneddesignslist = [...this.unassigneddesignslist];
        break;
      case LISTTYPE.DELIVERED:
        this.delayeddesignslist.splice(this.listactionindex, 1, newrecord);
        this.delayeddesignslist = [...this.delayeddesignslist];
        break;

    }
    this.changeDetectorRef.detectChanges();
  }

  addItemToList(type: LISTTYPE, newrecord: Design) {
    newrecord = this.fillinDynamicDataForSingleRecord(newrecord);
    switch (type) {
      case LISTTYPE.NEW:
        this.onholddesignslist.splice(0, 0, newrecord);
        this.onholddesignslist = [...this.onholddesignslist];
        this.onholddesigns = this.onholddesignslist.length;
        break;
      case LISTTYPE.INDESIGN:
        this.revisiondesignslist.splice(0, 0, newrecord);
        this.revisiondesignslist = [...this.revisiondesignslist];
        this.revisiondesigns = this.revisiondesignslist.length;
        break;
      case LISTTYPE.COMPLETED:
        this.waitingforacceptancedesignslist.splice(0, 0, newrecord);
        this.waitingforacceptancedesignslist = [...this.waitingforacceptancedesignslist];
        this.waitingforacceptancedesigns = this.waitingforacceptancedesignslist.length;
        break;
      case LISTTYPE.INREVIEW:
        this.unassigneddesignslist.splice(0, 0, newrecord);
        this.unassigneddesignslist = [...this.unassigneddesignslist];
        this.unassigneddesigns = this.unassigneddesignslist.length;
        break;
      case LISTTYPE.DELIVERED:
        this.delayeddesignslist.splice(0, 0, newrecord);
        this.delayeddesignslist = [...this.delayeddesignslist];
        this.delayeddesigns = this.delayeddesignslist.length;
        break;

          break;
    }
    this.changeDetectorRef.detectChanges();
  }

  getUserWalletTranscitionCount() {

    this.commonservice.userWalletTranscition().subscribe(
      response => {
        
        if (response > 0) {
          this.genericService.userWalletfirsttranscition = false;
          this.changeDetectorRef.detectChanges();
        }
      }
    )
  }
  openDesignDetailDialog(design: Design, type: LISTTYPE, index) {
    this.activitybarClose();
    this.listactionindex = index;
    this.fetchDesignDetails(design, type);

  }


  openReAssignDesignerDialog(record: Design, event: Event, index, type: LISTTYPE): void {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    const designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(designacceptancestarttime.getMinutes() + 15);

    const postData = {};

    postData = {
      isoutsourced: "true",
      status: "outsourced",
      designacceptancestarttime: designacceptancestarttime
    };

    this.designService
      .assignDesign(
        record.id,
        postData
      )
      .subscribe(
        response => {
          this.notifyService.showSuccess("Design request has been successfully reassigned to WattMonk.", "Success");
          this.removeItemFromList(LISTTYPE.NEW);
        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
        }
      );
  }
  openEditDesignDialog(type: LISTTYPE, design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AdddesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, isDataUpdated: false, design: design }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isDataUpdated) {
        this.updateItemInList(type, result.design);
      }
    });
  }
  openEditProposalDesignDialog(type: LISTTYPE, design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddprelimproposaldialogComponent, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: true, isDataUpdated: false, design: design }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isDataUpdated) {
        this.updateItemInList(type, result.design);
      }
    });
  }
  openPrelimDesignDetailDialog(design: Design, type: LISTTYPE) {
    this.activitybarClose();
    const dialogRef = this.dialog.open(PrelimdetaildialogComponent, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: { design: design, triggerEditEvent: false, triggerDeleteEvent: false }
    });

    dialogRef.afterClosed().subscribe(result => {

      this.snackBar.dismiss();
      if (result.triggerEditEvent) {
        if (design.requirementtype == "proposal") {
          this.openEditProposalDesignDialog(type, design)
        }
        else {
          this.openEditDesignDialog(type, design);
        }
      }
      if (result.triggerDeleteEvent) {
        this.removeItemFromList(type);
      }

      if (result.refreshDashboard) {
        this.fetchAllDesignsCount();
      }
    });
  }
  companyAddress = false;

  showOptions(event: MatCheckboxChange): void {

    this.companyAddress = !this.companyAddress;

    if (event.checked == true) {
      this.billingaddress.setValue(this.companyaddress.value)
    }
    else {
      this.billingaddress.setValue("");
    }
  }
  maintabchange(tabChangeEvent: MatTabChangeEvent) {
    this.onholddesignslist = [];
    this.revisiondesignslist = [];
    this.unassigneddesignslist = [];
    this.waitingforacceptancedesignslist = [];
    this.delayeddesignslist = [];

    this.istabchangeevent = true;
    this.skip = 0;
    this.limit = 10;
    
    this.fetchAllDesignsCount();

    switch (tabChangeEvent.index) {
      case 0:
        //this.fetchOnholdDesignsData(searchdata);
        break;
      case 1:
        this.fetchRevisionDesignsData();
        break;
      case 2:
        this.fetchWaitingForAcceptanceDesignsData();
        break;
      case 3:
        this.fetchUnassignedDesignsData();
        break;
      case 4:
        this.fetchDelayedDesignData();
      case 5:
        this.fetchActivityDesignData();

      default:
        break;
    }
  }

  onScroll() {
    const end = this.activityviewport.getRenderedRange().end;
    const total = this.activityviewport.getDataLength();
    console.log("End , Total",end,total);
    if (end == total && this.activityCount > total) {
      this.scrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.getActivities();
    }

  }

  onScrollInDesign() {
    const end = this.revisiondesignviewport.getRenderedRange().end;
    const total = this.revisiondesignviewport.getDataLength();
    if (end == total && this.allrevisiondesigns > total) {
      this.scrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchRevisionDesignsData();
    }
  }

  onScrollWaiting() {
    const end = this.waitingforacceptancedesignviewport.getRenderedRange().end;
    const total = this.waitingforacceptancedesignviewport.getDataLength();
    if (end == total && this.allwaitingforacceptancedesigns > total) {
      this.scrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchWaitingForAcceptanceDesignsData();
    }
  }

  fetchWaitingForAcceptanceDesignsData() {
    const searchdata = "status=outsourced&isinrevisionstate=false";

    this.designService.getFilteredDesigns(searchdata).subscribe(
      response => {
        this.waitingforacceptancedesigns = response.length;
        if (response.length > 0) {
          this.getWaitingforacceptancedesign = this.fillinDynamicData(response);
          for (const i = 0, len = this.getWaitingforacceptancedesign.length; i < len; ++i) {
            this.waitingforacceptancedesignslist.push(this.getWaitingforacceptancedesign[i]);
          }
          this.waitingforacceptancedesignslist = [...this.waitingforacceptancedesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.iswaitingforacceptancedesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onScrollUnassigned() {
    const end = this.unassigneddesignviewport.getRenderedRange().end;
    const total = this.unassigneddesignviewport.getDataLength();
    if (end == total && this.allunassigneddesigns > total) {
      this.scrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchUnassignedDesignsData();
    }
  }

  fetchUnassignedDesignsData() {
    if (this.isClient) {
      const searchdata = "status=created";
    }
    else {
      searchdata = "status=created&status=requestaccepted"
    }

    this.designService.getFilteredDesigns(searchdata).subscribe(
      response => {
        this.unassigneddesigns = response.length;
        if (response.length > 0) {
          this.getUnassigneddesigns = this.fillinDynamicData(response);
          for (const i = 0, len = this.getUnassigneddesigns.length; i < len; ++i) {
            this.unassigneddesignslist.push(this.getUnassigneddesigns[i]);
          }
          this.unassigneddesignslist = [...this.unassigneddesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isunassigneddesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onScrollDelayed() {
    const end = this.delayeddesignsviewport.getRenderedRange().end;
    const total = this.delayeddesignsviewport.getDataLength();
    if (end == total && this.alldelayeddesigns > total) {
      this.scrolling = true;
      this.skip += 10;
      this.limit = 10;
      this.fetchDelayedDesignData();
    }
  }

  fetchDelayedDesignData() {
    const searchdata = "status=outsourced&delayeddesigns=true";

    this.designService.getFilteredDesigns(searchdata).subscribe(
      response => {
        this.delayeddesigns = response.length;
        if (response.length > 0) {
          this.getDelayeddesign = this.fillinDynamicData(response);
          for (const i = 0, len = this.getDelayeddesign.length; i < len; ++i) {
            this.delayeddesignslist.push(this.getDelayeddesign[i]);
          }
          this.delayeddesignslist = [...this.delayeddesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isdelayeddesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }


  // Recent activities





  fetchActivityDesignData() {


    this.dashboardService.getActivityList().subscribe(
      response => {

        this.activitydesigns = response.length;
        if (response.length > 0) {
          this.getActivitydesigns = this.fillinDynamicData(response);
          for (const i = 0, len = this.getActivitydesigns.length; i < len; ++i) {
            this.activitydesignslist.push(this.getActivitydesigns[i]);
          }
          this.activitydesignslist = [...this.activitydesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isacitivitydesignsloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchAllDesignsCount() {
    this.onholddesignslist = [];

    this.dashboardService.getDashboardDesignCounts().subscribe(
      response => {
        this.fetchingOverviewData = false;
        const totaldesigns = parseInt(response["isinrevisionstatecount"]) + parseInt(response["putonhold"]) + parseInt(response["unassigned"]) + parseInt(response["waitingforacceptance"]);
        if (totaldesigns == 0) {
          this.displayPlaceholder = true;
        } else {
          this.displayPlaceholder = false;
          this.revisiondesigns = parseInt(response["isinrevisionstatecount"]);
          this.onholddesigns = parseInt(response["putonhold"]);
          this.unassigneddesigns = parseInt(response["unassigned"]);
          this.waitingforacceptancedesigns = parseInt(response["waitingforacceptance"]);
        }
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );

    const searchdata = "status=requestdeclined";
    this.fetchOnholdDesignsData(searchdata);
    this.fetchRevisionDesignsData();
    this.fetchWaitingForAcceptanceDesignsData();
    this.fetchUnassignedDesignsData();
    this.fetchDelayedDesignData();
    this.fetchActivityDesignData();
  }

  //PRELIM LISTS APIS
  fetchDesignDetails(design: Design, type: LISTTYPE) {
    this.designService.getDesignDetails(design.id).subscribe(
      response => {
        this.openPrelimDesignDetailDialog(response, type);
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchOnholdDesignsData(search: string) {
    this.designService.getFilteredDesigns(search).subscribe(
      response => {
        this.onholddesigns = response.length;
        if (response.length > 0) {
          this.getOnholddesigns = this.fillinDynamicData(response);
          for (const i = 0, len = this.getOnholddesigns.length; i < len; ++i) {
            this.onholddesignslist.push(this.getOnholddesigns[i]);
          }
          this.onholddesignslist = [...this.onholddesignslist];
          this.changeDetectorRef.detectChanges();
        }
        
        this.scrolling = false;
        this.isLoading = false;
        this.isonholddesignslistloading = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchRevisionDesignsData() {
    const searchdata = "status=outsourced&isinrevisionstate=true";

    this.designService.getFilteredDesigns(searchdata).subscribe(
      response => {
        this.revisiondesigns = response.length;
        if (response.length > 0) {
          this.getRevisiondesign = this.fillinDynamicData(response);
          for (const i = 0, len = this.getRevisiondesign.length; i < len; ++i) {
            this.revisiondesignslist.push(this.getRevisiondesign[i]);
          }
          this.revisiondesignslist = [...this.revisiondesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.scrolling = false;
        this.isrevisiondesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  declineDesignRequest(design: Design, event: Event, index: number, type: LISTTYPE) {
    this.activitybarClose();
    event.stopPropagation();
    this.listactionindex = index;
    this.openDesignDeclineDialog(design, type);
  }

  openAssignDesignerDialog(record: Design, event: Event, index, type: LISTTYPE): void {
    if (record.requesttype == "prelim") {
      this.prelimAssign(record, event, index, type);
    }
    else if (record.requesttype == "permit") {
      this.openPermitAssignDesignerDialog(record, event, index, type)
    }
  }

  prelimAssign(record: Design, event: Event, index, type: LISTTYPE) {
    if (this.isClient) {
      const appliedcoupan: any
      const amounttopay: any
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(OrderprelimdesigndialogComponent, {
        width: "50%",
        disableClose: true,
        autoFocus: false,
        data: { isConfirmed: false, requiremnttype:record.requirementtype, design: record, appliedcoupan: appliedcoupan, amounttopay: amounttopay }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isConfirmed) {
          this.finalAmountopay = result.amounttopay
          if (result.appliedcoupan != null) {
            this.appliedcoupan = result.appliedcoupan.id
          }
          else {
            this.appliedcoupan = null
          }
          this.updatedesign(record, 15, true)
        }
      });
    }
    else {
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(AssigndesigndialogComponent, {
        width: "50%",
        disableClose: true,
        autoFocus: false,
        data: { isEditMode: false, design: record }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.refreshDashboard) {
          this.removeItemFromList(LISTTYPE.INREVIEW);
        }
      });
    }
  }
  senddesigntoWattmonk(record, additionalminutes, isprelim) {
    const designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(designacceptancestarttime.getMinutes() + additionalminutes);
    const postData = {};

    postData = {
      outsourcedto: 232,
      isoutsourced: "true",
      status: "outsourced",
      paymenttype: localStorage.getItem('paymenttype'),
      couponid: this.appliedcoupan,
      designacceptancestarttime: designacceptancestarttime,
      amount:this.amounttopay,
      serviceamount: this.servicecharge
    };

    this.designService
      .assignDesign(
        record.id,
        postData
      )
      .subscribe(
        response => {
          this.removeItemFromList(LISTTYPE.INREVIEW);
          this.addItemToList(LISTTYPE.COMPLETED, response)
          this.authService.currentUserValue.user.amount = response.createdby.amount;
          localStorage.setItem("walletamount", "" + response.createdby.amount);
          localStorage.removeItem('paymenttype');
          this.notifyService.showSuccess("Design request has been successfully assigned.", "Success")

        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
        }
      );
  }

  updatedesign(record, additionalminutes, isprelim) {
    const slabdiscount = 0;
    const serviceamount = 0;
    const paymenttype = localStorage.getItem('paymenttype');
    
    if (paymenttype == 'direct') {
      this.commonservice.stripepayment(this.genericService.stripepaymenttoken.id, this.authService.currentUserValue.user.email, this.authService.currentUserValue.user.id, this.finalAmountopay, paymenttype, this.appliedcoupan, record.id, serviceamount
      ).subscribe(
        (response) => {
          this.senddesigntoWattmonk(record, additionalminutes, isprelim)
        },
        (error) => {

        }



      )

    }
    else {
      this.senddesigntoWattmonk(record, additionalminutes, isprelim)
    }

  }

  openPermitAssignDesignerDialog(record: Design, event: Event, index, type: LISTTYPE): void {
    if (this.isClient) {
      const appliedcoupan: any
      const amounttopay: any
      const slabdiscount:any
      const slabname: any
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(OrderpermitdesigndialogComponent, {
        width: "30%",
        disableClose: true,
        autoFocus: false,
        panelClass: 'white-modalbox',
        data: { isConfirmed: false, isprelim: false, design: record, appliedcoupan: appliedcoupan, amounttopay: amounttopay ,slabdiscount:slabdiscount,slabname: slabname,servicecharge:Number}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isConfirmed) {
          this.amounttopay = result.amounttopay;
          this.slabdiscount =result.slabdiscount;
          this.servicecharge =result.servicecharge;
          this.slabname = String(result.slabname)
          if (result.appliedcoupan != null) {
            this.appliedcoupan = result.appliedcoupan.id
          }
          else {
            this.appliedcoupan = null
          }
          this.updatepermitdesign(record, 30, false)
        }
      });
    }
    else {
      this.activitybarClose();
      event.stopPropagation();
      this.listactionindex = index;
      const dialogRef = this.dialog.open(AssigndesigndialogComponent, {
        width: "50%",
        autoFocus: false,
        disableClose: true,
        data: { isEditMode: false, design: record }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.refreshDashboard) {
          this.removeItemFromList(LISTTYPE.INREVIEW)
        }
      });
    }
  }

  sendpermitdesigntoWattmonk(record, additionalminutes, isprelim) {
    const designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(designacceptancestarttime.getMinutes() + additionalminutes);

    const postData = {};

    postData = {
      outsourcedto: 232,
      isoutsourced: "true",
      status: "outsourced",
      couponid: this.appliedcoupan,
      paymenttype: localStorage.getItem('paymenttype'),
      designacceptancestarttime: designacceptancestarttime,
      slabname: String(this.slabname),
      slabdiscount: this.slabdiscount,
      serviceamount: this.servicecharge,
      amount: this.amounttopay,
    };

    this.designService
      .assignDesign(
        record.id,
        postData
      )
      .subscribe(
        response => {
          this.removeItemFromList(LISTTYPE.INREVIEW)
          this.addItemToList(LISTTYPE.COMPLETED, response)
          this.authService.currentUserValue.user.amount = response.createdby.amount;
          localStorage.removeItem('paymenttype');
          this.notifyService.showSuccess("Design request has been successfully assigned.", "Success")
        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
        }
      );

  }
  updatepermitdesign(record, additionalminutes, isprelim) {
    const paymenttype = localStorage.getItem('paymenttype');
    
    if (paymenttype == 'direct') {
      this.commonservice.stripepayment(this.genericService.stripepaymenttoken.id, this.authService.currentUserValue.user.email, this.authService.currentUserValue.user.id, this.amounttopay, paymenttype, this.appliedcoupan, record.id,  this.servicecharge
      ).subscribe(
        (response) => {
          this.sendpermitdesigntoWattmonk(record, additionalminutes, isprelim)
        },
        (error) => {
          this.notifyService.showError(
            error,
            "Error"
          );
        }

      )

    }
    else {
      this.sendpermitdesigntoWattmonk(record, additionalminutes, isprelim)
    }
  }
  openDesignDeclineDialog(record: Design, type): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(DesigndeclinedialogComponent, {
      width: '50%',
      disableClose: true,
      data: { design: record }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.issubmitted) {
        this.removeItemFromList(LISTTYPE.COMPLETED);
        this.addItemToList(LISTTYPE.NEW, result.design)
      }
    });
  }
  acceptDesignRequest(design: Design, event: Event, index: number, type: LISTTYPE) {
    this.activitybarClose();
    event.stopPropagation();
    this.isLoading = true;
    this.changeDetectorRef.detectChanges();
    this.listactionindex = index;
    const cdate = Date.now();
    const postData = {
      status: "requestaccepted",
      designacceptanceendtime: cdate
    };
    this.designService
      .editDesign(
        design.id,
        postData
      )
      .subscribe(
        response => {

          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.notifyService.showSuccess("Design request has been accepted successfully.", "Success");
          this.removeItemFromList(type);
          this.addItemToList(LISTTYPE.INREVIEW, response);

        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
        }
      );
  }




  fillinDynamicData(records: Design[]): Design[] {
    records.forEach(element => {
      element = this.fillinDynamicDataForSingleRecord(element);
    });
    this.eventEmitterService.onConversationItemSelected(0);
    return records;
  }

  fillinDynamicDataForSingleRecord(element: Design): Design {
    element.designcurrentstatus = this.genericService.getDesignStatusName(element.status);
    if (element.status != "delivered") {
      element.isoverdue = this.genericService.isDatePassed(element.expecteddeliverydate);
    } else {
      element.isoverdue = false;
    }
    element.lateby = this.genericService.getTheLatebyString(element.expecteddeliverydate)
    element.recordupdatedon = this.genericService.formatDateInTimeAgo(element.updated_at);
    element.formattedjobtype = this.genericService.getJobTypeName(element.jobtype);
    if (element.requesttype == "permit" && this.loggedInUser.minpermitdesignaccess) {
      element.isrecordcomplete = true;
    } else {
      if (element.requesttype == "permit" && element.jobtype != "battery") {
        if (element.designgeneralinformation != null && element.electricalinformation != null && element.electricalslocation != null && element.structuralinformations.length > 0) {
          element.isrecordcomplete = true;
        }
      } else if (element.requesttype == "permit" && element.jobtype == "battery") {
        if (element.designgeneralinformation != null && element.electricalinformation != null && element.electricalslocation != null) {
          element.isrecordcomplete = true;
        }
      }
    }

    //Setting acceptance timer
    if (element.status == "outsourced") {
      if (element.requesttype == "permit") {
        const acceptancedate = new Date(element.designacceptancestarttime);
        element.designacceptanceremainingtime = this.genericService.getRemainingTime(acceptancedate.toString());
      } else {
        const acceptancedate = new Date(element.designacceptancestarttime);
        element.designacceptanceremainingtime = this.genericService.getRemainingTime(acceptancedate.toString());
      }

      if (element.designacceptanceremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Setting design timer
    if (element.status == "designassigned" || element.status == "designcompleted") {
      if (element.requesttype == "permit") {
        const acceptancedate = new Date(element.designstarttime);
        acceptancedate.setHours(acceptancedate.getHours() + 6);
        element.designremainingtime = this.genericService.getRemainingTime(acceptancedate.toString());
      } else {
        const acceptancedate = new Date(element.designstarttime);
        acceptancedate.setHours(acceptancedate.getHours() + 2);
        element.designremainingtime = this.genericService.getRemainingTime(acceptancedate.toString());
      }
      if (element.designremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Setting review timer
    if (element.status == "reviewassigned" || element.status == "reviewpassed" || element.status == "reviewfailed") {
      if (element.requesttype == "permit") {
        const reviewdate = new Date(element.reviewstarttime);
        reviewdate.setHours(reviewdate.getHours() + 2);
        element.reviewremainingtime = this.genericService.getRemainingTime(reviewdate.toString());
      } else {
        const reviewdate = new Date(element.reviewstarttime);
        reviewdate.setMinutes(reviewdate.getMinutes() + 15);
        element.reviewremainingtime = this.genericService.getRemainingTime(reviewdate.toString());
      }
      if (element.reviewremainingtime == "0h : 0m") {
        element.isoverdue = true;
      }
    }

    //Code to fetch unread message count
    CometChat.getUnreadMessageCountForGroup(element.chatid).then(
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
    );

    return element;
  }

  move($event, index: number) {
    $event.stopPropagation();
    if (index == 4) {
      this.isonboarding = false;
    } else {
      this.isonboarding = true;
      this.stepper.selectedIndex = index;
    }
  }
  radioChange($event: MatRadioChange) {
    if ($event.source.name === 'usertype') {
      if ($event.value == 'company') {
        this.company.setValidators([Validators.required, Validators.pattern("^[A-Za-z0-9 _-]{2,}$")]);
        this.registrationnumber.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern("^[0-9]{3,20}$")]);
        this.companyaddress.setValidators([Validators.required, Validators.pattern(ADDRESSFORMAT),Validators.maxLength(250)]);
      }
      else if ($event.value == 'individual') {
        this.logoUploaded =false
        this.company.clearValidators();
        this.company.updateValueAndValidity();
        this.registrationnumber.clearValidators();
        this.registrationnumber.updateValueAndValidity();
      }

    }
  }


  togglebutton($event: MatSlideToggle, type: string) {
    

    if (type == 'getemail') {
      this.notificationPostData = {
        getemail: $event.checked
      }
    }
    else if (type == 'getnotification') {
      this.notificationPostData = {
        getnotification: $event.checked
      }
    }
    else if (type == 'requestgeneratednotification') {
      this.notificationPostData = {
        requestgeneratednotification: $event.checked
      }
    }
    else if (type == 'requestacknowledgementnotification') {
      this.notificationPostData = {
        requestacknowledgementnotification: $event.checked
      }
    }
    else if (type == 'requestindesigningnotification') {
      this.notificationPostData = {
        requestindesigningnotification: $event.checked
      }
    }
    else if (type == 'designcompletednotification') {
      this.notificationPostData = {
        designcompletednotification: $event.checked
      }
    }
    else if (type == 'designreviewpassednotification') {
      this.notificationPostData = {
        designreviewpassednotification: $event.checked
      }
    }
    else if (type == 'designonholdnotification') {
      this.notificationPostData = {
        designonholdnotification: $event.checked
      }
    }
    else if (type == 'designmovedtoqcnotification') {
      this.notificationPostData = {
        designmovedtoqcnotification: $event.checked
      }
    }
    else if (type == 'designreviewfailednotification') {
      this.notificationPostData = {
        designreviewfailednotification: $event.checked
      }
    }
    else if (type == 'designdeliverednotification') {
      this.notificationPostData = {
        designdeliverednotification: $event.checked
      }
    }



    else if (type == 'requestgeneratedemail') {
      this.notificationPostData = {
        requestgeneratedemail: $event.checked
      }
    }
    else if (type == 'requestacknowledgementemail') {
      this.notificationPostData = {
        requestacknowledgementemail: $event.checked
      }
    }
    else if (type == 'requestindesigningemail') {
      this.notificationPostData = {
        requestindesigningemail: $event.checked
      }
    }
    else if (type == 'designcompletedemail') {
      this.notificationPostData = {
        designcompletedemail: $event.checked
      }
    }

    else if (type == 'designmovedtoqcemail') {
      this.notificationPostData = {
        designmovedtoqcemail: $event.checked
      }
    }
    else if (type == 'designreviewfailedemail') {
      this.notificationPostData = {
        designreviewfailedemail: $event.checked
      }
    }
    else if (type == 'designreviewpassedemail') {
      this.notificationPostData = {
        designreviewpassedemail: $event.checked
      }
    }
    else if (type == 'designdeliveredemail') {
      this.notificationPostData = {
        designdeliveredemail: $event.checked
      }
    }

    this.authService.setRequiredHeaders()
    this.authService.editUserProfile(
      this.authService.currentUserValue.user.id,
      this.notificationPostData
    ).subscribe(
      response => {
        this.authService.currentUserValue.user = response;
      }, error => {
        this.notifyService.showError(
          error,
          "Error"
        );
      }
    )
  }

  fetchTeamData() {
    this.teamService.getTeamData().subscribe(
      response => {
        if (response.length > 0) {
          this.placeholder = false;
          this.teamMembers = this.fillinDynamicTeamData(response);
          this.dataSource.data = this.teamMembers;
          //this.resetOverviewData();
          //this.constructOverviewData();
        } else {
          this.placeholder = true;
        }
      },
      error => {
        //this.notifyService.showError(error, "Error");
      }
    );
  }

  fillinDynamicTeamData(records: User[]): User[] {
    records.forEach(element => {
      element.rolename = this.genericService.getRoleName(element.role.id)
    });

    return records;
  }

  openConfirmationDialog(user: User) {
    const snackbarRef = this.snackBar.openFromComponent(ConfirmationsnackbarComponent, {
      data: { "message": "Are you sure you want to remove " + user.firstname + " " + user.lastname + " from your team?", "positive": "Yes", "negative": "No" }
    });

    snackbarRef.onAction().subscribe(() => {
      this.teamService.deleteTeamUser("" + user.id).subscribe(
        response => {
          this.teamService.deleteCometChatUser("" + user.id);
          this.notifyService.showSuccess(user.firstname + " " + user.lastname + " has been removed successfully from your team.", "Success");
          this.removeUserFromList(user);
        },
        error => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }

  removeUserFromList(user: User) {
    this.teamMembers.forEach(element => {
      if (element.id == user.id) {
        this.teamMembers.splice(this.teamMembers.indexOf(element), 1);
        this.dataSource.data = this.teamMembers;
        /*  this.resetOverviewData();
         this.constructOverviewData();
         this.changeDetectorRef.detectChanges(); 
      }
    });
  }

  openEditTeamMemberDialog(user: User): void {
    const width = "35%";
    if (!this.isClient) {
      width = "50%";
    }
    const dialogRef = this.dialog.open(AddteammemberdialogComponent, {
      width: width,
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: true, user: user, triggerEditEvent: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.triggerEditEvent) {
        this.fetchTeamData();
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  overviewFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  openTeamMemberDetailDialog(element): void {
    const triggerEditEvent = false;
    const dialogRef = this.dialog.open(TeammemberdetaildialogComponent, {
      width: "60%",
      disableClose: true,
      autoFocus: false,
      data: { user: element, triggerEditEvent: triggerEditEvent }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.triggerEditEvent) {
        this.openEditTeamMemberDialog(element);
      }
    });

  }

  openAddTeamMemberDialog(): void {
    const width = "50%";
    /*  if(!this.isClient){
       width = "50%";
     } 
    const dialogRef = this.dialog.open(AddteammemberdialogComponent, {
      width: width,
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: false, triggerEditEvent: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isLoading = false;
      this.fetchTeamData();
      if (result.triggerEditEvent) {

      }
    });
  }

  openAddDesignDialog(ev): void {
    //this.router.navigate(['/home/prelimdesign/overview']);
    ev.stopPropagation();
  
    const dialogRef = this.dialog.open(AdddesigndialogComponent, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: false, isDataUpdated: false, isOnboarding: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isDataUpdated) {
        this.router.navigate(['/home/prelimdesign/overview']);
        //  const myCompOneObj = new DesignComponent();

        //this.fetchAllDesignsCount();
        //this.addItemToList(LISTTYPE.NEW, result.design);
      }
    });
  }
  openAddPrelimProposalDialog(): void {
    
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddprelimproposaldialogComponent, {
      width: "80%",
      disableClose: true,
      autoFocus: false,
      data: { isEditMode: false, isDataUpdated: false ,isOnboarding: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isDataUpdated) {
        this.router.navigate(['/home/prelimdesign/overview']);
      }
    });
  }

  openAutocadDialog(ev): void {
    ev.stopPropagation();
    if (this.loggedInUser.minpermitdesignaccess) {
      
      const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
        width: "80%",
        disableClose: true,
        autoFocus: false,
        data: { isEditMode: false, isDataUpdated: false }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isDataUpdated) {
          this.router.navigate(['/home/permitdesign/overview']);
          //this.fetchAllDesignsCount();
          //his.addItemToPermitList(LISTTYPE.NEW, result.design);
        }
      });
    } else {
      
      // const dialogRef = this.dialog.open(GenerateautocadfiledialogComponent, {
      //   width: "80%",
      //   autoFocus: false,
      //   data: { isEditMode: false, isDataUpdated: false }
      // });

      // dialogRef.afterClosed().subscribe(result => {
      //   if (result.isDataUpdated) {
      //     //this.addItemToPermitList(LISTTYPE.NEW, result.design);
      //   }
      // });
    }
  }
  onUpdateUserInformation(event) {
    this.authService.setRequiredHeaders();
    const company
    const registrationnumber
    if (this.usertype.value == 'company') {
      company = this.requiredinformationform.get("company").value;
      registrationnumber = this.requiredinformationform.get("registrationnumber").value;
    }
    else {
      company = null;
      registrationnumber = null;
    }
    if (this.requiredinformationform.valid) {
      this.isLoading = true;
      const postData = {
        usertype: this.requiredinformationform.get("usertype").value,
        company: company,
        billingaddress: this.requiredinformationform.get("billingaddress").value,
        // phone: this.requiredinformationform.get("phone").value,
        registrationnumber: registrationnumber,
        ispaymentmodeprepay: this.requiredinformationform.get("payment").value,
        isonboardingcompleted: true,
        companyaddress: this.companyaddress.value
      };

      this.authService
        .editUserProfile(
          this.authService.currentUserValue.user.id,
          postData
        )
        .subscribe(
          response => {
            
            if (this.logoUploaded) {
              this.uploadLogo(event);
            } else {
              //this.data.user = response;
              //this.data.isdatamodified = true;
              this.isLoading = false;
              this.changeDetectorRef.detectChanges();
              this.notifyService.showSuccess("Client details have been updated successfully.", "Success");
              this.move(event, 1);
              this.commonservice.userData(this.loggedInUser.id).subscribe(response => {
                this.currentUser.user.usertype = response.usertype
              })
            }

          },
          error => {
            this.isLoading = false;
            this.notifyService.showError(
              error,
              "Error"
            );
          }
        );
    } else {
      // console.log(this.genericService.findInvalidControls(this.requiredinformationform));
      // this.displayerror = false;
    }
  }
  uploadLogo(event) {
    this.loadingmessage = "Uploading logo";
    this.changeDetectorRef.detectChanges();
    this.commonservice
      .uploadLogo(
        this.loggedInUser.id,
        this.loggedInUser.id + "/logo",
        this.logo,
        "logo",
        "user",
        "users-permissions",
      )
      .subscribe(
        response => {
          this.isLoading = false;
          this.updatelogo(response[0], event);
          this.changeDetectorRef.detectChanges();
          this.notifyService.showSuccess("Client details have been updated successfully.", "Success");
          this.commonservice.userData(this.loggedInUser.id).subscribe(response => {
            this.currentUser.user.logo = response.logo;
            this.currentUser.user.usertype = response.usertype;
          })
        },
        error => {
          this.isLoading = false;
          this.notifyService.showError(
            error,
            "Error"
          );
        }
      );
  }

  updatelogo(logo, event) {
    this.authService.setRequiredHeaders();
    const postData = {
      logo: logo
    };

    this.authService
      .editUserProfile(
        this.authService.currentUserValue.user.id,
        postData
      )
      .subscribe(
        response => {
          this.move(event, 1);
        },
        error => {

        }
      );

  }

  openAddMoneyToWalletDialog(): void {
    const dialogRef = this.dialog.open(AddcoinsdialogComponent, {
      width: '50%',
      disableClose: true,
      autoFocus: false,
      data: { isdatamodified: true, user: User, paymenttitle: "Add money to wallet",benefitamount:true },
      panelClass: 'white-modalbox'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.isdatamodified) {
        this.loggedInUser.amount = result.user.amount;
        this.changeDetectorRef.detectChanges();
        this.getUserWalletTranscitionCount();
      }
    })
  }

  doItNowClicked() {
    this.userClickedDoitnow = true;
    location.reload();
  }

  Deleteuploadedlogo($event){
    $event.stopPropagation();
    this.imageUrl="../../../../../assets/logoplaceholder.jpg";
    this.logoUploaded=false;
    this.changeDetectorRef.detectChanges();
  }*/

  routeOnOnboarding() {
    if (this.clientSuperAdmin && !this.loggedInUser.isonboardingcompleted) {
      return this.router.navigate(["/home/dashboard/onboarding"]);
    } else {
      return this.router.navigate(["/home/dashboard/overview"]);
    }
  }
  copyCoupan(coupan, data?): void {
    if (data == "selected") {
      this.notifyService.showSuccess(
        "This code will be applied on next order.",
        "Success"
      );
    }
    this.iscopied = [];
    this.iscopied[coupan.id] = true;
    localStorage.setItem("copiedcoupan", JSON.stringify(coupan));
    this.changeDetectorRef.detectChanges();
  }
}
