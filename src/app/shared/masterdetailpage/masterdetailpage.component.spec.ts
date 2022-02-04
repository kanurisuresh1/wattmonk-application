import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { MasterdetailpageComponent } from "./masterdetailpage.component";

describe("MasterdetailpageComponent", () => {
  let component: MasterdetailpageComponent;
  let fixture: ComponentFixture<MasterdetailpageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MasterdetailpageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterdetailpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
