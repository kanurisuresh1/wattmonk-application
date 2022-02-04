import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { HomeRoutingModule } from "./home-routing.module";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { ConfirmationsnackbarComponent } from "../shared/confirmationsnackbar/confirmationsnackbar.component";
import { ActivitybarComponent } from "../shared/activitybar/activitybar.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CallScreenComponent } from "../shared/call-screen/call-screen.component";
import { ProfileModule } from "./dashboard/profile/profile.module";
import { ZohoSalesiqComponent } from "../home/zoho-salesiq/zoho-salesiq.component";
import { JoyrideModule } from "ngx-joyride";
import { FormsModule } from "@angular/forms";
import { NotificationComponent } from "../shared/notification/notification.component";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";
import { MyaccountComponent } from "../shared/myaccount/myaccount.component";

@NgModule({
  declarations: [
    DashboardComponent,
    SidebarComponent,
    NavbarComponent,
    NotificationComponent,
    MyaccountComponent,
    ConfirmationsnackbarComponent,
    ActivitybarComponent,
    CallScreenComponent,
    ZohoSalesiqComponent,
  ],
  imports: [
    CommonModule,
    ScrollingModule,
    MatIconModule,
    MatButtonModule,
    HomeRoutingModule,
    MatDialogModule,
    ProfileModule,
    NgxSkeletonLoaderModule,
    JoyrideModule.forRoot(),
    FormsModule,
    MatTooltipModule,
    MatGoogleMapsAutocompleteModule,
  ],
  exports: [ZohoSalesiqComponent],
})
export class HomeModule {}
