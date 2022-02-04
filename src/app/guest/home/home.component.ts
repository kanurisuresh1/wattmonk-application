import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { GenericService } from "src/app/_services";
import { DesigndialogComponent } from "../designdialog/designdialog.component";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    // private commonservice: CommonService,
    private genericService: GenericService
  ) {}

  ngOnInit(): void {
    //API call to fetch charges of Prelim and Permit design request
    // this.commonservice.getCommonSettings().subscribe(
    //   response => {
    //     this.genericService.prelimdesigncharges = response[0].settingvalue;
    //     this.genericService.permitdesigncharges = response[1].settingvalue;
    //     this.genericService.siteproposalcharges = response[3].settingvalue
    //     this.genericService.numberoffreedesign = response[2].settingvalue;
    //     this.opendesigndialog();
    //   }
    // );
    this.genericService.prelimdesigncharges = 35;
    this.genericService.permitdesigncharges = 100;
    this.genericService.siteproposalcharges = 50;
    this.genericService.numberoffreedesign = 1;
    this.opendesigndialog();
  }

  opendesigndialog(): void {
    this.dialog.open(DesigndialogComponent, {
      width: "80%",
      autoFocus: false,
      disableClose: true,
      panelClass: "white-modalbox",
    });
  }
}
