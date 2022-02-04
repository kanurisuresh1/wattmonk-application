import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AssignreviewerdialogComponent } from "./assignreviewerdialog.component";

describe("AssignreviewerdialogComponent", () => {
  let component: AssignreviewerdialogComponent;
  let fixture: ComponentFixture<AssignreviewerdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssignreviewerdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignreviewerdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
