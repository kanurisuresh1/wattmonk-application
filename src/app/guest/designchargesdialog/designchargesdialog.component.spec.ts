import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DesignchargesdialogComponent } from "./designchargesdialog.component";

describe("DesignchargesdialogComponent", () => {
  let component: DesignchargesdialogComponent;
  let fixture: ComponentFixture<DesignchargesdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesignchargesdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignchargesdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
