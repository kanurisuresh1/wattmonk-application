import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesigntrackerComponent } from "./designtracker.component";

describe("DesigntrackerComponent", () => {
  let component: DesigntrackerComponent;
  let fixture: ComponentFixture<DesigntrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesigntrackerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesigntrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
