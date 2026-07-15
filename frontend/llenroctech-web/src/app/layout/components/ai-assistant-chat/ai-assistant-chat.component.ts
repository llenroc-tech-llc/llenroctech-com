import { AfterViewChecked, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiAssistantStateService } from '../../../services/ai-assistant-state.service';

@Component({ selector: 'app-ai-assistant-chat', standalone: true, imports: [FormsModule], templateUrl: './ai-assistant-chat.component.html', styleUrl: './ai-assistant-chat.component.scss' })
export class AiAssistantChatComponent implements AfterViewChecked {
  private static readonly maxComposerHeight = 132;
  readonly state = inject(AiAssistantStateService);
  readonly quickPrompts = [
    { label: 'Explore services', prompt: 'What services does Llenroc Tech offer?' },
    { label: 'Technology stack', prompt: 'What technology stack does Llenroc Tech use?' },
    { label: 'Start a project', prompt: 'How do I start a project with Llenroc Tech?' },
    { label: 'Engagement options', prompt: 'What engagement options does Llenroc Tech offer?' },
    { label: 'AI solutions', prompt: 'What AI solutions can Llenroc Tech help build?' },
  ];

  @ViewChild('transcript') private transcript?: ElementRef<HTMLElement>;
  @ViewChild('composer') composer?: ElementRef<HTMLTextAreaElement>;
  private previousTranscriptKey = '';
  private keepPinnedToBottom = true;

  get remainingCharacters(): number { return AiAssistantStateService.maxPromptLength - this.state.draft().length; }

  ngAfterViewChecked(): void {
    const messages = this.state.messages();
    const key = `${messages.at(-1)?.id ?? 0}:${this.state.loading()}`;
    if (key !== this.previousTranscriptKey && this.keepPinnedToBottom && this.transcript) {
      this.transcript.nativeElement.scrollTop = this.transcript.nativeElement.scrollHeight;
      this.previousTranscriptKey = key;
    }
  }

  selectQuickPrompt(prompt: string): void { this.state.submit(prompt); }

  onTranscriptScroll(): void {
    const element = this.transcript?.nativeElement;
    if (!element) return;
    this.keepPinnedToBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.state.setDraft(textarea.value);
    textarea.style.height = 'auto';
    const height = Math.min(textarea.scrollHeight, AiAssistantChatComponent.maxComposerHeight);
    textarea.style.height = `${height}px`;
    textarea.style.overflowY = textarea.scrollHeight > AiAssistantChatComponent.maxComposerHeight ? 'auto' : 'hidden';
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.state.submit();
    }
  }
}
