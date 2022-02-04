import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermitplanuploaderComponent } from './permitplanuploader.component';

describe('PermitplanuploaderComponent', () => {
  let component: PermitplanuploaderComponent;
  let fixture: ComponentFixture<PermitplanuploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermitplanuploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermitplanuploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
