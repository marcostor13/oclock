import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MarkingsList } from './markings-list';

describe('MarkingsList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkingsList],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MarkingsList);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
