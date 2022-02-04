import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Apps } from "src/app/_models/apps";
import { NotificationService } from "src/app/_services";
import { AppsService } from "src/app/_services/apps.service";

export interface AddKeyFormData {
  triggerEditEvent: boolean;
  isEditMode: boolean;
  isDataUpdated: boolean;
  user: Apps;
}

@Component({
  selector: "app-addapps",
  templateUrl: "./addapps.component.html",
  styleUrls: ["./addapps.component.scss"],
})
export class AddappsComponent implements OnInit {
  isLoading = false;
  loadingmessage = "Saving Data";
  addAppsDialogForm: FormGroup;

  name = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z]{3,}$"),
  ]);

  mode = new FormControl("", Validators.required);
  displayerror = true;

  constructor(
    public dialogRef: MatDialogRef<AddappsComponent>,
    private appService: AppsService,
    private notifyService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: AddKeyFormData
  ) {
    this.addAppsDialogForm = new FormGroup({
      name: this.name,
      mode: this.mode,
    });
    if (data.isEditMode) {
      this.addAppsDialogForm.patchValue({
        name: data.user.name,
        mode: data.user.mode,
      });
    }

    this.mode.setValue("live");
  }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  getErrorMessage(control: FormControl): string | string | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    if (control == this.name) {
      return this.name.hasError("pattern")
        ? "Name should be of min. 3 characters and contain only alphabets."
        : "";
    }
  }

  addNewApp(): void {
    if (this.addAppsDialogForm.valid) {
      if (this.data.isEditMode) {
        const postData = {
          name: this.addAppsDialogForm.get("name").value,
        };
        this.appService
          .editapps(this.data.user.id, postData)
          .subscribe((response) => {
            this.notifyService.showSuccess(
              "App is updated successfully.",
              "Success"
            );
            this.data.triggerEditEvent = true;
            this.data.isDataUpdated = true;
            this.data.user = response;
            this.dialogRef.close(this.data);
          });
      } else {
        const postData = {
          name: this.addAppsDialogForm.get("name").value,
          mode: this.addAppsDialogForm.get("mode").value,
          region: "US",
          version: "V1",
        };
        this.appService.addapps(postData).subscribe(
          (response) => {
            this.notifyService.showSuccess(
              "App is created successfully.",
              "Success"
            );
            this.data.triggerEditEvent = true;
            this.data.isDataUpdated = true;
            this.data.user = response;
            this.dialogRef.close(this.data);
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
}
