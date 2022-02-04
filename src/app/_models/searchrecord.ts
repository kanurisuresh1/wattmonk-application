import { User } from "./user";

export class SearchRecord {
  id: number;
  type: string;
  name: string;
  email: string;
  address: string;
  phonenumber: string;
  createdby: User;
  updated_at: string;
  requesttype: string;
  city: string;
  state: string;
  country: string;
  source: string;
  pvmeter: boolean;
  acdisconnect: boolean;
  assignedto: User;

  distancebetweentworafts: number;
  sizeofsingleraft: string;
  loadsnottobebackedup: string;
  additionalnotes: string;
  newconstruction: boolean;
  existingsolarsystem: boolean;
  existingsolarsystemdetails: string;
  msplocation: string;
  mainbreakersize: number;
  msprating: number;
  mspbreaker: string;
  utilitymeter: string;

  pvinverterlocation: string;
  invertermake: string;
  invertermodel: string;

  numberofmodules: number;
  batterybackup: string;
  interconnection: string;
  servicefeedsource: string;
  status: string;
  outsourcedto: User;
  isoutsourced: string;
  requestdeclinereason: string;
  reviewissues: string;
  reviewassignedto: User;
  reviewstarttime: string;

  comments: Comment[];
  postalcode: string;
  created_at: string;

  //Dynamic Content
  currentstatus: string;
  isoverdue: boolean;
  formattedtime: string;
  formattedupdatedat: string;
  formattedjobtype: string;
}
