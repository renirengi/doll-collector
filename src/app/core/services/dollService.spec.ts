import { TestBed } from '@angular/core/testing';
import { DollService } from './dollService';
import { DollApiService } from '../../../api/services/doll.api';

describe('DollService', () => {
  let service: DollService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DollService],
    });

    service = TestBed.inject(DollService);

    // Подменяем статический метод, чтобы не было реальных сетевых запросов
    spyOn(DollApiService, 'getAll').and.returnValue(Promise.resolve([]));
  });

  it('should be created without initial requests', () => {
    expect(service).toBeTruthy();
    expect(DollApiService.getAll).not.toHaveBeenCalled();
  });

  it('should load data when init is called', async () => {
    const mockData = [{ id: 1, name: 'Kurhn 1' }];
    (DollApiService.getAll as jasmine.Spy).and.returnValue(
      Promise.resolve(mockData),
    );

    // Используем нативный await. Рекурсия ТУТ НЕВОЗМОЖНА.
    await service.init();

    expect(service.dolls().length).toBe(1);
    expect(service.isLoading()).toBe(false);
    expect(DollApiService.getAll).toHaveBeenCalled();
  });

  it('should trigger request with correct params on updateFilters', async () => {
    await service.updateFilters({ brand: 'Kurhn' });

    expect(DollApiService.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ brand: 'Kurhn', _page: 1 }),
    );
    expect(service.filters().brand).toBe('Kurhn');
  });

  it('should handle pagination in loadMoreDolls', async () => {
    // Сначала загружаем первую страницу
    (DollApiService.getAll as jasmine.Spy).and.returnValue(
      Promise.resolve([{ id: 1 }]),
    );
    await service.init();

    // Эмулируем, что на сервере есть еще куклы
    service.totalCount.set(10);
    service.hasMore.set(true);

    // Загружаем вторую страницу
    await service.loadMoreDolls();

    expect(DollApiService.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ _page: 2 }),
    );
    expect(service.dolls().length).toBe(2);
  });
});
