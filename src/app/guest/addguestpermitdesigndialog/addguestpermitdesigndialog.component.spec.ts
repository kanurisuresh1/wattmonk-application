import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddguestpermitdesigndialogComponent } from "./addguestpermitdesigndialog.component";

describe("AddguestpermitdesigndialogComponent", () => {
  let component: AddguestpermitdesigndialogComponent;
  let fixture: ComponentFixture<AddguestpermitdesigndialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddguestpermitdesigndialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddguestpermitdesigndialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
