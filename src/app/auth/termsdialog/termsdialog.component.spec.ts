import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TermsdialogComponent } from "./termsdialog.component";

describe("TermsdialogComponent", () => {
  let component: TermsdialogComponent;
  let fixture: ComponentFixture<TermsdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TermsdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
