import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CustomerdesignComponent } from "./customerdesign/customerdesign.component";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: CustomerdesignComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerdesignRoutingModule {}
