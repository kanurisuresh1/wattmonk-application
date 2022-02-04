import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ViewEarningsComponent } from "./view-earnings/view-earnings.component";
import { PaymentsuccessComponent } from "./paymentsuccess/paymentsuccess.component";
import { PaymentfailedComponent } from "./paymentfailed/paymentfailed.component";
import { ViewWithdrawRequestComponent } from "./view-withdraw-request/view-withdraw-request.component";

const profileroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "view-earnings",
        component: ViewEarningsComponent,
      },
      {
        path: "success",
        component: PaymentsuccessComponent,
      },
      {
        path: "cancel",
        component: PaymentfailedComponent,
      },
      {
        path: "view-withdraw-request",
        component: ViewWithdrawRequestComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(profileroutes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
