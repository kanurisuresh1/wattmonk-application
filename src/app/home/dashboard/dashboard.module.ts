import { NgModule } from "@angular/core";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { AgmCoreModule } from "@agm/core";
import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";

import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatMenuModule } from "@angular/material/menu";
import { MatListModule } from "@angular/material/list";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTabsModule } from "@angular/material/tabs";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatBadgeModule } from "@angular/material/badge";
// import { MatCarouselModule } from '@ngmodule/material-carousel';
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CommonModule } from "@angular/common";
import { CometchatAngularUiKitModule } from "src/lib/cometchat-angular-ui-kit/src/lib/cometchat-angular-ui-kit.module";
import { InboxComponent } from "./inbox/inbox/inbox.component";
import { GOOGLE_API_KEY } from "src/app/_helpers";
import { MatTooltipModule } from "@angular/material/tooltip";

@NgModule({
  exports: [
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDialogModule,
    // MatExpansionModule,
    // MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    // MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    // MatSidenavModule,
    // MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    //MatSortModule,
    MatTableModule,
    MatTabsModule,
    // MatToolbarModule,
    // MatTooltipModule,
    MatNativeDateModule,
    // MatCarouselModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    // MatBottomSheetModule
  ],
  declarations: [],
})
export class MaterialModule {}

@NgModule({
  declarations: [InboxComponent],
  imports: [
    CommonModule,
    AgmCoreModule.forRoot({
      apiKey: GOOGLE_API_KEY,
      libraries: ["places", "geometry"],
    }),
    MatGoogleMapsAutocompleteModule,
    MaterialModule,
    CometchatAngularUiKitModule,
    DashboardRoutingModule,
    // MatSortModule
  ],
})
export class DashboardModule {}
