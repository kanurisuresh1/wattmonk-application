import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ContractordetaildialogComponent } from "./contractordetaildialog.component";

describe("ContractordetaildialogComponent", () => {
  let component: ContractordetaildialogComponent;
  let fixture: ComponentFixture<ContractordetaildialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContractordetaildialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractordetaildialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
