import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { FIREBASE_DB_CONSTANTS } from "src/app/_helpers";
import { LoaderService, NotificationService } from "src/app/_services";
import { QualitylistService } from "src/app/_services/qualitylist.service";
import { AddrowlistComponent } from "../addrowlist/addrowlist.component";

export interface DesignFormData {
  clientList: any[];
  ChecklistCompany: [];
  isEditMode: boolean;
  isDataUpdated: boolean;
}

@Component({
  selector: "app-addqualitychecklist",
  templateUrl: "./addqualitychecklist.component.html",
  styleUrls: ["./addqualitychecklist.component.scss"],
})
export class AddqualitychecklistComponent implements OnInit {
  clientList: any = [];
  searchClientList = [];
  clientName = null;
  clientId = Number;
  criteriadata: string;
  selectedUserName = null;
  searchdata: string;
  isLoading = false;
  loadingmessage = "Save data.";
  regitemRef;
  inputCriteriafield = [
    { name: "Criteria 1", value: "" },
    { name: "Criteria 2", value: "" },
    { name: "Criteria 3", value: "" },
  ];
  error = [];
  links = [{ name: "Permit Checklist", value: "permit", disabled: false },
  { name: "Prelim Checklist", value: "prelim", disabled: false },
  { name: "Guideline Form", value: "guidelines", disabled: false }];
  activeLink = this.links[0].value;
  isprelimChecklist: boolean = false;
  isPermitCheckList: boolean = false;
  isGuidelines: boolean = false;
  prelimChecklist = [];
  permitChecklist = [];
  guildelines = [];
  scrolling: boolean = false;
  limit = 15;
  skip = 0;
  client: any;
  checklistcreatedTitle: boolean = false;
  selectedToggleButtonVal: any;
  ClientListlength;
  constructor(
    public dialogRef: MatDialogRef<AddqualitychecklistComponent>,
    public adddialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    // private bottomsheet: MatBottomSheet,
    private checklistservice: QualitylistService,
    private notifyService: NotificationService,
    private snackBar: MatSnackBar,
    private db: AngularFireDatabase,
    @Inject(MAT_DIALOG_DATA) public data: DesignFormData,
    private loaderservice: LoaderService
  ) {
  }

  ngOnInit(): void {
    this.skip = 0;
    this.clientList = this.data.clientList;
    this.ClientNameUpdate(this.clientList[0]);
    this.changeDetectorRef.detectChanges();
  }
  onCloseClick(): void {
    this.data.isDataUpdated = false;
    this.snackBar.dismiss();
    this.dialogRef.close(this.data);
  }

  addInputField(val): void {
    for (let i = 0; i < val; i++) {
      this.inputCriteriafield.push({
        name: "Criteria " + (this.inputCriteriafield.length + 1),
        value: "",
      });
      this.error.push(false);
    }
    this.changeDetectorRef.detectChanges();
  }

  removeInputField(val): void {
    const snackbarRef = this.snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message: "Are you sure you want to remove this criteria",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      if (this.inputCriteriafield.length > 1) {
        this.notifyService.showSuccess(
          "Criteria " + (val + 1) + " removed",
          "Success"
        );
        this.inputCriteriafield.map((item, index) => {
          if (index == val) {
            this.inputCriteriafield.splice(val, 1);
            this.error.splice(val, 1);
            if (index + 1 <= this.inputCriteriafield.length) {
              this.inputCriteriafield[index].name = "Criteria " + (index + 1);
            }
          } else if (index >= val) {
            item.name = "Criteria " + (index + 1);
          }
          else if (index >= val) {
            item.name = "Criteria " + (index + 1);
          }
        })
        this.loaderservice.hide();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  changeInputFieldValue(value: string, ind) {

    if (value.trim().length) {
      this.inputCriteriafield.map((item, index) => {
        if (index == ind) {
          item.value = value;
        }
      });
      this.error[ind] = false;
    } else {
      this.error[ind] = true;
    }
  }

  openAddInputField(): void {
    const addInput = this.adddialog.open(AddrowlistComponent, {
      width: "30%",
      autoFocus: false,
      data: { data: 0, isDataUpdated: false },
    });
    addInput.afterClosed().subscribe((result) => {
      if (result.isDataUpdated) {
        this.addInputField(result.data);
      }
    });
  }
  onClientListScroll() {
    //this.isLoading = false;
    this.scrolling = true;
    this.skip += 15;
    if (this.ClientListlength == this.limit || this.data.clientList.length == this.limit) {
      this.getClientList();
    }
    else {
      this.scrolling = false;
    }
  }
  getClientList() {

    this.scrolling ? this.loaderservice.hide() : this.loaderservice.show();
    this.checklistservice.getClientlist(this.limit, this.skip).subscribe(
      response => {
        this.loaderservice.hide();
        this.scrolling = false;
        this.clientList = [...this.clientList, ...response];
        this.ClientListlength = response.length;
      },
      (error) => {
        this.notifyService.showInfo(error, "Error");
        this.scrolling = false;
      }
    );
  }
  ClientNameUpdate(val, link?) {
    val.checklist.length == 3 ? this.checklistcreatedTitle = true : this.checklistcreatedTitle = false;
    link != undefined ? this.activeLink = link : this.activeLink = 'permit';
    let type = [];
    val.checklist.forEach(element => {

      if (Object.keys(element).find(key => key === 'type')) {
        type.push(element['type']);
      }
    });
    if (type.includes(this.activeLink) && this.activeLink == 'guidelines') {
      this.notifyService.showError("Guidelines of this company already created please edit from there.", "Error");
    }
    if (type.includes(this.activeLink) && this.activeLink == 'prelim') {
      this.notifyService.showError("Prelim Checklist of this company already created please edit from there.", "Error");
    }
    if (type.includes(this.activeLink) && this.activeLink == 'permit') {
      this.notifyService.showError("Permit Checklist of this company already created please edit from there.", "Error");
    }

    this.client = val;
    if (val.company) {
      this.clientName = val.company;
      this.selectedToggleButtonVal = val.company;
    }
    else {
      this.clientName = val.firstname + " " + val.lastname;
      this.selectedToggleButtonVal = val.firstname + " " + val.lastname;
    }

    this.clientId = val.id
    this.prelimChecklist = [];
    this.permitChecklist = [];
    this.guildelines = [];
    this.isGuidelines = false;
    this.isPermitCheckList = false;
    this.isGuidelines = false;

    if (val.checklist.length > 0 && val.checklist != undefined) {
      val.checklist.forEach(checklist => {

        checklist.checklistcriteria.forEach(element => {
          if (checklist.type == 'permit' && this.activeLink == 'permit') {
            this.permitChecklist.push(element.criteria);
            this.isPermitCheckList = true;
            this.isprelimChecklist = false;
            this.isGuidelines = false;
          }
          if (checklist.type == 'prelim' && this.activeLink == 'prelim') {
            this.prelimChecklist.push(element.criteria);
            this.isPermitCheckList = false;
            this.isprelimChecklist = true;
            this.isGuidelines = false;
          }
          if (checklist.type == 'guidelines' && this.activeLink == 'guidelines') {
            this.guildelines.push(element.criteria);
            this.isPermitCheckList = false;
            this.isprelimChecklist = false;
            this.isGuidelines = true;
          }
        });
      });
      if (!this.isprelimChecklist || this.isPermitCheckList || this.isGuidelines) {
        this.inputCriteriafield = [{ name: "Criteria 1", value: "" }, { name: "Criteria 2", value: "" }, { name: "Criteria 3", value: "" }]
      }
    }
    else {
      this.isPermitCheckList = false;
      this.isprelimChecklist = false;
      this.isGuidelines = false;
      this.clientId = val.id;
      this.inputCriteriafield = [{ name: "Criteria 1", value: "" }, { name: "Criteria 2", value: "" }, { name: "Criteria 3", value: "" }]
    }
    /*if(val.checklist.criteriascount){
     // this.clientName = null;
      //this.clientId = null;
      //this.notifyService.showError("Checklist of this company already created please edit from there.", "Error");
      console.log("element:",val.checklist.type);
     /* this.activeLink=='permit'?this.isPermitCheckList = true:this.isPermitCheckList = false;
      val.checklist.checklistcriteria.forEach(element => {
        this.prelimChecklist.push({name:element.criteria});
        console.log("element:",element);
       // this.activeLink = 
      });
      console.log("this.showpermitDetails",this.isPermitCheckList);
      console.log("prlimChecklistData",this.prelimChecklist);
      
    }
    else if(!val.checklist.criteriascount || val.checklist.criteriascount == null){
      // this.clientName = val.clientname
      this.isPermitCheckList = false;
      this.clientId = val.id ;
      this.inputCriteriafield = [ {name:"Criteria 1", value:""}, {name:"Criteria 2", value:""},{name:"Criteria 3", value:""}]
    }*/
  }

  addClientListDetail(): void {
    let criteriaList = [];
    this.inputCriteriafield.map((item, index) => {
      if (item.value.length > 0) {
        criteriaList.push({ criteria: item.value, sequence: index });
      } else {
        criteriaList = [];
      }
    })

    this.loadingmessage = "Save data.";
    let criteriaError = this.error.every(item => item == false)
    if (criteriaList.length > 0 && criteriaError) {
      this.isLoading = true;
      this.checklistservice.addQualityCheckList(criteriaList, this.clientId, this.activeLink).subscribe(
        response => {
          this.isLoading = false;
          this.regitemRef = this.db.object(FIREBASE_DB_CONSTANTS.KEYWORD + response[0].qualitychecklist.clientid);
          // regitemRef.set({ checklistupdated :false});
          this.regitemRef.update({ checklistupdated: true })
          setTimeout(() => {
            this.regitemRef.update({ checklistupdated: false })
          }, 2000)
          //this.notifyService.showSuccess("Client List has been activated successfully", "Success")
          if (this.activeLink == 'permit' || this.activeLink == 'prelim') {
            this.notifyService.showSuccess(this.activeLink + " checklist created successfully", "Success")
          }
          if (this.activeLink == 'guidelines') {
            this.notifyService.showSuccess(this.activeLink + " created successfully", "Success")
          }
          this.data.isDataUpdated = true;
          this.data['activeLink'] = this.activeLink;
          this.dialogRef.close(this.data)
          // this.isLoading=false;
        },
        (error) => {
          this.notifyService.showInfo(error, "Error");
        }
      )
    }
    else {
      this.notifyService.showError("Please check the fields ", "Error");
    }
  }
  searchComapny() {
    this.loaderservice.show();
    this.clientList = [];
    this.checklistservice.searchCompany(this.searchdata).subscribe(
      response => {
        this.clientList = response;
        this.ClientNameUpdate(this.clientList[0]);
      },
      (error) => {
        this.notifyService.showInfo(error, "Error");
      }
    );
  }
  clearinputfields() {
    this.clientList = [];
    this.searchdata = '';
    this.limit = 15;
    this.skip = 0;
    this.getClientList();
  }
  public onValChange(val: string) {
    this.selectedToggleButtonVal = val;

  }
}
