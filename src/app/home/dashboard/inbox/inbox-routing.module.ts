import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { InboxComponent } from "./inbox/inbox.component";

const inboxroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "messages",
        component: InboxComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(inboxroutes)],
  exports: [RouterModule],
})
export class InboxRoutingModule {}
