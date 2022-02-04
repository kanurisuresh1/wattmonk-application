import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import { Router } from "@angular/router";
import { CometChat } from "@cometchat-pro/chat";
import {
  countDownTimerConfigModel, CountdownTimerService, countDownTimerTexts
} from "ngx-timer";
import { AuthenticationService } from "src/app/_services";
import { CommonService } from "src/app/_services/common.service";

export interface UpdateData {
  loginrequired: boolean;
  title: string;
  message: string;
}

@Component({
  selector: "app-updatedialog",
  templateUrl: "./updatedialog.component.html",
  styleUrls: ["./updatedialog.component.scss"],
})
export class UpdatedialogComponent implements OnInit {
  remainingtimeconfig: countDownTimerConfigModel;
  timer;
  userdata;
  time = 30000;

  constructor(
    public dialogRef: MatDialogRef<UpdatedialogComponent>,
    public router: Router,
    private countdownservice: CountdownTimerService,
    private commonservice: CommonService,
    private authService: AuthenticationService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: UpdateData
  ) { }

  ngOnInit(): void {
    //countUpTimerConfigModel
    this.remainingtimeconfig = new countDownTimerConfigModel();

    //custom class
    this.remainingtimeconfig.timerClass = "remainingtimerclass";

    //timer text values
    this.remainingtimeconfig.timerTexts = new countDownTimerTexts();
    this.remainingtimeconfig.timerTexts.hourText = "h :"; //default - hh
    this.remainingtimeconfig.timerTexts.minuteText = "m :"; //default - mm
    this.remainingtimeconfig.timerTexts.secondsText = "s"; //default - ss

    if (this.data.loginrequired) {
      this.commonservice.changeisplatformupdated(
        this.authService.currentUserValue.user.id
      );
      const cdate = new Date();
      cdate.setMilliseconds(this.time);
      this.countdownservice.startTimer(cdate);
      this.timer = setTimeout(function () {
        "handleusersignout()"
      }, this.time);
      this.timer = setTimeout(function () {
        localStorage.clear();
        CometChat.logout();
        window.location.href = "/auth/login";
      }, this.time);
    }
  }

  preventBack(): void {
    window.history.forward();
  }

  handleskip(): void {
    this.commonservice.changeisplatformupdated(
      this.authService.currentUserValue.user.id
    );
    this.dialogRef.close();
  }

  onCloseClick(): void {
    this.commonservice.changeisplatformupdated(
      this.authService.currentUserValue.user.id
    );
    this.dialogRef.close();
  }

  handleusersignout(): void {
    this.commonservice.changeisplatformupdated(
      this.authService.currentUserValue.user.id
    );
    clearTimeout(this.timer);
    this.dialog.closeAll();
    localStorage.clear();
    CometChat.logout();
    window.location.href = "/auth/login";
    setTimeout(function () {
      "settimer()";
    }, 0);
    window.onunload = function () {
      // null;
    };
  }
}
