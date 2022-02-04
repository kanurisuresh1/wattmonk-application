import {
  HttpBackend, HttpClient,
  HttpErrorResponse
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl } from "../_helpers";
import { LastLoginTime } from "../_models/lastlogintime";
import { AuthenticationService } from "./authentication.service";
import { GenericService } from "./generic.service";
@Injectable({ providedIn: "root" })
export class DashboardService {
  httpWithoutLoader: HttpClient;

  constructor(
    private handler: HttpBackend,
    private http: HttpClient,
    private genericService: GenericService,
    private authenticationService: AuthenticationService
  ) {
    this.httpWithoutLoader = new HttpClient(this.handler);
  }
  getDashboardDesignCounts(): Observable<any> {
    return this.httpWithoutLoader
      .get<any>(
        BaseUrl +
        "dashboarddesigncount?id=" +
        this.authenticationService.currentUserValue.user.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }
  getActivityList(): Observable<any> {
    return this.httpWithoutLoader
      .get<any>(
        BaseUrl +
        "dashboardactivities?id=" +
        this.authenticationService.currentUserValue.user.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }
  lastLoginTime(userId: number, time: string): Observable<LastLoginTime> {
    const postData = {
      lastloginbackendupdate: time,
    };
    return this.http
      .post<LastLoginTime>(BaseUrl + "lastloginupdate?id=" + userId, postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: LastLoginTime = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }
  getwattmonkDashboardDesignCounts(dataType): Observable<any> {
    return this.httpWithoutLoader.get<any>(BaseUrl + "wattmonkdashboard?" + dataType, {
      headers: this.genericService.authheaders,
      observe: "response"
    })
      .pipe(
        map(value => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }


}
