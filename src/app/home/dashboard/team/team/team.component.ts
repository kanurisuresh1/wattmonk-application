import { SelectionModel } from "@angular/cdk/collections";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { BehaviorSubject } from "rxjs";
import { ConfirmationsnackbarComponent } from "src/app/shared/confirmationsnackbar/confirmationsnackbar.component";
import { ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import { ClientRole } from "src/app/_models/clientrole";
import { Groups } from "src/app/_models/groups";
import {
  AuthenticationService,
  GenericService,
  LoaderService,
  NotificationService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";
import { TeamService } from "src/app/_services/team.service";
import { AddgroupdialogComponent } from "../addgroupdialog/addgroupdialog.component";
import { AddteammemberdialogComponent } from "../addteammemberdialog/addteammemberdialog.component";
import { AssignadmindialogComponent } from "../assignadmindialog/assignadmindialog.component";
import { AssigndesignmanagerdialogComponent } from "../assigndesignmanagerdialog/assigndesignmanagerdialog.component";
import { GroupdetaildialogComponent } from "../groupdetaildialog/groupdetaildialog.component";
import { TasklistingdialogComponent } from "../tasklistingdialog/tasklistingdialog.component";
import { TeammemberdetaildialogComponent } from "../teammemberdetaildialog/teammemberdetaildialog.component";

export interface Overview {
  roleName: string;
  roleCount: number;
  active: boolean;
}
@Component({
  selector: "app-team",
  templateUrl: "./team.component.html",
  styleUrls: ["./team.component.scss"],
})
export class TeamComponent implements OnInit {
  isoverviewloading = true;
  isteamdataloading = true;
  isgroupdataloading = true;
  placeholder = false;
  groupplaceholder = false;
  isLoading = false;
  displayedColumns: string[] = ["name", "role", "email", "manage"];
  displayedgroupsColumns: string[] = ["name", "description", "manage"];
  teamMembers: User[] = [];
  filteredTeammembers: User[] = [];
  sidebarteammembers: User[] = [];
  SalesManager: User[] = [];
  teamHead: User[] = [];
  groups: any[] = [];
  filtergroups: any[] = [];
  groupsmembers: any[] = [];
  filteredgroupmembers: any[] = [];
  loggedInUser: User;
  isClient = false;
  allNewDesigns: number = -1;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("grouppaginator", { static: false }) grouppaginator: MatPaginator;
  @ViewChild("groupmatSort", { static: true }) groupsort: MatSort;
  selection = new SelectionModel<User>(true, []);
  admins = 0;
  bds = 0;
  masters = 0;
  designers = 0;
  surveyors = 0;
  analysts = 0;
  peengineer = 0;
  teamheads = 0;
  successmanagers = 0;
  showGroup = false;
  specificclientid;
  selectedoveriewsection = "";
  searchmember: any;
  selctedgroup: any;
  searchgroupmember;

  teamheadid = 0;

  overviewData: Overview[] = [];
  detailtitle = "All Members";
  isGroupSelected = false;
  totalgrouppeoples = "";
  idlemembersselected = false;
  groupindex: number;
  isPesuperadmin = false;
  constructor(
    public dialog: MatDialog,
    private teamService: TeamService,
    private notifyService: NotificationService,
    public genericService: GenericService,
    public authService: AuthenticationService,
    private _snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    private commonservice: CommonService,
    private loaderservice: LoaderService
  ) {
    this.loggedInUser = authService.currentUserValue.user;
    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.loggedInUser.role.id == ROLES.Master ||
      this.loggedInUser.role.id == ROLES.TeamHead ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
    if (
      this.loggedInUser.role.id == ROLES.Admin ||
      this.loggedInUser.role.id == ROLES.SuperAdmin ||
      (this.loggedInUser.role.id == ROLES.BD &&
        this.loggedInUser.parent.id == 232)
    ) {
      this.showGroup = true;
    } else {
      this.showGroup = false;
    }
    if (this.loggedInUser.role.id == ROLES.PESuperAdmin) {
      this.isPesuperadmin = true;
    }
    this.teamheadid = ROLES.TeamHead;
  }

  ngOnInit(): void {
    this.getSpecificClient();
  }

  ngAfterViewInit(): void {
    this.getClientRoles();
  }

  //-----------------------------------------------------------------------------------------

  openAddTeamMemberDialog(): void {
    let width = "50%";
    if (!this.isClient) {
      width = "50%";
    }
    const dialogRef = this.dialog.open(AddteammemberdialogComponent, {
      width: width,
      autoFocus: false,
      disableClose: true,
      panelClass: "white-modalbox",
      data: { isEditMode: false, triggerEditEvent: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.isLoading = false;
      if (result.triggerEditEvent) {
        this.fetchTeamData();
      }
    });
  }

  openAddGroupDialog(): void {
    let width = "35%";
    if (!this.isClient) {
      width = "50%";
    }
    const dialogRef = this.dialog.open(AddgroupdialogComponent, {
      width: width,
      autoFocus: false,
      disableClose: true,
      panelClass: "white-modalbox",
      data: { isEditMode: false, triggerEditEvent: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.isLoading = false;
      if (result.triggerEditEvent) {
        this.fetchGroupData();
      }
    });
  }
  openTeamMemberDetailDialog(element, event): void {
    event.stopPropagation();
    if (!this.isClient && !this.isPesuperadmin) {
      const triggerEditEvent = false;
      const dialogRef = this.dialog.open(TeammemberdetaildialogComponent, {
        width: "37%",
        autoFocus: false,
        disableClose: true,
        data: { user: element, triggerEditEvent: triggerEditEvent },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.triggerEditEvent) {
          this.openEditTeamMemberDialog(element, event);
        }
      });
    }
  }

  openGroupDetailDialog(element): void {
    const triggerEditEvent = false;
    const dialogRef = this.dialog.open(GroupdetaildialogComponent, {
      width: "65%",
      autoFocus: false,
      disableClose: true,
      data: { user: element, triggerEditEvent: triggerEditEvent },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.openEditGroupDialog(element);
      }
    });
  }

  applyFilter(): void {
    const filterValue = this.searchmember.toLowerCase();
    this.teamMembers = this.filteredTeammembers.filter(function (tag) {
      let searchResult;
      const searchByFirstName =
        tag.firstname.toLowerCase().indexOf(filterValue) >= 0;
      const searchByLastName =
        tag.lastname.toLowerCase().indexOf(filterValue) >= 0;
      const fullname = tag.firstname + " " + tag.lastname;
      const searchByFullName = fullname.toLowerCase().indexOf(filterValue) >= 0;

      if (searchByFirstName) {
        searchResult = searchByFirstName;
      } else if (searchByLastName) {
        searchResult = searchByLastName;
      } else if (searchByFullName) {
        searchResult = searchByFullName;
      }
      return searchResult;
    });
  }

  applygroupFilter(): void {
    const filterValue = this.searchgroupmember.toLowerCase();
    this.groupsmembers = this.filteredgroupmembers.filter(function (tag) {
      let searchResult;
      const searchByFirstName =
        tag.firstname.toLowerCase().indexOf(filterValue) >= 0;
      const searchByLastName =
        tag.lastname.toLowerCase().indexOf(filterValue) >= 0;
      const fullname = tag.firstname + " " + tag.lastname;
      const searchByFullName = fullname.toLowerCase().indexOf(filterValue) >= 0;

      if (searchByFirstName) {
        searchResult = searchByFirstName;
      } else if (searchByLastName) {
        searchResult = searchByLastName;
      } else if (searchByFullName) {
        searchResult = searchByFullName;
      }
      return searchResult;
    });
  }
  overviewFilter(filterValue: string, index): void {
    let checkboxselected = false;
    this.isGroupSelected = false;
    for (let i = 0; i < this.groups.length; i++) {
      this.groups[i].isselected = false;
    }
    if (index != null) {
      for (let i = 0; i < this.overviewData.length; i++) {
        if (i === index) {
          this.overviewData[i].active = true;
        } else {
          this.overviewData[i].active = false;
        }
      }
    }
    this.detailtitle = filterValue;
    if (filterValue == "All") {
      filterValue = "";
      this.detailtitle = "All Members";
      checkboxselected = this.idlemembersselected;
    }

    this.selectedoveriewsection = filterValue;
    filterValue = filterValue.trim().toLowerCase();

    this.teamMembers = this.filteredTeammembers.filter(function (tag) {
      const searchbyrole =
        tag.role.displayname.toLowerCase().indexOf(filterValue) >= 0;
      const searchResult = searchbyrole;

      return searchResult;
    });

    if (checkboxselected) {
      this.teamMembers = this.teamMembers.filter(function (tag) {
        if (tag.activejobs === null || tag.activejobs == 0) {
          return tag;
        }
      });
    }

    /*  else {
       
       this.groupsmembers = this.filteredgroupmembers.filter(function (tag) {
         
         let searchResult;
         let searchbyrole = tag.rolename.toLowerCase().indexOf(filterValue) >= 0;
         
         searchResult = searchbyrole;
         console.log("searchResult", searchResult);
         return searchResult;
       });
     } */
  }

  //-----------------------------------------------------------------------------------------

  fetchTeamData(): void {
    this.SalesManager.length = 0;
    this.teamHead.length = 0;
    this.isoverviewloading = true;
    this.isteamdataloading = true;
    this.teamService.getTeamData().subscribe(
      (response) => {
        if (response.length > 0) {
          this.placeholder = false;
          this.teamMembers = this.fillinDynamicData(response);
          this.sidebarteammembers = this.fillinDynamicData(response);
          response.forEach((element) => {
            this.isoverviewloading = false;
            if (element.role.id == 3) {
              this.SalesManager.push(element);
            }
          });
          response.forEach((element) => {
            if (element.role.id == ROLES.TeamHead) {
              this.teamHead.push(element);
            }
          });
          this.resetOverviewData();
          this.constructOverviewData(this.teamMembers);
          this.filteredTeammembers = this.teamMembers;
          if (!this.isClient) {
            this.fetchGroupData();
          }
        } else {
          this.placeholder = true;
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fetchGroupData(): void {
    this.teamService.getGroupData().subscribe(
      (response) => {
        //console.log(response);
        if (response.length > 0) {
          this.groupplaceholder = false;
          this.groups = response;
          let isgroupselected = false;
          this.groups.forEach((element) => {
            element.isselected = isgroupselected;
          });

          this.isgroupdataloading = false;
          /*  this.selctedgroup = this.groups[0]
           this.groups[0].clients.forEach(element => {
             this.groupsmembers.push(element)
           });
           this.groups[0].members.forEach(element => {
             this.groupsmembers.push(element)
           });
           this.groupsmembers.forEach(element => {
             element.rolename = this.genericService.getRoleName(element.role)
           });
           console.log(this.groupsmembers)
          this.resetOverviewData();
           this.groupOverviewData(this.groupsmembers);
           this.filteredgroupmembers = this.groupsmembers */
          this.changeDetectorRef.detectChanges();
          this.filtergroups = this.groups;
          // this.resetOverviewData();
          // this.constructOverviewData();
        } else {
          this.isgroupdataloading = false;
          this.groupplaceholder = true;
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  onGroupSelect(group: any, index: number): void {
    this.groupindex = index;
    this.isteamdataloading = true;
    for (let i = 0; i < this.overviewData.length; i++) {
      this.overviewData[i].active = false;
    }
    for (let i = 0; i < this.groups.length; i++) {
      if (i == index) {
        this.groups[i].isselected = true;
      } else {
        this.groups[i].isselected = false;
      }
    }
    this.detailtitle = group.name;
    this.isGroupSelected = true;
    this.selctedgroup = group;
    this.groupsmembers.length = 0;
    group.clients.forEach((element) => {
      this.groupsmembers.push(element);
    });
    group.members.forEach((element) => {
      this.groupsmembers.push(element);
    });

    this.groupsmembers = this.fillinGroupDynamicData(this.groupsmembers);
    this.filteredgroupmembers = this.groupsmembers;
    this.totalgrouppeoples = this.groupsmembers.length + " Peoples";
    this.isteamdataloading = false;

    this.changeDetectorRef.detectChanges();
  }

  fillinDynamicData(records: User[]): User[] {
    records.forEach((element) => {
      element.rolename = this.genericService.getRoleName(element.role.id);
    });

    return records;
  }

  fetchGroupDataAfterEdit(): void {
    let group: any;
    this.isgroupdataloading = true;
    this.teamService.getGroupData().subscribe(
      (response) => {
        //console.log(response);
        if (response.length > 0) {
          this.groupplaceholder = false;
          this.groups = response;
          let isgroupselected = false;
          this.groups.forEach((element, index) => {
            if (this.groupindex == index) {
              element.isselected = true;
              group = element;
            } else {
              element.isselected = isgroupselected;
            }
          });

          this.detailtitle = group.name;
          this.isGroupSelected = true;
          this.selctedgroup = group;
          this.groupsmembers.length = 0;
          group.clients.forEach((element) => {
            this.groupsmembers.push(element);
          });
          group.members.forEach((element) => {
            this.groupsmembers.push(element);
          });
          this.groupsmembers = this.fillinGroupDynamicData(this.groupsmembers);
          this.filteredgroupmembers = this.groupsmembers;
          this.totalgrouppeoples = this.groupsmembers.length + " Peoples";
          this.isteamdataloading = false;
          this.changeDetectorRef.detectChanges();
          this.isgroupdataloading = false;
          /*  this.selctedgroup = this.groups[0]
           this.groups[0].clients.forEach(element => {
             this.groupsmembers.push(element)
           });
           this.groups[0].members.forEach(element => {
             this.groupsmembers.push(element)
           });
           this.groupsmembers.forEach(element => {
             element.rolename = this.genericService.getRoleName(element.role)
           });
           console.log(this.groupsmembers)
          this.resetOverviewData();
           this.groupOverviewData(this.groupsmembers);
           this.filteredgroupmembers = this.groupsmembers */
          this.changeDetectorRef.detectChanges();
          this.filtergroups = this.groups;
          // this.resetOverviewData();
          // this.constructOverviewData();
        } else {
          this.isgroupdataloading = false;
          this.groupplaceholder = true;
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  fillinGroupDynamicData(records: User[]): User[] {
    records.forEach((element) => {
      element.rolename = this.genericService.getRoleName(element.role);
    });

    return records;
  }
  resetOverviewData(): void {
    this.admins = 0;
    this.bds = 0;
    this.teamheads = 0;
    this.masters = 0;
    this.designers = 0;
    this.surveyors = 0;
    this.analysts = 0;
    this.peengineer = 0;
    this.successmanagers = 0;
  }

  constructOverviewData(data): void {
    data.forEach((element) => {
      switch (element.role.id) {
        case ROLES.ContractorAdmin:
          this.admins = this.admins + 1;
          break;
        case ROLES.ContractorSuperAdmin:
          this.admins = this.admins + 1;
          break;
        case ROLES.SuccessManager:
          this.successmanagers = this.successmanagers + 1;
          break;
        case ROLES.Admin:
          this.admins = this.admins + 1;
          break;
        case ROLES.BD:
          this.bds = this.bds + 1;
          break;
        case ROLES.Master:
          this.masters = this.masters + 1;
          break;
        case ROLES.TeamHead:
          this.teamheads = this.teamheads + 1;
          break;
        case ROLES.Designer:
          this.designers = this.designers + 1;
          break;
        case ROLES.Surveyor:
          this.surveyors = this.surveyors + 1;
          break;
        case ROLES.Analyst:
          this.analysts = this.analysts + 1;
          break;
        case ROLES.Peengineer:
          this.peengineer = this.peengineer + 1;
          break;
      }
    });
    this.overviewData = [];
    this.genericService.clientroles.forEach((element) => {
      let roleCount;
      switch (element.displayname) {
        case "Admin":
          roleCount = this.admins;
          break;
        case "Success Manager":
          roleCount = this.successmanagers;
          break;
        case "Design Manager":
          roleCount = this.bds;
          break;
        case "BD":
          roleCount = this.bds;
          break;
        case "Sales Manager":
          roleCount = this.bds;
          break;
        case "Master":
          roleCount = this.masters;
          break;
        case "Team Head":
          roleCount = this.teamheads;
          break;
        case "Designer":
          roleCount = this.designers;
          break;
        case "Surveyor":
          roleCount = this.surveyors;
          break;
        case "Sales Representative":
          roleCount = this.surveyors;
          break;
        case "Analyst":
          roleCount = this.analysts;
          break;
        case "PE Engineer":
          roleCount = this.peengineer;
          break;
        case "Master Electrician":
          roleCount = this.masters;
          break;
      }
      this.overviewData.push({
        roleName: element.displayname,
        roleCount: roleCount,
        active: false,
      });
    });
    let AllOverviewCount = 0;
    this.overviewData.forEach((element) => {
      AllOverviewCount += element.roleCount;
    });
    this.overviewData.push({
      roleName: "All",
      roleCount: AllOverviewCount,
      active: true,
    });

    this.isteamdataloading = false;
    this.isoverviewloading = false;
    this.changeDetectorRef.detectChanges();
  }

  groupOverviewData(data): void {
    data.forEach((element) => {
      switch (element.role) {
        case ROLES.ContractorAdmin:
          this.admins = this.admins + 1;
          break;
        case ROLES.ContractorSuperAdmin:
          this.admins = this.admins + 1;
          break;
        case ROLES.SuccessManager:
          this.successmanagers = this.successmanagers + 1;
          break;
        case ROLES.Admin:
          this.admins = this.admins + 1;
          break;
        case ROLES.BD:
          this.bds = this.bds + 1;
          break;
        case ROLES.Master:
          this.masters = this.masters + 1;
          break;
        case ROLES.TeamHead:
          this.teamheads = this.teamheads + 1;
          break;
        case ROLES.Designer:
          this.designers = this.designers + 1;
          break;
        case ROLES.Surveyor:
          this.surveyors = this.surveyors + 1;
          break;
        case ROLES.Analyst:
          this.analysts = this.analysts + 1;
          break;
        case ROLES.Peengineer:
          this.peengineer = this.peengineer + 1;
      }
    });
  }
  //-----------------------------------------------------------------------------------------

  openConfirmationDialog(user: User, event): void {
    event.stopPropagation();
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        duration: 5000,
        data: {
          message:
            "Are you sure you want to block " +
            user.firstname +
            " " +
            user.lastname +
            " from your team?",
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.teamService.deleteTeamUser("" + user.id).subscribe(
        () => {
          this.teamService.deleteCometChatUser("" + user.id);
          this.notifyService.showSuccess(
            user.firstname +
            " " +
            user.lastname +
            " has been removed successfully from your team.",
            "Success"
          );
          this.removeUserFromList(user);
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }

  DeleteGroup(group: Groups): void {
    const snackbarRef = this._snackBar.openFromComponent(
      ConfirmationsnackbarComponent,
      {
        data: {
          message: "Are you sure you want to remove " + group.name,
          positive: "Yes",
          negative: "No",
        },
      }
    );

    snackbarRef.onAction().subscribe(() => {
      this.teamService.deleteGroup("" + group.id).subscribe(
        () => {
          this.isGroupSelected = false;
          this.groupsmembers = [];
          this.detailtitle = "All Members";
          this.notifyService.showSuccess(
            group.name + " has been removed successfully ",
            "Success"
          );
          this.removeGroupFromList(group);
          this.fetchTeamData();
        },
        (error) => {
          this.notifyService.showError(error, "Error");
        }
      );
    });
  }

  removeUserFromList(user: User): void {
    this.teamMembers.forEach((element) => {
      if (element.id == user.id) {
        this.teamMembers.splice(this.teamMembers.indexOf(element), 1);
      }
    });
    this.resetOverviewData();
    // this.constructOverviewData(this.teamMembers);
    this.fetchTeamData();
    this.changeDetectorRef.detectChanges();
  }

  removeGroupFromList(group: Groups): void {
    this.groups.forEach((element) => {
      if (element.id == group.id) {
        this.groups.splice(this.groups.indexOf(element), 1);

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  //-----------------------------------------------------------------------------------------

  openEditTeamMemberDialog(user: User, event): void {
    event.stopPropagation();
    this.loaderservice.show();
    this.commonservice
      .getSingleUserDetail(user.id)
      .subscribe((Userresponse) => {
        this.commonservice
          .getUserSettings(Userresponse.id)
          .subscribe((response) => {
            if (response.length > 0) {
              this.openEditDialog(Userresponse, response[0]);
            } else {
              this.openEditDialog(Userresponse, null);
            }
          });
        //
      });
  }

  openEditDialog(user: User, userSetting): void {
    let width = "50%";
    if (!this.isClient) {
      width = "50%";
    }
    const dialogRef = this.dialog.open(AddteammemberdialogComponent, {
      width: width,
      autoFocus: false,
      disableClose: true,
      data: {
        isEditMode: true,
        user: user,
        triggerEditEvent: false,
        userSetting: userSetting,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.fetchTeamData();
      }
    });
  }
  openEditGroupDialog(group: User): void {
    let width = "35%";
    if (!this.isClient) {
      width = "50%";
    }
    const dialogRef = this.dialog.open(AddgroupdialogComponent, {
      width: width,
      autoFocus: false,
      disableClose: true,
      data: { isEditMode: true, group: group, triggerEditEvent: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.triggerEditEvent) {
        this.fetchGroupDataAfterEdit();
      }
    });
  }

  overviewClient: ClientRole[] = null;

  getClientRoles(): void {
    this.commonservice
      .getClientRoles(this.loggedInUser.parent.id, this.loggedInUser.role.id)
      .subscribe((response) => {
        if (response.length == 0) {
          this.commonservice
            .getDefaultClientRoles(this.loggedInUser.role.id)
            .subscribe((response) => {
              this.overviewClient = response;
              this.genericService.clientroles = response;
              this.fetchTeamData();
            });
        } else {
          response.forEach((element, i) => {
            if (element.role.id == ROLES.PeAdmin) {
              response.splice(i, 1);
            }
          });
          this.overviewClient = response;
          this.genericService.clientroles = response;
          this.fetchTeamData();
        }
      });
  }
  getSpecificClient(): void {
    this.teamService.getClientRole(this.loggedInUser.parent.id).subscribe(
      (response) => {
        if (response.length > 0 && response[0].client.id != 232) {
          if (response[0].id && response[0].client.id != 232) {
            this.specificclientid = response[0].client.id;
            this.changeDetectorRef.detectChanges();
          } else {
            this.specificclientid = null;
          }
        } else {
          this.specificclientid = null;
        }
      },
      () => {
        //this.notifyService.showError(error, "Error");
      }
    );
  }

  openAssignSalesManager(selectedClient): void {
    const dialogRef = this.dialog.open(AssigndesignmanagerdialogComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      data: { salesManager: this.SalesManager, selectedClient: selectedClient },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.fetchTeamData();
      }
    });
  }
  openAssignAdmin(selectedClient): void {
    const dialogRef = this.dialog.open(AssignadmindialogComponent, {
      width: "50%",
      autoFocus: false,
      disableClose: true,
      data: { teamHead: this.teamHead, selectedClient: selectedClient },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.isConfirmed) {
        this.fetchTeamData();
      }
    });
  }

  openTaskListingDialog(userdata: User, event): void {
    event.stopPropagation();
    this.loaderservice.isLoading = new BehaviorSubject<boolean>(false);
    const dialogRef = this.dialog.open(TasklistingdialogComponent, {
      panelClass: "dialog-container-custom",
      width: "50%",
      height: "70%",
      autoFocus: false,
      disableClose: true,
      data: { data: userdata },
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }
}
