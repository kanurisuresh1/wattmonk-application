import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { GeneralinformationComponent } from "./generalinformation.component";

describe("GeneralinformationComponent", () => {
  let component: GeneralinformationComponent;
  let fixture: ComponentFixture<GeneralinformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralinformationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
