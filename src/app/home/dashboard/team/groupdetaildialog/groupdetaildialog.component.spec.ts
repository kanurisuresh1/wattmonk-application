import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { GroupdetaildialogComponent } from "./groupdetaildialog.component";

describe("GroupdetaildialogComponent", () => {
  let component: GroupdetaildialogComponent;
  let fixture: ComponentFixture<GroupdetaildialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupdetaildialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupdetaildialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
