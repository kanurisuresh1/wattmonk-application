import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AssigndesignmanagerdialogComponent } from "./assigndesignmanagerdialog.component";

describe("AssigndesignmanagerdialogComponent", () => {
  let component: AssigndesignmanagerdialogComponent;
  let fixture: ComponentFixture<AssigndesignmanagerdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssigndesignmanagerdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssigndesignmanagerdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
