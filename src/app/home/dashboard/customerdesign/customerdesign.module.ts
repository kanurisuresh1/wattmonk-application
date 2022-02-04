import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { CustomerdesignRoutingModule } from "./customerdesign-routing.module";
import { CustomerdesignComponent } from "./customerdesign/customerdesign.component";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../dashboard.module";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NgxDropzoneModule } from "ngx-dropzone";
import { InfiniteScrollModule } from "ngx-infinite-scroll";

@NgModule({
  declarations: [CustomerdesignComponent],
  imports: [
    CommonModule,
    CustomerdesignRoutingModule,
    NgxSkeletonLoaderModule,
    ReactiveFormsModule,
    MaterialModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    NgxDropzoneModule,
    FormsModule,
    InfiniteScrollModule,
  ],
  providers: [DatePipe],
})
export class CustomerdesignModule {}
