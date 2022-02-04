import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SurveyoroverviewComponent } from "./surveyoroverview.component";

describe("SurveyoroverviewComponent", () => {
  let component: SurveyoroverviewComponent;
  let fixture: ComponentFixture<SurveyoroverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SurveyoroverviewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyoroverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
