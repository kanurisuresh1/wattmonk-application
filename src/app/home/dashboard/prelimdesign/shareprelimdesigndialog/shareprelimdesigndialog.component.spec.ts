import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ShareprelimdesigndialogComponent } from "./shareprelimdesigndialog.component";

describe("ShareprelimdesigndialogComponent", () => {
  let component: ShareprelimdesigndialogComponent;
  let fixture: ComponentFixture<ShareprelimdesigndialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareprelimdesigndialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareprelimdesigndialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
