import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";

import { TeamRoutingModule } from "./team-routing.module";
import { TeamComponent } from "./team/team.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxDropzoneModule } from "ngx-dropzone";
import { AddteammemberdialogComponent } from "./addteammemberdialog/addteammemberdialog.component";
import { TeammemberdetaildialogComponent } from "./teammemberdetaildialog/teammemberdetaildialog.component";
import { MaterialModule } from "../dashboard.module";
import { AddgroupdialogComponent } from "./addgroupdialog/addgroupdialog.component";
import { MatChipsModule } from "@angular/material/chips";
import { GroupdetaildialogComponent } from "./groupdetaildialog/groupdetaildialog.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { AssigndesignmanagerdialogComponent } from "./assigndesignmanagerdialog/assigndesignmanagerdialog.component";
import { AssignadmindialogComponent } from "./assignadmindialog/assignadmindialog.component";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { TransferjobsComponent } from "./transferjobs/transferjobs.component";
import { TasklistingdialogComponent } from "./tasklistingdialog/tasklistingdialog.component";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
@NgModule({
  declarations: [
    TeamComponent,
    AddteammemberdialogComponent,
    TeammemberdetaildialogComponent,
    AddgroupdialogComponent,
    GroupdetaildialogComponent,
    AssigndesignmanagerdialogComponent,
    AssignadmindialogComponent,
    TransferjobsComponent,
    TasklistingdialogComponent,
    TasklistingdialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    MaterialModule,
    TeamRoutingModule,
    MatChipsModule,
    ScrollingModule,
    NgxSkeletonLoaderModule,
    MatTooltipModule,
    NgxMatSelectSearchModule,
  ],
})
export class TeamModule {}
