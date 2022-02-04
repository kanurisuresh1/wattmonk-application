import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TasklistingdialogComponent } from "./tasklistingdialog.component";

describe("TasklistingdialogComponent", () => {
  let component: TasklistingdialogComponent;
  let fixture: ComponentFixture<TasklistingdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TasklistingdialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasklistingdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
