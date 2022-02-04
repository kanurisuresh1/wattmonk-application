import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { HammerModule } from "@angular/platform-browser";
import { GalleryModule } from "@ngx-gallery/core";
import { LightboxModule } from "@ngx-gallery/lightbox";
import { NgxDropzoneModule } from "ngx-dropzone";
import { FilterPipeModule } from "ngx-filter-pipe";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { PinchZoomModule } from "ngx-pinch-zoom";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { NgxTimerModule } from "ngx-timer";
import { TwoDigitDecimaNumberDirective } from "src/app/shared/two-digit-decima-number.directive";
import { MaterialModule } from "../dashboard.module";
import { AddpestampdialogComponent } from "./addpestampdialog/addpestampdialog.component";
import { AssignpeengineersComponent } from "./assignpeengineers/assignpeengineers.component";
import { OrderpestampsdialogComponent } from "./orderpestampsdialog/orderpestampsdialog.component";
import { PendingpaymentsdialogComponent } from "./pendingpaymentsdialog/pendingpaymentsdialog.component";
import { PestampRoutingModule } from "./pestamp-routing.module";
import {
  PestampComponent,
  PestampDeclineDialog,
  PestampResendDialog
} from "./pestamp/pestamp.component";
import { ShareprelimdesigndialogComponent } from "./shareprelimdesigndialog/shareprelimdesigndialog.component";



@NgModule({
  declarations: [
    AddpestampdialogComponent,
    PestampComponent,
    ShareprelimdesigndialogComponent,
    PestampDeclineDialog,
    PestampResendDialog,
    OrderpestampsdialogComponent,
    AssignpeengineersComponent,
    PendingpaymentsdialogComponent,
    TwoDigitDecimaNumberDirective,
  ],
  imports: [
    FilterPipeModule,
    CommonModule,
    GalleryModule,
    FormsModule,
    LightboxModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MaterialModule,
    ScrollingModule,
    DragDropModule,
    NgxTimerModule,
    NgxDropzoneModule,
    HammerModule,
    PinchZoomModule,
    NgxSkeletonLoaderModule,
    PestampRoutingModule,
    MatGoogleMapsAutocompleteModule,
    InfiniteScrollModule,
  ],
  exports: [

  ]
})
export class PestampModule { }
