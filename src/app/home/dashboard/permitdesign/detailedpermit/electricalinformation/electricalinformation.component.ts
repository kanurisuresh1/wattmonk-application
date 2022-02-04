import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatRadioChange } from "@angular/material/radio";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { EVENTS_PERMIT_DESIGN, ROLES } from "src/app/_helpers";
import {
  BatteryMake, BatteryModel, Design, MSPBrand, OptimizerModel, UploadedFile, User
} from "src/app/_models";
import {
  AuthenticationService, DesignService,
  GenericService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";

@Component({
  selector: "app-electricalinformation",
  templateUrl: "./electricalinformation.component.html",
  styleUrls: ["./electricalinformation.component.scss"],
})
export class ElectricalinformationComponent implements OnInit {
  isDataSubmitted = false;
  isEditMode = false;
  electricalFormGroup: FormGroup;

  batterymake = new FormControl("", []);
  batterymodel = new FormControl("", []);
  batteriescount = new FormControl("", []);
  acdisconnect = new FormControl("", [Validators.required]);
  pvmeter = new FormControl("", [Validators.required]);
  servicefeedsource = new FormControl("", [Validators.required]);
  msp = new FormControl(null);
  mspbrand = new FormControl("", [Validators.required]);
  mspsize = new FormControl("", [Validators.required]);
  conduitrun = new FormControl("", [Validators.required]);
  conduitruntype = new FormControl("", [Validators.required]);
  optimizermodel = new FormControl("", []);
  mainbreakersize = new FormControl("", [Validators.required]);
  interconnection = new FormControl("", [Validators.required]);
  interconnection_input = new FormControl("", []);
  combinerbox = new FormControl("", []);
  electricalcomments = new FormControl("", []);
  supplyvoltage = new FormControl("", []);

  displayerror = true;
  isjobtypepv = false;

  batterymakes: BatteryMake[] = [];
  filteredbatterymakes: Observable<BatteryMake[]>;
  selectedBatteryMakeID: number;
  isBatteryMakeSelected = false;

  batterymodels: BatteryModel[] = [];
  filteredbatterymodels: Observable<BatteryModel[]>;
  selectedBatteryModelID: number;

  mspbrands: MSPBrand[] = [];
  filteredmspbrands: Observable<MSPBrand[]>;
  selectedMSPBrandID: number;
  isMSPBrandSelected = false;

  optimizermodels: OptimizerModel[] = [];
  filteredoptimizermodels: Observable<OptimizerModel[]>;
  selectedOptimizerModel: OptimizerModel;

  mspfilesuploaded = true;
  subpanelsfilesuploaded = true;
  sketchlinefileuploaded = true;
  isSolarEdgeInverterSelected = false;

  mspphotos: File[] = [];
  subpanelphotos: File[] = [];
  singlelinephotos: File[] = [];

  generateddesign: Design;
  isDisplayMode = false;
  projecttype: string

  loggedInUser: User;
  isClient: boolean = false;
  ismpurequired = false;

  constructor(private notifyService: NotificationService,
    private designService: DesignService,
    private commonService: CommonService,
    private genericService: GenericService,
    private eventEmitterService: EventEmitterService,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthenticationService,
    public dialogRef: MatDialog) {
    this.loggedInUser = this.authService.currentUserValue.user;
    if (this.loggedInUser.role.id == ROLES.ContractorSuperAdmin || this.loggedInUser.role.id == ROLES.ContractorAdmin || this.loggedInUser.role.id == ROLES.SuccessManager || this.loggedInUser.role.id == ROLES.Master || (this.loggedInUser.role.id == ROLES.BD && this.loggedInUser.parent.id != 232) || (this.loggedInUser.role.id == ROLES.TeamHead && this.loggedInUser.parent.id != 232)) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
    this.electricalFormGroup = new FormGroup({
      batterymake: this.batterymake,
      batterymodel: this.batterymodel,
      batteriescount: this.batteriescount,
      acdisconnect: this.acdisconnect,
      pvmeter: this.pvmeter,
      servicefeedsource: this.servicefeedsource,
      msp: this.msp,
      mspbrand: this.mspbrand,
      mspsize: this.mspsize,
      conduitrun: this.conduitrun,
      conduitruntype: this.conduitruntype,
      optimizermodel: this.optimizermodel,
      mainbreakersize: this.mainbreakersize,
      interconnection: this.interconnection,
      interconnection_input: this.interconnection_input,
      combinerbox: this.combinerbox,
      electricalcomments: this.electricalcomments,
      supplyvoltage: this.supplyvoltage,
    });

    this.conduitruntype.setValue("emt");
    this.combinerbox.setValue("false");
    this.batterymake.setValidators([Validators.required]);
    this.batterymodel.setValidators([Validators.required]);
    this.batteriescount.setValidators([Validators.required]);

    this.electricalFormGroup.disable();
  }

  ngOnInit(): void {
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
    });
  }
  ngAfterViewInit() {

  }
  getprojecttype(data) {
    this.projecttype = data;
    this.changeDetectorRef.detectChanges();
  }
  // setEditMode() {
  //   this.isEditMode = true;
  //   this.changeDetectorRef.detectChanges();
  // }

  radioChange($event: MatRadioChange) {
    if ($event.source.name === 'interconnection') {
      if ($event.value != "more") {
        this.interconnection_input.clearValidators();
        this.interconnection_input.updateValueAndValidity();
      } else {
        this.interconnection_input.setValidators([Validators.required]);
      }
    } else if ($event.source.name === 'acdisconnect') {
      if ($event.value === 'true') {
        this.eventEmitterService.onlocationMarkingStateChange(EVENTS_PERMIT_DESIGN.UtilityACDisconnectChangeOn);
      } else {
        this.eventEmitterService.onlocationMarkingStateChange(EVENTS_PERMIT_DESIGN.UtilityACDisconnectChangeOff);
      }
    } else if ($event.source.name === 'pvmeter') {
      if ($event.value === 'true') {
        this.eventEmitterService.onlocationMarkingStateChange(EVENTS_PERMIT_DESIGN.PVMeterChangeOn);
      } else {
        this.eventEmitterService.onlocationMarkingStateChange(EVENTS_PERMIT_DESIGN.PVMeterChangeOff);
      }
    }
  }

  updateform(record: Design) {
    this.generateddesign = record;
    this.ismpurequired = this.generateddesign.mpurequired
    if (this.generateddesign.mpurequired) {
      this.msp.clearValidators();

    }
    else {
      this.msp.setValidators(Validators.required);
    }
    if (this.generateddesign.jobtype == "pv") {
      this.isjobtypepv = true;
      this.batterymake.clearValidators();
      this.batterymake.updateValueAndValidity();

      this.batterymodel.clearValidators();
      this.batterymodel.updateValueAndValidity();

      this.batteriescount.clearValidators();
      this.batteriescount.updateValueAndValidity();
    } else {
      this.isjobtypepv = false;
      this.batterymake.setValidators([Validators.required]);
      this.batterymodel.setValidators([Validators.required]);
      this.batteriescount.setValidators([Validators.required]);
    }

    if (this.generateddesign.projecttype == 'commercial') {
      this.supplyvoltage.setValidators([Validators.required]);
      this.projecttype = 'commercial'
    } else {
      this.projecttype = this.generateddesign.projecttype
      this.supplyvoltage.clearValidators();
    }

    if (this.generateddesign.electricalinformation != null) {
      this.isDisplayMode = true;
      this.electricalFormGroup.patchValue({
        acdisconnect: "" + record.electricalinformation.acdisconnect,
        pvmeter: "" + record.electricalinformation.pvmeter,
        servicefeedsource: record.electricalinformation.servicefeedsource,
        msp: record.electricalinformation.msp,
        mspbrand: record.electricalinformation.mspbrand.name,
        mspsize: record.electricalinformation.mspsize,
        conduitrun: record.electricalinformation.conduitrun,
        conduitruntype: record.electricalinformation.typeofconduit,
        interconnection: record.electricalinformation.interconnection,
        mainbreakersize: record.electricalinformation.mainbreakersize,
        electricalcomments: record.electricalinformation.comments
      });

      if (!this.isjobtypepv) {
        this.electricalFormGroup.patchValue({
          batterymake: record.electricalinformation.batterymake.name,
          batterymodel: record.electricalinformation.batterymodel.name,
          batteriescount: record.electricalinformation.numberofbatteries,
          combinerbox: "" + record.electricalinformation.combinerbox
        });
        this.selectedMSPBrandID = record.electricalinformation.mspbrand.id;
        this.selectedBatteryMakeID = record.electricalinformation.batterymake.id;
        this.selectedBatteryModelID = record.electricalinformation.batterymodel.id;
      }

      if (record.projecttype == 'commercial') {
        this.electricalFormGroup.patchValue({
          supplyvoltage: record.electricalinformation.supplyvoltage
        });
      }



      this.changeDetectorRef.detectChanges();
      this.fetchElectricalData();
      this.fetchBatteryModelsData();
      this.enableinputform(false);
    } else {
      this.fetchElectricalData();
      this.enableinputform(true);
    }

  }

  enableinputform(status) {
    if (status) {
      this.electricalFormGroup.enable();
    } else {
      this.electricalFormGroup.disable();
    }
  }

  loadInputInformation(record: Design) {
    this.isDisplayMode = true;
    this.electricalFormGroup.patchValue({
      acdisconnect: "" + record.electricalinformation.acdisconnect,
      pvmeter: "" + record.electricalinformation.pvmeter,
      servicefeedsource: record.electricalinformation.servicefeedsource,
      msp: record.electricalinformation.msp,
      mspbrand: record.electricalinformation.mspbrand.name,
      mspsize: record.electricalinformation.mspsize,
      conduitrun: record.electricalinformation.conduitrun,
      conduitruntype: record.electricalinformation.typeofconduit,
      interconnection: record.electricalinformation.interconnection,
      mainbreakersize: record.electricalinformation.mainbreakersize,
      electricalcomments: record.electricalinformation.comments,
    });

    if (record.jobtype != "pv") {
      this.isjobtypepv = false;
      this.electricalFormGroup.patchValue({
        batterymake: record.electricalinformation.batterymake.name,
        batterymodel: record.electricalinformation.batterymodel.name,
        batteriescount: record.electricalinformation.numberofbatteries,
        combinerbox: "" + record.electricalinformation.combinerbox,
      });
      this.selectedMSPBrandID = record.electricalinformation.mspbrand.id;
      this.selectedBatteryMakeID = record.electricalinformation.batterymake.id;
      this.selectedBatteryModelID =
        record.electricalinformation.batterymodel.id;
      this.fetchBatteryModelsData();
    } else {
      this.isjobtypepv = true;
    }

    this.changeDetectorRef.detectChanges();
    this.fetchElectricalData();

    this.electricalFormGroup.disable();
  }

  loadGeneratedDesign(): void {
    this.generateddesign = this.genericService.getNewGeneratedDesign();
    if (this.generateddesign.jobtype == "pv") {
      this.isjobtypepv = true;
      this.batterymake.clearValidators();
      this.batterymake.updateValueAndValidity();

      this.batterymodel.clearValidators();
      this.batterymodel.updateValueAndValidity();

      this.batteriescount.clearValidators();
      this.batteriescount.updateValueAndValidity();
    } else {
      this.isjobtypepv = false;
      this.batterymake.setValidators([Validators.required]);
      this.batterymodel.setValidators([Validators.required]);
      this.batteriescount.setValidators([Validators.required]);
    }
    this.changeDetectorRef.detectChanges();
  }

  fillinElectricalDetails(record: Design): void {
    this.isEditMode = true;
    this.generateddesign = record;

    this.electricalFormGroup.patchValue({
      acdisconnect: "" + record.electricalinformation.acdisconnect,
      pvmeter: "" + record.electricalinformation.pvmeter,
      servicefeedsource: record.electricalinformation.servicefeedsource,
      msp: record.electricalinformation.msp,
      mspbrand: record.electricalinformation.mspbrand.name,
      mspsize: record.electricalinformation.mspsize,
      conduitrun: record.electricalinformation.conduitrun,
      conduitruntype: record.electricalinformation.typeofconduit,
      interconnection: record.electricalinformation.interconnection,
      mainbreakersize: record.electricalinformation.mainbreakersize,
      electricalcomments: record.electricalinformation.comments,
    });

    if (record.jobtype != "pv") {
      this.isjobtypepv = false;
      this.electricalFormGroup.patchValue({
        batterymake: record.electricalinformation.batterymake.name,
        batterymodel: record.electricalinformation.batterymodel.name,
        batteriescount: record.electricalinformation.numberofbatteries,
        combinerbox: "" + record.electricalinformation.combinerbox,
      });
    } else {
      this.isjobtypepv = true;
    }

    if (record.projecttype == "commercial") {
      this.electricalFormGroup.patchValue({
        supplyvoltage: record.electricalinformation.supplyvoltage,
      });
    }

    this.selectedMSPBrandID = record.electricalinformation.mspbrand.id;
    this.selectedBatteryMakeID = record.electricalinformation.batterymake?.id;
    this.selectedBatteryModelID = record.electricalinformation.batterymodel?.id;

    this.changeDetectorRef.detectChanges();
    this.fetchElectricalData();
    this.fetchBatteryModelsData();
  }

  MspBusSize(event: any) {
    console.log(event.target.value)
    var mspbussize = event.target.value
    this.mainbreakersize.setValidators([Validators.max(mspbussize)])
  }
  getErrorMessage(control: FormControl): string | string | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }

    if (control == this.mainbreakersize) {
      return control.hasError("max")
        ? "Value should be <= MSP Bus Size."
        : "";
    }
  }

  enableForm(record: Design): void {
    this.generateddesign = record;
    if (this.generateddesign.jobtype == "pv") {
      this.isjobtypepv = true;
      this.batterymake.clearValidators();
      this.batterymake.updateValueAndValidity();

      this.batterymodel.clearValidators();
      this.batterymodel.updateValueAndValidity();

      this.batteriescount.clearValidators();
      this.batteriescount.updateValueAndValidity();
    } else {
      this.isjobtypepv = false;
      this.batterymake.setValidators([Validators.required]);
      this.batterymodel.setValidators([Validators.required]);
      this.batteriescount.setValidators([Validators.required]);
    }
    if (this.generateddesign.projecttype == "commercial") {
      this.supplyvoltage.setValidators([Validators.required]);
    } else {
      this.supplyvoltage.clearValidators();
    }

    this.electricalFormGroup.enable();
    this.changeDetectorRef.detectChanges();
  }

  //----------------------------------------------------------------------------------
  //----ELECTRICAL INFORMATION TAB METHODS--------------------------------------------
  //----------------------------------------------------------------------------------

  fetchElectricalData() {
    if (!this.isjobtypepv) {
      this.fetchBatteryMakesData();
    }
    this.fetchMSPBrandData();
    for (var inverter of this.generateddesign.designinverters) {
      if (inverter.invertermake != null && inverter.invertermake?.name == "SOLAREDGE") {
        this.isSolarEdgeInverterSelected = true;
        this.fetchOptimizersData(inverter.invertermake?.id);
        this.optimizermodel.setValidators([Validators.required]);
        break;
      } else {
        this.isSolarEdgeInverterSelected = false;
        this.optimizermodel.clearValidators();
        this.optimizermodel.updateValueAndValidity();
      }
    }

  }

  displayFnBatteryMake(batterymake: BatteryMake): string {
    return batterymake && batterymake.name ? batterymake.name : "";
  }

  private _filterBatteryMake(name: string): BatteryMake[] {
    const filterValue = name.toLowerCase();

    return this.batterymakes.filter(
      (batterymake) => batterymake.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  displayFnBatteryModel(batterymodel: BatteryModel): string {
    return batterymodel && batterymodel.name ? batterymodel.name : "";
  }

  private _filterBatteryModel(name: string): BatteryModel[] {
    const filterValue = name.toLowerCase();

    return this.batterymodels.filter(
      (batterymodel) =>
        batterymodel.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  displayFnMSPBrand(mspbrand: MSPBrand): string {
    return mspbrand && mspbrand.name ? mspbrand.name : "";
  }

  private _filterMSPBrand(name: string): MSPBrand[] {
    const filterValue = name.toLowerCase();

    return this.mspbrands.filter(
      (msp) => msp.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  displayFnOptimizerModel(optimizermodel: OptimizerModel): string {
    return optimizermodel && optimizermodel.name ? optimizermodel.name : "";
  }

  private _filterOptimizerModel(name: string): OptimizerModel[] {
    const filterValue = name.toLowerCase();

    return this.optimizermodels.filter(
      (model) => model.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  fetchBatteryMakesData(): void {
    this.commonService.getBatteryMakes().subscribe(
      (response) => {
        if (response.length > 0) {
          this.batterymakes = response;
          this.filteredbatterymakes = this.batterymake.valueChanges.pipe(
            startWith(""),
            map((value) => (typeof value === "string" ? value : value.name)),
            map((name) =>
              name ? this._filterBatteryMake(name) : this.batterymakes.slice()
            )
          );
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchBatteryModelsData(): void {
    this.commonService.getBatteryModels(this.selectedBatteryMakeID).subscribe(
      (response) => {
        if (response.length > 0) {
          this.batterymodels = response;
          this.filteredbatterymodels = this.batterymodel.valueChanges.pipe(
            startWith(""),
            map((value) => (typeof value === "string" ? value : value.name)),
            map((name) =>
              name ? this._filterBatteryModel(name) : this.batterymodels.slice()
            )
          );
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchOptimizersData(invertermakeid): void {
    this.commonService
      .getOptimizerModels(invertermakeid)
      .subscribe(
        (response) => {
          if (response.length > 0) {
            this.optimizermodels = response;
            this.filteredoptimizermodels =
              this.optimizermodel.valueChanges.pipe(
                startWith(""),
                map((value) =>
                  typeof value === "string" ? value : value.name
                ),
                map((name) =>
                  name
                    ? this._filterOptimizerModel(name)
                    : this.optimizermodels.slice()
                )
              );
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  fetchMSPBrandData(): void {
    this.commonService.getMSPBrands().subscribe(
      (response) => {
        if (response.length > 0) {
          this.mspbrands = response;
          this.filteredmspbrands = this.mspbrand.valueChanges.pipe(
            startWith(""),
            map((value) => (typeof value === "string" ? value : value.name)),
            map((name) =>
              name ? this._filterMSPBrand(name) : this.mspbrands.slice()
            )
          );
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  saveElectricalInformation() {
    console.log("Inside save electrical information");
    if (this.electricalFormGroup.valid) {
      // this.saveMSPBrandData(); 
      if (this.isEditMode) {
        this.updateDesignElectricalInformation();
      } else {
        this.saveDesignElectricalInformation();
      }

    } else {
      if (this.isClient) {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ElectricalInformationSkipped);
      } else {
        console.log(this.genericService.findInvalidControls(this.electricalFormGroup));
        this.electricalFormGroup.markAllAsTouched();
        this.displayerror = false;
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  /* saveMSPBrandData() {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
    const found = this.mspbrands.some(el => el.name === this.electricalFormGroup.get("mspbrand").value);
    if (!found) {
      this.commonService
        .addMSPBrand(this.electricalFormGroup.get("mspbrand").value)
        .subscribe(
          (response) => {
            this.selectedMSPBrandID = response.id;
            if(!this.isjobtypepv){
              this.saveBatteryMakeData();
            }else{
              if (this.isEditMode) {
                this.updateDesignElectricalInformation();
              } else {
                this.saveDesignElectricalInformation();
              }
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.saveBatteryMakeData();
    }
  } */

  // saveBatteryMakeData() {
  //   const found = this.batterymakes.some(el => el.name === this.electricalFormGroup.get("batterymake").value);
  //   if (!found) {
  //     this.commonService
  //       .addBatteryMake(
  //         this.electricalFormGroup.get("batterymake").value
  //       )
  //       .subscribe(
  //         response => {
  //           this.selectedBatteryMakeID = response.id;
  //           this.saveBatteryModelData();
  //         },
  //         error => {
  //           this.notifyService.showError(
  //             error,
  //             "Error"
  //           );
  //         }
  //       );
  //   } else {
  //     this.saveBatteryModelData();
  //   }
  // }

  // saveBatteryModelData() {
  //   const found = this.batterymodels.some(el => el.name === this.electricalFormGroup.get("batterymodel").value);
  //   if (!found) {
  //     this.commonService
  //       .addBatteryModel(
  //         this.electricalFormGroup.get("batterymodel").value,
  //         this.selectedBatteryMakeID
  //       )
  //       .subscribe(
  //         response => {
  //           this.selectedBatteryModelID = response.id;
  //           if (this.isEditMode) {
  //             this.updateDesignElectricalInformation();
  //           } else {
  //             this.saveDesignElectricalInformation();
  //           }
  //         },
  //         error => {
  //           this.notifyService.showError(
  //             error,
  //             "Error"
  //           );
  //         }
  //       );
  //   } else {
  //     if (this.isEditMode) {
  //       this.updateDesignElectricalInformation();
  //     } else {
  //       this.saveDesignElectricalInformation();
  //     }
  //   }
  // }

  saveDesignElectricalInformation() {
    // var optimizer = null;
    // if (this.isSolarEdgeInverterSelected) {
    //   optimizer = this.selectedOptimizerModel.id;
    // }
    var combinerboxvalue = null;
    var combinerboxvalue = null;
    var batterymake = null;
    var batterymodel = null
    if (!this.isjobtypepv) {
      combinerboxvalue = this.electricalFormGroup.get("combinerbox").value;
      batterymake = this.batterymake.value;
      batterymodel = this.batterymodel.value;
    }

    var supplyvoltagevalue = null;
    if (this.generateddesign.projecttype == 'commercial') {
      supplyvoltagevalue = this.electricalFormGroup.get("supplyvoltage").value
    }
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
    this.designService
      .addDesignElectricalInformation(
        this.electricalFormGroup.get("acdisconnect").value,
        this.electricalFormGroup.get("pvmeter").value,
        this.electricalFormGroup.get("servicefeedsource").value,
        this.electricalFormGroup.get("msp").value,
        parseInt(this.electricalFormGroup.get("mspsize").value),
        this.electricalFormGroup.get("conduitrun").value,
        this.electricalFormGroup.get("conduitruntype").value,
        this.electricalFormGroup.get("interconnection").value,
        this.electricalFormGroup.get("interconnection_input").value,
        this.electricalFormGroup.get("mainbreakersize").value,
        batterymake,
        batterymodel,
        this.mspbrand.value,
        this.optimizermodel.value,
        parseInt(this.electricalFormGroup.get("batteriescount").value),
        combinerboxvalue,
        this.electricalFormGroup.get("electricalcomments").value,
        this.generateddesign.id,
        supplyvoltagevalue
      )
      .subscribe(
        (response) => {
          this.generateddesign.electricalinformation = response;
          this.genericService.setNewGeneratedDesign(this.generateddesign);
          this.uploadMSPPhotosFiles(response.id);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  updateDesignElectricalInformation(): void {
    let optimizer = null;
    if (this.isSolarEdgeInverterSelected) {
      optimizer = this.selectedOptimizerModel.id;
    }
    var combinerboxvalue = null;
    var batterymake = null;
    var batterymodel = null
    if (!this.isjobtypepv) {
      combinerboxvalue = this.electricalFormGroup.get("combinerbox").value;
      batterymake = this.batterymake.value;
      batterymodel = this.batterymodel.value;
    }
    const postData = {
      acdisconnect: this.electricalFormGroup.get("acdisconnect").value,
      pvmeter: this.electricalFormGroup.get("pvmeter").value,
      servicefeedsource:
        this.electricalFormGroup.get("servicefeedsource").value,
      msp: this.electricalFormGroup.get("msp").value,
      mspsize: parseInt(this.electricalFormGroup.get("mspsize").value),
      conduitrun: this.electricalFormGroup.get("conduitrun").value,
      conduitruntype: this.electricalFormGroup.get("conduitruntype").value,
      interconnection: this.electricalFormGroup.get("interconnection").value,
      mainbreakersize: this.electricalFormGroup.get("mainbreakersize").value,
      batterymake: batterymake,
      batterymodel: batterymodel,
      mspbrand: this.mspbrand.value,
      optimizer: optimizer,
      batteriescount: parseInt(
        this.electricalFormGroup.get("batteriescount").value
      ),
      combinerbox: combinerboxvalue,
      comments: this.electricalFormGroup.get("electricalcomments").value,
      design: this.generateddesign.id,
    };

    this.designService
      .editDesignElectricalInformation(
        this.generateddesign.electricalinformation.id,
        postData
      )
      .subscribe(
        (response) => {
          this.eventEmitterService.onPermitDesignGenerationStateChange(
            EVENTS_PERMIT_DESIGN.ShowLoading
          );
          this.uploadMSPPhotosFiles(response.id);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  setSelectedBatteryMake(record): void {
    this.isBatteryMakeSelected = true;
    this.selectedBatteryMakeID = record.id;
    this.fetchBatteryModelsData();
  }

  setSelectedBatteryModel(record): void {
    this.selectedBatteryModelID = record.id;
  }

  setSelectedMSPBrand(record): void {
    this.isMSPBrandSelected = true;
    this.selectedMSPBrandID = record.id;
  }

  setSelectedOptimizer(record): void {
    this.selectedOptimizerModel = record;
  }

  onMspPhotosSelect(event): void {
    this.mspfilesuploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      this.mspphotos.push(element);
      console.log(this.mspphotos);
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onMspPhotosRemove(event): void {
    this.mspphotos.splice(this.mspphotos.indexOf(event), 1);
    if (this.mspphotos.length == 0) {
      this.mspfilesuploaded = false;
    }
  }

  uploadMSPPhotosFiles(recordid: number): void {
    if (this.mspphotos.length > 0) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingMSPPhotos
      );
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.mspphotos,
          "mspphotos",
          "designelectricalinformation"
        )
        .subscribe(
          (response) => {
            this.generateddesign.electricalinformation.mspphotos = response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.uploadSubpanelPhotosFiles(recordid);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.uploadSubpanelPhotosFiles(recordid);
    }
  }

  onSubpanelPhotosSelect(event): void {
    this.subpanelsfilesuploaded = true;
    // this.subpanelphotos.push(...event.addedFiles);
    event.addedFiles[0].isImage = false;
    if (event.addedFiles[0].type.includes("image")) {
      event.addedFiles[0].isImage = true;
    }
    this.subpanelphotos.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 150);
  }

  onSubpanelPhotosRemove(event): void {
    this.subpanelphotos.splice(this.subpanelphotos.indexOf(event), 1);
    if (this.subpanelphotos.length == 0) {
      this.subpanelsfilesuploaded = false;
    }
  }

  uploadSubpanelPhotosFiles(recordid: number): void {
    if (this.subpanelphotos.length > 0) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingSubpanelPhotos
      );
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.subpanelphotos,
          "subpanelphotos",
          "designelectricalinformation"
        )
        .subscribe(
          (response) => {
            this.generateddesign.electricalinformation.subpanelphotos =
              response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.uploadSingleLineFiles(recordid);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.uploadSingleLineFiles(recordid);
    }
  }

  onSingleLinePhotosSelect(event): void {
    this.sketchlinefileuploaded = true;
    // this.singlelinephotos.push(...event.addedFiles);
    event.addedFiles[0].isImage = false;
    if (event.addedFiles[0].type.includes("image")) {
      event.addedFiles[0].isImage = true;
    }
    this.singlelinephotos.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 150);
  }

  onSingleLinePhotosRemove(event): void {
    this.singlelinephotos.splice(this.singlelinephotos.indexOf(event), 1);
    if (this.singlelinephotos.length == 0) {
      this.sketchlinefileuploaded = false;
    }
  }

  uploadSingleLineFiles(recordid: number): void {
    if (this.singlelinephotos.length > 0) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingSketchDiagram
      );
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.singlelinephotos,
          "singlelinediagram",
          "designelectricalinformation"
        )
        .subscribe(
          (response) => {
            this.generateddesign.electricalinformation.singlelinediagram =
              response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            if (this.isEditMode) {
              this.notifyService.showSuccess(
                "Electrical information updated successfully.",
                "Saved"
              );
            } else {
              // this.notifyService.showSuccess("Electrical information saved successfully.", "Saved");
            }
            this.isDataSubmitted = true;
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ElectricalInformationSaved);
            this.dialogRef.closeAll();
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(
              EVENTS_PERMIT_DESIGN.ElectricalInformationSaved
            );
          },

        );
    } else {
      if (this.isEditMode) {
        this.notifyService.showSuccess(
          "Electrical information updated successfully.",
          "Saved"
        );
      } else {
        // this.notifyService.showSuccess("Electrical information saved successfully.", "Saved");
      }
      this.isDataSubmitted = true;
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.HideLoading
      );
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.ElectricalInformationSaved
      );
    }
  }

  batteriescountChange(): void {
    const count = parseInt(this.electricalFormGroup.get("batteriescount").value);
    if (count > 1) {
      this.combinerbox.setValidators([Validators.required]);
    } else {
      this.combinerbox.clearValidators();
      this.combinerbox.updateValueAndValidity();
    }
  }

  onRemoveMSPPhotos(file: UploadedFile, index: number): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.generateddesign.electricalinformation.mspphotos.splice(index, 1);
        this.generateddesign.electricalinformation.mspphotos = [
          ...this.generateddesign.electricalinformation.mspphotos,
        ];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onRemoveSubpanelPhotos(file: UploadedFile, index: number): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.generateddesign.electricalinformation.subpanelphotos.splice(
          index,
          1
        );
        this.generateddesign.electricalinformation.subpanelphotos = [
          ...this.generateddesign.electricalinformation.subpanelphotos,
        ];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onRemoveSingleLineDiagramPhotos(file: UploadedFile, index: number): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.generateddesign.electricalinformation.singlelinediagram.splice(
          index,
          1
        );
        this.generateddesign.electricalinformation.singlelinediagram = [
          ...this.generateddesign.electricalinformation.singlelinediagram,
        ];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onDeleteMspphotos(id, index) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      response => {
        this.generateddesign.electricalinformation.mspphotos.splice(index, 1)
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onDeleteSubpanelphotos(id, index) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      response => {
        this.generateddesign.electricalinformation.subpanelphotos.splice(index, 1)
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onDeleteSinglelinediagram(id, index) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      response => {
        this.generateddesign.electricalinformation.singlelinediagram.splice(index, 1)
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
}
