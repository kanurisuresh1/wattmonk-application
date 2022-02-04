import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ElectricalinformationComponent } from "./electricalinformation.component";

describe("ElectricalinformationComponent", () => {
  let component: ElectricalinformationComponent;
  let fixture: ComponentFixture<ElectricalinformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ElectricalinformationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectricalinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
