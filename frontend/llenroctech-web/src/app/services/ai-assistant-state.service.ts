import { ElementRef, Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ChatRequestMessage, ChatService } from './chat.service';

export interface AiConversationMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class AiAssistantStateService {
  static readonly maxPromptLength = 2000;

  private readonly chat = inject(ChatService);
  private nextId = 1;
  private returnFocusElement: HTMLElement | null = null;
  private failedPrompt = '';

  readonly isOpen = signal(false);
  readonly messages = signal<AiConversationMessage[]>([]);
  readonly draft = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly hasConversation = computed(() => this.messages().length > 0);

  open(trigger?: HTMLElement | ElementRef<HTMLElement> | null): void {
    const element = trigger instanceof ElementRef ? trigger.nativeElement : trigger;
    if (element) this.returnFocusElement = element;
    this.isOpen.set(true);
    document.body.classList.add('ai-drawer-open');
  }

  minimize(): void { this.close(); }

  close(): void {
    this.isOpen.set(false);
    document.body.classList.remove('ai-drawer-open');
    queueMicrotask(() => this.returnFocusElement?.focus());
  }

  setDraft(value: string): void { this.draft.set(value.slice(0, AiAssistantStateService.maxPromptLength)); }

  submit(prompt = this.draft()): void {
    const content = prompt.trim().slice(0, AiAssistantStateService.maxPromptLength);
    if (!content || this.loading()) return;

    this.messages.update(messages => [...messages, { id: this.nextId++, role: 'user', content }]);
    this.draft.set('');
    this.failedPrompt = content;
    this.requestResponse();
  }

  retry(): void {
    if (!this.failedPrompt || this.loading()) return;
    this.requestResponse();
  }

  newConversation(): void {
    if (this.loading()) return;
    this.messages.set([]);
    this.draft.set('');
    this.error.set('');
    this.failedPrompt = '';
  }

  private requestResponse(): void {
    this.loading.set(true);
    this.error.set('');
    const requestMessages: ChatRequestMessage[] = this.messages().map(({ role, content }) => ({ role, content }));

    this.chat.send(requestMessages).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: response => {
        const content = response.reply?.trim() || 'I can help with Llenroc Tech services and getting started. What would you like to know?';
        this.messages.update(messages => [...messages, { id: this.nextId++, role: 'assistant', content }]);
        this.failedPrompt = '';
      },
      error: () => this.error.set('We could not reach the AI assistant. Please try again in a moment.'),
    });
  }
}
