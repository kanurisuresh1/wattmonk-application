import { DesignerRegistrationComponent } from "./designer-registration/designer-registration.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LogoutComponent } from "./logout/logout.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ForgotpasswordComponent } from "./forgotpassword/forgotpassword.component";
import { ResetpasswordComponent } from "./resetpassword/resetpassword.component";
import { ChangepasswordComponent } from "./changepassword/changepassword.component";
import { WebsurveyComponent } from "./websurvey/websurvey.component";
import { EditprofiledialogComponent } from "./editprofiledialog/editprofiledialog.component";
import { PesuperadminregistrationComponent } from "./pesuperadminregistration/pesuperadminregistration.component";

export const AuthRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "login",
        component: LoginComponent,
      },
      {
        path: "register",
        component: RegisterComponent,
      },
      {
        path: "forgotpassword",
        component: ForgotpasswordComponent,
      },
      {
        path: "resetpassword/:code",
        component: ResetpasswordComponent,
      },
      {
        path: "changepassword",
        component: ChangepasswordComponent,
      },
      {
        path: "logout",
        component: LogoutComponent,
      },
      {
        path: "websurvey",
        component: WebsurveyComponent,
      },
      {
        path: "editprofile",
        component: EditprofiledialogComponent,
      },
      {
        path: "designer-registration",
        component: DesignerRegistrationComponent,
      },
      {
        path: "register/pesuperadmin",
        component: PesuperadminregistrationComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(AuthRoutes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
