import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CustomerprobabilityComponent } from "./customerprobability.component";

describe("CustomerprobabilityComponent", () => {
  let component: CustomerprobabilityComponent;
  let fixture: ComponentFixture<CustomerprobabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerprobabilityComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerprobabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
