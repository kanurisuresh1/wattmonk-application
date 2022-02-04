import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { QualitychecklistComponent } from "./qualitychecklist.component";

describe("QualitychecklistComponent", () => {
  let component: QualitychecklistComponent;
  let fixture: ComponentFixture<QualitychecklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QualitychecklistComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualitychecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
