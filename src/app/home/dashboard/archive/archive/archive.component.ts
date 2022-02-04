import { formatDate } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import {
  AuthenticationService,
  ContractorService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { ArchiveService } from "src/app/_services/archive.service";

@Component({
  selector: "app-archive",
  templateUrl: "./archive.component.html",
  styleUrls: ["./archive.component.scss"],
})
export class ArchiveComponent implements OnInit {
  @ViewChild("matselect") matselect;
  @ViewChild("calendarpicker") trigger;

  allArchives = [];
  dataSource = [];
  companyList = [];
  designerList = [];
  searchdesignerList = [];

  tableColumns = [
    "checked",
    "Id",
    "name",
    "type",
    "company",
    "address",
    "email",
    "updated_at",
  ];
  archiveTypeOption = [
    { name: "Automated", checked: false, value: "automated" },
    { name: "Manual", checked: false, value: "manual" },
  ];
  taskStatusOption = [
    { name: "New", checked: false, value: "new" },
    { name: "Revised", checked: false, value: "revised" },
  ];
  taskTypeOption = [
    { name: "Permit", checked: false, value: "permit" },
    { name: "Sales Proposal", checked: false, value: "prelim" },
    { name: "PE Stamp", checked: false, value: "pestamp" },
  ];

  searcharchive = "";
  searchdata = "";
  searchcompany = "";

  selectedArchives = [];
  downloadArchive = false;

  limit = 15;
  start = 0;
  skip = 0;
  filterstart = 0;
  searchstart = 0;
  loggedInUser;
  paramdata = "";

  isoverviewloading = true;
  placeholder = false;
  isfilterdata = false;
  issearchdata = false;
  scrolling = false;
  isLoading = false;
  taskType: string = null;
  archiveType: string = null;
  taskStatus: string = null;
  fromDate: string = null;
  toDate: string = null;
  company: string = null;
  designer: string = null;

  today = new Date();

  constructor(
    public archiveService: ArchiveService,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthenticationService,
    private contractorService: ContractorService,
    public loader: LoaderService,
    private notifyService: NotificationService,
    private loaderservice: LoaderService
  ) {
    this.loggedInUser = this.authService.currentUserValue.user;
  }

  ngOnInit(): void {
    this.getallarchives();
    if (this.loggedInUser.parent.id == 232) {
      this.fetchAllContractorsList();
    } else {
      this.alldesignerlist();
    }
  }

  /**  it is for all the archives when module 
     open for the firt time it has no filter*/
  getallarchives(): void {
    let searchdata;

    if (this.loggedInUser.parent.id == 232) {
      searchdata = "archives?_limit=" + this.limit + "&_start=" + this.start;
    } else {
      searchdata =
        "archives?company=" +
        this.loggedInUser.parent.id +
        "&_limit=" +
        this.limit +
        "&_start=" +
        this.start;
    }

    this.archiveService.getallarchive(searchdata).subscribe(
      (response) => {
        this.scrolling = false;
        if (response.length > 0) {
          response.map((item) => {
            item["checked"] = false;
            if (item.tasktype == "prelim") {
              item.tasktype = "Sales Proposal";
            }
            this.dataSource.push(item);
          });

          this.dataSource.sort((design_a, design_b) => {
            const date_A = new Date(design_a.deliverydate).getTime(),
              date_B = new Date(design_b.deliverydate).getTime();
            return date_B - date_A;
          });

          this.isoverviewloading = false;
          this.allArchives = [...this.dataSource];
          this.placeholder = false;
          this.changeDetectorRef.detectChanges();
        } else {
          if (!this.allArchives.length) {
            this.placeholder = true;
          }
          this.isoverviewloading = false;
          this.changeDetectorRef.detectChanges();
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
        this.isoverviewloading = false;
        this.placeholder = false;
      }
    );
  }

  /**  it is for all the company list when the login
     user parent id is 232 */
  fetchAllContractorsList(): void {
    let searchdata = "limit=" + this.limit + "&skip=" + this.skip;
    this.contractorService.getClientSuperadmin(searchdata).subscribe(
      (response) => {
        response.map((item, index) => {
          this.companyList.push(item);
          this.companyList[index]["checked"] = false;
        });
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  /**  it is for all the creator list of logged in user
   * if logged in user is of type client then it will call
   * automatically but if the logged in user parent id is 232
   * then it will call by selecting the company
   */
  alldesignerlist(): void {
    let creatorsId = "";
    if (this.loggedInUser.parent.id != 232) {
      creatorsId = this.loggedInUser.parent.id;
    } else {
      creatorsId = this.company;
    }
    this.archiveService.designerList(creatorsId).subscribe(
      (response) => {
        response.map((item) => {
          item["checked"] = false;
          this.searchdesignerList.push(item);
          this.designerList.push(item);
        });
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  /**  if we select a archive in table then to clear
   * the selected archives we clear all things and
   * false the checked condition from here.
   */
  clearselectedarchives(): void {
    this.selectedArchives = [];
    this.allArchives.map((item) => (item.checked = false));
  }

  /**  for selecting all the archives from the table
   * and unselect them from the same button.
   */

  total = 0;
  selectAllArchives(archiveType, element, index): void {
    if (archiveType == "all") {
      if (this.selectedArchives.length < this.allArchives.length) {
        this.selectedArchives = [];
        this.allArchives.map((item, ind) => {
          this.total += 1;
          item.checked = true;
          this.selectedArchives.push({ id: item.id, index: ind });
        });
      } else {
        this.allArchives.map((item) => {
          item.checked = false;
          this.total = 0;
          this.selectedArchives = [];
        });
      }
    } else if (archiveType == "single") {
      if (!element.checked) {
        element.checked = true;
        this.selectedArchives.push({ id: element.id, index: index });
      } else {
        element.checked = false;
        this.selectedArchives.filter((item, ind) => {
          if (item.id == element.id) {
            this.selectedArchives.splice(ind, 1);
          }
        });
      }
    }
  }

  /**while checking and unchecking the checkbox of filter
   * all the functionality is in this one if user check the box
   * 1 time or again click on same box again.
   */
  filtercheckboxvalues(filter, index): void {
    this.matselect.open();
    this.filterstart = 0;
    if (filter == "archive option") {
      this.archiveTypeOption.map((item, ind) => {
        if (ind == index) {
          if (!item.checked) {
            item.checked = true;
            this.archiveType = item.value;
          } else {
            item.checked = false;
            this.archiveType = null;
          }
        } else {
          item.checked = false;
        }
      });
    } else if (filter == "status") {
      this.taskStatusOption.map((item, ind) => {
        if (ind == index) {
          if (!item.checked) {
            item.checked = true;
            this.taskStatus = item.value;
          } else {
            item.checked = false;
            this.taskStatus = null;
          }
        } else item.checked = false;
      });
    } else if (filter == "type") {
      this.taskTypeOption.map((item, ind) => {
        if (ind == index) {
          if (!item.checked) {
            item.checked = true;
            this.taskType = item.value;
          } else {
            item.checked = false;
            this.taskType = null;
          }
        } else item.checked = false;
      });
    } else if (filter == "company") {
      this.companyList.map((item, ind) => {
        if (ind == index) {
          if (!item.checked) {
            item.checked = true;
            this.company = item.id;
            this.searchdesignerList = [];
            this.designerList = [];
            this.alldesignerlist();
          } else {
            item.checked = false;
            this.company = null;
          }
        } else item.checked = false;
      });
    } else if (filter == "designer") {
      this.designerList.map((item, ind) => {
        if (ind == index) {
          if (!item.checked) {
            item.checked = true;
            this.designer = item.id;
          } else {
            item.checked = false;
            this.designer = null;
          }
        } else item.checked = false;
      });
    }

    if (filter == "submit") {
      this.dataSource = [];
      this.searchfilterdata();
    }
  }

  //**When filter is applied to unselect all the filters. */
  clearcheckboxvalues(filter): void {
    if (filter == "all" && this.isfilterdata) {
      this.archiveTypeOption.map((item) => {
        item.checked = false;
      });
      this.taskStatusOption.map((item) => {
        item.checked = false;
      });
      this.taskTypeOption.map((item) => {
        item.checked = false;
      });

      this.archiveType = null;
      this.taskStatus = null;
      this.taskType = null;
      this.company = null;
      this.designer = null;

      this.fromDate = "";
      this.toDate = "";
      this.paramdata = "";
      this.start = 0;
      this.skip = 0;
      this.filterstart = 0;
      this.dataSource = [];
      this.allArchives = [];
      this.designerList = [];
      this.searchdesignerList = [];
      this.getallarchives();
      this.matselect.close();
      this.changeDetectorRef.detectChanges();
    } else {
      this.matselect.close();
    }
    this.clearinputfields("designer");
    this.isfilterdata = false;
    this.loaderservice.show();
  }

  //** on searching in input fields same function is use */
  searchinputArchives(searchtype, value): void {
    if (searchtype == "tablesearch") {
      this.dataSource = [];
      this.clearcheckboxvalues("all");
      this.tablesearchfieldarchives();
    }
    if (searchtype == "company") {
      let postData = {
        keyword: this.searchcompany,
        role: "6",
      };
      this.contractorService.getSearchResults(postData).subscribe(
        (response) => {
          if (response) {
            this.isfilterdata = true;
            this.companyList = [];
            if (response.length > 0) {
              response.map((item) => {
                this.companyList.push(item);
              });
            }
          }
          this.changeDetectorRef.detectChanges();
        },
        () => {
          this.notifyService.showError("Error", "Error");
        }
      );
    }
    if (searchtype == "designer") {
      this.designerList = [];
      this.searchdesignerList.filter((item) => {
        if (
          (item.firstname.length &&
            item.firstname.toUpperCase().indexOf(value.toUpperCase()) == 0) ||
          (item.lastname.length &&
            item.lastname.toUpperCase().indexOf(value.toUpperCase()) == 0)
        ) {
          this.designerList.push(item);
        }
      });
    }
  }

  //** for table search api archive api code is here. */
  tablesearchfieldarchives(): void {
    let searchparam = "";

    if (this.loggedInUser.parent.id == 232) {
      searchparam =
        "archives?_limit=" +
        this.limit +
        "&_start=" +
        this.searchstart +
        "&_q=" +
        this.searcharchive;
    } else {
      searchparam =
        "archives?company=" +
        this.loggedInUser.parent.id +
        "&_limit=" +
        this.limit +
        "&_start=" +
        this.searchstart +
        "&_q=" +
        this.searcharchive;
    }

    this.archiveService.filterarchive(searchparam).subscribe((response) => {
      this.scrolling = false;
      this.issearchdata = true;
      if (response.length) {
        response.map((item) => {
          item["checked"] = false;
          this.dataSource.push(item);
        });

        this.dataSource.sort((design_a, design_b) => {
          const date_A = new Date(design_a.deliverydate).getTime(),
            date_B = new Date(design_b.deliverydate).getTime();
          return date_B - date_A;
        });

        this.placeholder = false;
        this.allArchives = [];
        this.allArchives = [...this.dataSource];
        this.changeDetectorRef.detectChanges();
      } else {
        if (!this.dataSource.length) {
          this.placeholder = true;
        }
      }
    });
  }

  //** On submitting the filter button */
  searchfilterdata(): void {
    let searchparam = "";

    let error = false;
    if (this.issearchdata) {
      this.isoverviewloading = true;
      this.searcharchive = "";
      this.searchstart = 0;
      this.issearchdata = false;
    }

    if (this.taskType) {
      searchparam = "tasktype=" + this.taskType + "&";
    }

    if (this.archiveType) {
      searchparam = searchparam + "archivetype=" + this.archiveType + "&";
    }

    if (this.taskStatus) {
      searchparam = searchparam + "taskstatus=" + this.taskStatus + "&";
    }

    if (this.fromDate || this.toDate) {
      searchparam =
        searchparam +
        "deliverydate_gte=" +
        (this.fromDate ? this.fromDate : (error = true)) +
        "&" +
        "deliverydate_lte=" +
        (this.toDate
          ? this.toDate + "&"
          : (this.toDate =
            formatDate(this.today.toString(), "yyyy-MM-dd", "en-US") + "&"));
    }

    if (this.designer) {
      searchparam = searchparam + "creatorid=" + this.designer + "&";
    }

    if (this.company && this.loggedInUser.parent.id == 232) {
      searchparam = "company=" + this.company + "&" + searchparam;
    }

    if (this.loggedInUser.parent.id == 232) {
      searchparam =
        "archives?" +
        searchparam +
        "_limit=" +
        this.limit +
        "&_start=" +
        this.filterstart;
    } else {
      searchparam =
        "archives?company=" +
        this.loggedInUser.parent.id +
        "&" +
        searchparam +
        "_limit=" +
        this.limit +
        "&_start=" +
        this.filterstart;
    }
    if (!error) {
      if (
        this.fromDate && this.toDate
          ? Date.parse(this.fromDate) < Date.parse(this.toDate)
          : true
      ) {
        this.archiveService.filterarchive(searchparam).subscribe(
          (response) => {
            this.isfilterdata = true;
            this.scrolling = false;
            if (response.length) {
              response.map((item) => {
                item["checked"] = false;
                if (item.tasktype == "prelim") {
                  item.tasktype = "Sales Proposal";
                }
                this.dataSource.push(item);
              });

              this.dataSource.sort((design_a, design_b) => {
                const date_A = new Date(design_a.deliverydate).getTime(),
                  date_B = new Date(design_b.deliverydate).getTime();
                return date_B - date_A;
              });

              // this.clearinputfields("designer");
              this.placeholder = false;
              this.allArchives = [];
              this.allArchives = [...this.dataSource];
              this.changeDetectorRef.detectChanges();
            } else {
              if (!this.dataSource.length) {
                this.placeholder = true;
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

  calenderValue(index, date: string): void {
    const input = formatDate(date.toString(), "yyyy-MM-dd", "en-US");
    if (index == "startdate") {
      this.fromDate = input;
    } else if (index == "enddate") {
      this.toDate = input;
    }
  }

  oncompanyScroll(): void {
    //  this.loader.isLoading = new BehaviorSubject<boolean>(false);
    this.skip += 10;

    this.fetchAllContractorsList();
  }

  ontableScroll(): void {
    if (this.isfilterdata) {
      this.scrolling = true;
      // this.loader.isLoading = new BehaviorSubject<boolean>(false);
      this.filterstart += 15;
      this.searchfilterdata();
    }

    if (this.issearchdata) {
      this.scrolling = true;
      // this.loader.isLoading = new BehaviorSubject<boolean>(false);
      this.searchstart += 15;
      this.tablesearchfieldarchives();
    }

    if (!this.isfilterdata && !this.issearchdata) {
      this.scrolling = true;
      // this.loader.isLoading = new BehaviorSubject<boolean>(false);
      this.start += 15;
      this.changeDetectorRef.detectChanges();
      this.getallarchives();
    }
  }

  tounarchivedesign(): void {
    // this.isLoading =true;
    this.loaderservice.show();
    let unarchives: number[] = [];
    this.changeDetectorRef.detectChanges();
    this.selectedArchives.filter((item) => {
      unarchives.push(item.id);
    });
    let postData = {
      archiveids: unarchives,
    };

    this.archiveService.unarchiveDesign(postData).subscribe(() => {
      this.selectedArchives = [];
      if (this.isfilterdata) {
        this.dataSource = this.dataSource.filter(
          (item) => !unarchives.includes(item.id)
        );

        this.allArchives = this.dataSource;
        if (this.dataSource.length < 12 && this.dataSource.length > 10) {
          this.filterstart += 15;
          this.searchinputArchives("tablesearch", "event");
        }
        if (!this.dataSource.length) {
          this.dataSource = [];
          this.filterstart = 0;
          this.searchinputArchives("tablesearch", "event");
        }
      }

      if (this.issearchdata) {
        this.dataSource = this.dataSource.filter(
          (item) => !unarchives.includes(item.id)
        );

        this.allArchives = this.dataSource;

        if (this.dataSource.length < 12 && this.dataSource.length > 10) {
          this.searchstart += 15;
          this.tablesearchfieldarchives();
        }

        if (!this.dataSource.length) {
          this.dataSource = [];
          this.searchstart = 0;
          this.tablesearchfieldarchives();
        }
      }

      if (!this.isfilterdata && !this.issearchdata) {
        this.dataSource = this.dataSource.filter(
          (item) => !unarchives.includes(item.id)
        );
        this.allArchives = this.dataSource;
        if (this.dataSource.length < 12 && this.dataSource.length > 10) {
          this.start += 15;
          this.getallarchives();
        } else if (!this.dataSource.length) {
          this.dataSource = [];
          this.isoverviewloading = true;
          this.start = 0;
          this.getallarchives();
        }
      }

      this.allArchives = this.allArchives.filter(
        (item) => !unarchives.includes(item.id)
      );
      if (
        (!this.allArchives.length && !this.isfilterdata) ||
        (this.allArchives.length < 11 && !this.isfilterdata)
      ) {
        if (!this.allArchives.length) {
          this.dataSource = [];
        }
      }

      this.notifyService.showSuccess(
        "Designs unarchived successfully",
        "Success"
      );
      // this.isLoading =false;
      this.loaderservice.hide();
    });
  }

  /** for clearing the landing page search field
   and in filter company list. */
  clearinputfields(value): void {
    if (value == "designer") {
      if (this.isfilterdata) {
        this.searchcompany = "";
        this.companyList = [];
        this.searchdesignerList = [];

        if (this.loggedInUser.parent.id == 232) {
          this.designerList = [];
          this.fetchAllContractorsList();
        } else {
          this.alldesignerlist();
        }
      } else {
        this.searchcompany = "";
      }
    }

    if (value == "tablesearch") {
      if (this.issearchdata) {
        this.isoverviewloading = true;
        this.searcharchive = "";
        this.searchstart = 0;
        this.start = 0;
        this.dataSource = [];
        this.allArchives = [];
        this.issearchdata = false;
        this.getallarchives();
      } else {
        this.searcharchive = "";
      }
    }
  }
}
