import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignerprivacydialogComponent } from "./designerprivacydialog.component";

describe("DesignerprivacydialogComponent", () => {
  let component: DesignerprivacydialogComponent;
  let fixture: ComponentFixture<DesignerprivacydialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesignerprivacydialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignerprivacydialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
