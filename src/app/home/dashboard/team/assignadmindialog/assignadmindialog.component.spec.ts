import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AssignadmindialogComponent } from "./assignadmindialog.component";

describe("AssignadmindialogComponent", () => {
  let component: AssignadmindialogComponent;
  let fixture: ComponentFixture<AssignadmindialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssignadmindialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignadmindialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
