import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SearchComponent } from "./search/search.component";
import { SettingComponent } from "./setting/setting.component";

const extraroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "search",
        component: SearchComponent,
      },
    ],
  },
  {
    path: "setting",
    component: SettingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(extraroutes)],
  exports: [RouterModule],
})
export class ExtrasRoutingModule {}
