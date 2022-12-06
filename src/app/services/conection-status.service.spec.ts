import { TestBed } from '@angular/core/testing';

import { ConnectionStatusService } from './connection-status.service';

describe('ConectionStatusService', () => {
  let service: ConnectionStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectionStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
