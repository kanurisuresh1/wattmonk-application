import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AssigndesigndialogComponent } from "./assigndesigndialog.component";

describe("AssigndesigndialogComponent", () => {
  let component: AssigndesigndialogComponent;
  let fixture: ComponentFixture<AssigndesigndialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssigndesigndialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssigndesigndialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
