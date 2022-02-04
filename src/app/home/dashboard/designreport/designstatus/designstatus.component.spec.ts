import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignstatusComponent } from "./designstatus.component";

describe("DesignstatusComponent", () => {
  let component: DesignstatusComponent;
  let fixture: ComponentFixture<DesignstatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesignstatusComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
