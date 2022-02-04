import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../dashboard.module";
import { WithdrawRoutingModule } from "./withdraw-routing.module";
import { WithdrawComponent } from "./withdraw/withdraw.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [WithdrawComponent],
  imports: [
    CommonModule,
    WithdrawRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class WithdrawModule {}
