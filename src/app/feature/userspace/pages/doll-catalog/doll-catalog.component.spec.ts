import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DollCatalogComponent } from './doll-catalog.component';
import { DollService } from '../../../../core/services/dollService';
import { ActivatedRoute } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';

class MockDollService {
  public isLoading = signal(false);
  public hasMore = signal(true);
  public totalCount = signal(0);
  public dolls = signal([]);
  public filters = signal({ _page: 1, _limit: 12 });

  public setRawFilters = () => {};
  public loadMoreDolls = () => {};
  public updateFilters = () => {};
}

class MockActivatedRoute {
  private paramsSubject = new BehaviorSubject({
    manufacturer: 'Mattel',
    brand: 'Barbie',
  });
  public params = this.paramsSubject.asObservable();

  public emitParams(params: any) {
    this.paramsSubject.next(params);
  }
}

class MockIntersectionObserver {
  observe = () => {};
  disconnect = () => {};
  unobserve = () => {};
}

describe('DollCatalogComponent', () => {
  let component: DollCatalogComponent;
  let fixture: ComponentFixture<DollCatalogComponent>;
  let dollService: DollService;
  let route: MockActivatedRoute;

  beforeEach(async () => {
    (window as any).IntersectionObserver = MockIntersectionObserver;

    await TestBed.configureTestingModule({
      imports: [DollCatalogComponent],
      providers: [
        { provide: DollService, useClass: MockDollService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        provideAnimationsAsync('noop'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DollCatalogComponent);
    component = fixture.componentInstance;
    dollService = TestBed.inject(DollService);
    route = TestBed.inject(ActivatedRoute) as unknown as MockActivatedRoute;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call setRawFilters with route params on initialization', () => {
    const spy = spyOn(dollService, 'setRawFilters');

    const newFixture = TestBed.createComponent(DollCatalogComponent);
    newFixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        manufacturer: 'Mattel',
        brand: 'Barbie',
      }),
    );
  });

  it('should update filters when route params change', fakeAsync(() => {
    const spy = spyOn(dollService, 'setRawFilters');
    fixture.detectChanges();

    route.emitParams({ manufacturer: 'Kurhn', brand: 'Kurhn-brand' });
    tick();

    expect(spy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        manufacturer: 'Kurhn',
        brand: 'Kurhn-brand',
      }),
    );
  }));

  it('should disconnect observer on destroy', () => {
    fixture.detectChanges();
    const observer = (component as any).observer;
    const spy = spyOn(observer, 'disconnect');

    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
