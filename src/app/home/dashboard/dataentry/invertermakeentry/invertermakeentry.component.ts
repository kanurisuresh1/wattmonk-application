import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { InverterMake, User } from "src/app/_models";
import {
  AuthenticationService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { DataEntryService } from "src/app/_services/dataentry.service";

@Component({
  selector: "app-invertermakeentry",
  templateUrl: "./invertermakeentry.component.html",
  styleUrls: ["./invertermakeentry.component.scss"],
})
export class InvertermakeentryComponent implements OnInit {
  limit: number = 15;
  skip: number = 0;
  isoverviewloading: boolean = true;
  allinvertermakes = [];
  dataSource = [];

  tableColumns = ["Id", "name", "edit"];
  scrolling: boolean = false;

  searchinvertermake: string = "";
  issearchapplied: boolean;

  constructor(
    private dataentryservice: DataEntryService,
    private dialog: MatDialog,
    private notifyService: NotificationService
  ) { }

  ngOnInit(): void {
    this.getInverterMake();
  }

  getInverterMake(): void {
    let searchdata = "";
    if (this.issearchapplied) {
      searchdata =
        "_limit=" +
        this.limit +
        "&_start=" +
        this.skip +
        "&_q=" +
        this.searchinvertermake;
    } else {
      searchdata = "_limit=" + this.limit + "&_start=" + this.skip;
    }
    this.dataentryservice.getInverterMakesData(searchdata).subscribe(
      (res) => {
        this.isoverviewloading = false;
        this.scrolling = false;
        if (res.length) {
          res.map((item) => {
            this.dataSource.push(item);
          });
          // this.allmodulemakes.push(res);
          this.allinvertermakes = [...this.dataSource];
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
    this.getInverterMake();
  }

  openAddInverterMake(): void {
    const dialog = this.dialog.open(AddInvertermakeComponent, {
      width: "30%",
      disableClose: true,
      data: { isEditMode: false },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.isoverviewloading = true;
        this.dataSource = [];
        this.allinvertermakes = [];
        this.limit = 15;
        this.skip = 0;
        this.getInverterMake();
      }
    });
  }

  editInverterMake(data): void {
    const dialog = this.dialog.open(AddInvertermakeComponent, {
      width: "30%",
      disableClose: true,
      data: { data: data, isEditMode: true },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.isoverviewloading = true;
        this.dataSource = [];
        this.allinvertermakes = [];
        this.limit = 15;
        this.skip = 0;
        this.getInverterMake();
      }
    });
  }

  searchinputinverter(): void {
    this.issearchapplied = true;
    this.dataSource.length = 0;
    this.allinvertermakes.length = 0;
    this.skip = 0;
    this.isoverviewloading = true;
    // this.c.detectChanges();
    // this.skeletonChart();
    this.getInverterMake();
  }
  clearinputfields(): void {
    this.searchinvertermake = "";
    this.issearchapplied = false;
    this.dataSource.length = 0;
    this.allinvertermakes.length = 0;
    this.skip = 0;
    this.isoverviewloading = true;
    // this.cdr.detectChanges();
    // this.skeletonChart();
    this.getInverterMake();
  }
}

export interface AddInverterMake {
  data: InverterMake;
  isEditMode: boolean;
}

@Component({
  selector: "app-addinvertermake",
  templateUrl: "./addinvertermake.component.html",
  styleUrls: ["./invertermakeentry.component.scss"],
})
export class AddInvertermakeComponent implements OnInit {
  solarinvertermakeFormGroup: FormGroup;
  name = new FormControl("", [
    Validators.required,
    Validators.pattern("^.*\\S.*[a-zA-Z-_ ]{2,}$"),
  ]);
  loggedinuser: User;

  constructor(
    private dataentryservice: DataEntryService,
    private dialogref: MatDialogRef<AddInvertermakeComponent>,
    private authService: AuthenticationService,
    private notifyService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: AddInverterMake,
    private loaderservice: LoaderService
  ) {
    this.loggedinuser = this.authService.currentUserValue.user;
    this.solarinvertermakeFormGroup = new FormGroup({
      name: this.name,
    });

    if (data.isEditMode) {
      this.solarinvertermakeFormGroup.patchValue({
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

  saveInverterMakeData(): void {
    if (this.solarinvertermakeFormGroup.valid) {
      this.loaderservice.show();
      if (!this.data.isEditMode) {
        const postData = {
          name: this.name.value,
          createdby: this.loggedinuser.id,
        };
        this.dataentryservice.saveInverterMakeData(postData).subscribe(
          (response) => {
            this.loaderservice.hide();
            this.dialogref.close(response);
            this.notifyService.showSuccess(
              "Inverter make created successfully",
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
          .editInverterMakeData(postData, this.data.data.id)
          .subscribe(
            (response) => {
              this.loaderservice.hide();
              this.dialogref.close(response);
              this.notifyService.showSuccess(
                "Inverter make updated successfully",
                "Success"
              );
            },
            (error) => {
              this.loaderservice.hide();
              this.notifyService.showError(error, "Error");
            }
          );
      }
    } else {
      this.solarinvertermakeFormGroup.markAllAsTouched();
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
