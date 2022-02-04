import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { User } from "src/app/_models";
import { ContractorService } from "src/app/_services";

export interface AccountUpdate {
  convertToPrepaid: boolean;
  user: User;
  isDataUpdated: boolean;
  isModified: boolean;
}

@Component({
  selector: "app-account-update",
  templateUrl: "./account-update.component.html",
  styleUrls: ["./account-update.component.scss"],
})
export class AccountUpdateComponent implements OnInit {
  signOut = true;
  isLoading = false;
  loadingMessage = "Logging out";

  constructor(
    public dialogref: MatDialogRef<AccountUpdate>,
    public contractorService: ContractorService,
    @Inject(MAT_DIALOG_DATA) public data: AccountUpdate
  ) {
    this.signOut = data.isModified;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.logout();
    }, 20000);
  }

  logout(): void {
    /**If user want is working then logged message will
     * appear only to show log out message.
     */
    if (this.signOut) {
      this.isLoading = true;
    }
    const postData = {
      paymentmodechangepopvisible: false,
    };

    /**Updating the user dialog pop field */
    this.contractorService
      .editContractor(this.data.user.parent.id, postData)
      .subscribe((response) => {
        /**If user payment pop mode visible
         * value is true
         * then user will not be logout
         */
        if (this.signOut) {
          this.data.isDataUpdated = true;
        } else {
          this.data.isDataUpdated = false;
        }
        this.data.user = response;
        this.dialogref.close(this.data);
      });
  }
}
