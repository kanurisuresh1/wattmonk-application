import { CdkDragEnd } from "@angular/cdk/drag-drop";
import {
  ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import html2canvas from "html2canvas";
import { EVENTS_PERMIT_DESIGN } from "src/app/_helpers";
import { Design } from "src/app/_models";
import {
  GenericService, NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";

interface Location {
  latitude: number;
  longitude: number;
  maptype: string;
  zoom: number;
}

export interface Equipment {
  id: number;
  name: string;
  color: string;
  disabledcolor: string;
  enabled: boolean;
  event: CdkDragEnd;
}

@Component({
  selector: "app-locationmarking",
  templateUrl: "./locationmarking.component.html",
  styleUrls: ["./locationmarking.component.scss"],
})
export class LocationmarkingComponent implements OnInit {
  @ViewChild("screen") screen: ElementRef;

  sitelocationimage: any;
  selectedSiteLocation: Location;
  capturedEquipmentsLocation: File;

  issiteimageavailable = false;
  isloadingsiteimage = false;

  generateddesign: Design;
  isDisplayMode = false;

  locationFormGroup: FormGroup;

  pvequipments: Equipment[] = [
    {
      id: 3,
      name: "Main Service Panel",
      color: "#ff0000",
      disabledcolor: "#ff000080",
      enabled: true,
      event: null,
    },
    {
      id: 4,
      name: "Inverter",
      color: "#6d9eeb",
      disabledcolor: "#6d9eeb80",
      enabled: true,
      event: null,
    },
  ];

  pvbatteryequipments: Equipment[] = [
    {
      id: 3,
      name: "Main Service Panel",
      color: "#ff0000",
      disabledcolor: "#ff000080",
      enabled: true,
      event: null,
    },
    {
      id: 4,
      name: "Inverter",
      color: "#6d9eeb",
      disabledcolor: "#6d9eeb80",
      enabled: true,
      event: null,
    },
    {
      id: 7,
      name: "Electrical Equipment",
      color: "#ffff00",
      disabledcolor: "#ffff0080",
      enabled: true,
      event: null,
    },
  ];

  equipments: Equipment[] = [];

  acdisconnectequipment: Equipment = {
    id: 1,
    name: "AC Disconnect",
    color: "#fec412",
    disabledcolor: "#fec41280",
    enabled: true,
    event: null,
  };

  pvmeterequipment: Equipment = {
    id: 2,
    name: "PV Meter",
    color: "#6aa84f",
    disabledcolor: "#6aa84f80",
    enabled: true,
    event: null,
  };

  location: Location;

  constructor(
    private notifyService: NotificationService,
    private commonService: CommonService,
    private genericService: GenericService,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
  ) {
    this.locationFormGroup = new FormGroup({});
  }

  ngOnInit(): void {
    this.location = {
      latitude: -28.68352,
      longitude: -147.20785,
      maptype: "satellite",
      zoom: 20,
    };

    this.eventEmitterService.locationMarkingStateChange.subscribe(
      (id: EVENTS_PERMIT_DESIGN) => {
        switch (id) {
          case EVENTS_PERMIT_DESIGN.UtilityACDisconnectChangeOn:
            this.equipments.splice(0, 0, this.acdisconnectequipment);
            break;
          case EVENTS_PERMIT_DESIGN.UtilityACDisconnectChangeOff:
            if (this.equipments.length > 5) {
              this.equipments.splice(
                this.equipments.indexOf(this.acdisconnectequipment),
                1
              );
            }
            break;
          case EVENTS_PERMIT_DESIGN.PVMeterChangeOn:
            this.equipments.splice(1, 0, this.pvmeterequipment);
            break;
          case EVENTS_PERMIT_DESIGN.PVMeterChangeOff:
            if (this.equipments.length > 5) {
              this.equipments.splice(
                this.equipments.indexOf(this.pvmeterequipment),
                1
              );
            }
            break;

          default:
            break;
        }
      }
    );
  }

  updateform(record: Design) {
    this.generateddesign = record;
    this.location.latitude = this.generateddesign.latitude;
    this.location.longitude = this.generateddesign.longitude;
    if (record.jobtype == "pv") {
      this.equipments.push(...this.pvequipments);
    } else {
      this.equipments.push(...this.pvbatteryequipments);
    }
    if (record.electricalinformation != null && record.electricalinformation.pvmeter) {
      this.equipments.splice(0, 0, this.pvmeterequipment);
    }

    if (
      record.electricalinformation != null &&
      record.electricalinformation.acdisconnect
    ) {
      this.equipments.splice(0, 0, this.acdisconnectequipment);
    }

    if (this.generateddesign.electricalslocation != null) {
      this.isDisplayMode = true;
      this.enableinputform(false);
    }
    else {
      this.isDisplayMode = false;
      this.enableinputform(true);
    }
  }

  enableinputform(status) {
    if (status) {
      this.locationFormGroup.enable();
    } else {
      this.locationFormGroup.disable();
    }
  }

  // enableForm(record: Design) {
  //   this.generateddesign = record;
  //   this.location.latitude = this.generateddesign.latitude;
  //   this.location.longitude = this.generateddesign.longitude;
  //   if(record.jobtype == 'pv'){
  //     this.equipments.push(...this.pvequipments);
  //   }else{
  //     this.equipments.push(...this.pvbatteryequipments);
  //   }

  //   if(record.electricalinformation != null && record.electricalinformation.pvmeter){
  //     this.equipments.splice(0, 0, this.pvmeterequipment);
  //   }

  //   if(record.electricalinformation != null && record.electricalinformation.acdisconnect){
  //     this.equipments.splice(0, 0, this.acdisconnectequipment);
  //   }

  //   this.changeDetectorRef.detectChanges();
  // }

  // loadInputInformation(record: Design) {
  //   this.isDisplayMode = true;

  //   this.changeDetectorRef.detectChanges();
  // }

  // loadGeneratedDesign() {
  //   this.isloadingsiteimage = true;
  //   this.generateddesign = this.genericService.getNewGeneratedDesign();

  //   this.location.latitude = this.generateddesign.latitude;
  //   this.location.longitude = this.generateddesign.longitude;
  //   this.changeDetectorRef.detectChanges();
  // }

  dragEnded(event: CdkDragEnd, item: Equipment): void {
    item.enabled = false;
    item.event = event;
  }

  reverttoOriginalPosition(item: Equipment): void {
    item.event.source.element.nativeElement.style.transform = "none"; // visually reset element to its origin
    const source: any = item.event.source;
    source._passiveTransform = { x: 0, y: 0 };
    item.enabled = true;
  }

  //----------------------------------------------------------------------------------
  //----LOCATION MARKING INFORMATION TAB METHODS--------------------------------------
  //----------------------------------------------------------------------------------

  saveLocationMarkedImage(): void {
    this.eventEmitterService.onPermitDesignGenerationStateChange(
      EVENTS_PERMIT_DESIGN.UploadingLocationImage
    );
    html2canvas(this.screen.nativeElement, {
      backgroundColor: null,
      useCORS: true,
    }).then((canvas) => {
      const imageData = canvas.toDataURL("image/png");
      const file = this.genericService.dataURLtoFile(
        imageData,
        "electricalslocation.png"
      );
      this.uploadElectricalLocationsFile(this.generateddesign.id, file);
    });
  }

  uploadElectricalLocationsFile(recordid: number, imagedata: File): void {
    this.commonService
      .uploadFile(
        recordid,
        "designs/" + this.generateddesign.id,
        imagedata,
        "electricalslocation",
        "design"
      )
      .subscribe(
        (response) => {
          this.generateddesign.electricalslocation = response;
          this.genericService.setNewGeneratedDesign(this.generateddesign);
          this.eventEmitterService.onPermitDesignGenerationStateChange(
            EVENTS_PERMIT_DESIGN.HideLoading
          );
          this.eventEmitterService.onPermitDesignGenerationStateChange(
            EVENTS_PERMIT_DESIGN.LocationMarkingSaved
          );
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }
}
