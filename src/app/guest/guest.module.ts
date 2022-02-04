import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { GuestRoutingModule } from "./guest-routing.module";
import { HomeComponent } from "./home/home.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { NgxDropzoneModule } from "ngx-dropzone";
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
import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatBadgeModule } from "@angular/material/badge";
// import { MatCarouselModule } from '@ngmodule/material-carousel';
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AddguestdesigndialogComponent } from "./addguestdesigndialog/addguestdesigndialog.component";
import { AgmCoreModule } from "@agm/core";
import { RegisterguestComponent } from "./registerguest/registerguest.component";
import { DesigndialogComponent } from "./designdialog/designdialog.component";
import { DesignchargesdialogComponent } from "./designchargesdialog/designchargesdialog.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { AddguestpermitdesigndialogComponent } from "./addguestpermitdesigndialog/addguestpermitdesigndialog.component";
import { AddguestproposaldialogComponent } from "./addguestproposaldialog/addguestproposaldialog.component";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { PestampModule } from "../home/dashboard/pestamp/pestamp.module";

@NgModule({
  declarations: [
    HomeComponent,
    AddguestdesigndialogComponent,
    RegisterguestComponent,
    DesigndialogComponent,
    DesignchargesdialogComponent,
    AddguestpermitdesigndialogComponent,
    AddguestproposaldialogComponent,
  ],
  imports: [
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDialogModule,
    MatExpansionModule,
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
    // MatSortModule,
    MatTableModule,
    MatTabsModule,
    // MatToolbarModule,
    // MatTooltipModule,
    MatNativeDateModule,
    // MatCarouselModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    CommonModule,
    GuestRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    MatGoogleMapsAutocompleteModule,
    NgxMatSelectSearchModule,
    PestampModule,
  ],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {},
    },
  ],
})
export class MaterialModule {}

@NgModule({
  declarations: [],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCePxz4wA_knfjvNBhV0RKzrySsf4o8QFU",
      libraries: ["places"],
    }),
    MatGoogleMapsAutocompleteModule,
    MaterialModule,
    GuestRoutingModule,
  ],
})
export class GuestModule {}
