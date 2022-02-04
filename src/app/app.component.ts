import { Location } from "@angular/common";
import { AfterViewInit, Component, OnInit, Renderer2 } from "@angular/core";
import { AngularFireDatabase, AngularFireObject } from "@angular/fire/database";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { FIREBASE_DB_CONSTANTS } from "./_helpers";
import { User } from "./_models";
import { AuthenticationService } from "./_services";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = "WattMonk";
  message;
  platformmode: Observable<any>;
  platformmodeRef: AngularFireObject<any>;
  currentpath: string;
  loggedInUser: User;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private db: AngularFireDatabase,
    private location: Location,
    private authService: AuthenticationService
  ) {
    this.currentpath = this.location.path();
    this.loggedInUser = this.authService.currentUserValue?.user;
    this.platformmodeRef = this.db.object(
      FIREBASE_DB_CONSTANTS.KEYWORD + "platformmode"
    );
    this.platformmode = this.platformmodeRef.valueChanges();
    this.platformmode.subscribe(
      (res) => {
        if (res == "maintenance") {
          this.router.navigate(["/maintenance"]);
        } else {
          if (
            localStorage.getItem("lastroute") != null &&
            this.currentpath != "/probability"
          ) {
            this.router.navigate([localStorage.getItem("lastroute")]);
          } else if (this.loggedInUser && this.currentpath == "/probability") {
            localStorage.setItem("lastroute", "/home/customerdesign/overview");
            this.router.navigate(["/home/customerdesign/overview"]);
          } else {
            // this.router.navigate(['/auth/login']);
          }
        }
      }
      // (err) => console.log(err),
      // () => console.log("done!")
    );
  }

  ngOnInit(): void {
    if (
      localStorage.getItem("lastroute") != null &&
      this.currentpath != "/probability"
    ) {
      this.router.navigate([localStorage.getItem("lastroute")]);
    } else if (this.loggedInUser && this.currentpath == "/probability") {
      localStorage.setItem("lastroute", "/home/customerdesign/overview");
      this.router.navigate(["/home/customerdesign/overview"]);
    }
  }

  ngAfterViewInit(): void {
    const loader = this.renderer.selectRootElement("#loader");
    this.renderer.setStyle(loader, "display", "none");
  }

  /*   @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
      $event.preventDefault();
      console.log($event)
      
      if (localStorage.getItem("rememberMe") == 'true') {
       
      }
      else {
        sessionStorage.clear();
        localStorage.clear();
        CometChat.logout();
        //this.router.navigate(['/auth/login']);
  
        window.location.href = '/auth/login';
        setTimeout(function () {
      "preventBack()";
    }, 0);
        window.onunload = function () {
          null
        };
      }
  
    } */

  //   @HostListener('contextmenu', ['$event'])
  //   onRightClick(event) {
  //   event.preventDefault();
  //  }
}
