import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DesignreportComponent } from "./designreport/designreport.component";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: DesignreportComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DesignreportRoutingModule {}
