import { environment } from "../../environments/environment";

export const BaseUrl = environment.BaseUrl;
export const StampingBaseUrl = environment.StampingBaseUrl;
export const DesignUrl = environment.DesignUrl;
export const COMETCHAT_CONSTANTS = environment.COMETCHAT_CONSTANTS;

export const FIREBASE_DB_CONSTANTS = environment.FIREBASE_DB_CONSTANTS;
export const ZOHO_SALESIQ_CONSTANTS = environment.ZOHO_SALESIQ_CONSTANTS;

export const GOOGLE_API_KEY = "AIzaSyCePxz4wA_knfjvNBhV0RKzrySsf4o8QFU";

export const Subsection_Items_Limit = 500;

export enum ROLES {
  SuperAdmin = 4,
  ContractorSuperAdmin = 6,
  ContractorAdmin = 7,
  Admin = 5,
  BD = 3,
  Designer = 8,
  Surveyor = 9,
  Analyst = 10,
  Peengineer = 11,
  Master = environment.Master_Role_Id,
  TeamHead = environment.Team_Head_Role_Id,
  PeAdmin = environment.PeAdmin,
  PESuperAdmin = environment.PESuperAdmin,
  SuccessManager = environment.SuccessManager,
}

export enum PLANS {
  Free = 2,
  Silver = 3,
  Gold = 4,
  Platinum = 5,
}

export enum EVENTS_PERMIT_DESIGN {
  DesignGenerated = "1",
  GeneralInformationSaved = "2",
  StructuralInformationSaved = "3",
  ElectricalInformationSaved = "4",
  LocationMarkingSaved = "5",
  ShowLoading = "6",
  HideLoading = "7",
  BatteryJobChange = "8",
  PVBatteryJobChange = "9",
  PVJobChange = "10",
  NewConstructionChangeOn = "11",
  NewConstructionChangeOff = "12",
  UploadingAttachments = "13",
  UploadingArchitecturalDesign = "14",
  ChatSetup = "15",
  UploadingModulesDesign = "16",
  UploadingRoofObstacles = "17",
  UploadingRoofPhotos = "18",
  UploadingAtticPhotos = "19",
  UploadingMSPPhotos = "20",
  UploadingSubpanelPhotos = "21",
  UploadingSketchDiagram = "22",
  UploadingLocationImage = "23",
  UtilityACDisconnectChangeOn = "24",
  UtilityACDisconnectChangeOff = "25",
  PVMeterChangeOn = "26",
  PVMeterChangeOff = "27",
  UploadingSitePlan = "28",
  UploadingRoofPlanAndModules = "29",
  UploadingStringLayoutAndBom = "30",
  UploadingSingleLineDiagram = "31",
  UploadingHousePhotoImage = "32",
  UploadingVicinityMap = "33",
  UploadingSolarModuleCatalogue = "34",
  UploadingInverterCatalogue = "35",
  UploadingBatteryCatalogue = "36",
  UploadingRackingModelDataCatalogue = "37",
  UploadingRackingModelCutCatalogue = "38",
  UploadingAttachmentsDataSheetCatalogue = "39",
  UploadingAttachmentsCutSheetCatalogue = "40",
  DesignerInformationSaved = "41",
  GeneratingPDF = "42",
  DownloadingPercentageOfGeneratedPDF = "43",
  StructuralInformationSkipped = "44",
  ElectricalInformationSkipped = "45",
  GeneralInformationSkipped = "46",
  QualityCheck = "47",
  UploadingSitePlacardImage = "48",
  DesignerDetailsSaved = "49",
  SiteInformationSaved = "50",
  DesignBomDetailSaved = "51",
  UploadingOthersAttachments = "52",
}

export const NAME = /^[a-zA-Z][a-zA-Z- ]*$/;
export const MAILFORMAT =
  /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,8})$/;
// export const ADDRESSFORMAT = /^[#.0-9a-zA-Z\u00C0-\u1FFF\u2800-\uFFFD &_)*#/('\s,-]+$/;
export const ADDRESSFORMAT = /[^ ]*^[#.0-9a-zA-Z\s,-]*[^ ]$/;
