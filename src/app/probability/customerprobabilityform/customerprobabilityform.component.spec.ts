import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CustomerprobabilityformComponent } from "./customerprobabilityform.component";

describe("CustomerprobabilityformComponent", () => {
  let component: CustomerprobabilityformComponent;
  let fixture: ComponentFixture<CustomerprobabilityformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerprobabilityformComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerprobabilityformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
