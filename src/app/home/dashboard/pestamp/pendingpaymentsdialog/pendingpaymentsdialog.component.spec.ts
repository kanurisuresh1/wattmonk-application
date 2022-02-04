import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PendingpaymentsdialogComponent } from "./pendingpaymentsdialog.component";

describe("PendingpaymentsdialogComponent", () => {
  let component: PendingpaymentsdialogComponent;
  let fixture: ComponentFixture<PendingpaymentsdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PendingpaymentsdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingpaymentsdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
