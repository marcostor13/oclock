import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ClockPage } from './clock-page';

describe('ClockPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClockPage],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ClockPage);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
