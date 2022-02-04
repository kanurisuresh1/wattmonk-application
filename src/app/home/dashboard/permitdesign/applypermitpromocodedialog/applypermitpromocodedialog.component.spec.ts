import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ApplypermitpromocodedialogComponent } from "./applypermitpromocodedialog.component";

describe("ApplypermitpromocodedialogComponent", () => {
  let component: ApplypermitpromocodedialogComponent;
  let fixture: ComponentFixture<ApplypermitpromocodedialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplypermitpromocodedialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplypermitpromocodedialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
