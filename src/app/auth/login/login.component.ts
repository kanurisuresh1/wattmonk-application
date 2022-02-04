import {
  animate,
  state,
  style,
  transition,
  trigger
} from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import * as CryptoJS from "crypto-js";
import { DeviceDetectorService } from "ngx-device-detector";
import { interval, Subscription } from "rxjs";
import { MAILFORMAT, ROLES } from "src/app/_helpers";
import { Feature } from "src/app/_models";
import {
  AuthenticationService,
  GenericService,
  LoaderService,
  PublicService
} from "../../_services";
import { NotificationService } from "../../_services/notification.service";
import { PrivacydialogComponent } from "../privacydialog/privacydialog.component";
import { TermsdialogComponent } from "../termsdialog/termsdialog.component";

@Component({
  selector: "app-login",

  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  animations: [
    trigger("simpleFadeAnimation", [
      state("in", style({ opacity: 1 })),
      transition(":enter", [style({ opacity: 0 }), animate(600)]),
      transition(":leave", animate(600, style({ opacity: 0 }))),
    ]),
  ],
})
export class LoginComponent implements OnInit {
  SECRET = "Encrypted Email and Password";
  dcryptedEmail: string;
  dcryptedpassword: string;

  isLoading = false;

  email = new FormControl("", [
    Validators.required,
    Validators.pattern(MAILFORMAT),
  ]);
  password = new FormControl("", [
    Validators.required,
    Validators.minLength(3),
  ]);

  loginForm: FormGroup;
  hide = true;
  isDesktop = false;

  featuresList: Feature[] = [];
  currentfeature: Feature = new Feature();
  displayedFeatureIndex = 0;
  subscription: Subscription;
  source = interval(4000);
  progressValue = 0;
  featureImageUrl = "../../../assets/featureplaceholder.png";
  keepmesignin: any;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private notifyService: NotificationService,
    private publicService: PublicService,
    private dialog: MatDialog,
    public genericService: GenericService,
    private activatedRoute: ActivatedRoute,
    private deviceService: DeviceDetectorService,
    private loaderservice: LoaderService
  ) {
    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password,
    });
    this.keepmesignin = new FormControl(null, []);
    if (localStorage.getItem("rememberMe") === null) {
      this.keepmesignin.value = true;
      localStorage.setItem("rememberMe", this.keepmesignin.value);
    } else if (localStorage.getItem("rememberMe") == "true") {
      this.keepmesignin.value = true;
    } else if (localStorage.getItem("rememberMe") == "false") {
      this.keepmesignin.value = false;
    }
    // this.autoLogin();
  }

  openTermsDialog(): void {
    const dialogRef = this.dialog.open(TermsdialogComponent, {
      width: "60%",
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }

  openPrivacyDialog(): void {
    const dialogRef = this.dialog.open(PrivacydialogComponent, {
      width: "60%",
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(() => {
      // do nothing.
    });
  }

  onPasswordVisiblityToggle($ev): void {
    $ev.preventDefault();
    $ev.stopPropagation();
    this.hide = !this.hide;
  }

  ngOnInit(): void {
    this.genericService.initializeCometChat();
    this.isDesktop = this.deviceService.isDesktop();
    // if (this.isDesktop){
    //   this.fetchFeaturesList();
    // }

    this.activatedRoute.queryParams.subscribe((params) => {
      const getEmail = params["p1"];
      const getpassword = params["p2"];
      if (getEmail != undefined && getpassword != undefined) {
        this.dcryptedEmail = this.decrypt(getEmail);
        this.dcryptedpassword = this.decrypt(getpassword);

        this.loginForm.patchValue({
          email: this.dcryptedEmail,
          password: this.dcryptedpassword,
        });
      }
    });
  }

  decrypt(text) {
    const reb64 = CryptoJS.enc.Hex.parse(text);
    const bytes = reb64.toString(CryptoJS.enc.Base64);
    const decrypt = CryptoJS.AES.decrypt(bytes, this.SECRET);
    const plain = decrypt.toString(CryptoJS.enc.Utf8);
    return plain;
  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
    // if(this.keepmesignin.value==false){
    //   localStorage.clear();
    //   CometChat.logout();
    //  }
  }

  getEmailErrorMessage(): string | string | string {
    if (this.email.hasError("required")) {
      return "You must enter a value";
    }

    return this.email.hasError("pattern") ? "Please enter a valid email" : "";
  }

  getPasswordErrorMessage(): string | string | string {
    if (this.password.hasError("required")) {
      return "You must enter a value";
    }

    return this.password.hasError("pattern")
      ? "Please enter a valid alphanumeric password."
      : "";
  }

  onLogin($ev): void {
    this.loaderservice.show();
    $ev.preventDefault();
    this.hide = true;
    if (this.loginForm.valid) {
      this.authenticationService
        .loginUser(
          this.loginForm.get("email").value.toLowerCase().trim(),
          this.loginForm.get("password").value
        )
        .subscribe(
          (response) => {
            this.genericService.setRequiredHeaders();

            if (response.user.isdefaultpassword) {
              const navigationExtras: NavigationExtras = {
                queryParams: {
                  code: this.password.value,
                },
              };
              this.router.navigate(["/auth/changepassword"], navigationExtras);
            } else {
              const isadmin = this.genericService.isUserAdmin(response.user);
              if (isadmin) {
                if (
                  response.user.role.id == ROLES.PeAdmin ||
                  response.user.role.id == ROLES.PESuperAdmin
                ) {
                  localStorage.setItem("lastroute", "/home/pestamp/overview");
                  localStorage.setItem("lastroutetitle", "Pestamp");
                  this.router.navigate(["/home/pestamp/overview"]);
                } else {
                  localStorage.setItem("lastroute", "/home/dashboard/overview");
                  this.router.navigate(["/home/dashboard/overview"]);
                }
              } else {
                if (response.user.role.id == ROLES.Designer) {
                  localStorage.setItem(
                    "lastroute",
                    "/home/dashboard/overview/designer"
                  );
                  this.router.navigate(["/home/dashboard/overview/designer"]);
                } else if (response.user.role.id == ROLES.Analyst) {
                  localStorage.setItem(
                    "lastroute",
                    "/home/dashboard/overview/analyst"
                  );
                  this.router.navigate(["/home/dashboard/overview/analyst"]);
                } else if (response.user.role.id == ROLES.Surveyor) {
                  localStorage.setItem(
                    "lastroute",
                    "/home/dashboard/overview/surveyor"
                  );
                  this.router.navigate(["/home/dashboard/overview/surveyor"]);
                } else if (response.user.role.id == ROLES.BD) {
                  localStorage.setItem("lastroute", "/home/dashboard/overview");
                  this.router.navigate(["/home/dashboard/overview"]);
                } else if (response.user.role.id == ROLES.Peengineer) {
                  localStorage.setItem(
                    "lastroute",
                    "/home/dashboard/overview/peengineer"
                  );
                  this.router.navigate(["/home/dashboard/overview/peengineer"]);
                }
              }
            }
            this.loaderservice.hide();
          },
          (error) => {
            this.loaderservice.hide();
            const errorobj = error[0]["messages"][0];
            if (
              errorobj["message"] ==
              "Your account has been blocked by an administrator"
            ) {
              this.notifyService.showInfo(errorobj["message"], "Warning");
            } else {
              this.notifyService.showInfo(
                "E-mail address or password is invalid.",
                "Warning"
              );
            }
          }
        );
    } else {
      this.loginForm.markAllAsTouched();
      this.loaderservice.hide();
    }
  }

  fetchFeaturesList(): void {
    this.publicService.getFeaturesList().subscribe(
      (response) => {
        if (response.length > 0) {
          this.featuresList = response;
          this.changeCurrentFeature(
            this.displayedFeatureIndex,
            this.featuresList
          );
          this.subscription = this.source.subscribe(() =>
            this.changeCurrentFeature(
              this.displayedFeatureIndex,
              this.featuresList
            )
          );
        }
      },
      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }

  changeCurrentFeature(index: number, list: Feature[]): void {
    if (index >= list.length) {
      index = 0;
    }
    this.currentfeature = list[index];
    if (this.currentfeature.image != null) {
      this.featureImageUrl = this.currentfeature.image.url;
    } else {
      this.featureImageUrl = "../../../assets/featureplaceholder.png";
    }
    this.displayedFeatureIndex = index + 1;
    this.progressValue = (this.displayedFeatureIndex / list.length) * 100;
  }

  keepLogin(): void {
    this.keepmesignin = !this.keepmesignin;
    const checkbox = this.keepmesignin.value;
    localStorage.setItem("rememberMe", checkbox);
  }
  // autoLogin(){
  //   if(localStorage.getItem('rememberMe')== 'true'){
  //     if(sessionStorage.getItem("currentUser")){
  //       localStorage.setItem("currentUser",sessionStorage.getItem("currentUser"));
  //     }

  //   }else{
  //     localStorage.removeItem("currentUser");
  //   }
  //     const currentUser = JSON.parse(localStorage.getItem("currentUser")) ?JSON.parse(localStorage.getItem("currentUser")):JSON.parse(sessionStorage.getItem("currentUser"));
  //     const rememberMe = localStorage.getItem('rememberMe');
  //     if (currentUser && currentUser.jwt) {
  //       const isadmin = this.genericService.isUserAdmin(currentUser.user);
  //           if (isadmin) {
  //             localStorage.setItem("lastroute", "/home/dashboard/overview");
  //               this.router.navigate(['/home/dashboard/overview']);
  //           } else {
  //             if (currentUser.user.role.id == ROLES.Designer) {
  //               localStorage.setItem("lastroute", "/home/dashboard/overview/designer");
  //               this.router.navigate(['/home/dashboard/overview/designer']);
  //             } else if (currentUser.user.role.id == ROLES.Analyst) {
  //               localStorage.setItem("lastroute", "/home/dashboard/overview/analyst");
  //               this.router.navigate(['/home/dashboard/overview/analyst']);
  //             } else if (currentUser.user.role.id == ROLES.Surveyor) {
  //               localStorage.setItem("lastroute", "/home/dashboard/overview/surveyor");
  //               this.router.navigate(['/home/dashboard/overview/surveyor']);
  //             } else if (currentUser.user.role.id == ROLES.BD) {
  //               localStorage.setItem("lastroute", "/home/dashboard/overview");
  //               this.router.navigate(['/home/dashboard/overview']);
  //             } else if (currentUser.user.role.id == ROLES.Peengineer) {
  //               localStorage.setItem("lastroute", "/home/dashboard/overview/peengineer");
  //               this.router.navigate(['/home/dashboard/overview/peengineer']);
  //             }

  //           }
  //     }
  //     else {
  //
  //       this.router.navigate(['/auth/login']);
  //     }
  //    }
}
