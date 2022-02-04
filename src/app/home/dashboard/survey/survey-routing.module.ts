import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SurveyComponent } from "./survey/survey.component";

const surveyroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: SurveyComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(surveyroutes)],
  exports: [RouterModule],
})
export class SurveyRoutingModule {}
