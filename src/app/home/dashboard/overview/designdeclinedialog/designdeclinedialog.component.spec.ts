import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesigndeclinedialogComponent } from "./designdeclinedialog.component";

describe("DesigndeclinedialogComponent", () => {
  let component: DesigndeclinedialogComponent;
  let fixture: ComponentFixture<DesigndeclinedialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesigndeclinedialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesigndeclinedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
