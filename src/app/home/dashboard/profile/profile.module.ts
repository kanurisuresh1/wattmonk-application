import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProfileRoutingModule } from "./profile-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MaterialModule } from "../dashboard.module";
import { AddcoinsdialogComponent } from "./addcoinsdialog/addcoinsdialog.component";
import { MatVideoModule } from "mat-video";
import { ViewEarningsComponent } from "./view-earnings/view-earnings.component";
import { WithdrawRequestComponent } from "./withdraw-request/withdraw-request.component";
import { ViewWithdrawRequestComponent } from "./view-withdraw-request/view-withdraw-request.component";
import { BankAccountComponent } from "./bank-account/bank-account.component";
import { BankDetailsComponent } from "./bank-details/bank-details.component";
import { PaymentsuccessComponent } from "./paymentsuccess/paymentsuccess.component";
import { PaymentfailedComponent } from "./paymentfailed/paymentfailed.component";
import { SavenewpasswordComponent } from "./savenewpassword/savenewpassword.component";

@NgModule({
  declarations: [
    AddcoinsdialogComponent,
    ViewEarningsComponent,
    WithdrawRequestComponent,
    ViewWithdrawRequestComponent,
    BankAccountComponent,
    BankDetailsComponent,
    PaymentsuccessComponent,
    PaymentfailedComponent,
    SavenewpasswordComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    MaterialModule,
    MatVideoModule,
    ProfileRoutingModule,
  ],
})
export class ProfileModule {}
