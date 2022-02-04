import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProbabilityRoutingModule } from "./probability-routing.module";
import { CustomerprobabilityComponent } from "./customerprobability/customerprobability.component";
import { ProbabilitydetaildialogComponent } from "./probabilitydetaildialog/probabilitydetaildialog.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";
import { AgmCoreModule } from "@agm/core";
import { GOOGLE_API_KEY } from "../_helpers";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { CustomerprobabilityformComponent } from "./customerprobabilityform/customerprobabilityform.component";

@NgModule({
  declarations: [
    CustomerprobabilityComponent,
    ProbabilitydetaildialogComponent,
    CustomerprobabilityformComponent,
  ],
  imports: [
    CommonModule,
    ProbabilityRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatGoogleMapsAutocompleteModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatExpansionModule,
    // MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
})
export class MaterialModule {}

@NgModule({
  declarations: [],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: GOOGLE_API_KEY,
      libraries: ["places"],
    }),
    MatGoogleMapsAutocompleteModule,
    MaterialModule,
    ProbabilityRoutingModule,
  ],
})
export class ProbabilityModule {}
