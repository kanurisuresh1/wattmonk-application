import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AssignsurveydialogComponent } from "./assignsurveydialog.component";

describe("AssignsurveydialogComponent", () => {
  let component: AssignsurveydialogComponent;
  let fixture: ComponentFixture<AssignsurveydialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssignsurveydialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignsurveydialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
