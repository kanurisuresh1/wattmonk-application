import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesigneroverviewComponent } from "./designeroverview.component";

describe("DesigneroverviewComponent", () => {
  let component: DesigneroverviewComponent;
  let fixture: ComponentFixture<DesigneroverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesigneroverviewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesigneroverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
