import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SharepermitdesigndialogComponent } from "./sharepermitdesigndialog.component";

describe("SharepermitdesigndialogComponent", () => {
  let component: SharepermitdesigndialogComponent;
  let fixture: ComponentFixture<SharepermitdesigndialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharepermitdesigndialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharepermitdesigndialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
