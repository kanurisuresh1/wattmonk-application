import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { BaseUrl } from "../_helpers";
import { GenericService } from "./generic.service";
import { map, catchError } from "rxjs/operators";
import { Announcement } from "../_models/announcement";

@Injectable({
  providedIn: "root",
})
export class announcementservice {
  constructor(
    private http: HttpClient,
    private genericService: GenericService
  ) {}

  getalluserslist(): Observable<any[]> {
    return this.http
      .get<any[]>(BaseUrl + "getallusers", {
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

  getUsersGrouplist(): Observable<any[]> {
    return this.http
      .get<any[]>(BaseUrl + "usergroups", {
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

  getannouncement(searchdata): Observable<any> {
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

  addannouncement(postData): Observable<Announcement> {
    return this.http
      .post<Announcement>(BaseUrl + "announcements", postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Announcement = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  editAnnouncement(id: number, inputData: any): Observable<Announcement> {
    return this.http
      .put<Announcement>(
        BaseUrl + "announcements/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Announcement = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  deleteAnnouncement(id: string): Observable<Announcement> {
    return this.http
      .delete<Announcement>(BaseUrl + "announcements/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Announcement = value.body;
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
