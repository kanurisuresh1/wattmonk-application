import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddminpermitdesigndialogComponent } from "./addminpermitdesigndialog.component";

describe("AddminpermitdesigndialogComponent", () => {
  let component: AddminpermitdesigndialogComponent;
  let fixture: ComponentFixture<AddminpermitdesigndialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddminpermitdesigndialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddminpermitdesigndialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
