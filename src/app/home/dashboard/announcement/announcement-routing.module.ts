import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AnnouncementComponent } from "./announcement/announcement.component";

const AnnouncementRoute: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: AnnouncementComponent,
      },
    ],
  },
];
@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(AnnouncementRoute)],
  exports: [RouterModule],
})
export class AnnouncementRoutingModule {}
