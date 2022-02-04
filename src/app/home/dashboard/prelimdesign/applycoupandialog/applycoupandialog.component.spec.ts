import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ApplycoupandialogComponent } from "./applycoupandialog.component";

describe("ApplycoupandialogComponent", () => {
  let component: ApplycoupandialogComponent;
  let fixture: ComponentFixture<ApplycoupandialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplycoupandialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplycoupandialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
