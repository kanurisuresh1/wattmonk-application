import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { QualitychecklistComponent } from "./qualitychecklist/qualitychecklist.component";

const qualitychecklistroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "qualitycheck",
        component: QualitychecklistComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(qualitychecklistroutes)],
  exports: [RouterModule],
})
export class QualitychecklistRoutingModule {}
