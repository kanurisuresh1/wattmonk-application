import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AppsdetailpageComponent } from "./appsdetailpage.component";

describe("AppsdetailpageComponent", () => {
  let component: AppsdetailpageComponent;
  let fixture: ComponentFixture<AppsdetailpageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppsdetailpageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppsdetailpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
