import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "cometchat-badge",
  templateUrl: "./badge.component.html",
  styleUrls: ["./badge.component.scss"],
})
export class BadgeComponent implements OnInit {
  @Input() count: any;
  @Input() backgroundColor = "blue";
  @Input() textColor = "white";

  constructor() {}

  ngOnInit(): void {
    if (this.count) {
      if (this.count > 999) {
        this.count = "999+";
      }
    }
  }
  getMyStyle = (): { background: string; color: string } => {
    return {
      background: this.backgroundColor,
      color: this.textColor,
    };
  };
}
