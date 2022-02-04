import {
  HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl } from "../_helpers";
import { User } from "../_models";
import { Survey } from "../_models/survey";
import { AuthenticationService } from "./authentication.service";
import { GenericService } from "./generic.service";


@Injectable({ providedIn: "root" })
export class SurveyService {
  http: HttpClient;
  public survey: Observable<Survey>;

  constructor(
    private handler: HttpBackend,
    private genericService: GenericService,
    private authService: AuthenticationService
  ) {
    this.http = new HttpClient(this.handler);
  }

  getSurveyors(): Observable<User[]> {
    return this.http
      .get<User[]>(
        BaseUrl + "surveyors?user=" + this.authService.currentUserValue.user.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const surveyors: User[] = value.body;
          return surveyors;
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

  getSurveysCount(): Observable<number> {
    return this.http
      .get<number>(
        BaseUrl +
        "usersurveys/count?id=" +
        this.authService.currentUserValue.user.id,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
            Authorization:
              "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
          }),
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          return value.body;
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

  getFilteredSurveys(search: string): Observable<Survey[]> {
    return this.http
      .get<Survey[]>(
        BaseUrl +
        "usersurveys?id=" +
        this.authService.currentUserValue.user.id +
        "&" +
        search,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const records: Survey[] = value.body;
          return records;
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

  generatePDF(id: number): Observable<Survey> {
    return this.http
      .get<Survey>(BaseUrl + "surveypdf?id=" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: Survey = value.body;
          return record;
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

  addSurvey(
    name: string,
    email: string,
    phone: number,
    address: string,
    datetime: string,
    jobtype: string,
    comments: string,
    latitude: number,
    longitude: number,
    city: string,
    state: string,
    country: string,
    postalcode: number,
    status: string,
    isoutsourced: string,
    assignedto: number,
    prelimdesignsurvey: number,
    isdesigndelivered: boolean,
    projecttype: string,
    sameemailconfirmed: boolean,
    customer: number,
    designCreatedBy: number,
    designCreatedByUserParent: number,
    raiserequestreason: string
  ): Observable<Survey> {
    let designCreatedByUser;
    if (designCreatedBy) {
      designCreatedByUser = designCreatedBy;
    } else {
      designCreatedByUser = this.authService.currentUserValue.user.id;
    }
    let designCreatedUserParent;

    if (designCreatedByUserParent) {
      designCreatedUserParent = designCreatedByUserParent;
    } else {
      designCreatedUserParent =
        this.authService.currentUserValue.user.parent.id;
    }
    const postData = {
      chatid: "survey" + "_" + new Date().getTime(),
      groupchatpassword: "wattmonk" + new Date().getTime(),
      email: email,
      name: name,
      address: address,
      phonenumber: phone,
      datetime: datetime,
      jobtype: jobtype,
      comments: comments,
      latitude: latitude,
      longitude: longitude,
      city: city,
      state: state,
      country: country,
      postalcode: postalcode,
      source: "web",
      status: status,
      isoutsourced: isoutsourced,
      createdby: designCreatedByUser,
      creatorparentid: designCreatedUserParent,
      assignedto: assignedto,
      prelimdesignsurvey: prelimdesignsurvey,
      isdesigndelivered: isdesigndelivered,
      projecttype: projecttype,
      sameemailconfirmed: sameemailconfirmed,
      customer: customer,
      raiserequestreason: raiserequestreason,
    };

    return this.http
      .post<Survey>(BaseUrl + "surveys", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: Survey = value.body;
          return record;
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

  editSurvey(id: number, inputData: any): Observable<Survey> {
    return this.http
      .put<Survey>(BaseUrl + "surveys/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: Survey = value.body;
          return record;
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

  deleteSurvey(id: string): Observable<Survey> {
    return this.http
      .delete<Survey>(BaseUrl + "surveys/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: Survey = value.body;
          return record;
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

  getSurveyDetails(id: number): Observable<Survey> {
    return this.http
      .get<Survey>(BaseUrl + "surveys/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: Survey = value.body;
          return record;
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
  getSurveyByChatid(chatid) {
    return this.http
      .get(BaseUrl + "getsurveybychatid?chatid=" + chatid, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
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
