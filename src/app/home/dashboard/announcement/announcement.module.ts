import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AnnouncementComponent } from "./announcement/announcement.component";
import { AnnouncementRoutingModule } from "./announcement-routing.module";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRippleModule } from "@angular/material/core";
import { MaterialModule } from "src/app/guest/guest.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AddannouncementdialogComponent } from "./addannouncementdialog/addannouncementdialog.component";
import { MatRadioModule } from "@angular/material/radio";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { MatTableModule } from "@angular/material/table";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ColorPickerModule } from "ngx-color-picker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";

@NgModule({
  declarations: [AnnouncementComponent, AddannouncementdialogComponent],
  imports: [
    CommonModule,
    AnnouncementRoutingModule,
    NgxSkeletonLoaderModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    MatRadioModule,
    InfiniteScrollModule,
    MatTableModule,
    NgxSkeletonLoaderModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule,
    ColorPickerModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
})
export class AnnouncementModule {}
