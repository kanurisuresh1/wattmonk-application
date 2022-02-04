import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContractorComponent } from "./contractor/contractor.component";
import { AllcontractorsComponent } from "./allcontractors/allcontractors.component";

const Clientroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: ContractorComponent,
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "allclients",
        component: AllcontractorsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(Clientroutes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
