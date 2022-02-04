import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SurveyRoutingModule } from "./survey-routing.module";
import { AddsurveydialogComponent } from "./addsurveydialog/addsurveydialog.component";
import { AssignsurveydialogComponent } from "./assignsurveydialog/assignsurveydialog.component";
import {
  SurveyComponent,
  SurveyDeclineDialog,
} from "./survey/survey.component";
import { NgxTimerModule } from "ngx-timer";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { MaterialModule } from "../dashboard.module";
import { FlexLayoutModule } from "@angular/flex-layout";
import { GalleryModule } from "@ngx-gallery/core";
import { LightboxModule } from "@ngx-gallery/lightbox";
import { NgxDropzoneModule } from "ngx-dropzone";
@NgModule({
  declarations: [
    AddsurveydialogComponent,
    AssignsurveydialogComponent,
    SurveyComponent,
    SurveyDeclineDialog,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxTimerModule,
    ScrollingModule,
    NgxMaterialTimepickerModule,
    SurveyRoutingModule,
    NgxSkeletonLoaderModule,
    MatGoogleMapsAutocompleteModule,
    FlexLayoutModule,
    GalleryModule,
    LightboxModule,
    NgxDropzoneModule,
  ],
})
export class SurveyModule {}
