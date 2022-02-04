import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginComponent } from "./login/login.component";
import {
  RegisterComponent,
  RegisterSuccessDialog,
} from "./register/register.component";
import { ForgotpasswordComponent } from "./forgotpassword/forgotpassword.component";
import { ResetpasswordComponent } from "./resetpassword/resetpassword.component";
import { LogoutComponent } from "./logout/logout.component";
import { AuthRoutingModule } from "./auth-routing.module";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PrivacydialogComponent } from "./privacydialog/privacydialog.component";
import { TermsdialogComponent } from "./termsdialog/termsdialog.component";
import { ChangepasswordComponent } from "./changepassword/changepassword.component";
import { WebsurveyComponent } from "./websurvey/websurvey.component";
import { WebcamModule } from "ngx-webcam";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { EditprofiledialogComponent } from "./editprofiledialog/editprofiledialog.component";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";
import { BackButtonDisableModule } from "angular-disable-browser-back-button";
import { DesignerRegistrationComponent } from "./designer-registration/designer-registration.component";
import { DesignerprivacydialogComponent } from "./designerprivacydialog/designerprivacydialog.component";
import { DesignerTermsdialogogComponent } from "./designer-termsdialogog/designer-termsdialogog.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { MatSelectModule } from "@angular/material/select";
import { PesuperadminregistrationComponent } from "./pesuperadminregistration/pesuperadminregistration.component";
@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    RegisterSuccessDialog,
    ForgotpasswordComponent,
    ResetpasswordComponent,
    LogoutComponent,
    PrivacydialogComponent,
    TermsdialogComponent,
    ChangepasswordComponent,
    WebsurveyComponent,
    EditprofiledialogComponent,
    DesignerRegistrationComponent,
    DesignerprivacydialogComponent,
    DesignerTermsdialogogComponent,
    PesuperadminregistrationComponent,
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatCardModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    WebcamModule,
    ScrollingModule,
    AuthRoutingModule,
    MatProgressSpinnerModule,
    MatGoogleMapsAutocompleteModule,
    MatProgressSpinnerModule,
    BackButtonDisableModule.forRoot({
      preserveScrollPosition: true,
    }),
  ],
  providers: [],
})
export class AuthModule {}
