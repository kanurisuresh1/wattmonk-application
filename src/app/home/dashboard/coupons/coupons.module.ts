import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CouponRoutingModule } from "./coupons-routing.module";
import { AddcoupondialogComponent } from "./addcoupondialog/addcoupondialog.component";
import { CouponsComponent } from "./coupons/coupons.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxDropzoneModule } from "ngx-dropzone";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MaterialModule } from "../dashboard.module";
import { MatExpansionModule } from "@angular/material/expansion";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";

@NgModule({
  declarations: [AddcoupondialogComponent, CouponsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    ScrollingModule,
    MaterialModule,
    CouponRoutingModule,
    MatExpansionModule,
    NgxSkeletonLoaderModule,
  ],
})
export class CouponsModule {}
