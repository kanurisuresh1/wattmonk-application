import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSortModule } from "@angular/material/sort";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { MaterialModule } from "../dashboard.module";
import { TransactionRoutingModule } from "./transaction-routing.module";
import { TransactionComponent } from "./transaction/transaction.component";

@NgModule({
  declarations: [TransactionComponent],
  imports: [
    CommonModule,
    TransactionRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatSortModule,
    NgxSkeletonLoaderModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule,
  ],
})
export class TransactionModule {}
