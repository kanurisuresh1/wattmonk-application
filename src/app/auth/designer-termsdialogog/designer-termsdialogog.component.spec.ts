import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignerTermsdialogogComponent } from "./designer-termsdialogog.component";

describe("DesignerTermsdialogogComponent", () => {
  let component: DesignerTermsdialogogComponent;
  let fixture: ComponentFixture<DesignerTermsdialogogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesignerTermsdialogogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignerTermsdialogogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
