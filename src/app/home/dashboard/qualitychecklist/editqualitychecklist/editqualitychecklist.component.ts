import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationsnackbarComponent } from 'src/app/shared/confirmationsnackbar/confirmationsnackbar.component';
import { FIREBASE_DB_CONSTANTS } from 'src/app/_helpers';
import { QualityList } from 'src/app/_models/qualitylist';
import { NotificationService } from 'src/app/_services';
import { QualitylistService } from 'src/app/_services/qualitylist.service';

export interface DesignFormData {
  user: QualityList;
  isEditMode: boolean;
  isDataUpdated: boolean;
  type: string;
}

@Component({
  selector: "app-editqualitychecklist",
  templateUrl: "./editqualitychecklist.component.html",
  styleUrls: ["./editqualitychecklist.component.scss"],
})
export class EditqualitychecklistComponent implements OnInit {
  selectedUserId = null;
  criteriaIsEdit = false;
  userCriteriaList = [];
  error = [];
  addcriteriafield = false;
  creiteriaUpdateValue: string;
  searchData: string = null;
  newFieldhaserror = false;
  regitemRef;
  showError = "You must enter a value";
  isError: boolean = false;
  isEditError: boolean = false;
  lastcriteriavalue: string;
  isLoading = false;
  loadingmessage = "Save data.";

  links = [{ name: "Permit Checklist", value: "permit", disabled: true },
  { name: "Prelim Checklist", value: "prelim", disabled: true },
  { name: "Guideline Form", value: "guidelines", disabled: true }];
  activeLink = this.links[0].value;
  heading = 'Edit Checklist';
  buttonName = 'Add Checklist';
  constructor(
    public dialogRef: MatDialogRef<EditqualitychecklistComponent>,
    public editList: QualitylistService,
    private changeDetectorRef: ChangeDetectorRef,
    private qualitychecklist: QualitylistService,
    private snackBar: MatSnackBar,
    private db: AngularFireDatabase,
    private notifyService: NotificationService,
    // private qualityService: QualitylistService,
    @Inject(MAT_DIALOG_DATA) public data: DesignFormData
  ) { }

  ngOnInit(): void {
    // console.log(this.data.user)
    (this.data.type != undefined && this.data.type == 'guidelines') ? this.heading = 'Edit Guidelines' : this.heading = 'Edit Checklist';
    (this.data.type != undefined && this.data.type == 'guidelines') ? this.buttonName = 'Add Guideline' : this.buttonName = 'Add Checklist';
    this.links.forEach(element => {
      if (element.value == this.data.type) {
        element.disabled = false;
        this.activeLink = element.value;
      }
    });
    this.getallcriteria();
  }

  onCloseClick(): void {
    this.snackBar.dismiss();
    this.dialogRef.close(this.data);
  }

  getallcriteria(): void {
    this.editList
      .getQualityCheckList(this.data.user.id)
      .subscribe((response) => {
        this.userCriteriaList = response;



        response.map(item => {
          this.error.push(false);
        });
        this.changeDetectorRef.detectChanges();
      },
        (error) => {
          this.notifyService.showInfo(error, "Error");
        });
  }

  criteriadrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(
      this.userCriteriaList,
      event.previousIndex,
      event.currentIndex
    );
  }

  updatecriteria(criteriaId, index): void {
    if (!this.error[index] && this.creiteriaUpdateValue.trim().length) {
      this.isEditError = false;
      let criteria = { criteria: this.creiteriaUpdateValue };
      this.qualitychecklist
        .editUserCriteria(criteriaId, criteria)
        .subscribe(() => {
          /* this.regitemRef = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + response.qualitychecklist.clientid);
          // this.regitemRef.set({ checklistupdated :true});
          this.regitemRef.update({checklistupdated :true})
          setTimeout(()=>{
            this.regitemRef.update({checklistupdated :false})
          },2000) */
          this.criteriaIsEdit = false;
          this.data.isDataUpdated = true;
          this.userCriteriaList[index].criteria = this.creiteriaUpdateValue;
          this.notifyService.showSuccess(
            "Criteria has been updated successfully",
            "Success"
          );
        },
          (error) => {
            this.notifyService.showInfo(error, "Error");
          }
        );
    } else {
      this.isEditError = true;
      this.creiteriaUpdateValue = null;
    }
  }

  deletecriteria(criteriaId): void {
    const snackbarRef = this.snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message: "Are you sure you want to delete this criteria?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      if (this.userCriteriaList.length > 1) {
        this.qualitychecklist.deleteUserCriteria(criteriaId.id).subscribe(
          (response) => {
            /*   this.regitemRef = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + response[0].qualitychecklist.clientid);
              // this.regitemRef.set({ checklistupdated :true});
              this.regitemRef.update({checklistupdated :true})
    
              setTimeout(()=>{
                this.regitemRef.update({checklistupdated :false})
              },2000) */
            this.data.isDataUpdated = true;
            this.userCriteriaList = response;
            //this.notifyService.showSuccess("Criteria "+(criteriaId.criteria)+" has been deleted successfully","success")

            this.notifyService.showSuccess(
              criteriaId.criteria + " has been deleted successfully",
              "success"
            );
          },
          (error) => {
            this.notifyService.showInfo(error, "Error");
          }
        );
      } else {
        this.notifyService.showError(
          criteriaId.criteria + " can not be deleted",
          "Error"
        );
      }
    });
  }

  showInputField(data: any): void {
    this.selectedUserId = data.id;
    this.criteriaIsEdit = true;
    this.lastcriteriavalue = data.criteria;
    this.creiteriaUpdateValue = data.criteria;
  }

  editFieldValue(value: string, type, index): void {
    let regularExpression = /^\s*\s*$/;
    if (!regularExpression.test(value)) {
      if (type == "edit") {
        this.isEditError = false;
        this.creiteriaUpdateValue = value;
        this.error[index] = false;
      } else if (type == "add") {
        this.isError = false;
        this.newFieldhaserror = false;
        this.searchData = value;
      }
    } else {
      if (type == "edit") {
        this.error[index] = true;
      } else if (type == "add") {
        this.newFieldhaserror = true;
      }
    }
  }

  onSaveNewCriteria() {
    var checklist = { "criteria": this.searchData, "qualitychecklist": this.data.user.id, "sequence": this.userCriteriaList.length };
    if (this.searchData == null) {
      this.isError = true;
    }
    else {
      if (!this.newFieldhaserror && this.searchData.trim().length) {
        this.isError = false;
        if (this.activeLink == 'guidelines') {
          this.qualitychecklist.AddUserGuidelines(checklist).subscribe(
            response => {
              // console.log(response)
              /*  this.regitemRef = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + response[0].qualitychecklist.clientid);
               // this.regitemRef.set({ checklistupdated :true});
               this.regitemRef.update({checklistupdated :true})
               setTimeout(()=>{
                 this.regitemRef.update({checklistupdated :false})
               },2000) */
              this.data.isDataUpdated = true;
              this.addcriteriafield = false;
              this.userCriteriaList = response;
              this.newFieldhaserror = false;
              this.notifyService.showSuccess("New Guideline criteria added successfully", "Success");
            }, (error) => {
              this.notifyService.showInfo(error, "Error");
            }
          )
        }
        else {
          this.qualitychecklist.AddUserCriteria(checklist).subscribe(
            response => {
              // console.log(response)
              /*  this.regitemRef = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + response[0].qualitychecklist.clientid);
               // this.regitemRef.set({ checklistupdated :true});
               this.regitemRef.update({checklistupdated :true})
               setTimeout(()=>{
                 this.regitemRef.update({checklistupdated :false})
               },2000) */
              this.data.isDataUpdated = true;
              this.addcriteriafield = false;
              this.userCriteriaList = response;
              this.newFieldhaserror = false;
              this.notifyService.showSuccess("New criteria added successfully", "Success");
            }, (error) => {
              this.notifyService.showInfo(error, "Error");
            }
          )
        }
      }
      else {
        this.isError = true;
        this.searchData = null;
        this.changeDetectorRef.detectChanges();
      }
    }
    this.searchData = null;
  }

  saveAllCriteria(): void {
    this.isLoading = true;
    this.loadingmessage = "Save data.";
    this.userCriteriaList.map((item, index) => {
      item.sequence = index;
    })
    if (this.activeLink == 'guidelines') {
      this.qualitychecklist.UpdateGuidelines(this.userCriteriaList, this.data.user.id).subscribe(
        response => {
          this.isLoading = false;
          this.regitemRef = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + response[0].qualitychecklist.clientid);
          this.regitemRef.update({ guidelinesseenby: [''] })
          this.regitemRef.update({ guidelinesupdated: true })
          setTimeout(() => {
            this.regitemRef.update({ guidelinesupdated: false })
          }, 2000)
          this.data.isDataUpdated = true;
          this.dialogRef.close(this.data);
          this.notifyService.showSuccess("Guideline List has been updated successfully", "success");
        },
        (error) => {
          this.notifyService.showInfo(error, "Error");
        }
      );
    }
    else {
      this.qualitychecklist.UpdateQualityCheckList(this.userCriteriaList, this.data.user.id).subscribe(
        response => {
          this.isLoading = false;
          this.regitemRef = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + response[0].qualitychecklist.clientid);
          /* if(this.activeLink == 'guidelines'){
             console.log(this.activeLink)
             this.regitemRef.update({guidelinesseenby :['']})
             this.regitemRef.update({guidelinesupdated :true})
             setTimeout(()=>{
               this.regitemRef.update({guidelinesupdated :false})
             },2000)
           }else{*/
          this.regitemRef.update({ checklistupdated: true })
          setTimeout(() => {
            this.regitemRef.update({ checklistupdated: false })
          }, 2000)
          // }
          this.data.isDataUpdated = true;
          this.dialogRef.close(this.data);
          this.notifyService.showSuccess(
            "Criteria List has been updated successfully",
            "success"
          );
        },
        (error) => {
          this.notifyService.showInfo(error, "Error");
        }
      );
    }
  }
}
