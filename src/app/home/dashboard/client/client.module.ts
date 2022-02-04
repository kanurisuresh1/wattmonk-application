import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { GoogleChartsModule } from "angular-google-charts";
import { NgxDropzoneModule } from "ngx-dropzone";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { MaterialModule } from "../dashboard.module";
import { AddcontractordialogComponent } from "./addcontractordialog/addcontractordialog.component";
import { AllcontractorsComponent } from "./allcontractors/allcontractors.component";
import { ClientRoutingModule } from "./client-routing.module";
import { ContractorComponent } from "./contractor/contractor.component";
import { ContractordetaildialogComponent } from "./contractordetaildialog/contractordetaildialog.component";
import { ContractorpricingComponent } from "./contractorpricing/contractorpricing.component";

@NgModule({
  declarations: [
    AddcontractordialogComponent,
    AllcontractorsComponent,
    ContractorComponent,
    ContractordetaildialogComponent,
    ContractorpricingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    MaterialModule,
    ClientRoutingModule,
    MatExpansionModule,
    NgxSkeletonLoaderModule,
    GoogleChartsModule,
    MatProgressSpinnerModule,
    InfiniteScrollModule,
    MatGoogleMapsAutocompleteModule,
  ],
})
export class ClientModule { }
