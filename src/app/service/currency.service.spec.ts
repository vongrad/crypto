import { TestBed, inject } from '@angular/core/testing';

import { CryptoDetailsService } from './crypto-details.service';

describe('CryptoDetailsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CryptoDetailsService]
    });
  });

  it('should be created', inject([CryptoDetailsService], (service: CryptoDetailsService) => {
    expect(service).toBeTruthy();
  }));
});
