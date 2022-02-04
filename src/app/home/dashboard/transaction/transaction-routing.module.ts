import { TransactionComponent } from "./transaction/transaction.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const transactionRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: TransactionComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(transactionRoutes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}
