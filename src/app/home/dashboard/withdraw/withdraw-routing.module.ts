import { WithdrawComponent } from "./withdraw/withdraw.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const withdrawRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: WithdrawComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(withdrawRoutes)],
  exports: [RouterModule],
})
export class WithdrawRoutingModule {}
