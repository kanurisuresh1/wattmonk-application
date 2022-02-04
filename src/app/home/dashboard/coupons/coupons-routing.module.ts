import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CouponsComponent } from "./coupons/coupons.component";

const Clientroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: CouponsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(Clientroutes)],
  exports: [RouterModule],
})
export class CouponRoutingModule {}
