import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PeengineeroverviewComponent } from "./peengineeroverview.component";

describe("PeengineeroverviewComponent", () => {
  let component: PeengineeroverviewComponent;
  let fixture: ComponentFixture<PeengineeroverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PeengineeroverviewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeengineeroverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
