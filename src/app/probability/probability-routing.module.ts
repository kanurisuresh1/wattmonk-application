import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CustomerprobabilityComponent } from "./customerprobability/customerprobability.component";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: CustomerprobabilityComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProbabilityRoutingModule {}
