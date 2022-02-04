import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PrivacydialogComponent } from "./privacydialog.component";

describe("PrivacydialogComponent", () => {
  let component: PrivacydialogComponent;
  let fixture: ComponentFixture<PrivacydialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrivacydialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacydialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
