import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { BrowserModule } from "@angular/platform-browser";
import { CometchatAngularUiKitModule } from "src/lib/cometchat-angular-ui-kit/src/lib/cometchat-angular-ui-kit.module";
import { MaterialModule } from "../dashboard.module";
import { InboxRoutingModule } from "./inbox-routing.module";
import { InboxComponent } from "./inbox/inbox.component";
// import { MentionsdialogComponent } from "./mentionsdialog/mentionsdialog.component";




@NgModule({
  declarations: [InboxComponent],
  imports: [
    FormsModule,
    CommonModule,
    MaterialModule,
    CometchatAngularUiKitModule,
    InboxRoutingModule,
    ReactiveFormsModule,
    BrowserModule,

    MatIconModule,
    NgModule,
  ],
})
export class InboxModule { }
