import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AssignpeengineersComponent } from "./assignpeengineers.component";

describe("AssignpeengineersComponent", () => {
  let component: AssignpeengineersComponent;
  let fixture: ComponentFixture<AssignpeengineersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssignpeengineersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignpeengineersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
