import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { LocationmarkingComponent } from "./locationmarking.component";

describe("LocationmarkingComponent", () => {
  let component: LocationmarkingComponent;
  let fixture: ComponentFixture<LocationmarkingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LocationmarkingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationmarkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
