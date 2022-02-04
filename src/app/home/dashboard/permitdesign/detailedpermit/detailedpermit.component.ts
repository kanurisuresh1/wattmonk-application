import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { EVENTS_PERMIT_DESIGN, ROLES } from "src/app/_helpers";
import { Design, User } from "src/app/_models";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { AssigndesigndialogComponent } from "../../prelimdesign/assigndesigndialog/assigndesigndialog.component";
import { DesignDeclineDialog } from "../../prelimdesign/design/design.component";
import { BomComponent } from "./bom/bom.component";
import { DesignerinformationComponent } from "./designerinformation/designerinformation.component";
import { ElectricalinformationComponent } from "./electricalinformation/electricalinformation.component";
import { GeneralinformationComponent } from "./generalinformation/generalinformation.component";
import { PermitplanuploaderComponent } from "./permitplanuploader/permitplanuploader.component";
import { SiteinformationComponent } from "./siteinformation/siteinformation.component";
import { StructuralinformationComponent } from "./structuralinformation/structuralinformation.component";

export interface DesignFormData {
  // isDesignerFillMode: boolean;
  isEditMode: boolean;
  isdataupdated: boolean;
  design: Design;
}

export enum LISTTYPE {
  NEW,
  INDESIGN,
  COMPLETED,
  INREVIEW,
  DELIVERED,
}

@Component({
  selector: "app-detailedpermit",
  templateUrl: "./detailedpermit.component.html",
  styleUrls: ["./detailedpermit.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailedpermitComponent implements OnInit {
  loggedInUser: User;
  isClient = false;
  isDesigner = false;
  uploadpermitplan = "Permit Design"
  @ViewChild(SiteinformationComponent) stepsiteinformation: SiteinformationComponent;
  @ViewChild(GeneralinformationComponent) stepgeneralinformation: GeneralinformationComponent;
  @ViewChild(StructuralinformationComponent) stepstructuralinformation: StructuralinformationComponent;
  @ViewChild(ElectricalinformationComponent) stepelectricalinformation: ElectricalinformationComponent;
  // @ViewChild(LocationmarkingComponent) steplocationmarking: LocationmarkingComponent;
  @ViewChild(DesignerinformationComponent) stepdesignerinformation: DesignerinformationComponent;
  @ViewChild(PermitplanuploaderComponent) stepuploadpermitplan: PermitplanuploaderComponent;
  @ViewChild(BomComponent) stepbom: BomComponent;
  showConfirmationPopup = false;

  isLoading = false;

  loadingmessage = "Saving data";

  isnewconstruction = false;

  selectedjobtype = -1;
  newdesignslist = [];
  indesignslist = [];
  inreviewdesignslist = [];
  completeddesignslist = [];
  delivereddesignslist = [];
  generateddesign: Design = new Design();
  amounttopay: any;
  slabname: any;
  slabdiscount: any;
  serviceamount: number;
  appliedcoupan = null;
  statusfilter;
  displayerror = true;

  assigntowattmonk: boolean;
  issiteinfoexpanded = false;
  isgeneralinfoexpanded = false;
  isstructuralinfoexpanded = false;
  iselectricalinfoexpanded = false;
  islocationinfoexpanded = false;
  designerinfoexpanded = false;
  uploadpermitexpanded = false;
  allinformationfilled = false;
  qualitycheckexpanded = false;
  bomexpanded = false;
  designgenerateeventsubscription: any;
  isDesignerEditMode: boolean = false;
  isdesignerdetailsaved = false;
  isdesignbomdetailsaved = false;
  constructor(
    public dialogRef: MatDialogRef<DetailedpermitComponent>,
    public dialog: MatDialog,
    private eventEmitterService: EventEmitterService,
    private genericService: GenericService,
    private authService: AuthenticationService,
    public designService: DesignService,
    private commonservice: CommonService,
    private changeDetector: ChangeDetectorRef,
    private notifyService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: DesignFormData
  ) {
    this.loggedInUser = authService.currentUserValue.user;

    if (this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id != 232) || (this.loggedInUser.role.id == ROLES.TeamHead &&
          this.loggedInUser.parent.id != 232)) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }

    if (this.loggedInUser.role.id == ROLES.Designer) {
      this.isDesigner = true;
      if (this.data.design.autopermitdesign == null) {
        this.designerinfoexpanded = true;
      }
      else {
        this.uploadpermitexpanded = true;
      }
    } else {
      this.isDesigner = false;
    }
    if (this.data.design.solarmake?.name == "None" || this.data.design.solarmake == null || this.data.design.solarmodel == null) {
      this.issiteinfoexpanded = true;
    }
    this.data.design.designinverters.map(data => {
      if (data.invertermake == null || data.invertermodel == null || data.invertermake == "None") {
        this.issiteinfoexpanded = true;
      }
    })

    if (this.data.design.designgeneralinformation == null) {
      this.isgeneralinfoexpanded = true;
    }
    else if (this.data.design.structuralinformations == null) {
      this.isstructuralinfoexpanded = true;
    }
    else if (this.data.design.electricalinformation == null) {
      this.iselectricalinfoexpanded = true;
    }
    else if (this.data.design.reviewassignedto?.id == this.loggedInUser.id) {
      this.qualitycheckexpanded = true;
    }

    this.generateddesign.rooftype = "flat";

  }

  ngOnInit(): void {
    this.designgenerateeventsubscription = this.eventEmitterService.
      designGenerationState.subscribe((id: EVENTS_PERMIT_DESIGN) => {
        this.onDesignGenerationEventHandler(id);
      });
  }

  ngAfterViewInit(): void {
    this.prefilldesigndata();
  }

  prefilldesigndata() {
    this.generateddesign = this.data.design;
    this.genericService.setNewGeneratedDesign(this.data.design);
    if (this.generateddesign.status == "designassigned") {
      this.uploadpermitplan = "Upload Permit Plan"
    }
    if (this.generateddesign.jobtype == "battery") {
      this.selectedjobtype = 2;
    } else if (this.generateddesign.jobtype == "pvbattery") {
      this.selectedjobtype = 0
    } else if (this.generateddesign.jobtype == "pv") {
      this.selectedjobtype = 1;
    }

    this.isnewconstruction = this.data.design.newconstruction;
    this.stepsiteinformation.updateform(this.data.design);
    this.stepgeneralinformation.updateform(this.data.design);
    this.stepstructuralinformation.updateform(this.data.design);
    this.stepelectricalinformation.updateform(this.data.design);

    // if(this.data.design.latitude != null){
    //   this.steplocationmarking.updateform(this.data.design);
    //   }
    if (this.isDesigner) {
      this.stepdesignerinformation.updateform(this.data.design);
    }
    // if (((this.isDesigner && this.data.design.status == 'designassigned' && this.data.design.autopermitdesign != null) || ((this.data.design.status == 'designcompleted' || this.data.design.status == 'reviewassigned' || this.data.design.status == 'reviewpassed' || this.data.design.status == 'reviewfailed' || this.data.design.status == 'delivered') && !this.isClient) || ((this.data.design.status == 'delivered') && this.isClient))) {
    //   this.stepuploadpermitplan.updateform(this.data.design);
    // }


    if (this.generateddesign.designgeneralinformation == null) {
      this.isgeneralinfoexpanded = true;
    }
    if (this.generateddesign.electricalinformation == null) {
      this.iselectricalinfoexpanded = true;
    }
    if (this.generateddesign.structuralinformations.length == 0) {
      this.isstructuralinfoexpanded = true;
    }
    /*  if (this.generateddesign.electricalslocation == null) {
       this.islocationinfoexpanded = true;
     } */

    if (!this.isgeneralinfoexpanded && !this.iselectricalinfoexpanded && !this.isstructuralinfoexpanded) {
      this.allinformationfilled = true;
    } else {
      this.allinformationfilled = false;
    }

    console.log(this.isstructuralinfoexpanded);

    this.changeDetector.detectChanges()
  }

  OnEditClick() {
    this.data.isEditMode = true;
    this.fillInEditDesignDetails();
    this.changeDetector.detectChanges();
  }
  OnDesignerEditClick() {
    this.isDesignerEditMode = true;
    this.stepdesignerinformation.onEditClick();
  }
  fillinDesignerFillDetails(): void {
    //this.isDisplayMode = true;
    this.generateddesign = this.data.design;

    this.genericService.setNewGeneratedDesign(this.data.design);
    if (this.generateddesign.jobtype == "battery") {
      this.selectedjobtype = 2;
    } else if (this.generateddesign.jobtype == "pvbattery") {
      this.selectedjobtype = 0;
    } else if (this.generateddesign.jobtype == "pv") {
      this.selectedjobtype = 1;
    }

    this.isnewconstruction = this.data.design.newconstruction;

    this.stepsiteinformation.fillinEditModeSiteInformation(this.generateddesign);
    this.stepgeneralinformation.enableForm(this.generateddesign);
    if (this.generateddesign.designgeneralinformation != null) {
      this.stepgeneralinformation.loadInputInformation(this.generateddesign);
    } else {
      // this.isDisplayMode = false;
    }

    if (this.generateddesign.jobtype == "battery") {
      this.stepelectricalinformation.enableForm(this.generateddesign);
      this.stepelectricalinformation.fetchElectricalData();
    } else {
      this.stepstructuralinformation.enableForm(this.generateddesign);
      this.stepstructuralinformation.fetchStructuralStepInformation();
      if (this.generateddesign.structuralinformations.length > 0) {
        this.stepstructuralinformation.loadInputInformation(
          this.generateddesign
        );
      } else {
        // this.isDisplayMode = false;
      }
      this.stepelectricalinformation.enableForm(this.generateddesign);
      this.stepelectricalinformation.fetchElectricalData();
    }

    if (this.generateddesign.electricalinformation != null) {
      this.stepelectricalinformation.loadInputInformation(this.generateddesign);
    } else {
      // this.isDisplayMode = false;
    }
    // if (this.generateddesign.jobtype != "battery" || !this.generateddesign.newconstruction) {
    //   this.steplocationmarking.enableForm(this.generateddesign);
    //   if (this.generateddesign.electricalslocation != null) {
    //     this.steplocationmarking.loadInputInformation(this.generateddesign);
    //   } else {
    //     // this.isDisplayMode = false;
    //   }
    // }

    /* if (this.isDesigner) {
      this.stepdesignerinformation.loadData(this.generateddesign);
      this.stepdesignerinformation.getInterconnectionValue(this.data.design.electricalinformation.interconnection)
    } */
  }

  fillInEditDesignDetails(): void {
    this.generateddesign = this.data.design;
    console.log(this.generateddesign);

    this.genericService.setNewGeneratedDesign(this.data.design);
    if (this.generateddesign.jobtype == "battery") {
      this.selectedjobtype = 2;
    } else if (this.generateddesign.jobtype == "pvbattery") {
      this.selectedjobtype = 0;
    } else if (this.generateddesign.jobtype == "pv") {
      this.selectedjobtype = 1;
    }

    this.isnewconstruction = this.data.design.newconstruction;
    this.stepsiteinformation.fillinEditModeSiteInformation(this.generateddesign);
    if (this.data.design.designgeneralinformation != null) {
      this.stepgeneralinformation.fillinEditGeneralInformationDetails(this.data.design);
    }
    this.stepgeneralinformation.enableForm(this.data.design)
    if (this.data.design.structuralinformations.length > 0) {
      this.stepstructuralinformation.fillinEditStructuralInformationDetails(this.data.design);
    }
    this.stepstructuralinformation.enableForm(this.data.design);
    if (this.data.design.electricalinformation != null) {
      this.stepelectricalinformation.fillinElectricalDetails(this.data.design);
    }
    this.stepelectricalinformation.enableForm(this.data.design);
    this.changeDetector.detectChanges();
  }

  onDesignGenerationEventHandler(event: EVENTS_PERMIT_DESIGN): void {
    this.generateddesign = this.genericService.getNewGeneratedDesign();
    switch (event) {
      case EVENTS_PERMIT_DESIGN.GeneralInformationSaved:
      case EVENTS_PERMIT_DESIGN.GeneralInformationSkipped:
        if (this.generateddesign.jobtype == "battery") {
          this.stepelectricalinformation.saveElectricalInformation();
        } else {
          if (this.generateddesign.rooftype == "both") {
            this.stepstructuralinformation.saveFlatStructuralInformation();
          } else {
            this.stepstructuralinformation.saveRestStructuralInformation();
          }
        }
        break;
      case EVENTS_PERMIT_DESIGN.StructuralInformationSaved:
      case EVENTS_PERMIT_DESIGN.StructuralInformationSkipped:
        if (this.generateddesign.jobtype == "battery") {
          // this.steplocationmarking.saveLocationMarkedImage();
        } else {
          this.stepelectricalinformation.saveElectricalInformation();
        }
        break;
      case EVENTS_PERMIT_DESIGN.ElectricalInformationSaved:
      case EVENTS_PERMIT_DESIGN.ElectricalInformationSkipped:
        if (this.generateddesign.jobtype == "battery" || this.generateddesign.newconstruction) {
          this.generateddesign = this.genericService.getNewGeneratedDesign();
          this.notifyService.showSuccess("Detailed information of design request saved successfully.", "Success");
          this.designgenerateeventsubscription.unsubscribe();
          this.data.design = this.generateddesign;
          this.data.isdataupdated = true;
          this.dialogRef.close(this.data);
        } else {
          // this.steplocationmarking.saveLocationMarkedImage();
          this.generateddesign = this.genericService.getNewGeneratedDesign();
          this.notifyService.showSuccess("Detailed information of design request saved successfully.", "Success");
          this.designgenerateeventsubscription.unsubscribe();
          this.data.design = this.generateddesign;
          this.data.isdataupdated = true;
          this.dialogRef.close(this.data);
        }
        break;
      case EVENTS_PERMIT_DESIGN.LocationMarkingSaved:
        this.generateddesign = this.genericService.getNewGeneratedDesign();
        this.notifyService.showSuccess("Detailed information of design request saved successfully.", "Success");
        this.designgenerateeventsubscription.unsubscribe();
        this.data.design = this.generateddesign;
        this.data.isdataupdated = true;
        this.dialogRef.close(this.data);
        break;
      case EVENTS_PERMIT_DESIGN.ShowLoading:
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.HideLoading:
        this.isLoading = false;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.BatteryJobChange:
        this.selectedjobtype = 2;
        break;
      case EVENTS_PERMIT_DESIGN.PVBatteryJobChange:
        this.selectedjobtype = 0;
        break;
      case EVENTS_PERMIT_DESIGN.PVJobChange:
        this.selectedjobtype = 1;
        break;
      case EVENTS_PERMIT_DESIGN.NewConstructionChangeOn:
        this.isnewconstruction = true;
        break;
      case EVENTS_PERMIT_DESIGN.NewConstructionChangeOff:
        this.isnewconstruction = false;
        break;
      case EVENTS_PERMIT_DESIGN.UploadingArchitecturalDesign:
        this.loadingmessage = "Uploading Architectural Design";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingAttachments:
        this.loadingmessage = "Uploading Attachments";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.ChatSetup:
        this.loadingmessage = "Initializing Chat";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingModulesDesign:
        this.loadingmessage = "Uploading Modules Layout";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingRoofObstacles:
        this.loadingmessage = "Uploading Roof Dimensions and Obstacles";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingRoofPhotos:
        this.loadingmessage = "Uploading Roof Photos";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingAtticPhotos:
        this.loadingmessage = "Uploading Attic Photos";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingMSPPhotos:
        this.loadingmessage = "Uploading MSP Photos";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingSubpanelPhotos:
        this.loadingmessage = "Uploading Subpanel Photos";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingSketchDiagram:
        this.loadingmessage = "Uploading Single line diagram";
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingLocationImage:
        this.loadingmessage = "Uploading Equipments location";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      ////////////
      case EVENTS_PERMIT_DESIGN.UploadingSitePlan:
        this.loadingmessage = "Uploading Site Plans";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingRoofPlanAndModules:
        this.loadingmessage = "Uploading Roof Plan and Modules";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingStringLayoutAndBom:
        this.loadingmessage = "Uploading String Layout";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingSingleLineDiagram:
        this.loadingmessage = "Uploading Single Line Diagram";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingHousePhotoImage:
        this.loadingmessage = "Uploading House Photo";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingVicinityMap:
        this.loadingmessage = "Uploading Vicinity Map";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingSolarModuleCatalogue:
        this.loadingmessage = "Uploading Solar Module Catalogue";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingInverterCatalogue:
        this.loadingmessage = "Uploading Inverter Catalogue";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingBatteryCatalogue:
        this.loadingmessage = "Uploading Battery Catalogue";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingRackingModelDataCatalogue:
        this.loadingmessage = "Uploading Racking Model Data Catalogue";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingRackingModelCutCatalogue:
        this.loadingmessage = "Uploading Racking Model Cut Catalogue";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingAttachmentsDataSheetCatalogue:
        this.loadingmessage = "Uploading Attachments Data Sheet Catalogue";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingAttachmentsCutSheetCatalogue:
        this.loadingmessage = "Uploading Attachments Cut Sheet Catalogue";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.GeneratingPDF:
        this.loadingmessage = "Generating PDF file  ";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.DownloadingPercentageOfGeneratedPDF:
        this.loadingmessage = "Downloading file " + this.stepuploadpermitplan.downloadingpercentage + " %";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.QualityCheck:
        this.loadingmessage = "Updating Design Status"
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.UploadingSitePlacardImage:
        this.loadingmessage = "Updating Site Placard Image"
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.DesignerInformationSaved:
        this.generateddesign = this.genericService.getNewGeneratedDesign();
        this.notifyService.showSuccess("Detailed information of design request saved successfully.", "Success");
        this.designgenerateeventsubscription.unsubscribe();
        this.data.design = this.generateddesign;
        this.data.isdataupdated = true;
        this.dialogRef.close(this.data);
        break;
      case EVENTS_PERMIT_DESIGN.SiteInformationSaved:
        this.issiteinfoexpanded = false;
      case EVENTS_PERMIT_DESIGN.DesignerDetailsSaved:
        //this.stepbom.updateDesignIds(this.data.design);
        this.isdesignerdetailsaved = true;
        this.bomexpanded = true;
        this.designerinfoexpanded = false;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.DesignBomDetailSaved:
        this.isdesignbomdetailsaved = true;
        this.bomexpanded = false;
        //this.stepuploadpermitplan.updateform(this.data.design)
        this.uploadpermitexpanded = true;
        this.changeDetector.detectChanges();
        break;
      case EVENTS_PERMIT_DESIGN.DesignBomDetailSaved:
        this.loadingmessage = "Uploading Others Attachments ";
        this.isLoading = true;
        this.changeDetector.detectChanges();
        break;
      default:
        break;
    }
  }

  onCloseClick(): void {
    this.dialogRef.close(this.data);
  }

  onSaveDesign(event): void {
    event.preventDefault();
    event.stopPropagation();
    console.log(this.data.design);
    if (this.data.design.designgeneralinformation == null || this.data.isEditMode) {
      this.stepgeneralinformation.saveGeneralInformationData();
    } else if (this.data.design.structuralinformations == null || this.data.design.structuralinformations.length == 0) {
      if (this.generateddesign.jobtype == "battery") {
        this.stepelectricalinformation.saveElectricalInformation();
      } else {
        if (this.generateddesign.rooftype == "both") {
          this.stepstructuralinformation.saveFlatStructuralInformation();
        } else {
          this.stepstructuralinformation.saveRestStructuralInformation();
        }
      }
    } else if (this.data.design.electricalinformation == null) {
      this.stepelectricalinformation.saveElectricalInformation();
    } else if (this.generateddesign.electricalslocation == null) {
      if (this.generateddesign.jobtype == "battery" || this.generateddesign.newconstruction) {
        this.generateddesign = this.genericService.getNewGeneratedDesign();
        this.notifyService.showInfo(
          "All required information of design request is already saved.",
          "Info"
        );
        this.data.design = this.generateddesign;
        this.data.isdataupdated = false;
        this.dialogRef.close(this.data);
      } else {
        // this.steplocationmarking.saveLocationMarkedImage();
        this.generateddesign = this.genericService.getNewGeneratedDesign();
        this.notifyService.showInfo("All required information of design request is already saved.", "Info");
        this.data.design = this.generateddesign;
        this.data.isdataupdated = false;
        this.dialogRef.close(this.data);
      }
    } else {
      this.generateddesign = this.genericService.getNewGeneratedDesign();
      this.notifyService.showInfo(
        "All required information of design request is already saved.",
        "Info"
      );
      this.data.design = this.generateddesign;
      this.data.isdataupdated = false;
      this.dialogRef.close(this.data);
    }
    // if (this.data.design.designgeneralinformation == null || this.data.isEditMode) {
    //   this.stepgeneralinformation.saveGeneralInformationData();
    // } else if (this.data.design.structuralinformations.length == 0 || this.data.isEditMode) {
    //   if (this.generateddesign.jobtype == "battery") {
    //     this.stepelectricalinformation.saveElectricalInformation();
    //   } else {
    //     this.stepstructuralinformation.saveRoofMaterial();
    //   }
    // } else if (this.data.design.electricalinformation == null || this.data.isEditMode) {
    //   this.stepelectricalinformation.saveElectricalInformation();
    // } else if (this.generateddesign.electricalslocation == null || this.data.isEditMode) {
    //   if (this.generateddesign.jobtype == "battery" || this.generateddesign.newconstruction) {
    //     this.generateddesign = this.genericService.getNewGeneratedDesign();
    //     this.notifyService.showInfo("All required information of design request is already saved.", "Info");
    //     this.data.design = this.generateddesign;
    //     this.data.isDataUpdated = false;
    //     this.dialogRef.close(this.data);
    //   } else {
    //     this.steplocationmarking.saveLocationMarkedImage();
    //   }
    // } else {
    //   this.generateddesign = this.genericService.getNewGeneratedDesign();
    //   this.notifyService.showInfo("All required information of design request is already saved.", "Info");
    //   this.data.design = this.generateddesign;
    //   this.data.isDataUpdated = false;
    //   this.dialogRef.close(this.data);
    // }
  }

  onSaveDesignerDetails(event) {
    event.preventDefault();
    event.stopPropagation();
    this.stepdesignerinformation.onSaveDesignerDetails();
  }

  openDesignDeclineDialog(record: Design): void {
    const dialogRef = this.dialog.open(DesignDeclineDialog, {
      width: "50%",
      data: { design: record },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.issubmitted) {
        this.data.isdataupdated = true;
        this.data.design = this.generateddesign;
        this.dialogRef.close(this.data);
      }
    });
  }

  declineDesignRequest(event: Event) {
    event.stopPropagation();
    this.generateddesign = this.genericService.getNewGeneratedDesign();
    this.openDesignDeclineDialog(this.generateddesign);
  }

  acceptDesignRequest(event: Event) {
    event.stopPropagation();
    this.generateddesign = this.genericService.getNewGeneratedDesign();
    this.isLoading = true;
    let cdate = Date.now();
    var deliverydate = new Date();

    deliverydate.setHours(deliverydate.getHours() + parseInt(this.generateddesign.slabname));

    const postData = {
      status: "requestaccepted",
      designacceptanceendtime: cdate,
      deliverydate: deliverydate
    };
    this.designService
      .editDesign(
        this.generateddesign.id,
        postData
      )
      .subscribe(
        response => {
          this.isLoading = false;
          this.notifyService.showSuccess("Design request has been accepted successfully.", "Success");
          this.data.isdataupdated = true;
          this.data.design = response;
          this.dialogRef.close(this.data);
        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );

        }
      )
  }

  assigndesign(
    event: Event
  ): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AssigndesigndialogComponent, {
      width: "50%",
      autoFocus: false,
      data: { isEditMode: false, design: this.generateddesign },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.refreshDashboard) {
        this.data.isdataupdated = true;
        this.data.design = this.generateddesign;
        this.dialogRef.close(this.data);
      }
    });
  }

  setDesignerdetailId(designerdetaild) {
    this.data.design.designerdetails = designerdetaild
  }
}