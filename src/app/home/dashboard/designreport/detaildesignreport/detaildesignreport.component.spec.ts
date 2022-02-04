import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DetaildesignreportComponent } from "./detaildesignreport.component";

describe("DetaildesignreportComponent", () => {
  let component: DetaildesignreportComponent;
  let fixture: ComponentFixture<DetaildesignreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetaildesignreportComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetaildesignreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
