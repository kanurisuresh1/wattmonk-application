import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PaymentfailedComponent } from "./paymentfailed.component";

describe("PaymentfailedComponent", () => {
  let component: PaymentfailedComponent;
  let fixture: ComponentFixture<PaymentfailedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentfailedComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentfailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
