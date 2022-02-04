import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AllcontractorsComponent } from "./allcontractors.component";

describe("AllcontractorsComponent", () => {
  let component: AllcontractorsComponent;
  let fixture: ComponentFixture<AllcontractorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AllcontractorsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllcontractorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
