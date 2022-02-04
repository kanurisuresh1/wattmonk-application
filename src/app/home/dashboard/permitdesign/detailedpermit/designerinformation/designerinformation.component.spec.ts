import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignerinformationComponent } from "./designerinformation.component";

describe("DesignerinformationComponent", () => {
  let component: DesignerinformationComponent;
  let fixture: ComponentFixture<DesignerinformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesignerinformationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignerinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
