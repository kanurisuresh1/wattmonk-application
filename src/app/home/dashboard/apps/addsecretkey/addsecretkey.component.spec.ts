import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddsecretkeyComponent } from "./addsecretkey.component";

describe("AddsecretkeyComponent", () => {
  let component: AddsecretkeyComponent;
  let fixture: ComponentFixture<AddsecretkeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddsecretkeyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddsecretkeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
