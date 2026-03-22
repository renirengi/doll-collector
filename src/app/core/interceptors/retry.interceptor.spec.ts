import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { retryInterceptor } from './retry.interceptor';

describe('retryInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([retryInterceptor])),
        provideHttpClientTesting(),
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retry failed requests 2 times and then succeed', fakeAsync(() => {
    let responseData: any;

    httpClient.get('/api/unstable').subscribe(data => responseData = data);

    const req1 = httpTestingController.expectOne('/api/unstable');
    req1.error(new ProgressEvent('Network error'));

    tick(1000);

    const req2 = httpTestingController.expectOne('/api/unstable');
    req2.error(new ProgressEvent('Network error'));

    tick(2000);

    const req3 = httpTestingController.expectOne('/api/unstable');
    req3.flush({ success: true });

    expect(responseData).toEqual({ success: true });
  }));

  it('should fail after 2 retries if the error persists', fakeAsync(() => {
    let errorMessage: string | undefined;

    httpClient.get('/api/broken').subscribe({
      error: (err) => errorMessage = 'Failed'
    });

    for (let i = 1; i <= 3; i++) {
      const req = httpTestingController.expectOne('/api/broken');
      req.error(new ProgressEvent('Error'));
      if (i < 3) tick(i * 1000);
    }

    expect(errorMessage).toBe('Failed');
  }));
});
