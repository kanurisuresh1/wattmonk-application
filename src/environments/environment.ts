// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  name: "dev",
  Master_Role_Id: 15,
  Team_Head_Role_Id: 24,
  PeAdmin: 28,
  PESuperAdmin: 29,
  SuccessManager: 30,
  // BaseUrl: "http://localhost:1337/",
  // StampingBaseUrl: "http://localhost:1337/",
  // DesignUrl: "http://localhost:1337/",
  BaseUrl: "https://devspace.wattmonk.com/api/",
  StampingBaseUrl: "https://devspace.wattmonk.com/api/",
  DesignUrl: "https://devspace.wattmonk.com/api/",
  firebase: {
    apiKey: "AIzaSyAcveVBoDUxk_VPNozqLR7ZZ4x1fyZoPxI",
    authDomain: "wattmonk-273002.firebaseapp.com",
    databaseURL: "https://wattmonk-273002.firebaseio.com",
    projectId: "wattmonk-273002",
    storageBucket: "wattmonk-273002.appspot.com",
    messagingSenderId: "554801985112",
    appId: "1:554801985112:web:4d1bd25b29924b9de53c2d",
    measurementId: "G-Y5FQXTC6DJ",
  },
  FIREBASE_DB_CONSTANTS: {
    KEYWORD: "devcomp_",
  },
  COMETCHAT_CONSTANTS: {
    APP_ID: "2145560cac03137",
    REGION: "US",
    API_KEY: "83ac811da8283c9e235ab912bf7a6213c207dd4d",
    REST_API_KEY: "4f441010f9ace69fc5e2471c20e9f1c21ca56402",
    UNIQUE_CODE: "1337",
  },
  // Mixpanel_CONSTANTS: "e4b30b18d61b5abe078c2719911858cb",
  PAYPAL_CONSTANTS: {
    CLIENT_ID:
      "AQ8yUi98saJfVRt5-u7DpiK0Fq-JeGV8h8_QNe8KFBziitabFvZKrxMBdDw_xqa8sGSq-0fNpAzgQwDt",
    CURRENCY: "USD",
  },
  ZOHO_SALESIQ_CONSTANTS: {
    WIDGET_CODE: `a86a9f994c41265b9143a523f63150b22cd725a9d4e41386abf91442f3abf29a`,
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
