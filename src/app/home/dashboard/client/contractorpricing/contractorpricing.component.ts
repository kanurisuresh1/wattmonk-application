import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { User } from "src/app/_models";
import { ContractorService } from "src/app/_services";

export interface ContractorDetailData {
  user: User;
  subscription: string;
  triggerEditEvent: boolean;
}

@Component({
  selector: "app-contractorpricing",
  templateUrl: "./contractorpricing.component.html",
  styleUrls: ["./contractorpricing.component.scss"],
})
export class ContractorpricingComponent implements OnInit {
  addPriceDialogForm: FormGroup;

  siteassessment = new FormControl("", Validators.required);
  salesproposal = new FormControl("", Validators.required);
  permitdesign = new FormControl("", Validators.required);

  constructor(
    public dialogRef: MatDialogRef<ContractorpricingComponent>,
    private contractorService: ContractorService,
    @Inject(MAT_DIALOG_DATA) public data: ContractorDetailData
  ) {
    this.addPriceDialogForm = new FormGroup({
      siteassessment: this.siteassessment,
      salesproposal: this.salesproposal,
      permitdesign: this.permitdesign,
    });
    this.addPriceDialogForm.patchValue({
      siteassessment: data.user.prelimdesigndiscount,
      salesproposal: data.user.proposaldesigndiscount,
      permitdesign: data.user.permitdesigndiscount,
    });
  }

  ngOnInit(): void {
    // do nothing.
  }

  onCloseClick(): void {
    this.data.triggerEditEvent = false;
    this.dialogRef.close(this.data);
  }

  onUpdatePrice(): void {
    if (this.addPriceDialogForm.valid) {
      const postData = {
        prelimdesigndiscount:
          this.addPriceDialogForm.get("siteassessment").value,
        proposaldesigndiscount:
          this.addPriceDialogForm.get("salesproposal").value,
        permitdesigndiscount: this.addPriceDialogForm.get("permitdesign").value,
      };
      this.contractorService
        .updateServicePrice(this.data.user.id, postData)
        .subscribe(
          (response) => {
            this.data.user = response;
            this.data.triggerEditEvent = true;
            this.dialogRef.close(this.data);
          },
          () => {
            // do nothing.
          }
        );
    }
  }
}
