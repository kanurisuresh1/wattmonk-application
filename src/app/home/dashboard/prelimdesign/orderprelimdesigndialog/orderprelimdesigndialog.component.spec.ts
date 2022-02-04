import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { OrderprelimdesigndialogComponent } from "./orderprelimdesigndialog.component";

describe("OrderprelimdesigndialogComponent", () => {
  let component: OrderprelimdesigndialogComponent;
  let fixture: ComponentFixture<OrderprelimdesigndialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OrderprelimdesigndialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderprelimdesigndialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
