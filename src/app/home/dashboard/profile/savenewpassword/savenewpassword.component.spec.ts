import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SavenewpasswordComponent } from "./savenewpassword.component";

describe("SavenewpasswordComponent", () => {
  let component: SavenewpasswordComponent;
  let fixture: ComponentFixture<SavenewpasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavenewpasswordComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavenewpasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
