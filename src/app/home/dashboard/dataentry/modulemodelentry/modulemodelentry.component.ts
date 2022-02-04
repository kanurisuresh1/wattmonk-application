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
  selector: "app-modulemodelentry",
  templateUrl: "./modulemodelentry.component.html",
  styleUrls: ["./modulemodelentry.component.scss"],
})
export class ModulemodelentryComponent implements OnInit {
  limit: number = 15;
  skip: number = 0;
  isoverviewloading: boolean = true;
  allmodulemodels = [];
  dataSource = [];

  tableColumns = [
    "Id",
    "name",
    "area",
    "weight",
    "description",
    "modulemakename",
    "edit",
  ];
  scrolling: boolean = false;

  searchmodule: string = "";
  issearchapplied: boolean;

  loggedinuser: User;
  defaultvalue = "N/A";

  constructor(
    private dataentryservice: DataEntryService,
    private dialog: MatDialog,
    private authService: AuthenticationService,
    private notifyService: NotificationService
  ) {
    this.loggedinuser = this.authService.currentUserValue.user;
  }

  ngOnInit(): void {
    this.getModuleModels();
  }

  getModuleModels(): void {
    let searchdata = "";
    if (this.issearchapplied) {
      searchdata =
        "_limit=" +
        this.limit +
        "&_start=" +
        this.skip +
        "&_q=" +
        this.searchmodule;
    } else {
      searchdata = "_limit=" + this.limit + "&_start=" + this.skip;
    }
    this.dataentryservice.getModuleModelsData(searchdata).subscribe(
      (res) => {
        this.isoverviewloading = false;
        this.scrolling = false;
        if (res.length) {
          res.map((item) => {
            this.dataSource.push(item);
          });
          // this.allmodulemakes.push(res);
          this.allmodulemodels = [...this.dataSource];
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
    this.getModuleModels();
  }

  editModuleModel(data): void {
    const dialog = this.dialog.open(AddModulemodelComponent, {
      width: "60%",
      disableClose: true,
      data: { data: data, isEditMode: true },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.isoverviewloading = true;
        this.dataSource = [];
        this.allmodulemodels = [];
        this.limit = 15;
        this.skip = 0;
        this.getModuleModels();
      }
    });
  }

  openAddModuleModel(): void {
    const dialog = this.dialog.open(AddModulemodelComponent, {
      width: "60%",
      disableClose: true,
      data: { isEditMode: false },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.isoverviewloading = true;
        this.dataSource = [];
        this.allmodulemodels = [];
        this.limit = 15;
        this.skip = 0;
        this.getModuleModels();
      }
    });
  }

  //** on searching in input fields same function is use */
  searchinputmodule(): void {
    this.issearchapplied = true;
    this.dataSource.length = 0;
    this.allmodulemodels.length = 0;
    this.skip = 0;
    this.isoverviewloading = true;
    // this.c.detectChanges();
    // this.skeletonChart();
    this.getModuleModels();
  }
  clearinputfields(): void {
    this.searchmodule = "";
    this.issearchapplied = false;
    this.dataSource.length = 0;
    this.allmodulemodels.length = 0;
    this.skip = 0;
    this.isoverviewloading = true;
    // this.cdr.detectChanges();
    // this.skeletonChart();
    this.getModuleModels();
  }
}

export interface AddModuleModel {
  data: any;
  isEditMode: boolean;
}

@Component({
  selector: "app-addmodulemodel",
  templateUrl: "./addmodulemodel.component.html",
  styleUrls: ["./modulemodelentry.component.scss"],
})
export class AddModulemodelComponent implements OnInit {
  solarmoduleFormGroup: FormGroup;

  numberofcells = new FormControl(null, [Validators.maxLength(10)]);
  isc = new FormControl(null, [Validators.maxLength(10)]);
  voc = new FormControl(null, [Validators.maxLength(10)]);
  ipmax = new FormControl(null, [Validators.maxLength(10)]);
  vpmax = new FormControl(null, [Validators.maxLength(10)]);
  tempcoefofvoc = new FormControl(null, [Validators.maxLength(10)]);
  fuserating = new FormControl(null, [Validators.maxLength(10)]);
  modulelength = new FormControl(null, [Validators.maxLength(10)]);
  width = new FormControl(null, [Validators.maxLength(10)]);
  area = new FormControl(null, [Validators.maxLength(10)]);
  weight = new FormControl(null, [Validators.maxLength(10)]);
  name = new FormControl("", [
    Validators.required,
    Validators.pattern(".*\\S.*[a-z0-9A-Z+-_([)/. {\\]}]{2,}$"),
  ]);
  modulemake = new FormControl(null, [Validators.required]);
  description = new FormControl("");

  modulemakedata: any[] = [];
  solarmodulecataloguefileuploaded: boolean = true;

  isLoading = false;
  loadingmessage = "";
  modulemakeerror = "You must select a value";
  catalogues: GalleryItem[];
  loggedinuser: User;

  constructor(
    private dataentryservice: DataEntryService,
    private notifyService: NotificationService,
    private dialogref: MatDialogRef<AddModulemodelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddModuleModel,
    private commonservice: CommonService,
    private changeDetectorRef: ChangeDetectorRef,
    public gallery: Gallery,
    private loaderservice: LoaderService,
    private authService: AuthenticationService
  ) {
    this.loggedinuser = this.authService.currentUserValue.user;
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
      weight: this.weight,
      name: this.name,
      modulemake: this.modulemake,
      description: this.description,
    });

    if (data.isEditMode) {
      this.solarmoduleFormGroup.patchValue({
        numberofcells: data.data?.numberofcells,
        isc: data.data?.isc,
        voc: data.data?.voc,
        ipmax: data.data?.ipmax,
        vpmax: data.data?.vpmax,
        tempcoefofvoc: data.data?.tempcoefofvoc,
        fuserating: data.data?.fuserating,
        length: data.data?.length
          ? data.data?.length
          : data.data?.modellength
            ? data.data?.modellength
            : null,
        width: data.data?.width
          ? data.data?.width
          : data.data?.modelwidth
            ? data.data?.modelwidth
            : null,
        area: data.data?.area,
        weight: data.data?.weight,
        name: data.data?.name,
        description: data.data?.description,
        // modulemake: data.data?.modulemake
      });
    }
  }

  ngOnInit(): void {
    this.getModuleMake();
    if (this.data.isEditMode) {
      this.getCatalogues();
    }
  }

  getCatalogues(): void {
    this.commonservice
      .getCatalogues("modulescatalogues", this.data.data?.name)
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

  getModuleMake(): void {
    this.commonservice.getModuleMakesData().subscribe(
      (res: any) => {
        this.modulemakedata = res;
        if (this.data.isEditMode) {
          const toSelect = this.modulemakedata.find(
            (c) => c.name == this.data.data.modulemake?.name
          );
          this.modulemake.setValue(toSelect);
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

  saveSingleModuleData(): void {
    if (this.solarmoduleFormGroup.valid) {
      this.loaderservice.show();
      let postData;
      if (this.solarmodulecataloguefiles.length) {
        postData = {
          numberofcells: this.numberofcells.value
            ? this.numberofcells.value
            : null,
          isc: this.isc.value ? this.isc.value : null,
          voc: this.voc.value ? this.voc.value : null,
          ipmax: this.ipmax.value ? this.ipmax.value : null,
          vpmax: this.vpmax.value ? this.vpmax.value : null,
          tempcoefofvoc: this.tempcoefofvoc.value
            ? this.tempcoefofvoc.value
            : null,
          fuserating: this.fuserating.value ? this.fuserating.value : null,
          modellength: this.modulelength.value ? this.modulelength.value : null,
          modelwidth: this.width.value ? this.width.value : null,
          area: this.area.value ? this.area.value : null,
          weight: this.weight.value ? this.weight.value : null,
          name: this.name.value,
          modulemake: this.modulemake.value.id,
          description: this.description.value,
          createdby: this.loggedinuser.id,
          cataloguesuploaded: true,
        };
      } else {
        postData = {
          numberofcells: this.numberofcells.value
            ? this.numberofcells.value
            : null,
          isc: this.isc.value ? this.isc.value : null,
          voc: this.voc.value ? this.voc.value : null,
          ipmax: this.ipmax.value ? this.ipmax.value : null,
          vpmax: this.vpmax.value ? this.vpmax.value : null,
          tempcoefofvoc: this.tempcoefofvoc.value
            ? this.tempcoefofvoc.value
            : null,
          fuserating: this.fuserating.value ? this.fuserating.value : null,
          modellength: this.modulelength.value ? this.modulelength.value : null,
          modelwidth: this.width.value ? this.width.value : null,
          area: this.area.value ? this.area.value : null,
          weight: this.weight.value ? this.weight.value : null,
          name: this.name.value,
          modulemake: this.modulemake.value.id,
          description: this.description.value,
          createdby: this.loggedinuser.id,
          cataloguesuploaded: false,
        };
      }
      if (!this.data.isEditMode) {
        this.dataentryservice.saveModuleModelData(postData).subscribe(
          (response) => {
            if (this.solarmodulecataloguefiles.length) {
              this.isLoading = true;
              this.uploadSolarModuleCatalogue(response);
            } else {
              this.notifyService.showSuccess(
                "Module model created successfully",
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
          .editModuleModelData(postData, this.data.data.id)
          .subscribe(
            (response) => {
              if (this.solarmodulecataloguefiles.length) {
                this.isLoading = true;
                this.uploadSolarModuleCatalogue(response);
              } else {
                this.notifyService.showSuccess(
                  "Module model updated successfully",
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
      this.solarmoduleFormGroup.markAllAsTouched();
    }
  }

  onCloseClick(): void {
    this.dialogref.close();
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
      this.changeDetectorRef.detectChanges();
    }, 300);
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
  solarmodulecataloguefiles: File[] = [];
  uploadSolarModuleCatalogue(value): void {
    this.loadingmessage = "Uploading module model catalogue files";
    this.commonservice
      .uploadFilesToAWS(
        "modulescatalogues/" + this.name.value.toLowerCase(),
        this.solarmodulecataloguefiles
      )
      .subscribe(
        () => {
          this.isLoading = false;

          if (!this.data.isEditMode) {
            this.notifyService.showSuccess(
              "Module model created and Catalogue file uploaded successfully",
              "Success"
            );
          } else {
            this.notifyService.showSuccess(
              "Module model updated and Catalogue file uploaded successfully",
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
