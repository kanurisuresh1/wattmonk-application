import {
  HttpClient, HttpErrorResponse, HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl, COMETCHAT_CONSTANTS } from "../_helpers";
import { CurrentUser, User } from "../_models";


@Injectable({ providedIn: "root" })
export class AuthenticationService {
  headers: HttpHeaders;
  formheaders: HttpHeaders;
  chatheaders: HttpHeaders;
  private currentUserSubject: BehaviorSubject<CurrentUser>;
  userSettingSubject = new BehaviorSubject<boolean>(false);
  public currentUser: Observable<CurrentUser>;
  loggedinUser: any;
  currentUserSetting: any;

  constructor(private http: HttpClient, private router: Router) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    this.currentUserSubject = new BehaviorSubject<CurrentUser>(
      JSON.parse(localStorage.getItem("currentUser"))
    );
    this.currentUser = this.currentUserSubject.asObservable();

    this.chatheaders = new HttpHeaders({
      "content-type": "application/json",
      accept: "application/json",
      appid: COMETCHAT_CONSTANTS.APP_ID,
      apikey: COMETCHAT_CONSTANTS.API_KEY,
    });
  }

  setRequiredHeaders(): void {
    this.formheaders = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + this.currentUserValue.jwt,
    });
  }

  public get currentUserValue(): CurrentUser {
    return this.currentUserSubject.value;
  }

  loginUser(email: string, password: string): Observable<CurrentUser> {
    const postData = {
      identifier: email,
      password: password,
    };

    return this.http
      .post<CurrentUser>(BaseUrl + "auth/local", JSON.stringify(postData), {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const user: CurrentUser = value.body;
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);
          localStorage.setItem(
            "walletamount",
            "" + this.currentUserValue.user.amount
          );
          return user;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  registerUser(workemail: string, password: string): Observable<CurrentUser> {
    const postData = {
      email: workemail,
      password: password,
      username: workemail,
    };
    return this.http
      .post<CurrentUser>(
        BaseUrl + "auth/local/register",
        JSON.stringify(postData),
        {
          headers: this.headers,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const user: CurrentUser = value.body;
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);
          localStorage.setItem(
            "walletamount",
            "" + this.currentUserValue.user.amount
          );
          return user;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }
  // Designer Registration
  registerNewUser(
    workemail: string,
    password: string
  ): Observable<CurrentUser> {
    const postData = {
      email: workemail,
      password: password,
      username: workemail,
      usertype: "designer",
      designertype: "external",
    };
    return this.http
      .post<CurrentUser>(
        BaseUrl + "auth/local/registernewuser",
        JSON.stringify(postData),
        {
          headers: this.headers,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const user: CurrentUser = value.body;
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);
          localStorage.setItem(
            "walletamount",
            "" + this.currentUserValue.user.amount
          );
          return user;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }
  // DesignerRegistration Finish

  registerPEEngineer(
    workemail: string,
    password: string
  ): Observable<CurrentUser> {
    const postData = {
      email: workemail,
      password: password,
      username: workemail,
      usertype: "peengineer",
    };
    return this.http
      .post<CurrentUser>(
        BaseUrl + "auth/local/registernewuser",
        JSON.stringify(postData),
        {
          headers: this.headers,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const user: CurrentUser = value.body;
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);
          localStorage.setItem(
            "walletamount",
            "" + this.currentUserValue.user.amount
          );
          return user;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  registerPESuperadmin(
    workemail: string,
    password: string
  ): Observable<CurrentUser> {
    const postData = {
      email: workemail,
      password: password,
      username: workemail,
    };
    return this.http
      .post<CurrentUser>(
        BaseUrl + "register/pesuperadmin",
        JSON.stringify(postData),
        {
          headers: this.headers,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const user: CurrentUser = value.body;
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  editUserProfile(id: number, inputData: any): Observable<User> {
    return this.http
      .put<User>(BaseUrl + "users/" + id, JSON.stringify(inputData), {
        headers: this.formheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: User = value.body;
          let currentuser: CurrentUser = new CurrentUser();
          currentuser.jwt = this.currentUserValue.jwt;
          currentuser.user = member;
          localStorage.setItem("currentUser", JSON.stringify(currentuser));
          this.currentUserSubject.next(currentuser);
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  createChatUser(uid: string, name: string): Observable<string> {
    const postData = {
      uid: uid + COMETCHAT_CONSTANTS.UNIQUE_CODE,
      name: name,
    };
    return this.http
      .post<string>(
        "https://api-us.cometchat.io/v2.0/users",
        JSON.stringify(postData),
        {
          headers: this.chatheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  forgotPassword(email: string): Observable<CurrentUser> {
    const postData = {
      email: email,
      source: "web"
    };

    return this.http
      .post<CurrentUser>(
        BaseUrl + "auth/forgot-password",
        JSON.stringify(postData),
        {
          headers: this.headers,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const user: CurrentUser = value.body;
          return user;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  resetPassword(
    newpassword: string,
    confirmpassword: string,
    code: string
  ): Observable<CurrentUser> {
    const postData = {
      password: newpassword,
      code: code,
      passwordConfirmation: confirmpassword,
      isdefaultpassword: false,
    };

    return this.http
      .post<CurrentUser>(
        BaseUrl + "auth/reset-password",
        JSON.stringify(postData),
        {
          headers: this.headers,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const user: CurrentUser = value.body;
          return user;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  updatePassword(inputData: any): Observable<User> {
    return this.http
      .post<User>(BaseUrl + "auth/set-password", JSON.stringify(inputData), {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: User = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  changepassword(inputData: any): Observable<User> {
    return this.http
      .post<User>(BaseUrl + "auth/resetpassword", inputData, {
        headers: this.formheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: User = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  rechargerequest(
    type: any,
    User: number,
    amount: number,
    datetime: any,
    paymenttype: string,
    email: string
  ): Observable<User> {
    const data = {
      type: type,
      user: User,
      amount: amount,
      datetime: datetime,
      paymenttype: paymenttype,
      email: email,
    };
    return this.http
      .post<CurrentUser>(BaseUrl + "recharges", data, {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const detail: User = value.body.user;
          let currentuser: CurrentUser = new CurrentUser();
          currentuser.jwt = this.currentUserValue.jwt;
          currentuser.user = detail;
          localStorage.setItem("currentUser", JSON.stringify(currentuser));
          this.currentUserSubject.next(currentuser);
          return detail;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  logoutUser(): void {
    // remove user from local storage and set current user to null
    localStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
  }

  preventBack(): void {
    window.history.forward();
  }

  handleusersignout(): void {
    localStorage.clear();
    CometChat.logout();
    //this.router.navigate(['/auth/login']);

    window.location.href = "/auth/login";
    setTimeout(function () {
      "preventBack()";
    }, 0);
    window.onunload = function () {
      // null;
    };
  }
  broadcastCurrentuser(user: CurrentUser): void {
    this.currentUserSubject.next(user);
  }
  broadCastCurrentUserSetting(refresh: boolean): void {
    this.userSettingSubject.next(refresh);
  }

  editUserSetting(id: number, inputData: any): Observable<any> {
    inputData["parentid"] = id;
    return this.http
      .post<any>(BaseUrl + "updateusersettings", JSON.stringify(inputData), {
        headers: this.formheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }
}
