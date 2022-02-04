import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EditqualitychecklistComponent } from "./editqualitychecklist.component";

describe("EditqualitychecklistComponent", () => {
  let component: EditqualitychecklistComponent;
  let fixture: ComponentFixture<EditqualitychecklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditqualitychecklistComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditqualitychecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
