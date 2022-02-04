import {
  HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseUrl, DesignUrl, StampingBaseUrl } from "../_helpers";
import { Design, Pestamp, User } from "../_models";
import { Activity } from "../_models/activity";
import { DesignBOM } from "../_models/designbom";
import { DesignElectricalInformation } from "../_models/designelectricalinformation";
import { DesignerDetails } from "../_models/designerdetails";
import { DesignerRoofInput } from "../_models/designerroofinput";
import { DesignGeneralInformation } from "../_models/designgeneralinformation";
import { DesignStructuralInformation } from "../_models/designstructuralinformation";
import { AuthenticationService } from "./authentication.service";
import { GenericService } from "./generic.service";


@Injectable({ providedIn: "root" })
export class DesignService {
  httpWithoutLoader: HttpClient;
  public design: Observable<Design>;
  currentuser;
  currentuserparent;
  constructor(
    private handler: HttpBackend,
    private http: HttpClient,
    private genericService: GenericService,
    private authenticationService: AuthenticationService,
  ) {
    this.httpWithoutLoader = new HttpClient(this.handler);

    // if(this.authenticationService.currentUserValue.user.parent.id === undefined){
    //   this.currentuser = this.authenticationService.currentUserValue.user.id;
    // }else{
    //   this.currentuser = this.authenticationService.currentUserValue.user.id;
    // }

    // if(this.authenticationService.currentUserValue.user.parent.id === undefined){
    //   this.currentuserparent = this.authenticationService.currentUserValue.user.id;
    // }else{
    //   this.currentuserparent = this.authenticationService.currentUserValue.user.parent.id;
    // }

    this.currentuser = this.authenticationService.currentUserValue.user.id;
    this.currentuserparent =
      this.authenticationService.currentUserValue.user.parent.id;
  }

  getDesigners(clientid: number): Observable<User[]> {
    return this.http
      .get<User[]>(
        DesignUrl +
        "designers?parent_eq=" +
        this.currentuserparent +
        "&clientid=" +
        clientid,
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

  getPeEngineers(peenginertype: string): Observable<User[]> {
    return this.http
      .get<User[]>(
        StampingBaseUrl +
        "peengineers?pestamptype=" +
        peenginertype +
        "&parent_eq=" +
        this.authenticationService.currentUserValue.user.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const peengineers: User[] = value.body;
          return peengineers;
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
        DesignUrl +
        "analysts?parent_eq=" +
        this.currentuserparent +
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

  getDesignsCount1(
    requesttype,
    creatorparentid,
    statusfilter,
    reviwerid = null
  ): Observable<any> {
    reviwerid = reviwerid || this.currentuser;
    return this.httpWithoutLoader
      .get<any>(
        DesignUrl +
        "userdesigns/count?id=" +
        reviwerid +
        "&requesttype=" +
        requesttype +
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

  getDesignsCount(): Observable<any> {
    return this.httpWithoutLoader
      .get<any>(DesignUrl + "userdesigns/count?id=" + this.currentuser, {
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

  getUserDesignsStatusCount(userid): Observable<number> {
    return this.httpWithoutLoader
      .get<number>(DesignUrl + "userdesigns/count?id=" + userid, {
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
      .get<number>(DesignUrl + "userdesigns/acceptancecount?id=" + userid, {
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

  getFilteredDesigns(search: string): Observable<Design[]> {
    if (search.indexOf("id=") != 0) {
      search = "id=" + this.currentuser + "&" + search;
    }
    return this.httpWithoutLoader
      .get<Design[]>(DesignUrl + "userdesigns?" + search, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const designs: Design[] = value.body;
          return designs;
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

  getJoblisting(search: string): Observable<Design[]> {
    return this.httpWithoutLoader
      .get<Design[]>(BaseUrl + "designs?" + search, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const designs: Design[] = value.body;
          return designs;
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

  getDesignerDetails(search): Observable<DesignerDetails> {
    return this.httpWithoutLoader
      .get<DesignerDetails>(BaseUrl + "designerdetails/" + search, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const designs: DesignerDetails = value.body;
          return designs;
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

  getsiteassesmentjobs(): Observable<any[]> {
    return this.httpWithoutLoader
      .get<any[]>(
        DesignUrl +
        "getsiteassessmentjobs?id=" +
        this.authenticationService.currentUserValue.user.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const designs: any[] = value.body;
          return designs;
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

  getsalesproposeljobs(): Observable<any[]> {
    return this.httpWithoutLoader
      .get<any[]>(
        DesignUrl +
        "getsiteproposaljobs?id=" +
        this.authenticationService.currentUserValue.user.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const designs: any[] = value.body;
          return designs;
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

  getpermitjobs(): Observable<any[]> {
    return this.httpWithoutLoader
      .get<any[]>(
        DesignUrl +
        "getpermitjobs?id=" +
        this.authenticationService.currentUserValue.user.id,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const designs: any[] = value.body;
          return designs;
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

  getDesignDetails(id: any): Observable<Design> {
    return this.http
      .get<Design>(DesignUrl + "designs/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const designs: Design = value.body;
          return designs;
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

  getactivities(id: any, activitytype): Observable<Activity[]> {
    return this.http
      .get<Activity[]>(
        BaseUrl +
        "activities?type=" +
        activitytype +
        "&recordid=" +
        id +
        "&_sort=id:DESC",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const activity: Activity[] = value.body;
          return activity;
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

  addSiteAssessmentOld(
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
    onpriority: boolean,
    expecteddeliverydate: string,
    designstatus: string,
    designoutsourced: string,
    paymenttype: string,
    paymentstatus: string
  ): Observable<Design> {
    const postData = {
      chatid: requesttype + "_" + new Date().getTime(),
      groupchatpassword: "wattmonk" + new Date().getTime(),
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
      isonpriority: onpriority,
      source: "web",
      createdby: this.authenticationService.currentUserValue.user.id,
      creatorparentid:
        this.authenticationService.currentUserValue.user.parent.id,
      expecteddeliverydate: expecteddeliverydate,
      status: designstatus,
      outsourcedto: designoutsourced,
      paymenttype: paymenttype,
      paymentstatus: paymentstatus,
    };

    if (rooftype) {
      postData["rooftype"] = rooftype;
    }

    return this.httpWithoutLoader
      .post<Design>(DesignUrl + "designs", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const design: Design = value.body;
          return design;
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
    name: string,
    email: string,
    address: string,
    monthlybill: number,
    modulemake: number,
    modulemodel: number,
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
    onpriority: boolean,
    designstatus: string,
    designoutsourced: string,
    paymentstatus: string,
    designCreatedBy: number,
    designCreatedByUserParent: number,
    requirmenttype: string,
    oldcommentid: string,
    sameemailconfirmed: boolean,
    amount: number,
    customer: number,
    newmodulemake: string,
    newmodulemade: string,
    newinvertermake: string,
    newinvertermade: string,
    dataentry: boolean,
    designinverters: any
  ): Observable<Design> {
    let designCreatedByUser;
    let isoutsourced = false;
    let setStatus;

    let designacceptancestarttime = new Date();
    let expecteddeliverydate;
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    designacceptancestarttime.setMinutes(
      designacceptancestarttime.getMinutes() + 15
    );

    let acceptancestarttime;
    if (designCreatedBy) {
      designCreatedByUser = designCreatedBy;
      isoutsourced = true;
      acceptancestarttime = designacceptancestarttime;
      setStatus = "requestaccepted";
      expecteddeliverydate = tomorrow;
    } else {
      expecteddeliverydate = null;
      designCreatedByUser = this.authenticationService.currentUserValue.user.id;
      isoutsourced = false;
      acceptancestarttime = null;
      setStatus = designstatus;
    }

    let designCreatedUserParent;
    if (designCreatedByUserParent) {
      designCreatedUserParent = designCreatedByUserParent;
    } else {
      designCreatedUserParent =
        this.authenticationService.currentUserValue.user.parent.id;
    }

    const postData = {
      chatid: requesttype + "_" + new Date().getTime(),
      groupchatpassword: "wattmonk" + new Date().getTime(),
      email: email,
      name: name,
      address: address,
      monthlybill: monthlybill,
      solarmake: modulemake,
      solarmodel: modulemodel,
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
      isonpriority: onpriority,
      source: "web",
      createdby: designCreatedByUser,
      creatorparentid: designCreatedUserParent,
      expecteddeliverydate: expecteddeliverydate,
      status: setStatus,
      outsourcedto: designoutsourced,
      paymentstatus: paymentstatus,
      isoutsourced: isoutsourced,
      designacceptancestarttime: acceptancestarttime,
      requirmenttype: requirmenttype,
      oldcommentid: oldcommentid,
      sameemailconfirmed: sameemailconfirmed,
      amount: amount,
      customer: customer,
      newmodulemake: newmodulemake,
      newmodulemade: newmodulemade,
      newinvertermake: newinvertermake,
      newinvertermade: newinvertermade,
      dataentry: dataentry,
      designinverters: designinverters
    };

    if (rooftype) {
      postData["rooftype"] = rooftype;
    }

    return this.httpWithoutLoader
      .post<Design>(DesignUrl + "designs", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const design: Design = value.body;
          return design;
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
  addpPrelimProposal(
    name: string,
    email: string,
    address: string,
    monthlybill: number,
    modulemake: number,
    modulemodel: number,
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
    onpriority: boolean,
    designstatus: string,
    designoutsourced: string,
    paymentstatus: string,
    designCreatedBy: number,
    designCreatedByUserParent: number,
    utility: string,
    utilityrate: string,
    annualutilityescalation: number,
    incentive: number,
    costofsystem: number,
    personname: string,
    requirmenttype: string,
    company: string,
    oldcommentid: string,
    sameemailconfirmed: boolean,
    amount: number,
    customer: number,
    dataentry: boolean,
    designinverters: any
  ): Observable<Design> {
    let designCreatedByUser;
    let isoutsourced = false;
    let setStatus;

    let designacceptancestarttime = new Date();
    let expecteddeliverydate;
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    designacceptancestarttime.setMinutes(
      designacceptancestarttime.getMinutes() + 15
    );

    let acceptancestarttime;
    if (designCreatedBy) {
      designCreatedByUser = designCreatedBy;
      isoutsourced = true;
      acceptancestarttime = designacceptancestarttime;
      setStatus = "requestaccepted";
      expecteddeliverydate = tomorrow;
    } else {
      expecteddeliverydate = null;
      designCreatedByUser = this.authenticationService.currentUserValue.user.id;
      isoutsourced = false;
      acceptancestarttime = null;
      setStatus = designstatus;
    }

    let designCreatedUserParent;
    if (designCreatedByUserParent) {
      designCreatedUserParent = designCreatedByUserParent;
    } else {
      designCreatedUserParent =
        this.authenticationService.currentUserValue.user.parent.id;
    }

    const postData = {
      chatid: requesttype + "_" + new Date().getTime(),
      groupchatpassword: "wattmonk" + new Date().getTime(),
      email: email,
      name: name,
      address: address,
      monthlybill: monthlybill,
      solarmake: modulemake,
      solarmodel: modulemodel,
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
      isonpriority: onpriority,
      source: "web",
      createdby: designCreatedByUser,
      creatorparentid: designCreatedUserParent,
      expecteddeliverydate: expecteddeliverydate,
      status: setStatus,
      outsourcedto: designoutsourced,
      paymentstatus: paymentstatus,
      isoutsourced: isoutsourced,
      designacceptancestarttime: acceptancestarttime,
      utility: utility,
      utilityrate: utilityrate,
      annualutilityescalation: annualutilityescalation,
      incentive: incentive,
      costofsystem: costofsystem,
      personname: personname,
      requirementtype: requirmenttype,
      company: company,
      oldcommentid: oldcommentid,
      sameemailconfirmed: sameemailconfirmed,
      amount: amount,
      customer: customer,
      dataentry: dataentry,
      designinverters: designinverters
    };

    return this.httpWithoutLoader
      .post<Design>(DesignUrl + "designs", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const design: Design = value.body;
          return design;
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

  addPermitDesign(
    name: string,
    email: string,
    phonenumber: string,
    address: string,
    // monthlybill: number,
    modulemake: number,
    modulemodel: number,
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
    onpriority: boolean,
    designstatus: string,
    designoutsourced: string,
    paymentstatus: string,
    designCreatedBy: number,
    designCreatedByUserParent: number,
    issurveycompleted: boolean,
    survey: number,
    amount: number,
    oldcommentid: string,
    mpurequired: boolean,
    sameemailconfirmed: boolean,
    isdesigncompleted: boolean,
    design: number,
    modulecount: number,
    solarcapacity: number,
    utility: string,
    ahj: string,
    customer: number,
    esiid: number,
    designinverters: any,
    dataentry: boolean,
    raiserequestreason: string,
  ): Observable<Design> {
    let designCreatedByUser;
    let isoutsourced = false;
    let setStatus;

    let designacceptancestarttime = new Date();
    designacceptancestarttime.setMinutes(
      designacceptancestarttime.getMinutes() + 15
    );

    let acceptancestarttime;
    let expecteddeliverydate;
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (designCreatedBy) {
      designCreatedByUser = designCreatedBy;
      isoutsourced = true;
      acceptancestarttime = designacceptancestarttime;
      setStatus = "requestaccepted";
      expecteddeliverydate = tomorrow;
    } else {
      expecteddeliverydate = null;
      designCreatedByUser = this.authenticationService.currentUserValue.user.id;
      isoutsourced = false;
      acceptancestarttime = null;
      setStatus = designstatus;
    }

    let designCreatedUserParent;
    if (designCreatedByUserParent) {
      designCreatedUserParent = designCreatedByUserParent;
    } else {
      designCreatedUserParent =
        this.authenticationService.currentUserValue.user.parent.id;
    }

    const postData = {
      chatid: requesttype + "_" + new Date().getTime(),
      groupchatpassword: "wattmonk" + new Date().getTime(),
      email: email,
      name: name,
      phonenumber: phonenumber,
      address: address,
      // monthlybill: monthlybill,
      solarmake: modulemake,
      solarmodel: modulemodel,
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
      isonpriority: onpriority,
      source: "web",
      status: setStatus,
      createdby: designCreatedByUser,
      creatorparentid: designCreatedUserParent,
      outsourcedto: designoutsourced,
      paymentstatus: paymentstatus,
      isoutsourced: isoutsourced,
      designacceptancestarttime: acceptancestarttime,
      issurveycompleted: issurveycompleted,
      survey: survey,
      amount: amount,
      oldcommentid: oldcommentid,
      mpurequired: mpurequired,
      sameemailconfirmed: sameemailconfirmed,
      expecteddeliverydate: expecteddeliverydate,
      isdesigncompleted: isdesigncompleted,
      design: design,
      modulecount: modulecount,
      solarcapacity: solarcapacity,
      utility: utility,
      ahj: ahj,
      customer: customer,
      esiid: esiid,
      designinverters: designinverters,
      dataentry: dataentry,
      raiserequestreason: raiserequestreason
    };

    if (rooftype) {
      postData["rooftype"] = rooftype;
    }

    return this.httpWithoutLoader
      .post<Design>(DesignUrl + "designs", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const design: Design = value.body;
          return design;
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

  addPermitDesignOld(
    name: string,
    email: string,
    phonenumber: string,
    address: string,
    monthlybill: number,
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
    onpriority: boolean,
    expecteddeliverydate: string,
    designstatus: string,
    designoutsourced: string,
    paymenttype: string,
    mpurequired: boolean
  ): Observable<Design> {
    const postData = {
      chatid: requesttype + "_" + new Date().getTime(),
      groupchatpassword: "wattmonk" + new Date().getTime(),
      email: email,
      name: name,
      phonenumber: phonenumber,
      address: address,
      monthlybill: monthlybill,
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
      isonpriority: onpriority,
      source: "web",
      status: designstatus,
      createdby: this.authenticationService.currentUserValue.user.id,
      creatorparentid:
        this.authenticationService.currentUserValue.user.parent.id,
      expecteddeliverydate: expecteddeliverydate,
      outsourcedto: designoutsourced,
      paymenttype: paymenttype,
      mpurequired: mpurequired,
    };

    if (rooftype) {
      postData["rooftype"] = rooftype;
    }

    return this.httpWithoutLoader
      .post<Design>(DesignUrl + "designs", JSON.stringify(postData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const design: Design = value.body;
          return design;
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

  addPermitDesignerDetails(
    exposurecategory: string,
    showbackfeedrule: boolean,
    msplocation: String,
    scalesiteplan: String,
    scaleroofplan: String,
    scalestringlayout: String,
    panelheight: String,
    totalnumberofattachments: String,
    governingcodes: String,
    city: String,
    state: String,
    design: number,
    legend: string,
    nec: string
  ): Observable<DesignerDetails> {
    const postData = {
      exposurecategory: exposurecategory,
      showbackfeedrule: showbackfeedrule,
      msplocation: msplocation,
      design: design,
      scalesiteplan: scalesiteplan,
      scaleroofplan: scaleroofplan,
      scalestringlayout: scalestringlayout,
      panelheightofroof: panelheight,
      totalnumberofattachments: totalnumberofattachments,
      governingcodes: governingcodes,
      city: city,
      state: state,
      legend: legend,
      nec: nec
    };

    return this.httpWithoutLoader
      .post<DesignerDetails>(
        DesignUrl + "designerdetails",
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const design: DesignerDetails = value.body;
          return design;
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

  editPermitDesignerDetails(postData, id): Observable<DesignerDetails> {

    return this.httpWithoutLoader
      .put<DesignerDetails>(
        BaseUrl + "designerdetails/" + id,
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const design: DesignerDetails = value.body;
          return design;
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
  addRoofInput(
    numberofmodules: number,
    tilt: number,
    azimuth: number,
    roofarea: number,
    roofmaterial: string,
    designerdetail: number,
    rooftype: string
  ): Observable<DesignerRoofInput> {
    const postData = {
      numberofmodules: numberofmodules,
      tilt: tilt,
      azimuth: azimuth,
      roofarea: roofarea,
      roofmaterial: roofmaterial,
      designerdetail: designerdetail,
      rooftype: rooftype
    };

    return this.httpWithoutLoader
      .post<DesignerRoofInput>(
        DesignUrl + "designroofinputs",
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const record: DesignerRoofInput = value.body;
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

  addDesignAttachmentDetails(
    quantity: number,
    description: string,
    design: number
  ): Observable<DesignBOM> {
    const postData = {
      quantity: quantity,
      description: description,
      designerdetail: design,
    };

    return this.httpWithoutLoader
      .post<DesignBOM>(
        DesignUrl + "designattachmentsmaterials",
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const record: DesignBOM = value.body;
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

  editDesign(id: number, inputData: any): Observable<Design> {
    return this.httpWithoutLoader
      .put<Design>(DesignUrl + "designs/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Design = value.body;
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

  updateDesign(id: number, inputData: any): Observable<Design> {
    return this.http
      .put<Design>(DesignUrl + "designs/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Design = value.body;
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

  onholdDesign(id: number, inputData: any): Observable<Design> {
    return this.http
      .put<Design>(DesignUrl + "onholddesign/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Design = value.body;
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
  unholddesign(id: number, inputData: any): Observable<Design> {
    return this.http
      .put<Design>(DesignUrl + "unholddesign/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Design = value.body;
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
  assignTodesigner(id: number, inputData: any): Observable<Design> {
    return this.http
      .put<Design>(
        DesignUrl + "assignTodesigner/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Design = value.body;
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

  assignDesign(id: number, inputData: any): Observable<Design> {
    return this.http
      .put<Design>(DesignUrl + "designs/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Design = value.body;
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

  assignPestamps(id: number, inputData: any): Observable<Pestamp> {
    return this.http
      .put<Pestamp>(StampingBaseUrl + "assigntope/" + id, JSON.stringify(inputData), {
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
  assigntoPesuperadmin(id: number, inputData: any): Observable<Pestamp> {
    return this.http
      .put<Pestamp>(
        StampingBaseUrl + "assigntopesuperadmin/" + id,
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
  deleteDesign(id: string): Observable<Design> {
    let postData = {
      activestatus: false
    }
    return this.http
      .put<Design>(DesignUrl + "designs/" + id, postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const record: Design = value.body;
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

  addDesignGeneralInformation(
    batterybackup: string,
    riskcategory: string,
    financingtype: string,
    lessormeter: boolean,
    comments: string,
    ahjdetails: {},
    utilitydetails: {},
    firesetbackdetails: {},
    design: number
  ): Observable<DesignGeneralInformation> {
    const postData = {
      batterybackup: batterybackup,
      riskcategory: riskcategory,
      financingtype: financingtype,
      lessormeter: lessormeter,
      comments: comments,
      ahjdetails: ahjdetails,
      utilitydetails: utilitydetails,
      firesetbackdetails: firesetbackdetails,
      design: design,
      source: "web",
      addedby: this.authenticationService.currentUserValue.user.id,
    };

    return this.httpWithoutLoader
      .post<DesignGeneralInformation>(
        DesignUrl + "designgeneralinformations",
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const design: DesignGeneralInformation = value.body;
          return design;
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

  editDesignGeneralInformation(
    id: number,
    inputData: any
  ): Observable<DesignGeneralInformation> {
    return this.httpWithoutLoader
      .put<DesignGeneralInformation>(
        DesignUrl + "designgeneralinformations/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const record: DesignGeneralInformation = value.body;
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

  addDesignStructuralInformation(
    framing: string,
    framingsize: string,
    spacing: number,
    numberoflayers: number,
    maxspanspacing: number,
    roofpitch: number,
    roofazimuth: number,
    roofmaterial: string,
    rackingname: string,
    rackingmodel: string,
    attachmenttype: string,
    attachmentdistance: string,
    attachmentmountingplacement: string,
    rooftype: string,
    comments: string,
    design: number
  ): Observable<DesignStructuralInformation> {
    const postData = {
      framing: framing,
      framingsize: framingsize,
      spacing: spacing,
      numberoflayers: numberoflayers,
      maxspanspacing: maxspanspacing,
      roofpitch: roofpitch,
      roofazimuth: roofazimuth,
      roofmaterial: roofmaterial,
      rackingname: rackingname,
      rackingmodel: rackingmodel,
      attachmenttype: attachmenttype,
      attachmentdistance: attachmentdistance,
      attachmentmountingplacement: attachmentmountingplacement,
      rooftype: rooftype,
      comments: comments,
      design: design,
      source: "web",
      addedby: this.authenticationService.currentUserValue.user.id,
    };

    return this.httpWithoutLoader
      .post<DesignStructuralInformation>(
        DesignUrl + "designstructuralinformations",
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const design: DesignStructuralInformation = value.body;
          return design;
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

  editDesignStructuralInformation(
    id: number,
    inputData: any
  ): Observable<DesignStructuralInformation> {
    return this.httpWithoutLoader
      .put<DesignStructuralInformation>(
        DesignUrl + "designstructuralinformations/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const record: DesignStructuralInformation = value.body;
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

  addDesignElectricalInformation(
    acdisconnect: boolean,
    pvmeter: boolean,
    servicefeedsource: string,
    msp: string,
    mspsize: number,
    conduitrun: string,
    typeofconduit: string,
    interconnection: string,
    interconnection_input: string,
    mainbreakersize: number,
    batterymake: number,
    batterymodel: number,
    mspbrand: number,
    optimizer: number,
    numberofbatteries: number,
    combinerbox: boolean,
    comments: string,
    design: number,
    supplyvoltage: string
  ): Observable<DesignElectricalInformation> {
    const postData = {
      acdisconnect: acdisconnect,
      pvmeter: pvmeter,
      servicefeedsource: servicefeedsource,
      msp: msp,
      mspsize: mspsize,
      conduitrun: conduitrun,
      typeofconduit: typeofconduit,
      interconnection: interconnection,
      interconnection_input: interconnection_input,
      mainbreakersize: mainbreakersize,
      batterymake: batterymake,
      batterymodel: batterymodel,
      mspbrand: mspbrand,
      optimizer: optimizer,
      numberofbatteries: numberofbatteries,
      combinerbox: combinerbox,
      comments: comments,
      design: design,
      supplyvoltage: supplyvoltage,
      source: "web",
      addedby: this.authenticationService.currentUserValue.user.id,
    };

    return this.httpWithoutLoader
      .post<DesignElectricalInformation>(
        DesignUrl + "designelectricalinformations",
        JSON.stringify(postData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const design: DesignElectricalInformation = value.body;
          return design;
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

  editDesignElectricalInformation(
    id: number,
    inputData: any
  ): Observable<DesignElectricalInformation> {
    return this.httpWithoutLoader
      .put<DesignElectricalInformation>(
        DesignUrl + "designelectricalinformations/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const record: DesignElectricalInformation = value.body;
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

  generateDesignPDF(id: number): Observable<Design> {
    return this.http
      .get<Design>(DesignUrl + "permitpdfs/generate/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const designs: Design = value.body;
          return designs;
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

  selfassignDesign(id: number, inputData: any): Observable<any> {
    return this.http
      .post<any>(DesignUrl + "selfassign?id=" + id, JSON.stringify(inputData), {
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

  getpermitlastsolarmake(): Observable<any> {
    return this.http
      .get<any>(
        DesignUrl +
        "designs?createdbyid=" +
        this.authenticationService.currentUserValue.user.id +
        "&_sort=id:desc&_limit=1&requesttype=permit",
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const solarmake: any = value.body;
          return solarmake;
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

  getlastsolarmake(requirementtype: string): Observable<any> {
    return this.http
      .get<any>(
        DesignUrl +
        "designs?createdbyid=" +
        this.authenticationService.currentUserValue.user.id +
        "&_sort=id:desc&_limit=1&requesttype=prelim&requirementtype=" +
        requirementtype,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const solarmake: any = value.body;
          return solarmake;
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

  downloadPermitDesign(designid: number): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "permitpdfs/generate/" + designid, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const solarmake: any = value.body;
          return solarmake;
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


  getDesignerJobs(id: number) {
    return this.http
      .get(BaseUrl + "designs?status=designassigned&designassignedtoid=" + id, {
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
  getAnalystJobs(id: number) {
    return this.http
      .get(BaseUrl + "designs?status=reviewassigned&reviewassignedtoid=" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const Designelectricalinputs: any = value.body;
          return Designelectricalinputs;
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

  getElectricaltableData(designerdetailId): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "designelectricalinputs?designerdetail=" + designerdetailId, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const Designelectricalinputs: any = value.body;
          return Designelectricalinputs;
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

  getRoofInput(designerdetailId): Observable<any> {
    return this.http
      .get<any>(BaseUrl + "designroofinputs?designerdetail=" + designerdetailId, {
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

  saveDesignOrientations(inputData): Observable<any> {
    return this.http.post(BaseUrl + "designorientations", inputData,
      {
        headers: this.genericService.authheaders,
        observe: "response",
      }).pipe(
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
  acceptDesign(id: number, inputData: any): Observable<Design> {
    return this.httpWithoutLoader
      .put<Design>(DesignUrl + "acceptdesign/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Design = value.body;
          return member;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.genericService.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      )
  }
  getDesignOrientations(designedetailid): Observable<any> {
    return this.http.get(BaseUrl + "designorientations?designerdetail=" + designedetailid,
      {
        headers: this.genericService.authheaders,
        observe: "response",
      }).pipe(
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
  deliverdesign(id: number, inputData: any): Observable<Design> {
    return this.httpWithoutLoader
      .put<Design>(DesignUrl + "deliverdesign/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Design = value.body;
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
  getDesignByChatid(chatid) {
    return this.http
      .get(DesignUrl + "getdesignbychatid?chatid=" + chatid, {
        headers: this.genericService.authheaders,
        observe: "response",
      }).pipe(
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
  revisiondesign(id: number, inputData: any): Observable<Design> {
    return this.httpWithoutLoader
      .put<Design>(
        DesignUrl + "revisiondesign/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Design = value.body;
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
  reassignreview(id: number, inputData: any): Observable<Design> {
    return this.httpWithoutLoader
      .put<Design>(
        DesignUrl + "reassignreview/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Design = value.body;
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
  selfassignreview(id: number, inputData: any): Observable<Design> {
    return this.httpWithoutLoader
      .put<Design>(
        DesignUrl + "selfassignreview/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Design = value.body;
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
  assignreview(id: number, inputData: any): Observable<Design> {
    return this.httpWithoutLoader
      .put<Design>(DesignUrl + "assignreview/" + id, JSON.stringify(inputData), {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          const member: Design = value.body;
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
  completedbydesigner(id: number, inputData: any): Observable<Design> {
    return this.httpWithoutLoader
      .put<Design>(
        DesignUrl + "completedbydesigner/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Design = value.body;
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
  designpassedbyanalyst(id: number, inputData: any): Observable<Design> {
    return this.httpWithoutLoader
      .put<Design>(
        DesignUrl + "designpassedbyanalyst/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Design = value.body;
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

  designfailedbyanalyst(id: number, inputData: any): Observable<Design> {
    return this.httpWithoutLoader
      .put<Design>(
        DesignUrl + "designfailedbyanalyst/" + id,
        JSON.stringify(inputData),
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const member: Design = value.body;
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

  saveDesignInverters(id: number, inputData: any) {
    return this.httpWithoutLoader
      .put(BaseUrl + "designinverters/" + id, JSON.stringify(inputData), {
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

  startTime(data) {
    return this.http
      .post(
        DesignUrl + "tasktimings",
        data,
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

  deleteDesignInverters(id: Number) {
    return this.httpWithoutLoader
      .delete(BaseUrl + "designinverters/" + id, {
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

  getJobTime(): Observable<any> {
    return this.http.get<any>(DesignUrl + 'tasktimings?userid=' + this.currentuser + '&taskstatus=pending&_limit=1&_sort=id:desc', {
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

  editGoverningcode(id, governingcode) {
    return this.http
      .put(BaseUrl + "governingcodes/" + id, governingcode, {
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


  updateJobTime(id, data) {
    return this.http
      .put(
        DesignUrl + "tasktimings/" + id,
        data,
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
  getDesignBOM(designerdetailid) {
    return this.http
      .get(DesignUrl + "designboms?designerdetailid=" + designerdetailid, {
        headers: this.genericService.authheaders,
        observe: "response",
      }).pipe(
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
  generateDesignBOM(inputData) {
    return this.http
      .post(DesignUrl + "designboms/generate", inputData, {
        headers: this.genericService.authheaders,
        observe: "response",
      }).pipe(
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
  deleteDesignBOM(id) {
    return this.http
      .delete(DesignUrl + "designboms/" + id, {
        headers: this.genericService.authheaders,
        observe: "response",
      }).pipe(
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
  updateDesignBOM(inputData) {
    return this.http
      .post(DesignUrl + "designboms/update", inputData, {
        headers: this.genericService.authheaders,
        observe: "response",
      }).pipe(
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
