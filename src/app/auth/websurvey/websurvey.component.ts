import {
  animate, state,
  style, transition, trigger
} from "@angular/animations";
import { ChangeDetectionStrategy, Component, HostListener, OnInit, ViewEncapsulation } from "@angular/core";
import { WebcamImage, WebcamInitError, WebcamUtil } from "ngx-webcam";
import { Observable, Subject } from "rxjs";

export interface ActionInfo {
  name: string;
  children: Children[];
}

export interface Children {
  name: string;
  description: Description[];
}

export interface Description {
  shotdescription: string;
  capturedshot: WebcamImage;
  isinforequired: boolean;
  infodescription: string;
  infoquestions: Question[];
  capturedinfo: boolean;
}

export interface Question {
  question: string;
  positiveaction: string;
  negativeaction: string;
  result: any;
}

export const BATTERY: ActionInfo[] = [
  {
    name: "Electricals",
    children: [
      {
        name: "MSP",
        description: [
          {
            shotdescription: "Capture Long Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
          {
            shotdescription: "Capture Zoom Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
          {
            shotdescription: "Capture Open Shutter Zoom Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
          {
            shotdescription: "Capture Without Cover Zoom Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
        ],
      },
      {
        name: "Utility Meter",
        description: [
          {
            shotdescription: "Capture Wide Angle Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
          {
            shotdescription: "Capture Zoom Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
        ],
      },
      {
        name: "PV Inverter",
        description: [
          {
            shotdescription: "Capture Wide Angle Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
          {
            shotdescription: "Capture Zoom Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
        ],
      },
      {
        name: "PV Meter",
        description: [
          {
            shotdescription: "Capture Wide Angle Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
        ],
      },
      {
        name: "AC Disconnect",
        description: [
          {
            shotdescription: "Capture Wide Angle Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
          {
            shotdescription: "Capture Zoom Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Solar",
    children: [
      {
        name: "Solar Modules",
        description: [
          {
            shotdescription: "Capture Wide Angle Shot",
            capturedshot: null,
            isinforequired: true,
            infodescription: "Provide Location",
            capturedinfo: false,
            infoquestions: [
              {
                question: "MSP is located inside or outside the building?",
                positiveaction: "Inside",
                negativeaction: "Outside",
                result: "",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Roof",
    children: [
      {
        name: "Roof",
        description: [],
      },
    ],
  },
  {
    name: "Appliances",
    children: [
      {
        name: "Appliances",
        description: [],
      },
    ],
  },
  {
    name: "Details",
    children: [
      {
        name: "Details",
        description: [],
      },
    ],
  },
];

@Component({
  selector: "app-websurvey",
  templateUrl: "./websurvey.component.html",
  styleUrls: ["./websurvey.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("slideInOut", [
      transition(":enter", [
        style({ transform: "translateY(-100%)" }),
        animate("600ms ease-in", style({ transform: "translateY(0%)" })),
      ]),
      transition(":leave", [
        animate("600ms ease-in", style({ transform: "translateY(-100%)" })),
      ]),
    ]),
    trigger("simpleFadeAnimation", [
      state("in", style({ opacity: 1 })),
      transition(":enter", [style({ opacity: 0 }), animate(600)]),
      transition(":leave", animate(600, style({ opacity: 0 }))),
    ]),
  ],
})
export class WebsurveyComponent implements OnInit {
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: WebcamImage = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<
    boolean | string
  >();

  width: number;
  height: number;
  menuItems: any[];
  selectedMenuItem: ActionInfo;
  selectedSubMenu: Children;
  currentShotMessage: string;
  currentInfoMessage: string;
  currentcaptureindex = 0;
  askquestion = false;
  // capturedImages : WebcamImage[] = [];

  @HostListener("window:resize", ["$event"])
  onResize(event?: Event): void {
    const win = !event ? (event.target as Window) : window;
    this.width = win.innerWidth;
    this.height = win.innerHeight - 10;
  }

  constructor() {
    this.onResize();
  }

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs().then(
      (mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      }
    );

    this.menuItems = BATTERY.filter((menuItem) => menuItem);
    this.selectedMenuItem = this.menuItems[0];
    this.selectedSubMenu = this.selectedMenuItem.children[0];
    this.currentShotMessage =
      this.selectedSubMenu.description[
        this.currentcaptureindex
      ].shotdescription;
    this.currentInfoMessage =
      this.selectedSubMenu.description[
        this.currentcaptureindex
      ].infodescription;
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.selectedSubMenu.description[this.currentcaptureindex].capturedshot =
      webcamImage;
    this.webcamImage = webcamImage;
    if (
      this.selectedSubMenu.description[this.currentcaptureindex].isinforequired
    ) {
      this.askquestion = true;
    } else {
      this.askquestion = false;
    }
    // this.capturedImages.push(webcamImage);
  }

  handlePositiveClick(): void {
    this.askquestion = false;
  }

  handleNegativeClick(): void {
    this.askquestion = false;
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
}
