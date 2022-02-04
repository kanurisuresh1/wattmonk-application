import { BatteryMake } from "./batterymake";
import { BatteryModel } from "./batterymodel";
import { MSPBrand } from "./mspbrand";
import { OptimizerModel } from "./optimizermodel";
import { Design } from "./design";
import { UploadedFile } from "./uploadedfile";
import { Comment } from "./comment";

export class DesignElectricalInformation {
  id: number;
  acdisconnect: boolean;
  pvmeter: boolean;
  servicefeedsource: string;
  msp: string;
  mspsize: number;
  conduitrun: string;
  typeofconduit: string;
  interconnection: string;
  interconnection_input: string;
  mainbreakersize: number;
  batterymake: BatteryMake;
  batterymodel: BatteryModel;
  mspbrand: MSPBrand;
  optimizer: OptimizerModel;
  numberofbatteries: number;
  combinerbox: boolean;
  comments: Comment[];
  design: Design;
  mspphotos: UploadedFile[];
  subpanelphotos: UploadedFile[];
  singlelinediagram: UploadedFile[];
  supplyvoltage: string;
}
