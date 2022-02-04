import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import * as moment from "moment";
import { Observable } from "rxjs";
import { FIREBASE_DB_CONSTANTS } from "src/app/_helpers";
import { CurrentUser, User } from "src/app/_models";
import {
  AuthenticationService,
  ContractorService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { TransactionService } from "src/app/_services/transaction.service";
import * as countriesjson from "../../../../_data/countries.json";
import PlaceResult = google.maps.places.PlaceResult;

export interface Country {
  country: string;
  calling_code: string;
}

export interface ContractorFormData {
  triggerEditEvent: boolean;
  isEditMode: boolean;
  isDataUpdated: boolean;
  user: User;
}

@Component({
  selector: "app-addcontractordialog",
  templateUrl: "./addcontractordialog.component.html",
  styleUrls: ["./addcontractordialog.component.scss"],
})
export class AddcontractordialogComponent implements OnInit {
  isLoading = false;
  imageUrl: any;
  retrycount = 1;
  createduser: User;
  loggedinUser: User;
  currentUser: CurrentUser;
  userTypeUpdate;

  files: File[] = [];
  isLogoUploaded = false;
  ispdf = false;
  logo: Blob;
  filename: string = null;
  filetype: string = null;
  fileName = "";
  loadingmessage = "Saving data";
  formattedAddress: string;

  countries: Country[] = (countriesjson as any).default;
  filteredOptions: Observable<Country[]>;

  firstname = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z]{3,}$"),
  ]);
  lastname = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z]{3,}$"),
  ]);
  workemail = new FormControl("", [
    Validators.required,
    Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$"),
  ]);
  paymentmode = new FormControl("", [Validators.required]);
  usertype = new FormControl("", [Validators.required]);

  remainingBalance = new FormControl();

  // phone = new FormControl("", [
  //   Validators.required,
  //   Validators.minLength(8),
  //   Validators.maxLength(15),
  //   Validators.pattern("[0-9]{8,15}$")
  // ]);
  // company = new FormControl("", [
  //   Validators.required
  // ]);

  address = new FormControl("", [Validators.required]);
  // lic = new FormControl("", [
  //   Validators.required,
  //   Validators.minLength(10),
  //   Validators.maxLength(15),
  //   Validators.pattern('^(?=.*[a-zA-Z0-9])[a-zA-Z0-9]+$')
  // ]);
  // prelimdesigndiscount = new FormControl("", []);
  // permitdesigndiscount = new FormControl("", []);
  // countrycontrol = new FormControl("", [Validators.required]);
  addContractorDialogForm: FormGroup;

  selectedcountry: any;
  selectedcountrycode: string;
  display = false;
  imagenotuploaded = "Please Upload Company logo";
  pdfErrormsg = "Please Upload logo (.jpeg,.png,.jpg) Format";
  // selectednewimage: any;
  edituploadlogofile = false;
  showError = false;

  constructor(
    public dialogRef: MatDialogRef<AddcontractordialogComponent>,
    private authenticationService: AuthenticationService,
    private notifyService: NotificationService,
    private commonService: CommonService,
    private contractorService: ContractorService,
    private changeDetectorRef: ChangeDetectorRef,
    private userDb: AngularFireDatabase,
    private transactionService: TransactionService,
    @Inject(MAT_DIALOG_DATA) public data: ContractorFormData
  ) {
    /**No requirement of countries user address can be edit from
     * now on.*/

    // this.filteredOptions = this.countrycontrol.valueChanges.pipe(
    //   startWith(""),
    //   map(value => (typeof value === "string" ? value : value.name)),
    //   map(name => (name ? this._filter(name) : this.countries.slice()))
    // );

    if (!data.isEditMode) {
      this.usertype.setValue("company");
    }

    this.addContractorDialogForm = new FormGroup({
      workemail: this.workemail,
      firstname: this.firstname,
      lastname: this.lastname,
      // phone: this.phone,
      usertype: this.usertype,
      paymentmode: this.paymentmode,
      // company: this.company,
      // country: this.countrycontrol,
      remainingBalance: this.remainingBalance,
      address: this.address,
      // lic: this.lic,
      // prelimdesigndiscount: this.prelimdesigndiscount,
      // permitdesigndiscount: this.permitdesigndiscount
    });
    if (data.isEditMode) {
      this.addContractorDialogForm.patchValue({
        firstname: data.user.firstname,
        lastname: data.user.lastname,
        workemail: data.user.email,
        phone: data.user.phone,
        address: data.user.address,
        company: data.user.company,
        lic: data.user.registrationnumber,
        prelimdesigndiscount: data.user.prelimdesigndiscount,
        usertype: data.user.usertype,
        permitdesigndiscount: data.user.permitdesigndiscount,
        paymentmode:
          data.user.ispaymentmodeprepay == true ? "prepaid" : "postpaid",
        remainingBalance: data.user.amount,
      });
      this.selectedcountrycode = data.user.callingcode;
      this.selectedcountry = this.countries.find(
        (c) => c.country == this.data.user.country
      );
      // this.countrycontrol.setValue(this.selectedcountry);

      this.remainingBalance.setValidators([
        Validators.min(0),
        Validators.max(data.user.amount),
      ]);
      this.remainingBalance.updateValueAndValidity();

      // this.isLogoUploaded = true;
      if (data.user.logo != null) {
        // this.isLogoUploaded = true;
        this.edituploadlogofile = true;
        this.imageUrl = data.user.logo.url;
        this.filename = data.user.logo.name;
        this.filetype = data.user.logo.mime;
      }
    }
  }
  ngOnInit(): void {
    if (!this.data.isEditMode) {
      // this.selectedcountry = this.countries.find(c => c.country == 'United States');
      // this.countrycontrol.setValue(this.selectedcountry.country);
    } else {
      // this.countrycontrol.setValue(this.data.user.country);
    }
    // this.setSelectedCountry(this.selectedcountry);

    window.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
    });
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
        ? "Firstname should be of min. 3 characters and contain only alphabets."
        : "";
    } else if (control == this.lastname) {
      return this.lastname.hasError("pattern")
        ? "Lastname should be of min. 3 characters and contain only alphabets."
        : "";
    } else if (control == this.workemail) {
      return this.workemail.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    }
    //  else if (control == this.phone) {
    //   return this.phone.hasError("pattern")
    //     ? "Please enter a valid phone number."
    //     : "";
    // }
    else if (control == this.paymentmode) {
      return this.paymentmode.hasError("pattern")
        ? "Please enter a valid payment mode."
        : "";
    } else if (control == this.usertype) {
      return this.usertype.hasError("pattern")
        ? "Please enter a valid account type."
        : "";
    } else if (control == this.remainingBalance) {
      return this.remainingBalance.hasError("min")
        ? "Value must be greater then 0."
        : this.remainingBalance.hasError("max")
          ? "Value must be less then the wallet amount."
          : "";
    }

    // else if (control == this.lic) {
    //   return this.lic.hasError("pattern")
    //     ? "Please enter a valid license number."
    //     : "";
    // }
  }

  displayFn(country: Country): string {
    return country && country.country ? country.country : "";
  }

  _filter(name: string): Country[] {
    const filterValue = name.toLowerCase();

    return this.countries.filter(
      (country) => country.country.toLowerCase().indexOf(filterValue) != -1
    );
  }

  setSelectedCountry(item: Country): void {
    this.selectedcountry = item;
  }

  onCloseClick(): void {
    this.data.triggerEditEvent = false;
    this.dialogRef.close(this.data);
  }

  onAddContractor($ev): void {
    $ev.preventDefault();
    let paymentmodechangepopvisible;
    let todayDate;
    let remainingAmount =
      this.addContractorDialogForm.get("remainingBalance").value;

    if (this.usertype.value === "company") {
      if (this.data.isEditMode) {
        if (this.data.user.amount > remainingAmount) {
          this.UpdateClientTransaction(this.data.user.amount - remainingAmount);
        }
        // else if(this.data.user.amount < remainingAmount){
        //   this.remainingBalance.setValidators([Validators.max(this.data.user.amount)]);
        // }
      }

      if (this.files.length) {
        this.showError = false;
      } else {
        this.showError = true;
      }

      if (
        this.addContractorDialogForm.valid &&
        this.filename != null &&
        (this.filetype === "image/jpeg" ||
          this.filetype === "image/png" ||
          this.filetype === "image/jpg")
      ) {
        this.isLoading = true;
        if (this.data.isEditMode) {
          let ispaymentmodeprepay = false;
          if (
            this.addContractorDialogForm.get("paymentmode").value == "prepaid"
          ) {
            ispaymentmodeprepay = true;
          } else if (
            this.addContractorDialogForm.get("paymentmode").value == "postpaid"
          ) {
            ispaymentmodeprepay = false;
          }
          if (ispaymentmodeprepay != this.data.user.ispaymentmodeprepay) {
            this.userTypeUpdate = this.userDb.object(
              FIREBASE_DB_CONSTANTS.KEYWORD + this.data.user.id
            );
            this.userTypeUpdate.update({ paymentmodechange: true });

            paymentmodechangepopvisible = true;
            todayDate = moment(new Date()).format("YYYY-MM-DD");
          }
          // let country = this.addContractorDialogForm.get('country').value;

          const postData = {
            email: this.addContractorDialogForm.get("workemail").value,
            firstname: this.addContractorDialogForm.get("firstname").value,
            lastname: this.addContractorDialogForm.get("lastname").value,
            //phone: this.addContractorDialogForm.get("phone").value,
            //company: this.addContractorDialogForm.get("company").value,
            // country: this.addContractorDialogForm.get("country").value.country,
            address: this.formattedAddress,
            usertype: this.addContractorDialogForm.get("usertype").value,
            //registrationnumber: this.addContractorDialogForm.get("lic").value,
            //prelimdesigndiscount: this.addContractorDialogForm.get("prelimdesigndiscount").value,
            //permitdesigndiscount: this.addContractorDialogForm.get("permitdesigndiscount").value,
            //callingcode: this.selectedcountrycode,
            amount: remainingAmount,
            ispaymentmodeprepay: ispaymentmodeprepay,
            paymentmodeupdateddate: todayDate,
            paymentmodechangepopvisible: paymentmodechangepopvisible,
          };

          this.contractorService
            .editContractor(this.data.user.id, postData)
            .subscribe(
              () => {
                if (this.isLogoUploaded) {
                  this.uploadFile(this.data.user.id);
                } else {
                  this.notifyService.showSuccess(
                    "Client details have been updated successfully.",
                    "Success"
                  );
                  this.data.triggerEditEvent = true;
                  this.data.isDataUpdated = true;
                  this.dialogRef.close(this.data);
                }
              },
              (error) => {
                this.isLoading = false;
                this.notifyService.showError(error, "Error");
              }
            );
        } else {
          // this.isLoading = true;
          // let country = this.addContractorDialogForm.get('country').value;
          this.contractorService
            .addContractor(
              this.addContractorDialogForm.get("firstname").value,
              this.addContractorDialogForm.get("lastname").value,
              this.addContractorDialogForm.get("workemail").value,
              // this.addContractorDialogForm.get("company").value,
              // this.addContractorDialogForm.get("country").value.country,
              // this.addContractorDialogForm.get("phone").value,
              this.formattedAddress,
              this.addContractorDialogForm.get("paymentmode").value,
              this.addContractorDialogForm.get("usertype").value
              // this.addContractorDialogForm.get("lic").value,

              // this.selectedcountry.calling_code
            )
            .subscribe(
              (response) => {
                if (this.isLogoUploaded) {
                  this.uploadFile(response.id);
                } else {
                  this.updateContractorSuperAdminParent(response.id);
                }
              },
              (error) => {
                this.isLoading = false;
                this.notifyService.showError(error, "Error");
              }
            );
        }
      }
    } else {
      if (this.addContractorDialogForm.valid) {
        this.isLoading = true;
        if (this.data.isEditMode) {
          let ispaymentmodeprepay = false;
          if (
            this.addContractorDialogForm.get("paymentmode").value == "prepaid"
          ) {
            ispaymentmodeprepay = true;
          } else if (
            this.addContractorDialogForm.get("paymentmode").value == "postpaid"
          ) {
            ispaymentmodeprepay = false;
          }

          if (ispaymentmodeprepay != this.data.user.ispaymentmodeprepay) {
            // const key = FIREBASE_DB_CONSTANTS.KEYWORD + this.data.user.parent.id ;
            this.userTypeUpdate = this.userDb.object(
              FIREBASE_DB_CONSTANTS.KEYWORD + this.data.user.id
            );
            this.userTypeUpdate.update({ paymentmodechange: true });

            paymentmodechangepopvisible = true;
            todayDate = moment(new Date()).format("YYYY-MM-DD");
          }

          // let country = this.addContractorDialogForm.get('country').value;
          const postData = {
            email: this.addContractorDialogForm.get("workemail").value,
            firstname: this.addContractorDialogForm.get("firstname").value,
            lastname: this.addContractorDialogForm.get("lastname").value,
            //phone: this.addContractorDialogForm.get("phone").value,
            //company: this.addContractorDialogForm.get("company").value,
            // country: this.addContractorDialogForm.get("country").value.country,
            address: this.formattedAddress,
            usertype: this.addContractorDialogForm.get("usertype").value,
            //registrationnumber: this.addContractorDialogForm.get("lic").value,
            //prelimdesigndiscount: this.addContractorDialogForm.get("prelimdesigndiscount").value,
            //permitdesigndiscount: this.addContractorDialogForm.get("permitdesigndiscount").value,
            //callingcode: this.selectedcountrycode,
            amount: remainingAmount,
            ispaymentmodeprepay: ispaymentmodeprepay,
            paymentmodeupdateddate: todayDate,
            paymentmodechangepopvisible: paymentmodechangepopvisible,
          };

          this.contractorService
            .editContractor(this.data.user.id, postData)
            .subscribe(
              () => {
                if (this.isLogoUploaded) {
                  this.uploadFile(this.data.user.id);
                } else {
                  this.notifyService.showSuccess(
                    "Client details have been updated successfully.",
                    "Success"
                  );
                  this.data.triggerEditEvent = true;
                  this.data.isDataUpdated = true;
                  this.dialogRef.close(this.data);
                }
              },
              (error) => {
                this.isLoading = false;
                this.notifyService.showError(error, "Error");
              }
            );
        } else {
          this.isLoading = true;
          // let country = this.addContractorDialogForm.get('country').value;
          this.contractorService
            .addContractor(
              this.addContractorDialogForm.get("firstname").value,
              this.addContractorDialogForm.get("lastname").value,
              this.addContractorDialogForm.get("workemail").value,
              // this.addContractorDialogForm.get("company").value,
              // this.addContractorDialogForm.get("country").value.country,
              // this.addContractorDialogForm.get("phone").value,
              this.formattedAddress,
              this.addContractorDialogForm.get("paymentmode").value,
              this.addContractorDialogForm.get("usertype").value
              // this.addContractorDialogForm.get("lic").value,

              // this.selectedcountry.calling_code
            )
            .subscribe(
              (response) => {
                if (this.isLogoUploaded) {
                  this.uploadFile(response.id);
                } else {
                  this.updateContractorSuperAdminParent(response.id);
                }
              },
              (error) => {
                this.isLoading = false;
                this.notifyService.showError(error, "Error");
              }
            );
        }
      }
    }
  }

  addContractorLogo(userid: number): void {
    this.contractorService.addContractorLogo(userid).subscribe(
      (response) => {
        this.uploadFile(response.id);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  uploadFile(recordid: number): void {
    this.loadingmessage = "Uploading attachment";
    this.changeDetectorRef.detectChanges();
    this.commonService
      .uploadLogo(
        recordid,
        recordid + "/logo",
        this.files[0],
        "logo",
        "user",
        // "users-permissions"
      )
      .subscribe(
        () => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.notifyService.showSuccess(
            "Client details have been updated successfully.",
            "Success"
          );
          this.data.triggerEditEvent = true;
          this.data.isDataUpdated = true;
          this.dialogRef.close(this.data);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  updateContractorSuperAdminParent(userid: number): void {
    const data = {
      parent: userid,
    };
    this.contractorService.editContractor(userid, data).subscribe(
      (response) => {
        if (this.isLogoUploaded) {
          this.addContractorLogo(userid);
        } else {
          //this.notifyService.showSuccess("Client has been added successfully.", "Success");
          //this.data.triggerEditEvent = true;
          //this.dialogRef.close(this.data);
          this.createduser = response;
          this.createChatUser(
            this.createduser.id,
            this.createduser.firstname + " " + this.createduser.lastname
          );
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  // onFileSelect(e: any): void {
  //   try {
  //     const file = e.target.files[0];
  //     const fReader = new FileReader()
  //     fReader.readAsDataURL(file)
  //     fReader.onloadend = (_event: any) => {
  //       this.filename = file.name;
  //       this.base64File = _event.target.result;
  //     }
  //   } catch (error) {
  //     this.filename = null;
  //     this.base64File = null;
  //
  //   }
  // }

  onFileSelect($event): void {
    $event.preventDefault();
    let reader = new FileReader(); // HTML5 FileReader API
    let file = $event.target.files[0];
    this.logo = $event.target.files[0];
    this.files.push($event.target.files[0]);

    // this.uploadLogo(event);

    if ($event.target.files.length > 0) {
      this.filename = file.name;
      this.filetype = file.type;
    }

    if ($event.target.files[0]) {
      const allowed_types = ["image/png", "image/jpeg", "image/*"];
      if (allowed_types.indexOf($event.target.files[0].type) != -1) {
        reader.readAsDataURL(file);
        // When file uploads set it to file formcontrol
        reader.onload = () => {
          this.imageUrl = reader.result;
          this.changeDetectorRef.detectChanges();
        };
        this.isLogoUploaded = true;
        this.showError = false;
      } else {
        this.ispdf = true;
        this.isLogoUploaded = true;
        this.showError = false;

        // return false;
      }
      // ChangeDetectorRef since file is loading outside the zone
    }
  }

  onSelect(event): void {
    this.isLogoUploaded = true;
    this.files.push(...event.addedFiles);
  }

  onRemove(event): void {
    this.logo = null;
    this.filename = null;
    this.imageUrl = null;
    this.files.splice(this.files.indexOf(event), 1);
    this.isLogoUploaded = false;
    this.edituploadlogofile = false;
    this.showError = true;
  }

  createChatUser(userid: number, name: string): void {
    this.authenticationService.createChatUser("" + userid, name).subscribe(
      () => {
        this.isLoading = false;
        this.notifyService.showSuccess(
          "Client has been added successfully.",
          "Success"
        );
        this.data.triggerEditEvent = true;
        this.dialogRef.close(this.data);
      },
      () => {
        if (this.retrycount > 0) {
          this.retrycount -= 1;
          this.createChatUser(
            this.createduser.id,
            this.createduser.firstname + " " + this.createduser.lastname
          );
        } else {
          this.isLoading = false;
          this.retrycount = 1;
          this.contractorService
            .deleteContractor("" + this.createduser.id)
            .subscribe(
              () => {
                this.notifyService.showInfo(
                  "Something went wrong. Please try again.",
                  "Warning"
                );
              },
              () => {
                this.notifyService.showInfo(
                  "Something went wrong. Please try again.",
                  "Warning"
                );
              }
            );
        }
      }
    );
  }

  UpdateClientTransaction(transactionAmount): void {
    let postData = {
      paymenttype: "wallet",
      amount: transactionAmount,
      transactiontype: "debit",
      user: this.data.user.parent.id,
      servicetype: "invoice",
    };
    this.transactionService.addTransaction(postData).subscribe(() => {
      // do nothing.
    });
  }

  onAutocompleteSelected(result: PlaceResult): void {
    this.formattedAddress = result.formatted_address;
  }
}
