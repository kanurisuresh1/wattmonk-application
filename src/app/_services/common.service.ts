import {
  HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl, DesignUrl } from "../_helpers";
import {
  BatteryMake,
  BatteryModel, InverterMake,
  InverterModel, ModuleMake,
  ModuleModel, MSPBrand, OptimizerModel, User
} from "../_models";
import { Ahj } from "../_models/ahj";
import { AttachmentMaterial } from "../_models/attachmentmaterials";
import { AttachmentType } from "../_models/attachmenttype";
import { ClientRole } from "../_models/clientrole";
import { Company } from "../_models/company";
import { Firesetback } from "../_models/firesetback";
import { Incentives } from "../_models/incentives";
import { Notification } from "../_models/notification";
import { PrelimUtility } from "../_models/prelimutility";
import { RackingModel } from "../_models/rackingmodel";
import { RackingName } from "../_models/rackingname";
import { RoofMaterial } from "../_models/roofmaterial";
import { SearchRecord } from "../_models/searchrecord";
import { UploadedFile } from "../_models/uploadedfile";
import { Utility } from "../_models/utility";
import { UtilityRate } from "../_models/utilityrate";
import { AuthenticationService } from "./authentication.service";
import { GenericService } from "./generic.service";


@Injectable({ providedIn: "root" })
export class CommonService {
  user: User;
  userdata;
  paymentData: any = [];
  httpWithoutLoader: HttpClient;
  rechargerequest: any;
  constructor(
    private handler: HttpBackend,
    private http: HttpClient,
    private genericService: GenericService,
    private authService: AuthenticationService
  ) {
    this.httpWithoutLoader = new HttpClient(this.handler);
  }

  getMe(): Observable<User> {
    return this.http
      .get<User>(BaseUrl + "users/me", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const detail: User = value.body;
          return detail;
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

  getGoogleImage(address): Observable<Blob> {
    return this.http.get(
      "https://maps.googleapis.com/maps/api/staticmap?zoom=20&size=1100x500&scale=2&maptype=satellite&key=AIzaSyCePxz4wA_knfjvNBhV0RKzrySsf4o8QFU&center=" +
      address,
      { responseType: "blob" }
    );
  }

  getSmallGoogleImage(address): Observable<Blob> {
    return this.http.get(
      "https://maps.googleapis.com/maps/api/staticmap?zoom=21&size=600x600&scale=2&format=jpg&maptype=satellite&key=AIzaSyCePxz4wA_knfjvNBhV0RKzrySsf4o8QFU&center=" +
      address +
      "&markers=color:red%7C" +
      address,
      { responseType: "blob" }
    );
  }

  getVicinityMapImage(address): Observable<Blob> {
    return this.http.get(
      "https://maps.googleapis.com/maps/api/staticmap?zoom=16&size=600x600&scale=2&format=jpg&maptype=roadmap&key=AIzaSyCePxz4wA_knfjvNBhV0RKzrySsf4o8QFU&center=" +
      address +
      "&markers=color:red%7C" +
      address,
      { responseType: "blob" }
    );
  }

  getModuleMakesData(): Observable<ModuleMake[]> {
    return this.http
      .get<ModuleMake[]>(BaseUrl + "modulemakes?_sort=name:ASC", {
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

  getModuleModelsData(makeid: number): Observable<ModuleModel[]> {
    return this.http
      .get<ModuleModel[]>(BaseUrl + "modulemodels?modulemake_eq=" + makeid, {
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

  getInverterMakesData(): Observable<InverterMake[]> {
    return this.http
      .get<InverterMake[]>(BaseUrl + "invertermakes?_sort=name:ASC", {
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

  getPrelimUtilityData(
    state: string,
    city: string
  ): Observable<PrelimUtility[]> {
    return this.http
      .get<PrelimUtility[]>(
        BaseUrl +
        "utilities?state=" +
        state +
        "&city=" +
        city +
        "&_sort=name:ASC",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const makes: PrelimUtility[] = value.body;
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

  getUtilityRateData(utilityid): Observable<UtilityRate[]> {
    return this.http
      .get<UtilityRate[]>(BaseUrl + "utilityrates?utility=" + utilityid, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const makes: UtilityRate[] = value.body;
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
  getIncentives(): Observable<Incentives[]> {
    return this.http
      .get<Incentives[]>(BaseUrl + "incentives", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const makes: Incentives[] = value.body;
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
  // getCommonSettings(): Observable<Setting[]> {
  //   return this.http
  //     .get<Setting[]>(
  //       BaseUrl +
  //       "commonsettings?settingname=prelimdesigncharges&settingname=permitdesigncharges&settingname=freedesigns&settingname=siteproposaldesigncharges",
  //       { observe: "response" }
  //     )
  //     .pipe(
  //       map((value) => {
  //         const detail: Setting[] = value.body;
  //         return detail;
  //       }),
  //       catchError((err: HttpErrorResponse) => {
  //         if (err.error.error == "Unauthorized") {
  //           this.genericService.handleusersignout();
  //         } else {
  //           return throwError(err.error.message);
  //         }
  //       })
  //     );
  // }
  getPermitDesignCharge(inputData: any): Observable<any> {
    return this.http
      .post<any>(BaseUrl + "getdesignservicecharge", inputData, {
        observe: "response",
        headers: this.genericService.authheaders,
      })
      .pipe(
        map((value) => {
          const detail = value.body;
          return detail;
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

  // getPestampchargese(searchdata): Observable<Setting[]> {
  //   return this.http
  //     .get<Setting[]>(BaseUrl + "commonsettings?settingname=" + searchdata, {
  //       observe: "response",
  //     })
  //     .pipe(
  //       map((value) => {
  //         const detail: Setting[] = value.body;
  //         return detail;
  //       }),
  //       catchError((err: HttpErrorResponse) => {
  //         if (err.error.error == "Unauthorized") {
  //           this.genericService.handleusersignout();
  //         } else {
  //           return throwError(err.error.message);
  //         }
  //       })
  //     );
  // }
  getClientRoles(clientid: number, roleid: number): Observable<ClientRole[]> {
    return this.http
      .get<ClientRole[]>(
        BaseUrl +
        "clientroles?client=" +
        clientid +
        "&canbeaddedby_in=" +
        roleid +
        "&_sort=displayname:asc",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const detail: ClientRole[] = value.body;
          return detail;
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

  getDefaultClientRoles(roleid: number): Observable<ClientRole[]> {
    return this.http
      .get<ClientRole[]>(
        BaseUrl +
        "clientroles?client_null=true&canbeaddedby_in=" +
        roleid +
        "&_sort=displayname:asc",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const detail: ClientRole[] = value.body;
          return detail;
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

  getDesignsCountByUser(user): Observable<any> {
    return this.http
      .get<any>(
        BaseUrl +
        "designs/count?creatorparentid=" +
        user +
        "&outsourcedtoid=232",
        { observe: "response" }
      )
      .pipe(
        map((value) => {
          const detail: any = value.body;
          return detail;
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

  getUserIdViaEmail(useremail): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "users/findviaemail/" + useremail, {
        observe: "response",
      })
      .pipe(
        map((value) => {
          const detail: any = value.body;
          return detail;
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

  getInverterModelsData(makeid: number): Observable<InverterModel[]> {
    return this.http
      .get<InverterModel[]>(
        BaseUrl + "invertermodels?invertermake_eq=" + makeid,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
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

  getfiresetbackdetails(city: string): Observable<Firesetback[]> {
    return this.http
      .get<Firesetback[]>(BaseUrl + "firesetbacks?city_eq=" + city, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const detail: Firesetback[] = value.body;
          return detail;
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

  addFiresetback(
    firesetback: boolean,
    setbackdetails: string,
    city: string,
    state: string
  ): Observable<Firesetback> {
    const postData = {
      firesetback: firesetback,
      setbackdetails: setbackdetails,
      city: city,
      state: state,
      source: "web",
      addedby: this.authService.currentUserValue.user.id,
    };

    return this.httpWithoutLoader
      .post<Firesetback>(BaseUrl + "firesetbacks", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const detail: Firesetback = value.body;
          return detail;
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

  getAhjdropdown(): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "ahjs", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const ahj: any = value.body;
          return ahj;
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

  getUtilitydropdown(): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "utilities", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const utility: any = value.body;
          return utility;
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

  getFiresetbackdetailsdropdown(): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "firesetbacks", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const detail: any = value.body;
          return detail;
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

  getAhjdetails(city: string): Observable<Ahj[]> {
    return this.http
      .get<Ahj[]>(BaseUrl + "ahjs?city_eq=" + city, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const ahj: Ahj[] = value.body;
          return ahj;
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

  addAHJ(
    name: string,
    requirements: string,
    city: string,
    state: string
  ): Observable<Ahj> {
    const postData = {
      name: name,
      requirements: requirements,
      city: city,
      state: state,
      lastused: new Date(),
      source: "web",
      addedby: this.authService.currentUserValue.user.id,
    };

    return this.httpWithoutLoader
      .post<Ahj>(BaseUrl + "ahjs", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const ahj: Ahj = value.body;
          return ahj;
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

  getUtilitydetails(city: string): Observable<Utility[]> {
    return this.http
      .get<Utility[]>(BaseUrl + "utilities?city_eq=" + city, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const utility: Utility[] = value.body;
          return utility;
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

  getRoofMaterials(rooftype: string): Observable<RoofMaterial[]> {
    return this.http
      .get<RoofMaterial[]>(BaseUrl + "roofmaterials?rooftype_eq=" + rooftype, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: RoofMaterial[] = value.body;
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

  addRoofMaterial(name: string, rooftype: string): Observable<RoofMaterial> {
    const postData = {
      name: name.toUpperCase(),
      rooftype: rooftype,
    };

    return this.httpWithoutLoader
      .post<RoofMaterial>(BaseUrl + "roofmaterials", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: RoofMaterial = value.body;
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

  getRackingNames(): Observable<RackingName[]> {
    return this.http
      .get<RackingName[]>(BaseUrl + "rackingnames", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: RackingName[] = value.body;
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

  addRackingName(name: string): Observable<RackingName> {
    const postData = {
      name: name.toUpperCase(),
    };

    return this.httpWithoutLoader
      .post<RackingName>(BaseUrl + "rackingnames", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: RackingName = value.body;
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

  getRackingModels(
    rooftype: string,
    roofmaterial: number,
    rackingname: number
  ): Observable<RackingModel[]> {
    return this.http
      .get<RackingModel[]>(
        BaseUrl +
        "rackingmodels?rooftype_eq=" +
        rooftype +
        "&rackingname_eq=" +
        rackingname,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const records: RackingModel[] = value.body;
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

  addRackingModel(
    name: string,
    rooftype: string,
    rackingnameid: number,
    roofmaterialid: number
  ): Observable<RackingModel> {
    const postData = {
      name: name.toUpperCase(),
      rooftype: rooftype,
      rackingname: rackingnameid,
      roofmaterial: roofmaterialid,
    };

    return this.httpWithoutLoader
      .post<RackingModel>(BaseUrl + "rackingmodels", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: RackingModel = value.body;
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

  getAttachmentTypes(
    rooftype: string,
    roofmaterial: number
  ): Observable<AttachmentType[]> {
    return this.http
      .get<AttachmentType[]>(
        BaseUrl +
        "attachmenttypes?rooftype_eq=" +
        rooftype +
        "&roofmaterial_eq=" +
        roofmaterial,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const records: AttachmentType[] = value.body;
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

  addAttachmentType(
    name: string,
    rooftype: string,
    roofmaterialid: number
  ): Observable<AttachmentType> {
    const postData = {
      name: name.toUpperCase(),
      rooftype: rooftype,
      roofmaterial: roofmaterialid,
    };

    return this.httpWithoutLoader
      .post<AttachmentType>(
        BaseUrl + "attachmenttypes",
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const record: AttachmentType = value.body;
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

  getMSPBrands(): Observable<MSPBrand[]> {
    return this.http
      .get<MSPBrand[]>(BaseUrl + "mspbrands", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: MSPBrand[] = value.body;
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

  addMSPBrand(name: string): Observable<MSPBrand> {
    const postData = {
      name: name,
      lastused: new Date(),
      addedby: this.authService.currentUserValue.user.id,
    };

    return this.httpWithoutLoader
      .post<MSPBrand>(BaseUrl + "mspbrands", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: MSPBrand = value.body;
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

  getBatteryMakes(): Observable<BatteryMake[]> {
    return this.http
      .get<BatteryMake[]>(BaseUrl + "batterymakes", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: BatteryMake[] = value.body;
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

  addBatteryMake(name: string): Observable<BatteryMake> {
    const postData = {
      name: name,
      lastused: new Date(),
      addedby: this.authService.currentUserValue.user.id,
    };

    return this.httpWithoutLoader
      .post<BatteryMake>(BaseUrl + "batterymakes", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: BatteryMake = value.body;
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

  getBatteryModels(id: number): Observable<BatteryModel[]> {
    return this.http
      .get<BatteryModel[]>(BaseUrl + "batterymodels?batterymake_eq=" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: BatteryModel[] = value.body;
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

  addBatteryModel(
    name: string,
    batterymakeid: number
  ): Observable<BatteryModel> {
    const postData = {
      name: name,
      batterymake: batterymakeid,
      lastused: new Date(),
      addedby: this.authService.currentUserValue.user.id,
    };

    return this.httpWithoutLoader
      .post<BatteryModel>(BaseUrl + "batterymodels", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: BatteryModel = value.body;
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

  getOptimizerModels(id: number): Observable<OptimizerModel[]> {
    return this.http
      .get<OptimizerModel[]>(BaseUrl + "optimizers?invertermake_eq=" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: OptimizerModel[] = value.body;
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

  addModuleMake(name: string): Observable<ModuleMake> {
    const postData = {
      name: name.toUpperCase(),
    };

    return this.httpWithoutLoader
      .post<ModuleMake>(BaseUrl + "modulemakes", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: ModuleMake = value.body;
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

  addModuleModel(name: string, makeid: number): Observable<ModuleModel> {
    const postData = {
      name: name.toUpperCase(),
      modulemake: makeid,
    };

    return this.httpWithoutLoader
      .post<ModuleModel>(BaseUrl + "modulemodels", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: ModuleModel = value.body;
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

  addInverterMake(name: string): Observable<InverterMake> {
    const postData = {
      name: name.toUpperCase(),
    };

    return this.httpWithoutLoader
      .post<InverterMake>(BaseUrl + "invertermakes", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: InverterMake = value.body;
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

  addInverterModel(name: string, makeid: number): Observable<InverterModel> {
    const postData = {
      name: name.toUpperCase(),
      invertermake: makeid,
    };

    return this.httpWithoutLoader
      .post<InverterModel>(
        BaseUrl + "invertermodels",
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const record: InverterModel = value.body;
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

  addNewUtility(
    name: string,
    city: string,
    state: string
  ): Observable<PrelimUtility> {
    const postData = {
      name: name.toUpperCase(),
      city: city,
      state: state,
      source: "web",
    };

    return this.httpWithoutLoader
      .post<PrelimUtility>(BaseUrl + "utilities", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: PrelimUtility = value.body;
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

  addUtility(
    name: string,
    requirements: string,
    city: string,
    state: string
  ): Observable<Utility> {
    const postData = {
      name: name,
      requirements: requirements,
      city: city,
      state: state,
      lastused: new Date(),
      source: "web",
      addedby: this.authService.currentUserValue.user.id,
    };

    return this.httpWithoutLoader
      .post<Utility>(BaseUrl + "utilities", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const utility: Utility = value.body;
          return utility;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  addUtilityRate(name: string, makeid: number): Observable<UtilityRate> {
    const postData = {
      rate: name.toUpperCase(),
      utility: makeid,
    };

    return this.httpWithoutLoader
      .post<UtilityRate>(BaseUrl + "utilityrates", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: UtilityRate = value.body;
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
  uploadFile(
    recordid: number,
    path: string,
    file: File,
    field: string,
    ref: string
  ): Observable<UploadedFile> {
    const data = new FormData();
    data.append("files", file);
    data.append("path", path);
    data.append("refId", "" + recordid);
    data.append("ref", ref);
    data.append("field", field);
    //data.append("source" , "users-permissions");

    return this.httpWithoutLoader
      .post<UploadedFile>(BaseUrl + "upload", data, {
        headers: this.genericService.tokenformheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const file: UploadedFile = value.body;
          return file;
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

  uploadLogo(
    recordid: number,
    path: string,
    file: Blob,
    field: string,
    ref: string,
    // source: string
  ): Observable<UploadedFile> {
    const data = new FormData();
    data.append("files", file);
    data.append("path", path);
    data.append("refId", "" + recordid);
    data.append("ref", ref);
    data.append("field", field);
    // data.append("source", source);
    data.append("source", "users-permissions");
    return this.httpWithoutLoader
      .post<UploadedFile>(BaseUrl + "upload", data, {
        headers: this.genericService.tokenformheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const file: UploadedFile = value.body;
          return file;
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

  downloadFile(url

  ) {

    return this.httpWithoutLoader
      .get<UploadedFile>(BaseUrl + "sendfile?url=" + url, {
        headers: this.genericService.tokenformheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const file = value.body;
          return file;
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


  deleteUploadedFile(id: string): Observable<UploadedFile> {
    return this.http
      .delete<UploadedFile>(BaseUrl + "upload/files/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: UploadedFile = value.body;
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

  uploadFiles(
    recordid: number,
    path: string,
    files: File[],
    field: string,
    ref: string
  ): Observable<UploadedFile[]> {
    const data = new FormData();
    data.append("path", path);
    data.append("refId", "" + recordid);
    data.append("ref", ref);
    data.append("field", field);

    files.forEach(function (element) {
      // data.append('files', element, field+"_"+i);
      data.append("files", element);
    });

    return this.httpWithoutLoader
      .post<UploadedFile[]>(BaseUrl + "upload", data, {
        headers: this.genericService.tokenformheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const file: UploadedFile[] = value.body;
          return file;
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

  uploadFilesWithLoader(
    recordid: number,
    path: string,
    files: File[],
    field: string,
    ref: string
  ): Observable<UploadedFile[]> {
    const data = new FormData();
    data.append("path", path);
    data.append("refId", "" + recordid);
    data.append("ref", ref);
    data.append("field", field);

    files.forEach(function (element) {
      // data.append('files', element, field+"_"+i);
      data.append("files", element);
    });

    return this.httpWithoutLoader
      .post<UploadedFile[]>(BaseUrl + "upload", data, {
        headers: this.genericService.tokenformheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const file: UploadedFile[] = value.body;
          return file;
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

  uploadFilesToAWS(path: string, files: File[]): Observable<UploadedFile[]> {
    const data = new FormData();
    data.append("path", path);

    files.forEach(function (element) {
      data.append("files", element);
    });

    return this.httpWithoutLoader
      .post<UploadedFile[]>(BaseUrl + "upload", data, {
        headers: this.genericService.tokenformheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const file: UploadedFile[] = value.body;
          return file;
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

  getSearchResults(term: string): Observable<SearchRecord[]> {
    return this.http
      .get<SearchRecord[]>(
        BaseUrl +
        "globalsearch?term=" +
        term +
        "&userid=" +
        this.authService.currentUserValue.user.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const records: SearchRecord[] = value.body;
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

  getdesignerdesign(
    designerid: number,
    starttime: string,
    endtime: string,
    requesttype: string
  ): Observable<any> {
    return this.http
      .get<any[]>(
        BaseUrl +
        "getdesignerdesigns?status=delivered&designerid=" +
        designerid +
        "&startdate=" +
        starttime +
        "&enddate=" +
        endtime +
        "&requesttype=" +
        requesttype,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const records: any[] = value.body;
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

  getanalystdesign(
    analystid: number,
    starttime: string,
    endtime: string,
    requesttype: string
  ): Observable<any> {
    return this.http
      .get<any[]>(
        BaseUrl +
        "getanalystdesigns?status=delivered&analystid=" +
        analystid +
        "&startdate=" +
        starttime +
        "&enddate=" +
        endtime +
        "&requesttype=" +
        requesttype,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const records: any[] = value.body;
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

  getNotification(limit: number): Observable<Notification[]> {
    return this.http
      .get<Notification[]>(
        BaseUrl +
        "notifications?userid=" +
        this.authService.currentUserValue.user.id +
        "&status=unread&_limit=" +
        limit +
        "&_sort=updated_at:desc",
        { headers: this.genericService.authheaders, observe: "response" }
      )
      .pipe(
        map((value) => {
          const detail: Notification[] = value.body;
          return detail;
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

  getUnreadNotification(limit: number): Observable<Notification[]> {
    return this.http
      .get<Notification[]>(
        BaseUrl +
        "notifications?userid=" +
        this.authService.currentUserValue.user.id +
        "&status=unread&_limit=" +
        limit +
        "&_sort=updated_at:desc",
        { headers: this.genericService.authheaders, observe: "response" }
      )
      .pipe(
        map((value) => {
          const detail: Notification[] = value.body;
          return detail;
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

  markNotificationRead(id: number, inputData: any): Observable<Notification> {
    return this.httpWithoutLoader
      .put<Notification>(
        BaseUrl + "notifications/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const data: Notification = value.body;
          return data;
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

  changeisplatformupdated(id: number): void {
    const postData = {
      isplatformupdated: true,
    };
    this.http
      .put(BaseUrl + "users/" + id, postData, {
        headers: this.genericService.authheaders,
      })
      .subscribe(() => {
        // do nothing.
      });
  }

  userData(id: number): Observable<User> {
    return this.http
      .get<User>(BaseUrl + "users/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const detail: User = value.body;
          return detail;
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

  getWattmonkAdmins(): Observable<User[]> {
    return this.http
      .get<User[]>(BaseUrl + "getadmins", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const wattmonkadmin: User[] = value.body;
          return wattmonkadmin;
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

  getWattmonkPEAdmins(): Observable<User[]> {
    return this.http
      .get<User[]>(BaseUrl + "getpeadmins", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const wattmonkPeeadmin: User[] = value.body;
          return wattmonkPeeadmin;
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
  getplatformupdate(): Observable<any> {
    return this.http
      .get<any>(
        BaseUrl +
        "platformupdates?status=true&platformtype=web&_limit=1&_sort=id:desc",
        {
          headers: this.genericService.authheaders,
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

  stripepayment(
    token: string,
    email: string,
    user: number,
    amount: number,
    paymenttype: string,
    coupanid: any,
    designid: number,
    serviceamount: number
  ): Observable<any> {
    const data = {
      token: token,
      email: email,
      user: user,
      amount: amount,
      paymenttype: paymenttype,
      couponid: coupanid,
      designid: designid,
      serviceamount: serviceamount,
    };
    return this.http
      .post<any>(BaseUrl + "createpayment", data, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          // const detail: User = value.body;
          return value;
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

  getClientSuperadmin(): Observable<User[]> {
    return this.http
      .get<User[]>(DesignUrl + "fetchsuperadmins", {
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

  getClientSuperadminTeamModule(): Observable<User[]> {
    return this.http
      .get<User[]>(BaseUrl + "team/clients", {
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

  getCompanies1(requesttype): Observable<Company[]> {
    return this.http
      .get<Company[]>(BaseUrl + "getcompanies?requesttype=" + requesttype, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const companies: Company[] = value.body;
          return companies;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getCompanies(): Observable<any> {
    return this.httpWithoutLoader
      .get<any>(BaseUrl + "getcompanies", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }
  getdesigner(): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getdesigners?requesttype=permit", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getpeengineers(): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getpeengineers", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getperlimdesigner(): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getdesigners?requesttype=prelim", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getAnalyst(): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getanalysts?requesttype=permit", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getperlimAnalyst(): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getanalysts?requesttype=prelim", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getClients(limit, skip): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getclients?limit=" + limit + "&skip=" + skip, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getCoupons(requesttype?: any): Observable<any> {
    return this.http
      .get<any>(
        BaseUrl +
        "getCoupons?userid=" +
        this.authService.currentUserValue.user.id +
        "&requesttype=" +
        requesttype,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  checkEnteredCoupan(inputData: any): Observable<any> {
    return this.http
      .post<any>(BaseUrl + "getCoupon", inputData, {
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

  userWalletTranscition(): Observable<any> {
    return this.http
      .get<any>(
        BaseUrl +
        "transactions/count?userid=" +
        this.authService.currentUserValue.user.parent.id +
        "&paymentstatus=succeeded",
        {
          headers: this.genericService.authheaders,
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

  getStripeSessionID(inputData: any): Observable<any> {
    return this.http
      .post<any>(BaseUrl + "walletrecharge", inputData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getGoverningcodes(city, state): Observable<any> {
    return this.http
      .get<any>(
        BaseUrl + "governingcodes?county_eq=" + city + "&state_eq=" + state,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const governingcodes: any = value.body;
          return governingcodes;
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

  checkCataloguesExistence(path: string): Observable<any> {
    const postData = {
      path: path,
    };

    return this.httpWithoutLoader
      .post<any>(
        BaseUrl + "permitpdfs/cataloguefilesexist",
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const response: any = value.body;
          return response;
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

  getAttachmentMaterials(
    attachmenttypeid: number
  ): Observable<AttachmentMaterial[]> {
    return this.http
      .get<AttachmentMaterial[]>(
        BaseUrl + "attachmentmaterials?attachmenttype_eq=" + attachmenttypeid,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const records: AttachmentMaterial[] = value.body;
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

  addAttachmentMaterial(
    description: string,
    attachmenttypeid: number
  ): Observable<AttachmentMaterial> {
    const postData = {
      description: description.toUpperCase(),
      attachmenttype: attachmenttypeid,
    };
    return this.httpWithoutLoader
      .post<AttachmentMaterial>(
        BaseUrl + "attachmentmaterials",
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const record: AttachmentMaterial = value.body;
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
  getWorkStatus(startdate, endate): Observable<any> {
    return this.http
      .get<any>(
        BaseUrl + "workstatus?startDate=" + startdate + "&endDate=" + endate,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const workstatus: any = value.body;
          return workstatus;
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

  getUserSetting(id: number): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "userhasactivejobs?userid=" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const usersetting: any = value.body;
          return usersetting;
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

  getSpecificRolesUsers(parentId: number, roleId: number): Observable<any> {
    return this.http
      .get(
        BaseUrl + "getcompanyuser?parentid=" + parentId + "&roleid=" + roleId,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const usersetting: any = value.body;
          return usersetting;
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
  getSingleUserDetail(id: number): Observable<User> {
    return this.http
      .get<User>(BaseUrl + "users/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const detail: User = value.body;
          return detail;
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

  getSingleModuleModelsData(id: number): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "modulemodels/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const modulemodel: any = value.body;
          return modulemodel;
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

  getSingleInverterModelsData(id: number): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "invertermodels/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const inverterModel: any = value.body;
          return inverterModel;
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
  setSingleModuleModelsData(id: number, postData: any): Observable<any> {
    return this.http
      .put<any>(BaseUrl + "modulemodels/" + id, postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const modulemodel: any = value.body;
          return modulemodel;
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

  saveSingleAmbienttempData(postData: any): Observable<any> {
    return this.http
      .post<any>(BaseUrl + "ambienttemps/", postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const ambienttemp: any = value.body;
          return ambienttemp;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.genericService.handleusersignout();
          } else {
            return throwError(err.error);
          }
        })
      );
  }
  setSingleInverterModelsData(id: number, postData: any): Observable<any> {
    return this.http
      .put<any>(BaseUrl + "invertermodels/" + id, postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const invertermodels: any = value.body;
          return invertermodels;
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

  getOCPDSData(searchData): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "ocpds?ampvalue_gte=" + searchData + "&_limit=1", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const ocpds: any = value.body;
          return ocpds;
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


  getconductorcol1ata(maxcurrent, temprating): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "necbasecurrentandwiresizes?maxcurrent_gte=" + maxcurrent + "&temprating=" + temprating + "&_limit=1", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const data: any = value.body;
          return data;
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
  getegcaData(maxcurrent): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "groundwiresizes?ratingaod_gte=" + maxcurrent + "&_limit=1 ", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const data: any = value.body;
          return data;
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

  getMultiplier(phaseofinverter: number, invertertype: string, initialconductorlocation: string): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "multipliers?phaseofinverter=" + phaseofinverter + "&invertertype=" + invertertype + "&initialconductorlocation=" + initialconductorlocation, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const data: any = value.body;
          return data;
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

  getResistance(wiresize: number): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "resistancecharts?wiresize=" + wiresize, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const data: any = value.body;
          return data;
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

  getnumberofcurrentcarryingconductors(invertertype: string, initialconductorlocation): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "numberofcurrentcarryingconductors?invertertype=" + invertertype + "&initialconductorlocation=" + initialconductorlocation, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const data: any = value.body;
          return data;
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
  getconduitfillfactor(numberofconductors): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "conduitfillfactors?numberofconductors=" + numberofconductors, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const data: any = value.body;
          return data;
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
  getAmbienttemp(state, city): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "ambienttemps?state=" + state + "&city=" + city, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const data: any = value.body;
          return data;
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

  getWireSize(wiretype, wiresize): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "wiresizes?wiretype=" + wiretype + "&wiresize=" + wiresize, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const data: any = value.body;
          return data;
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

  getConduitSize(conduitruntype): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "conduitsizes?conduitruntype=" + conduitruntype + "&_sort=conduitsize:ASC", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const data: any = value.body;
          return data;
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

  transferJobToAnotherUser(id, transferId, data): Observable<any> {
    return this.http
      .post(
        BaseUrl + "transferjobs?user=" + id + "&transferto=" + transferId,
        data,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getLastRecharge(): Observable<any> {
    return this.http
      .get(
        BaseUrl +
        "recharges?userid=" +
        this.authService.currentUserValue.user.id +
        "&_sort=id:desc&type=succeeded&_limit=1",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  downloadElectricalDataExcelSheet(postData): Observable<any> {
    return this.http.post(BaseUrl + "permitpdfs/getelectricaldetailsdata", postData,
      {
        headers: this.genericService.authheaders,
        observe: "response",
      }).pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }
  // notificationMarkAllAsRead(data): Observable<any> {

  //   return this.http.post(BaseUrl + "notificationsmarkasread", data,
  //     {
  //       headers: this.genericService.authheaders,
  //     });

  // }
  notificationMarkAllAsRead(data): Observable<any> {
    return this.http
      .post(BaseUrl + "notificationsmarkasread", data, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  saveElectricalData(postData): Observable<any> {
    return this.http.post(BaseUrl + "designelectricalinputs", postData,
      {
        headers: this.genericService.authheaders,
        observe: "response",
      }).pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  getGroupTeamHead(id?): Observable<any> {
    if (!id) {
      id = this.authService.currentUserValue.user.parent.id;
    }
    return this.http
      .get(
        BaseUrl + "getteamhead?clientid=" + id, //this.authService.currentUserValue.user.parent.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }

  getUserSettings(id: number): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "usersettings?userid=" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const usersetting: any = value.body;
          return usersetting;
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

  getFilterChats(text): Observable<any> {
    return this.http
      .get(
        BaseUrl +
        "chatgroups?title_contains=" +
        text +
        "&chatgroupusers_contains=" +
        this.authService.currentUserValue.user.cometchatuid,
        {
          headers: this.genericService.authheaders,
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

  addChatGroup(inputData): Observable<any> {
    return this.http
      .post(BaseUrl + "chatgroups", inputData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value;
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
  getClientAdmins(id): Observable<any> {
    return this.http
      .get(BaseUrl + "getclientadmins?clientid=" + id, {
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
  // getQualityCheckList() {
  //   return this.http.get(BaseUrl + "qualitychecklists",
  //     {
  //       headers: this.genericService.authheaders,
  //       observe: "response",
  //     }).pipe(
  //       map((value) => {
  //         return value.body;
  //       }),
  //       catchError((err: HttpErrorResponse) => {
  //         if (err.error.error == "Unauthorized") {
  //         } else {
  //           return throwError(err.error.message);
  //         }
  //       })
  //     );
  // }
  updateChecklistCriteria(id: number, inputData: any): Observable<any> {
    return this.httpWithoutLoader
      .put<any>(BaseUrl + "designchecklists/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const data: Notification = value.body;
          return data;
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
  getDynamicSideBar(id: number): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getusersettings?userid=" + id, {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("currentUser")).jwt,
        }),
        observe: "response",
      })
      .pipe(
        map((value) => {
          const usersetting: any = value.body;
          return usersetting;
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

  getQualityCheckList() {
    return this.http
      .get(BaseUrl + "qualitychecklists", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }
  updateQualityCheckList(id: number, inputData: any): Observable<any> {

    return this.httpWithoutLoader
      .put<any>(
        BaseUrl + "qualitychecklists/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const data: Notification = value.body;
          return data;
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

  getUnreadNotifications(): Observable<any> {
    return this.http
      .get<any>(
        BaseUrl +
        "notifications/count?userid=" +
        this.authService.currentUserValue.user.id +
        "&status=unread",
        { headers: this.genericService.authheaders, observe: "response" }
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

  getNotifications(limit, skip): Observable<Notification[]> {
    return this.http
      .get<Notification[]>(
        BaseUrl +
        "notifications?userid=" +
        this.authService.currentUserValue.user.id +
        "&_limit=" +
        limit +
        "&_start=" +
        skip +
        "&_sort=id:desc",
        { headers: this.genericService.authheaders, observe: "response" }
      )
      .pipe(
        map((value) => {
          const detail: Notification[] = value.body;
          return detail;
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
  getGraphData(searchdata): Observable<any> {
    return this.httpWithoutLoader
      .get<any>(BaseUrl + "dashboard?userid=" + searchdata, {
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
  getDesigenTrackerGraph(data, year?): Observable<any> {
    let url = "";
    if (year != undefined) {
      url = "designtrack/graph/monthly?reqtype=" + data + "&year=" + year;
    } else {
      url = "designtrack/graph/monthly?reqtype=" + data;
    }
    return this.httpWithoutLoader
      .get<any>(
        BaseUrl + url,

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
  getClientData(year, month, body, skip, limit, filter): Observable<any> {
    let url = "designtracknew?isfilter=" + filter + "&year=" + year + "&month=" + month + "&skip=" + skip + "&limit=" + limit;
    return this.httpWithoutLoader
      .post<any>(
        BaseUrl + url, body,
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
  getActivities(id, limit, skip): Observable<any> {
    return this.httpWithoutLoader
      .get<any>(
        BaseUrl +
        "getactivitiesofallteam?userid=" +
        id +
        "&limit=" +
        limit +
        "&skip=" +
        skip,
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
  getannouncements(): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getannouncement", {
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

  getAlertAnnounce(): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "getalertannounce", {
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

  getAllNotificationsCount(): Observable<any> {
    return this.http
      .get<any>(
        BaseUrl +
        "notifications/count?userid=" +
        this.authService.currentUserValue.user.id,
        { headers: this.genericService.authheaders, observe: "response" }
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

  editComments(id: number, inputData: any): Observable<any> {
    return this.httpWithoutLoader
      .put<any>(BaseUrl + "comments/" + id, JSON.stringify(inputData), {
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

  deleteComment(id: number): Observable<any> {
    return this.httpWithoutLoader
      .delete<any>(BaseUrl + "comments/" + id, {
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

  getAHJ(state: string, city: string): Observable<Ahj[]> {
    return this.http
      .get<Ahj[]>(
        BaseUrl + "ahjs?state=" + state + "&city=" + city + "&_sort=name:ASC",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const makes: Ahj[] = value.body;
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

  getAllUtilityData(): Observable<PrelimUtility[]> {
    return this.http
      .get<PrelimUtility[]>(BaseUrl + "utilities?_sort=name:ASC", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const makes: PrelimUtility[] = value.body;
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

  getAllAHJ(): Observable<Ahj[]> {
    return this.http
      .get<Ahj[]>(BaseUrl + "ahjs?_sort=name:ASC", {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const makes: Ahj[] = value.body;
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
  downloadExcel() {
    const body = {};
    return this.http
      .post(BaseUrl + "designtracknew?isfilter=false&isfile=true", body, {
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
  getUserRights(id) {
    return this.http
      .get(BaseUrl + "useraccessrights?userid=" + id, {
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
  saveUserRights(id, inputData) {
    return this.http
      .put(BaseUrl + "updateaccessrights/" + id, inputData, {
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

  getCatalogues(catalogues, name) {
    return this.http
      .get(
        BaseUrl +
        "getcatalogues?foldername=" +
        catalogues +
        "&modelname=" +
        name.toLowerCase(),
        {
          headers: this.genericService.authheaders,
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
}
