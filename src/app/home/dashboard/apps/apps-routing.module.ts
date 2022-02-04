import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AppsComponent } from "./apps/apps.component";
import { AddappsComponent } from "./addapps/addapps.component";

const Appsroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: AppsComponent,
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "allapps",
        component: AddappsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(Appsroutes)],
  exports: [RouterModule],
})
export class AppsRoutingModule {}
