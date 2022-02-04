import {
  HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl } from "../_helpers";
import { User } from "../_models";
import { AuthenticationService } from "./authentication.service";
import { GenericService } from "./generic.service";
@Injectable({ providedIn: "root" })
export class TransactionService {
  httpWithoutLoader: HttpClient;

  constructor(
    private handler: HttpBackend,
    private http: HttpClient,
    private genericService: GenericService,
    private authenticationService: AuthenticationService
  ) {
    this.httpWithoutLoader = new HttpClient(this.handler);
  }
  getTransactionData(
    startDate = null,
    endDate = null,
    start = 0
    // limit = 10
  ): Observable<User[]> {
    if (startDate != null || endDate != null) {
      return this.httpWithoutLoader
        .get<User[]>(
          BaseUrl +
          "transactions?userid=" +
          this.authenticationService.currentUserValue.user.id +
          "&_limit=10&_start=" +
          start +
          "&_sort=id:DESC&created_at_gte=" +
          startDate +
          "&created_at_lte=" +
          endDate,
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
    } else {
      return this.httpWithoutLoader
        .get<User[]>(
          BaseUrl +
          "transactions?userid=" +
          this.authenticationService.currentUserValue.user.id +
          "&_limit=10&_start=0&_sort=id:DESC",
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
  }

  getalltransaction(searchdata): Observable<any> {
    return this.http
      .get<any>(BaseUrl + searchdata + "&_sort=id:DESC", {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  filtertransactionservice(searchdata): Observable<any> {
    return this.http
      .get<any>(BaseUrl + searchdata, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  downloadExcel(userid, data) {
    return this.http
      .get(BaseUrl + "downloadexcel?userid=" + userid + data, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  downloadpdf(userid, data) {
    return this.http
      .get(BaseUrl + "downloadpdf?userid=" + userid + data, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  addTransaction(userData): Observable<any> {
    return this.http
      .post<any>(BaseUrl + "transactions", userData, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: any = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }
}
