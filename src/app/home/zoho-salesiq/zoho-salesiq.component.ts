import { DOCUMENT } from "@angular/common";
import { Component, Inject, OnInit, Renderer2 } from "@angular/core";
import { ZOHO_SALESIQ_CONSTANTS } from "src/app/_helpers";
import { User } from "src/app/_models";
import { AuthenticationService } from "src/app/_services";
import { WindowRef } from "./WindowRef";

@Component({
  selector: "app-zoho-salesiq",
  templateUrl: "./zoho-salesiq.component.html",
  styleUrls: ["./zoho-salesiq.component.css"],
  providers: [WindowRef],
})
export class ZohoSalesiqComponent implements OnInit {
  domain: string = `https://salesiq.zoho.in/widget`;
  widgetCode: string = ZOHO_SALESIQ_CONSTANTS.WIDGET_CODE;
  window: any;
  isValid: boolean = true;
  user: any;
  loggedinUser: User;
  constructor(
    private winRef: WindowRef,
    private _renderer2: Renderer2,
    private authService: AuthenticationService,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.validate();
    this.window = this.winRef.nativeWindow;
    this.loggedinUser = this.authService.currentUserValue.user;
    this.user = {
      email: this.loggedinUser.email,
      name: this.loggedinUser.firstname + " " + this.loggedinUser.lastname,
      user_id: "" + this.loggedinUser.id,
      company: this.loggedinUser.parent.company,
    };
  }

  validate(): void {
    if (!this.domain.trim().length || !this.widgetCode.trim().length) {
      this.isValid = false;
    }
  }

  loadSalesiq(): void {
    let script = this._renderer2.createElement("script");
    script.type = `text/javascript`;
    script.id = `salesiq_script`;
    script.text = `
        {
          var $zoho=$zoho || {};
          $zoho.salesiq = $zoho.salesiq || {widgetcode: "${this.widgetCode}", values:{},ready:function(){}};
          var d=document;s=d.createElement("script");
          s.type="text/javascript";
          s.id="zsiqscript";
          s.defer=true;
          s.src="${this.domain}";
          t=d.getElementsByTagName("script")[0];
          t.parentNode.insertBefore(s,t);
          d.write("<div id='zsiqwidget'></div>");
        }
    `;

    this._renderer2.appendChild(this._document.body, script);
  }

  visitorInfo(): void {
    const script2 = this._renderer2.createElement("script");
    script2.type = `text/javascript`;
    script2.text = ` $zoho.salesiq.ready=function()
    {
      $zoho.salesiq.visitor.name("${this.user.name}");
      $zoho.salesiq.visitor.email("${this.user.email}");
      $zoho.salesiq.visitor.info({"UserId":"${this.user.user_id}","Company": "${this.user.company}"});

    }`;
    this._renderer2.appendChild(this._document.body, script2);
  }

  ngOnInit(): void {
    if (this.window && this.window.$zoho) {
      this.showWidget();
    } else {
      this.isValid && this.loadSalesiq();
      this.visitorInfo();
    }
  }

  showWidget(): void {
    this.window && this.window.$zoho.salesiq.floatwindow.visible("show");
  }

  hideWidget(): void {
    this.window && this.window.$zoho.salesiq.floatwindow.visible("hide");
  }

  ngOnDestroy(): void {
    this.hideWidget();
  }
}
