import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatMenuTrigger } from '@angular/material/menu';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from 'src/app/_services';
import { ReportService } from 'src/app/_services/report.service';


@Component({
  selector: "app-designstatus",
  templateUrl: "./designstatus.component.html",
  styleUrls: ["./designstatus.component.scss"],
})
export class DesignstatusComponent implements OnInit {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  calenderstartDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1);
  isoverviewloading = true;
  designstatusdataresult = [];
  // ​  designstatusfiltervalue= null;
  designstatusmonthyear = null;

  selectedMonth = new Date().getMonth();
  skip = 0;
  scrolling = true;

  designstatusmonth = [{ name: "January", checked: false }, { name: "February", checked: false }, { name: "March", checked: false }, { name: "April", checked: false },
  { name: "May", checked: false }, { name: "June", checked: false }, { name: "July", checked: false }, { name: "August", checked: false }, { name: "September", checked: false },
  { name: "October", checked: false }, { name: "November", checked: false }, { name: "December", checked: false }]

  totalDesignPanel = [
    { label: 'Sales Proposal', length: 0, icon: 'prelim white' },
    { label: 'Permit Design', length: 0, icon: 'permit white' },
    { label: 'Survey', length: 0, icon: 'survey white' },
    { label: 'PE Stamp', length: 0, icon: 'pe stamp white' }

  ]

  constructor(
    private designService: ReportService,
    public loader: LoaderService,
    // private loaderservice: LoaderService
  ) { }

  ngOnInit(): void {
    this.getdesignstatus();
  }

  getdesignstatus(): void {
    let searchParam = "designstatus?month=" + this.selectedMonth + "&limit=12&skip=" + this.skip;

    this.designService.getdesignStatus(searchParam).subscribe(response => {
      this.scrolling = false;
      this.isoverviewloading = false;
      this.totalDesignPanel = [
        { label: 'Sales Proposal', length: response.Total.prelimcount, icon: 'prelim white' },
        { label: 'Premit Design', length: response.Total.permitcount, icon: 'permit white' },
        { label: 'Survey', length: response.Total.pestampcount, icon: 'survey white' },
        { label: 'PE Stamp', length: response.Total.surveycount, icon: 'pe stamp white' }
      ]

      if (Number(response.Total.prelimcount) || Number(response.Total.permitcount) || Number(response.Total.pestampcount) || Number(response.Total.surveycount)) {
        response.data.map(item => this.designstatusdataresult.push(item));
      }
      this.designstatusmonthyear = response.month + " " + response.year;
      this.designstatusmonth[this.selectedMonth - 1].checked = true;
    })
    // if( this.designstatusfiltervalue != null){
    //   if(this.designstatusfiltervalue == response.month){
    //     this.totalDesignPanel = [
    //       {label:'Prelim Design', length: response.Total.prelimcount, icon:'prelim white'},
    //       { label:'Premit Design', length: response.Total.permitcount, icon:'permit white' },
    //       { label:'Survey', length: response.Total.pestampcount, icon:'survey white' },
    //       { label:'PE Stamp', length: response.Total.surveycount, icon:'pe stamp white' }

    //     ]
    //     this.designstatusdataresult = response.data
    //     this.designstatusmonthyear = response.month+" "+ response.year
    //   }
    //   else{
    //     this.totalDesignPanel = [
    //       {label:'Prelim Design', length: 0, icon:'prelim white'},
    //       { label:'Permit Design', length: 0, icon:'permit white' },
    //       { label:'Survey', length: 0, icon:'survey white' },
    //       { label:'PE Stamp', length: 0 , icon:'pe stamp white' } 
    //     ]
    //     this.designstatusdataresult = []
    //     this.designstatusmonthyear = ' '
    //   }
    // }
    // else{
    //   this.totalDesignPanel = [
    //     {label:'Prelim Design', length: response.Total.prelimcount, icon:'prelim white'},
    //     { label:'Premit Design', length: response.Total.permitcount, icon:'permit white' },
    //     { label:'Survey', length: response.Total.pestampcount, icon:'survey white' },
    //     { label:'PE Stamp', length: response.Total.surveycount, icon:'pe stamp white' }
    //   ]
    //   this.designstatusdataresult = response.data
    //   this.designstatusmonthyear = response.month+" "+ response.year
    //   this.designstatusmonth.filter(item =>{ if(response.month == item.name){
    //     item.checked = false
    //   }

    // })
    // }
    // })
  }

  designstatuscheckboxvalue(value, index): void {
    // this.loaderservice.show();
    this.skip = 0;
    this.designstatusmonth.filter(item => {
      if (item.name == value) {
        item.checked = true
      }
      else {
        item.checked = false
      }
    });
    // this.designstatusfiltervalue = value;
    this.designstatusdataresult = [];
    this.selectedMonth = index + 1;
    this.getdesignstatus();
  }

  calenderValue(event: MatDatepickerInputEvent<Date>): void {
    const downloadDate = formatDate(event.toString(), 'yyyy-MM-dd', 'en-US');

    this.designService.getdailyreport(downloadDate).subscribe(response => {
      window.open(response.data, "_blank");
    });
    this.trigger.closeMenu();
  }

  onScroll(): void {
    this.scrolling = true;
    this.loader.isLoading = new BehaviorSubject<boolean>(false);
    this.skip += 10;
    this.getdesignstatus();
  }
}
