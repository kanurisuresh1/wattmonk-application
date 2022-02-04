import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddannouncementdialogComponent } from "./addannouncementdialog.component";

describe("AddannouncementdialogComponent", () => {
  let component: AddannouncementdialogComponent;
  let fixture: ComponentFixture<AddannouncementdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddannouncementdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddannouncementdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
