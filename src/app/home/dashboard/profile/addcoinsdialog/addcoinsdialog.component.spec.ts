import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddcoinsdialogComponent } from "./addcoinsdialog.component";

describe("AddcoinsdialogComponent", () => {
  let component: AddcoinsdialogComponent;
  let fixture: ComponentFixture<AddcoinsdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddcoinsdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddcoinsdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
