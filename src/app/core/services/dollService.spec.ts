import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DollService } from './dollService';

describe('DollService', () => {
  let service: DollService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DollService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DollService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', fakeAsync(() => {
    TestBed.flushEffects();
    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:3000/dolls',
    );
    req.flush([]);
    expect(service).toBeTruthy();
  }));

  it('should update filters and trigger new request', fakeAsync(() => {
    TestBed.flushEffects();
    const initialReq = httpMock.expectOne(
      (r) => r.url === 'http://localhost:3000/dolls',
    );
    initialReq.flush([]);

    service.updateFilters({ brand: 'Kurhn' });
    TestBed.flushEffects();
    tick();

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:3000/dolls' &&
        r.params.get('brand') === 'Kurhn',
    );

    req.flush([]);
    tick();
  }));

  it('should append dolls when loading more', fakeAsync(() => {
    TestBed.flushEffects();
    const initialReq = httpMock.expectOne(
      (r) => r.url === 'http://localhost:3000/dolls',
    );
    initialReq.flush([{ id: 1, name: 'D1' }], {
      headers: { 'X-Total-Count': '10' },
    });
    tick();

    service.loadMoreDolls();
    TestBed.flushEffects();
    tick();

    const req = httpMock.expectOne((r) => r.params.get('_page') === '2');
    req.flush([{ id: 2, name: 'D2' }]);
    tick();

    expect(service.dolls().length).toBe(2);
  }));

  it('should handle error when loading dolls', fakeAsync(() => {
    TestBed.flushEffects();
    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:3000/dolls',
    );
    req.error(new ProgressEvent('Network error'));
    tick();

    expect(service.isLoading()).toBe(false);
  }));
});
