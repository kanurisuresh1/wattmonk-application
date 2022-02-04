import { OverlayModule } from "@angular/cdk/overlay";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelect, MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { GalleryModule } from '@ngx-gallery/core';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { BackButtonDisableModule } from "angular-disable-browser-back-button";
import { DeviceDetectorModule } from "ngx-device-detector";
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { NgxPayPalModule } from 'ngx-paypal';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxTimerModule } from "ngx-timer";
import { ToastrModule } from "ngx-toastr";
import { DashboardModule } from 'src/app/home/dashboard/dashboard.module';
import { CometchatAngularUiKitModule } from 'src/lib/cometchat-angular-ui-kit/src/lib/cometchat-angular-ui-kit.module';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from "../environments/environment";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
// import { NotificationComponent } from './shared/notification/notification.component';
import { HomeModule } from './home/home.module';
import { AccountUpdateComponent } from "./shared/AccountUpdate/account-update.component";
import { ChatdialogComponent } from './shared/chatdialog/chatdialog.component';
import { CometchatviewgroupComponent } from "./shared/cometchatviewgroup/cometchatviewgroup.component";
import { LoaderComponent } from "./shared/loader/loader.component";
import { MaintenanceviewComponent } from './shared/maintenanceview/maintenanceview.component';
import { Checklistupdateddialog, Guidelinesbottomsheet, MasterdetailpageComponent } from './shared/masterdetailpage/masterdetailpage.component';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { PaypalPaymentComponent } from './shared/paypal-payment/paypal-payment.component';
import { SearchchatdialogComponent } from "./shared/searchchatdialog/searchchatdialog.component";
import { TransactionFilterComponentComponent } from "./shared/transaction-filter-component/transaction-filter-component.component";
import { UpdatedialogComponent } from "./shared/updatedialog/updatedialog.component";
import { LoaderInterceptor } from "./_interceptors";
import { LoaderService } from "./_services";
import { EventEmitterService } from "./_services/event-emitter.service";
import { MessagingService } from "./_services/messaging.service";



@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    UpdatedialogComponent,
    PaypalPaymentComponent,
    MasterdetailpageComponent,
    ChatdialogComponent,
    MaintenanceviewComponent,
    // NotificationComponent,
    Checklistupdateddialog,
    SearchchatdialogComponent,
    TransactionFilterComponentComponent,
    AccountUpdateComponent,
    Guidelinesbottomsheet,

  ],
  imports: [
    InfiniteScrollModule,
    CometchatAngularUiKitModule,
    NgxTimerModule,
    MatSlideToggleModule,
    NgxSkeletonLoaderModule,
    BrowserModule,
    FormsModule,
    OverlayModule,
    MatButtonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    AppRoutingModule,
    MatProgressBarModule,
    MatCardModule,
    MatSnackBarModule,
    HomeModule,
    NgxPayPalModule,
    MatTabsModule,
    NgxMaterialTimepickerModule.setLocale("en-US"),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    DeviceDetectorModule.forRoot(),
    AngularFireMessagingModule,
    MatDialogModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    BackButtonDisableModule.forRoot({
      preserveScrollPosition: true,
    }),
    GalleryModule,
    LightboxModule,
    MatSelectModule,
    DashboardModule,
    NgxDropzoneModule,
    MatFormFieldModule,
    MatInputModule,
    MatBottomSheetModule,
    MatDividerModule,
    MatDatepickerModule,
    NgxMatSelectSearchModule,
    MatCheckboxModule,
    FilterPipeModule
  ],
  exports: [LoaderComponent],
  providers: [
    LoaderService,
    EventEmitterService,
    MessagingService,
    NavbarComponent,
    LoaderComponent,
    CometchatviewgroupComponent,
    MatSelect,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
