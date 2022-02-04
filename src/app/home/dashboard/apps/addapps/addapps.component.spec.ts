import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AddappsComponent } from "./addapps.component";

describe("AddappsComponent", () => {
  let component: AddappsComponent;
  let fixture: ComponentFixture<AddappsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddappsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddappsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
