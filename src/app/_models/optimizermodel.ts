import { InverterMake } from "./invertermake";

export class OptimizerModel {
  id: number;
  name: string;
  ratedinputpower: number;
  maxoutputcurrent: number;
  maxinputisc: number;
  maxdcvoltage: number;
  weightedefficiency: number;
  invertermake: InverterMake;
}
