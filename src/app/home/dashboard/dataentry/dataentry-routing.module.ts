import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DataentryComponent } from "./dataentry.component";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: DataentryComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataentryRoutingModule {}
