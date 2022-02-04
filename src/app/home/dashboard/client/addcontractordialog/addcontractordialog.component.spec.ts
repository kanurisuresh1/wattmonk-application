import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddcontractordialogComponent } from "./addcontractordialog.component";

describe("AddcontractordialogComponent", () => {
  let component: AddcontractordialogComponent;
  let fixture: ComponentFixture<AddcontractordialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddcontractordialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddcontractordialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
