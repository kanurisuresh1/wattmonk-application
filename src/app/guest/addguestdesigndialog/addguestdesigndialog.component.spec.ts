import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddguestdesigndialogComponent } from "./addguestdesigndialog.component";

describe("AddguestdesigndialogComponent", () => {
  let component: AddguestdesigndialogComponent;
  let fixture: ComponentFixture<AddguestdesigndialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddguestdesigndialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddguestdesigndialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
