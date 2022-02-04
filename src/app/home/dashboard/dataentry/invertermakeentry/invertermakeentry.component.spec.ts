import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { InvertermakeentryComponent } from "./invertermakeentry.component";

describe("InvertermakeentryComponent", () => {
  let component: InvertermakeentryComponent;
  let fixture: ComponentFixture<InvertermakeentryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InvertermakeentryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvertermakeentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
