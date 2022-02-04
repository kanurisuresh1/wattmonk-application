import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { QualitycheckRoutingModule } from "./qualitycheck-routing.module";
import { QualitycheckComponent } from "./qualitycheck/qualitycheck.component";
import { AssignreviewerdialogComponent } from "./assignreviewerdialog/assignreviewerdialog.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MaterialModule } from "../dashboard.module";
import { FormsModule } from "@angular/forms";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";

@NgModule({
  declarations: [QualitycheckComponent, AssignreviewerdialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ScrollingModule,
    QualitycheckRoutingModule,
    NgxSkeletonLoaderModule,
  ],
})
export class QualitycheckModule {}
