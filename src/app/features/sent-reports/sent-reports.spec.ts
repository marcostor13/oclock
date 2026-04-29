import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { SentReports } from './sent-reports';

describe('SentReports', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentReports],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SentReports);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
