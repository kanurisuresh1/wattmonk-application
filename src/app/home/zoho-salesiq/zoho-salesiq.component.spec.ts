import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ZohoSalesiqComponent } from "./zoho-salesiq.component";

describe("ZohoSalesiqComponent", () => {
  let component: ZohoSalesiqComponent;
  let fixture: ComponentFixture<ZohoSalesiqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ZohoSalesiqComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZohoSalesiqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
