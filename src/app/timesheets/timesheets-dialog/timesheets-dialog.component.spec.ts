import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsDialogComponent } from './timesheets-dialog.component';

describe('TimesheetsDialogComponent', () => {
  let component: TimesheetsDialogComponent;
  let fixture: ComponentFixture<TimesheetsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
