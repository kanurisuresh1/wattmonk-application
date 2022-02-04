import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import heic2any from "heic2any";
import { ConfirmationsnackbarComponent } from 'src/app/shared/confirmationsnackbar/confirmationsnackbar.component';
import { EVENTS_PERMIT_DESIGN, ROLES } from 'src/app/_helpers';
import { Design, User } from 'src/app/_models';
import { AuthenticationService, DesignService, GenericService, NotificationService } from 'src/app/_services';
import { CommonService } from 'src/app/_services/common.service';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';
// import { MatDialogRef } from '@angular/material/dialog';
// import { DetailedpermitComponent } from '../detailedpermit.component';
const FileSaver = require('file-saver');
const axios = require("axios").default;
@Component({
  selector: 'app-permitplanuploader',
  templateUrl: './permitplanuploader.component.html',
  styleUrls: ['./permitplanuploader.component.scss']
})
export class PermitplanuploaderComponent implements OnInit {

  @Input() generateddesign: Design;
  isPermitDesignSelected = false;
  files: File[] = [];
  designcomments = new FormControl("")
  displayerror = false;
  isLoading = false;
  loadingmessage = "Saving data";
  designstartdatetime: number;
  designenddatetime: number;
  extension: string;
  downloadingpercentage: number = 0;
  ispermitplanalreadyexist = false;
  commentsexist: boolean = false;

  postData = {};
  selectedCriteria;
  isEditChecklist: boolean = false;
  commentId: number;
  qualitycheckindex: number;
  commentindex: number;
  checklistcomments = new FormControl("", [])
  anyalistchecklistcomments = new FormControl("", [])
  isciteriacommentshow = false;
  latestcommenteditdelete: boolean = false;
  checklistChecked: boolean = false;
  designercomment;
  designerCritera: any = [];

  loggedInUser: User;
  isClient = false;
  isUserDesigner = false;
  isUserAnalyst = false;
  isUserPeEngineer = false;
  isWattmonkadmins = false;
  status = "";
  pdfgenerated = false;
  constructor(
    private _snackBar: MatSnackBar,
    private eventEmitterService: EventEmitterService,
    // public dialogRef: MatDialogRef<DetailedpermitComponent>,
    private notifyService: NotificationService,
    public genericService: GenericService,
    private designService: DesignService,
    private commonService: CommonService,
    private authService: AuthenticationService,
    public dialogRef: MatDialog,
    private changeDetectorRef: ChangeDetectorRef) {
    this.loggedInUser = this.authService.currentUserValue.user;
    if (this.loggedInUser.role.id == ROLES.ContractorSuperAdmin || this.loggedInUser.role.id == ROLES.ContractorAdmin || this.loggedInUser.role.id == ROLES.SuccessManager || this.loggedInUser.role.id == ROLES.Master || (this.loggedInUser.role.id == ROLES.TeamHead && this.loggedInUser.parent.id != 232)) {
      this.isUserDesigner = false;
      this.isClient = true;
      this.isUserAnalyst = false;
    }
    else if (this.loggedInUser.role.id == ROLES.SuperAdmin || this.loggedInUser.role.id == ROLES.Admin || (this.loggedInUser.role.id == ROLES.TeamHead && this.loggedInUser.parent.id == 232)) {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = false;
      this.isWattmonkadmins = true;
    } else if (this.loggedInUser.role.id == ROLES.Designer) {
      this.isUserDesigner = true;
      this.isClient = false;
      this.isUserAnalyst = false;
    } else if (this.loggedInUser.role.id == ROLES.Analyst) {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = true;
    }
    else if (this.loggedInUser.role.id == ROLES.Peengineer) {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = false;
      this.isUserPeEngineer = true;
    }
    else {
      this.isUserDesigner = false;
      this.isClient = false;
      this.isUserAnalyst = false;
      this.isWattmonkadmins = false;
    }
  }



  ngOnInit() {
    // this.generateddesign = record;
    this.status = this.generateddesign.status
    if (this.generateddesign.autopermitdesign) {
      this.pdfgenerated = true;
    }
    this.changeDetectorRef.detectChanges();
    if (this.generateddesign.permitdesign != null) {
      this.ispermitplanalreadyexist = true;
      if (this.generateddesign.comments) {
        this.generateddesign.comments.forEach(element => {
          if (element.createdby.role == ROLES.Designer) {
            this.commentsexist = true;
            this.designcomments.patchValue(element.message)
            this.designcomments.disable();

          }
        })
      }

    }
    this.changeDetectorRef.detectChanges();
  }

  onSelect(event) {
    var filename = event.addedFiles[0].type;
    this.extension = filename.split('/').pop();
    var element = event.addedFiles[0]
    console.log("1", element)
    var type = element.name.split(".");
    if (type[1] == 'heic') {
      console.log(element)
      element.isImage = true;
      var reader = new FileReader();
      reader.onload = (event: any) => {
        fetch(event.target.result)
          .then((res) => res.blob())
          .then((blob) => heic2any({ blob: blob, toType: "image/jpeg" }))
          .then((jpgBlob: Blob) => {
            console.log(jpgBlob)
            let replacedfile = new File([jpgBlob], element.name.replace("heic", "jpeg"), { type: "image/jpeg" });
            console.log(replacedfile)
            this.isPermitDesignSelected = true;
            this.files.push(replacedfile);
            console.log(this.files)
            setTimeout(() => {
              this.changeDetectorRef.detectChanges()
            }, 300)
            this.changeDetectorRef.detectChanges()

          })
          .catch((e) => {
            // see error handling section
            console.log(e)
          });
      }
      reader.readAsDataURL(element)
    }
    else {
      this.isPermitDesignSelected = true;
      this.files.push(...event.addedFiles);
      console.log(this.files)
    }
    setTimeout(() => {
      this.changeDetectorRef.detectChanges()
    }, 300)
  }

  onRemove() {
    this.files.splice(0, 1);
    this.isPermitDesignSelected = false;
  }

  uploadPermitDesign() {
    var fillcriteria = 0;
    if (this.loggedInUser.role.name == "Designer") {
      this.designerCritera.map(item => {
        if ((item.commented && !item.feedback) || (item.feedback && !item.commented)) {
          fillcriteria += 1;
        }
        else {
          fillcriteria -= 1;
        }
      })
      fillcriteria == this.designerCritera.length ? this.checklistChecked = true : this.checklistChecked = false;
      if (this.checklistChecked) {
        if (this.files.length > 0) {
          this.displayerror = false;
          this.isLoading = true;
          this.loadingmessage = "Uploading design file";
          this.commonService
            .uploadFile(
              this.generateddesign.id,
              "designs/" + this.generateddesign.id + "/permit",
              this.files[0],
              "permitdesign",
              "design"
            )
            .subscribe(
              response => {
                this.updateDesignCompletion();
              },
              error => {
                this.notifyService.showError(
                  error,
                  "Error"
                );
              }
            );
        } else {
          this.notifyService.showError("Please check all the fields", "Error")
          this.displayerror = true;
        }
      } else {
        this.notifyService.showError("Please check all the fields or enter the comments", "Error")
      }
    }
  }

  updateDesignCompletion() {
    let cdate = Date.now();
    this.designenddatetime = cdate;
    const postData = {
      status: "designcompleted",
      designstarttime: this.designstartdatetime,
      designendtime: this.designenddatetime,
      comments: this.designcomments.value
    };

    this.designService
      .editDesign(
        this.generateddesign.id,
        postData
      )
      .subscribe(
        response => {
          this.isLoading = false;
          this.notifyService.showSuccess("Design has been uploaded successfully.", "Success");
          this.dialogRef.closeAll();
        },
        error => {
          this.isLoading = false
          this.notifyService.showError(
            error,
            "Error"
          );
        }
      );





  }
  downloadPermitPdf() {

    var fileurl = this.generateddesign.autopermitdesign.url;
    var filename = this.generateddesign.autopermitdesign.name;
    this.isLoading = true;
    this.loadingmessage = "Downloading Generated file " + this.downloadingpercentage + " %";
    axios({
      onDownloadProgress: (progressEvent) => {
        let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(progressEvent.lengthComputable)
        console.log(percentCompleted);
        this.downloadingpercentage = percentCompleted;
        this.loadingmessage = "Downloading Generated file " + percentCompleted + " %";
        this.changeDetectorRef.detectChanges();
      },
      url: fileurl,
      //url: fileurl,
      method: "GET",
      responseType: "blob",
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      this.isLoading = false;
    });
    this.isLoading = false;
    // const url = value.data;
    // return FileSaver.saveAs(url);
  }


  ShowCommentCriteria(item) {
    this.anyalistchecklistcomments.setValue("");
    this.checklistcomments.setValue("");
    this.selectedCriteria = item;
    this.isciteriacommentshow = true;
    // if (this.loggedInUser.role.name == "Analyst") {
    //   this.anyalistchecklistcomments.patchValue(item.analystcomment);
    // }

    // if (this.loggedInUser.role.name == "Designer") {
    //   this.checklistcomments.patchValue(item.designercomment)
    // }
  }

  onSaveCritetria(item, i) {
    this.selectedCriteria = item;
    this.selectedCriteria.completedby = this.loggedInUser.role.type;
    // let designercomment;
    //  console.log(this.selectedCriteria)
    //  console.log(this.designerCritera);
    this.designerCritera.forEach(ele => {
      if (ele.id == this.selectedCriteria.id) {
        // console.log(ele)
        this.designercomment = ele.comments;
        //console.log(designercomment)
      }
    })
    if (this.loggedInUser.role.id == ROLES.Designer) {
      if (this.selectedCriteria.feedback) {
        this.selectedCriteria.designercomment = "";
        this.isciteriacommentshow = false;
        this.updateCriteria(i);
      }
      else if (!this.selectedCriteria.feedback && this.checklistcomments.value.trim().length > 0) {
        this.selectedCriteria.designercomment = this.checklistcomments.value
        this.updateCriteria(i)
        this.isciteriacommentshow = false
      }

      else {
        // console.log("uncheck")
        if (!this.selectedCriteria.feedback && this.designercomment.length) {
          this.updateCriteria(i);
        }
        // this.notifyService.showError("Please check the criteria or give a comment", "Error")
      }
    }
    if (this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.SuperAdmin || this.loggedInUser.role.id == ROLES.Admin || this.loggedInUser.role.id == ROLES.TeamHead) {
      if (this.selectedCriteria.feedback) {
        this.selectedCriteria.analystcomment = "";
        this.isciteriacommentshow = false;
        this.updateCriteria(i)
      }
      else if (!this.selectedCriteria.feedback && this.anyalistchecklistcomments.value.trim().length > 0) {
        this.selectedCriteria.analystcomment = this.anyalistchecklistcomments.value
        this.updateCriteria(i)
        this.isciteriacommentshow = false
      }
      else {

        // this.notifyService.showError("Please check the criteria or give a comment", "Error");
      }
    }



    this.checklistcomments.patchValue(" ");
    this.anyalistchecklistcomments.patchValue("");
  }
  updateCriteria(index?) {
    if (this.loggedInUser.role.id == ROLES.Designer) {
      //  let commented;

      if (this.selectedCriteria.designercomment || (!this.selectedCriteria.feedback && this.designercomment.length)) {
        // commented=true;
        this.postData = {
          comment: this.selectedCriteria.designercomment,
          feedback: this.selectedCriteria.feedback,
          designerid: this.loggedInUser.id,
          completedby: "designer",
          commented: true
        }
      }
      else {
        //  commented=false;
        this.postData = {
          comment: this.selectedCriteria.designercomment,
          feedback: this.selectedCriteria.feedback,
          designerid: this.loggedInUser.id,
          completedby: "designer",
          commented: false
        }
      }


    }
    if (this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.SuperAdmin || this.loggedInUser.role.id == ROLES.Admin || this.loggedInUser.role.id === ROLES.TeamHead) {
      let commented;
      if (this.selectedCriteria.designercomment) {
        commented = true;
      }
      else {
        commented = false;
      }
      this.postData = {
        comment: this.selectedCriteria.analystcomment,
        feedback: this.selectedCriteria.feedback,
        analystid: this.loggedInUser.id,
        completedby: "qcinspector",
        commented: commented
      }
    }

    this.commonService.updateChecklistCriteria(this.selectedCriteria.id, this.postData).subscribe(
      response => {
        // this.designerCritera.comments= [];
        this.latestcommenteditdelete = true;
        // console.log("key",this.latestcommenteditdelete)
        this.designerCritera[index].comments = response.comments;
        this.designerCritera[index].commented = response.commented;
        this.changeDetectorRef.detectChanges();
      }
    )

  }

  onCancelCriteria() {
    this.checklistcomments.patchValue(" ");
    this.anyalistchecklistcomments.patchValue("");
    this.isciteriacommentshow = false;
    this.isEditChecklist = false;
  }

  onEditComments() {
    let postData;
    if (this.loggedInUser.role.id == ROLES.Designer) {
      postData = {
        message: this.checklistcomments.value
      }
    }
    else if (this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.Admin || this.loggedInUser.role.id === ROLES.SuperAdmin || this.loggedInUser.role.id === ROLES.TeamHead) {
      postData = {
        message: this.anyalistchecklistcomments.value
      }
    }
    this.commonService.editComments(this.commentId, postData).subscribe((res) => {
      this.isEditChecklist = false;
      this.isciteriacommentshow = false;
      this.designerCritera[this.qualitycheckindex].comments[this.commentindex] = res;
    })
  }

  editChecklistComment(comment, qualitycheckindex, commentindex, item) {
    this.selectedCriteria = item;
    this.isEditChecklist = true;
    this.commentId = comment.id;
    this.qualitycheckindex = qualitycheckindex;
    this.commentindex = commentindex;
    this.checklistcomments.patchValue(comment.message);
  }

  editChecklistCommentForAnalyst(comment, qualitycheckindex, commentindex, item) {
    this.selectedCriteria = item;
    this.isEditChecklist = true;
    this.commentId = comment.id;
    this.qualitycheckindex = qualitycheckindex;
    this.commentindex = commentindex;
    this.anyalistchecklistcomments.patchValue(comment.message);
  }

  deleteChecklistComment(comment, qualitycheckindex, commentindex) {
    const snackbarRef = this._snackBar.openFromComponent(ConfirmationsnackbarComponent, {
      data: { "message": "Are you sure you want to delete comment ?", "positive": "Yes", "negative": "No" }
    });
    snackbarRef.onAction().subscribe(() => {
      this.commonService.deleteComment(comment.id).subscribe(response => {
        this.designerCritera[qualitycheckindex].comments.splice(commentindex, 1);
      })
    });
  }

  generatePdf() {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.GeneratingPDF);

    this.designService.downloadPermitDesign(this.generateddesign.id).subscribe(response => {
      this.pdfgenerated = true;
      this.generateddesign.autopermitdesign = response.message.autopermitdesign;
      //this.generateddesign.autopermitdesign = response.message
      this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
      this.notifyService.showSuccess("Design Pdf has been generated successfully.", "Success");
      this.changeDetectorRef.detectChanges();
    },
      error => {
        this.notifyService.showError(
          error,
          "Error"
        );
        this.dialogRef.closeAll();
        this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading)
        this.changeDetectorRef.detectChanges();
      })
  }
}
