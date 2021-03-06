import { Activity } from "./activity";
import { Ahj } from "./ahj";
import { Comment } from "./comment";
import { DesignElectricalInformation } from "./designelectricalinformation";
import { DesignerDetails } from "./designerdetails";
import { DesignGeneralInformation } from "./designgeneralinformation";
import { DesignStructuralInformation } from "./designstructuralinformation";
import { Incentives } from "./incentives";
import { InverterMake } from "./invertermake";
import { InverterModel } from "./invertermodel";
import { JobsTiming } from "./jobtiming";
import { ModuleMake } from "./modulemake";
import { ModuleModel } from "./modulemodel";
import { PrelimUtility } from "./prelimutility";
import { UploadedFile } from "./uploadedfile";
import { User } from "./user";
import { UtilityRate } from "./utilityrate";

export class Design {
  id: number;
  chatid: string;
  name: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  rooftype: string;
  monthlybill: number;
  phonenumber: number;
  jobtype: string;
  mountingtype: string;
  tiltofgroundmountingsystem: number;
  comments: Comment[];
  source: string;
  projecttype: string;
  requesttype: string;
  newconstruction: boolean;
  city: string;
  state: string;
  country: string;
  postalcode: string;
  solarmake: ModuleMake;
  solarmodel: ModuleModel;
  invertermake: InverterMake;
  invertermodel: InverterModel;
  utilityrate: UtilityRate;
  createdby: any;
  architecturaldesign: UploadedFile[];
  attachments: UploadedFile[];
  revisiondesign: [];
  onholddesign: [];
  electricalslocation: UploadedFile;
  designgeneralinformation: DesignGeneralInformation;
  electricalinformation: DesignElectricalInformation;
  structuralinformations: DesignStructuralInformation[];
  assignedto: User;
  status: string;
  prelimdesign: UploadedFile;
  outsourcedto: User;
  designassignedto: User;
  reviewassignedto: User;
  reviewstarttime: string;
  reviewendtime: string;
  reviewissues: string;
  errorcount: number;
  requestdeclinereason: string;
  isoutsourced: string;
  designstarttime: string;
  designacceptancestarttime: string;
  activities: Activity[];
  isonpriority: boolean;
  expecteddeliverydate: string;
  permitdesign: UploadedFile;
  requestdeclineattachment: UploadedFile[];
  created_at: string;
  updated_at: string;
  isinrevisionstate: boolean;
  revisioncomments: string;
  revisionattachments: UploadedFile[];
  paymentstatus: string;
  usertype: string;
  company: string;
  slabname: string;
  issurveycompleted: boolean;
  survey: any;
  surveyid: number;
  pestampid: number;
  requirementtype: string;
  utility: PrelimUtility;
  annualutilityescalation: number;
  incentive: Incentives;
  costofsystem: number;
  personname: string;
  companylogo: UploadedFile;
  inverterscount: number;
  issurveyraised: boolean;
  ispermitraised: boolean;
  mpurequired: boolean;
  ispestampraised: boolean;
  autopermitdesign: UploadedFile;
  designerdetails: DesignerDetails;
  createrparentid: number;
  designchecklistrefreshed: boolean;
  esiid: number;
  designinverters: any
  tasktimings: JobsTiming;
  newtasktimings: JobsTiming;
  groupchatpassword: string;
  //Dynamic content
  designremainingtime: string;
  reviewremainingtime: string;
  designcurrentstatus: string;
  isoverdue: boolean = false;
  lateby: string;
  recordupdatedon: string;
  formattedjobtype: string;
  isrecordcomplete: boolean = false;
  designacceptanceremainingtime: string;
  unreadmessagecount = 0;
  creatorparentid: number;
  checklistcriteria: [];
  unhold: boolean;
  requestunholdreason: string;
  requestunholdattachment: UploadedFile[];
  modulecount: number;
  solarcapacity: number;
  ahj: Ahj;
  newmodulemade: string;
  newmodulemake: string;
  newinvertermade: string;
  newinvertermake: string;
  raiserequestattachment: UploadedFile[];
  raiserequestreason: string;
  guidelines: {};
}
