import { RoofMaterial } from "./roofmaterial";
import { RackingName } from "./rackingname";

export class AttachmentType {
  id: number;
  rooftype: string;
  name: string;
  roofmaterial: RoofMaterial;
  rackingname: RackingName;
}
