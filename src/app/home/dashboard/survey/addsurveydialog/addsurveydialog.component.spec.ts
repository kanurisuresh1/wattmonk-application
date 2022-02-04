import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddsurveydialogComponent } from "./addsurveydialog.component";

describe("AddsurveydialogComponent", () => {
  let component: AddsurveydialogComponent;
  let fixture: ComponentFixture<AddsurveydialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddsurveydialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddsurveydialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
