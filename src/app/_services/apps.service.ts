import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { BaseUrl } from "../_helpers";
import { GenericService } from "./generic.service";
import { map, catchError } from "rxjs/operators";
import { Apps } from "../_models/apps";

@Injectable({
  providedIn: "root",
})
export class AppsService {
  constructor(
    private http: HttpClient,
    private genericService: GenericService
  ) {}

  addapps(inputData: any): Observable<Apps> {
    return this.http
      .post<Apps>(BaseUrl + "apps", JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  editapps(id: number, inputData: any): Observable<Apps> {
    return this.http
      .put<Apps>(BaseUrl + "apps/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  getappsdetail(userId): Observable<Apps[]> {
    return this.http
      .get<Apps[]>(BaseUrl + "apps?userid=" + userId, {
        headers: this.genericService.authheaders,
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

  deleteApp(id: string): Observable<Apps> {
    return this.http
      .delete<Apps>(BaseUrl + "apps/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Apps = value.body;
          return member;
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
