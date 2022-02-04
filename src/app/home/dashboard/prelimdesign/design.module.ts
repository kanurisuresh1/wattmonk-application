import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { HammerModule } from "@angular/platform-browser";
import { GalleryModule } from "@ngx-gallery/core";
import { LightboxModule } from "@ngx-gallery/lightbox";
import { Ng2SearchPipeModule } from "ng2-search-filter";
import { NgxDropzoneModule } from "ngx-dropzone";
import { FilterPipeModule } from "ngx-filter-pipe";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { PinchZoomModule } from "ngx-pinch-zoom";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { NgxTimerModule } from "ngx-timer";
import { MaterialModule } from "../dashboard.module";
import { PestampModule } from "../pestamp/pestamp.module";
import { AdddesigndialogComponent } from "./adddesigndialog/adddesigndialog.component";
import { AddprelimproposaldialogComponent } from "./addprelimproposaldialog/addprelimproposaldialog.component";
import { ApplycoupandialogComponent } from "./applycoupandialog/applycoupandialog.component";
import { AssigndesigndialogComponent } from "./assigndesigndialog/assigndesigndialog.component";
import { DesignRoutingModule } from "./design-routing.module";
import {
  DesignComponent,
  DesignDeclineDialog,
  DesignDeliverDialog,
  DesignResendDialog
} from "./design/design.component";
import { OrderprelimdesigndialogComponent } from "./orderprelimdesigndialog/orderprelimdesigndialog.component";
import { ShareprelimdesigndialogComponent } from "./shareprelimdesigndialog/shareprelimdesigndialog.component";


@NgModule({
  declarations: [AdddesigndialogComponent, AssigndesigndialogComponent, DesignComponent, ShareprelimdesigndialogComponent, DesignDeliverDialog, DesignResendDialog, OrderprelimdesigndialogComponent, ApplycoupandialogComponent, AddprelimproposaldialogComponent, DesignDeclineDialog],
  imports: [
    FilterPipeModule,
    CommonModule,
    FormsModule,
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
    DesignRoutingModule,
    MatGoogleMapsAutocompleteModule,
    PestampModule,
    Ng2SearchPipeModule,
    NgxMatSelectSearchModule,
    GalleryModule,
    LightboxModule,
    InfiniteScrollModule,
  ],
  providers: [DatePipe],
})
export class DesignModule { }
