import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EventEmitterService } from 'src/app/_services/event-emitter.service';
@Component({
  selector: "app-designreport",
  templateUrl: "./designreport.component.html",
  styleUrls: ["./designreport.component.scss"],
})


export class DesignreportComponent implements OnInit {
  designdata: any[] = [];

  dataSource = new MatTableDataSource<any>(this.designdata);
  selectedToggleButtonVal = "designtrackerbutton"
  designtrackerselected = true
  designStatusSelected = false
  workstatusselcted = false


  minDate: Date
  isLoader = false;
  designstatusmonth = [{ name: "January", checked: false }, { name: "February", checked: false }, { name: "March", checked: false }, { name: "April", checked: false },
  { name: "May", checked: false }, { name: "June", checked: false }, { name: "July", checked: false }, { name: "August", checked: false }, { name: "September", checked: false },
  { name: "October", checked: false }, { name: "November", checked: false }, { name: "December", checked: false }]
  designstatusfiltervalue = null
  designstatusmonthyear = null

  fromdate = new FormControl("", [
    Validators.required
  ]);
  todate = new FormControl("", [Validators.required])

  workstatusform: FormGroup;


  totalDesignPanel = [
    { label: 'Prelim Design', length: 0, icon: 'prelim white' },
    { label: 'Premit Design', length: 0, icon: 'permit white' },
    { label: 'Survey', length: 0, icon: 'survey white' },
    { label: 'PE Stamp', length: 0, icon: 'pe stamp white' }

  ]

  date: string;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private eventEmitterService: EventEmitterService
  ) {
    this.minDate = new Date();
    this.workstatusform = new FormGroup({
      fromdate: this.fromdate,
      todate: this.todate,
    });
    // this.todate.patchValue(this.genericService.formatDateInCalendarPickerFormat(new Date().getFullYear() + "-" + new Date().getMonth() + "-30"))
    // this.fromdate.patchValue(this.genericService.formatDateInCalendarPickerFormat(new Date().getFullYear() + "-" + new Date().getMonth() + "-01"))
  }

  ngOnInit(): void {
    // do nothing.
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public onValChange(val: string): void {

    this.selectedToggleButtonVal = val;
    if (val == "workstatusbutton") {
      this.workstatusselcted = true
      this.designStatusSelected = false
      this.designtrackerselected = false
    }
    else if (val == "designtrackerbutton") {
      this.designtrackerselected = true
      this.workstatusselcted = false
      this.designStatusSelected = false
    }
    else if (val == "designstatusbutton") {
      this.eventEmitterService.onDesignTrackerRefresh(true);
      this.designStatusSelected = true
      this.workstatusselcted = false
      this.designtrackerselected = false
    }
  }
  callTracker(): void {
    this.eventEmitterService.onDesignTrackerRefresh(true);
  }
}
