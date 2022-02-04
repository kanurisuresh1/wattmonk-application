import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddpestampdialogComponent } from "./addpestampdialog.component";

describe("AddpestampdialogComponent", () => {
  let component: AddpestampdialogComponent;
  let fixture: ComponentFixture<AddpestampdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddpestampdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddpestampdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
