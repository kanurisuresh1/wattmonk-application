import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { PestampComponent } from "../../pestamp/pestamp/pestamp.component";

describe("PestampComponent", () => {
  let component: PestampComponent;
  let fixture: ComponentFixture<PestampComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PestampComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PestampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
