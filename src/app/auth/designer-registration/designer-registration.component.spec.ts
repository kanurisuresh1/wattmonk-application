import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignerRegistrationComponent } from "./designer-registration.component";

describe("DesignerRegistrationComponent", () => {
  let component: DesignerRegistrationComponent;
  let fixture: ComponentFixture<DesignerRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesignerRegistrationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignerRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
