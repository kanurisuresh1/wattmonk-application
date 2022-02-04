import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TransactionFilterComponentComponent } from "./transaction-filter-component.component";

describe("TransactionFilterComponentComponent", () => {
  let component: TransactionFilterComponentComponent;
  let fixture: ComponentFixture<TransactionFilterComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionFilterComponentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionFilterComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
