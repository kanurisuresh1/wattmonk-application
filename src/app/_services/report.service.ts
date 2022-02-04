import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl } from "../_helpers";
import { GenericService } from "./generic.service";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  httpWithoutLoader: HttpClient;
  constructor(
    private http: HttpClient,
    private genericService: GenericService
  ) { }

  getdesignStatus(search): Observable<any> {
    return this.http
      .get<any>(BaseUrl + search, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const dailystatus: any = value.body;
          return dailystatus;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.genericService.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  getdailyreport(selectdate): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "dailyreportexcel?date=" + selectdate, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const dailystatus: any = value.body;
          return dailystatus;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.genericService.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  designtrackerreport(month, year): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "designtrackerapi?month=" + month + "&year=" + year, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const dailystatus: any = value.body;
          return dailystatus;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.genericService.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  // designtrackerreportnew(year): Observable<any>{
  //   return this.http.get<any>(BaseUrl + "designtracknew?year="+year, {
  //     headers: this.genericService.authheaders,
  //     observe: "response"
  //   })
  //     .pipe(
  //       map(value => {
  //         const dailystatus: any = value.body;
  //         return dailystatus;
  //       }),
  //       catchError((err: HttpErrorResponse) => {
  //         if (err.error.error == "Unauthorized") {
  //           this.genericService.handleusersignout();
  //         } else {
  //           return throwError(err.error.message);
  //         }
  //       })
  //     );
  // }

  designtrackerreportnew(filter, year, month): Observable<any> {
    const postData = {
      isfilter: filter,
      year: year,
      month: month
    }
    return this.http
      .post<any>(BaseUrl + "designtracknew", postData, {
        observe: "response",
        headers: this.genericService.authheaders,
      })
      .pipe(
        map((value) => {
          const detail = value.body;
          return detail;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.genericService.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }
}
