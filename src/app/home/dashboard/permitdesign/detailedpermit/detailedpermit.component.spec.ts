import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DetailedpermitComponent } from "./detailedpermit.component";

describe("DetailedpermitComponent", () => {
  let component: DetailedpermitComponent;
  let fixture: ComponentFixture<DetailedpermitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailedpermitComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedpermitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
