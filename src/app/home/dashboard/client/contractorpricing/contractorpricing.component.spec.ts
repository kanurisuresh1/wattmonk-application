import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ContractorpricingComponent } from "./contractorpricing.component";

describe("ContractorpricingComponent", () => {
  let component: ContractorpricingComponent;
  let fixture: ComponentFixture<ContractorpricingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContractorpricingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractorpricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
