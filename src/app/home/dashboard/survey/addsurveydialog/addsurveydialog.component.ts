import { Location } from "@angular-material-extensions/google-maps-autocomplete";
import { DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CometChat } from "@cometchat-pro/chat";
import { Gallery, GalleryItem, ImageItem } from "@ngx-gallery/core";
import heic2any from "heic2any";
import * as moment from "moment";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import {
  ADDRESSFORMAT,
  MAILFORMAT,
  NAME,
  ROLES
} from "src/app/_helpers/constants";
import { Design, User } from "src/app/_models";
import { Probability } from "src/app/_models/probability";
import { Survey } from "src/app/_models/survey";
import {
  AuthenticationService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { SurveyService } from "src/app/_services/survey.service";
import PlaceResult = google.maps.places.PlaceResult;

export interface SurveyFormData {
  isEditMode: boolean;
  isDataUpdated: boolean;
  generateAutocad: boolean;
  user: User;
  survey: Survey;
  design: Design;
  isprelimrequest: boolean;
  isCustomer: boolean;
  customersurvey: Probability;
  isWattmonkUser: boolean;
}

@Component({
  selector: "app-addsurveydialog",
  templateUrl: "./addsurveydialog.component.html",
  styleUrls: ["./addsurveydialog.component.scss"],
  providers: [DatePipe],
})
export class AddsurveydialogComponent implements OnInit {
  minTime: any;
  selectedSiteLocation: Location;

  minDate: Date;
  formatted_address: string;
  postalcode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  country: string;
  currenttime: string;
  isLoading = false;
  loadingmessage = "Save data.";
  name = new FormControl("", [
    Validators.required,
    Validators.minLength(2),
    Validators.pattern(NAME),
  ]);
  email = new FormControl("", [Validators.pattern(MAILFORMAT)]);
  address = new FormControl("", [
    Validators.required,
    Validators.pattern(ADDRESSFORMAT),
  ]);
  date = new FormControl("", [Validators.required]);
  time = new FormControl("", [Validators.required]);
  phone = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("[0-9]{8,15}$"),
  ]);
  comments = new FormControl("", []);

  jobtype = new FormControl("", [Validators.required]);
  projecttype = new FormControl("", [Validators.required]);
  raiserequestreason = new FormControl("");

  displayerror = true;
  addSurveyDialogForm: FormGroup;
  selectedModuleMakeID: any;
  loggedInUser;
  sameemailconfirmed = null;
  defaultvalues = "-";
  prelimAttachments: GalleryItem[];
  customerid: number;
  raiseattachmentError = true;
  raiserequestattachmentfiles: File[] = [];
  israiserequestattachmentUploaded = false;

  constructor(
    public dialogRef: MatDialogRef<AddsurveydialogComponent>,
    private notifyService: NotificationService,
    private commonService: CommonService,
    public genericService: GenericService,
    private surveyService: SurveyService,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthenticationService,
    private datePipe: DatePipe,
    public gallery: Gallery,
    @Inject(MAT_DIALOG_DATA) public data: SurveyFormData
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
    this.addSurveyDialogForm = new FormGroup({
      email: this.email,
      name: this.name,
      address: this.address,
      phone: this.phone,
      date: this.date,
      time: this.time,
      jobtype: this.jobtype,
      projecttype: this.projecttype,
      comments: this.comments,
      raiserequestreason: this.raiserequestreason,
    });
    this.jobtype.setValue("pv");
    this.projecttype.setValue("residential");
    this.minDate = new Date();
    const currentdate = new Date();
    this.currenttime = currentdate.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    if (data.isEditMode) {
      this.addSurveyDialogForm.patchValue({
        email: data.survey.email,
        name: data.survey.name,
        address: data.survey.address,
        phone: data.survey.phonenumber,
        jobtype: data.survey.jobtype,
        comments: data.survey.comments[0]
          ? data.survey.comments[0].message
          : "",
        time: genericService.formatTimeInDisplayFormat(data.survey.datetime),
        date: genericService.formatDateInCalendarPickerFormat(
          data.survey.datetime
        ),
        projecttype: data.survey.projecttype,
      });
      this.formatted_address = data.survey.address;
      this.city = data.survey.city;
      this.state = data.survey.state;
      this.country = data.survey.country;
      this.postalcode = data.survey.postalcode;

      this.minTime = "00:01 am";
    } else {
      this.minTime = moment().format("hh:mm a");
    }

    if (this.data.isprelimrequest) {
      this.addSurveyDialogForm.patchValue({
        email: data.design.email,
        name: data.design.name,
        address: data.design.address,
        projecttype: data.design.projecttype,
      });

      this.prelimAttachments = this.data.design.attachments.map(
        (item) =>
          new ImageItem({ src: item.url, thumb: item.url, ext: item.ext })
      );
      this.prelimAttachmentsGallery();
    }

    if (data.isCustomer) {
      this.addSurveyDialogForm.patchValue({
        name: data.customersurvey?.name,
        email: data.customersurvey?.email,
        phone: data.customersurvey?.phone,
        address: data.customersurvey?.address,
      });
      this.customerid = this.data.customersurvey.id;
      this.city = this.data.customersurvey.city;
      this.state = this.data.customersurvey.state;
      this.country = this.data.customersurvey.county;
      this.postalcode = this.data.customersurvey.zipcode.toString();
    }
    if (this.data.isWattmonkUser) {
      this.raiserequestreason.setValidators(Validators.required);
    }
  }

  ngOnInit(): void {
    // do nothing.
  }

  prelimAttachmentsGallery(): void {
    this.gallery.ref().load(this.prelimAttachments);
  }

  getSelectedDate(event): void {
    if (event.value > this.minDate) {
      this.minTime = "00:01 am";
    } else {
      this.minTime = moment().format("hh:mm a");
    }
  }
  onAutocompleteSelected(result: PlaceResult): void {
    this.latitude = result.geometry.location.lat();
    this.longitude = result.geometry.location.lng();
    this.formatted_address = result.name + result.formatted_address;
    for (let i = 0; i < result.address_components.length; i++) {
      for (let j = 0; j < result.address_components[i].types.length; j++) {
        if (result.address_components[i].types[j] == "postal_code") {
          this.postalcode = result.address_components[i].long_name;
        } else if (result.address_components[i].types[j] == "country") {
          this.country = result.address_components[i].long_name;
        } else if (
          result.address_components[i].types[j] == "administrative_area_level_1"
        ) {
          this.state = result.address_components[i].long_name;
        } else if (
          result.address_components[i].types[j] == "administrative_area_level_2"
        ) {
          this.city = result.address_components[i].long_name;
        }
      }
    }
  }

  onLocationSelected(location: Location): void {
    this.selectedSiteLocation = location;
  }

  onCloseClick(): void {
    this.dialogRef.close(this.data);
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getErrorMessage(
    control: FormControl
  ): string | string | string | string | string | string | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    if (control == this.raiserequestreason) {
      return "You must enter a value";
    }
    if (control == this.name) {
      return this.name.hasError("pattern")
        ? "Name must contain only alphabets."
        : this.name.hasError("minlength")
          ? "Name should be of min 2 character."
          : "";
    } else if (control == this.email) {
      return this.email.hasError("pattern")
        ? "Please enter a valid email."
        : "";
    } else if (control == this.phone) {
      return this.phone.hasError("pattern")
        ? "Please enter a valid phone number (Min - 8, Max - 15)."
        : "";
    } else if (control == this.address) {
      return this.address.hasError("pattern")
        ? "Please enter a valid address."
        : "";
    }
  }

  onAddSurvey(): void {
    this.isLoading = true;
    this.raiseattachmentError = true;
    const date = this.datePipe.transform(
      this.addSurveyDialogForm.get("date").value,
      "yyyy-MM-dd"
    );
    const time = this.addSurveyDialogForm.get("time").value;
    let momentObj;
    if (this.data.isEditMode) {
      if (
        time ===
        this.genericService.formatTimeInDisplayFormat(this.data.survey.datetime)
      ) {
        momentObj = moment(
          date +
          this.genericService.formatTimeInDisplayFormat(
            this.data.survey.datetime
          ),
          "YYYY-MM-DDLT"
        );
      } else {
        momentObj = moment(date + time, "YYYY-MM-DDLT");
      }
    } else {
      momentObj = moment(date + time, "YYYY-MM-DDLT");
    }

    const dateTime = momentObj.format("YYYY-MM-DD HH:mm:ss");

    let address;

    if (this.formatted_address) {
      address = this.formatted_address;
    } else {
      address = this.address.value;
    }
    if (
      this.raiserequestattachmentfiles.length == 0 &&
      this.data.isWattmonkUser
    ) {
      this.raiseattachmentError = false;
      this.addSurveyDialogForm.markAllAsTouched();
    }

    let surveyraisedByWattmonk;
    if (this.data.isWattmonkUser != undefined && this.data.isWattmonkUser) {
      surveyraisedByWattmonk = true;
    } else {
      surveyraisedByWattmonk = false;
    }
    if (
      this.addSurveyDialogForm.valid &&
      this.raiseattachmentError &&
      surveyraisedByWattmonk
    ) {
      const isoutsourced = "false";
      let status;
      let assignedto;
      if (this.loggedInUser.role.id == ROLES.Surveyor) {
        status = "assigned";
        assignedto = this.loggedInUser.id;
      } else {
        status = "created";
        assignedto = null;
      }
      let prelimid;
      let isdesigndelivered;
      if (this.data.isprelimrequest) {
        prelimid = this.data.design.id;
        isdesigndelivered = true;
      } else {
        prelimid = null;
        isdesigndelivered = false;
      }
      let raiserequestreason;
      if (this.data.isWattmonkUser) {
        raiserequestreason =
          this.addSurveyDialogForm.get("raiserequestreason").value;
      } else {
        raiserequestreason = "";
      }
      let designCreatedBy;
      let designCreatedByUserParent;
      if (this.data.isWattmonkUser && this.data.design != undefined) {
        designCreatedBy = this.data.design.createdby.id;
        designCreatedByUserParent = this.data.design.creatorparentid;
      } else {
        designCreatedBy = "";
        designCreatedByUserParent = "";
      }
      this.surveyService
        .addSurvey(
          this.addSurveyDialogForm.get("name").value,
          this.addSurveyDialogForm.get("email").value,
          this.addSurveyDialogForm.get("phone").value,
          address,
          dateTime,
          this.addSurveyDialogForm.get("jobtype").value,
          this.addSurveyDialogForm.get("comments").value,
          this.latitude,
          this.longitude,
          this.city,
          this.state,
          this.country,
          parseInt(this.postalcode),
          status,
          isoutsourced,
          assignedto,
          prelimid,
          isdesigndelivered,
          this.addSurveyDialogForm.get("projecttype").value,
          this.sameemailconfirmed,
          this.customerid,
          designCreatedBy,
          designCreatedByUserParent,
          raiserequestreason
        )
        .subscribe(
          (response) => {
            this.isLoading = true;
            this.data.survey = response;
            this.uploadraiseRequestAttachmentFile(
              response.id,
              this.raiserequestattachmentfiles[0],
              0
            );
          },
          (error) => {
            if (error.status == "Already Exist") {
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

              snackbarRef.onAction().subscribe(() => {
                this.sameemailconfirmed = true;
                this.onAddSurvey();
              });
            } else {
              this.isLoading = false;
              this.changeDetectorRef.detectChanges();
              this.notifyService.showError(error, "Error");
            }
          }
        );
    } else if (this.addSurveyDialogForm.valid && !surveyraisedByWattmonk) {
      if (this.data.isEditMode) {
        {
          const postData = {
            name: this.addSurveyDialogForm.value.name,
            email: this.addSurveyDialogForm.value.email,
            phonenumber: this.addSurveyDialogForm.value.phone,
            address: address,
            datetime: dateTime,
            jobtype: this.addSurveyDialogForm.value.jobtype,
            comments: this.addSurveyDialogForm.value.comments,
            creatorparentid: this.loggedInUser.parent.id,
            city: this.city,
            state: this.state,
            country: this.country,
            postalcode: parseInt(this.postalcode),
            projecttype: this.projecttype.value,
          };

          this.surveyService
            .editSurvey(this.data.survey.id, postData)
            .subscribe(
              (response) => {
                this.data.survey = response;
                this.isLoading = false;
                this.notifyService.showSuccess(
                  "Survey request has been Updated successfully .",
                  "Success"
                );
                this.data.isDataUpdated = true;
                this.dialogRef.close(this.data);
              },
              (error) => {
                this.isLoading = false;
                this.notifyService.showError(error, "Error");
              }
            );
        }
      } else {
        const isoutsourced = "false";
        let status;
        let assignedto;
        if (this.loggedInUser.role.id == ROLES.Surveyor) {
          status = "assigned";
          assignedto = this.loggedInUser.id;
        } else {
          status = "created";
          assignedto = null;
        }
        let prelimid;
        let isdesigndelivered;
        if (this.data.isprelimrequest) {
          prelimid = this.data.design.id;
          isdesigndelivered = true;
        } else {
          prelimid = null;
          isdesigndelivered = false;
        }
        let raiserequestreason;
        if (this.data.isWattmonkUser) {
          raiserequestreason =
            this.addSurveyDialogForm.get("raiserequestreason").value;
        } else {
          raiserequestreason = "";
        }
        let designCreatedBy;
        let designCreatedByUserParent;
        if (this.data.isWattmonkUser && this.data.design != undefined) {
          designCreatedBy = this.data.design.createdby.id;
          designCreatedByUserParent = this.data.design.creatorparentid;
        } else {
          designCreatedBy = "";
          designCreatedByUserParent = "";
        }
        this.surveyService
          .addSurvey(
            this.addSurveyDialogForm.get("name").value,
            this.addSurveyDialogForm.get("email").value,
            this.addSurveyDialogForm.get("phone").value,
            address,
            dateTime,
            this.addSurveyDialogForm.get("jobtype").value,
            this.addSurveyDialogForm.get("comments").value,
            this.latitude,
            this.longitude,
            this.city,
            this.state,
            this.country,
            parseInt(this.postalcode),
            status,
            isoutsourced,
            assignedto,
            prelimid,
            isdesigndelivered,
            this.addSurveyDialogForm.get("projecttype").value,
            this.sameemailconfirmed,
            this.customerid,
            designCreatedBy,
            designCreatedByUserParent,
            raiserequestreason
          )
          .subscribe(
            (response) => {
              this.isLoading = true;
              this.data.survey = response;
              this.createNewSurveyChatGroup(response);
            },
            (error) => {
              if (error.status == "Already Exist") {
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

                snackbarRef.onAction().subscribe(() => {
                  this.sameemailconfirmed = true;
                  this.onAddSurvey();
                });
              } else {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
                this.notifyService.showError(error, "Error");
              }
            }
          );
      }
    } else {
      this.isLoading = false;
      this.addSurveyDialogForm.markAllAsTouched();
    }
  }

  createNewSurveyChatGroup(survey: Survey): void {
    // const currenttime = new Date().getTime();
    const GUID = survey.chatid;
    var groupName = survey.name;

    const address = survey.address.substring(0, 90);
    var groupName = survey.name + "_" + address;

    const groupType = CometChat.GROUP_TYPE.PASSWORD;
    const password = survey.groupchatpassword

    const group = new CometChat.Group(GUID, groupName, groupType, password);

    CometChat.createGroup(group).then(
      (group) => {
        const membersList = [
          new CometChat.GroupMember(
            "" + survey?.createdby?.cometchatuid,
            CometChat.GROUP_MEMBER_SCOPE.ADMIN
          ),
        ];
        if (survey.createdby.role.id == ROLES.Surveyor) {
          membersList.push(
            new CometChat.GroupMember(
              "" + this.loggedInUser.parent.cometchatuid,
              CometChat.GROUP_MEMBER_SCOPE.ADMIN
            )
          );
          membersList.push(
            new CometChat.GroupMember(
              "" + this.loggedInUser.parent.cometchatuid,
              CometChat.GROUP_MEMBER_SCOPE.ADMIN
            )
          );
        }
        CometChat.addMembersToGroup(group.getGuid(), membersList, []).then(
          () => {
            const chatgroupusers = [];
            chatgroupusers.push(survey.createdby.cometchatuid);
            chatgroupusers.push(this.loggedInUser.parent.cometchatuid);
            const inputData = {
              title: groupName,
              guid: GUID,
              parentid: survey.createdby.parent.id,
              chatgroupusers: chatgroupusers,
            };
            this.commonService.addChatGroup(inputData).subscribe(() => {
              // do nothing.
            });
            this.isLoading = false;
            this.notifyService.showSuccess(
              "Survey request has been successfully initiated.",
              "Success"
            );
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          },
          () => {
            this.isLoading = false;
            this.data.isDataUpdated = true;
            this.dialogRef.close(this.data);
          }
        );
      },
      () => {
        this.isLoading = false;
      }
    );
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
        "survey/" + recordid,
        fileobj,
        "raiserequestattachment",
        "survey"
      )
      .subscribe(
        () => {
          if (index < this.raiserequestattachmentfiles.length - 1) {
            const newindex = index + 1;
            this.uploadraiseRequestAttachmentFile(
              recordid,
              this.raiserequestattachmentfiles[newindex],
              newindex
            );
          } else {
            this.createNewSurveyChatGroup(this.data.survey);
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
}
