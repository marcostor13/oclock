import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { QrGenerator } from './qr-generator';

describe('QrGenerator', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrGenerator],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(QrGenerator);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
