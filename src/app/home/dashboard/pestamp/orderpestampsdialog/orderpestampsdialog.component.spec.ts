import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { OrderpestampsdialogComponent } from "./orderpestampsdialog.component";

describe("OrderpestampsdialogComponent", () => {
  let component: OrderpestampsdialogComponent;
  let fixture: ComponentFixture<OrderpestampsdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OrderpestampsdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderpestampsdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
