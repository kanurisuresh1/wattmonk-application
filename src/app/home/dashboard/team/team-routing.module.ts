import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TeamComponent } from "./team/team.component";

const teamroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: TeamComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(teamroutes)],
  exports: [RouterModule],
})
export class TeamRoutingModule {}
