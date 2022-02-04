import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ConfirmationsnackbarComponent } from "./confirmationsnackbar.component";

describe("ConfirmationsnackbarComponent", () => {
  let component: ConfirmationsnackbarComponent;
  let fixture: ComponentFixture<ConfirmationsnackbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmationsnackbarComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationsnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
