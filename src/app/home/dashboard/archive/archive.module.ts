import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { NgxDropzoneModule } from "ngx-dropzone";
import { MaterialModule } from "../dashboard.module";
import { MatExpansionModule } from "@angular/material/expansion";
import { ArchiveComponent } from "./archive/archive.component";
import { ArchiveRoutingModule } from "./archive-routing.module";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@NgModule({
  declarations: [ArchiveComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    InfiniteScrollModule,
    MaterialModule,
    ArchiveRoutingModule,
    MatExpansionModule,
    NgxSkeletonLoaderModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
  ],
})
export class ArchiveModule {}
