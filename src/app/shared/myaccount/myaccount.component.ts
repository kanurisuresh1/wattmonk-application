import { Location } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { EditprofiledialogComponent } from "src/app/auth/editprofiledialog/editprofiledialog.component";
import { AddcoinsdialogComponent } from "src/app/home/dashboard/profile/addcoinsdialog/addcoinsdialog.component";
import { SavenewpasswordComponent } from "src/app/home/dashboard/profile/savenewpassword/savenewpassword.component";
import { ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import {
  AuthenticationService,
  DesignService,
  GenericService
} from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";

@Component({
  selector: "app-myaccount",
  templateUrl: "./myaccount.component.html",
  styleUrls: ["./myaccount.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyaccountComponent implements OnInit {
  location: Location;
  viewAllButtonVisible = true;
  mobile_menu_visible: any = 0;
  loggedinUser: User;
  userrole: string = "";
  isadmin = true;
  isPeEngineer = false;
  isClient = false;

  isWalletDetails: boolean = false;
  addCash: boolean = false;

  isClientAdmins: boolean;
  isOtherUsers: boolean;
  getclientsrole = 0;
  dropMenuOptions = false;
  currentUrl: any;
  isPrepaidClient = false;
  iscontracterSuperAdmin = ROLES.ContractorSuperAdmin;
  dialogRef: any;
  show: boolean = false;
  localUserValue: any;
  userinitials = "";

  constructor(
    public dialog: MatDialog,
    public designService: DesignService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private authService: AuthenticationService,
    public genericService: GenericService,
    private changeDetectorRef: ChangeDetectorRef,
    private commonService: CommonService
  ) {
    this.loggedinUser = this.authService.currentUserValue.user;
    this.localUserValue = JSON.parse(localStorage.getItem("currentUser"));
    // let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // currentUser.user= this.loggedinUser;
    // localStorage.setItem("currentUser",JSON.stringify(currentUser));
    if (
      (this.localUserValue.user.role.id == ROLES.ContractorSuperAdmin ||
        this.loggedinUser.role.id == ROLES.ContractorAdmin || this.loggedinUser.role.id == ROLES.SuccessManager) &&
      this.localUserValue.user.isonboardingcompleted
    ) {
      this.commonService.userData(this.loggedinUser.id).subscribe(
        (response) => {
          this.loggedinUser = response;

          const currentUser = JSON.parse(localStorage.getItem("currentUser"));
          currentUser.user = response;
          localStorage.setItem("currentUser", JSON.stringify(currentUser));

          if (
            this.loggedinUser.role.id == ROLES.ContractorAdmin ||
            this.loggedinUser.role.id == ROLES.SuccessManager ||
            this.loggedinUser.role.id == ROLES.ContractorSuperAdmin
          ) {
            this.isClientAdmins = true;
          } else {
            this.isClientAdmins = false;
          }
          if (
            this.loggedinUser.parent.ispaymentmodeprepay &&
            this.loggedinUser.parent.isonboardingcompleted &&
            (this.isClientAdmins ||
              this.loggedinUser.role.id == ROLES.BD ||
              this.loggedinUser.role.id == ROLES.TeamHead)
          ) {
            this.isWalletDetails = true;
          } else {
            this.isWalletDetails = false;
          }
          if (
            this.loggedinUser.parent.ispaymentmodeprepay &&
            this.loggedinUser.parent.isonboardingcompleted &&
            this.isClientAdmins
          ) {
            this.addCash = true;
          } else {
            this.addCash = false;
          }
          this.changeDetectorRef.detectChanges();
        },
        () => {
          if (
            this.loggedinUser.role.id == ROLES.ContractorAdmin ||
            this.loggedinUser.role.id == ROLES.SuccessManager ||
            this.loggedinUser.role.id == ROLES.ContractorSuperAdmin
          ) {
            this.isClientAdmins = true;
          } else {
            this.isClientAdmins = false;
          }
          if (
            this.loggedinUser.parent.ispaymentmodeprepay &&
            this.loggedinUser.parent.isonboardingcompleted &&
            (this.isClientAdmins ||
              this.loggedinUser.role.id == ROLES.BD ||
              this.loggedinUser.role.id == ROLES.TeamHead)
          ) {
            this.isWalletDetails = true;
          } else {
            this.isWalletDetails = false;
          }
          if (
            this.loggedinUser.parent.ispaymentmodeprepay &&
            this.loggedinUser.parent.isonboardingcompleted &&
            this.isClientAdmins
          ) {
            this.addCash = true;
          } else {
            this.addCash = false;
          }
        }
      );
    }
    if (
      this.loggedinUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedinUser.role.id == ROLES.ContractorAdmin ||
      this.loggedinUser.role.id == ROLES.SuccessManager ||
      this.loggedinUser.role.id == ROLES.Master ||
      (this.loggedinUser.role.id == ROLES.BD &&
        this.loggedinUser.parent.id != 232) ||
      (this.loggedinUser.role.id == ROLES.TeamHead &&
        this.loggedinUser.parent.id != 232)
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }

    /*     this.eventEmitterService.profilerefresh.subscribe((res)=>{
      console.log(res);
      this.localUserValue = JSON.parse(localStorage.getItem('currentUser'));
      console.log(this.localUserValue);
      if(this.localUserValue.user.parent.ispaymentmodeprepay && this.localUserValue.user.parent.isonboardingcompleted && (this.isClientAdmins || this.loggedinUser.role.id == ROLES.BD || this.loggedinUser.role.id == ROLES.TeamHead)){
        this.isWalletDetails = true;
      }
      else{
        this.isWalletDetails = false;
      }
      if(this.loggedinUser.parent.ispaymentmodeprepay && this.loggedinUser.parent.isonboardingcompleted && this.isClientAdmins){
        this.addCash = true;
      }
      else{
        this.addCash = false;
      }
      
      this.changeDetectorRef.detectChanges();    }) */
    // this.loggedinUser = this.authService.currentUserValue.user;
    // this.localUserValue = JSON.parse(localStorage.getItem('currentUser'));
    this.isadmin = genericService.isUserAdmin(this.loggedinUser);
    this.userinitials = this.genericService.getInitials(
      this.loggedinUser.firstname,
      this.loggedinUser.lastname
    );
  }

  ngOnInit(): void {
    this.rolenames();

    // this.teamService.getClientRole(this.loggedinUser.parent.id).subscribe(
    //   response => {
    //     this.getclientsrole = response.length;

    //     if (response.length > 0 && response[0].client.id != 232) {
    //       let specificclientid;
    //       if (response[0].id && response[0].client.id != 232) {
    //         specificclientid = response[0].client.id;
    //       } else {
    //         specificclientid = '';
    //       }

    //       if (
    //         this.loggedinUser.role.id == 3 &&
    //         this.loggedinUser.parent.id == specificclientid
    //       ) {
    //         this.userrole = "Sales Manager";
    //       } else if (
    //         this.loggedinUser.role.id == 9 &&
    //         this.loggedinUser.parent.id == specificclientid
    //       ) {
    //         this.userrole = "Sales Representative";
    //       } else if (
    //         this.loggedinUser.role.id == 15 &&
    //         this.loggedinUser.parent.id == specificclientid
    //       ) {
    //         this.userrole = "Master Electrician";
    //       } else if (
    //         this.loggedinUser.role.id == 6 &&
    //         this.loggedinUser.parent.id == specificclientid
    //       ) {
    //         this.userrole = "Super Admin";
    //       } else if (
    //         this.loggedinUser.role.id == 7 &&
    //         this.loggedinUser.parent.id == specificclientid
    //       ) {
    //         this.userrole = "Admin";
    //       } else {
    //         this.userrole = this.loggedinUser.role.name;
    //       }

    //     } else {
    //       if (this.loggedinUser.role.id == 10) {
    //         this.userrole = "Analyst";
    //       } else if (this.loggedinUser.role.id == 9) {
    //         this.userrole = "Surveyor";
    //       } else if (this.loggedinUser.role.id == 4 || this.loggedinUser.role.id == 6) {
    //         this.userrole = "Super Admin";
    //       } else if (this.loggedinUser.role.id == 5 || this.loggedinUser.role.id == 7) {
    //         this.userrole = "Admin";
    //       } else if (this.loggedinUser.role.id == 3) {
    //         this.userrole = "Design Manager";
    //       } else {
    //         this.userrole = this.loggedinUser.role.name;
    //       }
    //     }

    //   },
    //   error => {
    //     //this.notifyService.showError(error, "Error");
    //   }
    // );
  }

  rolenames(): void {
    if (this.loggedinUser.role.name == "Peengineer") {
      this.userrole = "PE Engineer";
    } else if (this.loggedinUser.role.name == "ContractorSuperAdmin") {
      this.userrole = "Super Admin";
    } else if (this.loggedinUser.role.name == "WattmonkAdmin") {
      this.userrole = "Admin";
    } else if (this.loggedinUser.role.name == "ContractorAdmin") {
      this.userrole = "Admin";
    } else if (this.loggedinUser.role.name == "SuperAdmin") {
      this.userrole = "Super Admin";
    } else if (this.loggedinUser.role.name == "Surveyors") {
      this.userrole = "Surveyor";
    } else {
      this.userrole = this.loggedinUser.role.name;
    }
  }

  preventBack(): void {
    window.history.forward();
  }

  handleusersignout(): void {
    localStorage.clear();
    //this.router.navigate(['/auth/login']);

    window.location.href = "/auth/login";
    setTimeout(function () {
      "preventBack()";
    }, 0);
    window.onunload = function (e) {
      // null;
      e.preventDefault();
    };

  }
  /*toogleProfileSection() {
    this.isProfileSecOption = !this.isProfileSecOption

    let profileBox = document.getElementById('profileBox').style;
    console.log('cross',(profileBox.width == '30%'))
    // let body: any = document.getElementsByTagName("BODY")[0];

    if(profileBox.width != '30%') {
        profileBox.width = '30%'
      }else{
        profileBox.width = '0%';
      }
  }*/

  changepasDialog(): void {
    //  this.toogleProfileSection();
    const dialogRef = this.dialog.open(SavenewpasswordComponent, {
      width: "35%",
      panelClass: "white-modalbox",
      autoFocus: false,
      data: { dialog: true },
    });

    dialogRef.afterClosed().subscribe(() => {
      //  console.log('dialog closed')
    });
    dialogRef.disableClose = true;
  }

  editprofileDialog(): void {
    // this.toogleProfileSection();
    const dialogRef = this.dialog.open(EditprofiledialogComponent, {
      width: "45%",
      autoFocus: false,
      data: { isdatamodified: true, user: User },
      //panelClass: 'white-modalbox'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdatamodified) {
        //this.authService.currentUserValue.user = result.user;
        this.loggedinUser = result.user;
        this.changeDetectorRef.detectChanges();
        const currUrl = this.router.url;
        // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        // this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currUrl]);
      }
    });
    dialogRef.disableClose = true;
  }

  AddWalletDialog(): void {
    // this.toogleProfileSection();
    const dialogRef = this.dialog.open(AddcoinsdialogComponent, {
      width: "45%",
      autoFocus: false,
      data: {
        isdatamodified: true,
        user: User,
        paymenttitle: "Add money to wallet",
      },
      panelClass: "white-modalbox",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.isdatamodified) {
        this.loggedinUser.parent.amount = result.user.amount;
        // this.localUserValue.user.parent.amount = result.user.amount;
        this.changeDetectorRef.detectChanges();
      }
    });
    dialogRef.disableClose = true;
  }
  onCloseClick(): void {
    this._snackBar.dismiss();
  }
}
