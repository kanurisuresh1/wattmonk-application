import { Location } from "@angular-material-extensions/google-maps-autocomplete";
import { SelectionModel } from "@angular/cdk/collections";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
import { MatIconRegistry } from "@angular/material/icon";
import { MatPaginator } from "@angular/material/paginator";
import { MatRadioChange } from "@angular/material/radio";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatStepper } from "@angular/material/stepper";
import { MatTableDataSource } from "@angular/material/table";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { ADDRESSFORMAT, ROLES } from "src/app/_helpers";
import { CurrentUser, Design, User } from "src/app/_models";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { DashboardService } from "src/app/_services/dashboard.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { TeamService } from "src/app/_services/team.service";
import { AddminpermitdesigndialogComponent } from "../../permitdesign/addminpermitdesigndialog/addminpermitdesigndialog.component";
import { AdddesigndialogComponent } from "../../prelimdesign/adddesigndialog/adddesigndialog.component";
import { AddprelimproposaldialogComponent } from "../../prelimdesign/addprelimproposaldialog/addprelimproposaldialog.component";
import { AddcoinsdialogComponent } from "../../profile/addcoinsdialog/addcoinsdialog.component";
import { AddteammemberdialogComponent } from "../../team/addteammemberdialog/addteammemberdialog.component";
import { TeammemberdetaildialogComponent } from "../../team/teammemberdetaildialog/teammemberdetaildialog.component";
import PlaceResult = google.maps.places.PlaceResult;

export enum LISTTYPE {
  NEW,
  INDESIGN,
  COMPLETED,
  INREVIEW,
  DELIVERED,
}

@Component({
  selector: "app-onboarding",
  templateUrl: "./onboarding.component.html",
  styleUrls: ["./onboarding.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class OnboardingComponent implements OnInit {
  isFirstStepDone = false;
  isSecondStepDone = false;
  isLinear = true;
  color: ThemePalette = "primary";
  isLoading = false;
  requiredinformationform: FormGroup;
  accountsettingform: FormGroup;
  // personaladdress = new FormControl("", [Validators.required,Validators.pattern(ADDRESSFORMAT)]);
  usertype = new FormControl("");
  payment = new FormControl("");
  company = new FormControl("");
  registrationnumber = new FormControl("", [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(20),
    Validators.pattern("^[0-9_ ]{3,20}$"),
  ]);
  companyaddress = new FormControl("", [
    Validators.required,
    Validators.pattern(ADDRESSFORMAT),
  ]);
  userlogo = new FormControl("");
  userSettingVisibilityPrelim = new FormControl(true);
  userSettingVisiblitySurvey = new FormControl(true);
  userSettingVisiblityPermit = new FormControl(true);
  userSettingVisiblityPeStamp = new FormControl(true);
  userSettingnameprelim = new FormControl("Sales Proposal");
  userSettingnamesurvey = new FormControl("Survey");
  userSettingnameDashboard = new FormControl("Dashboard");
  userSettingnameTeam = new FormControl("Team");
  userSettingnameInbox = new FormControl("Inbox");
  userSettingnamePermit = new FormControl("Permit");
  userSettingnamePEStamp = new FormControl("PEStamp");
  designcompletedemail = new FormControl("");
  requestgeneratedemail = new FormControl("");
  requestgeneratednotification = new FormControl("");
  requestacknowledgementemail = new FormControl("");
  requestacknowledgementnotification = new FormControl("");
  requestindesigningemail = new FormControl("");
  requestindesigningnotification = new FormControl("");
  designcompletednotification = new FormControl("");
  designmovedtoqcemail = new FormControl("");
  designmovedtoqcnotification = new FormControl("");
  designreviewpassedemail = new FormControl("");
  designreviewpassednotification = new FormControl("");
  designreviewfailedemail = new FormControl("");
  designreviewfailednotification = new FormControl("");
  designdeliveredemail = new FormControl("");
  designdeliverednotification = new FormControl("");

  rolesetting = {
    visibilityprelim: "true",
    visibilitypermit: "true",
    visibilitysurvey: "true",
    visibilitypestamp: "true",
    nameprelim: "Sales Proposal",
    namesurvey: "Survey",
    namedashboard: "Dashboard",
    nameteam: "Team",
    nameinbox: "Inbox",
    namepermit: "Permit",
    namepestamp: "Pestamp",
  };

  displayedColumns: string[] = ["name", "role", "email", "phone", "manage"];

  teamMembers: User[] = [];
  loggedInUser: User;
  currentUser: CurrentUser;
  isClient = false;
  clientSuperAdmin = false;
  dataSource = new MatTableDataSource<User>(this.teamMembers);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("stepper", { static: false }) stepper: MatStepper;

  logo: Blob;
  selection = new SelectionModel<User>(true, []);
  admins = 0;
  bds = 0;
  designers = 0;
  surveyors = 0;
  analysts = 0;
  selectedStatus: "individual" | "company" = "company";
  notificationPostData;
  loadingmessage = "Saving data";

  user = User;
  activitybarVisible: boolean;
  listtypes = LISTTYPE;
  isFavorite = true;
  permissiontomakedesign =
    this.authService.currentUserValue.user.permissiontomakedesign;

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
  scrolling = false;

  listactionindex = 0;

  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  @ViewChild("indesignscroll")
  revisiondesignviewport: CdkVirtualScrollViewport;
  waitingforacceptancedesignviewport: CdkVirtualScrollViewport;
  unassigneddesignviewport: CdkVirtualScrollViewport;
  delayeddesignsviewport: CdkVirtualScrollViewport;
  activitydesignsvieport: CdkVirtualScrollViewport;

  @ViewChild("newDesignsScroller") newDesignsScroller: ElementRef;

  logoUploaded = false;

  displayPlaceholder = false;
  fetchingOverviewData = true;
  imageChangedEvent: any = " ";
  isonboarding = true;
  imageError: string;

  public show: boolean = false;
  public buttonName: any = "Show";
  public logouploadbutton: boolean = true;
  completed: boolean = false;
  //selectedPersonalAddress: Location;
  selectedCompanyAddress: Location;
  formatted_address: string;
  formatted_companyaddress: string;
  postalcode: string;
  city: string;
  state: string;
  country: string;
  ispaymentmodeprepay: boolean = true;
  public hideprelim: boolean = true;
  public hidesurvey: boolean = true;
  public hidepermit: boolean = true;
  public hidepestamp: boolean = true;
  displayname: any;
  addprelim: boolean = false;
  addpermit: boolean = false;
  constructor(
    public dialog: MatDialog,
    private notifyService: NotificationService,
    public genericService: GenericService,
    public designService: DesignService,
    public authService: AuthenticationService,
    private _snackBar: MatSnackBar,
    public fb: FormBuilder,
    private teamService: TeamService,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private commonservice: CommonService,
    private dashboardService: DashboardService,
    private router: Router,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private loaderservice: LoaderService
  ) {
    this.eventEmitterService.onSidebarRouteChange("Onboarding");
    this.eventEmitterService.onOnboardingComplete(false);
    this.loggedInUser = authService.currentUserValue.user;
    this.currentUser = authService.currentUserValue;
    if (this.loggedInUser.role.id == ROLES.ContractorSuperAdmin) {
      this.clientSuperAdmin = true;
    }
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
    this.activitybarVisible = false;

    this.requiredinformationform = this.formBuilder.group({
      // personaladdress: this.personaladdress,
      usertype: this.usertype,
      payment: this.payment,
      company: this.company,
      registrationnumber: this.registrationnumber,
      logo: this.userlogo,
      companyaddress: this.companyaddress,
    });

    this.accountsettingform = this.formBuilder.group({
      userSettingVisibilityPrelim: this.userSettingVisibilityPrelim,
      userSettingVisiblityPeStamp: this.userSettingVisiblityPeStamp,
      userSettingVisiblityPermit: this.userSettingVisiblityPermit,
      userSettingVisiblitySurvey: this.userSettingVisiblitySurvey,
      userSettingnameprelim: this.userSettingnameprelim,
      userSettingnamesurvey: this.userSettingnamesurvey,
      userSettingnameDashboard: this.userSettingnameDashboard,
      userSettingnameTeam: this.userSettingnameTeam,
      userSettingnameInbox: this.userSettingnameInbox,
      userSettingnamePermit: this.userSettingnamePermit,
      userSettingnamePEStamp: this.userSettingnamePEStamp,
    });

    this.usertype.patchValue(this.loggedInUser.usertype);
    this.company.patchValue(this.loggedInUser.company);
    // this.personaladdress.patchValue(this.loggedInUser.address);
    this.companyaddress.patchValue(this.loggedInUser.companyaddress);
    this.registrationnumber.patchValue(this.loggedInUser.registrationnumber);
    this.requestgeneratednotification.patchValue(
      this.loggedInUser.requestgeneratednotification
    );
    this.requestacknowledgementnotification.patchValue(
      this.loggedInUser.requestacknowledgementnotification
    );
    this.requestindesigningnotification.patchValue(
      this.loggedInUser.requestindesigningnotification
    );
    this.designcompletednotification.patchValue(
      this.loggedInUser.designcompletednotification
    );
    this.designreviewpassednotification.patchValue(
      this.loggedInUser.designreviewpassednotification
    );
    this.designmovedtoqcnotification.patchValue(
      this.loggedInUser.designmovedtoqcnotification
    );
    this.designreviewfailednotification.patchValue(
      this.loggedInUser.designreviewfailednotification
    );
    this.designdeliverednotification.patchValue(
      this.loggedInUser.designdeliverednotification
    );
    this.requestgeneratedemail.patchValue(
      this.loggedInUser.requestgeneratedemail
    );
    this.requestacknowledgementemail.patchValue(
      this.loggedInUser.requestacknowledgementemail
    );
    this.requestindesigningemail.patchValue(
      this.loggedInUser.requestindesigningemail
    );
    this.designcompletedemail.patchValue(
      this.loggedInUser.designcompletedemail
    );
    this.designmovedtoqcemail.patchValue(
      this.loggedInUser.designmovedtoqcemail
    );
    this.designreviewfailedemail.patchValue(
      this.loggedInUser.designreviewfailedemail
    );
    this.designreviewpassedemail.patchValue(
      this.loggedInUser.designreviewpassedemail
    );
    this.designdeliveredemail.patchValue(
      this.loggedInUser.designdeliveredemail
    );
    if (this.loggedInUser.ispaymentmodeprepay === null) {
      this.payment.patchValue(false.toString());
    } else {
      this.payment.patchValue(this.loggedInUser.ispaymentmodeprepay.toString());
    }
    this.getUserWalletTranscitionCount();

    this.matIconRegistry.addSvgIcon(
      "account",
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "../../../../../assets/Account Information-1.svg"
      )
    );
    this.matIconRegistry.addSvgIcon(
      "setting",
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "../../../../../assets/Account Setting-1.svg"
      )
    );
    this.matIconRegistry.addSvgIcon(
      "team",
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "../../../../../assets/Build your own team-1.svg"
      )
    );
    this.matIconRegistry.addSvgIcon(
      "designReq",
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "../../../../../assets/Send Design Request-1.svg"
      )
    );
    this.matIconRegistry.addSvgIcon(
      "edit",
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "../../../../../assets/Tick-1.svg"
      )
    );
  }

  registrationForm = this.fb.group({
    file: [null],
  });

  @ViewChild("fileInput") el: ElementRef;
  imageUrl: any;
  editFile: boolean = true;
  removeUpload: boolean = false;

  ngOnInit(): void {
    this.eventEmitterService.currentUserDataRefresh.subscribe(() => {
      if (true) {
        this.loggedInUser = this.authService.currentUserValue.user;
      }
    });
    if (this.loggedInUser.usertype == "individual") {
      this.logoUploaded = false;
      this.company.clearValidators();
      this.company.updateValueAndValidity();
      this.registrationnumber.clearValidators();
      this.registrationnumber.updateValueAndValidity();
      this.companyaddress.clearValidators();
      this.companyaddress.updateValueAndValidity();
    }
  }

  ngAfterViewInit(): void {
    // console.log(this.loggedInUser)
    this.fetchAllDesignsCount();
    if (!this.loggedInUser.isonboardingcompleted) {
      this.getUserWalletTranscitionCount();
      this.fetchTeamData();
    }

    this.dataSource.paginator = this.paginator;
    if (this.authService.currentUserValue.user.logo === null) {
      //  this.imageUrl = "../../../../../assets/upload.svg";
      this.logouploadbutton = true;
    } else {
      this.imageUrl = this.loggedInUser.logo.url;
      this.logouploadbutton = false;
    }
  }
  // Drag and drop image
  uploadFile(event): void {
    this.logouploadbutton = false;
    let file = event.addedFiles[0];
    this.logo = file;

    if (file) {
      this.logoUploaded = true;
    }
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      //Timer use for image privew
      this.changeDetectorRef.detectChanges();
    }, 300);
  }
  /*uploadFile(event) {
    this.logouploadbutton = false;
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    this.logo = event.target.files[0]
    // console.log(this.logo, reader, file)

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

  }*/

  getErrorMessage(
    control: FormControl
  ): string | string | string | string | string | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    } else if (control == this.company) {
      return this.company.hasError("pattern")
        ? "Please enter a valid company name."
        : "";
    } else if (control == this.companyaddress) {
      return this.companyaddress.hasError("pattern")
        ? "Please enter a valid address."
        : "";
    } else if (control == this.registrationnumber) {
      /* else if (control == this.personaladdress) {
      return this.personaladdress.hasError("pattern")
        ? "Please enter a valid address."
        : "";
    }*/
      return this.registrationnumber.hasError("pattern")
        ? "Please enter only numbers.(Min 3 and max. 20 characters)."
        : "Lic No. should be of min. 3 and max. 20 characters.";
    }
  }

  onAutocompleteSelected(result: PlaceResult, address): void {
    if (address == "companyaddress") {
      this.formatted_companyaddress = result.formatted_address;
    } else {
      this.formatted_address = result.formatted_address;
    }
    // this.formatted_address = result.formatted_address;
    for (let i = 0; i < result.address_components.length; i++) {
      for (let j = 0; j < result.address_components[i].types.length; j++) {
        if (result.address_components[i].types[j] == "postal_code") {
          this.postalcode = result.address_components[i].long_name;
        } else if (result.address_components[i].types[j] == "country") {
          this.country = result.address_components[i].long_name;
        } else if (
          result.address_components[i].types[j] == "administrative_area_level_1"
        ) {
          this.state = result.address_components[i].long_name;
        } else if (
          result.address_components[i].types[j] == "administrative_area_level_2"
        ) {
          this.city = result.address_components[i].long_name;
        }
      }
    }
  }

  /* onPersonalAddressSelected(location: Location) {
      this.selectedPersonalAddress = location;
  }*/
  onCompanyAddressSelected(location: Location): void {
    this.selectedCompanyAddress = location;
  }

  activitybarClose(): void {
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.remove("activitybar-open");
    $activitybar.classList.add("activitybar-close");
  }

  removeItemFromList(type: LISTTYPE): void {
    // console.log(type);
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
        this.waitingforacceptancedesignslist = [
          ...this.waitingforacceptancedesignslist,
        ];
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
    }
    this.changeDetectorRef.detectChanges();
  }

  updateItemInList(type: LISTTYPE, newrecord: Design): void {
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
        this.waitingforacceptancedesignslist.splice(
          this.listactionindex,
          1,
          newrecord
        );
        this.waitingforacceptancedesignslist = [
          ...this.waitingforacceptancedesignslist,
        ];
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

  addItemToList(type: LISTTYPE, newrecord: Design): void {
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
        this.waitingforacceptancedesignslist = [
          ...this.waitingforacceptancedesignslist,
        ];
        this.waitingforacceptancedesigns =
          this.waitingforacceptancedesignslist.length;
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
    }
    this.changeDetectorRef.detectChanges();
  }

  getUserWalletTranscitionCount(): void {
    this.commonservice.userWalletTranscition().subscribe((response) => {
      // console.log(response);
      if (response > 0) {
        this.genericService.userWalletfirsttranscition = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  openEditDesignDialog(type: LISTTYPE, design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AdddesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.updateItemInList(type, result.design);
      }
    });
  }
  openEditProposalDesignDialog(type: LISTTYPE, design: Design): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddprelimproposaldialogComponent, {
      width: "80%",
      autoFocus: false,
      data: { isEditMode: true, isDataUpdated: false, design: design },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.updateItemInList(type, result.design);
      }
    });
  }

  fetchWaitingForAcceptanceDesignsData(): void {
    let searchdata = "status=outsourced&isinrevisionstate=false";

    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.waitingforacceptancedesigns = response.length;
        if (response.length > 0) {
          this.getWaitingforacceptancedesign = this.fillinDynamicData(response);
          for (
            let i = 0, len = this.getWaitingforacceptancedesign.length;
            i < len;
            ++i
          ) {
            this.waitingforacceptancedesignslist.push(
              this.getWaitingforacceptancedesign[i]
            );
          }
          this.waitingforacceptancedesignslist = [
            ...this.waitingforacceptancedesignslist,
          ];
          this.changeDetectorRef.detectChanges();
        }
        this.iswaitingforacceptancedesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  fetchUnassignedDesignsData(): void {
    if (this.isClient) {
      var searchdata = "status=created";
    } else {
      var searchdata = "status=created&status=requestaccepted";
    }

    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.unassigneddesigns = response.length;
        if (response.length > 0) {
          this.getUnassigneddesigns = this.fillinDynamicData(response);
          for (
            let i = 0, len = this.getUnassigneddesigns.length;
            i < len;
            ++i
          ) {
            this.unassigneddesignslist.push(this.getUnassigneddesigns[i]);
          }
          this.unassigneddesignslist = [...this.unassigneddesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isunassigneddesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  fetchDelayedDesignData(): void {
    let searchdata = " status=outsourced&delayeddesigns=true ";

    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.delayeddesigns = response.length;
        if (response.length > 0) {
          this.getDelayeddesign = this.fillinDynamicData(response);
          for (let i = 0, len = this.getDelayeddesign.length; i < len; ++i) {
            this.delayeddesignslist.push(this.getDelayeddesign[i]);
          }
          this.delayeddesignslist = [...this.delayeddesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isdelayeddesignslistloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  // Recent activities
  fetchActivityDesignData(): void {
    this.dashboardService.getActivityList().subscribe(
      (response) => {
        this.activitydesigns = response.length;
        if (response.length > 0) {
          this.getActivitydesigns = this.fillinDynamicData(response);
          for (let i = 0, len = this.getActivitydesigns.length; i < len; ++i) {
            this.activitydesignslist.push(this.getActivitydesigns[i]);
          }
          this.activitydesignslist = [...this.activitydesignslist];
          this.changeDetectorRef.detectChanges();
        }
        this.isacitivitydesignsloading = false;
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchAllDesignsCount(): void {
    this.onholddesignslist = [];

    this.dashboardService.getDashboardDesignCounts().subscribe(
      (response) => {
        this.fetchingOverviewData = false;
        let totaldesigns =
          parseInt(response["isinrevisionstatecount"]) +
          parseInt(response["putonhold"]) +
          parseInt(response["unassigned"]) +
          parseInt(response["waitingforacceptance"]);
        if (totaldesigns == 0) {
          this.displayPlaceholder = true;
        } else {
          this.displayPlaceholder = false;
          this.revisiondesigns = parseInt(response["isinrevisionstatecount"]);
          this.onholddesigns = parseInt(response["putonhold"]);
          this.unassigneddesigns = parseInt(response["unassigned"]);
          this.waitingforacceptancedesigns = parseInt(
            response["waitingforacceptance"]
          );
        }
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );

    let searchdata = "status=requestdeclined";
    this.fetchOnholdDesignsData(searchdata);
    this.fetchRevisionDesignsData();
    this.fetchWaitingForAcceptanceDesignsData();
    this.fetchUnassignedDesignsData();
    this.fetchDelayedDesignData();
    this.fetchActivityDesignData();
  }
  fetchOnholdDesignsData(search: string): void {
    this.designService.getFilteredDesigns(search).subscribe(
      (response) => {
        this.onholddesigns = response.length;
        if (response.length > 0) {
          this.getOnholddesigns = this.fillinDynamicData(response);
          for (let i = 0, len = this.getOnholddesigns.length; i < len; ++i) {
            this.onholddesignslist.push(this.getOnholddesigns[i]);
          }
          this.onholddesignslist = [...this.onholddesignslist];
          this.changeDetectorRef.detectChanges();
        }
        // console.log("onholddesignslist", this.onholddesignslist);
        this.scrolling = false;
        this.isLoading = false;
        this.isonholddesignslistloading = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  fetchRevisionDesignsData(): void {
    let searchdata = "status=outsourced&isinrevisionstate=true";

    this.designService.getFilteredDesigns(searchdata).subscribe(
      (response) => {
        this.revisiondesigns = response.length;
        if (response.length > 0) {
          this.getRevisiondesign = this.fillinDynamicData(response);
          for (let i = 0, len = this.getRevisiondesign.length; i < len; ++i) {
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
      //element.isoverdue = this.genericService.isDatePassed(element.deliverydate);
    } else {
      element.isoverdue = false;
    }
    // element.lateby = this.genericService.getTheLatebyString(element.deliverydate)
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
        let acceptancedate = new Date(element.designacceptancestarttime);
        element.designacceptanceremainingtime =
          this.genericService.getRemainingTime(acceptancedate.toString());
      } else {
        let acceptancedate = new Date(element.designacceptancestarttime);
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
        let acceptancedate = new Date(element.designstarttime);
        acceptancedate.setHours(acceptancedate.getHours() + 6);
        element.designremainingtime = this.genericService.getRemainingTime(
          acceptancedate.toString()
        );
      } else {
        let acceptancedate = new Date(element.designstarttime);
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
        let reviewdate = new Date(element.reviewstarttime);
        reviewdate.setHours(reviewdate.getHours() + 2);
        element.reviewremainingtime = this.genericService.getRemainingTime(
          reviewdate.toString()
        );
      } else {
        let reviewdate = new Date(element.reviewstarttime);
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

  move(event, index: number): void {
    event.stopPropagation();
    this.stepper.selectedIndex = index;
    // console.log(event, this.stepper)
    if (index == 3) {
      this.isonboarding = true;
    } else {
      this.isonboarding = false;
    }
  }
  radioChange($event: MatRadioChange): void {
    if ($event.source.name === "usertype") {
      if ($event.value == "company") {
        this.company.setValidators([
          Validators.required,
          Validators.pattern("^[A-Za-z0-9 _-]{2,}$"),
        ]);
        this.registrationnumber.setValidators([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern("^[0-9_ ]{3,20}$"),
        ]);
        this.companyaddress.setValidators([
          Validators.required,
          Validators.pattern(ADDRESSFORMAT),
          Validators.maxLength(250),
        ]);
      }
      if ($event.value == "individual") {
        this.logoUploaded = false;
        this.company.clearValidators();
        this.company.updateValueAndValidity();
        this.registrationnumber.clearValidators();
        this.registrationnumber.updateValueAndValidity();
        this.companyaddress.clearValidators();
        this.companyaddress.updateValueAndValidity();
      }
    }
    /* if ($event.source.name === 'payment'){
      this.ispaymentmodeprepay = $event.value;
      if ($event.value == "true") {
        this.ispaymentmodeprepay = true;
      }
      else{
        this.ispaymentmodeprepay = false;
      }
    }*/
  }

  togglebutton($event: MatSlideToggle, type: string): void {
    // console.log($event)

    if (type == "getemail") {
      this.notificationPostData = {
        getemail: $event.checked,
      };
    } else if (type == "getnotification") {
      this.notificationPostData = {
        getnotification: $event.checked,
      };
    } else if (type == "requestgeneratednotification") {
      this.notificationPostData = {
        requestgeneratednotification: $event.checked,
      };
    } else if (type == "requestacknowledgementnotification") {
      this.notificationPostData = {
        requestacknowledgementnotification: $event.checked,
      };
    } else if (type == "requestindesigningnotification") {
      this.notificationPostData = {
        requestindesigningnotification: $event.checked,
      };
    } else if (type == "designcompletednotification") {
      this.notificationPostData = {
        designcompletednotification: $event.checked,
      };
    } else if (type == "designreviewpassednotification") {
      this.notificationPostData = {
        designreviewpassednotification: $event.checked,
      };
    } else if (type == "designonholdnotification") {
      this.notificationPostData = {
        designonholdnotification: $event.checked,
      };
    } else if (type == "designmovedtoqcnotification") {
      this.notificationPostData = {
        designmovedtoqcnotification: $event.checked,
      };
    } else if (type == "designreviewfailednotification") {
      this.notificationPostData = {
        designreviewfailednotification: $event.checked,
      };
    } else if (type == "designdeliverednotification") {
      this.notificationPostData = {
        designdeliverednotification: $event.checked,
      };
    } else if (type == "requestgeneratedemail") {
      this.notificationPostData = {
        requestgeneratedemail: $event.checked,
      };
    } else if (type == "requestacknowledgementemail") {
      this.notificationPostData = {
        requestacknowledgementemail: $event.checked,
      };
    } else if (type == "requestindesigningemail") {
      this.notificationPostData = {
        requestindesigningemail: $event.checked,
      };
    } else if (type == "designcompletedemail") {
      this.notificationPostData = {
        designcompletedemail: $event.checked,
      };
    } else if (type == "designmovedtoqcemail") {
      this.notificationPostData = {
        designmovedtoqcemail: $event.checked,
      };
    } else if (type == "designreviewfailedemail") {
      this.notificationPostData = {
        designreviewfailedemail: $event.checked,
      };
    } else if (type == "designreviewpassedemail") {
      this.notificationPostData = {
        designreviewpassedemail: $event.checked,
      };
    } else if (type == "designdeliveredemail") {
      this.notificationPostData = {
        designdeliveredemail: $event.checked,
      };
    }

    this.authService.setRequiredHeaders();
    this.authService
      .editUserProfile(
        this.authService.currentUserValue.user.id,
        this.notificationPostData
      )
      .subscribe(
        (response) => {
          this.authService.currentUserValue.user = response;
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchTeamData(): void {
    this.teamService.getTeamData().subscribe(
      (response) => {
        if (response.length > 0) {
          this.teamMembers = this.fillinDynamicTeamData(response);
          this.dataSource.data = this.teamMembers;
          this.changeDetectorRef.detectChanges();
          //this.resetOverviewData();
          //this.constructOverviewData();
        }
      },
      () => {
        //this.notifyService.showError(error, "Error");
      }
    );
  }

  fillinDynamicTeamData(records: User[]): User[] {
    records.forEach((element) => {
      element.rolename = this.genericService.getRoleName(element.role.id);
    });

    return records;
  }

  openConfirmationDialog(user: User): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message:
            "Are you sure you want to remove " +
            user.firstname +
            " " +
            user.lastname +
            " from your team?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.teamService.deleteTeamUser("" + user.id).subscribe(
        () => {
          this.teamService.deleteCometChatUser("" + user.id);
          this.notifyService.showSuccess(
            user.firstname +
            " " +
            user.lastname +
            " has been removed successfully from your team.",
            "Success"
          );
          this.removeUserFromList(user);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }

  removeUserFromList(user: User): void {
    this.teamMembers.forEach((element) => {
      if (element.id == user.id) {
        this.teamMembers.splice(this.teamMembers.indexOf(element), 1);
        this.dataSource.data = this.teamMembers;
        this.changeDetectorRef.detectChanges();
        /*  this.resetOverviewData();
         this.constructOverviewData();
         this.changeDetectorRef.detectChanges(); */
      }
    });
  }

  /*openEditTeamMemberDialog(user: User): void {
    // console.log("UserData:",user);
    let width = "35%";
    if (!this.isClient) {
      width = "50%";
    }
    const dialogRef = this.dialog.open(AddteammemberdialogComponent, {
      width: width,
      autoFocus: false,
      data: { isEditMode: true, user: user, triggerEditEvent: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.triggerEditEvent) {
        this.fetchTeamData();
      }
    });
  }*/
  openEditTeamMemberDialog(user: User): void {
    this.loaderservice.show();
    this.commonservice
      .getSingleUserDetail(user.id)
      .subscribe((Userresponse) => {
        this.commonservice
          .getUserSettings(Userresponse.id)
          .subscribe((response) => {
            this.loaderservice.hide();
            if (response.length > 0) {
              this.openEditDialog(Userresponse, response[0]);
            } else {
              this.openEditDialog(Userresponse, null);
            }
          });
      });
  }

  openEditDialog(user: User, userSetting): void {
    let width = "50%";
    if (!this.isClient) {
      width = "50%";
    }
    const dialogRef = this.dialog.open(AddteammemberdialogComponent, {
      width: width,
      autoFocus: false,
      disableClose: true,
      data: {
        isEditMode: true,
        user: user,
        triggerEditEvent: false,
        userSetting: userSetting,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.fetchTeamData();
      }
    });
  }
  openTeamMemberDetailDialog(element): void {
    let triggerEditEvent = false;
    const dialogRef = this.dialog.open(TeammemberdetaildialogComponent, {
      width: "60%",
      autoFocus: false,
      data: { user: element, triggerEditEvent: triggerEditEvent },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.openEditTeamMemberDialog(element);
      }
    });
  }

  openAddTeamMemberDialog(): void {
    let width = "50%";
    /*  if(!this.isClient){
       width = "50%";
     } */
    const dialogRef = this.dialog.open(AddteammemberdialogComponent, {
      width: width,
      autoFocus: false,
      data: { isEditMode: false, triggerEditEvent: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.isLoading = false;

      if (result.triggerEditEvent) {
        this.fetchTeamData();
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  openAddDesignDialog(ev): void {
    //this.router.navigate(['/home/prelimdesign/overview']);
    ev.stopPropagation();
    // console.log(ev)
    const dialogRef = this.dialog.open(AdddesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      data: { isEditMode: false, isDataUpdated: false, isOnboarding: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        let currentUser = JSON.parse(localStorage.getItem("currentUser"));
        currentUser.user.isonboardingcompleted = true;
        // currentUser.user.parent.isonboardingcompleted= true;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        localStorage.setItem("lastroute", "/home/prelimdesign/overview");
        this.router.navigate(["/home/prelimdesign/overview"]);
        this.eventEmitterService.onSidebarRouteChange(
          this.accountsettingform.get("userSettingnameprelim").value
        );
        this.eventEmitterService.onOnboardingComplete(true);
      }
    });
  }
  openAddPrelimProposalDialog(): void {
    this.activitybarClose();
    const dialogRef = this.dialog.open(AddprelimproposaldialogComponent, {
      width: "80%",
      autoFocus: false,
      data: { isEditMode: false, isDataUpdated: false, isOnboarding: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        let currentUser = JSON.parse(localStorage.getItem("currentUser"));
        currentUser.user.isonboardingcompleted = true;
        // currentUser.user.parent.isonboardingcompleted= true;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        localStorage.setItem("lastroute", "/home/prelimdesign/overview");
        this.router.navigate(["/home/prelimdesign/overview"]);
        this.eventEmitterService.onSidebarRouteChange(
          this.accountsettingform.get("userSettingnameprelim").value
        );
        this.eventEmitterService.onOnboardingComplete(true);
      }
    });
  }

  openAutocadDialog(ev): void {
    ev.stopPropagation();
    if (this.loggedInUser.minpermitdesignaccess) {
      // console.log("if")
      const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
        width: "80%",
        autoFocus: false,
        data: { isEditMode: false, isDataUpdated: false },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.isDataUpdated) {
          let currentUser = JSON.parse(localStorage.getItem("currentUser"));
          currentUser.user.isonboardingcompleted = true;
          // currentUser.user.parent.isonboardingcompleted= true;
          localStorage.setItem("currentUser", JSON.stringify(currentUser));
          localStorage.setItem("lastroute", "/home/permitdesign/overview");
          this.router.navigate(["/home/permitdesign/overview"]);
          this.eventEmitterService.onSidebarRouteChange(
            this.accountsettingform.get("userSettingnamePermit").value
          );
          this.eventEmitterService.onOnboardingComplete(true);
        }
      });
    }
  }
  onUpdateUserInformation(event): void {
    this.authService.setRequiredHeaders();
    let company;
    let registrationnumber;
    let companyaddress;
    // let personaladdress;
    if (this.usertype.value == "company") {
      company = this.requiredinformationform.get("company").value;
      registrationnumber = this.requiredinformationform
        .get("registrationnumber")
        .value.trim();

      if (this.selectedCompanyAddress) {
        companyaddress = this.formatted_companyaddress;
      } else {
        companyaddress =
          this.requiredinformationform.get("companyaddress").value;
      }
    } else {
      company = null;
      registrationnumber = null;
      companyaddress = null;
    }
    /* if (this.selectedPersonalAddress && this.selectedPersonalAddress != undefined) {
      personaladdress = this.formatted_address;
     
    } else {
      personaladdress = this.requiredinformationform.get("personaladdress").value;
    }*/
    if (this.requiredinformationform.valid) {
      this.isLoading = true;
      const postData = {
        usertype: this.requiredinformationform.get("usertype").value,
        company: company,
        registrationnumber: registrationnumber,
        ispaymentmodeprepay: this.ispaymentmodeprepay,
        isonboardingcompleted: false,
        companyaddress: companyaddress,
        //address: personaladdress,
      };

      this.authService
        .editUserProfile(this.authService.currentUserValue.user.id, postData)
        .subscribe(
          (response) => {
            // console.log(response);
            let currentuser: CurrentUser = new CurrentUser();
            currentuser.jwt = this.currentUser.jwt;
            currentuser.user = response;
            localStorage.setItem("currentUser", JSON.stringify(currentuser));
            if (this.logoUploaded) {
              this.uploadLogo(event);
            } else {
              //this.data.user = response;
              //this.data.isdatamodified = true;
              this.isLoading = false;
              this.changeDetectorRef.detectChanges();
              this.notifyService.showSuccess(
                "Client details have been updated successfully.",
                "Success"
              );
              this.isFirstStepDone = true;
              this.move(event, 1);
              this.commonservice
                .userData(this.loggedInUser.id)
                .subscribe((response) => {
                  this.currentUser.user.usertype = response.usertype;
                  this.authService.broadCastCurrentUserSetting(true);
                });
            }
          },
          (error) => {
            this.isLoading = false;
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.isLoading = false;
      this.requiredinformationform.markAllAsTouched();
      this.changeDetectorRef.detectChanges();
    }
  }
  onUpdateAccountSetting(event): void {
    if (this.accountsettingform.valid) {
      this.isLoading = true;
      const accountSetting = {
        //---------VisibilitySetting--------
        visibilityprelim: this.userSettingVisibilityPrelim.value,
        visibilitypermit: this.userSettingVisiblityPermit.value,
        visibilitysurvey: this.userSettingVisiblitySurvey.value,
        visibilitypestamp: this.userSettingVisiblityPeStamp.value,

        //-------NameSetting-------------

        nameprelim: this.accountsettingform.get("userSettingnameprelim").value,
        namesurvey: this.userSettingnamesurvey.value,
        namedashboard: this.userSettingnameDashboard.value,
        nameinbox: this.userSettingnameInbox.value,
        nameteam: this.userSettingnameTeam.value,
        namepermit: this.userSettingnamePermit.value,
        namepestamp: this.userSettingnamePEStamp.value,
        isonboardingcompleted: true,
      };
      if (
        !accountSetting.visibilitypermit &&
        !accountSetting.visibilitypestamp &&
        !accountSetting.visibilityprelim &&
        !accountSetting.visibilitysurvey
      ) {
        this.notifyService.showError(
          "Atleast one preferred service should be enable.",
          "Error"
        );
      } else {
        this.authService.setRequiredHeaders();
        this.authService
          .editUserSetting(
            this.authService.currentUserValue.user.id,
            accountSetting
          )
          .subscribe(
            (res) => {
              this.isLoading = false;
              // console.log("userSetting", res);
              localStorage.setItem("usersettings", JSON.stringify(res.body));
              this.displayname = res.body;
              this.notifyService.showSuccess(
                "Client details have been updated successfully.",
                "Success"
              );
              this.isSecondStepDone = true;
              if (res.body.visibilityprelim) {
                this.addprelim = true;
              }
              if (res.body.visibilitypermit) {
                this.addpermit = true;
              }
              this.move(event, 2);
              // this.currentUser.user.isonboardingcompleted = true;

              this.commonservice
                .userData(this.authService.currentUserValue.user.id)
                .subscribe(
                  () => {
                    // console.log("usersettingSaved");
                    this.authService.broadCastCurrentUserSetting(true);
                  },
                  () => {
                    // console.log("errrrrrrr",err);
                  }
                );
            },
            () => {
              // console.log("userSetting");
              this.notifyService.showSuccess(
                "Client details have been updated successfully.",
                "Success"
              );
              //this.currentUser.user.isonboardingcompleted = true;
              //  localStorage.setItem("currentUser",JSON.stringify(this.currentUser))
              this.commonservice
                .userData(this.authService.currentUserValue.user.id)
                .subscribe(() => {
                  // console.log("usersettingSaved");
                  this.authService.broadCastCurrentUserSetting(true);
                });
            }
          );
      }

      this.changeDetectorRef.detectChanges();
    }
  }
  saveData(event): void {
    if (
      this.userSettingnameprelim.value == "" ||
      this.userSettingnameprelim.value === null
    ) {
      this.accountsettingform
        .get("userSettingnameprelim")
        .setValue(this.rolesetting.nameprelim);
    }
    if (
      this.userSettingnamesurvey.value == "" ||
      this.userSettingnamesurvey.value === null
    ) {
      this.accountsettingform
        .get("userSettingnamesurvey")
        .setValue(this.rolesetting.namesurvey);
    }
    if (
      this.userSettingnameDashboard.value == "" ||
      this.userSettingnameDashboard.value === null
    ) {
      this.accountsettingform
        .get("userSettingnameDashboard")
        .setValue(this.rolesetting.namedashboard);
    }
    if (
      this.userSettingnameTeam.value == "" ||
      this.userSettingnameTeam.value === null
    ) {
      this.accountsettingform
        .get("userSettingnameTeam")
        .setValue(this.rolesetting.nameteam);
    }
    if (
      this.userSettingnameInbox.value == "" ||
      this.userSettingnameInbox.value === null
    ) {
      this.accountsettingform
        .get("userSettingnameInbox")
        .setValue(this.rolesetting.nameinbox);
    }
    if (
      this.userSettingnamePermit.value == "" ||
      this.userSettingnamePermit.value === null
    ) {
      this.accountsettingform
        .get("userSettingnamePermit")
        .setValue(this.rolesetting.namepermit);
    }
    if (
      this.userSettingnamePEStamp.value == "" ||
      this.userSettingnamePEStamp.value === null
    ) {
      this.accountsettingform
        .get("userSettingnamePEStamp")
        .setValue(this.rolesetting.namepestamp);
    }
    this.onUpdateAccountSetting(event);
  }

  uploadLogo(event): void {
    this.loadingmessage = "Uploading logo";
    this.changeDetectorRef.detectChanges();
    this.commonservice
      .uploadLogo(
        this.loggedInUser.id,
        this.loggedInUser.id + "/logo",
        this.logo,
        "logo",
        "user",
        // "users-permissions"
      )
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.updatelogo(response[0], event);
          this.changeDetectorRef.detectChanges();
          this.isFirstStepDone = true;
          this.commonservice
            .userData(this.loggedInUser.id)
            .subscribe((response) => {
              this.currentUser.user.logo = response.logo;
              this.notifyService.showSuccess(
                "Client details have been updated successfully.",
                "Success"
              );
              this.isLoading = false;
              this.currentUser.user.usertype = response.usertype;
              this.authService.broadCastCurrentUserSetting(true);
              this.eventEmitterService.userDataRefresh(true);
            });
        },
        (error) => {
          this.isLoading = false;
          this.notifyService.showError(error, "Error");
        }
      );
  }

  updatelogo(logo, event): void {
    this.authService.setRequiredHeaders();
    const postData = {
      logo: logo,
    };

    this.authService
      .editUserProfile(this.authService.currentUserValue.user.id, postData)
      .subscribe(() => {
        this.move(event, 1);
        this.eventEmitterService.userDataRefresh(true);
      });
  }

  openAddMoneyToWalletDialog(): void {
    const dialogRef = this.dialog.open(AddcoinsdialogComponent, {
      width: "50%",
      autoFocus: false,
      data: {
        isdatamodified: true,
        user: User,
        paymenttitle: "Add money to wallet",
        benefitamount: true,
      },
      panelClass: "rounded-modalbox",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdatamodified) {
        this.loggedInUser.amount = result.user.amount;
        this.changeDetectorRef.detectChanges();
        this.getUserWalletTranscitionCount();
        let currentUser = JSON.parse(localStorage.getItem("currentUser"));
        currentUser.user.isonboardingcompleted = false;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }
    });
  }
  Deleteuploadedlogo($event): void {
    this.logouploadbutton = true;
    $event.stopPropagation();
    // this.imageUrl="../../../../../assets/upload.svg";
    // console.log(this.imageUrl)
    this.logoUploaded = false;
    this.changeDetectorRef.detectChanges();
  }
  /*toggle() {
    this.show = !this.show;
    if(this.show)  
      this.buttonName = "Show";
    else
      this.buttonName = "Hide";
  }*/
  toggle($event: MatSlideToggle): void {
    this.show = $event.checked;
    if (this.show) this.buttonName = "Show";
    else this.buttonName = "Hide";
  }
  selectionChange(event): void {
    // console.log("steeper data:",event);
    if (event.selectedStep.state == "Account") {
      this.matIconRegistry.addSvgIcon(
        "account",
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "../../../../../assets/Account Information.svg"
        )
      );
    } else if (event.selectedStep.state == "Setting") {
      this.matIconRegistry.addSvgIcon(
        "setting",
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "../../../../../assets/Account Setting.svg"
        )
      );
    } else if (event.selectedStep.state == "Team") {
      this.matIconRegistry.addSvgIcon(
        "team",
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "../../../../../assets/Build_your_own_team.svg"
        )
      );
    } else if (event.selectedStep.state == "DesignReq") {
      this.matIconRegistry.addSvgIcon(
        "designReq",
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          "../../../../../assets/Send_Design_Request.svg"
        )
      );
    }
  }

  changeState(data): void {
    //  console.log("event:",event);
    if (data == "Sales Proposal") {
      this.hideprelim = !this.hideprelim;
      this.userSettingVisibilityPrelim.setValue(this.hideprelim);
    } else if (data == "Survey") {
      this.hidesurvey = !this.hidesurvey;
      this.userSettingVisiblitySurvey.setValue(this.hidesurvey);
    } else if (data == "Permit") {
      this.hidepermit = !this.hidepermit;
      this.userSettingVisiblityPermit.setValue(this.hidepermit);
    } else if (data == "PeStamp") {
      this.hidepestamp = !this.hidepestamp;
      this.userSettingVisiblityPeStamp.setValue(this.hidepestamp);
    }
  }
  redirectToDashboard(): void {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    currentUser.user.isonboardingcompleted = true;
    // currentUser.user.parent.isonboardingcompleted= true;
    // this.authService.broadcastCurrentuser(currentUser.user);
    this.authService.currentUserValue.user.isonboardingcompleted = true;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("lastroute", "/home/dashboard/overview");
    this.router.navigate(["/home/dashboard/overview"]);
    this.eventEmitterService.onSidebarRouteChange("Dashboard");
    this.eventEmitterService.onOnboardingComplete(true);
  }
  removeUploadFile(): void {
    this.logo = null;
    this.logoUploaded = false;
  }
}
