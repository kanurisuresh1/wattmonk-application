import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DesignreportRoutingModule } from "./designreport-routing.module";
import { DesignreportComponent } from "./designreport/designreport.component";
import { MaterialModule } from "../dashboard.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChartsModule } from "ng2-charts";
import { DetaildesignreportComponent } from "./detaildesignreport/detaildesignreport.component";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { DesigntrackerComponent } from "./designtracker/designtracker.component";
import { WorkstatusComponent } from "./workstatus/workstatus.component";
import { DesignstatusComponent } from "./designstatus/designstatus.component";
import { InfiniteScrollModule } from "ngx-infinite-scroll";

@NgModule({
  declarations: [
    DesignreportComponent,
    DetaildesignreportComponent,
    DesigntrackerComponent,
    WorkstatusComponent,
    DesignstatusComponent,
  ],
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DesignreportRoutingModule,
    ChartsModule,
    NgxSkeletonLoaderModule,
    InfiniteScrollModule,
  ],
})
export class DesignreportModule {}
