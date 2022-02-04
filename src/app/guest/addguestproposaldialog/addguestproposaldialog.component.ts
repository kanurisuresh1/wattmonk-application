import { Location } from "@angular-material-extensions/google-maps-autocomplete";
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatRadioButton, MatRadioChange } from "@angular/material/radio";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import * as moment from "moment";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { ADDRESSFORMAT, MAILFORMAT } from "src/app/_helpers";
import {
  Design,
  InverterMake,
  InverterModel,
  ModuleMake,
  ModuleModel,
  UploadedFile,
  User
} from "src/app/_models";
import { Incentives } from "src/app/_models/incentives";
import { PrelimUtility } from "src/app/_models/prelimutility";
import { UtilityRate } from "src/app/_models/utilityrate";
import {
  AuthenticationService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { GuestService } from "src/app/_services/guest.service";
import { DesignchargesdialogComponent } from "../designchargesdialog/designchargesdialog.component";
import { RegisterguestComponent } from "../registerguest/registerguest.component";
import PlaceResult = google.maps.places.PlaceResult;

export interface DesignFormData {
  isEditMode: boolean;
  isDataUpdated: boolean;
  generateAutocad: boolean;
  user: User;
  design: Design;
}
@Component({
  selector: "app- addguestproposaldialog",
  templateUrl: "./addguestproposaldialog.component.html",
  styleUrls: ["./addguestproposaldialog.component.scss"],
})
export class AddguestproposaldialogComponent implements OnInit {
  @ViewChild("jobtype")
  nameField: MatRadioButton;
  retrycount = 1;
  loadingmessage = "Saving data";
  min = 3;
  max = 3;
  selectedSiteLocation: Location;
  requiremnttype = "proposal";
  incentivesData: Incentives[] = [];
  selectedIncentive: number;

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

  prelimutilites: PrelimUtility[] = [];
  filteredPrelimUtility: Observable<PrelimUtility[]>;
  selectedPrelimUtilityID: number;

  utilityrates: UtilityRate[] = [];
  filteredUtilityRate: Observable<UtilityRate[]>;
  selectedUtilityRateID: number;
  /* prioritytoggle = new FormControl("", [
    ]); */
  name = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z. ]{3,}$"),
  ]);
  email = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  modulemake = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z-_ ]{2,}$"),
  ]);
  modulemodel = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
  ]);
  invertermake = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z-_ ]{2,}$"),
  ]);
  invertermodel = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
  ]);
  address = new FormControl("", [
    Validators.required,
    Validators.pattern(ADDRESSFORMAT),
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
  inverterscount = new FormControl("", [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(3),
    Validators.pattern("^[0-9]{1,3}$"),
  ]);
  prelimutility = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-z0-9A-Z+-_ & ([)/. {\\]}]{2,30}$"),
  ]);

  utilityrate = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-z0-9A-Z+-_ & ([)/. {\\]}]{2,30}$"),
  ]);

  annualutilityescalation = new FormControl("", [Validators.required]);

  incentive = new FormControl("", [Validators.required]);

  costofsystem = new FormControl("", [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(7),
    // Validators.pattern("'^[1-9]*$'")
  ]);

  personname = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z-_ ]{3,}$"),
  ]);
  company = new FormControl("", [
    Validators.pattern("(.*[a-zA-Z]){2,}[A-Za-z0-9@./-]$"),
  ]);
  logo: File;
  addDesignDialogForm: FormGroup;

  displayerror = true;
  formatted_address: string;
  postalcode: string;
  city: string;
  state: string;
  country: string;
  isLoading = false;
  architecturalfiles: File[] = [];
  isFileUploaded = false;
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  createduser: User;
  createdby;

  logoUploaded = false;
  imageUrl: any;
  editFile = true;
  removeUpload = false;
  aresitedetailsvalid = true;
  aremakedetailsvalid = true;
  aremountingdetailsvalid = true;

  isuseralreadyregistered = false;
  registereduserid;
  othermodulemake = new FormControl(null);
  modulemakefilter = new FormControl("");
  modulemodelfilter = new FormControl("");
  othermodulemodel = new FormControl(null);
  otherinvertermake = new FormControl(null);
  invertermakefilter = new FormControl("");
  otherinvertermodel = new FormControl(null);
  invertermodelfilter = new FormControl("");

  showextramodulemake = false;
  showextramodulemodel = false;
  showextrainvertermake = false;
  showextrainvertermodel = false;
  extra = false;
  placeholder = "Start typing here...";
  constructor(
    public dialogRef: MatDialogRef<AddguestproposaldialogComponent>,

    public dialog: MatDialog,
    private notifyService: NotificationService,
    private guestservice: GuestService,
    private genericService: GenericService,
    private authenticationService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: DesignFormData
  ) {
    this.addDesignDialogForm = new FormGroup({
      email: this.email,
      name: this.name,
      address: this.address,
      monthlybill: this.monthlybill,
      modulemake: this.modulemake,
      modulemodel: this.modulemodel,
      invertermake: this.invertermake,
      invertermodel: this.invertermodel,
      rooftype: this.rooftype,
      mountingtype: this.mountingtype,
      tiltgroundmount: this.tiltgroundmount,
      projecttype: this.projecttype,
      newconstruction: this.newconstruction,
      comments: this.comments,
      prelimutility: this.prelimutility,
      utilityrate: this.utilityrate,
      annualutilityescalation: this.annualutilityescalation,
      incentive: this.incentive,
      costofsystem: this.costofsystem,
      personname: this.personname,
      inverterscount: this.inverterscount,
      otherinvertermake: this.otherinvertermake,
      otherinvertermodel: this.otherinvertermodel,
      othermodulemake: this.othermodulemake,
      othermodulemodel: this.othermodulemodel,
    });
    this.newconstruction.setValue("false");
    this.annualutilityescalation.setValue("3.5");
    this.inverterscount.setValue(1);
  }

  ngOnInit(): void {
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
    });
    setTimeout(() => {
      this.fetchModuleMakesData();
      this.fetchInverterMakesData();
      this.getIncentivesData();
    });
  }
  onCloseClick(): void {
    this.dialogRef.close();
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
    this.fetchPrelimUtilityData(this.state, this.city);
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

  displayFnPrelimutility(prelimutility: PrelimUtility): string {
    return prelimutility && prelimutility.name ? prelimutility.name : "";
  }

  private _filterPrelimUtility(name: string): PrelimUtility[] {
    const filterValue = name.toLowerCase();

    return this.prelimutilites.filter(
      (prelimutility) =>
        prelimutility.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  displayFnUtilityRate(utilityrate: UtilityRate): string {
    return utilityrate && utilityrate.rate ? utilityrate.rate : "";
  }

  private _filterUtilityRate(name: string): UtilityRate[] {
    const filterValue = name.toLowerCase();

    return this.utilityrates.filter(
      (utilityrate) => utilityrate.rate.toLowerCase().indexOf(filterValue) != -1
    );
  }
  setSelectedUtilityRate(utilityrate): void {
    this.selectedUtilityRateID = utilityrate.id;
  }
  setSelectedIncentive(incentive): void {
    this.selectedIncentive = incentive.id;
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
    | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    if (control == this.name) {
      return this.name.hasError("pattern")
        ? "Firstname should be of min. 3 characters and contain only alphabets."
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
        ? "Please enter a valid tilt ground mount."
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
    } else if (control == this.costofsystem) {
      return this.costofsystem.hasError("pattern")
        ? "Please enter a valid format."
        : "";
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
  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
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
        element == "monthlybill" ||
        element == "projecttype" ||
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

  getIncentivesData(): void {
    this.commonService.getIncentives().subscribe((response) => {
      this.incentivesData = response;
      if (
        this.data.design &&
        this.data.design.incentive &&
        this.data.design.incentive.id
      ) {
        this.incentive.setValue(this.data.design.incentive.id);
      }
    });
  }
  fetchModuleMakesData(): void {
    this.guestservice.getModuleMakesData().subscribe(
      (response) => {
        this.modulemakes = response;
        this.filteredModuleMakes = this.modulemakefilter.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) =>
            name ? this._filterModuleMake(name) : this.modulemakes.slice()
          )
        );
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

  invertermodelempty(): void {
    if (this.invertermake.value != "Others") {
      this.addDesignDialogForm.patchValue({ invertermodel: "" });
      this.invertermodel.setValue("");
      if (this.invertermake.value == "None") {
        this.inverterscount.setValue("0");
        this.inverterscount.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),
        ]);
        this.inverterscount.updateValueAndValidity();
      } else {
        this.inverterscount.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),
        ]);
        this.inverterscount.updateValueAndValidity();
      }
    } else {
      this.dialog.open(OtherSelectionPopup, {
        width: "40%",
        height: "20%",
        disableClose: true,
        data: {
          text: " Please enter inverter make and inverter model in comments ",
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
    //   if(this.invertermake.value != "Others" && this.invertermake.value != null && this.invertermake.value != ""){
    //     this.showextrainvertermake=false;
    // this.otherinvertermake.clearValidators();
    // this.otherinvertermake.setValue(null);
    // this.showextrainvertermodel=false;
    // this.otherinvertermodel.clearValidators();
    // this.otherinvertermodel.setValue(null);

    // }
    if (this.invertermake.value != "" && this.invertermake.value != undefined) {
      this.invertermodel.setValidators([
        Validators.required,
        Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
      ]);
    }
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

  invertermodelrefresh(): void {
    if (
      this.invertermodel.value != "Others" &&
      this.invertermodel.value != null &&
      this.invertermodel.value != ""
    ) {
      // this.showextrainvertermodel=false;
      this.otherinvertermodel.clearValidators();
      // this.otherinvertermodel.setValue(null);
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
    if (this.invertermodel.value == "Others") {
      this.dialog.open(OtherSelectionPopup, {
        width: "40%",
        height: "20%",
        disableClose: true,
        data: { text: " Please enter  inverter model and counts in comments " },
      });
    }
  }

  fetchModuleModelsData(_event: any, make): void {
    this.modulemake.setValidators([
      Validators.required,
      Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$"),
    ]);
    if (_event.isUserInput) {
      this.modulemodels = [];
      this.selectedModuleMakeID = make.id;
      this.guestservice.getModuleModelsData(make.id).subscribe(
        (response) => {
          this.modulemodels = response;
          this.filteredModuleModels = this.modulemodelfilter.valueChanges.pipe(
            startWith(""),
            map((value) => (typeof value === "string" ? value : value.name)),
            map((name) =>
              name ? this._filterModuleModel(name) : this.modulemodels.slice()
            )
          );
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    }
  }

  loadModuleModelsData(): void {
    this.modulemodels = [];
    this.guestservice.getModuleModelsData(this.selectedModuleMakeID).subscribe(
      (response) => {
        this.modulemodels = response;
        this.filteredModuleModels = this.modulemodelfilter.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) =>
            name ? this._filterModuleModel(name) : this.modulemodels.slice()
          )
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  setSelectedModuleModel(model): void {
    this.selectedModuleModelID = model.id;
    this.modulemodel.setValidators([
      Validators.required,
      Validators.pattern(".*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
    ]);
  }

  fetchInverterMakesData(): void {
    this.guestservice.getInverterMakesData().subscribe(
      (response) => {
        this.invertermakes = response;
        this.filteredInverterMakes = this.invertermakefilter.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) =>
            name ? this._filterInverterMake(name) : this.invertermakes.slice()
          )
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchInverterModelsData(_event: any, make): void {
    this.invertermake.setValidators([
      Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$"),
    ]);
    if (_event.isUserInput) {
      this.invertermodels = [];
      this.selectedInverterMakeID = make.id;
      this.guestservice.getInverterModelsData(make.id).subscribe(
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
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    }
  }

  fetchPrelimUtilityData(state, city): void {
    this.commonService.getPrelimUtilityData(state, city).subscribe(
      (response) => {
        this.prelimutilites = response;
        this.filteredPrelimUtility = this.prelimutility.valueChanges.pipe(
          startWith(""),
          map((value) => (typeof value === "string" ? value : value.name)),
          map((name) =>
            name ? this._filterPrelimUtility(name) : this.prelimutilites.slice()
          )
        );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchUtilityRateData(_event: any, utility): void {
    this.addDesignDialogForm.patchValue({ utilityrate: " " });
    if (_event.isUserInput) {
      this.utilityrates = [];
      this.selectedPrelimUtilityID = utility.id;
      this.commonService.getUtilityRateData(utility.id).subscribe(
        (response) => {
          this.utilityrates = response;
          this.filteredUtilityRate = this.utilityrate.valueChanges.pipe(
            startWith(""),
            map((value) => (typeof value === "string" ? value : value.name)),
            map((name) =>
              name ? this._filterUtilityRate(name) : this.utilityrates.slice()
            )
          );
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    }
  }
  setSelectedInverterModel(model): void {
    this.selectedInverterModelID = model.id;
    // this.otherinvertermodel.clearValidators();
    // this.otherinvertermodel.setValue(null);
    this.invertermodel.setValidators([
      Validators.pattern(".*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
    ]);
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
        this.tiltgroundmount.setValidators([Validators.required]);
      } else {
        this.rooftype.setValidators([Validators.required]);
        this.tiltgroundmount.setValidators([Validators.required]);
      }
    }
  }

  patchFormattedValues(): void {
    const controls = this.addDesignDialogForm.controls;
    for (const name in controls) {
      try {
        /* COMMENT DUE TO SECURITY RISK */
        // this.addDesignDialogForm.get(name).patchValue(this.addDesignDialogForm.get(name).value.replace(/['"]+/g, ''));
        this.addDesignDialogForm
          .get(name)
          .patchValue(
            this.addDesignDialogForm.get(name).value.replace(/<\/?.+?>/gi, "")
          );
      } catch (error) { }
    }
  }

  resgisteruser(): void {
    if (this.invertermake.value != "") {
      this.invertermodel.setValidators([Validators.required]);
      this.invertermodel.updateValueAndValidity();
    }
    if (
      this.modulemake.value == "Others" ||
      this.modulemodel.value == "Others" ||
      this.invertermake.value == "Others" ||
      this.invertermodel.value == "Others"
    ) {
      this.comments.setValidators([Validators.required]);
      this.comments.updateValueAndValidity();
    }

    if (this.addDesignDialogForm.valid) {
      this.patchFormattedValues();
      if (this.modulemake.value == "Others") {
        this.modulemake.setValue(null);
        this.modulemodel.setValue(null);
      } else if (this.modulemodel.value == "Others") {
        this.modulemodel.setValue(null);
      }
      if (this.invertermake.value == "Others") {
        this.invertermake.setValue(null);
        this.invertermodel.setValue(null);
      } else if (this.invertermodel.value == "Others") {
        this.invertermodel.setValue(null);
      }
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
          this.changeDetectorRef.detectChanges();
          this.openUserRegistrationDialog();
        }
      } else {
        this.updateInvalidExpansionPanels();
        this.changeDetectorRef.detectChanges();
        this.openUserRegistrationDialog();
      }
    } else {
      this.displayerror = false;
      this.addDesignDialogForm.markAllAsTouched();
      this.updateInvalidExpansionPanels();
      this.changeDetectorRef.detectChanges();
    }
  }

  openUserRegistrationDialog(): void {
    const dialogRef = this.dialog.open(RegisterguestComponent, {
      width: "60%",
      autoFocus: false,
      disableClose: true,
      data: { isConfirmed: false, isLater: false, createdby: null },
    });
    dialogRef.afterClosed().subscribe((result) => {
      result.createdby = this.createdby;
      if (result.isConfirmed) {
        this.opendesigncharges();
      }
      if (result.isalreadyregistered) {
        this.isuseralreadyregistered = result.isalreadyregistered;
        this.commonService
          .getUserIdViaEmail(result.useremail)
          .subscribe((response) => {
            this.registereduserid = response;
            this.isLoading = true;
            this.loadingmessage = "Saving data";
            this.changeDetectorRef.detectChanges();
            this.adddesigntoserver();
          });
      }
    });
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

  opendesigncharges(): void {
    const dialogRef = this.dialog.open(DesignchargesdialogComponent, {
      width: "40%",
      autoFocus: false,
      disableClose: true,
      data: {
        isConfirmed: false,
        isLater: false,
        isprelim: true,
        designid: "NA",
        requiremnttype: "proposal",
        designtype: "proposal",
        annulaunits: this.monthlybill.value,
        propertytype: this.projecttype.value,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        this.changeDetectorRef.detectChanges();
        this.adddesigntoserver();
      }
    });
  }

  adddesigntoserver(): void {
    const mountingtype = this.addDesignDialogForm.get("mountingtype").value;
    let rooftype = null;
    let tilt = null;
    const guestUserId = localStorage.getItem("guestUserId");

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
      latitude = this.selectedSiteLocation.latitude;
      longitude = this.selectedSiteLocation.longitude;
    } else {
      address = this.address.value;
      latitude = null;
      longitude = null;
    }

    //Assign design to wattmonk if requested
    let outsourcedto;
    let isoutsourced;

    let status = "created";
    let designacceptancestarttime = new Date();

    let userid = Number(guestUserId);
    if (this.isuseralreadyregistered) {
      userid = this.registereduserid;
      designacceptancestarttime = null;
      outsourcedto = null;
      isoutsourced = false;
    } else {
      status = "outsourced";
      outsourcedto = 232;
      isoutsourced = true;
      designacceptancestarttime.setMinutes(
        designacceptancestarttime.getMinutes() + 15
      );
    }

    if (this.invertermake.value == "" && this.invertermodel.value == "") {
      this.invertermake.setValue(null);
      this.invertermodel.setValue(null);
    }

    this.guestservice
      .addpPrelimProposal(
        this.addDesignDialogForm.get("name").value,
        this.addDesignDialogForm.get("email").value,
        address,
        parseInt(this.addDesignDialogForm.get("monthlybill").value),
        this.selectedModuleMakeID,
        this.selectedModuleModelID,
        this.selectedInverterMakeID,
        this.selectedInverterModelID,
        // this.modulemake.value,
        // this.modulemodel.value,
        // this.invertermake.value,
        // this.invertermodel.value,
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
        outsourcedto,
        isoutsourced,
        status,
        userid,
        designacceptancestarttime,
        this.prelimutility.value,
        this.utilityrate.value,
        this.addDesignDialogForm.get("annualutilityescalation").value,
        this.addDesignDialogForm.get("incentive").value, // this.selectedIncentive,
        this.addDesignDialogForm.get("costofsystem").value,
        this.addDesignDialogForm.get("personname").value,
        "proposal",
        this.addDesignDialogForm.get("inverterscount").value,
        this.othermodulemake.value,
        this.othermodulemodel.value,
        this.otherinvertermake.value,
        this.otherinvertermodel.value
      )
      .subscribe(
        (response) => {
          this.data.design = response;
          this.createNewDesignChatGroup(response);
          if (this.logoUploaded) {
            this.uploadLogo();
          }
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
              if (this.isuseralreadyregistered) {
                this.isLoading = false;
                this.dialog.closeAll();
                this.router.navigate(["/auth/login"]);
              } else {
                this.loginguest();
              }
            }
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  createNewDesignChatGroup(design: Design): void {
    // this.loadingmessage = "Initializing Chat";
    this.changeDetectorRef.detectChanges();
    this.isLoading = true;
    const GUID = design.chatid;

    const address = design.address.substring(0, 60);

    const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
    const groupName = design.name + "_" + address + "_" + currentdatetime;

    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = design.groupchatpassword;

    const group = new CometChat.Group(GUID, groupName, groupType, password);

    CometChat.createGroup(group).then(
      (group) => {
        const membersList = [
          new CometChat.GroupMember(
            "" + design.createdby.cometchatuid,
            CometChat.GROUP_MEMBER_SCOPE.ADMIN
          ),
          new CometChat.GroupMember(
            "" + 232,
            CometChat.GROUP_MEMBER_SCOPE.ADMIN
          ),
        ];
        CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
          () => {
            /*  if(!this.isuseralreadyregistered){
                this.loginguest();
              }else{
                this.isLoading = false;
                this.dialog.closeAll();
                this.router.navigate(['/auth/login']);
              } */
            const chatgroupusers = [];
            chatgroupusers.push(design.createdby.cometchatuid);
            chatgroupusers.push(232);
            const inputData = {
              title: groupName,
              guid: GUID,
              parentid: design.createdby.parent.id,
              chatgroupusers: chatgroupusers,
            };
            this.commonService.addChatGroup(inputData).subscribe(() => {
              // do nothing.
            });
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

  onArchitecturalFileSelect(event): void {
    this.displayerror = true;
    this.isFileUploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      this.architecturalfiles.push(element);
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
            if (this.isuseralreadyregistered) {
              this.isLoading = false;
              this.dialog.closeAll();
              this.router.navigate(["/auth/login"]);
            } else {
              this.loginguest();
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
    this.isAttachmentUploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      this.attachmentfiles.push(element);
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
              if (this.isuseralreadyregistered) {
                this.isLoading = false;
                this.dialog.closeAll();
                this.router.navigate(["/auth/login"]);
              } else {
                this.loginguest();
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
            this.saveModuleModel();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.saveModuleModel();
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
            this.saveInverterModel();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.saveInverterModel();
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
            this.saveUtility();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.saveUtility();
    }
  }

  saveUtility(): void {
    const found = this.prelimutilites.some(
      (el) => el.name === this.addDesignDialogForm.get("prelimutility").value
    );
    if (!found) {
      this.commonService
        .addNewUtility(
          this.addDesignDialogForm.get("prelimutility").value,
          this.city,
          this.state
        )
        .subscribe(
          (response) => {
            this.selectedPrelimUtilityID = response.id;
            this.saveUtilityRate();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.saveUtilityRate();
    }
  }
  saveUtilityRate(): void {
    const ismakefound = this.prelimutilites.some(
      (el) => el.name === this.addDesignDialogForm.get("prelimutility").value
    );
    const found = this.utilityrates.some(
      (el) => el.rate === this.addDesignDialogForm.get("utilityrate").value
    );
    if (!ismakefound || !found) {
      this.commonService
        .addUtilityRate(
          this.addDesignDialogForm.get("utilityrate").value,
          this.selectedPrelimUtilityID
        )
        .subscribe(
          (response) => {
            this.selectedUtilityRateID = response.id;

            this.adddesigntoserver();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.adddesigntoserver();
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

  loginguest(): void {
    this.authenticationService
      .loginUser(
        localStorage.getItem("guestemail"),
        localStorage.getItem("guestpassword")
      )
      .subscribe((response) => {
        this.dialog.closeAll();
        this.commonService.changeisplatformupdated(response.user.id);
        this.genericService.setRequiredHeaders();
        this.authenticationService.setRequiredHeaders();
        this.notifyService.showSuccess(
          "Congrats!! Your first design request has been added. You can track the status anytime using default credentials shared via email.",
          "Success"
        );
        localStorage.setItem("subrouteloaded", "false");
        localStorage.setItem("lastroute", "/home/dashboard/overview");
        this.router.navigate(["/home/dashboard/overview"]);
      });
  }

  uploadFile(event): void {
    const reader = new FileReader(); // HTML5 FileReader API
    const file = event.target.files[0];
    this.logo = event.target.files[0];

    if (event.target.files.length > 0) {
      this.logoUploaded = true;
    }
    if (event.target.files[0]) {
      reader.readAsDataURL(file);

      // When file uploads set it to file formcontrol
      reader.onload = () => {
        this.imageUrl = reader.result;
        this.changeDetectorRef.detectChanges();
        this.editFile = false;
        this.removeUpload = true;
      };
      // ChangeDetectorRef since file is loading outside the zone
      this.changeDetectorRef.markForCheck();
    }
  }

  Deleteuploadedlogo($event): void {
    $event.stopPropagation();
    this.imageUrl = undefined;
    this.logoUploaded = false;
    this.changeDetectorRef.detectChanges();
  }

  uploadLogo(): void {
    this.loadingmessage = "Uploading logo";
    this.changeDetectorRef.detectChanges();
    this.commonService
      .uploadLogo(
        this.registereduserid,
        this.registereduserid + "/logo",
        this.logo,
        "logo",
        "user",
        // "users-permissions"
      )
      .subscribe(
        () => {
          // do nothing.
        },
        (error) => {
          this.isLoading = false;
          this.notifyService.showError(error, "Error");
        }
      );
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
    if (value == "extrainvertermake") {
      this.fetchInverterModelsData($event, "Others");
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
}

export interface otherSelectionDialogData {
  text: string;
}
@Component({
  selector: "otherselectionpopup",
  templateUrl: "otherselectionpopup.html",
  styleUrls: ["./addguestproposaldialog.component.scss"],
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
