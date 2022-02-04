import { HttpClient } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import * as Chart from "chart.js";
import { BehaviorSubject } from "rxjs";
import { CustomerprobabilityformComponent } from "src/app/probability/customerprobabilityform/customerprobabilityform.component";
import { ProbabilitydetaildialogComponent } from "src/app/probability/probabilitydetaildialog/probabilitydetaildialog.component";
import { User } from "src/app/_models";
import { Probability } from "src/app/_models/probability";
import { UserSetting } from "src/app/_models/usersettings";
import {
  AuthenticationService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { ProbabilityService } from "src/app/_services/probability.service";
import { AddminpermitdesigndialogComponent } from "../../permitdesign/addminpermitdesigndialog/addminpermitdesigndialog.component";
import { AdddesigndialogComponent } from "../../prelimdesign/adddesigndialog/adddesigndialog.component";
import { AddprelimproposaldialogComponent } from "../../prelimdesign/addprelimproposaldialog/addprelimproposaldialog.component";
import { AddsurveydialogComponent } from "../../survey/addsurveydialog/addsurveydialog.component";

const baseConfigSkeleton: Chart.ChartConfiguration = {
  type: "doughnut",
  options: {
    rotation: 20.4,
    cutoutPercentage: 60,
    tooltips: {
      enabled: false,
    },
    hover: {
      mode: null,
    },
  },
};

const baseConfig: Chart.ChartConfiguration = {
  type: "doughnut",
  options: {
    rotation: 20.4,
    cutoutPercentage: 60,
    legend: {
      display: false,
    },

    // tooltips: {
    //   enabled: false
    // },
    // hover: {
    //   mode: null
    // }
  },
};

@Component({
  selector: "app-customerdesign",
  templateUrl: "./customerdesign.component.html",
  styleUrls: ["./customerdesign.component.scss"],
})
export class CustomerdesignComponent implements OnInit {
  @ViewChildren("doughnutCanvas", { read: ElementRef })
  doughnutCanvas: QueryList<ElementRef>;
  @ViewChildren("doughnutCanvas1", { read: ElementRef })
  doughnutCanvas1: QueryList<ElementRef>;

  searcharchive = "";
  iscustomerdesignslistloading = true;
  selectedSliceLabel = "Customer Probability";
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

  loggedInUser: User;

  allcustomerslist: Probability[] = [];
  limit = 10;
  skip = 0;
  scrolling = false;
  issearchapplied = false;
  allcustomers: any;
  probabilitypercentage: number;
  chartarray: any = [];
  ipAddress: any;
  selectedindex: number;
  usersettings: UserSetting;
  showdetails = false;
  cardindex: any;
  defaultvalue = "N/A";

  constructor(
    private probabilityService: ProbabilityService,
    private dialog: MatDialog,
    private authService: AuthenticationService,
    private cdr: ChangeDetectorRef,
    private notifyService: NotificationService,
    private loader: LoaderService,
    private http: HttpClient
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
    this.usersettings = JSON.parse(localStorage.getItem("usersettings"));
  }

  ngOnInit(): void {
    this.getIPAddress();
    // this.getCustomerProbabilityData();
  }

  ngAfterViewInit(): void {
    this.skeletonChart();
  }

  skeletonChart(): void {
    this.doughnutCanvas.map((chartElementRef, index) => {
      const config = Object.assign({}, baseConfigSkeleton, {
        data: this.skeletonArray[index],
      });
      return new Chart(chartElementRef.nativeElement, config);
    });
  }

  getCustomerProbabilityData(): void {
    this.probabilityService
      .getCustomerProbabilityData(
        this.loggedInUser.parent.id,
        this.limit,
        this.skip,
        this.ipAddress
      )
      .subscribe(
        (res: any) => {
          this.iscustomerdesignslistloading = false;
          if (res) {
            this.chartarray = [];
            this.allcustomers = res;
            this.scrolling = false;
            this.allcustomers.map((item) => {
              this.allcustomerslist.push(item);
            });
            this.allcustomerslist.forEach((res: any) => {
              // if(res.name!="" && res.email!=""&& res.address!=""&&res.phone!=null){
              const chartvalue: any = [];
              if (
                res.name != null &&
                res.email != null &&
                res.phone != null &&
                res.address != null
              ) {
                if (res.probability && res.probabilityscore > 0) {
                  res.probability.forEach((res) => {
                    chartvalue.push(res.percentage);
                  });
                  this.chartarray.push({
                    datasets: [
                      {
                        data: chartvalue,
                        backgroundColor: [
                          // '#F9BA48',
                          // '#FB4B40',
                          // '#FF823C',
                          // '#edc773',
                          // '#FFEDC6'
                          "#FF823C",
                          "#F9BA48",
                          "#edc773",
                          "#FB4B40",
                        ],
                      },
                    ],
                    // labels: ['State', 'Other', 'City', 'Zip Postal', '']
                    labels: [
                      res.probability[0].cc,
                      res.probability[1].cc,
                      res.probability[2].cc,
                      res.probability[3].cc,
                    ],
                  });
                } else {
                  this.chartarray.push({
                    datasets: [
                      {
                        data: [0.01],
                        backgroundColor: ["#FFEDC6"],
                      },
                    ],
                    labels: [""],
                  });
                }
              }
              // }
            });
            this.cdr.detectChanges();
            this.loadChart();
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  getCustomerProbabilitySearchData(): void {
    this.probabilityService
      .getCustomerProbabilitySearchData(
        this.loggedInUser.parent.id,
        this.limit,
        this.skip,
        this.searcharchive,
        // this.ipAddress
      )
      .subscribe(
        (res: any) => {
          this.scrolling = false;
          if (res) {
            this.chartarray = [];
            this.allcustomers = res;
            this.allcustomers.map((item) => {
              this.allcustomerslist.push(item);
            });
            this.iscustomerdesignslistloading = false;
            // this.allcustomerslist.forEach((res) => {
            //   let chartvalue:any=[];
            //   if(res.probability){
            //   res.probability.forEach((res)=>{
            //     chartvalue.push(res.percentage);
            //   })
            // }
            //   this.chartarray.push({
            //     label: 'Probability',
            //     datasets: [{

            //       data: chartvalue,
            //       backgroundColor: [
            //         '#F9BA48',
            //         '#FB4B40',
            //         '#FF823C',
            //         '#edc773',
            //         '#FFEDC6'
            //       ],
            //     }],
            //     labels: ['State', 'Other', 'City', 'Zip Postal','']
            //   });
            //    this.probabilitypercentage = res.probabilityscore;
            // })
            this.allcustomerslist.forEach((res: any) => {
              // if(res.name!="" && res.email!=""&& res.address!=""&&res.phone!=null){
              const chartvalue: any = [];
              if (
                res.name != null &&
                res.email != null &&
                res.phone != null &&
                res.address != null
              ) {
                if (res.probability && res.probabilityscore > 0) {
                  res.probability.forEach((res) => {
                    chartvalue.push(res.percentage);
                  });
                  this.chartarray.push({
                    datasets: [
                      {
                        data: chartvalue,
                        backgroundColor: [
                          "#FF823C",
                          "#F9BA48",
                          "#edc773",
                          "#FB4B40",
                        ],
                      },
                    ],
                    labels: [
                      res.probability[0].cc,
                      res.probability[1].cc,
                      res.probability[2].cc,
                      res.probability[3].cc,
                    ],
                  });
                } else {
                  this.chartarray.push({
                    datasets: [
                      {
                        data: [100],
                        backgroundColor: ["#FFEDC6"],
                      },
                    ],
                    labels: [""],
                  });
                }
              }
              // }
            });
            this.cdr.detectChanges();
            this.loadChart();
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
  }

  loadChart(): void {
    this.doughnutCanvas1.map((chartElementRef, index) => {
      const config = Object.assign({}, baseConfig, {
        data: this.chartarray[index],
      });
      return new Chart(chartElementRef.nativeElement, config);
    });
    this.cdr.detectChanges();
  }

  //** on searching in input fields same function is use */
  searchinputArchives(): void {
    this.issearchapplied = true;
    this.allcustomers.length = 0;
    this.allcustomerslist.length = 0;
    this.skip = 0;
    this.iscustomerdesignslistloading = true;
    this.cdr.detectChanges();
    this.skeletonChart();
    this.getCustomerProbabilitySearchData();
  }
  clearinputfields(): void {
    this.searcharchive = "";
    this.issearchapplied = false;
    this.allcustomers.length = 0;
    this.allcustomerslist.length = 0;
    this.skip = 0;
    this.iscustomerdesignslistloading = true;
    this.cdr.detectChanges();
    this.skeletonChart();
    this.getCustomerProbabilityData();
  }

  openCustomerProbabilityForm(): void {
    const dialogRef = this.dialog.open(CustomerprobabilityformComponent, {
      width: "40%",
      autoFocus: false,
      disableClose: true,
      height: "90%",
      // panelClass: 'white-modalbox',
      backdropClass: "blur-effect-form",
      data: {
        customer: null,
        isEditMode: false,
        devicecount: null,
      },
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      // this.allcustomerslist.push(res);
      if (res) {
        this.notifyService.showSuccess(
          "Customer Probability has been generated successfully.",
          "Success"
        );
        this.iscustomerdesignslistloading = true;
        this.allcustomerslist = [];
        this.allcustomers = [];
        this.skip = 0;
        this.getCustomerProbabilityData();
        // this.allcustomerslist.splice(0, 0, res);
        // this.allcustomerslist = [...this.allcustomerslist];

        // this.allcustomerslist.forEach((res:any) => {
        //   // if(res.name!="" && res.email!=""&& res.address!=""&&res.phone!=null){
        //   let chartvalue:any=[];
        //   if(res.probability){
        //   res.probability.forEach((res)=>{
        //     chartvalue.push(res.percentage);
        //   })
        // }
        //   this.chartarray.push({
        //     datasets: [{
        //       data: chartvalue,
        //       backgroundColor: [
        //         '#F9BA48',
        //         '#FB4B40',
        //         '#FF823C',
        //         '#edc773',
        //         '#FFEDC6'
        //       ],
        //     }],
        //     labels: ['State', 'Other', 'City', 'Zip Postal','']
        //   });
        //   // }
        //   this.probabilitypercentage = res.probabilityscore;
        // })
        // this.cdr.detectChanges();
        // this.loadChart();
      }
    });
  }

  openProbabilityDetailDialog(): void {
    this.dialog.open(ProbabilitydetaildialogComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      // panelClass: 'white-modalbox',
      backdropClass: "blur",
    });
  }

  onScroll(): void {
    if (!this.issearchapplied) {
      this.loader.isLoading = new BehaviorSubject<boolean>(false);
      this.skip += 10;
      this.scrolling = true;
      this.getCustomerProbabilityData();
    }
    if (this.issearchapplied) {
      this.skip += 10;
      this.scrolling = true;
      this.getCustomerProbabilitySearchData();
    }
  }

  openDesignsForms(value, customer): void {
    if (value == "siteassessment") {
      const dialogRef = this.dialog.open(AdddesigndialogComponent, {
        width: "80%",
        autoFocus: false,
        disableClose: true,
        data: { isCustomer: true, customerassessment: customer },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res.design) {
          this.skip = 0;
          this.allcustomerslist = [];
          this.allcustomers = [];
          // this.chartarray = [];
          this.iscustomerdesignslistloading = true;
          this.getCustomerProbabilityData();
        }
      });
    } else if (value == "salesproposal") {
      const dialogRef = this.dialog.open(AddprelimproposaldialogComponent, {
        width: "80%",
        autoFocus: false,
        disableClose: true,
        data: { isCustomer: true, customerproposal: customer },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res.design) {
          this.skip = 0;
          this.allcustomerslist = [];
          this.allcustomers = [];
          // this.chartarray = [];
          this.iscustomerdesignslistloading = true;
          this.getCustomerProbabilityData();
        }
      });
    } else if (value == "survey") {
      const dialogRef = this.dialog.open(AddsurveydialogComponent, {
        width: "80%",
        autoFocus: false,
        disableClose: true,
        data: { isCustomer: true, customersurvey: customer },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res.survey) {
          this.skip = 0;
          this.allcustomerslist = [];
          this.allcustomers = [];
          // this.chartarray = [];
          this.iscustomerdesignslistloading = true;
          this.getCustomerProbabilityData();
        }
      });
    } else if (value == "permit") {
      const dialogRef = this.dialog.open(AddminpermitdesigndialogComponent, {
        width: "80%",
        autoFocus: false,
        disableClose: true,
        data: { isCustomer: true, customerpermit: customer },
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res.design) {
          this.skip = 0;
          this.allcustomerslist = [];
          this.allcustomers = [];
          // this.chartarray = [];
          this.iscustomerdesignslistloading = true;
          this.getCustomerProbabilityData();
        }
      });
    }
  }

  getIPAddress(): void {
    this.http.get("https://api.ipify.org/?format=json").subscribe(
      (res: any) => {
        this.ipAddress = res.ip;

        this.getCustomerProbabilityData();
      },
      () => {
        this.getCustomerProbabilityData();
      }
    );
  }

  openeditform(customervalue, index): void {
    this.selectedindex = index;
    // console.log(this.selectedindex);

    const dialogRef = this.dialog.open(CustomerprobabilityformComponent, {
      width: "40%",
      autoFocus: false,
      disableClose: true,
      height: "90%",
      // panelClass: 'white-modalbox',
      backdropClass: "blur-effect-form",
      data: {
        customer: customervalue,
        isEditMode: true,
        devicecount: null,
      },
    });
    dialogRef.afterClosed().subscribe((res: any) => {
      // this.allcustomerslist.push(res);
      if (res) {
        this.notifyService.showSuccess(
          "Customer Probability has been updated successfully.",
          "Success"
        );
        // this.allcustomerslist.splice(this.selectedindex, 1, res);
        // this.allcustomerslist = [...this.allcustomerslist];

        // this.chartarray.push({
        //   label: 'Probability',
        //   datasets: [{

        //     data: [15, 5, 50, 10, 20],
        //     backgroundColor: [
        //       '#F9BA48',
        //       '#FB4B40',
        //       '#FF823C',
        //       '#FFEDC6',
        //       '#edc773'
        //     ],
        //   }],
        //   labels: ['State', 'Other', 'City', '', 'Zip Postal']
        // });
        // this.cdr.detectChanges();
        // this.loadChart();
        this.allcustomerslist = [];
        this.allcustomers = [];
        this.skip = 0;
        this.iscustomerdesignslistloading = true;
        this.getCustomerProbabilityData();
      }
    });
  }

  showhidedetails(val, index): void {
    this.cardindex = index;
    if (val == "show") {
      this.showdetails = true;
    } else if (val == "hide") {
      this.showdetails = false;
    }
  }
}
