import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TransferjobsComponent } from "./transferjobs.component";

describe("TransferjobsComponent", () => {
  let component: TransferjobsComponent;
  let fixture: ComponentFixture<TransferjobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransferjobsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferjobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
