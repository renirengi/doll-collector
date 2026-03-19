import { TestBed } from '@angular/core/testing';

import { UserspaceStateService } from './userspace-state.service';

describe('UserspaceStateService', () => {
  let service: UserspaceStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserspaceStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
