import { Component, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import * as moment from 'moment';
import { GenericService, LoaderService } from 'src/app/_services';
import { CommonService } from 'src/app/_services/common.service';
import { DetaildesignreportComponent } from '../detaildesignreport/detaildesignreport.component';

@Component({
  selector: "app-workstatus",
  templateUrl: "./workstatus.component.html",
  styleUrls: ["./workstatus.component.scss"],
})
export class WorkstatusComponent implements OnInit {
  @ViewChild('matselect') matselect;
  matselectvalue = '';
  workstatusdataResult = []
  teamfilterdata = []
  searchdata: string;
  designdataresponse = -1
  placeholder = false
  isoverviewloading = true
  calenderVariables = [{ name: "Today", value: false }, { name: "Last week", value: false }, { name: "Current Month", value: true },
  { name: "Last Month", value: false }, { name: "Last Quarter", value: false }]
  selectedVariabled = -1

  constructor(
    private commonService: CommonService,
    private bottomsheet: MatBottomSheet,
    private genericService: GenericService,
    private loaderservice: LoaderService
  ) { }

  ngOnInit(): void {
    let currentdate = new Date();
    let startdateobj = new Date();
    startdateobj.setDate(1);
    let startdate = moment(startdateobj).format("YYYY-MM-DD");
    // console.log(startdate);
    let enddate = moment(currentdate).format("YYYY-MM-DD");
    // console.log(enddate);
    this.getworkstatus(startdate, enddate);
  }

  detailreportToggle(element): void {
    this.bottomsheet.open(DetaildesignreportComponent, {
      data: element,
      panelClass: "detaildesignbottomsheet",
      disableClose: true,
    });
  }

  getworkstatus(startdate, enddate): void {
    this.commonService.getWorkStatus(startdate, enddate).subscribe(
      (response) => {
        if (response.length == 0) {
          this.placeholder = true
          this.designdataresponse = -1
        }
        else {
          this.designdataresponse = 0
        }
        this.isoverviewloading = false
        this.workstatusdataResult = response
        this.teamfilterdata = response
        this.workstatusdataResult = this.workstatusdataResult.map((item) => {
          item.mountingtype = this.genericService.getJobTypeName(item.mountingtype)
          return item
        }).sort((design_a, design_b) => {
          let date_A = new Date(design_a.expecteddeliverydate).getTime(),
            date_B = new Date(design_b.expecteddeliverydate).getTime();
          return date_B - date_A;
        })
      },
      () => {
        this.placeholder = true
        this.isoverviewloading = false
      })
  }


  filterusers(value: string): void {
    this.workstatusdataResult = []
    this.teamfilterdata.filter((item) => {
      if (item.filename.toUpperCase().indexOf(value.toUpperCase()) == 0) {
        this.workstatusdataResult.push(item)
      }
    })
  }

  getfilterdata(firstdate, lastdate): void {
    if (firstdate != "" && lastdate != "") {
      this.getworkstatus(firstdate, lastdate)
    }
    else {

    }
  }

  clearcheckboxValue(value, event): void {

    if (this.calenderVariables[value].value) {
      if (!event.currentTarget.checked) {
        this.matselectvalue = '';
        this.selectedVariabled = -1;
        this.selectedcheckboxValue();
      }
      else
        this.selectedVariabled = value;
    }
  }
  clearAll(): void {
    this.loaderservice.show();
    this.calenderVariables.map((item) => item.value = false)
    let currentdate = new Date();
    let startdateobj = new Date();
    startdateobj.setDate(1);
    let startdate = moment(startdateobj).format("YYYY-MM-DD");
    // console.log(startdate);
    let enddate = moment(currentdate).format("YYYY-MM-DD");
    // console.log(enddate);
    this.getworkstatus(startdate, enddate);
    this.matselect.close();
    this.matselectvalue = '';
  }

  checkboxValueChange(num): void {
    this.calenderVariables.map((item, index) => {
      if (index == num) {
        item.value = true;
      }
      else {
        item.value = false;
      }
    })
    this.selectedVariabled = num;
    this.matselect.open();
  }

  selectedcheckboxValue(): void {
    this.loaderservice.show();
    let currentdate = new Date();
    let startdateobj = new Date();
    let enddateobj = new Date();
    let startdate: any;
    let enddate: any;

    switch (this.selectedVariabled) {
      case 0:
        startdate = moment(currentdate).format("YYYY-MM-DD");
        enddate = moment(currentdate).format("YYYY-MM-DD");
        break;
      case 1:
        startdateobj.setDate(currentdate.getDate() - 6);
        startdate = moment(startdateobj).format("YYYY-MM-DD");
        enddate = moment(currentdate).format("YYYY-MM-DD");
        break;
      case 2:
        startdateobj.setDate(1);
        startdate = moment(startdateobj).format("YYYY-MM-DD");
        enddate = moment(currentdate).format("YYYY-MM-DD");
        break;
      case 3:
        startdateobj.setMonth(currentdate.getMonth() - 1);
        startdateobj.setDate(1);
        enddateobj.setMonth(currentdate.getMonth() - 1);
        enddateobj.setDate(this.lastdayofmonth(currentdate.getFullYear(), currentdate.getMonth() - 1));
        startdate = moment(startdateobj).format("YYYY-MM-DD");
        enddate = moment(enddateobj).format("YYYY-MM-DD");
        break;
      case 4:
        startdateobj.setMonth(currentdate.getMonth() - 3);
        startdateobj.setDate(1);
        startdate = moment(startdateobj).format("YYYY-MM-DD");
        enddate = moment(enddateobj).format("YYYY-MM-DD");
        break;

      default:
        startdateobj.setDate(1);
        startdate = moment(startdateobj).format("YYYY-MM-DD");
        enddate = moment(currentdate).format("YYYY-MM-DD");
        break;
    }
    // console.log(startdate);
    // console.log(enddate);
    this.getworkstatus(startdate, enddate);
    this.matselect.close();
  }

  lastdayofmonth(year, month): number {
    return new Date(year, month + 1, 0).getDate();
  }

}
