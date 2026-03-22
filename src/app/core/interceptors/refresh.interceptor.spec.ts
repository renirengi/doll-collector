import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { refreshInterceptor } from './refresh.interceptor';
import { TokenService } from '../services/token.services';
import { signal } from '@angular/core';

describe('refreshInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;

  const tokenSignal = signal<string | null | undefined>('old-token');

  beforeEach(() => {
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['refreshTokenCall', 'clearToken'], {
      token: tokenSignal,
      refreshToken: 'valid-refresh-token'
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([refreshInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: tokenServiceSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);

    tokenSignal.set('old-token');
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should handle 401 and retry the request with a new token', fakeAsync(() => {
    const newToken = 'new-access-token';
    tokenServiceSpy.refreshTokenCall.and.returnValue(Promise.resolve(newToken));

    httpClient.get('/api/data').subscribe();

    const firstReq = httpTestingController.expectOne('/api/data');
    firstReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });


    flush();

    expect(tokenServiceSpy.refreshTokenCall).toHaveBeenCalled();

    tokenSignal.set(newToken);
    flush();

    const retryReq = httpTestingController.expectOne('/api/data');
    expect(retryReq.request.headers.get('Authorization')).toBe(`Bearer ${newToken}`);

    retryReq.flush({ success: true });
  }));

  it('should queue multiple 401 requests and retry them all after one refresh', fakeAsync(() => {
    const newToken = 'shared-new-token';
    tokenServiceSpy.refreshTokenCall.and.returnValue(Promise.resolve(newToken));

    httpClient.get('/api/1').subscribe();
    httpClient.get('/api/2').subscribe();

    const req1 = httpTestingController.expectOne('/api/1');
    const req2 = httpTestingController.expectOne('/api/2');

    req1.flush('Err', { status: 401, statusText: 'UA' });
    req2.flush('Err', { status: 401, statusText: 'UA' });

    flush();

    expect(tokenServiceSpy.refreshTokenCall).toHaveBeenCalledTimes(1);

    tokenSignal.set(newToken);
    flush();

    const retry1 = httpTestingController.expectOne('/api/1');
    const retry2 = httpTestingController.expectOne('/api/2');

    expect(retry1.request.headers.get('Authorization')).toBe(`Bearer ${newToken}`);
    expect(retry2.request.headers.get('Authorization')).toBe(`Bearer ${newToken}`);

    retry1.flush({});
    retry2.flush({});
  }));
});
