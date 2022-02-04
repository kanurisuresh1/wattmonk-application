import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl } from "../_helpers";
import { GenericService } from "./generic.service";

@Injectable({ providedIn: "root" })
export class ProbabilityService {
  constructor(
    private http: HttpClient,
    private genericService: GenericService // private authService: AuthenticationService
  ) { }

  customerProbability(data: any) {
    return this.http
      .post(BaseUrl + "customers", data, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getCustomerProbabilityData(id: number, limit, start, deviceid) {
    return this.http
      .get(
        BaseUrl +
        "findCustomers?creatorparentid=" +
        id +
        "&deviceid=" +
        deviceid +
        "&_limit=" +
        limit +
        "&_start=" +
        start,
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
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getCustomerProbabilitySearchData(
    id: number,
    limit,
    start,
    searchdata,
    // deviceid
  ) {
    return this.http
      .get(
        BaseUrl +
        "customers?creatorparentid=" +
        id +
        "&_limit=" +
        limit +
        "&_start=" +
        start +
        "&_q=" +
        searchdata +
        "&_sort=id:DESC",
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
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getDeviceCount(id: string) {
    return this.http
      .get(BaseUrl + "customers?deviceid=" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  editCustomerProbability(customerid, data: any) {
    return this.http
      .put(BaseUrl + "customers/" + customerid, data, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }
}
