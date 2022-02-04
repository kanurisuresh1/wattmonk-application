import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { QualitychecklistRoutingModule } from "./qualitychecklist-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChartsModule } from "ng2-charts";
import { MaterialModule } from "../dashboard.module";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { QualitychecklistComponent } from "./qualitychecklist/qualitychecklist.component";
import { AddqualitychecklistComponent } from "./addqualitychecklist/addqualitychecklist.component";
import { AddrowlistComponent } from "./addrowlist/addrowlist.component";

import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { EditqualitychecklistComponent } from "./editqualitychecklist/editqualitychecklist.component";
import { DragDropModule } from "@angular/cdk/drag-drop";

@NgModule({
  declarations: [
    QualitychecklistComponent,
    AddqualitychecklistComponent,
    AddrowlistComponent,
    EditqualitychecklistComponent,
  ],
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QualitychecklistRoutingModule,
    ChartsModule,
    NgxSkeletonLoaderModule,
    InfiniteScrollModule,
    DragDropModule,
  ],
})
export class QualitychecklistModule {}
