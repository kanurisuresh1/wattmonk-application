import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

import { BaseUrl } from "../_helpers";
import { GenericService } from "./generic.service";
import { AuthenticationService } from "./authentication.service";
import { BankDetail } from "../_models/bankdetail";
import { ViewEarning } from "../_models/viewearning";
import { ViewWithdraw } from "../_models/viewwithdraw";
@Injectable({
  providedIn: "root",
})
export class BankdetailService {
  constructor(
    private http: HttpClient,
    private genericService: GenericService,
    private authenticationService: AuthenticationService
  ) {}

  getEarnings(): Observable<ViewEarning[]> {
    return this.http
      .get<ViewEarning[]>(
        BaseUrl + "earnings?user=722&servicetype=design&_sort=id:desc",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const members: ViewEarning[] = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  getWithdrawal(): Observable<ViewWithdraw[]> {
    return this.http
      .get<ViewWithdraw[]>(
        BaseUrl + "withdrawals?user=722&servicetype=design&_sort=id:desc",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const members: ViewWithdraw[] = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  getBankDetails(): Observable<BankDetail[]> {
    return this.http
      .get<BankDetail[]>(
        BaseUrl +
          "bankdetails?user=" +
          this.authenticationService.currentUserValue.user.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const members: BankDetail[] = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  addBankDetail(
    paypalemail: string,
    name: string,
    accountnumber: string,
    bank: string,
    branch: string,
    phonenumber: number,
    swiftcode: string,
    bankcode: string,
    typeofaccount: string
  ): Observable<BankDetail> {
    const postData = {
      id: null,
      user: this.authenticationService.currentUserValue.user.id,
      paypalemail: paypalemail,
      name: name,
      accountnumber: accountnumber,
      bank: bank,
      branch: branch,
      phonenumber: phonenumber,
      swiftcode: swiftcode,
      bankcode: bankcode,
      typeofaccount: typeofaccount,
    };
    return this.http
      .post<BankDetail>(BaseUrl + "bankdetails", postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: BankDetail = value.body;
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

  addwithdrawrequest(
    amount: number,
    email: string,
    paymenttype: string,
    servicetype: string
  ): Observable<any> {
    const postData = {
      amount: amount,
      email: email,
      paymenttype: paymenttype,
      servicetype: servicetype,
      userid: this.authenticationService.currentUserValue.user.id,
    };
    return this.http
      .post<any>(BaseUrl + "sendwithdrawalrequest", postData, {
        headers: this.genericService.authheaders,
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

  editBankDetail(id: number, inputData: any): Observable<BankDetail> {
    return this.http
      .put<BankDetail>(
        BaseUrl + "bankdetails/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: BankDetail = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  deleteBankDetail(id: string): Observable<BankDetail> {
    return this.http
      .delete<BankDetail>(BaseUrl + "bankdetails/user?" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: BankDetail = value.body;
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
