import { Location } from "@angular-material-extensions/google-maps-autocomplete";
import { HttpClient } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { ADDRESSFORMAT, MAILFORMAT, NAME } from "src/app/_helpers";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { ProbabilityService } from "src/app/_services/probability.service";
import PlaceResult = google.maps.places.PlaceResult;

export interface Customer {
  customer: any;
  devicecount: number;
  isEditMode: boolean;
}

@Component({
  selector: "app-customerprobabilityform",
  templateUrl: "./customerprobabilityform.component.html",
  styleUrls: ["./customerprobabilityform.component.scss"],
})
export class CustomerprobabilityformComponent implements OnInit {
  customerForm: FormGroup;
  name = new FormControl("", [
    Validators.required,
    Validators.minLength(2),
    Validators.pattern(NAME),
  ]);
  email = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  phone = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("^[0-9]{8,15}$"),
  ]);
  address = new FormControl("", [
    Validators.required,
    Validators.pattern(ADDRESSFORMAT),
  ]);
  county = new FormControl("", [Validators.required]);
  city = new FormControl("", [Validators.required]);
  state = new FormControl("", [Validators.required]);
  zipcode = new FormControl("", [Validators.required]);

  solarcapacity = new FormControl("", [Validators.required, Validators.min(1)]);
  annualprod = new FormControl("", [Validators.required, Validators.min(1)]);
  noofroof = new FormControl("", [
    Validators.required,
    Validators.min(0),
    Validators.max(27),
  ]);
  detachedbuildings = new FormControl("", [
    Validators.required,
    Validators.pattern("[0-9]"),
    Validators.min(0),
    Validators.max(6),
  ]);
  solararea = new FormControl("", [Validators.required, Validators.min(1)]);
  contract = new FormControl("", [Validators.required]);

  formatted_address: string;
  postalcode: string;
  // city: string = "";
  // state: string = "";
  country: string;
  latitude = null;
  longitude = null;

  selectedSiteLocation: Location;
  ipAddress: any;
  loggedInUser: User;
  // isaddressselected: boolean =false;
  contracterror = "You must select a value";

  constructor(
    // private commonService: CommonService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<CustomerprobabilityformComponent>,
    private probabilityService: ProbabilityService,
    private authSerivce: AuthenticationService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Customer,
    private notifyService: NotificationService,
    private loaderService: LoaderService
  ) {
    this.loggedInUser = this.authSerivce.currentUserValue?.user;
    this.customerForm = new FormGroup({
      email: this.email,
      name: this.name,
      phone: this.phone,
      address: this.address,
      county: this.county,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      solarcapacity: this.solarcapacity,
      annualprod: this.annualprod,
      noofroof: this.noofroof,
      detachedbuildings: this.detachedbuildings,
      solararea: this.solararea,
      contract: this.contract,
    });
    if (data.isEditMode) {
      this.customerForm.patchValue({
        name: data.customer?.name,
        email: data.customer?.email,
        phone: data.customer?.phone,
        address: data.customer?.address,
        city: data.customer?.city,
        state: data.customer?.state,
        county: data.customer?.county,
        zipcode: data.customer?.zipcode,
        solarcapacity: data.customer?.solarcapacity,
        annualprod: data.customer?.annualprod,
        noofroof: data.customer?.numberofroofs,
        detachedbuildings: data.customer?.numberofdetachbuildings,
        solararea: data.customer?.solararrayarea,
        contract: data.customer?.contracttype,
      });
    }
  }

  ngOnInit(): void {
    this.getIPAddress();
  }

  getErrorMessage(
    control: FormControl
  ):
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string
    | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    if (control == this.name) {
      return this.name.hasError("pattern")
        ? "Name must contain only alphabets."
        : this.name.hasError("minlength")
          ? "Name should be of min 2 character."
          : "";
    }
    // if (control == this.modeofstamping && control.hasError("required")) {
    //   return "You must select a value";
    // }
    // if (control == this.type && control.hasError("required")) {
    //   return "You must select a value";
    // }
    else if (control == this.email) {
      return this.email.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    } else if (control == this.phone) {
      return this.phone.hasError("pattern")
        ? "Please enter a valid phone number(Min - 8, Max - 15)."
        : "Phone should be of min. 8 and max. 15 characters.";
    }
    // else if (control == this.monthlybill) {
    //   return this.monthlybill.hasError("pattern")
    //     ? "Please enter a valid annual unit."
    //     : "zero value is not accepted";
    // }
    else if (control == this.address) {
      return this.address.hasError("pattern")
        ? "Please enter a valid address."
        : "";
    } else if (control == this.zipcode) {
      return this.zipcode.hasError("minlength")
        ? "zipcode should be of min. 4 and max. 5 characters."
        : "";
    } else if (control == this.solarcapacity) {
      // if()
      return this.solarcapacity.hasError("min")
        ? "Value should be greater than 0"
        : "";
    } else if (control == this.annualprod) {
      // if()
      return this.annualprod.hasError("min")
        ? "Value should be greater than 0"
        : "";
    } else if (control == this.noofroof) {
      // if()
      return this.noofroof.hasError("min") || this.noofroof.hasError("max")
        ? "Value should be in range 0 and 27"
        : "";
    } else if (control == this.detachedbuildings) {
      // if()
      return this.detachedbuildings.hasError("min") ||
        this.detachedbuildings.hasError("max")
        ? "Value should be in range 0 and 6"
        : "";
    } else if (control == this.solararea) {
      // if()
      return this.solararea.hasError("min")
        ? "Value should be greater than 0"
        : "";
    }
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onAutocompleteSelected(result: PlaceResult): void {
    // this.isaddressselected = true;
    this.formatted_address = result.formatted_address;
    for (let i = 0; i < result.address_components.length; i++) {
      for (let j = 0; j < result.address_components[i].types.length; j++) {
        if (result.address_components[i].types[j] == "postal_code") {
          this.zipcode.patchValue(result.address_components[i].long_name);
        } else if (result.address_components[i].types[j] == "country") {
          this.county.patchValue(result.address_components[i].long_name);
        } else if (
          result.address_components[i].types[j] == "administrative_area_level_1"
        ) {
          this.state.patchValue(result.address_components[i].long_name);
        } else if (
          result.address_components[i].types[j] == "administrative_area_level_2"
        ) {
          this.city.patchValue(result.address_components[i].long_name);
        }
      }
    }
  }

  onLocationSelected(location: Location): void {
    this.selectedSiteLocation = location;
  }

  generateProbability(): void {
    if (this.customerForm.valid) {
      this.loaderService.show();
      // if(this.isaddressselected){
      if (this.data.isEditMode) {
        this.editCustomerProbability();
      } else {
        let address;
        if (this.selectedSiteLocation) {
          address = this.formatted_address;
        } else {
          address = this.address.value;
        }
        let postData;
        if (this.loggedInUser) {
          postData = {
            name: this.name.value,
            phone: this.phone.value,
            address: address,
            email: this.email.value,
            city: this.city.value,
            state: this.state.value,
            zipcode: this.zipcode.value,
            // deviceid : this.ipAddress
            creatorparentid: this.loggedInUser.parent.id,
            deviceid: this.ipAddress,
            county: this.county.value,
            solarcapacity: this.solarcapacity.value,
            annualprod: this.annualprod.value,
            numberofroofs: this.noofroof.value,
            numberofdetachbuildings: this.detachedbuildings.value,
            solararrayarea: this.solararea.value,
            contracttype: this.contract.value,
          };
        } else {
          postData = {
            name: this.name.value,
            phone: this.phone.value,
            address: address,
            email: this.email.value,
            city: this.city.value,
            state: this.state.value,
            zipcode: this.zipcode.value,
            deviceid: this.ipAddress,
            county: this.county.value,
            solarcapacity: this.solarcapacity.value,
            annualprod: this.annualprod.value,
            numberofroofs: this.noofroof.value,
            numberofdetachbuildings: this.detachedbuildings.value,
            solararrayarea: this.solararea.value,
            contracttype: this.contract.value,
          };
        }

        this.probabilityService.customerProbability(postData).subscribe(
          (res: any) => {
            if (!this.loggedInUser) {
              this.data.customer = res;
              this.loaderService.hide();
              this.probabilityService.getDeviceCount(this.ipAddress).subscribe(
                (response: number) => {
                  this.data.devicecount = response;
                  this.dialogRef.close(this.data);
                },
                (error) => {
                  this.notifyService.showError(error, "Error");
                }
              );
            } else {
              this.dialogRef.close(res);
            }
            // this.doughnutChartMethod();
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
      }
      // }else{
      //   this.notifyService.showWarning("Please select address from drop down","Warning");
      // }
    } else {
      // this.displayerror = false;
      // this.displayerror = false;
      this.customerForm.markAllAsTouched();
      // this.updateInvalidExpansionPanels();
      // this.changeDetectorRef.detectChanges();
    }
  }

  editCustomerProbability(): void {
    let address;
    if (this.selectedSiteLocation) {
      address = this.formatted_address;
    } else {
      address = this.address.value;
    }

    const postData = {
      name: this.name.value,
      phone: this.phone.value,
      address: address,
      email: this.email.value,
      city: this.city.value,
      state: this.state.value,
      zipcode: this.zipcode.value,
      deviceid: this.ipAddress,
      creatorparentid: this.loggedInUser.parent.id,
      county: this.county.value,
      solarcapacity: this.solarcapacity.value,
      annualprod: this.annualprod.value,
      numberofroofs: this.noofroof.value,
      numberofdetachbuildings: this.detachedbuildings.value,
      solararrayarea: this.solararea.value,
      contracttype: this.contract.value,
    };
    this.probabilityService
      .editCustomerProbability(this.data.customer.id, postData)
      .subscribe(
        (response) => {
          this.loaderService.hide();
          this.dialogRef.close(response);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  getIPAddress(): void {
    this.http.get("https://api.ipify.org/?format=json").subscribe(
      (res: any) => {
        this.ipAddress = res.ip;
      },
      () => {
        // do nothing.
      }
    );
    // this.http.get<{ip:string}>('https://jsonip.com')
    // .subscribe( data => {
    //   console.log('th data', data);
    //   this.ipAddress = data
    // })
  }

  onCloseClick(): void {
    this.dialog.closeAll();
  }
}
