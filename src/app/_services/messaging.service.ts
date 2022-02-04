import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, map, mergeMapTo } from "rxjs/operators";
import { User } from "src/app/_models";
import { BaseUrl } from "../_helpers";
import { AuthenticationService } from "./authentication.service";
import { EventEmitterService } from "./event-emitter.service";
import { GenericService } from "./generic.service";
import { NotificationService } from "./notification.service";
@Injectable({
  providedIn: "root",
})
export class MessagingService {
  result;
  user: User;
  userToken;
  userAmount: any = [];
  currentMessage = new BehaviorSubject(null);
  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private http: HttpClient,
    private authService: AuthenticationService,
    private genericService: GenericService,
    private notificationService: NotificationService,
    private eventEmitterService: EventEmitterService
  ) { }
  requestPermission(): void {
    this.angularFireMessaging.requestPermission
      .pipe(mergeMapTo(this.angularFireMessaging.tokenChanges))
      .subscribe(
        (token) => {
          this.userToken = token;
          this.genericService.ispermissiongranted = true;
          this.genericService.fcmpushtoken = token;
          this.updateToken();
          this.listen();
        },
        () => {
          // do nothing.
        }
      );
  }
  updateToken() {
    const data = { newpushtoken: this.userToken };
    return this.http
      .put(
        BaseUrl +
        "users/pushtokens/" +
        this.authService.currentUserValue.user.id,
        data,
        { headers: this.genericService.authheaders }
      )
      .subscribe((data) => {
        this.userAmount = data;
      });
  }
  listen(): void {
    this.angularFireMessaging.messages.subscribe((payload) => {
      const notificationobj = JSON.parse(JSON.stringify(payload));
      this.notificationService.showSuccess(
        notificationobj.data.body,
        notificationobj.data.title
      );
      this.eventEmitterService.onNewNotificationReceived(
        notificationobj.data.type
      );
      this.currentMessage.next(payload);
    });
  }
  profileNotification() {
    return this.http
      .get(
        BaseUrl +
        "notifications/user/" +
        this.authService.currentUserValue.user.id,
        { headers: this.genericService.authheaders }
      )
      .subscribe(() => {
        // do nothing.
      });
  }

  notifyChatMessage(
    userids,
    groupname,
    messageText,
    sender,
    projecttitle,
    chatid
  ) {
    const postData = {
      ids: userids,
      group: groupname,
      messagetext: messageText,
      sender: sender,
      projecttitle: projecttitle,
      chatid: chatid,
    };
    return this.http
      .post(BaseUrl + "notifications/newchat", postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }
  getTeamDataForChat(chatid): Observable<User[]> {
    return this.http
      .get<User[]>(
        BaseUrl +
        "users?_sort=created_at:desc&user=" +
        this.authService.currentUserValue.user.id +
        "&id_ne=" +
        this.authService.currentUserValue.user.parent.id +
        "&chatid=" +
        chatid,
        {
          headers: this.genericService.authheaders,
          observe: "response",
        }
      )
      .pipe(
        map((value) => {
          const members: User[] = value.body;
          return members;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error == "Unauthorized") {
            this.genericService.handleusersignout();
          } else {
            return throwError(err.error.message);
          }
        })
      );
  }

  notifyMentionChatMessage(userids, groupname, messageText, sender, chatid) {
    const postData = {
      ids: userids,
      group: groupname,
      messagetext: messageText,
      sender: sender,
      chatid: chatid,
    };
    return this.http
      .post(BaseUrl + "notifications/mention", postData, {
        headers: this.genericService.authheaders,
        observe: "response",
      })
      .pipe(
        map((value) => {
          return value.body;
        }),
        catchError((err: HttpErrorResponse) => {
          //   this.utils.showApiError(err.error.message);
          return throwError(err.error.message);
        })
      );
  }
}
