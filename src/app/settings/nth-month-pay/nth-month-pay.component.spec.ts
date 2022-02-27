import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NthMonthPayComponent } from './nth-month-pay.component';

describe('NthMonthPayComponent', () => {
  let component: NthMonthPayComponent;
  let fixture: ComponentFixture<NthMonthPayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NthMonthPayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NthMonthPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
