import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AdminoverviewComponent } from "./adminoverview/adminoverview.component";
import { DesigneroverviewComponent } from "./designeroverview/designeroverview.component";
import { AnalystoverviewComponent } from "./analystoverview/analystoverview.component";
import { SurveyoroverviewComponent } from "./surveyoroverview/surveyoroverview.component";
import { PeengineeroverviewComponent } from "./peengineeroverview/peengineeroverview.component";
import { ClientoverviewComponent } from "./clientoverview/clientoverview.component";
import { JoblistingComponent } from "./joblisting/joblisting.component";
import { OnboardingComponent } from "./onboarding/onboarding.component";

export const OverviewRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "onboarding",
        component: OnboardingComponent,
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "overview",
        component: AdminoverviewComponent,
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "overview/client",
        component: ClientoverviewComponent,
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "overview/designer",
        component: DesigneroverviewComponent,
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "overview/analyst",
        component: AnalystoverviewComponent,
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "overview/surveyor",
        component: SurveyoroverviewComponent,
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "overview/peengineer",
        component: PeengineeroverviewComponent,
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "overview/joblisting",
        component: JoblistingComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(OverviewRoutes)],
  exports: [RouterModule],
})
export class OverviewRoutingModule {}
