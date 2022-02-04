import {
  HttpBackend, HttpClient,
  HttpErrorResponse
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl } from "../_helpers";
import { User } from "../_models";
import { GenericService } from "./generic.service";


@Injectable({ providedIn: "root" })
export class WithdrawService {
  httpWithoutLoader: HttpClient;

  constructor(
    private handler: HttpBackend,
    private genericService: GenericService
  ) {
    this.httpWithoutLoader = new HttpClient(this.handler);
  }

  getWithdrawData(startDate = null, endDate = null): Observable<User[]> {
    if (startDate != null || endDate != null) {
      return this.httpWithoutLoader
        .get<User[]>(
          BaseUrl +
          "withdrawals?&_sort=id:desc&created_at_gte=" +
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
        .get<User[]>(BaseUrl + "withdrawals?_sort=id:desc", {
          headers: this.genericService.authheaders,
          observe: "response",
        })
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
}
