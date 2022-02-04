import { Location } from "@angular-material-extensions/google-maps-autocomplete";
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
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatOptionSelectionChange } from "@angular/material/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatRadioButton, MatRadioChange } from "@angular/material/radio";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CometChat } from "@cometchat-pro/chat";
import { Gallery, GalleryItem, ImageItem } from "@ngx-gallery/core";
import heic2any from "heic2any";
import * as moment from "moment";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { OrderpermitdesigndialogComponent } from "src/app/home/dashboard/permitdesign/orderpermitdesigndialog/orderpermitdesigndialog.component";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import {
  ADDRESSFORMAT,
  FIREBASE_DB_CONSTANTS,
  MAILFORMAT,
  NAME,
  ROLES
} from "src/app/_helpers";
import {
  Design,
  InverterMake,
  InverterModel,
  ModuleMake,
  ModuleModel,
  UploadedFile,
  User
} from "src/app/_models";
import { Ahj } from "src/app/_models/ahj";
import { Company } from "src/app/_models/company";
import { PrelimUtility } from "src/app/_models/prelimutility";
import { Probability } from "src/app/_models/probability";
import { Survey } from "src/app/_models/survey";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import PlaceResult = google.maps.places.PlaceResult;
const axios = require("axios").default;
export interface DesignFormData {
  isEditMode: boolean;
  isDataUpdated: boolean;
  generateAutocad: boolean;
  user: User;
  design: Design;
  isPermitmode: boolean;
  survey: Survey;
  prelimDesign: Design;
  isprelimmode: boolean;
  prelimData: Design;
  designRaisedbyWattmonk: boolean;
  customerpermit: Probability;
  isCustomer: boolean;
}

@Component({
  selector: "app-addminpermitdesigndialog",
  templateUrl: "./addminpermitdesigndialog.component.html",
  styleUrls: ["./addminpermitdesigndialog.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddminpermitdesigndialogComponent implements OnInit {
  @ViewChild("jobtype")
  nameField: MatRadioButton;
  defaultvalue = "-";
  min = 3;
  max = 3;
  selectedSiteLocation: Location;
  isoutsourced = false;
  appliedCoupan;

  getCompanies: Company[];
  companyList = [];
  filteredCompanies: Observable<User[]>;
  designCreatedBy;
  designCreatedByUserParent;

  modulemakes: ModuleMake[] = [];
  filteredModuleMakes: Observable<ModuleMake[]>;
  selectedModuleMakeID: number;

  modulemodels: ModuleModel[] = [];
  filteredModuleModels: Observable<ModuleModel[]>;
  selectedModuleModelID: number;

  invertermakes: InverterMake[] = [];
  filteredInverterMakes: Observable<InverterMake[]>;
  selectedInverterMakeID: number;

  invertermodels: InverterModel[] = [];
  filteredInverterModels: Observable<InverterModel[]>;
  selectedInverterModelID: number;

  utilites: PrelimUtility[] = [];
  filteredUtility: Observable<PrelimUtility[]>;
  selectedUtilityID: number;

  permitahj: Ahj[] = [];
  filteredAhj: Observable<Ahj[]>;
  selectedAHJ: number;

  isLoading = false;
  assigntowattmonk = false;
  loadingmessage = "Saving data";
  oldcommentid;

  permitAttachments: GalleryItem[];
  permitArchitecture: GalleryItem[];

  prioritytoggle = new FormControl("", []);
  company = new FormControl("", []);
  name = new FormControl("", [
    Validators.required,
    Validators.minLength(2),
    Validators.pattern(NAME),
  ]);
  email = new FormControl("", [
    Validators.pattern(MAILFORMAT),
  ]);
  phone = new FormControl("", [
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("^[0-9]{8,15}$"),
  ]);
  inverterscount = new FormControl("", [
    Validators.required,
    Validators.min(1),
    Validators.maxLength(7),
    Validators.pattern("^[0-9]{1,7}$"),
  ]);
  modulecount = new FormControl("", [
    Validators.required,
    Validators.min(1),
    Validators.maxLength(7),
    Validators.pattern("^[0-9]{1,7}$"),
  ]);
  modulemake = new FormControl("", [
    Validators.required,
    Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$"),
  ]);
  othermodulemake = new FormControl(null);
  modulemakefilter = new FormControl("");
  modulemodelfilter = new FormControl("");
  modulemodel = new FormControl("", [
    Validators.required,
    Validators.pattern(".*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
  ]);
  othermodulemodel = new FormControl(null);
  invertermake = new FormControl("", [
    Validators.required,
    Validators.pattern("^.*\\S.*[a-zA-Z-_ ]{2,}$"),
  ]);
  otherinvertermake = new FormControl(null);
  invertermakefilter = new FormControl("");
  invertermodel = new FormControl("", [
    Validators.required,
    Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
  ]);
  otherinvertermodel = new FormControl(null);
  invertermodelfilter = new FormControl("");
  address = new FormControl("", [
    Validators.required,
    Validators.pattern(ADDRESSFORMAT),
  ]);
  // monthlybill = new FormControl("", [
  //   Validators.required,
  //   Validators.min(1),
  //   Validators.pattern("^[0-9]+$")
  // ]);
  solarcapacity = new FormControl("", [
    Validators.required,
    Validators.min(1),
    Validators.maxLength(15),
  ]);
  newconstruction = new FormControl("", [Validators.required]);
  comments = new FormControl("", []);
  raiserequestreason = new FormControl("");
  rooftype = new FormControl("", []);
  jobtype = new FormControl("", [Validators.required]);
  mountingtype = new FormControl("", [Validators.required]);
  tiltgroundmount = new FormControl("", []);
  projecttype = new FormControl("", [Validators.required]);
  mpurequired = new FormControl("", [Validators.required]);

  utilityname = new FormControl("", [
    Validators.required,
    // Validators.pattern("^[a-z0-9A-Z+-_ & ([)/. {\\]}]{2,30}$"),
    Validators.pattern("^[a-zA-Z -']+"),
  ]);

  ahj = new FormControl(null, [
    Validators.pattern('^[a-zA-Z \-\']+'),
  ]);
  state = new FormControl("", [
    Validators.required,
    Validators.maxLength(100)
  ]);
  city = new FormControl("", [
    Validators.required,
    Validators.maxLength(100)
  ]);
  esiid = new FormControl(null);

  // pestampingondelivery = new FormControl(false, []);
  // modeofstamping = new FormControl("", []);
  // contactnumber = new FormControl("");
  // hardcopies = new FormControl("");

  // type = new FormControl("", []);
  // shippingaddress = new FormControl("");
  addDesignDialogForm: FormGroup;

  displayerror = true;
  formatted_address: string;
  postalcode: string;

  country: string;
  user: User;
  architecturalfiles: File[] = [];
  isFileUploaded = false;
  attachmentfiles: File[] = [];
  raiserequestattachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  israiserequestattachmentUploaded = false;
  raiseattachmentError = true;
  loggedInUser: User;
  isClient = false;
  paymenttype;
  aresitedetailsvalid = true;
  aremakedetailsvalid = true;
  aremountingdetailsvalid = true;
  issurveycompleted = false;
  isprelimcompleted = false;
  survey = null;
  prelimData = null;
  design = null;
  isdesigncompleted = false;

  latitude = null;
  longitude = null;

  senddirectlytowattmonk = false;
  newpermits: Observable<any>;
  newpermitsRef: AngularFireObject<any>;
  newpermitscount = 0;

  companynewpermits: Observable<any>;
  companynewpermitsRef: AngularFireObject<any>;
  companynewpermitscount = 0;
  finalAmountopay: any;
  slabname: any;
  slabdiscount: number;
  serviceamount: number;

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
  wattmonkadmins: User[] = [];
  sameemailconfirmed = null;

  servicecharges: AngularFireObject<any>;
  servicechargedata: Observable<any>;
  permitServiceCharge;
  amounttopay;
  invertermakevalue = '';
  isAddressSelected: boolean = false;
  teamheadroleid = 0;
  clientadmins;
  showextramodulemake: boolean = false;
  showextramodulemodel: boolean = false;
  showextrainvertermake: boolean = false;
  showextrainvertermodel: boolean = false;
  extra: boolean = false;
  bdroleid = 0;
  customerid: number;
  copiedcoupon: any;
  // pestampingondelivery=false

  numberOfInverters: any = [];
  searchTerm: any = { name: '' };
  placeholder = "Start typing here..."
  dataentry: boolean = false;
  addextrainverters = true;
  attachmenthoverIdx = -1;
  architecturehoverIdx = -1;

  limit = 10;
  skip = 0;
  scrolling: boolean = false;
  companyListlength;
  constructor(
    public dialogRef: MatDialogRef<AddminpermitdesigndialogComponent>,
    public dialog: MatDialog,
    public gallery: Gallery,
    private _snackBar: MatSnackBar,
    private notifyService: NotificationService,
    private commonService: CommonService,
    private designService: DesignService,
    public genericService: GenericService,
    private authService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private db: AngularFireDatabase,
    private changeDetector: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: DesignFormData
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
    // if (this.loggedInUser.parent.id == 232) {
    //   this.company.setValidators(Validators.required);
    // }
    if (
      this.loggedInUser.parent.id == 232 &&
      (this.loggedInUser.role.id == ROLES.SuperAdmin ||
        this.loggedInUser.role.id == ROLES.Admin ||
        this.loggedInUser.role.id == ROLES.TeamHead ||
        this.loggedInUser.role.id == ROLES.BD)
    ) {
      this.company.setValidators(Validators.required);
    }
    if (this.data.designRaisedbyWattmonk) {
      this.raiserequestreason.setValidators(Validators.required);
    }
    this.teamheadroleid = ROLES.TeamHead;
    this.bdroleid = ROLES.BD;

    //this.getCompanies = this.genericService.companies;
    this.addDesignDialogForm = new FormGroup({
      email: this.email,
      name: this.name,
      company: this.company,
      phone: this.phone,
      address: this.address,
      // monthlybill: this.monthlybill,
      modulemake: this.modulemake,
      modulemodel: this.modulemodel,
      modulecount: this.modulecount,
      rooftype: this.rooftype,
      jobtype: this.jobtype,
      projecttype: this.projecttype,
      newconstruction: this.newconstruction,
      comments: this.comments,
      mountingtype: this.mountingtype,
      tiltgroundmount: this.tiltgroundmount,
      prioritytoggle: this.prioritytoggle,
      mpurequired: this.mpurequired,
      state: this.state,
      city: this.city,
      solarcapacity: this.solarcapacity,
      utilityname: this.utilityname,
      ahj: this.ahj,
      esiid: this.esiid,
      raiserequestreason: this.raiserequestreason
      // hardcopies:this.hardcopies,
      // shippingaddress:this.shippingaddress,
      // contactnumber:this.contactnumber,
      // modeofstamping:this.modeofstamping,
      // type:this.type
    });

    this.prioritytoggle.setValue(false);
    this.newconstruction.setValue("false");
    this.inverterscount.setValue(1);
    this.mpurequired.setValue("false");
    this.modulecount.setValue(1);

    if (data.isEditMode) {
      this.addDesignDialogForm.patchValue({
        email: data.design?.email,
        name: data.design?.name,
        phone: data.design?.phonenumber,
        // company: data.design.createdby.companyname,
        address: data.design?.address, //monthlybill: data.design?.monthlybill,
        modulemake: data.design?.solarmake?.name || "",
        modulemodel: data.design?.solarmodel?.name || "",
        invertermake: data.design?.invertermake?.name || "",
        invertermodel: data.design?.invertermodel?.name || "",
        inverterscount: data.design?.inverterscount,
        rooftype: data.design?.rooftype,
        jobtype: data.design?.jobtype,
        projecttype: data.design?.projecttype,
        newconstruction: data.design?.newconstruction.toString(),
        mountingtype: data.design?.mountingtype, tiltgroundmount: data.design?.tiltofgroundmountingsystem, prioritytoggle: data.design?.isonpriority, mpurequired: data.design?.mpurequired, modulecount: data.design?.modulecount, solarcapacity: data.design?.solarcapacity, utilityname: data.design?.utility?.name || "", ahj: data.design?.ahj?.name || null, city: data.design.city, state: data.design.state, esiid: data.design?.esiid
      });

      if (data.design.comments.length > 0) {
        // this.addDesignDialogForm.patchValue({
        //   comments: data.design.comments[0].message
        // });
        // this.oldcommentid = data.design.comments[0].id;

        const new_array = [];
        for (let i1 = 0; i1 < data.design.comments.length; i1++) {
          if (data.design.comments[i1].status == "created") {
            new_array.push(data.design.comments[i1]);
          }
        }
        new_array.sort(function (a, b) {
          return a.id - b.id;
        });
        const last_element = new_array[new_array.length - 1];
        this.addDesignDialogForm.patchValue({
          comments: last_element?.message,
        });
        this.oldcommentid = last_element?.id;
      }
      if (data.design.newinvertermade != null) {
        this.showextrainvertermodel = true;
        this.otherinvertermodel.setValue(data.design.newinvertermade);
        this.invertermodel.clearValidators();
        this.otherinvertermodel.setValidators([
          Validators.required,
          Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
        ]);
        this.invertermodel.setValue("Others");
      }
      if (data.design.newinvertermake != null) {
        this.showextrainvertermake = true;
        this.extra = true;
        this.otherinvertermake.setValue(data.design.newinvertermake);
        this.invertermake.clearValidators();
        this.otherinvertermake.setValidators([
          Validators.required,
          Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$"),
        ]);
        this.invertermake.setValue("Others");
      }
      if (data.design.newmodulemake != null) {
        this.showextramodulemake = true;
        this.othermodulemake.setValue(data.design.newmodulemake);
        this.modulemake.clearValidators();
        this.othermodulemake.setValidators([
          Validators.required,
          Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$"),
        ]);
        this.modulemake.setValue("Others");
      }
      if (data.design.newmodulemade != null) {
        this.showextramodulemodel = true;
        this.othermodulemodel.setValue(data.design.newmodulemade);
        this.modulemodel.clearValidators();
        this.othermodulemodel.setValidators([
          Validators.required,
          Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
        ]);
        this.modulemodel.setValue("Others");
      }
      this.formatted_address = data.design.address;
      this.country = data.design.country;
      this.postalcode = data.design.postalcode;
      this.selectedModuleMakeID = data.design.solarmake?.id || null;
      this.selectedModuleModelID = data.design.solarmodel?.id || null;
      this.selectedUtilityID = data.design.utility?.id || null;
      this.selectedAHJ = data.design.ahj?.id || null;

      if (data.design.designinverters.length) {
        data.design.designinverters.forEach((element, index) => {
          this.numberOfInverters.push({ invertermake: "invertermake" + Number(this.numberOfInverters.length + 1), invertermodel: "invertermodel" + Number(this.numberOfInverters.length + 1), inverterscountcontrol: "inverterscount" + Number(this.numberOfInverters.length + 1), invertermodellist: [], disabledinvertermodel: true, invertermodelfilter: "invertermodelfilter" + Number(this.numberOfInverters.length + 1), selectedInverterMakeID: element.invertermake?.id || null, selectedInverterModelID: element.invertermodel?.id || null, isSaved: true, newEntry: false, invertercount: null })

          this.addDesignDialogForm.addControl('invertermake' + this.numberOfInverters.length, new FormControl(element.invertermake?.name, Validators.required))
          this.addDesignDialogForm.get('invertermake' + this.numberOfInverters.length).patchValue(element.invertermake?.name || "Others");
          this.addDesignDialogForm.addControl('invertermodel' + this.numberOfInverters.length, new FormControl(element.invertermodel?.name, Validators.required))
          this.addDesignDialogForm.get('invertermodel' + this.numberOfInverters.length).patchValue(element.invertermodel?.name || "Others");
          this.addDesignDialogForm.addControl('inverterscount' + this.numberOfInverters.length, new FormControl(element.inverterscount, Validators.required))
          this.addDesignDialogForm.get('inverterscount' + this.numberOfInverters.length).patchValue(element.inverterscount)
          if (element.invertermake != null) {
            this.loadOtherInverterModelsData(element.invertermake?.id, index)
          }
        })

      }

    } else if (this.data.isprelimmode) {
      this.addDesignDialogForm.patchValue({
        name: data.prelimData.name,
        email: data.prelimData.email,
        phone: data.prelimData.phonenumber,
        address: data.prelimData.address,
        jobtype: data.prelimData.jobtype,
        newconstruction: data.prelimData.newconstruction,
        projecttype: data.prelimData.projecttype,
        invertermake: data.prelimData.invertermake?.name || "",
        invertermodel: data.prelimData.invertermodel?.name || "",
        mountingtype: data.prelimData.mountingtype,
        rooftype: data.prelimData.rooftype,
        tiltofgroundmountingsystem: data.prelimData.tiltofgroundmountingsystem,
        mpurequired: data.prelimData.mpurequired,
        annualutilityescalation: data.prelimData.annualutilityescalation,
        modulemake: data.prelimData.solarmake?.name || "",
        modulemodel: data.prelimData.solarmodel?.name || "",
        //monthlybill: data.prelimData.monthlybill
      });
      this.isdesigncompleted = true;
      this.design = data.prelimData.id;

      this.formatted_address = data.prelimData.address;

      this.country = data.prelimData.country;
      this.postalcode = data.prelimData.postalcode;
      this.selectedModuleMakeID = data.prelimData.solarmake?.id || null;
      this.selectedModuleModelID = data.prelimData.solarmodel?.id || null;
      this.selectedInverterMakeID = data.prelimData.invertermake?.id || null;
      this.selectedInverterModelID = data.prelimData.invertermodel?.id || null;
      this.latitude = data.prelimData.latitude;
      this.longitude = data.prelimData.longitude;
      // console.log(data)
      if (data.design?.newinvertermade != null) {
        this.showextrainvertermodel = true;
        this.otherinvertermodel.setValue(data.design.newinvertermade);
        this.invertermodel.clearValidators();
        this.otherinvertermodel.setValidators([
          Validators.required,
          Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
        ]);
        this.invertermodel.setValue("Others");
      }
      if (data.design?.newinvertermake != null) {
        this.showextrainvertermake = true;
        this.otherinvertermake.setValue(data.design.newinvertermake);
        this.invertermake.clearValidators();
        this.otherinvertermake.setValidators([
          Validators.required,
          Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$"),
        ]);
        this.invertermake.setValue("Others");
      }
      if (data.design?.newmodulemake != null) {
        this.showextramodulemake = true;
        this.othermodulemake.setValue(data.design.newmodulemake);
        this.modulemake.clearValidators();
        this.othermodulemake.setValidators([
          Validators.required,
          Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$"),
        ]);
        this.modulemake.setValue("Others");
      }
      if (data.design?.newmodulemade != null) {
        this.showextramodulemodel = true;
        this.othermodulemodel.setValue(data.design.newmodulemade);
        this.modulemodel.clearValidators();
        this.othermodulemodel.setValidators([
          Validators.required,
          Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
        ]);
        this.modulemodel.setValue("Others");
      }
      console.log(this.data.prelimData.designinverters)
      this.data.prelimData?.designinverters.forEach(element => {
        this.numberOfInverters.push({ invertermake: "invertermake1", invertermodel: "invertermodel1", inverterscountcontrol: "inverterscount1", invertermodellist: [], disabledinvertermodel: true, invertermodelfilter: "invertermodelfilter1", selectedInverterMakeID: element?.invertermake.id, selectedInverterModelID: element?.invertermodel.id, isSaved: false, newEntry: true, invertercount: null })
        this.addDesignDialogForm.addControl('invertermake1', new FormControl(element.invertermake?.name || "", Validators.required))
        this.addDesignDialogForm.addControl('invertermodel1', new FormControl(element.invertermodel?.name || "", Validators.required))
        this.addDesignDialogForm.addControl('inverterscount1', new FormControl("", Validators.required))
        this.loadOtherInverterModelsData(element.invertermake?.id, 0)
      });
    } else if (data.isPermitmode) {
      this.addDesignDialogForm.patchValue({
        email: data.survey.email,
        name: data.survey.name,
        phone: data.survey.phonenumber,
        address: data.survey.address,
        jobtype: data.survey.jobtype,
        newconstruction: data.survey.newconstruction,
        projecttype: data.survey.projecttype,
      });
      this.issurveycompleted = true;
      this.survey = data.survey.id;
      this.latitude = data.survey.latitude;
      this.longitude = data.survey.longitude;
      this.numberOfInverters.push({ invertermake: "invertermake1", invertermodel: "invertermodel1", inverterscountcontrol: "inverterscount1", invertermodellist: [], disabledinvertermodel: true, invertermodelfilter: "invertermodelfilter1", selectedInverterMakeID: data.survey.invertermake?.id, selectedInverterModelID: data.survey.invertermodel?.id, isSaved: false, newEntry: true, invertercount: null })
      this.addDesignDialogForm.addControl('invertermake1', new FormControl(data.survey?.invertermake?.name || "", Validators.required))
      this.addDesignDialogForm.addControl('invertermodel1', new FormControl(data.survey?.invertermodel?.name || "", Validators.required))
      this.addDesignDialogForm.addControl('inverterscount1', new FormControl("", Validators.required))
      if (data.survey.invertermake != null) {
        this.loadOtherInverterModelsData(data.survey.invertermake?.id, 0)
      }
    } else {
      this.inverterscount.setValue(1);
      this.modulecount.setValue(1);
      if (this.genericService.permitpreviousSolarInverterMake != undefined) {
        this.addDesignDialogForm.patchValue({
          modulemake:
            this.genericService.permitpreviousSolarInverterMake.solarmake
              ?.name || "",
          modulemodel:
            this.genericService.permitpreviousSolarInverterMake.solarmodel
              ?.name || "",
        });
        this.selectedModuleMakeID =
          this.genericService.permitpreviousSolarInverterMake.solarmake?.id ||
          null;
        this.selectedModuleModelID =
          this.genericService.permitpreviousSolarInverterMake.solarmodel?.id ||
          null;
        // this.changeDetectorRef.detectChanges();
      }
      this.numberOfInverters.push({ invertermake: "invertermake1", invertermodel: "invertermodel1", inverterscountcontrol: "inverterscount1", invertermodellist: [], disabledinvertermodel: true, invertermodelfilter: "invertermodelfilter1", selectedInverterMakeID: null, selectedInverterModelID: null, isSaved: false, newEntry: true, invertercount: null })
      this.addDesignDialogForm.addControl('invertermake1', new FormControl("", Validators.required))
      this.addDesignDialogForm.addControl('invertermodel1', new FormControl("", Validators.required))
      this.addDesignDialogForm.addControl('inverterscount1', new FormControl("", Validators.required))
      //this.fetchOtherInverterModelsData(data.prelimData.invertermake?.id, 0)
    }

    if (data.isCustomer) {
      this.customerid = this.data.customerpermit.id;
      //this.city = this.data.customerpermit.city;
      // this.state = this.data.customerpermit.state;
      this.country = this.data.customerpermit.county;
      this.postalcode = this.data.customerpermit.zipcode.toString();
      this.addDesignDialogForm.patchValue({
        name: data.customerpermit?.name,
        email: data.customerpermit?.email,
        phone: data.customerpermit?.phone,
        address: data.customerpermit?.address,
        solarcapacity: data.customerpermit?.solarcapacity,
      });
    }

    this.newpermitsRef = this.db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + "newpermitdesigns"
    );
    this.newpermits = this.newpermitsRef.valueChanges();
    this.newpermits.subscribe(
      (res) => {
        this.newpermitscount = res.count;
        changeDetectorRef.detectChanges();
      }
      // (err) => console.log(err),
      // () => console.log('done!')
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
      // () => console.log('done!')
    );
    this.servicecharges = db.object("service_charges");
    this.servicechargedata = this.servicecharges.valueChanges();
    this.servicechargedata.subscribe(
      (res) => {
        this.permitServiceCharge = res;
      }
      // (err) => console.log(err),
      // () => console.log("done!")
    );
  }

  ngOnInit(): void {
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
    });
    setTimeout(() => {
      if (!this.isClient && this.data.designRaisedbyWattmonk) {
        this.company.setValue(this.data.prelimData.company);
      } else {
        if (!this.isClient) {
          this.fetchCompaniesData();
        } else {
          this.getWattmonkadmins();
        }
      }
      this.fetchModuleMakesData();
      this.fetchInverterMakesData();
      if (this.data.isEditMode) {
        this.loadModuleModelsData();
        this.loadInverterModelsData();
        if (this.state.value != "" && this.city.value != "") {
          this.fetchUtilityName(this.state, this.city);
          this.fetchAHJ(this.state, this.city);
        } else {
          this.fetchAllUtilityName();
          this.fetchAllAhj();
        }
      }
      else if (this.data.isprelimmode) {
        if (this.state.value != "" && this.city.value != "") {
          this.fetchUtilityName(this.state, this.city);
          this.fetchAHJ(this.state, this.city);
        } else {
          this.fetchAllUtilityName();
          this.fetchAllAhj();
        }
      } else {
        this.fetchAllUtilityName();
        this.fetchAllAhj();
      }
    });
    if (this.data.isPermitmode) {
      this.mspimages = this.data.survey.mspimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.utilitymeterimages = this.data.survey.utilitymeterimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.pvinverterimages = this.data.survey.pvinverterimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.pvmeterimages = this.data.survey.pvmeterimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.acdisconnectimages = this.data.survey.acdisconnectimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.roofimages = this.data.survey.roofimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.roofdimensionimages = this.data.survey.roofdimensionimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.obstaclesimages = this.data.survey.obstaclesimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.obstaclesdimensionsimages =
        this.data.survey.obstaclesdimensionsimages.map(
          (item) => new ImageItem({ src: item.url, thumb: item.url })
        );
      this.atticimages = this.data.survey.atticimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
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

      this.permitAttachments = this.data.prelimDesign
        ? this.data.prelimDesign.attachments.map(
          (item) => new ImageItem({ src: item.url, thumb: item.url })
        )
        : null;

      this.permitArchitecture = this.data.prelimDesign
        ? this.data.prelimDesign.architecturaldesign.map(
          (item) => new ImageItem({ src: item.url, thumb: item.url })
        )
        : null;

      this.mspimagesGallery();
    }
    if (this.data.isprelimmode) {
      this.permitAttachments = this.data.prelimData.attachments.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );

      this.permitArchitecture = this.data.prelimData.architecturaldesign.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );
      this.changeDetectorRef.detectChanges();
      this.permitAttachmentsGallery();
    }

    this.copiedcoupon = JSON.parse(localStorage.getItem("copiedcoupan"));
    if (this.modulemake.value.toLowerCase() == "none") {
      // this.modulecount.setValue("0");
      this.modulecount.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.maxLength(7),
        Validators.pattern("^[0-9]{1,7}$"),
      ]);
      this.modulecount.updateValueAndValidity();
    }
    if (this.invertermake.value.toLowerCase() == "none") {
      this.inverterscount.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.maxLength(7),
        Validators.pattern("^[0-9]{1,7}$"),
      ]);
      this.inverterscount.updateValueAndValidity();
    }
  }

  permitAttachmentsGallery(): void {
    // if (this.data.isprelimmode) {
    //   console.log("yes")
    //   this.gallery.ref().load(this.permitAttachments);
    // } else {
    const lightboxGalleryRef = this.gallery.ref("permitAttachments");
    lightboxGalleryRef.load(this.permitAttachments);
    // }
    this.permitArchitectureGallery();
  }

  permitArchitectureGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("permitArchitecture");
    lightboxGalleryRef.load(this.permitArchitecture);
  }

  onInverterMakechnage(value): void {
    if (value == "") {
      this.selectedInverterMakeID = null;
      this.selectedInverterModelID = null;
      this.addDesignDialogForm.patchValue({ invertermodel: "" });
      this.invertermodel.clearValidators();
      this.invertermodel.updateValueAndValidity();
    }
  }

  onAddressChange(value) {
    if (value == '') {
      this.isAddressSelected = false;
      this.state.patchValue('');
      this.city.patchValue('');
      this.formatted_address = null;
    }
  }

  mspimagesGallery() {
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
    this.permitAttachmentsGallery();
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

  radioChange($event: MatRadioChange): void {
    if ($event.source.name === "mountingtype") {
      if ($event.value == "roof") {
        this.tiltgroundmount.clearValidators();
        this.tiltgroundmount.updateValueAndValidity();
        this.rooftype.setValidators([Validators.required]);
      } else if ($event.value == "ground") {
        this.rooftype.clearValidators();
        this.rooftype.updateValueAndValidity();
        this.tiltgroundmount.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]+$"),
        ]);
      } else {
        this.rooftype.setValidators([Validators.required]);
        this.tiltgroundmount.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.pattern("^[0-9]+$"),
        ]);
      }
    }

    if ($event.source.name === "newconstruction") {
      if ($event.value == "false") {
        this.isFileUploaded = false;
      }
    }
    if ($event.source.name === "jobtype") {
      if ($event.value == "battery") {
        this.modulemake.setValue("None");
        this.modulemodel.setValue("None");
        this.modulecount.setValue("0");

        const toSelect = this.invertermakes.find(
          (c) => c.name == "None"
        );
        this.addDesignDialogForm.get(this.numberOfInverters[0].invertermake).setValue(toSelect.name);
        // this.solarcapacity.clearValidators();
        //this.solarcapacity.updateValueAndValidity();
        this.addextrainverters = false;
        this.placeholder = "Please enter battery details here...";

        this.inverterscount.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),
        ]);
        this.inverterscount.updateValueAndValidity();

        this.modulecount.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),
        ]);
        this.modulecount.updateValueAndValidity();
      }
      else {
        this.addextrainverters = true;
      }
    }
  }

  // radioChangePestamp($event: MatRadioChange) {

  //   if ($event.source.name === 'modeofstamping') {
  //     if ($event.value == "hardcopy" || $event.value == "both") {
  //       this.shippingaddress.setValidators([
  //         Validators.required,
  //         Validators.pattern(ADDRESSFORMAT)
  //       ]);
  //       // this.name.setValidators([
  //       //   Validators.required,
  //       //   Validators.min(1),
  //       //   Validators.pattern("^[a-zA-Z. ]{3,}$")]);
  //       this.contactnumber.setValidators([
  //         Validators.required,
  //         Validators.minLength(8),
  //         Validators.maxLength(15),
  //         Validators.pattern("^[0-9]{8,15}$")]);
  //       this.hardcopies.setValidators([
  //         Validators.required,
  //         Validators.min(1),
  //         Validators.max(10),
  //         Validators.pattern("^[0-9]*")]);
  //     }
  //     else {
  //       this.shippingaddress.clearValidators();
  //       this.shippingaddress.updateValueAndValidity();
  //       // this.name.clearValidators();
  //       // this.name.updateValueAndValidity();
  //       this.contactnumber.clearValidators();
  //       this.contactnumber.updateValueAndValidity();
  //       this.hardcopies.clearValidators();
  //       this.hardcopies.updateValueAndValidity();
  //     }
  //   }
  // }

  onAutocompleteSelected(result: PlaceResult) {
    this.formatted_address = result.formatted_address;
    for (let i = 0; i < result.address_components.length; i++) {
      for (let j = 0; j < result.address_components[i].types.length; j++) {
        if (result.address_components[i].types[j] == "postal_code") {
          this.postalcode = result.address_components[i].long_name;
        } else if (result.address_components[i].types[j] == "country") {
          this.country = result.address_components[i].long_name;
        } else if (result.address_components[i].types[j] == "administrative_area_level_1") {
          this.state.patchValue(result.address_components[i].long_name);
          console.log(this.state.value)
        } else if (result.address_components[i].types[j] == "administrative_area_level_2") {
          this.city.patchValue(result.address_components[i].long_name);
        }
      }
    }
    if (this.state.value == '' || this.city.value == '') {
      console.log(this.state.value)
      this.isAddressSelected = false;
    }
    else {
      console.log(this.state.value)
      this.isAddressSelected = true;
    }
    this.changeDetectorRef.detectChanges();
    console.log(this.city + ' --- ' + this.state);
    if (this.state.value !== "" && this.city.value !== "") {
      this.fetchUtilityName(this.state, this.city);
      this.fetchAHJ(this.state, this.city);
    }
    this.formatted_address = result.formatted_address;
    this.latitude = this.selectedSiteLocation.latitude;
    this.longitude = this.selectedSiteLocation.longitude;
  }

  onLocationSelected(location: Location): void {
    this.selectedSiteLocation = location;
  }

  displayFnModuleMake(modulemake: ModuleMake): string {
    return modulemake && modulemake.name ? modulemake.name : "";
  }

  fetchAllUtilityName(): void {
    // this.addDesignDialogForm.patchValue({ utilityname: "" });
    this.commonService.getAllUtilityData().subscribe(
      (response) => {
        this.utilites = response;
        this.filteredUtility = this.utilityname.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) =>
            name ? this._filterUtility(name) : this.utilites.slice()
          )
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchAllAhj(): void {
    // this.addDesignDialogForm.patchValue({ ahj: "" });
    this.commonService.getAllAHJ().subscribe(
      (response) => {
        this.permitahj = response;
        this.filteredAhj = this.ahj.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) => (name ? this._filterAHJ(name) : this.permitahj.slice()))
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchUtilityName(state, city): void {
    // this.addDesignDialogForm.patchValue({ utilityname: "" });
    this.commonService.getPrelimUtilityData(state, city).subscribe(
      (response) => {
        this.utilites = response;
        this.filteredUtility = this.utilityname.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) =>
            name ? this._filterUtility(name) : this.utilites.slice()
          )
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchUtilityRateData(_event: any, utility): void {
    // this.addDesignDialogForm.patchValue({ utilityrate: " " });
    if (_event.isUserInput) {
      // this.utilityrates = [];

      this.selectedUtilityID = utility.id;
      // this.commonService.getUtilityRateData(utility.id).subscribe(
      //   (response) => {
      //     this.utilityrates = response;
      //     this.filteredUtilityRate = this.utilityrate.valueChanges.pipe(
      //       startWith(""),
      //       map((value) => (typeof value === "string" ? value : value.name)),
      //       map((name) =>
      //         name ? this._filterUtilityRate(name) : this.utilityrates.slice()
      //       )
      //     );

      //   },
      //   (error) => {
      //     this.notifyService.showError(error, "Error");
      //   }
      // );
    }
  }

  fetchAHJ(state, city): void {
    // this.addDesignDialogForm.patchValue({ ahj: "" });
    this.commonService.getAHJ(state, city).subscribe(
      (response) => {
        this.permitahj = response;
        this.filteredAhj = this.ahj.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) => (name ? this._filterAHJ(name) : this.permitahj.slice()))
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  setSelectedAHJ(_event: any, ahj): void {
    // this.addDesignDialogForm.patchValue({ ahj: "" });
    if (_event.isUserInput) {
      // this.utilityrates = [];

      this.selectedAHJ = ahj.id;
      // this.commonService.getUtilityRateData(utility.id).subscribe(
      //   (response) => {
      //     this.utilityrates = response;
      //     this.filteredUtilityRate = this.utilityrate.valueChanges.pipe(
      //       startWith(""),
      //       map((value) => (typeof value === "string" ? value : value.name)),
      //       map((name) =>
      //         name ? this._filterUtilityRate(name) : this.utilityrates.slice()
      //       )
      //     );

      //   },
      //   (error) => {
      //     this.notifyService.showError(error, "Error");
      //   }
      // );
    }
  }

  private _filterModuleMake(name: string): ModuleMake[] {
    const filterValue = name.toLowerCase();

    return this.modulemakes.filter(
      (modulemake) => modulemake.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  displayFnModuleModel(modulemodel: ModuleModel): string {
    return modulemodel && modulemodel.name ? modulemodel.name : "";
  }

  private _filterModuleModel(name: string): ModuleModel[] {
    const filterValue = name.toLowerCase();

    return this.modulemodels.filter(
      (modulemodel) => modulemodel.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  displayFnInverterMake(invertermake: InverterMake): string {
    return invertermake && invertermake.name ? invertermake.name : "";
  }

  private _filterInverterMake(name: string): InverterMake[] {
    const filterValue = name.toLowerCase();

    return this.invertermakes.filter(
      (invertermake) =>
        invertermake.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  displayFnInverterModel(invertermodel: InverterModel): string {
    return invertermodel && invertermodel.name ? invertermodel.name : "";
  }

  private _filterInverterModel(name: string): InverterModel[] {
    const filterValue = name.toLowerCase();

    return this.invertermodels.filter(
      (invertermodel) =>
        invertermodel.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  private _filterUtility(name: string): PrelimUtility[] {
    const filterValue = name.toLowerCase();

    return this.utilites.filter(
      (prelimutility) =>
        prelimutility.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  private _filterAHJ(name: string): Ahj[] {
    const filterValue = name.toLowerCase();

    return this.permitahj.filter(
      (ahj) => ahj.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  getErrorMessage(
    control: FormControl
  ):
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string {
    if (control == this.mountingtype && control.hasError("required")) {
      return "You must select a value";
    }
    if (control == this.projecttype && control.hasError("required")) {
      return "You must select a value";
    }
    if (control == this.jobtype && control.hasError("required")) {
      return "You must select a value";
    }
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    if (control == this.raiserequestreason) {
      return "You must enter a value";
    }
    if (control == this.name) {
      return this.name.hasError("pattern")
        ? "Name must contain only alphabets."
        : this.name.hasError("minlength")
          ? "Name should be of min 2 character."
          : "";
    }
    // if (control == this.modeofstamping && control.hasError("required")) {
    //   return "You must select a value";
    // }
    // if (control == this.type && control.hasError("required")) {
    //   return "You must select a value";
    // }
    else if (control == this.email) {
      return this.email.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    } else if (control == this.phone) {
      return this.phone.hasError("pattern")
        ? "Please enter a valid phone number(Min - 8, Max - 15)."
        : "Phone should be of min. 8 and max. 15 characters.";
    }
    // else if (control == this.monthlybill) {
    //   return this.monthlybill.hasError("pattern")
    //     ? "Please enter a valid annual unit."
    //     : "zero value is not accepted";
    // }
    else if (control == this.tiltgroundmount) {
      return this.tiltgroundmount.hasError("pattern")
        ? "Please enter a valid tilt value for ground mount.."
        : "";
    } else if (control == this.address) {
      return this.address.hasError("pattern")
        ? "Please enter a valid address."
        : "";
    } else if (control == this.modulemake) {
      return this.modulemake.hasError("pattern")
        ? "Please enter a valid format."
        : "";
    } else if (control == this.modulemodel) {
      return this.modulemodel.hasError("pattern")
        ? "Please enter a valid format."
        : "";
    } else if (control == this.invertermake) {
      return this.invertermake.hasError("pattern")
        ? "Please enter a valid format."
        : "";
    } else if (control == this.invertermodel) {
      return this.invertermodel.hasError("pattern")
        ? "Please enter a valid format."
        : "";
    } else if (control == this.inverterscount) {
      return this.inverterscount.hasError("pattern")
        ? "Please enter a valid inverters count number only"
        : "inverters count should be of min. 1 and max. 7 characters.";
    } else if (control == this.modulecount) {
      return this.modulecount.hasError("pattern")
        ? "Please enter a valid module count number only"
        : "module count should be of min. 1 and max. 7 characters.";
    } else if (control == this.solarcapacity) {
      return this.solarcapacity.hasError("pattern")
        ? "Please enter a valid solar capacity."
        : "zero value is not accepted";
    } else if (control == this.utilityname) {
      return this.utilityname.hasError("pattern")
        ? "Please enter a valid format."
        : "";
    } else if (control == this.ahj) {
      return this.ahj.hasError("pattern") ? "Please enter a valid format." : "";
    } else if (control == this.otherinvertermake) {
      return this.otherinvertermake.hasError("pattern")
        ? "Please enter a valid format."
        : "";
    } else if (control == this.otherinvertermodel) {
      return this.otherinvertermodel.hasError("pattern")
        ? "Please enter a valid format."
        : "";
    } else if (control == this.othermodulemodel) {
      return this.othermodulemodel.hasError("pattern")
        ? "Please enter a valid format."
        : "";
    } else if (control == this.othermodulemake) {
      return this.othermodulemake.hasError("pattern")
        ? "Please enter a valid format."
        : "";
    }
    else if (control == this.state) {
      return this.state.hasError("pattern")
        ? "Please enter a valid state"
        : "state should be of min. 1 and max. 15 characters.";
    }
    else if (control == this.city) {
      return this.city.hasError("pattern")
        ? "Please enter a valid city"
        : "city should be of min. 2 and max. 15 characters.";
    }

    //  else if (control == this.hardcopies) {
    //   return this.hardcopies.hasError("pattern")
    //     ? "please enter valid number of hard copies"
    //     : "please enter valid number of hard copies";
    // }
    // else if (control == this.contactnumber) {
    //   return this.contactnumber.hasError("pattern")
    //     ? "Please enter a valid phone number (Min - 8, Max - 15)."
    //     : "Phone should be of min. 8 and max. 15 characters.";
    // }
    // else if (control == this.shippingaddress) {
    //   return this.shippingaddress.hasError("pattern")
    //     ? "Please enter a valid shipping address."
    //     : "";
    // }
  }

  // private _filterCompanies(companyname: string): User[] {
  //   return this.getCompanies.filter(
  //     company => company.companyname.toLowerCase().indexOf(companyname) != -1
  //   );
  // }

  proxyValue: any;
  onCompanyChanged(event$): void {
    this.proxyValue = event$.option.value.companyname;
    this.designCreatedBy = event$.option.value.companyid;
    this.designCreatedByUserParent = event$.option.value.parentid;
  }
  oncompanyScroll(): void {
    this.scrolling = true;
    this.skip += 10;
    this.fetchCompaniesData();
    this.companyListlength == this.limit ? this.scrolling = true : this.scrolling = false;
  }

  fetchCompaniesData() {
    this.commonService.getClients(this.limit, this.skip).subscribe(
      (response) => {
        this.scrolling = false;
        this.companyListlength = response.length;
        this.getCompanies = response;
        this.companyList = [...this.companyList, ...response];
        this.changeDetectorRef.detectChanges();
        if (this.data.isEditMode) {
          const toSelect = this.companyList.find(
            (c) => c.companyname == this.data.design.createdby?.company
          );
          this.company.setValue(toSelect);
          this.changeDetectorRef.detectChanges();
        }
        // this.filteredCompanies = this.company.valueChanges.pipe(
        //   startWith(""),
        //   map(value => (typeof value === "string" ? value : value.companyid)),
        //   map(companyname => (companyname ? this._filterCompanies(companyname) : this.getCompanies.slice()))
        // );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.scrolling = false;
      }
    );
  }

  onCloseClick(): void {
    if (this.data.isEditMode && this.data.design.newconstruction == true) {
      if (this.data.design.architecturaldesign.length == 0) {
        this.displayerror = false;
      } else {
        this.dialogRef.close(this.data);
      }
    } else {
      this.dialogRef.close(this.data);
    }
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

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
  modulemodelempty(): void {
    if (this.modulemake.value != "Others") {
      this.addDesignDialogForm.patchValue({ modulemodel: "" });
      this.modulemodel.setValue("");
      if (this.modulemake.value.toLowerCase() == "none") {
        this.modulecount.setValue("0");
        this.modulecount.disable();
        this.modulecount.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),
        ]);
        this.modulecount.updateValueAndValidity();
      } else {
        this.modulecount.enable();
        this.modulecount.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),
        ]);
        this.modulecount.updateValueAndValidity();
      }
    } else {
      this.dialog.open(OtherSelectionPopup, {
        width: "40%",
        height: "20%",
        disableClose: true,
        data: {
          text: " Please enter module make and module model in comments ",
        },
      });
    }

    if (
      this.modulemake.value == "Others" ||
      this.modulemodel.value == "Others" ||
      this.invertermake.value == "Others" ||
      this.invertermodel.value == "Others"
    ) {
      this.placeholder =
        "Please enter module make,module model,module count,inverter make,inverter model and inverters count here..";
    } else {
      this.placeholder = "Start typing here...";
      this.comments.clearValidators();
      this.comments.updateValueAndValidity();
    }
    this.changeDetectorRef.detectChanges();
    // if(this.modulemake.value != "Others" && this.modulemake.value != null && this.modulemake.value != ""){
    //     this.showextramodulemake=false;
    // this.othermodulemake.clearValidators();
    // this.othermodulemake.setValue(null);
    // this.showextramodulemodel=false;
    // this.othermodulemodel.clearValidators();
    // this.othermodulemodel.setValue(null);

    // }
    if (this.modulemake.value != "" && this.modulemake.value != undefined) {
      this.modulemodel.setValidators([
        Validators.required,
        Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
      ]);
      this.modulemodel.updateValueAndValidity();
    }
  }

  invertermodelempty(i) {
    console.log(this.addDesignDialogForm.get(this.numberOfInverters[i].invertermake).value)
    if (this.addDesignDialogForm.get(this.numberOfInverters[i].invertermake).value == "None" || this.addDesignDialogForm.get(this.numberOfInverters[i].invertermodel).value == "None") {
      this.addextrainverters = false;
      this.changeDetector.detectChanges();
    }
    else {
      this.addextrainverters = true;
      this.changeDetector.detectChanges();
    }
    this.addDesignDialogForm.get(this.numberOfInverters[i].invertermodel).setValue("")
  }

  modulemodelrefresh(): void {
    if (
      this.modulemodel.value != "Others" &&
      this.modulemodel.value != null &&
      this.modulemodel.value != ""
    ) {
      // this.showextramodulemodel=false;
      this.othermodulemodel.clearValidators();
      // this.othermodulemodel.setValue(null);
    }
    if (this.modulemodel.value == "Others") {
      this.dialog.open(OtherSelectionPopup, {
        width: "40%",
        height: "20%",
        disableClose: true,
        data: { text: " Please enter module model in comments " },
      });
    }
    if (
      this.modulemake.value == "Others" ||
      this.modulemodel.value == "Others" ||
      this.invertermake.value == "Others" ||
      this.invertermodel.value == "Others"
    ) {
      this.placeholder =
        "Please enter module make,module model,module count,inverter make,inverter model and inverters count here..";
    } else {
      this.placeholder = "Start typing here...";
      this.comments.clearValidators();
      this.comments.updateValueAndValidity();
    }
  }

  fetchModuleModelsData(_event: any, make): void {
    //  this.showextramodulemake=false;
    this.modulemake.setValidators([
      Validators.required,
      Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$"),
    ]);
    //  this.othermodulemake.clearValidators();
    //  this.othermodulemake.setValue(null);
    // this.addDesignDialogForm.patchValue({ modulemodel: "" })
    if (_event.isUserInput) {
      // this.modulemodel.setValue("");
      if (this.data.isEditMode) {
        this.selectedModuleModelID = null;
      }

      this.modulemodels = [];
      this.selectedModuleMakeID = make.id;
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
          if (make.name == 'None') {
            this.selectedModuleModelID = response[0].id
          }
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    }
  }

  loadModuleModelsData(): void {
    this.modulemodels = [];
    this.commonService.getModuleModelsData(this.selectedModuleMakeID).subscribe(
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
  }

  setSelectedModuleModel(model): void {
    // this.modulemodel.setValue(model.name);
    this.selectedModuleModelID = model.id;
    // this.showextramodulemodel=false;
    this.modulemodel.setValidators([
      Validators.required,
      Validators.pattern(".*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
    ]);
    // this.othermodulemodel.setValue(null);
    // this.othermodulemodel.clearValidators();
  }

  fetchInverterMakesData(): void {
    this.commonService.getInverterMakesData().subscribe(
      (response) => {
        this.invertermakes = response;
        this.filteredInverterMakes = this.invertermakefilter.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) =>
            name ? this._filterInverterMake(name) : this.invertermakes.slice()
          )
        );
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  /*   fetchInverterModelsData(_event: any, make): void {
      // this.showextrainvertermake = false;
      // this.otherinvertermake.clearValidators(); 
      // this.otherinvertermake.setValue(null);    
      this.invertermake.setValidators([Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")]);
      if (make.name == "None" || make == "Others") {
        this.addextrainverters = false;
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.addextrainverters = true;
      }
      if (_event.isUserInput) {
        // this.invertermodel.setValue("");
        if (this.data.isEditMode) {
          this.selectedInverterModelID = null;
        }
        // console.log(this.data)
        this.invertermodels = [];
        this.selectedInverterMakeID = make.id;
        this.commonService.getInverterModelsData(make.id).subscribe(
          (response) => {
            this.invertermodels = response;
            this.filteredInverterModels =
              this.invertermodelfilter.valueChanges.pipe(
                startWith(""),
                map((value) => (typeof value === "string" ? value : value.name)),
                map((name) =>
                  name
                    ? this._filterInverterModel(name)
                    : this.invertermodels.slice()
                )
              );
            this.changeDetectorRef.detectChanges();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      }
    } */

  loadInverterModelsData(): void {
    this.invertermodels = [];
    this.commonService
      .getInverterModelsData(this.selectedInverterMakeID)
      .subscribe(
        (response) => {
          this.invertermodels = response;
          this.filteredInverterModels =
            this.invertermodelfilter.valueChanges.pipe(
              startWith(""),
              map((value) => (typeof value === "string" ? value : value.name)),
              map((name) =>
                name
                  ? this._filterInverterModel(name)
                  : this.invertermodels.slice()
              )
            );
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  setSelectedInverterModel(model): void {
    this.selectedInverterModelID = model.id;
    // this.showextrainvertermodel = false;
    this.otherinvertermodel.clearValidators();
    this.otherinvertermodel.setValue(null);
    this.invertermodel.setValidators([
      Validators.pattern(".*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
    ]);
  }

  onSaveDesign(): void {
    console.log(this.addDesignDialogForm)
    this.isoutsourced = false;
    this.senddirectlytowattmonk = false;
    if (
      this.modulemake.value == "Others" ||
      this.modulemodel.value == "Others"
    ) {
      this.comments.setValidators([Validators.required]);
      this.comments.updateValueAndValidity();
      this.dataentry = true;
    }

    if (this.addDesignDialogForm.valid) {
      if (this.modulemake.value == "Others") {
        this.modulemake.setValue(null);
        this.modulemodel.setValue(null);
        this.selectedModuleMakeID = null;
        this.selectedModuleModelID = null;
      } else if (this.modulemodel.value == "Others") {
        this.modulemodel.setValue(null);
        this.selectedModuleModelID = null;
      }
      this.patchFormattedValues();

      if (
        this.newconstruction.value == "true" &&
        this.architecturalfiles.length == 0 &&
        !this.data.isEditMode
      ) {
        this.displayerror = false;
        this.addDesignDialogForm.markAllAsTouched();
        this.updateInvalidExpansionPanels();
      } else if (this.data.isEditMode && this.newconstruction.value == "true") {
        if (
          this.data.design.architecturaldesign.length == 0 &&
          this.architecturalfiles.length == 0
        ) {
          this.displayerror = false;
          this.addDesignDialogForm.markAllAsTouched();
          this.updateInvalidExpansionPanels();
        } else {
          this.updateInvalidExpansionPanels();
          this.isLoading = true;
          this.loadingmessage = "Saving data";
          this.changeDetectorRef.detectChanges();
          if (this.data.isEditMode) {
            this.editDesignOnServer();
          } else {
            this.addDesignToServer();
          }
        }
      } else {
        this.updateInvalidExpansionPanels();
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        this.changeDetectorRef.detectChanges();
        if (this.data.isEditMode) {
          this.editDesignOnServer();
        } else {
          this.addDesignToServer();
        }
      }
    } else {
      // this.displayerror = false;
      this.displayerror = false;
      this.addDesignDialogForm.markAllAsTouched();
      this.updateInvalidExpansionPanels();
      // this.changeDetectorRef.detectChanges();
    }
  }

  patchFormattedValues(): void {
    const controls = this.addDesignDialogForm.controls;

    for (const name in controls) {
      try {
        if (name != "address") {
          this.addDesignDialogForm
            .get(name)
            .patchValue(
              this.addDesignDialogForm.get(name).value.replace(/['"]+/g, "")
            );
          this.addDesignDialogForm
            .get(name)
            .patchValue(
              this.addDesignDialogForm.get(name).value.replace(/<\/?.+?>/gi, "")
            );
        }
      } catch (error) { }
    }
  }

  sendDesigntoWattmonk($ev): void {
    this.raiseattachmentError = true;
    $ev.preventDefault();
    this.senddirectlytowattmonk = true;
    if (
      this.modulemake.value == "Others" ||
      this.modulemodel.value == "Others" ||
      this.invertermake.value == "Others" ||
      this.invertermodel.value == "Others"
    ) {
      this.comments.setValidators([Validators.required]);
      this.comments.updateValueAndValidity();
      this.dataentry = true;
    }
    if (this.invertermake.value != "" && this.invertermake.value != undefined) {
      this.invertermodel.setValidators([Validators.required]);
      this.invertermodel.updateValueAndValidity();
    }
    if (
      this.raiserequestattachmentfiles.length == 0 &&
      this.data.designRaisedbyWattmonk
    ) {
      // this.displayerror = false;
      this.raiseattachmentError = false;
      // this.addDesignDialogForm.markAllAsTouched();
    }
    if (this.addDesignDialogForm.valid) {
      if (this.modulemake.value == "Others") {
        this.modulemake.setValue(null);
        this.modulemodel.setValue(null);
      } else if (this.modulemodel.value == "Others") {
        this.modulemodel.setValue(null);
      }
      this.patchFormattedValues();
      if (
        this.raiserequestattachmentfiles.length == 0 &&
        this.data.designRaisedbyWattmonk
      ) {
        this.displayerror = false;
        this.raiseattachmentError = false;
        this.addDesignDialogForm.markAllAsTouched();
      } else if (
        this.newconstruction.value == "true" &&
        this.architecturalfiles.length == 0 &&
        !this.data.isEditMode
      ) {
        this.displayerror = false;
        this.addDesignDialogForm.markAllAsTouched();
        this.updateInvalidExpansionPanels();
      } else if (this.data.isEditMode && this.newconstruction.value == "true") {
        if (
          this.data.design.architecturaldesign.length == 0 &&
          this.architecturalfiles.length == 0
        ) {
          this.displayerror = false;
          this.addDesignDialogForm.markAllAsTouched();
          this.updateInvalidExpansionPanels();
        } else {
          this.updateInvalidExpansionPanels();
          if (!this.data.isEditMode) {
            this.addDesignToServer();
          } else {
            this.assigntowattmonk = true;
            this.isLoading = true;
            this.loadingmessage = "Saving data";
            this.changeDetectorRef.detectChanges();
            this.editDesignOnServer();
          }
        }
      } else {
        this.updateInvalidExpansionPanels();
        if (!this.data.isEditMode || this.data.designRaisedbyWattmonk) {
          this.addDesignToServer();
        } else {
          this.assigntowattmonk = true;
          this.isLoading = true;
          this.loadingmessage = "Saving data";
          this.changeDetectorRef.detectChanges();
          this.editDesignOnServer();
        }
      }
    } else {
      this.isLoading = false;
      // this.displayerror = false;
      if (this.architecturalfiles.length == 0) {
        this.displayerror = false;
      }
      this.addDesignDialogForm.markAllAsTouched();
      this.updateInvalidExpansionPanels();
      this.changeDetectorRef.detectChanges();
    }
  }

  updateInvalidExpansionPanels(): void {
    const invalidcontrols = this.genericService.findInvalidControls(
      this.addDesignDialogForm
    );

    this.aremakedetailsvalid = true;
    this.aremountingdetailsvalid = true;
    this.aresitedetailsvalid = true;
    invalidcontrols.forEach((element) => {
      if (
        element == "name" ||
        element == "email" ||
        element == "phone" ||
        element == "solarcapacity" ||
        element == "projecttype" ||
        element == "jobtype" ||
        element == "address" ||
        element == "newconstruction"
      ) {
        this.aresitedetailsvalid = false;
      }
      if (
        element == "modulemake" ||
        element == "modulemodel" ||
        element == "invertermake" ||
        element == "invertermodel"
      ) {
        this.aremakedetailsvalid = false;
      }
      if (element == "mountingtype") {
        this.aremountingdetailsvalid = false;
      }
      if (this.mountingtype.value == "roof" && element == "rooftype") {
        this.aremountingdetailsvalid = false;
      }
      if (this.mountingtype.value == "ground" && element == "tiltgroundmount") {
        this.aremountingdetailsvalid = false;
      }
      if (
        this.mountingtype.value == "both" &&
        (element == "tiltgroundmount" || element == "rooftype")
      ) {
        this.aremountingdetailsvalid = false;
      }
    });

    if (
      JSON.parse(this.newconstruction.value) &&
      this.architecturalfiles.length == 0
    ) {
      this.aresitedetailsvalid = false;
    }
  }
  openOrderDesignDialog(design, prlimDesign?): void {
    let appliedcoupan: any;
    let amounttopay: any;
    let slabname: any;
    let slabdiscount;
    const dialogRef = this.dialog.open(OrderpermitdesigndialogComponent, {
      width: "30%",
      panelClass: "white-modalbox",
      autoFocus: false,
      disableClose: true,
      data: {
        isConfirmed: false,
        isLater: false,
        isprelim: false,
        design: design,
        appliedcoupan: appliedcoupan,
        amounttopay: amounttopay,
        slabname: slabname,
        slabdiscount: slabdiscount,
        serviceamount: Number,
        designRaisedbyWattmonk: this.data.designRaisedbyWattmonk,
        prlimDesign: prlimDesign,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.finalAmountopay = result.amounttopay;
        this.slabname = String(result.slabname);
        this.slabdiscount = result.slabdiscount;
        this.serviceamount = result.serviceamount;
        if (result.appliedcoupan != null) {
          this.appliedCoupan = result.appliedcoupan;
        }
        this.assigntowattmonk = true;
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        this.changeDetectorRef.detectChanges();
        const paymenttype = localStorage.getItem("paymenttype");
        if (
          paymenttype == "direct" &&
          (this.loggedInUser.ispaymentmodeprepay ||
            this.data.design.createdby.ispaymentmodeprepay)
        ) {
          this.chargeUserForDesignRequest(
            paymenttype,
            this.finalAmountopay,
            design.id
          );
        } else {
          this.assignUserToDesign();
        }
      } else {
        this.appliedCoupan = null;
        this.isoutsourced = false;
        this.isLoading = false;
        this.dialogRef.close(this.data);
      }
      if (result.isLater) {
        this.assigntowattmonk = false;
      }
    });
  }
  addDesignToServer(): void {
    const companydata = this.addDesignDialogForm.get("company").value;
    let amounttopay = null;

    if (companydata) {
      if (this.data.designRaisedbyWattmonk) {
        this.designCreatedBy = this.data.prelimData.createdby.id;
        this.designCreatedByUserParent = this.data.prelimData.createdby.id;
      } else {
        this.designCreatedBy = companydata.companyid;
        this.designCreatedByUserParent = companydata.companyid;
      }
      //this.designCreatedBy = companydata.companyid;
      //this.designCreatedByUserParent = companydata.companyid;

      if (this.projecttype.value == "residential") {
        if (this.jobtype.value == "pv") {
          this.amounttopay =
            this.permitServiceCharge.permit_pv_residential.price;
        } else if (this.jobtype.value == "battery") {
          this.amounttopay =
            this.permitServiceCharge.permit_battery_residential.price;
        } else if (this.jobtype.value == "pvbattery") {
          this.amounttopay =
            this.permitServiceCharge.permit_pvbattery_residential.price;
        }
      } else if (
        this.projecttype.value == "commercial" ||
        this.projecttype.value == "detachedbuildingorshop" ||
        this.projecttype.value == "carport"
      ) {
        // let solarCapcity = this.monthlybill.value / 1150
        const solarCapcity = this.solarcapacity.value;
        if (solarCapcity > 0 && solarCapcity <= 49) {
          this.amounttopay =
            this.permitServiceCharge.permit_0_49commercial.price;
        } else if (solarCapcity > 49 && solarCapcity <= 99) {
          this.amounttopay =
            this.permitServiceCharge.permit_50_99commercial.price;
        } else if (solarCapcity > 99 && solarCapcity <= 199) {
          this.amounttopay =
            this.permitServiceCharge.permit_100_199commercial.price;
        } else if (solarCapcity > 199 && solarCapcity <= 299) {
          this.amounttopay =
            this.permitServiceCharge.permit_200_299commercial.price;
        } else if (solarCapcity > 299) {
          this.amounttopay =
            this.permitServiceCharge.permit_200_299commercial.price;
          for (let i = 300; i <= solarCapcity; i = i + 100) {
            this.amounttopay +=
              this.permitServiceCharge.permit_above_299_commercial.price;
          }
        }
      }
      amounttopay = this.amounttopay;
    } else {
      this.designCreatedBy = "";
      this.designCreatedByUserParent = "";
    }
    if (this.data.designRaisedbyWattmonk) {
    }
    const mountingtype = this.addDesignDialogForm.get("mountingtype").value;
    let rooftype = null;
    let tilt = null;
    if (mountingtype == "roof") {
      rooftype = this.addDesignDialogForm.get("rooftype").value;
    } else if (mountingtype == "ground") {
      tilt = parseInt(this.addDesignDialogForm.get("tiltgroundmount").value);
    } else {
      rooftype = this.addDesignDialogForm.get("rooftype").value;
      tilt = parseInt(this.addDesignDialogForm.get("tiltgroundmount").value);
    }
    let latitude;
    let longitude;
    let address;
    if (this.formatted_address) {
      address = this.formatted_address;
      if (this.data.isprelimmode) {
        latitude = this.data.prelimData.latitude;
        longitude = this.data.prelimData.longitude;
      } else {
        latitude = this.selectedSiteLocation.latitude;
        longitude = this.selectedSiteLocation.longitude;
      }
    } else {
      address = this.address.value;
      latitude = null;
      longitude = null;
    }

    let designstatus;
    let designoutsourced;
    let raiserequestreason;

    if (this.data.designRaisedbyWattmonk) {
      designstatus = "requestaccepted";
      designoutsourced = "232";
      raiserequestreason =
        this.addDesignDialogForm.get("raiserequestreason").value;
    } else {
      raiserequestreason = "";
      if (this.isoutsourced || this.designCreatedBy) {
        designstatus = "outsourced";
        designoutsourced = "232";
      } else {
        designstatus = "created";
        designoutsourced = null;
      }
    }

    let ahjvalue;
    if (this.ahj.value !== null) {
      ahjvalue = this.ahj.value.trim().toLowerCase();
    } else {
      ahjvalue = null;
    }


    let designinverters = []
    if (this.numberOfInverters.length > 0) {
      this.numberOfInverters.forEach((element, index) => {
        designinverters.push({ invertermake: element.selectedInverterMakeID, invertermodel: element.selectedInverterModelID, invertercount: this.addDesignDialogForm.get('inverterscount' + (index + 1)).value })
      })
    }

    this.isLoading = true;
    this.designService
      .addPermitDesign(
        this.addDesignDialogForm.get("name").value,
        this.addDesignDialogForm.get("email").value,
        this.addDesignDialogForm.get("phone").value.toString(),
        address,
        // parseInt(this.addDesignDialogForm.get("monthlybill").value),
        this.selectedModuleMakeID,
        this.selectedModuleModelID,
        rooftype,
        this.addDesignDialogForm.get("jobtype").value,
        mountingtype,
        tilt,
        this.addDesignDialogForm.get("projecttype").value,
        JSON.parse(this.addDesignDialogForm.get("newconstruction").value),
        this.addDesignDialogForm.get("comments").value,
        this.city.value,
        this.state.value,
        this.country,
        parseInt(this.postalcode),
        "permit",
        latitude,
        longitude,
        false,
        designstatus,
        designoutsourced,
        localStorage.getItem("paymentstatus"),
        this.designCreatedBy,
        this.designCreatedByUserParent,
        this.issurveycompleted,
        this.survey,
        amounttopay,
        this.oldcommentid,
        this.addDesignDialogForm.get("mpurequired").value,
        this.sameemailconfirmed,
        this.isdesigncompleted,
        this.design,
        parseInt(this.addDesignDialogForm.get("modulecount").value),
        parseFloat(this.addDesignDialogForm.get("solarcapacity").value),
        this.utilityname.value.trim().toLowerCase(),
        ahjvalue,
        this.customerid,
        this.esiid.value,
        designinverters,
        this.dataentry,
        raiserequestreason,
      )
      .subscribe(
        (response) => {
          this.data.design = response;
          this.authService.currentUserValue.user.amount =
            response.createdby.amount;
          localStorage.setItem("walletamount", "" + response.createdby.amount);
          this.data.isDataUpdated = true;
          // this.getClientsadmins(this.data.design.creatorparentid);
          if (
            this.israiserequestattachmentUploaded &&
            this.data.designRaisedbyWattmonk
          ) {
            this.uploadraiseRequestAttachmentFile(
              response.id,
              this.raiserequestattachmentfiles[0],
              0
            );
          } else {
            if (this.isAttachmentUploaded) {
              this.uploadSingleAttachmentFile(
                response.id,
                this.attachmentfiles[0],
                0
              );
            } else {
              if (this.isFileUploaded) {
                this.uploadSingleArchitecturalFile(
                  response.id,
                  this.architecturalfiles[0],
                  0
                );
              } else {
                if (this.data.isEditMode) {
                  this.isLoading = false;
                  this.changeDetectorRef.detectChanges();
                  this.notifyService.showSuccess(
                    "Design request data has been updated successfully.",
                    "Success"
                  );
                  this.data.isDataUpdated = true;
                  this.dialogRef.close(this.data);
                } else {
                  this.getClientsadmins(this.data.design.creatorparentid);

                  // this.createNewDesignChatGroup(this.data.design);
                }
              }
            }
          }
          // this.uploadAttachmentDesignFiles(response.id);
        },
        (error) => {
          if (error.status == "alreadyexist") {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            const message = error.message;
            const snackbarRef = this._snackBar.openFromComponent(
              ConfirmationsnackbarComponent,
              {
                data: {
                  message: message + " do you want to create again",
                  positive: "Yes",
                  negative: "No",
                },
              }
            );

            snackbarRef.onAction().subscribe(() => {
              this.sameemailconfirmed = true;
              this.isLoading = true;
              this.addDesignToServer();
            });
          } else {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showError(error, "Error");
          }
        }
      );
  }

  chargeUserForDesignRequest(paymenttype, amount, designid): void {
    this.commonService
      .stripepayment(
        this.genericService.stripepaymenttoken.id,
        this.authService.currentUserValue.user.email,
        this.authService.currentUserValue.user.id,
        amount,
        paymenttype,
        this.appliedCoupan,
        designid,
        this.serviceamount
      )
      .subscribe(
        () => {
          this.assignUserToDesign();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  assignUserToDesign(): void {
    const designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(
      designacceptancestarttime.getMinutes() + 30
    );
    const paymenttype = localStorage.getItem("paymenttype");

    let status;
    if (this.data.designRaisedbyWattmonk) {
      status = "requestaccepted";
    } else {
      status = "outsourced";
    }
    const postData = {
      outsourcedto: 232,
      isoutsourced: "true",
      status: status,
      couponid: this.appliedCoupan ? this.appliedCoupan.id : null,
      designacceptancestarttime: designacceptancestarttime,
      paymenttype: paymenttype,
      slabname: String(this.slabname),
      slabdiscount: this.slabdiscount,
      amount: this.finalAmountopay,
      serviceamount: this.serviceamount,
    };

    this.designService.assignDesign(this.data.design.id, postData).subscribe(
      (response) => {
        // this.isLoading = false;
        // this.changeDetectorRef.detectChanges();
        if (
          this.appliedCoupan?.usestype == "single" &&
          this.copiedcoupon?.id == this.appliedCoupan?.id
        ) {
          localStorage.removeItem("copiedcoupan");
        }
        this.data.design = response;
        localStorage.removeItem("paymenttype");
        localStorage.removeItem("paymentstatus");
        this.createClienChatGroup(response);

        this.newpermitsRef.update({ count: this.newpermitscount + 1 });
        this.companynewpermitsRef.update({
          newpermits: this.companynewpermitscount + 1,
        });
        // this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  editDesignOnServer(): void {
    const mountingtype = this.addDesignDialogForm.get("mountingtype").value;
    let rooftype = null;
    let tilt = null;
    if (mountingtype == "roof") {
      rooftype = this.addDesignDialogForm.get("rooftype").value;
    } else if (mountingtype == "ground") {
      tilt = parseInt(this.addDesignDialogForm.get("tiltgroundmount").value);
    } else {
      rooftype = this.addDesignDialogForm.get("rooftype").value;
      tilt = parseInt(this.addDesignDialogForm.get("tiltgroundmount").value);
    }

    let latitude;
    let longitude;
    let address;

    if (this.selectedSiteLocation) {
      address = this.formatted_address;
      latitude = this.selectedSiteLocation.latitude;
      longitude = this.selectedSiteLocation.longitude;
    } else {
      address = this.address.value;
      latitude = null;
      longitude = null;
    }

    let ahjvalue;
    if (
      this.ahj.value == "" ||
      this.ahj.value == undefined ||
      this.ahj.value === null
    ) {
      ahjvalue = null;
    } else {
      ahjvalue = this.ahj.value.trim().toLowerCase();
    }
    /* if (this.ahj.value != null) {
      ahjvalue = this.ahj.value.trim().toLowerCase();
    }
    else {
      ahjvalue = null;
    }*/


    let designinverters = []
    if (this.numberOfInverters.length > 0) {
      this.numberOfInverters.forEach((element, index) => {
        if (element.newEntry) {
          designinverters.push({ invertermake: element.selectedInverterMakeID, invertermodel: element.selectedInverterModelID, invertercount: this.addDesignDialogForm.get(this.numberOfInverters[index].inverterscountcontrol).value })
        }
      })
    }
    const postData = {
      email: this.addDesignDialogForm.get("email").value,
      name: this.addDesignDialogForm.get("name").value,
      phonenumber: this.addDesignDialogForm.get("phone").value.toString(),
      address: address,
      latitude: latitude,
      longitude: longitude,
      monthlybill: null,
      solarmake: this.selectedModuleMakeID,
      solarmodel: this.selectedModuleModelID,
      rooftype: rooftype,
      mountingtype: mountingtype,
      tiltofgroundmountingsystem: tilt,
      projecttype: this.addDesignDialogForm.get("projecttype").value,
      newconstruction: JSON.parse(
        this.addDesignDialogForm.get("newconstruction").value
      ),
      comments: this.addDesignDialogForm.get("comments").value,
      city: this.city.value,
      state: this.state.value,
      country: this.country,
      postalcode: parseInt(this.postalcode),
      isonpriority: JSON.parse(
        this.addDesignDialogForm.get("prioritytoggle").value
      ),
      oldcommentid: this.oldcommentid,
      mpurequired: this.addDesignDialogForm.get("mpurequired").value,
      jobtype: this.jobtype.value,
      modulecount: this.addDesignDialogForm.get("modulecount").value,
      solarcapacity: parseFloat(
        this.addDesignDialogForm.get("solarcapacity").value
      ),
      utility: this.utilityname.value.trim().toLowerCase(),
      ahj: ahjvalue,
      esiid: this.esiid.value,
      designinverters: designinverters,
      dataentry: this.dataentry
    };
    this.isLoading = true;
    this.designService.editDesign(this.data.design.id, postData).subscribe(
      (response) => {

        this.data.design.designinverters.forEach((element, index) => {
          if (!this.numberOfInverters[index].isSaved && !this.numberOfInverters[index].newEntry) {
            let postData = {
              invertermake: this.numberOfInverters[index].selectedInverterMakeID,
              invertermodel: this.numberOfInverters[index].selectedInverterModelID,
              inverterscount: this.numberOfInverters[index].inverterscount
            }
            this.designService.saveDesignInverters(element.id, postData).subscribe(() => {
            },
              error => {
                this.notifyService.showError(
                  error,
                  "Error"
                );
              })
          }
        })
        this.data.design = response;
        if (this.isAttachmentUploaded) {
          this.uploadSingleAttachmentFile(
            response.id,
            this.attachmentfiles[0],
            0
          );
        } else {
          if (this.isFileUploaded) {
            this.uploadSingleArchitecturalFile(
              response.id,
              this.architecturalfiles[0],
              0
            );
          } else {
            if (this.data.isEditMode) {
              if (this.senddirectlytowattmonk) {
                this.assignUserToDesign();
              } else {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
                this.notifyService.showSuccess(
                  "Design request data has been updated successfully.",
                  "Success"
                );
                this.data.isDataUpdated = true;
                this.dialogRef.close(this.data);
              }
            } else {
              // this.createNewDesignChatGroup(this.data.design);
              this.getClientsadmins(this.data.design.creatorparentid);
            }
          }
        }
        // this.uploadAttachmentDesignFiles(response.id);
      },
      error => {
        this.isLoading = false;
        this.notifyService.showError(
          error,
          "Error"
        );
        console.log(error);
      }
    );
  }

  onArchitecturalFileSelect(event): void {
    this.displayerror = true;
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
        this.isFileUploaded = true;
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
                this.architecturalfiles.push(replacedfile);
                this.architecturalfiles.forEach(
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
          const extension = element.name.substring(element.name.lastIndexOf("."));

          const mimetype = this.genericService.getMimetype(extension);
          // window.console.log(extension, mimetype);
          const data = new Blob([element], {
            type: mimetype,
          });

          const replacedfile = new File([data], element.name, { type: mimetype });
          this.architecturalfiles.push(replacedfile);
        }
      }
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onArchitecturalFileRemove(event): void {
    this.architecturalfiles.splice(this.architecturalfiles.indexOf(event), 1);
    if (this.architecturalfiles.length == 0) {
      this.isFileUploaded = false;
    }
  }

  uploadSingleArchitecturalFile(recordid: number, fileobj: File, index): void {
    this.loadingmessage =
      "Uploading design " +
      (index + 1) +
      " of " +
      this.architecturalfiles.length;
    this.changeDetectorRef.detectChanges();
    this.commonService
      .uploadFile(
        recordid,
        "designs/" + recordid,
        fileobj,
        "architecturaldesign",
        "design"
      )
      .subscribe(
        () => {
          if (index < this.architecturalfiles.length - 1) {
            const newindex = index + 1;
            this.uploadSingleArchitecturalFile(
              recordid,
              this.architecturalfiles[newindex],
              newindex
            );
          } else {
            if (this.data.isEditMode) {
              if (this.senddirectlytowattmonk) {
                this.assignUserToDesign();
              } else {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
                this.notifyService.showSuccess(
                  "Design request data has been updated successfully.",
                  "Success"
                );
                this.data.isDataUpdated = true;
                this.dialogRef.close(this.data);
              }
            } else {
              // this.createNewDesignChatGroup(this.data.design);
              this.getClientsadmins(this.data.design.creatorparentid);
            }
          }
        },
        (error) => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.notifyService.showError(
            error,
            "Some error occurred when uploading file. Please try again."
          );
        }
      );
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
          const extension = element.name.substring(element.name.lastIndexOf("."));

          const mimetype = this.genericService.getMimetype(extension);
          // window.console.log(extension, mimetype);
          const data = new Blob([element], {
            type: mimetype,
          });
          const replacedfile = new File([data], element.name, { type: mimetype });
          replacedfile["isImage"] = element.isImage;
          this.attachmentfiles.push(replacedfile);
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
  onraiserequestattachmentFileSelect(event): void {
    this.raiseattachmentError = true;
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
        this.israiserequestattachmentUploaded = true;
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
                this.raiserequestattachmentfiles.push(replacedfile);
                this.raiseattachmentError = true;
                this.raiserequestattachmentfiles.forEach(
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
          const extension = element.name.substring(element.name.lastIndexOf("."));

          const mimetype = this.genericService.getMimetype(extension);
          // window.console.log(extension, mimetype);
          const data = new Blob([element], {
            type: mimetype,
          });
          const replacedfile = new File([data], element.name, { type: mimetype });
          replacedfile["isImage"] = element.isImage;
          this.raiserequestattachmentfiles.push(replacedfile);
        }
      }
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onraiserequestattachmentFileRemove(event): void {
    this.raiserequestattachmentfiles.splice(
      this.raiserequestattachmentfiles.indexOf(event),
      1
    );
    if (this.raiserequestattachmentfiles.length == 0) {
      this.israiserequestattachmentUploaded = false;
      this.raiseattachmentError = false;
    }
  }
  uploadSingleAttachmentFile(recordid: number, fileobj: File, index): void {
    this.loadingmessage =
      "Uploading attachment " +
      (index + 1) +
      " of " +
      this.attachmentfiles.length;
    this.changeDetectorRef.detectChanges();
    this.commonService
      .uploadFile(
        recordid,
        "designs/" + recordid,
        fileobj,
        "attachments",
        "design"
      )
      .subscribe(
        () => {
          let newindex;

          if (index < this.attachmentfiles.length - 1) {
            newindex = index + 1;
            this.uploadSingleAttachmentFile(
              recordid,
              this.attachmentfiles[newindex],
              newindex
            );
          }
          else {
            if (this.isFileUploaded) {
              this.uploadSingleArchitecturalFile(
                recordid,
                this.architecturalfiles[0],
                0
              );
            } else {
              if (this.data.isEditMode) {
                if (this.senddirectlytowattmonk) {
                  this.assignUserToDesign();
                } else {
                  this.isLoading = false;
                  this.changeDetectorRef.detectChanges();
                  this.notifyService.showSuccess(
                    "Design request data has been updated successfully.",
                    "Success"
                  );
                  this.data.isDataUpdated = true;
                  this.dialogRef.close(this.data);
                }
              } else {
                // this.createNewDesignChatGroup(this.data.design);
                this.getClientsadmins(this.data.design.creatorparentid);
              }
            }
          }
        },
        (error) => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.notifyService.showError(
            error,
            "Some error occurred when uploading file. Please try again."
          );
        }
      );
  }
  uploadraiseRequestAttachmentFile(
    recordid: number,
    fileobj: File,
    index
  ): void {
    this.loadingmessage =
      "Uploading Proof Of Attachment File " +
      (index + 1) +
      " of " +
      this.raiserequestattachmentfiles.length;
    this.changeDetectorRef.detectChanges();
    this.commonService
      .uploadFile(
        recordid,
        "designs/" + recordid,
        fileobj,
        "raiserequestattachment",
        "design"
      )
      .subscribe(
        () => {
          if (index < this.raiserequestattachmentfiles.length - 1) {
            const newindex = index + 1;
            this.uploadraiseRequestAttachmentFile(
              recordid,
              this.raiserequestattachmentfiles[newindex],
              newindex
            );
          } else {
            if (this.isAttachmentUploaded) {
              this.uploadSingleAttachmentFile(
                recordid,
                this.attachmentfiles[0],
                0
              );
            } else {
              if (this.data.isEditMode) {
                if (this.senddirectlytowattmonk) {
                  this.assignUserToDesign();
                } else {
                  this.isLoading = false;
                  this.changeDetectorRef.detectChanges();
                  this.notifyService.showSuccess(
                    "Design request data has been updated successfully.",
                    "Success"
                  );
                  this.data.isDataUpdated = true;
                  this.dialogRef.close(this.data);
                }
              } else {
                // this.createNewDesignChatGroup(this.data.design);
                this.getClientsadmins(this.data.design.creatorparentid);
              }
            }
          }
        },
        (error) => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.notifyService.showError(
            error,
            "Some error occurred when uploading file. Please try again."
          );
        }
      );
  }
  saveModuleMake(): void {
    const found = this.modulemakes.some(
      (el) => el.name === this.addDesignDialogForm.get("modulemake").value
    );
    if (!found) {
      this.commonService
        .addModuleMake(this.addDesignDialogForm.get("modulemake").value)
        .subscribe(
          (response) => {
            this.selectedModuleMakeID = response.id;
            if (this.modulemodel.value.trim().length > 0) {
              this.saveModuleModel();
            } else {
              this.saveInverterMake();
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      if (this.modulemodel.value.trim().length > 0) {
        this.saveModuleModel();
      } else {
        this.saveInverterMake();
      }
    }
  }

  saveModuleModel(): void {
    const ismakefound = this.modulemakes.some(
      (el) => el.name === this.addDesignDialogForm.get("modulemake").value
    );
    const found = this.modulemodels.some(
      (el) => el.name === this.addDesignDialogForm.get("modulemodel").value
    );
    if (!ismakefound || !found) {
      this.commonService
        .addModuleModel(
          this.addDesignDialogForm.get("modulemodel").value,
          this.selectedModuleMakeID
        )
        .subscribe(
          (response) => {
            this.selectedModuleModelID = response.id;
            this.saveInverterMake();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.saveInverterMake();
    }
  }

  saveInverterMake(): void {
    const found = this.invertermakes.some(
      (el) => el.name === this.addDesignDialogForm.get("invertermake").value
    );
    if (!found) {
      this.commonService
        .addInverterMake(this.addDesignDialogForm.get("invertermake").value)
        .subscribe(
          (response) => {
            this.selectedInverterMakeID = response.id;
            if (this.invertermodel.value.trim().length > 0) {
              this.saveInverterModel();
            } else {
              if (this.data.isEditMode) {
                this.editDesignOnServer();
              } else {
                this.addDesignToServer();
              }
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      if (this.invertermodel.value.trim().length > 0) {
        this.saveInverterModel();
      } else {
        if (this.data.isEditMode) {
          this.editDesignOnServer();
        } else {
          this.addDesignToServer();
        }
      }
    }
  }

  saveInverterModel(): void {
    const ismakefound = this.invertermakes.some(
      (el) => el.name === this.addDesignDialogForm.get("invertermake").value
    );
    const found = this.invertermodels.some(
      (el) => el.name === this.addDesignDialogForm.get("invertermodel").value
    );
    if (!ismakefound || !found) {
      this.commonService
        .addInverterModel(
          this.addDesignDialogForm.get("invertermodel").value,
          this.selectedInverterMakeID
        )
        .subscribe(
          (response) => {
            this.selectedInverterModelID = response.id;
            if (this.data.isEditMode) {
              this.editDesignOnServer();
            } else {
              this.addDesignToServer();
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      if (this.data.isEditMode) {
        this.editDesignOnServer();
      } else {
        this.addDesignToServer();
      }
    }
  }

  createNewDesignChatGroup(design: Design): void {
    if (this.isClient) {
      if (this.senddirectlytowattmonk) {
        this.openOrderDesignDialog(design);
      } else {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.notifyService.showSuccess(
          "Design request has been saved successfully.",
          "Success"
        );
        localStorage.removeItem("paymentstatus");
        this.data.isDataUpdated = true;
        this.dialogRef.close(this.data);
      }
    } else {
      /* else if(this.data.designRaisedbyWattmonk){
      this.openOrderDesignDialog(this.data.design,this.data.prelimData);
    }*/
      this.loadingmessage = "Initializing Chat";
      this.changeDetectorRef.detectChanges();
      this.isLoading = true;
      const GUID = design.chatid;

      const address = design.address.substring(0, 90);

      const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
      const groupName = design.name + "_" + address + "_" + currentdatetime;

      const groupType = CometChat.GROUP_TYPE.PASSWORD;
      const password = design.groupchatpassword

      const group = new CometChat.Group(GUID, groupName, groupType, password);
      const adminsid = [];
      adminsid.push(this.loggedInUser.parent.cometchatuid);
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
      adminsid.push(this.loggedInUser.cometchatuid);

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
              this.commonService.addChatGroup(inputData).subscribe(
                () => {
                  // do nothing.
                },
                (error) => {
                  this.notifyService.showError(error, "Error");
                }
              );
              if (this.senddirectlytowattmonk) {
                this.assignUserToDesign();
              } else {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
                this.notifyService.showSuccess(
                  "Design request has been saved successfully.",
                  "Success"
                );
                this.data.isDataUpdated = true;
                this.dialogRef.close(this.data);
              }
            },
            () => {
              this.isLoading = false;
              this.changeDetectorRef.detectChanges();
              this.notifyService.showSuccess(
                "Design request has been saved successfully.",
                "Success"
              );
              this.data.isDataUpdated = true;
              this.dialogRef.close(this.data);
            }
          );
        },
        () => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        }
      );
    }
  }

  onRemoveAttachment(file: UploadedFile, index: number): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.data.design.attachments.splice(index, 1);
        this.data.design.attachments = [...this.data.design.attachments];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onRemoveArchitecturalDesign(file: UploadedFile, index: number): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.data.design.architecturaldesign.splice(index, 1);
        this.data.design.architecturaldesign = [
          ...this.data.design.architecturaldesign,
        ];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  // pestampondeliver(){
  // if(this.pestampingondelivery.value){
  //   this.modeofstamping.setValidators([
  //     Validators.required]);
  //  this.type.setValidators([
  //   Validators.required]);
  // }
  // }

  getWattmonkadmins(companyid?): void {
    this.commonService.getWattmonkAdmins().subscribe(
      (response) => {
        this.wattmonkadmins = response;
        this.commonService.getGroupTeamHead(companyid).subscribe(
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
  getClientsadmins(id): void {
    this.commonService.getClientAdmins(id).subscribe(
      (response) => {
        this.clientadmins = response;
        this.createNewDesignChatGroup(this.data.design);
      },
      (error) => {
        this.createNewDesignChatGroup(this.data.design);
        this.notifyService.showError(error, "Error");
      }
    );
  }
  createClienChatGroup(design: Design): void {
    const GUID = design.chatid;

    const address = design.address.substring(0, 60);
    const groupName = design.name + "_" + address;

    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = design.groupchatpassword;

    const group = new CometChat.Group(GUID, groupName, groupType, password);
    const adminsid = [];
    adminsid.push(this.loggedInUser.parent.cometchatuid);
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
    adminsid.push(this.loggedInUser.cometchatuid);

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
            this.commonService.addChatGroup(inputData).subscribe(
              () => {
                // do nothing.
              },
              (error) => {
                this.notifyService.showError(error, "Error");
              }
            );
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showSuccess(
              "Design request has been successfully assigned to WattMonk.",
              "Success"
            );
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          },
          () => {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showSuccess(
              "Design request has been successfully assigned to WattMonk.",
              "Success"
            );
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          }
        );
      },
      () => {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.notifyService.showSuccess(
          "Design request has been successfully assigned to WattMonk.",
          "Success"
        );
        this.data.isDataUpdated = true;
        this.dialogRef.close(this.data);
      }
    );
  }

  checkAddress(event): void {
    if (event.target.value.length === 0) {
      this.addDesignDialogForm.controls.utilityname.reset();
      this.addDesignDialogForm.controls.ahj.reset();
      this.fetchAllUtilityName();
      this.fetchAllAhj();
    }
  }
  showextrainputfield($event: any, value: string): void {
    if (value == "extramodulemake") {
      this.fetchModuleModelsData($event, "Others");
      // console.log("hello")
      // this.showextramodulemake = true;
      this.modulemake.clearValidators();
      // this.modulemake.setValue("");
      // this.othermodulemake.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")]);
      // this.showextramodulemodel = true;
      // this.modulemodel.clearValidators();
      this.modulemodel.setValue("Others");
      // this.othermodulemodel.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
      this.changeDetectorRef.detectChanges();
    }
    if (value == "extramodulemodel") {
      // this.showextramodulemodel = true;
      this.modulemodel.clearValidators();
      // this.modulemodel.setValue("");
      // this.othermodulemodel.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
    }
    if (value == "extrainvertermodel") {
      // this.showextrainvertermodel = true;
      this.invertermodel.clearValidators();
      // this.invertermodel.setValue("");
      // this.otherinvertermodel.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
    }
    if (value == 'extrainvertermake') {

      // this.fetchInverterModelsData($event, "Others")
      // this.showextrainvertermake = true;
      this.invertermake.clearValidators();
      // this.invertermake.setValue("");
      // this.otherinvertermake.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")]);
      // this.showextrainvertermodel = true;
      this.invertermodel.clearValidators();
      this.invertermodel.setValue("Others");
      this.addextrainverters = false;
      this.changeDetector.detectChanges();
      // this.otherinvertermodel.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
    }
  }

  setCompanyValue(event, companyid): void {
    if (event.isUserInput) {
      this.getWattmonkadmins(companyid);
    }
  }

  resetInvertorModel(i): void {
    this.addDesignDialogForm.get('invertermodel' + Number(i + 1)).patchValue("");
  }
  addMoreInverters() {
    this.numberOfInverters.push({ invertermake: "invertermake" + Number(this.numberOfInverters.length + 1), invertermodel: "invertermodel" + Number(this.numberOfInverters.length + 1), inverterscountcontrol: "inverterscount" + Number(this.numberOfInverters.length + 1), invertermodellist: [], disabledinvertermodel: true, invertermodelfilter: "invertermodelfilter" + Number(this.numberOfInverters.length + 1), selectedInverterMakeID: null, selectedInverterModelID: null, isSaved: false, newEntry: true, invertercount: null })

    this.addDesignDialogForm.addControl('invertermake' + this.numberOfInverters.length, new FormControl('', Validators.required))
    this.addDesignDialogForm.addControl('invertermodel' + this.numberOfInverters.length, new FormControl('', Validators.required))
    this.addDesignDialogForm.addControl('inverterscount' + this.numberOfInverters.length, new FormControl('', Validators.required))
    this.addDesignDialogForm.addControl('invertermodelfilter' + this.numberOfInverters.length, new FormControl(''))
  }
  loadOtherInverterModelsData(make, i) {
    this.numberOfInverters[i].selectedInverterMakeID = make.id;
    if (make.name != "") {
      this.numberOfInverters[i].disabledinvertermodel = false;
      this.commonService.getInverterModelsData(make.id).subscribe(
        response => {

          this.numberOfInverters[i].invertermodellist = response;
          this.changeDetectorRef.detectChanges();
        },
        error => {
          this.notifyService.showError(error, "Error");
        }
      );
    }
  }
  fetchInverterModelsData(event: MatOptionSelectionChange, make, i) {
    if (event.isUserInput) {
      //this.addDesignDialogForm.get('invertermodel' + Number(i + 1)).patchValue('');
      this.numberOfInverters[i].selectedInverterMakeID = make.id;
      this.numberOfInverters[i].disabledinvertermodel = false;
      this.commonService.getInverterModelsData(make.id).subscribe(
        response => {

          this.numberOfInverters[i].invertermodellist = response;
          this.changeDetectorRef.detectChanges();
          if (make.name == 'None') {
            const toSelect = this.numberOfInverters[i].invertermodellist.find(
              (c) => c.name == "None"
            );
            this.addDesignDialogForm.get(this.numberOfInverters[i].invertermodel).patchValue(toSelect.name)
            this.addDesignDialogForm.get(this.numberOfInverters[i].inverterscountcontrol).patchValue(0);
            this.addDesignDialogForm.get(this.numberOfInverters[i].inverterscountcontrol).disable()
            this.numberOfInverters[i].selectedInverterModelID = toSelect.id
            this.numberOfInverters[i].disabledinvertermodel = true;
            this.numberOfInverters[i].isSaved = false;
          }
          else {
            this.addDesignDialogForm.get(this.numberOfInverters[i].inverterscountcontrol).enable()
          }
        },
        error => {
          this.notifyService.showError(error, "Error");
        }
      );
    }
  }
  searchinvertermodels(e) {
    this.searchTerm.name = e.target.value
  }
  setInverterModelId(model, i) {
    if (model.value != 'others') {
      const toSelect = this.numberOfInverters[i].invertermodellist.find(
        (c) => c.name == model.value
      );
      this.numberOfInverters[i].selectedInverterModelID = toSelect.id
      this.numberOfInverters[i].isSaved = false;
    }
    else {
      this.numberOfInverters[i].selectedInverterModelID = null
    }
  }
  removeExtraInverter(index) {
    this.addDesignDialogForm.removeControl('invertermake' + Number(index + 1))
    this.addDesignDialogForm.removeControl('invertermodel' + Number(index + 1))
    this.addDesignDialogForm.removeControl('inverterscount' + Number(index + 1))
    this.addDesignDialogForm.removeControl('invertermodelfilter' + Number(index + 1))
    if (this.data.isEditMode) {
      if (!this.numberOfInverters[index].newEntry) {
        this.designService.deleteDesignInverters(this.data.design.designinverters[index].id).subscribe(() => {
          this.data.design.designinverters.splice(index, 1);
          this.changeDetector.detectChanges();
        },
          error => {
            this.notifyService.showError(error, "Error");
          })


      }
    }
    this.numberOfInverters.splice(index, 1);
  }
  setOtherInverterModel(event: MatOptionSelectionChange, i) {
    if (event.isUserInput) {
      this.numberOfInverters[i].selectedInverterModelID = null;
      this.numberOfInverters[i].isSaved = false;
      //this.numberOfInverters[i].disabledinvertermodel = true;
      this.comments.setValidators([Validators.required]);
      this.comments.updateValueAndValidity();
      var text = "Please enter Inverter Model in comment"
      this.placeholder = "Please enter module make,module model,module count,inverter make,inverter model and inverters count here..";
      this.dialog.open(OtherSelectionPopup, {
        width: "40%",
        height: "20%",
        disableClose: true,
        data: { text: text },
      })
    }
  }

  setOtherInverterMake(event: MatOptionSelectionChange, i) {
    if (event.isUserInput) {
      this.numberOfInverters[i].disabledinvertermodel = false;
      this.numberOfInverters[i].invertermodellist = null
      this.numberOfInverters[i].selectedInverterMakeID = null;
      this.comments.setValidators([Validators.required]);
      this.comments.updateValueAndValidity();
      var text = "Please enter Inverter Make  in comment"
      this.placeholder = "Please enter module make,module model,module count,inverter make,inverter model and inverters count here..";
      this.dialog.open(OtherSelectionPopup, {
        width: "40%",
        height: "20%",
        disableClose: true,
        data: { text: text },
      })
      this.changeDetectorRef.detectChanges();
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
}

export interface otherSelectionDialogData {
  text: string;
}
@Component({
  selector: "otherselectionpopup",
  templateUrl: "otherselectionpopup.html",
})
export class OtherSelectionPopup implements OnInit {
  deliverycommentscontrol = new FormControl("", []);

  constructor(
    public dialogRef: MatDialogRef<otherSelectionDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: otherSelectionDialogData
  ) { }

  ngOnInit(): void {
    // do nothing.
  }
  dialogClose(): void {
    this.dialogRef.close();
  }
}
