import { Component, ElementRef, HostListener, ViewChild, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiAssistantStateService } from '../../../services/ai-assistant-state.service';
import { AiAssistantChatComponent } from '../ai-assistant-chat/ai-assistant-chat.component';

@Component({ selector: 'app-ai-assistant-drawer', standalone: true, imports: [RouterLink, AiAssistantChatComponent], templateUrl: './ai-assistant-drawer.component.html', styleUrl: './ai-assistant-drawer.component.scss' })
export class AiAssistantDrawerComponent {
  readonly state = inject(AiAssistantStateService);
  @ViewChild('drawer') drawer?: ElementRef<HTMLElement>;
  @ViewChild(AiAssistantChatComponent) chat?: AiAssistantChatComponent;

  constructor() {
    effect(() => {
      if (this.state.isOpen()) setTimeout(() => this.chat?.composer?.nativeElement.focus());
    });
  }

  get isMobile(): boolean { return window.matchMedia('(max-width: 600px)').matches; }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.state.isOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); this.state.close(); return; }
    if (event.key === 'Tab' && window.matchMedia('(max-width: 600px)').matches) this.containMobileFocus(event);
  }

  private containMobileFocus(event: KeyboardEvent): void {
    const focusable = this.drawer?.nativeElement.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
}
