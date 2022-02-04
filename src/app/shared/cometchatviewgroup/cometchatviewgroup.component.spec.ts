import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CometchatviewgroupComponent } from "./cometchatviewgroup.component";

describe("CometchatviewgroupComponent", () => {
  let component: CometchatviewgroupComponent;
  let fixture: ComponentFixture<CometchatviewgroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CometchatviewgroupComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CometchatviewgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
