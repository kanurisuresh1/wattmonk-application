import { Location } from '@angular-material-extensions/google-maps-autocomplete';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioButton, MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CometChat } from '@cometchat-pro/chat';
import heic2any from "heic2any";
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from "rxjs/operators";
import { OrderprelimdesigndialogComponent } from 'src/app/home/dashboard/prelimdesign/orderprelimdesigndialog/orderprelimdesigndialog.component';
import { ConfirmationsnackbarComponent } from 'src/app/shared/confirmationsnackbar/confirmationsnackbar.component';
import { ADDRESSFORMAT, FIREBASE_DB_CONSTANTS, MAILFORMAT, NAME, ROLES } from 'src/app/_helpers';
import { Design, InverterMake, InverterModel, ModuleMake, ModuleModel, UploadedFile, User } from 'src/app/_models';
import { Company } from 'src/app/_models/company';
import { Probability } from 'src/app/_models/probability';
import { AuthenticationService, DesignService, GenericService, NotificationService } from 'src/app/_services';
import { CommonService } from 'src/app/_services/common.service';
import PlaceResult = google.maps.places.PlaceResult;



export interface DesignFormData {
  isEditMode: boolean;
  isDataUpdated: boolean;
  generateAutocad: boolean;
  user: User;
  design: Design;
  isCustomer: boolean;
  customerassessment: Probability
}

@Component({
  selector: "app-adddesigndialog",
  templateUrl: "./adddesigndialog.component.html",
  styleUrls: ["./adddesigndialog.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdddesigndialogComponent implements OnInit {
  nameField: MatRadioButton;
  min = 3;
  max = 3;
  paymenttype;
  isoutsourced = false;
  selectedSiteLocation: Location;

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

  isLoading = false;
  assigntowattmonk = false;
  loadingmessage = "Saving data";
  oldcommentid;
  serviceamount: number;

  prioritytoggle = new FormControl("", []);

  company = new FormControl("", []);

  name = new FormControl("", [
    Validators.required,
    Validators.minLength(2),
    Validators.pattern(NAME),
  ]);
  email = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  modulemake = new FormControl("", [Validators.required,
  Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")
  ]);
  modulemodel = new FormControl("", [Validators.required,
  Validators.pattern(".*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")

  ]);
  invertermake = new FormControl("", [
    Validators.required,

    Validators.pattern("^.*\\S.*[a-zA-Z-_ ]{2,}$")
  ]);
  invertermodel = new FormControl("", [
    Validators.required,

    Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")
  ]);
  inverterscount = new FormControl("", [
    Validators.required,
    Validators.min(1),
    Validators.maxLength(7),
    Validators.pattern("^[0-9]{1,7}$"),
  ]);
  address = new FormControl("", [
    Validators.required,
    Validators.pattern(ADDRESSFORMAT),
    Validators.maxLength(300),
  ]);
  monthlybill = new FormControl("", [
    Validators.required,
    Validators.min(1),
    Validators.pattern("^[0-9]+$"),
  ]);
  newconstruction = new FormControl("", [Validators.required]);
  comments = new FormControl("", []);

  rooftype = new FormControl("", []);
  mountingtype = new FormControl("", [Validators.required]);
  tiltgroundmount = new FormControl("", []);
  projecttype = new FormControl("", [Validators.required]);
  addDesignDialogForm: FormGroup;

  displayerror = true;
  formatted_address: string;
  postalcode: string;
  city: string;
  state: string;
  country: string;
  user: User;
  architecturalfiles: File[] = [];
  isFileUploaded = false;
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  loggedInUser: User;
  isClient = false;
  appliedCoupan;
  aresitedetailsvalid = true;
  aremakedetailsvalid = true;
  aremountingdetailsvalid = true;
  finalAmountopay;
  senddirectlytowattmonk = false;
  slabdiscount = 0;
  servicecharge = 0;
  newprelims: Observable<any>;
  newprelimsRef: AngularFireObject<any>;
  newprelimscount = 0;
  wattmonkadmins: User[] = [];

  companynewprelims: Observable<any>;
  companynewprelimsRef: AngularFireObject<any>;
  companynewprelimscount = 0;
  sameemailconfirmed = null;

  servicecharges: AngularFireObject<any>;
  servicechargedata: Observable<any>;
  siteAssessmentServiceCharge;
  amounttopay;
  invertermakevalue = "";
  teamheadroleid = 0;
  bdroleid = 0;
  clientadmins;
  othermodulemake = new FormControl(null);
  modulemakefilter = new FormControl("");
  modulemodelfilter = new FormControl("");
  othermodulemodel = new FormControl(null);
  otherinvertermake = new FormControl(null);
  invertermakefilter = new FormControl("");
  otherinvertermodel = new FormControl(null);
  invertermodelfilter = new FormControl("");

  showextramodulemake = "";
  showextramodulemodel = "";
  showextrainvertermake = "";
  showextrainvertermodel = "";
  extra: boolean = false;
  customerid: number;
  copiedcoupon: any
  numberOfInverters: any = [];
  searchTerm: any = { name: '' };
  placeholder = "Start typing here..."
  dataentry: boolean = false;
  addextrainverters = true;
  limit = 10;
  skip = 0;
  scrolling: boolean = false;
  companyListlength;
  constructor(public dialogRef: MatDialogRef<AdddesigndialogComponent>,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private notifyService: NotificationService,
    private commonService: CommonService,
    private designService: DesignService,
    private genericService: GenericService,
    private authService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private db: AngularFireDatabase,
    @Inject(MAT_DIALOG_DATA) public data: DesignFormData) {
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
      this.loggedInUser.parent.id == 232 &&
      (this.loggedInUser.role.id == ROLES.SuperAdmin ||
        this.loggedInUser.role.id == ROLES.Admin ||
        this.loggedInUser.role.id == ROLES.TeamHead ||
        this.loggedInUser.role.id == ROLES.BD)
    ) {
      this.company.setValidators(Validators.required);
    }

    this.teamheadroleid = ROLES.TeamHead;
    this.bdroleid = ROLES.BD;
    this.addDesignDialogForm = new FormGroup({
      email: this.email,
      name: this.name,
      address: this.address,
      company: this.company,
      monthlybill: this.monthlybill,
      modulemake: this.modulemake,
      modulemodel: this.modulemodel,
      rooftype: this.rooftype,
      mountingtype: this.mountingtype,
      tiltgroundmount: this.tiltgroundmount,
      projecttype: this.projecttype,
      newconstruction: this.newconstruction,
      comments: this.comments,
      prioritytoggle: this.prioritytoggle,
    });
    this.prioritytoggle.setValue(false);
    this.newconstruction.setValue("false");
    this.projecttype.setValue("residential");

    if (data.isEditMode) {
      this.addDesignDialogForm.patchValue({
        email: data.design.email,
        name: data.design.name,
        // company: data.design.createdby.companyname,
        address: data.design.address,
        monthlybill: data.design.monthlybill,
        modulemake: data.design.solarmake?.name || "",
        modulemodel: data.design.solarmodel?.name || "",
        rooftype: data.design.rooftype,
        projecttype: data.design.projecttype,
        newconstruction: data.design.newconstruction.toString(),
        mountingtype: data.design.mountingtype,
        tiltgroundmount: data.design.tiltofgroundmountingsystem,
        prioritytoggle: data.design.isonpriority,
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

        // this.showextrainvertermodel=true;
        this.otherinvertermodel.setValue(data.design.newinvertermade);
        this.invertermodel.clearValidators();
        this.otherinvertermodel.setValidators([Validators.required, Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
        this.invertermodel.setValue("Others");
      }
      if (data.design.newinvertermake != null) {
        // this.showextrainvertermake =true;
        this.extra = true;
        this.otherinvertermake.setValue(data.design.newinvertermake);
        this.invertermake.clearValidators();
        this.otherinvertermake.setValidators([Validators.required, Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")]);
        this.invertermake.setValue("Others");

      }
      if (data.design.newmodulemake != null) {
        // this.showextramodulemake=true;
        this.othermodulemake.setValue(data.design.newmodulemake);
        this.modulemake.clearValidators();
        this.othermodulemake.setValidators([Validators.required, Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")]);
        this.modulemake.setValue("Others");
      }
      if (data.design.newmodulemade != null) {
        // this.showextramodulemodel=true;
        this.othermodulemodel.setValue(data.design.newmodulemade);
        this.modulemodel.clearValidators();
        this.othermodulemodel.setValidators([Validators.required, Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
        this.modulemodel.setValue("Others");
      }
      this.formatted_address = data.design.address;
      this.city = data.design.city;
      this.state = data.design.state;
      this.country = data.design.country;
      this.postalcode = data.design.postalcode;
      this.selectedModuleMakeID = data.design.solarmake?.id || null;
      this.selectedModuleModelID = data.design.solarmodel?.id || null;
      this.selectedInverterMakeID = data.design.invertermake?.id || null;
      this.selectedInverterModelID = data.design.invertermodel?.id || null;
      if (data.design.designinverters.length) {
        data.design.designinverters.forEach((element, index) => {
          this.numberOfInverters.push({ invertermake: "invertermake" + Number(this.numberOfInverters.length + 1), invertermodel: "invertermodel" + Number(this.numberOfInverters.length + 1), inverterscountcontrol: "inverterscount" + Number(this.numberOfInverters.length + 1), invertermodellist: [], disabledinvertermodel: false, invertermodelfilter: "invertermodelfilter" + Number(this.numberOfInverters.length + 1), selectedInverterMakeID: element.invertermake?.id || null, selectedInverterModelID: element.invertermodel?.id || null, isSaved: true, newEntry: false, })

          this.addDesignDialogForm.addControl('invertermake' + this.numberOfInverters.length, new FormControl(element.invertermake?.name, Validators.required))
          this.addDesignDialogForm.get('invertermake' + this.numberOfInverters.length).patchValue(element.invertermake?.name || "Others");
          this.addDesignDialogForm.addControl('invertermodel' + this.numberOfInverters.length, new FormControl(element.invertermodel?.name, Validators.required))
          this.addDesignDialogForm.get('invertermodel' + this.numberOfInverters.length).patchValue(element.invertermodel?.name || "Others")
          this.addDesignDialogForm.addControl('inverterscount' + this.numberOfInverters.length, new FormControl(element.inverterscount, Validators.required))
          this.addDesignDialogForm.get('inverterscount' + this.numberOfInverters.length).patchValue(element.inverterscount)
          if (element.invertermake != null) {
            this.loadOtherInverterModelsData(element.invertermake?.id, index)
          }
        })

      }
    } else {
      this.inverterscount.setValue(1);
      if (
        this.genericService.assessmentpreviousSolarInverterMake != undefined
      ) {
        this.addDesignDialogForm.patchValue({
          modulemake:
            this.genericService.assessmentpreviousSolarInverterMake.solarmake
              ?.name || "",
          modulemodel:
            this.genericService.assessmentpreviousSolarInverterMake.solarmodel
              ?.name || "",
          invertermake:
            this.genericService.assessmentpreviousSolarInverterMake.invertermake
              ?.name || "",
          invertermodel:
            this.genericService.assessmentpreviousSolarInverterMake
              .invertermodel?.name || "",
        });
        this.selectedModuleMakeID =
          this.genericService.assessmentpreviousSolarInverterMake.solarmake
            ?.id || null;
        this.selectedModuleModelID =
          this.genericService.assessmentpreviousSolarInverterMake.solarmodel
            ?.id || null;
        this.selectedInverterMakeID =
          this.genericService.assessmentpreviousSolarInverterMake.invertermake
            ?.id || null;
        this.selectedInverterModelID =
          this.genericService.assessmentpreviousSolarInverterMake.invertermodel
            ?.id || null;
        // this.changeDetectorRef.detectChanges();
      }
      this.numberOfInverters.push({ invertermake: "invertermake1", invertermodel: "invertermodel1", inverterscountcontrol: "inverterscount1", invertermodellist: [], disabledinvertermodel: true, invertermodelfilter: "invertermodelfilter1", selectedInverterMakeID: null, selectedInverterModelID: null, isSaved: true, newEntry: false, invertercount: null })
      this.addDesignDialogForm.addControl('invertermake1', new FormControl("", Validators.required))
      this.addDesignDialogForm.addControl('invertermodel1', new FormControl("", Validators.required))
      this.addDesignDialogForm.addControl('inverterscount1', new FormControl("", Validators.required))
    }

    if (data.isCustomer) {

      this.addDesignDialogForm.patchValue({
        name: data.customerassessment?.name, email: data.customerassessment?.email, address: data.customerassessment?.address
      })
      this.customerid = this.data.customerassessment.id;
      this.city = this.data.customerassessment.city;
      this.state = this.data.customerassessment.state;
      this.country = this.data.customerassessment.county;
      this.postalcode = this.data.customerassessment.zipcode.toString();
    }

    this.newprelimsRef = this.db.object('newprelimdesigns');
    this.newprelims = this.newprelimsRef.valueChanges();
    this.newprelims.subscribe(
      (res) => {
        this.newprelimscount = res.count;
      }
      // (err) => console.log(err),
      // () => console.log('done!')
    );

    this.companynewprelimsRef = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + this.loggedInUser.parent.id);
    this.companynewprelims = this.companynewprelimsRef.valueChanges();
    this.companynewprelims.subscribe(
      (res) => {
        this.companynewprelimscount = res.newprelims;
        changeDetectorRef.detectChanges();
      }
      // (err) => console.log(err),
      // () => console.log('done!')
    );

    this.servicecharges = this.db.object("service_charges");
    this.servicechargedata = this.servicecharges.valueChanges();
    this.servicechargedata.subscribe(
      (res) => {
        this.siteAssessmentServiceCharge = res;
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
      // if (!this.isClient) {
      //   this.getCompanies= this.genericService.companies
      // }
      if (!this.isClient) {
        this.fetchCompaniesData();
      } else {
        this.getWattmonkadmins();
      }
      this.fetchModuleMakesData();
      this.fetchInverterMakesData();
      if (this.data.isEditMode) {
        this.loadModuleModelsData();
        //this.loadInverterModelsData();
      }
    });
    this.copiedcoupon = JSON.parse(localStorage.getItem("copiedcoupan"));
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


  onInverterMakechnage(value): void {

    if (value == '') {
      this.selectedInverterMakeID = null;
      this.selectedInverterModelID = null;
      this.addDesignDialogForm.patchValue({ invertermodel: "" });
      this.invertermodel.clearValidators();
      this.invertermodel.updateValueAndValidity();
    }
  }
  radioChange($event: MatRadioChange): void {

    if ($event.source.name === 'mountingtype') {
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

  }

  onAutocompleteSelected(result: PlaceResult): void {
    this.formatted_address = result.formatted_address;
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

  onLocationSelected(location: Location): void {
    this.selectedSiteLocation = location;
  }

  displayFnModuleMake(modulemake: ModuleMake): string {
    return modulemake && modulemake.name ? modulemake.name : "";
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

  getErrorMessage(control: FormControl): string | string | string | string | string | string | string | string | string | string | string | string | string | string | string {
    if (control == this.mountingtype && control.hasError("required")) {
      return "You must select a value";
    }
    if (control == this.projecttype && control.hasError("required")) {
      return "You must select a value";
    }
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    if (control == this.name) {
      return this.name.hasError("pattern")
        ? "Name must contain only alphabets."
        : this.name.hasError("minlength")
          ? "Name should be of min 2 character."
          : "";
    } else if (control == this.email) {
      return this.email.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    } else if (control == this.monthlybill) {
      return this.monthlybill.hasError("pattern")
        ? "Please enter a valid annual unit."
        : "zero value is not accepted";
    } else if (control == this.tiltgroundmount) {
      return this.tiltgroundmount.hasError("pattern")
        ? "Please enter a valid tilt value for ground mount."
        : "";
    } else if (control == this.address) {
      return this.address.hasError("pattern")
        ? "Please enter a valid address."
        : "";
    } else if (control == this.modulemake) {
      return this.modulemake.hasError("pattern")
        ? "min character limit is three."
        : "Please enter a valid format";
    } else if (control == this.modulemodel) {
      return this.modulemodel.hasError("pattern")
        ? "min character limit is three."
        : "Please enter a valid format";
    } else if (control == this.invertermake) {
      return this.invertermake.hasError("pattern")
        ? "min character limit is three."
        : "Please enter a valid format";
    } else if (control == this.invertermodel) {
      return this.invertermodel.hasError("pattern")
        ? "min character limit is three."
        : "Please enter a valid format";
    } else if (control == this.inverterscount) {
      return this.inverterscount.hasError("pattern")
        ? "Please enter a valid inverters count number only."
        : "Inverters count should be of min. 1 and max. 7 characters.";
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
  // private _filterCompanies(companyname: string): User[] {
  //   return this.getCompanies.filter(
  //     company => company.companyname.toLowerCase().indexOf(companyname) != -1
  //   );
  // }

  // proxyValue: any; onCompanyChanged(event$) {
  //   this.proxyValue = event$.option.value.companyname;
  //   this.designCreatedBy = event$.option.value.companyid;
  //   this.designCreatedByUserParent = event$.option.value.parentid;
  // }
  oncompanyScroll(): void {
    this.scrolling = true;
    this.skip += 10;
    this.fetchCompaniesData();
    this.companyListlength == this.limit ? this.scrolling = true : this.scrolling = false;
  }
  fetchCompaniesData(): void {
    this.commonService.getClients(this.limit, this.skip).subscribe(
      (response) => {
        //this.getCompanies = response;
        this.companyListlength = response.length;
        this.scrolling = false;
        this.companyList = [...this.companyList, ...response];
        this.changeDetectorRef.detectChanges();
        if (this.data.isEditMode) {
          const toSelect = this.companyList.find(c => c.companyname == this.data.design.createdby?.company);
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
      this.addDesignDialogForm.patchValue({ modulemodel: "" })
      this.modulemodel.setValue("");

    }
    else {
      this.dialog.open(OtherSelectionPopup, {
        width: "40%",
        height: "20%",
        disableClose: true,
        data: { text: " Please enter module make and module model in comments " },
      })
    }

    if (this.modulemake.value == "Others" || this.modulemodel.value == "Others" || this.invertermake.value == "Others" || this.invertermodel.value == "Others") {
      this.placeholder = "Please enter module make,module model,inverter make,inverter model and inverterscount here..";
    }
    else {
      this.placeholder = "Start typing here..."
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
    if (this.modulemake.value != '' && this.modulemake.value != undefined) {
      this.modulemodel.setValidators([Validators.required, Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
      this.modulemodel.updateValueAndValidity();
    }
  }

  invertermodelempty(i) {
    if (this.addDesignDialogForm.get(this.numberOfInverters[i].invertermake).value == "None" || this.addDesignDialogForm.get(this.numberOfInverters[i].invertermodel).value == "None") {
      this.addextrainverters = false;
      this.changeDetectorRef.detectChanges();
    }
    else {
      this.addextrainverters = true;
      this.changeDetectorRef.detectChanges();
    }
    this.addDesignDialogForm.get(this.numberOfInverters[i].invertermodel).setValue("")
  }

  modulemodelrefresh(): void {
    if (this.modulemodel.value != "Others" && this.modulemodel.value != null && this.modulemodel.value != "") {
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
      })
    }
    if (this.modulemake.value == "Others" || this.modulemodel.value == "Others" || this.invertermake.value == "Others" || this.invertermodel.value == "Others") {
      this.placeholder = "Please enter module make,module model,inverter make,inverter model and inverterscount here..";
    }
    else {
      this.placeholder = "Start typing here..."
      this.comments.clearValidators();
      this.comments.updateValueAndValidity();
    }
  }

  invertermodelrefresh(): void {
    if (this.invertermodel.value != "Others" && this.invertermodel.value != null && this.invertermodel.value != "") {
      // this.showextrainvertermodel=false;
      this.otherinvertermodel.clearValidators();
      // this.otherinvertermodel.setValue(null); 
      if (this.modulemake.value == "Others" || this.modulemodel.value == "Others" || this.invertermake.value == "Others" || this.invertermodel.value == "Others") {
        this.placeholder = "Please enter module make,module model,inverter make,inverter model and inverterscount here..";
      }
      else {
        this.placeholder = "Start typing here..."
        this.comments.clearValidators();
        this.comments.updateValueAndValidity();
      }
    }
    if (this.invertermodel.value == "Others") {
      this.dialog.open(OtherSelectionPopup, {
        width: "40%",
        height: "20%",
        disableClose: true,
        data: { text: " Please enter  inverter model and counts in comments " },
      })
    }
  }

  fetchModuleModelsData(_event: any, make): void {
    // this.addDesignDialogForm.patchValue({ modulemodel: " " })
    this.modulemake.setValidators([Validators.required, Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")]);
    if (_event.isUserInput) {
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
    this.selectedModuleModelID = model.id;
    this.modulemodel.setValidators([Validators.required, Validators.pattern(".*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
    if (this.modulemake.value == "Others" || this.modulemodel.value == "Others" || this.invertermake.value == "Others" || this.invertermodel.value == "Others") {
      this.placeholder = "Please enter module make,module model,inverter make,inverter model and inverterscount here..";
    }
    else {
      this.placeholder = "Start typing here..."
    }
  }

  fetchInverterMakesData(): void {
    this.invertermake.setValidators([Validators.required, Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")]);
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



  setSelectedInverterModel(model): void {
    this.selectedInverterModelID = model.id;
    this.otherinvertermodel.clearValidators();
    this.otherinvertermodel.setValue(null);
    this.invertermodel.setValidators([Validators.required, Validators.pattern(".*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
  }

  onSaveDesign(): void {
    this.senddirectlytowattmonk = false;
    this.isoutsourced = false;
    if (this.modulemake.value == "Others" || this.modulemodel.value == "Others" || this.invertermake.value == "Others" || this.invertermodel.value == "Others") {
      this.comments.setValidators([Validators.required]);
      this.comments.updateValueAndValidity();
      this.dataentry = true;
    }

    if (this.loggedInUser.role.id == ROLES.TeamHead) {
      this.addDesignDialogForm.controls["company"].clearValidators();
      this.addDesignDialogForm.controls["company"].updateValueAndValidity();
    }
    if (this.invertermake.value != "" && this.invertermake.value != undefined) {
      this.invertermodel.setValidators([Validators.required]);
      this.invertermodel.updateValueAndValidity();
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
      if (this.invertermake.value == "Others") {
        this.invertermake.setValue(null);
        this.invertermodel.setValue(null);
        this.selectedInverterMakeID = null;
        this.selectedInverterModelID = null;
      } else if (this.invertermodel.value == "Others") {
        this.invertermodel.setValue(null);
        this.selectedInverterModelID = null;
      }
      // this.patchFormattedValues();
      if (
        this.newconstruction.value == "true" &&
        this.architecturalfiles.length == 0 &&
        !this.data.isEditMode
      ) {
        this.displayerror = false;
        this.addDesignDialogForm.markAllAsTouched();
      } else if (this.data.isEditMode && this.newconstruction.value == "true") {
        if (
          this.data.design.architecturaldesign.length == 0 &&
          this.architecturalfiles.length == 0
        ) {
          this.displayerror = false;
          this.addDesignDialogForm.markAllAsTouched();
        } else {
          this.isLoading = true;
          this.loadingmessage = "Saving data";
          this.changeDetectorRef.detectChanges();
          // if (this.data.isEditMode) {
          this.editDesignOnServer();
          // } else {
          //   this.addDesignToServer();
          // }
        }
      } else {
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
      this.displayerror = false;
      this.addDesignDialogForm.markAllAsTouched();
      this.changeDetectorRef.detectChanges();
    }
  }

  onOrderDesign($ev): void {
    $ev.preventDefault();

    this.senddirectlytowattmonk = true;
    if (this.modulemake.value == "Others" || this.modulemodel.value == "Others" || this.invertermake.value == "Others" || this.invertermodel.value == "Others") {
      this.comments.setValidators([Validators.required]);
      this.comments.updateValueAndValidity();
      this.dataentry = true
    }
    // if (this.invertermake.value != '') {
    //   this.invertermodel.setValidators([Validators.required]);
    //   this.invertermodel.updateValueAndValidity();
    // }
    if (this.addDesignDialogForm.valid) {
      if (this.modulemake.value == "Others") {
        this.modulemake.setValue(null);
        this.modulemodel.setValue(null);
      } else if (this.modulemodel.value == "Others") {
        this.modulemodel.setValue(null);
      }
      if (this.invertermake.value == "Others") {
        this.invertermake.setValue(null);
        this.invertermodel.setValue(null);
      }
      else if (this.invertermodel.value == "Others") {
        this.invertermodel.setValue(null);
      }
      // this.patchFormattedValues();
      if (
        this.newconstruction.value == "true" &&
        this.architecturalfiles.length == 0 &&
        !this.data.isEditMode
      ) {
        this.displayerror = false;
        this.addDesignDialogForm.markAllAsTouched();
      } else if (this.data.isEditMode && this.newconstruction.value == "true") {
        if (
          this.data.design.architecturaldesign.length == 0 &&
          this.architecturalfiles.length == 0
        ) {
          this.displayerror = false;
          this.addDesignDialogForm.markAllAsTouched();
        } else {
          // if (!this.data.isEditMode) {
          //   this.addDesignToServer();
          // } else {
          this.assigntowattmonk = true;
          this.isLoading = true;
          this.loadingmessage = "Saving data";
          this.changeDetectorRef.detectChanges();
          // if (this.data.isEditMode) {
          this.editDesignOnServer();
          // } else {
          //   this.addDesignToServer();
          // }

          // }
        }
      } else {
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        this.changeDetectorRef.detectChanges();
        if (!this.data.isEditMode) {
          this.addDesignToServer();
        } else {
          this.assigntowattmonk = true;
          this.editDesignOnServer();
        }
      }
    } else {
      this.isLoading = false;
      this.displayerror = false;
      this.addDesignDialogForm.markAllAsTouched();
      this.changeDetectorRef.detectChanges();
    }
  }

  patchFormattedValues(): void {
    const controls = this.addDesignDialogForm.controls;

    for (const name in controls) {
      try {
        // this.addDesignDialogForm.get(name).patchValue(this.addDesignDialogForm.get(name).value.replace(/['"]+/g, ''));
        this.addDesignDialogForm
          .get(name)
          .patchValue(
            this.addDesignDialogForm.get(name).value.replace(/<\/?.+?>/gi, "")
          );
      } catch (error) { }
    }
  }

  openOrderDesignDialog(design): void {
    let appliedcoupan: any;
    let amounttopay: any;
    const dialogRef = this.dialog.open(OrderprelimdesigndialogComponent, {
      width: "30%",
      panelClass: "white-modalbox",
      autoFocus: false,
      disableClose: true,
      data: { isConfirmed: false, isLater: false, requiremnttype: "assessment", design: design, appliedcoupan: appliedcoupan, amounttopay: amounttopay, serviceamount: Number }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.finalAmountopay = result.amounttopay;
        this.serviceamount = result.serviceamount;
        if (result.appliedcoupan != null) {
          this.appliedCoupan = result.appliedcoupan;
        }
        this.assigntowattmonk = true;
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        const paymenttype = localStorage.getItem("paymenttype");
        if (paymenttype == "direct" && this.loggedInUser.ispaymentmodeprepay) {
          this.chargeUserForDesignRequest(
            paymenttype,
            this.finalAmountopay,
            this.data.design.id
          );
        } else {
          this.assignUserToDesign();
        }
        this.changeDetectorRef.detectChanges();
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
    this.isLoading = true
    const companydata = this.addDesignDialogForm.get("company").value;
    let amount = null;
    if (companydata) {
      this.designCreatedBy = companydata.companyid;
      this.designCreatedByUserParent = companydata.companyid;
      if (this.projecttype.value == 'residential') {
        this.amounttopay = this.siteAssessmentServiceCharge.assessment_residential.price;
      }
      else if ((this.projecttype.value == 'commercial' || this.projecttype.value == 'detachedbuildingorshop' || this.projecttype.value == 'carport')) {
        const solarCapcity = this.monthlybill.value / 1150;
        if (solarCapcity > 0 && solarCapcity <= 49) {
          this.amounttopay =
            this.siteAssessmentServiceCharge.assessment_0_49commercial.price;
        } else if (solarCapcity > 49 && solarCapcity <= 99) {
          this.amounttopay =
            this.siteAssessmentServiceCharge.assessment_50_99commercial.price;
        } else if (solarCapcity > 99 && solarCapcity <= 199) {
          this.amounttopay =
            this.siteAssessmentServiceCharge.assessment_100_199commercial.price;
        } else if (solarCapcity > 199 && solarCapcity <= 299) {
          this.amounttopay =
            this.siteAssessmentServiceCharge.assessment_200_299commercial.price;
        } else if (solarCapcity > 299) {
          this.amounttopay =
            this.siteAssessmentServiceCharge.assessment_200_299commercial.price;
          for (let i = 300; i <= solarCapcity; i = i + 100) {
            this.amounttopay +=
              this.siteAssessmentServiceCharge.assessment_above_299_commercial.price;
          }
        }
      }
      amount = this.amounttopay;
    } else {
      this.designCreatedBy = "";
      this.designCreatedByUserParent = "";
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
    if (this.selectedSiteLocation) {
      address = this.formatted_address;
      latitude = this.selectedSiteLocation.latitude;
      longitude = this.selectedSiteLocation.longitude;
    } else {
      address = this.address.value;
      latitude = null;
      longitude = null;
    }

    let designstatus;
    let designoutsourced;
    if (this.isoutsourced || this.designCreatedBy) {
      designstatus = "outsourced";
      designoutsourced = "232";
    } else {
      designstatus = "created";
      designoutsourced = null;
    }

    let designinverters = []
    if (this.numberOfInverters.length > 0) {
      this.numberOfInverters.forEach((element, index) => {
        designinverters.push({ invertermake: element.selectedInverterMakeID, invertermodel: element.selectedInverterModelID, invertercount: this.addDesignDialogForm.get('inverterscount' + (index + 1)).value })
      })
    }
    this.isLoading = true;
    this.designService
      .addSiteAssessment(
        this.addDesignDialogForm.get("name").value,
        this.addDesignDialogForm.get("email").value,
        address,
        parseInt(this.addDesignDialogForm.get("monthlybill").value),
        this.selectedModuleMakeID,
        this.selectedModuleModelID,
        rooftype,
        mountingtype,
        tilt,
        this.addDesignDialogForm.get("projecttype").value,
        JSON.parse(this.addDesignDialogForm.get("newconstruction").value),
        this.addDesignDialogForm.get("comments").value,
        this.city,
        this.state,
        this.country,
        parseInt(this.postalcode),
        "prelim",
        latitude,
        longitude,
        JSON.parse(this.addDesignDialogForm.get("prioritytoggle").value),
        designstatus,
        designoutsourced,
        localStorage.getItem("paymentstatus"),
        this.designCreatedBy,
        this.designCreatedByUserParent,
        "assessment",
        this.oldcommentid,
        this.sameemailconfirmed,
        amount,
        this.customerid,
        this.othermodulemake.value,
        this.othermodulemodel.value,
        this.otherinvertermake.value,
        this.otherinvertermodel.value,
        this.dataentry,
        designinverters
      )
      .subscribe(
        (response) => {
          this.data.design = response;
          this.authService.currentUserValue.user.amount =
            response.createdby.amount;
          localStorage.setItem("walletamount", "" + response.createdby.amount);
          this.data.isDataUpdated = true;
          // this.getClientsadmins(this.data.design.creatorparentid);
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
                // this.createNewDesignChatGroup(this.data.design);
                this.getClientsadmins(this.data.design.creatorparentid);
              }
            }
          }
          localStorage.removeItem("paymenttype");
          localStorage.removeItem("paymentstatus");
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
    this.commonService.stripepayment(this.genericService.stripepaymenttoken.id, this.authService.currentUserValue.user.email, this.authService.currentUserValue.user.id, amount, paymenttype, this.appliedCoupan, designid, this.serviceamount
    ).subscribe(
      () => {
        this.assignUserToDesign()
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }

    )
  }

  assignUserToDesign(): void {
    const designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(
      designacceptancestarttime.getMinutes() + 15
    );
    const paymenttype = localStorage.getItem("paymenttype");

    const postData = {
      amount: this.finalAmountopay,
      outsourcedto: 232,
      isoutsourced: "true",
      status: "outsourced",
      couponid: this.appliedCoupan ? this.appliedCoupan.id : null,
      designacceptancestarttime: designacceptancestarttime,
      paymenttype: paymenttype,
      serviceamount: this.serviceamount,
    };

    this.designService.assignDesign(this.data.design.id, postData).subscribe(
      (response) => {
        this.authService.currentUserValue.user.amount =
          response.createdby.amount;
        localStorage.setItem("walletamount", "" + response.createdby.amount);
        if (
          this.appliedCoupan?.usestype == "single" &&
          this.copiedcoupon?.id == this.appliedCoupan?.id
        ) {
          localStorage.removeItem("copiedcoupan");
        }

        this.createClientchatgroup(response);
        this.data.design = response;
        this.newprelimsRef.update({ count: this.newprelimscount + 1 });
        this.companynewprelimsRef.update({
          newprelims: this.companynewprelimscount + 1,
        });
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

    let designinverters = []
    if (this.numberOfInverters.length > 0) {
      this.numberOfInverters.forEach((element, index) => {
        if (element.newEntry) {
          designinverters.push({ invertermake: element.selectedInverterMakeID, invertermodel: element.selectedInverterModelID, invertercount: this.addDesignDialogForm.get('inverterscount' + (index + 1)).value })
        }
      })
    }
    const postData = {
      email: this.addDesignDialogForm.get("email").value,
      name: this.addDesignDialogForm.get("name").value,
      address: address,
      latitude: latitude,
      longitude: longitude,
      monthlybill: parseInt(this.addDesignDialogForm.get("monthlybill").value),
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
      city: this.city,
      state: this.state,
      country: this.country,
      postalcode: parseInt(this.postalcode),
      isonpriority: JSON.parse(
        this.addDesignDialogForm.get("prioritytoggle").value
      ),
      oldcommentid: this.oldcommentid,
      dataentry: this.dataentry,
      designinverters: designinverters
    };
    this.isLoading = true;
    this.designService.editDesign(this.data.design.id, postData).subscribe(
      (response) => {
        this.data.design = response;
        this.isLoading = true;
        this.data.design.designinverters.forEach((element, index) => {
          if (!this.numberOfInverters[index].isSaved && !this.numberOfInverters[index].newEntry) {
            let postData = {
              invertermake: this.numberOfInverters[index].selectedInverterMakeID,
              invertermodel: this.numberOfInverters[index].selectedInverterModelID,
              inverterscount: this.addDesignDialogForm.get(this.numberOfInverters[index].inverterscountcontrol).value
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
        this.changeDetectorRef.detectChanges();
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
      },
      (error) => {
        this.isLoading = false;
        this.notifyService.showError(error, "Error");
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
    this.loadingmessage = "Uploading design " + (index + 1) + " of " + this.architecturalfiles.length;
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
        this.notifyService.showError("Web archive file format is not supported", "Error");
      }
      else {
        this.isAttachmentUploaded = true;
        element.isImage = false;
        if (element.type.includes('image')) {
          element.isImage = true;
        }
        if (type[1] == 'heic' || type[1] == 'HEIC') {
          element.isImage = true;
          const reader = new FileReader();
          reader.onload = (event: any) => {
            fetch(event.target.result)
              .then((res) => res.blob())
              .then((blob) => heic2any({ blob: blob, toType: "image/jpeg" }))
              .then((jpgBlob: Blob) => {
                let replacedfile;
                if (type[1] == 'HEIC') {
                  replacedfile = new File([jpgBlob], element.name.replace("HEIC", "jpeg"), { type: "image/jpeg" });
                } else {
                  replacedfile = new File([jpgBlob], element.name.replace("heic", "jpeg"), { type: "image/jpeg" });
                }
                this.attachmentfiles.push(replacedfile);
                this.attachmentfiles.forEach(item => item["isImage"] = true);
                setTimeout(() => {
                  this.changeDetectorRef.detectChanges()
                }, 300)
                this.changeDetectorRef.detectChanges()
              })
              .catch(() => {
                // see error handling section

              });
          }
          reader.readAsDataURL(element)
        }

        else {
          const extension = element.name.substring(element.name.lastIndexOf('.'));

          const mimetype = this.genericService.getMimetype(extension);
          // window.console.log(extension, mimetype);
          const data = new Blob([element], {
            type: mimetype
          });

          const replacedfile = new File([data], element.name, { type: mimetype });
          replacedfile['isImage'] = element.isImage;
          this.attachmentfiles.push(replacedfile);
        }
      }
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  // onAttachmentFileSelect(event) {
  //   this.isAttachmentUploaded = true;
  //   for (let index = 0; index < event.addedFiles.length; index++) {
  //     let element = event.addedFiles[index];
  //     element.isImage = false;
  //     if (element.type.includes('image')) {
  //       element.isImage = true;
  //     }
  //     this.attachmentfiles.push(element);
  //   }
  //   setTimeout(() => {
  //     this.changeDetectorRef.detectChanges()
  //   }, 300)
  // }

  onAttachmentFileRemove(event): void {
    this.attachmentfiles.splice(this.attachmentfiles.indexOf(event), 1);
    if (this.attachmentfiles.length == 0) {
      this.isAttachmentUploaded = false;
    }
  }

  uploadSingleAttachmentFile(recordid: number, fileobj: File, index): void {
    this.loadingmessage = "Uploading attachment " + (index + 1) + " of " + this.attachmentfiles.length;
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
          if (index < this.attachmentfiles.length - 1) {
            const newindex = index + 1;
            this.uploadSingleAttachmentFile(
              recordid,
              this.attachmentfiles[newindex],
              newindex
            );
          } else {
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

  saveModuleMake(): void {
    const found = this.modulemakes.some(el => el.name === this.addDesignDialogForm.get("modulemake").value);
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
    const ismakefound = this.modulemakes.some(el => el.name === this.addDesignDialogForm.get("modulemake").value);
    const found = this.modulemodels.some(el => el.name === this.addDesignDialogForm.get("modulemodel").value);
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
    const found = this.invertermakes.some(el => el.name === this.addDesignDialogForm.get("invertermake").value);
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
    const ismakefound = this.invertermakes.some(el => el.name === this.addDesignDialogForm.get("invertermake").value);
    const found = this.invertermodels.some(el => el.name === this.addDesignDialogForm.get("invertermodel").value);
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
      this.loadingmessage = "Initializing Chat";
      this.changeDetectorRef.detectChanges();
      this.isLoading = true;
      const GUID = design.chatid;

      const address = design.address.substring(0, 60);

      const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
      const groupName = design.name + "_" + address + "_" + currentdatetime;

      const groupType = CometChat.GROUP_TYPE.PASSWORD;
      const password = design.groupchatpassword

      const group = new CometChat.Group(GUID, groupName, groupType, password);
      const adminsid = [];
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
              // let chatgroupusers=[]
              const chatgroupusers = adminsid;
              chatgroupusers.push(design.createdby.cometchatuid);
              const inputData = {
                title: groupName,
                guid: GUID,
                parentid: design.createdby.parent.id,
                chatgroupusers: chatgroupusers
              }
              this.commonService.addChatGroup(inputData).subscribe(() => {
                // do nothing.
              },
                (error) => {
                  this.notifyService.showError(error, "Error");
                })
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
  createClientchatgroup(design: Design): void {
    const GUID = design.chatid;

    const address = design.address.substring(0, 60);
    const groupName = design.name + "_" + address;

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
              chatgroupusers: chatgroupusers
            }
            this.commonService.addChatGroup(inputData).subscribe(() => {
              // do nothing.
            },
              (error) => {
                this.notifyService.showError(error, "Error");
              })
            this.notifyService.showSuccess("Design request has been successfully assigned to WattMonk.", "Success");
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          },
          () => {
            this.notifyService.showSuccess("Design request has been successfully assigned to WattMonk.", "Success");
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          }
        );
      },
      () => {
        this.notifyService.showSuccess("Design request has been successfully assigned to WattMonk.", "Success");

        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.data.isDataUpdated = true;
        this.dialogRef.close(this.data);
      }
    );
  }

  getWattmonkadmins(companyid?): void {
    this.commonService.getWattmonkAdmins().subscribe(
      (response) => {
        this.wattmonkadmins = response;
        this.commonService.getGroupTeamHead(companyid).subscribe((response) => {
          response.forEach((element) => {
            this.wattmonkadmins.push(element);
          });
        },
          (error) => {
            this.notifyService.showError(error, "Error");
          });
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  showextrainputfield($event: any, value: string): void {

    if (value == 'extramodulemake') {
      this.fetchModuleModelsData($event, "Others")
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
    if (value == 'extramodulemodel') {
      // this.showextramodulemodel = true;
      this.modulemodel.clearValidators();
      // this.modulemodel.setValue(""); 
      // this.othermodulemodel.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
    }
    if (value == 'extrainvertermodel') {
      // this.showextrainvertermodel = true;
      this.invertermodel.clearValidators();
      // this.invertermodel.setValue("");   
      // this.otherinvertermodel.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
    }
    if (value == 'extrainvertermake') {
      //this.fetchInverterModelsData($event, "Others")
      // this.showextrainvertermake = true;
      this.invertermake.clearValidators();
      // this.invertermake.setValue("");   
      // this.otherinvertermake.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$")]);
      // this.showextrainvertermodel = true;
      this.invertermodel.clearValidators();
      this.invertermodel.setValue("Others");
      // this.otherinvertermodel.setValidators([Validators.required,Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$")]);
    }
  }
  setCompanyValue(event, companyid): void {
    if (event.isUserInput) {
      this.getWattmonkadmins(companyid);
    }
  }
  resetInvertorModel(i): void {
    this.addDesignDialogForm.get(this.numberOfInverters[i].invertermodel).patchValue('');
  }
  addMoreInverters() {
    this.numberOfInverters.push({ invertermake: "invertermake" + Number(this.numberOfInverters.length + 1), invertermodel: "invertermodel" + Number(this.numberOfInverters.length + 1), inverterscountcontrol: "inverterscount" + Number(this.numberOfInverters.length + 1), invertermodellist: [], disabledinvertermodel: true, invertermodelfilter: "invertermodelfilter" + Number(this.numberOfInverters.length + 1), newEntry: true, isSaved: true, invertercount: null })


    this.addDesignDialogForm.addControl('invertermake' + this.numberOfInverters.length, new FormControl('', Validators.required))
    this.addDesignDialogForm.addControl('invertermodel' + this.numberOfInverters.length, new FormControl('', Validators.required))
    this.addDesignDialogForm.addControl('inverterscount' + this.numberOfInverters.length, new FormControl('', Validators.required))
    this.addDesignDialogForm.addControl('invertermodelfilter' + this.numberOfInverters.length, new FormControl(''))
    console.log(this.addDesignDialogForm, this.numberOfInverters);
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
      // this.addDesignDialogForm.get('invertermodel' + Number(i + 1)).patchValue('');
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
    if (model.value != 'Others') {
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
    this.numberOfInverters.splice(index, 1);
    this.addDesignDialogForm.removeControl('invertermake' + Number(index + 1))
    this.addDesignDialogForm.removeControl('invertermodel' + Number(index + 1))
    this.addDesignDialogForm.removeControl('inverterscount' + Number(index + 1))
    this.addDesignDialogForm.removeControl('invertermodelfilter' + Number(index + 1))
    if (this.data.isEditMode) {
      if (!this.numberOfInverters[index].newEntry) {
        this.designService.deleteDesignInverters(this.data.design.designinverters[index].id).subscribe(() => {
          this.data.design.designinverters.splice(index, 1);

          this.changeDetectorRef.detectChanges();
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
      // this.numberOfInverters[i].disabledinvertermodel = true;
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
      console.log(event)
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

}

export interface otherSelectionDialogData {
  text: string
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
    this.dialogRef.close()
  }
}
