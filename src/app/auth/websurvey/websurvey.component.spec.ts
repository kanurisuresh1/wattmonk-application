import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WebsurveyComponent } from "./websurvey.component";

describe("WebsurveyComponent", () => {
  let component: WebsurveyComponent;
  let fixture: ComponentFixture<WebsurveyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebsurveyComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
