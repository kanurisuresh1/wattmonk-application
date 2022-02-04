import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { InvertermodelentryComponent } from "./invertermodelentry.component";

describe("InvertermodelentryComponent", () => {
  let component: InvertermodelentryComponent;
  let fixture: ComponentFixture<InvertermodelentryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InvertermodelentryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvertermodelentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
