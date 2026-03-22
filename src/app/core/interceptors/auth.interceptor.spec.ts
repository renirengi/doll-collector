import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { TokenService } from '../services/token.services';
import { signal } from '@angular/core';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;

  const tokenSignal = signal<string | null | undefined>(undefined);

  beforeEach(() => {
    tokenServiceSpy = jasmine.createSpyObj('TokenService', [], {
      token: tokenSignal,
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: tokenServiceSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    tokenSignal.set(undefined);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should wait for token to be defined and add Authorization header', fakeAsync(() => {
    const mockToken = 'test-token-123';

    httpClient.get('/api/test').subscribe();

    httpTestingController.expectNone('/api/test');

    tokenSignal.set(mockToken);

    flush();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${mockToken}`,
    );
    req.flush({});
  }));

  it('should not add Authorization header if token is null', fakeAsync(() => {
    tokenSignal.set(null);

    httpClient.get('/api/test').subscribe();

    flush();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  }));

  it('should take only the first defined token and complete', fakeAsync(() => {
    tokenSignal.set('first-token');

    httpClient.get('/api/test').subscribe();

    flush();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer first-token');

    tokenSignal.set('second-token');

    req.flush({});
  }));
});
