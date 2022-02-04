import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MaintenanceviewComponent } from "./shared/maintenanceview/maintenanceview.component";

const AppRoutes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadChildren: () => import("./home/home.module").then((m) => m.HomeModule),
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "guest",
    loadChildren: () =>
      import("./guest/guest.module").then((m) => m.GuestModule),
  },
  {
    path: "probability",
    loadChildren: () =>
      import("./probability/probability.module").then(
        (m) => m.ProbabilityModule
      ),
  },
  {
    path: "maintenance",
    component: MaintenanceviewComponent,
  },
];

// const config: ExtraOptions = {
//   useHash: false
// };

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes, { anchorScrolling: "enabled" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
