import { AgmCoreModule } from "@agm/core";
import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { HammerModule } from "@angular/platform-browser";
import { GalleryModule } from "@ngx-gallery/core";
import { LightboxModule } from "@ngx-gallery/lightbox";
import { Ng2SearchPipeModule } from "ng2-search-filter";
import { NgxDropzoneModule } from "ngx-dropzone";
import { FilterPipeModule } from "ngx-filter-pipe";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { JoyrideModule } from "ngx-joyride";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { PinchZoomModule } from "ngx-pinch-zoom";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { NgxTimerModule } from "ngx-timer";
import { MaterialModule } from "../dashboard.module";
import { PestampModule } from "../pestamp/pestamp.module";
import { AddminpermitdesigndialogComponent } from "./addminpermitdesigndialog/addminpermitdesigndialog.component";
import { ApplypermitpromocodedialogComponent } from "./applypermitpromocodedialog/applypermitpromocodedialog.component";
import { AssigndesigndialogComponent } from "./assigndesigndialog/assigndesigndialog.component";
import { DesignRoutingModule } from "./design-routing.module";
import {
  DesignComponent,
  DesignDeclineDialog,
  DesignDeliverDialog,
  permitDesignResendDialog
} from "./design/design.component";
import { DesignerinformationComponent } from "./detailedpermit/designerinformation/designerinformation.component";
import { DetailedpermitComponent } from "./detailedpermit/detailedpermit.component";
import { EditelectricalinputsComponent } from "./detailedpermit/editelectricalinputs/editelectricalinputs.component";
import { ElectricalinformationComponent } from "./detailedpermit/electricalinformation/electricalinformation.component";
import { GeneralinformationComponent } from "./detailedpermit/generalinformation/generalinformation.component";
import { LocationmarkingComponent } from "./detailedpermit/locationmarking/locationmarking.component";
import { PdfqualitycheckComponent } from "./detailedpermit/pdfqualitycheck/pdfqualitycheck.component";
import { PermitplanuploaderComponent } from "./detailedpermit/permitplanuploader/permitplanuploader.component";
import { SiteinformationComponent } from "./detailedpermit/siteinformation/siteinformation.component";
import { StructuralinformationComponent } from "./detailedpermit/structuralinformation/structuralinformation.component";
import { OrderpermitdesigndialogComponent } from "./orderpermitdesigndialog/orderpermitdesigndialog.component";
import { SharepermitdesigndialogComponent } from "./sharepermitdesigndialog/sharepermitdesigndialog.component";
import { BomComponent } from './detailedpermit/bom/bom.component';

@NgModule({
  declarations: [
    AssigndesigndialogComponent,
    DesignComponent,
    SharepermitdesigndialogComponent,
    DesignDeclineDialog,
    DesignDeliverDialog,
    permitDesignResendDialog,
    AddminpermitdesigndialogComponent,
    OrderpermitdesigndialogComponent,
    DetailedpermitComponent,
    SiteinformationComponent,
    GeneralinformationComponent,
    StructuralinformationComponent,
    ElectricalinformationComponent,
    LocationmarkingComponent,
    DesignerinformationComponent,
    ApplypermitpromocodedialogComponent,
    PdfqualitycheckComponent,
    PermitplanuploaderComponent,
    EditelectricalinputsComponent,
    BomComponent
  ],
  imports: [
    FilterPipeModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GalleryModule,
    LightboxModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MaterialModule,
    ScrollingModule,
    DragDropModule,
    NgxTimerModule,
    NgxDropzoneModule,
    AngularFireDatabaseModule,
    HammerModule,
    PinchZoomModule,
    NgxSkeletonLoaderModule,
    DesignRoutingModule,
    JoyrideModule.forRoot(),
    MatGoogleMapsAutocompleteModule,
    AgmCoreModule,
    NgxMatSelectSearchModule,
    Ng2SearchPipeModule,
    PestampModule,
    MatSlideToggleModule,
    InfiniteScrollModule,
  ],
  providers: [DatePipe],
})
export class DesignModule { }
