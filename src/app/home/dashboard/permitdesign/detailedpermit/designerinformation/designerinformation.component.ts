import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import html2canvas from 'html2canvas';
import { ConfirmationsnackbarComponent } from 'src/app/shared/confirmationsnackbar/confirmationsnackbar.component';
import { EVENTS_PERMIT_DESIGN } from 'src/app/_helpers';
import { Design } from 'src/app/_models';
import { AttachmentMaterial } from 'src/app/_models/attachmentmaterials';
import { DesignBOM } from 'src/app/_models/designbom';
import { DesignerElectricalInput } from 'src/app/_models/designerelectricalinput';
import { DesignerRoofInput } from 'src/app/_models/designerroofinput';
import { DesignOrientations } from 'src/app/_models/designorientations';
import { DesignService, GenericService, NotificationService } from 'src/app/_services';
import { CommonService } from 'src/app/_services/common.service';
import { DataEntryService } from 'src/app/_services/dataentry.service';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';
import { EditelectricalinputsComponent } from '../editelectricalinputs/editelectricalinputs.component';
declare var require: any
const axios = require("axios").default;

interface Location {
  latitude: number;
  longitude: number;
  zoom: number;
}

@Component({
  selector: "app-designerinformation",
  templateUrl: "./designerinformation.component.html",
  styleUrls: ["./designerinformation.component.scss"],
})
export class DesignerinformationComponent implements OnInit {
  designerinfoFormGroup: FormGroup;
  solarmoduleFormGroup: FormGroup;
  invertermodelFormGroup: FormGroup;
  generateddesign: Design;
  tiltvalue
  rooftypeboth = false

  displayerror = true;

  value = ' ';
  address = '';

  exposurecategory = new FormControl("", [Validators.required]);
  mainservicepanellocation = new FormControl("", [Validators.required]);
  showbackfeedrule = new FormControl("",);
  governingcode = new FormControl("", [Validators.required]);
  scalesiteplan = new FormControl("", [Validators.required]);
  scaleroofplan = new FormControl("", [Validators.required]);
  scalestringlayout = new FormControl("", [Validators.required]);
  panelheight = new FormControl("", []);
  legend = new FormControl("ri", []);
  numberofattachments = new FormControl("", [Validators.required]);
  designerdetailid: number;
  nec = new FormControl("nectwenty", []);

  //SolarmodelInput
  numberofcells = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  isc = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  voc = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  ipmax = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  vpmax = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  tempcoefofvoc = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  fuserating = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  modulelength = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  width = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  area = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  weight = new FormControl("", [Validators.required, Validators.maxLength(10)]);

  //InverterModels Input
  name = new FormControl("");
  phase = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  ratedacvoltage = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  rateoutputpower = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  numberofmpptchannels = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  currentpermppta = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  maximuminputvoltage = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  nominalinputvoltage = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  startupvoltage = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  maximuminputcurrent = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  maximumoutputcurrent = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  cecefficiency = new FormControl("", [Validators.required, Validators.maxLength(10)]);
  datasheetavailable = new FormControl(false, [Validators.required])
  maximumocpdrating = new FormControl("", [Validators.required, Validators.maxLength(10)]);

  //Roof Input fields
  bominputFormGroup: FormGroup;
  hidebominputform = true;
  bomid = new FormControl(0);
  bomquantity = new FormControl("1", [Validators.required]);
  bomdescription = new FormControl("", [Validators.required]);
  bomdisplayedColumns: string[] = ["id", "description", "quantity", "edit"];
  ATTACHMENT_DATA: DesignBOM[] = [];
  bomdataSource = new MatTableDataSource<DesignBOM>(this.ATTACHMENT_DATA);
  newattachmentmaterials: AttachmentMaterial[] = [];

  //Pitch Roof Attachment fields
  pitchbominputFormGroup: FormGroup;
  hidepitchbominputform = true;
  pitchbomid = new FormControl(0);
  pitchbomquantity = new FormControl("", [Validators.required]);
  pitchbomdescription = new FormControl("1", [Validators.required]);
  pitchbomdisplayedColumns: String[] = ['id', 'description', 'quantity', 'edit'];
  PITCH_ROOF_ATTACHMENT_DATA: DesignBOM[] = [];
  pitchbomdataSource = new MatTableDataSource<DesignBOM>(this.PITCH_ROOF_ATTACHMENT_DATA);
  pitchnewattachmentmaterials: AttachmentMaterial[] = [];

  //Roof Input fields
  designerroofinputFormGroup: FormGroup;


  hideroofinputform = true;

  roofinputid = new FormControl(0);
  modulescount = new FormControl("", [Validators.required]);
  tilt = new FormControl("", [Validators.required]);
  azimuth = new FormControl("", [Validators.required]);
  roofarea = new FormControl("", [Validators.required, Validators.maxLength(8)]);
  displayedColumns: string[] = ['id', 'numberofmodules', 'tilt', 'azimuth', 'roofarea', 'edit'];
  ROOF_DATA: DesignerRoofInput[] = [];
  dataSource = new MatTableDataSource<DesignerRoofInput>(this.ROOF_DATA);

  //Flat Roof Input 
  designerflatroofinputFormGroup: FormGroup;
  hideflatroofinputform = true;
  flatroofinputid = new FormControl(0);
  flatmodulescount = new FormControl("", [Validators.required]);
  flattilt = new FormControl("", [Validators.required]);
  flatazimuth = new FormControl("", [Validators.required]);
  flatroofarea = new FormControl("", [Validators.required]);
  flatroofdisplayedColumns: string[] = ['id', 'numberofmodules', 'tilt', 'azimuth', 'roofarea', 'edit'];
  FLAT_ROOF_DATA: DesignerRoofInput[] = [];
  flatroofdataSource = new MatTableDataSource<DesignerRoofInput>(this.ROOF_DATA);
  //Electricals Input Fields
  hideelectricalinputform = true;
  designerelectricalinputFormGroup: FormGroup;
  typical = new FormControl("", [Validators.required]);
  initialconductorlocation = new FormControl("", [Validators.required]);
  finalconductorlocation = new FormControl("", [Validators.required]);
  ocpd = new FormControl(false, []);
  maxcurrent = new FormControl("", [Validators.required, Validators.max(85)]);
  length = new FormControl("", [Validators.required]);
  parallelcircuits = new FormControl("", [Validators.required]);
  termtemprating = new FormControl("", [Validators.required]);
  electricaldisplayedColumns: string[] = ['id', 'typical', 'initialconductorlocation', 'finalconductorlocation', 'conductor', 'conduit', 'parallelcircuits', 'currentcarryingconductorsinconduit', 'conduitfillpercent', 'ocpd', 'egc', 'tempcorrfactor', 'conduitfillfactor', 'contcurrent', 'maxcurrent', 'baseamp', 'deratedamp', 'length', 'voltagedrop', 'edit'];
  ELECTRICAL_DATA: DesignerElectricalInput[] = [];
  electricaldataSource = new MatTableDataSource<DesignerElectricalInput>(this.ELECTRICAL_DATA);
  iselectricaleditmode: boolean = false;
  selectedelectricalid: number;

  //Ambient temp
  ambienttempFormGroup: FormGroup;
  recordlowtemp = new FormControl("", [Validators.required, Validators.maxLength(5)]);
  ambienthightemp = new FormControl("", [Validators.required, Validators.maxLength(5)]);
  conductortemprate = new FormControl("", [Validators.required, Validators.maxLength(5)]);
  snowload = new FormControl("", [Validators.required, Validators.maxLength(5)]);
  windspeed = new FormControl("", [Validators.required, Validators.maxLength(5)]);
  snowloadkey = new FormControl("seventen", [Validators.required]);
  //designorientations
  hidedesignorientationsform = true;
  designorientations: FormGroup;
  orientation = new FormControl("", [Validators.required]);
  quantity = new FormControl("", [Validators.required]);
  arraysize = new FormControl("", [Validators.required]);
  designorientationsdata: DesignOrientations[] = [];
  designorientationsColoums = ["tableid", "orientation", "quantity", "arraysize", "edit"];
  designorientationsSource = new MatTableDataSource<DesignOrientations>(this.designorientationsdata);
  isdesignorientationsEditMode = false
  isEditMode = false;
  selectedesignorientationsid: number

  siteplanlayoutfiles: File[] = [];
  siteplanfileuploaded = false;

  roofplanmoduleslayoutfiles: File[] = [];
  roofplanmodulesfileuploaded = false;

  stringlayoutandbomfiles: File[] = [];
  stringlayoutandbomfileuploaded = false;

  singlelinediagramfiles: File[] = [];
  singlelinediagramfileuploaded = false;

  solarmodulecataloguefiles: File[] = [];
  solarmodulecataloguefileuploaded = false;
  modulescataloguesexist = true;

  invertercataloguefiles: File[] = [];
  invertercataloguefileuploaded = false;
  inverterscataloguesexist = true;

  otherinverterscatalogueexist: any = []

  batterycataloguefiles: File[] = [];
  batterycataloguefileuploaded = false;
  batterycataloguesexist = true;

  rackingsystemdatacataloguefiles: File[] = [];
  rackingsystemdatacataloguefileuploaded = false;
  rackingsystemdatacataloguesexist = true;

  rackingsystemcutcataloguefiles: File[] = [];
  rackingsystemcutcataloguefileuploaded = false;
  rackingsystemcutcataloguesexist = true;

  attachmentdatasheetcataloguefiles: File[] = [];
  attachmentdatasheetcataloguefileuploaded = false;
  attachmentdatasheetcataloguesexist = true;

  attachmentcutsheetcataloguefiles: File[] = [];
  attachmentcutsheetcataloguefileuploaded = false;
  attachmentcutsheetcataloguesexist = true;

  otherdocumentscataloguefiles: File[] = [];
  otherdocumentscataloguefileuploaded = false;

  secondrackingsystemdatacataloguefiles: File[] = [];
  secondrackingsystemdatacataloguefileuploaded = false;
  secondrackingsystemdatacataloguesexist = true;

  secondrackingsystemcutcataloguefiles: File[] = [];
  secondrackingsystemcutcataloguefileuploaded = false;
  secondrackingsystemcutcataloguesexist = true;

  secondattachmentdatasheetcataloguefiles: File[] = [];
  secondattachmentdatasheetcataloguefileuploaded = false;
  secondattachmentdatasheetcataloguesexist = true;

  secondattachmentcutsheetcataloguefiles: File[] = [];
  secondattachmentcutsheetcataloguefileuploaded = false;
  secondattachmentcutsheetcataloguesexist = true;

  playcardhouseimagefiles: File[] = [];
  playcardhouseimagefileuploaded = false;

  location: Location;

  @ViewChild("housephoto") housephoto: ElementRef;
  @ViewChild("vicinitymap") vicinitymap: ElementRef;
  formBuilder: any;
  isInterConnectionbackfeed;

  uploadedhousephoto: any
  uploadedvicinity: any

  solarmodelsdetailsnull = false;
  invertermodeldetailsnull = false;
  ambientdetailsnull = false;


  initialfinalconductorlocation = ["String", "Junction Box", "DC Disconnect", "Inverter", "Load Centre", "Existing Sub panel", "Sub panel", "Non Fused AC Disconnect", "Fused AC Disconnect", "IQ Combiner Box",
    "Enphase Smart Switch", "Enphase Encharge 10", "Enphase Encharge 3", "Generator", "Automatic Transfer Switch", "Tesla Gateway", "Tesla Powerwall", "MSP", "Meter", "MA Smart Meter", "Re-growth Meter", "Production meter", "Grid", "Utility Disconnect"]
  arraysizeoptions = ["_1x1", "_1x2", "_1x3", "_1x4", "_1x5", "_1x6", "_1x7", "_1x8", "_1x9", "_1x10", "_1x11", "_2x2", "_2x3", "_2x4", "_2x5", "_2x6", "_2x7", "_2x8", "_2x9", "_2x10", "_2x11", "_3x2", "_3x3", "_3x4", "_3x5", "_3x6", "_3x7", "_3x8", "_3x9", "_3x10", "_3x11", "_4x2", "_4x3", "_4x4", "_4x5", "_4x6", "_4x7", "_4x8", "_4x9", "_4x10", "_4x11", "_5x2", "_5x3", "_5x4", "_5x5", "_5x6", "_5x7", "_5x8", "_5x9", "_5x10", "_5x11", "_6x2", "_6x3", "_6x4", "_6x5", "_6x6", "_6x7", "_6x8", "_6x9", "_6x10", "_6x11", "_7x2", "_7x3", "_7x4", "_7x5", "_7x6", "_7x7", "_7x8", "_7x9", "_7x10", "_7x11"]
  siteplanexists = false;
  roofplanandmodulesexists = false;
  stringlayoutandbomexists = false;
  singlelinediagramexists = false;
  housephotoexist = false;
  housephotourl = "";
  vicinitymapexist = false;
  vicinitymapurl = "";

  extrainvertermodeldata = [];
  housephotocorrect = new FormControl(true)
  vicinitymapcorrect = new FormControl(true)
  governingcodesavedvalue;
  governingcodeid: number = null;
  playcarddirectionimagefileuploaded: boolean;
  playcarddirectionimagefile: File[] = [];

  issiteplacardhouseimageexist = false;
  issiteplacarddirectionimageexist = false;

  @Output() designerdetailsaved = new EventEmitter<any>();
  constructor(
    public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private commonService: CommonService,
    private notifyService: NotificationService,
    private designService: DesignService,
    private _snackBar: MatSnackBar,
    private genericService: GenericService,
    private eventEmitterService: EventEmitterService,
    public dialogRef: MatDialog,
    private dataentryservice: DataEntryService
  ) {
    this.designerinfoFormGroup = new FormGroup({
      exposurecategory: this.exposurecategory,
      mainservicepanellocation: this.mainservicepanellocation,
      showbackfeedrule: this.showbackfeedrule,
      governingcode: this.governingcode,
      scalesiteplan: this.scalesiteplan,
      scaleroofplan: this.scaleroofplan,
      scalestringlayout: this.scalestringlayout,
      panelheight: this.panelheight,
      numberofattachments: this.numberofattachments,
      legend: this.legend,
      nec: this.nec
    });

    this.bominputFormGroup = new FormGroup({
      bomid: this.bomid,
      bomquantity: this.bomquantity,
      bomdescription: this.bomdescription,
    });

    this.pitchbominputFormGroup = new FormGroup({
      pitchbomid: this.pitchbomid,
      pitchbomquantity: this.pitchbomquantity,
      pitchbomdescription: this.pitchbomdescription
    });

    this.designerroofinputFormGroup = new FormGroup({
      roofinputid: this.roofinputid,
      modulescount: this.modulescount,
      tilt: this.tilt,
      azimuth: this.azimuth,
      roofarea: this.roofarea,
    });

    this.designerflatroofinputFormGroup = new FormGroup({
      flatroofinputid: this.flatroofinputid,
      flatmodulescount: this.flatmodulescount,
      flattilt: this.flattilt,
      flatazimuth: this.flatazimuth,
      flatroofarea: this.flatroofarea
    });


    this.designerelectricalinputFormGroup = new FormGroup({
      typical: this.typical,
      initialconductorlocation: this.initialconductorlocation,
      finalconductorlocation: this.finalconductorlocation,
      ocpd: this.ocpd,
      maxcurrent: this.maxcurrent,
      length: this.length,
      parallelcircuits: this.parallelcircuits,
      termtemprating: this.termtemprating
    });
    this.solarmoduleFormGroup = new FormGroup({
      numberofcells: this.numberofcells,
      isc: this.isc,
      voc: this.voc,
      ipmax: this.ipmax,
      vpmax: this.vpmax,
      tempcoefofvoc: this.tempcoefofvoc,
      fuserating: this.fuserating,
      length: this.modulelength,
      width: this.width,
      area: this.area,
      weight: this.weight
    });

    this.invertermodelFormGroup = new FormGroup({

    });

    this.ambienttempFormGroup = new FormGroup({
      recordlowtemp: this.recordlowtemp,
      ambienthightemp: this.ambienthightemp,
      conductortemprate: this.conductortemprate,
      snowload: this.snowload,
      windspeed: this.windspeed,
      snowloadkey: this.snowloadkey
    })
    this.designorientations = new FormGroup({
      orientation: this.orientation,
      quantity: this.quantity,
      arraysize: this.arraysize
    })
  }

  ngOnInit(): void {
    this.location = {
      latitude: -28.68352,
      longitude: -147.20785,
      zoom: 20
    }

  }

  ngAfterViewInit() {

  }
  updateform(record: Design) {
    this.generateddesign = record;
    this.location.latitude = this.generateddesign.latitude;
    this.location.longitude = this.generateddesign.longitude;
    this.address = this.generateddesign.address;
    if (this.generateddesign.rooftype == 'pitch') {
      this.tiltvalue = "Roof Tilt";
    }
    else if (this.generateddesign.rooftype == 'flat') {
      this.tiltvalue = "Array Tilt";
    }
    else if (this.generateddesign.rooftype == 'both') {
      this.tiltvalue = "Roof Tilt";
      this.rooftypeboth = true;
    }
    console.log(this.rooftypeboth)
    this.changeDetectorRef.detectChanges();
    if (this.generateddesign.designerdetails != null) {
      this.designerinfoFormGroup.disable();

      if (this.generateddesign.designerdetails.siteplan != null) {
        this.siteplanexists = true
      }
      if (this.generateddesign.designerdetails.roofplanandmodules != null) {
        this.roofplanandmodulesexists = true
      }
      if (this.generateddesign.designerdetails.stringlayoutandbom != null) {
        this.stringlayoutandbomexists = true
      }
      if (this.generateddesign.designerdetails.singlelinediagram != null) {
        this.singlelinediagramexists = true
      }
      if (this.generateddesign.designerdetails.locationimage != null) {
        this.housephotoexist = true
        this.housephotourl = this.generateddesign.designerdetails.locationimage.url
      }

      if (this.generateddesign.designerdetails.vicinitymap != null) {
        this.vicinitymapexist = true
        this.vicinitymapurl = this.generateddesign.designerdetails.vicinitymap.url
      }
      if (this.generateddesign.designerdetails.siteplacard != null) {
        this.issiteplacardhouseimageexist = true
      }
      if (this.generateddesign.designerdetails.siteplacarddirectionimage != null) {
        this.issiteplacarddirectionimageexist = true
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.DesignerDetailsSaved);
      }
      this.designerinfoFormGroup.patchValue({
        exposurecategory: this.generateddesign.designerdetails.exposurecategory,
        mainservicepanellocation: this.generateddesign.designerdetails.msplocation,
        showbackfeedrule: this.generateddesign.designerdetails.showbackfeedrule.toString(),
        scalesiteplan: this.generateddesign.designerdetails.scalesiteplan,
        scaleroofplan: this.generateddesign.designerdetails.scaleroofplan,
        scalestringlayout: this.generateddesign.designerdetails.scalestringlayout,
        panelheight: this.generateddesign.designerdetails.panelheightofroof,
        numberofattachments: this.generateddesign.designerdetails.totalnumberofattachments,
        legend: this.generateddesign.designerdetails.legend,
        nec: this.generateddesign.designerdetails.nec
      }
      )

      this.designService.getElectricaltableData(this.generateddesign.designerdetails.id).subscribe(
        response => {
          if (response.length > 0) {
            response.forEach(element => {
              this.ELECTRICAL_DATA.push(element)

            });
            this.ELECTRICAL_DATA.forEach(element => {
              element.isSaved = true
            })
            this.electricaldataSource.data = this.ELECTRICAL_DATA;
            this.changeDetectorRef.detectChanges();
          }
        }
      )
      this.designService.getRoofInput(this.generateddesign.designerdetails.id).subscribe(
        response => {
          if (response.length > 0) {
            if (this.generateddesign.rooftype == "both") {
              response.forEach(element => {
                if (element.rooftype == "pitch") {
                  this.ROOF_DATA.push(element);
                  this.dataSource.data = this.ROOF_DATA;
                }
                else if (element.rooftype == "flat") {
                  this.FLAT_ROOF_DATA.push(element);
                  this.flatroofdataSource.data = this.FLAT_ROOF_DATA;
                }
                this.FLAT_ROOF_DATA.forEach(element => {
                  element.issaved = true;
                })
              });
            }
            else {
              response.forEach(element => {
                this.ROOF_DATA.push(element)
              });
              this.dataSource.data = this.ROOF_DATA;
            }
            this.ROOF_DATA.forEach(element => {
              element.issaved = true;
            })
            this.changeDetectorRef.detectChanges();
          }
        }
      )

      this.designService.getDesignOrientations(this.generateddesign.designerdetails.id).subscribe(
        response => {
          if (response.length > 0) {
            response.forEach(element => {
              this.designorientationsdata.push(element)
            });
            this.designorientationsdata.forEach(element => {
              element.issaved = true
            })
            this.designorientationsSource.data = this.designorientationsdata;
            this.changeDetectorRef.detectChanges();
          }
        }
      )
    }


    //check solar model data
    this.commonService.getSingleModuleModelsData(this.generateddesign.solarmodel.id).subscribe(
      response => {
        console.log(response);
        if (response.modellength == null || response.area == null || response.modelwidth == null) {
          this.solarmodelsdetailsnull = true;
        }
        this.solarmoduleFormGroup.patchValue({
          numberofcells: response?.numberofcells,
          isc: response?.isc,
          voc: response?.voc,
          ipmax: response?.ipmax,
          vpmax: response?.vpmax,
          tempcoefofvoc: response?.tempcoefofvoc,
          fuserating: response?.fuserating,
          length: response?.modellength,
          width: response?.modelwidth,
          area: response?.area,
          weight: response?.weight
        })
        // this.solarmoduleFormGroup.disable();
      }
    )
    //check inverter model data
    // this.commonService.getSingleInverterModelsData(this.generateddesign.invertermodel.id).subscribe(
    //   response => {
    //     console.log(response);
    //     if (response.phase == null || response.ratedacvoltage == null || response.rateoutputpower == null || response.numberofmpptchannels == null || response.currentpermppta == null || response.maximuminputvoltage == null || response.nominalinputvoltage == null || response.startupvoltage == null || response.maximuminputcurrent == null || response.maximumoutputcurrent == null || response.cecefficiency == null || response.maximumocpdrating == null) {
    //       this.invertermodeldetailsnull = true;
    //       this.invertermodelFormGroup.patchValue({
    //         name: response.name,
    //         phase: response?.phase,
    //         ratedacvoltage: response?.ratedacvoltage,
    //         rateoutputpower: response?.rateoutputpower,
    //         numberofmpptchannels: response?.numberofmpptchannels,
    //         currentpermppta: response?.currentpermppta,
    //         maximuminputvoltage: response?.maximuminputvoltage,
    //         nominalinputvoltage: response?.nominalinputvoltage,
    //         startupvoltage: response?.startupvoltage,
    //         maximuminputcurrent: response?.maximuminputcurrent,
    //         maximumoutputcurrent: response?.maximumoutputcurrent,
    //         cecefficiency: response?.cecefficiency,
    //         datasheetavailable: response?.datasheetavailable,
    //         maximumocpdrating: response?.maximumocpdrating
    //       });
    //     }

    //   }
    // )
    //check ambienttemp data
    this.commonService.getAmbienttemp(this.generateddesign.state, this.generateddesign.city).subscribe(
      response => {
        if (response.length == 0) {
          this.ambientdetailsnull = true;
          this.changeDetectorRef.detectChanges();
        }
      })
    //Check catalogues existence
    this.commonService.checkCataloguesExistence("modulescatalogues/" + this.generateddesign.solarmodel.name.toLowerCase() + "/").subscribe(
      response => {
        console.log(response);
        this.modulescataloguesexist = response["existence"];
        this.changeDetectorRef.detectChanges();
      }
    );

    // this.commonService.checkCataloguesExistence("inverterscatalogues/" + this.generateddesign.invertermodel.name.toLowerCase() + "/").subscribe(
    //   response => {
    //     console.log(response);
    //     this.inverterscataloguesexist = response["existence"];
    //     this.changeDetectorRef.detectChanges();
    //   }
    // );
    if (this.generateddesign.designinverters != null) {
      this.generateddesign.designinverters.forEach(element => {
        this.commonService.checkCataloguesExistence("inverterscatalogues/" + element.invertermodel.name.toLowerCase() + "/").subscribe(
          response => {
            if (!response["existence"]) {
              this.otherinverterscatalogueexist.push({ invertermodelname: element.invertermodel.name.toLowerCase(), cataloguefile: [], fileuploaded: false, invertermodelid: element.invertermodel.id })
            }
            this.changeDetectorRef.detectChanges();
          }
        );
        this.commonService.getSingleInverterModelsData(element.invertermodel.id).subscribe(
          response => {
            if (response.phase == null || response.ratedacvoltage == null || response.rateoutputpower == null || response.numberofmpptchannels == null || response.currentpermppta == null || response.maximuminputvoltage == null || response.nominalinputvoltage == null || response.startupvoltage == null || response.maximuminputcurrent == null || response.maximumoutputcurrent == null || response.cecefficiency == null || response.maximumocpdrating == null) {
              this.generateExtraInverterModelForm(response);
            }
          })
      });
    }

    if (this.generateddesign.jobtype != 'pv') {
      this.commonService.checkCataloguesExistence("batterycatalogues/" + this.generateddesign.electricalinformation.batterymake.name.toLowerCase() + "/").subscribe(
        response => {
          console.log(response);
          this.batterycataloguesexist = response["existence"];
          this.changeDetectorRef.detectChanges();
        }
      );
    }

    this.commonService.checkCataloguesExistence("rackingmodelcatalogues/" + this.generateddesign.structuralinformations[0].rackingmodel.name.toLowerCase() + "/datasheet/").subscribe(
      response => {
        console.log(response);
        this.rackingsystemdatacataloguesexist = response["existence"];
        this.changeDetectorRef.detectChanges();
      }
    );

    this.commonService.checkCataloguesExistence("rackingmodelcatalogues/" + this.generateddesign.structuralinformations[0].rackingmodel.name.toLowerCase() + "/cutsheet/").subscribe(
      response => {
        console.log(response);
        this.rackingsystemcutcataloguesexist = response["existence"];
        this.changeDetectorRef.detectChanges();
      }
    );

    this.commonService.checkCataloguesExistence("attachmentcatalogues/" + this.generateddesign.structuralinformations[0].attachmenttype.name.toLowerCase() + "/datasheet/").subscribe(
      response => {
        console.log(response);
        this.attachmentdatasheetcataloguesexist = response["existence"];
        this.changeDetectorRef.detectChanges();
      }
    );

    this.commonService.checkCataloguesExistence("attachmentcatalogues/" + this.generateddesign.structuralinformations[0].attachmenttype.name.toLowerCase() + "/cutsheet/").subscribe(
      response => {
        console.log(response);
        this.attachmentcutsheetcataloguesexist = response["existence"];
        this.changeDetectorRef.detectChanges();
      }
    );

    if (this.generateddesign.rooftype == 'both') {
      this.commonService.checkCataloguesExistence("rackingmodelcatalogues/" + this.generateddesign.structuralinformations[1].rackingmodel.name.toLowerCase() + "/datasheet/").subscribe(
        response => {
          console.log(response);
          this.secondrackingsystemdatacataloguesexist = response["existence"];
          this.changeDetectorRef.detectChanges();
        }
      );

      this.commonService.checkCataloguesExistence("rackingmodelcatalogues/" + this.generateddesign.structuralinformations[1].rackingmodel.name.toLowerCase() + "/cutsheet/").subscribe(
        response => {
          console.log(response);
          this.secondrackingsystemcutcataloguesexist = response["existence"];
          this.changeDetectorRef.detectChanges();
        }
      );

      this.commonService.checkCataloguesExistence("attachmentcatalogues/" + this.generateddesign.structuralinformations[1].attachmenttype.name.toLowerCase() + "/datasheet/").subscribe(
        response => {
          console.log(response);
          this.secondattachmentdatasheetcataloguesexist = response["existence"];
          this.changeDetectorRef.detectChanges();
        }
      );

      this.commonService.checkCataloguesExistence("attachmentcatalogues/" + this.generateddesign.structuralinformations[1].attachmenttype.name.toLowerCase() + "/cutsheet/").subscribe(
        response => {
          console.log(response);
          this.secondattachmentcutsheetcataloguesexist = response["existence"];
          this.changeDetectorRef.detectChanges();
        }
      );
    }


    //Code to check attachment materials exist or not
    this.commonService.getAttachmentMaterials(this.generateddesign.structuralinformations[0].attachmenttype.id).subscribe(
      response => {
        console.log(response);
        if (response.length > 0) {
          response.forEach(element => {
            this.ATTACHMENT_DATA.push({ id: (this.bomid.value ? this.bomid.value : this.ATTACHMENT_DATA.length + 1), quantity: 1, description: element.description, issaved: true });
          });
          this.bomdataSource.data = this.ATTACHMENT_DATA;
        }
      }
    );

    this.changeDetectorRef.detectChanges();
    this.getGoverningcode();
  }

  onEditClick() {
    this.isEditMode = true;
    this.designerinfoFormGroup.enable();
    this.changeDetectorRef.detectChanges();
  }
  getInterconnectionValue(data) {
    if (data == 'backfed') {
      this.showbackfeedrule.setValue('true');
    }
    this.changeDetectorRef.detectChanges();
  }
  getGoverningcode(): void {
    this.commonService
      .getGoverningcodes(this.generateddesign.city, this.generateddesign.state)
      .subscribe((response) => {
        this.governingcodeid = response[0].id;
        this.governingcode.setValue(response[0].codes);
        this.governingcodesavedvalue = response[0].codes
      });
  }

  getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
  }

  adddatatobominput(event): void {
    event.preventDefault();
    console.log(this.bomid.value);
    if (this.bominputFormGroup.valid) {
      if (this.bomid.value) {
        const itemIndex = this.ATTACHMENT_DATA.findIndex(
          (item) => item.id == this.bomid.value
        );
        const bomitem = {
          id: this.bomid.value,
          quantity: parseInt(this.bomquantity.value),
          description: this.bomdescription.value,
          issaved: this.ATTACHMENT_DATA[itemIndex].issaved,
        };
        this.ATTACHMENT_DATA[itemIndex] = bomitem;

        //Edit in attachment materials array
        const newitemIndex = this.newattachmentmaterials.findIndex(
          (item) => item.id == this.bomid.value
        );
        if (newitemIndex != -1) {
          const updateditem = {
            id: this.bomid.value,
            description: this.bomdescription.value,
            attachmenttype:
              this.generateddesign.structuralinformations[0].attachmenttype.id,
          };
          this.newattachmentmaterials[newitemIndex] = updateditem;
        }
      } else {
        this.ATTACHMENT_DATA.push({
          id: this.bomid.value
            ? this.bomid.value
            : this.ATTACHMENT_DATA.length + 1,
          quantity: parseInt(this.bomquantity.value),
          description: this.bomdescription.value,
          issaved: false,
        });
        this.newattachmentmaterials.push({
          id: this.bomid.value
            ? this.bomid.value
            : this.newattachmentmaterials.length + 1,
          description: this.bomdescription.value,
          attachmenttype:
            this.generateddesign.structuralinformations[0].attachmenttype.id,
        });
      }
      this.hidebominputform = true;
      this.bomdataSource.data = this.ATTACHMENT_DATA;
      //Empty field rows
      this.bominputFormGroup.reset();
      this.bomdescription.enable();
      this.changeDetectorRef.detectChanges();
    }
  }

  adddatatopitchbominput(event) {
    event.preventDefault();
    if (this.pitchbominputFormGroup.valid) {
      if (this.pitchbomid.value) {
        let itemIndex = this.PITCH_ROOF_ATTACHMENT_DATA.findIndex(item => item.id == this.pitchbomid.value);
        let bomitem = { id: this.pitchbomid.value, quantity: parseInt(this.pitchbomquantity.value), description: this.pitchbomdescription.value, issaved: this.PITCH_ROOF_ATTACHMENT_DATA[itemIndex].issaved };
        this.PITCH_ROOF_ATTACHMENT_DATA[itemIndex] = bomitem;

        //Edit in attachment materials array
        let newitemIndex = this.pitchnewattachmentmaterials.findIndex(item => item.id == this.pitchbomid.value);
        if (newitemIndex != -1) {
          let updateditem = { id: this.pitchbomid.value, description: this.pitchbomdescription.value, attachmenttype: this.generateddesign.structuralinformations[1].attachmenttype.id };
          this.pitchnewattachmentmaterials[newitemIndex] = updateditem;
        }
      } else {
        this.PITCH_ROOF_ATTACHMENT_DATA.push({ id: (this.pitchbomid.value ? this.pitchbomid.value : this.PITCH_ROOF_ATTACHMENT_DATA.length + 1), quantity: parseInt(this.pitchbomquantity.value), description: this.pitchbomdescription.value, issaved: false });
        this.pitchnewattachmentmaterials.push({ id: (this.pitchbomid.value ? this.pitchbomid.value : this.pitchnewattachmentmaterials.length + 1), description: this.pitchbomdescription.value, attachmenttype: this.generateddesign.structuralinformations[1].attachmenttype.id });
      }
      this.hidepitchbominputform = true;
      this.pitchbomdataSource.data = this.PITCH_ROOF_ATTACHMENT_DATA;
      //Empty field rows
      this.pitchbominputFormGroup.reset();
      this.pitchbomdescription.enable();
      this.changeDetectorRef.detectChanges();
    }
  }

  adddatatoroofinput(event) {
    event.stopPropagation();
    if (this.designerroofinputFormGroup.valid) {
      if (this.roofinputid.value) {
        let roofitem = { id: this.roofinputid.value, numberofmodules: parseInt(this.modulescount.value), tilt: parseInt(this.tilt.value), azimuth: parseInt(this.azimuth.value), roofarea: parseFloat(this.roofarea.value), issaved: false }

        let itemIndex = this.ROOF_DATA.findIndex(item => item.id == this.roofinputid.value);
        this.ROOF_DATA[itemIndex] = roofitem;
      } else {
        this.ROOF_DATA.push({ id: (this.roofinputid.value ? this.roofinputid.value : this.ROOF_DATA.length + 1), numberofmodules: parseInt(this.modulescount.value), tilt: parseInt(this.tilt.value), azimuth: parseInt(this.azimuth.value), roofarea: parseFloat(this.roofarea.value), issaved: false })
      }
      this.hideroofinputform = true;
      this.dataSource.data = this.ROOF_DATA;
      this.changeDetectorRef.detectChanges();
      //Empty field rows
      this.designerroofinputFormGroup.reset();
    }
  }

  adddatatoflatroofinput(event) {
    event.stopPropagation();
    if (this.designerflatroofinputFormGroup.valid) {
      if (this.flatroofinputid.value) {
        let roofitem = { id: this.flatroofinputid.value, numberofmodules: parseInt(this.flatmodulescount.value), tilt: parseInt(this.flattilt.value), azimuth: parseInt(this.flatazimuth.value), roofarea: parseFloat(this.flatroofarea.value), issaved: false }

        let itemIndex = this.FLAT_ROOF_DATA.findIndex(item => item.id == this.flatroofinputid.value);
        this.FLAT_ROOF_DATA[itemIndex] = roofitem;

      } else {
        this.FLAT_ROOF_DATA.push({ id: (this.flatroofinputid.value ? this.flatroofinputid.value : this.FLAT_ROOF_DATA.length + 1), numberofmodules: parseInt(this.flatmodulescount.value), tilt: parseInt(this.flattilt.value), azimuth: parseInt(this.flatazimuth.value), roofarea: parseFloat(this.flatroofarea.value), issaved: false })
      }
      this.hideflatroofinputform = true;
      this.flatroofdataSource.data = this.FLAT_ROOF_DATA;
      this.changeDetectorRef.detectChanges();
      //Empty field rows
      this.designerflatroofinputFormGroup.reset();
    }
  }

  adddatatoelectricalinput(event) {
    console.log()
    event.stopPropagation();
    var ocpds;
    var ocpdvalue
    var conductora;
    var baseamp;
    var conductorb;
    var egcb;
    var egca;
    var tempcorefactora;
    var tempcorefactorb;

    let invertertype;
    let multipliers;
    let resistance;
    let voltagedrop;
    let conduittype;
    let conduit;
    let conduitfillpercent;
    if (this.generateddesign.invertermake.name == "ENPHASE") {
      invertertype = "enphase"
    }
    else {
      invertertype = "nonenphase"
    }
    if (this.designerelectricalinputFormGroup.valid) {
      if (this.initialconductorlocation.value.toLowerCase() == 'string' || this.finalconductorlocation.value.toLowerCase() == 'string') {
        conductorb = "PV WIRE";
      }
      else {
        conductorb = "THWN 2";
      }

      if (conductorb == 'PV WIRE') {
        egcb = "BARE COPPER";
      }
      else {
        egcb = "THWN-2,COPPER";
      }
      if (this.initialconductorlocation.value.toLowerCase() == 'string' || this.finalconductorlocation.value.toLowerCase() == 'string' && this.generateddesign.electricalinformation.interconnection == 'loadsidetap') {
        egca = "8AWG";
      }
      else {
        this.commonService.getegcaData(this.maxcurrent.value).subscribe(response => {
          console.log(response);
          egca = response[0].size;

        })
      }

      let currentcarryingconductorsinconduit;
      let conduitfillfactor;

      //get Conductor col 1 data and base amp

      this.commonService.getconductorcol1ata(this.maxcurrent.value, this.termtemprating.value).subscribe(response => {
        baseamp = response[0].maxcurrent + "A";
        if (parseInt(this.maxcurrent.value) < 40) {
          conductora = "10 AWG";
        }
        else {
          conductora = response[0].size + " AWG";
        }
        //Code to get baseamp value
        let invertermodelphase;
        if (this.invertermodeldetailsnull) {
          invertermodelphase = this.phase.value;
        }
        else {
          invertermodelphase = this.generateddesign.invertermodel.phase;
        }
        let initialconductor = this.initialconductorlocation.value.split(" ").join("").toLowerCase();
        if (initialconductor === 'existingsubpanel' || initialconductor === 'subpanel' || initialconductor === 'nonfusedacdisconnect' || initialconductor === 'fusedacdisconnect' || initialconductor === 'iqcombinerbox' || initialconductor === 'enphasesmartswitch' || initialconductor === 'enphaseencharge10' || initialconductor === 'enphaseencharge3' || initialconductor === 'generator' || initialconductor === 'automatictransferswitch' || initialconductor === 'teslagateway' || initialconductor === 'teslapowerwall' || initialconductor === 'msp' || initialconductor === 'meter' || initialconductor === 'masmartmeter' || initialconductor === 're-growthmeter' || initialconductor === 'productionmeter' || initialconductor === 'grid' || initialconductor === 'utilitydisconnect') {
          initialconductor = "loadcenter";
        }
        else if (initialconductor === "dcdisconnect") {
          initialconductor = "junctionbox";
        }
        this.commonService.getMultiplier(invertermodelphase, invertertype, initialconductor).subscribe(response => {
          multipliers = response[0].multiplier;
          let wiresize = conductora.substr(0, conductora.indexOf(' '));
          this.commonService.getResistance(wiresize).subscribe(response => {
            resistance = response[0].resistance;
            voltagedrop = (this.maxcurrent.value * this.length.value * multipliers * resistance) / this.parallelcircuits.value

            this.commonService.getnumberofcurrentcarryingconductors(invertertype, initialconductor).subscribe(response => {
              currentcarryingconductorsinconduit = response[0].numberofconductors * this.parallelcircuits.value
              conduittype = response[0].conduittype;
              let numberofconductors = this.parallelcircuits.value * currentcarryingconductorsinconduit
              this.commonService.getconduitfillfactor(numberofconductors).subscribe(response => {
                conduitfillfactor = response[0].fillfactor
                this.commonService.getAmbienttemp(this.generateddesign.state, this.generateddesign.city).subscribe(
                  response => {
                    if (response.length == 0) {
                      if (this.initialconductorlocation.value.toLowerCase() == 'string') {
                        tempcorefactorb = this.ambienthightemp.value + 32;
                      }
                      else {
                        tempcorefactorb = this.ambienthightemp.value;
                      }
                    }
                    else {
                      if (this.initialconductorlocation.value.toLowerCase() == 'string') {
                        tempcorefactorb = response[0].ambienthightemp + 32;
                      }
                      else {
                        tempcorefactorb = response[0].ambienthightemp;
                      }
                    }
                    if (tempcorefactorb < 10) {
                      tempcorefactora = 1.15
                    }
                    else if (tempcorefactorb < 15) {
                      tempcorefactora = 1.12
                    }
                    else if (tempcorefactorb < 20) {
                      tempcorefactora = 1.08
                    }
                    else if (tempcorefactorb < 25) {
                      tempcorefactora = 1.04
                    }
                    else if (tempcorefactorb < 30) {
                      tempcorefactora = 1
                    }
                    else if (tempcorefactorb < 35) {
                      tempcorefactora = 0.96
                    }
                    else if (tempcorefactorb < 40) {
                      tempcorefactora = 0.91
                    }
                    else if (tempcorefactorb < 45) {
                      tempcorefactora = 0.87
                    }
                    else if (tempcorefactorb < 50) {
                      tempcorefactora = 0.82
                    }
                    else if (tempcorefactorb < 55) {
                      tempcorefactora = 0.76
                    }
                    else if (tempcorefactorb < 60) {
                      tempcorefactora = 0.71
                    }
                    else if (tempcorefactorb < 65) {
                      tempcorefactora = 0.65
                    }
                    else if (tempcorefactorb < 70) {
                      tempcorefactora = 0.58
                    }

                    let deratedamp
                    deratedamp = parseInt(baseamp) * conduitfillfactor * tempcorefactora;
                    if (this.ocpd.value == true) {
                      ocpds = true
                      this.commonService.getOCPDSData(this.maxcurrent.value).subscribe(response => {
                        ocpdvalue = response[0].ampvalue
                      })
                    }
                    else {
                      ocpds = false
                      ocpdvalue = "N/A"
                    }

                    let wiresize2
                    let conduitsize
                    let i = 0
                    // let wiretype = conductorb.replace(/\s/g, "").toLowerCase();
                    let wiretype = conductorb.split(" ").join("").toLowerCase();
                    this.commonService.getWireSize(wiretype, wiresize).subscribe(response => {
                      wiresize2 = response[0].area
                      this.commonService.getConduitSize(this.generateddesign.electricalinformation.typeofconduit).subscribe(response => {
                        if (invertertype == "enphase" && this.initialconductorlocation.value.toLowerCase() == "string") {
                          conduit = "Open Air";
                          conduitfillpercent = 0;
                        }
                        else {
                          conduitsize = response;
                          for (let i = 0; i <= response.length; i++) {
                            conduitfillpercent = ((numberofconductors * wiresize2) / conduitsize[i].area) * 100;
                            conduit = "Min " + conduitsize[i].conduitsizename
                            if (conduitfillpercent < 40) {
                              break;
                            }
                          }
                        }
                        if (this.iselectricaleditmode) {
                          let itemIndex = this.ELECTRICAL_DATA.findIndex(item => item.tableid == this.selectedelectricalid);
                          let electricalitem = { tableid: this.selectedelectricalid, typical: parseInt(this.typical.value), initialconductorlocation: this.initialconductorlocation.value.toUpperCase(), finalconductorlocation: this.finalconductorlocation.value.toUpperCase(), ocpd: ocpds, maxcurrent: parseInt(this.maxcurrent.value), inputlength: parseInt(this.length.value), parallelcircuits: parseInt(this.parallelcircuits.value), termtemprating: parseInt(this.termtemprating.value), conductor1: conductora, baseamp: parseInt(baseamp), egc1: egca, egc2: egcb, conductor2: conductorb, voltagedrop: voltagedrop, currentcarryingconductorinconduit: currentcarryingconductorsinconduit, conduitfillfactor: conduitfillfactor, tempcorrfactor1: tempcorefactora, tempcorrfactor2: tempcorefactorb, deratedamp: deratedamp, conduit: conduit, conduitfillpercent: conduitfillpercent, conductor3: "COPPER", contcurrent: this.maxcurrent.value / 1.25, isSaved: false };
                          this.ELECTRICAL_DATA[itemIndex] = electricalitem;

                        }
                        else {
                          this.ELECTRICAL_DATA.push({ tableid: this.ELECTRICAL_DATA.length + 1, typical: parseInt(this.typical.value), initialconductorlocation: this.initialconductorlocation.value.toUpperCase(), finalconductorlocation: this.finalconductorlocation.value.toUpperCase(), ocpd: ocpds, maxcurrent: parseInt(this.maxcurrent.value), inputlength: parseInt(this.length.value), parallelcircuits: parseInt(this.parallelcircuits.value), termtemprating: parseInt(this.termtemprating.value), conductor1: conductora, baseamp: parseInt(baseamp), egc1: egca, egc2: egcb, conductor2: conductorb, voltagedrop: voltagedrop, currentcarryingconductorinconduit: currentcarryingconductorsinconduit, conduitfillfactor: conduitfillfactor, tempcorrfactor1: tempcorefactora, tempcorrfactor2: tempcorefactorb, deratedamp: deratedamp, conduit: conduit, conduitfillpercent: conduitfillpercent, conductor3: "COPPER", contcurrent: this.maxcurrent.value / 1.25, ocpdvalue: ocpdvalue, isSaved: false });
                        }
                        console.log(this.ELECTRICAL_DATA)
                        this.electricaldataSource.data = this.ELECTRICAL_DATA;
                        this.hideelectricalinputform = true
                        this.changeDetectorRef.detectChanges();
                        this.designerelectricalinputFormGroup.reset();
                      })
                    })
                  }
                )
              })
            })
          })
        });
      });
    }
  }

  adddesignorientations(event) {
    if (this.designorientations.valid) {
      let row = this.arraysize.value.slice(1, 2);
      let col = this.arraysize.value.slice(3);
      if (this.isdesignorientationsEditMode) {
        let itemIndex = this.designorientationsdata.findIndex(item => item.tableid == this.selectedesignorientationsid);
        let designorientations = { tableid: itemIndex, arraysize: this.arraysize.value, row: row, col: col, quantity: this.quantity.value, orientation: this.orientation.value, issaved: false }
        this.designorientationsdata[itemIndex] = designorientations;
      }
      else {
        this.designorientationsdata.push({ tableid: this.designorientationsdata.length + 1, arraysize: this.arraysize.value, row: row, col: col, quantity: this.quantity.value, orientation: this.orientation.value, issaved: false })
      }
      this.designorientationsSource.data = this.designorientationsdata;
      this.changeDetectorRef.detectChanges();
    }
  }
  onSitePlanFileSelect(event) {
    if (!this.siteplanfileuploaded) {
      this.siteplanfileuploaded = true;
      event.addedFiles[0].isImage = false;
      if (event.addedFiles[0].type.includes("image")) {
        event.addedFiles[0].isImage = true;
      }
      this.siteplanlayoutfiles.push(...event.addedFiles);
      setTimeout(() => {
        this.changeDetectorRef.detectChanges()
      }, 300)
    }
  }

  onSitePlanFileRemove(event): void {
    this.siteplanlayoutfiles.splice(this.siteplanlayoutfiles.indexOf(event), 1);
    if (this.siteplanlayoutfiles.length == 0) {
      this.siteplanfileuploaded = false;
    }
  }

  onRoofPlanModulesFileSelect(event): void {
    if (!this.roofplanmodulesfileuploaded) {
      this.roofplanmodulesfileuploaded = true;
      event.addedFiles[0].isImage = false;
      if (event.addedFiles[0].type.includes("image")) {
        event.addedFiles[0].isImage = true;
      }
      this.roofplanmoduleslayoutfiles.push(...event.addedFiles);
      setTimeout(() => {
        this.changeDetectorRef.detectChanges()
      }, 300)
    }
  }

  onRoofPlanModulesFileRemove(event): void {
    this.roofplanmoduleslayoutfiles.splice(
      this.roofplanmoduleslayoutfiles.indexOf(event),
      1
    );
    if (this.roofplanmoduleslayoutfiles.length == 0) {
      this.roofplanmodulesfileuploaded = false;
    }
  }

  onStringLayoutandBomFileSelect(event): void {
    if (!this.stringlayoutandbomfileuploaded) {
      this.stringlayoutandbomfileuploaded = true;
      event.addedFiles[0].isImage = false;
      if (event.addedFiles[0].type.includes("image")) {
        event.addedFiles[0].isImage = true;
      }
      this.stringlayoutandbomfiles.push(...event.addedFiles);
      setTimeout(() => {
        this.changeDetectorRef.detectChanges()
      }, 300)
    }
  }

  onStringLayoutandBomFileRemove(event): void {
    this.stringlayoutandbomfiles.splice(
      this.stringlayoutandbomfiles.indexOf(event),
      1
    );
    if (this.stringlayoutandbomfiles.length == 0) {
      this.stringlayoutandbomfileuploaded = false;
    }
  }

  onSingleLineDiagramSelect(event): void {
    if (!this.singlelinediagramfileuploaded) {
      this.singlelinediagramfileuploaded = true;
      event.addedFiles[0].isImage = false;
      if (event.addedFiles[0].type.includes("image")) {
        event.addedFiles[0].isImage = true;
      }
      this.singlelinediagramfiles.push(...event.addedFiles);
      setTimeout(() => {
        this.changeDetectorRef.detectChanges()
      }, 300)
    }
  }

  onSingleLineDiagramRemove(event): void {
    this.singlelinediagramfiles.splice(
      this.singlelinediagramfiles.indexOf(event),
      1
    );
    if (this.singlelinediagramfiles.length == 0) {
      this.singlelinediagramfileuploaded = false;
    }
  }

  onSolarModuleSelect(event): void {
    this.solarmodulecataloguefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.solarmodulecataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onSolarModuleRemove(event): void {
    this.solarmodulecataloguefiles.splice(
      this.solarmodulecataloguefiles.indexOf(event),
      1
    );
    if (this.solarmodulecataloguefiles.length == 0) {
      this.solarmodulecataloguefileuploaded = false;
    }
  }

  onInverterSelect(event): void {
    this.invertercataloguefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.invertercataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onInverterRemove(event): void {
    this.invertercataloguefiles.splice(
      this.invertercataloguefiles.indexOf(event),
      1
    );
    if (this.invertercataloguefiles.length == 0) {
      this.invertercataloguefileuploaded = false;
    }
  }

  onBatterySelect(event): void {
    this.batterycataloguefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.batterycataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onBatteryRemove(event): void {
    this.batterycataloguefiles.splice(
      this.batterycataloguefiles.indexOf(event),
      1
    );
    if (this.batterycataloguefiles.length == 0) {
      this.batterycataloguefileuploaded = false;
    }
  }

  onRackingSystemDataSelect(event): void {
    this.rackingsystemdatacataloguefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.rackingsystemdatacataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onSecondRackingSystemDataSelect(event) {
    this.secondrackingsystemdatacataloguefileuploaded = true;
    event.addedFiles.forEach(element => {
      element.isImage = false;
      if (element.type.includes('image')) {
        element.isImage = true;
      }
    });
    this.secondrackingsystemdatacataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onRackingSystemDataRemove(event): void {
    this.rackingsystemdatacataloguefiles.splice(
      this.rackingsystemdatacataloguefiles.indexOf(event),
      1
    );
    if (this.rackingsystemdatacataloguefiles.length == 0) {
      this.rackingsystemdatacataloguefileuploaded = false;
    }
  }

  onSecondRackingSystemDataRemove(event) {
    this.secondrackingsystemdatacataloguefiles.splice(this.secondrackingsystemdatacataloguefiles.indexOf(event), 1);
    if (this.secondrackingsystemdatacataloguefiles.length == 0) {
      this.secondrackingsystemdatacataloguefileuploaded = false;
    }
  }

  onRackingSystemCutSelect(event) {
    this.rackingsystemcutcataloguefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.rackingsystemcutcataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onRackingSystemCutRemove(event): void {
    this.rackingsystemcutcataloguefiles.splice(
      this.rackingsystemcutcataloguefiles.indexOf(event),
      1
    );
    if (this.rackingsystemcutcataloguefiles.length == 0) {
      this.rackingsystemcutcataloguefileuploaded = false;
    }
  }

  onSecondRackingSystemCutSelect(event) {
    this.secondrackingsystemcutcataloguefileuploaded = true;
    event.addedFiles.forEach(element => {
      element.isImage = false;
      if (element.type.includes('image')) {
        element.isImage = true;
      }
    });
    this.secondrackingsystemcutcataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onSecondRackingSystemCutRemove(event) {
    this.secondrackingsystemcutcataloguefiles.splice(this.secondrackingsystemcutcataloguefiles.indexOf(event), 1);
    if (this.secondrackingsystemcutcataloguefiles.length == 0) {
      this.secondrackingsystemcutcataloguefileuploaded = false;
    }
  }

  onAttachmentdatasheetSelect(event) {
    this.attachmentdatasheetcataloguefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.attachmentdatasheetcataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onAttachmentdatasheetRemove(event): void {
    this.attachmentdatasheetcataloguefiles.splice(
      this.attachmentdatasheetcataloguefiles.indexOf(event),
      1
    );
    if (this.attachmentdatasheetcataloguefiles.length == 0) {
      this.attachmentdatasheetcataloguefileuploaded = false;
    }
  }

  onAttachmentcutsheetSelect(event): void {
    this.attachmentcutsheetcataloguefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.attachmentcutsheetcataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onAttachmentcutsheetRemove(event): void {
    this.attachmentcutsheetcataloguefiles.splice(
      this.attachmentcutsheetcataloguefiles.indexOf(event),
      1
    );
    if (this.attachmentdatasheetcataloguefiles.length == 0) {
      this.attachmentcutsheetcataloguefileuploaded = false;
    }
  }

  onSecondAttachmentdatasheetSelect(event) {
    this.secondattachmentdatasheetcataloguefileuploaded = true;
    event.addedFiles.forEach(element => {
      element.isImage = false;
      if (element.type.includes('image')) {
        element.isImage = true;
      }
    });
    this.secondattachmentdatasheetcataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onSecondAttachmentdatasheetRemove(event) {
    this.secondattachmentdatasheetcataloguefiles.splice(this.secondattachmentdatasheetcataloguefiles.indexOf(event), 1);
    if (this.secondattachmentdatasheetcataloguefiles.length == 0) {
      this.secondattachmentdatasheetcataloguefileuploaded = false;
    }
  }

  onSecondAttachmentcutsheetSelect(event) {
    this.secondattachmentcutsheetcataloguefileuploaded = true;
    event.addedFiles.forEach(element => {
      element.isImage = false;
      if (element.type.includes('image')) {
        element.isImage = true;
      }
    });
    this.secondattachmentcutsheetcataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onSecondAttachmentcutsheetRemove(event) {
    this.secondattachmentcutsheetcataloguefiles.splice(this.secondattachmentcutsheetcataloguefiles.indexOf(event), 1);
    if (this.secondattachmentdatasheetcataloguefiles.length == 0) {
      this.secondattachmentcutsheetcataloguefileuploaded = false;
    }
  }

  onHouseImageSelect(event) {
    this.playcardhouseimagefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.playcardhouseimagefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onHouseImageRemove(event): void {
    this.playcardhouseimagefiles.splice(
      this.playcardhouseimagefiles.indexOf(event),
      1
    );
    if (this.playcardhouseimagefiles.length == 0) {
      this.playcardhouseimagefileuploaded = false;
    }
  }
  onOtherSelect(event) {
    this.otherdocumentscataloguefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.otherdocumentscataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onOtherRemove(event): void {
    this.otherdocumentscataloguefiles.splice(
      this.otherdocumentscataloguefiles.indexOf(event),
      1
    );
    if (this.otherdocumentscataloguefiles.length == 0) {
      this.otherdocumentscataloguefileuploaded = false;
    }
  }

  onSaveDesignerDetails() {
    if (this.generateddesign.designerdetails == null) {
      if (this.designerinfoFormGroup.valid) {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
        this.designService
          .addPermitDesignerDetails(
            this.designerinfoFormGroup.get("exposurecategory").value,
            JSON.parse(this.designerinfoFormGroup.get("showbackfeedrule").value),
            this.designerinfoFormGroup.get("mainservicepanellocation").value,
            this.designerinfoFormGroup.get("scalesiteplan").value,
            this.designerinfoFormGroup.get("scaleroofplan").value,
            this.designerinfoFormGroup.get("scalestringlayout").value,
            this.designerinfoFormGroup.get("panelheight").value,
            this.designerinfoFormGroup.get("numberofattachments").value,
            this.designerinfoFormGroup.get("governingcode").value,
            this.generateddesign.city,
            this.generateddesign.state,
            this.generateddesign.id,
            this.designerinfoFormGroup.get("legend").value,
            this.designerinfoFormGroup.get("nec").value
          )
          .subscribe(
            response => {
              this.designerdetailid = response.id;
              this.designerdetailsaved.emit(response);
              if (this.governingcode.value != this.governingcodesavedvalue && this.governingcodeid != undefined) {
                this.saveGoverningCode()
              }
              this.saveSingleAmbientempData();

            },
            error => {
              this.notifyService.showError(
                error,
                "Error"
              );
              this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
              this.changeDetectorRef.detectChanges();
            }
          );
      }
      else {
        this.designerinfoFormGroup.markAllAsTouched();
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
        this.changeDetectorRef.detectChanges();
      }
    }
    else {
      if (this.designerinfoFormGroup.valid) {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
        let postData = {
          exposurecategory: this.designerinfoFormGroup.get("exposurecategory").value,
          showbackfeedrule: JSON.parse(this.designerinfoFormGroup.get("showbackfeedrule").value),
          msplocation: this.designerinfoFormGroup.get("mainservicepanellocation").value,
          scalesiteplan: this.designerinfoFormGroup.get("scalesiteplan").value,
          scaleroofplan: this.designerinfoFormGroup.get("scaleroofplan").value,
          scalestringlayout: this.designerinfoFormGroup.get("scalestringlayout").value,
          panelheight: this.designerinfoFormGroup.get("panelheight").value,
          totalnumberofattachments: this.designerinfoFormGroup.get("numberofattachments").value,
          governingcodes: this.designerinfoFormGroup.get("governingcode").value,
          city: this.generateddesign.city,
          state: this.generateddesign.state,
          design: this.generateddesign.id,
          legend: this.designerinfoFormGroup.get("legend").value,
          nec: this.designerinfoFormGroup.get("nec").value
        }
        this.designService
          .editPermitDesignerDetails(postData, this.generateddesign.designerdetails.id)
          .subscribe(
            response => {
              this.designerdetailid = response.id;
              if (this.governingcode.value != this.governingcodesavedvalue && this.governingcodeid != undefined) {
                this.saveGoverningCode()
              }
              this.saveSingleAmbientempData();

            },
            error => {
              this.notifyService.showError(
                error,
                "Error"
              );
              this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
              this.changeDetectorRef.detectChanges();
            }
          );
      }
      else {
        this.designerinfoFormGroup.markAllAsTouched();
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  /*  addElectricalData(index) {
     console.log(this.ELECTRICAL_DATA)
     if (!this.ELECTRICAL_DATA[index].isSaved) {
       let postData = {
         typical: this.ELECTRICAL_DATA[index].typical,
         initialconductorlocation: this.ELECTRICAL_DATA[index].initialconductorlocation,
         finalconductorlocation: this.ELECTRICAL_DATA[index].finalconductorlocation,
         ocpd: this.ELECTRICAL_DATA[index].ocpd,
         maxcurrent: this.ELECTRICAL_DATA[index].maxcurrent,
         inputlength: this.ELECTRICAL_DATA[index].inputlength,
         parallelcircuits: this.ELECTRICAL_DATA[index].parallelcircuits,
         tableid: this.ELECTRICAL_DATA[index].tableid,
         conductor1: this.ELECTRICAL_DATA[index].conductor1,
         conductor2: this.ELECTRICAL_DATA[index].conductor2,
         conductor3: this.ELECTRICAL_DATA[index].conductor3,
         conduit: this.ELECTRICAL_DATA[index].conduit,
         currentcarryingconductorinconduit: this.ELECTRICAL_DATA[index].currentcarryingconductorinconduit,
         conduitfillpercent: this.ELECTRICAL_DATA[index].conduitfillpercent,
         egc1: this.ELECTRICAL_DATA[index].egc1,
         egc2: this.ELECTRICAL_DATA[index].egc2,
         tempcorrfactor1: this.ELECTRICAL_DATA[index].tempcorrfactor1,
         tempcorrfactor2: this.ELECTRICAL_DATA[index].tempcorrfactor2,
         conduitfillfactor: this.ELECTRICAL_DATA[index].conduitfillfactor,
         contcurrent: this.ELECTRICAL_DATA[index].contcurrent,
         baseamp: this.ELECTRICAL_DATA[index].baseamp,
         deratedamp: this.ELECTRICAL_DATA[index].deratedamp,
         termtemprating: this.ELECTRICAL_DATA[index].termtemprating,
         voltagedrop: this.ELECTRICAL_DATA[index].voltagedrop,
         designerdetail: this.designerdetailid,
         ocpdvalue: this.ELECTRICAL_DATA[index].ocpdvalue.toString()
       }
       this.commonService.saveElectricalData(postData).subscribe(response => {
         if (index < this.ELECTRICAL_DATA.length - 1) {
           let newIndex = index + 1;
           this.addElectricalData(newIndex);
         }
         else {
           if (this.generateddesign.rooftype == 'both') {
             this.addRoofInputsDetails(this.ROOF_DATA[0], this.designerdetailid, 0, 'pitch', 0);
           }
           else {
             this.addRoofInputsDetails(this.ROOF_DATA[0], this.designerdetailid, 0, this.generateddesign.rooftype, 0);
           }
         }
       },
         error => {
           this.notifyService.showError(
             error,
             "Error"
           );
           this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
           this.changeDetectorRef.detectChanges();
         })
     }
     else {
       if (index < this.ELECTRICAL_DATA.length - 1) {
         let newIndex = index + 1;
         this.addElectricalData(newIndex);
       }
       else {
         if (this.generateddesign.rooftype == 'both') {
           this.addRoofInputsDetails(this.ROOF_DATA[0], this.designerdetailid, 0, 'pitch', 0);
         }
         else {
           this.addRoofInputsDetails(this.ROOF_DATA[0], this.designerdetailid, 0, this.generateddesign.rooftype, 0);
         }
       }
     }
   } */

  saveSingleAmbientempData() {
    if (this.ambientdetailsnull) {
      if (this.ambienttempFormGroup.valid) {
        const postData = {
          city: this.generateddesign.city,
          state: this.generateddesign.state,
          recordlowtemp: this.recordlowtemp.value,
          ambienthightemp: this.ambienthightemp.value,
          conductortemprate: this.conductortemprate.value,
          snowload: this.snowload.value,
          windspeed: this.windspeed.value,
          snowloadkey: this.snowloadkey.value
        }
        this.commonService.saveSingleAmbienttempData(postData).subscribe(
          response => {
            this.ambienttempFormGroup.disable();
            console.log(response);
            this.saveSingleModuleData();
          },
          error => {

            if (error.statusCode == 400) {
              let keys = Object.values(error.data.errors)
              this.notifyService.showError(
                keys[0],
                "Error"
              );
            }
            else {
              this.notifyService.showError(
                error.message,
                "Error"
              );
            }
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        )
      }
      else {
        this.ambienttempFormGroup.markAllAsTouched();
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
        this.changeDetectorRef.detectChanges();
      }
    } else {
      this.saveSingleModuleData();
    }
  }

  saveSingleModuleData() {
    if (this.solarmodelsdetailsnull) {
      if (this.solarmoduleFormGroup.valid) {
        const postData = {
          numberofcells: this.numberofcells.value,
          isc: this.isc.value,
          voc: this.voc.value,
          ipmax: this.ipmax.value,
          vpmax: this.vpmax.value,
          tempcoefofvoc: this.tempcoefofvoc.value,
          fuserating: this.fuserating.value,
          modellength: this.modulelength.value,
          modelwidth: this.weight.value,
          area: this.area.value,
          weight: this.weight.value
        }
        this.commonService.setSingleModuleModelsData(this.generateddesign.solarmodel.id, postData).subscribe(
          response => {
            this.solarmoduleFormGroup.disable();
            console.log(response)
            this.saveSingleInverterData();
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        )
      }
      else {
        this.solarmoduleFormGroup.markAllAsTouched();
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
        this.changeDetectorRef.detectChanges();

      }
    } else {
      this.saveSingleInverterData();
    }
  }

  saveSingleInverterData() {
    if (this.invertermodeldetailsnull) {
      if (this.invertermodelFormGroup.valid) {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
        const postData = {
          phase: this.phase.value,
          ratedacvoltage: this.ratedacvoltage.value,
          rateoutputpower: this.rateoutputpower.value,
          numberofmpptchannels: this.numberofmpptchannels.value,
          currentpermppta: this.currentpermppta.value,
          maximuminputvoltage: this.maximuminputvoltage.value,
          nominalinputvoltage: this.nominalinputvoltage.value,
          startupvoltage: this.startupvoltage.value,
          maximuminputcurrent: this.maximuminputcurrent.value,
          maximumoutputcurrent: this.maximumoutputcurrent.value,
          cecefficiency: this.cecefficiency.value,
          datasheetavailable: this.datasheetavailable.value,
          maximumocpdrating: this.maximumocpdrating.value
        }
        this.commonService.setSingleInverterModelsData(this.generateddesign.invertermodel.id, postData).subscribe(
          response => {
            console.log(response);
            this.invertermodelFormGroup.disable();
            if (this.extrainvertermodeldata.length > 0) {
              this.saveExtrainverterModelData(0)
            }
            else {
              if (this.generateddesign.rooftype == 'both') {
                this.addRoofInputsDetails(this.ROOF_DATA[0], this.designerdetailid, 0, 'pitch', 0);
              }
              else {
                this.addRoofInputsDetails(this.ROOF_DATA[0], this.designerdetailid, 0, this.generateddesign.rooftype, 0);
              }
            }
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        )
      }
      else {
        this.invertermodelFormGroup.markAllAsTouched();
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
        this.changeDetectorRef.detectChanges();
      }
    } else {
      if (this.extrainvertermodeldata.length > 0) {
        this.saveExtrainverterModelData(0)
      }
      else {
        if (this.generateddesign.rooftype == 'both') {
          this.addRoofInputsDetails(this.ROOF_DATA[0], this.designerdetailid, 0, 'pitch', 0);
        }
        else {
          this.addRoofInputsDetails(this.ROOF_DATA[0], this.designerdetailid, 0, this.generateddesign.rooftype, 0);
        }
      }
    }
  }

  /*   saveDesignOrientations(index, recordid) {
      if (!this.designorientationsdata[index].issaved) {
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
        const postData = {
          arraysize: this.designorientationsdata[index].arraysize,
          quantity: this.designorientationsdata[index].quantity,
          orientation: this.designorientationsdata[index].orientation.toLowerCase(),
          rows: this.designorientationsdata[index].row,
          columns: this.designorientationsdata[index].col,
          tableid: this.designorientationsdata[index].tableid,
          designerdetail: recordid
        }
        this.designService.saveDesignOrientations(postData).subscribe(
          response => {
            if (index < this.designorientationsdata.length - 1) {
              index = index + 1;
              this.saveDesignOrientations(index, recordid);
            } else {
              this.addElectricalData(0);
            }
  
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        )
      }
      else {
        this.addElectricalData(0);
      }
    } */
  addRoofInputsDetails(data: DesignerRoofInput, recordid: number, index: number, rooftype: string, flatroofindex: number) {
    if (!data.issaved) {
      this.designService
        .addRoofInput(
          data.numberofmodules,
          data.tilt,
          data.azimuth,
          data.roofarea,
          this.generateddesign.structuralinformations[0].roofmaterial.name,
          recordid,
          rooftype
        )
        .subscribe(
          response => {
            // this.generateddesign = response;
            // this.genericService.setNewGeneratedDesign(this.generateddesign);
            if (index < this.ROOF_DATA.length - 1) {
              index = index + 1;
              this.addRoofInputsDetails(this.ROOF_DATA[index], recordid, index, rooftype, 0);
            } else {
              console.log(flatroofindex, this.FLAT_ROOF_DATA)
              if (this.generateddesign.rooftype == 'both') {
                if (flatroofindex < this.FLAT_ROOF_DATA.length) {
                  this.addRoofInputsDetails(this.FLAT_ROOF_DATA[flatroofindex], recordid, index, "flat", flatroofindex + 1);
                }
                else {
                  this.addDesignAttachmentDetails(this.ATTACHMENT_DATA[0], recordid, 0, 0);
                }
              }
              else {
                this.addDesignAttachmentDetails(this.ATTACHMENT_DATA[0], recordid, 0, 0);
              }
            }
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      if (index < this.ROOF_DATA.length - 1) {
        index = index + 1;
        this.addRoofInputsDetails(this.ROOF_DATA[index], this.designerdetailid, index, this.generateddesign.rooftype, 0);
      }
      else {
        if (this.generateddesign.rooftype == 'both') {
          if (flatroofindex < this.FLAT_ROOF_DATA.length) {
            this.addRoofInputsDetails(this.FLAT_ROOF_DATA[flatroofindex], recordid, index, "flat", flatroofindex + 1);
          }
          else {
            this.addDesignAttachmentDetails(this.ATTACHMENT_DATA[0], recordid, 0, 0);
          }
        }
        else {
          this.addDesignAttachmentDetails(this.ATTACHMENT_DATA[0], recordid, 0, 0);
        }
      }
    }
  }

  addDesignAttachmentDetails(data: DesignBOM, recordid: number, index: number, pitchindex: number) {
    console.log(this.newattachmentmaterials)
    if (!data.issaved) {
      this.designService
        .addDesignAttachmentDetails(
          data.quantity * this.designerinfoFormGroup.get("numberofattachments").value,
          data.description,
          recordid
        )
        .subscribe(
          response => {
            // this.generateddesign = response;
            // this.genericService.setNewGeneratedDesign(this.generateddesign);
            if (index < this.ATTACHMENT_DATA.length - 1) {
              index = index + 1;
              this.addDesignAttachmentDetails(this.ATTACHMENT_DATA[index], recordid, index, 0);
            } else {
              if (this.generateddesign.rooftype == 'both') {
                if (pitchindex < this.PITCH_ROOF_ATTACHMENT_DATA.length - 1) {
                  this.addDesignAttachmentDetails(this.PITCH_ROOF_ATTACHMENT_DATA[pitchindex], recordid, index, (pitchindex + 1));
                }
                else {
                  if (this.newattachmentmaterials.length > 0) {
                    this.addAttachmentMaterials(this.newattachmentmaterials[0], recordid, 0, 0);
                  }
                  else if (this.pitchnewattachmentmaterials.length > 0 && this.generateddesign.rooftype == 'both') {
                    this.addAttachmentMaterials(this.pitchnewattachmentmaterials[0], recordid, 0, 0);
                  }
                  else {
                    this.uploadSitePlan(recordid);
                  }
                }
              }
              else {
                if (this.newattachmentmaterials.length > 0) {
                  this.addAttachmentMaterials(this.newattachmentmaterials[0], recordid, 0, 0);
                }
                else if (this.pitchnewattachmentmaterials.length > 0 && this.generateddesign.rooftype == 'both') {
                  this.addAttachmentMaterials(this.pitchnewattachmentmaterials[0], recordid, 0, 0);
                }
                else {
                  this.uploadSitePlan(recordid);
                }
              }
            }
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      if (index < this.ATTACHMENT_DATA.length - 1) {
        index = index + 1;
        this.addDesignAttachmentDetails(this.ATTACHMENT_DATA[index], recordid, index, 0);
      } else {
        if (this.generateddesign.rooftype == 'both') {
          if (pitchindex < this.PITCH_ROOF_ATTACHMENT_DATA.length - 1) {

            this.addDesignAttachmentDetails(this.PITCH_ROOF_ATTACHMENT_DATA[pitchindex], recordid, index, pitchindex);
            pitchindex = pitchindex + 1;
          }
          else {
            if (this.newattachmentmaterials.length > 0) {
              this.addAttachmentMaterials(this.newattachmentmaterials[0], recordid, 0, 0);
            }
            else if (this.pitchnewattachmentmaterials.length > 0 && this.generateddesign.rooftype == 'both') {
              this.addAttachmentMaterials(this.pitchnewattachmentmaterials[0], recordid, 0, 0);
            }
            else {
              this.uploadSitePlan(recordid);

            }
          }
        }
        else {
          if (this.newattachmentmaterials.length > 0) {
            this.addAttachmentMaterials(this.newattachmentmaterials[0], recordid, 0, 0);
          }
          else if (this.pitchnewattachmentmaterials.length > 0 && this.generateddesign.rooftype == 'both') {
            this.addAttachmentMaterials(this.pitchnewattachmentmaterials[0], recordid, 0, 0);
          }
          else {

            this.uploadSitePlan(recordid);

          }
        }
      }
    }
  }

  //Code to add new attachment to Attachment Materials Table
  addAttachmentMaterials(data: AttachmentMaterial, recordid: number, index: number, pitchindex: number) {
    console.log(data)
    this.commonService
      .addAttachmentMaterial(
        data.description,
        this.generateddesign.structuralinformations[0].attachmenttype.id
      )
      .subscribe(
        () => {
          // this.generateddesign = response;
          // this.genericService.setNewGeneratedDesign(this.generateddesign);
          if (index < this.newattachmentmaterials.length - 1) {
            index = index + 1;
            this.addAttachmentMaterials(this.newattachmentmaterials[index], recordid, index, 0);
            // } else {
            //   this.uploadSitePlan(recordid);
            // }
          } else {
            if (this.generateddesign.rooftype == 'both') {
              if (pitchindex < this.pitchnewattachmentmaterials.length - 1) {

                this.addAttachmentMaterials(this.pitchnewattachmentmaterials[pitchindex], recordid, index, pitchindex);
                pitchindex = pitchindex + 1;
              }
              else {
                this.uploadSitePlan(recordid);
              }
            }
            else {
              this.uploadSitePlan(recordid);
            }
          }
        },

        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
          this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
          this.changeDetectorRef.detectChanges();
        }
      );
  }



  //Uploading of files specific code
  uploadSitePlan(recordid: number) {
    if (!this.siteplanexists) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingSitePlan);
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.siteplanlayoutfiles,
          "siteplan",
          "designerdetails"
        )
        .subscribe(
          () => {
            // this.generateddesign.electricalinformation.mspphotos = response;
            // this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.uploadRoofPlanAndModules(recordid)
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      this.uploadRoofPlanAndModules(recordid)
    }
  }

  uploadRoofPlanAndModules(recordid: number) {
    if (!this.roofplanandmodulesexists) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingRoofPlanAndModules);
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.roofplanmoduleslayoutfiles,
          "roofplanandmodules",
          "designerdetails"
        )
        .subscribe(
          () => {
            // this.generateddesign.electricalinformation.mspphotos = response;
            // this.genericService.setNewGeneratedDesign(this.generateddesign);
            this.uploadStringLayoutAndBom(recordid)

          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    } else {
      this.uploadStringLayoutAndBom(recordid)
    }
  }
  uploadStringLayoutAndBom(recordid: number) {
    if (!this.stringlayoutandbomexists) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingStringLayoutAndBom);
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.stringlayoutandbomfiles,
          "stringlayoutandbom",
          "designerdetails"
        )
        .subscribe(
          () => {
            // this.generateddesign.electricalinformation.mspphotos = response;
            // this.genericService.setNewGeneratedDesign(this.generateddesign);

            this.uploadSingleLineDiagram(recordid)
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      this.uploadSingleLineDiagram(recordid)
    }
  }

  uploadSingleLineDiagram(recordid: number) {
    if (!this.singlelinediagramexists) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingSingleLineDiagram);
      this.commonService
        .uploadFiles(
          recordid,
          "designs/" + this.generateddesign.id,
          this.singlelinediagramfiles,
          "singlelinediagram",
          "designerdetails"
        )
        .subscribe(
          response => {

            // this.generateddesign.electricalinformation.mspphotos = response;
            // this.genericService.setNewGeneratedDesign(this.generateddesign);
            // this.uploadOtherImages(recordid);
            this.saveHousePhotoImage(recordid);

          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      this.saveHousePhotoImage(recordid);
    }
  }

  uploadOtherImages() {
    //this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.Upl);
    if (this.otherdocumentscataloguefiles.length) {
      this.commonService
        .uploadFiles(
          this.designerdetailid,
          "designs/" + this.generateddesign.id,
          this.otherdocumentscataloguefiles,
          "otherdocuments",
          "designerdetails"
        )
        .subscribe(
          response => {
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.DesignerDetailsSaved);
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
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.DesignerDetailsSaved);
    }
  }

  saveHousePhotoImage(recordid: number) {
    if (this.generateddesign.latitude != null && this.housephotocorrect.value && !this.housephotoexist) {
      html2canvas(this.housephoto.nativeElement, {
        backgroundColor: null,
        useCORS: true,
        width: 400,
        height: 400
      }).then(canvas => {

        var imageData = canvas.toDataURL('image/jpeg');
        var file = this.genericService.dataURLtoFile(imageData, 'houseimage.jpeg');

        this.uploadHousePhotoImage(recordid, file);
      });
    }
    else {
      this.uploadHousePhotoImage(recordid, this.uploadedhousephoto);
    }

  }

  uploadHousePhotoImage(recordid: number, imagedata: File) {
    if (!this.housephotoexist) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingHousePhotoImage);
      this.commonService
        .uploadFile(
          recordid,
          "designs/" + this.generateddesign.id,
          imagedata,
          "locationimage",
          "designerdetails"
        )
        .subscribe(
          response => {
            this.saveVicinityMapImage(recordid);

          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    } else {
      this.saveVicinityMapImage(recordid);
    }
  }

  saveVicinityMapImage(recordid: number): void {
    if (this.generateddesign.latitude != null && this.vicinitymapcorrect.value && !this.vicinitymapexist) {
      html2canvas(this.vicinitymap.nativeElement, {
        backgroundColor: null,
        useCORS: true,
        width: 400,
        height: 400,
      }).then((canvas) => {
        const imageData = canvas.toDataURL("image/jpeg");
        const file = this.genericService.dataURLtoFile(
          imageData,
          "vicinitymap.jpeg"
        );

        this.uploadVicinityMap(recordid, file);
      });
    }
    else {
      if (this.uploadedvicinity != null) {
        this.uploadVicinityMap(recordid, this.uploadedvicinity);
      }
      else {
        this.uploadSolarModuleCatalogue();
      }

    }

  }

  uploadVicinityMap(recordid: number, imagedata: File) {
    if (!this.vicinitymapexist) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingVicinityMap);
      this.commonService
        .uploadFile(
          recordid,
          "designs/" + this.generateddesign.id,
          imagedata,
          "vicinitymap",
          "designerdetails"
        )
        .subscribe(
          () => {
            this.uploadSolarModuleCatalogue();
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      this.uploadSolarModuleCatalogue();
    }
  }
  generatepdf() {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.DesignerDetailsSaved);

    // this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.GeneratingPDF);

    // this.designService.downloadPermitDesign(this.generateddesign.id).subscribe(response => {
    //   console.log(response)
    //   this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
    //  
    //   this.notifyService.showSuccess("Design request data has been updated successfully.", "Success");
    // },
    //   error => {
    //     this.notifyService.showError(
    //       error,
    //       "Error"
    //     );
    //     this.dialogRef.closeAll();
    //     this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
    //     this.changeDetectorRef.detectChanges();
    //   })
  }
  uploadSolarModuleCatalogue() {
    if (!this.modulescataloguesexist && this.solarmodulecataloguefiles.length) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingSolarModuleCatalogue);
      this.commonService
        .uploadFilesToAWS(
          "modulescatalogues/" +
          this.generateddesign.solarmodel.name.toLowerCase(),
          this.solarmodulecataloguefiles
        )
        .subscribe(
          () => {
            const postData = {
              cataloguesuploaded: true,
            }
            this.dataentryservice
              .editModuleModelData(postData, this.generateddesign.solarmodel.id)
              .subscribe(
                () => {

                },
                () => {

                }
              );
            this.uploadRackingModelDataCatalogue();
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      this.uploadRackingModelDataCatalogue();
    }
  }

  /*   uploadInverterCatalogue() {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingInverterCatalogue);
      this.commonService
        .uploadFilesToAWS(
          "inverterscatalogues/" +
          this.generateddesign.invertermodel.name.toLowerCase(),
          this.invertercataloguefiles
        )
        .subscribe(
          response => {
            const postData = {
              cataloguesuploaded: true,
            }
            this.dataentryservice
              .editInverterModelData(postData, this.generateddesign.invertermodel.id)
              .subscribe(
                () => {
  
                },
                () => {
  
                }
              );
            if (!this.rackingsystemdatacataloguesexist) {
              this.uploadRackingModelDataCatalogue();
            }
            else if (!this.rackingsystemcutcataloguesexist) {
              this.uploadRackingModelCutCatalogue()
            }
            else if (!this.attachmentdatasheetcataloguesexist) {
              this.uploadAttachmentsDataSheetCatalogue()
            }
            else if (!this.attachmentcutsheetcataloguesexist) {
              this.uploadAttachmentsCutSheetCatalogue()
            }
            else if (this.otherinverterscatalogueexist.length > 0) {
              this.uploadOtherInverterCatalogue();
            }
            else {
  
              this.uploadSitePlacard(this.generateddesign.id)
            }
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    } */

  uploadBatteryCatalogue() {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingBatteryCatalogue);
    this.commonService
      .uploadFilesToAWS(
        "batterycatalogues/" +
        this.generateddesign.electricalinformation.batterymake.name.toLowerCase(),
        this.batterycataloguefiles
      )
      .subscribe(
        () => {
          this.uploadRackingModelDataCatalogue();
        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
          this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
          this.changeDetectorRef.detectChanges();
        }
      );
  }

  uploadRackingModelDataCatalogue() {
    if (!this.rackingsystemdatacataloguesexist && this.rackingsystemdatacataloguefiles.length) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingRackingModelDataCatalogue);
      this.commonService
        .uploadFilesToAWS(
          "rackingmodelcatalogues/" + this.generateddesign.structuralinformations[0].rackingmodel.name.toLowerCase() + "/datasheet",
          this.rackingsystemdatacataloguefiles
        )
        .subscribe(
          response => {
            if (this.generateddesign.rooftype == 'both') {
              this.uploadRackingModelData1Catalogue();
            }
            else {
              this.uploadRackingModelCutCatalogue()
            }
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    } else {
      if (this.generateddesign.rooftype == 'both') {
        this.uploadRackingModelData1Catalogue();
      }
      else {
        this.uploadRackingModelCutCatalogue()
      }
    }
  }

  uploadRackingModelData1Catalogue() {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingRackingModelDataCatalogue);
    this.commonService
      .uploadFilesToAWS(
        "rackingmodelcatalogues/" + this.generateddesign.structuralinformations[1].rackingmodel.name.toLowerCase() + "/datasheet",
        this.secondrackingsystemdatacataloguefiles
      )
      .subscribe(
        () => {
          this.uploadRackingModelCutCatalogue();
        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
          this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
          this.changeDetectorRef.detectChanges();
        }
      );
  }

  uploadRackingModelCutCatalogue() {
    if (!this.rackingsystemcutcataloguesexist && this.rackingsystemcutcataloguefiles.length) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingRackingModelCutCatalogue);
      this.commonService
        .uploadFilesToAWS(
          "rackingmodelcatalogues/" + this.generateddesign.structuralinformations[0].rackingmodel.name.toLowerCase() + "/cutsheet",
          this.rackingsystemcutcataloguefiles
        )
        .subscribe(
          response => {
            if (this.generateddesign.rooftype == 'both') {
              this.uploadRackingModelCut1Catalogue();
            }
            else {
              this.uploadAttachmentsDataSheetCatalogue()
            }
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      if (this.generateddesign.rooftype == 'both') {
        this.uploadRackingModelCut1Catalogue();
      }
      else {
        this.uploadAttachmentsDataSheetCatalogue()
      }
    }
  }

  uploadRackingModelCut1Catalogue() {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingRackingModelCutCatalogue);
    this.commonService
      .uploadFilesToAWS(
        "rackingmodelcatalogues/" + this.generateddesign.structuralinformations[1].rackingmodel.name.toLowerCase() + "/cutsheet",
        this.secondrackingsystemcutcataloguefiles
      )
      .subscribe(
        () => {
          this.uploadAttachmentsDataSheetCatalogue();
        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
          this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
          this.changeDetectorRef.detectChanges();
        }
      );
  }

  uploadAttachmentsDataSheetCatalogue() {
    if (!this.attachmentdatasheetcataloguesexist && this.attachmentdatasheetcataloguefiles.length) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingAttachmentsDataSheetCatalogue);
      this.commonService
        .uploadFilesToAWS(
          "attachmentcatalogues/" + this.generateddesign.structuralinformations[0].attachmenttype.name.toLowerCase() + "/datasheet",
          this.attachmentdatasheetcataloguefiles
        )
        .subscribe(
          response => {
            if (this.generateddesign.rooftype == 'both') {
              this.uploadAttachmentsDataSheet1Catalogue();
            }
            else {
              this.uploadAttachmentsCutSheetCatalogue()
            }
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      if (this.generateddesign.rooftype == 'both') {
        this.uploadAttachmentsDataSheet1Catalogue();
      }
      else {
        this.uploadAttachmentsCutSheetCatalogue()
      }
    }
  }

  uploadAttachmentsDataSheet1Catalogue() {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingAttachmentsDataSheetCatalogue);
    this.commonService
      .uploadFilesToAWS(
        "attachmentcatalogues/" + this.generateddesign.structuralinformations[1].attachmenttype.name.toLowerCase() + "/datasheet",
        this.secondattachmentdatasheetcataloguefiles
      )
      .subscribe(
        () => {
          this.uploadAttachmentsCutSheetCatalogue();
        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
          this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
          this.changeDetectorRef.detectChanges();
        }
      );
  }

  uploadAttachmentsCutSheetCatalogue() {
    if (!this.attachmentcutsheetcataloguesexist && this.attachmentcutsheetcataloguefiles.length) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingAttachmentsCutSheetCatalogue);
      this.commonService
        .uploadFilesToAWS(
          "attachmentcatalogues/" + this.generateddesign.structuralinformations[0].attachmenttype.name.toLowerCase() + "/cutsheet",
          this.attachmentcutsheetcataloguefiles
        )
        .subscribe(
          response => {
            if (this.generateddesign.rooftype == 'both') {
              this.uploadAttachmentsCutSheet1Catalogue();
            }
            else {
              this.uploadOtherInverterCatalogue();
            }
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    } else {
      if (this.generateddesign.rooftype == 'both') {
        this.uploadAttachmentsCutSheet1Catalogue();
      }
      else {
        this.uploadOtherInverterCatalogue();
      }
    }
  }

  uploadAttachmentsCutSheet1Catalogue() {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingAttachmentsCutSheetCatalogue);
    this.commonService
      .uploadFilesToAWS(
        "attachmentcatalogues/" + this.generateddesign.structuralinformations[1].attachmenttype.name.toLowerCase() + "/cutsheet/",
        this.secondattachmentcutsheetcataloguefiles
      )
      .subscribe(
        response => {
          this.uploadOtherInverterCatalogue();
        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
          this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
          this.changeDetectorRef.detectChanges();
        }
      );
  }

  editRoofDetails(rowdaata): void {
    this.hideroofinputform = false;
    this.roofinputid.setValue(rowdaata.id);
    this.modulescount.setValue(rowdaata.numberofmodules);
    this.tilt.setValue(rowdaata.tilt);
    this.azimuth.setValue(rowdaata.azimuth);
    this.roofarea.setValue(rowdaata.roofarea);
  }

  editflatRoofDetails(rowdaata) {
    this.hideflatroofinputform = false;
    this.flatroofinputid.setValue(rowdaata.id);
    this.flatmodulescount.setValue(rowdaata.numberofmodules);
    this.flattilt.setValue(rowdaata.tilt);
    this.flatazimuth.setValue(rowdaata.azimuth);
    this.flatroofarea.setValue(rowdaata.roofarea);
  }
  editBOMDetails(event, rowdaata) {
    event.preventDefault();
    this.hidebominputform = false;
    this.bomid.setValue(rowdaata.id);
    this.bomquantity.setValue(rowdaata.quantity);
    this.bomdescription.setValue(rowdaata.description);
    if (rowdaata.issaved) {
      this.bomdescription.disable();
    } else {
      this.bomdescription.enable();
    }
  }

  editdesignorentations(event, rowdata) {
    event.preventDefault();
    this.isdesignorientationsEditMode = true;
    this.hidedesignorientationsform = false;
    this.selectedesignorientationsid = rowdata.tableid
    this.orientation.setValue(rowdata.orientation);
    this.quantity.setValue(rowdata.quantity);
    this.arraysize.setValue(rowdata.arraysize);
  }

  editPitchBOMDetails(event, rowdaata) {
    event.preventDefault();
    this.hidepitchbominputform = false;
    this.pitchbomid.setValue(rowdaata.id);
    this.pitchbomquantity.setValue(rowdaata.quantity);
    this.pitchbomdescription.setValue(rowdaata.description);
    if (rowdaata.issaved) {
      this.pitchbomdescription.disable();
    } else {
      this.pitchbomdescription.enable();
    }
  }

  editelectricalsDetails(data, index) {
    /*  this.hideelectricalinputform = false;
     this.iselectricaleditmode = true;
     this.selectedelectricalid = data.id */
    const dialogRef = this.dialog.open(EditelectricalinputsComponent, {
      width: "60%",
      autoFocus: false,
      disableClose: true,
      data: { electricalinput: data, isdataupdated: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdataupdated) {
        this.ELECTRICAL_DATA[index] = result.electricalinput
        this.changeDetectorRef.detectChanges()
      }
    });



    /* this.typical.setValue(data.typical),
      this.initialconductorlocation.patchValue(data.initialconductorlocation),
      this.finalconductorlocation.patchValue(data.finalconductorlocation),
      this.ocpd.setValue(data.ocpd),
      this.maxcurrent.setValue(data.maxcurrent),
      this.length.setValue(data.inputlength),
      this.parallelcircuits.setValue(data.parallelcircuits),
      this.termtemprating.patchValue(data.termtemprating.toString()) */
  }

  deleteElectricalsDetails(data) {
    this.ELECTRICAL_DATA.splice(data, 1);
    this.electricaldataSource.data = this.ELECTRICAL_DATA;
    this.changeDetectorRef.detectChanges();
  }

  openBOMConfirmationDialog(event, elementid) {
    event.preventDefault();
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message: "Are you sure you want to remove this entry?",
          positive: "Yes",
          negative: "No",
        },
      }
    );
    snackbarRef.onAction().subscribe(() => {
      const itemIndex = this.ATTACHMENT_DATA.findIndex(
        (item) => item.id == elementid
      );
      if (itemIndex != -1) {
        this.ATTACHMENT_DATA.splice(itemIndex, 1);
      }
      const newitemIndex = this.newattachmentmaterials.findIndex(
        (item) => item.id == elementid
      );
      if (newitemIndex != -1) {
        this.newattachmentmaterials.splice(newitemIndex, 1);
      }
      this.bomdataSource.data = this.ATTACHMENT_DATA;
      this.changeDetectorRef.detectChanges();
    });
  }

  openPitchBOMConfirmationDialog(event, elementid) {
    event.preventDefault();
    const snackbarRef = this._snackBar.openFromComponent(ConfirmationsnackbarComponent, {
      data: { "message": "Are you sure you want to remove this entry?", "positive": "Yes", "negative": "No" }
    });
    snackbarRef.onAction().subscribe(() => {
      let itemIndex = this.PITCH_ROOF_ATTACHMENT_DATA.findIndex(item => item.id == elementid);
      if (itemIndex != -1) {
        this.PITCH_ROOF_ATTACHMENT_DATA.splice(itemIndex, 1);
      }
      let newitemIndex = this.pitchnewattachmentmaterials.findIndex(item => item.id == elementid);
      if (newitemIndex != -1) {
        this.pitchnewattachmentmaterials.splice(newitemIndex, 1);
      }
      this.pitchbomdataSource.data = this.PITCH_ROOF_ATTACHMENT_DATA;
      this.changeDetectorRef.detectChanges();
    });
  }

  opendesignorentationsConfirmationDialog(event, elementid) {
    event.preventDefault();
    const snackbarRef = this._snackBar.openFromComponent(ConfirmationsnackbarComponent, {
      data: { "message": "Are you sure you want to remove this entry?", "positive": "Yes", "negative": "No" }
    });
    snackbarRef.onAction().subscribe(() => {
      let itemIndex = this.designorientationsdata.findIndex(item => item.tableid == elementid);
      if (itemIndex != -1) {
        this.designorientationsdata.splice(itemIndex, 1);
      }
      this.designorientationsSource.data = this.designorientationsdata;
      this.changeDetectorRef.detectChanges();
    });
  }

  onHousePhotoSelect(event) {

    for (let index = 0; index < event.addedFiles.length; index++) {
      var element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes('image')) {
        element.isImage = true;
      }
      var extension = element.name.substring(element.name.lastIndexOf('.'));

      var mimetype = this.genericService.getMimetype(extension);
      window.console.log(extension, mimetype);
      var data = new Blob([element], {
        type: mimetype
      });
      console.log(data);
      let replacedfile = new File([data], element.name, { type: mimetype });
      this.uploadedhousephoto = replacedfile
      console.log(this.uploadedhousephoto);
    }

    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)

  }

  onHousePhotoRemove(event) {
    this.uploadedhousephoto = null;
  }

  onVicinitySelect(event) {

    for (let index = 0; index < event.addedFiles.length; index++) {
      var element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes('image')) {
        element.isImage = true;
      }
      var extension = element.name.substring(element.name.lastIndexOf('.'));

      var mimetype = this.genericService.getMimetype(extension);
      window.console.log(extension, mimetype);
      var data = new Blob([element], {
        type: mimetype
      });
      console.log(data);
      let replacedfile = new File([data], element.name, { type: mimetype });
      this.uploadedvicinity = replacedfile
      console.log(this.uploadedvicinity);
    }

    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)

  }

  onVicinityRemove(event) {
    this.uploadedvicinity = null
  }

  downloadDesign() {
    let postData = this.ELECTRICAL_DATA;
    this.commonService.downloadElectricalDataExcelSheet(postData).subscribe(response => {
      this.downloadElectricalDataExcelSheet(response);
    })
  }

  downloadElectricalDataExcelSheet(value) {
    var str = value.data.key.split("/");
    var fileurl = value.data.Location;
    var filename = str[1];

    axios({
      url: fileurl,

      //url: fileurl,
      method: "GET",
      responseType: "blob",
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
    });
  }
  onDeletesiteplan(id) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      response => {
        this.siteplanexists = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onDeleteRoofplanandmodules(id) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      response => {
        this.roofplanandmodulesexists = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onDeleteStringlayoutandbom(id) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      response => {
        this.stringlayoutandbomexists = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onDeleteSinglelinediagram(id) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      response => {
        this.singlelinediagramexists = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onOtherInverterSelect(event, i) {
    this.otherinverterscatalogueexist[i].fileuploaded = true;
    event.addedFiles.forEach(element => {
      element.isImage = false;
      if (element.type.includes('image')) {
        element.isImage = true;
      }
    });
    this.otherinverterscatalogueexist[i].cataloguefile.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onOtherInverterRemove(event, i) {
    this.otherinverterscatalogueexist[i].cataloguefile.splice(this.invertercataloguefiles.indexOf(event), 1);
    if (this.otherinverterscatalogueexist[i].cataloguefile.length == 0) {
      this.otherinverterscatalogueexist[i].fileuploaded = false;
    }
  }
  uploadOtherInverterCatalogue() {
    if (this.otherinverterscatalogueexist.length > 0) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingInverterCatalogue);
      this.otherinverterscatalogueexist.forEach((element, index) => {
        this.commonService
          .uploadFilesToAWS(
            "inverterscatalogues/" + element.invertermodelname,
            element.cataloguefile,
          )
          .subscribe(
            () => {
              const postData = {
                cataloguesuploaded: true,
              }
              this.dataentryservice
                .editInverterModelData(postData, element.invertermodelid)
                .subscribe(
                  () => {

                  },
                  () => {

                  }
                );
              if (index == this.otherinverterscatalogueexist.length - 1) {
                this.uploadSitePlacard(this.generateddesign.id)
              }
            },
            error => {
              this.notifyService.showError(
                error,
                "Error"
              );
              this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
              this.changeDetectorRef.detectChanges();
            }
          );
      });
    }
    else {
      this.uploadSitePlacard(this.generateddesign.id)
    }
  }

  uploadSitePlacard(recordid: number) {
    if (!this.issiteplacardhouseimageexist) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingSitePlacardImage);
      this.commonService
        .uploadFile(
          this.designerdetailid,
          "designs/" + recordid,
          this.playcardhouseimagefiles[0],
          "siteplacard",
          "designerdetails"
        )
        .subscribe(
          () => {
            this.uploadSitePlacardDirectionImage(recordid);
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      this.uploadSitePlacardDirectionImage(recordid);
    }
  }

  uploadSitePlacardDirectionImage(recordid: number) {
    if (!this.issiteplacarddirectionimageexist) {
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.UploadingSitePlacardImage);
      this.commonService
        .uploadFile(
          this.designerdetailid,
          "designs/" + recordid,
          this.playcarddirectionimagefile[0],
          "siteplacarddirectionimage",
          "designerdetails"
        )
        .subscribe(
          () => {
            this.uploadOtherImages();
          },
          error => {
            this.notifyService.showError(
              error,
              "Error"
            );
            this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
            this.changeDetectorRef.detectChanges();
          }
        );
    }
    else {
      this.uploadOtherImages();
    }
  }
  onPlacradDirectionSelect(event) {
    this.playcarddirectionimagefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.playcarddirectionimagefile.push(...event.addedFiles);

    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onPlacradDirectionRemove(event): void {
    this.playcarddirectionimagefile.splice(
      this.playcarddirectionimagefile.indexOf(event),
      1
    );
    if (this.playcarddirectionimagefile.length == 0) {
      this.playcarddirectionimagefileuploaded = false;
    }
  }
  generateExtraInverterModelForm(inverterModel) {
    this.extrainvertermodeldata.push({
      invertermodel: inverterModel, phase: "phase" + Number(this.extrainvertermodeldata.length + 1),
      ratedacvoltage: "ratedacvoltage" + Number(this.extrainvertermodeldata.length + 1),
      rateoutputpower: "rateoutputpower" + Number(this.extrainvertermodeldata.length + 1),
      numberofmpptchannels: "numberofmpptchannels" + Number(this.extrainvertermodeldata.length + 1),
      currentpermppta: "currentpermppta" + Number(this.extrainvertermodeldata.length + 1),
      maximuminputvoltage: "maximuminputvoltage" + Number(this.extrainvertermodeldata.length + 1),
      nominalinputvoltage: "nominalinputvoltage" + Number(this.extrainvertermodeldata.length + 1),
      startupvoltage: "startupvoltage" + Number(this.extrainvertermodeldata.length + 1),
      maximuminputcurrent: "maximuminputcurrent" + Number(this.extrainvertermodeldata.length + 1),
      maximumoutputcurrent: "maximumoutputcurrent" + Number(this.extrainvertermodeldata.length + 1),
      cecefficiency: "cecefficiency" + Number(this.extrainvertermodeldata.length + 1),
      datasheetavailable: "datasheetavailable" + Number(this.extrainvertermodeldata.length + 1),
      maximumocpdrating: "maximumocpdrating" + Number(this.extrainvertermodeldata.length + 1)
    })

    this.invertermodelFormGroup.addControl("phase" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("ratedacvoltage" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("rateoutputpower" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("numberofmpptchannels" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("currentpermppta" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("maximuminputvoltage" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("nominalinputvoltage" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("startupvoltage" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("maximuminputcurrent" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("maximumoutputcurrent" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("cecefficiency" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("datasheetavailable" + this.extrainvertermodeldata.length, new FormControl(''))
    this.invertermodelFormGroup.addControl("maximumocpdrating" + this.extrainvertermodeldata.length, new FormControl(''))
    this.changeDetectorRef.detectChanges();
  }

  saveExtrainverterModelData(index) {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
    const postData = {
      phase: this.invertermodelFormGroup.get("phase" + Number(index + 1)).value,
      ratedacvoltage: this.invertermodelFormGroup.get("ratedacvoltage" + Number(index + 1)).value,
      rateoutputpower: this.invertermodelFormGroup.get("rateoutputpower" + Number(index + 1)).value,
      numberofmpptchannels: this.invertermodelFormGroup.get("numberofmpptchannels" + Number(index + 1)).value,
      currentpermppta: this.invertermodelFormGroup.get("currentpermppta" + Number(index + 1)).value,
      maximuminputvoltage: this.invertermodelFormGroup.get("maximuminputvoltage" + Number(index + 1)).value,
      nominalinputvoltage: this.invertermodelFormGroup.get("nominalinputvoltage" + Number(index + 1)).value,
      startupvoltage: this.invertermodelFormGroup.get("startupvoltage" + Number(index + 1)).value,
      maximuminputcurrent: this.invertermodelFormGroup.get("maximuminputcurrent" + Number(index + 1)).value,
      maximumoutputcurrent: this.invertermodelFormGroup.get("maximumoutputcurrent" + Number(index + 1)).value,
      cecefficiency: this.invertermodelFormGroup.get("cecefficiency" + Number(index + 1)).value,
      datasheetavailable: this.invertermodelFormGroup.get("datasheetavailable" + Number(index + 1)).value,
      maximumocpdrating: this.invertermodelFormGroup.get("maximumocpdrating" + Number(index + 1)).value,
    }
    this.commonService.setSingleInverterModelsData(this.extrainvertermodeldata[index].invertermodel.id, postData).subscribe(
      response => {
        console.log(response);
        this.invertermodelFormGroup.disable();
        if (index < this.extrainvertermodeldata.length - 1) {
          let newIndex = index + 1
          this.saveExtrainverterModelData(newIndex)
        }
        else {
          if (this.generateddesign.rooftype == 'both') {
            this.addRoofInputsDetails(this.ROOF_DATA[0], this.designerdetailid, 0, 'pitch', 0);
          }
          else {
            this.addRoofInputsDetails(this.ROOF_DATA[0], this.designerdetailid, 0, this.generateddesign.rooftype, 0);
          }
        }
      },
      error => {
        this.notifyService.showError(
          error,
          "Error"
        );
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
        this.changeDetectorRef.detectChanges();
      })
  }

  saveGoverningCode() {
    const postData = {
      codes: this.governingcode.value
    }
    this.designService.editGoverningcode(this.governingcodeid, postData).subscribe(() => {

    })
  }

  onDeletesiteplacard(id) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      () => {
        this.issiteplacardhouseimageexist = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onDeletesiteplacarddirection(id) {
    this.commonService.deleteUploadedFile("" + id).subscribe(
      () => {
        this.issiteplacarddirectionimageexist = false;
        this.changeDetectorRef.detectChanges();
      },
      error => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
}


