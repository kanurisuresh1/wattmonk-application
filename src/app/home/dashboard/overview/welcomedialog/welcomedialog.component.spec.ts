import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WelcomedialogComponent } from "./welcomedialog.component";

describe("WelcomedialogComponent", () => {
  let component: WelcomedialogComponent;
  let fixture: ComponentFixture<WelcomedialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WelcomedialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
