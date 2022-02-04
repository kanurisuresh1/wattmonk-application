import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { MatDialog } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { FIREBASE_DB_CONSTANTS, ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import { Tranascitiondata } from "src/app/_models/tranascitiondata";
import {
  AuthenticationService,
  ContractorService,
  GenericService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { EventEmitterService } from "src/app/_services/event-emitter.service";
import { AddcontractordialogComponent } from "../addcontractordialog/addcontractordialog.component";
import { ContractordetaildialogComponent } from "../contractordetaildialog/contractordetaildialog.component";
@Component({
  selector: "app-contractor",
  templateUrl: "./contractor.component.html",
  styleUrls: ["./contractor.component.scss"],
})
export class ContractorComponent implements OnInit {
  displayedColumns: string[] = [
    "name",
    "company",
    "email",
    "amount",
    "prelimdesigndiscount",
    "permitdesigndiscount",
    "manage",
  ];
  isoverviewloading = true;
  tranascition: Tranascitiondata[] = [];
  user: User;
  clients: User[] = [];
  filterClients: User[] = [];
  allClients: User[] = [];
  placeholder = false;
  // allClients = 0;
  new = 0;
  pending = 0;
  overdue = 0;
  free = 0;
  cancelled = 0;
  blocked = 0;
  limit = 20;
  skip = 0;
  scrolling = false;
  isLoading: boolean;
  contractorid;
  loggedInUser;
  isClient = false;
  userinitials = "";
  // isuserlistloading = true;

  blockfilterplaceholder = "User Type";

  blockfilterstatus: boolean = null;
  orderbyfilterstatus = null;
  ordertypefilterstatus = null;
  paymenttypefilterstatus = null;
  searchfield: string = "";
  issearchapplied = false;
  showClearButton = false;
  regitemRef;
  constructor(
    public dialog: MatDialog,
    private contractorService: ContractorService,
    private notifyService: NotificationService,
    public genericService: GenericService,
    private eventEmitterService: EventEmitterService,
    private _snackBar: MatSnackBar,
    private authService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    public loader: LoaderService,
    private loaderservice: LoaderService,
    private db: AngularFireDatabase
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
    // setTimeout(this.fetchAllContractorsList,2000)
  }

  ngAfterViewInit(): void {
    this.fetchAllContractorsList();
  }

  onChatButtonClick(contractor: User, event: Event): void {
    event.stopPropagation();
    let id = " " + contractor.id;
    this.genericService.setSelectedChatUser(id);
    this.genericService.backroute = "/home/client/overview";
    this.router.navigate(["/home/inbox/messages"]);
    this.eventEmitterService.onSidebarRouteChange("Inbox");
  }

  //-----------------------------------------------------------------------------------------

  openAddContractorDialog(): void {
    const dialogRef = this.dialog.open(AddcontractordialogComponent, {
      width: "40%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.triggerEditEvent) {
        this.fetchAllContractorsList();
      }
      this.isLoading = false;
    });
  }

  fetchAllContractorsList(): void {
    // this.loaderservice.show();
    let searchdata = "limit=" + this.limit + "&skip=" + this.skip;
    this.contractorService.getClientSuperadmin(searchdata).subscribe(
      (response) => {
        if (response.length > 0) {
          this.isoverviewloading = false;
          this.fillinDynamicData(response).map((item) => {
            this.placeholder = false;
            this.clients.push(item);
            this.allClients = this.clients;
          });
          // this.isuserlistloading = false;
        } else {
          if (!this.allClients.length) {
            this.placeholder = true;
          }
        }
        // this.loaderservice.hide();
        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        // this.loaderservice.hide();
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fillinDynamicData(records: User[]): User[] {
    records.forEach((element) => {
      element.createdondate = this.genericService.formatDateInDisplayFormat(
        element.created_at
      );
      if (element.ispaymentmodeprepay) {
        element.paymentmode = "Prepaid";
      } else {
        element.paymentmode = "Postpaid";
      }
    });

    return records;
  }

  onScroll(): void {
    /**if data without any filter then it call
     * default api of client super admins */
    if (
      this.paymenttypefilterstatus === null &&
      this.orderbyfilterstatus === null &&
      this.blockfilterstatus === null &&
      !this.issearchapplied
    ) {
      this.skip += 20;
      this.scrolling = true;
      this.fetchAllContractorsList();
    } else if (this.issearchapplied) {
      /**If data is search then it will hit this
       * api*/
      this.skip += 20;
      this.scrolling = true;
      this.getSearchUsers();
    }
  }

  switchPaymentModeCustomer(
    record: User,
    index: number,
    mode: boolean,
    event: Event
  ): void {
    event.stopPropagation();
    const postData = {
      ispaymentmodeprepay: mode,
    };

    this.contractorService.editContractor(record.id, postData).subscribe(
      () => {
        this.notifyService.showSuccess(
          "Client details has been updated successfully.",
          "Success"
        );
        if (mode) {
          this.clients[index].paymentmode = "Prepaid";
        } else {
          this.clients[index].paymentmode = "Postpaid";
        }
        this.clients[index].ispaymentmodeprepay = mode;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  blockunblockCustomer(record: User, index: number, event: Event): void {
    event.stopPropagation();
    let blockstatus = !record.blocked;
    let message;

    if (blockstatus == false) {
      message = "Are you sure you want to unblock the user ";
    } else {
      message = "Are you sure you want to block the user ";
    }
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message:
            message +
            record.firstname.toUpperCase() +
            record.lastname.toUpperCase() +
            " ?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      const postData = {
        blocked: blockstatus,
      };

      this.contractorService.editContractor(record.id, postData).subscribe(
        () => {
          if (blockstatus) {
            this.notifyService.showSuccess(
              "Client has been blocked successfully.",
              "Success"
            );

            this.regitemRef = this.db.object(
              FIREBASE_DB_CONSTANTS.KEYWORD + record.id
            );
            this.regitemRef.update({ userblocked: true });
          } else {
            this.notifyService.showSuccess(
              "Client has been activated successfully.",
              "Success"
            );
            this.regitemRef = this.db.object(
              FIREBASE_DB_CONSTANTS.KEYWORD + record.id
            );
            this.regitemRef.update({ userblocked: false });
          }
          this.clients[index].blocked = blockstatus;
          this.clients.splice(index, 1);
          if (this.clients.length == 0) {
            this.placeholder = true;
          }
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }

  openClientDetailDialog(element, event: Event, i): void {
    event.stopPropagation();
    let triggerEditEvent = false;
    const dialogRef = this.dialog.open(ContractordetaildialogComponent, {
      width: "100%",
      autoFocus: false,
      disableClose: true,
      data: { user: element, triggerEditEvent: triggerEditEvent },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.triggerEditEvent) {
        // this.openEditClientDialog(element,event);
        // this.fetchAllContractorsList();
        this.openEditClientDialog(element, event);
      }
      if (result && result.userblocked) {
        this.clients.splice(i, 1);
        this.regitemRef = this.db.object(
          FIREBASE_DB_CONSTANTS.KEYWORD + element.id
        );
        this.regitemRef.update({ userblocked: true });
      } else if (result && result.userUnblocked) {
        this.clients.splice(i, 1);
        this.regitemRef = this.db.object(
          FIREBASE_DB_CONSTANTS.KEYWORD + element.id
        );
        this.regitemRef.update({ userblocked: false });
      }
      if (this.clients.length == 0) {
        this.placeholder = true;
      }
    });
  }

  openEditClientDialog(user: User, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AddcontractordialogComponent, {
      width: "40%",
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, user: user, triggerEditEvent: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.clients = [];
        this.skip = 0;
        this.issearchapplied = false;
        this.fetchAllContractorsList();
      }
    });
  }

  applyfilter(): void {
    this.loaderservice.show();
    this.clients = [];
    let searchdata =
      "getclientfilter?blocked=" +
      this.blockfilterstatus +
      "&orderby=" +
      this.orderbyfilterstatus +
      "&ordertype=" +
      this.ordertypefilterstatus +
      "&paymenttype=" +
      this.paymenttypefilterstatus;
    this.contractorService
      .getFilteredContractorsList(searchdata)
      .subscribe((response) => {
        // console.log("inside apply filter:",response);

        if (response.length > 0) {
          this.loaderservice.hide();
          this.placeholder = false;

          this.clients = this.fillinDynamicData(response);
          this.filterClients = this.clients;
        } else {
          this.loaderservice.hide();
          // console.log("xdd");
          this.placeholder = true;
        }
      });
  }

  filtervalue(event: MatSelectChange): void {
    let selectedData = {
      value: event.value,
    };
    if (selectedData.value == "blocked") {
      this.blockfilterstatus = true;
    } else if (selectedData.value == "unblocked") {
      this.blockfilterstatus = false;
    } else if (selectedData.value == "name") {
      this.orderbyfilterstatus = "firstname";
    } else if (selectedData.value == "created") {
      this.orderbyfilterstatus = "created_at";
    } else if (selectedData.value == "asc") {
      this.ordertypefilterstatus = "asc";
    } else if (selectedData.value == "desc") {
      this.ordertypefilterstatus = "desc";
    } else if (selectedData.value == "prepaid") {
      this.paymenttypefilterstatus = "prepaid";
    } else if (selectedData.value == "postpaid") {
      this.paymenttypefilterstatus = "postpaid";
    }
    this.applyfilter();
  }

  clearfiltervalues(element): void {
    if (element == "paymenttype") {
      this.paymenttypefilterstatus = null;
    } else if (element == "ordertype") {
      this.ordertypefilterstatus = null;
    } else if (element == "orderby") {
      this.orderbyfilterstatus = null;
    } else if (element == "blockstatus") {
      this.blockfilterstatus = null;
      this.blockfilterplaceholder = null;
    }

    if (
      this.paymenttypefilterstatus === null &&
      this.orderbyfilterstatus === null &&
      this.blockfilterstatus === null
    ) {
      this.clients = [];
      this.skip = 0;
      this.fetchAllContractorsList();
    } else if (
      this.paymenttypefilterstatus != null ||
      this.orderbyfilterstatus != null ||
      this.blockfilterstatus != null
    ) {
      this.applyfilter();
    }
  }

  fetchSearchData(event): void {
    /**If backspace is clicked and it remove all the string from
     * input field
     */
    if (event.keyCode == 8 && this.searchfield.length == 1) {
      this.isoverviewloading = true;
      this.clearfield();
    } else if (event.keyCode == 13 || event.pointerId == 1) {
      /** If enter is pressed then only api hit occur.*/
      this.isoverviewloading = true;
      this.clients = [];
      if (
        this.searchfield == "" ||
        this.searchfield === null ||
        this.searchfield == undefined
      ) {
        this.showClearButton = false;
        this.isoverviewloading = false;
        this.issearchapplied = true;

        if (
          this.paymenttypefilterstatus === null &&
          this.orderbyfilterstatus === null &&
          this.blockfilterstatus === null
        ) {
          this.clients = this.allClients;
        } else if (
          this.paymenttypefilterstatus != null ||
          this.orderbyfilterstatus != null ||
          this.blockfilterstatus != null
        ) {
          this.clients = this.filterClients;
        }
      } else {
        this.showClearButton = true;
        this.issearchapplied = true;

        /**For infinte scroll skip set to zero
         * because on each search it start from zero.
         */
        this.skip = 0;
        this.getSearchUsers();
      }
    }
  }

  /**For Search user infinite scroll is done now
   * with separate function.*/
  getSearchUsers(): void {
    let postData = {
      keyword: this.searchfield,
      role: "6",
      limit: this.limit,
      skip: this.skip,
    };
    this.contractorService.getSearchResults(postData).subscribe(
      (response) => {
        if (response) {
          this.isoverviewloading = false;
          if (response.length > 0) {
            this.fillinDynamicData(response).map((item) => {
              this.clients.push(item);
            });
          } else {
            // this.clients.length ? null : (this.placeholder = true);
            if (!this.clients.length) {
              this.placeholder = true;
            }
          }
          this.paymenttypefilterstatus = null;
          this.blockfilterstatus = null;
          this.blockfilterplaceholder = null;
          this.orderbyfilterstatus = null;
          this.ordertypefilterstatus = null;
        } else {
          this.placeholder = true;
        }

        this.scrolling = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  clearfield(): void {
    this.skip = 0;
    this.isoverviewloading = true;
    this.issearchapplied = false;
    this.showClearButton = false;
    this.searchfield = "";
    this.clients = [];
    this.fetchAllContractorsList();
  }
}
