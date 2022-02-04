import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { UnreadConversationViewComponent } from "./unread-conversation-view.component";

describe("UnreadConversationViewComponent", () => {
  let component: UnreadConversationViewComponent;
  let fixture: ComponentFixture<UnreadConversationViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UnreadConversationViewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnreadConversationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
