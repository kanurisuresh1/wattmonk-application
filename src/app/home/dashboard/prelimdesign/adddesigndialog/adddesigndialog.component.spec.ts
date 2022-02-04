import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AdddesigndialogComponent } from "./adddesigndialog.component";

describe("AdddesigndialogComponent", () => {
  let component: AdddesigndialogComponent;
  let fixture: ComponentFixture<AdddesigndialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdddesigndialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdddesigndialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
