import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

import { Feature } from "../_models";
import { BaseUrl } from "../_helpers";

@Injectable({ providedIn: "root" })
export class PublicService {
  constructor(private http: HttpClient) {}

  getFeaturesList() {
    return this.http
      .get<Feature[]>(BaseUrl + "features", {
        observe: "response",
      })
      .pipe(
        map((value) => {
          const features: Feature[] = value.body;
          return features;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }
}
