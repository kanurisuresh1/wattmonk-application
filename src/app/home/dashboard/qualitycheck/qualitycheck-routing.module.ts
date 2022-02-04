import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { QualitycheckComponent } from "./qualitycheck/qualitycheck.component";

const QCroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: QualitycheckComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(QCroutes)],
  exports: [RouterModule],
})
export class QualitycheckRoutingModule {}
