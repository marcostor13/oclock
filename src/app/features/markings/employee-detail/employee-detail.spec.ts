import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { EmployeeDetail } from './employee-detail';

describe('EmployeeDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDetail],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EmployeeDetail);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
