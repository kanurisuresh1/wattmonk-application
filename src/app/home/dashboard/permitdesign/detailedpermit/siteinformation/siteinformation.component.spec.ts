import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SiteinformationComponent } from "./siteinformation.component";

describe("SiteinformationComponent", () => {
  let component: SiteinformationComponent;
  let fixture: ComponentFixture<SiteinformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SiteinformationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
