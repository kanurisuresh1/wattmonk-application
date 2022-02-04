import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { ExtrasRoutingModule } from "./extras-routing.module";
import { SearchComponent } from "./search/search.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MaterialModule } from "../dashboard.module";
import { SettingComponent } from "./setting/setting.component";

@NgModule({
  declarations: [SearchComponent, SettingComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    MaterialModule,
    ExtrasRoutingModule,
  ],
  providers: [DatePipe],
})
export class ExtrasModule {}
