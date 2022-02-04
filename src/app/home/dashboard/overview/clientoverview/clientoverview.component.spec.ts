import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ClientoverviewComponent } from "./clientoverview.component";

describe("AdminoverviewComponent", () => {
  let component: ClientoverviewComponent;
  let fixture: ComponentFixture<ClientoverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClientoverviewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientoverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
