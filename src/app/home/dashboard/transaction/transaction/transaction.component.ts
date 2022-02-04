import { formatDate } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatInput } from "@angular/material/input";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import axios from "axios";
import { MasterdetailpageComponent } from "src/app/shared/masterdetailpage/masterdetailpage.component";
import { ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  DesignService,
  GenericService,
  LoaderService,
  NotificationService,
  PestampService
} from "src/app/_services";
import { TransactionService } from "src/app/_services/transaction.service";

@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"],
})
export class TransactionComponent implements OnInit {
  displayedColumns: string[] = [
    "servicetype",
    "paymenttype",
    "transaction",
    "amount",
    "firstname",
    "created_at",
    "actions",
    // 'paymentstatus',
    // "couponamount",
    // "slabdiscount",
  ];
  dataSourcenew = [];
  allTransaction = [];
  scrolling = false;
  issearchdata = false;
  searcharchive: string = "";
  searchdata: string = "";
  searchcompany: string = "";
  isoverviewloading = true;
  limit = 15;
  start = 0;
  skip = 0;
  filterstart = 0;
  searchstart = 0;
  isLoading = false;
  today = new Date();

  selectedArchives = [];
  transaction: User[] = [];
  dataSource1 = [];
  skeleton = [0, 1, 2];
  startDate = new FormControl("", [Validators.required]);
  endDate = new FormControl("", [Validators.required]);
  placeholder = false;
  loggedInUser: User;
  isClient = false;
  isFirstPage = true;
  isLastPage = false;
  Transaztion: FormGroup;
  transaztionFromDate = new FormControl(new Date().toISOString(), [
    Validators.required,
  ]);
  transaztiontoDate = new FormControl(new Date().toISOString(), [
    Validators.required,
  ]);
  DateForm: FormGroup;
  maxToDate: Date;
  fromDate: string = null;
  toDate: string = null;
  toDates: string = null;
  dataSource = new MatTableDataSource<User>(this.transaction);
  skeletondatasource = new MatTableDataSource(this.skeleton);
  loader: boolean = true;
  totalCount = 7;
  isfilterdata = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("matselect") matselect;

  filterOption = new FormControl();
  serviceTypeOption = [
    { name: "Design", checked: false, value: "design" },
    { name: "PE Stamp", checked: false, value: "pestamp" },
    { name: "Recharge", checked: false, value: "credit" },
  ];
  paymentTypeOption = [
    { name: "Free Design", checked: false, value: "freedesign" },
    { name: "Wallet", checked: false, value: "wallet" },
    { name: "Postpaid", checked: false, value: "postpaid" },
    { name: "Paypal", checked: false, value: "paypal" },
  ];
  transactionTypeOption = [
    { name: "Free Design", checked: false, value: "freedesign" },
    { name: "Debit", checked: false, value: "debit" },
    { name: "Credit", checked: false, value: "credit" },
    { name: "Paypal", checked: false, value: "paypal" },
    { name: "Postpaid", checked: false, value: "postpaid" },
  ];
  serviceType: string = null;
  paymentStatus: string = null;
  transactionType: string = null;
  paymentdisable = false;
  servicedisable = false;
  transactiondisable = false;
  @ViewChild("fromInput", {
    read: MatInput,
  })
  fromInput: MatInput;

  @ViewChild("toInput", {
    read: MatInput,
  })
  toInput: MatInput;

  constructor(
    private transactionservice: TransactionService,
    private notifyService: NotificationService,
    public genericService: GenericService,
    public authService: AuthenticationService,
    // private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    public fb: FormBuilder,
    // private router: Router,
    private dialog: MatDialog,
    private designService: DesignService,
    private pestampService: PestampService,
    private loaderservice: LoaderService
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
    //  this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
    //this.maxToDate= new Date();
    this.fetchTransactionData();
  }

  ngAfterViewInit(): void {
    // this.fetchTransactionData();
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }
  // applyFilter(filterValue: string): void {
  //   // this.dataSource.filter = filterValue.trim().toLowerCase();
  // }

  fetchTransactionData(): void {
    let searchdata = "";

    searchdata =
      "transactions?userid=" +
      this.loggedInUser.parent.id +
      "&_limit=" +
      this.limit +
      "&_start=" +
      this.start;
    this.transactionservice.getalltransaction(searchdata).subscribe(
      (response) => {
        //console.log("data",response);

        // if (response.length > 0) {
        //   this.placeholder = false;
        //   this.transaction = response;
        //   this.loader=false;
        //   this.dataSource.data = this.transaction;
        // } else {
        //   this.placeholder = true;
        //   this.transaction = [];
        // }
        this.isfilterdata = false;
        this.scrolling = false;
        if (response.length > 0) {
          this.loader = false;
          this.placeholder = false;
          response.map((item) => {
            this.dataSourcenew.push(item);
          });

          this.isoverviewloading = false;
          this.allTransaction = [...this.dataSourcenew];
          this.placeholder = false;
          this.changeDetectorRef.detectChanges();
        } else {
          if (!this.allTransaction.length) {
            this.placeholder = true;
          }
          this.isoverviewloading = false;
          this.changeDetectorRef.detectChanges();
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  calenderValue(index, date: string): void {
    const input = formatDate(date.toString(), "yyyy-MM-dd", "en-US");
    if (index == "startdate") {
      this.fromDate = input;
    } else if (index == "enddate") {
      const dates = new Date(date);
      dates.setDate(dates.getDate() + 1);
      this.toDates = formatDate(dates.toString(), "yyyy-MM-dd", "en-US");
      this.toDate = input;
    }
  }

  openDetailPage(detailvalue): void {
    //console.log("df",detailvalue);
    this.loaderservice.show();
    if (detailvalue.servicetype == "design") {
      this.designService.getDesignDetails(detailvalue.designid).subscribe(
        (response) => {
          if (response.requesttype == "prelim") {
            const dialogRef = this.dialog.open(MasterdetailpageComponent, {
              width: "80%",
              autoFocus: false,
              disableClose: true,
              /* panelClass: 'white-modalbox',
               height:"98%", */
              data: {
                prelim: response,
                triggerEditEvent: false,
                triggerDeleteEvent: false,
                selectedtab: "prelim",
                triggerChatEvent: false,
                triggerActivity: false,
                mode: "transaction",
              },
            });

            dialogRef.afterClosed().subscribe(() => {
              // do nothing.
            });
          } else if (response.requesttype == "permit") {
            const dialogRef = this.dialog.open(MasterdetailpageComponent, {
              width: "80%",
              autoFocus: false,
              disableClose: true,
              /* panelClass: 'white-modalbox',
               height:"98%", */
              data: {
                permit: response,
                triggerEditEvent: false,
                triggerDeleteEvent: false,
                selectedtab: "permit",
                triggerChatEvent: false,
                triggerActivity: false,
                mode: "transaction",
              },
            });
            this.loaderservice.hide();
            dialogRef.afterClosed().subscribe(() => {
              // do nothing.
            });
          }
        },
        (error) => {
          this.notifyService.showError(error, "Error");
          this.loaderservice.hide();
        }
      );
    } else if (detailvalue.servicetype == "pestamp") {
      this.pestampService.getPestampDetails(detailvalue.pestampid).subscribe(
        (response) => {
          const dialogRef = this.dialog.open(MasterdetailpageComponent, {
            width: "80%",
            autoFocus: false,
            disableClose: true,
            /* panelClass: 'white-modalbox',
             height:"98%", */
            data: {
              pestamp: response,
              triggerEditEvent: false,
              triggerDeleteEvent: false,
              selectedtab: "pestamp",
              triggerChatEvent: false,
              triggerActivity: false,
              mode: "transaction",
            },
          });

          dialogRef.afterClosed().subscribe(() => {
            // do nothing.
          });
        },
        (error) => {
          this.notifyService.showError(error, "Error");
          this.loaderservice.hide();
        }
      );
    }
  }

  ontableScroll(): void {
    //console.log('scrolled!!')
    if (this.isfilterdata) {
      this.scrolling = true;
      this.isoverviewloading = false;
      // this.loaderservice.isLoading = new BehaviorSubject<boolean>(false);
      this.filterstart += 15;
      this.searchfilterdata();
    }

    // if (this.issearchdata) {
    //   this.scrolling = true;
    //   this.loaderservice.isLoading = new BehaviorSubject<boolean>(false);
    //   this.searchstart += 15;
    //   //this.tablesearchfieldarchives();
    // }

    if (!this.isfilterdata && !this.issearchdata) {
      this.scrolling = true;
      // this.loaderservice.isLoading = new BehaviorSubject<boolean>(false);
      this.start += 15;
      this.changeDetectorRef.detectChanges();
      this.fetchTransactionData();
    }
  }

  filtercheckboxvalues(filter, index): void {
    this.matselect.open();
    this.filterstart = 0;
    if (filter == "service option") {
      this.serviceTypeOption.map((item, ind) => {
        if (ind == index) {
          if (!item.checked) {
            item.checked = true;
            this.serviceType = item.value;
            if (this.serviceType == "credit") {
              this.transactiondisable = true;
              this.paymentdisable = true;
              this.paymentStatus = null;
              this.transactionType = null;
              this.paymentTypeOption.map((item) => {
                item.checked = false;
              });
              this.transactionTypeOption.map((item) => {
                item.checked = false;
              });
            } else {
              this.transactiondisable = false;
              this.paymentdisable = false;
            }
          } else {
            item.checked = false;
            this.serviceType = null;
            this.transactiondisable = false;
            this.paymentdisable = false;
            this.servicedisable = false;
          }
        } else {
          item.checked = false;
        }
      });
    } else if (filter == "payment") {
      this.paymentTypeOption.map((item, ind) => {
        if (ind == index) {
          if (!item.checked) {
            item.checked = true;
            this.paymentStatus = item.value;
            if (this.paymentStatus == "paypal") {
              this.transactiondisable = true;
              // this.servicedisable=true;
              // this.serviceType = null;
              this.transactionType = null;
              // this.serviceTypeOption.map(item => {
              //   if(item.value =='credit' && item.checked){
              //   item.checked = false;}
              // })
              this.transactionTypeOption.map((item) => {
                item.checked = false;
              });
            } else {
              this.servicedisable = false;
              this.transactiondisable = false;
            }
          } else {
            item.checked = false;
            this.paymentStatus = null;
            this.servicedisable = false;
            this.transactiondisable = false;
          }
        } else item.checked = false;
      });
    } else if (filter == "transaction") {
      this.transactionTypeOption.map((item, ind) => {
        if (ind == index) {
          if (!item.checked) {
            item.checked = true;
            this.transactionType = item.value;
            if (this.transactionType == "paypal") {
              this.paymentdisable = true;
              // this.servicedisable=true;
              // this.serviceType = null;
              this.paymentStatus = null;
              // this.serviceTypeOption.map(item => {
              //   if(item.value =='credit' && item.checked){
              //     item.checked = false;}
              // })
              this.paymentTypeOption.map((item) => {
                item.checked = false;
              });
            } else {
              this.servicedisable = false;
              this.paymentdisable = false;
            }
          } else {
            item.checked = false;
            this.transactionType = null;
            this.servicedisable = false;
            this.paymentdisable = false;
          }
        } else item.checked = false;
      });
    }
    if (filter == "submit") {
      this.dataSourcenew = [];
      this.loader = true;
      this.searchfilterdata();
    }
  }

  searchfilterdata(): void {
    let searchparam = "";
    let error = false;
    if (this.issearchdata) {
      this.isoverviewloading = true;
      this.searcharchive = "";
      this.searchstart = 0;
      this.issearchdata = false;
    }

    if (this.serviceType) {
      searchparam = "servicetype=" + this.serviceType + "&";
    }
    if (this.serviceType == "credit") {
      searchparam = "transactiontype=" + this.serviceType + "&";
    }
    if (this.paymentStatus) {
      searchparam = searchparam + "paymenttype=" + this.paymentStatus + "&";
    }

    if (this.transactionType) {
      searchparam =
        searchparam + "transactiontype=" + this.transactionType + "&";
    }

    if (this.fromDate || this.toDates) {
      searchparam =
        searchparam +
        "&created_at_gte=" +
        (this.fromDate ? this.fromDate : (error = true)) +
        "&" +
        "created_at_lte=" +
        (this.toDates
          ? this.toDates + "&"
          : (this.toDates =
            formatDate(this.today.toString(), "yyyy-MM-dd", "en-US") + "&"));
    }

    if (this.loggedInUser.parent.id == 232) {
      searchparam =
        "transaction?" +
        searchparam +
        "_limit=" +
        this.limit +
        "&_start=" +
        this.filterstart +
        "&_sort=id:DESC";
    } else {
      searchparam =
        "transactions?userid=" +
        this.loggedInUser.parent.id +
        "&" +
        searchparam +
        "_limit=" +
        this.limit +
        "&_start=" +
        this.filterstart +
        "&_sort=id:DESC";
    }
    if (!error) {
      if (
        this.fromDate && this.toDates
          ? Date.parse(this.fromDate) <= Date.parse(this.toDates)
          : true
      ) {
        this.transactionservice.filtertransactionservice(searchparam).subscribe(
          (response) => {
            this.isfilterdata = true;
            this.scrolling = false;
            if (response.length > 0) {
              this.loader = false;
              response.map((item) => {
                this.dataSourcenew.push(item);
              });

              this.placeholder = false;
              this.allTransaction = [];
              this.allTransaction = [...this.dataSourcenew];
              this.changeDetectorRef.detectChanges();
            } else {
              if (!this.dataSourcenew.length) {
                this.allTransaction = [];
                this.placeholder = true;
                this.loader = false;
              }
            }
          },
          (error) => {
            this.notifyService.showError(error, "Error");
          }
        );
        this.matselect.close();
      } else {
        this.notifyService.showError(
          "From Date must be less then to date.",
          "Error"
        );
      }
    } else {
      this.notifyService.showError("From Date cannot be empty", "Error");
    }

    searchparam = "";
  }

  //**When filter is applied to unselect all the filters. */
  clearcheckboxvalues(filter): void {
    if (filter == "all") {
      this.serviceTypeOption.map((item) => {
        item.checked = false;
      });
      this.paymentTypeOption.map((item) => {
        item.checked = false;
      });
      this.transactionTypeOption.map((item) => {
        item.checked = false;
      });

      this.serviceType = null;
      this.paymentStatus = null;
      this.transactionType = null;
      this.transactiondisable = false;
      this.servicedisable = false;
      this.paymentdisable = false;
      this.fromDate = "";
      this.toDate = "";
      this.toDates = "";
      this.start = 0;
      this.filterstart = 0;
      this.dataSourcenew = [];
      this.allTransaction = [];
      this.loader = true;
      this.fetchTransactionData();
      this.changeDetectorRef.detectChanges();
      this.matselect.close();

      this.fromInput.value = "";
      this.toInput.value = "";
    } else {
      this.matselect.close();
    }
    this.isfilterdata = false;
  }

  downloadExcel(): void {
    const user = this.loggedInUser.parent.id;
    let searchparam = "";
    // let error = false;
    if (this.serviceType) {
      searchparam = "&servicetype=" + this.serviceType;
    }
    if (this.serviceType == "credit") {
      searchparam = "&transactiontype=" + this.serviceType;
    }
    if (this.paymentStatus) {
      searchparam = searchparam + "&paymenttype=" + this.paymentStatus;
    }

    if (this.transactionType) {
      searchparam = searchparam + "&transactiontype=" + this.transactionType;
    }

    if (this.fromDate || this.toDates) {
      searchparam =
        searchparam +
        "&created_at_gte=" +
        (this.fromDate ? this.fromDate : true) +
        "&" +
        "created_at_lte=" +
        (this.toDates
          ? this.toDates
          : (this.toDates = formatDate(
            this.today.toString(),
            "yyyy-MM-dd",
            "en-US"
          )));
    }

    if (this.loggedInUser.parent.id == 232) {
      searchparam = "transaction?" + searchparam;
    } else {
      searchparam = searchparam;
    }
    this.loaderservice.show();

    this.transactionservice.downloadExcel(user, searchparam).subscribe(
      (response: any) => {
        //console.log("xdd1",response);
        const fileurl = response.data;
        const filename = "orders.xlsx";

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
            this.loaderservice.hide();
          },
          () => {
            //console.log(err,"ll");
            this.loaderservice.hide();
          }
        );
      },
      () => {
        this.loaderservice.hide();
      }
    );
  }

  downloadpdf(): void {
    this.loaderservice.show();
    const user = this.loggedInUser.parent.id;
    let searchparam = "";
    // let error = false;
    if (this.serviceType) {
      searchparam = "&servicetype=" + this.serviceType;
    }
    if (this.serviceType == "credit") {
      searchparam = "&transactiontype=" + this.serviceType;
    }
    if (this.paymentStatus) {
      searchparam = searchparam + "&paymenttype=" + this.paymentStatus;
    }

    if (this.transactionType) {
      searchparam = searchparam + "&transactiontype=" + this.transactionType;
    }

    if (this.fromDate || this.toDates) {
      searchparam =
        searchparam +
        "&created_at_gte=" +
        (this.fromDate ? this.fromDate : true) +
        "&" +
        "created_at_lte=" +
        (this.toDates
          ? this.toDates
          : (this.toDates = formatDate(
            this.today.toString(),
            "yyyy-MM-dd",
            "en-US"
          )));
    }

    if (this.loggedInUser.parent.id == 232) {
      searchparam = "transaction?" + searchparam;
    } else {
      searchparam = searchparam;
    }

    this.transactionservice.downloadpdf(user, searchparam).subscribe(
      (response: any) => {
        const fileurl = response.data;
        const filename = "orders.pdf";

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
            this.loaderservice.hide();
          },
          () => {
            //console.log(err);
            this.loaderservice.hide();
          }
        );
      },
      () => {
        //console.log(err);
        this.loaderservice.hide();
      }
    );
  }
}
