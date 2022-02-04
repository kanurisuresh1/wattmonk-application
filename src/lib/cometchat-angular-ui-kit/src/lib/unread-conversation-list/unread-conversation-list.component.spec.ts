import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { UnreadConversationListComponent } from "./unread-conversation-list.component";

describe("UnreadConversationListComponent", () => {
  let component: UnreadConversationListComponent;
  let fixture: ComponentFixture<UnreadConversationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UnreadConversationListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnreadConversationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
