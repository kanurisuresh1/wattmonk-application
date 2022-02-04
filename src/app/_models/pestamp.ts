import { Activity } from "./activity";
import { Comment } from "./comment";
import { Design } from "./design";
import { UploadedFile } from "./uploadedfile";
import { User } from "./user";

export class Pestamp {
  id: number;
  name: string;
  personname: string;
  email: string;
  contactnumber: number;
  modeofstamping: string;
  propertytype: string;
  mountingtype: string;
  workinghours: number;
  type: string;
  chatid: string;
  permitplan: UploadedFile[];
  atticphotos: UploadedFile[];
  roofphotos: UploadedFile[];
  hardcopies: number;
  shippingaddress: string;
  deliveryaddress: string;
  createdby: User;
  assignedto: User;
  assignedtoid: number;
  pesuperadminassignedid: number;
  electricalassignedto: User;
  structuralassignedto: User;
  designassignedto: User;
  reviewassignedto: User;
  length: any;
  created_at: string;
  updated_at: string;
  paymentstatus: string;
  comments: Comment[];
  activities: Activity[];
  source: string;
  status: string;
  outsourcedto: User;
  isoutsourced: string;
  actualdelivereddate: string;
  pestampstarttime: string;
  pestampendtime: string;
  pestampacceptancestarttime: string;
  pestampacceptanceendtime: string;
  stampedfiles: UploadedFile[];
  requestdeclinereason: string;
  onholdpestamp: UploadedFile[];
  requestdeclineattachment: UploadedFile[];
  deliverychargespaymentstatus: string;
  deliverycharges: number;
  acceptedbypeengineer: boolean;
  declinedbypeengineer: boolean;
  jobtype: string;
  iselectricalassigned: boolean;
  isstructuralassigned: boolean;
  iselectricalstampeduploaded: boolean;
  isstructuralstampeduploaded: boolean;
  electricalstampedfiles: UploadedFile[];
  structuralstampedfiles: UploadedFile[];
  declinedbyelectricalpeengineer: boolean;
  declinedbystructuralpeengineer: boolean;
  acceptedbyelectricalpeengineer: boolean;
  acceptedbystructuralpeengineer: boolean;
  electricalworkinghours: number;
  structuralworkinghours: number;
  electricaldeliverycharges: number;
  structuraldeliverycharges: number;
  design: Design;
  designid: number;
  creatorparentid: number;
  revisionpestamp: any;
  declinedbypesuperadmin: boolean;
  groupchatpassword: string;
  //Dynamic content
  designremainingtime: string;
  reviewremainingtime: string;
  pestampcurrentstatus: string;
  isoverdue: boolean = false;
  lateby: string;
  recordupdatedon: string;
  formattedpestamptype: string;
  isrecordcomplete: boolean = false;
  pestampacceptanceremainingtime: string;
  unreadmessagecount = 0;
  isinrevisionstate: boolean;
  revisioncomments: Comment[];
  revisionattachments: UploadedFile[];
  addedtogroupchat: boolean;
  thirdpartystamping: boolean;
  acceptedbypesuperadmin: boolean;
  raiserequestattachment: UploadedFile[];
  raiserequestreason: string;
  peengineerexist: boolean = false;
}