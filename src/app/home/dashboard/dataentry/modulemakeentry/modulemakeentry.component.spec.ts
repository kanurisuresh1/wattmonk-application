import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ModulemakeentryComponent } from "./modulemakeentry.component";

describe("ModulemakeentryComponent", () => {
  let component: ModulemakeentryComponent;
  let fixture: ComponentFixture<ModulemakeentryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModulemakeentryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModulemakeentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
