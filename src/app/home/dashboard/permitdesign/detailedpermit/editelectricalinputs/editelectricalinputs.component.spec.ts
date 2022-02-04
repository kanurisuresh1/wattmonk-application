import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditelectricalinputsComponent } from './editelectricalinputs.component';

describe('EditelectricalinputsComponent', () => {
  let component: EditelectricalinputsComponent;
  let fixture: ComponentFixture<EditelectricalinputsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditelectricalinputsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditelectricalinputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
