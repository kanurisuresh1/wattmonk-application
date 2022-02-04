import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ActivitybarComponent } from "./activitybar.component";

describe("ActivitybarComponent", () => {
  let component: ActivitybarComponent;
  let fixture: ComponentFixture<ActivitybarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivitybarComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitybarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
