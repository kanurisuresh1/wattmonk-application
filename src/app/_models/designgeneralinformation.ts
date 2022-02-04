import { Ahj } from "./ahj";
import { Utility } from "./utility";
import { Firesetback } from "./firesetback";
import { User } from "./user";
import { UploadedFile } from "./uploadedfile";
import { Comment } from "./comment";

export class DesignGeneralInformation {
  id: number;
  batterybackup: string;
  ahjdetails: Ahj;
  utilitydetails: Utility;
  firesetbackdetails: Firesetback;
  riskcategory: string;
  modulescount: number;
  financingtype: string;
  lessormeter: boolean;
  addedby: User;
  comments: Comment[];
  source: string;
  moduleslayoutdesign: UploadedFile;
}
