import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesigndialogComponent } from "./designdialog.component";

describe("DesigndialogComponent", () => {
  let component: DesigndialogComponent;
  let fixture: ComponentFixture<DesigndialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesigndialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesigndialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
