import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  OnInit, ViewEncapsulation
} from "@angular/core";
import { ROLES } from "src/app/_helpers";
import { User } from "src/app/_models";
import { Activity } from "src/app/_models/activity";
import {
  AuthenticationService, DesignService,
  GenericService,
  NotificationService
} from "src/app/_services";
import { EventEmitterService } from "src/app/_services/event-emitter.service";

@Component({
  selector: "app-activitybar",
  templateUrl: "./activitybar.component.html",
  styleUrls: ["./activitybar.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivitybarComponent implements OnInit {
  isClient: boolean;
  loggedInUser: User;
  isactivityloading = true;
  roleid: any;
  activityloaded: boolean;
  isactivityloaded: boolean;
  activities: Activity[];

  constructor(
    public genericService: GenericService,
    private designService: DesignService,
    private changeDetectorRef: ChangeDetectorRef,
    private eventEmitterService: EventEmitterService,
    private notifyService: NotificationService,
    public authService: AuthenticationService
  ) {
    this.loggedInUser = authService.currentUserValue.user;
    this.roleid = this.loggedInUser.parent.role;

    if (
      this.loggedInUser.role.id == ROLES.ContractorSuperAdmin ||
      this.loggedInUser.role.id == ROLES.ContractorAdmin ||
      this.loggedInUser.role.id == ROLES.SuccessManager ||
      this.roleid === ROLES.ContractorSuperAdmin ||
      this.roleid === ROLES.ContractorAdmin ||
      this.roleid === ROLES.SuccessManager
    ) {
      this.isClient = true;
    } else {
      this.isClient = false;
    }
  }

  ngOnInit(): void {
    this.eventEmitterService.subsVar =
      this.eventEmitterService.invokeDesignActivityBarFunction.subscribe(
        (id: number) => {
          this.isactivityloading = true;
          this.getActivities(id, "design");
        }
      );
    this.eventEmitterService.subsVar =
      this.eventEmitterService.invokeSurveyActivityBarFunction.subscribe(
        (id: number) => {
          this.isactivityloading = true;
          this.getActivities(id, "survey");
        }
      );
    this.eventEmitterService.subsVar =
      this.eventEmitterService.invokePestampActivityBarFunction.subscribe(
        (id: number) => {
          this.isactivityloading = true;
          this.getActivities(id, "pestamp");
        }
      );
  }

  onCloseClick(): void {
    let $activitybar = document.getElementsByClassName("activitybar")[0];
    $activitybar.classList.add("activitybar-close");
    $activitybar.classList.remove("activitybar-open");
    this.activities = [];
  }

  getActivities(id: number, activitytype): void {
    this.designService.getactivities(id, activitytype).subscribe(
      (response) => {
        setTimeout(() => {
          this.isactivityloading = false;
          this.changeDetectorRef.detectChanges();
        }, 300);
        this.activities = response;
        this.changeDetectorRef.detectChanges();
      },

      (error) => {
        this.notifyService.showError(error, "Error");
      }
    );
  }
}
