import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AdminoverviewComponent } from "./adminoverview.component";

describe("AdminoverviewComponent", () => {
  let component: AdminoverviewComponent;
  let fixture: ComponentFixture<AdminoverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminoverviewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminoverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
