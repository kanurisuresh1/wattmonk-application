import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { ModuleMake, User } from "src/app/_models";
import {
  AuthenticationService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { DataEntryService } from "src/app/_services/dataentry.service";

@Component({
  selector: "app-modulemakeentry",
  templateUrl: "./modulemakeentry.component.html",
  styleUrls: ["./modulemakeentry.component.scss"],
})
export class ModulemakeentryComponent implements OnInit {
  limit: number = 15;
  skip: number = 0;
  isoverviewloading: boolean = true;
  allmodulemakes = [];
  dataSource = [];

  tableColumns = ["Id", "name", "edit"];
  scrolling: boolean = false;

  searchmodulemake: string = "";
  issearchapplied: boolean;

  constructor(
    private dataentryservice: DataEntryService,
    private dialog: MatDialog,
    private notifyService: NotificationService
  ) { }

  ngOnInit(): void {
    this.getModuleMake();
  }

  getModuleMake(): void {
    let searchdata = "";
    if (this.issearchapplied) {
      searchdata =
        "_limit=" +
        this.limit +
        "&_start=" +
        this.skip +
        "&_q=" +
        this.searchmodulemake;
    } else {
      searchdata = "_limit=" + this.limit + "&_start=" + this.skip;
    }
    this.dataentryservice.getModuleMakesData(searchdata).subscribe((res) => {
      this.isoverviewloading = false;
      this.scrolling = false;
      if (res.length) {
        res.map((item) => {
          this.dataSource.push(item);
        })
        // this.allmodulemakes.push(res);
        this.allmodulemakes = [...this.dataSource];
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
    this.getModuleMake();
  }

  openAddModuleMake(): void {
    const dialog = this.dialog.open(AddModulemakeComponent, {
      width: "30%",
      disableClose: true,
      data: { isEditMode: false },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.isoverviewloading = true;
        this.dataSource = [];
        this.allmodulemakes = [];
        this.limit = 15;
        this.skip = 0;
        this.getModuleMake();
      }
    });
  }

  editModuleMake(data): void {
    const dialog = this.dialog.open(AddModulemakeComponent, {
      width: "30%",
      disableClose: true,
      data: { data: data, isEditMode: true },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.isoverviewloading = true;
        this.dataSource = [];
        this.allmodulemakes = [];
        this.limit = 15;
        this.skip = 0;
        this.getModuleMake();
      }
    });
  }

  searchinputmodule(): void {
    this.issearchapplied = true;
    this.dataSource.length = 0;
    this.allmodulemakes.length = 0;
    this.skip = 0;
    this.isoverviewloading = true;
    // this.c.detectChanges();
    // this.skeletonChart();
    this.getModuleMake();
  }
  clearinputfields(): void {
    this.searchmodulemake = "";
    this.issearchapplied = false;
    this.dataSource.length = 0;
    this.allmodulemakes.length = 0;
    this.skip = 0;
    this.isoverviewloading = true;
    // this.cdr.detectChanges();
    // this.skeletonChart();
    this.getModuleMake();
  }
}

export interface AddModuleMake {
  data: ModuleMake;
  isEditMode: boolean;
}

@Component({
  selector: "app-addmodulemake",
  templateUrl: "./addmodulemake.component.html",
  styleUrls: ["./modulemakeentry.component.scss"],
})
export class AddModulemakeComponent implements OnInit {
  solarmodulemakeFormGroup: FormGroup;
  name = new FormControl("", [
    Validators.required,
    Validators.pattern("^.*\\S.*[a-zA-Z- ]{2,}$"),
  ]);
  loggedinuser: User;

  constructor(
    private dataentryservice: DataEntryService,
    private dialogref: MatDialogRef<AddModulemakeComponent>,
    private authService: AuthenticationService,
    private notifyService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: AddModuleMake,
    private loaderservice: LoaderService
  ) {
    this.loggedinuser = this.authService.currentUserValue.user;
    this.solarmodulemakeFormGroup = new FormGroup({
      name: this.name,
    });

    if (data.isEditMode) {
      this.solarmodulemakeFormGroup.patchValue({
        // numberofcells: response?.numberofcells,
        // isc: response?.isc,
        // voc: response?.voc,
        // ipmax: response?.ipmax,
        // vpmax: response?.vpmax,
        // tempcoefofvoc: response?.tempcoefofvoc,
        // fuserating: response?.fuserating,
        // length: response?.modellength,
        // width: response?.modelwidth,
        // area: response?.area,
        // weight: response?.weight
        name: data.data?.name,
      });
    }
  }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.dialogref.close();
  }

  saveSingleModuleMakeData(): void {
    if (this.solarmodulemakeFormGroup.valid) {
      this.loaderservice.show();
      if (!this.data.isEditMode) {
        const postData = {
          name: this.name.value,
          createdby: this.loggedinuser.id,
        };
        this.dataentryservice.saveModuleMakeData(postData).subscribe(
          (response) => {
            this.loaderservice.hide();
            this.dialogref.close(response);
            this.notifyService.showSuccess(
              "Module make created successfully",
              "Success"
            );
          },
          (error) => {
            this.loaderservice.hide();
            this.notifyService.showError(error, "Error");
          }
        );
      } else {
        const postData = {
          name: this.name.value,
          // createdby : this.loggedinuser.id
        };
        this.dataentryservice
          .editModuleMakeData(postData, this.data.data.id)
          .subscribe(
            (response) => {
              this.loaderservice.hide();
              this.notifyService.showSuccess(
                "Module make updated successfully",
                "Success"
              );
              this.dialogref.close(response);
            },
            (error) => {
              this.loaderservice.hide();
              this.notifyService.showError(error, "Error");
            }
          );
      }
    } else {
      this.solarmodulemakeFormGroup.markAllAsTouched();
    }
  }

  getErrorMessage(control: FormControl): string | string | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    if (control == this.name) {
      return this.name.hasError("pattern") ? "Please enter a valid format" : "";
    }
  }
}
