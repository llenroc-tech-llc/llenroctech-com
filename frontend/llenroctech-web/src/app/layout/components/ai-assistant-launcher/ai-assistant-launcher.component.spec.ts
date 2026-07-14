import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ChatService } from '../../../services/chat.service';
import { AiAssistantStateService } from '../../../services/ai-assistant-state.service';
import { AiAssistantLauncherComponent } from './ai-assistant-launcher.component';

describe('AiAssistantLauncherComponent', () => {
  let fixture: ComponentFixture<AiAssistantLauncherComponent>;
  let state: AiAssistantStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AiAssistantLauncherComponent], providers: [{ provide: ChatService, useValue: { send: () => of({ reply: 'ok' }) } }] }).compileComponents();
    fixture = TestBed.createComponent(AiAssistantLauncherComponent);
    state = TestBed.inject(AiAssistantStateService);
    fixture.detectChanges();
  });

  it('renders an accessible launcher', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Open Llenroc Tech AI assistant');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('opens only the shared drawer state', () => {
    fixture.nativeElement.querySelector('button').click();
    fixture.nativeElement.querySelector('button')?.click();
    expect(state.isOpen()).toBeTrue();
  });
});
