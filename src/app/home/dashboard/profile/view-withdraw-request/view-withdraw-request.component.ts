import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { BankdetailService } from "src/app/_services/bankdetail.service";
import { MatTableDataSource } from "@angular/material/table";
import { WithdrawRequestComponent } from "../withdraw-request/withdraw-request.component";
import { MatPaginator } from "@angular/material/paginator";

@Component({
  selector: "app-view-withdraw-request",
  templateUrl: "./view-withdraw-request.component.html",
  styleUrls: ["./view-withdraw-request.component.scss"],
})
export class ViewWithdrawRequestComponent implements OnInit {
  viewwithdrawl = [];
  displayedColumns: string[] = ["Created_At", "Status", "Amount"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private bankdetailservice: BankdetailService
  ) {}
  dataSource = new MatTableDataSource<any>(this.viewwithdrawl);

  ngOnInit(): void {
    this.bankdetailservice.getWithdrawal().subscribe((data) => {
      this.viewwithdrawl = data;
      this.dataSource.data = this.viewwithdrawl;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  withdrawRequest(): void {
    this.dialog.open(WithdrawRequestComponent, {
      width: "60%",
      autoFocus: false,
      disableClose: true,
      panelClass: "white-modalbox",
    });
  }
  handleBack(): void {
    this.router.navigate(["/home/profile/details"]);
  }
}
