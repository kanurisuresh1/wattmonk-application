import {
  HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl } from "../_helpers";
import {
  BatteryMake, Design, InverterMake,
  InverterModel, ModuleMake,
  ModuleModel, MSPBrand, OptimizerModel, UploadedFile
} from "../_models";
import { Ahj } from "../_models/ahj";
import { Firesetback } from "../_models/firesetback";
import { RackingName } from "../_models/rackingname";
import { RoofMaterial } from "../_models/roofmaterial";
import { Utility } from "../_models/utility";
import { GenericService } from "./generic.service";
@Injectable({
  providedIn: "root",
})
export class GuestService {
  httpWithoutLoader: HttpClient;
  headers: HttpHeaders;
  formheaders: HttpHeaders;
  constructor(
    private http: HttpClient,
    private genericService: GenericService,
    private handler: HttpBackend
  ) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    this.httpWithoutLoader = new HttpClient(this.handler);
  }

  getModuleMakesData(): Observable<ModuleMake[]> {
    return this.http
      .get<ModuleMake[]>(BaseUrl + "modulemakes?_sort=name:ASC", {
        observe: "response",
      })
      .pipe(
        map((value) => {
          const modulemakes: ModuleMake[] = value.body;
          return modulemakes;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  getModuleModelsData(makeid: number): Observable<ModuleModel[]> {
    return this.http
      .get<ModuleModel[]>(BaseUrl + "modulemodels?modulemake_eq=" + makeid, {
        observe: "response",
      })
      .pipe(
        map((value) => {
          const modulemodels: ModuleModel[] = value.body;
          return modulemodels;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  getInverterMakesData(): Observable<InverterMake[]> {
    return this.http
      .get<InverterMake[]>(BaseUrl + "invertermakes?_sort=name:ASC", {
        observe: "response",
      })
      .pipe(
        map((value) => {
          const makes: InverterMake[] = value.body;
          return makes;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }
  getInverterModelsData(makeid: number): Observable<InverterModel[]> {
    return this.http
      .get<InverterModel[]>(
        BaseUrl + "invertermodels?invertermake_eq=" + makeid,
        {
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const models: InverterModel[] = value.body;
          return models;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  addSiteAssessment(
    name: string,
    email: string,
    address: string,
    monthlybill: number,
    modulemake: number,
    modulemodel: number,
    invertermake: number,
    invertermodel: number,
    rooftype: string,
    mountingtype: string,
    tiltofgroundmountingsystem: number,
    projecttype: string,
    newconstruction: boolean,
    comments: string,
    city: string,
    state: string,
    country: string,
    postalcode: number,
    requesttype: string,
    latitude: number,
    longitude: number,
    outsourcedto: number,
    isoutsourced: boolean,
    status: string,
    createdby: number,
    designacceptancestarttime: Date,
    newmodulemake: string,
    newmodulemade: string,
    newinvertermake: string,
    newinvertermade: string,
    inverterscount: number
  ): Observable<Design> {
    const postData = {
      chatid: "prelim" + "_" + new Date().getTime(),
      email: email,
      name: name,
      address: address,
      monthlybill: monthlybill,
      solarmake: modulemake,
      solarmodel: modulemodel,
      invertermake: invertermake,
      invertermodel: invertermodel,
      rooftype: rooftype,
      mountingtype: mountingtype,
      tiltofgroundmountingsystem: tiltofgroundmountingsystem,
      projecttype: projecttype,
      newconstruction: newconstruction,
      comments: comments,
      city: city,
      state: state,
      country: country,
      postalcode: postalcode,
      requesttype: requesttype,
      latitude: latitude,
      longitude: longitude,
      outsourcedto: outsourcedto,
      isoutsourced: isoutsourced,
      source: "web",
      status: status,
      createdby: createdby,
      usertype: "guest",
      designacceptancestarttime: designacceptancestarttime,
      creatorparentid: createdby,
      newmodulemake: newmodulemake,
      newmodulemade: newmodulemade,
      newinvertermake: newinvertermake,
      newinvertermade: newinvertermade,
      inverterscount: inverterscount,
    };

    if (rooftype) {
      postData["rooftype"] = rooftype;
    }
    return this.httpWithoutLoader
      .post<Design>(BaseUrl + "designs", JSON.stringify(postData), {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const design: Design = value.body;
          return design;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  addpPrelimProposal(
    name: string,
    email: string,
    address: string,
    monthlybill: number,
    modulemake: number,
    modulemodel: number,
    invertermake: number,
    invertermodel: number,
    rooftype: string,
    mountingtype: string,
    tiltofgroundmountingsystem: number,
    projecttype: string,
    newconstruction: boolean,
    comments: string,
    city: string,
    state: string,
    country: string,
    postalcode: number,
    requesttype: string,
    latitude: number,
    longitude: number,
    outsourcedto: number,
    isoutsourced: boolean,
    status: string,
    createdby: number,
    designacceptancestarttime: Date,
    utility: number,
    utilityrate: number,
    annualutilityescalation: number,
    incentive: number,
    costofsystem: number,
    personname: string,
    requirmenttype: string,

    inverterscount: number,
    newmodulemake: string,
    newmodulemade: string,
    newinvertermake: string,
    newinvertermade: string
  ): Observable<Design> {
    const postData = {
      chatid: "prelim" + "_" + new Date().getTime(),
      email: email,
      name: name,
      address: address,
      monthlybill: monthlybill,
      solarmake: modulemake,
      solarmodel: modulemodel,
      invertermake: invertermake,
      invertermodel: invertermodel,
      rooftype: rooftype,
      mountingtype: mountingtype,
      tiltofgroundmountingsystem: tiltofgroundmountingsystem,
      projecttype: projecttype,
      newconstruction: newconstruction,
      comments: comments,
      city: city,
      state: state,
      country: country,
      postalcode: postalcode,
      requesttype: requesttype,
      latitude: latitude,
      longitude: longitude,
      outsourcedto: outsourcedto,
      isoutsourced: isoutsourced,
      source: "web",
      status: status,
      createdby: createdby,
      usertype: "guest",
      designacceptancestarttime: designacceptancestarttime,
      creatorparentid: createdby,
      utility: utility,
      utilityrate: utilityrate,
      annualutilityescalation: annualutilityescalation,
      incentive: incentive,
      costofsystem: costofsystem,
      personname: personname,
      requirementtype: requirmenttype,
      inverterscount: inverterscount,
      newmodulemake: newmodulemake,
      newmodulemade: newmodulemade,
      newinvertermake: newinvertermake,
      newinvertermade: newinvertermade,
    };

    if (rooftype) {
      postData["rooftype"] = rooftype;
    }
    return this.httpWithoutLoader
      .post<Design>(BaseUrl + "designs", JSON.stringify(postData), {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const design: Design = value.body;
          return design;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  addguestPermitDesign(
    name: string,
    email: string,
    phonenumber: string,
    address: string,
    // monthlybill: number,
    modulemake: number,
    modulemodel: number,
    invertermake: number,
    invertermodel: number,
    rooftype: string,
    jobtype: string,
    mountingtype: string,
    tiltofgroundmountingsystem: number,
    projecttype: string,
    newconstruction: boolean,
    comments: string,
    city: string,
    state: string,
    country: string,
    postalcode: number,
    requesttype: string,
    latitude: number,
    longitude: number,
    outsourcedto: number,
    isoutsourced: boolean,
    createdby: number,
    status: string,
    designacceptancestarttime: Date,
    slabname: string,
    mpurequired: boolean,
    solarcapacity: number,
    modulecount: number,
    inverterscount: number,
    utility: string,
    ahj: any,
    newmodulemake: string,
    newmodulemade: string,
    newinvertermake: string,
    newinvertermade: string
  ): Observable<Design> {
    const postData = {
      chatid: "premit" + "_" + new Date().getTime(),
      email: email,
      name: name,
      phonenumber: phonenumber,
      address: address,
      // monthlybill: monthlybill,
      solarmake: modulemake,
      solarmodel: modulemodel,
      invertermake: invertermake,
      invertermodel: invertermodel,
      rooftype: rooftype,
      jobtype: jobtype,
      mountingtype: mountingtype,
      tiltofgroundmountingsystem: tiltofgroundmountingsystem,
      projecttype: projecttype,
      newconstruction: newconstruction,
      comments: comments,
      city: city,
      state: state,
      country: country,
      postalcode: postalcode,
      requesttype: requesttype,
      latitude: latitude,
      longitude: longitude,
      outsourcedto: outsourcedto,
      isoutsourced: isoutsourced,
      createdby: createdby,
      source: "web",
      status: status,
      usertype: "guest",
      designacceptancestarttime: designacceptancestarttime,
      creatorparentid: createdby,
      slabname: slabname,
      mpurequired: mpurequired,
      solarcapacity: solarcapacity,
      modulecount: modulecount,
      inverterscount: inverterscount,
      utility: utility,
      ahj: ahj,
      newmodulemake: newmodulemake,
      newmodulemade: newmodulemade,
      newinvertermake: newinvertermake,
      newinvertermade: newinvertermade,
    };
    if (rooftype) {
      postData["rooftype"] = rooftype;
    }
    return this.httpWithoutLoader
      .post<Design>(BaseUrl + "designs", JSON.stringify(postData), {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const design: Design = value.body;
          return design;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }
  getBatteryMakes(): Observable<BatteryMake[]> {
    return this.http
      .get<BatteryMake[]>(BaseUrl + "batterymakes", {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: BatteryMake[] = value.body;
          return records;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }
  getOptimizerModels(id: number): Observable<OptimizerModel[]> {
    return this.http
      .get<OptimizerModel[]>(BaseUrl + "optimizers?invertermake_eq=" + id, {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: OptimizerModel[] = value.body;
          return records;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  getMSPBrands(): Observable<MSPBrand[]> {
    return this.http
      .get<MSPBrand[]>(BaseUrl + "mspbrands", {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: MSPBrand[] = value.body;
          return records;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  getAhjdetails(city: string): Observable<Ahj[]> {
    return this.http
      .get<Ahj[]>(BaseUrl + "ahjs?city_eq=" + city, {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const ahj: Ahj[] = value.body;
          return ahj;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }
  getUtilitydetails(city: string): Observable<Utility[]> {
    return this.http
      .get<Utility[]>(BaseUrl + "utilities?city_eq=" + city, {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const utility: Utility[] = value.body;
          return utility;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  getfiresetbackdetails(city: string): Observable<Firesetback[]> {
    return this.http
      .get<Firesetback[]>(BaseUrl + "firesetbacks?city_eq=" + city, {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const detail: Firesetback[] = value.body;
          return detail;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  getGoogleImage(lat: number, lng: number): Observable<Blob> {
    return this.http.get(
      "https://maps.googleapis.com/maps/api/staticmap?zoom=20&size=1100x500&scale=2&maptype=satellite&key=AIzaSyCePxz4wA_knfjvNBhV0RKzrySsf4o8QFU&center=" +
      lat +
      "," +
      lng,
      { responseType: "blob" }
    );
  }

  getRoofMaterials(rooftype: string): Observable<RoofMaterial[]> {
    return this.http
      .get<RoofMaterial[]>(BaseUrl + "roofmaterials?rooftype_eq=" + rooftype, {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: RoofMaterial[] = value.body;
          return records;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }
  getRackingNames(): Observable<RackingName[]> {
    return this.http
      .get<RackingName[]>(BaseUrl + "rackingnames", {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const records: RackingName[] = value.body;
          return records;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
        })
      );
  }

  addModuleMake(name: string): Observable<ModuleMake> {
    const postData = {
      name: name.toUpperCase(),
    };

    return this.httpWithoutLoader
      .post<ModuleMake>(BaseUrl + "modulemakes", JSON.stringify(postData), {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: ModuleMake = value.body;
          return record;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
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
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: ModuleModel = value.body;
          return record;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  addInverterMake(name: string): Observable<InverterMake> {
    const postData = {
      name: name.toUpperCase(),
    };

    return this.httpWithoutLoader
      .post<InverterMake>(BaseUrl + "invertermakes", JSON.stringify(postData), {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: InverterMake = value.body;
          return record;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
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
          headers: this.headers,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const record: InverterModel = value.body;
          return record;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }

  deleteUploadedFile(id: string): Observable<UploadedFile> {
    return this.http
      .delete<UploadedFile>(BaseUrl + "upload/files/" + id, {
        headers: this.headers,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: UploadedFile = value.body;
          return record;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err.error.message);
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
        observe: "response",
      })
      .pipe(
        map((value) => {
          const file: UploadedFile[] = value.body;
          return file;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
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
          if (err.error.error != "Unauthorized") {
            return throwError(err.error.message);
          }
        })
      );
  }
}
