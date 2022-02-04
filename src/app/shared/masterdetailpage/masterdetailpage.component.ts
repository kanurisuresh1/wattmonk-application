import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CometChat } from "@cometchat-pro/chat";
import { Gallery, GalleryItem, ImageItem } from "@ngx-gallery/core";
import { CountdownTimerService } from "ngx-timer";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { AssignpeengineersComponent } from "src/app/home/dashboard/pestamp/assignpeengineers/assignpeengineers.component";
import { FIREBASE_DB_CONSTANTS, ROLES } from "src/app/_helpers";
import {
  Design,
  InverterMake,
  InverterModel,
  ModuleMake,
  ModuleModel,
  Pestamp,
  User
} from "src/app/_models";
import { JobsTiming } from "src/app/_models/jobtiming";
import { Survey } from "src/app/_models/survey";
import { UserSetting } from "src/app/_models/usersettings";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  LoaderService,
  NotificationService,
  PestampService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { SurveyService } from "src/app/_services/survey.service";
import { ConfirmationsnackbarComponent } from "../confirmationsnackbar/confirmationsnackbar.component";

export interface JobsTime {
  permit_analyst: number;
  permit_designer: number;
  prelim_analyst: number;
  prelim_designer: number;
}

export interface MasterdetailpageComponent {
  prelim: Design;
  survey: Survey;
  permit: Design;
  pestamp: Pestamp;
  triggerPrelimEditEvent: boolean;
  triggerPermitEditEvent: boolean;
  triggerSurveyEditEvent: boolean;
  triggerPestampEditEvent: boolean;
  triggerDeleteEvent: boolean;
  refreshDashboard: boolean;
  selectedtab: any;
  triggerChatEvent: boolean;
  triggerActivity: boolean;
  mode: String;
  job: JobsTiming;
  alljobstime: JobsTime;
}
@Component({
  selector: "app-masterdetailpage",
  templateUrl: "./masterdetailpage.component.html",
  styleUrls: ["./masterdetailpage.component.scss"],
})
export class MasterdetailpageComponent implements OnInit {
  addcriteriacomment: string;
  isciteriacommentshow = false;
  selectedCriteria;
  designerCritera: any = [];
  prelimCriteria: any = [];

  extension: string;
  filetype: any;
  isLoading = false;
  isLoad = false;
  reviewissuesinvalid = false;
  loadingmessage = "Saving data";
  loggedInUser: User;
  isClient = false;
  isUserDesigner = false;
  isUserAnalyst = false;
  isUserPeEngineer = false;
  defaultvalue = "-";

  isprelimEditable = false;
  ispermitEditable = false;
  issurveyEditable = false;
  ispestampEditable = false;

  isselfupdatepermit = false;
  isselfupdateprelim = false;

  permitfiles: File[] = [];
  prelimfiles: File[] = [];
  pestampfiles: File[] = [];

  reviewissues = new FormControl("", [Validators.required]);

  checklistcomments = new FormControl("", []);
  anyalistchecklistcomments = new FormControl("", []);
  designcomments = new FormControl("", []);
  workinghours = new FormControl("", [
    Validators.min(1),
    Validators.pattern("^[1-9][0-9]?$"),
  ]);
  modulemake = new FormControl(null, [Validators.required]);
  modulemodel = new FormControl(null, [Validators.required]);
  invertermake = new FormControl(null, [Validators.required]);
  invertermodel = new FormControl(null, [Validators.required]);

  modulemakePermit = new FormControl(null, [Validators.required]);
  modulemodelPermit = new FormControl(null, [Validators.required]);
  invertermakePermit = new FormControl(null, [Validators.required]);
  invertermodelPermit = new FormControl(null, [Validators.required]);
  reviewstartdatetime: number;
  reviewenddatetime: number;
  designstartdatetime: number;
  designenddatetime: number;
  isPermitDesignSelected = false;
  isPrelimDesignSelected = false;
  isPestampSelcted = false;
  //Survey Details
  mspimages: GalleryItem[];
  utilitymeterimages: GalleryItem[];
  pvinverterimages: GalleryItem[];
  pvmeterimages: GalleryItem[];
  acdisconnectimages: GalleryItem[];
  roofimages: GalleryItem[];
  roofdimensionimages: GalleryItem[];
  obstaclesimages: GalleryItem[];
  obstaclesdimensionsimages: GalleryItem[];
  atticimages: GalleryItem[];
  appliancesimages: GalleryItem[];
  groundimages: GalleryItem[];
  solarpanelsimages: GalleryItem[];
  existingsubpanelimages: GalleryItem[];
  utilitybillfront: GalleryItem[];
  utilitybillback: GalleryItem[];

  //pestamp details
  roofphotos: GalleryItem[];
  atticphotos: GalleryItem[];

  prelimAttachments: GalleryItem[];
  permitAttachments: GalleryItem[];

  prelimarchitecturefile: GalleryItem[];
  permitarchitecturefile: GalleryItem[];

  displayerror = false;
  detailPestampDialogForm: FormGroup;
  isinrevision = false;

  isprelimDeletable = false;
  ispermitDeletable = false;
  issurveyDeletable = false;
  ispestampDeletable = false;
  postData = {};
  checklistChecked: boolean = false;
  newchecklist: Observable<any>;
  clientchecklist: AngularFireObject<any>;
  clientchecklistdata: Observable<any>;
  isEditChecklist: boolean = false;
  commentId: number;
  qualitycheckindex: number;
  commentindex: number;
  latestcommenteditdelete: boolean = false;
  designercomment;

  isWattmonkadmins = false;
  isShowReassign = false;
  showComments: boolean = false;
  isOnholdAttachments: boolean = false;
  userSettings: UserSetting;
  modulemakes: ModuleMake[] = [];
  filteredModuleMakes: Observable<ModuleMake[]>;
  modulemakefilter = new FormControl("");
  modulemodels: ModuleModel[] = [];
  filteredModuleModels: Observable<ModuleModel[]>;
  modulemodelfilter = new FormControl("");

  invertermodels: InverterModel[] = [];
  filteredInverterModels: Observable<InverterModel[]>;
  invertermodelfilter = new FormControl("");

  modulemakesPermit: ModuleMake[] = [];
  filteredModuleMakesPermit: Observable<ModuleMake[]>;
  modulemakefilterPermit = new FormControl("");
  modulemodelsPermit: ModuleModel[] = [];
  filteredModuleModelsPermit: Observable<ModuleModel[]>;
  modulemodelfilterPermit = new FormControl("");

  invertermodelsPermit: InverterModel[] = [];
  filteredInverterModelsPermit: Observable<InverterModel[]>;
  invertermodelfilterPermit = new FormControl("");
  // invertermake: InverterMake[] = [];
  filteredInverterMakes: Observable<InverterMake[]>;
  invertermakefilter = new FormControl("");
  inverterscount = new FormControl("", [Validators.required]);
  invertermakes: InverterMake[] = [];

  invertermakefilterPermit = new FormControl("");
  inverterscountPermit = new FormControl("", [Validators.required]);
  modulecountPermit = new FormControl("", [Validators.required]);
  invertermakesPermit: InverterMake[] = [];
  filteredInverterMakesPermit: Observable<InverterMake[]>;

  permitModelsForm: FormGroup;
  prelimModelsForm: FormGroup;

  prelimdisplayerror = true;
  permitdisplayerror = true;
  deliverycharges = new FormControl(null, [Validators.pattern("^[0-9]*"), Validators.min(1), Validators.max(5000)]);
  isPesuperadmin = false;

  guidelineBadgeHidden = false;
  showRaiseRequestData = false;
  showguidelinelink = false;
  showGuidelineNew: boolean = false;
  Guidelineseenby: any;
  saveinverters: boolean = false;
  searchTerm: any = { name: '' };
  setselectedsolarmake: number;
  setselectedsolarmodel: number;
  setselectedsolarmakepermit: number;
  setselectedsolarmodelpermit: number;
  tempdata = [];
  attachmenthoverIdx = -1;
  architecturehoverIdx = -1;
  attichoverIdx = -1;
  roofhoverIdx = -1;
  joboverduetotaltime: any;
  jobtime: JobsTime;

  constructor(
    public dialogRef: MatDialogRef<MasterdetailpageComponent>,
    public dialog: MatDialog,
    private notifyService: NotificationService,
    public genericService: GenericService,
    private designService: DesignService,
    private changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private db: AngularFireDatabase,
    private commonService: CommonService,
    private authService: AuthenticationService,
    private pestampService: PestampService,
    private surveyService: SurveyService,
    public gallery: Gallery,
    private countdownservice: CountdownTimerService,
    private loaderService: LoaderService,
    @Inject(MAT_DIALOG_DATA) public data: MasterdetailpageComponent,
    private _bottomSheet: MatBottomSheet,
  ) {
    this.permitModelsForm = new FormGroup({
      solarmake: this.modulemakePermit,
      solarmodel: this.modulemodelPermit,
    })
    this.prelimModelsForm = new FormGroup({
      solarmake: this.modulemake,
      solarmodel: this.modulemodel,
    })
    this.userSettings = JSON.parse(localStorage.getItem("usersettings"));
    this.loggedInUser = this.authService.currentUserValue.user;

    this.joboverduetotaltime = this.db.object("tasktimings").valueChanges().subscribe((result: JobsTime) => {
      this.jobtime = result;
    });
    //this.userSettings == null?this.userSettings = this.loggedInUser.usersetting:null;
    if (this.loggedInUser.role.id == ROLES.PESuperAdmin) {
      this.isPesuperadmin = true;
    }

    if (
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.TeamHead
    ) {
      this.showRaiseRequestData = true;
    } else {
      this.showRaiseRequestData = false;
    }

    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      (this.loggedInUser.role.id == ROLES.TeamHead &&
        this.loggedInUser.parent.id != 232)
    ) {
      this.isUserDesigner = false;
      this.isClient = true;
      this.isUserAnalyst = false;
    } else if (
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      (this.loggedInUser.role.id == ROLES.TeamHead &&
        this.loggedInUser.parent.id == 232)
    ) {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = false;
      this.isWattmonkadmins = true;
    } else if (this.loggedInUser.role.id == ROLES.Designer) {
      this.isUserDesigner = true;
      this.isClient = false;
      this.isUserAnalyst = false;
    } else if (this.loggedInUser.role.id == ROLES.Analyst) {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = true;
    } else if (this.loggedInUser.role.id == ROLES.Peengineer) {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = false;
      this.isUserPeEngineer = true;
    } else {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = false;
      this.isWattmonkadmins = false;
    }
    if (
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin
    ) {
      this.isShowReassign = true;
    }

    this.loggedInUser = this.authService.currentUserValue.user
    if (this.loggedInUser.role.id == ROLES.ContractorSuperAdmin || this.loggedInUser.role.id == ROLES.ContractorAdmin || this.loggedInUser.role.id == ROLES.SuccessManager || this.loggedInUser.role.id == ROLES.Master || (this.loggedInUser.role.id == ROLES.TeamHead && this.loggedInUser.parent.id != 232)) {
      this.isUserDesigner = false;
      this.isClient = true;
      this.isUserAnalyst = false;
    } else if (
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      (this.loggedInUser.role.id == ROLES.TeamHead &&
        this.loggedInUser.parent.id == 232)
    ) {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = false;
    } else if (this.loggedInUser.role.id == ROLES.Designer) {
      this.isUserDesigner = true;
      this.isClient = false;
      this.isUserAnalyst = false;
    } else if (this.loggedInUser.role.id == ROLES.Analyst) {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = true;
    } else if (this.loggedInUser.role.id == ROLES.Peengineer) {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = false;
      this.isUserPeEngineer = true;
    } else {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = false;
    }

    this.detailPestampDialogForm = new FormGroup({
      // designcomments : this.designcomments,
      workinghours: this.workinghours,
      deliverycharges: this.deliverycharges,
    });
    // console.log(data)
    if (data?.permit) {
      this.designerCritera = data.permit?.checklistcriteria;

      if (data.permit?.checklistcriteria) {
        this.designerCritera.map((item) => {
          if (item && item.feedback === null) {
            item.feedback = false;
          }
        });
      }
    }
    if (data?.prelim) {
      this.prelimCriteria = data.prelim?.checklistcriteria;
      if (data.prelim?.checklistcriteria) {
        this.prelimCriteria.map(item => {
          if (item && item.feedback == null) {
            item.feedback = false
          }
        })
      }
    }
    if (this.data.prelim != null && this.data.prelim.comments.length > 0) {
      this.data.prelim.comments.forEach(comment => {
        let roleId = parseInt(comment.createdby.role.toString());

        if (
          (this.isClient && data.prelim.status == "delivered") ||
          (this.isClient && roleId != 8 && roleId != 9 && roleId != 10) ||
          !this.isClient
        ) {
          this.showComments = true;
        } else {
          this.showComments = false;
        }
      });
    } else if (
      this.data.permit != null &&
      data.permit != undefined &&
      this.data.permit.comments.length > 0
    ) {
      this.data.permit.comments.forEach((comment) => {
        const roleId = parseInt(comment.createdby.role.toString());
        if (
          (this.isClient && data.permit.status == "delivered") ||
          (this.isClient && roleId != 8 && roleId != 9 && roleId != 10) ||
          !this.isClient
        ) {
          this.showComments = true;
        } else {
          this.showComments = false;
        }
      });
    } else if (
      this.data.pestamp != null &&
      this.data.pestamp != undefined &&
      this.data.pestamp.comments.length > 0
    ) {
      this.data.pestamp.comments.forEach((comment) => {
        const roleId = parseInt(comment.createdby.role.toString());
        if (
          (this.isClient && data.pestamp.status == "delivered") ||
          (this.isClient && roleId != 8 && roleId != 9 && roleId != 10) ||
          !this.isClient
        ) {
          this.showComments = true;
        } else {
          this.showComments = false;
        }
      });
    } else if (
      this.data.survey != null &&
      this.data.survey != undefined &&
      this.data.survey.comments.length > 0
    ) {
      this.data.survey.comments.forEach((comment) => {
        const roleId = parseInt(comment.createdby.role.toString());
        if (
          (this.isClient && data.survey.status == "delivered") ||
          (this.isClient && roleId != 8 && roleId != 9 && roleId != 10) ||
          !this.isClient
        ) {
          this.showComments = true;
        } else {
          this.showComments = false;
        }
      });
    } else {
      this.showComments = false;
    }
    if (data.prelim != null && data.prelim != undefined) {
      this.fetchModuleMakesData();
      if (data.prelim?.solarmake != null && data.prelim?.solarmodel == null) {
        this.fetchModuleModelsData("abc", data.prelim.solarmake);
      }
      this.modulemake.setValue(data.prelim.solarmake?.id);
      this.modulemodel.setValue(data.prelim.solarmodel?.id);

      this.data.prelim?.designinverters.forEach((element, index) => {
        Object.assign(element, { invertermodels: null, isSaved: true });

        if (element.invertermake == null || element.invertermodel == null) {
          this.saveinverters = true;
        }
        this.prelimModelsForm.addControl("invertermake" + Number(index + 1), new FormControl(element.invertermake?.name, Validators.required))
        this.prelimModelsForm.addControl("invertermodel" + Number(index + 1), new FormControl(element.invertermodel?.name, Validators.required))
        this.prelimModelsForm.addControl("inverterscount" + Number(index + 1), new FormControl(element.inverterscount, Validators.required))
        Object.assign(element, { invertermakecontrol: "invertermake" + Number(index + 1), invertermodelcontrol: "invertermodel" + Number(index + 1), inverterscountcontrol: "inverterscount" + Number(index + 1) });
        if (element.invertermake != null) {
          this.loadInverterModelsData(element.invertermake, index)
        }
      });
      this.fetchInverterMakesData();
    }

    if (data.permit != null && data.permit != undefined) {
      this.fetchModuleMakesDataPermit();

      if (data.permit?.solarmake != null && data.permit?.solarmodel == null) {
        this.fetchModuleModelsDataPermit("abc", data.permit.solarmake);
      }
      this.modulemakePermit.setValue(data.permit.solarmake?.id);
      this.modulemodelPermit.setValue(data.permit.solarmodel?.id);

      this.data.permit?.designinverters.forEach((element, index) => {
        Object.assign(element, { invertermodels: null, isSaved: true });
        if (element.invertermake == null || element.invertermodel == null || element.invertermake?.name == 'Others' || element.invertermodel?.name == 'Others') {
          this.saveinverters = true;
        }
        this.permitModelsForm.addControl("invertermake" + Number(index + 1), new FormControl(element.invertermake?.name, Validators.required))
        this.permitModelsForm.addControl("invertermodel" + Number(index + 1), new FormControl(element.invertermodel?.name, Validators.required))
        this.permitModelsForm.addControl("inverterscount" + Number(index + 1), new FormControl(element.inverterscount, Validators.required))
        Object.assign(element, { invertermakecontrol: "invertermake" + Number(index + 1), invertermodelcontrol: "invertermodel" + Number(index + 1), inverterscountcontrol: "inverterscount" + Number(index + 1) });
        if (element.invertermake != null) {
          this.loadInverterModelsDataPermit(element.invertermake, index)
        }
      });
      console.log(data.permit.designinverters)
      this.invertermakePermit.setValue(data.permit.invertermake?.id);
      this.invertermodelPermit.setValue(data.permit.invertermodel?.id);

      this.inverterscountPermit.setValue(data.permit.inverterscount);
      this.modulecountPermit.setValue(data.permit.modulecount);
      this.fetchInverterMakesDataPermit();
    }
  }

  ngOnInit(): void {
    if (this.data.prelim != null && this.data.prelim != undefined) {
      this.prelimAttachments = this.data.prelim.attachments.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );

      this.prelimarchitecturefile = this.data.prelim.architecturaldesign.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );

      if (this.data.prelim.isinrevisionstate) {
        this.isinrevision = true;
      }
      // if ((((this.data.prelim.createdby.id == this.loggedInUser.id || this.loggedInUser.id == this.data.prelim.createdby.parent.id || this.loggedInUser.role.id == ROLES.ContractorAdmin)  &&
      //    (this.data.prelim.status == 'created' || this.data.prelim.status == 'requestdeclined'))
      //    || ((this.data.prelim.status == 'outsourced' || this.data.prelim.status == 'requestaccepted')
      //     && !this.data.prelim.createdby.parent.ispaymentmodeprepay)) && !this.data.prelim.isinrevisionstate)
      if (
        this.data.prelim.status == "created" ||
        this.data.prelim.status == "requestdeclined"
      ) {
        this.isprelimEditable = true;
      } else {
        this.isprelimEditable = false;
      }
      if (this.data?.mode == "transaction") {
        this.isprelimEditable = false;
      }
      if (
        (((this.data.prelim.createdby.id == this.loggedInUser.id ||
          this.loggedInUser.id == this.data.prelim.createdby.parent.id ||
          this.loggedInUser.role.id == ROLES.ContractorAdmin || this.loggedInUser.role.id == ROLES.SuccessManager) &&
          (this.data.prelim.status == "created" ||
            this.data.prelim.status == "requestdeclined")) ||
          ((this.data.prelim.status == "outsourced" ||
            this.data.prelim.status == "requestaccepted" ||
            this.data.permit.status == "requestdeclined") &&
            !this.data.prelim.createdby.parent.ispaymentmodeprepay)) &&
        !this.data.prelim.isinrevisionstate
      ) {
        this.isprelimDeletable = true;
      } else {
        this.isprelimDeletable = false;
      }

      if (this.data?.mode == "transaction") {
        this.isprelimDeletable = false;
      }
      this.prelimAttachmentsGallery();
      //fetching guidelines 
      if (this.isUserAnalyst || this.isUserDesigner) {

        this.getGuidelines();
        //this.showguidelinelink = true;
      }
    }

    if (this.data.permit != null && this.data.permit != undefined) {
      this.permitAttachments = this.data.permit.attachments.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );

      this.permitarchitecturefile = this.data.permit.architecturaldesign.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );

      if (this.data.permit.isinrevisionstate) {
        this.isinrevision = true;
      }
      // if ((((this.data.permit.createdby.id == this.loggedInUser.id || this.loggedInUser.id == this.data.permit.createdby.parent.id || this.loggedInUser.role.id == ROLES.ContractorAdmin)  &&
      //    (this.data.permit.status == 'created' || this.data.permit.status == 'requestdeclined'))
      //    || ((this.data.permit.status == 'outsourced' || this.data.permit.status == 'requestaccepted')
      //     && !this.data.permit.createdby.parent.ispaymentmodeprepay))&& !this.data.permit.isinrevisionstate)
      if (
        this.data.permit.status == "created" ||
        this.data.permit.status == "requestdeclined"
      ) {
        this.ispermitEditable = true;
      } else {
        this.ispermitEditable = false;
      }
      if (this.data?.mode == "transaction") {
        this.ispermitEditable = false;
      }
      if (
        (((this.data.permit.createdby.id == this.loggedInUser.id ||
          this.loggedInUser.id == this.data.permit.createdby.parent.id ||
          this.loggedInUser.role.id == ROLES.ContractorAdmin || this.loggedInUser.role.id == ROLES.SuccessManager) &&
          (this.data.permit.status == "created" ||
            this.data.permit.status == "requestdeclined")) ||
          ((this.data.permit.status == "outsourced" ||
            this.data.permit.status == "requestaccepted" ||
            this.data.permit.status == "requestdeclined") &&
            !this.data.permit.createdby.parent.ispaymentmodeprepay)) &&
        !this.data.permit.isinrevisionstate
      ) {
        this.ispermitDeletable = true;
      } else {
        this.ispermitDeletable = false;
      }
      if (this.data?.mode == "transaction") {
        this.ispermitDeletable = false;
      }
      this.permitAttachmentsGallery();

      //fetching guidelines 
      if (this.isUserAnalyst || this.isUserDesigner) {
        this.getGuidelines();
        //this.showguidelinelink = true;
      }
    }
    if (this.data.pestamp != null && this.data.pestamp != undefined) {
      if (this.data.pestamp.isinrevisionstate) {
        this.isinrevision = true;
      }

      /**below condition are for PE stamp new field that is 3rd party stamping
      Wattmonk Super Admin, Contractor Super Admin and Contractor Admin can edit
      that field in New Section, On hold section and in stamping. Rest condition
      for disabling the fields are in PE Stamp request form. Here is only for to display edit icon
      along with above users TEAM HEAD and BD user can edit there design to.
      */
      if (
        ((this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
          this.loggedInUser.role.id == ROLES.Admin ||
          this.loggedInUser.role.id == ROLES.SuperAdmin ||
          this.loggedInUser.role.id == ROLES.ContractorAdmin ||
          this.loggedInUser.role.id == ROLES.SuccessManager ||
          this.loggedInUser.role.id == ROLES.PESuperAdmin ||
          (this.loggedInUser.parent.id ==
            this.data.pestamp.createdby.parent.id &&
            this.data.pestamp.status == "created")) &&
          (this.data.pestamp.status == "created" ||
            this.data.pestamp.status == "assigned" ||
            this.data.pestamp.status == "declined" ||
            this.data.pestamp.status == "outsourced" ||
            this.data.pestamp.status == "accepted" ||
            this.data.pestamp.status == "pesuperadminassigned")) ||
        (this.loggedInUser.parent.id == this.data.pestamp.createdby.parent.id &&
          (this.data.pestamp.status == "created" ||
            this.data.pestamp.status == "declined"))
      ) {
        this.ispestampEditable = true;
      } else {
        this.ispestampEditable = false;
      }
      if (this.data?.mode == "transaction") {
        this.ispestampEditable = false;
      }

      if (
        ((this.data.pestamp.createdby.id == this.loggedInUser.id ||
          this.loggedInUser.id == this.data.pestamp.createdby.parent.id ||
          this.loggedInUser.role.id == ROLES.ContractorAdmin || this.loggedInUser.role.id == ROLES.SuccessManager) &&
          (this.data.pestamp.status == "created" ||
            this.data.pestamp.status == "requestdeclined")) ||
        ((this.data.pestamp.status == "outsourced" ||
          this.data.pestamp.status == "accepted") &&
          !this.data.pestamp.createdby.parent.ispaymentmodeprepay)
      ) {
        if (this.data.pestamp.propertytype == "commercial") {
          this.workinghours.setValidators([
            Validators.required,
            Validators.min(1),
          ]);
        }
      }

      if (
        ((this.data.pestamp.createdby.id == this.loggedInUser.id ||
          this.loggedInUser.id == this.data.pestamp.createdby.parent.id ||
          this.loggedInUser.role.id == ROLES.ContractorAdmin || this.loggedInUser.role.id == ROLES.SuccessManager) &&
          (this.data.pestamp.status == "created" ||
            this.data.pestamp.status == "requestdeclined")) ||
        this.data.pestamp.status == "outsourced" ||
        (this.data.pestamp.status == "accepted" && !this.isPesuperadmin) ||
        (this.data.pestamp.status == "declined" &&
          !this.data.pestamp.createdby.parent.ispaymentmodeprepay)
      ) {
        this.ispestampDeletable = true;
      } else {
        this.ispestampDeletable = false;
      }
      if (this.data?.mode == "transaction") {
        this.ispestampDeletable = false;
      }
      this.data.pestamp.onholdpestamp.forEach((res) => {
        // console.log(res);
        if (res.file.length) {
          this.isOnholdAttachments = true;
        }
      });
    }
    if (this.data.survey != null && this.data.survey != undefined) {
      if (
        (this.data.survey.createdby.id == this.loggedInUser.id &&
          this.data.survey.status == "created") ||
        (this.data.survey.createdby.role.id == ROLES.Surveyor &&
          this.data.survey.status == "assigned")
      ) {
        this.issurveyEditable = true;
      } else {
        this.issurveyEditable = false;
      }

      if (
        (this.data.survey.createdby.id == this.loggedInUser.id &&
          this.data.survey.status == "created") ||
        (this.data.survey.createdby.role.id == ROLES.Surveyor &&
          this.data.survey.status == "assigned")
      ) {
        this.issurveyDeletable = true;
      } else {
        this.issurveyDeletable = false;
      }
    }

    if (this.data.pestamp != null || this.pestamp != undefined) {
      this.roofphotos = this.data.pestamp.roofphotos.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.atticphotos = this.data.pestamp.atticphotos.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.pestamproofimagesGallery();
    }

    if (this.data.survey != null || this.data.survey != undefined) {
      this.mspimages = this.data.survey.mspimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );

      this.utilitymeterimages = this.data.survey.utilitymeterimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.pvinverterimages = this.data.survey.pvinverterimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.pvmeterimages = this.data.survey.pvmeterimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.acdisconnectimages = this.data.survey.acdisconnectimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.roofimages = this.data.survey.roofimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.roofdimensionimages = this.data.survey.roofdimensionimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.obstaclesimages = this.data.survey.obstaclesimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.obstaclesdimensionsimages =
        this.data.survey.obstaclesdimensionsimages.map(
          (item) =>
            new ImageItem({ src: item.url, thumb: item.url, name: item.name })
        );
      this.atticimages = this.data.survey.atticimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.appliancesimages = this.data.survey.appliancesimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.groundimages = this.data.survey.groundimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.solarpanelsimages = this.data.survey.solarpanelsimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.existingsubpanelimages = this.data.survey.existingsubpanelimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );

      const utilitybillfront = [];
      utilitybillfront.push(this.data.survey.utilitybillfront);
      if (this.data.survey.utilitybillfront != null) {
        this.utilitybillfront = utilitybillfront.map(
          (item) =>
            new ImageItem({ src: item.url, thumb: item.url, name: item.name })
        );
      }

      const utilitybillback = [];
      utilitybillback.push(this.data.survey.utilitybillback);
      if (this.data.survey.utilitybillback != null) {
        this.utilitybillback = utilitybillback.map(
          (item) =>
            new ImageItem({ src: item.url, thumb: item.url, name: item.name })
        );
      }
      this.mspimagesGallery();

    }

  }
  ngAfterViewInit(): void {
    if (this.data.permit != null && (this.data.permit.status == "designassigned" || this.data.permit.status == "reviewassigned")) {

      //console.log("data.permit 2", data.permit.checklistcriteria.length);
      this.clientchecklist = this.db.object(
        FIREBASE_DB_CONSTANTS.KEYWORD + this.data.permit.creatorparentid
      );
      this.clientchecklistdata = this.clientchecklist.valueChanges();
      this.clientchecklistdata.subscribe(
        (res) => {
          console.log("data:", res.guidelinesseenby);
          if (this.isUserAnalyst || this.isUserDesigner) {
            this.Guidelineseenby = res.guidelinesseenby;
            if (res.guidelinesseenby.includes(this.loggedInUser.id)) {
              this.showGuidelineNew = false;
              this.changeDetectorRef.detectChanges()
            }
            else {
              this.showGuidelineNew = true;
              this.changeDetectorRef.detectChanges()
            }
          }

          if (res.guidelinesupdated && (this.data.permit.status == "designassigned" || this.data.prelim.status == "reviewassigned")) {
            this.designService.getDesignDetails(this.data.permit.id).subscribe(response => {
              // console.log(response)
              // this.designerCritera = response.guidelines;
              this.data.permit.guidelines = response.guidelines;
              this.changeDetectorRef.detectChanges();
            })


          }

          if (res.checklistupdated && (this.data.permit.status == "designassigned" || this.data.prelim.status == "reviewassigned")) {
            const dialogRef = this.dialog.open(Checklistupdateddialog, {
              width: "35%",
              disableClose: true,
              data: { isDataUpdated: false }

            });

            dialogRef.afterClosed().subscribe((result) => {
              if (result.isDataUpdated) {
                this.designService.getDesignDetails(this.data.permit.id).subscribe(response => {
                  // console.log(response)
                  this.designerCritera = response.checklistcriteria;
                  this.data.permit.checklistcriteria = response.checklistcriteria;
                  this.changeDetectorRef.detectChanges();
                });
              }
            });
          }
        });
    }

    if (this.data.prelim != null && (this.data.prelim.status == "designassigned" || this.data.prelim.status == "reviewassigned")) {

      //console.log("data.permit 2", data.permit.checklistcriteria.length);
      this.clientchecklist = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + this.data.prelim.creatorparentid);
      this.clientchecklistdata = this.clientchecklist.valueChanges();
      this.clientchecklistdata.subscribe(
        (res) => {
          if (this.isUserAnalyst || this.isUserDesigner) {
            this.Guidelineseenby = res.guidelinesseenby;
            if (res.guidelinesseenby.includes(this.loggedInUser.id)) {
              this.showGuidelineNew = false;
              this.changeDetectorRef.detectChanges()
            }
            else {
              this.showGuidelineNew = true;
              this.changeDetectorRef.detectChanges()
            }
          }
          if (res.guidelinesupdated && (this.data.prelim.status == "designassigned" || this.data.prelim.status == "reviewassigned")) {
            this.designService.getDesignDetails(this.data.permit.id).subscribe(response => {
              // console.log(response)
              // this.designerCritera = response.guidelines;
              this.data.permit.guidelines = response.guidelines;
              this.changeDetectorRef.detectChanges();
            })


          }
          if (res.checklistupdated && (this.data.prelim.status == "designassigned" || this.data.prelim.status == "reviewassigned")) {
            const dialogRef = this.dialog.open(Checklistupdateddialog, {
              width: "35%",
              disableClose: true,
              data: { isDataUpdated: false }

            });

            dialogRef.afterClosed().subscribe((result) => {
              if (result.isDataUpdated) {
                this.designService.getDesignDetails(this.data.prelim.id).subscribe(response => {
                  this.prelimCriteria = response.checklistcriteria
                  this.data.prelim.checklistcriteria = response.checklistcriteria;
                  this.changeDetectorRef.detectChanges();
                })
              }
            });
          }
        }
      )
    }
  }
  prelimAttachmentsGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("prelimAttachments");
    lightboxGalleryRef.load(this.prelimAttachments);
    this.prelimArchitectureGallery();
  }

  prelimArchitectureGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("prelimarchitecturefile");
    lightboxGalleryRef.load(this.prelimarchitecturefile);
    this.pestampatticimagesGallery();
  }

  permitAttachmentsGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("permitAttachments");
    lightboxGalleryRef.load(this.permitAttachments);
    this.permitArchitectureGallery();
  }

  permitArchitectureGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("permitarchitecturefile");
    lightboxGalleryRef.load(this.permitarchitecturefile);
    this.pestampatticimagesGallery();
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

  mspimagesGallery(): void {
    this.gallery.ref().load(this.mspimages);
    this.utilitymeterimagesGallery();
  }

  utilitymeterimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("utilitymeterimages");
    lightboxGalleryRef.load(this.utilitymeterimages);
    this.pvinverterimagesGallery();
  }
  pvinverterimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("pvinverterimages");
    lightboxGalleryRef.load(this.pvinverterimages);
    this.pvmeterimagesGallery();
  }
  pvmeterimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("pvmeterimages");
    lightboxGalleryRef.load(this.pvmeterimages);
    this.acdisconnectimagesGallery();
  }
  acdisconnectimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("acdisconnectimages");
    lightboxGalleryRef.load(this.acdisconnectimages);
    this.roofimagesGallery();
  }
  roofimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("roofimages");
    lightboxGalleryRef.load(this.roofimages);
    this.roofdimensionimagesGallery();
  }
  roofdimensionimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("roofdimensionimages");
    lightboxGalleryRef.load(this.roofdimensionimages);
    this.obstaclesimagesGallery();
  }
  obstaclesimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("obstaclesimages");
    lightboxGalleryRef.load(this.obstaclesimages);
    this.obstaclesdimensionsimagesGallery();
  }
  obstaclesdimensionsimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("obstaclesdimensionsimages");
    lightboxGalleryRef.load(this.obstaclesdimensionsimages);
    this.atticimagesGallery();
  }
  atticimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("atticimages");
    lightboxGalleryRef.load(this.atticimages);
    this.appliancesimagesGallery();
  }
  appliancesimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("appliancesimages");
    lightboxGalleryRef.load(this.appliancesimages);
    this.groundimagesGallery();
  }
  groundimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("groundimages");
    lightboxGalleryRef.load(this.groundimages);
    this.solarpanelsimagesGallery();
  }
  solarpanelsimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("solarpanelsimages");
    lightboxGalleryRef.load(this.solarpanelsimages);
    this.existingsubpanelimagesGallery();
  }
  existingsubpanelimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("existingsubpanelimages");
    lightboxGalleryRef.load(this.existingsubpanelimages);
    this.utilitybillfrontGallery();
  }
  utilitybillfrontGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("utilitybillfront");
    lightboxGalleryRef.load(this.utilitybillfront);
    this.utilitybillbackGallery();
  }
  utilitybillbackGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("utilitybillback");
    lightboxGalleryRef.load(this.utilitybillback);
  }

  onCloseClick(): void {
    this.data.permit = null;
    this.dialogRef.close(this.data);

    // const snackbarRef = this._snackBar.openFromComponent(ConfirmationsnackbarComponent, {
    //   data: { "message": " Data will be lost do you want to continue " +
    //   this.data.design.address.toUpperCase() + " ?", "positive": "Yes", "negative": "No" }
    // });
  }

  onEditClick(): void {
    if (this.isprelimEditable == true) {
      this.data.triggerPrelimEditEvent = true;
    } else if (this.ispermitEditable == true) {
      this.data.triggerPermitEditEvent = true;
    } else if (this.ispestampEditable == true) {
      this.data.triggerPestampEditEvent = true;
    } else if (this.issurveyEditable == true) {
      this.data.triggerSurveyEditEvent = true;
    }
    this.dialogRef.close(this.data);
  }

  onDeleteClick(): void {
    if (this.isprelimDeletable == true) {
      this.deleteprelimDesign();
    } else if (this.ispermitDeletable == true) {
      this.deletePermitDesign();
    } else if (this.ispestampDeletable == true) {
      this.deletePestamp();
    } else if (this.issurveyDeletable == true) {
      this.deleteSurvey();
    }
  }

  onChatClick(): void {
    this.data.triggerChatEvent = true;
    this.dialogRef.close(this.data);
  }

  onActivityClick(): void {
    this.data.triggerActivity = true;
    this.dialogRef.close(this.data);
  }

  deleteprelimDesign(): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message:
            "Are you sure you want to delete design request for location " +
            this.data.prelim.address.toUpperCase() +
            " ?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      const chatid = this.data.prelim.chatid;
      this.designService.deleteDesign("" + this.data.prelim.id).subscribe(
        () => {
          const GUID = chatid;

          CometChat.deleteGroup(GUID).then(
            () => {
              this.notifyService.showSuccess(
                "Design request for " +
                this.data.prelim.address +
                " has been removed successfully.",
                "Success"
              );
              this.data.triggerDeleteEvent = true;
              this.data.refreshDashboard = false;
              this.data.triggerPrelimEditEvent = false;
              this.dialogRef.close(this.data);
            },
            () => {
              this.notifyService.showSuccess(
                "Design request for " +
                this.data.prelim.address +
                " has been removed successfully.",
                "Success"
              );
              this.data.triggerDeleteEvent = true;
              this.data.refreshDashboard = false;
              this.data.triggerPrelimEditEvent = false;
              this.dialogRef.close(this.data);
            }
          );
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }

  deletePermitDesign(): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message:
            "Are you sure you want to delete design request for location " +
            this.data.permit.address.toUpperCase() +
            " ?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      const chatid = this.data.permit.chatid;
      this.designService.deleteDesign("" + this.data.permit.id).subscribe(
        () => {
          const GUID = chatid;

          CometChat.deleteGroup(GUID).then(
            () => {
              this.notifyService.showSuccess(
                "Design request for " +
                this.data.permit.address +
                " has been removed successfully.",
                "Success"
              );
              this.data.triggerDeleteEvent = true;
              this.data.refreshDashboard = false;
              this.data.triggerPermitEditEvent = false;
              this.dialogRef.close(this.data);
            },
            () => {
              this.notifyService.showSuccess(
                "Design request for " +
                this.data.permit.address +
                " has been removed successfully.",
                "Success"
              );
              this.data.triggerDeleteEvent = true;
              this.data.refreshDashboard = false;
              this.data.triggerPermitEditEvent = false;
              this.dialogRef.close(this.data);
            }
          );
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }
  deleteSurvey(): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message:
            "Are you sure you want to delete survey request for location " +
            this.data.survey.address.toUpperCase() +
            " ?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.surveyService.deleteSurvey("" + this.data.survey.id).subscribe(
        () => {
          this.loaderService.hide();
          this.notifyService.showSuccess(
            "Survey request for " +
            this.data.survey.address +
            " has been removed successfully.",
            "Success"
          );
          this.data.refreshDashboard = true;
          this.data.triggerSurveyEditEvent = false;
          this.dialogRef.close(this.data);
        },
        (error) => {
          this.loaderService.hide();
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }
  deletePestamp(): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message:
            "Are you sure you want to delete pestamp request for name " +
            this.data.pestamp.personname.toUpperCase() +
            " ?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      const chatid = this.data.pestamp.id;
      this.pestampService.deletePestamp("" + this.data.pestamp.id).subscribe(
        () => {
          CometChat.deleteGroup(chatid.toString()).then(
            () => {
              this.notifyService.showSuccess(
                "PE Stamp request  " +
                this.data.pestamp.personname +
                " has been deleted successfully.",
                "Success"
              );
              this.data.triggerDeleteEvent = true;
              this.data.refreshDashboard = false;
              this.data.triggerPestampEditEvent = false;
              this.dialogRef.close(this.data);
            },
            () => {
              this.notifyService.showSuccess(
                "PE Stamp request  " +
                this.data.pestamp.personname +
                " has been deleted successfully.",
                "Success"
              );
              this.data.triggerDeleteEvent = true;
              this.data.refreshDashboard = false;
              this.data.triggerPestampEditEvent = false;
              this.dialogRef.close(this.data);
            }
          );
        },
        () => {
          this.notifyService.showError(
            "Something went wrong. Please try again.",
            "Error"
          );
        }
      );
    });
  }

  tabChangeEvent(selectedTab): void {
    this.data.selectedtab = selectedTab;
    this.changeDetectorRef.detectChanges();
  }

  // fillinDynamicData(records: Design[]): Design[] {
  //   records.forEach((element) => {
  //     element = this.fillinDynamicDataForSingleRecord(element);
  //   });
  //   this.eventEmitterService.onConversationItemSelected(0);
  //   return records;
  // }

  // fillinDynamicDataForSingleRecord(element: Design): Design {
  //   element.designcurrentstatus = this.genericService.getDesignStatusName(
  //     element.status
  //   );
  //   if (element.status != "delivered") {
  //     element.isoverdue = this.genericService.isDatePassed(
  //       element.expecteddeliverydate
  //     );
  //   } else {
  //     element.isoverdue = false;
  //   }
  //   element.lateby = this.genericService.getTheLatebyString(
  //     element.expecteddeliverydate
  //   );
  //   element.recordupdatedon = this.genericService.formatDateInTimeAgo(
  //     element.updated_at
  //   );
  //   element.formattedjobtype = this.genericService.getJobTypeName(
  //     element.jobtype
  //   );
  //   if (
  //     element.requesttype == "permit" &&
  //     this.loggedInUser.minpermitdesignaccess
  //   ) {
  //     element.isrecordcomplete = true;
  //   } else {
  //     if (element.requesttype == "permit" && element.jobtype != "battery") {
  //       if (
  //         element.designgeneralinformation != null &&
  //         element.electricalinformation != null &&
  //         element.electricalslocation != null &&
  //         element.structuralinformations.length > 0
  //       ) {
  //         element.isrecordcomplete = true;
  //       }
  //     } else if (
  //       element.requesttype == "permit" &&
  //       element.jobtype == "battery"
  //     ) {
  //       if (
  //         element.designgeneralinformation != null &&
  //         element.electricalinformation != null &&
  //         element.electricalslocation != null
  //       ) {
  //         element.isrecordcomplete = true;
  //       }
  //     }
  //   }

  //   //Setting acceptance timer
  //   if (element.status == "outsourced") {
  //     if (element.requesttype == "permit") {
  //       const acceptancedate = new Date(element.designacceptancestarttime);
  //       element.designacceptanceremainingtime =
  //         this.genericService.getRemainingTime(acceptancedate.toString());
  //     } else {
  //       const acceptancedate = new Date(element.designacceptancestarttime);
  //       element.designacceptanceremainingtime =
  //         this.genericService.getRemainingTime(acceptancedate.toString());
  //     }

  //     if (element.designacceptanceremainingtime == "0h : 0m") {
  //       element.isoverdue = true;
  //     }
  //   }

  //   //Setting design timer
  //   if (
  //     element.status == "designassigned" ||
  //     element.status == "designcompleted"
  //   ) {
  //     if (element.requesttype == "permit") {
  //       const acceptancedate = new Date(element.designstarttime);
  //       acceptancedate.setHours(acceptancedate.getHours() + 6);
  //       element.designremainingtime = this.genericService.getRemainingTime(
  //         acceptancedate.toString()
  //       );
  //     } else {
  //       const acceptancedate = new Date(element.designstarttime);
  //       acceptancedate.setHours(acceptancedate.getHours() + 2);
  //       element.designremainingtime = this.genericService.getRemainingTime(
  //         acceptancedate.toString()
  //       );
  //     }
  //     if (element.designremainingtime == "0h : 0m") {
  //       element.isoverdue = true;
  //     }
  //   }

  //   //Setting review timer
  //   if (
  //     element.status == "reviewassigned" ||
  //     element.status == "reviewpassed" ||
  //     element.status == "reviewfailed"
  //   ) {
  //     const reviewdate;
  //     if (element.requesttype == "permit") {
  //       reviewdate = new Date(element.reviewstarttime);
  //       reviewdate.setHours(reviewdate.getHours() + 2);
  //       element.reviewremainingtime = this.genericService.getRemainingTime(
  //         reviewdate.toString()
  //       );
  //     } else {
  //       reviewdate = new Date(element.reviewstarttime);
  //       reviewdate.setMinutes(reviewdate.getMinutes() + 15);
  //       element.reviewremainingtime = this.genericService.getRemainingTime(
  //         reviewdate.toString()
  //       );
  //     }
  //     if (element.reviewremainingtime == "0h : 0m") {
  //       element.isoverdue = true;
  //     }
  //   }

  //   //Code to fetch unread message count
  //   CometChat.getUnreadMessageCountForGroup(element.chatid).then(
  //     (array) => {
  //       if (array[element.chatid] != undefined) {
  //         element.unreadmessagecount = array[element.chatid];
  //         this.changeDetectorRef.detectChanges();
  //       } else {
  //         element.unreadmessagecount = 0;
  //         this.changeDetectorRef.detectChanges();
  //       }
  //     },
  //     (error) => { }
  //   );

  //   return element;
  // }
  wrapURLs(text) {
    const url_pattern =
      /(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}\-\x{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?/gi;
    return text.replace(url_pattern, function (url) {
      const protocol_pattern = /^(?:(?:https?|ftp):\/\/)/i;
      const href = protocol_pattern.test(url) ? url : "http://" + url;
      return '<a href="' + href + '" target="_blank">' + url + "</a>";
    });
  }

  getErrorMessage(
    control: FormControl
  ): string | string | string | string | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    } else if (control == this.workinghours) {
      return this.workinghours.hasError("pattern")
        ? "Minimum hours required should be 1"
        : "zero value is not accepted";
    } else if (control == this.inverterscountPermit) {
      return this.inverterscountPermit.hasError("pattern")
        ? " Please enter a valid inverters count number only."
        : "inverters count should be of min. 1 and max. 7 characters.";
    } else if (control == this.modulecountPermit) {
      return this.modulecountPermit.hasError("pattern")
        ? " Please enter a valid inverters count number only."
        : "inverters count should be of min. 1 and max. 7 characters.";
    } else if (control == this.inverterscount) {
      return this.inverterscount.hasError("pattern")
        ? " Please enter a valid inverters count number only."
        : "inverters count should be of min. 1 and max. 7 characters.";
    }
    // if (control.hasError("pattern")) {
    //   console.log('error  here in 0 not ')
    //   return "Working hour must be grether than 0"

    // }
  }

  //prelim Design

  onPrelimSelect(event): void {
    const filename = event.addedFiles[0].type;
    this.extension = filename.split("/").pop();
    this.isPrelimDesignSelected = true;
    this.prelimfiles.push(...event.addedFiles);
    const parts = this.prelimfiles[0].name.split(".");
    this.filetype = parts[parts.length - 1];
  }

  onPrelimRemove(): void {
    this.prelimfiles.splice(0, 1);
    this.isPrelimDesignSelected = false;
  }
  uploadPrelimDesign() {
    var fillcriteria = 0;
    if (this.loggedInUser.role.name == "Designer") {
      this.prelimCriteria.map(item => {
        if ((item.commented && !item.feedback) || (item.feedback && !item.commented)) {
          fillcriteria += 1;
        }
        else {
          fillcriteria -= 1;
        }
      })
      fillcriteria == this.prelimCriteria.length ? this.checklistChecked = true : this.checklistChecked = false;
      if (this.checklistChecked) {
        if (this.prelimfiles.length > 0) {
          this.displayerror = false;
          this.isLoading = true;
          this.loadingmessage = "Uploading sales proposal design";
          this.commonService
            .uploadFile(
              this.data.prelim.id,
              "designs/" + this.data.prelim.id + "/prelim",
              this.prelimfiles[0],
              "prelimdesign",
              "design"
            )
            .subscribe(
              () => {
                // if (this.isselfupdateprelim) {
                //   this.prelimreportDesignReviewSuccess();
                // } else {
                if (this.data.prelim.status == 'reviewfailed') {
                  this.prelimreassignDesignForQC();
                } else {
                  this.prelimupdateDesignCompletion();
                }
                // }
              },
              error => {
                this.notifyService.showError(
                  error,
                  "Error"
                );
              }
            );
        } else {
          this.notifyService.showError("Please check all the fields", "Error")
          this.displayerror = true;
        }
      } else {
        this.notifyService.showError("Please check all the fields or enter the comments", "Error")
      }
    }
    /* if (this.prelimfiles.length > 0) {
       this.displayerror = false;
       this.isLoading = true;
       this.loadingmessage = "Uploading sales proposal design";
       this.commonService
         .uploadFile(
           this.data.prelim.id,
           "designs/" + this.data.prelim.id + "/prelim",
           this.prelimfiles[0],
           "prelimdesign",
           "design"
         )
         .subscribe(
           () => {
             if (this.isselfupdateprelim) {
               this.prelimreportDesignReviewSuccess();
             } else {
               if (this.data.prelim.status == "reviewfailed") {
                 this.prelimreassignDesignForQC();
               } else {
                 this.prelimupdateDesignCompletion();
               }
             }
           },
           (error) => {
             this.notifyService.showError(error, "Error");
           }
         );
     } else {
       this.displayerror = true;
     }*/
  }

  uploadprelimselfupdatefile() {
    this.displayerror = false;
    this.isLoading = true;
    this.loadingmessage = "Uploading sales proposal design";
    this.commonService
      .uploadFile(
        this.data.prelim.id,
        "designs/" + this.data.prelim.id + "/prelim",
        this.prelimfiles[0],
        "prelimdesign",
        "design"
      )
      .subscribe(
        () => {
          this.prelimreportDesignReviewSuccess();
        }, (error) => {
          this.notifyService.showError(error, "Error");
        })

  }

  prelimreassignDesignForQC(): void {
    this.countdownservice.stopTimer();
    const cdate = Date.now();
    this.designenddatetime = cdate;
    const postData = {
      status: "reviewassigned",
      designstarttime: this.designstartdatetime,
      designendtime: this.designenddatetime,
      comments: this.designcomments.value,
      reviewstarttime: Date.now(),
      reviewassignedto: this.data.prelim.reviewassignedto.id,
      taskoverdue: this.checkTimerConditions()
    };

    this.designService.assignreview(this.data.prelim.id, postData).subscribe(
      () => {
        if (this.data?.job) {
          this.updateJobTime();
        }
        else {
          this.isLoading = false;
          this.notifyService.showSuccess(
            "Design has been uploaded successfully.",
            "Success"
          );
          this.data.refreshDashboard = true;
          this.data.triggerPrelimEditEvent = false;
          this.dialogRef.close(this.data);
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  prelimupdateDesignCompletion(): void {
    this.countdownservice.stopTimer();
    const cdate = Date.now();
    this.designenddatetime = cdate;
    const postData = {
      status: "designcompleted",
      designstarttime: this.designstartdatetime,
      designendtime: this.designenddatetime,
      comments: this.designcomments.value,
      solarmake: this.modulemake.value,
      solarmodel: this.modulemodel.value,
      invertermake: this.invertermake.value,
      invertermodel: this.invertermodel.value,
      taskoverdue: this.checkTimerConditions()
    };

    this.designService
      .completedbydesigner(this.data.prelim.id, postData)
      .subscribe(
        () => {
          console.log(this.data.job)
          if (this.data.job) {
            console.log(this.data.job)
            this.updateJobTime();
          }
          else {
            this.isLoading = false;
            this.notifyService.showSuccess(
              "Design has been uploaded successfully.",
              "Success"
            );
            this.data.refreshDashboard = true;
            this.data.triggerPrelimEditEvent = false;
            this.dialogRef.close(this.data);
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  prelimreportDesignReviewFailure() {
    var fillcriteria = 0;
    if (this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.SuperAdmin || this.loggedInUser.role.id == ROLES.Admin || (this.loggedInUser.role.id === ROLES.TeamHead && this.loggedInUser.parent.id == 232)) {
      this.prelimCriteria.map(item => {
        if ((item.analystcomment && !item.feedback) || (item.feedback && !item.analystcomment)) {
          fillcriteria += 1;
        }
        else {
          fillcriteria -= 1;
        }
      })
      fillcriteria == this.prelimCriteria.length ? this.checklistChecked = true : this.checklistChecked = false;
      if (this.checklistChecked) {
        this.displayerror = false
        if (this.reviewissues.value.length > 0) {
          this.isLoading = true;
          //  this.loaderService.show();
          this.countdownservice.stopTimer();
          let cdate = Date.now();
          this.reviewenddatetime = cdate;
          const postData = {
            status: "reviewfailed",
            reviewissues: this.reviewissues.value,
            reviewstarttime: this.reviewstartdatetime,
            reviewendtime: this.reviewenddatetime,
            taskoverdue: this.checkTimerConditions()
          };

          this.designService
            .designfailedbyanalyst(this.data.prelim.id, postData)
            .subscribe(
              () => {
                if (this.data.job) {
                  this.updateJobTime();
                }
                else {
                  this.notifyService.showSuccess(
                    "Design status has been updated successfully.",
                    "Success"
                  );
                  this.data.refreshDashboard = true;
                  this.data.triggerPrelimEditEvent = false;
                  this.dialogRef.close(this.data);
                  //this.isLoad = false;
                  // this.loaderService.hide();
                  this.isLoading = false;
                }
              },
              (error) => {
                this.notifyService.showError(error, "Error");
                this.isLoading = false;
              }
            );
        } else {
          this.reviewissuesinvalid = true;
          this.changeDetectorRef.detectChanges();
        }
      }
    }
  }

  prelimupdateDesignReviewSuccess() {
    var fillcriteria = 0;
    if (this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.SuperAdmin || this.loggedInUser.role.id == ROLES.Admin || (this.loggedInUser.role.id === ROLES.TeamHead && this.loggedInUser.parent.id == 232)) {
      this.prelimCriteria.map(item => {

        if (item.analystcomment !== null || item.feedback) {
          fillcriteria += 1;
        }
        else {
          fillcriteria -= 1;
        }
      })
      fillcriteria == this.prelimCriteria.length ? this.checklistChecked = true : this.checklistChecked = false;

      if (this.checklistChecked) {
        if (this.isselfupdateprelim && this.prelimfiles.length > 0) {
          // this.uploadPrelimDesign();
          this.uploadprelimselfupdatefile();
        } else if (this.isselfupdateprelim && this.prelimfiles.length == 0) {
          this.displayerror = true;
        } else {
          this.prelimreportDesignReviewSuccess();
        }
      }
      else {
        this.displayerror = true
        this.notifyService.showError("Please check all the fields or enter the comments", "Error")
      }
    }
    /*if (this.isselfupdateprelim && this.prelimfiles.length > 0) {
      this.uploadPrelimDesign();
    } else if (this.isselfupdateprelim && this.prelimfiles.length == 0) {
      this.displayerror = true;
    } else {
      this.prelimreportDesignReviewSuccess();
    }*/
  }

  prelimreportDesignReviewSuccess(): void {
    // this.isLoad = true;
    //  this.loaderService.show();
    this.isLoading = true;
    this.countdownservice.stopTimer();
    const cdate = Date.now();
    this.reviewenddatetime = cdate;
    const postData = {
      status: "reviewpassed",
      reviewissues: this.reviewissues.value,
      reviewstarttime: this.reviewstartdatetime,
      reviewendtime: this.reviewenddatetime,
      taskoverdue: this.checkTimerConditions()
    };

    this.designService
      .designpassedbyanalyst(this.data.prelim.id, postData)
      .subscribe(
        () => {
          console.log(this.data)
          if (this.data.job) {
            this.updateJobTime();
          }
          else {
            this.notifyService.showSuccess(
              "Design status has been updated successfully.",
              "Success"
            );
            this.data.refreshDashboard = true;
            this.data.triggerPrelimEditEvent = false;
            this.dialogRef.close(this.data);
            // this.isLoad = false;
            //  this.loaderService.hide();
            this.isLoading = false;
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
          this.isLoading = false;
        }
      );
  }

  prelimselfUpdateCancelClick(): void {
    this.isselfupdateprelim = false;
    this.prelimfiles.splice(0, this.prelimfiles.length);
  }
  //Permit Design
  onSelect(event): void {
    const filename = event.addedFiles[0].type;
    this.extension = filename.split("/").pop();

    this.isPermitDesignSelected = true;
    this.permitfiles.push(...event.addedFiles);
    const parts = this.permitfiles[0].name.split(".");
    this.filetype = parts[parts.length - 1];
  }
  onRemove(): void {
    this.permitfiles.splice(0, 1);
    this.isPermitDesignSelected = false;
  }

  reportDesignReviewSuccess(): void {
    //this.isLoad = true;
    //this.loaderService.show();
    this.isLoading = true;
    this.countdownservice.stopTimer();
    const cdate = Date.now();
    this.reviewenddatetime = cdate;
    const postData = {
      status: "reviewpassed",
      reviewissues: this.reviewissues.value,
      reviewstarttime: this.reviewstartdatetime,
      reviewendtime: this.reviewenddatetime,
      taskoverdue: this.checkTimerConditions()
    };

    this.designService
      .designpassedbyanalyst(this.data.permit.id, postData)
      .subscribe(
        () => {
          if (this.data.job) {
            this.updateJobTime();
          }
          else {
            this.notifyService.showSuccess(
              "Design status has been updated successfully.",
              "Success"
            );

            this.data.refreshDashboard = true;
            this.data.triggerPermitEditEvent = false;
            this.dialogRef.close(this.data);
            this.isLoading = false;
            // this.isLoad = false;
            // this.loaderService.hide();
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
          this.isLoading = false;
        }
      );
  }

  updateDesignCompletion(): void {
    this.countdownservice.stopTimer();
    const cdate = Date.now();
    this.designenddatetime = cdate;
    const postData = {
      status: "designcompleted",
      designstarttime: this.designstartdatetime,
      designendtime: this.designenddatetime,
      comments: this.designcomments.value,
      taskoverdue: this.checkTimerConditions()
    };

    this.designService
      .completedbydesigner(this.data.permit.id, postData)
      .subscribe(
        (response) => {
          if (this.data.job) {
            this.updateJobTime();
          }
          else {
            this.notifyService.showSuccess(
              "Design has been uploaded successfully.",
              "Success"
            );
            this.data.refreshDashboard = true;
            this.data.triggerPermitEditEvent = false;
            this.data.permit = response;
            this.dialogRef.close(this.data);
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }
  // uploadPermitDesign() {
  //   const fillcriteria = 0;
  //   if(this.loggedInUser.role.name == "Designer"){
  //     this.designerCritera.map(item =>{
  //       if((item.designercomment && !item.designerfeedback) || (item.designerfeedback && !item.designercomment)){
  //         fillcriteria +=1;
  //       }
  //       else{
  //         fillcriteria -=1;
  //       }
  //     })
  //     fillcriteria == this.designerCritera.length ? this.checklistChecked = true : this.checklistChecked = false;
  //     if(this.checklistChecked){
  //     if(this.permitfiles.length > 0 ){
  //       this.displayerror = false;
  //       this.isLoading = true;
  //       this.loadingmessage = "Uploading design file";
  //       this.commonService
  //         .uploadFile(
  //           this.data.permit.id,
  //           "designs/" + this.data.permit.id + "/permit",
  //           this.permitfiles[0],
  //           "permitdesign",
  //           "design"
  //         )
  //         .subscribe(
  //           response => {
  //             if(this.isselfupdatepermit){
  //               this.reportDesignReviewSuccess();
  //             }else{
  //             if(this.data.permit.status == 'reviewfailed'){
  //               this.reassignDesignForQC();
  //             }else{
  //               this.updateDesignCompletion();
  //             }
  //           }
  //           },
  //           error => {
  //             this.notifyService.showError(
  //               error,
  //               "Error"
  //             );
  //           }
  //         );
  //     }else{
  //       this.notifyService.showError("Please check all the fields","Error")
  //       this.displayerror = true;
  //     }
  //     }else{
  //       this.notifyService.showError("Please check all the fields or enter the comments","Error")
  //     }
  //   }
  // }

  uploadPermitDesign(): void {
    let fillcriteria = 0;
    if (this.loggedInUser.role.name == "Designer") {
      this.designerCritera.map((item) => {
        if (
          (item.commented && !item.feedback) ||
          (item.feedback && !item.commented)
        ) {
          fillcriteria += 1;
        } else {
          fillcriteria -= 1;
        }
      });
      if (fillcriteria == this.designerCritera.length) {
        this.checklistChecked = true;
      } else {
        this.checklistChecked = false;
      }

      if (this.checklistChecked) {
        if (this.permitfiles.length > 0) {
          this.displayerror = false;
          this.isLoading = true;
          this.loadingmessage = "Uploading design file";
          this.commonService
            .uploadFile(
              this.data.permit.id,
              "designs/" + this.data.permit.id + "/permit",
              this.permitfiles[0],
              "permitdesign",
              "design"
            )
            .subscribe(
              () => {
                // if (this.isselfupdatepermit) {
                //   this.reportDesignReviewSuccess();
                // } else {
                if (this.data.permit.status == "reviewfailed") {
                  this.reassignDesignForQC();
                } else {
                  this.updateDesignCompletion();
                }
                // }
              },
              (error) => {
                this.notifyService.showError(error, "Error");
              }
            );
        } else {
          this.notifyService.showError("Please check all the fields", "Error");
          this.displayerror = true;
        }
      } else {
        this.notifyService.showError(
          "Please check all the fields or enter the comments",
          "Error"
        );
      }
    }
  }

  reassignDesignForQC(): void {
    this.countdownservice.stopTimer();
    const cdate = Date.now();
    this.designenddatetime = cdate;
    const postData = {
      status: "reviewassigned",
      designstarttime: this.designstartdatetime,
      designendtime: this.designenddatetime,
      comments: this.designcomments.value,
      reviewstarttime: Date.now(),
      reviewassignedto: this.data.permit?.reviewassignedto?.id,
      taskoverdue: this.checkTimerConditions()
    };

    this.designService.assignreview(this.data.permit.id, postData).subscribe(
      () => {
        if (this.data.job) {
          this.updateJobTime();
        }
        else {
          this.isLoading = false;
          this.notifyService.showSuccess(
            "Design has been uploaded successfully.",
            "Success"
          );
          this.data.refreshDashboard = true;
          this.data.triggerPermitEditEvent = false;
          this.dialogRef.close(this.data);
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.isLoading = false;
      }
    );
  }

  updateDesignReviewSuccess(): void {
    let fillcriteria = 0;
    if (
      this.loggedInUser.role.id == ROLES.Analyst ||
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      (this.loggedInUser.role.id === ROLES.TeamHead &&
        this.loggedInUser.parent.id == 232)
    ) {
      this.designerCritera.map((item) => {
        if (item.analystcomment != null || item.feedback) {
          fillcriteria += 1;
        } else {
          fillcriteria -= 1;
        }
      });
      if (fillcriteria == this.designerCritera.length) {
        this.checklistChecked = true;
      } else {
        this.checklistChecked = false;
      }

      if (this.checklistChecked) {
        this.displayerror = false;
        if (this.isselfupdatepermit && this.permitfiles.length > 0) {
          // this.uploadPermitDesign();
          this.displayerror = false;
          this.isLoading = true;
          this.loadingmessage = "Uploading design file";
          this.commonService
            .uploadFile(
              this.data.permit.id,
              "designs/" + this.data.permit.id + "/permit",
              this.permitfiles[0],
              "permitdesign",
              "design"
            )
            .subscribe(
              () => {
                // if (this.isselfupdatepermit) {
                this.reportDesignReviewSuccess();
                // } else {
                //   if (this.data.permit.status == 'reviewfailed') {
                //     this.reassignDesignForQC();
                //   } else {
                //     this.updateDesignCompletion();
                //   }
                // }
              },
              (error) => {
                this.notifyService.showError(error, "Error");
                this.isLoading = false;
              }
            );
        } else if (this.isselfupdatepermit && this.permitfiles.length == 0) {
          this.displayerror = true;
        } else {
          this.reportDesignReviewSuccess();
        }
      } else {
        this.displayerror = true;
        this.notifyService.showError(
          "Please check all the fields or enter the comments",
          "Error"
        );
      }
    }
  }
  selfUpdateCancelClick(): void {
    this.isselfupdatepermit = false;
    this.permitfiles.splice(0, this.permitfiles.length);
  }

  reportDesignReviewFailure(): void {
    let fillcriteria = 0;
    if (
      this.loggedInUser.role.id == ROLES.Analyst ||
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      (this.loggedInUser.role.id === ROLES.TeamHead &&
        this.loggedInUser.parent.id == 232)
    ) {
      this.designerCritera.map((item) => {
        if (
          (item.analystcomment && !item.feedback) ||
          (item.feedback && !item.analystcomment)
        ) {
          fillcriteria += 1;
        } else {
          fillcriteria -= 1;
        }
      });
      if (fillcriteria == this.designerCritera.length) {
        this.checklistChecked = true;
      } else {
        this.checklistChecked = false;
      }

      if (this.checklistChecked) {
        this.displayerror = false;
        if (this.reviewissues.value.length > 0) {
          this.isLoading = true;
          //  this.loaderService.show();
          this.countdownservice.stopTimer();
          const cdate = Date.now();
          this.reviewenddatetime = cdate;
          const postData = {
            status: "reviewfailed",
            reviewissues: this.reviewissues.value,
            reviewstarttime: this.reviewstartdatetime,
            reviewendtime: this.reviewenddatetime,
            taskoverdue: this.checkTimerConditions()
          };

          this.designService
            .designfailedbyanalyst(this.data.permit.id, postData)
            .subscribe(
              () => {
                if (this.data.job) {
                  this.updateJobTime();
                }
                else {
                  this.notifyService.showSuccess(
                    "Design status has been updated successfully.",
                    "Success"
                  );
                  this.isLoading = false;
                  this.data.refreshDashboard = true;
                  this.data.triggerPermitEditEvent = false;
                  this.dialogRef.close(this.data);
                }
              },
              (error) => {
                this.notifyService.showError(error, "Error");
                this.isLoading = false;
              }
            );
        } else {
          this.reviewissuesinvalid = true;
          this.changeDetectorRef.detectChanges();
        }
      } else {
        this.displayerror = true;
        this.notifyService.showError(
          "Please check all the fields or enter the comments",
          "Error"
        );
      }
    }
  }

  // reportDesignReviewFailure() {
  //   const fillcriteria = 0;
  //   if(this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.SuperAdmin || this.loggedInUser.role.id == ROLES.Admin){
  //     this.designerCritera.map(item =>{
  //       if((item.analystcomment && !item.analystfeedback) || (item.analystfeedback && !item.analystcomment)){
  //         fillcriteria +=1;
  //       }
  //       else{
  //         fillcriteria -=1;
  //       }
  //     })
  //     fillcriteria == this.designerCritera.length ? this.checklistChecked = true : this.checklistChecked = false;
  //     if(this.checklistChecked){
  //       this.displayerror = false
  //       if (this.reviewissues.value.length>0) {
  //         this.countdownservice.stopTimer();
  //         const cdate = Date.now();
  //         this.reviewenddatetime = cdate;
  //         const postData = {
  //           status: "reviewfailed",
  //           reviewissues: this.reviewissues.value,
  //           reviewstarttime: this.reviewstartdatetime,
  //           reviewendtime: this.reviewenddatetime
  //         };

  //         this.designService
  //           .editDesign(
  //             this.data.permit.id,
  //             postData
  //           )
  //           .subscribe(
  //             response => {
  //               this.notifyService.showSuccess("Design status has been updated successfully.", "Success");
  //               this.data.refreshDashboard = true;
  //               this.data.triggerPermitEditEvent = false;
  //               this.dialogRef.close(this.data);
  //             },
  //             error => {
  //               this.notifyService.showError(
  //                 error,
  //                 "Error"
  //               );
  //             }
  //           );
  //       } else {
  //         this.reviewissuesinvalid =true;
  //         this.changeDetectorRef.detectChanges()
  //       }
  //     }else{
  //       this.displayerror = true
  //       this.notifyService.showError("Please check all the fields or enter the comments", "Error")
  //     }
  //   }
  // }

  //pestamp
  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onSelectPestamp(event): void {
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      this.isPestampSelcted = true;
      const extension = element.name.substring(element.name.lastIndexOf("."));

      const mimetype = this.genericService.getMimetype(extension);
      // window.console.log(extension, mimetype);
      const data = new Blob([element], {
        type: mimetype,
      });

      const replacedfile = new File([data], element.name, { type: mimetype });

      this.pestampfiles.push(replacedfile);
      this.changeDetectorRef.detectChanges();
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onRemovePestamp(i): void {
    this.pestampfiles.splice(i, 1);
    this.isPestampSelcted = false;
  }

  // uploadPestamp(index) {

  //   if(this.data.pestamp.stampedfiles.length>0){
  //     this.data.pestamp.stampedfiles.forEach(element=>{
  //      this.pestampService.deleteStampedfile(element.id).subscribe(res=>{

  //      })
  //     })
  //     this.uploadnewpestamp(0);
  //   }
  //   else{
  //     this.uploadnewpestamp(0);
  //   }

  // }

  uploadnewpestamp(index): void {
    if (this.data.pestamp.stampedfiles.length > 0) {
      this.data.pestamp.stampedfiles.forEach((element) => {
        this.pestampService.deleteStampedfile(element.id).subscribe(() => {
          // do nothing.
        });
      });
    }


    /* if (this.data.pestamp.type == 'both') {
      if (this.loggedInUser.peengineertype == 'electrical') {
        path = "electricalstampedfiles"
      }
      else {
        path = "structuralstampedfiles"
      }
    }
    else {
      path = "stampedfiles"
    } */
    const path = "stampedfiles";
    if (this.pestampfiles.length > 0) {
      this.displayerror = false;
      this.changeDetectorRef.detectChanges();
    }
    if (this.pestampfiles.length > 0 && this.detailPestampDialogForm.valid) {
      // if () {
      this.displayerror = false;
      this.isLoading = true;
      this.loadingmessage = "Uploading stamped file";
      this.commonService
        .uploadFile(
          this.data.pestamp.id,
          "pestamp/" + this.data.pestamp.id,
          this.pestampfiles[index],
          path,
          "pestamp"
        )
        .subscribe(
          () => {
            if (index < this.pestampfiles.length - 1) {
              const newindex = index + 1;
              this.uploadnewpestamp(newindex);
            } else {
              this.updatePestampCompletion();
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.displayerror = true;
      this.detailPestampDialogForm.markAllAsTouched();
    }
  }
  updatePestampCompletion(): void {
    this.countdownservice.stopTimer();
    const cdate = Date.now();
    this.designenddatetime = cdate;

    let postData;
    if (this.data.pestamp.propertytype == "commercial") {
      /*  if (this.data.pestamp.type == 'both') {
         if (this.loggedInUser.peengineertype == 'electrical') {
           postData = {
             status: "completed",
             pestampstarttime: this.designstartdatetime,
             pestampendtime: this.designenddatetime,
             comments: this.designcomments.value,
             electricalworkinghours:  Number(this.workinghours.value),
             iselectricalstampeduploaded: true
           }
         }
         else {
           postData = {
             status: "completed",
             pestampstarttime: this.designstartdatetime,
             pestampendtime: this.designenddatetime,
             comments: this.designcomments.value,
             structuralworkinghours:  Number(this.workinghours.value),
             isstructuralstampeduploaded: true
           }
         } */

      postData = {
        status: "delivered",
        pestampstarttime: this.designstartdatetime,
        pestampendtime: this.designenddatetime,
        comments: this.designcomments.value,
        workinghours: Number(this.workinghours.value),
        deliverycharges: this.deliverycharges.value,
      };
    } else {
      /*  if (this.data.pestamp.type == 'both') {
         if (this.loggedInUser.peengineertype == 'electrical') {
           postData = {
             status: "completed",
             pestampstarttime: this.designstartdatetime,
             pestampendtime: this.designenddatetime,
             comments: this.designcomments.value,
             iselectricalstampeduploaded: true
           }
         }
         else {
           postData = {
             status: "completed",
             pestampstarttime: this.designstartdatetime,
             pestampendtime: this.designenddatetime,
             comments: this.designcomments.value,
             isstructuralstampeduploaded: true
           }
         }
       }
       else {
         postData = {
           status: "completed",
           pestampstarttime: this.designstartdatetime,
           pestampendtime: this.designenddatetime,
           comments: this.designcomments.value,
         }
       } */
      postData = {
        status: "delivered",
        pestampstarttime: this.designstartdatetime,
        pestampendtime: this.designenddatetime,
        comments: this.designcomments.value,
        deliverycharges: this.deliverycharges.value,
      };
    }

    this.pestampService
      .deliverPestamp(this.data.pestamp.id, postData)
      .subscribe(
        () => {
          this.isLoading = false;
          this.notifyService.showSuccess(
            "PE stamped file has been uploaded and delivered successfully.",
            "Success"
          );
          this.data.refreshDashboard = true;
          this.data.triggerPestampEditEvent = false;
          this.dialogRef.close(this.data);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  ShowCommentCriteria(item): void {
    this.anyalistchecklistcomments.setValue("");
    this.checklistcomments.setValue("");
    this.selectedCriteria = item;
    this.isciteriacommentshow = true;
    // if (this.loggedInUser.role.name == "Analyst") {
    //   this.anyalistchecklistcomments.patchValue(item.analystcomment);
    // }

    // if (this.loggedInUser.role.name == "Designer") {
    //   this.checklistcomments.patchValue(item.designercomment)
    // }
  }


  onSaveCritetriaPrelimChecklist(item, i) {
    this.selectedCriteria = item;
    this.selectedCriteria.completedby = this.loggedInUser.role.type;
    // let designercomment;
    //  console.log(this.selectedCriteria)
    //  console.log(this.designerCritera);
    this.prelimCriteria.forEach(ele => {
      if (ele.id == this.selectedCriteria.id) {
        // console.log(ele)
        this.designercomment = ele.comments;
        //console.log(designercomment)
      }
    })
    if (this.loggedInUser.role.id == ROLES.Designer) {
      if (this.selectedCriteria.feedback) {
        this.selectedCriteria.designercomment = "";
        this.isciteriacommentshow = false;
        this.updateCriteriaPrelimChecklist(i);
      }
      else if (!this.selectedCriteria.feedback && this.checklistcomments.value.trim().length > 0) {
        this.selectedCriteria.designercomment = this.checklistcomments.value
        this.updateCriteriaPrelimChecklist(i)
        this.isciteriacommentshow = false
      }

      else {
        // console.log("uncheck")
        if (!this.selectedCriteria.feedback && this.designercomment.length) {
          this.updateCriteriaPrelimChecklist(i);
        }
        // this.notifyService.showError("Please check the criteria or give a comment", "Error")
      }
    }
    if (this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.SuperAdmin || this.loggedInUser.role.id == ROLES.Admin || this.loggedInUser.role.id == ROLES.TeamHead) {
      if (this.selectedCriteria.feedback) {
        this.selectedCriteria.analystcomment = "";
        this.isciteriacommentshow = false;
        this.updateCriteriaPrelimChecklist(i)
      }
      else if (!this.selectedCriteria.feedback && this.anyalistchecklistcomments.value.trim().length > 0) {
        this.selectedCriteria.analystcomment = this.anyalistchecklistcomments.value
        this.updateCriteriaPrelimChecklist(i)
        this.isciteriacommentshow = false
      }
      else {

        // this.notifyService.showError("Please check the criteria or give a comment", "Error");
      }
    }



    this.checklistcomments.patchValue(" ");
    this.anyalistchecklistcomments.patchValue("");
  }




  onSaveCritetria(item, i) {
    this.selectedCriteria = item;
    this.selectedCriteria.completedby = this.loggedInUser.role.type;
    // const designercomment;
    //  console.log(this.selectedCriteria)
    //  console.log(this.designerCritera);
    this.designerCritera.forEach((ele) => {
      if (ele.id == this.selectedCriteria.id) {
        // console.log(ele)
        this.designercomment = ele.comments;
        //console.log(designercomment)
      }
    });
    if (this.loggedInUser.role.id == ROLES.Designer) {
      if (this.selectedCriteria.feedback) {
        this.selectedCriteria.designercomment = "";
        this.isciteriacommentshow = false;
        this.updateCriteria(i);
      } else if (
        !this.selectedCriteria.feedback &&
        this.checklistcomments.value.trim().length > 0
      ) {
        this.selectedCriteria.designercomment = this.checklistcomments.value;
        this.updateCriteria(i);
        this.isciteriacommentshow = false;
      } else {
        // console.log("uncheck")
        if (!this.selectedCriteria.feedback && this.designercomment.length) {
          this.updateCriteria(i);
        }
        // this.notifyService.showError("Please check the criteria or give a comment", "Error")
      }
    }
    if (
      this.loggedInUser.role.id == ROLES.Analyst ||
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      this.loggedInUser.role.id == ROLES.TeamHead
    ) {
      if (this.selectedCriteria.feedback) {
        this.selectedCriteria.analystcomment = "";
        this.isciteriacommentshow = false;
        this.updateCriteria(i);
      } else if (
        !this.selectedCriteria.feedback &&
        this.anyalistchecklistcomments.value.trim().length > 0
      ) {
        this.selectedCriteria.analystcomment =
          this.anyalistchecklistcomments.value;
        this.updateCriteria(i);
        this.isciteriacommentshow = false;
      } else {
        // this.notifyService.showError("Please check the criteria or give a comment", "Error");
      }
    }

    this.checklistcomments.patchValue(" ");
    this.anyalistchecklistcomments.patchValue("");
  }

  onCancelCriteria(): void {
    this.checklistcomments.patchValue(" ");
    this.anyalistchecklistcomments.patchValue("");
    this.isciteriacommentshow = false;
    this.isEditChecklist = false;
  }

  updateCriteria(index?): void {
    if (this.loggedInUser.role.id == ROLES.Designer) {
      //  const commented;

      if (
        this.selectedCriteria.designercomment ||
        (!this.selectedCriteria.feedback && this.designercomment.length)
      ) {
        // commented=true;
        this.postData = {
          comment: this.selectedCriteria.designercomment,
          feedback: this.selectedCriteria.feedback,
          designerid: this.loggedInUser.id,
          completedby: "designer",
          commented: true,
        };
      } else {
        //  commented=false;
        this.postData = {
          comment: this.selectedCriteria.designercomment,
          feedback: this.selectedCriteria.feedback,
          designerid: this.loggedInUser.id,
          completedby: "designer",
          commented: false,
        };
      }
    }
    if (
      this.loggedInUser.role.id == ROLES.Analyst ||
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      this.loggedInUser.role.id === ROLES.TeamHead
    ) {
      let commented;
      if (this.selectedCriteria.designercomment) {
        commented = true;
      } else {
        commented = false;
      }
      this.postData = {
        comment: this.selectedCriteria.analystcomment,
        feedback: this.selectedCriteria.feedback,
        analystid: this.loggedInUser.id,
        completedby: "qcinspector",
        commented: commented,
      };
    }

    this.commonService
      .updateChecklistCriteria(this.selectedCriteria.id, this.postData)
      .subscribe((response) => {
        // this.designerCritera.comments= [];
        this.latestcommenteditdelete = true;
        // console.log("key",this.latestcommenteditdelete)
        this.designerCritera[index].comments = response.comments;
        this.designerCritera[index].commented = response.commented;
        this.changeDetectorRef.detectChanges();
      });
  }


  updateCriteriaPrelimChecklist(index?) {
    if (this.loggedInUser.role.id == ROLES.Designer) {
      //  let commented;

      if (this.selectedCriteria.designercomment || (!this.selectedCriteria.feedback && this.designercomment.length)) {
        // commented=true;
        this.postData = {
          comment: this.selectedCriteria.designercomment,
          feedback: this.selectedCriteria.feedback,
          designerid: this.loggedInUser.id,
          completedby: "designer",
          commented: true
        }
      }
      else {
        //  commented=false;
        this.postData = {
          comment: this.selectedCriteria.designercomment,
          feedback: this.selectedCriteria.feedback,
          designerid: this.loggedInUser.id,
          completedby: "designer",
          commented: false
        }
      }


    }
    if (this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.SuperAdmin || this.loggedInUser.role.id == ROLES.Admin || this.loggedInUser.role.id === ROLES.TeamHead) {
      let commented;
      if (this.selectedCriteria.designercomment) {
        commented = true;
      }
      else {
        commented = false;
      }
      this.postData = {
        comment: this.selectedCriteria.analystcomment,
        feedback: this.selectedCriteria.feedback,
        analystid: this.loggedInUser.id,
        completedby: "qcinspector",
        commented: commented
      }
    }

    this.commonService.updateChecklistCriteria(this.selectedCriteria.id, this.postData).subscribe(
      response => {

        this.latestcommenteditdelete = true;

        this.prelimCriteria[index].comments = response.comments;
        this.prelimCriteria[index].commented = response.commented;
        this.changeDetectorRef.detectChanges();
      }
    )

  }

  editChecklistComment(comment, qualitycheckindex, commentindex, item) {
    this.selectedCriteria = item;
    this.isEditChecklist = true;
    this.commentId = comment.id;
    this.qualitycheckindex = qualitycheckindex;
    this.commentindex = commentindex;
    this.checklistcomments.patchValue(comment.message);
  }

  editChecklistCommentForAnalyst(
    comment,
    qualitycheckindex,
    commentindex,
    item
  ): void {
    this.selectedCriteria = item;
    this.isEditChecklist = true;
    this.commentId = comment.id;
    this.qualitycheckindex = qualitycheckindex;
    this.commentindex = commentindex;
    this.anyalistchecklistcomments.patchValue(comment.message);
  }

  onEditComments(): void {
    let postData;
    if (this.loggedInUser.role.id == ROLES.Designer) {
      postData = {
        message: this.checklistcomments.value,
      };
    } else if (
      this.loggedInUser.role.id == ROLES.Analyst ||
      this.loggedInUser.role.id == ROLES.Admin ||
      this.loggedInUser.role.id === ROLES.SuperAdmin ||
      this.loggedInUser.role.id === ROLES.TeamHead
    ) {
      postData = {
        message: this.anyalistchecklistcomments.value,
      };
    }
    this.commonService
      .editComments(this.commentId, postData)
      .subscribe((res) => {
        this.isEditChecklist = false;
        this.isciteriacommentshow = false;
        this.designerCritera[this.qualitycheckindex].comments[
          this.commentindex
        ] = res;
      });
  }

  deleteChecklistComment(comment, qualitycheckindex, commentindex): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message: "Are you sure you want to delete comment ?",
          positive: "Yes",
          negative: "No",
        },
      }
    );
    snackbarRef.onAction().subscribe(() => {
      this.commonService.deleteComment(comment.id).subscribe(() => {
        this.designerCritera[qualitycheckindex].comments.splice(commentindex, 1);
        this.loaderService.hide();
      })
    });
  }



  onEditCommentsPrelimChecklist() {
    let postData;
    if (this.loggedInUser.role.id == ROLES.Designer) {
      postData = {
        message: this.checklistcomments.value
      }
    }
    else if (this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.Admin || this.loggedInUser.role.id === ROLES.SuperAdmin || this.loggedInUser.role.id === ROLES.TeamHead) {
      postData = {
        message: this.anyalistchecklistcomments.value
      }
    }
    this.commonService.editComments(this.commentId, postData).subscribe((res) => {
      this.isEditChecklist = false;
      this.isciteriacommentshow = false;
      this.prelimCriteria[this.qualitycheckindex].comments[this.commentindex] = res;
    })
  }

  deleteChecklistCommentPrelimChecklist(comment, qualitycheckindex, commentindex) {
    const snackbarRef = this._snackBar.openFromComponent(ConfirmationsnackbarComponent, {
      data: { "message": "Are you sure you want to delete comment ?", "positive": "Yes", "negative": "No" }
    });
    snackbarRef.onAction().subscribe(() => {
      this.commonService.deleteComment(comment.id).subscribe(() => {
        this.prelimCriteria[qualitycheckindex].comments.splice(commentindex, 1);
        this.loaderService.hide();
      })
    });
  }

  private _filterModuleMake(name: string): ModuleMake[] {
    const filterValue = name.toLowerCase();

    return this.modulemakes.filter(
      (modulemake) => modulemake.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  private _filterModuleModel(name: string): ModuleModel[] {
    const filterValue = name.toLowerCase();

    return this.modulemodels.filter(
      (modulemodel) => modulemodel.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  // private _filterInverterMake(name: string): InverterMake[] {
  //   const filterValue = name.toLowerCase();

  //   return this.invertermakes.filter(
  //     (invertermake) =>
  //       invertermake.name.toLowerCase().indexOf(filterValue) != -1
  //   );
  // }

  // private _filterInverterModel(name: string): InverterModel[] {
  //   const filterValue = name.toLowerCase();

  //   return this.invertermodels.filter(
  //     (invertermodel) =>
  //       invertermodel.name.toLowerCase().indexOf(filterValue) != -1
  //   );
  // }

  private _filterModuleMakePermit(name: string): ModuleMake[] {
    const filterValue = name.toLowerCase();

    return this.modulemakesPermit.filter(
      (modulemake) => modulemake.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  private _filterModuleModelPermit(name: string): ModuleModel[] {
    const filterValue = name.toLowerCase();

    return this.modulemodelsPermit.filter(
      (modulemodel) => modulemodel.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  // private _filterInverterMakePermit(name: string): InverterMake[] {
  //   const filterValue = name.toLowerCase();

  //   return this.invertermakesPermit.filter(
  //     (invertermake) =>
  //       invertermake.name.toLowerCase().indexOf(filterValue) != -1
  //   );
  // }

  // private _filterInverterModelPermit(name: string): InverterModel[] {
  //   const filterValue = name.toLowerCase();

  //   return this.invertermodelsPermit.filter(
  //     (invertermodel) =>
  //       invertermodel.name.toLowerCase().indexOf(filterValue) != -1
  //   );
  // }

  fetchModuleMakesData(): void {
    this.commonService.getModuleMakesData().subscribe(
      (response) => {
        this.modulemakes = response;
        this.filteredModuleMakes = this.modulemakefilter.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) =>
            name ? this._filterModuleMake(name) : this.modulemakes.slice()
          )
        );
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchModuleModelsData(_event: any, make): void {
    // this.addDesignDialogForm.patchValue({ modulemodel: " " })
    // this.modulemake.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")]);
    // if (_event.isUserInput) {
    this.modulemodels = [];
    this.setselectedsolarmake = make.id;
    this.commonService.getModuleModelsData(make.id).subscribe(
      (response) => {
        this.modulemodels = response;
        this.filteredModuleModels = this.modulemodelfilter.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) =>
            name ? this._filterModuleModel(name) : this.modulemodels.slice()
          )
        );
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
    // }
  }

  setmodulemodelid(modulemodel) {
    this.setselectedsolarmodel = modulemodel.id;
  }

  fetchInverterMakesData() {
    this.commonService.getInverterMakesData().subscribe(
      response => {
        this.invertermakes = response;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  loadInverterModelsData(make, i) {
    this.commonService.getInverterModelsData(make.id).subscribe(
      response => {
        this.data.prelim.designinverters[i].invertermodels = response;
        this.changeDetectorRef.detectChanges()
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  fetchInverterModelsData(make, i) {
    this.data.prelim.designinverters[i].invertermake = make.id;
    this.commonService.getInverterModelsData(make.id).subscribe(
      response => {
        this.data.prelim.designinverters[i].invertermodels = response;
        if (this.prelimModelsForm.get("invertermake" + Number(i + 1)).value == 'None') {
          this.prelimModelsForm.get("inverterscount" + Number(i + 1)).patchValue("0");
          this.prelimModelsForm.get("inverterscount" + Number(i + 1)).setValidators([Validators.required,
          Validators.min(0),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),]);
          this.prelimModelsForm.get("inverterscount" + Number(i + 1)).updateValueAndValidity();
        }
        else {
          this.prelimModelsForm.get("inverterscount" + Number(i + 1)).setValidators([Validators.required,
          Validators.min(1),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),]);
          this.prelimModelsForm.get("inverterscount" + Number(i + 1)).updateValueAndValidity();
        }
        this.changeDetectorRef.detectChanges()
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }


  fetchModuleMakesDataPermit(): void {
    this.commonService.getModuleMakesData().subscribe(
      (response) => {
        this.modulemakesPermit = response;
        this.filteredModuleMakesPermit =
          this.modulemakefilterPermit.valueChanges.pipe(
            startWith(""),
            map((value) => (typeof value === "string" ? value : value.name)),
            map((name) =>
              name
                ? this._filterModuleMakePermit(name)
                : this.modulemakesPermit.slice()
            )
          );
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchModuleModelsDataPermit(_event: any, make): void {
    // this.addDesignDialogForm.patchValue({ modulemodel: " " })
    // this.modulemakePermit.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")]);
    // if (_event.isUserInput) {
    this.modulemodels = [];
    this.setselectedsolarmakepermit = make.value
    this.commonService.getModuleModelsData(make.id).subscribe(
      (response) => {
        this.modulemodelsPermit = response;
        this.filteredModuleModelsPermit =
          this.modulemodelfilterPermit.valueChanges.pipe(
            startWith(""),
            map((value) => (typeof value === "string" ? value : value.name)),
            map((name) =>
              name
                ? this._filterModuleModelPermit(name)
                : this.modulemodelsPermit.slice()
            )
          );
        if (this.modulemakePermit.value == "None") {
          this.modulecountPermit.setValue("0");
          this.modulecountPermit.setValidators([
            Validators.required,
            Validators.min(0),
            Validators.maxLength(7),
            Validators.pattern("^[0-9]{1,7}$"),
          ]);
          this.modulecountPermit.updateValueAndValidity();
        } else {
          this.modulecountPermit.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.maxLength(7),
            Validators.pattern("^[0-9]{1,7}$"),
          ]);
          this.modulecountPermit.updateValueAndValidity();
        }
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
    // }
  }

  setmodulemodelidpermit(modulemodel) {
    this.setselectedsolarmodelpermit = modulemodel.id;
  }

  fetchInverterMakesDataPermit() {
    this.commonService.getInverterMakesData().subscribe(
      response => {
        this.invertermakesPermit = response;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  loadInverterModelsDataPermit(make, i) {
    this.commonService.getInverterModelsData(make.id).subscribe(
      response => {
        this.data.permit.designinverters[i].invertermodels = response;
        this.changeDetectorRef.detectChanges()
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  fetchInverterModelsDataPermit(make, i) {
    this.data.permit.designinverters[i].invertermake = make.id;
    this.commonService.getInverterModelsData(make.id).subscribe(
      response => {
        this.data.permit.designinverters[i].invertermodels = response;
        if (this.permitModelsForm.get("invertermake" + Number(i + 1)).value == 'None') {
          this.permitModelsForm.get("inverterscount" + Number(i + 1)).patchValue("0");
          this.permitModelsForm.get("inverterscount" + Number(i + 1)).setValidators([Validators.required,
          Validators.min(0),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),]);
          this.permitModelsForm.get("inverterscount" + Number(i + 1)).updateValueAndValidity();
        }
        else {
          this.permitModelsForm.get("inverterscount" + Number(i + 1)).setValidators([Validators.required,
          Validators.min(1),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),]);
          this.permitModelsForm.get("inverterscount" + Number(i + 1)).updateValueAndValidity();
        }
        this.changeDetectorRef.detectChanges()
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  setPrelimInverterModelValue(_event: any, model, i) {
    this.data.prelim.designinverters[i].invertermodel = model.id;
    this.data.prelim.designinverters[i].isSaved = false;
    this.prelimModelsForm.get("invertermake" + Number(i + 1)).setValue(model.invertermake.id)
    this.prelimModelsForm.get("invertermodel" + Number(i + 1)).setValue(model.id)
  }
  setPrelimInverterscount(event, i) {
    this.data.prelim.designinverters[i].inverterscount = event.target.value
    this.prelimModelsForm.get("inverterscount" + Number(i + 1)).setValue(event.target.value)
  }
  setInverterModelValue(_event: any, model, i) {
    this.data.permit.designinverters[i].invertermodel = model.id;
    this.data.permit.designinverters[i].isSaved = false;
    this.permitModelsForm.get("invertermake" + Number(i + 1)).setValue(model.invertermake.id)
    this.permitModelsForm.get("invertermodel" + Number(i + 1)).setValue(model.id)
  }
  setInverterscount(event, i) {
    this.data.permit.designinverters[i].inverterscount = event.target.value
    this.permitModelsForm.get("inverterscount" + Number(i + 1)).setValue(event.target.value)
  }
  savemodels() {

    console.log(this.prelimModelsForm)
    if (this.prelimModelsForm.valid) {
      this.prelimdisplayerror = true;
      this.isLoading = true;
      this.loadingmessage = "Saving data";
      const postData = {
        solarmake: this.modulemake.value,
        solarmodel: this.modulemodel.value,
      };
      this.designService
        .editDesign(
          this.data.prelim.id,
          postData
        )
        .subscribe(
          () => {
            this.data.prelim.designinverters.forEach(element => {
              if (!element.isSaved) {
                let postData = {
                  invertermake: element.invertermake,
                  invertermodel: element.invertermodel,
                  inverterscount: element.inverterscount
                }
                this.designService.saveDesignInverters(element.id, postData).subscribe(res => {
                },
                  error => {
                    this.notifyService.showError(
                      error,
                      "Error"
                    );
                  })
              }
            });
            this.changeDetectorRef.detectChanges();
            this.isLoading = false;
            this.notifyService.showSuccess("Design has been updated successfully.", "Success");
            // this.data.refreshDashboard = true;
            // this.data.triggerPrelimEditEvent = false;
            // this.dialogRef.close(this.data);
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
          }
        );
    }
    else {
      this.prelimdisplayerror = false;
      this.prelimModelsForm.markAllAsTouched();
      this.changeDetectorRef.detectChanges();
    }
  }
  savepermitmodels() {
    console.log(this.permitModelsForm)
    if (this.permitModelsForm.valid) {
      this.isLoading = true;
      this.loadingmessage = "Saving data";
      const postData = {
        solarmake: this.modulemakePermit.value,
        solarmodel: this.modulemodelPermit.value,
      };
      this.designService
        .editDesign(
          this.data.permit.id,
          postData
        )
        .subscribe(
          () => {
            this.data.permit.designinverters.forEach(element => {
              if (!element.isSaved) {
                let postData = {
                  invertermake: element.invertermake,
                  invertermodel: element.invertermodel,
                  inverterscount: element.inverterscount
                }
                this.designService.saveDesignInverters(element.id, postData).subscribe(res => {
                },
                  error => {
                    this.notifyService.showError(
                      error,
                      "Error"
                    );
                  })
              }
            });
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showSuccess("Design has been updated successfully.", "Success");
            // this.data.refreshDashboard = true;
            // this.data.triggerPrelimEditEvent = false;
            // this.dialogRef.close(this.data);
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
          }
        );
    }
    else {
      this.permitdisplayerror = false;
      this.changeDetectorRef.detectChanges();
      this.permitModelsForm.markAllAsTouched();
      // console.log(this.permitModelsForm)
    }
  }
  searchinvertermodels(e) {
    this.searchTerm.name = e.target.value
  }

  openBottomSheet(resdata): void {
    this._bottomSheet.open(Guidelinesbottomsheet, {
      panelClass: 'matBottomSheetStyle',
      data: resdata
    });
  }

  getGuidelines(data?): void {
    // let id;
    /*if (this.showGuidelineNew) {
      this.Guidelineseenby.push(this.loggedInUser.id);
      this.clientchecklist.update({ guidelinesseenby: this.Guidelineseenby });
      this.showGuidelineNew = false
    }*/

    this.guidelineBadgeHidden = true;
    this.showguidelinelink = false;
    // id = this.data.prelim.createrparentid;

    if (this.data.prelim != undefined && Object.keys(this.data.prelim.guidelines).length != 0) {

      this.showguidelinelink = true;
      let tempguidelines = [];
      this.data.prelim.guidelines['checklistcriteria'].forEach(element => {
        tempguidelines.push({ name: element.criteria });
      });
      if (data != undefined) {
        this.openBottomSheet(tempguidelines);
        // this.showGuidelineNew = false;
        //this.changeDetectorRef.detectChanges();
      }
      if (this.data.prelim.guidelines['seenby'] != null) {
        this.tempdata = this.data.prelim.guidelines['seenby'];
        if (!this.data.prelim.guidelines['seenby'].includes(this.loggedInUser.id)) {

          this.tempdata.push(this.loggedInUser.id);
          this.postData = {
            seenby: this.tempdata
          }
          this.openBottomSheet(tempguidelines);
          this.showGuidelineNew = false;
          this.commonService.updateQualityCheckList(this.data.prelim.guidelines['id'], this.postData).subscribe(response => {
            //this.changeDetectorRef.detectChanges();
          })
          this.changeDetectorRef.detectChanges()
        } else {

          if (this.showGuidelineNew && data == 'GuidelinesLink') {
            this.Guidelineseenby.push(this.loggedInUser.id);
            this.clientchecklist.update({ guidelinesseenby: this.Guidelineseenby });
            this.showGuidelineNew = false;
          }
        }
      }
      else {
        this.openBottomSheet(tempguidelines);
        this.showGuidelineNew = false;
        this.tempdata.push(this.loggedInUser.id);
        this.postData = {
          seenby: this.tempdata
        }
        this.commonService.updateQualityCheckList(this.data.prelim.guidelines['id'], this.postData).subscribe(response => {
          // this.changeDetectorRef.detectChanges();
        })
        this.showGuidelineNew = false;
        this.changeDetectorRef.detectChanges()
      }
      //id = this.data.permit.createrparentid;
    }
    else if (this.data.permit != undefined && Object.keys(this.data.permit.guidelines).length != 0) {

      this.showguidelinelink = true;
      let tempguidelines = [];
      this.data.permit.guidelines['checklistcriteria'].forEach(element => {
        tempguidelines.push({ name: element.criteria });
      });
      if (data != undefined) {
        this.openBottomSheet(tempguidelines);
        // this.showGuidelineNew = false;
        //this.changeDetectorRef.detectChanges();
      }
      if (this.data.permit.guidelines['seenby'] != null) {
        if (!this.data.permit.guidelines['seenby'].includes(this.loggedInUser.id)) {
          this.tempdata = this.data.permit.guidelines['seenby'];
          this.tempdata.push(this.loggedInUser.id);
          this.postData = {
            seenby: this.tempdata
          }
          this.openBottomSheet(tempguidelines);
          this.commonService.updateQualityCheckList(this.data.permit.guidelines['id'], this.postData).subscribe(response => {
            //this.changeDetectorRef.detectChanges();
          })
          this.changeDetectorRef.detectChanges();
        } else {
          if (this.showGuidelineNew && data == 'GuidelinesLink') {
            this.Guidelineseenby.push(this.loggedInUser.id);
            this.clientchecklist.update({ guidelinesseenby: this.Guidelineseenby });
            this.showGuidelineNew = false;
          }
        }

      }
      else {
        this.openBottomSheet(tempguidelines);
        this.showGuidelineNew = false;
        this.tempdata.push(this.loggedInUser.id);
        this.postData = {
          seenby: this.tempdata
        }
        this.commonService.updateQualityCheckList(this.data.permit.guidelines['id'], this.postData).subscribe(response => {
          // this.changeDetectorRef.detectChanges();
        })
        this.changeDetectorRef.detectChanges();
      }
    }
    else {
      this.showguidelinelink = false;
      this.showGuidelineNew = false;
    }


  }

  downloadSingleFile(url) {
    this.isLoading = true;
    this.loadingmessage = "Downloading file";
    let filename = url?.data?.src?.substring(url?.data?.src?.lastIndexOf("/") + 1, url?.data?.src?.length);

    this.commonService.downloadFile(url?.data?.src).subscribe((res: any) => {
      this.isLoading = false;
      this.loadingmessage = "Saving data";
      const link = document.createElement("a");
      link.href = res.data;
      link.download = filename;

      link.click();
    })


  }

  OpenReassignDialog(data) {
    const dialogRef = this.dialog.open(AssignpeengineersComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false, pestamp: data, requesttype: data.type },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.refreshDashboard) {
        this.dialogRef.close(result);
      }
    });
  }

  updateJobTime() {
    let currenttime;
    currenttime = new Date().getTime();
    // let starttime;
    // let newtime;
    // let isdesignertimeexceeded: boolean = false;
    // let isanalysttimeexceeded: boolean = false;
    // let prelimdesigner = this.jobtime?.prelim_designer * 60;
    // let permitdesigner = this.jobtime?.permit_designer * 60;
    // let prelimanalyst = this.jobtime?.prelim_analyst * 60;
    // let permitanalyst = this.jobtime?.permit_analyst * 60;
    // starttime = new Date(this.data?.job?.starttime).getTime();
    // currenttime = new Date().getTime();
    // newtime = currenttime - starttime;

    // let sec: any = Math.floor(newtime / 1000);
    // // this.hour = Math.floor(sec / 3600);
    // // sec -= this.hour * 3600;
    // if ((sec > prelimdesigner || sec > permitdesigner) && (this.data?.prelim?.status == 'designassigned' || this.data?.prelim?.status == 'reviewfailed' || this.data?.permit?.status == 'designassigned' || this.data?.permit?.status == 'reviewfailed')) {
    //   isdesignertimeexceeded = true;
    // }
    // else if ((sec > prelimanalyst || sec > permitanalyst) && (this.data?.prelim?.status == 'reviewassigned' || this.data?.permit?.status == 'reviewassigned')) {
    //   isanalysttimeexceeded = true;
    // }
    // this.totalminutes = this.minutes;
    // let currenttime = new Date().getTime();
    let postData = {
      endtime: currenttime,
      taskstatus: "completed",
      // isdesignertimeexceeded: isdesignertimeexceeded,
      // isanalysttimeexceeded: isanalysttimeexceeded
    }
    this.designService.updateJobTime(this.data?.job?.id, postData).subscribe(() => {
      this.isLoading = false;
      if (this.isUserAnalyst) {
        this.notifyService.showSuccess(
          "Design status has been updated successfully.",
          "Success"
        );
      }
      else {
        this.notifyService.showSuccess(
          "Design has been uploaded successfully.",
          "Success"
        );
      }
      this.data.refreshDashboard = true;
      this.data.triggerPrelimEditEvent = false;
      this.dialogRef.close(this.data);
    })
  }

  checkTimerConditions() {
    let currenttime;
    let starttime;
    let newtime;
    let prelimdesigner = this.jobtime?.prelim_designer * 60;
    let permitdesigner = this.jobtime?.permit_designer * 60;
    let prelimanalyst = this.jobtime?.prelim_analyst * 60;
    let permitanalyst = this.jobtime?.permit_analyst * 60;
    starttime = new Date(this.data?.job?.starttime).getTime();
    currenttime = new Date().getTime();
    newtime = currenttime - starttime;

    let sec: any = Math.floor(newtime / 1000);
    // this.hour = Math.floor(sec / 3600);
    // sec -= this.hour * 3600;
    if (((sec > prelimdesigner || sec > permitdesigner) && (this.data?.prelim?.status == 'designassigned' || this.data?.prelim?.status == 'reviewfailed' || this.data?.permit?.status == 'designassigned' || this.data?.permit?.status == 'reviewfailed')) || (sec > prelimanalyst || sec > permitanalyst) && (this.data?.prelim?.status == 'reviewassigned' || this.data?.permit?.status == 'reviewassigned')) {
      return true;
    }
    // else if ((sec > prelimanalyst || sec > permitanalyst) && (this.data?.prelim?.status == 'reviewassigned' || this.data?.permit?.status == 'reviewassigned')) {
    //   return true;
    // }
    else {
      return false;
    }
  }
}


@Component({
  selector: 'app-guidelinesbottomsheet',
  templateUrl: 'guidelinesbottomsheet.html',
})
export class Guidelinesbottomsheet {
  guidelines: any[] = [];
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any, private _bottomSheetRef: MatBottomSheetRef<Guidelinesbottomsheet>) {
    this.guidelines = data;
    //console.log("123", JSON.stringify(data));
    /*this.guidelines = [
      {name: 'test1'}, {name: 'test2'}, {name: 'test3'}, {name: 'test4'}
    ]*/


  }
  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
  close() {
    this._bottomSheetRef.dismiss();
  }
}
export interface ChecklistData {
  isDataUpdated: boolean;
}
@Component({
  selector: "checklistupdated-dialog",
  templateUrl: "checklistupdated-dialog.html",
})
export class Checklistupdateddialog implements OnInit {
  declinereason = new FormControl("", [Validators.required]);
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  loggedInUser;
  isLoading = false;
  constructor(
    public dialogRef: MatDialogRef<Checklistupdateddialog>,
    private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: ChecklistData
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
  }

  ngOnInit(): void {
    // do nothing.
  }
  onConfirmbutton(): void {
    this.data.isDataUpdated = true;
    this.dialogRef.close(this.data);
  }

}
