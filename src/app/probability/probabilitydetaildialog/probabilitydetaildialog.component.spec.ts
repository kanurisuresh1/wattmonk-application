import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ProbabilitydetaildialogComponent } from "./probabilitydetaildialog.component";

describe("ProbabilitydetaildialogComponent", () => {
  let component: ProbabilitydetaildialogComponent;
  let fixture: ComponentFixture<ProbabilitydetaildialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProbabilitydetaildialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProbabilitydetaildialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
