import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CustomerdesignComponent } from "./customerdesign.component";

describe("CustomerdesignComponent", () => {
  let component: CustomerdesignComponent;
  let fixture: ComponentFixture<CustomerdesignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerdesignComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerdesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
