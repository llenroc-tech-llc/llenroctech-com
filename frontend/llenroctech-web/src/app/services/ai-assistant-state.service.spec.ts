import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { AiAssistantStateService } from './ai-assistant-state.service';
import { ChatResponse, ChatService } from './chat.service';

describe('AiAssistantStateService', () => {
  let state: AiAssistantStateService;
  let send: jasmine.Spy;

  beforeEach(() => {
    send = jasmine.createSpy('send').and.returnValue(of({ reply: 'How can I help?' }));
    TestBed.configureTestingModule({ providers: [AiAssistantStateService, { provide: ChatService, useValue: { send } }] });
    state = TestBed.inject(AiAssistantStateService);
  });

  it('does not submit an empty prompt', () => { state.submit('   '); expect(send).not.toHaveBeenCalled(); });

  it('submits a valid prompt and safely stores the response as text', () => {
    state.submit('Tell me about services');
    expect(send).toHaveBeenCalledTimes(1);
    expect(state.messages().map(message => message.content)).toEqual(['Tell me about services', 'How can I help?']);
  });

  it('prevents duplicate submissions while loading', () => {
    const response = new Subject<ChatResponse>();
    send.and.returnValue(response);
    state.submit('First question');
    state.submit('Duplicate question');
    expect(send).toHaveBeenCalledTimes(1);
    expect(state.loading()).toBeTrue();
  });

  it('shows a sanitized error and supports retry', () => {
    send.and.returnValue(throwError(() => new Error('internal endpoint details')));
    state.submit('Try this');
    expect(state.error()).toContain('Please try again');
    expect(state.error()).not.toContain('endpoint');
    send.and.returnValue(of({ reply: 'Recovered' }));
    state.retry();
    expect(send).toHaveBeenCalledTimes(2);
    expect(state.messages().at(-1)?.content).toBe('Recovered');
  });

  it('preserves messages when closed and clears them for a new conversation', () => {
    state.submit('Keep this');
    state.close();
    state.open();
    expect(state.messages().length).toBe(2);
    state.newConversation();
    expect(state.messages()).toEqual([]);
  });
});
