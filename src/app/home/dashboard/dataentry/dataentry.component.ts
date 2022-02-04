import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-dataentry",
  templateUrl: "./dataentry.component.html",
  styleUrls: ["./dataentry.component.scss"],
})
export class DataentryComponent implements OnInit {
  selectedToggleButtonVal = "modulemake";
  ismodulemaketab = true;
  ismodulemodeltab = false;
  isinvertermaketab = false;
  isinvertermodeltab = false;
  constructor() {
    //do nothing
  } 
  ngOnInit(): void {
    //do nothing
  }

  onTabChange(tabvalue): void {
    // console.log(tabvalue);
    this.ismodulemaketab = false;
    this.ismodulemodeltab = false;
    this.isinvertermaketab = false;
    this.isinvertermodeltab = false;
    switch (tabvalue) {
      case "modulemake":
        this.ismodulemaketab = true;
        break;

      case "modulemodel":
        this.ismodulemodeltab = true;
        break;

      case "invertermake":
        this.isinvertermaketab = true;
        break;

      case "invertermodel":
        this.isinvertermodeltab = true;
        break;
    }
  }
}
