import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddrowlistComponent } from "./addrowlist.component";

describe("AddrowlistComponent", () => {
  let component: AddrowlistComponent;
  let fixture: ComponentFixture<AddrowlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddrowlistComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddrowlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
