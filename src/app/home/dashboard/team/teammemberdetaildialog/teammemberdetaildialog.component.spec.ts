import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TeammemberdetaildialogComponent } from "./teammemberdetaildialog.component";

describe("TeammemberdetaildialogComponent", () => {
  let component: TeammemberdetaildialogComponent;
  let fixture: ComponentFixture<TeammemberdetaildialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeammemberdetaildialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeammemberdetaildialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
