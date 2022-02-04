import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { GalleryModule } from "@ngx-gallery/core";
import { LightboxModule } from "@ngx-gallery/lightbox";
import { ChartsModule, ThemeService } from "ng2-charts";
import { NgxDropzoneModule } from "ngx-dropzone";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { PinchZoomModule } from "ngx-pinch-zoom";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { NgxTimerModule } from "ngx-timer";
import { CometchatviewgroupComponent } from "src/app/shared/cometchatviewgroup/cometchatviewgroup.component";
import { FilterPipe } from "src/app/shared/pipe/filter.pipe";
import { MaterialModule } from "../dashboard.module";
import { AdminoverviewComponent } from "./adminoverview/adminoverview.component";
import { AnalystoverviewComponent } from "./analystoverview/analystoverview.component";
import { ClientoverviewComponent } from "./clientoverview/clientoverview.component";
import { DesigndeclinedialogComponent } from "./designdeclinedialog/designdeclinedialog.component";
import { DesigneroverviewComponent } from "./designeroverview/designeroverview.component";
import { JoblistingComponent } from "./joblisting/joblisting.component";
import { OnboardingComponent } from "./onboarding/onboarding.component";
import { OverviewRoutingModule } from "./overview-routing.module";
import { PeengineeroverviewComponent } from "./peengineeroverview/peengineeroverview.component";
import { SurveyoroverviewComponent } from "./surveyoroverview/surveyoroverview.component";



@NgModule({
  declarations: [
    AdminoverviewComponent,
    DesigneroverviewComponent,
    SurveyoroverviewComponent,
    AnalystoverviewComponent,
    PeengineeroverviewComponent,
    ClientoverviewComponent,
    JoblistingComponent,
    FilterPipe,
    OnboardingComponent,
    DesigndeclinedialogComponent,
    CometchatviewgroupComponent,
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    CommonModule,
    MaterialModule,
    ScrollingModule,
    OverviewRoutingModule,
    NgxTimerModule,
    NgxSkeletonLoaderModule,
    PinchZoomModule,
    MatExpansionModule,
    MatInputModule,
    MatButtonModule,
    GalleryModule,
    LightboxModule,
    MatGoogleMapsAutocompleteModule,
    NgxDropzoneModule,
    ChartsModule,
    InfiniteScrollModule,
    MatRadioModule,
    NgxMatSelectSearchModule,
    MatSelectModule
  ],
  providers: [ThemeService, DatePipe],
})
export class OverviewModule { }
