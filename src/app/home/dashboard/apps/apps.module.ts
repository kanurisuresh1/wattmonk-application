import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AppsRoutingModule } from "./apps-routing.module";
import { AppsComponent } from "./apps/apps.component";
import { AddappsComponent } from "./addapps/addapps.component";
import { MaterialModule } from "../dashboard.module";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { AppsdetailpageComponent } from "./appsdetailpage/appsdetailpage.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AddsecretkeyComponent } from "./addsecretkey/addsecretkey.component";
import { MatTooltipModule } from "@angular/material/tooltip";

@NgModule({
  declarations: [
    AppsComponent,
    AddappsComponent,
    AppsdetailpageComponent,
    AddsecretkeyComponent,
  ],
  imports: [
    CommonModule,
    AppsRoutingModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
  ],
})
export class AppsModule {}
