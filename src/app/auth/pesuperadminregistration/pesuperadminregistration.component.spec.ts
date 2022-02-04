import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PesuperadminregistrationComponent } from "./pesuperadminregistration.component";

describe("PesuperadminregistrationComponent", () => {
  let component: PesuperadminregistrationComponent;
  let fixture: ComponentFixture<PesuperadminregistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PesuperadminregistrationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PesuperadminregistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
