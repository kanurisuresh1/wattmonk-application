import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ModulemodelentryComponent } from "./modulemodelentry.component";

describe("ModulemodelentryComponent", () => {
  let component: ModulemodelentryComponent;
  let fixture: ComponentFixture<ModulemodelentryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModulemodelentryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModulemodelentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
