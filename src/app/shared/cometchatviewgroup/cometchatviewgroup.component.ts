import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { CometChat } from '@cometchat-pro/chat';
import { ChatdialogComponent } from 'src/app/shared/chatdialog/chatdialog.component';
import { GenericService } from 'src/app/_services';

@Component({
  selector: "app-cometchatviewgroup",
  templateUrl: "./cometchatviewgroup.component.html",
  styleUrls: ["./cometchatviewgroup.component.scss"],
})
export class CometchatviewgroupComponent implements OnInit {
  array: any[];
  unreadGroups: CometChat.Conversation[] | any = [];
  JSONParser = JSON;
  backgroundColor = 'blue';
  textColor = 'white';
  image: any
  cornerRadius?: any;
  borderWidth?: any;
  borderColor?: any;
  dashboardchatskeleton = true;
  retry = 1;
  constructor(
    private changedet: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    public genericService: GenericService,) {

  }


  ngOnInit(): void {
    this.getunreadmessageid();
  }

  getunreadmessageid(): void {
    setTimeout(() => {
      CometChat.getUnreadMessageCountForAllGroups().then(
        array => {
          let totalcount = [];
          let user = array;
          const entries = Object.entries(user);
          for (const [prop] of entries) {
            totalcount.push(prop);

          }
          this.array = totalcount;
          this.getUnreadMessage()
        },
        () => {
          if (this.retry > 0) {
            this.retry--;
            this.getunreadmessageid();
          }
        }
      );
    }, 2000);
  }
  async getUnreadMessage() {
    if (this.array.length > 0) {
      for (let i = 0; i <= 9; i++) {
        let GUID = this.array[i];
        CometChat.getConversation(GUID, 'group').then(
          conversation => {

            //conversation = Object.assign(JSON.parse(JSON.stringify(conversation)) as CometChat.Conversation);
            this.array[i] = this.getimage(conversation)
            this.unreadGroups.push(conversation);
            this.unreadGroups = this.unreadGroups.sort((a, b) => { return b.unreadMessageCount - a.unreadMessageCount })
            //console.log('image', this.image);

            this.dashboardchatskeleton = false;
            this.changedet.detectChanges()
          }
        );



      }
    }
    else {
      this.dashboardchatskeleton = false;
    }

    this.changedet.detectChanges()

  }
  getMyStyle = (): {
    background: string;
    color: string;
  } => {
    return {
      background: this.backgroundColor,
      color: this.textColor
    }
  }

  getMyAvStyle = () => {
    return {
      border:
        (this.borderWidth ? this.borderWidth : '1px') + ' solid ' + (this.borderColor ? this.borderColor : '#AAA'),
      'border-radius': this.cornerRadius ? this.cornerRadius : '50%'
    };
  }

  getimage(conversation: any) {

    if (conversation.getConversationType() == 'user') {
      if (!(conversation.getConversationWith() as CometChat.User).getAvatar()) {
        (conversation.getConversationWith() as CometChat.User)
          .setAvatar(Helper.getSVGAvatar((conversation.getConversationWith() as CometChat.User).getUid(),
            conversation.getConversationWith().getName().substr(0, 1).toUpperCase()));
      }
    } else {
      if (!(conversation.getConversationWith() as CometChat.Group).getIcon()) {
        (conversation.getConversationWith() as CometChat.Group)
          .setIcon(Helper.getSVGAvatar((conversation.getConversationWith() as CometChat.Group).getGuid(),
            '#' + conversation.getConversationWith().getName().substr(0, 1).toUpperCase()));
        this.changedet.detectChanges();
      }
    }
    conversation.conversationWith.icon = this.sanitizer.bypassSecurityTrustResourceUrl(conversation.conversationWith.icon);
    return conversation;
  }

  onMessageClick(guid, i): void {
    // event.stopPropagation();
    //this.activitybarClose();

    let GUID = guid;
    this.genericService.setSelectedChatGroupID(GUID);
    CometChat.getGroup(guid).then(
      () => {
        this.unreadGroups.splice(i, 1);
        this.unreadGroups = [...this.unreadGroups]
        this.changedet.detectChanges();
        this.snackBar.openFromComponent(ChatdialogComponent, {
          data: "element",
          panelClass: ["chatdialog"]
        });
      }, () => {
      }
    )
  }

}

export class Helper {
  static getSVGAvatar = (generator: string, data: string): string => {
    const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg1.setAttribute("width", "200");
    svg1.setAttribute("height", "200");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '200');
    rect.setAttribute('height', '200');
    rect.setAttribute('fill', Helper.stringToColour(generator));
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute('x', '50%');
    text.setAttribute('y', '54%');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '120');
    text.setAttribute('font-family', "'Inter', sans-serif");
    text.setAttribute('font-wight', "600");
    text.textContent = data;
    svg1.appendChild(rect);
    svg1.appendChild(text);
    const svgString = new XMLSerializer().serializeToString(svg1);

    const decoded = unescape(encodeURIComponent(svgString));
    const base64 = btoa(decoded);

    const imgSource = `data:image/svg+xml;base64,${base64}`;
    return imgSource;
  }


  static stringToColour = function (str): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }
}
