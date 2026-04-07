import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DollPage } from './doll-page';
import { AdminDollService } from '../../services/admin-doll.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { signal, WritableSignal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DollPage', () => {
  let component: DollPage;
  let fixture: ComponentFixture<DollPage>;
  let serviceMock: jasmine.SpyObj<AdminDollService>;

  const createSignal = <T>(val: T): WritableSignal<T> => signal(val);

  beforeEach(async () => {
    serviceMock = jasmine.createSpyObj(
      'AdminDollService',
      ['loadPage', 'deleteDoll'],
      {
        dolls: createSignal([
          { id: '1', itemNumber: 'A1', originalName: 'Doll 1', brand: 'B1' },
          { id: '2', itemNumber: 'A2', originalName: 'Doll 2', brand: 'B2' },
        ]),
        isLoading: createSignal(false),
        totalCount: createSignal(2),
        filters: createSignal({ _page: 1, _limit: 15 }),
        hasNextPage: createSignal(false),
      },
    );

    await TestBed.configureTestingModule({
      imports: [DollPage, MatPaginatorModule, NoopAnimationsModule],
      providers: [{ provide: AdminDollService, useValue: serviceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(DollPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should init and load data', () => {
    expect(component).toBeTruthy();
    expect(serviceMock.loadPage).toHaveBeenCalledWith(1);
  });

  it('should render correct number of rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
  });

  it('should display fallback value for empty cells', () => {
    const emptyVal = component['getCellValue']({}, 'brand');
    expect(emptyVal).toBe('—');
  });

  it('should handle pagination event', () => {
    const event = { pageIndex: 2, pageSize: 30 } as PageEvent;
    component['handlePageEvent'](event);
    expect(serviceMock.loadPage).toHaveBeenCalledWith(3, 30);
  });

  it('should call delete on confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component['onDelete']('123');
    expect(serviceMock.deleteDoll).toHaveBeenCalledWith('123');
  });

  it('should not call delete if rejected', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component['onDelete']('123');
    expect(serviceMock.deleteDoll).not.toHaveBeenCalled();
  });

  it('should show loader when service is loading', () => {
    (serviceMock.isLoading as WritableSignal<boolean>).set(true);
    fixture.detectChanges();
    const loader = fixture.debugElement.query(By.css('.loader-overlay'));
    expect(loader).toBeTruthy();
  });

  it('should show empty state message', () => {
    (serviceMock.dolls as WritableSignal<any[]>).set([]);
    fixture.detectChanges();
    const emptyRow = fixture.debugElement.query(By.css('.empty'));
    expect(emptyRow.nativeElement.textContent).toContain('No dolls found');
  });

  it('should have correct column labels', () => {
    const headers = fixture.debugElement.queryAll(By.css('th'));
    expect(headers[0].nativeElement.textContent).toContain('SKU');
    expect(headers[1].nativeElement.textContent).toContain('Full Name');
  });

  it('should trigger edit log', () => {
    const consoleSpy = spyOn(console, 'log');
    component['edit']('1');
    expect(consoleSpy).toHaveBeenCalledWith('Edit doll:', '1');
  });

  it('should apply numeric class to specific columns', () => {
    const yearHeader = fixture.debugElement.query(By.css('th.text-right'));
    expect(yearHeader.nativeElement.textContent).toContain('Year');
  });
});
