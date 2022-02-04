import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddguestproposaldialogComponent } from "./addguestproposaldialog.component";

describe("AddguestproposaldialogComponent", () => {
  let component: AddguestproposaldialogComponent;
  let fixture: ComponentFixture<AddguestproposaldialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddguestproposaldialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddguestproposaldialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
