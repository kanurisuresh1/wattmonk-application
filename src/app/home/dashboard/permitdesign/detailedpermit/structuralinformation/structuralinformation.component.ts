import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatRadioChange } from '@angular/material/radio';
import { Observable } from 'rxjs';
import { map, startWith } from "rxjs/operators";
import { EVENTS_PERMIT_DESIGN, ROLES } from 'src/app/_helpers';
import { Design, UploadedFile, User } from 'src/app/_models';
import { AttachmentType } from 'src/app/_models/attachmenttype';
import { RackingModel } from 'src/app/_models/rackingmodel';
import { RackingName } from 'src/app/_models/rackingname';
import { RoofMaterial } from 'src/app/_models/roofmaterial';
import { AuthenticationService, DesignService, GenericService, NotificationService } from 'src/app/_services';
import { CommonService } from 'src/app/_services/common.service';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';

@Component({
  selector: "app-structuralinformation",
  templateUrl: "./structuralinformation.component.html",
  styleUrls: ["./structuralinformation.component.scss"],
})
export class StructuralinformationComponent implements OnInit {
  isDataSubmitted = false;
  isEditMode = false;
  structuralFormGroup: FormGroup;
  structural1FormGroup: FormGroup;

  framing = new FormControl("", []);
  framingsize = new FormControl("", []);
  spacing = new FormControl("", []);
  roofmaterial = new FormControl("", [Validators.required]);
  numberoflayers = new FormControl("", []);
  attachmenttype = new FormControl("", [Validators.required]);
  attachmentdistance = new FormControl("", [Validators.required]);
  attachmentmountingplacement = new FormControl("", [Validators.required]);
  rackingname = new FormControl("", [Validators.required]);
  rackingmodel = new FormControl("", [Validators.required]);
  maxspanspacing = new FormControl("", []);
  roofpitch = new FormControl("", []);
  roofazimuth = new FormControl("", [Validators.required]);
  structuralcomments = new FormControl("", []);

  framing1 = new FormControl("", [Validators.required]);
  framingsize1 = new FormControl("", [Validators.required]);
  spacing1 = new FormControl("", [Validators.required]);
  roofmaterial1 = new FormControl("", [Validators.required]);
  numberoflayers1 = new FormControl("", [Validators.required]);
  attachmenttype1 = new FormControl("", [Validators.required]);
  attachmentdistance1 = new FormControl("", [Validators.required]);
  attachmentmountingplacement1 = new FormControl("", [Validators.required]);
  rackingname1 = new FormControl("", [Validators.required]);
  rackingmodel1 = new FormControl("", [Validators.required]);
  maxspanspacing1 = new FormControl("", []);
  roofpitch1 = new FormControl("", [Validators.required]);
  roofazimuth1 = new FormControl("", [Validators.required]);
  structuralcomments1 = new FormControl("", []);

  framingsizes: string[] = [
    "1 x 2",
    "1 x 3",
    "1 x 4",
    "1 x 5",
    "1 x 6",
    "1 x 7",
    "1 x 8",
    "1 x 9",
    "1 x 10",
    "1 x 11",
    "1 x 12",
    "1 x 13",
    "1 x 14",
    "1 x 15",
    "1 x 16",
    "2 x 2",
    "2 x 3",
    "2 x 4",
    "2 x 5",
    "2 x 6",
    "2 x 7",
    "2 x 8",
    "2 x 9",
    "2 x 10",
    "2 x 11",
    "2 x 12",
    "2 x 13",
    "2 x 14",
    "2 x 15",
    "2 x 16",
    "3 x 2",
    "3 x 3",
    "3 x 4",
    "3 x 5",
    "3 x 6",
    "3 x 7",
    "3 x 8",
    "3 x 9",
    "3 x 10",
    "3 x 11",
    "3 x 12",
    "3 x 13",
    "3 x 14",
    "3 x 15",
    "3 x 16",
  ];
  filteredFramingSizes: Observable<string[]>;
  selectedFramingSize: string;
  filteredFramingSizes1: Observable<string[]>;
  selectedFramingSize1: string;

  roofobstaclefilesuploaded = true;
  roofphotosfilesuploaded = true;
  atticphotosfileuploaded = true;
  pitchroofobstaclefilesuploaded = true;
  pitchroofphotosfilesuploaded = true;
  pitchatticphotosfileuploaded = true;

  rooffiles: File[] = [];
  roofphotos: File[] = [];
  atticphotos: File[] = [];
  pitchrooffiles: File[] = [];
  pitchroofphotos: File[] = [];
  pitchatticphotos: File[] = [];

  displayerror = true;
  isroofpitched = false;
  isroofboth = false;

  roofmaterials: RoofMaterial[] = [];
  filteredRoofMaterials: Observable<RoofMaterial[]>;
  roofmaterials1: RoofMaterial[] = [];
  filteredRoofMaterials1: Observable<RoofMaterial[]>;
  selectedRoofMaterialID: number;
  selectedRoofMaterial1ID: number;

  rackingnames: RackingName[] = [];
  filteredRackingNames: Observable<RackingName[]>;
  selectedRackingNameID: number;
  selectedRackingName1ID: number;

  rackingmodels: RackingModel[] = [];
  filteredRackingModels: Observable<RackingModel[]>;
  rackingmodels1: RackingModel[] = [];
  filteredRackingModels1: Observable<RackingModel[]>;
  selectedRackingModelID: number;
  selectedRackingModel1ID: number;

  attachmenttypes: AttachmentType[] = [];
  filteredAttachmentTypes: Observable<AttachmentType[]>;
  attachmenttypes1: AttachmentType[] = [];
  filteredAttachmentTypes1: Observable<AttachmentType[]>;
  selectedAttachmentTypeID: number;
  selectedAttachmentType1ID: number;

  generateddesign: Design;

  isDisplayMode = false;
  loggedInUser: User;
  isClient: boolean = false;

  constructor(
    private notifyService: NotificationService,
    private designService: DesignService,
    private commonService: CommonService,
    private changeDetectorRef: ChangeDetectorRef,
    private genericService: GenericService,
    private eventEmitterService: EventEmitterService,
    private authService: AuthenticationService) {
    this.loggedInUser = authService.currentUserValue.user;
    if (this.loggedInUser.role.id == ROLES.ContractorSuperAdmin || this.loggedInUser.role.id == ROLES.ContractorAdmin || this.loggedInUser.role.id == ROLES.SuccessManager || this.loggedInUser.role.id == ROLES.Master || (this.loggedInUser.role.id == ROLES.BD && this.loggedInUser.parent.id != 232) || (this.loggedInUser.role.id == ROLES.TeamHead && this.loggedInUser.parent.id != 232)) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
    this.structuralFormGroup = new FormGroup({
      framing: this.framing,
      framingsize: this.framingsize,
      spacing: this.spacing,
      roofmaterial: this.roofmaterial,
      numberoflayers: this.numberoflayers,
      attachmenttype: this.attachmenttype,
      attachmentdistance: this.attachmentdistance,
      attachmentmountingplacement: this.attachmentmountingplacement,
      rackingname: this.rackingname,
      rackingmodel: this.rackingmodel,
      maxspanspacing: this.maxspanspacing,
      roofpitch: this.roofpitch,
      roofazimuth: this.roofazimuth,
      structuralcomments: this.structuralcomments,
    });
    this.structural1FormGroup = new FormGroup({
      framing1: this.framing1,
      framingsize1: this.framingsize1,
      spacing1: this.spacing1,
      roofmaterial1: this.roofmaterial1,
      numberoflayers1: this.numberoflayers1,
      attachmenttype1: this.attachmenttype1,
      attachmentdistance1: this.attachmentdistance1,
      attachmentmountingplacement1: this.attachmentmountingplacement1,
      rackingname1: this.rackingname1,
      rackingmodel1: this.rackingmodel1,
      maxspanspacing1: this.maxspanspacing1,
      roofpitch1: this.roofpitch1,
      roofazimuth1: this.roofazimuth1,
      structuralcomments1: this.structuralcomments1,
    });

    this.filteredFramingSizes = this.framingsize.valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value)),
      map((name) =>
        name ? this._filterFramingSize(name) : this.framingsizes.slice()
      )
    );

    this.filteredFramingSizes1 = this.framingsize1.valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value)),
      map((name) =>
        name ? this._filterFramingSize1(name) : this.framingsizes.slice()
      )
    );

    this.structuralFormGroup.disable();
    this.structural1FormGroup.disable();
  }

  ngOnInit(): void {
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
    });
  }

  updateform(record: Design) {
    this.generateddesign = record;

    if (this.generateddesign.rooftype == "pitch") {
      this.isroofpitched = true;
    } else if (this.generateddesign.rooftype == "both") {
      this.isroofboth = true;
    }

    if (this.isroofpitched) {
      this.framing.setValidators([Validators.required]);
      this.framingsize.setValidators([Validators.required]);
      this.spacing.setValidators([Validators.required]);

    }

    if (this.generateddesign.structuralinformations.length > 0) {
      this.isDisplayMode = true;
      this.structuralFormGroup.patchValue({
        framing: record.structuralinformations[0].framing,
        framingsize: record.structuralinformations[0].framingsize,
        spacing: record.structuralinformations[0].spacing,
        roofmaterial: record.structuralinformations[0].roofmaterial.name,
        numberoflayers: record.structuralinformations[0].numberoflayers,
        attachmenttype: record.structuralinformations[0].attachmenttype.name,
        attachmentdistance: record.structuralinformations[0].attachmentdistance,
        attachmentmountingplacement: record.structuralinformations[0].attachmentmountingplacement,
        rackingname: record.structuralinformations[0].rackingname.name,
        rackingmodel: record.structuralinformations[0].rackingmodel.name,
        maxspanspacing: record.structuralinformations[0].maxspanspacing,
        roofpitch: record.structuralinformations[0].roofpitch,
        roofazimuth: record.structuralinformations[0].roofazimuth,
        structuralcomments: record.structuralinformations[0].comments
      });
      this.selectedRoofMaterialID = record.structuralinformations[0].roofmaterial.id;
      this.selectedAttachmentTypeID = record.structuralinformations[0].attachmenttype.id;
      this.selectedRackingNameID = record.structuralinformations[0].rackingname.id;
      this.selectedRackingModelID = record.structuralinformations[0].rackingmodel.id;

      this.fetchStructuralStepInformation();
      this.setSelectedRackingName(record.structuralinformations[0].rackingname);

      if (record.rooftype == "both") {
        this.structural1FormGroup.patchValue({
          framing1: record.structuralinformations[1].framing,
          framingsize1: record.structuralinformations[1].framingsize,
          spacing1: record.structuralinformations[1].spacing,
          roofmaterial1: record.structuralinformations[1].roofmaterial.name,
          numberoflayers1: record.structuralinformations[1].numberoflayers,
          attachmenttype1: record.structuralinformations[1].attachmenttype.name,
          attachmentdistance1: record.structuralinformations[1].attachmentdistance,
          attachmentmountingplacement1: record.structuralinformations[1].attachmentmountingplacement,
          rackingname1: record.structuralinformations[1].rackingname.name,
          rackingmodel1: record.structuralinformations[1].rackingmodel.name,
          maxspanspacing1: record.structuralinformations[1].maxspanspacing,
          roofpitch1: record.structuralinformations[1].roofpitch,
          roofazimuth1: record.structuralinformations[1].roofazimuth,
          structural1comments: record.structuralinformations[1].comments
        });
        this.selectedRoofMaterial1ID = record.structuralinformations[1].roofmaterial.id;
        this.selectedAttachmentType1ID = record.structuralinformations[1].attachmenttype.id;
        this.selectedRackingName1ID = record.structuralinformations[1].rackingname.id;
        this.selectedRackingModel1ID = record.structuralinformations[1].rackingmodel.id;

        this.setSelectedRackingName1(record.structuralinformations[1].rackingname);
      }
      this.enableinputform(false);
    } else {
      this.enableinputform(true);
      this.fetchStructuralStepInformation();
    }
  }

  enableinputform(status) {
    if (status) {
      this.structuralFormGroup.enable();
      this.structural1FormGroup.enable();
    } else {
      this.structuralFormGroup.disable();
      this.structural1FormGroup.disable();
    }
  }

  enableForm(record: Design) {
    this.generateddesign = record;
    if (this.generateddesign.rooftype == "pitch") {
      this.isroofpitched = true;
    } else if (this.generateddesign.rooftype == "both") {
      this.isroofboth = true;
    }

    if (this.isroofpitched) {
      this.framing.setValidators([Validators.required]);
      this.framingsize.setValidators([Validators.required]);
      this.spacing.setValidators([Validators.required]);

    }
    this.structuralFormGroup.enable();
    this.structural1FormGroup.enable();
  }

  loadInputInformation(record: Design): void {
    this.isDisplayMode = true;
    this.structuralFormGroup.patchValue({
      framing: record.structuralinformations[0].framing,
      framingsize: record.structuralinformations[0].framingsize,
      spacing: record.structuralinformations[0].spacing,
      roofmaterial: record.structuralinformations[0].roofmaterial.name,
      numberoflayers: record.structuralinformations[0].numberoflayers,
      attachmenttype: record.structuralinformations[0].attachmenttype.name,
      attachmentdistance: record.structuralinformations[0].attachmentdistance,
      attachmentmountingplacement:
        record.structuralinformations[0].attachmentmountingplacement,
      rackingname: record.structuralinformations[0].rackingname.name,
      rackingmodel: record.structuralinformations[0].rackingmodel.name,
      maxspanspacing: record.structuralinformations[0].maxspanspacing,
      roofpitch: record.structuralinformations[0].roofpitch,
      roofazimuth: record.structuralinformations[0].roofazimuth,
      structuralcomments: record.structuralinformations[0].comments,
    });
    this.selectedRoofMaterialID =
      record.structuralinformations[0].roofmaterial.id;
    this.selectedAttachmentTypeID =
      record.structuralinformations[0].attachmenttype.id;
    this.selectedRackingNameID =
      record.structuralinformations[0].rackingname.id;
    this.selectedRackingModelID =
      record.structuralinformations[0].rackingmodel.id;

    this.fetchStructuralStepInformation();
    this.setSelectedRackingName(record.structuralinformations[0].rackingname);

    if (record.rooftype == "both") {
      this.structural1FormGroup.patchValue({
        framing1: record.structuralinformations[1].framing,
        framingsize1: record.structuralinformations[1].framingsize,
        spacing1: record.structuralinformations[1].spacing,
        roofmaterial1: record.structuralinformations[1].roofmaterial.name,
        numberoflayers1: record.structuralinformations[1].numberoflayers,
        attachmenttype1: record.structuralinformations[1].attachmenttype.name,
        attachmentdistance1:
          record.structuralinformations[1].attachmentdistance,
        attachmentmountingplacement1:
          record.structuralinformations[1].attachmentmountingplacement,
        rackingname1: record.structuralinformations[1].rackingname.name,
        rackingmodel1: record.structuralinformations[1].rackingmodel.name,
        maxspanspacing1: record.structuralinformations[1].maxspanspacing,
        roofpitch1: record.structuralinformations[1].roofpitch,
        roofazimuth1: record.structuralinformations[1].roofazimuth,
        structural1comments: record.structuralinformations[1].comments,
      });
      this.selectedRoofMaterial1ID =
        record.structuralinformations[1].roofmaterial.id;
      this.selectedAttachmentType1ID =
        record.structuralinformations[1].attachmenttype.id;
      this.selectedRackingName1ID =
        record.structuralinformations[1].rackingname.id;
      this.selectedRackingModel1ID =
        record.structuralinformations[1].rackingmodel.id;

      this.setSelectedRackingName1(
        record.structuralinformations[1].rackingname
      );
    }

    this.structuralFormGroup.disable();
    this.structural1FormGroup.disable();
    this.changeDetectorRef.detectChanges();
  }

  setEditMode(): void {
    this.isEditMode = true;

    this.changeDetectorRef.detectChanges();
  }

  loadGeneratedDesign(): void {
    this.generateddesign = this.genericService.getNewGeneratedDesign();
    if (this.generateddesign.rooftype == "pitch") {
      this.isroofpitched = true;
    } else if (this.generateddesign.rooftype == "both") {
      this.isroofboth = true;
    }

    if (this.isroofpitched) {
      this.framing.setValidators([Validators.required]);
      this.framingsize.setValidators([Validators.required]);
      this.spacing.setValidators([Validators.required]);

    }
  }

  fillinEditStructuralInformationDetails(record: Design): void {
    this.isEditMode = true;
    this.generateddesign = record;
    if (record.structuralinformations.length > 0) {
      this.structuralFormGroup.patchValue({
        framing: record.structuralinformations[0].framing,
        framingsize: record.structuralinformations[0].framingsize,
        spacing: record.structuralinformations[0].spacing,
        roofmaterial: record.structuralinformations[0].roofmaterial.name,
        numberoflayers: record.structuralinformations[0].numberoflayers,
        attachmenttype: record.structuralinformations[0].attachmenttype.name,
        attachmentdistance: record.structuralinformations[0].attachmentdistance,
        attachmentmountingplacement:
          record.structuralinformations[0].attachmentmountingplacement,
        rackingname: record.structuralinformations[0].rackingname.name,
        rackingmodel: record.structuralinformations[0].rackingmodel.name,
        maxspanspacing: record.structuralinformations[0].maxspanspacing,
        roofpitch: record.structuralinformations[0].roofpitch,
        roofazimuth: record.structuralinformations[0].roofazimuth,
        structuralcomments: record.structuralinformations[0].comments,
      });
      this.selectedRoofMaterialID =
        record.structuralinformations[0].roofmaterial.id;
      this.selectedAttachmentTypeID =
        record.structuralinformations[0].attachmenttype.id;
      this.selectedRackingNameID =
        record.structuralinformations[0].rackingname.id;
      this.selectedRackingModelID =
        record.structuralinformations[0].rackingmodel.id;

      this.fetchStructuralStepInformation();
      this.setSelectedRackingName(record.structuralinformations[0].rackingname);

      if (record.rooftype == "both") {
        this.structural1FormGroup.patchValue({
          framing1: record.structuralinformations[1].framing,
          framingsize1: record.structuralinformations[1].framingsize,
          spacing1: record.structuralinformations[1].spacing,
          roofmaterial1: record.structuralinformations[1].roofmaterial.name,
          numberoflayers1: record.structuralinformations[1].numberoflayers,
          attachmenttype1: record.structuralinformations[1].attachmenttype.name,
          attachmentdistance1:
            record.structuralinformations[1].attachmentdistance,
          attachmentmountingplacement1:
            record.structuralinformations[1].attachmentmountingplacement,
          rackingname1: record.structuralinformations[1].rackingname.name,
          rackingmodel1: record.structuralinformations[1].rackingmodel.name,
          maxspanspacing1: record.structuralinformations[1].maxspanspacing,
          roofpitch1: record.structuralinformations[1].roofpitch,
          roofazimuth1: record.structuralinformations[1].roofazimuth,
          structural1comments: record.structuralinformations[1].comments,
        });
        this.selectedRoofMaterial1ID =
          record.structuralinformations[1].roofmaterial.id;
        this.selectedAttachmentType1ID =
          record.structuralinformations[1].attachmenttype.id;
        this.selectedRackingName1ID =
          record.structuralinformations[1].rackingname.id;
        this.selectedRackingModel1ID =
          record.structuralinformations[1].rackingmodel.id;

        this.setSelectedRackingName1(
          record.structuralinformations[1].rackingname
        );
      }
    }
  }

  radioChange($event: MatRadioChange): void {
    if ($event.source.name === "rooftype") {
      if ($event.value == "both") {
        this.roofpitch.clearValidators();
      } else if ($event.value == "pitch") {
        this.roofpitch.setValidators([Validators.required]);
      } else {
        this.roofpitch.clearValidators();
      }
    }
  }

  getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
  }

  displayFnFramingSize(size: string): string {
    return size && size ? size : "";
  }

  private _filterFramingSize(name: string): string[] {
    const filterValue = name.toLowerCase();

    return this.framingsizes.filter(
      (size) => size.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedFramingSize(record): void {
    this.selectedFramingSize = record;
  }

  displayFnFramingSize1(size: string): string {
    return size && size ? size : "";
  }

  private _filterFramingSize1(name: string): string[] {
    const filterValue = name.toLowerCase();

    return this.framingsizes.filter(
      (size) => size.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedFramingSize1(record): void {
    this.selectedFramingSize1 = record;
  }

  //----------------------------------------------------------------------------------
  //----STRUCTURAL INFORMATION TAB METHODS--------------------------------------------
  //----------------------------------------------------------------------------------

  fetchStructuralStepInformation(): void {
    if (
      this.generateddesign.rooftype == "both" ||
      this.generateddesign.mountingtype == "ground"
    ) {
      this.fetchRoofMaterialsData("flat");
      this.fetchPitchRoofMaterialsData();
      this.fetchRackingNamesData();
    } else {
      this.fetchRoofMaterialsData(this.generateddesign.rooftype);
      this.fetchRackingNamesData();
    }
  }

  fetchRoofMaterialsData(rooftype: string): void {
    this.commonService.getRoofMaterials(rooftype).subscribe(
      (response) => {
        if (response.length > 0) {
          this.roofmaterials = response;
          this.filteredRoofMaterials = this.roofmaterial.valueChanges.pipe(
            startWith(""),
            map((value) => (typeof value === "string" ? value : value.name)),
            map((name) =>
              name ? this._filterRoofMaterial(name) : this.roofmaterials.slice()
            )
          );
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  displayFnRoofMaterial(roof: RoofMaterial): string {
    return roof && roof.name ? roof.name : "";
  }

  private _filterRoofMaterial(name: string): RoofMaterial[] {
    const filterValue = name.toLowerCase();

    return this.roofmaterials.filter(
      (roof) => roof.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedRoofMaterial(record): void {
    this.selectedRoofMaterialID = record.id;
    this.structuralFormGroup.controls.attachmenttype.patchValue('');
    if (record.tolowercase.startsWith('comp shingle')) {
      this.numberoflayers.setValidators([Validators.required]);
    }
    else {
      this.numberoflayers.clearValidators();
      this.numberoflayers.updateValueAndValidity();
    }
  }

  fetchPitchRoofMaterialsData(): void {
    this.commonService.getRoofMaterials("pitch").subscribe(
      (response) => {
        if (response.length > 0) {
          this.roofmaterials1 = response;
          this.filteredRoofMaterials1 = this.roofmaterial1.valueChanges.pipe(
            startWith(""),
            map((value) => (typeof value === "string" ? value : value.name)),
            map((name) =>
              name
                ? this._filterRoofMaterialPitch(name)
                : this.roofmaterials1.slice()
            )
          );
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  displayFnRoofMaterialPitch(roof: RoofMaterial): string {
    return roof && roof.name ? roof.name : "";
  }

  private _filterRoofMaterialPitch(name: string): RoofMaterial[] {
    const filterValue = name.toLowerCase();

    return this.roofmaterials1.filter(
      (roof) => roof.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedPitchRoofMaterial(record): void {
    this.selectedRoofMaterial1ID = record.id;
    if (record.tolowercase.startsWith('comp shingle')) {
      this.numberoflayers1.setValidators([Validators.required]);
    }
    else {
      this.numberoflayers1.clearValidators();
      this.numberoflayers1.updateValueAndValidity();
    }
  }

  fetchRackingNamesData(): void {
    this.commonService.getRackingNames().subscribe(
      (response) => {
        if (response.length > 0) {
          this.rackingnames = response;
          this.filteredRackingNames = this.rackingname.valueChanges.pipe(
            startWith(""),
            map((value) => (typeof value === "string" ? value : value.name)),
            map((name) =>
              name ? this._filterRackingName(name) : this.rackingnames.slice()
            )
          );
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  displayFnRackingName(racking: RackingName): string {
    return racking && racking.name ? racking.name : "";
  }

  private _filterRackingName(name: string): RackingName[] {
    const filterValue = name.toLowerCase();

    return this.rackingnames.filter(
      (rack) => rack.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedRackingName(record): void {
    this.selectedRackingNameID = record.id;
    if (
      this.generateddesign.rooftype == "both" ||
      this.generateddesign.mountingtype == "ground"
    ) {
      this.fetchRackingModelsData("flat");
      this.fetchAttachmentTypesData("flat");
    } else {
      this.fetchRackingModelsData(this.generateddesign.rooftype);
      this.fetchAttachmentTypesData(this.generateddesign.rooftype);
    }
  }

  setSelectedRackingName1(record): void {
    this.selectedRackingName1ID = record;
    this.fetchPitchRackingModelsData();
    this.fetchPitchAttachmentTypesData();
  }

  fetchRackingModelsData(rooftype: string): void {
    this.commonService
      .getRackingModels(
        rooftype,
        this.selectedRoofMaterialID,
        this.selectedRackingNameID
      )
      .subscribe(
        (response) => {
          if (response.length > 0) {
            this.rackingmodels = response;
            this.filteredRackingModels = this.rackingmodel.valueChanges.pipe(
              startWith(""),
              map((value) => (typeof value === "string" ? value : value.name)),
              map((name) =>
                name
                  ? this._filterRackingModel(name)
                  : this.rackingmodels.slice()
              )
            );
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  displayFnRackingModel(racking: RackingModel): string {
    return racking && racking.name ? racking.name : "";
  }

  private _filterRackingModel(name: string): RackingModel[] {
    const filterValue = name.toLowerCase();

    return this.rackingmodels.filter(
      (rack) => rack.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedRackingModel(record): void {
    this.selectedRackingModelID = record.id;
  }

  fetchPitchRackingModelsData(): void {
    this.commonService
      .getRackingModels(
        "pitch",
        this.selectedRoofMaterial1ID,
        this.selectedRackingName1ID
      )
      .subscribe(
        (response) => {
          if (response.length > 0) {
            this.rackingmodels1 = response;
            this.filteredRackingModels1 = this.rackingmodel1.valueChanges.pipe(
              startWith(""),
              map((value) => (typeof value === "string" ? value : value.name)),
              map((name) =>
                name
                  ? this._filterRackingModel1(name)
                  : this.rackingmodels1.slice()
              )
            );
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  displayFnRackingModel1(racking: RackingModel): string {
    return racking && racking.name ? racking.name : "";
  }

  private _filterRackingModel1(name: string): RackingModel[] {
    const filterValue = name.toLowerCase();

    return this.rackingmodels1.filter(
      (rack) => rack.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedRackingModel1(record): void {
    this.selectedRackingModel1ID = record.id;
  }

  fetchPitchAttachmentTypesData(): void {
    this.commonService
      .getAttachmentTypes("pitch", this.selectedRoofMaterial1ID)
      .subscribe(
        (response) => {
          if (response.length > 0) {
            this.attachmenttypes1 = response;
            this.filteredAttachmentTypes1 =
              this.attachmenttype1.valueChanges.pipe(
                startWith(""),
                map((value) =>
                  typeof value === "string" ? value : value.name
                ),
                map((name) =>
                  name
                    ? this._filterAttachmentType1(name)
                    : this.attachmenttypes1.slice()
                )
              );
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  displayFnAttachmentType1(attachment: AttachmentType): string {
    return attachment && attachment.name ? attachment.name : "";
  }

  private _filterAttachmentType1(name: string): AttachmentType[] {
    const filterValue = name.toLowerCase();

    return this.attachmenttypes1.filter(
      (rack) => rack.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedAttachmentType1(record): void {
    this.selectedAttachmentType1ID = record.id;
  }

  fetchAttachmentTypesData(rooftype: string): void {
    this.commonService
      .getAttachmentTypes(rooftype, this.selectedRoofMaterialID)
      .subscribe(
        (response) => {
          if (response.length > 0) {
            this.attachmenttypes = response;
            this.filteredAttachmentTypes =
              this.attachmenttype.valueChanges.pipe(
                startWith(""),
                map((value) =>
                  typeof value === "string" ? value : value.name
                ),
                map((name) =>
                  name
                    ? this._filterAttachmentType(name)
                    : this.attachmenttypes.slice()
                )
              );
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  displayFnAttachmentType(attachment: AttachmentType): string {
    return attachment && attachment.name ? attachment.name : "";
  }

  private _filterAttachmentType(name: string): AttachmentType[] {
    const filterValue = name.toLowerCase();

    return this.attachmenttypes.filter(
      (rack) => rack.name.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedAttachmentType(record): void {
    this.selectedAttachmentTypeID = record.id;
  }

  /*   saveRoofMaterial() {
    if (this.structuralFormGroup.valid) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
      const found = this.roofmaterials.some(el => el.name === this.structuralFormGroup.get("roofmaterial").value);
      let rooftype = this.generateddesign.rooftype;
      if (rooftype == 'both') {
        rooftype = 'flat';
      }
      if (!found) {

        this.commonService
          .addRoofMaterial(
            this.structuralFormGroup.get("roofmaterial").value,
            rooftype
          )
          .subscribe(
            response => {
              this.selectedRoofMaterialID = response.id;
              this.saveRackingName(rooftype);
            },
            error => {
              this.notifyService.showError(
                error,
                "Error"
              );
            }
          );
      } else {
        this.saveRackingName(rooftype);
      }
    } else {
      this.saveRackingName();
    }
  }else{
    // console.log(this.genericService.findInvalidControls(this.structuralFormGroup));
      this.displayerror = false;
      this.structuralFormGroup.markAllAsTouched();
      this.changeDetectorRef.detectChanges();
    }
  }

  saveRackingName(rooftype) {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
    const found = this.rackingnames.some(el => el.name === this.structuralFormGroup.get("rackingname").value);
    if (!found) {
      this.commonService
        .addRackingName(
          this.structuralFormGroup.get("rackingname").value
        )
        .subscribe(
          response => {
            this.selectedRackingNameID = response.id;
            this.saveRackingModel(rooftype);
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
          }
        );
    } else {
      this.saveRackingModel(rooftype);
    }
  }

  saveRackingModel(rooftype) {
    const israckingmakefound = this.rackingnames.some(el => el.name === this.structuralFormGroup.get("rackingname").value);
    const found = this.rackingmodels.some(el => el.name === this.structuralFormGroup.get("rackingmodel").value);
    if (!israckingmakefound || !found) {
      this.commonService
        .addRackingModel(
          this.structuralFormGroup.get("rackingmodel").value,
          rooftype,
          this.selectedRackingNameID,
          this.selectedRoofMaterialID
        )
        .subscribe(
          response => {
            this.selectedRackingModelID = response.id;
            this.saveAttachmentType(rooftype);
          },
          error => {

            this.notifyService.showError(
              error,
              "Error"
            );
          }
        );
    } else {
      this.saveAttachmentType(rooftype);
    }
  }

  saveAttachmentType(rooftype) {
    const isroofmaterialfound = this.roofmaterials.some(el => el.name === this.structuralFormGroup.get("roofmaterial").value);
    const found = this.attachmenttypes.some(el => el.name === this.structuralFormGroup.get("attachmenttype").value);
    if (!isroofmaterialfound || !found) {
      this.commonService
        .addAttachmentType(
          this.structuralFormGroup.get("attachmenttype").value,
          rooftype,
          this.selectedRoofMaterialID
        )
        .subscribe(
          response => {
            this.selectedAttachmentTypeID = response.id;
            if (this.generateddesign.rooftype == "both") {
              this.saveRoofMaterial1('pitch');
            } else {
              this.saveRestStructuralInformation();
            }
          },
          error => {

            this.notifyService.showError(
              error,
              "Error"
            );
          }
        );
    } else {
      if (this.generateddesign.rooftype == "both") {
        this.saveRoofMaterial1('pitch');
      } else {
        this.saveRestStructuralInformation();
      }
    }
  }

  saveRoofMaterial1(rooftype) {
    if (this.structural1FormGroup.valid) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
      const found = this.roofmaterials1.some(el => el.name === this.structural1FormGroup.get("roofmaterial").value);
      if (!found) {

        this.commonService
          .addRoofMaterial(
            this.structural1FormGroup.get("roofmaterial").value,
            rooftype
          )
          .subscribe(
            response => {
              this.selectedRoofMaterial1ID = response.id;
              this.saveRackingName1(rooftype);
            },
            error => {
              this.notifyService.showError(
                error,
                "Error"
              );
            }
          );
      } else {
        this.saveRackingName1(rooftype);
      }
    } else {
      console.log(this.genericService.findInvalidControls(this.structural1FormGroup));
      this.displayerror = false;
      this.structural1FormGroup.markAllAsTouched();
      this.changeDetectorRef.detectChanges();
    }
  }

  saveRackingName1(rooftype) {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
    const found = this.rackingnames.some(el => el.name === this.structural1FormGroup.get("rackingname").value);
    if (!found) {
      this.commonService
        .addRackingName(
          this.structural1FormGroup.get("rackingname").value
        )
        .subscribe(
          response => {
            this.selectedRackingName1ID = response.id;
            this.saveRackingModel1(rooftype);
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
          }
        );
    } else {
      this.saveRackingModel1(rooftype);
    }
  }

  saveRackingModel1(rooftype) {
    const israckingmakefound = this.rackingnames.some(el => el.name === this.structural1FormGroup.get("rackingname").value);
    const found = this.rackingmodels1.some(el => el.name === this.structural1FormGroup.get("rackingmodel").value);
    if (!israckingmakefound || !found) {
      this.commonService
        .addRackingModel(
          this.structural1FormGroup.get("rackingmodel").value,
          rooftype,
          this.selectedRackingName1ID,
          this.selectedRoofMaterial1ID
        )
        .subscribe(
          response => {
            this.selectedRackingModel1ID = response.id;
            this.saveAttachmentType1(rooftype);
          },
          error => {

            this.notifyService.showError(
              error,
              "Error"
            );
          }
        );
    } else {
      this.saveAttachmentType1(rooftype);
    }
  }

  saveAttachmentType1(rooftype) {
    const isroofmaterialfound = this.roofmaterials1.some(el => el.name === this.structural1FormGroup.get("roofmaterial").value);
    const found = this.attachmenttypes1.some(el => el.name === this.structural1FormGroup.get("attachmenttype").value);
    if (!isroofmaterialfound || !found) {
      this.commonService
        .addAttachmentType(
          this.structural1FormGroup.get("attachmenttype").value,
          rooftype,
          this.selectedRoofMaterial1ID
        )
        .subscribe(
          response => {
            this.selectedAttachmentType1ID = response.id;
            if (this.generateddesign.rooftype == "both") {
              this.saveFlatStructuralInformation();
            } else {
              this.saveRestStructuralInformation();
            }
          },
          error => {

            this.notifyService.showError(
              error,
              "Error"
            );
          }
        );
    } else {
      if (this.generateddesign.rooftype == "both") {
        this.saveFlatStructuralInformation();
      } else {
        this.saveRestStructuralInformation();
      }
    }
  }
 */
  saveRestStructuralInformation(): void {
    var roofpitch = 0;
    if (this.structuralFormGroup.valid) {
      if (this.generateddesign.rooftype == "pitch") {
        roofpitch = this.structuralFormGroup.get("roofpitch").value;
        if (this.structuralFormGroup.get("numberoflayers").value == "") {
          this.numberoflayers.setValue(0);
        }
      } else if (this.generateddesign.rooftype == "both" || this.generateddesign.rooftype == "flat" || this.generateddesign.mountingtype == "ground") {
        this.framing.setValue(null);
        this.framingsize.setValue("");
        this.spacing.setValue(0);
        this.numberoflayers.setValue(0);
      }
      if (this.isEditMode) {
        const postData = {
          framing: this.structuralFormGroup.get("framing").value,
          framingsize: this.selectedFramingSize,
          spacing: this.structuralFormGroup.get("spacing").value,
          numberoflayers: this.structuralFormGroup.get("numberoflayers").value,
          maxspanspacing: this.structuralFormGroup.get("maxspanspacing").value,
          roofpitch: roofpitch,
          roofazimuth: this.structuralFormGroup.get("roofazimuth").value,
          roofmaterial: this.roofmaterial.value,
          rackingname: this.rackingname.value,
          rackingmodel: this.rackingmodel.value,
          attachmenttype: this.attachmenttype.value,
          rooftype: this.generateddesign.rooftype,
          comments: this.structuralFormGroup.get("structuralcomments").value,
          design: this.generateddesign.id,
        };

        this.designService
          .editDesignStructuralInformation(
            this.generateddesign.structuralinformations[0].id,
            postData
          )
          .subscribe(
            (response) => {
              this.generateddesign.structuralinformations[0] = response;
              this.genericService.setNewGeneratedDesign(this.generateddesign);
              this.eventEmitterService.onPermitDesignGenerationStateChange(
                EVENTS_PERMIT_DESIGN.ShowLoading
              );
              this.uploadRoofObstaclesFiles(response.id);
            },
            (error) => {
              this.notifyService.showError(error, "Error");
            }
          );
      } else {
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.ShowLoading
        );
        this.designService
          .addDesignStructuralInformation(
            this.structuralFormGroup.get("framing").value,
            this.selectedFramingSize,
            this.structuralFormGroup.get("spacing").value,
            this.structuralFormGroup.get("numberoflayers").value,
            this.structuralFormGroup.get("maxspanspacing").value,
            roofpitch,
            this.structuralFormGroup.get("roofazimuth").value,
            this.roofmaterial.value,
            this.rackingname.value,
            this.rackingmodel.value,
            this.attachmenttype.value,
            this.structuralFormGroup.get("attachmentdistance").value,
            this.structuralFormGroup.get("attachmentmountingplacement").value,
            this.generateddesign.rooftype,
            this.structuralFormGroup.get("structuralcomments").value,
            this.generateddesign.id
          )
          .subscribe(
            (response) => {
              this.generateddesign.structuralinformations.push(response);
              this.genericService.setNewGeneratedDesign(this.generateddesign);
              this.uploadRoofObstaclesFiles(response.id);
            },
            (error) => {
              this.notifyService.showError(error, "Error");
            }
          );
      }
    }
    else {

      if (this.isClient) {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.StructuralInformationSkipped);
      } else {
        this.structuralFormGroup.markAllAsTouched();
      }
    }
  }

  saveFlatStructuralInformation(): void {
    if (
      this.generateddesign.rooftype == "both" ||
      this.generateddesign.rooftype == "flat" ||
      this.generateddesign.mountingtype == "ground"
    ) {
      this.framing.setValue(null);
      this.framingsize.setValue("");
      this.spacing.setValue(0);
      this.numberoflayers.setValue(0);
    }
    if (this.isEditMode) {
    } else {
      if (this.structuralFormGroup.valid) {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
        this.designService
          .addDesignStructuralInformation(
            this.structuralFormGroup.get("framing").value,
            this.selectedFramingSize,
            this.structuralFormGroup.get("spacing").value,
            this.structuralFormGroup.get("numberoflayers").value,
            this.structuralFormGroup.get("maxspanspacing").value,
            0,
            this.structuralFormGroup.get("roofazimuth").value,
            this.roofmaterial.value,
            this.rackingname.value,
            this.rackingmodel.value,
            this.attachmenttype.value,
            this.structuralFormGroup.get("attachmentdistance").value,
            this.structuralFormGroup.get("attachmentmountingplacement").value,
            "flat",
            this.structuralFormGroup.get("structuralcomments").value,
            this.generateddesign.id
          )
          .subscribe(
            response => {
              this.generateddesign.structuralinformations.push(response);
              this.genericService.setNewGeneratedDesign(this.generateddesign);
              this.uploadRoofObstaclesFiles(response.id);
            },
            error => {
              this.notifyService.showError(
                error,
                "Error"
              );
            }
          );
      } else {
        if (this.isClient) {
          this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.StructuralInformationSkipped);
        }
      }
    }
  }

  savePitchStructuralInformation() {
    if (this.structural1FormGroup.valid || this.isClient) {
      if (this.isEditMode) {
        const postData = {
          framing: this.structural1FormGroup.get("framing").value,
          framingsize: this.selectedFramingSize1,
          spacing: this.structural1FormGroup.get("spacing").value,
          numberoflayers: this.structural1FormGroup.get("numberoflayers").value,
          maxspanspacing: this.structural1FormGroup.get("maxspanspacing").value,
          roofpitch: this.structural1FormGroup.get("roofpitch1").value,
          roofazimuth: this.structural1FormGroup.get("roofazimuth").value,
          roofmaterial: this.roofmaterial1.value,
          rackingname: this.rackingname1.value,
          rackingmodel: this.rackingmodel1.value,
          attachmenttype: this.attachmenttype1.value,
          rooftype: "pitch",
          comments: this.structural1FormGroup.get("structuralcomments").value,
          design: this.generateddesign.id,
        };

        this.designService
          .editDesignStructuralInformation(
            this.generateddesign.structuralinformations[1].id,
            postData
          )
          .subscribe(
            (response) => {
              this.generateddesign.structuralinformations[1] = response;
              this.genericService.setNewGeneratedDesign(this.generateddesign);
              this.uploadPitchRoofObstaclesFiles(response.id);
            },
            (error) => {
              this.notifyService.showError(error, "Error");
            }
          );
      } else {
        this.designService
          .addDesignStructuralInformation(
            this.structural1FormGroup.get("framing1").value,
            this.selectedFramingSize1,
            this.structural1FormGroup.get("spacing1").value,
            this.structural1FormGroup.get("numberoflayers1").value,
            this.structural1FormGroup.get("maxspanspacing1").value,
            this.structural1FormGroup.get("roofpitch1").value,
            this.structural1FormGroup.get("roofazimuth1").value,
            this.roofmaterial1.value,
            this.rackingname1.value,
            this.rackingmodel1.value,
            this.attachmenttype1.value,
            this.structural1FormGroup.get("attachmentdistance1").value,
            this.structural1FormGroup.get("attachmentmountingplacement1").value,
            "pitch",
            this.structural1FormGroup.get("structuralcomments1").value,
            this.generateddesign.id
          )
          .subscribe(
            (response) => {
              this.generateddesign.structuralinformations.push(response);
              this.genericService.setNewGeneratedDesign(this.generateddesign);
              this.eventEmitterService.onPermitDesignGenerationStateChange(
                EVENTS_PERMIT_DESIGN.ShowLoading
              );
              this.uploadPitchRoofObstaclesFiles(response.id);
            },
            (error) => {
              this.notifyService.showError(error, "Error");
            }
          );
      }
    } else {
      this.displayerror = false;
    }
  }

  uploadRoofObstaclesFiles(recordid: number): void {
    if (this.rooffiles.length > 0) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingRoofObstacles
      );
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.rooffiles,
          "roofdimensionsandobstacles",
          "designstructuralinformation"
        )
        .subscribe(
          (response) => {
            this.generateddesign.structuralinformations[0].roofdimensionsandobstacles =
              response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.uploadRoofPhotosFiles(recordid);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.uploadRoofPhotosFiles(recordid);
    }
  }

  onRoofFileSelect(event): void {
    this.roofobstaclefilesuploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      this.rooffiles.push(element);
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onRoofFileRemove(event): void {
    this.rooffiles.splice(this.rooffiles.indexOf(event), 1);
    if (this.rooffiles.length == 0) {
      this.roofobstaclefilesuploaded = false;
    }
  }

  uploadRoofPhotosFiles(recordid: number): void {
    if (this.roofphotos.length > 0) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingRoofPhotos
      );
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.roofphotos,
          "roofphotos",
          "designstructuralinformation"
        )
        .subscribe(
          (response) => {
            this.generateddesign.structuralinformations[0].roofphotos =
              response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.uploadAtticPhotosFiles(recordid);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.uploadAtticPhotosFiles(recordid);
    }
  }

  onRoofPhotosSelect(event): void {
    this.roofphotosfilesuploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      this.roofphotos.push(element);
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onRoofPhotosRemove(event): void {
    this.roofphotos.splice(this.roofphotos.indexOf(event), 1);
    if (this.roofphotos.length == 0) {
      this.roofphotosfilesuploaded = false;
    }
  }

  uploadAtticPhotosFiles(recordid: number): void {
    if (this.atticphotos.length > 0) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingAtticPhotos
      );
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.atticphotos,
          "atticphotos",
          "designstructuralinformation"
        )
        .subscribe(
          (response) => {
            this.generateddesign.structuralinformations[0].atticphotos =
              response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            if (this.generateddesign.rooftype == "both") {
              this.eventEmitterService.onPermitDesignGenerationStateChange(
                EVENTS_PERMIT_DESIGN.ShowLoading
              );
              this.savePitchStructuralInformation();
            } else {
              this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
              // this.notifyService.showSuccess("Structural information saved successfully.", "Saved");
              this.isDataSubmitted = true;
              this.eventEmitterService.onPermitDesignGenerationStateChange(
                EVENTS_PERMIT_DESIGN.StructuralInformationSaved
              );
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      if (this.generateddesign.rooftype == "both") {
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.ShowLoading
        );
        this.savePitchStructuralInformation();
      } else {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
        // this.notifyService.showSuccess("Structural information saved successfully.", "Saved");
        this.isDataSubmitted = true;
        this.eventEmitterService.onPermitDesignGenerationStateChange(
          EVENTS_PERMIT_DESIGN.StructuralInformationSaved
        );
      }
    }
  }

  onAtticPhotosSelect(event): void {
    this.atticphotosfileuploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      this.atticphotos.push(element);
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onAtticPhotosRemove(event): void {
    this.atticphotos.splice(this.atticphotos.indexOf(event), 1);
    if (this.atticphotos.length == 0) {
      this.atticphotosfileuploaded = false;
    }
  }

  onRemoveRoofDimensionsAndObstacles(
    file: UploadedFile,
    stindex: number,
    index: number
  ): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.generateddesign.structuralinformations[
          stindex
        ].roofdimensionsandobstacles.splice(index, 1);
        this.generateddesign.structuralinformations[
          stindex
        ].roofdimensionsandobstacles = [
            ...this.generateddesign.structuralinformations[stindex]
              .roofdimensionsandobstacles,
          ];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onRemoveRoofPhotos(file: UploadedFile, stindex: number, index: number): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.generateddesign.structuralinformations[stindex].roofphotos.splice(
          index,
          1
        );
        this.generateddesign.structuralinformations[stindex].roofphotos = [
          ...this.generateddesign.structuralinformations[stindex].roofphotos,
        ];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onRemoveAtticPhotos(
    file: UploadedFile,
    stindex: number,
    index: number
  ): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.generateddesign.structuralinformations[stindex].atticphotos.splice(
          index,
          1
        );
        this.generateddesign.structuralinformations[stindex].atticphotos = [
          ...this.generateddesign.structuralinformations[stindex].atticphotos,
        ];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  //--------------------

  uploadPitchRoofObstaclesFiles(recordid: number): void {
    if (this.pitchrooffiles.length > 0) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingRoofObstacles
      );
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.pitchrooffiles,
          "roofdimensionsandobstacles",
          "designstructuralinformation"
        )
        .subscribe(
          (response) => {
            this.generateddesign.structuralinformations[1].roofdimensionsandobstacles =
              response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.uploadPitchRoofPhotosFiles(recordid);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.uploadPitchRoofPhotosFiles(recordid);
    }
  }

  onPitchRoofFileSelect(event): void {
    this.pitchroofobstaclefilesuploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      this.pitchrooffiles.push(element);
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onPitchRoofFileRemove(event): void {
    this.pitchrooffiles.splice(this.pitchrooffiles.indexOf(event), 1);
    if (this.pitchrooffiles.length == 0) {
      this.pitchroofobstaclefilesuploaded = false;
    }
  }

  uploadPitchRoofPhotosFiles(recordid: number): void {
    if (this.pitchroofphotos.length > 0) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingRoofPhotos
      );
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.pitchroofphotos,
          "roofphotos",
          "designstructuralinformation"
        )
        .subscribe(
          (response) => {
            this.generateddesign.structuralinformations[1].roofphotos =
              response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.uploadPitchAtticPhotosFiles(recordid);
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.uploadPitchAtticPhotosFiles(recordid);
    }
  }

  onPitchRoofPhotosSelect(event): void {
    this.pitchroofphotosfilesuploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      this.pitchroofphotos.push(element);
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onPitchRoofPhotosRemove(event): void {
    this.pitchroofphotos.splice(this.pitchroofphotos.indexOf(event), 1);
    if (this.pitchroofphotos.length == 0) {
      this.pitchroofphotosfilesuploaded = false;
    }
  }

  uploadPitchAtticPhotosFiles(recordid: number): void {
    if (this.pitchatticphotos.length > 0) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.UploadingAtticPhotos
      );
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.pitchatticphotos,
          "atticphotos",
          "designstructuralinformation"
        )
        .subscribe(
          (response) => {
            this.generateddesign.structuralinformations[1].atticphotos =
              response;
            this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
            // this.notifyService.showSuccess("Structural information saved successfully.", "Saved");
            this.isDataSubmitted = true;
            this.eventEmitterService.onPermitDesignGenerationStateChange(
              EVENTS_PERMIT_DESIGN.StructuralInformationSaved
            );
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.genericService.setNewGeneratedDesign(this.generateddesign);
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
      // this.notifyService.showSuccess("Structural information saved successfully.", "Saved");
      this.isDataSubmitted = true;
      this.eventEmitterService.onPermitDesignGenerationStateChange(
        EVENTS_PERMIT_DESIGN.StructuralInformationSaved
      );
    }
  }

  onPitchAtticPhotosSelect(event): void {
    this.pitchatticphotosfileuploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      this.pitchatticphotos.push(element);
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }
  onPitchAtticPhotosRemove(event): void {
    this.pitchatticphotos.splice(this.pitchatticphotos.indexOf(event), 1);
    if (this.pitchatticphotos.length == 0) {
      this.pitchatticphotosfileuploaded = false;
    }
  }

  onDeleteRoofObstacles(id, index) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      response => {
        this.generateddesign.structuralinformations[0].roofdimensionsandobstacles.splice(index, 1)
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onDeleteRoofphotos(id, index) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      response => {
        this.generateddesign.structuralinformations[0].roofphotos.splice(index, 1)
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onDeleteAtticphotos(id, index) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      response => {
        this.generateddesign.structuralinformations[0].atticphotos.splice(index, 1)
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
}
