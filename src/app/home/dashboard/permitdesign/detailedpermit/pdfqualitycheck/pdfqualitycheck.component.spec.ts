import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfqualitycheckComponent } from './pdfqualitycheck.component';

describe('PdfqualitycheckComponent', () => {
  let component: PdfqualitycheckComponent;
  let fixture: ComponentFixture<PdfqualitycheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdfqualitycheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfqualitycheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
