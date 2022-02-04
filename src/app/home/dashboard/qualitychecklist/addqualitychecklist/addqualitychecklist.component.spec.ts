import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddqualitychecklistComponent } from "./addqualitychecklist.component";

describe("AddqualitychecklistComponent", () => {
  let component: AddqualitychecklistComponent;
  let fixture: ComponentFixture<AddqualitychecklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddqualitychecklistComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddqualitychecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
