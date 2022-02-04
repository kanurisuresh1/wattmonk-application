import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as countriesjson from "src/app/_data/countries.json";
import { ADDRESSFORMAT } from "src/app/_helpers";
import { CurrentUser, User } from "src/app/_models";
import { AuthenticationService, NotificationService } from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import PlaceResult = google.maps.places.PlaceResult;

export interface ProfileData {
  user: User;
  isdatamodified: boolean;
}

export interface Country {
  country: string;
  calling_code: string;
}
@Component({
  selector: "app-editprofiledialogapp-editprofiledialog",
  templateUrl: "./editprofiledialog.component.html",
  styleUrls: ["./editprofiledialog.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditprofiledialogComponent implements OnInit {
  @ViewChild("fileInput")
  fileInput;
  file: File | null = null;
  files: File[] = [];
  userroleid;
  currentUser: CurrentUser;
  // private selectedFile: File;
  loadingmessage = "Saving Data";
  logoUploaded = false;
  logo: Blob;
  imageError: string;
  imageChangedEvent: any = " ";
  countries: Country[] = (countriesjson as any).default;
  filteredOptions: Observable<Country[]>;
  selectednewimage: any;
  image: Blob;

  isLogoUploaded = false;

  firstname = new FormControl("", [
    Validators.minLength(1),
    Validators.required,
    Validators.pattern("^[a-zA-Z]{1,}$"),
  ]);
  lastname = new FormControl("", [
    Validators.minLength(1),
    Validators.required,
    Validators.pattern("^[a-zA-Z]{1,}$"),
  ]);
  company = new FormControl("", [Validators.pattern("^[A-Za-z0-9 _-]{2,}$")]);
  workemail = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$"),
  ]);
  phone = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("[0-9]{8,15}$"),
  ]);
  countrycontrol = new FormControl("", [Validators.required]);
  address = new FormControl("", [Validators.pattern(ADDRESSFORMAT)]);
  userlogo = new FormControl("");
  editprofileDialogForm: FormGroup;
  selectedcountry: any;
  isLoading = false;
  displayerror = true;
  loggedinuser: User;
  formattedaddress: string;
  constructor(
    public dialogRef: MatDialogRef<EditprofiledialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProfileData,
    // private teamService: TeamService,
    private notifyService: NotificationService,
    private authService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private commonService: CommonService,
    // private router: Router,
    private eventEmitterService: EventEmitterService
  ) {
    this.loggedinuser = authService.currentUserValue.user;
    this.currentUser = authService.currentUserValue;
    this.userroleid = this.loggedinuser.role.id;
    this.editprofileDialogForm = new FormGroup({
      workemail: this.workemail,
      firstname: this.firstname,
      lastname: this.lastname,
      phone: this.phone,
      address: this.address,
      country: this.countrycontrol,
      company: this.company,
    });
    this.editprofileDialogForm.patchValue({
      firstname: authService.currentUserValue.user.firstname,
      lastname: authService.currentUserValue.user.lastname,
      workemail: authService.currentUserValue.user.email,
      company: authService.currentUserValue.user.company,
      phone: authService.currentUserValue.user.phone,
      address: authService.currentUserValue.user.address,
      country: authService.currentUserValue.user.country,
    });
    this.filteredOptions = this.countrycontrol.valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value.name)),
      map((name) => (name ? this._filter(name) : this.countries.slice()))
    );
  }

  ngOnInit(): void {
    // if( this.loggedinuser.userimage != null ){

    //   if(this.loggedinuser.role.id == ROLES.ContractorSuperAdmin || this.loggedinuser.role.id == ROLES.SuperAdmin){
    //     this.selectednewimage = this.loggedinuser.logo.url
    //   }else{
    //     this.selectednewimage = this.loggedinuser.userimage.url
    //   }
    if (this.loggedinuser.logo != null) {
      this.selectednewimage = this.loggedinuser.logo.url;
    } else {
      this.selectednewimage = "../../../assets/user.jpg";
    }
  }

  displayFn(country: Country): string {
    return country && country.country ? country.country : "";
  }
  private _filter(name: string): Country[] {
    const filterValue = name.toLowerCase();
    return this.countries.filter(
      (country) => country.country.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedCountry(item: Country): void {
    this.selectedcountry = item;
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
    | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    if (control == this.firstname) {
      return this.firstname.hasError("pattern")
        ? "Firstname should be of min. 1 characters and contain only alphabets."
        : "";
    } else if (control == this.lastname) {
      return this.lastname.hasError("pattern")
        ? "Lastname should be of min. 1 characters and contain only alphabets."
        : "";
    } else if (control == this.workemail) {
      return this.workemail.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    } else if (control == this.phone) {
      return this.phone.hasError("pattern")
        ? "Please enter a valid phone number (Min - 8, Max - 15)."
        : "Phone should be of min. 8 and max. 15 characters.";
    } else if (control == this.address) {
      return this.address.hasError("pattern")
        ? "Please enter a valid address."
        : " ";
    }
  }
  onCloseClick(): void {
    this.data.isdatamodified = false;
    this.dialogRef.close(this.data);
  }

  onAddMember($ev): void {
    $ev.preventDefault();
    this.authService.setRequiredHeaders();
    let addtype;
    if (this.formattedaddress) {
      addtype = this.formattedaddress;
    } else {
      addtype = this.address.value;
    }
    if (this.editprofileDialogForm.valid) {
      const postData = {
        email: this.editprofileDialogForm.get("workemail").value,
        firstname: this.editprofileDialogForm.get("firstname").value,
        lastname: this.editprofileDialogForm.get("lastname").value,
        phone: this.editprofileDialogForm.get("phone").value,
        address: addtype,
        country: this.editprofileDialogForm.get("country").value,
        company: this.editprofileDialogForm.get("company").value,
      };
      this.isLoading = true;
      this.loadingmessage = "Save data.";
      this.authService
        .editUserProfile(this.authService.currentUserValue.user.id, postData)
        .subscribe(
          (response) => {
            this.data.user = response;
            if (this.isLogoUploaded) {
              this.uploadLogo();
            } else {
              this.notifyService.showSuccess(
                "Profile modified successfully.",
                "Success"
              );
              this.currentUser.user.address = response.address;
              this.eventEmitterService.onDashboardRefresh(
                response.firstname + " " + response.lastname
              );
              this.dialogRef.close(this.data);
              this.data.isdatamodified = true;
              this.isLoading = false;
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    } else {
      this.displayerror = false;
    }
  }

  uploadFile(event): boolean {
    const reader = new FileReader(); // HTML5 FileReader API
    const file = event.target.files[0];
    this.image = event.target.files[0];
    this.files.push(event.target.files[0]);
    if (event.target.files.length > 0) {
    }
    if (event.target.files[0]) {
      const allowed_types = ["image/png", "image/jpeg"];
      if (allowed_types.indexOf(event.target.files[0].type) != -1) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.selectednewimage = reader.result;
          this.changeDetectorRef.detectChanges();
          // this.uploadLogo()
        };
        this.isLogoUploaded = true;
      } else {
        return false;
      }
      // ChangeDetectorRef since file is loading outside the zone
    }
  }
  // Deleteuploadedlogo($event){
  //   $event.stopPropagation();
  //   this.imageUrl="../../../../../assets/logoplaceholder.jpg";

  //   this.logoUploaded=false;
  //   this.changeDetectorRef.detectChanges();
  // }

  onAutocompleteSelected(result: PlaceResult): void {
    this.formattedaddress = result.formatted_address;
    // this.editprofileDialogForm.get('address').patchValue(result.formatted_address);
  }

  uploadLogo(): void {
    this.isLoading = true;
    this.loadingmessage = "Uploading image";
    this.changeDetectorRef.detectChanges();
    if (this.loggedinuser.role.id == 6 || this.loggedinuser.role.id == 4) {
      this.commonService
        .uploadLogo(
          this.loggedinuser.id,
          this.loggedinuser.id + "/logo",
          this.image,
          "logo",
          "user",
          // "users-permissions"
        )
        .subscribe(
          () => {
            this.commonService.userData(this.loggedinuser.id).subscribe(
              (response) => {
                this.isLoading = false;
                this.currentUser.user.logo = response.logo;
                this.currentUser.user.usertype = response.usertype;
                this.notifyService.showSuccess(
                  "Profile updated successfully.",
                  "Success"
                );
                // this.authService.broadCastCurrentUserSetting(true);
                this.changeDetectorRef.detectChanges();
                this.data.user = response;
                this.dialogRef.close(this.data);
              },
              () => {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
              }
            );
          },
          (error) => {
            this.notifyService.showError(error, "Error");
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          }
        );
    } else {
      this.commonService
        .uploadLogo(
          this.loggedinuser.id,
          this.loggedinuser.id + "/logo",
          this.files[0],
          "logo",
          "user",
          // "users-permissions"
        )
        .subscribe(
          () => {
            this.commonService.userData(this.loggedinuser.id).subscribe(
              (response) => {
                this.isLoading = false;
                this.currentUser.user.logo = response.logo;
                this.currentUser.user.usertype = response.usertype;
                this.notifyService.showSuccess(
                  "Profile updated successfully.",
                  "Success"
                );
                // this.authService.broadCastCurrentUserSetting(true);
                this.changeDetectorRef.detectChanges();
                this.data.user = response;
                this.dialogRef.close(this.data);
              },
              () => {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
              }
            );
          },
          (error) => {
            this.notifyService.showError(error, "Error");
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          }
        );
    }
  }
}
