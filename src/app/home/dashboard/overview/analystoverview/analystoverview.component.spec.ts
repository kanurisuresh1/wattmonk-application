import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AnalystoverviewComponent } from "./analystoverview.component";

describe("AnalystoverviewComponent", () => {
  let component: AnalystoverviewComponent;
  let fixture: ComponentFixture<AnalystoverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AnalystoverviewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalystoverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
