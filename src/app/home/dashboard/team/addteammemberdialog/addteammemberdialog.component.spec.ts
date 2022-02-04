import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddteammemberdialogComponent } from "./addteammemberdialog.component";

describe("AddteammemberdialogComponent", () => {
  let component: AddteammemberdialogComponent;
  let fixture: ComponentFixture<AddteammemberdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddteammemberdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddteammemberdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
