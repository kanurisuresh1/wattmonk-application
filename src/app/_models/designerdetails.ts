import { UploadedFile } from ".";

export class DesignerDetails {
  id: number;
  exposurecategory: string;
  msplocation: string;
  showbackfeedrule: boolean;
  scalesiteplan: string;
  scaleroofplan: string;
  scalestringlayout: string;
  panelheightofroof: string;
  totalnumberofattachments: number;
  siteplan: UploadedFile;
  roofplanandmodules: UploadedFile;
  stringlayoutandbom: UploadedFile;
  singlelinediagram: UploadedFile;
  locationimage: UploadedFile;
  vicinitymap: UploadedFile;
  legend: string;
  nec: string;
  siteplacard: UploadedFile;
  siteplacarddirectionimage: UploadedFile;
}
