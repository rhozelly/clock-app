import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeInComponent } from './time-in.component';

describe('TimeInComponent', () => {
  let component: TimeInComponent;
  let fixture: ComponentFixture<TimeInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeInComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
