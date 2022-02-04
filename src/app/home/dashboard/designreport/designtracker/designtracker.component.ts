import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from "@angular/core";
import { MatSelectChange } from "@angular/material/select";
import axios from "axios";
import * as Chart from "chart.js";
import { ChartDataSets, ChartOptions, ChartType } from "chart.js";
import * as moment from "moment";
import { Color, Label, MultiDataSet } from "ng2-charts";
import { Company } from "src/app/_models/company";
import { LoaderService } from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { GenericService } from "src/app/_services/generic.service";
import { NotificationService } from "src/app/_services/notification.service";
import { ReportService } from "src/app/_services/report.service";

const baseConfigskeleton: Chart.ChartConfiguration = {
  type: "doughnut",
  options: {
    // rotation: 20.4,
    // cutoutPercentage: 60,
    legend: {
      display: false,
      position: "left",
    },
    tooltips: {
      enabled: true,
      //position: "left",
    },

    elements: {},
  },
};
const baseConfig: Chart.ChartConfiguration = {
  type: "doughnut",
  options: {
    // rotation: 20.4,
    // cutoutPercentage: 60,
    legend: {
      display: false,
      position: "left",
    },
    tooltips: {
      enabled: true,
      // position: "left",
    },
    elements: {},
  },
};
@Component({
  selector: "app-designtracker",
  templateUrl: "./designtracker.component.html",
  styleUrls: ["./designtracker.component.scss"],
})
export class DesigntrackerComponent implements OnInit, AfterViewInit {
  @ViewChild("matselect") matselect;
  @ViewChildren("charts", { read: ElementRef }) canvas: QueryList<ElementRef>;
  @ViewChildren("charts1", { read: ElementRef }) canvas1: QueryList<ElementRef>;
  selectedCompanies: any = [];

  skeletonArray = [
    {
      label: "Probability",
      datasets: [
        {
          data: [15, 5, 50, 10, 20],
          backgroundColor: [
            "7E7E7E",
            "#AAAAAA",
            "#C1C1C1",
            "#FFFFFF",
            "#616161",
          ],
        },
      ],
    },
    {
      label: "Probability",
      datasets: [
        {
          data: [15, 5, 50, 10, 20],
          backgroundColor: [
            "7E7E7E",
            "#AAAAAA",
            "#C1C1C1",
            "#FFFFFF",
            "#616161",
          ],
        },
      ],
    },
  ];
  chart: any;
  total: number;
  selected: string;
  totalcount: number;
  totaldelivereddesign: number;
  prodavgtime: number;
  qcavgtime: string;
  quality: number;
  isUserInput: boolean;
  Auroraavgtime: number;
  pickerDate: any;
  months: any;
  year: any;
  // yearselector: any;
  donutchartdata;
  companyList = [];
  barChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      display: false,
    },
    scales: {
      yAxes: [
        {
          display: true,
          ticks: {
            beginAtZero: true,
            suggestedMin: 0,
            suggestedMax: 500,
            stepSize: 100,
          },
        },
      ],
    },
    tooltips: {
      backgroundColor: "#edc773",
      callbacks: {
        title: function (tooltipItems) {
          //Return value for titles
          //return (tooltipItems[0].xLabel.toString().replace(/[(]/g, ':').replace(/[)]/g, ''));
          // return (tooltipItems[0].yLabel.toString());
          return (
            tooltipItems[0].xLabel.toString() +
            ":" +
            tooltipItems[0].yLabel.toString()
          );
        },
        label: () => null,
      },
    },
  };
  monthlybarChartLabels: Label[] = [];
  yearlybarChartLabels: Label[] = [];
  barChartLabels: Label[] = [];
  barChartType: ChartType = "bar";
  barChartLegend = true;
  barChartPlugins = [];
  temp = [];
  temp1 = [];
  counts = [];
  qualityper = [];
  selectedOption = [];
  barChartData: ChartDataSets[] = [];
  graphData = [];
  barChartColors: Color[] = [
    {
      backgroundColor: "#EDC773",
    },
  ];
  // searchDate: any;
  data = [];
  names: string;
  modeselect: string;
  doughnutChartLabels: Label[] = ["", "", ""];
  doughnutChartData: MultiDataSet = [[55, 25, 20]];
  doughnutChartType: ChartType = "doughnut";
  monthlygraph: boolean = true;
  yearlygraph: boolean = false;
  currentYear = parseInt(new Date().getFullYear().toString());
  totalCount = 0;
  years = [];
  prev = "";
  next = "";
  clientData = [];
  totalProjects;
  totalClients;
  selectedMonth;
  end;
  matselectvalue = "";
  companies: Company[];
  checkstatus: boolean = false;
  limit = 12;
  skip = 0;
  list_start = 0;
  scrolling: boolean;
  isLoading = false;
  isDataloading: false;

  constructor(
    private commonservice: CommonService,
    private genericService: GenericService,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private notifyService: NotificationService,
    private reportservice: ReportService,
    private loaderservice: LoaderService
  ) { }

  ngOnInit(): void {
    let today = new Date();
    this.months = (today.getMonth() + 1).toString();
    this.year = today.getFullYear().toString();
    // this.pickerDate = cMonth + " " + cYear
    this.getdesigntrackreport();
    this.getProductionAvragedata();
    this.getCompanies();
    this.getGraphData("monthly", this.currentYear);
    this.eventEmitterService.designTrackerRefresh.subscribe(() => {
      this.checkstatus = false;
      this.getdesigntrackreport();
    });
  }
  ngAfterViewInit(): void {
    if (this.totalCount == 0) {
      this.barChartOptions.scales.yAxes[0].ticks.suggestedMax = 500;
    } else {
      this.barChartOptions.scales.yAxes[0].ticks.suggestedMax = this.totalCount;
    }
    //this.eventEmitterService.onDesignTrackerRefresh(this.checkstatus);
    this.canvas1.map((chartElementRef, index) => {
      const config = Object.assign({}, baseConfigskeleton, {
        data: this.skeletonArray[index],
      });
      return new Chart(chartElementRef.nativeElement, config);
    });
  }

  //   inputEvent(event){
  //     this.pickerDate = moment(event.value).format('MMM-YYYY');
  //     console.log("mmm", this.pickerDate);
  //     console.log(event.value);
  // }
  changeEvent(): void {
    this.donutchartdata.datasets = undefined;
    this.donutchartdata.labels = undefined;
    this.changeDetectorRef.detectChanges();
    this.getdesigntrackreport();
    this.getProductionAvragedata();
    this.changeDetectorRef.detectChanges();
    // this.pickerDate = moment(event.value).format('MMM-YYYY');
    // console.log("nnn", this.pickerDate);
    //   console.log(event.value);
  }

  changeEventnew(): void {
    this.isLoading = true;
    this.clientData = [];
    //this.totalProjects = 0;
    //this.totalClients = 0;
    this.getClientData();
  }

  changeEventbyyear(): void {
    this.isLoading = true;
    // this.getdesigntrackreportbyyear();
  }

  getCompanies(): void {
    this.commonservice.getCompanies().subscribe(
      (response) => {
        this.isLoading = false;
        this.genericService.companies = response;
        this.companies = response;
        this.companies.forEach((ele) => {
          this.companyList.push({
            id: ele.companyid,
            name: ele.companyname,
            value: false,
          });
        });
        //this.changeDetectorRef.detectChanges();
      },
      () => {
        // do nothing.
      }
    );
  }
  ShowGraph(data): void {
    // this.barChartData = [];
    let activeButton = "";
    if (data == "monthly") {
      this.yearlygraph = false;
      this.monthlygraph = true;
      // this.getGraphData(data,this.currentDate);
      activeButton = data;
    }
    if (data == "yearly") {
      this.monthlygraph = false;
      this.yearlygraph = true;
      // this.getGraphData(data);
      activeButton = data;
    }
    this.getGraphData(activeButton, this.currentYear);
  }

  getClientData(): void {
    const mon = this.months;
    const yr = this.year;

    // this.clientData = [];
    let isFilter: boolean;

    if (this.selectedCompanies.length != 0) {
      isFilter = true;
    } else {
      isFilter = false;
    }
    const body = {
      user: this.selectedCompanies,
    };
    this.commonservice
      .getClientData(yr, mon, body, this.list_start, this.limit, isFilter)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.totalProjects = response.totalprojects;
          this.totalClients = response.totalclient;
          this.selectedMonth = response.month + "," + response.year;
          response.data.forEach((element) => {
            this.clientData.push(element);
          });
          this.scrolling = false;
          //this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  getGraphData(data, year?): void {
    this.commonservice
      .getDesigenTrackerGraph(data, year)
      .subscribe((response) => {
        this.barChartLabels = [];
        this.barChartData = [];
        this.graphData = [];
        const gData = [];
        let count;
        this.totalCount = 0;
        this.isLoading = false;
        if (response.years != undefined || response.years != null) {
          this.years = response.years;
          this.end = this.years.length - 1;
        }

        for (let [key, val] of Object.entries(response.data)) {
          if (data == "monthly") {
            this.barChartLabels.push(
              key.charAt(0).toUpperCase() + key.slice(1)
            );
            count = val;
            this.totalCount = this.totalCount + parseInt(count);
            gData.push(val);
            //this.barChartData.push(val);
          }
          if (data == "yearly") {
            this.barChartLabels.push(key);
            count = val;
            this.totalCount = this.totalCount + parseInt(count);
            gData.push(val);
          }
        }
        this.graphData.push({
          data: gData,
          backgroundColor: "#edc773",
          barThickness: 30,
        });
        this.barChartData = this.graphData;
        // this.changeDetectorRef.detectChanges();
        // console.log("Barchart:",this.barChartData);
      });
  }
  onNext(): void {
    const cYear = this.currentYear;
    this.years.map((item, index) => {
      if (item == cYear) {
        if (index == this.end) {
          this.currentYear = this.years[index];
        } else {
          this.currentYear = this.years[index + 1];
        }
      }
    });
    this.getGraphData("monthly", this.currentYear);
  }
  onPrev(): void {
    this.years.map((item, index) => {
      if (item == this.currentYear) {
        if (index == 0) {
          this.currentYear = this.years[0];
        } else {
          this.currentYear = this.years[index - 1];
          // console.log("index:",item);
        }
      }
    });
    this.getGraphData("monthly", this.currentYear);
  }
  showClients(): void {
    this.isLoading = true;
    this.checkstatus = true;
    this.matselectvalue = "";
    this.selectedCompanies = [];
    this.clientData = [];
    this.getClientData();
    if (this.genericService.companies == undefined) {
      this.getCompanies();
    } else {
      this.companies = this.genericService.companies;
    }
  }

  clearAll(): void {
    this.isLoading = true;
    this.companyList.map((item) => (item.value = false));
    this.matselect.close();
    this.matselectvalue = "";
    this.selectedCompanies = [];
    this.clientData = [];
    this.getClientData();
  }
  selectedcheckboxValue(): void {
    this.isLoading = true;

    this.clientData = [];
    this.getClientData();
    this.matselect.close();
  }
  checkboxValueChange(num): void {
    this.companyList.map((item, index) => {
      if (index == num) {
        item.value = true;
      } else {
        item.value = false;
      }
    });
    this.matselect.open();
  }
  onClientListScroll(): void {
    this.scrolling = true;
    this.list_start += 12;
    this.getClientData();
  }
  // doughnutChartLabels: Label[] = ['', '', ''];
  // doughnutChartData: MultiDataSet = [
  //   [55, 25, 20]
  // ];
  // doughnutChartType: ChartType = 'doughnut';

  closeDatePicker(event): void {
    this.pickerDate = moment(event).format("MMM-YYYY");

    //this.datePicker.close();
  }

  getdesigntrackreport(): void {
    // let currentDate = new Date();
    //let month = currentDate.getMonth()+1;
    const month = this.months;
    const year = this.year;
    this.reportservice.designtrackerreport(month, year).subscribe(
      (response) => {
        this.total = response.total;
        const othettotal = response.othercount;
        this.isLoading = false;
        const mymap = response.data;
        this.temp = Object.keys(mymap)
          .sort((a, b) => mymap[b] - mymap[a])
          .slice(0, 5);

        this.counts = this.temp.map((key) => mymap[key].count);
        this.qualityper = this.temp.map((key) => mymap[key].quality);

        this.donutchartdata = {
          labels: [
            [this.temp[0], [" Quality: " + this.qualityper[0]]],
            [this.temp[1], [" Quality: " + this.qualityper[1]]],
            [this.temp[2], [" Quality: " + this.qualityper[2]]],
            [this.temp[3], [" Quality: " + this.qualityper[3]]],
            [this.temp[4], [" Quality: " + this.qualityper[4]]],
            "Others",
          ],

          datasets: [
            {
              data: [
                this.counts[0],
                this.counts[1],
                this.counts[2],
                this.counts[3],
                this.counts[4],
                othettotal,
              ],

              backgroundColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 205, 86)",
                "rgb(255,0,0)",
                "rgb(124,252,0)",
                "rgba(118, 183, 172, 1)",
              ],
              fill: true,
            },
          ],

          // data: {
          //   datasets:[{
          //     data: [this.counts[0], this.counts[1],this.counts[2],this.counts[3],this.counts[4]],
          //     backgroundColor: [
          //       '#00205A',
          //       '#97BAFF',
          //       '#D9D9D9',
          //       '#00205A',
          //       '#747474',
          //     ],
          //     labels: [
          //       'Count', 'Count', 'Count', 'Count', 'Count',]
          //   },{
          //     data: [this.qualityper[0],this.qualityper[1],this.qualityper[2],this.qualityper[3],this.qualityper[4]],
          //     backgroundColor: [
          //       '#00205A',
          //       '#747474',
          //     ],
          //     labels: [
          //       'Quality', 'Quality', 'Quality', 'Quality', 'Quality',
          //     ],
          //   }

          // ] }
        }


        this.changeDetectorRef.detectChanges();
        this.getdesigntrackreportnew();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  // getdesigntrackreportbyyear(){
  //   let currentDate = new Date();
  //   //let month = currentDate.getMonth()+1;
  //   let selectedyr = this.yearselector
  //   this.reportservice.designtrackerreportbyyear(selectedyr).subscribe(
  //     response => {
  //         this.total = response.total;
  //       let mymap = response.data;
  //       this.temp = Object.keys(mymap)
  // .sort((a, b) => mymap[b] - mymap[a])
  // .slice(0, 5);
  //   this.counts = this.temp.map(key => mymap[key]);
  //   this.donutchartdata =  {
  //       labels: [this.temp[0], this.temp[1],this.temp[2],this.temp[3],this.temp[4]],
  //       datasets: [
  //         {
  //           data: [this.counts[0],this.counts[1],this.counts[2],this.counts[3],this.counts[4]],
  //           backgroundColor: [ 'rgb(255, 99, 132)','rgb(54, 162, 235)','rgb(255, 205, 86)','rgb(255,0,0)','rgb(124,252,0)'],
  //           fill: true,
  //         },
  //       ],
  //     },
  //   this.changeDetectorRef.detectChanges();
  //   this.getdesigntrackreportnew();

  //     },
  //     error => {
  //       this.notifyService.showError(error, "Error");
  //     }
  //   );

  // }

  getdesigntrackreportnew(): void {
    this.canvas.map((chartElementRef) => {
      const config = Object.assign({}, baseConfig, {
        data: this.donutchartdata,
      });
      return new Chart(chartElementRef.nativeElement, config);
    });
    this.changeDetectorRef.detectChanges();
  }

  getProductionAvragedata(): void {
    this.isLoading = true;
    const month = this.months;
    const year = this.year;
    const isFilter: boolean = false;

    this.reportservice
      .designtrackerreportnew(isFilter, year, month)
      .subscribe((response) => {
        //  console.log("rrr",response);
        this.data = response.data;
        this.isLoading = false;

        this.selected = this.data[0].clientname;
        this.totalcount = this.data[0].totalcount;
        this.totaldelivereddesign = this.data[0].totaldelivereddesigns;
        this.prodavgtime = this.data[0].prodavgtime;
        this.qcavgtime = this.data[0].qcavgtime;
        this.quality = this.data[0].quality;
        this.Auroraavgtime = this.data[0].auroraavgtime;
      });
  }

  dropdownchange(event: MatSelectChange, item: any): void {
    if (event.source.selected) {
      this.totalcount = item.totalcount;
      this.totaldelivereddesign = item.totaldelivereddesigns;
      this.prodavgtime = item.prodavgtime;
      this.qcavgtime = item.qcavgtime;
      this.quality = item.quality;
      this.Auroraavgtime = item.auroraavgtime;
    }
  }
  downloadReport(): void {
    this.loaderservice.show();
    this.commonservice.downloadExcel().subscribe(
      (response: any) => {
        this.loaderservice.hide();
        const fileurl = response.data;
        const filename = "DesignTrackerReport .xlsx";
        axios({
          url: fileurl,
          //url: fileurl,
          method: "GET",
          responseType: "blob",
        }).then(
          (response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
          },
          () => {
            // do nothing.
          }
        );
      },
      () => {
        this.loaderservice.hide();
      }
    );
  }
}
