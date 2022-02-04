import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { OrderpermitdesigndialogComponent } from "./orderpermitdesigndialog.component";

describe("OrderpermitdesigndialogComponent", () => {
  let component: OrderpermitdesigndialogComponent;
  let fixture: ComponentFixture<OrderpermitdesigndialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OrderpermitdesigndialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderpermitdesigndialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
