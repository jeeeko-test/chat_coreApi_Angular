import { TestBed } from '@angular/core/testing';

import { ChatComponentsService } from './chat-components.service';

describe('ChatComponentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChatComponentsService = TestBed.get(ChatComponentsService);
    expect(service).toBeTruthy();
  });
});
