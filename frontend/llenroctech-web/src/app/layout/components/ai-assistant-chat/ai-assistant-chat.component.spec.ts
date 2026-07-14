import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { ChatResponse, ChatService } from '../../../services/chat.service';
import { AiAssistantStateService } from '../../../services/ai-assistant-state.service';
import { AiAssistantChatComponent } from './ai-assistant-chat.component';

describe('AiAssistantChatComponent', () => {
  let fixture: ComponentFixture<AiAssistantChatComponent>;
  let state: AiAssistantStateService;
  let send: jasmine.Spy;

  beforeEach(async () => {
    send = jasmine.createSpy('send').and.returnValue(of({ reply: '<img src=x onerror=alert(1)>' }));
    await TestBed.configureTestingModule({ imports: [AiAssistantChatComponent], providers: [{ provide: ChatService, useValue: { send } }] }).compileComponents();
    fixture = TestBed.createComponent(AiAssistantChatComponent);
    state = TestBed.inject(AiAssistantStateService);
    fixture.detectChanges();
  });

  it('submits a quick prompt through the shared state', () => {
    fixture.nativeElement.querySelector('.ai-chat__suggestions button').click();
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('renders assistant output as text rather than HTML', () => {
    state.submit('Question');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ai-message img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('shows a loading indicator while a response is pending', () => {
    const pending = new Subject<ChatResponse>();
    send.and.returnValue(pending);
    state.submit('Question');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ai-message--typing')).toBeTruthy();
  });
});
