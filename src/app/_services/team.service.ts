import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl, COMETCHAT_CONSTANTS, ROLES } from "../_helpers";
import { User } from "../_models";
import { Groups } from "../_models/groups";
import { Role } from "../_models/role";
import { AuthenticationService } from "./authentication.service";
import { GenericService } from "./generic.service";


@Injectable({ providedIn: "root" })
export class TeamService {
  public teamMember: Observable<User>;

  constructor(
    private http: HttpClient,
    private genericService: GenericService,
    private authenticationService: AuthenticationService
  ) { }

  getTeamData(): Observable<User[]> {
    return this.http
      .get<User[]>(
        BaseUrl +
        "users?_sort=created_at:desc&user=" +
        this.authenticationService.currentUserValue.user.id +
        "&id_ne=" +
        this.authenticationService.currentUserValue.user.parent.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const members: User[] = value.body;
          return members;
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

  getTeamDataMembersForGroup(): Observable<User[]> {
    return this.http
      .get<User[]>(BaseUrl + "team/members", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members: User[] = value.body;
          return members;
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

  getGroupData(): Observable<Groups[]> {
    return this.http
      .get<Groups[]>(BaseUrl + "usergroups", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members: Groups[] = value.body;
          return members;
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

  getClientRole(clientid): Observable<Role[]> {
    return this.http
      .get<Role[]>(BaseUrl + "clientroles?client=" + clientid, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members: Role[] = value.body;
          return members;
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

  addUser(
    workemail: string,
    firstname: string,
    lastname: string,
    permissiontomakedesign: boolean,
    role: number,
    minpermitaccess: boolean,
    typeofpeengineer: string,
    isonboardingcompleted: boolean,
    // address: String,
    // country: String,
    // callingcode: number
    visibilityprelim: boolean,
    visibilitypermit: boolean,
    visibilitysurvey: boolean,
    visibilitypestamp: boolean,
    visibilityteam: boolean
  ): Observable<User> {
    let randomPassword = this.genericService.randomPass();

    let parentid = 0;
    if (
      this.authenticationService.currentUserValue.user.role.id ==
      ROLES.SuperAdmin ||
      this.authenticationService.currentUserValue.user.role.id ==
      ROLES.ContractorSuperAdmin
    ) {
      parentid = this.authenticationService.currentUserValue.user.id;
    } else {
      parentid = this.authenticationService.currentUserValue.user.parent.id;
    }

    const postData = {
      firstname: firstname,
      lastname: lastname,
      email: workemail,
      permissiontomakedesign: permissiontomakedesign,
      password: randomPassword,
      resetPasswordToken: randomPassword,
      source: "web",
      usertype: "company",
      username: workemail,
      confirmed: true,
      isdefaultpassword: true,
      role: role,
      minpermitdesignaccess: minpermitaccess,
      provider: "local",
      parent: parentid,
      company: this.authenticationService.currentUserValue.user.company,
      addedby: this.authenticationService.currentUserValue.user.id,
      peengineertype: typeofpeengineer,
      isonboardingcompleted: isonboardingcompleted,
      visibilityprelim: visibilityprelim,
      visibilitysurvey: visibilitysurvey,
      visibilitypermit: visibilitypermit,
      visibilitypestamp: visibilitypestamp,
      visibilityteam: visibilityteam,
    };

    return this.http
      .post<User>(BaseUrl + "users", JSON.stringify(postData), {
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

  editUser(id: number, inputData: any): Observable<User> {
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
          if (err.error.error == "Unauthorized") {
            this.genericService.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  updatesettinguser(inputData: any): Observable<User> {
    return this.http
      .post<User>(BaseUrl + "updatesetting", JSON.stringify(inputData), {
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

  deleteTeamUser(id: string): Observable<User> {
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

  addGroup(inputData): Observable<Groups> {
    return this.http
      .post<Groups>(BaseUrl + "usergroups", JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Groups = value.body;
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

  editGroup(id: number, inputData: any): Observable<Groups> {
    return this.http
      .put<Groups>(BaseUrl + "usergroups/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Groups = value.body;
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
  deleteGroup(id: string): Observable<User> {
    return this.http
      .delete<User>(BaseUrl + "usergroups/" + id, {
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
}
