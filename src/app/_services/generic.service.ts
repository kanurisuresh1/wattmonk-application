import { Location } from "@angular-material-extensions/google-maps-autocomplete";
import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { CometChat } from "@cometchat-pro/chat";
import * as moment from "moment";
import { COMETCHAT_CONSTANTS, ROLES } from "../_helpers";
import { Design, InverterMake, User } from "../_models";
import { ClientRole } from "../_models/clientrole";
import { Company } from "../_models/company";
import { DesignElectricalInformation } from "../_models/designelectricalinformation";
import { DesignGeneralInformation } from "../_models/designgeneralinformation";
import { Survey } from "../_models/survey";
import { AuthenticationService } from "./authentication.service";
@Injectable({
  providedIn: "root",
})
export class GenericService {
  authheaders: HttpHeaders;
  formheaders: HttpHeaders;
  tokenformheaders: HttpHeaders;
  retryattempt = 2;
  private selectedChatUser: string;
  private selectedChatGroup = "";
  private passwordLength = 6;
  private addUpper = true;
  private addNumbers = true;
  private addSymbols = false;
  public backroute = "";
  private newGeneratedDesign: Design;
  private newSiteLocation: Location;
  ischatuserloggedin = false;
  ispermissiongranted = false;
  totalunreadmessages;
  private selectedInverterMake: InverterMake;
  fcmpushtoken: string;
  prelimdesigncharges;
  permitdesigncharges;
  pestampscharges;
  commercialpestampcharges;
  siteproposalcharges;
  numberoffreedesign;
  stripepaymenttoken;
  outgoingaudio = new Audio();
  incomingaudio = new Audio();
  startproducttour = true;
  prelimcoupans;
  permitcoupans;
  userWalletfirsttranscition = true;
  public totalcountsforallgroups;
  clientroles: ClientRole[];
  specificclient: boolean;
  companies: Company[];
  runmaintour = false;
  permitpreviousSolarInverterMake;
  assessmentpreviousSolarInverterMake;
  proposalpreviousSolarInverterMake;
  showItemDetails = false;
  isPDFAutogenerationAccess: boolean = false;
  mentionbuttonselected = false;
  constructor(
    private authenticationService: AuthenticationService,
  ) {
    this.outgoingaudio.src = "../../../../assets/outgoingcall.mp3";
    this.incomingaudio.src = "../../../../assets/incomingcall.mp3";
  }

  initializeCometChat(): void {
    const appID = COMETCHAT_CONSTANTS.APP_ID;
    const region = COMETCHAT_CONSTANTS.REGION;
    const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(region)
      .build();
    CometChat.init(appID, appSetting).then(
      () => {
        if (this.authenticationService.currentUserValue != null) {
          // You can now call login function.
          this.loginCometChatUser(
            "" + this.authenticationService.currentUserValue.user.cometchatuid
          );
        }
      },
      () => {
        // Check the reason for error and take appropriate action.
      }
    );
  }

  loginCometChatUser(userid: string): void {
    const UID = userid;
    const apiKey = COMETCHAT_CONSTANTS.API_KEY;

    CometChat.login(UID, apiKey).then(
      () => {
        this.ischatuserloggedin = true;
        this.updatefcmtokenOnCometChat();
        this.getUnreadMessageCountForGroups();
      },
      () => {
        if (!this.ischatuserloggedin && this.retryattempt > 0) {
          this.retryattempt -= 1;
          this.loginCometChatUser(
            "" + this.authenticationService.currentUserValue.user.id
          );
        }
      }
    );
  }

  getUnreadMessageCountForGroups(): void {
    CometChat.getUnreadMessageCountForAllGroups().then(
      (array) => {
        let totalcount = 0;
        const user = array;
        const entries = Object.entries(user);
        for (const val of entries) {
          totalcount += val[1];
        }
        this.totalcountsforallgroups = totalcount;
        return totalcount;
      },
      () => {
        // do nothing.
      }
    );
  }

  async getUnreadMessageCountForGroupsAsyc() {
    await CometChat.getUnreadMessageCountForAllGroups().then(
      (array) => {
        let totalcount = 0;
        const user = array;
        const entries = Object.entries(user);
        for (const val of entries) {
          totalcount += val[1];
        }
        this.totalcountsforallgroups = totalcount;
        return totalcount;
      },
      () => {
        // do nothing.
      }
    );
  }

  updatefcmtokenOnCometChat(): void {
    const appID = COMETCHAT_CONSTANTS.APP_ID;
    const userUID = "" + this.authenticationService.currentUserValue.user.id;
    let appToken;
    CometChat.getJoinedGroups().then((groups) => {
      CometChat.getAppSettings().then((settings) => {
        const appsettings: any = settings;
        appsettings.extensions.forEach((ext) => {
          if (ext.id == "push-notification") {
            appToken = ext.appToken;
          }
        });
        const url =
          "https://push-notification-us.cometchat.io/v1/subscribetomany?appToken=" +
          appToken;
        fetch(url, {
          method: "POST",
          headers: new Headers({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            appId: appID,
            fcmToken: this.fcmpushtoken,
            uid: userUID,
            groups: groups,
            platform: "javascript",
          }),
        })
          .then(() => {
            // if (response.status < 200 || response.status >= 400) {
            // } else {
            // }
          })
          .catch(() => {
            // do nothing.
          });
      });
    });
  }

  setRequiredHeaders(): void {
    this.authheaders = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization:
        "Bearer " + this.authenticationService.currentUserValue.jwt,
    });
    this.formheaders = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Bearer " + this.authenticationService.currentUserValue.jwt,
    });
    this.tokenformheaders = new HttpHeaders({
      Authorization:
        "Bearer " + this.authenticationService.currentUserValue.jwt,
    });
  }

  randomPass(): string {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = this.addUpper ? lower.toUpperCase() : "";
    const nums = this.addNumbers ? "0123456789" : "";
    const symbols = this.addSymbols ? "!#$%&'()*+,-./:;<=>?@[\\]^_`{|}~" : "";

    const all = lower + upper + nums + symbols;
    while (true) {
      let pass = "";
      for (let i = 0; i < this.passwordLength; i++) {
        pass += all[(Math.random() * all.length) | 0];
      }

      // criteria:
      if (!/[a-z]/.test(pass)) continue; // lowercase is a must
      if (this.addUpper && !/[A-Z]/.test(pass)) continue; // check uppercase
      if (this.addSymbols && !/\W/.test(pass)) continue; // check symbols
      if (this.addNumbers && !/\d/.test(pass)) continue; // check nums

      return pass; // all good
    }
  }

  formateMonth(monthstring: string) {
    let monthname;
    switch (monthstring) {
      case "01":
        monthname = "Jan";
        break;
      case "02":
        monthname = "Feb";
        break;
      case "03":
        monthname = "Mar";
        break;
      case "04":
        monthname = "Apr";
        break;
      case "05":
        monthname = "May";
        break;
      case "06":
        monthname = "Jun";
        break;
      case "07":
        monthname = "Jul";
        break;
      case "08":
        monthname = "Aug";
        break;
      case "09":
        monthname = "Sept";
        break;
      case "10":
        monthname = "Oct";
        break;
      case "11":
        monthname = "Nov";
        break;
      case "12":
        monthname = "Dec";
        break;
    }
    return monthname;
  }
  formatDateInTimeAgo(datestring: string) {
    return moment(datestring, "YYYY-MM-DD HH:mm:ss GMT Z").fromNow();
  }

  formatDateInDisplayFormat(datestring: string): string {
    if (datestring != null && datestring != undefined) {
      const d = new Date(datestring);
      const ye = new Intl.DateTimeFormat("en", { year: "2-digit" }).format(d);
      const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
      const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

      const today = new Date();
      if (d.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0)) {
        return "Today";
      } else {
        return `${da} ${mo} ${ye}`;
      }
    } else {
      return "-";
    }
  }

  formatDateInDisplayFormatnew(datestring: string): string {
    if (datestring != null) {
      const d = new Date(datestring);
      const formatted = new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(d);

      return formatted;
    } else {
      return "-";
    }
  }

  formatDateInCalendarPickerFormat(datestring: string) {
    if (datestring != null) {
      const d = new Date(datestring);
      const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
      const mo = new Intl.DateTimeFormat("en", { month: "numeric" }).format(d);
      const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

      const finaldate = new Date(`${mo}/${da}/${ye}`);

      return finaldate;
    } else {
      return "-";
    }
  }

  formatDateTimeInDisplayFormat(datestring: string): string {
    if (datestring != null) {
      const d = new Date(datestring);
      const formatted = new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        hour: "numeric",
        minute: "numeric",
      }).format(d);

      return formatted;
    } else {
      return "-";
    }
  }

  formatTimeInDisplayFormat(datestring: string): string {
    if (datestring != null) {
      var d = new Date(datestring);
      var offset = d.getTimezoneOffset();
      d.setMinutes(d.getMinutes() + offset);
      const formatted = new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "numeric",
      }).format(d);

      return formatted;
    } else {
      return "-";
    }
  }

  formatDateInBackendFormat(datestring: string): string {
    if (datestring != null) {
      const d = new Date(datestring);
      const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
      const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
      const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

      return `${ye}-${mo}-${da}`;
    } else {
      return "-";
    }
  }

  isDatePassed(datestring: string): boolean {
    const checkdate = moment(datestring, "YYYYMMDD");
    const todaydate = moment(new Date(), "YYYYMMDD");
    const lateby = todaydate.diff(checkdate, "days");
    if (lateby > 0) {
      return true;
    } else {
      return false;
    }
  }

  getTheLatebyString(datestring: string): string {
    const start = moment(datestring, "YYYYMMDD");
    const end = moment(new Date(), "YYYYMMDD");
    const lateby = end.diff(start, "days");
    if (lateby == 0) {
      return "few minutes";
    } else if (lateby == 1) return "a day";
    else if (lateby < 30) return lateby + " days";
    else if (lateby == 30) return "a month";
    else if (lateby > 30 && lateby < 365) return lateby + " months";
    else if (lateby == 365) return "an year";
    else return "few minutes";
  }

  getInitials(firstname: string, lastname: string): string {
    const fullname = firstname + " " + lastname; let names = fullname.split(" "),
      initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  }

  getCompanyInitials(company: string): string {
    const names = company.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    } else {
      initials = names[0].substring(0, 2).toUpperCase();
    }

    return initials;
  }

  findInvalidControls(form: FormGroup) {
    const invalid = [];
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  getJobTypeName(type): string | string | string {
    if (type == "pvbattery") {
      return "PV + Battery";
    } else if (type == "battery") {
      return "Battery";
    } else {
      return "PV";
    }
  }
  getPestampTypeName(type): string | string | string {
    if (type == "structural") {
      return "Structural";
    } else if (type == "electrical") {
      return "Electrical";
    } else {
      return "Both";
    }
  }

  getBooleanValue(type): string | string {
    if (type) {
      return "Yes";
    }
    return "No";
  }

  getRoleName(roleid): string {
    switch (roleid) {
      case ROLES.ContractorSuperAdmin:
      case ROLES.SuperAdmin:
        return "Super Admin";
      case ROLES.ContractorAdmin:
      case ROLES.Admin:
        return "Admin";
      case ROLES.BD:
        return "Design Manager";
      case ROLES.Surveyor:
        return "Surveyor";
      case ROLES.Designer:
        return "Designer";
      case ROLES.Analyst:
        return "Analyst";
      case ROLES.Master:
        return "Master";
      case ROLES.TeamHead:
        return "Team Head";
      case ROLES.Peengineer:
        return "PE Engineer";
      case ROLES.SuccessManager:
        return "Success Manager";
    }
  }

  getInterconnectionName(con: string): string {
    if (con == "backfed") {
      return "Backfed";
    } else if (con == "dreatemainbreaker") {
      return "Dreate main breaker";
    } else if (con == "sstwithct") {
      return "SST with CT";
    } else if (con == "loadsidetap") {
      return "Load side tap";
    } else if (con == "sstwithlocationofsst") {
      return "SST with Location of SST";
    } else if (con == "supplysidetap") {
      return "Supply side tap";
    }
  }

  getConduitName(con: string): string {
    if (con == "emt") {
      return "EMT";
    } else if (con == "sch80pvc") {
      return "SCH 80 PVC";
    } else if (con == "sch40pvc") {
      return "SCH 40 PVC";
    }
  }

  getAttachmentDistanceName(item: string): string {
    if (item == "fortyeight") {
      return '48"';
    } else if (item == "seventytwo") {
      return '72"';
    } else if (item == "spantable") {
      return "Span Table";
    }
  }

  getDesignStatusName(status: string): string {
    if (status == "created") {
      return "New Request";
    } else if (status == "designassigned") {
      return "Designing Assigned";
    } else if (status == "designcompleted") {
      return "Designing Completed";
    } else if (status == "reviewassigned") {
      return "In Review";
    } else if (status == "reviewpassed") {
      return "Review Passed";
    } else if (status == "reviewfailed") {
      return "Review Failed";
    } else if (status == "delivered") {
      return "Delivered";
    } else if (status == "outsourced") {
      return "Waiting for acceptance";
    } else if (status == "requestaccepted") {
      return "Accepted";
    } else if (status == "requestdeclined") {
      return "On Hold";
    }
  }

  getDesignStageName(status: string): string {
    if (status == "created") {
      return "Unassigned";
    } else if (status == "designassigned") {
      return "Designing";
    } else if (status == "designcompleted") {
      return "Designing";
    } else if (status == "reviewassigned") {
      return "Review";
    } else if (status == "reviewpassed") {
      return "Review";
    } else if (status == "reviewfailed") {
      return "Review";
    }
  }

  getPestampStatusName(status: string): string {
    if (status == "created") {
      return "New Request";
    } else if (status == "assigned") {
      return "Assigned";
    } else if (status == "completed") {
      return "Completed";
    } else if (status == "delivered") {
      return "Delivered";
    } else if (status == "outsourced") {
      return "Waiting for acceptance";
    } else if (status == "accepted") {
      return "Accepted";
    } else if (status == "declined") {
      return "On Hold";
    }
  }

  getSurveyStatusName(status: string): string {
    if (status == "created") {
      return "New Request";
    } else if (status == "completed") {
      return "Completed";
    }
  }

  createdesignoutofsurvey(survey: Survey): Design {
    const design = new Design();
    design.name = survey.name;
    design.email = survey.email;
    design.address = survey.address;
    design.city = survey.city;
    design.state = survey.state;
    design.country = survey.country;
    design.jobtype = survey.jobtype;
    design.solarmake = survey.modulemake;
    design.solarmodel = survey.modulemodel;

    const generalinfo = new DesignGeneralInformation();
    generalinfo.batterybackup = survey.batterybackup;
    generalinfo.utilitydetails = survey.utility;
    generalinfo.modulescount = survey.numberofmodules;
    design.designgeneralinformation = generalinfo;

    const electricalinfo = new DesignElectricalInformation();
    electricalinfo.acdisconnect = survey.acdisconnect;
    electricalinfo.pvmeter = survey.pvmeter;
    electricalinfo.servicefeedsource = survey.servicefeedsource;
    electricalinfo.mainbreakersize = survey.mainbreakersize;
    electricalinfo.interconnection = survey.interconnection;
    design.electricalinformation = electricalinfo;

    return design;
  }

  isUserAdmin(user: User): boolean {
    if (
      user.role.id == ROLES.SuperAdmin ||
      user.role.id == ROLES.Admin ||
      user.role.id == ROLES.PeAdmin ||
      user.role.id == ROLES.PESuperAdmin
    ) {
      return true;
    } else if (
      user.role.id == ROLES.ContractorSuperAdmin ||
      user.role.id == ROLES.ContractorAdmin ||
      user.role.id == ROLES.SuccessManager ||
      user.role.id == ROLES.Master ||
      user.role.id == ROLES.TeamHead ||
      user.role.id == ROLES.SuccessManager
    ) {
      return true;
    } else if (user.role.id == ROLES.BD) {
      return true;
    } else {
      return false;
    }
  }

  setSelectedChatUser(user: string): void {
    this.selectedChatUser = user;
  }

  getSelectedChatUser(): string {
    return this.selectedChatUser;
  }

  setSelectedChatGroupID(group: string): void {
    this.selectedChatGroup = group;
  }

  getSelectedChatGroupID(): string {
    return this.selectedChatGroup;
  }

  getRemainingTime(endtime: string): string {
    const now = new Date();
    const t = Date.parse(endtime) - Date.parse(now.toString());
    const minutes = Math.floor((t / 1000 / 60) % 60);
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    if (hours > 0 || minutes > 0) {
      return "" + hours + "h : " + minutes + "m";
    } else {
      return "0h : 0m";
    }
  }

  isFileImage(file): boolean {
    return file && file["type"].split("/")[0] === "image";
  }

  setNewGeneratedDesign(record: Design): void {
    this.newGeneratedDesign = record;
  }

  getNewGeneratedDesign() {
    return this.newGeneratedDesign;
  }

  setNewSiteLocation(record: Location): void {
    this.newSiteLocation = record;
  }

  getNewSiteLocation(): Location {
    return this.newSiteLocation;
  }

  setSelectedInverterMake(make: InverterMake): void {
    this.selectedInverterMake = make;
  }

  getSelectedInverterMake() {
    return this.selectedInverterMake;
  }
  preventBack(): void {
    window.history.forward();
  }

  handleusersignout(): void {
    localStorage.clear();
    CometChat.logout();
    //this.router.navigate(['/auth/login']);

    window.location.href = "/auth/login";
    setTimeout(function () {
      "preventBack()";
    }, 0);
    window.onunload = function () {
      // null;
    };
  }

  async playOutgoingAudio(): Promise<void> {
    this.outgoingaudio.loop = true;
    this.outgoingaudio.load();
    await this.outgoingaudio.play();
  }

  stopOutgoingAudio(): void {
    this.outgoingaudio.pause();
  }

  async playIncomingAudio(): Promise<void> {
    this.incomingaudio.loop = true;
    this.incomingaudio.load();
    await this.incomingaudio.play();
  }


  stopIncomingAudio(): void {
    this.incomingaudio.pause();
  }

  dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  getMimetype(extension) {
    let mimetype;

    switch (extension) {
      case ".gif":
        // Graphics Interchange Format
        mimetype = "image/gif";
        break;
      case ".jpm":
        // JPEG 2000 Compound Image File Format
        mimetype = "video/jpm";
        break;
      case ".jpeg":
      case ".jpg":
        // JPEG Image
        mimetype = "image/jpeg";
        break;
      case ".jpgv":
        // JPGVideo
        mimetype = "video/jpeg";
        break;
      case ".png":
        // Portable Network Graphics (PNG)
        mimetype = "image/png";
        break;
      case ".ppm":
        // Portable Pixmap Format
        mimetype = "image/x-portable-pixmap";
        break;
      case ".svg":
        // Scalable Vector Graphics (SVG)
        mimetype = "image/svg+xml";
        break;
      case ".tiff":
        // Tagged Image File Format
        mimetype = "image/tiff";
        break;
      case ".xbm":
        // X BitMap
        mimetype = "image/x-xbitmap";
        break;
      case ".xpm":
        // X PixMap
        mimetype = "image/x-xpixmap";
        break;
      case ".xwd":
        // X Window Dump
        mimetype = "image/x-xwindowdump";
        break;
      case ".mdb":
        // Microsoft Access
        mimetype = "application/x-msaccess";
        break;
      case ".xls":
        // Microsoft Excel
        mimetype = "application/vnd.ms-excel";
        break;
      case ".xlam":
        // Microsoft Excel - Add-In File
        mimetype = "application/vnd.ms-excel.addin.macroenabled.12";
        break;
      case ".xlsb":
        // Microsoft Excel - Binary Workbook
        mimetype = "application/vnd.ms-excel.sheet.binary.macroenabled.12";
        break;
      case ".xltm":
        // Microsoft Excel - Macro-Enabled Template File
        mimetype = "application/vnd.ms-excel.template.macroenabled.12";
        break;
      case ".xlsm":
        // Microsoft Excel - Macro-Enabled Workbook
        mimetype = "application/vnd.ms-excel.sheet.macroenabled.12";
        break;
      case ".pptx":
        // Microsoft Office - OOXML - Presentation
        mimetype =
          "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        break;
      case ".sldx":
        // Microsoft Office - OOXML - Presentation (Slide)
        mimetype =
          "application/vnd.openxmlformats-officedocument.presentationml.slide";
        break;
      case ".ppsx":
        // Microsoft Office - OOXML - Presentation (Slideshow)
        mimetype =
          "application/vnd.openxmlformats-officedocument.presentationml.slideshow";
        break;
      case ".potx":
        // Microsoft Office - OOXML - Presentation Template
        mimetype =
          "application/vnd.openxmlformats-officedocument.presentationml.template";
        break;
      case ".xlsx":
        // Microsoft Office - OOXML - Spreadsheet
        mimetype =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        break;
      case ".xltx":
        // Microsoft Office - OOXML - Spreadsheet Teplate
        mimetype =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.template";
        break;
      case ".docx":
        // Microsoft Office - OOXML - Word Document
        mimetype =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case ".dotx":
        // Microsoft Office - OOXML - Word Document Template
        mimetype =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.template";
        break;
      case ".ppt":
        // Microsoft PowerPoint
        mimetype = "application/vnd.ms-powerpoint";
        break;
      case ".ppam":
        // Microsoft PowerPoint - Add-in file
        mimetype = "application/vnd.ms-powerpoint.addin.macroenabled.12";
        break;
      case ".sldm":
        // Microsoft PowerPoint - Macro-Enabled Open XML Slide
        mimetype = "application/vnd.ms-powerpoint.slide.macroenabled.12";
        break;
      case ".pptm":
        // Microsoft PowerPoint - Macro-Enabled Presentation File
        mimetype = "application/vnd.ms-powerpoint.presentation.macroenabled.12";
        break;
      case ".ppsm":
        // Microsoft PowerPoint - Macro-Enabled Slide Show File
        mimetype = "application/vnd.ms-powerpoint.slideshow.macroenabled.12";
        break;
      case ".mpp":
        // Microsoft Project
        mimetype = "application/vnd.ms-project";
        break;
      case ".doc":
        // Microsoft Word
        mimetype = "application/msword";
        break;
      case ".wri":
        // Microsoft Wordpad
        mimetype = "application/x-mswrite";
        break;
      case ".wps":
        // Microsoft Works
        mimetype = "application/vnd.ms-works";
        break;
      case ".pdf":
        // Adobe Portable Document Format
        mimetype = "application/pdf";
        break;
      case ".txt":
        // Text File
        mimetype = "text/plain";
        break;
      default:
        break;
    }

    if (mimetype) {
      return mimetype;
    }

    switch (extension) {
      case ".x3d":
        // 3D Crossword Plugin
        mimetype = "application/vnd.hzn-3d-crossword";
        break;
      case ".3gp":
        // 3GP
        mimetype = "video/3gpp";
        break;
      case ".3g2":
        // 3GP2
        mimetype = "video/3gpp2";
        break;
      case ".mseq":
        // 3GPP MSEQ File
        mimetype = "application/vnd.mseq";
        break;
      case ".pwn":
        // 3M Post It Notes
        mimetype = "application/vnd.3m.post-it-notes";
        break;
      case ".plb":
        // 3rd Generation Partnership Project - Pic Large
        mimetype = "application/vnd.3gpp.pic-bw-large";
        break;
      case ".psb":
        // 3rd Generation Partnership Project - Pic Small
        mimetype = "application/vnd.3gpp.pic-bw-small";
        break;
      case ".pvb":
        // 3rd Generation Partnership Project - Pic Var
        mimetype = "application/vnd.3gpp.pic-bw-let";
        break;
      case ".tcap":
        // 3rd Generation Partnership Project - Transaction Capabilities Application Part
        mimetype = "application/vnd.3gpp2.tcap";
        break;
      case ".7z":
        // 7-Zip
        mimetype = "application/x-7z-compressed";
        break;
      case ".abw":
        // AbiWord
        mimetype = "application/x-abiword";
        break;
      case ".ace":
        // Ace Archive
        mimetype = "application/x-ace-compressed";
        break;
      case ".acc":
        // Active Content Compression
        mimetype = "application/vnd.americandynamics.acc";
        break;
      case ".acu":
        // ACU Cobol
        mimetype = "application/vnd.acucobol";
        break;
      case ".atc":
        // ACU Cobol
        mimetype = "application/vnd.acucorp";
        break;
      case ".adp":
        // Adaptive differential pulse-code modulation
        mimetype = "audio/adpcm";
        break;
      case ".aab":
        // Adobe (Macropedia) Authorware - Binary File
        mimetype = "application/x-authorware-bin";
        break;
      case ".aam":
        // Adobe (Macropedia) Authorware - Map
        mimetype = "application/x-authorware-map";
        break;
      case ".aas":
        // Adobe (Macropedia) Authorware - Segment File
        mimetype = "application/x-authorware-seg";
        break;
      case ".air":
        // Adobe AIR Application
        mimetype =
          "application/vnd.adobe.air-application-installer-package+zip";
        break;
      case ".swf":
        // Adobe Flash
        mimetype = "application/x-shockwave-flash";
        break;
      case ".fxp":
        // Adobe Flex Project
        mimetype = "application/vnd.adobe.fxp";
        break;
      case ".ppd":
        // Adobe PostScript Printer Description File Format
        mimetype = "application/vnd.cups-ppd";
        break;
      case ".dir":
        // Adobe Shockwave Player
        mimetype = "application/x-director";
        break;
      case ".xdp":
        // Adobe XML Data Package
        mimetype = "application/vnd.adobe.xdp+xml";
        break;
      case ".xfdf":
        // Adobe XML Forms Data Format
        mimetype = "application/vnd.adobe.xfdf";
        break;
      case ".aac":
        // Advanced Audio Coding (AAC)
        mimetype = "audio/x-aac";
        break;
      case ".ahead":
        // Ahead AIR Application
        mimetype = "application/vnd.ahead.space";
        break;
      case ".azf":
        // AirZip FileSECURE
        mimetype = "application/vnd.airzip.filesecure.azf";
        break;
      case ".azs":
        // AirZip FileSECURE
        mimetype = "application/vnd.airzip.filesecure.azs";
        break;
      case ".azw":
        // Amazon Kindle eBook format
        mimetype = "application/vnd.amazon.ebook";
        break;
      case ".ami":
        // AmigaDE
        mimetype = "application/vnd.amiga.ami";
        break;
      case "N/A":
        // Andrew Toolkit
        mimetype = "application/andrew-inset";
        break;
      case ".apk":
        // Android Package Archive
        mimetype = "application/vnd.android.package-archive";
        break;
      case ".cii":
        // ANSER-WEB Terminal Client - Certificate Issue
        mimetype = "application/vnd.anser-web-certificate-issue-initiation";
        break;
      case ".fti":
        // ANSER-WEB Terminal Client - Web Funds Transfer
        mimetype = "application/vnd.anser-web-funds-transfer-initiation";
        break;
      case ".atx":
        // Antix Game Player
        mimetype = "application/vnd.antix.game-component";
        break;
      case ".mpkg":
        // Apple Installer Package
        mimetype = "application/vnd.apple.installer+xml";
        break;
      case ".aw":
        // Applixware
        mimetype = "application/applixware";
        break;
      case ".les":
        // Archipelago Lesson Player
        mimetype = "application/vnd.hhe.lesson-player";
        break;
      case ".swi":
        // Arista Networks Software Image
        mimetype = "application/vnd.aristanetworks.swi";
        break;
      case ".s":
        // Assembler Source File
        mimetype = "text/x-asm";
        break;
      case ".atomcat":
        // Atom Publishing Protocol
        mimetype = "application/atomcat+xml";
        break;
      case ".atomsvc":
        // Atom Publishing Protocol Service Document
        mimetype = "application/atomsvc+xml";
        break;
      case ".atom, .xml":
        // Atom Syndication Format
        mimetype = "application/atom+xml";
        break;
      case ".ac":
        // Attribute Certificate
        mimetype = "application/pkix-attr-cert";
        break;
      case ".aif":
        // Audio Interchange File Format
        mimetype = "audio/x-aiff";
        break;
      case ".avi":
        // Audio Video Interleave (AVI)
        mimetype = "video/x-msvideo";
        break;
      case ".aep":
        // Audiograph
        mimetype = "application/vnd.audiograph";
        break;
      case ".dxf":
        // AutoCAD DXF
        mimetype = "image/vnd.dxf";
        break;
      case ".dwf":
        // Autodesk Design Web Format (DWF)
        mimetype = "model/vnd.dwf";
        break;
      case ".par":
        // BAS Partitur Format
        mimetype = "text/plain-bas";
        break;
      case ".bcpio":
        // Binary CPIO Archive
        mimetype = "application/x-bcpio";
        break;
      case ".bin":
        // Binary Data
        mimetype = "application/octet-stream";
        break;
      case ".torrent":
        // BitTorrent
        mimetype = "application/x-bittorrent";
        break;
      case ".cod":
        // Blackberry COD File
        mimetype = "application/vnd.rim.cod";
        break;
      case ".bmi":
        // BMI Drawing Data Interchange
        mimetype = "application/vnd.bmi";
        break;
      case ".sh":
        // Bourne Shell Script
        mimetype = "application/x-sh";
        break;
      case ".btif":
        // BTIF
        mimetype = "image/prs.btif";
        break;
      case ".rep":
        // BusinessObjects
        mimetype = "application/vnd.businessobjects";
        break;
      case ".bz":
        // Bzip Archive
        mimetype = "application/x-bzip";
        break;
      case ".bz2":
        // Bzip2 Archive
        mimetype = "application/x-bzip2";
        break;
      case ".csh":
        // C Shell Script
        mimetype = "application/x-csh";
        break;
      case ".c":
        // C Source File
        mimetype = "text/x-c";
        break;
      case ".cdxml":
        // CambridgeSoft Chem Draw
        mimetype = "application/vnd.chemdraw+xml";
        break;
      case ".css":
        // Cascading Style Sheets (CSS)
        mimetype = "text/css";
        break;
      case ".cdx":
        // ChemDraw eXchange file
        mimetype = "chemical/x-cdx";
        break;
      case ".cml":
        // Chemical Markup Language
        mimetype = "chemical/x-cml";
        break;
      case ".csml":
        // Chemical Style Markup Language
        mimetype = "chemical/x-csml";
        break;
      case ".cdbcmsg":
        // CIM Database
        mimetype = "application/vnd.contact.cmsg";
        break;
      case ".cla":
        // Claymore Data Files
        mimetype = "application/vnd.claymore";
        break;
      case ".c4g":
        // Clonk Game
        mimetype = "application/vnd.clonk.c4group";
        break;
      case ".sub":
        // Close Captioning - Subtitle
        mimetype = "image/vnd.dvb.subtitle";
        break;
      case ".cdmia":
        // Cloud Data Management Interface (CDMI) - Capability
        mimetype = "application/cdmi-capability";
        break;
      case ".cdmic":
        // Cloud Data Management Interface (CDMI) - Contaimer
        mimetype = "application/cdmi-container";
        break;
      case ".cdmid":
        // Cloud Data Management Interface (CDMI) - Domain
        mimetype = "application/cdmi-domain";
        break;
      case ".cdmio":
        // Cloud Data Management Interface (CDMI) - Object
        mimetype = "application/cdmi-object";
        break;
      case ".cdmiq":
        // Cloud Data Management Interface (CDMI) - Queue
        mimetype = "application/cdmi-queue";
        break;
      case ".c11amc":
        // ClueTrust CartoMobile - Config
        mimetype = "application/vnd.cluetrust.cartomobile-config";
        break;
      case ".c11amz":
        // ClueTrust CartoMobile - Config Package
        mimetype = "application/vnd.cluetrust.cartomobile-config-pkg";
        break;
      case ".ras":
        // CMU Image
        mimetype = "image/x-cmu-raster";
        break;
      case ".csv":
        // Comma-Seperated Values
        mimetype = "text/csv";
        break;
      case ".cpt":
        // Compact Pro
        mimetype = "application/mac-compactpro";
        break;
      case ".wmlc":
        // Compiled Wireless Markup Language (WMLC)
        mimetype = "application/vnd.wap.wmlc";
        break;
      case ".cgm":
        // Computer Graphics Metafile
        mimetype = "image/cgm";
        break;
      case ".ice":
        // CoolTalk
        mimetype = "x-conference/x-cooltalk";
        break;
      case ".cmx":
        // Corel Metafile Exchange (CMX)
        mimetype = "image/x-cmx";
        break;
      case ".xar":
        // CorelXARA
        mimetype = "application/vnd.xara";
        break;
      case ".cmc":
        // CosmoCaller
        mimetype = "application/vnd.cosmocaller";
        break;
      case ".cpio":
        // CPIO Archive
        mimetype = "application/x-cpio";
        break;
      case ".clkx":
        // CrickSoftware - Clicker
        mimetype = "application/vnd.crick.clicker";
        break;
      case ".clkk":
        // CrickSoftware - Clicker - Keyboard
        mimetype = "application/vnd.crick.clicker.keyboard";
        break;
      case ".clkp":
        // CrickSoftware - Clicker - Palette
        mimetype = "application/vnd.crick.clicker.palette";
        break;
      case ".clkt":
        // CrickSoftware - Clicker - Template
        mimetype = "application/vnd.crick.clicker.template";
        break;
      case ".clkw":
        // CrickSoftware - Clicker - Wordbank
        mimetype = "application/vnd.crick.clicker.wordbank";
        break;
      case ".wbs":
        // Critical Tools - PERT Chart EXPERT
        mimetype = "application/vnd.criticaltools.wbs+xml";
        break;
      case ".cryptonote":
        // CryptoNote
        mimetype = "application/vnd.rig.cryptonote";
        break;
      case ".cif":
        // Crystallographic Interchange Format
        mimetype = "chemical/x-cif";
        break;
      case ".cmdf":
        // CrystalMaker Data Format
        mimetype = "chemical/x-cmdf";
        break;
      case ".cu":
        // CU-SeeMe
        mimetype = "application/cu-seeme";
        break;
      case ".cww":
        // CU-Writer
        mimetype = "application/prs.cww";
        break;
      case ".dcurl":
        // Curl - Detached Applet
        mimetype = "text/vnd.curl.dcurl";
        break;
      case ".mcurl":
        // Curl - Manifest File
        mimetype = "text/vnd.curl.mcurl";
        break;
      case ".scurl":
        // Curl - Source Code
        mimetype = "text/vnd.curl.scurl";
        break;
      case ".car":
        // CURL Applet
        mimetype = "application/vnd.curl.car";
        break;
      case ".pcurl":
        // CURL Applet
        mimetype = "application/vnd.curl.pcurl";
        break;
      case ".cmp":
        // CustomMenu
        mimetype = "application/vnd.yellowriver-custom-menu";
        break;
      case ".dssc":
        // Data Structure for the Security Suitability of Cryptographic Algorithms
        mimetype = "application/dssc+der";
        break;
      case ".xdssc":
        // Data Structure for the Security Suitability of Cryptographic Algorithms
        mimetype = "application/dssc+xml";
        break;
      case ".deb":
        // Debian Package
        mimetype = "application/x-debian-package";
        break;
      case ".uva":
        // DECE Audio
        mimetype = "audio/vnd.dece.audio";
        break;
      case ".uvi":
        // DECE Graphic
        mimetype = "image/vnd.dece.graphic";
        break;
      case ".uvh":
        // DECE High Definition Video
        mimetype = "video/vnd.dece.hd";
        break;
      case ".uvm":
        // DECE Mobile Video
        mimetype = "video/vnd.dece.mobile";
        break;
      case ".uvu":
        // DECE MP4
        mimetype = "video/vnd.uvvu.mp4";
        break;
      case ".uvp":
        // DECE PD Video
        mimetype = "video/vnd.dece.pd";
        break;
      case ".uvs":
        // DECE SD Video
        mimetype = "video/vnd.dece.sd";
        break;
      case ".uvv":
        // DECE Video
        mimetype = "video/vnd.dece.video";
        break;
      case ".dvi":
        // Device Independent File Format (DVI)
        mimetype = "application/x-dvi";
        break;
      case ".seed":
        // Digital Siesmograph Networks - SEED Datafiles
        mimetype = "application/vnd.fdsn.seed";
        break;
      case ".dtb":
        // Digital Talking Book
        mimetype = "application/x-dtbook+xml";
        break;
      case ".res":
        // Digital Talking Book - Resource File
        mimetype = "application/x-dtbresource+xml";
        break;
      case ".ait":
        // Digital Video Broadcasting
        mimetype = "application/vnd.dvb.ait";
        break;
      case ".svc":
        // Digital Video Broadcasting
        mimetype = "application/vnd.dvb.service";
        break;
      case ".eol":
        // Digital Winds Music
        mimetype = "audio/vnd.digital-winds";
        break;
      case ".djvu":
        // DjVu
        mimetype = "image/vnd.djvu";
        break;
      case ".dtd":
        // Document Type Definition
        mimetype = "application/xml-dtd";
        break;
      case ".mlp":
        // Dolby Meridian Lossless Packing
        mimetype = "application/vnd.dolby.mlp";
        break;
      case ".wad":
        // Doom Video Game
        mimetype = "application/x-doom";
        break;
      case ".dpg":
        // DPGraph
        mimetype = "application/vnd.dpgraph";
        break;
      case ".dra":
        // DRA Audio
        mimetype = "audio/vnd.dra";
        break;
      case ".dfac":
        // DreamFactory
        mimetype = "application/vnd.dreamfactory";
        break;
      case ".dts":
        // DTS Audio
        mimetype = "audio/vnd.dts";
        break;
      case ".dtshd":
        // DTS High Definition Audio
        mimetype = "audio/vnd.dts.hd";
        break;
      case ".dwg":
        // DWG Drawing
        mimetype = "image/vnd.dwg";
        break;
      case ".geo":
        // DynaGeo
        mimetype = "application/vnd.dynageo";
        break;
      case ".es":
        // ECMAScript
        mimetype = "application/ecmascript";
        break;
      case ".mag":
        // EcoWin Chart
        mimetype = "application/vnd.ecowin.chart";
        break;
      case ".mmr":
        // EDMICS 2000
        mimetype = "image/vnd.fujixerox.edmics-mmr";
        break;
      case ".rlc":
        // EDMICS 2000
        mimetype = "image/vnd.fujixerox.edmics-rlc";
        break;
      case ".exi":
        // Efficient XML Interchange
        mimetype = "application/exi";
        break;
      case ".mgz":
        // EFI Proteus
        mimetype = "application/vnd.proteus.magazine";
        break;
      case ".epub":
        // Electronic Publication
        mimetype = "application/epub+zip";
        break;
      case ".eml":
        // Email Message
        mimetype = "message/rfc822";
        break;
      case ".nml":
        // Enliven Viewer
        mimetype = "application/vnd.enliven";
        break;
      case ".xpr":
        // Express by Infoseek
        mimetype = "application/vnd.is-xpr";
        break;
      case ".xif":
        // eXtended Image File Format (XIFF)
        mimetype = "image/vnd.xiff";
        break;
      case ".xfdl":
        // Extensible Forms Description Language
        mimetype = "application/vnd.xfdl";
        break;
      case ".emma":
        // Extensible MultiModal Annotation
        mimetype = "application/emma+xml";
        break;
      case ".ez2":
        // EZPix Secure Photo Album
        mimetype = "application/vnd.ezpix-album";
        break;
      case ".ez3":
        // EZPix Secure Photo Album
        mimetype = "application/vnd.ezpix-package";
        break;
      case ".fst":
        // FAST Search & Transfer ASA
        mimetype = "image/vnd.fst";
        break;
      case ".fvt":
        // FAST Search & Transfer ASA
        mimetype = "video/vnd.fvt";
        break;
      case ".fbs":
        // FastBid Sheet
        mimetype = "image/vnd.fastbidsheet";
        break;
      case ".fe_launch":
        // FCS Express Layout Link
        mimetype = "application/vnd.denovo.fcselayout-link";
        break;
      case ".f4v":
        // Flash Video
        mimetype = "video/x-f4v";
        break;
      case ".flv":
        // Flash Video
        mimetype = "video/x-flv";
        break;
      case ".fpx":
        // FlashPix
        mimetype = "image/vnd.fpx";
        break;
      case ".npx":
        // FlashPix
        mimetype = "image/vnd.net-fpx";
        break;
      case ".flx":
        // FLEXSTOR
        mimetype = "text/vnd.fmi.flexstor";
        break;
      case ".fli":
        // FLI/FLC Animation Format
        mimetype = "video/x-fli";
        break;
      case ".ftc":
        // FluxTime Clip
        mimetype = "application/vnd.fluxtime.clip";
        break;
      case ".fdf":
        // Forms Data Format
        mimetype = "application/vnd.fdf";
        break;
      case ".f":
        // Fortran Source File
        mimetype = "text/x-fortran";
        break;
      case ".mif":
        // FrameMaker Interchange Format
        mimetype = "application/vnd.mif";
        break;
      case ".fm":
        // FrameMaker Normal Format
        mimetype = "application/vnd.framemaker";
        break;
      case ".fh":
        // FreeHand MX
        mimetype = "image/x-freehand";
        break;
      case ".fsc":
        // Friendly Software Corporation
        mimetype = "application/vnd.fsc.weblaunch";
        break;
      case ".fnc":
        // Frogans Player
        mimetype = "application/vnd.frogans.fnc";
        break;
      case ".ltf":
        // Frogans Player
        mimetype = "application/vnd.frogans.ltf";
        break;
      case ".ddd":
        // Fujitsu - Xerox 2D CAD Data
        mimetype = "application/vnd.fujixerox.ddd";
        break;
      case ".xdw":
        // Fujitsu - Xerox DocuWorks
        mimetype = "application/vnd.fujixerox.docuworks";
        break;
      case ".xbd":
        // Fujitsu - Xerox DocuWorks Binder
        mimetype = "application/vnd.fujixerox.docuworks.binder";
        break;
      case ".oas":
        // Fujitsu Oasys
        mimetype = "application/vnd.fujitsu.oasys";
        break;
      case ".oa2":
        // Fujitsu Oasys
        mimetype = "application/vnd.fujitsu.oasys2";
        break;
      case ".oa3":
        // Fujitsu Oasys
        mimetype = "application/vnd.fujitsu.oasys3";
        break;
      case ".fg5":
        // Fujitsu Oasys
        mimetype = "application/vnd.fujitsu.oasysgp";
        break;
      case ".bh2":
        // Fujitsu Oasys
        mimetype = "application/vnd.fujitsu.oasysprs";
        break;
      case ".spl":
        // FutureSplash Animator
        mimetype = "application/x-futuresplash";
        break;
      case ".fzs":
        // FuzzySheet
        mimetype = "application/vnd.fuzzysheet";
        break;
      case ".g3":
        // G3 Fax Image
        mimetype = "image/g3fax";
        break;
      case ".gmx":
        // GameMaker ActiveX
        mimetype = "application/vnd.gmx";
        break;
      case ".gtw":
        // Gen-Trix Studio
        mimetype = "model/vnd.gtw";
        break;
      case ".txd":
        // Genomatix Tuxedo Framework
        mimetype = "application/vnd.genomatix.tuxedo";
        break;
      case ".ggb":
        // GeoGebra
        mimetype = "application/vnd.geogebra.file";
        break;
      case ".ggt":
        // GeoGebra
        mimetype = "application/vnd.geogebra.tool";
        break;
      case ".gdl":
        // Geometric Description Language (GDL)
        mimetype = "model/vnd.gdl";
        break;
      case ".gex":
        // GeoMetry Explorer
        mimetype = "application/vnd.geometry-explorer";
        break;
      case ".gxt":
        // GEONExT and JSXGraph
        mimetype = "application/vnd.geonext";
        break;
      case ".g2w":
        // GeoplanW
        mimetype = "application/vnd.geoplan";
        break;
      case ".g3w":
        // GeospacW
        mimetype = "application/vnd.geospace";
        break;
      case ".gsf":
        // Ghostscript Font
        mimetype = "application/x-font-ghostscript";
        break;
      case ".bdf":
        // Glyph Bitmap Distribution Format
        mimetype = "application/x-font-bdf";
        break;
      case ".gtar":
        // GNU Tar Files
        mimetype = "application/x-gtar";
        break;
      case ".texinfo":
        // GNU Texinfo Document
        mimetype = "application/x-texinfo";
        break;
      case ".gnumeric":
        // Gnumeric
        mimetype = "application/x-gnumeric";
        break;
      case ".kml":
        // Google Earth - KML
        mimetype = "application/vnd.google-earth.kml+xml";
        break;
      case ".kmz":
        // Google Earth - Zipped KML
        mimetype = "application/vnd.google-earth.kmz";
        break;
      case ".gqf":
        // GrafEq
        mimetype = "application/vnd.grafeq";
        break;
      case ".gv":
        // Graphviz
        mimetype = "text/vnd.graphviz";
        break;
      case ".gac":
        // Groove - Account
        mimetype = "application/vnd.groove-account";
        break;
      case ".ghf":
        // Groove - Help
        mimetype = "application/vnd.groove-help";
        break;
      case ".gim":
        // Groove - Identity Message
        mimetype = "application/vnd.groove-identity-message";
        break;
      case ".grv":
        // Groove - Injector
        mimetype = "application/vnd.groove-injector";
        break;
      case ".gtm":
        // Groove - Tool Message
        mimetype = "application/vnd.groove-tool-message";
        break;
      case ".tpl":
        // Groove - Tool Template
        mimetype = "application/vnd.groove-tool-template";
        break;
      case ".vcg":
        // Groove - Vcard
        mimetype = "application/vnd.groove-vcard";
        break;
      case ".h261":
        // H.261
        mimetype = "video/h261";
        break;
      case ".h263":
        // H.263
        mimetype = "video/h263";
        break;
      case ".h264":
        // H.264
        mimetype = "video/h264";
        break;
      case ".hpid":
        // Hewlett Packard Instant Delivery
        mimetype = "application/vnd.hp-hpid";
        break;
      case ".hps":
        // Hewlett-Packard's WebPrintSmart
        mimetype = "application/vnd.hp-hps";
        break;
      case ".hdf":
        // Hierarchical Data Format
        mimetype = "application/x-hdf";
        break;
      case ".rip":
        // Hit'n'Mix
        mimetype = "audio/vnd.rip";
        break;
      case ".hbci":
        // Homebanking Computer Interface (HBCI)
        mimetype = "application/vnd.hbci";
        break;
      case ".jlt":
        // HP Indigo Digital Press - Job Layout Languate
        mimetype = "application/vnd.hp-jlyt";
        break;
      case ".pcl":
        // HP Printer Command Language
        mimetype = "application/vnd.hp-pcl";
        break;
      case ".hpgl":
        // HP-GL/2 and HP RTL
        mimetype = "application/vnd.hp-hpgl";
        break;
      case ".hvs":
        // HV Script
        mimetype = "application/vnd.yamaha.hv-script";
        break;
      case ".hvd":
        // HV Voice Dictionary
        mimetype = "application/vnd.yamaha.hv-dic";
        break;
      case ".hvp":
        // HV Voice Parameter
        mimetype = "application/vnd.yamaha.hv-voice";
        break;
      case ".sfd-hdstx":
        // Hydrostatix Master Suite
        mimetype = "application/vnd.hydrostatix.sof-data";
        break;
      case ".stk":
        // Hyperstudio
        mimetype = "application/hyperstudio";
        break;
      case ".hal":
        // Hypertext Application Language
        mimetype = "application/vnd.hal+xml";
        break;
      case ".html":
        // HyperText Markup Language (HTML)
        mimetype = "text/html";
        break;
      case ".irm":
        // IBM DB2 Rights Manager
        mimetype = "application/vnd.ibm.rights-management";
        break;
      case ".sc":
        // IBM Electronic Media Management System - Secure Container
        mimetype = "application/vnd.ibm.secure-container";
        break;
      case ".ics":
        // iCalendar
        mimetype = "text/calendar";
        break;
      case ".icc":
        // ICC profile
        mimetype = "application/vnd.iccprofile";
        break;
      case ".ico":
        // Icon Image
        mimetype = "image/x-icon";
        break;
      case ".igl":
        // igLoader
        mimetype = "application/vnd.igloader";
        break;
      case ".ief":
        // Image Exchange Format
        mimetype = "image/ief";
        break;
      case ".ivp":
        // ImmerVision PURE Players
        mimetype = "application/vnd.immervision-ivp";
        break;
      case ".ivu":
        // ImmerVision PURE Players
        mimetype = "application/vnd.immervision-ivu";
        break;
      case ".rif":
        // IMS Networks
        mimetype = "application/reginfo+xml";
        break;
      case ".spot":
        // In3D - 3DML
        mimetype = "text/vnd.in3d.spot";
        break;
      case ".igs":
        // Initial Graphics Exchange Specification (IGES)
        mimetype = "model/iges";
        break;
      case ".i2g":
        // Interactive Geometry Software
        mimetype = "application/vnd.intergeo";
        break;
      case ".cdy":
        // Interactive Geometry Software Cinderella
        mimetype = "application/vnd.cinderella";
        break;
      case ".xpw":
        // Intercon FormNet
        mimetype = "application/vnd.intercon.formnet";
        break;
      case ".fcs":
        // International Society for Advancement of Cytometry
        mimetype = "application/vnd.isac.fcs";
        break;
      case ".ipfix":
        // Internet Protocol Flow Information Export
        mimetype = "application/ipfix";
        break;
      case ".cer":
        // Internet Public Key Infrastructure - Certificate
        mimetype = "application/pkix-cert";
        break;
      case ".pki":
        // Internet Public Key Infrastructure - Certificate Management Protocole
        mimetype = "application/pkixcmp";
        break;
      case ".crl":
        // Internet Public Key Infrastructure - Certificate Revocation Lists
        mimetype = "application/pkix-crl";
        break;
      case ".pkipath":
        // Internet Public Key Infrastructure - Certification Path
        mimetype = "application/pkix-pkipath";
        break;
      case ".igm":
        // IOCOM Visimeet
        mimetype = "application/vnd.insors.igm";
        break;
      case ".rcprofile":
        // IP Unplugged Roaming Client
        mimetype = "application/vnd.ipunplugged.rcprofile";
        break;
      case ".irp":
        // iRepository / Lucidoc Editor
        mimetype = "application/vnd.irepository.package+xml";
        break;
      case ".jad":
        // J2ME App Descriptor
        mimetype = "text/vnd.sun.j2me.app-descriptor";
        break;
      case ".jar":
        // Java Archive
        mimetype = "application/java-archive";
        break;
      case ".class":
        // Java Bytecode File
        mimetype = "application/java-vm";
        break;
      case ".jnlp":
        // Java Network Launching Protocol
        mimetype = "application/x-java-jnlp-file";
        break;
      case ".ser":
        // Java Serialized Object
        mimetype = "application/java-serialized-object";
        break;
      case ".java":
        // Java Source File
        mimetype = "text/x-java-source,java";
        break;
      case ".js":
        // JavaScript
        mimetype = "application/javascript";
        break;
      case ".json":
        // JavaScript Object Notation (JSON)
        mimetype = "application/json";
        break;
      case ".joda":
        // Joda Archive
        mimetype = "application/vnd.joost.joda-archive";
        break;
      case ".ktz":
        // Kahootz
        mimetype = "application/vnd.kahootz";
        break;
      case ".mmd":
        // Karaoke on Chipnuts Chipsets
        mimetype = "application/vnd.chipnuts.karaoke-mmd";
        break;
      case ".karbon":
        // KDE KOffice Office Suite - Karbon
        mimetype = "application/vnd.kde.karbon";
        break;
      case ".chrt":
        // KDE KOffice Office Suite - KChart
        mimetype = "application/vnd.kde.kchart";
        break;
      case ".kfo":
        // KDE KOffice Office Suite - Kformula
        mimetype = "application/vnd.kde.kformula";
        break;
      case ".flw":
        // KDE KOffice Office Suite - Kivio
        mimetype = "application/vnd.kde.kivio";
        break;
      case ".kon":
        // KDE KOffice Office Suite - Kontour
        mimetype = "application/vnd.kde.kontour";
        break;
      case ".kpr":
        // KDE KOffice Office Suite - Kpresenter
        mimetype = "application/vnd.kde.kpresenter";
        break;
      case ".ksp":
        // KDE KOffice Office Suite - Kspread
        mimetype = "application/vnd.kde.kspread";
        break;
      case ".kwd":
        // KDE KOffice Office Suite - Kword
        mimetype = "application/vnd.kde.kword";
        break;
      case ".htke":
        // Kenamea App
        mimetype = "application/vnd.kenameaapp";
        break;
      case ".kia":
        // Kidspiration
        mimetype = "application/vnd.kidspiration";
        break;
      case ".kne":
        // Kinar Applications
        mimetype = "application/vnd.kinar";
        break;
      case ".sse":
        // Kodak Storyshare
        mimetype = "application/vnd.kodak-descriptor";
        break;
      case ".lasxml":
        // Laser App Enterprise
        mimetype = "application/vnd.las.las+xml";
        break;
      case ".latex":
        // LaTeX
        mimetype = "application/x-latex";
        break;
      case ".lbd":
        // Life Balance - Desktop Edition
        mimetype = "application/vnd.llamagraphics.life-balance.desktop";
        break;
      case ".lbe":
        // Life Balance - Exchange Format
        mimetype = "application/vnd.llamagraphics.life-balance.exchange+xml";
        break;
      case ".jam":
        // Lightspeed Audio Lab
        mimetype = "application/vnd.jam";
        break;
      case ".123":
        // Lotus 1-2-3
        mimetype = "application/vnd.lotus-1-2-3";
        break;
      case ".apr":
        // Lotus Approach
        mimetype = "application/vnd.lotus-approach";
        break;
      case ".pre":
        // Lotus Freelance
        mimetype = "application/vnd.lotus-freelance";
        break;
      case ".nsf":
        // Lotus Notes
        mimetype = "application/vnd.lotus-notes";
        break;
      case ".org":
        // Lotus Organizer
        mimetype = "application/vnd.lotus-organizer";
        break;
      case ".scm":
        // Lotus Screencam
        mimetype = "application/vnd.lotus-screencam";
        break;
      case ".lwp":
        // Lotus Wordpro
        mimetype = "application/vnd.lotus-wordpro";
        break;
      case ".lvp":
        // Lucent Voice
        mimetype = "audio/vnd.lucent.voice";
        break;
      case ".m3u":
        // M3U (Multimedia Playlist)
        mimetype = "audio/x-mpegurl";
        break;
      case ".m4v":
        // M4v
        mimetype = "video/x-m4v";
        break;
      case ".hqx":
        // Macintosh BinHex 4.0
        mimetype = "application/mac-binhex40";
        break;
      case ".portpkg":
        // MacPorts Port System
        mimetype = "application/vnd.macports.portpkg";
        break;
      case ".mgp":
        // MapGuide DBXML
        mimetype = "application/vnd.osgeo.mapguide.package";
        break;
      case ".mrc":
        // MARC Formats
        mimetype = "application/marc";
        break;
      case ".mrcx":
        // MARC21 XML Schema
        mimetype = "application/marcxml+xml";
        break;
      case ".mxf":
        // Material Exchange Format
        mimetype = "application/mxf";
        break;
      case ".nbp":
        // Mathematica Notebook Player
        mimetype = "application/vnd.wolfram.player";
        break;
      case ".ma":
        // Mathematica Notebooks
        mimetype = "application/mathematica";
        break;
      case ".mathml":
        // Mathematical Markup Language
        mimetype = "application/mathml+xml";
        break;
      case ".mbox":
        // Mbox database files
        mimetype = "application/mbox";
        break;
      case ".mc1":
        // MedCalc
        mimetype = "application/vnd.medcalcdata";
        break;
      case ".mscml":
        // Media Server Control Markup Language
        mimetype = "application/mediaservercontrol+xml";
        break;
      case ".cdkey":
        // MediaRemote
        mimetype = "application/vnd.mediastation.cdkey";
        break;
      case ".mwf":
        // Medical Waveform Encoding Format
        mimetype = "application/vnd.mfer";
        break;
      case ".mfm":
        // Melody Format for Mobile Platform
        mimetype = "application/vnd.mfmp";
        break;
      case ".msh":
        // Mesh Data Type
        mimetype = "model/mesh";
        break;
      case ".mads":
        // Metadata Authority Description Schema
        mimetype = "application/mads+xml";
        break;
      case ".mets":
        // Metadata Encoding and Transmission Standard
        mimetype = "application/mets+xml";
        break;
      case ".mods":
        // Metadata Object Description Schema
        mimetype = "application/mods+xml";
        break;
      case ".meta4":
        // Metalink
        mimetype = "application/metalink4+xml";
        break;
      case ".potm":
        // Micosoft PowerPoint - Macro-Enabled Template File
        mimetype = "application/vnd.ms-powerpoint.template.macroenabled.12";
        break;
      case ".docm":
        // Micosoft Word - Macro-Enabled Document
        mimetype = "application/vnd.ms-word.document.macroenabled.12";
        break;
      case ".dotm":
        // Micosoft Word - Macro-Enabled Template
        mimetype = "application/vnd.ms-word.template.macroenabled.12";
        break;
      case ".mcd":
        // Micro CADAM Helix D&D
        mimetype = "application/vnd.mcd";
        break;
      case ".flo":
        // Micrografx
        mimetype = "application/vnd.micrografx.flo";
        break;
      case ".igx":
        // Micrografx iGrafx Professional
        mimetype = "application/vnd.micrografx.igx";
        break;
      case ".es3":
        // MICROSEC e-Szign¢
        mimetype = "application/vnd.eszigno3+xml";
        break;
      case ".asf":
        // Microsoft Advanced Systems Format (ASF)
        mimetype = "video/x-ms-asf";
        break;
      case ".exe":
        // Microsoft Application
        mimetype = "application/x-msdownload";
        break;
      case ".cil":
        // Microsoft Artgalry
        mimetype = "application/vnd.ms-artgalry";
        break;
      case ".cab":
        // Microsoft Cabinet File
        mimetype = "application/vnd.ms-cab-compressed";
        break;
      case ".ims":
        // Microsoft Class Server
        mimetype = "application/vnd.ms-ims";
        break;
      case ".application":
        // Microsoft ClickOnce
        mimetype = "application/x-ms-application";
        break;
      case ".clp":
        // Microsoft Clipboard Clip
        mimetype = "application/x-msclip";
        break;
      case ".mdi":
        // Microsoft Document Imaging Format
        mimetype = "image/vnd.ms-modi";
        break;
      case ".eot":
        // Microsoft Embedded OpenType
        mimetype = "application/vnd.ms-fontobject";
        break;
      case ".chm":
        // Microsoft Html Help File
        mimetype = "application/vnd.ms-htmlhelp";
        break;
      case ".crd":
        // Microsoft Information Card
        mimetype = "application/x-mscardfile";
        break;
      case ".lrm":
        // Microsoft Learning Resource Module
        mimetype = "application/vnd.ms-lrm";
        break;
      case ".mvb":
        // Microsoft MediaView
        mimetype = "application/x-msmediaview";
        break;
      case ".mny":
        // Microsoft Money
        mimetype = "application/x-msmoney";
        break;
      case ".obd":
        // Microsoft Office Binder
        mimetype = "application/x-msbinder";
        break;
      case ".thmx":
        // Microsoft Office System Release Theme
        mimetype = "application/vnd.ms-officetheme";
        break;
      case ".onetoc":
        // Microsoft OneNote
        mimetype = "application/onenote";
        break;
      case ".pya":
        // Microsoft PlayReady Ecosystem
        mimetype = "audio/vnd.ms-playready.media.pya";
        break;
      case ".pyv":
        // Microsoft PlayReady Ecosystem Video
        mimetype = "video/vnd.ms-playready.media.pyv";
        break;
      case ".pub":
        // Microsoft Publisher
        mimetype = "application/x-mspublisher";
        break;
      case ".scd":
        // Microsoft Schedule+
        mimetype = "application/x-msschedule";
        break;
      case ".xap":
        // Microsoft Silverlight
        mimetype = "application/x-silverlight-app";
        break;
      case ".stl":
        // Microsoft Trust UI Provider - Certificate Trust Link
        mimetype = "application/vnd.ms-pki.stl";
        break;
      case ".cat":
        // Microsoft Trust UI Provider - Security Catalog
        mimetype = "application/vnd.ms-pki.seccat";
        break;
      case ".vsd":
        // Microsoft Visio
        mimetype = "application/vnd.visio";
        break;
      case ".wm":
        // Microsoft Windows Media
        mimetype = "video/x-ms-wm";
        break;
      case ".wma":
        // Microsoft Windows Media Audio
        mimetype = "audio/x-ms-wma";
        break;
      case ".wax":
        // Microsoft Windows Media Audio Redirector
        mimetype = "audio/x-ms-wax";
        break;
      case ".wmx":
        // Microsoft Windows Media Audio/Video Playlist
        mimetype = "video/x-ms-wmx";
        break;
      case ".wmd":
        // Microsoft Windows Media Player Download Package
        mimetype = "application/x-ms-wmd";
        break;
      case ".wpl":
        // Microsoft Windows Media Player Playlist
        mimetype = "application/vnd.ms-wpl";
        break;
      case ".wmz":
        // Microsoft Windows Media Player Skin Package
        mimetype = "application/x-ms-wmz";
        break;
      case ".wmv":
        // Microsoft Windows Media Video
        mimetype = "video/x-ms-wmv";
        break;
      case ".wvx":
        // Microsoft Windows Media Video Playlist
        mimetype = "video/x-ms-wvx";
        break;
      case ".wmf":
        // Microsoft Windows Metafile
        mimetype = "application/x-msmetafile";
        break;
      case ".trm":
        // Microsoft Windows Terminal Services
        mimetype = "application/x-msterminal";
        break;
      case ".xbap":
        // Microsoft XAML Browser Application
        mimetype = "application/x-ms-xbap";
        break;
      case ".xps":
        // Microsoft XML Paper Specification
        mimetype = "application/vnd.ms-xpsdocument";
        break;
      case ".mid":
        // MIDI - Musical Instrument Digital Interface
        mimetype = "audio/midi";
        break;
      case ".mpy":
        // MiniPay
        mimetype = "application/vnd.ibm.minipay";
        break;
      case ".afp":
        // MO:DCA-P
        mimetype = "application/vnd.ibm.modcap";
        break;
      case ".rms":
        // Mobile Information Device Profile
        mimetype = "application/vnd.jcp.javame.midlet-rms";
        break;
      case ".tmo":
        // MobileTV
        mimetype = "application/vnd.tmobile-livetv";
        break;
      case ".prc":
        // Mobipocket
        mimetype = "application/x-mobipocket-ebook";
        break;
      case ".mbk":
        // Mobius Management Systems - Basket file
        mimetype = "application/vnd.mobius.mbk";
        break;
      case ".dis":
        // Mobius Management Systems - Distribution Database
        mimetype = "application/vnd.mobius.dis";
        break;
      case ".plc":
        // Mobius Management Systems - Policy Definition Language File
        mimetype = "application/vnd.mobius.plc";
        break;
      case ".mqy":
        // Mobius Management Systems - Query File
        mimetype = "application/vnd.mobius.mqy";
        break;
      case ".msl":
        // Mobius Management Systems - Script Language
        mimetype = "application/vnd.mobius.msl";
        break;
      case ".txf":
        // Mobius Management Systems - Topic Index File
        mimetype = "application/vnd.mobius.txf";
        break;
      case ".daf":
        // Mobius Management Systems - UniversalArchive
        mimetype = "application/vnd.mobius.daf";
        break;
      case ".fly":
        // mod_fly / fly.cgi
        mimetype = "text/vnd.fly";
        break;
      case ".mpc":
        // Mophun Certificate
        mimetype = "application/vnd.mophun.certificate";
        break;
      case ".mpn":
        // Mophun VM
        mimetype = "application/vnd.mophun.application";
        break;
      case ".mj2":
        // Motion JPEG 2000
        mimetype = "video/mj2";
        break;
      case ".mpga":
        // MPEG Audio
        mimetype = "audio/mpeg";
        break;
      case ".mxu":
        // MPEG Url
        mimetype = "video/vnd.mpegurl";
        break;
      case ".mpeg":
        // MPEG Video
        mimetype = "video/mpeg";
        break;
      case ".m21":
        // MPEG-21
        mimetype = "application/mp21";
        break;
      case ".mp4a":
        // MPEG-4 Audio
        mimetype = "audio/mp4";
        break;
      case ".mp4":
        // MPEG-4 Video
        mimetype = "video/mp4" || "application/mp4";
        break;
      // case '.mp4':
      //   // MPEG4
      //   mimetype = 'application/mp4';
      //   break;
      case ".m3u8":
        // Multimedia Playlist Unicode
        mimetype = "application/vnd.apple.mpegurl";
        break;
      case ".mus":
        // MUsical Score Interpreted Code Invented for the ASCII designation of Notation
        mimetype = "application/vnd.musician";
        break;
      case ".msty":
        // Muvee Automatic Video Editing
        mimetype = "application/vnd.muvee.style";
        break;
      case ".mxml":
        // MXML
        mimetype = "application/xv+xml";
        break;
      case ".ngdat":
        // N-Gage Game Data
        mimetype = "application/vnd.nokia.n-gage.data";
        break;
      case ".n-gage":
        // N-Gage Game Installer
        mimetype = "application/vnd.nokia.n-gage.symbian.install";
        break;
      case ".ncx":
        // Navigation Control file for XML (for ePub)
        mimetype = "application/x-dtbncx+xml";
        break;
      case ".nc":
        // Network Common Data Form (NetCDF)
        mimetype = "application/x-netcdf";
        break;
      case ".nlu":
        // neuroLanguage
        mimetype = "application/vnd.neurolanguage.nlu";
        break;
      case ".dna":
        // New Moon Liftoff/DNA
        mimetype = "application/vnd.dna";
        break;
      case ".nnd":
        // NobleNet Directory
        mimetype = "application/vnd.noblenet-directory";
        break;
      case ".nns":
        // NobleNet Sealer
        mimetype = "application/vnd.noblenet-sealer";
        break;
      case ".nnw":
        // NobleNet Web
        mimetype = "application/vnd.noblenet-web";
        break;
      case ".rpst":
        // Nokia Radio Application - Preset
        mimetype = "application/vnd.nokia.radio-preset";
        break;
      case ".rpss":
        // Nokia Radio Application - Preset
        mimetype = "application/vnd.nokia.radio-presets";
        break;
      case ".n3":
        // Notation3
        mimetype = "text/n3";
        break;
      case ".edm":
        // Novadigm's RADIA and EDM products
        mimetype = "application/vnd.novadigm.edm";
        break;
      case ".edx":
        // Novadigm's RADIA and EDM products
        mimetype = "application/vnd.novadigm.edx";
        break;
      case ".ext":
        // Novadigm's RADIA and EDM products
        mimetype = "application/vnd.novadigm.ext";
        break;
      case ".gph":
        // NpGraphIt
        mimetype = "application/vnd.flographit";
        break;
      case ".ecelp4800":
        // Nuera ECELP 4800
        mimetype = "audio/vnd.nuera.ecelp4800";
        break;
      case ".ecelp7470":
        // Nuera ECELP 7470
        mimetype = "audio/vnd.nuera.ecelp7470";
        break;
      case ".ecelp9600":
        // Nuera ECELP 9600
        mimetype = "audio/vnd.nuera.ecelp9600";
        break;
      case ".oda":
        // Office Document Architecture
        mimetype = "application/oda";
        break;
      case ".ogx":
        // Ogg
        mimetype = "application/ogg";
        break;
      case ".oga":
        // Ogg Audio
        mimetype = "audio/ogg";
        break;
      case ".ogv":
        // Ogg Video
        mimetype = "video/ogg";
        break;
      case ".dd2":
        // OMA Download Agents
        mimetype = "application/vnd.oma.dd2+xml";
        break;
      case ".oth":
        // Open Document Text Web
        mimetype = "application/vnd.oasis.opendocument.text-web";
        break;
      case ".opf":
        // Open eBook Publication Structure
        mimetype = "application/oebps-package+xml";
        break;
      case ".qbo":
        // Open Financial Exchange
        mimetype = "application/vnd.intu.qbo";
        break;
      case ".oxt":
        // Open Office Extension
        mimetype = "application/vnd.openofficeorg.extension";
        break;
      case ".osf":
        // Open Score Format
        mimetype = "application/vnd.yamaha.openscoreformat";
        break;
      case ".weba":
        // Open Web Media Project - Audio
        mimetype = "audio/webm";
        break;
      case ".webm":
        // Open Web Media Project - Video
        mimetype = "video/webm";
        break;
      case ".odc":
        // OpenDocument Chart
        mimetype = "application/vnd.oasis.opendocument.chart";
        break;
      case ".otc":
        // OpenDocument Chart Template
        mimetype = "application/vnd.oasis.opendocument.chart-template";
        break;
      case ".odb":
        // OpenDocument Database
        mimetype = "application/vnd.oasis.opendocument.database";
        break;
      case ".odf":
        // OpenDocument Formula
        mimetype = "application/vnd.oasis.opendocument.formula";
        break;
      case ".odft":
        // OpenDocument Formula Template
        mimetype = "application/vnd.oasis.opendocument.formula-template";
        break;
      case ".odg":
        // OpenDocument Graphics
        mimetype = "application/vnd.oasis.opendocument.graphics";
        break;
      case ".otg":
        // OpenDocument Graphics Template
        mimetype = "application/vnd.oasis.opendocument.graphics-template";
        break;
      case ".odi":
        // OpenDocument Image
        mimetype = "application/vnd.oasis.opendocument.image";
        break;
      case ".oti":
        // OpenDocument Image Template
        mimetype = "application/vnd.oasis.opendocument.image-template";
        break;
      case ".odp":
        // OpenDocument Presentation
        mimetype = "application/vnd.oasis.opendocument.presentation";
        break;
      case ".otp":
        // OpenDocument Presentation Template
        mimetype = "application/vnd.oasis.opendocument.presentation-template";
        break;
      case ".ods":
        // OpenDocument Spreadsheet
        mimetype = "application/vnd.oasis.opendocument.spreadsheet";
        break;
      case ".ots":
        // OpenDocument Spreadsheet Template
        mimetype = "application/vnd.oasis.opendocument.spreadsheet-template";
        break;
      case ".odt":
        // OpenDocument Text
        mimetype = "application/vnd.oasis.opendocument.text";
        break;
      case ".odm":
        // OpenDocument Text Master
        mimetype = "application/vnd.oasis.opendocument.text-master";
        break;
      case ".ott":
        // OpenDocument Text Template
        mimetype = "application/vnd.oasis.opendocument.text-template";
        break;
      case ".ktx":
        // OpenGL Textures (KTX)
        mimetype = "image/ktx";
        break;
      case ".sxc":
        // OpenOffice - Calc (Spreadsheet)
        mimetype = "application/vnd.sun.xml.calc";
        break;
      case ".stc":
        // OpenOffice - Calc Template (Spreadsheet)
        mimetype = "application/vnd.sun.xml.calc.template";
        break;
      case ".sxd":
        // OpenOffice - Draw (Graphics)
        mimetype = "application/vnd.sun.xml.draw";
        break;
      case ".std":
        // OpenOffice - Draw Template (Graphics)
        mimetype = "application/vnd.sun.xml.draw.template";
        break;
      case ".sxi":
        // OpenOffice - Impress (Presentation)
        mimetype = "application/vnd.sun.xml.impress";
        break;
      case ".sti":
        // OpenOffice - Impress Template (Presentation)
        mimetype = "application/vnd.sun.xml.impress.template";
        break;
      case ".sxm":
        // OpenOffice - Math (Formula)
        mimetype = "application/vnd.sun.xml.math";
        break;
      case ".sxw":
        // OpenOffice - Writer (Text - HTML)
        mimetype = "application/vnd.sun.xml.writer";
        break;
      case ".sxg":
        // OpenOffice - Writer (Text - HTML)
        mimetype = "application/vnd.sun.xml.writer.global";
        break;
      case ".stw":
        // OpenOffice - Writer Template (Text - HTML)
        mimetype = "application/vnd.sun.xml.writer.template";
        break;
      case ".otf":
        // OpenType Font File
        mimetype = "application/x-font-otf";
        break;
      case ".osfpvg":
        // OSFPVG
        mimetype = "application/vnd.yamaha.openscoreformat.osfpvg+xml";
        break;
      case ".dp":
        // OSGi Deployment Package
        mimetype = "application/vnd.osgi.dp";
        break;
      case ".pdb":
        // PalmOS Data
        mimetype = "application/vnd.palm";
        break;
      case ".p":
        // Pascal Source File
        mimetype = "text/x-pascal";
        break;
      case ".paw":
        // PawaaFILE
        mimetype = "application/vnd.pawaafile";
        break;
      case ".pclxl":
        // PCL 6 Enhanced (Formely PCL XL)
        mimetype = "application/vnd.hp-pclxl";
        break;
      case ".efif":
        // Pcsel eFIF File
        mimetype = "application/vnd.picsel";
        break;
      case ".pcx":
        // PCX Image
        mimetype = "image/x-pcx";
        break;
      case ".psd":
        // Photoshop Document
        mimetype = "image/vnd.adobe.photoshop";
        break;
      case ".prf":
        // PICSRules
        mimetype = "application/pics-rules";
        break;
      case ".pic":
        // PICT Image
        mimetype = "image/x-pict";
        break;
      case ".chat":
        // pIRCh
        mimetype = "application/x-chat";
        break;
      case ".p10":
        // PKCS #10 - Certification Request Standard
        mimetype = "application/pkcs10";
        break;
      case ".p12":
        // PKCS #12 - Personal Information Exchange Syntax Standard
        mimetype = "application/x-pkcs12";
        break;
      case ".p7m":
        // PKCS #7 - Cryptographic Message Syntax Standard
        mimetype = "application/pkcs7-mime";
        break;
      case ".p7s":
        // PKCS #7 - Cryptographic Message Syntax Standard
        mimetype = "application/pkcs7-signature";
        break;
      case ".p7r":
        // PKCS #7 - Cryptographic Message Syntax Standard (Certificate Request Response)
        mimetype = "application/x-pkcs7-certreqresp";
        break;
      case ".p7b":
        // PKCS #7 - Cryptographic Message Syntax Standard (Certificates)
        mimetype = "application/x-pkcs7-certificates";
        break;
      case ".p8":
        // PKCS #8 - Private-Key Information Syntax Standard
        mimetype = "application/pkcs8";
        break;
      case ".plf":
        // PocketLearn Viewers
        mimetype = "application/vnd.pocketlearn";
        break;
      case ".pnm":
        // Portable Anymap Image
        mimetype = "image/x-portable-anymap";
        break;
      case ".pbm":
        // Portable Bitmap Format
        mimetype = "image/x-portable-bitmap";
        break;
      case ".pcf":
        // Portable Compiled Format
        mimetype = "application/x-font-pcf";
        break;
      case ".pfr":
        // Portable Font Resource
        mimetype = "application/font-tdpfr";
        break;
      case ".pgn":
        // Portable Game Notation (Chess Games)
        mimetype = "application/x-chess-pgn";
        break;
      case ".pgm":
        // Portable Graymap Format
        mimetype = "image/x-portable-graymap";
        break;
      case ".pskcxml":
        // Portable Symmetric Key Container
        mimetype = "application/pskc+xml";
        break;
      case ".pml":
        // PosML
        mimetype = "application/vnd.ctc-posml";
        break;
      case ".ai":
        // PostScript
        mimetype = "application/postscript";
        break;
      case ".pfa":
        // PostScript Fonts
        mimetype = "application/x-font-type1";
        break;
      case ".pbd":
        // PowerBuilder
        mimetype = "application/vnd.powerbuilder6";
        break;
      case "":
        // Pretty Good Privacy
        mimetype = "application/pgp-encrypted";
        break;
      case ".pgp":
        // Pretty Good Privacy - Signature
        mimetype = "application/pgp-signature";
        break;
      case ".box":
        // Preview Systems ZipLock/VBox
        mimetype = "application/vnd.previewsystems.box";
        break;
      case ".ptid":
        // Princeton Video Image
        mimetype = "application/vnd.pvi.ptid1";
        break;
      case ".pls":
        // Pronunciation Lexicon Specification
        mimetype = "application/pls+xml";
        break;
      case ".str":
        // Proprietary P&G Standard Reporting System
        mimetype = "application/vnd.pg.format";
        break;
      case ".ei6":
        // Proprietary P&G Standard Reporting System
        mimetype = "application/vnd.pg.osasli";
        break;
      case ".dsc":
        // PRS Lines Tag
        mimetype = "text/prs.lines.tag";
        break;
      case ".psf":
        // PSF Fonts
        mimetype = "application/x-font-linux-psf";
        break;
      case ".qps":
        // PubliShare Objects
        mimetype = "application/vnd.publishare-delta-tree";
        break;
      case ".wg":
        // Qualcomm's Plaza Mobile Internet
        mimetype = "application/vnd.pmi.widget";
        break;
      case ".qxd":
        // QuarkXpress
        mimetype = "application/vnd.quark.quarkxpress";
        break;
      case ".esf":
        // QUASS Stream Player
        mimetype = "application/vnd.epson.esf";
        break;
      case ".msf":
        // QUASS Stream Player
        mimetype = "application/vnd.epson.msf";
        break;
      case ".ssf":
        // QUASS Stream Player
        mimetype = "application/vnd.epson.ssf";
        break;
      case ".qam":
        // QuickAnime Player
        mimetype = "application/vnd.epson.quickanime";
        break;
      case ".qfx":
        // Quicken
        mimetype = "application/vnd.intu.qfx";
        break;
      case ".qt":
        // Quicktime Video
        mimetype = "video/quicktime";
        break;
      case ".rar":
        // RAR Archive
        mimetype = "application/x-rar-compressed";
        break;
      case ".ram":
        // Real Audio Sound
        mimetype = "audio/x-pn-realaudio";
        break;
      case ".rmp":
        // Real Audio Sound
        mimetype = "audio/x-pn-realaudio-plugin";
        break;
      case ".rsd":
        // Really Simple Discovery
        mimetype = "application/rsd+xml";
        break;
      case ".rm":
        // RealMedia
        mimetype = "application/vnd.rn-realmedia";
        break;
      case ".mxl":
        // Recordare Applications
        mimetype = "application/vnd.recordare.musicxml";
        break;
      case ".musicxml":
        // Recordare Applications
        mimetype = "application/vnd.recordare.musicxml+xml";
        break;
      case ".rnc":
        // Relax NG Compact Syntax
        mimetype = "application/relax-ng-compact-syntax";
        break;
      case ".rdz":
        // RemoteDocs R-Viewer
        mimetype = "application/vnd.data-vision.rdz";
        break;
      case ".rdf":
        // Resource Description Framework
        mimetype = "application/rdf+xml";
        break;
      case ".rp9":
        // RetroPlatform Player
        mimetype = "application/vnd.cloanto.rp9";
        break;
      case ".jisp":
        // RhymBox
        mimetype = "application/vnd.jisp";
        break;
      case ".rtf":
        // Rich Text Format
        mimetype = "application/rtf";
        break;
      case ".rtx":
        // Rich Text Format (RTF)
        mimetype = "text/richtext";
        break;
      case ".link66":
        // ROUTE 66 Location Based Services
        mimetype = "application/vnd.route66.link66+xml";
        break;
      case ".rss, .xml":
        // RSS - Really Simple Syndication
        mimetype = "application/rss+xml";
        break;
      case ".shf":
        // S Hexdump Format
        mimetype = "application/shf+xml";
        break;
      case ".st":
        // SailingTracker
        mimetype = "application/vnd.sailingtracker.track";
        break;
      case ".sus":
        // ScheduleUs
        mimetype = "application/vnd.sus-calendar";
        break;
      case ".sru":
        // Search/Retrieve via URL Response Format
        mimetype = "application/sru+xml";
        break;
      case ".setpay":
        // Secure Electronic Transaction - Payment
        mimetype = "application/set-payment-initiation";
        break;
      case ".setreg":
        // Secure Electronic Transaction - Registration
        mimetype = "application/set-registration-initiation";
        break;
      case ".sema":
        // Secured eMail
        mimetype = "application/vnd.sema";
        break;
      case ".semd":
        // Secured eMail
        mimetype = "application/vnd.semd";
        break;
      case ".semf":
        // Secured eMail
        mimetype = "application/vnd.semf";
        break;
      case ".see":
        // SeeMail
        mimetype = "application/vnd.seemail";
        break;
      case ".snf":
        // Server Normal Format
        mimetype = "application/x-font-snf";
        break;
      case ".spq":
        // Server-Based Certificate Validation Protocol - Validation Policies - Request
        mimetype = "application/scvp-vp-request";
        break;
      case ".spp":
        // Server-Based Certificate Validation Protocol - Validation Policies - Response
        mimetype = "application/scvp-vp-response";
        break;
      case ".scq":
        // Server-Based Certificate Validation Protocol - Validation Request
        mimetype = "application/scvp-cv-request";
        break;
      case ".scs":
        // Server-Based Certificate Validation Protocol - Validation Response
        mimetype = "application/scvp-cv-response";
        break;
      case ".sdp":
        // Session Description Protocol
        mimetype = "application/sdp";
        break;
      case ".etx":
        // Setext
        mimetype = "text/x-setext";
        break;
      case ".movie":
        // SGI Movie
        mimetype = "video/x-sgi-movie";
        break;
      case ".ifm":
        // Shana Informed Filler
        mimetype = "application/vnd.shana.informed.formdata";
        break;
      case ".itp":
        // Shana Informed Filler
        mimetype = "application/vnd.shana.informed.formtemplate";
        break;
      case ".iif":
        // Shana Informed Filler
        mimetype = "application/vnd.shana.informed.interchange";
        break;
      case ".ipk":
        // Shana Informed Filler
        mimetype = "application/vnd.shana.informed.package";
        break;
      case ".tfi":
        // Sharing Transaction Fraud Data
        mimetype = "application/thraud+xml";
        break;
      case ".shar":
        // Shell Archive
        mimetype = "application/x-shar";
        break;
      case ".rgb":
        // Silicon Graphics RGB Bitmap
        mimetype = "image/x-rgb";
        break;
      case ".slt":
        // SimpleAnimeLite Player
        mimetype = "application/vnd.epson.salt";
        break;
      case ".aso":
        // Simply Accounting
        mimetype = "application/vnd.accpac.simply.aso";
        break;
      case ".imp":
        // Simply Accounting - Data Import
        mimetype = "application/vnd.accpac.simply.imp";
        break;
      case ".twd":
        // SimTech MindMapper
        mimetype = "application/vnd.simtech-mindmapper";
        break;
      case ".csp":
        // Sixth Floor Media - CommonSpace
        mimetype = "application/vnd.commonspace";
        break;
      case ".saf":
        // SMAF Audio
        mimetype = "application/vnd.yamaha.smaf-audio";
        break;
      case ".mmf":
        // SMAF File
        mimetype = "application/vnd.smaf";
        break;
      case ".spf":
        // SMAF Phrase
        mimetype = "application/vnd.yamaha.smaf-phrase";
        break;
      case ".teacher":
        // SMART Technologies Apps
        mimetype = "application/vnd.smart.teacher";
        break;
      case ".svd":
        // SourceView Document
        mimetype = "application/vnd.svd";
        break;
      case ".rq":
        // SPARQL - Query
        mimetype = "application/sparql-query";
        break;
      case ".srx":
        // SPARQL - Results
        mimetype = "application/sparql-results+xml";
        break;
      case ".gram":
        // Speech Recognition Grammar Specification
        mimetype = "application/srgs";
        break;
      case ".grxml":
        // Speech Recognition Grammar Specification - XML
        mimetype = "application/srgs+xml";
        break;
      case ".ssml":
        // Speech Synthesis Markup Language
        mimetype = "application/ssml+xml";
        break;
      case ".skp":
        // SSEYO Koan Play File
        mimetype = "application/vnd.koan";
        break;
      case ".sgml":
        // Standard Generalized Markup Language (SGML)
        mimetype = "text/sgml";
        break;
      case ".sdc":
        // StarOffice - Calc
        mimetype = "application/vnd.stardivision.calc";
        break;
      case ".sdd":
        // StarOffice - Impress
        mimetype = "application/vnd.stardivision.impress";
        break;
      case ".sdw":
        // StarOffice - Writer
        mimetype = "application/vnd.stardivision.writer";
        break;
      case ".sm":
        // StepMania
        mimetype = "application/vnd.stepmania.stepchart";
        break;
      case ".sit":
        // Stuffit Archive
        mimetype = "application/x-stuffit";
        break;
      case ".sitx":
        // Stuffit Archive
        mimetype = "application/x-stuffitx";
        break;
      case ".sdkm":
        // SudokuMagic
        mimetype = "application/vnd.solent.sdkm+xml";
        break;
      case ".xo":
        // Sugar Linux Application Bundle
        mimetype = "application/vnd.olpc-sugar";
        break;
      case ".au":
        // Sun Audio - Au file format
        mimetype = "audio/basic";
        break;
      case ".wqd":
        // SundaHus WQ
        mimetype = "application/vnd.wqd";
        break;
      case ".sis":
        // Symbian Install Package
        mimetype = "application/vnd.symbian.install";
        break;
      case ".smi":
        // Synchronized Multimedia Integration Language
        mimetype = "application/smil+xml";
        break;
      case ".xsm":
        // SyncML
        mimetype = "application/vnd.syncml+xml";
        break;
      case ".bdm":
        // SyncML - Device Management
        mimetype = "application/vnd.syncml.dm+wbxml";
        break;
      case ".xdm":
        // SyncML - Device Management
        mimetype = "application/vnd.syncml.dm+xml";
        break;
      case ".sv4cpio":
        // System V Release 4 CPIO Archive
        mimetype = "application/x-sv4cpio";
        break;
      case ".sv4crc":
        // System V Release 4 CPIO Checksum Data
        mimetype = "application/x-sv4crc";
        break;
      case ".sbml":
        // Systems Biology Markup Language
        mimetype = "application/sbml+xml";
        break;
      case ".tsv":
        // Tab Seperated Values
        mimetype = "text/tab-separated-values";
        break;
      case ".tao":
        // Tao Intent
        mimetype = "application/vnd.tao.intent-module-archive";
        break;
      case ".tar":
        // Tar File (Tape Archive)
        mimetype = "application/x-tar";
        break;
      case ".tcl":
        // Tcl Script
        mimetype = "application/x-tcl";
        break;
      case ".tex":
        // TeX
        mimetype = "application/x-tex";
        break;
      case ".tfm":
        // TeX Font Metric
        mimetype = "application/x-tex-tfm";
        break;
      case ".tei":
        // Text Encoding and Interchange
        mimetype = "application/tei+xml";
        break;
      case ".dxp":
        // TIBCO Spotfire
        mimetype = "application/vnd.spotfire.dxp";
        break;
      case ".sfs":
        // TIBCO Spotfire
        mimetype = "application/vnd.spotfire.sfs";
        break;
      case ".tsd":
        // Time Stamped Data Envelope
        mimetype = "application/timestamped-data";
        break;
      case ".tpt":
        // TRI Systems Config
        mimetype = "application/vnd.trid.tpt";
        break;
      case ".mxs":
        // Triscape Map Explorer
        mimetype = "application/vnd.triscape.mxs";
        break;
      case ".t":
        // troff
        mimetype = "text/troff";
        break;
      case ".tra":
        // True BASIC
        mimetype = "application/vnd.trueapp";
        break;
      case ".ttf":
        // TrueType Font
        mimetype = "application/x-font-ttf";
        break;
      case ".ttl":
        // Turtle (Terse RDF Triple Language)
        mimetype = "text/turtle";
        break;
      case ".umj":
        // UMAJIN
        mimetype = "application/vnd.umajin";
        break;
      case ".uoml":
        // Unique Object Markup Language
        mimetype = "application/vnd.uoml+xml";
        break;
      case ".unityweb":
        // Unity 3d
        mimetype = "application/vnd.unity";
        break;
      case ".ufd":
        // Universal Forms Description Language
        mimetype = "application/vnd.ufdl";
        break;
      case ".uri":
        // URI Resolution Services
        mimetype = "text/uri-list";
        break;
      case ".utz":
        // User Interface Quartz - Theme (Symbian)
        mimetype = "application/vnd.uiq.theme";
        break;
      case ".ustar":
        // Ustar (Uniform Standard Tape Archive)
        mimetype = "application/x-ustar";
        break;
      case ".uu":
        // UUEncode
        mimetype = "text/x-uuencode";
        break;
      case ".vcs":
        // vCalendar
        mimetype = "text/x-vcalendar";
        break;
      case ".vcf":
        // vCard
        mimetype = "text/x-vcard";
        break;
      case ".vcd":
        // Video CD
        mimetype = "application/x-cdlink";
        break;
      case ".vsf":
        // Viewport+
        mimetype = "application/vnd.vsf";
        break;
      case ".wrl":
        // Virtual Reality Modeling Language
        mimetype = "model/vrml";
        break;
      case ".vcx":
        // VirtualCatalog
        mimetype = "application/vnd.vcx";
        break;
      case ".mts":
        // Virtue MTS
        mimetype = "model/vnd.mts";
        break;
      case ".vtu":
        // Virtue VTU
        mimetype = "model/vnd.vtu";
        break;
      case ".vis":
        // Visionary
        mimetype = "application/vnd.visionary";
        break;
      case ".viv":
        // Vivo
        mimetype = "video/vnd.vivo";
        break;
      case ".ccxml":
        // Voice Browser Call Control
        mimetype = "application/ccxml+xml,";
        break;
      case ".vxml":
        // VoiceXML
        mimetype = "application/voicexml+xml";
        break;
      case ".src":
        // WAIS Source
        mimetype = "application/x-wais-source";
        break;
      case ".wbxml":
        // WAP Binary XML (WBXML)
        mimetype = "application/vnd.wap.wbxml";
        break;
      case ".wbmp":
        // WAP Bitamp (WBMP)
        mimetype = "image/vnd.wap.wbmp";
        break;
      case ".wav":
        // Waveform Audio File Format (WAV)
        mimetype = "audio/x-wav";
        break;
      case ".davmount":
        // Web Distributed Authoring and Versioning
        mimetype = "application/davmount+xml";
        break;
      case ".woff":
        // Web Open Font Format
        mimetype = "application/x-font-woff";
        break;
      case ".wspolicy":
        // Web Services Policy
        mimetype = "application/wspolicy+xml";
        break;
      case ".webp":
        // WebP Image
        mimetype = "image/webp";
        break;
      case ".wtb":
        // WebTurbo
        mimetype = "application/vnd.webturbo";
        break;
      case ".wgt":
        // Widget Packaging and XML Configuration
        mimetype = "application/widget";
        break;
      case ".hlp":
        // WinHelp
        mimetype = "application/winhlp";
        break;
      case ".wml":
        // Wireless Markup Language (WML)
        mimetype = "text/vnd.wap.wml";
        break;
      case ".wmls":
        // Wireless Markup Language Script (WMLScript)
        mimetype = "text/vnd.wap.wmlscript";
        break;
      case ".wmlsc":
        // WMLScript
        mimetype = "application/vnd.wap.wmlscriptc";
        break;
      case ".wpd":
        // Wordperfect
        mimetype = "application/vnd.wordperfect";
        break;
      case ".stf":
        // Worldtalk
        mimetype = "application/vnd.wt.stf";
        break;
      case ".wsdl":
        // WSDL - Web Services Description Language
        mimetype = "application/wsdl+xml";
        break;
      case ".der":
        // X.509 Certificate
        mimetype = "application/x-x509-ca-cert";
        break;
      case ".fig":
        // Xfig
        mimetype = "application/x-xfig";
        break;
      case ".xhtml":
        // XHTML - The Extensible HyperText Markup Language
        mimetype = "application/xhtml+xml";
        break;
      case ".xml":
        // XML - Extensible Markup Language
        mimetype = "application/xml";
        break;
      case ".xdf":
        // XML Configuration Access Protocol - XCAP Diff
        mimetype = "application/xcap-diff+xml";
        break;
      case ".xenc":
        // XML Encryption Syntax and Processing
        mimetype = "application/xenc+xml";
        break;
      case ".xer":
        // XML Patch Framework
        mimetype = "application/patch-ops-error+xml";
        break;
      case ".rl":
        // XML Resource Lists
        mimetype = "application/resource-lists+xml";
        break;
      case ".rs":
        // XML Resource Lists
        mimetype = "application/rls-services+xml";
        break;
      case ".rld":
        // XML Resource Lists Diff
        mimetype = "application/resource-lists-diff+xml";
        break;
      case ".xslt":
        // XML Transformations
        mimetype = "application/xslt+xml";
        break;
      case ".xop":
        // XML-Binary Optimized Packaging
        mimetype = "application/xop+xml";
        break;
      case ".xpi":
        // XPInstall - Mozilla
        mimetype = "application/x-xpinstall";
        break;
      case ".xspf":
        // XSPF - XML Shareable Playlist Format
        mimetype = "application/xspf+xml";
        break;
      case ".xul":
        // XUL - XML User Interface Language
        mimetype = "application/vnd.mozilla.xul+xml";
        break;
      case ".xyz":
        // XYZ File Format
        mimetype = "chemical/x-xyz";
        break;
      case ".yaml":
        // YAML Ain't Markup Language / Yet Another Markup Language
        mimetype = "text/yaml";
        break;
      case ".yang":
        // YANG Data Modeling Language
        mimetype = "application/yang";
        break;
      case ".yin":
        // YIN (YANG - XML)
        mimetype = "application/yin+xml";
        break;
      case ".zir":
        // Z.U.L. Geometry
        mimetype = "application/vnd.zul";
        break;
      case ".zip":
        // Zip Archive
        mimetype = "application/zip";
        break;
      case ".zmm":
        // ZVUE Media Manager
        mimetype = "application/vnd.handheld-entertainment+xml";
        break;
      case ".zaz":
        // Zzazz Deck
        mimetype = "application/vnd.zzazz.deck+xml";
        break;
      case ".heic":
        mimetype = "image/heic";
        break;
      default:
        // Binary Data
        mimetype = "application/octet-stream";
        break;
    }

    return mimetype;
  }
}
