import { EventEmitter, Injectable } from "@angular/core";
import { Subscription } from "rxjs";
import { EVENTS_PERMIT_DESIGN } from "../_helpers";

@Injectable({
  providedIn: "root",
})
export class EventEmitterService {
  invokeDesignActivityBarFunction = new EventEmitter();
  invokePestampActivityBarFunction = new EventEmitter();
  invokeSurveyActivityBarFunction = new EventEmitter();
  subsVar: Subscription;

  //DESIGN SPECIFIC EVENTS
  designGenerationState = new EventEmitter();
  locationMarkingStateChange = new EventEmitter();

  //NEW NOTIFICATION SPECIFIC
  newnotificationreceived = new EventEmitter();

  //Sidebar navigation change
  sidebarRouteChange = new EventEmitter();

  //Chat item selected
  chatItemSelected = new EventEmitter();

  //Inbox Screen Refresh Event
  inboxDashboardRefresh = new EventEmitter();

  // diable right navbar during onboarding
  disableNavbarMenu = new EventEmitter();

  //currentUserDataRefresh
  currentUserDataRefresh = new EventEmitter();

  sidebarscreenRefresh;
  sidebarRefresh = new EventEmitter();
  //Notification Refresh Event
  notificationrefresh = new EventEmitter();

  profilerefresh = new EventEmitter();

  chatrefresh = new EventEmitter();
  dashboardRefresh = new EventEmitter();
  userSettingsRefresh = new EventEmitter();
  designTrackerRefresh = new EventEmitter();
  constructor() {
    //do nothing
  }
  onActivityBarButtonClick(
    recordid: number,
    isdesign: boolean,
    ispestamp?: string
  ): void {
    if (isdesign) {
      this.invokeDesignActivityBarFunction.emit(recordid);
    } else if (ispestamp === "Pestamp") {
      this.invokePestampActivityBarFunction.emit(recordid);
    } else {
      this.invokeSurveyActivityBarFunction.emit(recordid);
    }
  }
  onPermitDesignGenerationStateChange(id: EVENTS_PERMIT_DESIGN): void {
    this.designGenerationState.emit(id);
  }

  onlocationMarkingStateChange(id: EVENTS_PERMIT_DESIGN): void {
    this.locationMarkingStateChange.emit(id);
  }

  onNewNotificationReceived(type): void {
    this.newnotificationreceived.emit(type);
  }

  onSidebarRouteChange(title): void {
    this.sidebarRouteChange.emit(title);
  }

  onConversationItemSelected(count): void {
    this.chatItemSelected.emit(count);
  }

  onInboxDashboardRefresh(): void {
    this.inboxDashboardRefresh.emit();
  }
  onSidebarRefresh(): void {
    this.sidebarRefresh.emit();
  }
  onDashboardRefresh(data): void {
    this.dashboardRefresh.emit(data);
  }
  onDesignTrackerRefresh(data: boolean): void {
    this.designTrackerRefresh.emit(data);
  }
  onOnboardingComplete(data: boolean): void {
    this.disableNavbarMenu.emit(data);
  }
  onSettingsUpdate(data): void {
    this.userSettingsRefresh.emit(data);
  }
  userDataRefresh(data): void {
    this.currentUserDataRefresh.emit(data);
  }
  onNotificationRefresh(): void {
    this.notificationrefresh.emit();
  }

  onProfileRefresh(): void {
    this.profilerefresh.emit();
  }
  onChatRefresh(): void {
    this.chatrefresh.emit();
  }
}
