import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignreportComponent } from "./designreport.component";

describe("DesignreportComponent", () => {
  let component: DesignreportComponent;
  let fixture: ComponentFixture<DesignreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesignreportComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
