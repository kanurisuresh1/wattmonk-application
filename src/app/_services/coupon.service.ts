import {
  HttpClient, HttpErrorResponse, HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl } from "../_helpers";
import { Coupon } from "../_models";
import { AuthenticationService } from "./authentication.service";
import { GenericService } from "./generic.service";
@Injectable({ providedIn: "root" })
export class CouponService {
  coupon: Coupon;
  public contractor: Observable<Coupon>;

  constructor(
    private http: HttpClient,
    private genericService: GenericService,
    private authenticationService: AuthenticationService
  ) { }
  getCoupons(): Observable<Coupon[]> {
    return this.http
      .get<Coupon[]>(BaseUrl + "coupons?_sort=created_at:desc", {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
        observe: "response",
      })
      .pipe(
        map((value) => {
          const members: Coupon[] = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }
  getDashboardCoupons(): Observable<Coupon[]> {
    return this.http
      .get<Coupon[]>(
        BaseUrl +
        "getCoupons?userid=" +
        this.authenticationService.currentUserValue.user.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const members: Coupon[] = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  addCoupon(
    title: string,
    description: string,
    code: string,
    expirydate: string,
    amount: string,
    usestype: string,
    discounttype: string,
    requesttype: string
  ): Observable<Coupon> {
    const postData = {
      title: title,
      description: description,
      code: code,
      expirydate: expirydate,
      amount: amount,
      usestype: usestype,
      discounttype: discounttype,
      requesttype: requesttype,
    };
    return this.http
      .post<Coupon>(BaseUrl + "coupons", postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Coupon = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  editCoupon(id: number, inputData: any): Observable<Coupon> {
    return this.http
      .put<Coupon>(BaseUrl + "coupons/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Coupon = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  deleteCoupon(id: string): Observable<Coupon> {
    return this.http
      .delete<Coupon>(BaseUrl + "coupons/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Coupon = value.body;
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

  validateCoupon(data: any): Observable<any> {
    const postdata = {
      activestatus: data.activestatus,
      amount: data.amount,
      code: data.code,
      discounttype: data.discounttype,
      expirydate: data.expirydate,
      id: data.id,
      usestype: data.usestype,
    };
    return this.http
      .post<any>(BaseUrl + "validateCoupon", postdata, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member = value.body;
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
