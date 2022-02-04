import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { GenericService } from ".";
import { BaseUrl } from "../_helpers";

@Injectable({
  providedIn: "root",
})
export class QualitylistService {
  constructor(
    private http: HttpClient,
    private genericService: GenericService
  ) { }

  getCriterialist(type, limit, skip): Observable<any[]> {
    return this.http.get<any[]>(BaseUrl + 'qualitychecklists' + '?type=' + type + '&limit=' + limit + '&skip=' + skip, {
      headers: this.genericService.authheaders,
      observe: "response"
    }).pipe(
      map(value => {
        const members = value.body;
        return members;
      }),
      catchError((err: HttpErrorResponse) => {
        return throwError(err.error.message);
      })
    );
  }

  getClientlist(limit, skip): Observable<any[]> {
    return this.http.get<any[]>(BaseUrl + 'getAllSuperAdmin?limit=' + limit + '&skip=' + skip, {
      headers: this.genericService.authheaders,
      observe: "response"
    }).pipe(
      map(value => {
        const members = value.body;
        return members;
      }),
      catchError((err: HttpErrorResponse) => {
        return throwError(err.error.message);
      })
    );
  }

  addQualityCheckList(inputData: any, userId, type): Observable<any> {
    return this.http
      .post<any>(BaseUrl + "createchecklist?clientid=" + userId + "&type=" + type, inputData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }

  getQualityCheckList(userId): Observable<any> {
    return this.http
      .get<any>(
        BaseUrl +
        "checklistcriteria?qualitychecklist=" +
        userId +
        "&_sort=sequence:asc&status=active",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }

  deleteChecklist(checklistId): Observable<any> {
    return this.http
      .delete<any>(BaseUrl + "qualitychecklists/" + checklistId, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }

  editUserCriteria(criteriaId, criteria): Observable<any> {
    return this.http
      .put<any>(BaseUrl + "checklistcriteria/" + criteriaId, criteria, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }

  AddUserGuidelines(inputData: any): Observable<any> {
    return this.http
      .post<any>(BaseUrl + "createGuidelines/", inputData, {
        headers: this.genericService.authheaders,
        observe: "response"
      })
      .pipe(
        map(value => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }
  AddUserCriteria(inputData: any): Observable<any> {
    return this.http
      .post<any>(BaseUrl + "checklistcriteria/", inputData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }

  deleteUserCriteria(criteriaId): Observable<any> {
    return this.http
      .delete<any>(BaseUrl + "checklistcriteria/" + criteriaId, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }

  UpdateGuidelines(inputData: any, userId): Observable<any> {
    return this.http
      .post<any>(BaseUrl + "createandupdateGuidelines?checklistid=" + userId, inputData, {
        headers: this.genericService.authheaders,
        observe: "response"
      })
      .pipe(
        map(value => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }
  UpdateQualityCheckList(inputData: any, userId): Observable<any> {
    return this.http
      .post<any>(BaseUrl + "createandupdate?checklistid=" + userId, inputData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }

  //"/getGuidelines?parent=232"
  getGuidelines(parentId): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getGuidelines?parent=" + parentId, {
        headers: this.genericService.authheaders,
        observe: "response"
      })
      .pipe(
        map(value => {
          const member = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );
  }

  searchCompany(searchdata): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getAllSuperAdminBySearch?term=" + searchdata, {
        headers: this.genericService.authheaders,
        observe: "response"
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
}
