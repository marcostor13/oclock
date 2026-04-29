import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReportsList } from './reports-list';

describe('ReportsList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsList],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ReportsList);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
