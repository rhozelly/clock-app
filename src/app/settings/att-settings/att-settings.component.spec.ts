import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttSettingsComponent } from './att-settings.component';

describe('AttSettingsComponent', () => {
  let component: AttSettingsComponent;
  let fixture: ComponentFixture<AttSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
