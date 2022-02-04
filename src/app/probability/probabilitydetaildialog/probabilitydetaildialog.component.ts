import { Location } from "@angular-material-extensions/google-maps-autocomplete";
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import * as Chart from "chart.js";
import { ADDRESSFORMAT, MAILFORMAT, NAME } from "src/app/_helpers";
import { User } from "src/app/_models";
import { AuthenticationService } from "src/app/_services";

@Component({
  selector: "app-probabilitydetaildialog",
  templateUrl: "./probabilitydetaildialog.component.html",
  styleUrls: ["./probabilitydetaildialog.component.scss"],
})
export class ProbabilitydetaildialogComponent implements OnInit {
  @ViewChild("doughnutCanvas") doughnutCanvas: ElementRef;

  customerForm: FormGroup;
  name = new FormControl("", [
    Validators.required,
    Validators.minLength(2),
    Validators.pattern(NAME),
  ]);
  email = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  phone = new FormControl("", [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(15),
    Validators.pattern("^[0-9]{8,15}$"),
  ]);
  address = new FormControl("", [
    Validators.required,
    Validators.pattern(ADDRESSFORMAT),
  ]);

  formatted_address: string;
  postalcode: string;
  city: string = "";
  state: string = "";
  country: string;
  latitude = null;
  longitude = null;

  selectedSiteLocation: Location;
  deviceInfo: any;
  ipAddress: any;
  showprobability: boolean = false;
  doughnutChart: any;
  selectedSliceLabel = "85";
  loggedInUser: User;
  exceedlimit: boolean;

  constructor(
    // private http: HttpClient,
    // private commonService: CommonService,
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.exceedlimit = data.exceedlimit;
    this.loggedInUser = this.authService.currentUserValue?.user;
  }

  ngOnInit(): void {
    // do nothing.
  }

  ngAfterViewInit(): void {
    if (!this.exceedlimit) {
      this.doughnutChartMethod();
    }
  }

  doughnutChartMethod(): void {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: "doughnut",
      data: {
        datasets: [
          {
            label: "Probability",
            data: [85, 15],
            backgroundColor: ["#EDC773", "rgba(255, 99, 132, 0.2)"],
            hoverBackgroundColor: ["#EDC773", "#FF6384"],
          },
        ],
      },
      options: {
        rotation: 20.4,
        cutoutPercentage: 65,
      },
    });
  }

  goToSignUp(): void {
    this.dialog.closeAll();
    this.router.navigate(["/auth/register"]);
  }

  goToLogin(): void {
    this.dialog.closeAll();
    this.router.navigate(["/auth/login"]);
  }
}
