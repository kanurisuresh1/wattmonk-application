import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { RegisterguestComponent } from "./registerguest.component";

describe("RegisterguestComponent", () => {
  let component: RegisterguestComponent;
  let fixture: ComponentFixture<RegisterguestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterguestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterguestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
