import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InboxComponent } from "./inbox/inbox/inbox.component";
export const DashboardRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "dashboard",
        loadChildren: () =>
          import("./overview/overview.module").then((m) => m.OverviewModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "prelimdesign",
        loadChildren: () =>
          import("./prelimdesign/design.module").then((m) => m.DesignModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "transaction",
        loadChildren: () =>
          import("./transaction/transaction.module").then(
            (m) => m.TransactionModule
          ),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "withdrawals",
        loadChildren: () =>
          import("./withdraw/withdraw.module").then((m) => m.WithdrawModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "permitdesign",
        loadChildren: () =>
          import("./permitdesign/design.module").then((m) => m.DesignModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "survey",
        loadChildren: () =>
          import("./survey/survey.module").then((m) => m.SurveyModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "pestamp",
        loadChildren: () =>
          import("./pestamp/pestamp.module").then((m) => m.PestampModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "inbox/messages",
        component: InboxComponent,
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "team",
        loadChildren: () =>
          import("./team/team.module").then((m) => m.TeamModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "client",
        loadChildren: () =>
          import("./client/client.module").then((m) => m.ClientModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "coupon",
        loadChildren: () =>
          import("./coupons/coupons.module").then((m) => m.CouponsModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "qualitycheck",
        loadChildren: () =>
          import("./qualitycheck/qualitycheck.module").then(
            (m) => m.QualitycheckModule
          ),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "extras",
        loadChildren: () =>
          import("./extras/extras.module").then((m) => m.ExtrasModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "profile",
        loadChildren: () =>
          import("./profile/profile.module").then((m) => m.ProfileModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "designreport",
        loadChildren: () =>
          import("./designreport/designreport.module").then(
            (m) => m.DesignreportModule
          ),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "archive",
        loadChildren: () =>
          import("./archive/archive.module").then((m) => m.ArchiveModule),
      },
    ],
  },

  {
    path: "",
    children: [
      {
        path: "announcement",
        loadChildren: () =>
          import("./announcement/announcement.module").then(
            (m) => m.AnnouncementModule
          ),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "apps",
        loadChildren: () =>
          import("./apps/apps.module").then((m) => m.AppsModule),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "qualitychecklist",
        loadChildren: () =>
          import("./qualitychecklist/qualitychecklist.module").then(
            (m) => m.QualitychecklistModule
          ),
        // component: QualitychecklistComponent
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "customerdesign",
        loadChildren: () =>
          import("./customerdesign/customerdesign.module").then(
            (m) => m.CustomerdesignModule
          ),
      },
    ],
  },
  {
    path: "",
    children: [
      {
        path: "dataentry",
        loadChildren: () =>
          import("./dataentry/dataentry.module").then((m) => m.DataentryModule),
        // component: QualitychecklistComponent
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(DashboardRoutes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
