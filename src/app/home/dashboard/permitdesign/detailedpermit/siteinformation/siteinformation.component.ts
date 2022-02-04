import { Location } from "@angular-material-extensions/google-maps-autocomplete";
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  OnInit, ViewEncapsulation
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatRadioChange } from "@angular/material/radio";
import { CometChat } from "@cometchat-pro/chat";
import * as moment from "moment";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { EVENTS_PERMIT_DESIGN, ROLES } from "src/app/_helpers";
import {
  Design, InverterMake,
  InverterModel, ModuleMake,
  ModuleModel, UploadedFile, User
} from "src/app/_models";
import {
  AuthenticationService, DesignService,
  GenericService, LoaderService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import PlaceResult = google.maps.places.PlaceResult;

@Component({
  selector: "app-siteinformation",
  templateUrl: "./siteinformation.component.html",
  styleUrls: ["./siteinformation.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteinformationComponent implements OnInit {
  min = 3;
  max = 3;

  isDataSubmitted = false;
  isEditMode = false;
  formatted_address: string;
  postalcode: string;
  city: string;
  state: string;
  country: string;

  architecturalfiles: File[] = [];
  isFileUploaded = false;
  changeDetectorRefs: ChangeDetectorRef[] = [];
  attachmentfiles: File[] = [];
  isAttachmentUploaded = false;

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

  selectedSiteLocation: Location;
  generateddesign: Design = new Design();
  modulemakefilter = new FormControl("");
  displayerror = true;
  isLoading = false;
  searchTerm: any = { name: '' };
  addDesignDialogFormGroup: FormGroup;

  prioritytoggle = new FormControl("", []);
  name = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z. ]{3,}$"),
  ]);
  email = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$"),
  ]);
  phone = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("[0-9]{8,15}$"),
  ]);
  modulemake = new FormControl("", [Validators.required]);
  modulemodel = new FormControl("", [Validators.required]);
  invertermake = new FormControl("", [Validators.required]);
  invertermodel = new FormControl("", [Validators.required]);
  inverterscount = new FormControl("", [
    Validators.required,
    Validators.min(0)
  ]);
  address = new FormControl("", [
    Validators.required
  ]);
  designstate = new FormControl("", [
    Validators.required
  ]);
  designcity = new FormControl("", [
    Validators.required
  ]);
  monthlybill = new FormControl("", [
    Validators.required,
    Validators.min(0)
  ]);
  newconstruction = new FormControl("", [
    Validators.required
  ]);
  comments = new FormControl("", [Validators.required
  ]);
  esiid = new FormControl("", [
    Validators.required,
  ]);
  modulecount = new FormControl("", [
    Validators.required,
  ]);
  modulemodelfilter = new FormControl("");
  invertermakefilter = new FormControl("");
  invertermodelfilter = new FormControl("");
  rooftype = new FormControl("", []);
  jobtype = new FormControl("", [Validators.required]);
  mountingtype = new FormControl("", [Validators.required]);
  tiltgroundmount = new FormControl("", []);
  projecttype = new FormControl("", [Validators.required]);
  mpurequired = new FormControl("", [Validators.required]);
  loggedInUser: User;
  isDesigner = false;

  numberOfInverters = [];
  showsavebutton = false;
  addextrainverters = false;
  constructor(private notifyService: NotificationService,
    private designService: DesignService,
    private commonService: CommonService,
    private genericService: GenericService,
    private eventEmitterService: EventEmitterService,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthenticationService,
    private loaderservice: LoaderService) {
    this.loggedInUser = authService.currentUserValue.user;
    if (this.loggedInUser.role.id == ROLES.Designer) {
      this.isDesigner = true;
    } else {
      this.isDesigner = false;
    }

    this.addDesignDialogFormGroup = new FormGroup({
      email: this.email,
      name: this.name,
      phone: this.phone,
      address: this.address,
      monthlybill: this.monthlybill,
      modulemake: this.modulemake,
      modulemodel: this.modulemodel,
      invertermake: this.invertermake,
      invertermodel: this.invertermodel,
      inverterscount: this.inverterscount,
      rooftype: this.rooftype,
      jobtype: this.jobtype,
      projecttype: this.projecttype,
      newconstruction: this.newconstruction,
      comments: this.comments,
      mountingtype: this.mountingtype,
      tiltgroundmount: this.tiltgroundmount,
      prioritytoggle: this.prioritytoggle,
      mpurequired: this.mpurequired,
      designstate: this.designstate,
      designcity: this.designcity,
      esiid: this.esiid,
      modulecount: this.modulecount,
    });

    this.prioritytoggle.setValue(false);
    this.newconstruction.setValue("false");
    this.mpurequired.setValue("false");
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
  }

  updateform(record: Design) {

    this.generateddesign = record;
    this.addDesignDialogFormGroup.patchValue({
      email: record.email, name: record.name,
      address: record.address, monthlybill: record.monthlybill, phone: record.phonenumber,
      modulemake: record.solarmake?.name, modulemodel: record.solarmodel?.name,
      invertermake: record.invertermake?.name, invertermodel: record.invertermodel?.name, inverterscount: record.inverterscount,
      rooftype: record.rooftype, jobtype: record.jobtype, projecttype: record.projecttype,
      newconstruction: record.newconstruction.toString(),
      mountingtype: record.mountingtype, tiltgroundmount: record.tiltofgroundmountingsystem, prioritytoggle: record.isonpriority, mpurequired: record.mpurequired.toString(), designstate: record.state,
      designcity: record.city, esiid: record.esiid, modulecount: record?.modulecount,
    });
    if (record.designinverters.length) {
      record.designinverters.forEach((element, index) => {
        this.numberOfInverters.push({ id: element.id, invertermake: "invertermake" + Number(index + 1), invertermodel: "invertermodel" + Number(index + 1), inverterscount: "inverterscount" + Number(index + 1), disabledinvertermodel: true, selectedInverterMakeID: element.invertermake?.id, selectedInverterModelID: element.invertermodel?.id, issaved: true })
        this.addDesignDialogFormGroup.addControl("invertermake" + Number(index + 1), new FormControl(element.invertermake?.name, Validators.required))
        this.addDesignDialogFormGroup.get('invertermake' + Number(index + 1)).patchValue(element.invertermake?.name);
        this.addDesignDialogFormGroup.addControl('invertermodel' + Number(index + 1), new FormControl(element.invertermodel?.name, Validators.required))
        this.addDesignDialogFormGroup.get('invertermodel' + Number(index + 1)).patchValue(element.invertermodel?.name)
        this.addDesignDialogFormGroup.addControl('inverterscount' + Number(index + 1), new FormControl(element?.inverterscount, Validators.required))
        this.addDesignDialogFormGroup.get('inverterscount' + Number(index + 1)).patchValue(element?.inverterscount)
        if (element.invertermake != null) {
          this.loadOtherInverterModelsData(element.invertermake?.id, index)
        }
      })
    }



    if (record.comments.length > 0) {
      this.addDesignDialogFormGroup.patchValue({
        comments: record.comments[0].message
      });
    }

    this.formatted_address = record.address;
    this.city = record.city;
    this.state = record.state;
    this.country = record.country;
    this.postalcode = record.postalcode;

    /* this.selectedModuleMakeID = record.solarmake.id;
    this.selectedModuleModelID = record.solarmodel.id;
    this.selectedInverterMakeID = record.invertermake.id;
    this.selectedInverterModelID = record.invertermodel.id; */

    this.genericService.setSelectedInverterMake(record.invertermake);

    this.loadModuleModelsData();
    // this.loadInverterModelsData();

    this.enableinputform(false);

    this.modulemake.enable();
    this.modulemodel.enable();
    this.modulecount.enable();
    this.showsavebutton = true;
    this.addextrainverters = true;

    record.designinverters.forEach((element, index) => {
      this.addDesignDialogFormGroup.get('invertermake' + Number(index + 1)).enable();
      this.addDesignDialogFormGroup.get('invertermodel' + Number(index + 1)).enable();
      this.addDesignDialogFormGroup.get('inverterscount' + Number(index + 1)).enable();
    });

    this.changeDetectorRef.detectChanges();
  }

  enableinputform(status) {
    if (status) {
      this.addDesignDialogFormGroup.enable();
    } else {
      this.addDesignDialogFormGroup.disable();
    }
  }

  setEditMode() {
    this.isEditMode = true;
    this.changeDetectorRef.detectChanges();
  }

  fillinEditModeSiteInformation(record: Design): void {
    this.isEditMode = true;
    this.generateddesign = record;
    this.addDesignDialogFormGroup.patchValue({
      email: record.email,
      name: record.name,
      address: record.address,
      monthlybill: record.monthlybill,
      phone: record.phonenumber,
      modulemake: record.solarmake.name,
      modulemodel: record.solarmodel.name,
      invertermake: record.invertermake.name,
      invertermodel: record.invertermodel.name,
      inverterscount: record.inverterscount,
      rooftype: record.rooftype,
      jobtype: record.jobtype,
      projecttype: record.projecttype,
      newconstruction: record.newconstruction.toString(),
      mountingtype: record.mountingtype,
      tiltgroundmount: record.tiltofgroundmountingsystem,
      prioritytoggle: record.isonpriority,
      mpurequired: record.mpurequired.toString(),
    });

    if (record.comments.length > 0) {
      this.addDesignDialogFormGroup.patchValue({
        comments: record.comments[0].message,
      });
    }

    this.formatted_address = record.address;
    this.city = record.city;
    this.state = record.state;
    this.country = record.country;
    this.postalcode = record.postalcode;

    this.selectedModuleMakeID = record.solarmake.id;
    this.selectedModuleModelID = record.solarmodel.id;
    this.selectedInverterMakeID = record.invertermake.id;
    this.selectedInverterModelID = record.invertermodel.id;

    this.genericService.setSelectedInverterMake(record.invertermake);

    this.changeDetectorRef.detectChanges();

    this.loadModuleModelsData();
    // this.loadInverterModelsData();

    this.addDesignDialogFormGroup.disable();
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
    } else if ($event.source.name === "jobtype") {
      if ($event.value == "battery") {
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.BatteryJobChange
        );
      } else if ($event.value == "pvbattery") {
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.PVBatteryJobChange
        );
      } else if ($event.value == "pv") {
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.PVJobChange
        );
      }
    } else if ($event.source.name === "newconstruction") {
      if ($event.value === "true") {
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.NewConstructionChangeOn
        );
      } else {
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.NewConstructionChangeOff
        );
      }
    }
  }

  getErrorMessage(
    control: FormControl
  ): string | string | string | string | string {
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
    } else if (control == this.phone) {
      return this.phone.hasError("pattern")
        ? "Please enter a valid phone number."
        : "";
    }
  }

  //----------------------------------------------------------------------------------
  //----ADD DESIGN INFORMATION TAB METHODS--------------------------------------------
  //----------------------------------------------------------------------------------

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
    this.genericService.setNewSiteLocation(location);
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

  fetchModuleModelsData(_event: any, make) {

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
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  setSelectedModuleModel(model): void {
    this.selectedModuleModelID = model.id;
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

  fetchInverterModelsData(_event: any, make) {
    this.invertermodels = [];
    this.selectedInverterMakeID = make.id;
    this.genericService.setSelectedInverterMake(make);
    this.commonService.getInverterModelsData(make.id).subscribe(
      (response) => {
        this.invertermodels = response;
        this.filteredInverterModels = this.invertermodelfilter.valueChanges.pipe(
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

  loadInverterModelsData(): void {
    this.invertermodels = [];
    this.commonService.getInverterModelsData(this.selectedInverterMakeID).subscribe(
      response => {
        this.invertermodels = response;
        this.filteredInverterModels = this.invertermodelfilter.valueChanges.pipe(
          startWith(""),
          map(value => (typeof value === "string" ? value : value.name)),
          map(name => (name ? this._filterInverterModel(name) : this.invertermodels.slice()))
        );
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  setSelectedInverterModel(model): void {
    this.selectedInverterModelID = model.id;
  }

  onAddDesign(): void {
    if (this.addDesignDialogFormGroup.valid) {
      if (
        JSON.parse(
          this.addDesignDialogFormGroup.get("newconstruction").value
        ) &&
        !this.isFileUploaded
      ) {
        this.displayerror = false;
        this.changeDetectorRef.markForCheck();
        this.addDesignDialogFormGroup.markAllAsTouched();
      } else {
        this.saveModuleMake();
      }
    } else {
      this.displayerror = false;
      this.changeDetectorRef.markForCheck();
      this.addDesignDialogFormGroup.markAllAsTouched();
    }
  }

  addDesignToServer(): void {
    const mountingtype = this.addDesignDialogFormGroup.get("mountingtype").value;
    let rooftype = null;
    let tilt = null;
    if (mountingtype == "roof") {
      rooftype = this.addDesignDialogFormGroup.get("rooftype").value;
    } else if (mountingtype == "ground") {
      tilt = parseInt(
        this.addDesignDialogFormGroup.get("tiltgroundmount").value
      );
    } else {
      rooftype = this.addDesignDialogFormGroup.get("rooftype").value;
      tilt = parseInt(
        this.addDesignDialogFormGroup.get("tiltgroundmount").value
      );
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    const designstatus = "created";
    const designoutsourced = null;
    const paymenttype = "";
    this.designService
      .addPermitDesignOld(
        this.addDesignDialogFormGroup.get("name").value,
        this.addDesignDialogFormGroup.get("email").value,
        this.addDesignDialogFormGroup.get("phone").value,
        this.formatted_address,
        parseInt(this.addDesignDialogFormGroup.get("monthlybill").value),
        this.selectedModuleMakeID,
        this.selectedModuleModelID,
        this.selectedInverterMakeID,
        this.selectedInverterModelID,
        rooftype,
        this.addDesignDialogFormGroup.get("jobtype").value,
        mountingtype,
        tilt,
        this.addDesignDialogFormGroup.get("projecttype").value,
        JSON.parse(this.addDesignDialogFormGroup.get("newconstruction").value),
        this.addDesignDialogFormGroup.get("comments").value,
        this.city,
        this.state,
        this.country,
        parseInt(this.postalcode),
        "permit",
        this.selectedSiteLocation.latitude,
        this.selectedSiteLocation.longitude,
        false,
        this.genericService.formatDateInBackendFormat(tomorrow.toISOString()),
        designstatus,
        designoutsourced,
        paymenttype,
        this.addDesignDialogFormGroup.get("mpurequired").value
      )
      .subscribe(
        (response) => {
          this.generateddesign = response;
          this.genericService.setNewGeneratedDesign(this.generateddesign);
          this.uploadAttachmentDesignFiles(response.id);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  onAttachmentFileSelect(event): void {
    this.isAttachmentUploaded = true;
    event.addedFiles[0].isImage = false;
    if (event.addedFiles[0].type.includes("image")) {
      event.addedFiles[0].isImage = true;
    }
    this.attachmentfiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 150);
  }

  onAttachmentFileRemove(event): void {
    this.attachmentfiles.splice(this.attachmentfiles.indexOf(event), 1);
    if (this.attachmentfiles.length == 0) {
      this.isAttachmentUploaded = false;
    }
  }

  uploadAttachmentDesignFiles(recordid: number): void {
    if (this.isAttachmentUploaded) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingAttachments
      );
      this.commonService
        .uploadFiles(
          recordid,
          "design/" + recordid,
          this.attachmentfiles,
          "attachments",
          "design"
        )
        .subscribe(
          (response) => {
            this.generateddesign.attachments = response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.uploadArchitecturalDesignFile(recordid);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.uploadArchitecturalDesignFile(recordid);
    }
  }

  onArchitecturalFileSelect(event): void {
    this.isFileUploaded = true;
    this.architecturalfiles.push(...event.addedFiles);
  }

  onArchitecturalFileRemove(event): void {
    this.architecturalfiles.splice(this.architecturalfiles.indexOf(event), 1);
    if (this.architecturalfiles.length == 0) {
      this.isFileUploaded = false;
    }
  }

  uploadArchitecturalDesignFile(recordid: number): void {
    if (this.isFileUploaded) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingArchitecturalDesign
      );
      this.commonService
        .uploadFiles(
          recordid,
          "design/" + recordid,
          this.architecturalfiles,
          "architecturaldesign",
          "design"
        )
        .subscribe(
          (response) => {
            this.generateddesign.architecturaldesign = response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            if (this.isEditMode) {
              this.notifyService.showSuccess(
                "Site information updated successfully.",
                "Success"
              );
              this.genericService.setNewGeneratedDesign(this.generateddesign);
              this.eventEmitterService.onPermitDesignGenerationStateChange(
                EVENTS_PERMIT_DESIGN.HideLoading
              );
              this.isDataSubmitted = true;
              this.eventEmitterService.onPermitDesignGenerationStateChange(
                EVENTS_PERMIT_DESIGN.DesignGenerated
              );
            } else {
              this.eventEmitterService.onPermitDesignGenerationStateChange(
                EVENTS_PERMIT_DESIGN.ChatSetup
              );
              this.createNewDesignChatGroup(this.generateddesign);
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      if (this.isEditMode) {
        this.notifyService.showSuccess(
          "Site information updated successfully.",
          "Success"
        );
        this.genericService.setNewGeneratedDesign(this.generateddesign);
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.HideLoading
        );
        this.isDataSubmitted = true;
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.DesignGenerated
        );
      } else {
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.ChatSetup
        );
        this.createNewDesignChatGroup(this.generateddesign);
      }
    }
  }

  saveModuleMake(): void {
    this.eventEmitterService.onPermitDesignGenerationStateChange(
      EVENTS_PERMIT_DESIGN.ShowLoading
    );
    const found = this.modulemakes.some(
      (el) => el.name === this.addDesignDialogFormGroup.get("modulemake").value
    );
    if (!found) {
      this.commonService
        .addModuleMake(this.addDesignDialogFormGroup.get("modulemake").value)
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
      (el) => el.name === this.addDesignDialogFormGroup.get("modulemake").value
    );
    const found = this.modulemodels.some(
      (el) => el.name === this.addDesignDialogFormGroup.get("modulemodel").value
    );
    if (!ismakefound || !found) {
      this.commonService
        .addModuleModel(
          this.addDesignDialogFormGroup.get("modulemodel").value,
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
      (el) =>
        el.name === this.addDesignDialogFormGroup.get("invertermake").value
    );
    if (!found) {
      this.commonService
        .addInverterMake(
          this.addDesignDialogFormGroup.get("invertermake").value
        )
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
      (el) =>
        el.name === this.addDesignDialogFormGroup.get("invertermake").value
    );
    const found = this.invertermodels.some(
      (el) =>
        el.name === this.addDesignDialogFormGroup.get("invertermodel").value
    );
    if (!ismakefound || !found) {
      this.commonService
        .addInverterModel(
          this.addDesignDialogFormGroup.get("invertermodel").value,
          this.selectedInverterMakeID
        )
        .subscribe(
          (response) => {
            this.selectedInverterModelID = response.id;
            if (this.isEditMode) {
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
      if (this.isEditMode) {
        this.editDesignOnServer();
      } else {
        this.addDesignToServer();
      }
    }
  }

  createNewDesignChatGroup(design: Design): void {
    const GUID = design.chatid;

    const address = design.address.substring(0, 60);

    const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
    const groupName = design.id + "_" + address + "_" + currentdatetime;

    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = design.groupchatpassword

    const group = new CometChat.Group(GUID, groupName, groupType, password);

    CometChat.createGroup(group).then(
      (group) => {
        const membersList = [
          new CometChat.GroupMember(
            "" + design.createdby.id,
            CometChat.GROUP_MEMBER_SCOPE.ADMIN
          ),
        ];
        CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
          () => {
            this.eventEmitterService.onPermitDesignGenerationStateChange(
              EVENTS_PERMIT_DESIGN.HideLoading
            );
            this.notifyService.showSuccess(
              "Site information saved successfully.",
              "Saved"
            );
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.isDataSubmitted = true;
            this.eventEmitterService.onPermitDesignGenerationStateChange(
              EVENTS_PERMIT_DESIGN.DesignGenerated
            );
          },
          () => {
            this.eventEmitterService.onPermitDesignGenerationStateChange(
              EVENTS_PERMIT_DESIGN.HideLoading
            );
          }
        );
      },
      () => {
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.HideLoading
        );
      }
    );
  }

  editDesignOnServer(): void {
    const mountingtype = this.addDesignDialogFormGroup.get("mountingtype").value;
    let rooftype = null;
    let tilt = null;
    if (mountingtype == "roof") {
      rooftype = this.addDesignDialogFormGroup.get("rooftype").value;
    } else if (mountingtype == "ground") {
      tilt = parseInt(
        this.addDesignDialogFormGroup.get("tiltgroundmount").value
      );
    } else {
      rooftype = this.addDesignDialogFormGroup.get("rooftype").value;
      tilt = parseInt(
        this.addDesignDialogFormGroup.get("tiltgroundmount").value
      );
    }
    const postData = {
      email: this.addDesignDialogFormGroup.get("email").value,
      name: this.addDesignDialogFormGroup.get("name").value,
      address: this.formatted_address,
      monthlybill: parseInt(
        this.addDesignDialogFormGroup.get("monthlybill").value
      ),
      solarmake: this.selectedModuleMakeID,
      solarmodel: this.selectedModuleModelID,
      invertermake: this.selectedInverterMakeID,
      invertermodel: this.selectedInverterModelID,
      rooftype: rooftype,
      mountingtype: mountingtype,
      tiltofgroundmountingsystem: tilt,
      projecttype: this.addDesignDialogFormGroup.get("projecttype").value,
      newconstruction: JSON.parse(
        this.addDesignDialogFormGroup.get("newconstruction").value
      ),
      comments: this.addDesignDialogFormGroup.get("comments").value,
      city: this.city,
      state: this.state,
      country: this.country,
      postalcode: parseInt(this.postalcode),
      isonpriority: JSON.parse(
        this.addDesignDialogFormGroup.get("prioritytoggle").value
      ),
    };

    this.designService.editDesign(this.generateddesign.id, postData).subscribe(
      (response) => {
        this.generateddesign = response;
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.ShowLoading
        );
        this.uploadAttachmentDesignFiles(response.id);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onRemoveAttachment(file: UploadedFile, index: number): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.generateddesign.attachments.splice(index, 1);
        this.generateddesign.attachments = [
          ...this.generateddesign.attachments,
        ];
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
        this.generateddesign.architecturaldesign.splice(index, 1);
        this.generateddesign.architecturaldesign = [
          ...this.generateddesign.architecturaldesign,
        ];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onPaste(event: ClipboardEvent): void {
    if (event.clipboardData.getData("text")) {
      const repalcedPhoneNo = event.clipboardData
        .getData("text")
        .replace(/[^0-9]+/gi, "");
      setTimeout(() => {
        this.addDesignDialogFormGroup.patchValue({
          phone: parseInt(repalcedPhoneNo),
        });
      }, 10);
      this.changeDetectorRef.detectChanges();
    }
    //   this.addDesignDialogFormGroup.setValue({ phone: repalcedPhoneNo, email: this.email});
    //    event.replace(/[^A-Za-z ]/g, '').replace(/\s/g, '');
  }

  addMoreInverters() {
    this.numberOfInverters.push({ id: null, invertermake: "invertermake" + Number(this.numberOfInverters.length + 1), invertermodel: "invertermodel" + Number(this.numberOfInverters.length + 1), inverterscount: "inverterscount" + Number(this.numberOfInverters.length + 1), invertermodellist: [], disabledinvertermodel: true, invertermodelfilter: "invertermodelfilter" + Number(this.numberOfInverters.length + 1) })


    this.addDesignDialogFormGroup.addControl('invertermake' + this.numberOfInverters.length, new FormControl('', Validators.required))
    this.addDesignDialogFormGroup.addControl('invertermodel' + this.numberOfInverters.length, new FormControl('', Validators.required))
    this.addDesignDialogFormGroup.addControl('inverterscount' + this.numberOfInverters.length, new FormControl('', Validators.required))
    this.addDesignDialogFormGroup.addControl('invertermodelfilter' + this.numberOfInverters.length, new FormControl(''))
    console.log(this.addDesignDialogFormGroup, this.numberOfInverters);
  }
  fetchOtherInverterModelsData(event, make, i) {
    if (event.isUserInput) {
      this.numberOfInverters[i].disabledinvertermodel = false;
      this.numberOfInverters[i].selectedInverterMakeID = make.id
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
  setInverterModelId(model, i) {
    this.numberOfInverters[i].selectedInverterModelID = model.id
    this.numberOfInverters[i].issaved = false;
  }
  searchinvertermodels(e) {
    this.searchTerm.name = e.target.value
  }
  removeExtraInverter(index, inverter) {
    this.numberOfInverters.splice(index, 1);
    this.addDesignDialogFormGroup.removeControl('invertermake' + Number(index + 1))
    this.addDesignDialogFormGroup.removeControl('invertermodel' + Number(index + 1))
    this.addDesignDialogFormGroup.removeControl('inverterscount' + Number(index + 1))
    this.addDesignDialogFormGroup.removeControl('invertermodelfilter' + Number(index + 1))

    if (inverter.id != null) {
      this.designService.deleteDesignInverters(inverter.id).subscribe(() => {

      })
    }
  }
  onSaveInformation(event) {
    let designinverters = []
    if (this.numberOfInverters.length > 0) {
      this.numberOfInverters.forEach((element, index) => {
        if (element.id == null) {
          designinverters.push({ invertermake: element.selectedInverterMakeID, invertermodel: element.selectedInverterModelID, invertercount: this.addDesignDialogFormGroup.get('inverterscount' + (index + 1)).value })
        }
      })
    }
    let postData = {
      solarmake: this.selectedModuleMakeID,
      solarmodel: this.selectedModuleModelID,
      designinverters: designinverters,
      modulecount: this.modulecount.value,
    }

    this.loaderservice.show();
    this.designService.editDesign(this.generateddesign.id, postData).subscribe(response => {
      this.numberOfInverters.forEach((element, index) => {
        if (!element.isSaved && element.id != null) {
          let postData = {
            invertermake: element.selectedInverterMakeID,
            invertermodel: element.selectedInverterModelID,
            inverterscount: this.addDesignDialogFormGroup.get('inverterscount' + (index + 1)).value
          }
          this.designService.saveDesignInverters(this.generateddesign.designinverters[index].id, postData).subscribe(res => {
          },
            error => {
              this.notifyService.showError(
                error,
                "Error"
              );
            })
        }
      });
      this.loaderservice.hide();
      this.notifyService.showSuccess("Design Information Saved Successfully", "Success");
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.SiteInformationSaved);
    },
      error => {
        this.notifyService.showError(error, "Error");
      }
    )
  }
}
