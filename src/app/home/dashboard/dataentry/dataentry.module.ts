import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DataentryRoutingModule } from "./dataentry-routing.module";
import { DataentryComponent } from "./dataentry.component";
import { MaterialModule } from "../dashboard.module";
import {
  AddModulemakeComponent,
  ModulemakeentryComponent,
} from "./modulemakeentry/modulemakeentry.component";
import {
  AddModulemodelComponent,
  ModulemodelentryComponent,
} from "./modulemodelentry/modulemodelentry.component";
import {
  AddInvertermakeComponent,
  InvertermakeentryComponent,
} from "./invertermakeentry/invertermakeentry.component";
import {
  AddInvertermodelComponent,
  InvertermodelentryComponent,
} from "./invertermodelentry/invertermodelentry.component";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxDropzoneModule } from "ngx-dropzone";
import { GalleryModule } from "@ngx-gallery/core";
import { LightboxModule } from "@ngx-gallery/lightbox";

@NgModule({
  declarations: [
    DataentryComponent,
    ModulemakeentryComponent,
    ModulemodelentryComponent,
    InvertermakeentryComponent,
    AddModulemodelComponent,
    InvertermodelentryComponent,
    AddModulemakeComponent,
    AddInvertermakeComponent,
    AddInvertermodelComponent,
  ],
  imports: [
    CommonModule,
    DataentryRoutingModule,
    MaterialModule,
    InfiniteScrollModule,
    NgxSkeletonLoaderModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    NgxDropzoneModule,
    GalleryModule,
    LightboxModule,
  ],
})
export class DataentryModule {}
