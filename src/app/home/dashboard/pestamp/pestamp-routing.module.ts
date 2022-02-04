import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PestampComponent } from "./pestamp/pestamp.component";

const pestamproutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: PestampComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(pestamproutes)],
  exports: [RouterModule],
})
export class PestampRoutingModule {}
