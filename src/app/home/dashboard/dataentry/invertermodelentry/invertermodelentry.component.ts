import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { Gallery, GalleryItem, ImageItem } from "@ngx-gallery/core";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { DataEntryService } from "src/app/_services/dataentry.service";

@Component({
  selector: "app-invertermodelentry",
  templateUrl: "./invertermodelentry.component.html",
  styleUrls: ["./invertermodelentry.component.scss"],
})
export class InvertermodelentryComponent implements OnInit {
  limit: number = 15;
  skip: number = 0;
  isoverviewloading: boolean = true;
  allinvertermodels = [];
  dataSource = [];

  tableColumns = [
    "Id",
    "name",
    "type",
    "phase",
    "rated",
    "invertermakename",
    "edit",
  ];
  scrolling: boolean = false;
  invertermakedata: [] = [];

  searchinvertermodel: string = "";
  issearchapplied: boolean;
  defaultvalue = "N/A";

  constructor(
    private dataentryservice: DataEntryService,
    private dialog: MatDialog,
    private notifyService: NotificationService
  ) { }

  ngOnInit(): void {
    this.getInverterModels();
  }

  getInverterModels(): void {
    let searchdata = "";
    if (this.issearchapplied) {
      searchdata =
        "_limit=" +
        this.limit +
        "&_start=" +
        this.skip +
        "&_q=" +
        this.searchinvertermodel;
    } else {
      searchdata = "_limit=" + this.limit + "&_start=" + this.skip;
    }
    this.dataentryservice.getInverterModelsData(searchdata).subscribe(
      (res) => {
        this.isoverviewloading = false;
        this.scrolling = false;
        if (res.length) {
          res.map((item) => {
            this.dataSource.push(item);
          });
          // this.allmodulemakes.push(res);
          this.allinvertermodels = [...this.dataSource];
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  ontableScroll(): void {
    this.scrolling = true;
    this.limit = 15;
    this.skip += 15;
    this.getInverterModels();
  }

  editInverterModel(data): void {
    const dialog = this.dialog.open(AddInvertermodelComponent, {
      width: "60%",
      disableClose: true,
      data: { data: data, isEditMode: true },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.isoverviewloading = true;
        this.dataSource = [];
        this.allinvertermodels = [];
        this.limit = 15;
        this.skip = 0;
        this.getInverterModels();
      }
    });
  }

  openAddInverterModel(): void {
    const dialog = this.dialog.open(AddInvertermodelComponent, {
      width: "60%",
      disableClose: true,
      data: { isEditMode: false },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.isoverviewloading = true;
        this.dataSource = [];
        this.allinvertermodels = [];
        this.limit = 15;
        this.skip = 0;
        this.getInverterModels();
      }
    });
  }

  searchinputinverter(): void {
    this.issearchapplied = true;
    this.dataSource.length = 0;
    this.allinvertermodels.length = 0;
    this.skip = 0;
    this.isoverviewloading = true;
    // this.c.detectChanges();
    // this.skeletonChart();
    this.getInverterModels();
  }
  clearinputfields(): void {
    this.searchinvertermodel = "";
    this.issearchapplied = false;
    this.dataSource.length = 0;
    this.allinvertermodels.length = 0;
    this.skip = 0;
    this.isoverviewloading = true;
    // this.cdr.detectChanges();
    // this.skeletonChart();
    this.getInverterModels();
  }
}

export interface AddModuleModel {
  data: any;
  isEditMode: boolean;
}

@Component({
  selector: "app-addinvertermodel",
  templateUrl: "./addinvertermodel.component.html",
  styleUrls: ["./invertermodelentry.component.scss"],
})
export class AddInvertermodelComponent implements OnInit {
  inverterModelFormGroup: FormGroup;
  invertermakedata: any[] = [];

  phase = new FormControl(null, [Validators.maxLength(10)]);
  ratedacvoltage = new FormControl(null, [Validators.maxLength(10)]);
  rateoutputpower = new FormControl(null, [Validators.maxLength(10)]);
  numberofmpptchannels = new FormControl(null, [Validators.maxLength(10)]);
  currentpermppta = new FormControl(null, [Validators.maxLength(10)]);
  maximuminputvoltage = new FormControl(null, [Validators.maxLength(10)]);
  nominalinputvoltage = new FormControl(null, [Validators.maxLength(10)]);
  startupvoltage = new FormControl(null, [Validators.maxLength(10)]);
  maximuminputcurrent = new FormControl(null, [Validators.maxLength(10)]);
  maximumoutputcurrent = new FormControl(null, [Validators.maxLength(10)]);
  cecefficiency = new FormControl(null, [Validators.maxLength(10)]);
  datasheetavailable = new FormControl(false);
  maximumocpdrating = new FormControl(null, [Validators.maxLength(10)]);
  name = new FormControl("", [
    Validators.required,
    Validators.pattern("^.*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
  ]);
  invertermake = new FormControl("", [Validators.required]);

  solarinvertercataloguefileuploaded: boolean = true;

  isLoading = false;
  loadingmessage = "";
  invertermakeerror = "You must select a value";
  catalogues: GalleryItem[];
  loggedinuser: User;

  constructor(
    private dataentryservice: DataEntryService,
    private notifyService: NotificationService,
    private dialogref: MatDialogRef<AddInvertermodelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddModuleModel,
    private commonservice: CommonService,
    private changeDetectorRef: ChangeDetectorRef,
    public gallery: Gallery,
    private loaderservice: LoaderService,
    private authService: AuthenticationService
  ) {
    this.loggedinuser = this.authService.currentUserValue.user;
    this.inverterModelFormGroup = new FormGroup({
      phase: this.phase,
      ratedacvoltage: this.ratedacvoltage,
      rateoutputpower: this.rateoutputpower,
      numberofmpptchannels: this.numberofmpptchannels,
      currentpermppta: this.currentpermppta,
      maximuminputvoltage: this.maximuminputvoltage,
      nominalinputvoltage: this.nominalinputvoltage,
      startupvoltage: this.startupvoltage,
      maximuminputcurrent: this.maximuminputcurrent,
      maximumoutputcurrent: this.maximumoutputcurrent,
      cecefficiency: this.cecefficiency,
      datasheetavailable: this.datasheetavailable,
      maximumocpdrating: this.maximumocpdrating,
      name: this.name,
      invertermake: this.invertermake,
    });

    // if(data.isEditMode){
    //   console.log(data.data)
    //   this.inverterModelFormGroup.patchValue({
    //     numberofcells: data.data?.numberofcells,
    //     isc: data.data?.isc,
    //     voc: data.data?.voc,
    //     ipmax: data.data?.ipmax,
    //     vpmax: data.data?.vpmax,
    //     tempcoefofvoc: data.data?.tempcoefofvoc,
    //     fuserating: data.data?.fuserating,
    //     length: data.data?.modellength,
    //     width: data.data?.modelwidth,
    //     area: data.data?.area,
    //     weight: data.data?.weight,
    //     name: data.data?.name
    //   })
    // }
    if (data.isEditMode) {
      this.inverterModelFormGroup.patchValue({
        phase: data.data?.phase,
        ratedacvoltage: data.data?.ratedacvoltage,
        rateoutputpower: data.data?.rateoutputpower,
        numberofmpptchannels: data.data?.numberofmpptchannels,
        currentpermppta: data.data?.currentpermppta,
        maximuminputvoltage: data.data?.maximuminputvoltage,
        nominalinputvoltage: data.data?.nominalinputvoltage,
        startupvoltage: data.data?.startupvoltage,
        maximuminputcurrent: data.data?.maximuminputcurrent,
        maximumoutputcurrent: data.data?.maximumoutputcurrent,
        cecefficiency: data.data?.cecefficiency,
        datasheetavailable: data.data?.datasheetavailable,
        maximumocpdrating: data.data?.maximumocpdrating,
        name: data.data?.name,
      });
    }
  }

  ngOnInit(): void {
    this.getInverterMake();
    if (this.data.isEditMode) {
      this.getCatalogues();
    }
  }

  getCatalogues(): void {
    this.commonservice
      .getCatalogues("inverterscatalogues", this.data.data?.name)
      .subscribe(
        (res: any) => {
          this.catalogues = res.map(
            (item) => new ImageItem({ src: item.url, thumb: item.url })
          );
          this.cataloguesGallery();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  cataloguesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("catalogues");
    lightboxGalleryRef.load(this.catalogues);
  }

  getInverterMake(): void {
    this.commonservice.getInverterMakesData().subscribe(
      (res: any) => {
        this.invertermakedata = res;
        if (this.data.isEditMode) {
          const toSelect = this.invertermakedata.find(
            (c) => c.name == this.data.data.invertermake?.name
          );
          this.invertermake.setValue(toSelect);
        }
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  getErrorMessage(control: FormControl): string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
  }

  saveInverterModelData(): void {
    if (this.inverterModelFormGroup.valid) {
      this.loaderservice.show();
      let postData;
      if (this.solarinvertercataloguefiles.length) {
        postData = {
          phase: this.phase.value,
          ratedacvoltage: this.ratedacvoltage.value
            ? this.ratedacvoltage.value
            : null,
          rateoutputpower: this.rateoutputpower.value
            ? this.rateoutputpower.value
            : null,
          numberofmpptchannels: this.numberofmpptchannels.value
            ? this.numberofmpptchannels.value
            : null,
          currentpermppta: this.currentpermppta.value
            ? this.currentpermppta.value
            : null,
          maximuminputvoltage: this.maximuminputvoltage.value
            ? this.maximuminputvoltage.value
            : null,
          nominalinputvoltage: this.nominalinputvoltage.value
            ? this.nominalinputvoltage.value
            : null,
          startupvoltage: this.startupvoltage.value
            ? this.startupvoltage.value
            : null,
          maximuminputcurrent: this.maximuminputcurrent.value
            ? this.maximuminputcurrent.value
            : null,
          maximumoutputcurrent: this.maximumoutputcurrent.value
            ? this.maximumoutputcurrent.value
            : null,
          cecefficiency: this.cecefficiency.value
            ? this.cecefficiency.value
            : null,
          datasheetavailable: this.datasheetavailable.value,
          maximumocpdrating: this.maximumocpdrating.value
            ? this.maximumocpdrating.value
            : null,
          name: this.name.value,
          invertermake: this.invertermake.value.id,
          createdby: this.loggedinuser.id,
          cataloguesuploaded: true,
        };
      } else {
        postData = {
          phase: this.phase.value,
          ratedacvoltage: this.ratedacvoltage.value
            ? this.ratedacvoltage.value
            : null,
          rateoutputpower: this.rateoutputpower.value
            ? this.rateoutputpower.value
            : null,
          numberofmpptchannels: this.numberofmpptchannels.value
            ? this.numberofmpptchannels.value
            : null,
          currentpermppta: this.currentpermppta.value
            ? this.currentpermppta.value
            : null,
          maximuminputvoltage: this.maximuminputvoltage.value
            ? this.maximuminputvoltage.value
            : null,
          nominalinputvoltage: this.nominalinputvoltage.value
            ? this.nominalinputvoltage.value
            : null,
          startupvoltage: this.startupvoltage.value
            ? this.startupvoltage.value
            : null,
          maximuminputcurrent: this.maximuminputcurrent.value
            ? this.maximuminputcurrent.value
            : null,
          maximumoutputcurrent: this.maximumoutputcurrent.value
            ? this.maximumoutputcurrent.value
            : null,
          cecefficiency: this.cecefficiency.value
            ? this.cecefficiency.value
            : null,
          datasheetavailable: this.datasheetavailable.value,
          maximumocpdrating: this.maximumocpdrating.value
            ? this.maximumocpdrating.value
            : null,
          name: this.name.value,
          invertermake: this.invertermake.value.id,
          createdby: this.loggedinuser.id,
          cataloguesuploaded: false,
        };
      }
      if (!this.data?.isEditMode) {
        this.dataentryservice.saveInverterModelData(postData).subscribe(
          (response) => {
            if (this.solarinvertercataloguefiles.length) {
              this.isLoading = true;
              this.uploadSolarModuleCatalogue(response);
            } else {
              this.notifyService.showSuccess(
                "Inverter model created successfully",
                "Success"
              );
              this.dialogref.close(response);
            }
          },
          (error) => {
            this.loaderservice.hide();
            this.notifyService.showError(error, "Error");
          }
        );
      } else {
        this.dataentryservice
          .editInverterModelData(postData, this.data.data.id)
          .subscribe(
            (response) => {
              if (this.solarinvertercataloguefiles.length) {
                this.isLoading = true;
                this.uploadSolarModuleCatalogue(response);
              } else {
                this.notifyService.showSuccess(
                  "Inverter model updated successfully",
                  "Success"
                );
                this.dialogref.close(response);
              }
            },
            (error) => {
              this.loaderservice.hide();
              this.notifyService.showError(error, "Error");
            }
          );
      }
    } else {
      this.inverterModelFormGroup.markAllAsTouched();
    }
  }

  onCloseClick(): void {
    this.dialogref.close();
  }

  onSolarModuleSelect(event): void {
    this.solarinvertercataloguefileuploaded = true;
    event.addedFiles.forEach((element) => {
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
    });
    this.solarinvertercataloguefiles.push(...event.addedFiles);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }
  onSolarModuleRemove(event): void {
    this.solarinvertercataloguefiles.splice(
      this.solarinvertercataloguefiles.indexOf(event),
      1
    );
    if (this.solarinvertercataloguefiles.length == 0) {
      this.solarinvertercataloguefileuploaded = false;
    }
  }
  solarinvertercataloguefiles: File[] = [];
  uploadSolarModuleCatalogue(value): void {
    this.loadingmessage = "Uploading inverter model catalogue files";
    this.commonservice
      .uploadFilesToAWS(
        "inverterscatalogues/" + this.name.value.toLowerCase(),
        this.solarinvertercataloguefiles
      )
      .subscribe(
        () => {
          this.isLoading = false;

          if (!this.data.isEditMode) {
            this.notifyService.showSuccess(
              "Inverter model created and Catalogue file uploaded successfully",
              "Success"
            );
          } else {
            this.notifyService.showSuccess(
              "Inverter model updated and Catalogue file uploaded successfully",
              "Success"
            );
          }
          this.dialogref.close(value);
        },
        (error) => {
          this.isLoading = false;
          this.loaderservice.hide();
          this.notifyService.showError(error, "Error");
        }
      );
  }
}
