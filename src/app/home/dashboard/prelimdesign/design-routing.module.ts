import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DesignComponent } from "./design/design.component";

const designroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: DesignComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(designroutes)],
  exports: [RouterModule],
})
export class DesignRoutingModule {}
