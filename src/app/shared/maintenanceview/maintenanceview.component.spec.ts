import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { MaintenanceviewComponent } from "./maintenanceview.component";

describe("MaintenanceviewComponent", () => {
  let component: MaintenanceviewComponent;
  let fixture: ComponentFixture<MaintenanceviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MaintenanceviewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
