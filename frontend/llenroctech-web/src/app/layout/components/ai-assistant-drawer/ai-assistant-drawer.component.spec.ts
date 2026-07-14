import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ChatService } from '../../../services/chat.service';
import { AiAssistantStateService } from '../../../services/ai-assistant-state.service';
import { AiAssistantDrawerComponent } from './ai-assistant-drawer.component';

describe('AiAssistantDrawerComponent', () => {
  let fixture: ComponentFixture<AiAssistantDrawerComponent>;
  let state: AiAssistantStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AiAssistantDrawerComponent], providers: [provideRouter([]), { provide: ChatService, useValue: { send: () => of({ reply: 'Response' }) } }] }).compileComponents();
    state = TestBed.inject(AiAssistantStateService);
    state.open();
    fixture = TestBed.createComponent(AiAssistantDrawerComponent);
    fixture.detectChanges();
  });

  it('renders one dialog and closes from its close control', () => {
    expect(fixture.nativeElement.querySelectorAll('[role="dialog"]').length).toBe(1);
    fixture.nativeElement.querySelector('[aria-label="Close AI assistant"]').click();
    expect(state.isOpen()).toBeFalse();
  });

  it('minimizes without clearing the conversation', () => {
    state.submit('Remember this');
    fixture.nativeElement.querySelector('[aria-label="Minimize AI assistant"]').click();
    expect(state.isOpen()).toBeFalse();
    expect(state.messages().length).toBe(2);
  });

  it('closes on Escape', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(state.isOpen()).toBeFalse();
  });
});
