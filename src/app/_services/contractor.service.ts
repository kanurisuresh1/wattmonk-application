import {
  HttpClient, HttpErrorResponse, HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl, COMETCHAT_CONSTANTS, DesignUrl, ROLES } from "../_helpers";
import { ContractorLogo, User } from "../_models";
import { AuthenticationService } from "./authentication.service";
import { GenericService } from "./generic.service";


@Injectable({ providedIn: "root" })
export class ContractorService {
  user: User;
  public contractor: Observable<User>;

  constructor(
    private http: HttpClient,
    private genericService: GenericService,
    private authenticationService: AuthenticationService
  ) { }

  getClientSuperadmin(searchdata): Observable<User[]> {
    return this.http
      .get<User[]>(DesignUrl + "fetchsuperadmins?" + searchdata, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const fetchSuperadmin: User[] = value.body;
          return fetchSuperadmin;
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

  getContractorsList(): Observable<User[]> {
    return this.http
      .get<User[]>(BaseUrl + "getcontractorsuperadmin", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members: User[] = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  getContractorsData(): Observable<User[]> {
    return this.http
      .get<User[]>(BaseUrl + "users?role_eq=" + ROLES.ContractorSuperAdmin, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members: User[] = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  addContractor(
    firstname: string,
    lastname: string,
    workemail: string,
    // company: String,
    // country: String,
    // phone: String,
    address: string,
    paymentmode: string,
    usertype: string
    // lic: String,
    // callingcode: String
  ): Observable<User> {
    let randomPassword = this.genericService.randomPass();
    let ispaymentmodeprepay = false;
    if (paymentmode == "prepaid") {
      ispaymentmodeprepay = true;
    } else if (paymentmode == "postpaid") {
      ispaymentmodeprepay = false;
    }
    const postData = {
      firstname: firstname,
      lastname: lastname,
      email: workemail,
      password: randomPassword,
      resetPasswordToken: randomPassword,
      // company: company,
      // country: country,
      paymentmode: paymentmode,
      usertype: usertype,
      // phone: phone,
      address: address,
      // registrationnumber: lic,
      // callingcode: callingcode,
      source: "web",
      provider: "local",
      username: workemail,
      confirmed: true,
      isdefaultpassword: true,
      role: ROLES.ContractorSuperAdmin,
      addedby: this.authenticationService.currentUserValue.user.id,
      ispaymentmodeprepay: ispaymentmodeprepay,
    };

    return this.http
      .post<User>(BaseUrl + "users", postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: User = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  addContractorLogo(userid: number): Observable<ContractorLogo> {
    const postData = {
      user: userid,
    };

    return this.http
      .post<ContractorLogo>(BaseUrl + "contractorlogos", postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: ContractorLogo = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  editContractor(id: number, inputData: any): Observable<User> {
    return this.http
      .put<User>(BaseUrl + "users/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: User = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  deleteContractor(id: string): Observable<User> {
    return this.http
      .delete<User>(BaseUrl + "users/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: User = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  deleteClient(id: string): Observable<User> {
    return this.http
      .delete<User>(BaseUrl + "users/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: User = value.body;
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

  deleteCometChatUser(id: string): void {
    // ("deleting comet chat user");
    const data = JSON.stringify({
      permanent: false,
    });

    const xhr = new XMLHttpRequest();

    xhr.open("DELETE", "https://api-us.cometchat.io/v2.0/users/" + id);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("appid", COMETCHAT_CONSTANTS.APP_ID);
    xhr.setRequestHeader("apiKey", COMETCHAT_CONSTANTS.REST_API_KEY);

    xhr.send(data);
  }

  getFilteredContractorsList(searchdata): Observable<User[]> {
    return this.http
      .get<User[]>(DesignUrl + searchdata, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members: User[] = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  getClientData(userId): Observable<User[]> {
    return this.http
      .get<User[]>(DesignUrl + "getclientdetail?id=" + userId, {
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

  updateServicePrice(id: number, inputData: any): Observable<User> {
    return this.http
      .put<User>(BaseUrl + "users/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: User = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  getSearchResults(data): Observable<User[]> {
    return this.http
      .post<User[]>(DesignUrl + "findusers", data, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: User[] = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  getClientNotices(userId): Observable<any[]> {
    return this.http
      .get<any[]>(BaseUrl + "notices?users=" + userId + "&_sort=id:ASC", {
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

  addClientNotices(userData): Observable<any[]> {
    return this.http
      .post<User[]>(BaseUrl + "notices?", userData, {
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

  updateClientNotices(noticeId, userData): Observable<any> {
    return this.http
      .put<any>(BaseUrl + "notices/" + noticeId, userData, {
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
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  deleteClientNotices(noticeId): Observable<any> {
    return this.http
      .delete<User>(BaseUrl + "notices/" + noticeId, {
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
          if (err.error.error == "Unauthorized") {
            this.genericService.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }
}
