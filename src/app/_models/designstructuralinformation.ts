import { RackingName } from "./rackingname";
import { RackingModel } from "./rackingmodel";
import { AttachmentType } from "./attachmenttype";
import { RoofMaterial } from "./roofmaterial";
import { UploadedFile } from "./uploadedfile";
import { Comment } from "./comment";

export class DesignStructuralInformation {
  id: number;
  framing: string;
  framingsize: string;
  spacing: number;
  numberoflayers: number;
  maxspanspacing: number;
  roofpitch: number;
  roofazimuth: number;
  roofmaterial: RoofMaterial;
  rackingname: RackingName;
  rackingmodel: RackingModel;
  attachmenttype: AttachmentType;
  attachmentdistance: string;
  attachmentmountingplacement: string;
  comments: Comment[];
  roofphotos: UploadedFile[];
  atticphotos: UploadedFile[];
  roofdimensionsandobstacles: UploadedFile[];
}
