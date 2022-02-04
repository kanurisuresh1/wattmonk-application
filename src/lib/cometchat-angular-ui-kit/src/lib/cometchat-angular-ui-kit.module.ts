import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import {
  EmojiFrequentlyService,
  EmojiSearch, PickerModule
} from "@ctrl/ngx-emoji-mart";
import { EmojiModule, EmojiService } from "@ctrl/ngx-emoji-mart/ngx-emoji";
import { MentionModule } from "angular-mentions";
import { Ng2SearchPipeModule } from "ng2-search-filter";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { AddMembersComponentComponent } from "./add-members-component/add-members-component.component";
import { AvatarComponent } from "./avatar/avatar.component";
import { BadgeComponent } from "./badge/badge.component";
import { BottomNavigationComponent } from "./bottom-navigation/bottom-navigation.component";
import { CallingScreenComponent } from "./calling-screen/calling-screen.component";
import { CometchatAngularUiKitComponent } from "./cometchat-angular-ui-kit.component";
import { CometchatDockedComponent } from "./cometchat-docked/cometchat-docked.component";
import { CometchatEmbeddedComponent } from "./cometchat-embedded/cometchat-embedded.component";
import { CometChatModule } from "./cometchat/cometchat.module";
import { ContactScreenComponent } from "./contact-screen/contact-screen.component";
import { ConversationHeaderComponent } from "./conversation-header/conversation-header.component";
import { ConversationScreenComponent } from "./conversation-screen/conversation-screen.component";
import { ConversationViewComponent } from "./conversation-view/conversation-view.component";
import { ConversationsListComponent } from "./conversations-list/conversations-list.component";
import { ConversationsScreenComponent } from "./conversations-screen/conversations-screen.component";
import { CreateGroupScreenComponent } from "./create-group-screen/create-group-screen.component";
import { EntityDetailsComponentComponent } from "./entity-details-component/entity-details-component.component";
import { FullScreenIframeComponent } from "./full-screen-iframe/full-screen-iframe.component";
import { GroupListComponent } from "./group-list/group-list.component";
import { GroupMemberListComponent } from "./group-member-list/group-member-list.component";
import { GroupScreenComponent } from "./group-screen/group-screen.component";
import { GroupViewComponent } from "./group-view/group-view.component";
import { LoginComponentComponent } from "./login-component/login-component.component";
import { MediaMessageComposerPreviewComponent } from "./media-message-composer-preview/media-message-composer-preview.component";
import { MediaMessageComposerComponent } from "./media-message-composer/media-message-composer.component";
import { MessageBubbleComponent } from "./message-bubble/message-bubble.component";
import { MessageComposerComponent } from "./message-composer/message-composer.component";
import { MessagesListComponent } from "./messages-list/messages-list.component";
import { PopUpWindowComponent } from "./pop-up-window/pop-up-window.component";
import { ProfileItemComponent } from "./profile-item/profile-item.component";
import { SafePipe } from "./safe.pipe";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { StatusIndicatorComponent } from "./status-indicator/status-indicator.component";
import { UnreadConversationListComponent } from "./unread-conversation-list/unread-conversation-list.component";
import { UnreadConversationViewComponent } from "./unread-conversation-view/unread-conversation-view.component";
import { ContactListComponent } from "./user-list/contact-list.component";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { UserViewComponent } from "./user-view/user-view.component";




@NgModule({
  declarations: [
    AvatarComponent,
    ContactListComponent,
    UserViewComponent,
    GroupViewComponent,
    GroupListComponent,
    ConversationsListComponent,
    ConversationViewComponent,
    BadgeComponent,
    BottomNavigationComponent,
    MessagesListComponent,
    MessageBubbleComponent,
    MessageComposerComponent,
    ConversationScreenComponent,
    ConversationHeaderComponent,
    SidebarComponent,
    MediaMessageComposerComponent,
    LoginComponentComponent,
    ProfileItemComponent,
    MediaMessageComposerPreviewComponent,
    EntityDetailsComponentComponent,
    CometchatEmbeddedComponent,
    UserProfileComponent,
    GroupMemberListComponent,
    CreateGroupScreenComponent,
    PopUpWindowComponent,
    AddMembersComponentComponent,
    CometchatDockedComponent,
    CallingScreenComponent,
    FullScreenIframeComponent,
    SafePipe,
    StatusIndicatorComponent,
    CometchatAngularUiKitComponent,
    ContactScreenComponent,
    ConversationsScreenComponent,
    GroupScreenComponent,
    UnreadConversationViewComponent,
    UnreadConversationListComponent,
  ],
  imports: [
    CommonModule,
    CometChatModule,
    FormsModule,
    EmojiModule,
    PickerModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    Ng2SearchPipeModule,
    MentionModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    NgxSkeletonLoaderModule,
    MatSnackBarModule,
  ],
  exports: [
    AvatarComponent,
    ContactListComponent,
    UserViewComponent,
    GroupViewComponent,
    GroupListComponent,
    ConversationsListComponent,
    ConversationViewComponent,
    BadgeComponent,
    BottomNavigationComponent,
    MessagesListComponent,
    MessageBubbleComponent,
    MessageComposerComponent,
    ConversationScreenComponent,
    ConversationHeaderComponent,
    SidebarComponent,
    MediaMessageComposerComponent,
    LoginComponentComponent,
    ProfileItemComponent,
    MediaMessageComposerPreviewComponent,
    EntityDetailsComponentComponent,
    CometchatEmbeddedComponent,
    UserProfileComponent,
    GroupMemberListComponent,
    CreateGroupScreenComponent,
    PopUpWindowComponent,
    AddMembersComponentComponent,
    CometchatDockedComponent,
    CallingScreenComponent,
    FullScreenIframeComponent,
    SafePipe,
    StatusIndicatorComponent,
    CometchatAngularUiKitComponent,
    ContactScreenComponent,
    ConversationsScreenComponent,
    GroupScreenComponent,
  ],
  providers: [EmojiFrequentlyService, EmojiService, EmojiSearch],
  bootstrap: [CometchatAngularUiKitComponent],
})
export class CometchatAngularUiKitModule { }
