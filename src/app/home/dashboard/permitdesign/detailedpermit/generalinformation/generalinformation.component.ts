import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatRadioChange } from "@angular/material/radio";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { EVENTS_PERMIT_DESIGN, ROLES } from "src/app/_helpers";
import { Design, User } from "src/app/_models";
import { Ahj } from "src/app/_models/ahj";
import { Firesetback } from "src/app/_models/firesetback";
import { Utility } from "src/app/_models/utility";
import {
  AuthenticationService, DesignService,
  GenericService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";

@Component({
  selector: "app-generalinformation",
  templateUrl: "./generalinformation.component.html",
  styleUrls: ["./generalinformation.component.scss"],
})
export class GeneralinformationComponent implements OnInit {
  isDataSubmitted = false;
  isEditMode = false;
  isjobtypepv = false;
  generalFormGroup: FormGroup;

  batterybackup = new FormControl("", []);
  firesetback = new FormControl("", []);
  setbackdetails = new FormControl("", []);
  ahjname = new FormControl("");
  ahjrequirements = new FormControl("", []);
  utilityname = new FormControl("", [Validators.required]);
  utilityrequirements = new FormControl("", []);
  riskcategory = new FormControl("", []);
  // modulescount = new FormControl("", [Validators.required]);
  financingtype = new FormControl("", [Validators.required]);
  meterlessor = new FormControl("", []);
  generalcomments = new FormControl("", []);

  fetchedahjdetails = new Ahj();
  savedahjrecordid: number;
  fetchedutilitydetails = new Utility();
  savedutilityrecordid: number;
  fetchedfiresetbackdetails = new Firesetback();
  savedfiresetbackrecordid: number;

  displayerror = true;
  modulelayoutfiles: File[] = [];
  modulesfileuploaded = true;
  isLoading = false;

  generateddesign: Design;
  isDisplayMode = false;

  AhjArray: any;
  UtilityArray: any;
  FiresetbackdetailsArray: any;
  filteredAhj: Observable<string[]>;
  filteredUtility: Observable<string[]>;
  firesetBackdetails: Observable<string[]>;

  isClient: boolean = false;
  loggedInUser: User;

  constructor(private notifyService: NotificationService,
    private designService: DesignService,
    private commonService: CommonService,
    private genericService: GenericService,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private authService: AuthenticationService) {
    this.loggedInUser = authService.currentUserValue.user;
    if (this.loggedInUser.role.id == ROLES.ContractorSuperAdmin || this.loggedInUser.role.id == ROLES.ContractorAdmin || this.loggedInUser.role.id == ROLES.SuccessManager || this.loggedInUser.role.id == ROLES.Master || (this.loggedInUser.role.id == ROLES.BD && this.loggedInUser.parent.id != 232) || (this.loggedInUser.role.id == ROLES.TeamHead && this.loggedInUser.parent.id != 232)) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
    this.generalFormGroup = new FormGroup({
      batterybackup: this.batterybackup,
      firesetback: this.firesetback,
      setbackdetails: this.setbackdetails,
      ahjname: this.ahjname,
      ahjrequirements: this.ahjrequirements,
      utilityname: this.utilityname,
      utilityrequirements: this.utilityrequirements,
      riskcategory: this.riskcategory,
      // modulescount: this.modulescount,
      financingtype: this.financingtype,
      meterlessor: this.meterlessor,
      generalcomments: this.generalcomments,
    });

    this.batterybackup.setValue('whole');
    this.firesetback.setValue('false');
    this.financingtype.setValue('cashloan');
    this.riskcategory.setValue('II');
    // this.modulescount.setValidators([Validators.required]);

    this.generalFormGroup.disable();
  }

  ngOnInit(): void {
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
    });
  }
  private _filter(value: string, options): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    );
  }

  filterData(data, filters) {
    data = JSON.parse(JSON.stringify(data).replace(/\:null/gi, ':""'));
    return data.filter((sheet) => {
      return (
        sheet.state.toLowerCase().includes(filters.state.toLowerCase()) &&
        sheet.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    });
  }

  updateform(record: Design) {
    this.generateddesign = record;
    if (this.generateddesign.jobtype == "pv") {
      this.isjobtypepv = true;
      this.batterybackup.clearValidators();
    } else {
      this.isjobtypepv = false;
      this.batterybackup.setValidators([Validators.required]);
    }
    this.getAhjdropdownData();
    this.getUtilitydropdowData();
    this.getFiresetbackdetailsdropdownData();

    this.fetchAHJDetailsData();
    this.fetchUtilityDetailsData();
    this.fetchFiresetbackDetailsData();

    if (record.designgeneralinformation != null) {
      this.isDisplayMode = true;
      this.generalFormGroup.patchValue({
        batterybackup: record.designgeneralinformation.batterybackup,
        firesetback: "" + record.designgeneralinformation.firesetbackdetails.firesetback,
        setbackdetails: record.designgeneralinformation.firesetbackdetails.setbackdetails,
        riskcategory: record.designgeneralinformation.riskcategory,
        ahjname: record.designgeneralinformation.ahjdetails.name,
        ahjrequirements: record.designgeneralinformation.ahjdetails.requirements,
        utilityname: record.designgeneralinformation.utilitydetails.name,
        utilityrequirements: record.designgeneralinformation.utilitydetails.requirements,
        // modulescount: record.designgeneralinformation.modulescount,
        financingtype: record.designgeneralinformation.financingtype,
        meterlessor: "" + record.designgeneralinformation.lessormeter,
        generalcomments: record.designgeneralinformation.comments
      });
      this.savedutilityrecordid = record.designgeneralinformation.utilitydetails.id;
      this.savedahjrecordid = record.designgeneralinformation.ahjdetails.id;
      this.fetchedahjdetails = this.generateddesign.designgeneralinformation.ahjdetails;
      this.fetchedutilitydetails = this.generateddesign.designgeneralinformation.utilitydetails;
      this.fetchedfiresetbackdetails = this.generateddesign.designgeneralinformation.firesetbackdetails;

      this.enableinputform(false);
    } else {
      this.enableinputform(true);
    }
    this.changeDetectorRef.detectChanges();
  }

  enableinputform(status) {
    if (status) {
      this.generalFormGroup.enable();
    } else {
      this.generalFormGroup.disable();
    }
  }

  enableForm(record: Design) {
    this.generateddesign = record;
    this.generalFormGroup.enable();
    if (this.generateddesign.jobtype == "pv") {
      this.isjobtypepv = true;
      this.batterybackup.clearValidators();
    } else {
      this.isjobtypepv = false;
      this.batterybackup.setValidators([Validators.required]);
    }
    this.getAhjdropdownData();
    this.getUtilitydropdowData();
    this.getFiresetbackdetailsdropdownData();

    this.fetchAHJDetailsData();
    this.fetchUtilityDetailsData();
    this.fetchFiresetbackDetailsData();
  }

  loadInputInformation(record: Design): void {
    this.isDisplayMode = true;
    this.generalFormGroup.patchValue({
      batterybackup: record.designgeneralinformation.batterybackup,
      firesetback:
        "" + record.designgeneralinformation.firesetbackdetails.firesetback,
      setbackdetails:
        record.designgeneralinformation.firesetbackdetails.setbackdetails,
      riskcategory: record.designgeneralinformation.riskcategory,
      ahjname: record.designgeneralinformation.ahjdetails.name,
      ahjrequirements: record.designgeneralinformation.ahjdetails.requirements,
      utilityname: record.designgeneralinformation.utilitydetails.name,
      utilityrequirements: record.designgeneralinformation.utilitydetails.requirements,
      // modulescount: record.designgeneralinformation.modulescount,
      financingtype: record.designgeneralinformation.financingtype,
      meterlessor: "" + record.designgeneralinformation.lessormeter,
      generalcomments: record.designgeneralinformation.comments,
    });
    this.savedutilityrecordid =
      record.designgeneralinformation.utilitydetails.id;
    this.savedahjrecordid = record.designgeneralinformation.ahjdetails.id;
    this.fetchedahjdetails =
      this.generateddesign.designgeneralinformation.ahjdetails;
    this.fetchedutilitydetails =
      this.generateddesign.designgeneralinformation.utilitydetails;
    this.fetchedfiresetbackdetails =
      this.generateddesign.designgeneralinformation.firesetbackdetails;

    this.generalFormGroup.disable();
    this.changeDetectorRef.detectChanges();
  }

  setEditMode(): void {
    this.isEditMode = true;
    this.fetchedahjdetails =
      this.generateddesign.designgeneralinformation.ahjdetails;
    this.fetchedutilitydetails =
      this.generateddesign.designgeneralinformation.utilitydetails;
    this.fetchedfiresetbackdetails =
      this.generateddesign.designgeneralinformation.firesetbackdetails;
    this.changeDetectorRef.detectChanges();
  }

  loadGeneratedDesign(): void {
    this.generateddesign = this.genericService.getNewGeneratedDesign();
    if (this.generateddesign.jobtype == "pv") {
      this.isjobtypepv = true;
      this.batterybackup.clearValidators();
    } else {
      this.isjobtypepv = false;
      this.batterybackup.setValidators([Validators.required]);
    }
    this.changeDetectorRef.detectChanges();
  }

  fillinEditGeneralInformationDetails(record: Design): void {
    this.generateddesign = record;
    this.isEditMode = true;
    this.isDisplayMode = false;
    if (record.designgeneralinformation != null) {
      this.generalFormGroup.patchValue({
        batterybackup: record.designgeneralinformation.batterybackup,
        firesetback:
          "" + record.designgeneralinformation.firesetbackdetails.firesetback,
        setbackdetails:
          record.designgeneralinformation.firesetbackdetails.setbackdetails,
        riskcategory: record.designgeneralinformation.riskcategory,
        ahjname: record.designgeneralinformation.ahjdetails.name,
        ahjrequirements:
          record.designgeneralinformation.ahjdetails.requirements,
        utilityname: record.designgeneralinformation.utilitydetails.name,
        utilityrequirements: record.designgeneralinformation.utilitydetails.requirements,
        // modulescount: record.designgeneralinformation.modulescount,
        financingtype: record.designgeneralinformation.financingtype,
        meterlessor: "" + record.designgeneralinformation.lessormeter,
        generalcomments: record.designgeneralinformation.comments,
      });
      this.savedutilityrecordid =
        record.designgeneralinformation.utilitydetails.id;
      this.savedahjrecordid = record.designgeneralinformation.ahjdetails.id;
      this.changeDetectorRef.detectChanges();
    }
  }

  radioChange($event: MatRadioChange): void {
    if ($event.source.name === "firesetback") {
      if ($event.value == "true") {
        this.setbackdetails.setValidators([Validators.required]);
      } else {
        this.setbackdetails.clearValidators();
      }
    } else if ($event.source.name === "financingtype") {
      if ($event.value == "lease") {
        this.meterlessor.setValidators([Validators.required]);
      } else {
        this.meterlessor.clearValidators();
      }
    }
  }

  getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
  }

  //----------------------------------------------------------------------------------
  //----GENERAL INFORMATION TAB METHODS-----------------------------------------------
  //----------------------------------------------------------------------------------
  getAhjdropdownData(): void {
    this.commonService.getAhjdropdown().subscribe(
      (response) => {
        if (response.length > 0) {
          const filters = {
            city: this.generateddesign.city,
            state: this.generateddesign.state,
          };
          // const filters={
          //   "city":"Alexander",
          //   "state":"NC"
          // }
          const newdata = this.filterData(response, filters);
          this.AhjArray = newdata;
          this.filteredAhj = this.ahjname.valueChanges.pipe(
            startWith(""),
            map((value) =>
              this._filter(
                value,
                newdata.map((a) => a.name)
              )
            )
          );
        } else {
          this.AhjArray = [""];
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getUtilitydropdowData(): void {
    this.commonService.getUtilitydropdown().subscribe(
      (response) => {
        if (response.length > 0) {
          const filters = {
            city: this.generateddesign.city,
            state: this.generateddesign.state,
          };
          const newdata = this.filterData(response, filters);
          this.AhjArray = newdata;
          this.UtilityArray = response.map((a) => a.name);
          this.filteredUtility = this.utilityname.valueChanges.pipe(
            startWith(""),
            map((value) =>
              this._filter(
                value,
                newdata.map((a) => a.name)
              )
            )
          );
        } else {
          this.UtilityArray = [""];
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getFiresetbackdetailsdropdownData(): void {
    this.commonService.getFiresetbackdetailsdropdown().subscribe(
      (response) => {
        if (response.length > 0) {
          const filters = {
            city: this.generateddesign.city,
            state: this.generateddesign.state,
          };
          const newdata = this.filterData(response, filters);
          this.FiresetbackdetailsArray = newdata;
          this.firesetBackdetails = this.setbackdetails.valueChanges.pipe(
            startWith(""),
            map((value) =>
              this._filter(
                value,
                newdata.map((a) => a.setbackdetails)
              )
            )
          );
        } else {
          this.FiresetbackdetailsArray = [""];
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  selectedAhjfield(name): void {
    const data = this.filterRequirements(this.AhjArray, name);
    this.ahjrequirements.setValue(data[0].requirements);
  }

  selectedUtilityfield(name): void {
    const data = this.filterRequirements(this.AhjArray, name);
    this.utilityrequirements.setValue(data[0].requirements);
  }
  filterRequirements(arr, filter) {
    return arr.filter((f) => {
      return f.name.toLowerCase().includes(filter.toLowerCase());
    });
  }

  fetchAHJDetailsData(): void {
    this.commonService.getAhjdetails(this.generateddesign.city).subscribe(
      (response) => {
        if (response.length > 0) {
          this.fetchedahjdetails = response[0];
          this.savedahjrecordid = this.fetchedahjdetails.id;
          this.ahjname.setValue(this.fetchedahjdetails.name);
          this.ahjrequirements.setValue(this.fetchedahjdetails.requirements);
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchUtilityDetailsData(): void {
    this.commonService.getUtilitydetails(this.generateddesign.city).subscribe(
      (response) => {
        if (response.length > 0) {
          this.fetchedutilitydetails = response[0];
          this.savedutilityrecordid = this.fetchedutilitydetails.id;
          this.utilityname.setValue(this.fetchedutilitydetails.name);
          this.utilityrequirements.setValue(
            this.fetchedutilitydetails.requirements
          );
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchFiresetbackDetailsData(): void {
    this.commonService
      .getfiresetbackdetails(this.generateddesign.city)
      .subscribe(
        (response) => {
          if (response.length > 0) {
            this.fetchedfiresetbackdetails = response[0];
            this.savedfiresetbackrecordid = this.fetchedfiresetbackdetails.id;
            this.firesetback.setValue(
              "" + this.fetchedfiresetbackdetails.firesetback
            );
            this.setbackdetails.setValue(
              this.fetchedfiresetbackdetails.setbackdetails
            );
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  saveGeneralInformationData() {
    if ((this.generalFormGroup.valid && (this.modulelayoutfiles.length > 0) || this.isEditMode)) {

      if (this.generateddesign != null) {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
        // this.saveAHJData();
        if (this.isEditMode) {
          this.updateDesignGeneralInformationOnServer();
        } else {
          this.saveRestGeneralInformation();
        }
      } else {
        this.notifyService.showWarning(
          "Please submit the data in prior tabs and then try again.",
          "Important"
        );
      }
    } else {
      if (this.isClient) {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.GeneralInformationSkipped);
      } else {
        this.generalFormGroup.markAllAsTouched();
        this.displayerror = false;
        if (this.modulelayoutfiles.length == 0) {
          this.modulesfileuploaded = false;
        }
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  /* saveAHJData() {
    var ahjname = this.generalFormGroup.get("ahjname").value;
    var ahjrequirements = this.generalFormGroup.get("ahjrequirements").value;
    if (
      this.fetchedahjdetails.name != ahjname ||
      this.fetchedahjdetails.requirements != ahjrequirements
    ) {
      this.commonService
        .addAHJ(
          ahjname,
          ahjrequirements,
          this.generateddesign.city,
          this.generateddesign.state
        )
        .subscribe(
          (response) => {
            this.savedahjrecordid = response.id;
            this.saveUtilityData();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.saveUtilityData();
    }
  } */

  /* saveUtilityData() {
    var utilityname = this.generalFormGroup.get("utilityname").value;
    var utilityrequirements = this.generalFormGroup.get(
      "utilityrequirements"
    ).value;
    if (
      this.fetchedutilitydetails.name != utilityname ||
      this.fetchedutilitydetails.requirements != utilityrequirements
    ) {
      this.commonService
        .addUtility(
          utilityname,
          utilityrequirements,
          this.generateddesign.city,
          this.generateddesign.state
        )
        .subscribe(
          (response) => {
            this.savedutilityrecordid = response.id;
            this.saveFiresetbackData();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.saveFiresetbackData();
    }
  }

  saveFiresetbackData(): void {
    const firesetback = JSON.parse(
      this.generalFormGroup.get("firesetback").value
    );
    const setbackdetails = this.generalFormGroup.get("setbackdetails").value;
    if (
      this.fetchedfiresetbackdetails.firesetback != firesetback ||
      this.fetchedfiresetbackdetails.setbackdetails != setbackdetails
    ) {
      this.commonService
        .addFiresetback(
          firesetback,
          setbackdetails,
          this.generateddesign.city,
          this.generateddesign.state
        )
        .subscribe(
          (response) => {
            this.savedfiresetbackrecordid = response.id;
            if (this.isEditMode) {
              this.updateDesignGeneralInformationOnServer();
            } else {
              this.saveRestGeneralInformation();
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      if (this.isEditMode) {
        this.updateDesignGeneralInformationOnServer();
      } else {
        this.saveRestGeneralInformation();
      }
    }
  } */

  saveRestGeneralInformation(): void {
    let meterlessorvalue = null;
    if (this.generalFormGroup.get("financingtype").value == "lease") {
      meterlessorvalue = JSON.parse(
        this.generalFormGroup.get("meterlessor").value
      );
    }
    let batterybackupvalue = null;
    if (!this.isjobtypepv) {
      batterybackupvalue = this.generalFormGroup.get("batterybackup").value;
    }

    let ahjdetails = {
      ahjname: this.ahjname.value,
      ahjrequirements: this.ahjrequirements.value
    }

    let utilitydetails = {
      utilityname: this.utilityname.value,
      utilityrequirements: this.utilityrequirements.value
    }

    let firesetbackdetails = {
      firesetback: this.firesetback.value,
      setbackdetails: this.setbackdetails.value
    }
    this.designService
      .addDesignGeneralInformation(
        batterybackupvalue,
        this.generalFormGroup.get("riskcategory").value,
        this.generalFormGroup.get("financingtype").value,
        meterlessorvalue,
        this.generalFormGroup.get("generalcomments").value,
        ahjdetails,
        utilitydetails,
        firesetbackdetails,
        this.generateddesign.id
      )
      .subscribe(
        (response) => {
          this.generateddesign.designgeneralinformation = response;
          this.genericService.setNewGeneratedDesign(this.generateddesign);
          if (this.modulelayoutfiles.length > 0) {
            this.modulesLayoutMediaFileUpload(
              response.id,
              "design/" + this.generateddesign.id,
              this.modulelayoutfiles[0],
              "moduleslayoutdesign",
              "designgeneralinformation"
            );
          } else {
            // this.notifyService.showSuccess("General information saved successfully.", "Saved");
            this.isDataSubmitted = true;
            this.eventEmitterService.onPermitDesignGenerationStateChange(
              EVENTS_PERMIT_DESIGN.HideLoading
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(
              EVENTS_PERMIT_DESIGN.GeneralInformationSaved
            );
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  updateDesignGeneralInformationOnServer(): void {
    if (this.generalFormGroup.valid) {
      var meterlessorvalue = null;
      if (this.generalFormGroup.get("financingtype").value == "lease") {
        meterlessorvalue = JSON.parse(
          this.generalFormGroup.get("meterlessor").value
        );
      }

      const postData = {
        batterybackup: this.generalFormGroup.get("batterybackup").value,
        riskcategory: this.generalFormGroup.get("riskcategory").value,
        // modulescount: parseInt(this.generalFormGroup.get("modulescount").value),
        financingtype: this.generalFormGroup.get("financingtype").value,
        lessormeter: meterlessorvalue,
        comments: this.generalFormGroup.get("generalcomments").value,
        ahjdetails: this.savedahjrecordid,
        utilitydetails: this.savedutilityrecordid,
        firesetbackdetails: this.savedfiresetbackrecordid,
        design: this.generateddesign.id,
      };

      this.designService
        .editDesignGeneralInformation(
          this.generateddesign.designgeneralinformation.id,
          postData
        )
        .subscribe(
          (response) => {
            this.generateddesign.designgeneralinformation = response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            if (this.modulelayoutfiles.length > 0) {
              this.eventEmitterService.onPermitDesignGenerationStateChange(
                EVENTS_PERMIT_DESIGN.UploadingModulesDesign
              );
              this.modulesLayoutMediaFileUpload(
                response.id,
                "design/" + this.generateddesign.id,
                this.modulelayoutfiles[0],
                "moduleslayoutdesign",
                "designgeneralinformation"
              );
            } else {
              this.notifyService.showSuccess(
                "General information updated successfully.",
                "Updated"
              );
              this.isDataSubmitted = true;
              this.eventEmitterService.onPermitDesignGenerationStateChange(
                EVENTS_PERMIT_DESIGN.HideLoading
              );
              this.eventEmitterService.onPermitDesignGenerationStateChange(
                EVENTS_PERMIT_DESIGN.GeneralInformationSaved
              );
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    }
    else {
      if (this.isClient) {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.GeneralInformationSkipped);
      } else {
        this.generalFormGroup.markAllAsTouched();
        this.displayerror = false;
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  modulesLayoutMediaFileUpload(
    recordid: number,
    path: string,
    file: File,
    field: string,
    ref: string
  ): void {
    this.eventEmitterService.onPermitDesignGenerationStateChange(
      EVENTS_PERMIT_DESIGN.UploadingModulesDesign
    );
    this.commonService.uploadFile(recordid, path, file, field, ref).subscribe(
      (response) => {
        this.generateddesign.designgeneralinformation.moduleslayoutdesign =
          response;
        this.genericService.setNewGeneratedDesign(this.generateddesign);
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.HideLoading
        );
        this.notifyService.showSuccess(
          "General information saved successfully.",
          "Saved"
        );
        this.isDataSubmitted = true;
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.GeneralInformationSaved
        );
      },
      (error) => { }
    );
  }

  onModuleLayoutFileSelect(event): void {
    this.modulesfileuploaded = true;
    // this.modulescount.clearValidators();
    // this.modulescount.updateValueAndValidity();
    // this.modulelayoutfiles.push(...event.addedFiles);
    event.addedFiles[0].isImage = false;
    if (event.addedFiles[0].type.includes("image")) {
      event.addedFiles[0].isImage = true;
    }
    this.modulelayoutfiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 150);
  }

  onModuleLayoutFileRemove(event): void {
    this.modulelayoutfiles.splice(this.modulelayoutfiles.indexOf(event), 1);
    if (this.modulelayoutfiles.length == 0) {
      this.modulesfileuploaded = false;
      // this.modulescount.setValidators([Validators.required]);
      // this.modulescount.updateValueAndValidity();
    }
  }

  onRemoveModulesFile(): void {
    this.commonService
      .deleteUploadedFile(
        "" +
        this.generateddesign.designgeneralinformation.moduleslayoutdesign.id
      )
      .subscribe(
        () => {
          this.generateddesign.designgeneralinformation.moduleslayoutdesign =
            null;
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }
}
