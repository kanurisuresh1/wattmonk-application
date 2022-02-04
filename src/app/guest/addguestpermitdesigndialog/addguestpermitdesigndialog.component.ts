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
import { Ahj } from "src/app/_models/ahj";
import { PrelimUtility } from "src/app/_models/prelimutility";
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
  selector: "app-addguestpermitdesigndialog",
  templateUrl: "./addguestpermitdesigndialog.component.html",
  styleUrls: ["./addguestpermitdesigndialog.component.scss"],
})
export class AddguestpermitdesigndialogComponent implements OnInit {
  @ViewChild("jobtype")
  nameField: MatRadioButton;
  min = 3;
  max = 3;
  selectedSiteLocation: Location;

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
  prioritytoggle = new FormControl("", []);
  name = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z. ]{3,}$"),
  ]);
  email = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  phone = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("^[0-9]{8,15}$"),
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
  // monthlybill = new FormControl("", [
  //   Validators.required,
  //   Validators.min(1),
  //   Validators.pattern("^[0-9]+$")
  // ]);
  newconstruction = new FormControl("", [Validators.required]);
  comments = new FormControl("", []);
  inverterscount = new FormControl("", [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(7),
    Validators.pattern("^[0-9]{1,7}$"),
  ]);
  rooftype = new FormControl("", []);
  jobtype = new FormControl("", [Validators.required]);
  mountingtype = new FormControl("", [Validators.required]);
  tiltgroundmount = new FormControl("", []);
  projecttype = new FormControl("", [Validators.required]);
  mpurequired = new FormControl("", [Validators.required]);
  solarcapacity = new FormControl("", [
    Validators.required,
    Validators.min(1),
    Validators.maxLength(15),
  ]);
  modulecount = new FormControl("", [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(7),
    Validators.pattern("^[0-9]{1,7}$"),
  ]);
  utilityname = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z -']+"),
  ]);

  ahj = new FormControl(null, [Validators.pattern("^[a-zA-Z -']+")]);
  addDesignDialogForm: FormGroup;

  displayerror = true;
  formatted_address: string;
  postalcode: string;
  city = "";
  state = "";
  country: string;
  //user: User
  architecturalfiles: File[] = [];
  isFileUploaded = false;
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;
  // changeDetector: any;
  // loggedInUser: User;
  isClient = false;

  aresitedetailsvalid = true;
  aremakedetailsvalid = true;
  aremountingdetailsvalid = true;

  senddirectlytowattmonk = false;
  wattmonkjobcount = 0;

  isuseralreadyregistered = false;
  registereduserid;
  deliverytime = null;
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
    public dialogRef: MatDialogRef<AddguestpermitdesigndialogComponent>,
    private guestService: GuestService,
    private notifyService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private router: Router,
    private commonService: CommonService,
    private genericService: GenericService,
    private authenticationService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: DesignFormData
  ) {
    this.addDesignDialogForm = new FormGroup({
      email: this.email,
      name: this.name,
      phone: this.phone,
      address: this.address,
      // monthlybill: this.monthlybill,
      modulemake: this.modulemake,
      modulemodel: this.modulemodel,
      invertermake: this.invertermake,
      invertermodel: this.invertermodel,
      rooftype: this.rooftype,
      jobtype: this.jobtype,
      projecttype: this.projecttype,
      newconstruction: this.newconstruction,
      comments: this.comments,
      mountingtype: this.mountingtype,
      tiltgroundmount: this.tiltgroundmount,
      mpurequired: this.mpurequired,
      inverterscount: this.inverterscount,
      solarcapacity: this.solarcapacity,
      modulecount: this.modulecount,
      utilityname: this.utilityname,
      ahj: this.ahj,
      otherinvertermake: this.otherinvertermake,
      otherinvertermodel: this.otherinvertermodel,
      othermodulemake: this.othermodulemake,
      othermodulemodel: this.othermodulemodel,
    });
    this.newconstruction.setValue("false");
    this.inverterscount.setValue(1);
    this.mpurequired.setValue("false");
    this.modulecount.setValue(1);
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
    });
    this.fetchAllUtilityName();
    this.fetchAllAhj();
  }
  onCloseClick(): void {
    this.dialogRef.close();
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
    if ($event.source.name === "jobtype") {
      if ($event.value == "battery") {
        this.modulemake.setValue("None");
        this.modulemodel.setValue("None");
        this.invertermake.setValue("None");
        this.invertermodel.setValue("None");
        this.modulecount.setValue("0");
        this.inverterscount.setValue("0");
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
    if (this.state != "" && this.city != "") {
      this.fetchUtilityName(this.state, this.city);
      this.fetchAHJ(this.state, this.city);
    }
  }

  fetchUtilityName(state, city): void {
    this.addDesignDialogForm.patchValue({ utilityname: "" });
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
    // this.addDesignDialogForm.patchValue({ utilityrate: "" });
    if (_event.isUserInput) {
      this.selectedUtilityID = utility.id;
    }
  }

  fetchAHJ(state, city): void {
    // this.addDesignDialogForm.patchValue({ ahj: "" });
    this.commonService.getAHJ(state, city).subscribe(
      (response) => {
        // console.log('asdfg', response)
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
      this.selectedAHJ = ahj.id;
    }
  }

  fetchAllUtilityName(): void {
    this.addDesignDialogForm.patchValue({ utilityname: "" });
    this.commonService.getAllUtilityData().subscribe(
      (response) => {
        // console.log(response);
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
  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
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
    | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    if (control == this.name) {
      return this.name.hasError("pattern")
        ? "Name should be of min. 3 characters and contain only alphabets."
        : "";
    } else if (control == this.email) {
      return this.email.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    } else if (control == this.phone) {
      return this.phone.hasError("pattern")
        ? "Please enter a valid phone number with only numbers (Min - 8, Max - 15)."
        : "Phone should be of min. 8 and max. 15 characters.";
    }
    // else if (control == this.monthlybill) {
    //   return this.monthlybill.hasError("pattern")
    //     ? "Please enter a valid annual unit."
    //      : "zero value is not accepted";
    // }
    else if (control == this.tiltgroundmount) {
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
    } else if (control == this.solarcapacity) {
      return this.solarcapacity.hasError("pattern")
        ? "Please enter a valid solar capacity."
        : "zero value is not accepted";
    } else if (control == this.modulecount) {
      return this.modulecount.hasError("pattern")
        ? "Please enter a valid module count number only"
        : "module count should be of min. 1 and max. 7 characters.";
    } else if (control == this.inverterscount) {
      return this.inverterscount.hasError("pattern")
        ? "Please enter a valid inverters count number only"
        : "inverters count should be of min. 1 and max. 7 characters.";
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
  }

  fetchModuleMakesData(): void {
    this.guestService.getModuleMakesData().subscribe(
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
      if (this.modulemake.value == "None") {
        this.modulecount.setValue("0");
        this.modulecount.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.maxLength(7),
          Validators.pattern("^[0-9]{1,7}$"),
        ]);
        this.modulecount.updateValueAndValidity();
      } else {
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
      // this.modulemodel.setValue("");

      this.modulemodels = [];
      this.selectedModuleMakeID = make.id;
      this.guestService.getModuleModelsData(make.id).subscribe(
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
    this.guestService.getModuleModelsData(this.selectedModuleMakeID).subscribe(
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
    this.guestService.getInverterMakesData().subscribe(
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
      // this.invertermodel.setValue("");

      this.invertermodels = [];
      this.selectedInverterMakeID = make.id;
      this.guestService.getInverterModelsData(make.id).subscribe(
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

  loadInverterModelsData(): void {
    this.invertermodels = [];
    this.guestService
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
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  setSelectedInverterModel(model): void {
    this.selectedInverterModelID = model.id;
    // this.otherinvertermodel.clearValidators();
    // this.otherinvertermodel.setValue(null);
    this.invertermodel.setValidators([
      Validators.pattern(".*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
    ]);
  }

  updateInvalidExpansionPanels(): void {
    let invalidcontrols = this.genericService.findInvalidControls(
      this.addDesignDialogForm
    );
    this.aremakedetailsvalid = true;
    this.aremountingdetailsvalid = true;
    this.aresitedetailsvalid = true;
    invalidcontrols.forEach((element) => {
      if (
        element == "name" ||
        element == "email" ||
        element == "solarcapacity" ||
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
    if (this.invertermake.value != "" && this.invertermake.value != undefined) {
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
            this.addDesignToServer();
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
        isprelim: false,
        designid: "NA",
        designtype: "permit",
        annulaunits: this.solarcapacity.value,
        propertytype: this.projecttype.value,
        slabname: "NA",
        jobtype: this.jobtype.value,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.deliverytime = result.slabname.toString();
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        this.changeDetectorRef.detectChanges();
        this.addDesignToServer();
      }
    });
  }

  addDesignToServer(): void {
    let mountingtype = this.addDesignDialogForm.get("mountingtype").value;
    let rooftype = null;
    let tilt = null;
    let guestUserId = localStorage.getItem("guestUserId");
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
    let outsourcedto;
    let isoutsourced;
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

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

    let ahjvalue;
    if (this.ahj.value != null) {
      ahjvalue = this.ahj.value.trim().toLowerCase();
    } else {
      ahjvalue = null;
    }
    // if(this.invertermake.value != '' && this.invertermake.value != undefined){
    //   this.invertermake.setValue(null);
    //   this.invertermodel.setValue(null);
    // }
    this.guestService
      .addguestPermitDesign(
        this.addDesignDialogForm.get("name").value,
        this.addDesignDialogForm.get("email").value,
        this.addDesignDialogForm.get("phone").value.toString(),
        address,
        // parseInt(this.addDesignDialogForm.get("monthlybill").value),
        this.selectedModuleMakeID,
        this.selectedModuleModelID,
        this.selectedInverterMakeID,
        this.selectedInverterModelID,
        // this.modulemake.value,
        // this.modulemodel.value,
        // this.invertermake.value,
        // this.invertermodel.value,
        rooftype,
        this.addDesignDialogForm.get("jobtype").value,
        mountingtype,
        tilt,
        this.addDesignDialogForm.get("projecttype").value,
        JSON.parse(this.addDesignDialogForm.get("newconstruction").value),
        this.addDesignDialogForm.get("comments").value,
        this.city,
        this.state,
        this.country,
        parseInt(this.postalcode),
        "permit",
        latitude,
        longitude,
        outsourcedto,
        isoutsourced,
        userid,
        status,
        designacceptancestarttime,
        this.deliverytime,
        this.addDesignDialogForm.get("mpurequired").value,
        parseFloat(this.addDesignDialogForm.get("solarcapacity").value),
        parseInt(this.addDesignDialogForm.get("modulecount").value),
        parseInt(this.addDesignDialogForm.get("inverterscount").value),
        this.utilityname.value.trim().toLowerCase(),
        ahjvalue,
        this.othermodulemake.value,
        this.othermodulemodel.value,
        this.otherinvertermake.value,
        this.otherinvertermodel.value
      )
      .subscribe(
        (response) => {
          this.createNewDesignChatGroup(response);
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
    //  this.loadingmessage = "Initializing Chat"
    this.changeDetectorRef.detectChanges();
    this.isLoading = true;
    let GUID = design.chatid;

    let address = design.address.substring(0, 90);
    let currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
    let groupName = design.name + "_" + address + "_" + currentdatetime;

    let groupType = CometChat.GROUP_TYPE.PASSWORD;
    let password = design.groupchatpassword

    let group = new CometChat.Group(GUID, groupName, groupType, password);

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
            /*  this.dialog.closeAll();
            if (this.isuseralreadyregistered) {
              this.isLoading = false;
              this.dialog.closeAll();
              this.router.navigate(['/auth/login']);
            } else {
              this.loginguest();
            } */
            let chatgroupusers = [];
            chatgroupusers.push(design.createdby.cometchatuid);
            chatgroupusers.push(232);
            let inputData = {
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
    this.isFileUploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      let element = event.addedFiles[index];
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
    this.isLoading = true;
    this.loadingmessage =
      "Uploading design " +
      (index + 1) +
      " of " +
      this.architecturalfiles.length;
    this.changeDetectorRef.detectChanges();
    this.guestService
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
            let newindex = index + 1;
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
      let element = event.addedFiles[index];
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
    this.isLoading = true;
    this.loadingmessage =
      "Uploading attachment " +
      (index + 1) +
      " of " +
      this.attachmentfiles.length;
    this.changeDetectorRef.detectChanges();
    this.guestService
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
            let newindex = index + 1;
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
      this.guestService
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
      this.guestService
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
      this.guestService
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
      this.guestService
        .addInverterModel(
          this.addDesignDialogForm.get("invertermodel").value,
          this.selectedInverterMakeID
        )
        .subscribe(
          (response) => {
            this.selectedInverterModelID = response.id;
            this.addDesignToServer();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.addDesignToServer();
    }
  }

  onRemoveAttachment(file: UploadedFile, index: number): void {
    this.guestService.deleteUploadedFile("" + file.id).subscribe(
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
    this.guestService.deleteUploadedFile("" + file.id).subscribe(
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
  styleUrls: ["./addguestpermitdesigndialog.component.scss"],
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
