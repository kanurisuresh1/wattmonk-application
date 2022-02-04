import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl } from "../_helpers";
import {
  InverterMake,
  InverterModel,
  ModuleMake,
  ModuleModel,
} from "../_models";
import { GenericService } from "./generic.service";

@Injectable({ providedIn: "root" })
export class DataEntryService {
  constructor(
    // private handler: HttpBackend,
    private http: HttpClient,
    private genericService: GenericService // private router: Router, // private authenticationService: AuthenticationService
  ) {}

  getModuleMakesData(searchdata): Observable<ModuleMake[]> {
    return this.http
      .get<ModuleMake[]>(BaseUrl + "modulemakes?" + searchdata, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const modulemakes: ModuleMake[] = value.body;
          return modulemakes;
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

  saveModuleMakeData(data) {
    return this.http
      .post(BaseUrl + "modulemakes", data, {
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

  editModuleMakeData(data, id) {
    return this.http
      .put(BaseUrl + "modulemakes/" + id, data, {
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

  getModuleModelsData(searchdata): Observable<ModuleModel[]> {
    return this.http
      .get<ModuleModel[]>(BaseUrl + "modulemodels?" + searchdata, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const modulemodels: ModuleModel[] = value.body;
          return modulemodels;
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

  saveModuleModelData(data) {
    return this.http
      .post(BaseUrl + "modulemodels", data, {
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

  editModuleModelData(data, id) {
    return this.http
      .put(BaseUrl + "modulemodels/" + id, data, {
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

  getInverterMakesData(searchdata): Observable<InverterMake[]> {
    return this.http
      .get<InverterMake[]>(BaseUrl + "invertermakes?" + searchdata, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const makes: InverterMake[] = value.body;
          return makes;
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

  saveInverterMakeData(data) {
    return this.http
      .post(BaseUrl + "invertermakes", data, {
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

  editInverterMakeData(data, id) {
    return this.http
      .put(BaseUrl + "invertermakes/" + id, data, {
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

  getInverterModelsData(searchdata): Observable<InverterModel[]> {
    return this.http
      .get<InverterModel[]>(BaseUrl + "invertermodels?" + searchdata, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const models: InverterModel[] = value.body;
          return models;
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

  saveInverterModelData(data) {
    return this.http
      .post(BaseUrl + "invertermodels", data, {
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

  editInverterModelData(data, id) {
    return this.http
      .put(BaseUrl + "invertermodels/" + id, data, {
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
