import { Location } from "@angular-material-extensions/google-maps-autocomplete";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation
} from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatCheckboxChange } from "@angular/material/checkbox";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatRadioButton, MatRadioChange } from "@angular/material/radio";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CometChat } from "@cometchat-pro/chat";
import { Gallery, GalleryItem, ImageItem } from "@ngx-gallery/core";
import heic2any from "heic2any";
import * as moment from "moment";
import { Observable } from "rxjs";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import {
  ADDRESSFORMAT,
  FIREBASE_DB_CONSTANTS,
  MAILFORMAT,
  NAME,
  ROLES
} from "src/app/_helpers";
import { Design, Pestamp, UploadedFile, User } from "src/app/_models";
import { Company } from "src/app/_models/company";
import { Survey } from "src/app/_models/survey";
import {
  AuthenticationService,
  GenericService,
  NotificationService,
  PestampService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { SurveyService } from "src/app/_services/survey.service";
import { OrderpestampsdialogComponent } from "../orderpestampsdialog/orderpestampsdialog.component";
import PlaceResult = google.maps.places.PlaceResult;
const axios = require("axios").default;

export interface PestampFormData {
  isEditMode: boolean;
  isDataUpdated: boolean;
  generateAutocad: boolean;
  user: User;
  pestamp: Pestamp;
  isPermitmode: boolean;
  design: Design;
  survey: Survey;
  prelim: Design;
  raisedPestamp: boolean;
  designRaisedbyWattmonk: boolean;
}

@Component({
  selector: "app-addpestampdialog",
  templateUrl: "./addpestampdialog.component.html",
  styleUrls: ["./addpestampdialog.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddpestampdialogComponent implements OnInit {
  nameField: MatRadioButton;
  min = 3;
  max = 3;
  paymenttype;
  isoutsourced = false;
  selectedSiteLocation: Location;

  isLoading = false;
  assigntowattmonk = false;
  loadingmessage = "Saving data";
  oldcommentid;
  isSnackbaropen = false;

  prioritytoggle = new FormControl("", []);

  company = new FormControl("", []);
  email = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  modeofstamping = new FormControl("", [Validators.required]);
  propertytype = new FormControl("", [Validators.required]);
  mountingtype = new FormControl("", [Validators.required]);
  // // siteaddress =new FormControl("",[
  // //   Validators.required,
  // //   Validators.pattern(ADDRESSFORMAT)
  // ])
  shippingaddress = new FormControl("");
  name = new FormControl("", [
    Validators.required,
    Validators.minLength(2),
    Validators.pattern(NAME),
  ]);
  contactnumber = new FormControl("");
  hardcopies = new FormControl("");

  type = new FormControl("", [Validators.required]);
  jobtype = new FormControl("", []);
  comments = new FormControl("", []);
  raiserequestreason = new FormControl("");

  addPestampDialogForm: FormGroup;

  thirdPartyStamp = false;
  disabledFields = false;
  disablethirdpartystamp = false;

  showCommentsField = true;
  displayerror = true;
  rooferror = true;
  permiterror = true;
  atticerror = true;
  formatted_address: string;
  user: User;
  atticphotos: File[] = [];
  isPermitfileUploaded = false;
  roofphotos: File[] = [];
  isRoofPhotosUploaded = false;
  permitplan: File[] = [];
  isAtticFileUploaded = false;
  changeDetector: any;
  loggedInUser: User;
  isClient = false;
  atticphotoserror = false;
  aresitedetailsvalid = true;
  aremakedetailsvalid = true;
  aremountingdetailsvalid = true;
  roofphotosgallery: GalleryItem[];
  atticphotosgallery: GalleryItem[];
  permitAttachments: GalleryItem[];
  permitArchitecture: GalleryItem[];
  prelimAttachments: GalleryItem[];
  prelimArchitecture: GalleryItem[];
  senddirectlytowattmonk = false;
  newpestamp: Observable<any>;
  newpestampRef: AngularFireObject<any>;
  newpestampcounts = 0;
  amounttopay: any;

  mspimages: GalleryItem[];
  utilitymeterimages: GalleryItem[];
  pvinverterimages: GalleryItem[];
  pvmeterimages: GalleryItem[];
  acdisconnectimages: GalleryItem[];
  roofimages: GalleryItem[];
  roofdimensionimages: GalleryItem[];
  obstaclesimages: GalleryItem[];
  obstaclesdimensionsimages: GalleryItem[];
  atticimages: GalleryItem[];
  appliancesimages: GalleryItem[];
  groundimages: GalleryItem[];
  solarpanelsimages: GalleryItem[];
  existingsubpanelimages: GalleryItem[];
  utilitybillfront: GalleryItem[];
  utilitybillback: GalleryItem[];

  sameemailconfirmed = null;
  designpestamp = null;
  wattmonkadmins: User[] = [];
  getCompanies: Company[];
  companyList = [];
  pestampCreatedBy;
  pestampCreatedByUserParent;
  defaultvalues = "-";
  canRaiseRequestForUsers = false;
  clientadmins;
  servicecharges: AngularFireObject<any>;
  servicechargedata: Observable<any>;
  printingCharges = 0;
  totalprintingcharges = 0;
  servicecharge;
  disabledComment: boolean = false;
  israiserequestattachmentUploaded = false;
  raiseattachmentError = true;
  raiserequestattachmentfiles: File[] = [];
  attachmenthoverIdx = -1;
  architecturehoverIdx = -1;

  limit = 10;
  skip = 0;
  scrolling: boolean = false;
  companyListlength;
  constructor(
    public dialogRef: MatDialogRef<AddpestampdialogComponent>,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private notifyService: NotificationService,
    private commonService: CommonService,
    private pestampService: PestampService,
    public gallery: Gallery,
    public genericService: GenericService,
    private authService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private db: AngularFireDatabase,
    private http: HttpClient,
    private surveyService: SurveyService,

    @Inject(MAT_DIALOG_DATA) public data: PestampFormData
  ) {
    this.loggedInUser = authService.currentUserValue.user;
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id != 232) ||
      (this.loggedInUser.role.id == ROLES.TeamHead &&
        this.loggedInUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }

    if (
      this.loggedInUser.role.id == ROLES.PeAdmin ||
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      this.loggedInUser.role.id == ROLES.Admin ||
      ((this.loggedInUser.role.id == ROLES.TeamHead ||
        this.loggedInUser.role.id == ROLES.BD) &&
        this.loggedInUser.parent.id == 232)
    ) {
      /**
       * Below condition for hiding the company field for prepiad users
       * from wattmonk sides and company side.
       */

      if (
        (this.data.pestamp &&
          !this.data.pestamp.createdby.parent.ispaymentmodeprepay) ||
        (this.data.pestamp == undefined &&
          !this.loggedInUser.parent.ispaymentmodeprepay) ||
        !this.data.designRaisedbyWattmonk
      )
        this.canRaiseRequestForUsers = true;
      this.company.setValidators(Validators.required);
    } else {
      this.canRaiseRequestForUsers = false;
    }
    if (this.data.designRaisedbyWattmonk) {
      this.raiserequestreason.setValidators(Validators.required);
    }
    this.addPestampDialogForm = new FormGroup({
      contactnumber: this.contactnumber,
      email: this.email,
      name: this.name,
      hardcopies: this.hardcopies,
      modeofstamping: this.modeofstamping,
      type: this.type,
      jobtype: this.jobtype,
      propertytype: this.propertytype,
      mountingtype: this.mountingtype,
      shippingaddress: this.shippingaddress,
      // siteaddress: this.siteaddress,
      comments: this.comments,
      company: this.company,
      raiserequestreason: this.raiserequestreason,
    });

    this.newpestampRef = db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + "newpestamp"
    );
    this.newpestamp = this.newpestampRef.valueChanges();
    this.newpestamp.subscribe(
      (res) => {
        this.newpestampcounts = res.count;
      }
      // (err) => console.log(err),
      // () => console.log('done!')
    );
    if (data.isPermitmode) {
      this.addPestampDialogForm.patchValue({
        email: data.design.email,
        name: data.design.name,
        mountingtype: data.design.mountingtype,
        propertytype: data.design.projecttype,
        shippingaddress: data.design.address,
      });
      this.designpestamp = data.design.id;
      this.convertUrlToFile(
        data.design.permitdesign.url,
        data.design.permitdesign.name,
        data.design.permitdesign.ext,
        data.design.permitdesign.mime
      );
      //  this.permitplan=new File(data.formdata.permitdesign.url,data.formdata.permitdesign.name)
    }

    if (data.isEditMode) {
      // data.pestamp.thirdpartystamping !=null ? this.thirdPartyStamp = data.pestamp.thirdpartystamping : null;
      this.thirdPartyStamp = data.pestamp?.thirdpartystamping;

      this.addPestampDialogForm.patchValue({
        email: data.pestamp.email,
        name: data.pestamp.personname,
        type: data.pestamp.type,
        modeofstamping: data.pestamp.modeofstamping,
        mountingtype: data.pestamp.mountingtype,
        propertytype: data.pestamp.propertytype,
        hardcopies: data.pestamp.hardcopies,
        contactnumber: data.pestamp.contactnumber,
        shippingaddress: data.pestamp.deliveryaddress,
        jobtype: data.pestamp.jobtype,
      });

      if (data.pestamp.comments.length > 0) {
        // if (data.pestamp.comments.length > 0) {
        //   this.addPestampDialogForm.patchValue({
        //     comments: data.pestamp.comments[0].message
        //   });
        //   this.oldcommentid = data.pestamp.comments[0].id;
        // }

        const new_array = [];
        for (let i1 = 0; i1 < data.pestamp.comments.length; i1++) {
          if (data.pestamp.comments[i1].status == "created") {
            new_array.push(data.pestamp.comments[i1]);
          }
        }
        new_array.sort(function (a, b) {
          return a.id - b.id;
        });
        if (new_array.length > 0) {
          const last_element = new_array[new_array.length - 1];
          this.addPestampDialogForm.patchValue({
            comments: last_element?.message,
          });
          this.oldcommentid = last_element?.id;
        }
      }

      this.formatted_address = data.pestamp.deliveryaddress;

      if (
        this.data.pestamp.modeofstamping == "hardcopy" ||
        this.data.pestamp.modeofstamping == "both"
      ) {
        this.contactnumber.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(15),
          Validators.pattern("^[0-9]{8,15}$"),
        ]);

        this.hardcopies.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(99),
          Validators.pattern("^[0-9]*"),
        ]);
        this.shippingaddress.setValidators([
          Validators.required,
          Validators.pattern(ADDRESSFORMAT),
          Validators.maxLength(300),
        ]);
      }

      if (
        this.data.pestamp.status == "assigned" ||
        this.data.pestamp.status == "completed" ||
        this.data.pestamp.status == "delivered" ||
        data.pestamp.status == "assigned"
      ) {
        this.disabledFields = true;
        if (this.loggedInUser.parent.id != 232) {
          this.showCommentsField = true;
        } else {
          this.showCommentsField = false;
        }
      }

      this.roofphotosgallery = this.data.pestamp.roofphotos.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url, id: item.id })
      );
      this.atticphotosgallery = this.data.pestamp.atticphotos.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url, id: item.id })
      );

      this.roofimagesGallery();
    }
    if (
      this.loggedInUser.role.id == ROLES.TeamHead ||
      this.loggedInUser.role.id == ROLES.BD ||
      this.loggedInUser.role.id == ROLES.Master
    ) {
      this.disablethirdpartystamp = true;
    }
  }

  ngOnInit(): void {
    window.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
    });
    // if(!this.isClient){
    //   this.getCompanies= this.genericService.companies
    // }
    if (!this.isClient && this.data.designRaisedbyWattmonk) {
      this.company.setValue(this.data.design.company);
    } else {
      if (!this.isClient) {
        this.fetchCompaniesData();
      } else {
        this.getWattmonkadmins();
      }
    }

    if (this.data.survey != null || this.data.survey != undefined) {
      this.mspimages = this.data.survey.mspimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.utilitymeterimages = this.data.survey.utilitymeterimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.pvinverterimages = this.data.survey.pvinverterimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.pvmeterimages = this.data.survey.pvmeterimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.acdisconnectimages = this.data.survey.acdisconnectimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.roofimages = this.data.survey.roofimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.roofdimensionimages = this.data.survey.roofdimensionimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.obstaclesimages = this.data.survey.obstaclesimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.obstaclesdimensionsimages =
        this.data.survey.obstaclesdimensionsimages.map(
          (item) => new ImageItem({ src: item.url, thumb: item.url })
        );
      this.atticimages = this.data.survey.atticimages.map(
        (item) => new ImageItem({ src: item.url, thumb: item.url })
      );
      this.appliancesimages = this.data.survey.appliancesimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.groundimages = this.data.survey.groundimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.solarpanelsimages = this.data.survey.solarpanelsimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );
      this.existingsubpanelimages = this.data.survey.existingsubpanelimages.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, name: item.name })
      );

      const utilitybillfront = [];
      utilitybillfront.push(this.data.survey.utilitybillfront);
      if (this.data.survey.utilitybillfront != null) {
        this.utilitybillfront = utilitybillfront.map(
          (item) =>
            new ImageItem({ src: item.url, thumb: item.url, name: item.name })
        );
      }

      const utilitybillback = [];
      utilitybillback.push(this.data.survey.utilitybillback);
      if (this.data.survey.utilitybillback != null) {
        this.utilitybillback = utilitybillback.map(
          (item) =>
            new ImageItem({ src: item.url, thumb: item.url, name: item.name })
        );
      }
    }

    if (this.data.prelim != null) {
      this.prelimAttachments = this.data.prelim.attachments.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );

      this.prelimArchitecture = this.data.prelim.architecturaldesign.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );
    }

    if (
      this.loggedInUser.role.id == ROLES.TeamHead ||
      this.loggedInUser.role.id == ROLES.BD ||
      this.loggedInUser.role.id == ROLES.Master
    ) {
      this.disablethirdpartystamp = true;
    }


    this.permitAttachments =
      this.data.design != null
        ? this.data.design.attachments.map(
          (item) =>
            new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
        )
        : null;

    this.permitArchitecture = this.data.design != null ? this.data.design.architecturaldesign.map((item) =>
      new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
    )
      : null;
    this.permitAttachmentsGallery();
  }

  getSurveyDetails(): void {
    this.surveyService
      .getSurveyDetails(this.data.survey.id)
      .subscribe(() => {
        // do nothing.
      });
  }

  permitAttachmentsGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("permitAttachments");
    lightboxGalleryRef.load(this.permitAttachments);
    // this.gallery.ref().load(this.permitAttachments);
    if (this.data.survey != null) {
      this.mspimagesGallery();
    }

    this.permitArchitectureGallery();
  }

  permitArchitectureGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("permitArchitecture");
    lightboxGalleryRef.load(this.permitArchitecture);
    this.prelimAttachmentsGallery();
  }

  prelimAttachmentsGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("prelimAttachments");
    lightboxGalleryRef.load(this.prelimAttachments);
    this.prelimArchitectureGallery();
  }

  prelimArchitectureGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("prelimArchitecture");
    lightboxGalleryRef.load(this.prelimArchitecture);
  }

  mspimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("mspimages");
    lightboxGalleryRef.load(this.mspimages);
    this.utilitymeterimagesGallery();
  }

  utilitymeterimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("utilitymeterimages");
    lightboxGalleryRef.load(this.utilitymeterimages);
    this.pvinverterimagesGallery();
  }
  pvinverterimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("pvinverterimages");
    lightboxGalleryRef.load(this.pvinverterimages);
    this.pvmeterimagesGallery();
  }
  pvmeterimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("pvmeterimages");
    lightboxGalleryRef.load(this.pvmeterimages);
    this.acdisconnectimagesGallery();
  }
  acdisconnectimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("acdisconnectimages");
    lightboxGalleryRef.load(this.acdisconnectimages);
    // this.roofimagesGallery();
    this.surveyroofimagesGallery();
  }
  surveyroofimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("roofimages");
    lightboxGalleryRef.load(this.roofimages);
    this.roofdimensionimagesGallery();
  }
  roofdimensionimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("roofdimensionimages");
    lightboxGalleryRef.load(this.roofdimensionimages);
    this.obstaclesimagesGallery();
  }
  obstaclesimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("obstaclesimages");
    lightboxGalleryRef.load(this.obstaclesimages);
    this.obstaclesdimensionsimagesGallery();
  }
  obstaclesdimensionsimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("obstaclesdimensionsimages");
    lightboxGalleryRef.load(this.obstaclesdimensionsimages);
    this.atticimagesGallery();
  }

  roofimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("roofphotosgallery");
    lightboxGalleryRef.load(this.roofphotosgallery);
    this.atticimagesGallery();
  }
  atticimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("atticphotosgallery");
    lightboxGalleryRef.load(this.atticphotosgallery);
    this.surveyatticimagesGallery();
  }
  surveyatticimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("atticimages");
    lightboxGalleryRef.load(this.atticimages);
    this.appliancesimagesGallery();
  }
  appliancesimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("appliancesimages");
    lightboxGalleryRef.load(this.appliancesimages);
    this.groundimagesGallery();
  }
  groundimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("groundimages");
    lightboxGalleryRef.load(this.groundimages);
    this.solarpanelsimagesGallery();
  }
  solarpanelsimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("solarpanelsimages");
    lightboxGalleryRef.load(this.solarpanelsimages);
    this.existingsubpanelimagesGallery();
  }
  existingsubpanelimagesGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("existingsubpanelimages");
    lightboxGalleryRef.load(this.existingsubpanelimages);
    this.utilitybillfrontGallery();
  }
  utilitybillfrontGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("utilitybillfront");
    lightboxGalleryRef.load(this.utilitybillfront);
    this.utilitybillbackGallery();
  }
  utilitybillbackGallery(): void {
    const lightboxGalleryRef = this.gallery.ref("utilitybillback");
    lightboxGalleryRef.load(this.utilitybillback);
  }
  ngAfterViewInit(): void {
    // do nothing.
  }

  radioChange($event: MatRadioChange): void {
    if ($event.source.name === "type") {
      if ($event.value === "electrical") {
        this.atticerror = true;
        this.atticphotos = [];
        this.isAtticFileUploaded = false;
        this.rooferror = true;
        this.roofphotos = [];
        this.isRoofPhotosUploaded = false;
        this.jobtype.setValidators([Validators.required]);
      } else if ($event.value == "both") {
        this.jobtype.setValidators([Validators.required]);
      } else {
        this.jobtype.clearValidators();
        this.jobtype.updateValueAndValidity();
      }
    }
    if ($event.source.name === "modeofstamping") {
      if ($event.value == "hardcopy" || $event.value == "both") {
        this.shippingaddress.setValidators([
          Validators.required,
          Validators.pattern(ADDRESSFORMAT),
        ]);
        // this.name.setValidators([
        //   Validators.required,
        //   Validators.min(1),
        //   Validators.pattern("^[a-zA-Z. ]{3,}$")]);
        this.contactnumber.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(15),
          Validators.pattern("^[0-9]{8,15}$"),
        ]);
        this.hardcopies.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(99),
          Validators.pattern("^[0-9]*"),
        ]);
      } else {
        this.shippingaddress.clearValidators();
        this.shippingaddress.updateValueAndValidity();
        // this.name.clearValidators();
        // this.name.updateValueAndValidity();
        this.contactnumber.clearValidators();
        this.contactnumber.updateValueAndValidity();
        this.hardcopies.clearValidators();
        this.hardcopies.updateValueAndValidity();
      }
    }
  }

  onAutocompleteSelected(result: PlaceResult): void {
    this.formatted_address = result.formatted_address;
  }

  onLocationSelected(location: Location): void {
    this.selectedSiteLocation = location;
  }
  // getErrorMessage(control: FormControl) {
  //   if (control == this.agreement && control.hasError("required")) {
  //     return "Selection is required";
  //   }
  //   if (control == this.peengineertype && control.hasError("required")) {
  //     return "You must select the PE Engineer type";
  //   }
  //   if (control.hasError("required")) {
  //     return "You must enter a value";
  //   }
  //   if (control == this.firstname) {
  //     return this.firstname.hasError("pattern")

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
    | string {
    if (control == this.raiserequestreason) {
      return "You must enter a value";
    }
    if (control == this.propertytype && control.hasError("required")) {
      return "You must select a value";
    }
    if (control == this.mountingtype && control.hasError("required")) {
      return "You must select a value";
    }

    if (control == this.modeofstamping && control.hasError("required")) {
      return "You must select a value";
    }
    if (control == this.type && control.hasError("required")) {
      return "You must select a value";
    }
    if (control == this.jobtype && control.hasError("required")) {
      return "You must select a value";
    }
    if (control.hasError("required")) {
      return "You must enter a value";
    } else if (control == this.email) {
      return this.email.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    } else if (control == this.shippingaddress) {
      return this.shippingaddress.hasError("pattern")
        ? "Please enter a valid shipping address."
        : "";
    } else if (control == this.contactnumber) {
      return this.contactnumber.hasError("pattern")
        ? "Please enter a valid phone number (Min - 8, Max - 15)."
        : "Phone should be of min. 8 and max. 15 characters.";
    }
    if (control == this.name) {
      return this.name.hasError("pattern")
        ? "Name must contain only alphabets."
        : this.name.hasError("minlength")
          ? "Name should be of min 2 character."
          : "";
    } else if (control == this.hardcopies) {
      return this.hardcopies.hasError("pattern")
        ? "please enter valid number of hard copies"
        : "please enter valid number of hard copies";
    }
  }
  oncompanyScroll(): void {
    this.scrolling = true;
    this.skip += 10;
    this.fetchCompaniesData();
    this.companyListlength == this.limit ? this.scrolling = true : this.scrolling = false;
  }
  fetchCompaniesData(): void {
    this.commonService.getClients(this.limit, this.skip).subscribe(
      (response) => {
        this.companyListlength = response.length;
        this.scrolling = false;
        this.getCompanies = response;
        this.companyList = [...this.companyList, ...response];
        this.changeDetectorRef.detectChanges();
        if (
          this.data.isEditMode &&
          !this.data.pestamp.createdby.ispaymentmodeprepay
        ) {
          // console.log(this.getCompanies)
          const toSelect = this.companyList.find(
            (c) => c.companyname == this.data.pestamp.createdby?.company
          );
          this.company.setValue(toSelect);
          // console.log(toSelect)
          this.changeDetectorRef.detectChanges();
        } else {
          this.company.setValue(this.data.pestamp.createdby?.company);
        }
        // this.filteredCompanies = this.company.valueChanges.pipe(
        //   startWith(""),
        //   map(value => (typeof value === "string" ? value : value.companyid)),
        //   map(companyname => (companyname ? this._filterCompanies(companyname) : this.getCompanies.slice()))
        // );
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.scrolling = false;
      }
    );
  }

  onCloseClick(): void {
    if (this.isSnackbaropen == true) {
      return;
    }
    if (this.data.isEditMode && this.data.pestamp.permitplan.length == 0) {
      this.permiterror = false;
    } else if (
      this.data.isEditMode &&
      (this.type.value == "structural" || this.type.value == "both") &&
      this.data.pestamp.roofphotos.length == 0
    ) {
      this.rooferror = false;
    } else if (
      this.data.isEditMode &&
      (this.type.value == "structural" || this.type.value == "both") &&
      this.data.pestamp.atticphotos.length == 0
    ) {
      this.atticerror = false;
    } else {
      this.dialogRef.close(this.data);
    }
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  onSavePestamp(): void {
    this.permiterror = true;
    this.rooferror = true;
    this.atticerror = true;
    this.senddirectlytowattmonk = false;
    this.isoutsourced = false;
    //console.log('atticphotos : '+this.data.pestamp.atticphotos);
    if (
      (!this.data.isEditMode && this.permitplan.length == 0) ||
      (this.data.isEditMode &&
        this.data.pestamp.permitplan.length == 0 &&
        this.permitplan.length == 0)
    ) {
      this.permiterror = false;
    }

    if (
      this.type.value != "electrical" &&
      ((!this.data.isEditMode && this.atticphotos.length == 0) ||
        (this.data.isEditMode &&
          this.data.pestamp.atticphotos.length == 0 &&
          this.atticphotos.length == 0))
    ) {
      this.atticerror = false;
    }
    if (
      this.type.value != "electrical" &&
      ((!this.data.isEditMode && this.roofphotos.length == 0) ||
        (this.data.isEditMode &&
          this.data.pestamp.roofphotos.length == 0 &&
          this.roofphotos.length == 0))
    ) {
      this.rooferror = false;
    }
    if (
      this.addPestampDialogForm.valid &&
      this.permiterror &&
      this.atticerror &&
      this.rooferror
    ) {
      // this.patchFormattedValues();
      if (this.permitplan.length == 0 && !this.data.isEditMode) {
        this.displayerror = false;
        this.addPestampDialogForm.markAllAsTouched();
      } else if (this.data.isEditMode) {
        if (
          this.data.pestamp.permitplan.length == 0 &&
          this.permitplan.length == 0
        ) {
          this.displayerror = false;
          this.addPestampDialogForm.markAllAsTouched();
        } else {
          this.isLoading = true;
          this.loadingmessage = "Saving data";
          this.changeDetectorRef.detectChanges();
          // if (this.data.isEditMode) {
          this.editPestampOnServer();
          // } else {
          //   this.addPestampToServer();
          // }
        }
      } else {
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        this.changeDetectorRef.detectChanges();
        this.addPestampToServer();
      }
    } else {
      this.displayerror = false;
      this.addPestampDialogForm.markAllAsTouched();

      this.changeDetectorRef.detectChanges();
    }
  }

  onOrderPestamp($ev): void {
    this.permiterror = true;
    this.rooferror = true;
    this.atticerror = true;
    this.raiseattachmentError = true;
    this.isLoading = true;
    $ev.preventDefault();
    this.senddirectlytowattmonk = true;
    if (
      this.raiserequestattachmentfiles.length == 0 &&
      this.data.designRaisedbyWattmonk
    ) {
      this.raiseattachmentError = false;
    }
    if (
      (!this.data.isEditMode && this.permitplan.length == 0) ||
      (this.data.isEditMode &&
        this.data.pestamp.permitplan.length == 0 &&
        this.permitplan.length == 0)
    ) {
      this.permiterror = false;
    }
    if (
      this.type.value != "electrical" &&
      ((!this.data.isEditMode && this.atticphotos.length == 0) ||
        (this.data.isEditMode &&
          this.data.pestamp.atticphotos.length == 0 &&
          this.atticphotos.length == 0))
    ) {
      this.atticerror = false;
    }
    if (
      this.type.value != "electrical" &&
      ((!this.data.isEditMode && this.roofphotos.length == 0) ||
        (this.data.isEditMode &&
          this.data.pestamp.roofphotos.length == 0 &&
          this.roofphotos.length == 0))
    ) {
      this.rooferror = false;
    }
    if (
      this.addPestampDialogForm.valid &&
      this.permiterror &&
      this.atticerror &&
      this.rooferror &&
      this.raiseattachmentError &&
      this.data.designRaisedbyWattmonk
    ) {
      // this.patchFormattedValues();

      if (
        this.raiserequestattachmentfiles.length == 0 &&
        !this.data.isEditMode
      ) {
        this.displayerror = false;
        this.addPestampDialogForm.markAllAsTouched();
      }
      if (this.permitplan.length == 0 && !this.data.isEditMode) {
        this.displayerror = false;
        this.addPestampDialogForm.markAllAsTouched();
      } else if (this.data.isEditMode) {
        if (this.permitplan.length == 0) {
          this.displayerror = false;
          this.addPestampDialogForm.markAllAsTouched();
        } else {
          this.senddirectlytowattmonk = true;
          this.addPestampToServer();
        }
      } else {
        this.addPestampToServer();
      }
    } else if (
      this.addPestampDialogForm.valid &&
      this.permiterror &&
      this.atticerror &&
      this.rooferror
    ) {
      // this.patchFormattedValues();
      if (this.permitplan.length == 0 && !this.data.isEditMode) {
        this.displayerror = false;
        this.addPestampDialogForm.markAllAsTouched();
      } else if (this.data.isEditMode) {
        if (this.permitplan.length == 0) {
          this.displayerror = false;
          this.addPestampDialogForm.markAllAsTouched();
        } else {
          this.senddirectlytowattmonk = true;
          this.addPestampToServer();
        }
      } else {
        this.addPestampToServer();
      }
    } else {
      this.isLoading = false;
      this.displayerror = false;
      this.addPestampDialogForm.markAllAsTouched();
      this.changeDetectorRef.detectChanges();
    }
  }

  patchFormattedValues(): void {
    const controls = this.addPestampDialogForm.controls;
    for (const name in controls) {
      try {
        // this.addDesignDialogForm.get(name).patchValue(this.addDesignDialogForm.get(name).value.replace(/['"]+/g, ''));
        this.addPestampDialogForm
          .get(name)
          .patchValue(
            this.addPestampDialogForm.get(name).value.replace(/<\/?.+?>/gi, "")
          );
      } catch (error) { }
    }
  }

  getPestampsCharges(pestamp): void {
    this.openOrderDesignDialog(pestamp);
  }
  openOrderDesignDialog(pestamp): void {
    let designid = "NA";
    if (this.data.isEditMode) {
      designid = "" + this.data.pestamp.id;
    }
    const dialogRef = this.dialog.open(OrderpestampsdialogComponent, {
      width: "30%",
      autoFocus: false,
      disableClose: true,
      panelClass: "white-modalbox",
      data: {
        isConfirmed: false,
        isLater: false,
        ispestamp: true,
        pestampid: designid,
        pestamp: pestamp,
        designRaisedbyWattmonk: this.data.designRaisedbyWattmonk,
        permit: this.data.design,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.isoutsourced = true;
        this.assigntowattmonk = true;
        this.isLoading = true;
        this.loadingmessage = "Saving data";
        this.changeDetectorRef.detectChanges();
        this.amounttopay = result.amounttopay;
        const paymenttype = localStorage.getItem("paymenttype");
        if (paymenttype == "direct" && this.loggedInUser.ispaymentmodeprepay) {
          this.chargeuserforPestamp(result.pestamp);
        } else {
          this.assignUserToDesign();
        }
      } else {
        this.isoutsourced = false;
        this.isLoading = false;
        this.dialogRef.close(this.data);
        // this.onSavePestamp( this.addPestampDialogForm)
      }
      if (result.isLater) {
        this.assigntowattmonk = false;
      }
    });
  }

  chargeuserforPestamp(record): void {
    // var paymenttype = localStorage.getItem('paymenttype');
    const inputdata = {
      amount: this.amounttopay,
      pestampid: record.id,
      user: this.loggedInUser.id,
    };
    this.pestampService.createdirectpayment(inputdata).subscribe(
      () => {
        // do nothing.
      },
      (error) => {
        this.isLoading = false;
        this.notifyService.showError(error, "Error");
      }
    );
  }

  addPestampToServer(): void {
    const companydata = this.addPestampDialogForm.get("company").value;
    if (companydata) {
      if (this.data.designRaisedbyWattmonk) {
        this.pestampCreatedBy = this.data.design.createdby.id;
        this.pestampCreatedByUserParent = this.data.design.createdby.id;
      } else {
        this.pestampCreatedBy = companydata.companyid;
        this.pestampCreatedByUserParent = companydata.companyid;
      }
    } else {
      this.pestampCreatedBy = "";
      this.pestampCreatedByUserParent = "";
    }
    this.isLoading = true;
    if (this.atticphotos.length > 0) {
      this.atticphotoserror = false;
    } else {
      this.atticphotoserror = true;
    }
    let latitude;
    let longitude;
    let address;
    const name = this.name.value;
    let phone;
    let hardcopies;
    let jobtype;
    let thirdpartystamping;
    if (this.type.value == "electrical" || this.type.value == "both") {
      jobtype = this.jobtype.value;
    } else {
      jobtype = null;
    }
    if (
      this.modeofstamping.value == "hardcopy" ||
      this.modeofstamping.value == "both"
    ) {
      phone = this.contactnumber.value;
      hardcopies = parseInt(this.hardcopies.value);
      if (this.formatted_address) {
        address = this.formatted_address;
        latitude = this.selectedSiteLocation.latitude;
        longitude = this.selectedSiteLocation.longitude;
      } else {
        address = this.shippingaddress.value;
        latitude = null;
        longitude = null;
      }
    } else {
      latitude = null;
      longitude = null;
      phone = null;
      hardcopies = null;
      address = null;
    }
    let pestamptatus;
    let pestampoutsourcedto;
    let raiserequestreason;

    if (this.data.designRaisedbyWattmonk) {
      pestamptatus = "accepted";
      pestampoutsourcedto = "232";
      raiserequestreason =
        this.addPestampDialogForm.get("raiserequestreason").value;
    } else {
      raiserequestreason = "";
      if (this.isoutsourced || this.pestampCreatedBy) {
        pestamptatus = "outsourced";
        pestampoutsourcedto = "232";
      } else {
        pestamptatus = "created";
        pestampoutsourcedto = null;
      }
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    thirdpartystamping = this.thirdPartyStamp;

    this.pestampService
      .addSiteAssessment(
        name,
        phone,
        this.addPestampDialogForm.get("modeofstamping").value,
        this.addPestampDialogForm.get("email").value,
        hardcopies,
        this.addPestampDialogForm.get("type").value,
        this.addPestampDialogForm.get("propertytype").value,
        this.addPestampDialogForm.get("mountingtype").value,
        address,
        this.addPestampDialogForm.get("comments").value,
        latitude,
        longitude,
        tomorrow.toISOString(),
        pestamptatus,
        pestampoutsourcedto,
        localStorage.getItem("paymentstatus"),
        jobtype,
        this.oldcommentid,
        this.sameemailconfirmed,
        this.designpestamp,
        this.pestampCreatedBy,
        this.pestampCreatedByUserParent,
        thirdpartystamping,
        raiserequestreason
      )
      .subscribe(
        (response) => {
          this.data.pestamp = response;

          if (this.isoutsourced || this.pestampCreatedBy) {
            this.getPestampCharges(
              this.data.pestamp.type,
              this.data.pestamp.propertytype,
              this.data.pestamp.modeofstamping,
              hardcopies
            );
          }
          this.authService.currentUserValue.user.amount =
            response.createdby.amount;
          localStorage.setItem("walletamount", "" + response.createdby.amount);
          this.data.isDataUpdated = true;
          this.newpestampRef.update({ count: this.newpestampcounts + 1 });
          // this.getClientsadmins(response.creatorparentid);
          /* if(paymenttype != null && this.loggedInUser.parent.ispaymentmodeprepay){
            this.chargeUserForDesignRequest(paymenttype, this.genericService.prelimdesigncharges);
          } */
          if (
            this.israiserequestattachmentUploaded &&
            this.data.designRaisedbyWattmonk
          ) {
            this.uploadraiseRequestAttachmentFile(
              response.id,
              this.raiserequestattachmentfiles[0],
              0
            );
          } else {
            if (this.isAtticFileUploaded) {
              this.uploadAtticphotos(response.id, this.atticphotos[0], 0);
            } else {
              if (this.isPermitfileUploaded) {
                this.uploadPermitfiles(response.id, this.permitplan[0], 0);
              } else {
                if (this.data.isEditMode) {
                  this.isLoading = false;
                  this.changeDetectorRef.detectChanges();
                  this.notifyService.showSuccess(
                    "PE Stamp request data has been updated successfully.",
                    "Success"
                  );
                  this.data.isDataUpdated = true;
                  this.dialogRef.close(this.data);
                } else {
                  // this.createNewDesignChatGroup(this.data.pestamp);
                  this.getClientsadmins(this.data.pestamp.creatorparentid);
                  localStorage.removeItem("paymenttype");
                  localStorage.removeItem("paymentstatus");
                }
              }
            }
          }
        },
        (error) => {
          if (error.status == "alreadyexist") {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            const message = error.message;
            const snackbarRef = this._snackBar.openFromComponent(
              ConfirmationsnackbarComponent,
              {
                data: {
                  message: message + " do you want to create again",
                  positive: "Yes",
                  negative: "No",
                },
              }
            );
            this.isSnackbaropen = true;

            snackbarRef.onAction().subscribe(() => {
              this.isSnackbaropen = false;
              this.sameemailconfirmed = true;
              this.isLoading = true;
              this.addPestampToServer();
              snackbarRef.afterDismissed().subscribe(() => {
                this.isSnackbaropen = false;
              });
            });
            snackbarRef.afterDismissed().subscribe(() => {
              this.isSnackbaropen = false;
            });
          } else {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showError(error, "Error");
          }
        }
      );
  }
  getPestampCharges(type, propertytype, modeofstamping, hardcopies): void {
    let amount;
    this.servicecharges = this.db.object("service_charges");
    this.servicechargedata = this.servicecharges.valueChanges();
    this.servicechargedata.subscribe((res) => {
      this.printingCharges = res.pestamp_printing.price;
      if (type == "both") {
        this.servicecharge = res.pestamp_both_residential.price;
        this.printingCharges = res.pestamp_printing.price * 2;
      } else if (type == "electrical" && propertytype == "residential") {
        this.servicecharge = res.pestamp_electrical_residential.price;
      } else if (type == "structural" && propertytype == "residential") {
        this.servicecharge = res.pestamp_structural_residential.price;
      } else if (propertytype == "commercial") {
        this.servicecharge = 0;
      }

      if (modeofstamping == "hardcopy" || modeofstamping == "both") {
        this.totalprintingcharges = hardcopies * this.printingCharges;
        if (propertytype == "commercial") {
          amount = this.servicecharge + 0;
        } else {
          amount = this.servicecharge + this.totalprintingcharges;
        }
      } else {
        amount = this.servicecharge;
      }
      let postData = {};
      postData = {
        amount: amount,
      };

      this.pestampService
        .assignPestamp(this.data.pestamp.id, postData)
        .subscribe(
          () => {
            // do nothing.
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
    });
  }
  /*
    chargeUserForDesignRequest(paymenttype, amount){
      this.commonService.stripepayment(this.genericService.stripepaymenttoken.id, this.authService.currentUserValue.user.email, this.authService.currentUserValue.user.id, amount, paymenttype
        ).subscribe(
          (response) => {

          },
          (error) => {

          }

        )
    } */

  assignUserToDesign(): void {
    const pestampacceptancestarttime = new Date();
    pestampacceptancestarttime.setMinutes(
      pestampacceptancestarttime.getMinutes() + 15
    );
    const paymenttype = localStorage.getItem("paymenttype");
    let status = "";
    if (this.data.designRaisedbyWattmonk) {
      status = "accepted";
    } else {
      status = "outsourced";
    }
    let postData = {};
    postData = {
      outsourcedto: 232,
      isoutsourced: "true",
      status: status,
      pestampacceptancestarttime: pestampacceptancestarttime,
      paymenttype: paymenttype,
      amount: this.amounttopay,
    };

    this.pestampService.assignPestamp(this.data.pestamp.id, postData).subscribe(
      (response) => {
        // this.isLoading = false;
        this.data.pestamp = response;
        // this.changeDetectorRef.detectChanges();
        //this.data.pestamp = response;
        this.createClientchatgroup(response);
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  editPestampOnServer(): void {
    let address;
    let phone;
    let hardcopies;
    let jobtype;
    if (this.type.value == "electrical" || this.type.value == "both") {
      jobtype = this.jobtype.value;
    } else {
      jobtype = null;
    }
    if (
      this.modeofstamping.value === "hardcopy" ||
      this.modeofstamping.value === "both"
    ) {
      phone = this.contactnumber.value;
      hardcopies = this.hardcopies.value;
      if (this.selectedSiteLocation) {
        address = this.formatted_address;

      } else {
        address = this.shippingaddress.value;
      }
    } else {
      phone = null;
      hardcopies = null;
      address = null;
    }

    const comment =
      this.data.pestamp.status == "created"
        ? this.addPestampDialogForm.get("comments").value
        : null;

    // if (this.selectedSiteLocation && this.selectedSiteLocation != undefined) {
    //   address = this.formatted_address;

    // }
    // else {
    //   address = this.shippingaddress.value;
    // }

    const postData = {
      personname: this.addPestampDialogForm.get("name").value,
      email: this.addPestampDialogForm.get("email").value,
      contactnumber: phone,
      modeofstamping: this.addPestampDialogForm.get("modeofstamping").value,
      type: this.addPestampDialogForm.get("type").value,
      propertytype: this.addPestampDialogForm.get("propertytype").value,
      mountingtype: this.addPestampDialogForm.get("mountingtype").value,
      hardcopies: hardcopies,
      deliveryaddress: address,
      jobtype: jobtype,
      comments: comment,
      // createdby:this.loggedInUser.id,
      oldcommentid: this.oldcommentid,
      thirdpartystamping: this.thirdPartyStamp,
    };

    this.pestampService.editPestamp(this.data.pestamp.id, postData).subscribe(
      (response) => {
        this.data.pestamp = response;
        this.isLoading = true;
        this.changeDetectorRef.detectChanges();
        if (this.isAtticFileUploaded) {
          this.uploadAtticphotos(response.id, this.atticphotos[0], 0);
        } else if (this.isRoofPhotosUploaded) {
          this.uploadRoofPhotos(response.id, this.roofphotos[0], 0);
        } else {
          if (this.isPermitfileUploaded) {
            this.uploadPermitfiles(response.id, this.permitplan[0], 0);
          } else {
            if (this.data.isEditMode) {
              if (this.senddirectlytowattmonk) {
                this.assignUserToDesign();
              } else {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
                this.notifyService.showSuccess(
                  "PE Stamp request data has been updated successfully.",
                  "Success"
                );
                this.data.isDataUpdated = true;
                this.dialogRef.close(this.data);
              }
            } else {
              // this.createNewDesignChatGroup(this.data.pestamp);
              this.getClientsadmins(this.data.pestamp.creatorparentid);
            }
          }
        }
      },
      (error) => {
        this.isLoading = false;
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onRoofPhotosSelect(event): void {
    this.rooferror = true;
    this.isRoofPhotosUploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      const type = element.name.split(".");
      if (type[1] == "heic" || type[1] == "HEIC") {
        element.isImage = true;
        const reader = new FileReader();
        reader.onload = (event: any) => {
          fetch(event.target.result)
            .then((res) => res.blob())
            .then((blob) => heic2any({ blob: blob, toType: "image/jpeg" }))
            .then((jpgBlob: Blob) => {
              let replacedfile;
              if (type[1] == "HEIC") {
                replacedfile = new File(
                  [jpgBlob],
                  element.name.replace("HEIC", "jpeg"),
                  { type: "image/jpeg" }
                );
              } else {
                replacedfile = new File(
                  [jpgBlob],
                  element.name.replace("heic", "jpeg"),
                  { type: "image/jpeg" }
                );
              }

              this.roofphotos.push(replacedfile);
              this.roofphotos.forEach((item) => (item["isImage"] = true));
              setTimeout(() => {
                this.changeDetectorRef.detectChanges();
              }, 300);
              this.changeDetectorRef.detectChanges();
            })
            .catch(() => {
              // see error handling section
            });
        };
        reader.readAsDataURL(element);
      } else {
        this.roofphotos.push(element);
        this.changeDetectorRef.detectChanges();
      }
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onRoofPhotosRemove(event): void {
    this.roofphotos.splice(this.roofphotos.indexOf(event), 1);
    if (this.roofphotos.length == 0) {
      this.isRoofPhotosUploaded = false;
    }
  }

  uploadRoofPhotos(recordid: number, fileobj: File, index): void {
    this.loadingmessage =
      "Uploading roof Photos " + (index + 1) + " of " + this.roofphotos.length;
    this.changeDetectorRef.detectChanges();
    this.commonService
      .uploadFile(
        recordid,
        "pestamp/" + recordid,
        fileobj,
        "roofphotos",
        "pestamp"
      )
      .subscribe(
        () => {
          if (index < this.roofphotos.length - 1) {
            const newindex = index + 1;
            this.uploadRoofPhotos(
              recordid,
              this.roofphotos[newindex],
              newindex
            );
          } else {
            if (this.isPermitfileUploaded) {
              this.uploadPermitfiles(recordid, this.permitplan[0], 0);
            } else {
              if (this.data.isEditMode) {
                if (this.senddirectlytowattmonk) {
                  this.assignUserToDesign();
                } else {
                  this.isLoading = false;
                  this.changeDetectorRef.detectChanges();
                  this.notifyService.showSuccess(
                    "PE Stamp request data has been updated successfully.",
                    "Success"
                  );
                  this.data.isDataUpdated = true;
                  this.dialogRef.close(this.data);
                }
              } else {
                // this.createNewDesignChatGroup(this.data.pestamp);
                this.getClientsadmins(this.data.pestamp.creatorparentid);
              }
            }
          }
        },
        (error) => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.notifyService.showError(
            error,
            "Some error occurred when uploading file. Please try again."
          );
        }
      );
  }

  onPermitFileSelect(event): void {
    // if (this.permitplan && this.permitplan.length >= 1) {
    //   this.onPermitFileRemove(this.permitplan[0]);
    // }
    this.isPermitfileUploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      this.permitplan.push(element);
      this.permiterror = true;
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onPermitFileRemove(event): void {
    this.permitplan.splice(this.permitplan.indexOf(event), 1);
    if (this.permitplan.length == 0) {
      this.isPermitfileUploaded = false;
    }
  }

  uploadPermitfiles(recordid: number, fileobj: File, index): void {
    this.loadingmessage =
      "Uploading permit file " + (index + 1) + " of " + this.permitplan.length;
    this.changeDetectorRef.detectChanges();
    this.commonService
      .uploadFile(
        recordid,
        "pestamp/" + recordid,
        fileobj,
        "permitplan",
        "pestamp"
      )
      .subscribe(
        () => {
          if (index < this.permitplan.length - 1) {
            const newindex = index + 1;
            this.uploadPermitfiles(
              recordid,
              this.permitplan[newindex],
              newindex
            );
          } else {
            if (this.data.isEditMode) {
              if (this.senddirectlytowattmonk) {
                this.assignUserToDesign();
              } else {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
                this.notifyService.showSuccess(
                  "PE Stamp request data has been updated successfully.",
                  "Success"
                );
                this.data.isDataUpdated = true;
                this.dialogRef.close(this.data);
              }
            } else {
              // this.createNewDesignChatGroup(this.data.pestamp);
              this.getClientsadmins(this.data.pestamp.creatorparentid);
            }
          }
        },
        (error) => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.notifyService.showError(
            error,
            "Some error occurred when uploading file. Please try again."
          );
        }
      );
  }

  onAtticFileSelect(event): void {
    this.isAtticFileUploaded = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      element.isImage = false;
      if (element.type.includes("image")) {
        element.isImage = true;
      }
      const type = element.name.split(".");
      if (type[1] == "heic" || type[1] == "HEIC") {
        element.isImage = true;
        const reader = new FileReader();
        reader.onload = (event: any) => {
          fetch(event.target.result)
            .then((res) => res.blob())
            .then((blob) => heic2any({ blob: blob, toType: "image/jpeg" }))
            .then((jpgBlob: Blob) => {
              let replacedfile;
              if (type[1] == "HEIC") {
                replacedfile = new File(
                  [jpgBlob],
                  element.name.replace("HEIC", "jpeg"),
                  { type: "image/jpeg" }
                );
              } else {
                replacedfile = new File(
                  [jpgBlob],
                  element.name.replace("heic", "jpeg"),
                  { type: "image/jpeg" }
                );
              }

              this.atticphotos.push(replacedfile);
              this.atticphotos.forEach((item) => (item["isImage"] = true));
              setTimeout(() => {
                this.changeDetectorRef.detectChanges();
              }, 300);
              this.changeDetectorRef.detectChanges();
            })
            .catch(() => {
              // see error handling section
            });
        };
        reader.readAsDataURL(element);
      } else {
        this.atticphotos.push(element);
        this.atticerror = true;
        this.changeDetectorRef.detectChanges();
      }
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onAtticFileRemove(event): void {
    this.atticphotos.splice(this.atticphotos.indexOf(event), 1);
    if (this.atticphotos.length == 0) {
      this.isAtticFileUploaded = false;
    }
  }

  uploadAtticphotos(recordid: number, fileobj: File, index): void {
    this.loadingmessage =
      "Uploading attic photos " +
      (index + 1) +
      " of " +
      this.atticphotos.length;
    this.changeDetectorRef.detectChanges();
    this.commonService
      .uploadFile(
        recordid,
        "pestamp/" + recordid,
        fileobj,
        "atticphotos",
        "pestamp"
      )
      .subscribe(
        () => {
          if (index < this.atticphotos.length - 1) {
            const newindex = index + 1;
            this.uploadAtticphotos(
              recordid,
              this.atticphotos[newindex],
              newindex
            );
          } else {
            if (this.isRoofPhotosUploaded) {
              this.uploadRoofPhotos(recordid, this.roofphotos[0], 0);
            } else if (this.isPermitfileUploaded) {
              this.uploadPermitfiles(recordid, this.permitplan[0], 0);
            } else {
              if (this.data.isEditMode) {
                if (this.senddirectlytowattmonk) {
                  this.assignUserToDesign();
                } else {
                  this.isLoading = false;
                  this.changeDetectorRef.detectChanges();
                  this.notifyService.showSuccess(
                    "PE Stamp request data has been updated successfully.",
                    "Success"
                  );
                  this.data.isDataUpdated = true;
                  this.dialogRef.close(this.data);
                }
              } else {
                // this.createNewDesignChatGroup(this.data.pestamp);
                this.getClientsadmins(this.data.pestamp.creatorparentid);
              }
            }
          }
        },
        (error) => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.notifyService.showError(
            error,
            "Some error occurred when uploading file. Please try again."
          );
        }
      );
  }

  getClientsadmins(id): void {
    this.commonService.getClientAdmins(id).subscribe(
      (response) => {
        this.clientadmins = response;
        this.createNewDesignChatGroup(this.data.pestamp);
      },
      (error) => {
        this.createNewDesignChatGroup(this.data.pestamp);
        this.notifyService.showError(error, "Error");
      }
    );
  }
  createNewDesignChatGroup(pestamp: Pestamp): void {
    if (this.isClient) {
      if (this.senddirectlytowattmonk) {
        this.getPestampsCharges(pestamp);
      } else {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.notifyService.showSuccess(
          "PE stamp request has been saved successfully.",
          "Success"
        );
        localStorage.removeItem("paymentstatus");
        this.data.isDataUpdated = true;
        this.dialogRef.close(this.data);
      }
    } else {
      /* else if(this.data.designRaisedbyWattmonk){
      this.openOrderDesignDialog(this.data.pestamp);
    }*/
      this.loadingmessage = "Initializing Chat";
      this.changeDetectorRef.detectChanges();
      this.isLoading = true;
      const GUID = pestamp.chatid;

      const name = pestamp.personname.substring(0, 60);
      const email = pestamp.email.substring(0, 60);

      const currentdatetime = moment(new Date()).format("DDMMYY-HHmm");
      const groupName =
        pestamp.type + "_" + name + "_" + email + "_" + currentdatetime;

      const groupType = CometChat.GROUP_TYPE.PASSWORD;
      const password = pestamp.groupchatpassword

      const group = new CometChat.Group(GUID, groupName, groupType, password);
      const adminsid = [];
      adminsid.push(this.loggedInUser.parent.cometchatuid);
      this.wattmonkadmins.forEach((element) => {
        adminsid.push(element);
      });
      if (this.wattmonkadmins.length == 0) {
        adminsid.push(416);
        adminsid.push(456);
      }
      CometChat.createGroup(group).then(
        (group) => {
          const membersList = [
            new CometChat.GroupMember(
              "" + pestamp.createdby.cometchatuid,
              CometChat.GROUP_MEMBER_SCOPE.ADMIN
            ),
          ];
          adminsid.forEach((element) => {
            membersList.push(
              new CometChat.GroupMember(
                "" + element,
                CometChat.GROUP_MEMBER_SCOPE.ADMIN
              )
            );
          });
          CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
            () => {
              const chatgroupusers = adminsid;
              chatgroupusers.push(pestamp.createdby.cometchatuid);
              const inputData = {
                title: groupName,
                guid: GUID,
                parentid: pestamp.createdby.parent.id,
                chatgroupusers: chatgroupusers,
              };
              this.commonService.addChatGroup(inputData).subscribe(() => {
                // do nothing.
              });
              if (this.senddirectlytowattmonk) {
                this.assignUserToDesign();
              } else {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
                this.notifyService.showSuccess(
                  "PE Stamp request has been saved successfully.",
                  "Success"
                );
                this.data.isDataUpdated = true;
                this.dialogRef.close(this.data);
              }
            },
            () => {
              this.isLoading = false;
              this.changeDetectorRef.detectChanges();
            }
          );
        },
        () => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        }
      );
    }
  }

  onRemoveAtticFile(file: UploadedFile, index: number): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.atticphotosgallery.splice(index, 1);
        this.data.pestamp.atticphotos.splice(index, 1);
        this.data.pestamp.atticphotos = [...this.data.pestamp.atticphotos];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  onRemoveRoofPhotos(file: UploadedFile, index: number): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.roofphotosgallery.splice(index, 1);
        this.data.pestamp.roofphotos.splice(index, 1);
        this.data.pestamp.roofphotos = [...this.data.pestamp.roofphotos];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onRemovePermitFile(file: UploadedFile, index: number): void {
    this.commonService.deleteUploadedFile("" + file.id).subscribe(
      () => {
        this.data.pestamp.permitplan.splice(index, 1);
        this.data.pestamp.permitplan = [...this.data.pestamp.permitplan];
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  convertUrlToFile(url: string, name: string, ext: string, mime: string): void {
    const headers = new HttpHeaders({ "Content-Type": mime });
    this.http
      .get(url, { responseType: "arraybuffer", headers })
      .subscribe((res) => {
        this.permitplan.push(
          new File([res], name + ext, {
            type: mime,
          })
        );
        this.isPermitfileUploaded = true;
      });
  }
  createClientchatgroup(pestamp: Pestamp): void {
    const GUID = pestamp.chatid;

    const name = pestamp.personname.substring(0, 60);
    const email = pestamp.email.substring(0, 60);
    const groupName = pestamp.type + "_" + name + "_" + email;

    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = pestamp.groupchatpassword

    const group = new CometChat.Group(GUID, groupName, groupType, password);
    const adminsid = [];
    this.wattmonkadmins.forEach((element) => {
      adminsid.push(element);
    });
    this.clientadmins.forEach((element) => {
      adminsid.push(element);
    });
    if (this.wattmonkadmins.length == 0) {
      adminsid.push(416);
      adminsid.push(456);
    }

    CometChat.createGroup(group).then(
      (group) => {
        const membersList = [
          new CometChat.GroupMember(
            "" + pestamp.createdby.cometchatuid,
            CometChat.GROUP_MEMBER_SCOPE.ADMIN
          ),
        ];
        adminsid.forEach((element) => {
          membersList.push(
            new CometChat.GroupMember(
              "" + element,
              CometChat.GROUP_MEMBER_SCOPE.ADMIN
            )
          );
        });
        CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
          () => {
            const chatgroupusers = adminsid;
            chatgroupusers.push(pestamp.createdby.cometchatuid);
            const inputData = {
              title: groupName,
              guid: GUID,
              parentid: pestamp.createdby.parent.id,
              chatgroupusers: chatgroupusers,
            };
            this.commonService.addChatGroup(inputData).subscribe(() => {
              // do nothing.
            });
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showSuccess(
              "Pestamp request has been successfully assigned to WattMonk.",
              "Success"
            );
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          },
          () => {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.notifyService.showSuccess(
              "Pestamp request has been successfully assigned to WattMonk.",
              "Success"
            );
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          }
        );
      },
      () => {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.notifyService.showSuccess(
          "Pestamp request has been successfully assigned to WattMonk.",
          "Success"
        );
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        this.data.isDataUpdated = true;
        this.dialogRef.close(this.data);
      }
    );
  }
  getWattmonkadmins(): void {
    this.commonService.getWattmonkAdmins().subscribe(
      (response) => {
        this.wattmonkadmins = response;
        this.commonService.getWattmonkPEAdmins().subscribe((peeAdmins) => {
          peeAdmins.forEach((element) => {
            this.wattmonkadmins.push(element);
          });
        });
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  public otherStampingRequired(event: MatCheckboxChange): void {
    this.thirdPartyStamp = event.checked;
  }
  onraiserequestattachmentFileSelect(event): void {
    this.raiseattachmentError = true;
    for (let index = 0; index < event.addedFiles.length; index++) {
      const element = event.addedFiles[index];
      const type = element.name.split(".");
      // WEB ARCHIVE EXT NOT SUPPORTED CODE
      if (type[1] == "webarchive") {
        this.notifyService.showError(
          "Web archive file format is not supported",
          "Error"
        );
      } else {
        this.israiserequestattachmentUploaded = true;
        element.isImage = false;
        if (element.type.includes("image")) {
          element.isImage = true;
        }
        if (type[1] == "heic" || type[1] == "HEIC") {
          element.isImage = true;
          const reader = new FileReader();
          reader.onload = (event: any) => {
            fetch(event.target.result)
              .then((res) => res.blob())
              .then((blob) => heic2any({ blob: blob, toType: "image/jpeg" }))
              .then((jpgBlob: Blob) => {
                let replacedfile;
                if (type[1] == "HEIC") {
                  replacedfile = new File(
                    [jpgBlob],
                    element.name.replace("HEIC", "jpeg"),
                    { type: "image/jpeg" }
                  );
                } else {
                  replacedfile = new File(
                    [jpgBlob],
                    element.name.replace("heic", "jpeg"),
                    { type: "image/jpeg" }
                  );
                }
                this.raiserequestattachmentfiles.push(replacedfile);
                this.raiseattachmentError = true;
                this.raiserequestattachmentfiles.forEach(
                  (item) => (item["isImage"] = true)
                );
                setTimeout(() => {
                  this.changeDetectorRef.detectChanges();
                }, 300);
                this.changeDetectorRef.detectChanges();
              })
              .catch(() => {
                // see error handling section
              });
          };
          reader.readAsDataURL(element);
        } else {
          const extension = element.name.substring(element.name.lastIndexOf("."));

          const mimetype = this.genericService.getMimetype(extension);
          // window.console.log(extension, mimetype);
          const data = new Blob([element], {
            type: mimetype,
          });
          const replacedfile = new File([data], element.name, { type: mimetype });
          replacedfile["isImage"] = element.isImage;
          this.raiserequestattachmentfiles.push(replacedfile);
        }
      }
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 300);
  }

  onraiserequestattachmentFileRemove(event): void {
    this.raiserequestattachmentfiles.splice(
      this.raiserequestattachmentfiles.indexOf(event),
      1
    );
    if (this.raiserequestattachmentfiles.length == 0) {
      this.israiserequestattachmentUploaded = false;
      this.raiseattachmentError = false;
    }
  }
  uploadraiseRequestAttachmentFile(
    recordid: number,
    fileobj: File,
    index
  ): void {
    this.loadingmessage =
      "Uploading Proof Of Attachment File " +
      (index + 1) +
      " of " +
      this.raiserequestattachmentfiles.length;
    this.changeDetectorRef.detectChanges();
    this.commonService
      .uploadFile(
        recordid,
        "pestamp/" + recordid,
        fileobj,
        "raiserequestattachment",
        "pestamp"
      )
      .subscribe(
        () => {
          if (index < this.raiserequestattachmentfiles.length - 1) {
            const newindex = parseInt(index) + 1;
            this.uploadraiseRequestAttachmentFile(
              recordid,
              this.raiserequestattachmentfiles[newindex],
              newindex
            );
          } else {
            if (this.isAtticFileUploaded) {
              this.uploadAtticphotos(recordid, this.roofphotos[0], 0);
            } else if (this.isRoofPhotosUploaded) {
              this.uploadRoofPhotos(recordid, this.roofphotos[0], 0);
            } else if (this.isPermitfileUploaded) {
              this.uploadPermitfiles(recordid, this.permitplan[0], 0);
            } else {
              if (this.data.isEditMode) {
                if (this.senddirectlytowattmonk) {
                  this.assignUserToDesign();
                } else {
                  this.isLoading = false;
                  this.changeDetectorRef.detectChanges();
                  this.notifyService.showSuccess(
                    "PE Stamp request data has been updated successfully.",
                    "Success"
                  );
                  this.data.isDataUpdated = true;
                  this.dialogRef.close(this.data);
                }
              } else {
                // this.createNewDesignChatGroup(this.data.pestamp);
                this.getClientsadmins(this.data.pestamp.creatorparentid);
              }
            }
          }
          /*else {
            if (this.data.isEditMode) {
              if (this.senddirectlytowattmonk) {
                this.assignUserToDesign();
              } else {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
                this.notifyService.showSuccess("Design request data has been updated successfully.", "Success");
                this.data.isDataUpdated = true;
                this.dialogRef.close(this.data);
              }
            } else {
              
              // this.createNewDesignChatGroup(this.data.design);
              this.getClientsadmins(this.data.design.creatorparentid);
            }
          }*/
        },
        (error) => {
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
          this.notifyService.showError(
            error,
            "Some error occurred when uploading file. Please try again."
          );
        }
      );
  }

  downloadSingleFile(url) {
    this.isLoading = true;
    this.loadingmessage = "Downloading file";
    let filename = url?.data?.src?.substring(url?.data?.src?.lastIndexOf("/") + 1, url?.data?.src?.length);

    this.commonService.downloadFile(url?.data?.src).subscribe((res: any) => {
      this.isLoading = false;
      this.loadingmessage = "Saving data";
      const link = document.createElement("a");
      link.href = res.data;
      link.download = filename;

      link.click();
    })


  }
}
