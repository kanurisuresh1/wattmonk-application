export class DesignerElectricalInput {
  tableid: number;
  typical: number;
  initialconductorlocation: string;
  finalconductorlocation: string;
  ocpd: boolean;
  maxcurrent: number;
  inputlength: number;
  parallelcircuits: number;

  conductor1?: number;
  conductor2?: string;
  conductor3?: string;
  conduit?: string;
  currentcarryingconductorinconduit?: number;
  conduitfillpercent?: number;
  egc1?: number;
  egc2?: string;
  tempcorrfactor1?: number;
  tempcorrfactor2?: number;
  conduitfillfactor?: number;
  contcurrent?: number;
  baseamp?: number;
  deratedamp?: number;
  termtemprating?: number;
  voltagedrop?: number;
  ocpdvalue?: string;
  isSaved: boolean
}
