import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationsnackbarComponent } from 'src/app/shared/confirmationsnackbar/confirmationsnackbar.component';
import { EVENTS_PERMIT_DESIGN, ROLES } from 'src/app/_helpers';
import { Design, User } from 'src/app/_models';
import { AuthenticationService, DesignService, GenericService, NotificationService } from 'src/app/_services';
import { CommonService } from 'src/app/_services/common.service';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';
@Component({
  selector: 'app-pdfqualitycheck',
  templateUrl: './pdfqualitycheck.component.html',
  styleUrls: ['./pdfqualitycheck.component.scss']
})
export class PdfqualitycheckComponent implements OnInit {

  loggedInUser: User;
  isClient = false;
  isUserDesigner = false;
  isUserAnalyst = false;
  isUserPeEngineer = false;
  isWattmonkadmins = false;

  @Input() generateddesign: Design;
  designerCritera: any = [];
  displayerror = false;

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

  filetype: any;
  isselfupdatepermit = false;
  isPermitDesignSelected = false;
  extension: string;
  permitfiles: File[] = [];
  reviewissues = new FormControl("", [
    Validators.required
  ]);
  reviewissuesinvalid = false
  reviewenddatetime: number;
  reviewstartdatetime: number;
  constructor(private _snackBar: MatSnackBar,
    public dialogRef: MatDialog,
    private commonService: CommonService,
    private authService: AuthenticationService,
    public genericService: GenericService,
    private changeDetectorRef: ChangeDetectorRef,
    private designService: DesignService,
    private notifyService: NotificationService,
    private eventEmitterService: EventEmitterService) {
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

  ngOnInit(): void {
  }

  ngAfterviewInit() {
    this.designerCritera = this.generateddesign.checklistcriteria;
    if (this.generateddesign.checklistcriteria) {
      this.designerCritera.map(item => {
        if (item && item.feedback == null) {
          item.feedback = false
        }
      })

    }
    this.changeDetectorRef.detectChanges();
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


  onSelect(event) {


    var filename = event.addedFiles[0].type;
    this.extension = filename.split('/').pop();

    this.isPermitDesignSelected = true;
    this.permitfiles.push(...event.addedFiles);
    var parts = this.permitfiles[0].name.split('.');
    this.filetype = parts[parts.length - 1]
  }
  onRemove() {
    this.permitfiles.splice(0, 1);
    this.isPermitDesignSelected = false;
  }

  reportDesignReviewSuccess() {
    //this.isLoad = true;
    //this.loaderService.show();
    //this.isLoading = true;
    // this.countdownservice.stopTimer();
    let cdate = Date.now();
    this.reviewenddatetime = cdate;
    const postData = {
      status: "reviewpassed",
      reviewissues: this.reviewissues.value,
      reviewstarttime: this.reviewstartdatetime,
      reviewendtime: this.reviewenddatetime
    };

    this.designService
      .editDesign(
        this.generateddesign.id,
        postData
      )
      .subscribe(
        response => {
          this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
          this.dialogRef.closeAll();
        },
        error => {
          this.notifyService.showError(
            error,
            "Error"
          );
          this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
          //this.isLoading = false;
        }
      );
  }
  reportDesignReviewFailure() {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.QualityCheck);
    var fillcriteria = 0;
    if (this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.SuperAdmin || this.loggedInUser.role.id == ROLES.Admin || (this.loggedInUser.role.id === ROLES.TeamHead && this.loggedInUser.parent.id == 232)) {
      this.designerCritera.map(item => {
        if ((item.analystcomment && !item.feedback) || (item.feedback && !item.analystcomment)) {
          fillcriteria += 1;
        }
        else {
          fillcriteria -= 1;
        }
      })
      fillcriteria == this.designerCritera.length ? this.checklistChecked = true : this.checklistChecked = false;
      if (this.checklistChecked) {
        this.displayerror = false
        if (this.reviewissues.value.length > 0) {
          // this.isLoading = true;
          //  this.loaderService.show();
          // this.countdownservice.stopTimer();
          let cdate = Date.now();
          this.reviewenddatetime = cdate;
          const postData = {
            status: "reviewfailed",
            reviewissues: this.reviewissues.value,
            reviewstarttime: this.reviewstartdatetime,
            reviewendtime: this.reviewenddatetime
          };

          this.designService
            .editDesign(
              this.generateddesign.id,
              postData
            )
            .subscribe(
              response => {
                this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
                this.dialogRef.closeAll();

              },
              error => {
                this.notifyService.showError(
                  error,
                  "Error"
                );
                this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
                // this.isLoading = false;
              }
            );
        } else {
          this.reviewissuesinvalid = true;
          this.changeDetectorRef.detectChanges()
        }
      } else {
        this.displayerror = true
        // this.notifyService.showError("Please check all the fields or enter the comments", "Error")
      }
    }
  }
  updateDesignReviewSuccess() {
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.ShowLoading);
    this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.QualityCheck);
    var fillcriteria = 0;
    if (this.loggedInUser.role.id == ROLES.Analyst || this.loggedInUser.role.id == ROLES.SuperAdmin || this.loggedInUser.role.id == ROLES.Admin || (this.loggedInUser.role.id === ROLES.TeamHead && this.loggedInUser.parent.id == 232)) {
      this.designerCritera.map(item => {

        if (item.analystcomment !== null || item.feedback) {
          fillcriteria += 1;
        }
        else {
          fillcriteria -= 1;
        }
      })
      fillcriteria == this.designerCritera.length ? this.checklistChecked = true : this.checklistChecked = false;


      if (this.checklistChecked) {
        this.displayerror = false;
        if (this.isselfupdatepermit && this.permitfiles.length > 0) {

          // this.uploadPermitDesign();
          this.displayerror = false;
          // this.isLoading = true;
          // this.loadingmessage = "Uploading design file";
          this.commonService
            .uploadFile(
              this.generateddesign.id,
              "designs/" + this.generateddesign.id + "/permit",
              this.permitfiles[0],
              "permitdesign",
              "design"
            )
            .subscribe(
              response => {
                // if (this.isselfupdatepermit) {
                this.reportDesignReviewSuccess();
                // } else {
                //   if (this.data.permit.status == 'reviewfailed') {
                //     this.reassignDesignForQC();
                //   } else {
                //     this.updateDesignCompletion();
                //   }
                // }
              },
              error => {
                this.notifyService.showError(
                  error,
                  "Error"
                );
                this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
                //this.isLoading = false;

              }
            );
        } else if (this.isselfupdatepermit && this.permitfiles.length == 0) {
          this.displayerror = true;
          this.eventEmitterService.onPermitDesignGenerationStateChange(EVENTS_PERMIT_DESIGN.HideLoading);
        } else {
          this.reportDesignReviewSuccess();
        }
      } else {
        this.displayerror = true
        this.notifyService.showError("Please check all the fields or enter the comments", "Error")
      }
    }
  }
  selfUpdateCancelClick() {
    this.isselfupdatepermit = false;
    this.permitfiles.splice(0, this.permitfiles.length);
  }
}
