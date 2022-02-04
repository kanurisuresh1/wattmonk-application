import {
  HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { StampingBaseUrl } from "../_helpers";
import { Pestamp, User } from "../_models";
import { AuthenticationService } from "./authentication.service";
import { GenericService } from "./generic.service";


@Injectable({ providedIn: "root" })
export class PestampService {
  httpWithoutLoader: HttpClient;
  public pestamp: Observable<Pestamp>;

  constructor(
    private handler: HttpBackend,
    private http: HttpClient,
    private genericService: GenericService,
    private authenticationService: AuthenticationService,

  ) {
    this.httpWithoutLoader = new HttpClient(handler);
  }

  getDesigners(): Observable<User[]> {
    return this.http
      .get<User[]>(
        StampingBaseUrl +
        "designers?parent_eq=" +
        this.authenticationService.currentUserValue.user.parent.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const designers: User[] = value.body;
          return designers;
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

  getPendingPaymentstatus() {
    return this.http
      .get(
        StampingBaseUrl +
        "paymentpendingpestamps?creatorparentid=" +
        this.authenticationService.currentUserValue.user.parent.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const record = value.body;
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
  getAnalysts(clientid: number): Observable<User[]> {
    return this.http
      .get<User[]>(
        StampingBaseUrl +
        "analysts?parent_eq=" +
        this.authenticationService.currentUserValue.user.parent.id +
        "&clientid=" +
        clientid,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const records: User[] = value.body;
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

  getPestampCount1(
    creatorparentid,
    statusfilter,
    reviwerid = null
  ): Observable<any> {
    reviwerid =
      reviwerid || this.authenticationService.currentUserValue.user.id;
    return this.httpWithoutLoader
      .get<any>(
        StampingBaseUrl +
        "userpestamps/count?id=" +
        reviwerid +
        "&creatorparentid=" +
        creatorparentid +
        "&statusfilter=" +
        statusfilter,
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

  getDesignsCount(search: string): Observable<any> {
    return this.httpWithoutLoader
      .get<any>(
        StampingBaseUrl +
        "userpestamps/count?id=" +
        this.authenticationService.currentUserValue.user.id +
        "&" +
        search,
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

  getAllDesignsCount(userid: number): Observable<any> {
    return this.httpWithoutLoader
      .get<any>(StampingBaseUrl + "userpestamps/count?id=" + userid, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
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

  getPeengineerRequestsCount(): Observable<any> {
    return this.httpWithoutLoader
      .get<any>(
        StampingBaseUrl +
        "userpestamps/count?id=" +
        this.authenticationService.currentUserValue.user.id +
        "&declinedbypeengineer=true",
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

  getUserDesignsStatusCount(userid): Observable<number> {
    return this.httpWithoutLoader
      .get<number>(StampingBaseUrl + "userpestamps/count?id=" + userid, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
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

  getUserWaitingDesignsStatusCount(userid): Observable<number> {
    return this.httpWithoutLoader
      .get<number>(StampingBaseUrl + "userpestamps/acceptancecount?id=" + userid, {
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

  getFilteredDesigns(search: string): Observable<Pestamp[]> {
    if (search.indexOf("id=") != 0) {
      search =
        "id=" +
        this.authenticationService.currentUserValue.user.id +
        "&" +
        search;
    }
    return this.httpWithoutLoader
      .get<Pestamp[]>(StampingBaseUrl + "userpestamps?" + search, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
        observe: "response",
      })
      .pipe(
        map((value) => {
          const pestamps: Pestamp[] = value.body;
          return pestamps;
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

  getPestampDetails(id: number): Observable<Pestamp> {
    return this.http
      .get<Pestamp>(StampingBaseUrl + "pestamps/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const pestamp: Pestamp = value.body;
          return pestamp;
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

  createPestamppayment(inputData: any): Observable<Pestamp> {
    return this.http
      .post<Pestamp>(StampingBaseUrl + "pestampdeliverychargespayment", inputData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const pestamp: Pestamp = value.body;
          return pestamp;
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

  createCommercialPestamppayment(inputData: any): Observable<Pestamp> {
    return this.http
      .post<Pestamp>(StampingBaseUrl + "deliveredcommercialpestampayment", inputData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const pestamp: Pestamp = value.body;
          return pestamp;
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
  addSiteAssessment(
    personname: string,
    contactnumber: number,
    modeofstamping: string,
    email: string,
    hardcopies: number,
    type: string,
    propertytype: string,
    mountingtype: string,
    deliveryaddress: string,
    comments: string,
    latitude: number,
    longitude: number,
    actualdelivereddate: string,
    pestamptatus: string,
    pestampoutsourcedto: number,
    paymentstatus: string,
    jobtype: string,
    oldcommentid: string,
    sameemailconfirmed: boolean,
    designpestamp: number,
    pestampCreatedBy: any,
    pestampCreatedByUserParent: any,
    thirdpartystamping: boolean,
    raiserequestreason: string
  ): Observable<Pestamp> {
    let pestampCreatedByUser;
    let isoutsourced = false;
    let setStatus;
    let amount;
    if (pestampCreatedBy) {
      pestampCreatedByUser = pestampCreatedBy;
      setStatus = "accepted";
      isoutsourced = true;
    } else {
      pestampCreatedByUser =
        this.authenticationService.currentUserValue.user.id;
      setStatus = pestamptatus;
      isoutsourced = false;
      amount = 0;
    }

    let pestampCreatedUserParent;
    if (pestampCreatedByUserParent) {
      pestampCreatedUserParent = pestampCreatedByUserParent;
    } else {
      pestampCreatedUserParent =
        this.authenticationService.currentUserValue.user.parent.id;
    }
    const postData = {
      acceptedbypeengineer: false,
      declinedbypeengineer: false,
      chatid: "pestamp" + "_" + new Date().getTime(),
      groupchatpassword: "wattmonk" + new Date().getTime(),
      email: email,
      personname: personname,
      contactnumber: contactnumber,
      modeofstamping: modeofstamping,
      hardcopies: hardcopies,
      type: type,
      propertytype,
      mountingtype,
      deliveryaddress: deliveryaddress,
      comments: comments,
      latitude: latitude,
      longitude: longitude,
      actualdelivereddate: actualdelivereddate,
      expecteddeliverydate: actualdelivereddate,
      source: "web",
      createdby: pestampCreatedByUser,
      creatorparentid: pestampCreatedUserParent,
      status: setStatus,
      outsourcedto: pestampoutsourcedto,
      paymentstatus: paymentstatus,
      jobtype: jobtype,
      oldcommentid: oldcommentid,
      sameemailconfirmed: sameemailconfirmed,
      isdesigndelivered: true,
      design: designpestamp,
      isoutsourced: isoutsourced,
      pestampcreatorname:
        this.authenticationService.currentUserValue.user.firstname +
        " " +
        this.authenticationService.currentUserValue.user.lastname,
      amount: amount,
      thirdpartystamping: thirdpartystamping,
      raiserequestreason: raiserequestreason,
    };

    return this.httpWithoutLoader
      .post<Pestamp>(StampingBaseUrl + "pestamps", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const pestamp: Pestamp = value.body;
          return pestamp;
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

  editPestamp(id: number, inputData: any): Observable<Pestamp> {
    return this.httpWithoutLoader
      .put<Pestamp>(StampingBaseUrl + "pestamps/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Pestamp = value.body;
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

  acceptPestamp(id: number, inputData: any): Observable<Pestamp> {
    return this.httpWithoutLoader
      .put<Pestamp>(
        StampingBaseUrl + "acceptpestamp/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Pestamp = value.body;
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

  updatePestamp(id: number, inputData: any): Observable<Pestamp> {
    return this.http
      .put<Pestamp>(StampingBaseUrl + "pestamps/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Pestamp = value.body;
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

  revisionPestamp(id: number, inputData: any): Observable<Pestamp> {
    return this.http
      .put<Pestamp>(StampingBaseUrl + "revisionpestamp/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Pestamp = value.body;
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

  onHoldPestamp(id: number, inputData: any): Observable<Pestamp> {
    return this.http
      .put<Pestamp>(
        StampingBaseUrl + "onholdpestamp/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Pestamp = value.body;
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

  assignPestamp(id: number, inputData: any): Observable<Pestamp> {
    return this.http
      .put<Pestamp>(StampingBaseUrl + "pestamps/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Pestamp = value.body;
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

  deletePestamp(id: string): Observable<Pestamp> {
    let postData = {
      activestatus: false
    }

    return this.http
      .put<Pestamp>(StampingBaseUrl + "pestamps/" + id, postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: Pestamp = value.body;
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

  createdirectpayment(inputData) {
    return this.http
      .post<any>(StampingBaseUrl + "Pestampdirectpayment", inputData, {
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
  getPestampworkinghours(id: number): Observable<any> {
    return this.http
      .get<any>(
        StampingBaseUrl +
        "pestampextracharges?pestamp=" +
        id +
        "&paymentstatus=pending",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const pestamp: any = value.body;
          return pestamp;
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
  getPestampByChatid(chatid) {
    return this.http
      .get(StampingBaseUrl + "getpestampbychatid?chatid=" + chatid, {
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
  deleteStampedfile(id: number) {
    return this.http.delete(StampingBaseUrl + "upload/files/" + id, {
      headers: this.genericService.authheaders,
      observe: "response",
    });
  }

  getPeSuperadmin() {
    return this.http
      .get(StampingBaseUrl + "getpesuperadmins", {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
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
  deliverPestamp(id: number, inputData: any): Observable<Pestamp> {
    return this.http
      .put<Pestamp>(
        StampingBaseUrl + "deliveredpestamp/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Pestamp = value.body;
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

  downloadzipfile(id: number) {
    return this.http
      .get(StampingBaseUrl + "sendfolder?id=" + id, {
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
