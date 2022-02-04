import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { WithdrawService } from "./../../../../_services/withdraw.service";


@Component({
  selector: "app-withdraw",
  templateUrl: "./withdraw.component.html",
  styleUrls: ["./withdraw.component.scss"],
})
export class WithdrawComponent implements OnInit {
  displayedColumns: string[] = [
    "created_at",
    "firstname",
    "servicetype",
    "usertype",
    "status",
    "amount",
  ];
  Withdrawls: User[] = [];
  loggedInUser: User;
  isClient = false;
  Withdraw: FormGroup;
  maxToDate: Date;
  maxFromDate: Date;
  minToDate: Date;
  dataSource = new MatTableDataSource<User>(this.Withdrawls);
  withdrawFromDate = new FormControl(new Date().toISOString(), [
    Validators.required,
  ]);
  withdrawtoDate = new FormControl(new Date().toISOString(), [
    Validators.required,
  ]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  placeholder = false;

  constructor(
    private withdrawservice: WithdrawService,
    private notifyService: NotificationService,
    public genericService: GenericService,
    public authService: AuthenticationService
  ) {
    this.loggedInUser = authService.currentUserValue.user;
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngAfterViewInit(): void {
    this.fetchWithdrawData();
    this.dataSource.paginator = this.paginator;
  }
  fetchWithdrawData(): void {
    this.withdrawservice.getWithdrawData().subscribe(
      (response) => {
        if (response.length > 0) {
          this.placeholder = false;
          this.Withdrawls = response;
          this.dataSource.data = this.Withdrawls;
        } else {
          this.placeholder = true;
          this.Withdrawls = [];
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getErrorMessage(control: FormControl): string | string {
    if (control.hasError("required")) {
      return "You must enter a value";
    }
    return "";
  }

  getwithdFromDate(ev): void {
    const getfromdate = ev.value.toISOString();
    let changefromdate = new Date(getfromdate);

    changefromdate.setDate(changefromdate.getDate() + 1);
    const starttime = changefromdate.toISOString();

    this.maxFromDate = new Date(this.withdrawtoDate.value);
    this.minToDate = new Date(starttime);

    let newDate = new Date(this.withdrawtoDate.value);
    const endtime = newDate.toISOString();

    this.withdrawservice.getWithdrawData(starttime, endtime).subscribe(
      (response) => {
        //console.log(response);
        this.Withdrawls = response;

        this.dataSource.data = this.Withdrawls;
      },
      () => {
        //console.log(error)
      }
    );
  }
  getwithdrawUptoDate(ev): void {
    const getuptodate = ev.value.toISOString();
    let changeuptodate = new Date(getuptodate);

    changeuptodate.setDate(changeuptodate.getDate() + 1);
    const endtime = changeuptodate.toISOString();

    let newDate = new Date(this.withdrawFromDate.value);
    const starttime = newDate.toISOString();

    this.withdrawservice.getWithdrawData(starttime, endtime).subscribe(
      (response) => {
        //console.log(response);
        this.Withdrawls = response;
        this.dataSource.data = this.Withdrawls;
      },
      () => {
        //console.log(error)
      }
    );
  }
}
