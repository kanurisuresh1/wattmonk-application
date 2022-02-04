import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchchatdialogComponent } from "./searchchatdialog.component";

describe("SearchchatdialogComponent", () => {
  let component: SearchchatdialogComponent;
  let fixture: ComponentFixture<SearchchatdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchchatdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchchatdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
