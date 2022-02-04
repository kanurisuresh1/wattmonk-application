import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddprelimproposaldialogComponent } from "./addprelimproposaldialog.component";

describe("AddprelimproposaldialogComponent", () => {
  let component: AddprelimproposaldialogComponent;
  let fixture: ComponentFixture<AddprelimproposaldialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddprelimproposaldialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddprelimproposaldialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
