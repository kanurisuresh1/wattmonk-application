import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BankdetailService } from "src/app/_services/bankdetail.service";
import { Router } from "@angular/router";
import { MatTableDataSource } from "@angular/material/table";
import { WithdrawRequestComponent } from "../withdraw-request/withdraw-request.component";
import { MatPaginator } from "@angular/material/paginator";
@Component({
  selector: "app-view-earnings",
  templateUrl: "./view-earnings.component.html",
  styleUrls: ["./view-earnings.component.scss"],
})
export class ViewEarningsComponent implements OnInit {
  displayedColumns: string[] = ["Created_At", "Design Name", "Email", "Amount"];
  viewearning = [];
  isadmin = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private bankdetailservice: BankdetailService
  ) {}
  dataSource = new MatTableDataSource<any>(this.viewearning);

  ngOnInit(): void {
    this.bankdetailservice.getEarnings().subscribe((data) => {
      this.viewearning = data;
      this.dataSource.data = this.viewearning;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  withdrawRequest(): void {
    this.dialog.open(WithdrawRequestComponent, {
      width: "60%",
      disableClose: true,
      autoFocus: false,
      panelClass: "white-modalbox",
    });
  }
  handleBack(): void {
    this.router.navigate(["/home/profile/details"]);
  }
}
