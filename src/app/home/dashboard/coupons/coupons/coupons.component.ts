import { ViewportScroller } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { ROLES } from "src/app/_helpers";
import { Coupon } from "src/app/_models";
import { Tranascitiondata } from "src/app/_models/tranascitiondata";
import {
  AuthenticationService,
  CouponService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { AddcoupondialogComponent } from "../addcoupondialog/addcoupondialog.component";

@Component({
  selector: "app-coupons",
  templateUrl: "./coupons.component.html",
  styleUrls: ["./coupons.component.scss"],
})
export class CouponsComponent implements OnInit {
  displayedColumns: string[] = [
    "requesttype",
    "title",

    "code",
    "expirydate",
    "amount",
    "usestype",
    "discounttype",
    "manage",
    "status",
  ];

  tranascition: Tranascitiondata[] = [];
  coupon: Coupon;
  coupons: Coupon[] = [];
  placeholder = false;
  allClients = 0;
  new = 0;
  pending = 0;
  overdue = 0;
  free = 0;
  cancelled = 0;
  blocked = 0;
  isLoading: boolean;
  contractorid;
  loggedInUser;
  isClient = false;
  isoverviewloading = true;

  dataSource = new MatTableDataSource<Coupon>(this.coupons);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public dialog: MatDialog,
    private viewportScroller: ViewportScroller,
    private couponService: CouponService,
    private notifyService: NotificationService,
    public genericService: GenericService,
    private _snackBar: MatSnackBar,
    private authService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
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
    this.getCoupons();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data, filter: string) => {
      const accumulator = (currentTerm, key) => {
        return key === "title"
          ? currentTerm + data.title
          : currentTerm + data[key];
      };
      const dataStr = Object.keys(data).reduce(accumulator, "").toLowerCase();
      // Transform the filter by converting it to lowercase and removing whitespace.
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) != -1;
    };
  }

  ngAfterViewInit(): void {
    this.getCoupons();
    this.dataSource.paginator = this.paginator;
  }

  gotoSection(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }

  openAddCouponDialog(): void {
    const dialogRef = this.dialog.open(AddcoupondialogComponent, {
      width: "60%",
      height: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.isLoading = false;
        this.getCoupons();
      }
    });
  }

  openEditCouponDialog(coupon: Coupon): void {
    const dialogRef = this.dialog.open(AddcoupondialogComponent, {
      width: "60%",
      height: "80%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, coupon: coupon, triggerEditEvent: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.getCoupons();
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getCoupons(): void {
    this.isoverviewloading = true;
    this.couponService.getCoupons().subscribe(
      (response) => {
        if (response.length > 0) {
          this.coupons = this.fillinDynamicData(response);
          this.coupons.map((item) =>
            item.requesttype == "prelim"
              ? (item.requesttype = "Sales Propopsal")
              : null
          );
          this.dataSource.data = this.coupons;
          this.isoverviewloading = false;
        } else {
          this.isoverviewloading = false;
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.isoverviewloading = false;
      }
    );
  }

  fillinDynamicData(records: Coupon[]): Coupon[] {
    return records;
  }

  openConfirmationDialog(coupon: Coupon): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message:
            "Are you sure you want to remove this coupon: " +
            coupon.title +
            " " +
            coupon.code +
            " from list?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.couponService.deleteCoupon("" + coupon.id).subscribe(
        () => {
          this.notifyService.showSuccess(
            coupon.title +
            " " +
            coupon.code +
            " has been removed successfully from coupon list.",
            "Success"
          );
          this.removeCoupon(coupon);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }

  removeCoupon(coupon: Coupon): void {
    this.coupons.forEach((element) => {
      if (element.id == coupon.id) {
        this.coupons.splice(this.coupons.indexOf(element), 1);
        this.dataSource.data = this.coupons;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  changeStatus(element, i): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message: "Are you sure you want to change the status" + " ?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      const postData = {
        activestatus: !element.activestatus,
      };
      this.couponService.editCoupon(element.id, postData).subscribe(
        (response) => {
          this.notifyService.showSuccess(
            "Coupon  have been updated successfully.",
            "Success"
          );

          this.dataSource.filteredData[i] = response;
          element.activestatus = !element.activestatus;
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
      // this.designService.deleteDesign("" + this.data.prelim.id).subscribe(
      //   response => {
      //     var GUID = chatid;

      //     CometChat.deleteGroup(GUID).then(
      //       response => {
      //         this.notifyService.showSuccess("Design request for " + this.data.prelim.address + " has been removed successfully.", "Success");
      //         this.data.triggerDeleteEvent = true;
      //         this.data.refreshDashboard = false;
      //         this.data.triggerPrelimEditEvent = false;
      //         this.dialogRef.close(this.data);
      //       },
      //       error => {
      //         this.notifyService.showSuccess("Design request for " + this.data.prelim.address + " has been removed successfully.", "Success");
      //         this.data.triggerDeleteEvent = true;
      //         this.data.refreshDashboard = false;
      //         this.data.triggerPrelimEditEvent = false;
      //         this.dialogRef.close(this.data);
      //       }
      //     );
      //   },
      //   error => {
      //     this.notifyService.showError(error, "Error");
      //   }
      // );
    });
  }
}
