import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { StructuralinformationComponent } from "./structuralinformation.component";

describe("StructuralinformationComponent", () => {
  let component: StructuralinformationComponent;
  let fixture: ComponentFixture<StructuralinformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StructuralinformationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuralinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
