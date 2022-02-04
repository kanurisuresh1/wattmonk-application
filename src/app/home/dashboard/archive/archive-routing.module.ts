import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ArchiveComponent } from "./archive/archive.component";

const Archiveroutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "overview",
        component: ArchiveComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(Archiveroutes)],
  exports: [RouterModule],
})
export class ArchiveRoutingModule {}
